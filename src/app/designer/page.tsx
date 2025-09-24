"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useState, useRef } from "react";
import { Plus, Edit, Trash2, Move, Eye, EyeOff, Save, X, Image, Link, FileText, Video, Calendar, Users, Settings, Folder, FolderOpen, Palette, Layout, Upload, Play, Mic, FileImage, BookOpen, ExternalLink, ChevronRight, ChevronLeft } from "lucide-react";

type ContentType = 'video' | 'podcast' | 'infographic' | 'guideline' | 'article' | 'external-link';

type ContentItem = {
  id: string;
  type: 'content' | 'collection';
  title: string;
  description: string;
  contentType?: ContentType; // For content items
  icon: string;
  isPublic: boolean;
  fileUrl?: string; // For uploaded content
  externalUrl?: string; // For external links
  children?: ContentItem[]; // For collections
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

type SpaceCard = {
  id: string;
  title: string;
  color: string;
  items: ContentItem[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

type Space = {
  id: string;
  name: string;
  cards: SpaceCard[];
  currentCollection?: string; // For nested collections
};

export default function DesignerPage() {
  const [space, setSpace] = useState<Space>({
    id: "space-1",
    name: "Hospital Education Space",
    cards: []
  });

  const [isDesignMode, setIsDesignMode] = useState(true);
  const [editingCard, setEditingCard] = useState<SpaceCard | null>(null);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [showAddCardDialog, setShowAddCardDialog] = useState(false);
  const [currentCardId, setCurrentCardId] = useState<string | null>(null);
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Form states
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardColor, setNewCardColor] = useState("bg-blue-50 border-blue-200");
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
      video: <Play className="w-4 h-4" />,
      podcast: <Mic className="w-4 h-4" />,
      infographic: <FileImage className="w-4 h-4" />,
      guideline: <BookOpen className="w-4 h-4" />,
      article: <FileText className="w-4 h-4" />,
      'external-link': <ExternalLink className="w-4 h-4" />
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
    { value: "bg-blue-50 border-blue-200", label: "Blue" },
    { value: "bg-green-50 border-green-200", label: "Green" },
    { value: "bg-purple-50 border-purple-200", label: "Purple" },
    { value: "bg-orange-50 border-orange-200", label: "Orange" },
    { value: "bg-red-50 border-red-200", label: "Red" },
    { value: "bg-gray-50 border-gray-200", label: "Gray" }
  ];

  // Card management functions
  const addCard = () => {
    if (newCardTitle.trim()) {
      const newCard: SpaceCard = {
        id: `card-${Date.now()}`,
        title: newCardTitle.trim(),
        color: newCardColor,
        items: [],
        order: space.cards.length + 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setSpace({
        ...space,
        cards: [...space.cards, newCard]
      });
      setNewCardTitle("");
      setNewCardColor("bg-blue-50 border-blue-200");
      setShowAddCardDialog(false);
    }
  };

  const updateCard = (updatedCard: SpaceCard) => {
    setSpace({
      ...space,
      cards: space.cards.map(card => 
        card.id === updatedCard.id ? updatedCard : card
      )
    });
    setEditingCard(null);
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
      const newItem: ContentItem = {
        id: `item-${Date.now()}`,
        type: newItemType,
        title: newItemTitle.trim(),
        description: newItemDescription.trim(),
        contentType: newItemType === "content" ? newItemContentType : undefined,
        icon: newItemType === "content" ? getContentTypeEmoji(newItemContentType) : "📁",
        isPublic: newItemIsPublic,
        fileUrl: newItemType === "content" && newItemContentType !== 'external-link' ? newItemFileUrl : undefined,
        externalUrl: newItemType === "content" && newItemContentType === 'external-link' ? newItemExternalUrl : undefined,
        children: newItemType === "collection" ? [] : undefined,
        order: 0, // Will be set when adding to card
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setSpace({
        ...space,
        cards: space.cards.map(card => 
          card.id === cardId 
            ? { 
                ...card, 
                items: [...card.items, { ...newItem, order: card.items.length + 1 }],
                updatedAt: new Date()
              }
            : card
        )
      });

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
    }
  };

  const deleteItem = (cardId: string, itemId: string) => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 z-10">
          <h1 className="text-xl font-bold text-gray-900 text-center">{space.name}</h1>
          <p className="text-sm text-gray-600 text-center mt-1">Hospital Education Space</p>
          
          {/* Mode Toggle */}
          <div className="flex items-center justify-center mt-3">
            <Button
              variant={isDesignMode ? "default" : "outline"}
              onClick={() => setIsDesignMode(true)}
              className="rounded-r-none"
            >
              <Palette className="w-4 h-4 mr-2" />
              Design Mode
            </Button>
            <Button
              variant={!isDesignMode ? "default" : "outline"}
              onClick={() => setIsDesignMode(false)}
              className="rounded-l-none"
            >
              <Eye className="w-4 h-4 mr-2" />
              Production Mode
            </Button>
          </div>
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
                  <p className="text-gray-600 mb-6">Start building your hospital education space by adding your first card.</p>
                  <Button 
                    onClick={() => setShowAddCardDialog(true)}
                    className="flex items-center gap-2"
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
                    className="w-full flex items-center gap-2"
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
                        className={`${card.color} transition-all duration-200 ${
                          draggedCard === card.id ? 'opacity-50 scale-95' : ''
                        }`}
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
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteCard(card.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent>
                          <div className="space-y-2">
                            {card.items.length === 0 ? (
                              <p className="text-sm text-gray-500 italic text-center py-4">No items yet</p>
                            ) : (
                              card.items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-2 bg-white/50 rounded border">
                                  <div className="flex items-center gap-2 flex-1">
                                    <span className="text-lg">{item.icon}</span>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{item.title}</p>
                                      <p className="text-xs text-gray-600 truncate">{item.description}</p>
                                    </div>
                                    {item.type === "collection" && (
                                      <Badge variant="secondary" className="text-xs">
                                        {item.children?.length || 0}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => deleteItem(card.id, item.id)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
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
                    <Card key={card.id} className={`${card.color} transition-all duration-200`}>
                      <CardHeader>
                        <CardTitle className="text-lg">{card.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {card.items.length === 0 ? (
                            <p className="text-sm text-gray-500 italic text-center py-4">No content available</p>
                          ) : (
                            card.items.map((item) => (
                              <div key={item.id} className="flex items-center gap-3 p-3 bg-white/50 rounded border">
                                <span className="text-xl">{item.icon}</span>
                                <div className="flex-1">
                                  <h4 className="font-medium">{item.title}</h4>
                                  <p className="text-sm text-gray-600">{item.description}</p>
                                  {item.externalUrl && (
                                    <a 
                                      href={item.externalUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-600 hover:underline"
                                    >
                                      {item.externalUrl}
                                    </a>
                                  )}
                                </div>
                                {item.type === "collection" && (
                                  <FolderOpen className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>
          )}
        </div>

        {/* Add Card Dialog */}
        <Dialog open={showAddCardDialog} onOpenChange={setShowAddCardDialog}>
          <DialogContent className="max-w-sm mx-auto">
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
              <div>
                <label className="text-sm font-medium">Color Theme</label>
                <Select value={newCardColor} onValueChange={setNewCardColor}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getColorOptions().map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        {color.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
          <DialogContent className="max-w-sm mx-auto">
            <DialogHeader>
              <DialogTitle>Add New Item</DialogTitle>
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
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
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
            <DialogContent className="max-w-sm mx-auto">
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
                <div>
                  <label className="text-sm font-medium">Color Theme</label>
                  <Select value={editingCard.color} onValueChange={(value) => setEditingCard({ ...editingCard, color: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getColorOptions().map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          {color.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
      </div>
    </div>
  );
}



