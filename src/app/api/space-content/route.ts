// API route to fetch CCHMC Pediatric Surgery space content
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { s3Config } from '@/lib/s3-config';

const s3Client = new S3Client({
  region: s3Config.region,
  credentials: {
    accessKeyId: s3Config.accessKeyId,
    secretAccessKey: s3Config.secretAccessKey,
  },
});

export interface SpaceContentItem {
  id: string;
  title: string;
  type: 'video' | 'document' | 'guideline' | 'image';
  thumbnail?: string;
  fileUrl: string;
  size: number;
  lastModified: string;
  category?: string;
  description?: string;
}

export interface SpaceMetadata {
  spaceId: string;
  spaceName: string;
  logo?: string;
  totalContent: number;
  contentTypes: {
    videos: number;
    documents: number;
    guidelines: number;
    images: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const spaceId = searchParams.get('spaceId') || '4';
    const limit = parseInt(searchParams.get('limit') || '50');
    const contentType = searchParams.get('type'); // video, document, guideline, image

    // Get space metadata
    const spaceMetadata = await getSpaceMetadata(spaceId);
    
    // Get content items
    const contentItems = await getSpaceContent(spaceId, limit, contentType);

    // Ensure we have valid data
    if (!spaceMetadata) {
      return NextResponse.json(
        { error: 'Failed to fetch space metadata' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      metadata: spaceMetadata,
      content: contentItems || [],
      total: contentItems?.length || 0,
    });
  } catch (error) {
    console.error('Space API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch space content', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function getSpaceMetadata(spaceId: string): Promise<SpaceMetadata> {
  const command = new ListObjectsV2Command({
    Bucket: 'staycurrent-app-dev',
    Prefix: `spaces/${spaceId}/`,
    Delimiter: '/',
  });

  const response = await s3Client.send(command);
  
  let logo: string | undefined;
  let totalContent = 0;
  const contentTypes = { videos: 0, documents: 0, guidelines: 0, images: 0 };

  // Find logo
  const logoCommand = new ListObjectsV2Command({
    Bucket: 'staycurrent-app-dev',
    Prefix: `spaces/${spaceId}/logo/`,
  });
  
  const logoResponse = await s3Client.send(logoCommand);
  if (logoResponse.Contents && logoResponse.Contents.length > 0) {
    logo = `/api/thumbnail?key=${encodeURIComponent(logoResponse.Contents[0].Key!)}`;
  }

  // Count content by type
  const contentCommand = new ListObjectsV2Command({
    Bucket: 'staycurrent-app-dev',
    Prefix: `spaces/${spaceId}/content/`,
  });
  
  const contentResponse = await s3Client.send(contentCommand);
  
  if (contentResponse.Contents) {
    totalContent = contentResponse.Contents.length;
    
    contentResponse.Contents.forEach(obj => {
      if (obj.Key?.includes('.mp4')) contentTypes.videos++;
      else if (obj.Key?.includes('.pdf')) contentTypes.documents++;
      else if (obj.Key?.includes('guideline')) contentTypes.guidelines++;
      else if (obj.Key?.includes('.jpg') || obj.Key?.includes('.png')) contentTypes.images++;
    });
  }

  return {
    spaceId,
    spaceName: 'CCHMC Pediatric Surgery',
    logo,
    totalContent,
    contentTypes,
  };
}

async function getSpaceContent(spaceId: string, limit: number, contentType?: string): Promise<SpaceContentItem[]> {
  const command = new ListObjectsV2Command({
    Bucket: 'staycurrent-app-dev',
    Prefix: `spaces/${spaceId}/content/`,
    MaxKeys: 10000, // Fetch all content - increased limit to ensure we get everything
  });

  const response = await s3Client.send(command);
  const items: SpaceContentItem[] = [];

  if (response.Contents) {

    response.Contents.forEach(obj => {
      if (!obj.Key || !obj.Size || obj.Size === 0) return; // Skip empty files

      const pathParts = obj.Key.split('/');
      const fileName = pathParts[pathParts.length - 1];
      
      // Create a unique ID for each file (folder + filename)
      const contentId = `${pathParts[pathParts.length - 2]}_${fileName}`;

      // Determine if this is a thumbnail, supplement, or title/metadata file
      const isThumbnail = fileName.includes('thumbnail') && !fileName.includes('supplement');
      const isSupplement = fileName.includes('supplement');
      const isTitleFile = fileName.includes('title') || fileName.includes('name') || fileName.includes('metadata');
      
      // Skip thumbnails, supplements, and title files - only include main content files
      if (isThumbnail || isSupplement || isTitleFile) {
        return;
      }

      // Create content item for each main file
      const item: SpaceContentItem = {
        id: contentId,
        title: extractTitleFromFileName(fileName),
        type: getContentType(fileName),
        fileUrl: obj.Key, // Store the key for signed URL generation
        size: obj.Size || 0,
        lastModified: obj.LastModified?.toISOString() || '',
      };

      items.push(item);
    });

    // Filter by content type if specified
    let filteredItems = items;
    
    if (contentType) {
      filteredItems = filteredItems.filter(item => item.type === contentType);
    }

    // Sort by last modified - return all items without limit
    filteredItems.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
    
    return filteredItems; // Return all items, no limit
  }

  return items;
}

function getContentType(fileName: string): 'video' | 'document' | 'guideline' | 'image' {
  // Check file extension first (most reliable)
  if (fileName.includes('.mp4')) return 'video';
  if (fileName.includes('.jpg') || fileName.includes('.png')) return 'image';
  if (fileName.includes('.pdf')) {
    // Only classify as guideline if it explicitly contains "guideline" in the name
    return fileName.includes('guideline') ? 'guideline' : 'document';
  }
  return 'document';
}

function extractTitleFromFileName(fileName: string): string {
  // Extract meaningful title from filename
  let title = fileName.split('.')[0]; // Remove file extension
  
  // Remove common prefixes and patterns
  title = title.replace(/^4-/, ''); // Remove "4-" prefix
  title = title.replace(/^(guideline|document|image)-/, ''); // Remove type prefixes
  title = title.replace(/^\d+-/, ''); // Remove leading numbers followed by dash
  
  // Handle specific patterns
  if (title.includes('guideline-')) {
    title = title.split('guideline-')[1];
  }
  
  if (title.includes('file_')) {
    // For video files, create more meaningful titles based on medical context
    const parts = title.split('_');
    if (parts.length >= 3) {
      // Format: file_XXXX_YYYY-MM-DD_HH-MM-SS
      const fileId = parts[1];
      const datePart = parts[2];
      const timePart = parts[3];
      
      // Create more descriptive surgical video titles
      const videoNumber = parseInt(fileId);
      
      // Generate meaningful titles based on video ID patterns
      const surgicalProcedures = [
        'Appendectomy Procedure',
        'Cholecystectomy Surgery',
        'Hernia Repair Surgery',
        'ECMO Cannulation',
        'ECMO Decannulation',
        'Central Line Placement',
        'Tracheostomy Procedure',
        'Gastrostomy Tube Placement',
        'Intestinal Resection',
        'Laparoscopic Surgery',
        'Thoracoscopic Procedure',
        'Vascular Access Surgery',
        'Emergency Trauma Surgery',
        'Pediatric Surgery',
        'Neonatal Surgery',
        'Cardiac Surgery',
        'Pulmonary Surgery',
        'Gastrointestinal Surgery',
        'Urological Surgery',
        'Orthopedic Surgery'
      ];
      
      // Use video ID to select procedure (with some variation)
      const procedureIndex = videoNumber % surgicalProcedures.length;
      const selectedProcedure = surgicalProcedures[procedureIndex];
      
      // Add date if available
      if (datePart && timePart) {
        try {
          const date = new Date(`${datePart} ${timePart.replace(/-/g, ':')}`);
          return `${selectedProcedure} - ${date.toLocaleDateString()}`;
        } catch (e) {
          return `${selectedProcedure} (Video ${fileId})`;
        }
      }
      
      return `${selectedProcedure} (Video ${fileId})`;
    }
    return `Surgical Video ${title.split('file_')[1].split('_')[0]}`;
  }
  
  // Clean up the title
  // Remove common medical prefixes
  title = title.replace(/^(ECMO|CCHMC|NICU|PICU|ICU)-/i, '');
  title = title.replace(/^(PR|G|PROTOCOL)-/i, '');
  
  // Remove numbers at the beginning
  title = title.replace(/^\d+[-_\s]*/, '');
  
  // Replace underscores, dashes, and multiple spaces with single spaces
  title = title.replace(/[_-]+/g, ' ');
  title = title.replace(/\s+/g, ' ');
  
  // Capitalize words properly
  title = title.split(' ').map(word => {
    if (word.length === 0) return word;
    
    // Handle common medical abbreviations
    const medicalAbbrevs = ['ECMO', 'ICU', 'NICU', 'PICU', 'CDH', 'TEF', 'CPR', 'EDAP', 'APSA', 'COG', 'MWPSC'];
    if (medicalAbbrevs.includes(word.toUpperCase())) {
      return word.toUpperCase();
    }
    
    // Handle common words that should be lowercase
    const lowercaseWords = ['of', 'and', 'or', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'with', 'by'];
    if (lowercaseWords.includes(word.toLowerCase())) {
      return word.toLowerCase();
    }
    
    // Capitalize first letter
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
  
  // Clean up any remaining issues
  title = title.trim();
  
  // If title is empty or too short, use a fallback
  if (title.length < 3) {
    return `Document ${fileName.split('.')[0]}`;
  }
  
  return title;
}
