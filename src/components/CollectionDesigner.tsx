'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogPortal } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  FolderOpen, 
  FileText, 
  Settings,
  Palette,
  Type,
  Layout
} from 'lucide-react';

interface CollectionCard {
  id: string;
  title: string;
  color: string;
  items: any[];
  order: number;
  isExpanded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ContentItem {
  id: string;
  type: 'content' | 'collection';
  title: string;
  description?: string;
  icon?: any;
  isPublic?: boolean;
  children?: CollectionCard[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CollectionDesignerProps {
  collection: ContentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCollection: ContentItem) => void;
  onAddCard: (cardData: any) => void;
  onEditCard: (cardId: string, cardData: any) => void;
  onDeleteCard: (cardId: string) => void;
  onReorderCards: (cardIds: string[]) => void;
  showAddCardDialog: boolean;
  setShowAddCardDialog: (show: boolean) => void;
  showEditCardDialog: boolean;
  setShowEditCardDialog: (show: boolean) => void;
}

const CollectionDesigner: React.FC<CollectionDesignerProps> = ({
  collection,
  isOpen,
  onClose,
  onSave,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onReorderCards,
  showAddCardDialog,
  setShowAddCardDialog,
  showEditCardDialog,
  setShowEditCardDialog
}) => {
  const [activeTab, setActiveTab] = useState<'cards' | 'settings'>('cards');
  const [editingCard, setEditingCard] = useState<CollectionCard | null>(null);
  
  // Add Card Form
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardColor, setNewCardColor] = useState('#f3f4f6');
  
  // Edit Card Form
  const [editCardTitle, setEditCardTitle] = useState('');
  const [editCardColor, setEditCardColor] = useState('#f3f4f6');
  
  // Collection Settings
  const [collectionTitle, setCollectionTitle] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');

  useEffect(() => {
    if (collection) {
      setCollectionTitle(collection.title);
      setCollectionDescription(collection.description || '');
    }
  }, [collection]);

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      const cardData = {
        title: newCardTitle.trim(),
        color: newCardColor,
        order: (collection?.children?.length || 0) + 1
      };
      onAddCard(cardData);
      setNewCardTitle('');
      setNewCardColor('#f3f4f6');
      setShowAddCardDialog(false);
    }
  };

  const handleEditCard = () => {
    if (editingCard && editCardTitle.trim()) {
      onEditCard(editingCard.id, {
        title: editCardTitle.trim(),
        color: editCardColor
      });
      setShowEditCardDialog(false);
      setEditingCard(null);
      setEditCardTitle('');
      setEditCardColor('#f3f4f6');
    }
  };

  const openEditCardDialog = (card: CollectionCard) => {
    setEditingCard(card);
    setEditCardTitle(card.title);
    setEditCardColor(card.color);
    setShowEditCardDialog(true);
  };

  const handleSaveCollection = () => {
    if (collection) {
      const updatedCollection = {
        ...collection,
        title: collectionTitle,
        description: collectionDescription
      };
      onSave(updatedCollection);
    }
  };

  const moveCardUp = (cardId: string) => {
    if (!collection?.children) return;
    
    const currentIndex = collection.children.findIndex(card => card.id === cardId);
    if (currentIndex > 0) {
      const newOrder = [...collection.children];
      [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
      onReorderCards(newOrder.map(card => card.id));
    }
  };

  const moveCardDown = (cardId: string) => {
    if (!collection?.children) return;
    
    const currentIndex = collection.children.findIndex(card => card.id === cardId);
    if (currentIndex < collection.children.length - 1) {
      const newOrder = [...collection.children];
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
      onReorderCards(newOrder.map(card => card.id));
    }
  };

  if (!collection) return null;

  return (
    <>

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl mx-auto max-w-[calc(100vw-2rem)] w-[calc(100vw-2rem)] sm:max-w-4xl h-[80vh] flex flex-col z-[60]">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FolderOpen className="w-6 h-6 text-gray-800" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold">Collection Designer</DialogTitle>
                  <p className="text-sm text-gray-500">Design and manage your collection</p>
                </div>
              </div>
              <Button variant="outline" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 flex-shrink-0">
            <button
              onClick={() => setActiveTab('cards')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'cards'
                  ? 'border-gray-800 text-gray-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Layout className="w-4 h-4 inline mr-2" />
              Cards
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'settings'
                  ? 'border-gray-800 text-gray-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Settings
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'cards' && (
              <div className="space-y-6">
                {/* Add Card Button */}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Collection Cards</h3>
                  <Button onClick={() => {
                    console.log('Add Card button clicked, setting showAddCardDialog to true');
                    setShowAddCardDialog(true);
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Card
                  </Button>
                </div>

                {/* Cards List */}
                {collection.children && collection.children.length > 0 ? (
                  <div className="space-y-3">
                    {collection.children
                      .sort((a, b) => a.order - b.order)
                      .map((card, index) => (
                        <div
                          key={card.id}
                          className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          {/* Order Controls */}
                          <div className="flex flex-col gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => moveCardUp(card.id)}
                              disabled={index === 0}
                              className="h-6 w-6 p-0"
                            >
                              ↑
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => moveCardDown(card.id)}
                              disabled={index === collection.children!.length - 1}
                              className="h-6 w-6 p-0"
                            >
                              ↓
                            </Button>
                          </div>

                          {/* Card Info */}
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: card.color }}
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{card.title}</h4>
                            <p className="text-sm text-gray-500">
                              {card.items?.length || 0} items • Order: {card.order}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditCardDialog(card)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onDeleteCard(card.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No cards yet</h3>
                    <p className="text-gray-600 mb-4">Add your first card to get started</p>
                    <Button onClick={() => {
                      console.log('Add First Card button clicked, setting showAddCardDialog to true');
                      setShowAddCardDialog(true);
                    }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Card
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Collection Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Collection Title</label>
                    <Input
                      value={collectionTitle}
                      onChange={(e) => setCollectionTitle(e.target.value)}
                      placeholder="Enter collection title"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <Textarea
                      value={collectionDescription}
                      onChange={(e) => setCollectionDescription(e.target.value)}
                      placeholder="Enter collection description"
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveCollection}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </>
  );
};

export default CollectionDesigner;

