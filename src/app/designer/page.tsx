"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

type Card = {
  id: string;
  title: string;
  description?: string | null;
  type: "content" | "collection";
  order: number;
};

export default function DesignerPage() {
  const [cards, setCards] = useState<Card[]>([
    { id: "demo-1", title: "Demo Card 1", description: "This is a demo card", type: "content", order: 1 },
    { id: "demo-2", title: "Demo Card 2", description: "Another demo card", type: "collection", order: 2 }
  ]);
  const [title, setTitle] = useState("");

  const addCard = () => {
    if (title.trim()) {
      const newCard: Card = {
        id: `card-${Date.now()}`,
        title: title.trim(),
        description: null,
        type: "content",
        order: cards.length + 1
      };
      setCards([...cards, newCard]);
      setTitle("");
    }
  };

  const deleteCard = (id: string) => {
    setCards(cards.filter(card => card.id !== id));
  };

  const moveCard = (id: string, direction: 'up' | 'down') => {
    const currentIndex = cards.findIndex(card => card.id === id);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= cards.length) return;
    
    const newCards = [...cards];
    [newCards[currentIndex], newCards[newIndex]] = [newCards[newIndex], newCards[currentIndex]];
    setCards(newCards);
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Designer - No Authentication Required</h1>
      
      <div className="flex items-center gap-2">
        <Input 
          placeholder="New card title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addCard()}
        />
        <Button onClick={addCard} disabled={!title.trim()}>
          Add Card
        </Button>
      </div>
      
      <div className="space-y-2">
        {cards.map((card) => (
          <div key={card.id} className="flex items-center justify-between rounded border p-3 bg-white">
            <div>
              <div className="font-medium">{card.title}</div>
              <div className="text-xs text-gray-500">{card.type}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => moveCard(card.id, 'up')}
                disabled={cards.indexOf(card) === 0}
              >
                ↑
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => moveCard(card.id, 'down')}
                disabled={cards.indexOf(card) === cards.length - 1}
              >
                ↓
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => deleteCard(card.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-sm text-gray-600">
        Total cards: {cards.length}
      </div>
    </div>
  );
}


