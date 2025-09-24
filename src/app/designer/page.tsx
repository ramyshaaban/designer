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
import { Plus, Edit, Trash2, Move, Eye, EyeOff, Save, X, Image, Link, FileText, Video, Calendar, Users, Settings, Folder, FolderOpen, Palette, Layout, Upload, Play, Mic, FileImage, BookOpen, ExternalLink, ChevronRight, ChevronLeft, PlayCircle, ChevronUp, ChevronDown, Share, Heart, Search } from "lucide-react";

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
  // Crowdsourcing fields (for collections)
  likes?: number;
  isLiked?: boolean;
  shares?: number;
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
  // Social fields
  likes: number;
  isLiked: boolean;
  shares: number;
};

type CardTemplate = {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'education' | 'clinical' | 'reference' | 'training';
  items: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>[];
};

type CollectionTemplate = {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'education' | 'clinical' | 'reference' | 'training';
  cards: Omit<CollectionCard, 'id' | 'createdAt' | 'updatedAt'>[];
};

export default function DesignerPage() {
  const [space, setSpace] = useState<Space>({
    id: "space-1",
    name: "Space Title",
    description: "Customize your space by adding cards and content",
    backgroundColor: "#f8fafc", // Light blue background
    borderColor: "#93c5fd", // Blue border
    cards: [],
    likes: 0,
    isLiked: false,
    shares: 0
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
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showCollectionTemplateDialog, setShowCollectionTemplateDialog] = useState(false);
  const [isEditingSpaceTitle, setIsEditingSpaceTitle] = useState(false);
  const [showLogoUpload, setShowLogoUpload] = useState(false);
  const [currentCardId, setCurrentCardId] = useState<string | null>(null);
  const [currentCollection, setCurrentCollection] = useState<ContentItem | null>(null);
  const [collectionPath, setCollectionPath] = useState<string[]>([]); // Track path to current collection
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [collectionSearchQuery, setCollectionSearchQuery] = useState("");

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

  // Card Templates
  const cardTemplates: CardTemplate[] = [
    {
      id: 'new-resident',
      name: 'New Resident Onboarding',
      description: 'Essential resources for new residents',
      icon: Users,
      category: 'education',
      items: [
        {
          type: 'content',
          title: 'Orientation Video',
          description: 'Welcome and introduction to the hospital',
          contentType: 'video',
          icon: PlayCircle,
          isPublic: true,
          order: 0
        },
        {
          type: 'content',
          title: 'Hospital Policies',
          description: 'Important policies and procedures',
          contentType: 'guideline',
          icon: FileText,
          isPublic: true,
          order: 1
        },
        {
          type: 'content',
          title: 'Emergency Contacts',
          description: 'Quick reference for emergency situations',
          contentType: 'article',
          icon: BookOpen,
          isPublic: true,
          order: 2
        }
      ]
    },
    {
      id: 'medical-skills',
      name: 'Medical Skills Hub',
      description: 'Essential medical skills and procedures',
      icon: Calendar,
      category: 'clinical',
      items: [
        {
          type: 'content',
          title: 'Physical Examination Guide',
          description: 'Comprehensive physical examination techniques',
          contentType: 'video',
          icon: PlayCircle,
          isPublic: true,
          order: 0
        },
        {
          type: 'content',
          title: 'Diagnostic Procedures',
          description: 'Common diagnostic tests and procedures',
          contentType: 'guideline',
          icon: FileText,
          isPublic: true,
          order: 1
        },
        {
          type: 'content',
          title: 'Clinical Decision Making',
          description: 'Evidence-based clinical decision making process',
          contentType: 'infographic',
          icon: Image,
          isPublic: true,
          order: 2
        }
      ]
    },
    {
      id: 'rapid-reference',
      name: 'Rapid Reference',
      description: 'Quick access to essential information',
      icon: BookOpen,
      category: 'reference',
      items: [
        {
          type: 'content',
          title: 'Drug Interactions',
          description: 'Common drug interaction checker',
          contentType: 'external-link',
          icon: ExternalLink,
          isPublic: true,
          externalUrl: 'https://example.com/drug-interactions',
          order: 0
        },
        {
          type: 'content',
          title: 'Lab Values',
          description: 'Normal lab value ranges',
          contentType: 'infographic',
          icon: Image,
          isPublic: true,
          order: 1
        },
        {
          type: 'content',
          title: 'Medical Calculator',
          description: 'Common medical calculations',
          contentType: 'external-link',
          icon: ExternalLink,
          isPublic: true,
          externalUrl: 'https://example.com/medical-calculator',
          order: 2
        }
      ]
    },
    {
      id: 'training-modules',
      name: 'Training Modules',
      description: 'Continuing education and certification',
      icon: Video,
      category: 'training',
      items: [
        {
          type: 'content',
          title: 'CPR Certification',
          description: 'Basic life support training',
          contentType: 'video',
          icon: PlayCircle,
          isPublic: true,
          order: 0
        },
        {
          type: 'content',
          title: 'Infection Control',
          description: 'Preventing healthcare-associated infections',
          contentType: 'video',
          icon: PlayCircle,
          isPublic: true,
          order: 1
        },
        {
          type: 'content',
          title: 'Quiz: Safety Protocols',
          description: 'Test your knowledge of safety procedures',
          contentType: 'article',
          icon: BookOpen,
          isPublic: true,
          order: 2
        }
      ]
    }
  ];

  // Collection Templates
  const collectionTemplates: CollectionTemplate[] = [
    {
      id: 'medical-education',
      name: 'Medical Education Hub',
      description: 'Comprehensive medical education resources',
      icon: BookOpen,
      category: 'education',
      cards: [
        {
          title: 'High-Yield Summaries',
          color: '#d97706', // Dark amber
          items: [
            {
              type: 'content',
              title: 'Cardiology Summary',
              description: 'Essential cardiology concepts',
              contentType: 'article',
              icon: BookOpen,
              isPublic: true,
              order: 0,
              id: 'temp-1',
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              type: 'content',
              title: 'Pharmacology Quick Reference',
              description: 'Common medications and dosages',
              contentType: 'infographic',
              icon: Image,
              isPublic: true,
              order: 1,
              id: 'temp-2',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ],
          order: 0,
          isExpanded: false
        },
        {
          title: 'In-Depth Reviews',
          color: '#1e40af', // Dark blue
          items: [
            {
              type: 'content',
              title: 'Pathophysiology Deep Dive',
              description: 'Detailed disease mechanisms',
              contentType: 'video',
              icon: PlayCircle,
              isPublic: true,
              order: 0,
              id: 'temp-3',
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              type: 'content',
              title: 'Research Literature Review',
              description: 'Latest medical research findings',
              contentType: 'article',
              icon: BookOpen,
              isPublic: true,
              order: 1,
              id: 'temp-4',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ],
          order: 1,
          isExpanded: false
        },
        {
          title: 'Workup and Treatment',
          color: '#166534', // Dark green
          items: [
            {
              type: 'content',
              title: 'Diagnostic Algorithms',
              description: 'Step-by-step diagnostic processes',
              contentType: 'infographic',
              icon: Image,
              isPublic: true,
              order: 0,
              id: 'temp-5',
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              type: 'content',
              title: 'Treatment Protocols',
              description: 'Evidence-based treatment guidelines',
              contentType: 'guideline',
              icon: FileText,
              isPublic: true,
              order: 1,
              id: 'temp-6',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ],
          order: 2,
          isExpanded: false
        },
        {
          title: 'Technique Videos',
          color: '#be185d', // Dark pink
          items: [
            {
              type: 'content',
              title: 'Physical Examination Techniques',
              description: 'Proper examination procedures',
              contentType: 'video',
              icon: PlayCircle,
              isPublic: true,
              order: 0,
              id: 'temp-7',
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              type: 'content',
              title: 'Surgical Procedures',
              description: 'Step-by-step surgical techniques',
              contentType: 'video',
              icon: PlayCircle,
              isPublic: true,
              order: 1,
              id: 'temp-8',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ],
          order: 3,
          isExpanded: false
        },
        {
          title: 'Test your Knowledge',
          color: '#7c3aed', // Dark purple
          items: [
            {
              type: 'content',
              title: 'Practice Questions',
              description: 'MCQ practice for medical exams',
              contentType: 'article',
              icon: BookOpen,
              isPublic: true,
              order: 0,
              id: 'temp-9',
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              type: 'content',
              title: 'Case Studies Quiz',
              description: 'Interactive case-based learning',
              contentType: 'article',
              icon: BookOpen,
              isPublic: true,
              order: 1,
              id: 'temp-10',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ],
          order: 4,
          isExpanded: false
        }
      ]
    }
  ];

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
        cards: [],
        likes: 0,
        isLiked: false,
        shares: 0
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

  const filterCollectionCardsBySearch = (cards: CollectionCard[]) => {
    if (!collectionSearchQuery.trim()) return cards;
    
    return cards.filter(card => 
      card.title.toLowerCase().includes(collectionSearchQuery.toLowerCase()) ||
      card.items.some(item => 
        item.title.toLowerCase().includes(collectionSearchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(collectionSearchQuery.toLowerCase())
      )
    );
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

  const moveCardUp = (cardId: string) => {
    const cards = [...space.cards];
    const currentIndex = cards.findIndex(card => card.id === cardId);
    
    if (currentIndex > 0) {
      // Swap with the card above
      [cards[currentIndex], cards[currentIndex - 1]] = [cards[currentIndex - 1], cards[currentIndex]];
      
      // Update order values
      cards.forEach((card, index) => {
        card.order = index;
      });
      
      setSpace({
        ...space,
        cards: cards
      });
    }
  };

  const moveCardDown = (cardId: string) => {
    const cards = [...space.cards];
    const currentIndex = cards.findIndex(card => card.id === cardId);
    
    if (currentIndex < cards.length - 1) {
      // Swap with the card below
      [cards[currentIndex], cards[currentIndex + 1]] = [cards[currentIndex + 1], cards[currentIndex]];
      
      // Update order values
      cards.forEach((card, index) => {
        card.order = index;
      });
      
      setSpace({
        ...space,
        cards: cards
      });
    }
  };

  const toggleCollectionLike = () => {
    if (currentCollection) {
      setCurrentCollection({
        ...currentCollection,
        isLiked: !currentCollection.isLiked,
        likes: (currentCollection.likes || 0) + (currentCollection.isLiked ? -1 : 1)
      });
    }
  };

  const shareCollection = () => {
    if (currentCollection) {
      // Update share count
      setCurrentCollection({
        ...currentCollection,
        shares: (currentCollection.shares || 0) + 1
      });

      // Copy to clipboard or show share dialog
      const shareText = `Check out this collection: ${currentCollection.title} - ${currentCollection.description}`;
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Collection link copied to clipboard!');
      }).catch(() => {
        alert('Share: ' + shareText);
      });
    }
  };

  const toggleSpaceLike = () => {
    setSpace({
      ...space,
      isLiked: !space.isLiked,
      likes: space.isLiked ? space.likes - 1 : space.likes + 1
    });
  };

  const shareSpace = () => {
    // Update share count
    setSpace({
      ...space,
      shares: space.shares + 1
    });

    // Copy to clipboard or show share dialog
    const shareText = `Check out this space: ${space.name} - ${space.description}`;
    navigator.clipboard.writeText(shareText).then(() => {
      alert('Space link copied to clipboard!');
    }).catch(() => {
      alert('Share: ' + shareText);
    });
  };

  const applyTemplate = (template: CardTemplate) => {
    const newCard: SpaceCard = {
      id: `card-${Date.now()}`,
      title: template.name,
      items: template.items.map((item, index) => ({
        ...item,
        id: `item-${Date.now()}-${index}`,
        order: index,
        createdAt: new Date(),
        updatedAt: new Date()
      })),
      order: space.cards.length,
      isExpanded: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setSpace({
      ...space,
      cards: [...space.cards, newCard]
    });
    setShowTemplateDialog(false);
  };

  const applyCollectionTemplate = (template: CollectionTemplate) => {
    if (!currentCollection) return;

    // Add all template cards to the current collection
    const newCards: CollectionCard[] = template.cards.map((card, index) => ({
      ...card,
      id: `card-${Date.now()}-${index}`,
      items: card.items.map((item, itemIndex) => ({
        ...item,
        id: `item-${Date.now()}-${index}-${itemIndex}`,
        createdAt: new Date(),
        updatedAt: new Date()
      })),
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    // Update the current collection with the new cards
    setCurrentCollection({
      ...currentCollection,
      children: [...(currentCollection.children || []), ...newCards]
    });

    setShowCollectionTemplateDialog(false);
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
      const updateCollectionByPath = (cards: CollectionCard[], path: string[], updatedCollection: ContentItem): CollectionCard[] => {
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
    <div className="min-h-screen bg-gray-50">
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
          
          {/* Space Social Buttons - Only in Production Mode */}
          {!isDesignMode && (
            <div className="flex items-center justify-center gap-3 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSpaceLike}
                className={`flex items-center gap-1 px-3 py-1 bg-transparent hover:bg-gray-100 border ${
                  space.isLiked ? 'border-red-300 text-red-600' : 'border-gray-300 text-gray-600'
                }`}
                title={`${space.likes} likes`}
              >
                <Heart className={`w-4 h-4 ${space.isLiked ? 'fill-current' : ''}`} />
                <span className="text-sm">{space.likes}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={shareSpace}
                className="flex items-center gap-1 px-3 py-1 bg-transparent hover:bg-gray-100 border border-gray-300 text-gray-600"
                title={`${space.shares} shares`}
              >
                <Share className="w-4 h-4" />
                <span className="text-sm">{space.shares}</span>
              </Button>
            </div>
          )}

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
                // Empty Space - Add First Card or Use Template
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏥</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Space is Empty</h3>
                  <p className="text-gray-600 mb-6">Start building your space by adding your first card or using a template.</p>
                  
                  <div className="flex flex-col gap-3 max-w-xs mx-auto">
                    <Button 
                      onClick={() => setShowAddCardDialog(true)}
                      className={`flex items-center gap-2 border transition-all duration-200`}
                      style={{ 
                        backgroundColor: space.backgroundColor,
                        borderColor: space.borderColor,
                        color: getTextColorForBackground(space.backgroundColor) === 'text-gray-900' ? '#1f2937' : '#ffffff'
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Add Your First Card
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => setShowTemplateDialog(true)}
                      className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 transition-all duration-200"
                    >
                      <Layout className="w-4 h-4" />
                      Use Template
                    </Button>
                  </div>
                </div>
              ) : (
                // Cards Grid
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

                  {/* Use Template Button */}
                  <Button
                    onClick={() => setShowTemplateDialog(true)}
                    variant="outline"
                    className="w-full flex items-center gap-2 border hover:shadow-lg transition-all duration-200"
                    style={{ 
                      backgroundColor: space.backgroundColor,
                      borderColor: space.borderColor,
                      color: getTextColorForBackground(space.backgroundColor) === 'text-gray-900' ? '#1f2937' : '#ffffff'
                    }}
                  >
                    <Layout className="w-4 h-4" />
                    Use Template
                  </Button>

                  {/* Cards */}
                  {filterCardsBySearch(space.cards)
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
                                onClick={() => moveCardUp(card.id)}
                                disabled={space.cards.findIndex(c => c.id === card.id) === 0}
                                className="bg-transparent hover:bg-gray-100 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Move up"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveCardDown(card.id)}
                                disabled={space.cards.findIndex(c => c.id === card.id) === space.cards.length - 1}
                                className="bg-transparent hover:bg-gray-100 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Move down"
                              >
                                <ChevronDown className="w-4 h-4" />
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
                                      <div className="w-full h-12 flex flex-col justify-center">
                                        <p className="text-xs font-medium leading-tight line-clamp-2">{item.title}</p>
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
                  <div className="text-6xl mb-4">🏥</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Space is Empty</h3>
                  <p className="text-gray-600">Switch to Design Mode to start building your space.</p>
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
                                  <div className="w-full h-12 flex flex-col justify-center">
                                    <h4 className="text-xs font-medium line-clamp-2">{item.title}</h4>
                                    <p className="text-xs text-gray-600 line-clamp-1 leading-tight">{item.description}</p>
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

        {/* Template Selection Dialog */}
        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogContent className="max-w-md mx-auto max-w-[calc(100vw-2rem)] w-[calc(100vw-2rem)]">
            <DialogHeader>
              <DialogTitle>Choose a Card Template</DialogTitle>
              <p className="text-sm text-gray-600">Select a pre-built card template to get started quickly</p>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {cardTemplates.map((template) => (
                <div
                  key={template.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => applyTemplate(template)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <template.icon className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {template.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {template.items.length} items
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">Includes:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {template.items.slice(0, 3).map((item, index) => (
                            <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {item.title}
                            </span>
                          ))}
                          {template.items.length > 3 && (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              +{template.items.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Collection Template Selection Dialog */}
        <Dialog open={showCollectionTemplateDialog} onOpenChange={setShowCollectionTemplateDialog}>
          <DialogContent className="max-w-md mx-auto max-w-[calc(100vw-2rem)] w-[calc(100vw-2rem)]">
            <DialogHeader>
              <DialogTitle>Choose a Collection Template</DialogTitle>
              <p className="text-sm text-gray-600">Select a pre-built collection template with organized cards</p>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {collectionTemplates.map((template) => (
                <div
                  key={template.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => applyCollectionTemplate(template)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <template.icon className="w-5 h-5 text-purple-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {template.category}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {template.cards.length} cards
                        </span>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">Includes:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {template.cards.slice(0, 3).map((card, index) => (
                            <span key={index} className="text-xs bg-purple-100 px-2 py-1 rounded text-purple-700">
                              {card.title}
                            </span>
                          ))}
                          {template.cards.length > 3 && (
                            <span className="text-xs bg-purple-100 px-2 py-1 rounded text-purple-700">
                              +{template.cards.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowCollectionTemplateDialog(false)}>
                Cancel
              </Button>
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
                    <FolderOpen className="w-6 h-6 text-purple-600" />
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
                
                {/* Crowdsourcing Buttons */}
                <div className="flex items-center justify-center gap-3 mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleCollectionLike}
                    className={`flex items-center gap-1 px-3 py-1 bg-transparent hover:bg-gray-100 border ${
                      currentCollection.isLiked ? 'border-red-300 text-red-600' : 'border-gray-300 text-gray-600'
                    }`}
                    title={`${currentCollection.likes || 0} likes`}
                  >
                    <Heart className={`w-4 h-4 ${currentCollection.isLiked ? 'fill-current' : ''}`} />
                    <span className="text-sm">{currentCollection.likes || 0}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={shareCollection}
                    className="flex items-center gap-1 px-3 py-1 bg-transparent hover:bg-gray-100 border border-gray-300 text-gray-600"
                    title={`${currentCollection.shares || 0} shares`}
                  >
                    <Share className="w-4 h-4" />
                    <span className="text-sm">{currentCollection.shares || 0}</span>
                  </Button>
                  
                  {isDesignMode && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Delete collection from main space
                        setSpace({
                          ...space,
                          cards: space.cards.map(card => ({
                            ...card,
                            items: card.items.filter(item => item.id !== currentCollection.id)
                          }))
                        });
                        setShowCollectionDialog(false);
                      }}
                      className="flex items-center gap-1 px-3 py-1 bg-transparent hover:bg-gray-100 border border-red-300 text-red-600"
                      title="Delete collection"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Collection Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search collection content..."
                    value={collectionSearchQuery}
                    onChange={(e) => setCollectionSearchQuery(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-blue-500"
                  />
                </div>
                
                {/* Collection Cards Management */}
                {currentCollection.children && currentCollection.children.length > 0 ? (
                  <div className="space-y-3">
                    {filterCollectionCardsBySearch(currentCollection.children)
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
                              {isDesignMode && (
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
                              )}
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
                                      <div className="w-full h-12 flex flex-col justify-center">
                                        <p className="text-xs font-medium line-clamp-2">{item.title}</p>
                                        <p className="text-xs text-gray-600 line-clamp-1 leading-tight">{item.description}</p>
                                      </div>
                                      
                                      {item.type === "collection" && (
                                        <div className="flex items-center gap-1 text-xs text-purple-600 font-medium">
                                          <span className="bg-purple-100 px-2 py-1 rounded-full">
                                            {(item.children?.length || 0)} {(item.children?.length || 0) === 1 ? 'item' : 'items'}
                                          </span>
                                        </div>
                                      )}
                                      {item.type !== 'collection' && isDesignMode && (
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

                            {isDesignMode && (
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
                            )}
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
                {isDesignMode && (
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
                    
                    {/* Collection Template Button */}
                    <Button
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => setShowCollectionTemplateDialog(true)}
                    >
                      <Layout className="w-4 h-4 mr-2" />
                      Use Collection Template
                    </Button>
                  </div>
                )}
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



