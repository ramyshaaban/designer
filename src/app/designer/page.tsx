"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useRef } from "react";
import { Plus, Edit, Trash2, Move, Eye, EyeOff, Save, X, Image, Link, FileText, Video, Calendar, Users, Settings } from "lucide-react";

type ContentItem = {
  id: string;
  type: 'text' | 'image' | 'link' | 'video' | 'date' | 'list';
  content: string;
  metadata?: any;
};

type CardData = {
  id: string;
  title: string;
  description: string;
  type: "content" | "collection" | "template" | "announcement";
  icon: string;
  color: string;
  order: number;
  content: ContentItem[];
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export default function DesignerPage() {
  const [cards, setCards] = useState<CardData[]>([
    {
      id: "demo-1",
      title: "New Resident Onboarding",
      description: "Essential resources for new medical residents",
      type: "content",
      icon: "👨‍⚕️",
      color: "bg-blue-50 border-blue-200",
      order: 1,
      content: [
        { id: "c1", type: "text", content: "Welcome to our medical program! This card contains essential information for new residents." },
        { id: "c2", type: "link", content: "Resident Handbook", metadata: { url: "https://example.com/handbook" } },
        { id: "c3", type: "list", content: "Required Documents:\n• Medical License\n• Insurance Forms\n• Emergency Contacts" }
      ],
      visible: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "demo-2",
      title: "Clinical Guidelines",
      description: "Latest clinical protocols and procedures",
      type: "collection",
      icon: "📋",
      color: "bg-green-50 border-green-200",
      order: 2,
      content: [
        { id: "c4", type: "text", content: "Access the latest clinical guidelines and protocols." },
        { id: "c5", type: "link", content: "Protocol Database", metadata: { url: "https://example.com/protocols" } }
      ],
      visible: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  const [editingCard, setEditingCard] = useState<CardData | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardDescription, setNewCardDescription] = useState("");
  const [newCardType, setNewCardType] = useState<CardData["type"]>("content");
  const [newCardIcon, setNewCardIcon] = useState("📄");
  const [newCardColor, setNewCardColor] = useState("bg-gray-50 border-gray-200");

  const dragRef = useRef<HTMLDivElement>(null);

  const addCard = () => {
    if (newCardTitle.trim()) {
      const newCard: CardData = {
        id: `card-${Date.now()}`,
        title: newCardTitle.trim(),
        description: newCardDescription.trim(),
        type: newCardType,
        icon: newCardIcon,
        color: newCardColor,
        order: cards.length + 1,
        content: [],
        visible: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setCards([...cards, newCard]);
      setNewCardTitle("");
      setNewCardDescription("");
      setNewCardType("content");
      setNewCardIcon("📄");
      setNewCardColor("bg-gray-50 border-gray-200");
    }
  };

  const updateCard = (updatedCard: CardData) => {
    setCards(cards.map(card => 
      card.id === updatedCard.id 
        ? { ...updatedCard, updatedAt: new Date() }
        : card
    ));
    setEditingCard(null);
  };

  const deleteCard = (id: string) => {
    setCards(cards.filter(card => card.id !== id));
  };

  const toggleCardVisibility = (id: string) => {
    setCards(cards.map(card => 
      card.id === id 
        ? { ...card, visible: !card.visible, updatedAt: new Date() }
        : card
    ));
  };

  const addContentToCard = (cardId: string, content: ContentItem) => {
    setCards(cards.map(card => 
      card.id === cardId 
        ? { 
            ...card, 
            content: [...card.content, content],
            updatedAt: new Date()
          }
        : card
    ));
  };

  const updateContentInCard = (cardId: string, contentId: string, updatedContent: ContentItem) => {
    setCards(cards.map(card => 
      card.id === cardId 
        ? { 
            ...card, 
            content: card.content.map(item => 
              item.id === contentId ? updatedContent : item
            ),
            updatedAt: new Date()
          }
        : card
    ));
  };

  const deleteContentFromCard = (cardId: string, contentId: string) => {
    setCards(cards.map(card => 
      card.id === cardId 
        ? { 
            ...card, 
            content: card.content.filter(item => item.id !== contentId),
            updatedAt: new Date()
          }
        : card
    ));
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

    const draggedIndex = cards.findIndex(c => c.id === draggedCard);
    const targetIndex = cards.findIndex(c => c.id === targetCardId);
    
    const newCards = [...cards];
    const [draggedCardData] = newCards.splice(draggedIndex, 1);
    newCards.splice(targetIndex, 0, draggedCardData);
    
    // Update order numbers
    const updatedCards = newCards.map((card, index) => ({
      ...card,
      order: index + 1
    }));
    
    setCards(updatedCards);
    setDraggedCard(null);
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      content: <FileText className="w-4 h-4" />,
      collection: <Settings className="w-4 h-4" />,
      template: <Calendar className="w-4 h-4" />,
      announcement: <Users className="w-4 h-4" />
    };
    return icons[type as keyof typeof icons] || <FileText className="w-4 h-4" />;
  };

  const getContentIcon = (type: string) => {
    const icons = {
      text: <FileText className="w-4 h-4" />,
      image: <Image className="w-4 h-4" />,
      link: <Link className="w-4 h-4" />,
      video: <Video className="w-4 h-4" />,
      date: <Calendar className="w-4 h-4" />,
      list: <FileText className="w-4 h-4" />
    };
    return icons[type as keyof typeof icons] || <FileText className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Medical Education Designer</h1>
              <p className="text-lg text-gray-600">Create and manage educational content cards for your hospital</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant={isPreviewMode ? "default" : "outline"}
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="flex items-center gap-2"
              >
                {isPreviewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {isPreviewMode ? "Edit Mode" : "Preview Mode"}
              </Button>
              <Badge variant="secondary" className="text-sm">
                {cards.length} Cards
              </Badge>
            </div>
          </div>

          {/* Add New Card Form */}
          {!isPreviewMode && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add New Card
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Input
                    placeholder="Card title"
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    className="md:col-span-2"
                  />
                  <Textarea
                    placeholder="Description"
                    value={newCardDescription}
                    onChange={(e) => setNewCardDescription(e.target.value)}
                    className="md:col-span-2"
                    rows={2}
                  />
                  <Select value={newCardType} onValueChange={(value: CardData["type"]) => setNewCardType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="content">Content</SelectItem>
                      <SelectItem value="collection">Collection</SelectItem>
                      <SelectItem value="template">Template</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Icon (emoji)"
                    value={newCardIcon}
                    onChange={(e) => setNewCardIcon(e.target.value)}
                    maxLength={2}
                  />
                  <Select value={newCardColor} onValueChange={setNewCardColor}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bg-blue-50 border-blue-200">Blue</SelectItem>
                      <SelectItem value="bg-green-50 border-green-200">Green</SelectItem>
                      <SelectItem value="bg-purple-50 border-purple-200">Purple</SelectItem>
                      <SelectItem value="bg-orange-50 border-orange-200">Orange</SelectItem>
                      <SelectItem value="bg-red-50 border-red-200">Red</SelectItem>
                      <SelectItem value="bg-gray-50 border-gray-200">Gray</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={addCard} disabled={!newCardTitle.trim()} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Card
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards
            .sort((a, b) => a.order - b.order)
            .map((card) => (
              <Card
                key={card.id}
                className={`${card.color} transition-all duration-200 hover:shadow-lg ${
                  !card.visible ? 'opacity-50' : ''
                } ${draggedCard === card.id ? 'opacity-50 scale-95' : ''}`}
                draggable={!isPreviewMode}
                onDragStart={(e) => handleDragStart(e, card.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, card.id)}
                ref={dragRef}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{card.icon}</span>
                      <div>
                        <CardTitle className="text-lg">{card.title}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{card.description}</p>
                      </div>
                    </div>
                    {!isPreviewMode && (
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
                          onClick={() => toggleCardVisibility(card.id)}
                        >
                          {card.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
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
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {getTypeIcon(card.type)}
                      <span className="ml-1 capitalize">{card.type}</span>
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {card.content.length} items
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2">
                    {card.content.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No content yet</p>
                    ) : (
                      card.content.map((item) => (
                        <div key={item.id} className="flex items-start gap-2 p-2 bg-white/50 rounded border">
                          <div className="text-gray-500 mt-0.5">
                            {getContentIcon(item.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.content}</p>
                            {item.metadata?.url && (
                              <p className="text-xs text-blue-600 truncate">{item.metadata.url}</p>
                            )}
                          </div>
                          {!isPreviewMode && (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const updatedContent = { ...item, content: prompt("Edit content:", item.content) || item.content };
                                  if (updatedContent.content !== item.content) {
                                    updateContentInCard(card.id, item.id, updatedContent);
                                  }
                                }}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteContentFromCard(card.id, item.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {!isPreviewMode && (
                    <div className="mt-4 pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          const contentTypes = ['text', 'image', 'link', 'video', 'date', 'list'];
                          const type = prompt("Content type (text, image, link, video, date, list):", "text") || "text";
                          const content = prompt("Content:", "") || "";
                          if (content && contentTypes.includes(type)) {
                            const newContent: ContentItem = {
                              id: `content-${Date.now()}`,
                              type: type as ContentItem['type'],
                              content,
                              metadata: type === 'link' ? { url: prompt("URL:", "") || "" } : undefined
                            };
                            addContentToCard(card.id, newContent);
                          }
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Content
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>

        {/* Edit Card Dialog */}
        {editingCard && (
          <Dialog open={!!editingCard} onOpenChange={() => setEditingCard(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Card</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={editingCard.title}
                      onChange={(e) => setEditingCard({ ...editingCard, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Icon</label>
                    <Input
                      value={editingCard.icon}
                      onChange={(e) => setEditingCard({ ...editingCard, icon: e.target.value })}
                      maxLength={2}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={editingCard.description}
                    onChange={(e) => setEditingCard({ ...editingCard, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Select value={editingCard.type} onValueChange={(value: CardData["type"]) => setEditingCard({ ...editingCard, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="content">Content</SelectItem>
                        <SelectItem value="collection">Collection</SelectItem>
                        <SelectItem value="template">Template</SelectItem>
                        <SelectItem value="announcement">Announcement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Color Theme</label>
                    <Select value={editingCard.color} onValueChange={(value) => setEditingCard({ ...editingCard, color: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bg-blue-50 border-blue-200">Blue</SelectItem>
                        <SelectItem value="bg-green-50 border-green-200">Green</SelectItem>
                        <SelectItem value="bg-purple-50 border-purple-200">Purple</SelectItem>
                        <SelectItem value="bg-orange-50 border-orange-200">Orange</SelectItem>
                        <SelectItem value="bg-red-50 border-red-200">Red</SelectItem>
                        <SelectItem value="bg-gray-50 border-gray-200">Gray</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingCard(null)}>
                    Cancel
                  </Button>
                  <Button onClick={() => updateCard(editingCard)}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
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


