'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  FileText, 
  BookOpen, 
  Image as ImageIcon, 
  Download, 
  Eye,
  Calendar,
  HardDrive,
  Users,
  Stethoscope
} from 'lucide-react';

interface SpaceContentItem {
  id: string;
  title: string;
  type: 'video' | 'document' | 'guideline' | 'image';
  thumbnail?: string; // This will be the S3 key, not the URL
  fileUrl: string; // This will be the S3 key, not the URL
  size: number;
  lastModified: string;
  category?: string;
  description?: string;
}

interface SpaceMetadata {
  spaceId: string;
  spaceName: string;
  logo?: string; // This will be the S3 key, not the URL
  totalContent: number;
  contentTypes: {
    videos: number;
    documents: number;
    guidelines: number;
    images: number;
  };
}

interface SpaceContentResponse {
  metadata: SpaceMetadata;
  content: SpaceContentItem[];
  total: number;
}

export function CCHMCSpaceViewer() {
  const [spaceData, setSpaceData] = useState<SpaceContentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [thumbnailUrls, setThumbnailUrls] = useState<Map<string, string>>(new Map());
  const [fileUrls, setFileUrls] = useState<Map<string, string>>(new Map());
  const [logoUrl, setLogoUrl] = useState<string>('');

  const getSignedThumbnailUrl = async (thumbnailKey: string): Promise<string> => {
    try {
      const response = await fetch(`/api/thumbnail?key=${encodeURIComponent(thumbnailKey)}`);
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Failed to get signed URL:', error);
      return '';
    }
  };

  const fetchSpaceContent = async (type?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('spaceId', '4');
      params.set('limit', '50');
      if (type && type !== 'all') {
        params.set('type', type);
      }

      const response = await fetch(`/api/space-content?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setSpaceData(data);
      
      // Fetch signed URLs for thumbnails and logo
      const promises: Promise<any>[] = [];
      
      // Fetch logo URL if available
      if (data.metadata.logo) {
        promises.push(
          getSignedThumbnailUrl(data.metadata.logo).then(url => ({ type: 'logo', url }))
        );
      }
      
      // Fetch thumbnail URLs
      if (data.content) {
        const thumbnailPromises = data.content
          .filter(item => item.thumbnail)
          .map(async (item) => {
            const url = await getSignedThumbnailUrl(item.thumbnail!);
            return { type: 'thumbnail', key: item.thumbnail!, url };
          });
        promises.push(...thumbnailPromises);
        
        // Fetch file URLs
        const filePromises = data.content
          .map(async (item) => {
            const url = await getSignedThumbnailUrl(item.fileUrl);
            return { type: 'file', key: item.fileUrl, url };
          });
        promises.push(...filePromises);
      }
      
      const results = await Promise.all(promises);
      
      // Process results
      results.forEach(result => {
        if (result.type === 'logo') {
          setLogoUrl(result.url);
        } else if (result.type === 'thumbnail') {
          setThumbnailUrls(prev => new Map(prev).set(result.key, result.url));
        } else if (result.type === 'file') {
          setFileUrls(prev => new Map(prev).set(result.key, result.url));
        }
      });
    } catch (error) {
      console.error('Failed to fetch space content:', error);
      setSpaceData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaceContent();
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'guideline': return <BookOpen className="w-4 h-4" />;
      case 'image': return <ImageIcon className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-800';
      case 'document': return 'bg-blue-100 text-blue-800';
      case 'guideline': return 'bg-green-100 text-green-800';
      case 'image': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading CCHMC Pediatric Surgery content...</p>
        </div>
      </div>
    );
  }

  if (!spaceData) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Failed to load space content</p>
        <Button onClick={() => fetchSpaceContent()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  const { metadata, content } = spaceData;

  // Additional safety check
  if (!metadata) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Failed to load space metadata</p>
        <Button onClick={() => fetchSpaceContent()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Space Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            {logoUrl && (
              <img 
                src={logoUrl} 
                alt={metadata.spaceName}
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  // Hide logo if it fails to load
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Stethoscope className="w-6 h-6 text-blue-600" />
                <span>{metadata.spaceName}</span>
              </CardTitle>
              <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <HardDrive className="w-4 h-4" />
                  <span>{metadata.totalContent} items</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Play className="w-4 h-4" />
                  <span>{metadata.contentTypes.videos} videos</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{metadata.contentTypes.guidelines} guidelines</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value);
        fetchSpaceContent(value);
      }}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Content</TabsTrigger>
          <TabsTrigger value="video">Videos</TabsTrigger>
          <TabsTrigger value="guideline">Guidelines</TabsTrigger>
          <TabsTrigger value="document">Documents</TabsTrigger>
          <TabsTrigger value="image">Images</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  {/* Thumbnail */}
                  {item.thumbnail && thumbnailUrls.get(item.thumbnail) ? (
                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                      <img
                        src={thumbnailUrls.get(item.thumbnail)!}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          // Hide thumbnail if it fails to load
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : item.type === 'video' ? (
                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                      <div className="text-center">
                        <Play className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Video</p>
                      </div>
                    </div>
                  ) : null}
                  
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={`${getTypeColor(item.type)} flex items-center space-x-1`}>
                        {getTypeIcon(item.type)}
                        <span className="capitalize">{item.type}</span>
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(item.size)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-medium text-sm mb-2 line-clamp-2">
                      {item.title}
                    </h3>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(item.lastModified).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          const fileUrl = fileUrls.get(item.fileUrl) || item.fileUrl;
                          window.open(fileUrl, '_blank');
                        }}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const fileUrl = fileUrls.get(item.fileUrl) || item.fileUrl;
                          const link = document.createElement('a');
                          link.href = fileUrl;
                          link.download = item.title;
                          link.click();
                        }}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {content.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No content found for this category.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
