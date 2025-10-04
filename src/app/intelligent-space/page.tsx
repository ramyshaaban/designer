'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Activity, 
  AlertTriangle, 
  Baby, 
  Stethoscope, 
  GraduationCap, 
  BookOpen,
  Search,
  ChevronDown,
  ChevronUp,
  Play,
  FileText,
  Image,
  Download,
  ExternalLink,
  Heart,
  Zap,
  Shield,
  Users,
  Clock,
  Star,
  Bot
} from 'lucide-react';

interface IntelligentSpaceContentItem {
  id: string;
  title: string;
  type: 'video' | 'document' | 'guideline' | 'image';
  specialty?: string;
  complexity?: string;
  procedure?: string;
  priority?: number;
  fileUrl?: string;
}

interface IntelligentCollection {
  id: string;
  title: string;
  description: string;
  items: IntelligentSpaceContentItem[];
}

interface IntelligentSpaceCard {
  id: string;
  title: string;
  color: string;
  description: string;
  priority: 'highest' | 'high' | 'medium' | 'low';
  content_count: number;
  collections: IntelligentCollection[];
}

interface IntelligentSpaceData {
  space_cards: IntelligentSpaceCard[];
  total_content: number;
  medical_insights: any;
  patterns: any;
}

export default function IntelligentCCHMCSpace() {
  const [spaceData, setSpaceData] = useState<IntelligentSpaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpaceCard, setSelectedSpaceCard] = useState<IntelligentSpaceCard | null>(null);
  const [expandedSpaceCards, setExpandedSpaceCards] = useState<Set<string>>(new Set());
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<IntelligentSpaceContentItem | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fileUrls, setFileUrls] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    fetchIntelligentSpaceData();
  }, []);

  const fetchIntelligentSpaceData = async () => {
    try {
      setLoading(true);
      
      // Load the intelligent structure data
      const response = await fetch('/api/intelligent-space-structure');
      if (!response.ok) {
        throw new Error('Failed to fetch intelligent space structure');
      }
      
      const data = await response.json();
      setSpaceData(data);
      
      // Expand the highest priority space card by default
      const highestPriorityCard = data.space_cards.find((card: IntelligentSpaceCard) => card.priority === 'highest');
      if (highestPriorityCard) {
        setExpandedSpaceCards(new Set([highestPriorityCard.id]));
      }
      
    } catch (err) {
      console.error('Error fetching intelligent space data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load space data');
    } finally {
      setLoading(false);
    }
  };

  const toggleSpaceCardExpansion = (spaceCardId: string) => {
    const newExpanded = new Set(expandedSpaceCards);
    if (newExpanded.has(spaceCardId)) {
      newExpanded.delete(spaceCardId);
    } else {
      newExpanded.add(spaceCardId);
    }
    setExpandedSpaceCards(newExpanded);
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

  const getSignedFileUrl = async (fileKey: string): Promise<string> => {
    try {
      // Check if already cached
      if (fileUrls.has(fileKey)) {
        return fileUrls.get(fileKey)!;
      }

      const response = await fetch(`/api/thumbnail?key=${encodeURIComponent(fileKey)}`);
      if (!response.ok) {
        throw new Error(`Failed to get signed URL: ${response.statusText}`);
      }

      const data = await response.json();
      const signedUrl = data.url;

      // Cache the URL
      setFileUrls(prev => new Map(prev).set(fileKey, signedUrl));
      return signedUrl;
    } catch (err) {
      console.error(`Error getting signed URL for ${fileKey}:`, err);
      return '';
    }
  };

  const handleContentClick = async (content: IntelligentSpaceContentItem) => {
    setSelectedContent(content);
    
    // Ensure file URL is loaded before opening viewer
    if (content.fileUrl && !fileUrls.has(content.fileUrl)) {
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

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return Play;
      case 'document': return FileText;
      case 'guideline': return BookOpen;
      case 'image': return Image;
      default: return FileText;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'highest': return AlertTriangle;
      case 'high': return Heart;
      case 'medium': return Clock;
      case 'low': return Star;
      default: return Star;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'highest': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'complex': return 'bg-red-100 text-red-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'simple': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSpaceCards = spaceData?.space_cards.filter(spaceCard => {
    if (!searchQuery) return true;
    
    const matchesTitle = spaceCard.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDescription = spaceCard.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCollections = spaceCard.collections.some(collection => 
      collection.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collection.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collection.items.some(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    return matchesTitle || matchesDescription || matchesCollections;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Loading intelligent space structure...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="container mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Space</h2>
            <p className="text-red-600">{error}</p>
            <Button 
              onClick={fetchIntelligentSpaceData}
              className="mt-4"
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!spaceData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="container mx-auto">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No Space Data</h2>
            <p className="text-gray-600">Unable to load intelligent space structure.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CCHMC Pediatric Surgery</h1>
              <p className="text-lg text-gray-600 mt-1">Intelligent Medical Space Structure</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => window.location.href = '/ai-assistant'}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Bot className="w-4 h-4 mr-2" />
                Ask Sarah
              </Button>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {spaceData.total_content} Total Items
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {spaceData.space_cards.length} Space Cards
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search procedures, specialties, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Space Cards */}
        <div className="space-y-6">
          {filteredSpaceCards.map((spaceCard) => {
            const isExpanded = expandedSpaceCards.has(spaceCard.id);
            const PriorityIcon = getPriorityIcon(spaceCard.priority);
            
            return (
              <Card key={spaceCard.id} className="overflow-hidden shadow-lg">
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleSpaceCardExpansion(spaceCard.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: spaceCard.color }}
                      />
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">
                          {spaceCard.title}
                        </CardTitle>
                        <p className="text-gray-600 mt-1">{spaceCard.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getPriorityColor(spaceCard.priority)}>
                        <PriorityIcon className="w-3 h-3 mr-1" />
                        {spaceCard.priority.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {spaceCard.content_count} Items
                      </Badge>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {spaceCard.collections.map((collection) => {
                        const isCollectionExpanded = expandedCollections.has(collection.id);
                        
                        return (
                          <div key={collection.id} className="border border-gray-200 rounded-lg">
                            <div 
                              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                              onClick={() => toggleCollectionExpansion(collection.id)}
                            >
                              <div>
                                <h3 className="font-semibold text-gray-900">{collection.title}</h3>
                                <p className="text-sm text-gray-600 mt-1">{collection.description}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="bg-gray-50 text-gray-700">
                                  {collection.items.length} Items
                                </Badge>
                                {isCollectionExpanded ? (
                                  <ChevronUp className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                            </div>

                            {isCollectionExpanded && (
                              <div className="border-t border-gray-200 p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {collection.items.map((item) => {
                                    const ContentIcon = getContentIcon(item.type);
                                    
                                    return (
                                      <div
                                        key={item.id}
                                        className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => handleContentClick(item)}
                                      >
                                        <div className="flex-shrink-0">
                                          <ContentIcon className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-gray-900 truncate">
                                            {item.title}
                                          </p>
                                          <div className="flex items-center space-x-2 mt-1">
                                            <Badge variant="outline" className="text-xs">
                                              {item.type}
                                            </Badge>
                                            {item.complexity && (
                                              <Badge className={`text-xs ${getComplexityColor(item.complexity)}`}>
                                                {item.complexity}
                                              </Badge>
                                            )}
                                            {item.specialty && item.specialty !== 'unknown' && (
                                              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                                                {item.specialty}
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
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

        {/* Content Viewer Modal */}
        {isViewerOpen && selectedContent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`bg-white rounded-lg shadow-xl ${isFullscreen ? 'w-full h-full' : 'max-w-4xl w-full max-h-[90vh]'}`}>
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {selectedContent.title}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline">{selectedContent.type}</Badge>
                    {selectedContent.complexity && (
                      <Badge className={getComplexityColor(selectedContent.complexity)}>
                        {selectedContent.complexity}
                      </Badge>
                    )}
                    {selectedContent.specialty && selectedContent.specialty !== 'unknown' && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700">
                        {selectedContent.specialty}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                  >
                    {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={closeViewer}
                  >
                    Close
                  </Button>
                </div>
              </div>
              <div className="p-4">
                {selectedContent.fileUrl ? (
                  <div className="w-full h-full">
                    {selectedContent.type === 'video' ? (
                      <video
                        key={fileUrls.get(selectedContent.fileUrl)}
                        controls
                        className="w-full h-auto max-h-[70vh] rounded-lg"
                        preload="metadata"
                      >
                        <source src={fileUrls.get(selectedContent.fileUrl)} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    ) : selectedContent.type === 'document' || selectedContent.type === 'guideline' ? (
                      <iframe
                        src={fileUrls.get(selectedContent.fileUrl)}
                        className="w-full h-[70vh] rounded-lg border"
                        title={selectedContent.title}
                      />
                    ) : selectedContent.type === 'image' ? (
                      <img
                        src={fileUrls.get(selectedContent.fileUrl)}
                        alt={selectedContent.title}
                        className="w-full h-auto max-h-[70vh] rounded-lg object-contain"
                      />
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-500 mb-4">
                          <FileText className="h-16 w-16 mx-auto" />
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                          Content Viewer
                        </h4>
                        <p className="text-gray-600 mb-4">
                          This content type is not yet supported for viewing.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => window.open(fileUrls.get(selectedContent.fileUrl), '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open in New Tab
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-500 mb-4">
                      <FileText className="h-16 w-16 mx-auto" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      Content Not Available
                    </h4>
                    <p className="text-gray-600 mb-4">
                      This content is not available for viewing.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
