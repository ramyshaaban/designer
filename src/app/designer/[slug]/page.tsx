"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight, FolderOpen, FileText, Heart, Share, Stethoscope, PlayCircle, Mic, File, BarChart3, ClipboardList, BookOpen, Gamepad2, ExternalLink, Menu, X } from "lucide-react";
import React from "react";

type ContentType = 'video' | 'podcast' | 'document' | 'infographic' | 'guideline' | 'article' | 'interactive-content' | 'external-link' | 'menu-button';

type ContentItem = {
  id: string;
  type: 'content' | 'collection';
  title: string;
  description: string;
  contentType?: ContentType;
  icon?: string | any;
  isPublic?: boolean;
  fileUrl?: string;
  externalUrl?: string;
  menuButtonTarget?: string;
  children?: CollectionCard[];
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
  likes?: number;
  shares?: number;
  isLiked?: boolean;
};

type SpaceCard = {
  id: string;
  title: string;
  items: ContentItem[];
  portals?: any[];
  color: string;
  order: number;
  isExpanded: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type CollectionCard = {
  id: string;
  title: string;
  color: string;
  items: ContentItem[];
  order: number;
  isExpanded: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type Space = {
  id: string;
  name: string;
  description: string;
  backgroundColor: string;
  borderColor: string;
  textColor?: string; // Hex color for text (calculated for contrast)
  logo?: string;
  cards: SpaceCard[];
  currentCollection?: string;
  likes: number;
  isLiked: boolean;
  shares: number;
};

export default function ProductionSpacePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [space, setSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCollection, setCurrentCollection] = useState<ContentItem | null>(null);
  const [collectionPath, setCollectionPath] = useState<string[]>([]);
  const [showCollectionDialog, setShowCollectionDialog] = useState(false);

  // Function to refresh space data from localStorage
  const refreshSpaceData = () => {
    if (typeof window !== 'undefined') {
      const currentSpace = localStorage.getItem('designer-space');
      if (currentSpace) {
        const parsedSpace = JSON.parse(currentSpace);
        setSpace(parsedSpace);
      }
    }
  };

  // Helper function to get content type icon
  const getContentTypeIcon = (type: ContentType) => {
    const icons = {
      video: PlayCircle,
      podcast: Mic,
      document: File,
      infographic: BarChart3,
      guideline: ClipboardList,
      article: BookOpen,
      'interactive-content': Gamepad2,
      'external-link': ExternalLink,
      'menu-button': Menu
    };
    return icons[type] || FileText; // Fallback to FileText if type is not found
  };

  // Helper function to get collection card count
  const getCollectionCardCount = (collection: ContentItem) => {
    return collection.children?.length || 0;
  };

  // Helper function to get collection item count
  const getCollectionItemCount = (collection: ContentItem) => {
    if (!collection.children) return 0;
    return collection.children.reduce((total, card) => total + (card.items?.length || 0), 0);
  };

  // Search functionality
  const filterCardsBySearch = (cards: SpaceCard[]) => {
    if (!searchQuery.trim()) return cards;
    
    return cards.filter(card => 
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.items.some(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  };

  // Toggle card expansion
  const toggleCardExpansion = (cardId: string) => {
    if (currentCollection) {
      // Toggle expansion for collection cards
      setCurrentCollection({
        ...currentCollection,
        children: currentCollection.children?.map(card => {
          if (card.id === cardId) {
            return { ...card, isExpanded: !card.isExpanded };
          }
          return card;
        })
      });
    } else {
      // Toggle expansion for main space cards
      setSpace(prevSpace => {
        if (!prevSpace) return prevSpace;
        return {
          ...prevSpace,
          cards: prevSpace.cards.map(card => {
            if (card.id === cardId) {
              return { ...card, isExpanded: !card.isExpanded };
            }
            return card;
          })
        };
      });
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        console.log('Loading space for slug:', slug);
        
        // First try to load current space from localStorage (most up-to-date)
        const currentSpace = localStorage.getItem('designer-space');
        console.log('Current space data:', currentSpace);
        if (currentSpace) {
          const parsedSpace = JSON.parse(currentSpace);
          console.log('Parsed current space:', parsedSpace);
          console.log('Current space cards:', parsedSpace?.cards);
          setSpace(parsedSpace);
          setLoading(false);
          return;
        }
        
        // If no current space found, try to load saved versions from localStorage
        const savedVersions = JSON.parse(localStorage.getItem('designer-versions') || '[]');
        console.log('Saved versions:', savedVersions);
        const version = savedVersions.find((v: any) => v.slug === slug);
        
        if (version) {
          console.log('Found saved version:', version);
          console.log('Version space data:', version.space);
          console.log('Version space cards:', version.space?.cards);
          setSpace(version.space);
          setLoading(false);
          return;
        }
        
        // If no space found, create a default space for testing
        console.log('No space found, creating default space');
        const defaultSpace: Space = {
          id: "default-space",
          name: "Default Space",
          description: "A default space for testing",
          backgroundColor: "#f8fafc",
          borderColor: "#93c5fd",
          logo: undefined,
          cards: [
            {
              id: "default-card",
              title: "Sample Card",
              color: "#f3f4f6",
              items: [
                {
                  id: "sample-item",
                  title: "Sample Item",
                  description: "This is a sample item",
                  type: "content",
                  contentType: "document"
                }
              ],
              order: 0,
              isExpanded: false
            }
          ],
          likes: 0,
          shares: 0
        };
        setSpace(defaultSpace);
        setLoading(false);
      } catch (error) {
        console.error('Error loading space:', error);
        setError('Failed to load space');
        setLoading(false);
      }
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading space...</p>
        </div>
      </div>
    );
  }

  if (error || !space) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Space Not Found</h1>
          <p className="text-gray-600 mb-4">The space you're looking for doesn't exist or has been removed.</p>
          <a 
            href="/designer" 
            className="inline-block bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition-colors"
          >
            Go to Designer
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex justify-center">
      {/* Main App Container */}
      <div className="w-full max-w-md bg-white h-screen overflow-y-auto relative">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 z-50">
          {/* Space Logo and Title */}
          <div className="flex items-center justify-center mb-2">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center border border-solid"
                style={{ borderColor: space.borderColor }}
              >
                {space.logo ? (
                  <img 
                    src={space.logo} 
                    alt="Space Logo" 
                    className="w-10 h-10 rounded object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 bg-gray-400 rounded"></div>
                )}
              </div>
              
              {/* Space Name */}
              <div>
                <h1 className="text-xl font-bold text-gray-900">{space.name}</h1>
              </div>
            </div>
          </div>
          
          {/* Space Social Buttons */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <button className="flex items-center gap-1 px-3 py-1 bg-transparent hover:bg-gray-100 border border-gray-300 text-gray-600 rounded">
              <Heart className="w-4 h-4" />
              <span className="text-sm">{space.likes || 0}</span>
            </button>
            <button className="flex items-center gap-1 px-3 py-1 bg-transparent hover:bg-gray-100 border border-gray-300 text-gray-600 rounded">
              <Share className="w-4 h-4" />
              <span className="text-sm">{space.shares || 0}</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search cards and content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-500"
              />
            </div>
            
            {space.cards.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 flex justify-center">
                  <img 
                    src="https://ptp.yox.mybluehost.me/lab/SCMD.png" 
                    alt="SCMD Icon" 
                    className="w-32 h-32 object-contain"
                    onError={(e) => {
                      // Fallback to stethoscope icon if image fails to load
                      e.currentTarget.style.display = 'none';
                      const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                      if (nextElement) {
                        nextElement.style.display = 'block';
                      }
                    }}
                  />
                  <Stethoscope className="w-32 h-32 text-gray-400 hidden" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Space is Empty</h3>
                <p className="text-gray-600">This space doesn't have any content yet.</p>
              </div>
            ) : (
              filterCardsBySearch(space.cards)
                .sort((a, b) => a.order - b.order)
                .map((card) => (
                  <Card key={card.id} className="bg-white border transition-all duration-200" style={{ borderColor: space.borderColor }}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div 
                          className="flex items-center gap-2 cursor-pointer flex-1"
                          onClick={() => toggleCardExpansion(card.id)}
                        >
                          <CardTitle className="text-lg">{card.title}</CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {card.items.length} {card.items.length === 1 ? 'item' : 'items'}
                          </Badge>
                          <ChevronRight 
                            className={`w-4 h-4 transition-transform ${card.isExpanded ? 'rotate-90' : ''}`} 
                          />
                        </div>
                      </div>
                    </CardHeader>
                    {card.isExpanded && (
                    <CardContent>
                      {card.title === 'Portals' ? (
                        // Special Portals card rendering for Production Mode
                        <div className="grid grid-cols-3 gap-3">
                          {card.portals && card.portals.length > 0 ? (
                            card.portals.map((portal) => (
                              <div 
                                key={portal.id} 
                                className="relative group rounded-full p-3 transition-colors cursor-pointer hover:shadow-lg"
                              >
                                <div className="flex flex-col items-center text-center space-y-2">
                                  <div 
                                    className="rounded-full border-2 flex items-center justify-center bg-white relative shadow-md" 
                                    style={{ 
                                      borderColor: portal.spaceColor, 
                                      width: '80px', 
                                      height: '80px' 
                                    }}
                                  >
                                    <span className="text-2xl">{portal.spaceIcon}</span>
                                  </div>
                                  <div className="text-xs font-medium text-gray-700 max-w-full truncate">
                                    {portal.spaceName}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-3 text-center py-8">
                              <p className="text-sm text-gray-500 italic">No portals available</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        // Regular card rendering for Production Mode
                        <div className="grid grid-cols-3 gap-2">
                          {card.items.length === 0 ? (
                            <div className="col-span-3 text-center py-8">
                              <p className="text-sm text-gray-500 italic">No content available</p>
                            </div>
                          ) : (
                            card.items.map((item) => (
                            <div 
                              key={item.id} 
                              className={`rounded-lg p-2 transition-colors cursor-pointer ${
                                item.type === 'collection' 
                                  ? 'bg-gradient-to-br from-gray-50 to-gray-100' 
                                  : ''
                              }`}
                              onClick={() => {
                                if (item.type === 'collection') {
                                  // Refresh space data to get latest collection state
                                  refreshSpaceData();
                                  // Find the updated collection from the refreshed space
                                  setTimeout(() => {
                                    const updatedSpace = JSON.parse(localStorage.getItem('designer-space') || '{}');
                                    const updatedCollection = updatedSpace.cards
                                      ?.flatMap(card => card.items)
                                      .find(spaceItem => spaceItem.id === item.id);
                                    if (updatedCollection) {
                                      setCurrentCollection(updatedCollection);
                                      setCollectionPath([...collectionPath, item.id]);
                                      setShowCollectionDialog(true);
                                    }
                                  }, 100);
                                }
                              }}
                            >
                              <div className="flex flex-col items-center text-center space-y-2 h-full justify-center">
                                <div className={`rounded-lg border flex items-center justify-center bg-white relative ${item.type === 'collection' ? 'shadow-lg' : ''}`} style={{ borderColor: space.borderColor, width: '100px', height: '120px' }}>
                                  {/* Stack effect for collections */}
                                  {item.type === 'collection' && (
                                    <>
                                      {/* Third square (back) */}
                                      <div className="absolute inset-0 rounded-lg border bg-gray-50 transform translate-x-2 translate-y-2 rotate-2 opacity-40" style={{ borderColor: space.borderColor }}></div>
                                      {/* Second square (middle) */}
                                      <div className="absolute inset-0 rounded-lg border bg-gray-100 transform translate-x-1 translate-y-1 -rotate-1 opacity-60" style={{ borderColor: space.borderColor }}></div>
                                      {/* First square (front) - solid white */}
                                      <div className="absolute inset-0 rounded-lg border bg-white transform translate-x-0 translate-y-0 rotate-0 opacity-100" style={{ borderColor: space.borderColor }}></div>
                                    </>
                                  )}
                                  <div className="relative z-10 flex items-center justify-center w-full h-full -mt-8">
                                    {item.type === 'collection' ? <FolderOpen className="w-8 h-8" style={{ color: space.borderColor, strokeWidth: 1 }} /> : 
                                      typeof item.icon === 'string' ? 
                                        <span className="text-2xl flex items-center justify-center">{item.icon}</span> : 
                                        typeof item.icon === 'object' && item.contentType ?
                                          React.createElement(getContentTypeIcon(item.contentType) || FileText, { className: "w-8 h-8", style: { color: space.borderColor, strokeWidth: 1 } }) :
                                          <FileText className="w-8 h-8" style={{ color: space.borderColor, strokeWidth: 1 }} />
                                    }
                                  </div>
                                  {/* Item count inside container for collections */}
                                  {item.type === 'collection' && (
                                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex flex-col space-y-1">
                                      <div className="bg-gray-100 text-gray-800 text-[10px] font-medium px-3 py-1 rounded-full text-center min-w-[70px]">
                                        <div className="truncate">{getCollectionCardCount(item)} cards</div>
                                      </div>
                                      <div className="bg-gray-100 text-gray-800 text-[10px] font-medium px-3 py-1 rounded-full text-center min-w-[70px]">
                                        <div className="truncate">{getCollectionItemCount(item)} items</div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="w-full h-12 flex flex-col justify-center">
                                  <h4 className={`text-xs font-medium line-clamp-2 ${item.type === 'collection' ? '' : ''}`} style={item.type === 'collection' ? { color: space.borderColor } : {}}>{item.title}</h4>
                                  <p className="text-xs text-gray-600 line-clamp-1 leading-tight">{item.description}</p>
                                </div>
                                  {item.externalUrl && (
                                    <a 
                                      href={item.externalUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      Open Link
                                    </a>
                                  )}
                              </div>
                            </div>
                            ))
                          )}
                        </div>
                      )}
                    </CardContent>
                    )}
                  </Card>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Collection Dialog */}
      {currentCollection && showCollectionDialog && (
        <div className="absolute inset-0 bg-black/50 z-60 flex items-center justify-center">
          <div 
            className="w-96 max-h-[calc(100vh-2rem)] overflow-y-auto bg-white border shadow-lg rounded-lg" 
          >
            <div className="p-6 pb-0">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">{space?.name}'s Collections</p>
                <h2 className="text-xl font-bold">
                  {currentCollection.title}
                </h2>
              </div>
              <p className="text-sm text-gray-600">{currentCollection.description}</p>
              
              {/* Crowdsourcing Buttons */}
              <div className="flex items-center justify-center gap-3 mt-3">
                <button
                  className={`flex items-center gap-1 px-3 py-1 bg-transparent hover:bg-gray-100 border rounded ${
                    currentCollection.isLiked ? 'border-red-300 text-red-600' : 'border-gray-300 text-gray-600'
                  }`}
                  title={`${currentCollection.likes || 0} likes`}
                >
                  <Heart className={`w-4 h-4 ${currentCollection.isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm">{currentCollection.likes || 0}</span>
                </button>
                
                <button
                  className="flex items-center gap-1 px-3 py-1 bg-transparent hover:bg-gray-100 border border-gray-300 text-gray-600 rounded"
                  title={`${currentCollection.shares || 0} shares`}
                >
                  <Share className="w-4 h-4" />
                  <span className="text-sm">{currentCollection.shares || 0}</span>
                </button>
              </div>
            </div>
            
            <div className="px-6 pb-6 space-y-4">
              {/* Collection Cards Management */}
              {currentCollection.children && currentCollection.children.length > 0 ? (
                <div className="mt-8">
                <div className="space-y-3">
                  {currentCollection.children
                    .sort((a, b) => a.order - b.order)
                    .map((card) => (
                      <Card key={card.id} className="bg-white border transition-all duration-200" style={{ borderColor: card.color }}>
                        <CardHeader className="px-3 pt-0 pb-3">
                          <div 
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => toggleCardExpansion(card.id)}
                          >
                            <CardTitle className="text-sm truncate" style={{ color: card.color }}>{card.title}</CardTitle>
                            <Badge variant="secondary" className="text-xs flex-shrink-0">
                              {(card.items || []).length} {(card.items || []).length === 1 ? 'item' : 'items'}
                            </Badge>
                            <ChevronRight 
                              className={`w-4 h-4 transition-transform flex-shrink-0 ${card.isExpanded ? 'rotate-90' : ''}`} 
                            />
                          </div>
                        </CardHeader>
                        {card.isExpanded && (
                          <CardContent>
                          <div className="grid grid-cols-3 gap-2">
                            {card.items && card.items.length > 0 ? (
                              card.items.map((item) => (
                                    <div 
                                      key={item.id} 
                                      className={`relative group rounded-lg p-2 transition-colors cursor-pointer ${
                                        item.type === 'collection' 
                                          ? 'bg-gradient-to-br from-gray-50 to-gray-100' 
                                          : ''
                                      }`}
                                      onClick={() => {
                                        if (item.type === 'collection') {
                                          // Refresh space data to get latest collection state
                                          refreshSpaceData();
                                          // Find the updated collection from the refreshed space
                                          setTimeout(() => {
                                            const updatedSpace = JSON.parse(localStorage.getItem('designer-space') || '{}');
                                            const updatedCollection = updatedSpace.cards
                                              ?.flatMap(card => card.items)
                                              .find(spaceItem => spaceItem.id === item.id);
                                            if (updatedCollection) {
                                              setCurrentCollection(updatedCollection);
                                              setCollectionPath([...collectionPath, item.id]);
                                              setShowCollectionDialog(true);
                                            }
                                          }, 100);
                                        }
                                      }}
                                    >
                                  <div className="flex flex-col items-center text-center space-y-2 h-full justify-center">
                                    <div className={`rounded-lg border flex items-center justify-center bg-white relative ${item.type === 'collection' ? 'shadow-lg' : ''}`} style={{ borderColor: space?.borderColor, width: '100px', height: '120px', minHeight: '120px', maxHeight: '120px' }}>
                                      {/* Stack effect for collections */}
                                      {item.type === 'collection' && (
                                        <>
                                      {/* Third square (back) */}
                                      <div className="absolute inset-0 rounded-lg border bg-gray-50 transform translate-x-2 translate-y-2 rotate-2 opacity-40" style={{ borderColor: space?.borderColor }}></div>
                                      {/* Second square (middle) */}
                                      <div className="absolute inset-0 rounded-lg border bg-gray-100 transform translate-x-1 translate-y-1 -rotate-1 opacity-60" style={{ borderColor: space?.borderColor }}></div>
                                      {/* First square (front) - solid white */}
                                      <div className="absolute inset-0 rounded-lg border bg-white transform translate-x-0 translate-y-0 rotate-0 opacity-100" style={{ borderColor: space?.borderColor }}></div>
                                        </>
                                      )}
                                      <div className="relative z-10 flex items-center justify-center w-full h-full -mt-8">
                                        {item.type === 'collection' ? <FolderOpen className="w-8 h-8" style={{ color: space?.borderColor, strokeWidth: 1 }} /> : 
                                          typeof item.icon === 'string' ? 
                                            <span className="text-2xl flex items-center justify-center">{item.icon}</span> : 
                                            typeof item.icon === 'object' && item.contentType ?
                                              React.createElement(getContentTypeIcon(item.contentType) || FileText, { className: "w-8 h-8", style: { color: space?.borderColor, strokeWidth: 1 } }) :
                                              <FileText className="w-8 h-8" style={{ color: space?.borderColor, strokeWidth: 1 }} />
                                        }
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <h3 className="text-xs font-medium text-gray-900 truncate">{item.title}</h3>
                                      {item.description && (
                                        <p className="text-xs text-gray-500 truncate">{item.description}</p>
                                      )}
                                      {item.externalUrl && (
                                        <a 
                                          href={item.externalUrl} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          Open Link
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="col-span-3 text-center py-8">
                                <p className="text-sm text-gray-500 italic">No content available</p>
                              </div>
                            )}
                          </div>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No cards in this collection yet</h3>
                  <p className="text-gray-600">This collection is empty.</p>
                </div>
              )}
            </div>
            
            {/* Close Button */}
            <div className="px-6 pb-6">
              <button
                onClick={() => {
                  setShowCollectionDialog(false);
                  setCurrentCollection(null);
                  setCollectionPath([]);
                }}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
