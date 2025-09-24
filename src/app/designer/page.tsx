"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useState, useRef, useEffect } from "react";
import React from "react";
import { Plus, Edit, Trash2, Move, Eye, EyeOff, Save, X, Image, Link, FileText, Video, Calendar, Users, Settings, Folder, FolderOpen, Palette, Layout, Upload, Play, Mic, FileImage, BookOpen, ExternalLink, ChevronRight, ChevronLeft, PlayCircle } from "lucide-react";

type ContentType = 'video' | 'podcast' | 'infographic' | 'guideline' | 'article' | 'external-link';

type ContentItem = {
  id: string;
  type: 'content' | 'collection';
  title: string;
  description: string;
  contentType?: ContentType; // For content items
  icon: React.ComponentType<any>; // Lucide icon component
  isPublic: boolean;
  fileUrl?: string; // For uploaded content
  externalUrl?: string; // For external links
  children?: CollectionCard[]; // For collections - use CollectionCard type
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

type SpaceCard = {
  id: string;
  title: string;
  items: ContentItem[];
  order: number;
  isExpanded: boolean; // Whether the card is expanded or minimized
  createdAt: Date;
  updatedAt: Date;
};

type CollectionCard = {
  id: string;
  title: string;
  color: string; // Hex color for the card
  items: ContentItem[];
  order: number;
  isExpanded: boolean; // Whether the card is expanded or minimized
  createdAt: Date;
  updatedAt: Date;
};

type Space = {
  id: string;
  name: string;
  description: string;
  backgroundColor: string; // Hex color for background
  borderColor: string; // Hex color for borders
  logo?: string; // URL or base64 for space logo
  cards: SpaceCard[]; // Main space cards (no individual colors)
  currentCollection?: string; // For nested collections
};

export default function DesignerPage() {
  const [space, setSpace] = useState<Space>({
    id: "space-1",
    name: "Space Title",
    description: "Customize your space by adding cards and content",
    backgroundColor: "#f8fafc", // Light blue background
    borderColor: "#93c5fd", // Blue border
    cards: []
  });

  // Load space data from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('designer-space');
      if (saved) {
        try {
          const parsedSpace = JSON.parse(saved);
          console.log('Loaded space data:', parsedSpace);
          setSpace(parsedSpace);
        } catch (error) {
          console.error('Error parsing saved space data:', error);
        }
      } else {
        console.log('No saved space data found, using default');
      }
    }
  }, []);

  // Manual save function instead of automatic saving
  const saveSpaceData = async () => {
    setIsSaving(true);
    try {
      if (typeof window !== 'undefined') {
        console.log('Saving space data:', space);
        localStorage.setItem('designer-space', JSON.stringify(space));
        console.log('Space data saved successfully');
        alert('Space data saved successfully!');
      }
    } catch (error) {
      console.error('Error saving space data:', error);
      alert('Error saving space data: ' + (error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  const [isDesignMode, setIsDesignMode] = useState(true);
  const [editingCard, setEditingCard] = useState<SpaceCard | CollectionCard | null>(null);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [showAddCardDialog, setShowAddCardDialog] = useState(false);
  const [showCollectionDialog, setShowCollectionDialog] = useState(false);
  const [showSpaceSettingsDialog, setShowSpaceSettingsDialog] = useState(false);
  const [isEditingSpaceTitle, setIsEditingSpaceTitle] = useState(false);
  const [showLogoUpload, setShowLogoUpload] = useState(false);
  const [currentCardId, setCurrentCardId] = useState<string | null>(null);
  const [currentCollection, setCurrentCollection] = useState<ContentItem | null>(null);
  const [collectionPath, setCollectionPath] = useState<string[]>([]); // Track path to current collection
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Form states
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardColor, setNewCardColor] = useState("#f3f4f6"); // Default gray for collection cards
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemType, setNewItemType] = useState<'content' | 'collection'>('content');
  const [newItemContentType, setNewItemContentType] = useState<ContentType>('video');
  const [newItemIcon, setNewItemIcon] = useState("🎥");
  const [newItemIsPublic, setNewItemIsPublic] = useState(true);
  const [newItemFileUrl, setNewItemFileUrl] = useState("");
  const [newItemExternalUrl, setNewItemExternalUrl] = useState("");

  const dragRef = useRef<HTMLDivElement>(null);

  // Helper functions
  const getContentTypeIcon = (type: ContentType) => {
    const icons = {
      video: PlayCircle,
      podcast: Mic,
      infographic: Image,
      guideline: FileText,
      article: BookOpen,
      'external-link': ExternalLink
    };
    return icons[type];
  };

  const getContentTypeEmoji = (type: ContentType) => {
    const emojis = {
      video: "🎥",
      podcast: "🎙️",
      infographic: "📊",
      guideline: "📋",
      article: "📄",
      'external-link': "🔗"
    };
    return emojis[type];
  };

  const getColorOptions = () => [
    { value: "border-blue-300", label: "Blue" },
    { value: "border-green-300", label: "Green" },
    { value: "border-purple-300", label: "Purple" },
    { value: "border-orange-300", label: "Orange" },
    { value: "border-red-300", label: "Red" },
    { value: "border-gray-300", label: "Gray" }
  ];

  const getSpaceColorOptions = () => [
    { value: "bg-gradient-to-br from-slate-50 to-blue-50", label: "Ocean Blue", borderColor: "border-blue-300" },
    { value: "bg-gradient-to-br from-green-50 to-emerald-50", label: "Forest Green", borderColor: "border-green-300" },
    { value: "bg-gradient-to-br from-purple-50 to-violet-50", label: "Royal Purple", borderColor: "border-purple-300" },
    { value: "bg-gradient-to-br from-orange-50 to-amber-50", label: "Sunset Orange", borderColor: "border-orange-300" },
    { value: "bg-gradient-to-br from-red-50 to-rose-50", label: "Crimson Red", borderColor: "border-red-300" },
    { value: "bg-gradient-to-br from-gray-50 to-slate-50", label: "Classic Gray", borderColor: "border-gray-300" },
    { value: "bg-gradient-to-br from-pink-50 to-rose-50", label: "Blush Pink", borderColor: "border-pink-300" },
    { value: "bg-gradient-to-br from-indigo-50 to-blue-50", label: "Deep Indigo", borderColor: "border-indigo-300" },
    { value: "bg-gradient-to-br from-teal-50 to-cyan-50", label: "Aqua Teal", borderColor: "border-teal-300" },
    { value: "bg-gradient-to-br from-yellow-50 to-amber-50", label: "Golden Yellow", borderColor: "border-yellow-300" },
    { value: "bg-gradient-to-br from-lime-50 to-green-50", label: "Fresh Lime", borderColor: "border-lime-300" },
    { value: "bg-gradient-to-br from-sky-50 to-blue-50", label: "Sky Blue", borderColor: "border-sky-300" }
  ];

  // Helper function to determine text color based on background brightness
  const getTextColorForBackground = (backgroundColor: string) => {
    // Convert hex to RGB
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate brightness using luminance formula
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // Return dark text for light backgrounds, light text for dark backgrounds
    return brightness > 128 ? 'text-gray-900' : 'text-white';
  };

  // Helper function to generate a lighter border color from background
  const generateBorderColor = (backgroundColor: string) => {
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Make border color slightly darker/more saturated
    const borderR = Math.max(0, Math.min(255, r - 20));
    const borderG = Math.max(0, Math.min(255, g - 20));
    const borderB = Math.max(0, Math.min(255, b - 20));
    
    return `#${borderR.toString(16).padStart(2, '0')}${borderG.toString(16).padStart(2, '0')}${borderB.toString(16).padStart(2, '0')}`;
  };

  const updateSpaceTitle = (newTitle: string) => {
    setSpace({ ...space, name: newTitle });
    setIsEditingSpaceTitle(false);
  };

  const clearSavedData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('designer-space');
      // Reset to default space
      setSpace({
        id: "space-1",
        name: "Space Title",
        description: "Customize your space by adding cards and content",
        backgroundColor: "#f8fafc",
        borderColor: "#93c5fd",
        cards: []
      });
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSpace({ ...space, logo: result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Populate form fields when editing an item
  useEffect(() => {
    if (editingItem) {
      setNewItemType(editingItem.type);
      setNewItemTitle(editingItem.title);
      setNewItemDescription(editingItem.description);
      if (editingItem.type === 'content') {
        setNewItemContentType(editingItem.contentType || 'video');
        setNewItemIsPublic(editingItem.isPublic || false);
        setNewItemExternalUrl(editingItem.externalUrl || '');
        setNewItemFileUrl(editingItem.fileUrl || '');
      }
    } else {
      // Reset form when not editing
      setNewItemType('content');
      setNewItemTitle('');
      setNewItemDescription('');
      setNewItemContentType('video');
      setNewItemIsPublic(false);
      setNewItemExternalUrl('');
      setNewItemFileUrl('');
    }
  }, [editingItem]);

  // Card management functions
  const addCard = () => {
    if (newCardTitle.trim()) {
      if (currentCollection) {
        // Create a CollectionCard for collections
        const newCard: CollectionCard = {
          id: `card-${Date.now()}`,
          title: newCardTitle.trim(),
          color: newCardColor,
          items: [],
          order: (currentCollection.children?.length || 0) + 1,
          isExpanded: false, // Minimized by default
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        setCurrentCollection({
          ...currentCollection,
          children: [...(currentCollection.children || []), newCard]
        });
        } else {
          // Create a SpaceCard for main space
          const newCard: SpaceCard = {
            id: `card-${Date.now()}`,
            title: newCardTitle.trim(),
            items: [],
            order: space.cards.length + 1,
            isExpanded: false, // Minimized by default
            createdAt: new Date(),
            updatedAt: new Date()
          };
        
        setSpace({
          ...space,
          cards: [...space.cards, newCard]
        });
      }
      
      setNewCardTitle("");
      setNewCardColor("#f3f4f6");
      setShowAddCardDialog(false);
    }
  };

  const updateCard = (updatedCard: SpaceCard | CollectionCard) => {
    if (currentCollection) {
      // Update CollectionCard in collection
      setCurrentCollection({
        ...currentCollection,
        children: currentCollection.children?.map(card => 
          card.id === updatedCard.id ? { ...updatedCard, updatedAt: new Date() } as CollectionCard : card
        )
      });
    } else {
      // Update SpaceCard in main space
      setSpace({
        ...space,
        cards: space.cards.map(card => 
          card.id === updatedCard.id ? { ...updatedCard, updatedAt: new Date() } as SpaceCard : card
        )
      });
    }
    setEditingCard(null);
  };

  const toggleCardExpansion = (cardId: string) => {
    if (currentCollection) {
      setCurrentCollection({
        ...currentCollection,
        children: currentCollection.children?.map(card => 
          card.id === cardId ? { ...card, isExpanded: !card.isExpanded, updatedAt: new Date() } : card
        )
      });
    } else {
      // Toggle expansion for main space cards
      setSpace({
        ...space,
        cards: space.cards.map(card => 
          card.id === cardId ? { ...card, isExpanded: !card.isExpanded, updatedAt: new Date() } : card
        )
      });
    }
  };

  const deleteCard = (cardId: string) => {
    setSpace({
      ...space,
      cards: space.cards.filter(card => card.id !== cardId)
    });
  };

  // Item management functions
  const addItem = (cardId: string) => {
    if (newItemTitle.trim()) {
      const itemData: ContentItem = {
        id: editingItem ? editingItem.id : `item-${Date.now()}`,
        type: newItemType,
        title: newItemTitle.trim(),
        description: newItemDescription.trim(),
        contentType: newItemType === "content" ? newItemContentType : undefined,
        icon: newItemType === "content" ? getContentTypeIcon(newItemContentType) : FolderOpen,
        isPublic: newItemIsPublic,
        fileUrl: newItemType === "content" && newItemContentType !== 'external-link' ? newItemFileUrl : undefined,
        externalUrl: newItemType === "content" && newItemContentType === 'external-link' ? newItemExternalUrl : undefined,
        children: newItemType === "collection" ? (editingItem?.children || []) : undefined,
        order: editingItem ? editingItem.order : 0,
        createdAt: editingItem ? editingItem.createdAt : new Date(),
        updatedAt: new Date()
      };

      if (currentCollection) {
        // Add or update item in collection card
        setCurrentCollection({
          ...currentCollection,
          children: currentCollection.children?.map(card => 
            card.id === cardId 
              ? { 
                  ...card, 
                  items: editingItem 
                    ? card.items?.map(item => item.id === editingItem.id ? itemData : item) || []
                    : [...(card.items || []), { ...itemData, order: (card.items?.length || 0) + 1 }],
                  updatedAt: new Date()
                }
              : card
          )
        });
      } else {
        // Add or update item in main space card
        setSpace({
          ...space,
          cards: space.cards.map(card => 
            card.id === cardId 
              ? { 
                  ...card, 
                  items: editingItem 
                    ? card.items.map(item => item.id === editingItem.id ? itemData : item)
                    : [...card.items, { ...itemData, order: card.items.length + 1 }],
                  updatedAt: new Date()
                }
              : card
          )
        });
      }

      // Reset form
      setNewItemTitle("");
      setNewItemDescription("");
      setNewItemType("content");
      setNewItemContentType("video");
      setNewItemIcon("🎥");
      setNewItemIsPublic(true);
      setNewItemFileUrl("");
      setNewItemExternalUrl("");
      setShowAddItemDialog(false);
      setCurrentCardId(null);
      setEditingItem(null);
    }
  };

  const deleteItem = (cardId: string, itemId: string) => {
    if (currentCollection) {
      // Delete item from card in collection
      setCurrentCollection({
        ...currentCollection,
        children: currentCollection.children?.map(card => 
          card.id === cardId 
            ? { 
                ...card, 
                items: (card.items || []).filter(item => item.id !== itemId),
                updatedAt: new Date()
              }
            : card
        )
      });
    } else {
      // Delete item from card in main space
      setSpace({
        ...space,
        cards: space.cards.map(card => 
          card.id === cardId 
            ? { 
                ...card, 
                items: card.items.filter(item => item.id !== itemId),
                updatedAt: new Date()
              }
            : card
        )
      });
    }
  };

  // Save collection changes back to main space
  const saveCollectionChanges = () => {
    if (currentCollection) {
      // Deep clone the space to avoid mutations
      const updatedSpace = JSON.parse(JSON.stringify(space));
      
      // Function to recursively find and update a collection by path
      const updateCollectionByPath = (cards: SpaceCard[], path: string[], updatedCollection: ContentItem): SpaceCard[] => {
        if (path.length === 0) return cards;
        
        const targetId = path[0];
        const remainingPath = path.slice(1);
        
        return cards.map(card => ({
          ...card,
          items: card.items.map(item => {
            if (item.id === targetId) {
              if (remainingPath.length === 0) {
                // This is the target collection
                return updatedCollection;
              } else {
                // This is a parent collection, recurse into its children
                if (item.type === 'collection' && item.children) {
                  return {
                    ...item,
                    children: updateCollectionByPath(item.children, remainingPath, updatedCollection)
                  };
                }
              }
            }
            return item;
          })
        }));
      };

      const newCards = updateCollectionByPath(updatedSpace.cards, collectionPath, currentCollection);
      
      setSpace({
        ...updatedSpace,
        cards: newCards
      });
    }
  };

  // Calculate total items in collection (across all cards) - only count content, not collections or cards
  // This includes content in nested subcollections
  const getCollectionItemCount = (collection: ContentItem) => {
    if (!collection.children) return 0;
    
    return collection.children.reduce((total, card) => {
      // Count content items in this card
      const contentItems = (card.items || []).filter(item => item.type === 'content');
      let cardTotal = contentItems.length;
      
      // Also count content items in any subcollections within this card
      const subcollections = (card.items || []).filter(item => item.type === 'collection');
      subcollections.forEach(subcollection => {
        cardTotal += getCollectionItemCount(subcollection);
      });
      
      return total + cardTotal;
    }, 0);
  };

  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    setDraggedCard(cardId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetCardId: string) => {
    e.preventDefault();
    if (!draggedCard || draggedCard === targetCardId) return;

    const draggedIndex = space.cards.findIndex(c => c.id === draggedCard);
    const targetIndex = space.cards.findIndex(c => c.id === targetCardId);
    
    const newCards = [...space.cards];
    const [draggedCardData] = newCards.splice(draggedIndex, 1);
    newCards.splice(targetIndex, 0, draggedCardData);
    
    // Update order numbers
    const updatedCards = newCards.map((card, index) => ({
      ...card,
      order: index + 1
    }));
    
    setSpace({ ...space, cards: updatedCards });
    setDraggedCard(null);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: space.backgroundColor }}>
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 z-10">
          {/* Mode Toggle - Above Everything */}
          <div className="flex items-center justify-center mb-4">
            <Button
              variant={isDesignMode ? "default" : "outline"}
              onClick={() => setIsDesignMode(true)}
              className={`rounded-r-none border ${isDesignMode ? '' : ''}`}
              style={isDesignMode ? { 
                backgroundColor: space.backgroundColor,
                borderColor: space.borderColor,
                color: getTextColorForBackground(space.backgroundColor) === 'text-gray-900' ? '#1f2937' : '#ffffff'
              } : {}}
            >
              <Palette className="w-4 h-4 mr-2" />
              Design Mode
            </Button>
            <Button
              variant={!isDesignMode ? "default" : "outline"}
              onClick={() => setIsDesignMode(false)}
              className={`rounded-l-none border ${!isDesignMode ? '' : ''}`}
              style={!isDesignMode ? { 
                backgroundColor: space.backgroundColor,
                borderColor: space.borderColor,
                color: getTextColorForBackground(space.backgroundColor) === 'text-gray-900' ? '#1f2937' : '#ffffff'
              } : {}}
            >
              <Eye className="w-4 h-4 mr-2" />
              Production Mode
            </Button>
          </div>

          {/* Space Logo and Title */}
          <div className="flex items-center justify-center mb-2">
            <div className="flex items-center gap-3">
              {/* Logo Placeholder */}
              <div 
                className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                  isDesignMode 
                    ? 'border-2 border-dashed border-gray-300 cursor-pointer hover:border-gray-400' 
                    : 'border border-solid'
                }`}
                style={!isDesignMode ? { borderColor: space.borderColor } : {}}
                onClick={isDesignMode ? () => document.getElementById('logo-upload')?.click() : undefined}
              >
                {space.logo ? (
                  <img 
                    src={space.logo} 
                    alt="Space Logo" 
                    className="w-10 h-10 rounded object-cover"
                  />
                ) : (
                  <Image className="w-6 h-6 text-gray-400" />
                )}
              </div>
              
              {/* Space Title */}
              {isEditingSpaceTitle ? (
                <Input
                  value={space.name}
                  onChange={(e) => setSpace({ ...space, name: e.target.value })}
                  onBlur={() => setIsEditingSpaceTitle(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      updateSpaceTitle(space.name);
                    } else if (e.key === 'Escape') {
                      setIsEditingSpaceTitle(false);
                    }
                  }}
                  className="text-xl font-bold border-0 border-b-2 border-gray-300 focus:border-blue-500 bg-transparent p-0 text-center"
                  autoFocus
                />
              ) : (
                <h1 
                  className="text-xl font-bold text-gray-900 cursor-pointer hover:text-gray-600 transition-colors"
                  onClick={() => setIsEditingSpaceTitle(true)}
                >
                  {space.name}
                </h1>
              )}
            </div>
          </div>

          {/* Settings and Save Buttons - only in design mode */}
          {isDesignMode && (
            <div className="flex justify-end gap-2 mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={saveSpaceData}
                disabled={isSaving}
                className="bg-transparent hover:bg-gray-100 border border-gray-300"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSpaceSettingsDialog(true)}
                className="bg-transparent hover:bg-gray-100 border border-gray-300"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Hidden file input for logo upload - only in design mode */}
          {isDesignMode && (
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          )}
          {isDesignMode && (
            <p className="text-sm text-gray-600 text-center">{space.description}</p>
          )}
        </div>

        {/* Main Content */}
        <div className="p-4">
          {isDesignMode ? (
            // Design Mode
            <div className="space-y-4">
              {space.cards.length === 0 ? (
                // Empty Space - Add First Card
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏥</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Space is Empty</h3>
                  <p className="text-gray-600 mb-6">Start building your space by adding your first card.</p>
                  <Button 
                    onClick={() => setShowAddCardDialog(true)}
                    className={`flex items-center gap-2 border transition-all duration-200 mx-auto`}
                    style={{ 
                      backgroundColor: space.backgroundColor,
                      borderColor: space.borderColor,
                      color: getTextColorForBackground(space.backgroundColor) === 'text-gray-900' ? '#1f2937' : '#ffffff'
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Add Your First Card
                  </Button>
                </div>
              ) : (
                // Cards Grid
                <div className="space-y-4">
                  {/* Add Card Button */}
                  <Button
                    onClick={() => setShowAddCardDialog(true)}
                    variant="outline"
                    className="w-full flex items-center gap-2 border hover:shadow-lg transition-all duration-200"
                    style={{ 
                      backgroundColor: space.backgroundColor,
                      borderColor: space.borderColor,
                      color: getTextColorForBackground(space.backgroundColor) === 'text-gray-900' ? '#1f2937' : '#ffffff'
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Add New Card
                  </Button>

                  {/* Cards */}
                  {space.cards
                    .sort((a, b) => a.order - b.order)
                    .map((card) => (
                      <Card
                        key={card.id}
                        className={`bg-white border transition-all duration-200 ${
                          draggedCard === card.id ? 'opacity-50 scale-95' : ''
                        }`}
                        style={{ borderColor: space.borderColor }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, card.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, card.id)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{card.title}</CardTitle>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingCard(card)}
                                className="bg-transparent hover:bg-gray-100 border border-gray-300"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteCard(card.id)}
                                className="bg-transparent hover:bg-gray-100 text-red-600 hover:text-red-700 border border-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent>
                          <div className="grid grid-cols-3 gap-2">
                            {card.items.length === 0 ? (
                              <div className="col-span-3 text-center py-4">
                                <p className="text-sm text-gray-500 italic">No items yet</p>
                              </div>
                            ) : (
                              card.items.map((item) => (
                                <div 
                                  key={item.id} 
                                  className={`relative group rounded-lg p-2 transition-colors cursor-pointer ${
                                    item.type === 'collection' 
                                      ? 'bg-gradient-to-br from-purple-50 to-blue-50' 
                                      : ''
                                  }`}
                                  onClick={() => {
                                    if (item.type === 'collection') {
                                      setCurrentCollection(item);
                                      setCollectionPath([...collectionPath, item.id]);
                                      setShowCollectionDialog(true);
                                    }
                                  }}
                                >
                                    <div className="flex flex-col items-center text-center space-y-2 h-full justify-center">
                                      <div className="rounded-lg border flex items-center justify-center bg-white" style={{ borderColor: space.borderColor, width: '100px', height: '100px' }}>
                                        {item.type === 'collection' ? <FolderOpen className="w-8 h-8" style={{ color: space.borderColor, strokeWidth: 1 }} /> : 
                                          typeof item.icon === 'string' ? 
                                            <span className="text-2xl">{item.icon}</span> : 
                                            typeof item.icon === 'object' && item.contentType ?
                                              React.createElement(getContentTypeIcon(item.contentType), { className: "w-8 h-8", style: { color: space.borderColor, strokeWidth: 1 } }) :
                                              <span className="text-2xl">📄</span>
                                        }
                                      </div>
                                      <div className="w-full">
                                        <p className="text-xs font-medium leading-tight">{item.title}</p>
                                        {item.type === "collection" && (
                                          <div className="bg-purple-100 px-1 py-0.5 rounded text-purple-600 font-medium text-xs mt-1">
                                            {getCollectionItemCount(item)} {getCollectionItemCount(item) === 1 ? 'item' : 'items'}
                                          </div>
                                        )}
                                      </div>
                                      {item.type !== 'collection' && (
                                        <div className="flex gap-1 mt-2">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEditingItem(item);
                                              setCurrentCardId(card.id);
                                              setShowAddItemDialog(true);
                                            }}
                                            className="h-6 w-6 p-0 bg-transparent hover:bg-gray-100 border border-gray-300 text-gray-600 hover:text-gray-700"
                                          >
                                            <Edit className="w-3 h-3" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              deleteItem(card.id, item.id);
                                            }}
                                            className="h-6 w-6 p-0 bg-transparent hover:bg-gray-100 border border-red-300 text-red-600 hover:text-red-700"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                </div>
                              ))
                            )}
                          </div>

                          <div className="mt-4 pt-3 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => {
                                setCurrentCardId(card.id);
                                setShowAddItemDialog(true);
                              }}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Item
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </div>
          ) : (
            // Production Mode
            <div className="space-y-4">
              {space.cards.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏥</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Space is Empty</h3>
                  <p className="text-gray-600">Switch to Design Mode to start building your space.</p>
                </div>
              ) : (
                space.cards
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
                          {/* No edit/delete buttons in production mode */}
                        </div>
                      </CardHeader>
                      {card.isExpanded && (
                      <CardContent>
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
                                    ? 'bg-gradient-to-br from-purple-50 to-blue-50' 
                                    : ''
                                }`}
                                onClick={() => item.type === 'collection' && (setCurrentCollection(item), setCollectionPath([...collectionPath, item.id]), setShowCollectionDialog(true))}
                              >
                                <div className="flex flex-col items-center text-center space-y-2 h-full justify-center">
                                  <div className="rounded-lg border flex items-center justify-center bg-white" style={{ borderColor: space.borderColor, width: '100px', height: '100px' }}>
                                    {item.type === 'collection' ? <FolderOpen className="w-8 h-8" style={{ color: space.borderColor, strokeWidth: 1 }} /> : 
                                      typeof item.icon === 'string' ? 
                                        <span className="text-2xl">{item.icon}</span> : 
                                        typeof item.icon === 'object' && item.contentType ?
                                          React.createElement(getContentTypeIcon(item.contentType), { className: "w-8 h-8", style: { color: space.borderColor, strokeWidth: 1 } }) :
                                          <span className="text-2xl">📄</span>
                                    }
                                  </div>
                                  <div className="w-full">
                                    <h4 className="text-xs font-medium truncate">{item.title}</h4>
                                    <p className="text-xs text-gray-600 truncate leading-tight">{item.description}</p>
                                    {item.externalUrl && (
                                      <a 
                                        href={item.externalUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:underline block mt-1"
                                      >
                                        Open Link
                                      </a>
                                    )}
                                  </div>
                                  {item.type === "collection" && (
                                    <div className="flex items-center gap-1 text-xs text-purple-600 font-medium">
                                      <span className="bg-purple-100 px-2 py-1 rounded-full">
                                        {(item.children?.length || 0)} {(item.children?.length || 0) === 1 ? 'item' : 'items'}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                      )}
                    </Card>
                  ))
              )}
            </div>
          )}
        </div>

        {/* Add Card Dialog */}
        <Dialog open={showAddCardDialog} onOpenChange={setShowAddCardDialog}>
          <DialogContent className="max-w-sm mx-auto max-w-[calc(100vw-2rem)] w-[calc(100vw-2rem)]">
            <DialogHeader>
              <DialogTitle>Add New Card</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Card Title</label>
                <Input
                  placeholder="Enter card title"
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                />
              </div>
              {currentCollection && (
                <div>
                  <label className="text-sm font-medium">Card Color</label>
                  <div className="flex items-center gap-3 mt-2">
                    <input
                      type="color"
                      value={newCardColor}
                      onChange={(e) => setNewCardColor(e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <div className="flex-1">
                      <Input
                        value={newCardColor}
                        onChange={(e) => setNewCardColor(e.target.value)}
                        placeholder="#f3f4f6"
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Choose a color for this collection card
                  </p>
                </div>
              )}
              {!currentCollection && (
                <div className="text-sm text-gray-600">
                  Space cards automatically use the space theme color
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddCardDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={addCard} disabled={!newCardTitle.trim()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Card
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Item Dialog */}
        <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
          <DialogContent className="max-w-sm mx-auto max-w-[calc(100vw-2rem)] w-[calc(100vw-2rem)]">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Item Type</label>
                <Select value={newItemType} onValueChange={(value: 'content' | 'collection') => setNewItemType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="content">Content</SelectItem>
                    <SelectItem value="collection">Collection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Enter item title"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Enter description"
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  rows={2}
                />
              </div>

              {newItemType === "content" && (
                <>
                  <div>
                    <label className="text-sm font-medium">Content Type</label>
                    <Select value={newItemContentType} onValueChange={(value: ContentType) => {
                      setNewItemContentType(value);
                      setNewItemIcon(getContentTypeEmoji(value));
                    }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="podcast">Podcast</SelectItem>
                        <SelectItem value="infographic">Infographic</SelectItem>
                        <SelectItem value="guideline">Guideline</SelectItem>
                        <SelectItem value="article">Article</SelectItem>
                        <SelectItem value="external-link">External Link</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newItemContentType === 'external-link' ? (
                    <div>
                      <label className="text-sm font-medium">URL</label>
                      <Input
                        placeholder="https://example.com"
                        value={newItemExternalUrl}
                        onChange={(e) => setNewItemExternalUrl(e.target.value)}
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-sm font-medium">Upload Content</label>
                      <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-500 mt-1">File placeholder (not functional in demo)</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="public-toggle"
                      checked={newItemIsPublic}
                      onCheckedChange={setNewItemIsPublic}
                    />
                    <label htmlFor="public-toggle" className="text-sm font-medium">
                      Make this content public
                    </label>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddItemDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => currentCardId && addItem(currentCardId)} 
                  disabled={!newItemTitle.trim()}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Card Dialog */}
        {editingCard && (
          <Dialog open={!!editingCard} onOpenChange={() => setEditingCard(null)}>
            <DialogContent className="max-w-sm mx-auto max-w-[calc(100vw-2rem)] w-[calc(100vw-2rem)]">
              <DialogHeader>
                <DialogTitle>Edit Card</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={editingCard.title}
                    onChange={(e) => setEditingCard({ ...editingCard, title: e.target.value })}
                  />
                </div>
                {currentCollection && editingCard && 'color' in editingCard && (
                  <div>
                    <label className="text-sm font-medium">Card Color</label>
                    <div className="flex items-center gap-3 mt-2">
                      <input
                        type="color"
                        value={editingCard.color}
                        onChange={(e) => setEditingCard({ ...editingCard, color: e.target.value } as CollectionCard)}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <div className="flex-1">
                        <Input
                          value={editingCard.color}
                          onChange={(e) => setEditingCard({ ...editingCard, color: e.target.value } as CollectionCard)}
                          placeholder="#f3f4f6"
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Choose a color for this card within the collection
                    </p>
                  </div>
                )}
                {!currentCollection && (
                  <div className="text-sm text-gray-600">
                    Cards automatically use the space theme color
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingCard(null)}>
                    Cancel
                  </Button>
                  <Button onClick={() => updateCard(editingCard)}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Collection Dialog */}
        {currentCollection && (
          <Dialog open={showCollectionDialog} onOpenChange={(open) => {
            if (!open) {
              // Save changes when closing
              saveCollectionChanges();
              setCollectionPath([]);
            }
            setShowCollectionDialog(open);
          }}>
            <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto w-full max-w-[calc(100vw-2rem)] w-[calc(100vw-2rem)]">
              <DialogHeader>
                {isDesignMode ? (
                  <DialogTitle className="flex items-center gap-2">
                    <span className="text-2xl">📁</span>
                    {currentCollection.title}
                  </DialogTitle>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">{space.name}'s Collections</p>
                    <DialogTitle className="text-xl font-bold">
                      {currentCollection.title}
                    </DialogTitle>
                  </div>
                )}
                <p className="text-sm text-gray-600">{currentCollection.description}</p>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Collection Cards Management */}
                {currentCollection.children && currentCollection.children.length > 0 ? (
                  <div className="space-y-3">
                    {currentCollection.children
                      .sort((a, b) => a.order - b.order)
                      .map((card) => (
                        <Card key={card.id} className="bg-white border transition-all duration-200" style={{ borderColor: card.color }}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div 
                                className="flex items-center gap-2 cursor-pointer flex-1"
                                onClick={() => toggleCardExpansion(card.id)}
                              >
                                <CardTitle className="text-lg" style={{ color: card.color }}>{card.title}</CardTitle>
                                <Badge variant="secondary" className="text-xs">
                                  {card.items.length} {card.items.length === 1 ? 'item' : 'items'}
                                </Badge>
                                <ChevronRight 
                                  className={`w-4 h-4 transition-transform ${card.isExpanded ? 'rotate-90' : ''}`} 
                                />
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingCard(card)}
                                  className="bg-transparent hover:bg-gray-100 border border-gray-300"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setCurrentCollection({
                                      ...currentCollection,
                                      children: currentCollection.children?.filter(c => c.id !== card.id)
                                    });
                                  }}
                                  className="bg-transparent hover:bg-gray-100 text-red-600 hover:text-red-700 border border-red-300"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
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
                                        ? 'bg-gradient-to-br from-purple-50 to-blue-50' 
                                        : ''
                                    }`}
                                    onClick={() => {
                                    if (item.type === 'collection') {
                                      setCurrentCollection(item);
                                      setCollectionPath([...collectionPath, item.id]);
                                      setShowCollectionDialog(true);
                                    }
                                  }}
                                  >
                                    <div className="flex flex-col items-center text-center space-y-2 h-full justify-center">
                                      <div className="rounded-lg border flex items-center justify-center bg-white" style={{ borderColor: space.borderColor, width: '100px', height: '100px' }}>
                                        {item.type === 'collection' ? <FolderOpen className="w-8 h-8" style={{ strokeWidth: 1 }} /> : 
                                          typeof item.icon === 'string' ? 
                                            <span className="text-2xl">{item.icon}</span> : 
                                            typeof item.icon === 'object' && item.contentType ?
                                              React.createElement(getContentTypeIcon(item.contentType), { className: "w-8 h-8", style: { strokeWidth: 1 } }) :
                                              <span className="text-2xl">📄</span>
                                        }
                                      </div>
                                      <div className="w-full">
                                        <p className="text-xs font-medium truncate">{item.title}</p>
                                        <p className="text-xs text-gray-600 truncate leading-tight">{item.description}</p>
                                      </div>
                                      {item.type === "collection" && (
                                        <div className="flex items-center gap-1 text-xs text-purple-600 font-medium">
                                          <span className="bg-purple-100 px-2 py-1 rounded-full">
                                            {(item.children?.length || 0)} {(item.children?.length || 0) === 1 ? 'item' : 'items'}
                                          </span>
                                        </div>
                                      )}
                                      {item.type !== 'collection' && (
                                        <div className="flex gap-1 mt-2">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEditingItem(item);
                                              setCurrentCardId(card.id);
                                              setShowAddItemDialog(true);
                                            }}
                                            className="h-6 w-6 p-0 bg-transparent hover:bg-gray-100 border border-gray-300 text-gray-600 hover:text-gray-700"
                                          >
                                            <Edit className="w-3 h-3" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              // Delete item from card
                                              setCurrentCollection({
                                                ...currentCollection,
                                                children: currentCollection.children?.map(c => 
                                                  c.id === card.id 
                                                    ? { ...c, items: c.items?.filter(i => i.id !== item.id) }
                                                    : c
                                                )
                                              });
                                            }}
                                            className="h-6 w-6 p-0 bg-transparent hover:bg-gray-100 border border-red-300 text-red-600 hover:text-red-700"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="col-span-3 text-center py-4">
                                  <p className="text-xs text-gray-500 italic">No items yet</p>
                                </div>
                              )}
                            </div>

                            <div className="mt-4 pt-3 border-t">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                  setCurrentCardId(card.id);
                                  setShowAddItemDialog(true);
                                }}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Item
                              </Button>
                            </div>
                          </CardContent>
                          )}
                        </Card>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500 italic">No cards in this collection yet</p>
                  </div>
                )}

                {/* Add Card Button */}
                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full border hover:shadow-lg transition-all duration-200"
                    style={{ 
                      backgroundColor: space.backgroundColor,
                      borderColor: space.borderColor,
                      color: getTextColorForBackground(space.backgroundColor) === 'text-gray-900' ? '#1f2937' : '#ffffff'
                    }}
                    onClick={() => setShowAddCardDialog(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Card
                  </Button>
                </div>
              </div>

              <div className="flex justify-between gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={saveCollectionChanges}
                  disabled={isSaving}
                  className="bg-transparent hover:bg-gray-100 border border-gray-300"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => {
                  saveCollectionChanges();
                  setCollectionPath([]);
                  setShowCollectionDialog(false);
                }}>
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Space Settings Dialog */}
        <Dialog open={showSpaceSettingsDialog} onOpenChange={setShowSpaceSettingsDialog}>
          <DialogContent className="max-w-sm mx-auto max-w-[calc(100vw-2rem)] w-[calc(100vw-2rem)]">
            <DialogHeader>
              <DialogTitle>Space Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Space Title</label>
                <Input
                  placeholder="Enter space title"
                  value={space.name}
                  onChange={(e) => setSpace({ ...space, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Enter space description"
                  value={space.description}
                  onChange={(e) => setSpace({ ...space, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Space Background Color</label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="color"
                    value={space.backgroundColor}
                    onChange={(e) => {
                      const newBgColor = e.target.value;
                      setSpace({ 
                        ...space, 
                        backgroundColor: newBgColor,
                        borderColor: generateBorderColor(newBgColor)
                      });
                    }}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <div className="flex-1">
                    <Input
                      value={space.backgroundColor}
                      onChange={(e) => {
                        const newBgColor = e.target.value;
                        setSpace({ 
                          ...space, 
                          backgroundColor: newBgColor,
                          borderColor: generateBorderColor(newBgColor)
                        });
                      }}
                      placeholder="#ffffff"
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Choose any color to match your hospital brand
                </p>
              </div>
            </div>
            <div className="flex justify-between gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={clearSavedData}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Data
              </Button>
              <Button variant="outline" onClick={() => setShowSpaceSettingsDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}



