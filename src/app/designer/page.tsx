"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useRef } from "react";
import { Plus, Edit, Trash2, Move, Eye, EyeOff, Save, X, Image, Link, FileText, Video, Calendar, Users, Settings, Folder, FolderOpen, Palette, Layout } from "lucide-react";

type ContentItem = {
  id: string;
  type: 'content' | 'collection';
  title: string;
  description: string;
  icon: string;
  color: string;
  link?: string; // For content items
  children?: ContentItem[]; // For collections
  order: number;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type Template = {
  id: string;
  name: string;
  description: string;
  icon: string;
  content: ContentItem[];
};

export default function DesignerPage() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([
    {
      id: "demo-1",
      type: "content",
      title: "New Resident Onboarding",
      description: "Essential resources for new medical residents",
      icon: "👨‍⚕️",
      color: "bg-blue-50 border-blue-200",
      link: "https://example.com/onboarding",
      order: 1,
      visible: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "demo-2",
      type: "collection",
      title: "Clinical Guidelines",
      description: "Latest clinical protocols and procedures",
      icon: "📋",
      color: "bg-green-50 border-green-200",
      children: [
        {
          id: "c1",
          type: "content",
          title: "Protocol Database",
          description: "Access clinical protocols",
          icon: "🔗",
          color: "bg-gray-50 border-gray-200",
          link: "https://example.com/protocols",
          order: 1,
          visible: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "c2",
          type: "content",
          title: "Emergency Procedures",
          description: "Critical care guidelines",
          icon: "🚨",
          color: "bg-red-50 border-red-200",
          link: "https://example.com/emergency",
          order: 2,
          visible: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      order: 2,
      visible: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  const [templates] = useState<Template[]>([
    {
      id: "template-1",
      name: "New Resident Onboarding",
      description: "Complete onboarding template",
      icon: "👨‍⚕️",
      content: [
        {
          id: "t1",
          type: "content",
          title: "Welcome Package",
          description: "Essential information for new residents",
          icon: "📦",
          color: "bg-blue-50 border-blue-200",
          link: "#",
          order: 1,
          visible: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "t2",
          type: "collection",
          title: "Required Documents",
          description: "All necessary paperwork",
          icon: "📄",
          color: "bg-green-50 border-green-200",
          children: [],
          order: 2,
          visible: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    },
    {
      id: "template-2",
      name: "Clinical Skills Hub",
      description: "Medical skills and procedures",
      icon: "🩺",
      content: [
        {
          id: "t3",
          type: "content",
          title: "Procedure Videos",
          description: "Step-by-step tutorials",
          icon: "🎥",
          color: "bg-purple-50 border-purple-200",
          link: "#",
          order: 1,
          visible: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    }
  ]);

  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [activeTab, setActiveTab] = useState("design");
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemType, setNewItemType] = useState<ContentItem["type"]>("content");
  const [newItemIcon, setNewItemIcon] = useState("📄");
  const [newItemColor, setNewItemColor] = useState("bg-gray-50 border-gray-200");
  const [newItemLink, setNewItemLink] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);

  const dragRef = useRef<HTMLDivElement>(null);

  const addItem = () => {
    if (newItemTitle.trim()) {
      const newItem: ContentItem = {
        id: `item-${Date.now()}`,
        type: newItemType,
        title: newItemTitle.trim(),
        description: newItemDescription.trim(),
        icon: newItemIcon,
        color: newItemColor,
        link: newItemType === "content" ? newItemLink : undefined,
        children: newItemType === "collection" ? [] : undefined,
        order: contentItems.length + 1,
        visible: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setContentItems([...contentItems, newItem]);
      setNewItemTitle("");
      setNewItemDescription("");
      setNewItemType("content");
      setNewItemIcon("📄");
      setNewItemColor("bg-gray-50 border-gray-200");
      setNewItemLink("");
    }
  };

  const updateItem = (updatedItem: ContentItem) => {
    setContentItems(contentItems.map(item => 
      item.id === updatedItem.id 
        ? { ...updatedItem, updatedAt: new Date() }
        : item
    ));
    setEditingItem(null);
  };

  const deleteItem = (id: string) => {
    setContentItems(contentItems.filter(item => item.id !== id));
  };

  const toggleItemVisibility = (id: string) => {
    setContentItems(contentItems.map(item => 
      item.id === id 
        ? { ...item, visible: !item.visible, updatedAt: new Date() }
        : item
    ));
  };

  const applyTemplate = (template: Template) => {
    const templateItems = template.content.map((item, index) => ({
      ...item,
      id: `template-${Date.now()}-${index}`,
      order: contentItems.length + index + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    setContentItems([...contentItems, ...templateItems]);
    setShowTemplates(false);
  };

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetItemId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetItemId) return;

    const draggedIndex = contentItems.findIndex(c => c.id === draggedItem);
    const targetIndex = contentItems.findIndex(c => c.id === targetItemId);
    
    const newItems = [...contentItems];
    const [draggedItemData] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedItemData);
    
    // Update order numbers
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      order: index + 1
    }));
    
    setContentItems(updatedItems);
    setDraggedItem(null);
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      content: <FileText className="w-4 h-4" />,
      collection: <Folder className="w-4 h-4" />
    };
    return icons[type as keyof typeof icons] || <FileText className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 z-10">
          <h1 className="text-xl font-bold text-gray-900 text-center">Medical Education Designer</h1>
          <p className="text-sm text-gray-600 text-center mt-1">Create and manage content for your hospital</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
            <TabsTrigger value="design" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Design Mode
            </TabsTrigger>
            <TabsTrigger value="production" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Production Mode
            </TabsTrigger>
          </TabsList>

          {/* Design Mode */}
          <TabsContent value="design" className="p-4 space-y-4">
            {/* Add New Item Form */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add New Item
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Item title"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Description"
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  rows={2}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Select value={newItemType} onValueChange={(value: ContentItem["type"]) => setNewItemType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="content">Content</SelectItem>
                      <SelectItem value="collection">Collection</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Icon (emoji)"
                    value={newItemIcon}
                    onChange={(e) => setNewItemIcon(e.target.value)}
                    maxLength={2}
                  />
                </div>
                <Select value={newItemColor} onValueChange={setNewItemColor}>
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
                {newItemType === "content" && (
                  <Input
                    placeholder="Link URL (optional)"
                    value={newItemLink}
                    onChange={(e) => setNewItemLink(e.target.value)}
                  />
                )}
                <Button onClick={addItem} disabled={!newItemTitle.trim()} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </CardContent>
            </Card>

            {/* Templates */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Layout className="w-5 h-5" />
                  Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {templates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{template.icon}</span>
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-sm text-gray-600">{template.description}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => applyTemplate(template)}
                        className="flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Use
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Content Items */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Your Content</h3>
              {contentItems
                .sort((a, b) => a.order - b.order)
                .map((item) => (
                  <Card
                    key={item.id}
                    className={`${item.color} transition-all duration-200 ${
                      !item.visible ? 'opacity-50' : ''
                    } ${draggedItem === item.id ? 'opacity-50 scale-95' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, item.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-2xl">{item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{item.title}</h4>
                            <p className="text-sm text-gray-600 truncate">{item.description}</p>
                            {item.link && (
                              <p className="text-xs text-blue-600 truncate">{item.link}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingItem(item)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleItemVisibility(item.id)}
                          >
                            {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteItem(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {getTypeIcon(item.type)}
                          <span className="ml-1 capitalize">{item.type}</span>
                        </Badge>
                        {item.type === "collection" && item.children && (
                          <Badge variant="secondary" className="text-xs">
                            {item.children.length} items
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          {/* Production Mode */}
          <TabsContent value="production" className="p-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 mb-4">Production View</h3>
              {contentItems
                .filter(item => item.visible)
                .sort((a, b) => a.order - b.order)
                .map((item) => (
                  <Card key={item.id} className={`${item.color} transition-all duration-200`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-sm text-gray-600">{item.description}</p>
                          {item.link && (
                            <a 
                              href={item.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              {item.link}
                            </a>
                          )}
                        </div>
                        {item.type === "collection" && (
                          <FolderOpen className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Item Dialog */}
        {editingItem && (
          <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
            <DialogContent className="max-w-sm mx-auto">
              <DialogHeader>
                <DialogTitle>Edit Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={editingItem.description}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium">Icon</label>
                    <Input
                      value={editingItem.icon}
                      onChange={(e) => setEditingItem({ ...editingItem, icon: e.target.value })}
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Color</label>
                    <Select value={editingItem.color} onValueChange={(value) => setEditingItem({ ...editingItem, color: value })}>
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
                {editingItem.type === "content" && (
                  <div>
                    <label className="text-sm font-medium">Link URL</label>
                    <Input
                      value={editingItem.link || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, link: e.target.value })}
                      placeholder="Optional link"
                    />
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingItem(null)}>
                    Cancel
                  </Button>
                  <Button onClick={() => updateItem(editingItem)}>
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


