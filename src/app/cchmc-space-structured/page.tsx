'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import React from "react";
import {
  Heart,
  Share,
  ChevronRight,
  ChevronDown,
  FileText,
  Video,
  Image as ImageIcon,
  BookOpen,
  Play,
  Eye,
  Activity,
  Baby,
  Stethoscope,
  AlertTriangle,
  GraduationCap,
  Pill,
  FolderOpen,
  X,
  Maximize2,
  Minimize2,
  Search,
  Star,
  Users
} from "lucide-react";

// Content type to icon mapping
const getContentTypeIcon = (type: string) => {
  switch (type) {
    case 'video': return Video;
    case 'guideline': return BookOpen;
    case 'document': return FileText;
    case 'image': return ImageIcon;
    default: return FileText;
  }
};

export default function CCHMCPediatricSurgerySpace() {
  const [spaceData, setSpaceData] = useState<any>(null);
  const [intelligentSpaceData, setIntelligentSpaceData] = useState<any>(null);
  const [spaceCards, setSpaceCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set(['critical-care-life-support']));
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());
  const [expandedCollectionCards, setExpandedCollectionCards] = useState<Set<string>>(new Set());
  const [expandedCollectionCardItems, setExpandedCollectionCardItems] = useState<Set<string>>(new Set());
  const [thumbnailUrls, setThumbnailUrls] = useState<Map<string, string>>(new Map());
  const [fileUrls, setFileUrls] = useState<Map<string, string>>(new Map());
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [loadingThumbnails, setLoadingThumbnails] = useState<Set<string>>(new Set());
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [collectionSearchQuery, setCollectionSearchQuery] = useState<string>('');
  const [isFeaturedContentExpanded, setIsFeaturedContentExpanded] = useState(false);

  // Lazy load thumbnail URL - only fetch when needed
  const getSignedThumbnailUrl = async (thumbnailKey: string): Promise<string> => {
    // Validate the key - must be a valid S3 key path
    if (!thumbnailKey || typeof thumbnailKey !== 'string') {
      console.warn('Invalid thumbnail key:', thumbnailKey);
      return '';
    }

    // Check if it's already a full URL (shouldn't happen, but handle gracefully)
    if (thumbnailKey.startsWith('http')) {
      console.warn('Thumbnail key appears to be a full URL, not an S3 key:', thumbnailKey);
      return '';
    }

    // Check if already cached
    if (thumbnailUrls.has(thumbnailKey)) {
      return thumbnailUrls.get(thumbnailKey)!;
    }

    // Check if already loading
    if (loadingThumbnails.has(thumbnailKey)) {
      return '';
    }

    try {
      setLoadingThumbnails(prev => new Set(prev).add(thumbnailKey));
      const response = await fetch(`/api/thumbnail?key=${encodeURIComponent(thumbnailKey)}`);
      const data = await response.json();
      
      if (data.url) {
        setThumbnailUrls(prev => new Map(prev).set(thumbnailKey, data.url));
        return data.url;
      }
      
      // Log the error but don't throw - just return empty string
      console.warn(`Failed to get signed URL for ${thumbnailKey}:`, data.error || 'Unknown error');
      return '';
    } catch (err) {
      console.error(`Error getting signed URL for ${thumbnailKey}:`, err);
      return '';
    } finally {
      setLoadingThumbnails(prev => {
        const newSet = new Set(prev);
        newSet.delete(thumbnailKey);
        return newSet;
      });
    }
  };

  // Lazy load file URL - only fetch when needed
  const getSignedFileUrl = async (fileKey: string): Promise<string> => {
    // Validate the key - must be a valid S3 key path
    if (!fileKey || typeof fileKey !== 'string') {
      console.warn('Invalid file key:', fileKey);
      return '';
    }

    // Check if it's already a full URL (shouldn't happen, but handle gracefully)
    if (fileKey.startsWith('http')) {
      console.warn('File key appears to be a full URL, not an S3 key:', fileKey);
      return '';
    }

    // Check if already cached
    if (fileUrls.has(fileKey)) {
      return fileUrls.get(fileKey)!;
    }

    try {
      const response = await fetch(`/api/thumbnail?key=${encodeURIComponent(fileKey)}`);
      const data = await response.json();
      
      if (data.url) {
        setFileUrls(prev => new Map(prev).set(fileKey, data.url));
        return data.url;
      }
      
      // Log the error but don't throw - just return empty string
      console.warn(`Failed to get signed URL for ${fileKey}:`, data.error || 'Unknown error');
      return '';
    } catch (err) {
      console.error(`Error getting signed URL for ${fileKey}:`, err);
      return '';
    }
  };

  const fetchSpaceContent = async () => {
    setLoading(true);
    try {
      // First, try to load the intelligent space structure
      try {
        const intelligentResponse = await fetch('/api/intelligent-space-structure');
        if (intelligentResponse.ok) {
          const intelligentData = await intelligentResponse.json();
          setIntelligentSpaceData(intelligentData);
          
          // Use the intelligent structure directly
          setSpaceCards(intelligentData.space_cards || []);
          
          // Set up metadata
          setSpaceData({
            metadata: {
              spaceId: '4',
              spaceName: 'CCHMC Pediatric Surgery - Intelligent Structure',
              totalContent: intelligentData.total_content || 0,
              logoUrl: null
            },
            content: [],
            total: intelligentData.total_content || 0
          });
          
          setLoading(false);
          return;
        }
      } catch (intelligentError) {
        console.warn('Could not load intelligent structure, falling back to original:', intelligentError);
      }
      
      // Fallback to original API if intelligent structure is not available
      const response = await fetch('/api/space-content?spaceId=4'); // Remove limit to get all content
      const data = await response.json();
      setSpaceData(data);

      // Only fetch logo URL immediately - defer everything else
      if (data.metadata.logo && typeof data.metadata.logo === 'string' && !data.metadata.logo.startsWith('http')) {
        try {
          const logoUrl = await getSignedThumbnailUrl(data.metadata.logo);
          if (logoUrl) {
            setLogoUrl(logoUrl);
          }
        } catch (error) {
          console.log('Logo URL failed to load:', error);
          // Continue without logo
        }
      } else if (data.metadata.logo) {
        console.warn('Invalid logo key format:', data.metadata.logo);
      }

      // Create space cards with categorized content (no thumbnail loading yet)
      const categorizedContent = categorizeContent(data.content);
      const cards = createSpaceCards(categorizedContent);
      setSpaceCards(cards);
      
    } catch (error) {
      console.error('Failed to fetch space content:', error);
      setSpaceData(null);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to categorize content by medical specialty
  const categorizeContent = (content: any[]) => {
    const categories = {
      ecmo: [],
      neonatal: [],
      surgical: [],
      emergency: [],
      education: [],
      medication: []
    } as Record<string, any[]>;

    content.forEach(item => {
      const title = item.title.toLowerCase();
      
      // First, handle video distribution by ID (before keyword matching)
      if (item.type === 'video') {
        const videoId = parseInt(item.id);
        if (videoId % 6 === 0) categories.ecmo.push(item);
        else if (videoId % 6 === 1) categories.neonatal.push(item);
        else if (videoId % 6 === 2) categories.surgical.push(item);
        else if (videoId % 6 === 3) categories.emergency.push(item);
        else if (videoId % 6 === 4) categories.education.push(item);
        else categories.medication.push(item);
        return; // Skip keyword matching for videos
      }
      
      // Then handle other content types by keywords
      if (title.includes('ecmo') || title.includes('cdh') || title.includes('anticoagulation')) {
        categories.ecmo.push(item);
      } else if (title.includes('nicu') || title.includes('neonatal') || (title.includes('pediatric') && title.includes('dosing'))) {
        categories.neonatal.push(item);
      } else if (title.includes('surgery') || title.includes('surgical') || title.includes('appendectomy') || title.includes('antibiotic')) {
        categories.surgical.push(item);
      } else if (title.includes('sepsis') || title.includes('emergency') || title.includes('trauma') || title.includes('cpr')) {
        categories.emergency.push(item);
      } else if (title.includes('resident') || title.includes('curriculum') || title.includes('training') || title.includes('education')) {
        categories.education.push(item);
      } else if (title.includes('dosing') || title.includes('medication') || title.includes('drug')) {
        categories.medication.push(item);
      } else {
        // Ensure ALL content gets categorized - distribute by ID modulo for even distribution
        const contentId = parseInt(item.id) || Math.random() * 1000; // Fallback for non-numeric IDs
        const categoryIndex = Math.floor(contentId) % 6;
        
        if (categoryIndex === 0) categories.ecmo.push(item);
        else if (categoryIndex === 1) categories.neonatal.push(item);
        else if (categoryIndex === 2) categories.surgical.push(item);
        else if (categoryIndex === 3) categories.emergency.push(item);
        else if (categoryIndex === 4) categories.education.push(item);
        else categories.medication.push(item);
      }
    });

    // Debug: Log total categorized content
    const totalCategorized = Object.values(categories).reduce((sum, arr) => sum + arr.length, 0);
    console.log('Total content categorized:', totalCategorized, 'out of', content.length);
    console.log('Category breakdown:', Object.entries(categories).map(([key, arr]) => `${key}: ${arr.length}`).join(', '));

    return categories;
  };

  // Helper function to create space cards with hierarchical collections
  const createSpaceCards = (categorizedContent: any) => {
    // Helper function to distribute content evenly across collections
    const distributeContent = (content: any[], numCollections: number, collectionIndex: number) => {
      const itemsPerCollection = Math.ceil(content.length / numCollections);
      const startIndex = collectionIndex * itemsPerCollection;
      const endIndex = Math.min(startIndex + itemsPerCollection, content.length);
      return content.slice(startIndex, endIndex);
    };

    return [
      {
        id: 'critical-care',
        title: '🏥 Critical Care & ECMO',
        color: '#dc2626',
        items: [
          {
            id: 'ecmo-management',
            title: 'ECMO Management',
            icon: Activity,
            children: [
              {
                id: 'ecmo-guidelines',
                title: 'ECMO Guidelines',
                items: distributeContent(categorizedContent.ecmo.filter(item => item.type === 'guideline'), 2, 0)
              },
              {
                id: 'ecmo-procedures',
                title: 'ECMO Procedures',
                items: distributeContent(categorizedContent.ecmo.filter(item => item.type === 'document'), 2, 0)
              },
              {
                id: 'ecmo-videos',
                title: 'ECMO Videos',
                items: distributeContent(categorizedContent.ecmo.filter(item => item.type === 'video'), 2, 0)
              }
            ]
          },
          {
            id: 'icu-care',
            title: 'ICU Care',
            icon: AlertTriangle,
            children: [
              {
                id: 'icu-guidelines',
                title: 'ICU Guidelines',
                items: distributeContent(categorizedContent.ecmo.filter(item => item.type === 'guideline'), 2, 1)
              },
              {
                id: 'icu-procedures',
                title: 'ICU Procedures',
                items: distributeContent(categorizedContent.ecmo.filter(item => item.type === 'document'), 2, 1)
              },
              {
                id: 'icu-videos',
                title: 'ICU Videos',
                items: distributeContent(categorizedContent.ecmo.filter(item => item.type === 'video'), 2, 1)
              }
            ]
          }
        ]
      },
      {
        id: 'neonatal-care',
        title: '👶 Neonatal & NICU',
        color: '#059669',
        items: [
          {
            id: 'nicu-protocols',
            title: 'NICU Protocols',
            icon: Baby,
            children: [
              {
                id: 'neonatal-guidelines',
                title: 'Neonatal Guidelines',
                items: distributeContent(categorizedContent.neonatal.filter(item => item.type === 'guideline'), 2, 0)
              },
              {
                id: 'neonatal-procedures',
                title: 'Neonatal Procedures',
                items: distributeContent(categorizedContent.neonatal.filter(item => item.type === 'document'), 2, 0)
              },
              {
                id: 'neonatal-videos',
                title: 'Neonatal Videos',
                items: distributeContent(categorizedContent.neonatal.filter(item => item.type === 'video'), 2, 0)
              }
            ]
          },
          {
            id: 'pediatric-dosing',
            title: 'Pediatric Dosing',
            icon: Pill,
            children: [
              {
                id: 'dosing-guidelines',
                title: 'Dosing Guidelines',
                items: distributeContent(categorizedContent.neonatal.filter(item => item.type === 'guideline'), 2, 1)
              },
              {
                id: 'medication-protocols',
                title: 'Medication Protocols',
                items: distributeContent(categorizedContent.neonatal.filter(item => item.type === 'document'), 2, 1)
              },
              {
                id: 'dosing-videos',
                title: 'Dosing Videos',
                items: distributeContent(categorizedContent.neonatal.filter(item => item.type === 'video'), 2, 1)
              }
            ]
          }
        ]
      },
      {
        id: 'surgical-procedures',
        title: '🔪 Surgical Procedures',
        color: '#7c3aed',
        items: [
          {
            id: 'general-surgery',
            title: 'General Surgery',
            icon: Stethoscope,
            children: [
              {
                id: 'surgical-guidelines',
                title: 'Surgical Guidelines',
                items: distributeContent(categorizedContent.surgical.filter(item => item.type === 'guideline'), 2, 0)
              },
              {
                id: 'surgical-procedures',
                title: 'Surgical Procedures',
                items: distributeContent(categorizedContent.surgical.filter(item => item.type === 'document'), 2, 0)
              },
              {
                id: 'surgical-videos',
                title: 'Surgical Videos',
                items: distributeContent(categorizedContent.surgical.filter(item => item.type === 'video'), 2, 0)
              }
            ]
          },
          {
            id: 'specialized-surgery',
            title: 'Specialized Surgery',
            icon: Activity,
            children: [
              {
                id: 'specialized-guidelines',
                title: 'Specialized Guidelines',
                items: distributeContent(categorizedContent.surgical.filter(item => item.type === 'guideline'), 2, 1)
              },
              {
                id: 'specialized-procedures',
                title: 'Specialized Procedures',
                items: distributeContent(categorizedContent.surgical.filter(item => item.type === 'document'), 2, 1)
              },
              {
                id: 'specialized-videos',
                title: 'Specialized Videos',
                items: distributeContent(categorizedContent.surgical.filter(item => item.type === 'video'), 2, 1)
              }
            ]
          }
        ]
      },
      {
        id: 'emergency-trauma',
        title: '🚨 Emergency & Trauma',
        color: '#ea580c',
        items: [
          {
            id: 'emergency-protocols',
            title: 'Emergency Protocols',
            icon: AlertTriangle,
            children: [
              {
                id: 'emergency-guidelines',
                title: 'Emergency Guidelines',
                items: distributeContent(categorizedContent.emergency.filter(item => item.type === 'guideline'), 2, 0)
              },
              {
                id: 'emergency-procedures',
                title: 'Emergency Procedures',
                items: distributeContent(categorizedContent.emergency.filter(item => item.type === 'document'), 2, 0)
              },
              {
                id: 'emergency-videos',
                title: 'Emergency Videos',
                items: distributeContent(categorizedContent.emergency.filter(item => item.type === 'video'), 2, 0)
              }
            ]
          },
          {
            id: 'trauma-care',
            title: 'Trauma Care',
            icon: Activity,
            children: [
              {
                id: 'trauma-guidelines',
                title: 'Trauma Guidelines',
                items: distributeContent(categorizedContent.emergency.filter(item => item.type === 'guideline'), 2, 1)
              },
              {
                id: 'trauma-procedures',
                title: 'Trauma Procedures',
                items: distributeContent(categorizedContent.emergency.filter(item => item.type === 'document'), 2, 1)
              },
              {
                id: 'trauma-videos',
                title: 'Trauma Videos',
                items: distributeContent(categorizedContent.emergency.filter(item => item.type === 'video'), 2, 1)
              }
            ]
          }
        ]
      },
      {
        id: 'education-training',
        title: '📚 Education & Training',
        color: '#0891b2',
        items: [
          {
            id: 'resident-training',
            title: 'Resident Training',
            icon: GraduationCap,
            children: [
              {
                id: 'training-materials',
                title: 'Training Materials',
                items: distributeContent(categorizedContent.education.filter(item => item.type === 'document'), 2, 0)
              },
              {
                id: 'training-guidelines',
                title: 'Training Guidelines',
                items: distributeContent(categorizedContent.education.filter(item => item.type === 'guideline'), 2, 0)
              },
              {
                id: 'training-videos',
                title: 'Training Videos',
                items: distributeContent(categorizedContent.education.filter(item => item.type === 'video'), 2, 0)
              }
            ]
          },
          {
            id: 'fellowship-program',
            title: 'Fellowship Program',
            icon: BookOpen,
            children: [
              {
                id: 'fellowship-materials',
                title: 'Fellowship Materials',
                items: distributeContent(categorizedContent.education.filter(item => item.type === 'document'), 2, 1)
              },
              {
                id: 'fellowship-guidelines',
                title: 'Fellowship Guidelines',
                items: distributeContent(categorizedContent.education.filter(item => item.type === 'guideline'), 2, 1)
              },
              {
                id: 'fellowship-videos',
                title: 'Fellowship Videos',
                items: distributeContent(categorizedContent.education.filter(item => item.type === 'video'), 2, 1)
              }
            ]
          }
        ]
      },
      {
        id: 'medication-management',
        title: '💊 Medication Management',
        color: '#be185d',
        items: [
          {
            id: 'pediatric-dosing',
            title: 'Pediatric Dosing',
            icon: Pill,
            children: [
              {
                id: 'dosing-guidelines',
                title: 'Dosing Guidelines',
                items: distributeContent(categorizedContent.medication.filter(item => item.type === 'guideline'), 2, 0)
              },
              {
                id: 'dosing-procedures',
                title: 'Dosing Procedures',
                items: distributeContent(categorizedContent.medication.filter(item => item.type === 'document'), 2, 0)
              },
              {
                id: 'dosing-videos',
                title: 'Dosing Videos',
                items: distributeContent(categorizedContent.medication.filter(item => item.type === 'video'), 2, 0)
              }
            ]
          },
          {
            id: 'drug-safety',
            title: 'Drug Safety',
            icon: AlertTriangle,
            children: [
              {
                id: 'safety-guidelines',
                title: 'Safety Guidelines',
                items: distributeContent(categorizedContent.medication.filter(item => item.type === 'guideline'), 2, 1)
              },
              {
                id: 'safety-procedures',
                title: 'Safety Procedures',
                items: distributeContent(categorizedContent.medication.filter(item => item.type === 'document'), 2, 1)
              },
              {
                id: 'safety-videos',
                title: 'Safety Videos',
                items: distributeContent(categorizedContent.medication.filter(item => item.type === 'video'), 2, 1)
              }
            ]
          }
        ]
      }
    ];
  };

  // Helper function to calculate total content count for a space card
  const calculateSpaceCardContentCount = (card: any) => {
    let totalCount = 0;
    
    card.items.forEach((collection: any) => {
      if (collection.children) {
        collection.children.forEach((collectionCard: any) => {
          totalCount += collectionCard.items ? collectionCard.items.length : 0;
        });
      }
    });
    
    return totalCount;
  };

  // Search filtering functions
  const filterSpaceCards = (cards: any[], query: string) => {
    if (!query.trim()) return cards;
    
    const lowercaseQuery = query.toLowerCase();
    
    return cards.map(card => {
      const filteredItems = card.items.map((collection: any) => {
        const filteredChildren = collection.children.map((collectionCard: any) => ({
          ...collectionCard,
          items: collectionCard.items.filter((item: any) => 
            item.title.toLowerCase().includes(lowercaseQuery) ||
            item.type.toLowerCase().includes(lowercaseQuery)
          )
        }));
        
        return {
          ...collection,
          children: filteredChildren.filter((cc: any) => cc.items.length > 0)
        };
      });
      
      return {
        ...card,
        items: filteredItems.filter((item: any) => item.children.length > 0)
      };
    }).filter(card => card.items.length > 0);
  };

  const filterCollectionContent = (collection: any, query: string) => {
    if (!query.trim()) return collection;
    
    const lowercaseQuery = query.toLowerCase();
    
    const filteredChildren = collection.children.map((collectionCard: any) => ({
      ...collectionCard,
      items: collectionCard.items.filter((item: any) => 
        item.title.toLowerCase().includes(lowercaseQuery) ||
        item.type.toLowerCase().includes(lowercaseQuery)
      )
    }));
    
    return {
      ...collection,
      children: filteredChildren.filter((cc: any) => cc.items.length > 0)
    };
  };

  useEffect(() => {
    fetchSpaceContent();
  }, []);

  // Add keyboard shortcut for closing viewer
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isViewerOpen) {
        closeViewer();
      }
    };

    if (isViewerOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isViewerOpen]);

  const toggleCardExpansion = (cardId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
  };

  const toggleCollectionExpansion = (collectionId: string) => {
    const newExpanded = new Set(expandedCollections);
    if (newExpanded.has(collectionId)) {
      newExpanded.delete(collectionId);
    } else {
      newExpanded.add(collectionId);
    }
    setExpandedCollections(newExpanded);
  };

  const toggleCollectionCardExpansion = (cardId: string) => {
    const newExpanded = new Set(expandedCollectionCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCollectionCards(newExpanded);
  };

  const toggleCollectionCardItemsExpansion = (cardId: string) => {
    const newExpanded = new Set(expandedCollectionCardItems);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCollectionCardItems(newExpanded);
  };

  const handleContentClick = async (content: any) => {
    setSelectedContent(content);
    
    // Ensure file URL is loaded before opening viewer
    if (!fileUrls.has(content.fileUrl)) {
      await getSignedFileUrl(content.fileUrl);
    }
    
    setIsViewerOpen(true);
  };

  const closeViewer = () => {
    setIsViewerOpen(false);
    setSelectedContent(null);
    setIsFullscreen(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleCollectionClick = (collection: any) => {
    setSelectedCollection(collection);
    setIsCollectionDialogOpen(true);
  };

  const closeCollectionDialog = () => {
    setIsCollectionDialogOpen(false);
    setSelectedCollection(null);
    setCollectionSearchQuery(''); // Clear search when closing dialog
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CCHMC Pediatric Surgery content...</p>
        </div>
      </div>
    );
  }

  if (!spaceData || spaceCards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load content or no space cards available</p>
          <Button onClick={fetchSpaceContent}>Retry</Button>
        </div>
      </div>
    );
  }

  // Embedded Content Viewer Component
  const ContentViewer = () => {
    if (!isViewerOpen || !selectedContent) return null;

    const fileUrl = fileUrls.get(selectedContent.fileUrl);
    const contentType = selectedContent.type;

    return (
      <div className={`fixed inset-0 z-[60] bg-black bg-opacity-90 flex items-center justify-center ${isFullscreen ? 'p-0' : 'p-4'}`}>
        <div className={`bg-white rounded-lg shadow-2xl flex flex-col ${isFullscreen ? 'w-full h-full rounded-none' : 'w-11/12 h-5/6 max-w-6xl'}`}>
          {/* Header */}
          <div className="flex items-start justify-between p-4 border-b bg-gray-50 rounded-t-lg flex-shrink-0">
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              {React.createElement(getContentTypeIcon(contentType), { 
                className: "w-4 h-4 text-gray-600 flex-shrink-0 mt-1" 
              })}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 leading-tight">
                  {selectedContent.title}
                </h3>
                <Badge variant="secondary" className="text-xs mt-1">
                  {contentType}
                </Badge>
              </div>
            </div>
            <div className="flex items-start space-x-2 flex-shrink-0 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                className="text-gray-600"
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={closeViewer}
                className="text-gray-600 bg-red-50 hover:bg-red-100 border-red-200"
                title="Close viewer"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-4 bg-gray-50 overflow-hidden">
            {!fileUrl ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading content...</p>
                  <Button 
                    onClick={async () => {
                      await getSignedFileUrl(selectedContent.fileUrl);
                    }}
                    className="mt-4"
                    variant="outline"
                    size="sm"
                  >
                    Retry Loading
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-4">
                {contentType === 'video' ? (
                  <video
                    controls
                    className="max-w-full max-h-full rounded-lg shadow-lg"
                    style={{ maxHeight: isFullscreen ? 'calc(100vh - 160px)' : 'calc(80vh - 160px)' }}
                  >
                    <source src={fileUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : contentType === 'image' ? (
                  <img
                    src={fileUrl}
                    alt={selectedContent.title}
                    className="max-w-full max-h-full rounded-lg shadow-lg object-contain"
                    style={{ maxHeight: isFullscreen ? 'calc(100vh - 160px)' : 'calc(80vh - 160px)' }}
                  />
                ) : contentType === 'guideline' || contentType === 'document' ? (
                  <iframe
                    src={fileUrl}
                    className="w-full rounded-lg shadow-lg border"
                    style={{ height: isFullscreen ? 'calc(100vh - 160px)' : 'calc(80vh - 160px)' }}
                    title={selectedContent.title}
                  />
                ) : (
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Preview not available for this file type</p>
                    <Button onClick={() => window.open(fileUrl, '_blank')}>
                      Open in New Tab
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Collection Dialog Component
  const CollectionDialog = () => {
    if (!isCollectionDialogOpen || !selectedCollection) return null;

    // Handle both intelligent structure and original structure
    const isIntelligentStructure = intelligentSpaceData && selectedCollection.items;
    const collectionItems = isIntelligentStructure ? selectedCollection.items : selectedCollection.children;
    const itemCount = isIntelligentStructure ? 
      selectedCollection.items.length : 
      collectionItems?.reduce((acc: number, cc: any) => acc + cc.items.length, 0) || 0;

    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="p-6 border-b bg-gray-50 rounded-t-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {!isIntelligentStructure && selectedCollection.icon && (
                  React.createElement(selectedCollection.icon, { 
                    className: "w-6 h-6 text-gray-600" 
                  })
                )}
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCollection.title}
                </h2>
                <Badge variant="secondary" className="text-sm">
                  {itemCount} items
                </Badge>
                {isIntelligentStructure && selectedCollection.description && (
                  <span className="text-sm text-gray-600">{selectedCollection.description}</span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={closeCollectionDialog}
                className="text-gray-600"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Collection Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search in collection..."
                value={collectionSearchQuery}
                onChange={(e) => setCollectionSearchQuery(e.target.value)}
                className="pl-10 w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {isIntelligentStructure ? (
                // Intelligent structure: direct items display
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {selectedCollection.items
                    .filter((item: any) => 
                      !collectionSearchQuery || 
                      item.title.toLowerCase().includes(collectionSearchQuery.toLowerCase())
                    )
                    .map((content: any) => (
                      <div
                        key={content.id}
                        className="bg-white rounded-lg p-3 shadow-sm border hover:shadow-md transition-shadow cursor-pointer group"
                        onClick={() => handleContentClick(content)}
                      >
                        <div className="flex flex-col items-center text-center space-y-2">
                          <div className="w-16 h-16 rounded-lg border-2 border-gray-200 flex items-center justify-center bg-gray-50 group-hover:bg-blue-50 group-hover:border-blue-300 transition-colors">
                            {React.createElement(getContentTypeIcon(content.type), {
                              className: "w-8 h-8 text-gray-600 group-hover:text-blue-600",
                              strokeWidth: 1
                            })}
                          </div>
                          <div className="w-full">
                            <h4 className="text-xs font-medium text-gray-900 line-clamp-2 leading-tight">
                              {content.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1 capitalize">
                              {content.type}
                            </p>
                            {content.complexity && (
                              <Badge 
                                variant="outline" 
                                className={`text-xs mt-1 ${
                                  content.complexity === 'complex' ? 'bg-red-50 text-red-700 border-red-200' :
                                  content.complexity === 'moderate' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                  'bg-green-50 text-green-700 border-green-200'
                                }`}
                              >
                                {content.complexity}
                              </Badge>
                            )}
                            {content.specialty && content.specialty !== 'unknown' && (
                              <Badge 
                                variant="outline" 
                                className="text-xs mt-1 bg-purple-50 text-purple-700 border-purple-200"
                              >
                                {content.specialty}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                // Original structure: nested collection cards
                filterCollectionContent(selectedCollection, collectionSearchQuery).children?.map((collectionCard: any) => (
                  <div key={collectionCard.id} className="bg-gray-50 rounded-lg p-4">
                    <div 
                      className="flex items-center justify-between cursor-pointer mb-4"
                      onClick={() => toggleCollectionCardItemsExpansion(collectionCard.id)}
                    >
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <FolderOpen className="w-5 h-5 mr-2 text-gray-600" />
                        {collectionCard.title}
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {collectionCard.items.length} items
                        </Badge>
                      </h3>
                      <ChevronDown 
                        className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
                          expandedCollectionCardItems.has(collectionCard.id) ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                    
                    {expandedCollectionCardItems.has(collectionCard.id) && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {collectionCard.items.map((content: any) => (
                        <div
                          key={content.id}
                          className="bg-white rounded-lg p-3 shadow-sm border hover:shadow-md transition-shadow cursor-pointer group"
                          onClick={() => handleContentClick(content)}
                        >
                          <div className="flex flex-col items-center text-center space-y-2">
                            <div className="w-16 h-16 rounded-lg border-2 border-gray-200 flex items-center justify-center bg-gray-50 group-hover:bg-blue-50 group-hover:border-blue-300 transition-colors">
                              {React.createElement(getContentTypeIcon(content.type), {
                                className: "w-8 h-8 text-gray-600 group-hover:text-blue-600",
                                strokeWidth: 1
                              })}
                            </div>
                            <div className="w-full">
                              <h4 className="text-xs font-medium text-gray-900 line-clamp-2 leading-tight">
                                {content.title}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1 capitalize">
                                {content.type}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Space Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {logoUrl && (
                <img 
                  src={logoUrl} 
                  alt={spaceData.metadata.spaceName}
                  className="w-16 h-16 object-contain rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {intelligentSpaceData ? 'CCHMC Pediatric Surgery - Intelligent Structure' : spaceData.metadata.spaceName}
                </h1>
                <p className="text-lg text-gray-600">
                  {intelligentSpaceData ? 
                    `Medically accurate content organization with ${intelligentSpaceData.total_content} items across ${intelligentSpaceData.space_cards.length} specialized areas` :
                    'Comprehensive pediatric surgery protocols, procedures, and training materials'
                  }
                </p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  {intelligentSpaceData ? (
                    <>
                      <span>{intelligentSpaceData.total_content} Total Items</span>
                      <span>{intelligentSpaceData.space_cards.length} Space Cards</span>
                      <span>Medical Priority Based</span>
                    </>
                  ) : (
                    <>
                      <span>{spaceData.metadata.contentTypes.videos} Videos</span>
                      <span>{spaceData.metadata.contentTypes.guidelines} Guidelines</span>
                      <span>{spaceData.metadata.contentTypes.documents} Documents</span>
                      <span>{spaceData.metadata.contentTypes.images} Images</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
                   {/* Social Actions */}
                   <div className="flex items-center space-x-4">
                     {intelligentSpaceData && (
                       <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                         Intelligent Structure
                       </Badge>
                     )}
                     <Button
                       variant="outline"
                       size="sm"
                       className="text-gray-600 border-gray-300 hover:bg-gray-50"
                     >
                       <Heart className="w-4 h-4 mr-2" />
                       0
                     </Button>
                     <Button
                       variant="outline"
                       size="sm"
                       className="text-gray-600 border-gray-300 hover:bg-gray-50"
                     >
                       <Share className="w-4 h-4 mr-2" />
                       0
                     </Button>
                   </div>
          </div>
        </div>
      </div>

      {/* Space Cards */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search all content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm"
            />
          </div>
        </div>
        
        {/* Featured Content Card */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg">
            <CardHeader>
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setIsFeaturedContentExpanded(!isFeaturedContentExpanded)}
              >
                <CardTitle className="text-2xl font-bold text-blue-900 flex items-center">
                  <Star className="w-6 h-6 mr-3 text-yellow-500" />
                  Featured Content
                  <Badge variant="secondary" className="ml-3 bg-blue-100 text-blue-800">
                    Quick Access
                  </Badge>
                </CardTitle>
                <ChevronDown 
                  className={`w-6 h-6 text-blue-600 transition-transform duration-200 ${
                    isFeaturedContentExpanded ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </CardHeader>
            {isFeaturedContentExpanded && (
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-6">
                {/* Resident & Fellow Handbook */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-20 h-20 rounded-full border-4 border-blue-200 flex items-center justify-center bg-blue-50">
                      <GraduationCap className="w-10 h-10 text-blue-600" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Resident & Fellow Handbook
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Comprehensive training guide for residents and fellows in pediatric surgery
                      </p>
                    </div>
                  </div>
                </div>

                {/* Trauma Guidelines */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-20 h-20 rounded-full border-4 border-red-200 flex items-center justify-center bg-red-50">
                      <AlertTriangle className="w-10 h-10 text-red-600" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Trauma Guidelines
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Emergency protocols and procedures for pediatric trauma cases
                      </p>
                    </div>
                  </div>
                </div>

                {/* Staff Directory */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-20 h-20 rounded-full border-4 border-green-200 flex items-center justify-center bg-green-50">
                      <Users className="w-10 h-10 text-green-600" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Staff Directory
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Contact information and profiles for all department staff members
                      </p>
                    </div>
                  </div>
                </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
        
        <div className="space-y-6">
          {filterSpaceCards(spaceCards, searchQuery).map((card) => {
            // Handle both intelligent structure and original structure
            const isIntelligentStructure = intelligentSpaceData && card.collections;
            const collections = isIntelligentStructure ? card.collections : card.items;
            const contentCount = isIntelligentStructure ? card.content_count : calculateSpaceCardContentCount(card);
            
            return (
              <Card 
                key={card.id}
                className="bg-white border transition-all duration-200"
                style={{ borderColor: card.color }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div
                      className="flex items-center gap-2 cursor-pointer flex-1"
                      onClick={() => toggleCardExpansion(card.id)}
                    >
                      <CardTitle className="text-lg">{card.title}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {collections.length} {collections.length === 1 ? 'collection' : 'collections'}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {contentCount} content
                      </Badge>
                      {isIntelligentStructure && card.priority && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            card.priority === 'highest' ? 'bg-red-50 text-red-700 border-red-200' :
                            card.priority === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            card.priority === 'medium' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-gray-50 text-gray-700 border-gray-200'
                          }`}
                        >
                          {card.priority.toUpperCase()}
                        </Badge>
                      )}
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${expandedCards.has(card.id) ? 'rotate-90' : ''}`}
                      />
                    </div>
                  </div>
                </CardHeader>
          
                {expandedCards.has(card.id) && (
                  <CardContent>
                    <div className="space-y-4">
                      {collections.map((collection) => {
                        // Handle both intelligent structure and original structure
                        const collectionItems = isIntelligentStructure ? collection.items : collection.children;
                        const itemCount = isIntelligentStructure ? 
                          collection.items.length : 
                          collectionItems?.reduce((acc: number, cc: any) => acc + cc.items.length, 0) || 0;
                        
                        return (
                          <div key={collection.id} className="bg-gray-50 rounded-lg p-4">
                            <div 
                              className="flex items-center justify-between cursor-pointer mb-3"
                              onClick={() => handleCollectionClick(collection)}
                            >
                              <div className="flex items-center space-x-3">
                                {!isIntelligentStructure && collection.icon && (
                                  <collection.icon className="w-5 h-5" style={{ color: card.color }} />
                                )}
                                <h3 className="text-lg font-semibold">{collection.title}</h3>
                                <Badge variant="secondary" className="text-xs">
                                  {itemCount} items
                                </Badge>
                                {isIntelligentStructure && collection.description && (
                                  <span className="text-sm text-gray-600">{collection.description}</span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                Click to open collection
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>
      
      {/* Embedded Content Viewer */}
      <ContentViewer />
      
      {/* Collection Dialog */}
      <CollectionDialog />
    </div>
  );
}