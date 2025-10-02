'use client';

import React, { useState, useImperativeHandle, forwardRef, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Bot, User, Sparkles, FolderOpen, FileText, Settings, Trash2, Check, ArrowLeft, X, PlayCircle, Mic, File, BarChart3, ClipboardList, BookOpen, Gamepad2, ExternalLink, Menu } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface AIDesignerProps {
  space: any;
  onSuggestion?: (suggestion: string) => void;
  onAddCard?: (cardData: any) => void;
  onDeleteCard?: (cardId: string) => void;
  onModifyCard?: (cardId: string, cardData: any) => void;
  onAddCollection?: (collectionData: any, targetCardId?: string) => void;
  onAddCollectionCards?: (collection: any, cards: any[]) => void;
  onDeleteCollection?: (collectionId: string) => void;
  onModifyCollection?: (collectionId: string, collectionData: any) => void;
  onAddContent?: (cardId: string, contentData: any) => void;
  onDeleteContent?: (cardId: string, contentId: string) => void;
  onModifyContent?: (cardId: string, contentId: string, contentData: any) => void;
  onModifySpace?: (spaceData: any) => void;
  onApplyTemplate?: (templateType: string, targetId?: string) => void;
  onOpenCollectionDesigner?: (collection: any) => void;
}

const AIDesigner = forwardRef<any, AIDesignerProps>(({ 
  space, 
  onSuggestion,
  onAddCard,
  onDeleteCard,
  onModifyCard,
  onAddCollection,
  onAddCollectionCards,
  onDeleteCollection,
  onModifyCollection,
  onAddContent,
  onDeleteContent,
  onModifyContent,
  onModifySpace,
  onApplyTemplate,
  onOpenCollectionDesigner
}, ref) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'How can I help?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [pendingActions, setPendingActions] = useState<any[]>([
    {
      type: 'initial_options',
      data: [
        { title: 'Suggest and add cards for your space', action: 'suggest_cards' },
        { title: 'Suggest and add a collection to your space', action: 'suggest_collections' },
        { title: 'Suggest and add content to your space', action: 'suggest_content' },
        { title: 'Modify your space', action: 'modify_space' }
      ],
      message: 'Choose an option to get started:'
    }
  ]);
  const [addedElements, setAddedElements] = useState<Set<string>>(new Set());
  const [currentWorkflow, setCurrentWorkflow] = useState<{
    type: 'collection' | 'cards' | 'content';
    collectionId?: string;
    cardIndex?: number;
    cards?: any[];
  } | null>(null);
  const [showMainOptions, setShowMainOptions] = useState(true);
  const [currentCollection, setCurrentCollection] = useState<any>(null);
  const [collectionMode, setCollectionMode] = useState(false);
  const [pendingCollectionData, setPendingCollectionData] = useState<any>(null);
  const [selectedCardForContent, setSelectedCardForContent] = useState<any>(null);

  // Helper function to get content type icon
  const getContentTypeIcon = (type: string) => {
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
    return icons[type as keyof typeof icons] || FileText;
  };


  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    onCollectionCreated: (collection: any) => {
      console.log('AI Designer: Collection created callback received:', collection);
      console.log('AI Designer: Pending collection data:', pendingCollectionData);
      if (pendingCollectionData) {
        // Show collection design follow-up with the actual collection
        const targetCard = space.cards?.find((card: any) => card.id === pendingCollectionData.cardId);
        const cardTitle = targetCard?.title || 'your card';
        
        console.log('AI Designer: Setting collection design options with collection:', collection);
        setPendingActions([{
          type: 'collection_design_options',
          data: {
            collection: collection,
            cardTitle: cardTitle
          },
          message: `Congratulations! Your collection "${collection.title}" is now added to "${cardTitle}" card. How do you want to design this collection?`
        }]);
        setPendingCollectionData(null);
      }
    }
  }));

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    console.log('Attempting to scroll to bottom...');
    
    // Use the direct container reference
    if (messagesContainerRef.current) {
      console.log('Scrolling container:', messagesContainerRef.current);
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      console.log('Scroll height:', messagesContainerRef.current.scrollHeight);
      console.log('Scroll top set to:', messagesContainerRef.current.scrollTop);
    }
    
    // Fallback: use scrollIntoView on the anchor
    if (messagesEndRef.current) {
      console.log('Using scrollIntoView fallback');
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  };

  useEffect(() => {
    console.log('useEffect triggered - messages:', messages.length, 'isTyping:', isTyping, 'pendingActions:', pendingActions.length);
    
    // Multiple attempts with different timings
    const timers = [
      setTimeout(() => {
        console.log('Timer 1 (10ms)');
        scrollToBottom();
      }, 10),
      setTimeout(() => {
        console.log('Timer 2 (100ms)');
        scrollToBottom();
      }, 100),
      setTimeout(() => {
        console.log('Timer 3 (300ms)');
        scrollToBottom();
      }, 300),
      setTimeout(() => {
        console.log('Timer 4 (600ms)');
        scrollToBottom();
      }, 600)
    ];
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [messages, isTyping, pendingActions]);

  const handleInitialOption = (action: string) => {
    setShowMainOptions(false);
    switch (action) {
      case 'suggest_cards':
        // Analyze the space context and generate AI-powered suggestions
        handleSendMessage('Analyze my space and suggest relevant medical cards based on the space title, description, and existing content. Consider the medical specialty and context.', true);
        break;
        
      case 'suggest_collections':
        // Show collection options including custom topic
        setPendingActions([
          {
            type: 'collection_options',
            data: [
              { title: 'AI-Generated Collections', action: 'ai_collections' },
              { title: 'Create collection about a specific topic', action: 'custom_topic' }
            ],
            message: 'How would you like to create your collection?'
          }
        ]);
        break;
        
      case 'suggest_content':
        // First, ask which card to add content to
        if (space.cards && space.cards.length > 0) {
          setPendingActions([{
            type: 'select_card_for_content',
            data: {
              cards: space.cards
            },
            message: 'Which card would you like to add content to?'
          }]);
        } else {
          // No cards available, suggest creating cards first
          setPendingActions([{
            type: 'no_cards_for_content',
            data: {},
            message: 'You need to create cards first before adding content. Would you like me to suggest some cards for your space?'
          }]);
        }
        break;
        
      case 'modify_space':
        // Show space modification options
        setPendingActions([{
          type: 'space_modification_options',
          data: [
            { title: 'Modify Space Name', action: 'modify_space_name' },
            { title: 'Modify Space Description', action: 'modify_space_description' },
            { title: 'Modify Space Color', action: 'modify_space_color' }
          ],
          message: 'What would you like to modify about your space?'
        }]);
        break;
        
      case 'ai_collections':
        // Show AI-generated collection suggestions
        handleSendMessage('Analyze my space and suggest relevant medical collections based on the space title, description, and existing content. Consider the medical specialty and context.', true);
        break;
        
      case 'custom_topic':
        // Ask for custom topic
        setPendingActions([{
          type: 'ask_topic',
          data: {},
          message: 'What is the topic of the collection you want to create?'
        }]);
        break;
    }
  };

  const handleBackToMainOptions = () => {
    setShowMainOptions(true);
    setCollectionMode(false);
    setCurrentCollection(null);
    setSelectedCardForContent(null);
    setPendingActions([
      {
        type: 'initial_options',
        data: [
          { title: 'Suggest and add cards for your space', action: 'suggest_cards' },
          { title: 'Suggest and add a collection to your space', action: 'suggest_collections' },
          { title: 'Suggest and add content to your space', action: 'suggest_content' },
          { title: 'Modify your space', action: 'modify_space' }
        ],
        message: 'Choose an option to get started:'
      }
    ]);
    setAddedElements(new Set());
    setCurrentWorkflow(null);
  };

  const handleSendMessage = async (message?: string, silent = false) => {
    const messageToSend = message || inputMessage.trim();
    if (!messageToSend) return;

    setShowMainOptions(false);
    
    // Only add user message to chat if not silent
    if (!silent) {
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: messageToSend,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
    }
    
    if (!message) {
      setInputMessage('');
    }
    setIsTyping(true);

    // Check for collection-related keywords to switch to collection mode
    const collectionManagementKeywords = ['manage collection', 'add cards to collection', 'collection cards', 'edit collection', 'manage my collection'];
    const collectionCreationKeywords = ['create collection', 'new collection', 'add collection', 'suggest collection', 'collection about'];
    
    const isCollectionManagementRequest = collectionManagementKeywords.some(keyword => 
      messageToSend.toLowerCase().includes(keyword.toLowerCase())
    );
    const isCollectionCreationRequest = collectionCreationKeywords.some(keyword => 
      messageToSend.toLowerCase().includes(keyword.toLowerCase())
    );

    if (isCollectionManagementRequest && !collectionMode) {
      // Find collections in the space
      const collections = space.cards?.flatMap((card: any) => 
        card.items?.filter((item: any) => item.type === 'collection') || []
      ) || [];

      if (collections.length > 0) {
        setCollectionMode(true);
        setPendingActions([{
          type: 'select_collection',
          data: { collections },
          message: 'Which collection would you like to manage?'
        }]);
        setIsTyping(false);
        return;
      }
    }

    if (isCollectionCreationRequest && !collectionMode) {
      // This is a collection creation request, let it proceed to the normal AI flow
      // Don't intercept it here
    }

    // Check if this is a custom topic response
    if (pendingActions.length > 0 && pendingActions[0].type === 'ask_topic') {
      // Create custom collection from topic
      const customCollection = {
        title: messageToSend,
        description: `A collection about ${messageToSend}`,
        type: 'collection'
      };
      
      // Add AI response message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Great! I'll create a collection about "${messageToSend}". Now let's choose where to add it.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      
      // Ask which card to add it to
      if (space.cards && space.cards.length > 0) {
        setPendingActions([{
          type: 'select_card_for_custom_collection',
          data: {
            collection: customCollection,
            cards: space.cards
          },
          message: `Which card would you like to add the "${customCollection.title}" collection to?`
        }]);
      } else {
        // No cards available, add to featured content
        if (onAddCollection) {
          onAddCollection(customCollection);
        }
      }
      setIsTyping(false);
      return;
    }

    // Check if this is a space name response
    if (pendingActions.length > 0 && pendingActions[0].type === 'ask_space_name') {
      // Update space name
      if (onModifySpace) {
        onModifySpace({ name: messageToSend });
      }
      
      // Add AI response message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Perfect! I've updated your space name to "${messageToSend}".`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setPendingActions([]);
      setIsTyping(false);
      return;
    }

    // Check if this is a space description response
    if (pendingActions.length > 0 && pendingActions[0].type === 'ask_space_description') {
      // Update space description
      if (onModifySpace) {
        onModifySpace({ description: messageToSend });
      }
      
      // Add AI response message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Great! I've updated your space description.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setPendingActions([]);
      setIsTyping(false);
      return;
    }

    // Call OpenAI API
    try {
      const response = await fetch('/api/ai-designer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          space: space
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const aiResponse = await response.json();
      console.log('AI Response received:', aiResponse);
      console.log('AI Actions:', aiResponse.actions);
      
      // Check if this is an AI description generation response
      if (pendingActions.length > 0 && pendingActions[0].type === 'ai_description') {
        console.log('AI description generation response received');
        
        // Add AI response message with the generated description
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: `Here's the AI-generated description for your space:\n\n"${aiResponse.message}"`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // Show options to apply or regenerate the description
        setPendingActions([{
          type: 'ai_description_review',
          data: {
            generatedDescription: aiResponse.message
          },
          message: 'Would you like to apply this description to your space?'
        }]);
        setIsTyping(false);
        return;
      }

      // Check if the AI response is directly a JSON array (for collection card suggestions)
      if (Array.isArray(aiResponse)) {
        console.log('AI returned array, processing collection card suggestions');
        // Find the current collection from pending actions
        const currentAction = pendingActions.find(action => action.type === 'collection_design_options');
        if (currentAction) {
          console.log('Found collection design options, setting card suggestions');
          setPendingActions([{
            type: 'suggest_collection_cards',
            data: {
              cards: aiResponse,
              collection: currentAction.data.collection
            },
            message: `Here are AI-generated card suggestions for your "${currentAction.data.collection.title}" collection:`
          }]);
        }
        setIsTyping(false);
        return;
      }
      
      // Check if the AI response contains JSON array in the message
      if (aiResponse.message) {
        try {
          const cardSuggestions = JSON.parse(aiResponse.message);
          if (Array.isArray(cardSuggestions)) {
            console.log('AI message contains JSON array, processing collection card suggestions');
            // Find the current collection from pending actions
            const currentAction = pendingActions.find(action => action.type === 'collection_design_options');
            if (currentAction) {
              console.log('Found collection design options, setting card suggestions from message');
              setPendingActions([{
                type: 'suggest_collection_cards',
                data: {
                  cards: cardSuggestions,
                  collection: currentAction.data.collection
                },
                message: `Here are AI-generated card suggestions for your "${currentAction.data.collection.title}" collection:`
              }]);
              setIsTyping(false);
              return;
            }
          }
        } catch (parseError) {
          console.log('AI message is not JSON, treating as regular message');
        }
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse.message,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Execute actions immediately if they are direct actions (like modify_space)
      if (aiResponse.actions && aiResponse.actions.length > 0) {
        console.log('Processing AI actions:', aiResponse.actions);
        const directActions = aiResponse.actions.filter((action: any) => 
          action.type === 'modify_space'
        );
        console.log('Direct actions found:', directActions);
        
        if (directActions.length > 0) {
          // Execute direct actions immediately
          console.log('Executing direct actions');
          directActions.forEach((action: any) => {
            console.log('Executing action:', action.type, action.data);
            executeAction(action.type, action.data);
          });
        } else {
          // Set other actions as pending
          console.log('Setting actions as pending');
          setPendingActions(aiResponse.actions);
        }
      } else {
        console.log('No actions to process');
        setPendingActions([]);
      }
      
      setIsTyping(false);
    } catch (error) {
      console.error('Error calling AI API:', error);
      
      // Show user-friendly error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I apologize, but I encountered an error while processing your request. This might be due to the request being too complex or a temporary service issue. Please try again with a simpler request.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setPendingActions([]);
      setIsTyping(false);
    }
  };

  const generateAIResponse = (userInput: string, space: any): { message: string; actions: any[] } => {
    const input = userInput.toLowerCase();
    const actions: any[] = [];
    
    // Card Management
    if (input.includes('add card') || input.includes('create card') || input.includes('new card') || input.includes('suggest card')) {
      const cardTemplates = [
        { title: 'Clinical Guidelines', color: '#3b82f6', type: 'guidelines' },
        { title: 'Patient Education', color: '#10b981', type: 'education' },
        { title: 'Research Updates', color: '#8b5cf6', type: 'research' },
        { title: 'Case Studies', color: '#f59e0b', type: 'cases' },
        { title: 'Medical Procedures', color: '#ef4444', type: 'procedures' }
      ];
      
      actions.push({
        type: 'suggest_cards',
        data: cardTemplates,
        message: 'I can create medical cards for your space. Here are some suggestions:'
      });
      
      return {
        message: 'I can help you add new medical cards to your space! Here are some specialized card templates I can create for you:',
        actions
      };
    }
    
    if (input.includes('delete card') || input.includes('remove card')) {
      if (space.cards && space.cards.length > 0) {
        actions.push({
          type: 'list_cards',
          data: space.cards,
          message: 'Which card would you like me to remove?'
        });
        
        return {
          message: 'I can help you remove cards from your space. Here are your current cards:',
          actions
        };
      } else {
        return {
          message: 'Your space doesn\'t have any cards to remove yet. Would you like me to help you create some?',
          actions: []
        };
      }
    }
    
    // Collection Management
    if (input.includes('add collection') || input.includes('create collection') || input.includes('new collection')) {
      const collectionTemplates = [
        { title: 'Emergency Protocols', description: 'Critical emergency procedures and protocols' },
        { title: 'Diagnostic Tools', description: 'Diagnostic procedures and tools reference' },
        { title: 'Treatment Guidelines', description: 'Comprehensive treatment protocols' },
        { title: 'Patient Resources', description: 'Educational materials for patients' },
        { title: 'Research Library', description: 'Latest medical research and studies' }
      ];
      
      actions.push({
        type: 'suggest_collections',
        data: collectionTemplates,
        message: 'Choose a collection template to create:'
      });
      
      return {
        message: 'I\'ll help you create a collection step by step! First, choose a collection template below. After creating it, I\'ll guide you through adding cards and content.',
        actions
      };
    }
    
    // Collection Card Suggestions
    if (input.includes('analyze') && input.includes('collection') && input.includes('cards')) {
      // This is a context-aware collection card suggestion request
      // The AI will return JSON with card suggestions
      return {
        message: 'I\'m analyzing your space and collection context to suggest relevant cards. Please wait...',
        actions: []
      };
    }
    
    // Content Management
    if (input.includes('add content') || input.includes('add item')) {
      const contentTemplates = [
        { title: 'Clinical Video', type: 'content', contentType: 'video', description: 'Educational medical videos' },
        { title: 'Medical Podcast', type: 'content', contentType: 'podcast', description: 'Audio content for learning' },
        { title: 'Research Document', type: 'content', contentType: 'document', description: 'PDF research papers' },
        { title: 'Infographic', type: 'content', contentType: 'infographic', description: 'Visual medical information' },
        { title: 'Clinical Guideline', type: 'content', contentType: 'guideline', description: 'Medical practice guidelines' },
        { title: 'Medical Article', type: 'content', contentType: 'article', description: 'Written medical content' },
        { title: 'Interactive Content', type: 'content', contentType: 'interactive-content', description: 'Engaging interactive materials' },
        { title: 'External Link', type: 'content', contentType: 'external-link', description: 'Links to external resources' },
        { title: 'Menu Button', type: 'content', contentType: 'menu-button', description: 'Navigation to other content' }
      ];
      
      actions.push({
        type: 'suggest_content',
        data: contentTemplates,
        message: 'I can add medical content to your cards. Here are some content types:'
      });
      
      return {
        message: 'I can help you add medical content to your cards! Here are some content types I can create:',
        actions
      };
    }
    
    // Space Modification
    if (input.includes('change color') || input.includes('space color') || input.includes('theme')) {
      const colorThemes = [
        { name: 'Medical Blue', color: '#3b82f6', description: 'Professional medical blue theme' },
        { name: 'Clinical Green', color: '#10b981', description: 'Calming clinical green theme' },
        { name: 'Emergency Red', color: '#ef4444', description: 'High-visibility emergency theme' },
        { name: 'Research Purple', color: '#8b5cf6', description: 'Academic research theme' },
        { name: 'Neutral Gray', color: '#6b7280', description: 'Professional neutral theme' }
      ];
      
      actions.push({
        type: 'suggest_colors',
        data: colorThemes,
        message: 'I can change your space theme. Here are some medical-themed color options:'
      });
      
      return {
        message: 'I can help you change your space theme! Here are some medical-themed color schemes:',
        actions
      };
    }
    
    if (input.includes('space title') || input.includes('rename space')) {
      const titleSuggestions = [
        'Emergency Department Protocols',
        'Clinical Guidelines Hub',
        'Medical Research Center',
        'Patient Care Resources',
        'Diagnostic Procedures',
        'Treatment Protocols',
        'Medical Education Center',
        'Clinical Decision Support'
      ];
      
      actions.push({
        type: 'suggest_titles',
        data: titleSuggestions,
        message: 'I can suggest medical space titles. Here are some options:'
      });
      
      return {
        message: 'I can help you rename your space! Here are some medical-focused title suggestions:',
        actions
      };
    }
    
    // Template Suggestions
    if (input.includes('template') || input.includes('suggest')) {
      actions.push({
        type: 'suggest_templates',
        data: {
          spaceTemplates: ['Emergency Department', 'Clinical Research', 'Patient Education', 'Diagnostic Center'],
          cardTemplates: ['Clinical Guidelines', 'Emergency Protocols', 'Research Updates', 'Patient Resources'],
          collectionTemplates: ['Emergency Procedures', 'Diagnostic Tools', 'Treatment Guidelines', 'Research Library']
        },
        message: 'I can suggest templates for your medical space. Here are some options:'
      });
      
      return {
        message: 'I can suggest medical templates for your space! Here are some specialized templates:',
        actions
      };
    }
    
    // General help
    return {
      message: 'I can help you manage your medical space! I can:\n\n• Add, remove, and modify cards\n• Create and organize collections\n• Add medical content (videos, documents, guidelines)\n• Change space colors and themes\n• Suggest medical templates\n\nWhat would you like me to help you with?',
      actions: []
    };
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAction = (action: any) => {
    switch (action.type) {
      case 'suggest_cards':
        // Show card suggestions with action buttons
        break;
      case 'suggest_collections':
        // Show collection suggestions with action buttons
        break;
      case 'suggest_content':
        // Show content suggestions with action buttons
        break;
      case 'suggest_colors':
        // Show color suggestions with action buttons
        break;
      case 'suggest_titles':
        // Show title suggestions with action buttons
        break;
      case 'suggest_templates':
        // Show template suggestions with action buttons
        break;
      case 'list_cards':
        // Show cards for deletion
        break;
      default:
        break;
    }
  };

  const executeAction = (actionType: string, data: any, elementId?: string) => {
    // Mark element as added
    if (elementId) {
      setAddedElements(prev => new Set([...prev, elementId]));
    }

    switch (actionType) {
      case 'add_card':
        if (onAddCard) {
          onAddCard(data);
          
          // If we're in a collection workflow, continue to content suggestions
          if (currentWorkflow && currentWorkflow.type === 'cards') {
            const updatedCards = [...(currentWorkflow.cards || []), data];
            setCurrentWorkflow({
              ...currentWorkflow,
              cards: updatedCards,
              type: 'content',
              cardIndex: updatedCards.length - 1
            });
            
            // Suggest content for the current card
            const contentSuggestions = [
              { title: 'Video Tutorial', type: 'content', contentType: 'video', cardId: data.id },
              { title: 'PDF Document', type: 'content', contentType: 'document', cardId: data.id },
              { title: 'External Link', type: 'content', contentType: 'external-link', cardId: data.id },
              { title: 'Interactive Content', type: 'content', contentType: 'interactive-content', cardId: data.id }
            ];
            
            setPendingActions([{
              type: 'suggest_content',
              data: contentSuggestions,
              message: `Perfect! I've added the "${data.title}" card. Now let's add some content to this card. Choose content types to add:`
            }]);
          }
        }
        break;
      case 'delete_card':
        if (onDeleteCard) onDeleteCard(data.id);
        break;
      case 'modify_card':
        if (onModifyCard) onModifyCard(data.id, data);
        break;
      case 'add_collection':
        // First, ask which card to add the collection to
        if (space.cards && space.cards.length > 0) {
          setPendingActions([{
            type: 'select_card_for_collection',
            data: {
              collection: data,
              cards: space.cards
            },
            message: `Which card would you like to add the "${data.title}" collection to?`
          }]);
        } else {
          // No cards available, add to featured content
          if (onAddCollection) {
            onAddCollection(data);
          }
        }
        break;
      case 'delete_collection':
        if (onDeleteCollection) onDeleteCollection(data.id);
        break;
      case 'modify_collection':
        if (onModifyCollection) onModifyCollection(data.id, data);
        break;
      case 'add_content':
        if (onAddContent) {
          onAddContent(data.cardId, data);
          
          // If we're in a content workflow, ask about next card
          if (currentWorkflow && currentWorkflow.type === 'content' && currentWorkflow.cards) {
            const currentCardIndex = currentWorkflow.cardIndex || 0;
            const nextCardIndex = currentCardIndex + 1;
            
            if (nextCardIndex < currentWorkflow.cards.length) {
              // Move to next card
              setCurrentWorkflow({
                ...currentWorkflow,
                cardIndex: nextCardIndex
              });
              
              const nextCard = currentWorkflow.cards[nextCardIndex];
              const contentSuggestions = [
                { title: 'Video Tutorial', type: 'content', contentType: 'video', cardId: nextCard.id },
                { title: 'PDF Document', type: 'content', contentType: 'document', cardId: nextCard.id },
                { title: 'External Link', type: 'content', contentType: 'external-link', cardId: nextCard.id },
                { title: 'Interactive Content', type: 'content', contentType: 'interactive-content', cardId: nextCard.id }
              ];
              
              setPendingActions([{
                type: 'suggest_content',
                data: contentSuggestions,
                message: `Great! Content added to the current card. Now let's add content to the "${nextCard.title}" card. Choose content types:`
              }]);
            } else {
              // Workflow complete
              setCurrentWorkflow(null);
              setPendingActions([{
                type: 'workflow_complete',
                data: { message: 'Collection setup complete!' },
                message: 'Excellent! Your collection is now fully set up with cards and content. You can continue adding more content or start a new collection.'
              }]);
            }
          }
        }
        break;
      case 'delete_content':
        if (onDeleteContent) onDeleteContent(data.cardId, data.contentId);
        break;
      case 'modify_content':
        if (onModifyContent) onModifyContent(data.cardId, data.contentId, data);
        break;
      case 'modify_space':
        if (onModifySpace) onModifySpace(data);
        break;
      case 'apply_template':
        if (onApplyTemplate) onApplyTemplate(data.templateType, data.targetId);
        break;
      case 'select_card_for_collection':
        // Add collection to the selected card
        if (onAddCollection) {
          console.log('AI Designer: Storing pending collection data:', {
            collection: data.collection,
            cardId: data.cardId
          });
          
          // Store the pending data for the callback
          setPendingCollectionData({
            collection: data.collection,
            cardId: data.cardId
          });
          
          onAddCollection(data.collection, data.cardId);
        }
        break;
      case 'ai_collections':
        // Show AI-generated collection suggestions
        handleSendMessage('Analyze my space and suggest relevant medical collections based on the space title, description, and existing content. Consider the medical specialty and context.');
        break;
      case 'custom_topic':
        // Ask for custom topic
        setPendingActions([{
          type: 'ask_topic',
          data: {},
          message: 'What is the topic of the collection you want to create?'
        }]);
        break;
      case 'create_custom_collection':
        // Create collection from custom topic
        if (onAddCollection) {
          onAddCollection(data.collection);
          
          // Find the target card to show in the follow-up message
          const targetCard = space.cards?.find((card: any) => card.id === data.cardId);
          const cardTitle = targetCard?.title || 'your card';
          
          // Show collection design follow-up
          setPendingActions([{
            type: 'collection_design_options',
            data: {
              collection: data.collection,
              cardTitle: cardTitle
            },
            message: `Congratulations! Your collection "${data.collection.title}" is now added to "${cardTitle}" card. How do you want to design this collection?`
          }]);
        }
        break;
      case 'select_card_for_custom_collection':
        // Add custom collection to the selected card
        if (onAddCollection) {
          onAddCollection(data.collection, data.cardId);
          
          // Find the target card to show in the follow-up message
          const targetCard = space.cards?.find((card: any) => card.id === data.cardId);
          const cardTitle = targetCard?.title || 'your card';
          
          // Show collection design follow-up
          setPendingActions([{
            type: 'collection_design_options',
            data: {
              collection: data.collection,
              cardTitle: cardTitle
            },
            message: `Congratulations! Your collection "${data.collection.title}" is now added to "${cardTitle}" card. How do you want to design this collection?`
          }]);
        }
        break;
      case 'add_collection_card':
        // Add a single card to the collection
        if (onAddCollectionCards) {
          console.log('AI Designer: Adding collection card:', { collection: data.collection, card: data.card });
          console.log('AI Designer: Current space:', space);
          
          // Find the actual collection in the space by title (fallback if ID is undefined)
          let actualCollection = space.cards?.flatMap((card: any) => 
            card.items?.filter((item: any) => item.id === data.collection.id) || []
          )?.[0];
          
          // If not found by ID, try to find by title
          if (!actualCollection) {
            console.log('AI Designer: Collection not found by ID, trying by title:', data.collection.title);
            actualCollection = space.cards?.flatMap((card: any) => 
              card.items?.filter((item: any) => item.type === 'collection' && item.title === data.collection.title) || []
            )?.[0];
          }
          
          console.log('AI Designer: Found collection in space:', actualCollection);
          
          if (actualCollection) {
            onAddCollectionCards(actualCollection, [data.card]);
            
            // Keep the card suggestions visible after adding a card
            // Find the current pending action to get the original card suggestions
            const currentAction = pendingActions.find(action => action.type === 'suggest_collection_cards');
            if (currentAction) {
              setPendingActions([{
                type: 'suggest_collection_cards',
                data: {
                  cards: currentAction.data.cards,
                  collection: actualCollection
                },
                message: `Great! I've added the "${data.card.title}" card to your "${actualCollection.title}" collection. You can add more cards:`
              }]);
            } else {
              // Fallback if we can't find the original suggestions
              setPendingActions([{
                type: 'card_added',
                data: {
                  card: data.card,
                  collection: actualCollection
                },
                message: `Great! I've added the "${data.card.title}" card to your "${actualCollection.title}" collection.`
              }]);
            }
          } else {
            console.error('AI Designer: Collection not found in space by ID or title:', data.collection.id, data.collection.title);
            setPendingActions([{
              type: 'error',
              data: { message: 'Collection not found. Please try again.' },
              message: 'Sorry, I couldn\'t find the collection. Please try creating it again.'
            }]);
          }
        }
        break;
      case 'select_collection':
        // Set the current collection and show collection management options
        setCurrentCollection(data.collection);
        setPendingActions([{
          type: 'collection_management',
          data: { collection: data.collection },
          message: `Now managing "${data.collection.title}". What would you like to do?`
        }]);
        break;
      case 'open_collection_designer':
        // Open the collection designer
        if (onOpenCollectionDesigner) {
          onOpenCollectionDesigner(data.collection);
        }
        break;
      case 'select_card_for_content':
        // Store the selected card and generate AI-powered content suggestions
        setSelectedCardForContent(data.card);
        const contentPrompt = `Analyze my space and suggest relevant medical content for the card "${data.card.title}". Consider the space context: ${space.name} - ${space.description}. Return content suggestions in the proper JSON format.`;
        handleSendMessage(contentPrompt, true);
        break;
      case 'no_cards_for_content':
        // Suggest creating cards first
        setPendingActions([{
          type: 'suggest_cards_first',
          data: {},
          message: 'Let me suggest some cards for your space first, then we can add content to them.'
        }]);
        break;
      case 'modify_space_name':
        // Ask for new space name
        setPendingActions([{
          type: 'ask_space_name',
          data: {},
          message: 'What would you like to name your space?'
        }]);
        break;
      case 'modify_space_description':
        // Show description options
        setPendingActions([{
          type: 'space_description_options',
          data: [
            { title: 'AI-Generated Description', action: 'ai_description' },
            { title: 'Write My Own Description', action: 'custom_description' }
          ],
          message: 'How would you like to create your space description?'
        }]);
        break;
      case 'modify_space_color':
        // Show color options
        setPendingActions([{
          type: 'space_color_options',
          data: [
            { title: 'AI Color Suggestions', action: 'ai_colors' },
            { title: 'Manual Color Selection', action: 'manual_colors' }
          ],
          message: 'How would you like to choose your space color?'
        }]);
        break;
      case 'ai_description':
        // Generate AI description
        setPendingActions([{
          type: 'ai_description',
          data: {},
          message: 'Generating AI description...'
        }]);
        const descriptionPrompt = `Generate a professional medical space description for: "${space.name}". Consider the medical specialty and context. Return only the description text, no JSON formatting.`;
        handleSendMessage(descriptionPrompt, true);
        break;
      case 'custom_description':
        // Ask for custom description
        setPendingActions([{
          type: 'ask_space_description',
          data: {},
          message: 'Please write your space description:'
        }]);
        break;
      case 'ai_colors':
        // Generate AI color suggestions based on logo if available
        let colorPrompt;
        if (space.logo) {
          colorPrompt = `The space "${space.name}" has a logo uploaded. Suggest 5-6 professional medical color schemes that would complement a medical logo. Consider colors that work well with typical medical branding (blues, greens, whites, grays). Return JSON format: {"message": "Here are color suggestions that complement your logo:", "actions": [{"type": "suggest_colors", "data": [{"name": "Color Name", "color": "#hexcode", "description": "Brief description"}]}]}`;
        } else {
          colorPrompt = `Suggest 5-6 professional medical color schemes for a space named "${space.name}". Return JSON format: {"message": "Here are color suggestions for your space:", "actions": [{"type": "suggest_colors", "data": [{"name": "Color Name", "color": "#hexcode", "description": "Brief description"}]}]}`;
        }
        handleSendMessage(colorPrompt, true);
        break;
      case 'manual_colors':
        // Show manual color picker
        const manualColors = [
          { name: 'Medical Blue', color: '#3b82f6', description: 'Professional medical blue' },
          { name: 'Clinical Green', color: '#10b981', description: 'Calming clinical green' },
          { name: 'Emergency Red', color: '#ef4444', description: 'High-visibility emergency red' },
          { name: 'Research Purple', color: '#8b5cf6', description: 'Academic research purple' },
          { name: 'Neutral Gray', color: '#6b7280', description: 'Professional neutral gray' },
          { name: 'Surgical Teal', color: '#14b8a6', description: 'Modern surgical teal' }
        ];
        setPendingActions([{
          type: 'suggest_colors',
          data: manualColors,
          message: 'Choose a color for your space:'
        }]);
        break;
      case 'modify_space':
        // Handle direct space modification from AI
        console.log('modify_space action received:', data);
        if (data.field && data.value) {
          console.log('Updating space:', data.field, 'to', data.value);
          if (onModifySpace) {
            onModifySpace({ [data.field]: data.value });
          }
          
          // Add AI response message
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content: `Perfect! I've updated your space ${data.field} to "${data.value}".`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMessage]);
          
          // Show back to main options button
          setPendingActions([{
            type: 'back_to_main_options',
            data: {},
            message: 'What would you like to do next?'
          }]);
        } else {
          console.log('Missing field or value in modify_space action:', data);
        }
        break;
      case 'apply_ai_description':
        // Apply the AI-generated description to the space
        if (onModifySpace && data.description) {
          onModifySpace({ description: data.description });
          
          // Add success message
          const successMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content: `Perfect! I've applied the AI-generated description to your space.`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, successMessage]);
          
          // Show back to main options
          setPendingActions([{
            type: 'back_to_main_options',
            data: {},
            message: 'What would you like to do next?'
          }]);
        }
        break;
      case 'regenerate_ai_description':
        // Regenerate the AI description
        setPendingActions([{
          type: 'ai_description',
          data: {},
          message: 'Generating a new AI description...'
        }]);
        const newDescriptionPrompt = `Generate a different professional medical space description for: "${space.name}". Make it unique and different from the previous one. Consider the medical specialty and context. Return only the description text, no JSON formatting.`;
        handleSendMessage(newDescriptionPrompt, true);
        break;
      case 'back_to_main_options':
        handleBackToMainOptions();
        break;
      default:
        break;
    }
    
    // Don't clear pending actions - keep them visible
    // setPendingActions([]);
  };

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 via-transparent to-indigo-600/20 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-purple-700/10 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-indigo-600/10 via-transparent to-purple-600/10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Header */}
        <div className="relative z-10 p-4 border-b border-purple-700/30 bg-purple-900/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-600/20 rounded-lg border border-purple-500/30">
                <Sparkles className="w-5 h-5 text-purple-300" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">StayCurrentMD Designer</h2>
                <p className="text-sm text-purple-200">Your intelligent design assistant</p>
              </div>
            </div>
          </div>
        </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="relative z-10 flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`p-2 rounded-full ${message.type === 'user' ? 'bg-blue-500/20 border border-blue-400/30' : 'bg-purple-500/20 border border-purple-400/30'}`}>
                {message.type === 'user' ? (
                  <User className="w-4 h-4 text-blue-300" />
                ) : (
                  <Bot className="w-4 h-4 text-purple-300" />
                )}
              </div>
              <Card className={`p-3 backdrop-blur-sm ${message.type === 'user' ? 'bg-blue-500/10 border-blue-400/30' : 'bg-white/10 border-purple-400/30'}`}>
                <p className="text-sm text-white">{message.content}</p>
                <p className="text-xs text-purple-200 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </Card>
            </div>
          </div>
        ))}
        
        
        {/* Action Buttons */}
        {pendingActions.length > 0 && (
          <div className="relative z-10 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-white">AI Suggestions</p>
              {!showMainOptions && (
                <Button
                  onClick={handleBackToMainOptions}
                  variant="outline"
                  size="sm"
                  className="text-purple-300 border-purple-400/50 hover:bg-purple-500/20 bg-purple-600/10"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Main Options
                </Button>
              )}
            </div>
            {pendingActions.map((action, index) => (
              <div key={index} className="space-y-2">
                <p className="text-sm font-medium text-white">{action.message}</p>
                <div className="grid grid-cols-1 gap-2">
              {action.type === 'suggest_cards' && action.data.map((card: any, cardIndex: number) => {
                const elementId = `card-${card.title}-${cardIndex}`;
                const isAdded = addedElements.has(elementId);
                
                return (
                  <Button
                    key={cardIndex}
                    onClick={() => executeAction('add_card', {
                      title: card.title,
                      color: card.color,
                      type: card.type
                    }, elementId)}
                    className={`w-full justify-start text-left h-auto p-3 border transition-all duration-200 ${
                      isAdded 
                        ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                    disabled={isAdded}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: card.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 break-words">{card.title}</div>
                      </div>
                      {isAdded && (
                        <div className="flex items-center gap-1 text-green-600">
                          <Check className="w-4 h-4" />
                          <span className="text-sm font-medium">Added</span>
                        </div>
                      )}
                    </div>
                  </Button>
                );
              })}
                  
                  {action.type === 'suggest_collections' && action.data.map((collection: any, colIndex: number) => {
                    const elementId = `collection-${collection.title}-${colIndex}`;
                    const isAdded = addedElements.has(elementId);
                    
                    return (
                      <Button
                        key={colIndex}
                        onClick={() => executeAction('add_collection', {
                          title: collection.title,
                          description: collection.description,
                          type: 'collection'
                        }, elementId)}
                        className={`w-full justify-start text-left h-auto p-3 border transition-all duration-200 ${
                          isAdded 
                            ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                        disabled={isAdded}
                      >
                        <div className="flex items-center gap-3">
                          <FolderOpen className="w-4 h-4 text-purple-600" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 break-words">{collection.title}</div>
                            <div className="text-sm text-gray-500 break-words whitespace-normal overflow-wrap-anywhere">{collection.description}</div>
                          </div>
                          {isAdded && (
                            <div className="flex items-center gap-1 text-green-600">
                              <Check className="w-4 h-4" />
                              <span className="text-sm font-medium">Added</span>
                            </div>
                          )}
                        </div>
                      </Button>
                    );
                  })}
                  
                  {action.type === 'suggest_content' && action.data.map((content: any, contentIndex: number) => {
                    const elementId = `content-${content.title}-${contentIndex}`;
                    const isAdded = addedElements.has(elementId);
                    
                    return (
                      <Button
                        key={contentIndex}
                        onClick={() => executeAction('add_content', {
                          cardId: selectedCardForContent?.id || 'default',
                          title: content.title,
                          type: content.type,
                          contentType: content.contentType
                        }, elementId)}
                        className={`w-full justify-start text-left h-auto p-3 border transition-all duration-200 ${
                          isAdded 
                            ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                        disabled={isAdded}
                      >
                        <div className="flex items-start gap-3">
                          {(() => {
                            const IconComponent = getContentTypeIcon(content.contentType || content.type);
                            return <IconComponent className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />;
                          })()}
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <div className="font-medium text-gray-900 break-words">{content.title}</div>
                            <div className="text-sm text-gray-500 capitalize break-words">
                              {content.contentType?.replace('-', ' ') || content.type}
                            </div>
                            {content.description && (
                              <div className="text-xs text-gray-400 break-words mt-1 whitespace-normal overflow-wrap-anywhere">{content.description}</div>
                            )}
                            {selectedCardForContent && (
                              <div className="text-xs text-gray-400 mt-1 break-words overflow-wrap-anywhere">Adding to: {selectedCardForContent.title}</div>
                            )}
                          </div>
                          {isAdded && (
                            <div className="flex items-center gap-1 text-green-600 flex-shrink-0">
                              <Check className="w-4 h-4" />
                              <span className="text-sm font-medium">Added</span>
                            </div>
                          )}
                        </div>
                      </Button>
                    );
                  })}
                  
                  {action.type === 'suggest_colors' && action.data.map((color: any, colorIndex: number) => {
                    const elementId = `color-${color.name}-${colorIndex}`;
                    const isAdded = addedElements.has(elementId);
                    
                    return (
                      <Button
                        key={colorIndex}
                        onClick={() => executeAction('modify_space', {
                          borderColor: color.color,
                          backgroundColor: color.color + '20'
                        }, elementId)}
                        className={`w-full justify-start text-left h-auto p-3 border transition-all duration-200 ${
                          isAdded 
                            ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                        disabled={isAdded}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: color.color }}
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{color.name}</div>
                          </div>
                          {isAdded && (
                            <div className="flex items-center gap-1 text-green-600">
                              <Check className="w-4 h-4" />
                              <span className="text-sm font-medium">Applied</span>
                            </div>
                          )}
                        </div>
                      </Button>
                    );
                  })}
                  
                  {action.type === 'suggest_titles' && action.data.map((title: string, titleIndex: number) => {
                    const elementId = `title-${title}-${titleIndex}`;
                    const isAdded = addedElements.has(elementId);
                    
                    return (
                      <Button
                        key={titleIndex}
                        onClick={() => executeAction('modify_space', {
                          title: title
                        }, elementId)}
                        className={`w-full justify-start text-left h-auto p-3 border transition-all duration-200 ${
                          isAdded 
                            ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                        disabled={isAdded}
                      >
                        <div className="flex items-center gap-3">
                          <Settings className="w-4 h-4 text-gray-600" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{title}</div>
                          </div>
                          {isAdded && (
                            <div className="flex items-center gap-1 text-green-600">
                              <Check className="w-4 h-4" />
                              <span className="text-sm font-medium">Applied</span>
                            </div>
                          )}
                        </div>
                      </Button>
                    );
                  })}
                  
                  {action.type === 'list_cards' && action.data.map((card: any, cardIndex: number) => {
                    const elementId = `delete-card-${card.id}-${cardIndex}`;
                    const isAdded = addedElements.has(elementId);
                    
                    return (
                      <div key={cardIndex} className="space-y-2">
                        <div className="text-sm text-gray-600 font-medium">
                          {action.message || "Do you mean this card?"}
                        </div>
                        <Button
                          onClick={() => executeAction('delete_card', { id: card.id }, elementId)}
                          className={`w-full justify-start text-left h-auto p-3 border transition-all duration-200 ${
                            isAdded 
                              ? 'bg-red-50 border-red-200 hover:bg-red-100' 
                              : 'bg-white border-red-200 hover:bg-red-50'
                          }`}
                          disabled={isAdded}
                        >
                          <div className="flex items-center gap-3">
                            <Trash2 className="w-4 h-4 text-red-600" />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{card.title}</div>
                              <div className="text-sm text-gray-500">{card.items?.length || 0} items</div>
                            </div>
                            {isAdded && (
                              <div className="flex items-center gap-1 text-red-600">
                                <Check className="w-4 h-4" />
                                <span className="text-sm font-medium">Deleted</span>
                              </div>
                            )}
                          </div>
                        </Button>
                      </div>
                    );
                  })}
                  
                  {action.type === 'initial_options' && action.data.map((option: any, optionIndex: number) => (
                    <Button
                      key={optionIndex}
                      onClick={() => {
                        // Clear the initial options
                        setPendingActions([]);
                        // Trigger the selected action
                        handleInitialOption(option.action);
                      }}
                      className="w-full justify-start text-left h-auto p-4 border transition-all duration-200 bg-white border-gray-200 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          {option.action === 'suggest_cards' && <FileText className="w-4 h-4 text-purple-600" />}
                          {option.action === 'suggest_collections' && <FolderOpen className="w-4 h-4 text-purple-600" />}
                          {option.action === 'suggest_content' && <FileText className="w-4 h-4 text-purple-600" />}
                          {option.action === 'modify_space' && <Settings className="w-4 h-4 text-purple-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{option.title}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                  
                  {action.type === 'suggest_space_modifications' && action.data.map((option: any, optionIndex: number) => (
                    <div key={optionIndex} className="space-y-2">
                      <div className="text-sm font-medium text-white">{option.title}</div>
                      {option.type === 'color' && (
                        <div className="flex gap-2 flex-wrap">
                          {option.data.map((color: string, colorIndex: number) => (
                            <Button
                              key={colorIndex}
                              onClick={() => executeAction('modify_space', { color: color })}
                              className="w-12 h-12 rounded-full border-2 border-gray-200 hover:border-gray-400"
                              style={{ backgroundColor: color }}
                              title={`Set space color to ${color}`}
                            />
                          ))}
                        </div>
                      )}
                      {option.type === 'title' && (
                        <div className="space-y-2">
                          {option.data.map((title: string, titleIndex: number) => (
                            <Button
                              key={titleIndex}
                              onClick={() => executeAction('modify_space', { title: title })}
                              className="w-full justify-start text-left h-auto p-3 border transition-all duration-200 bg-white border-gray-200 hover:bg-gray-50"
                            >
                              <div className="font-medium text-gray-900">{title}</div>
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {action.type === 'select_card_for_collection' && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-white">{action.message}</p>
                      <div className="grid grid-cols-1 gap-2">
                        {action.data.cards.map((card: any, cardIndex: number) => (
                          <Button
                            key={cardIndex}
                            onClick={() => executeAction('select_card_for_collection', {
                              collection: action.data.collection,
                              cardId: card.id
                            })}
                            className="w-full justify-start text-left h-auto p-3 border transition-all duration-200 bg-white border-gray-200 hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: card.color }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 break-words">{card.title}</div>
                                <div className="text-sm text-gray-500 break-words">{card.items?.length || 0} items</div>
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {action.type === 'select_card_for_custom_collection' && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-white">{action.message}</p>
                      <div className="grid grid-cols-1 gap-2">
                        {action.data.cards.map((card: any, cardIndex: number) => (
                          <Button
                            key={cardIndex}
                            onClick={() => executeAction('select_card_for_custom_collection', {
                              collection: action.data.collection,
                              cardId: card.id
                            })}
                            className="w-full justify-start text-left h-auto p-3 border transition-all duration-200 bg-white border-gray-200 hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: card.color }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 break-words">{card.title}</div>
                                <div className="text-sm text-gray-500 break-words">{card.items?.length || 0} items</div>
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {action.type === 'collection_options' && action.data.map((option: any, optionIndex: number) => (
                    <Button
                      key={optionIndex}
                      onClick={() => {
                        // Don't clear pending actions immediately - let handleInitialOption handle it
                        handleInitialOption(option.action);
                      }}
                      className="w-full justify-start text-left h-auto p-4 border transition-all duration-200 bg-white border-gray-200 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          {option.action === 'ai_collections' && <FolderOpen className="w-4 h-4 text-purple-600" />}
                          {option.action === 'custom_topic' && <FileText className="w-4 h-4 text-purple-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 break-words">{option.title}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                  
                  {action.type === 'ask_topic' && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 mb-3">{action.message}</p>
                      <p className="text-xs text-blue-600">Type your topic in the input field below and press Enter or click Send.</p>
                    </div>
                  )}
                  
                  {action.type === 'collection_design_options' && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-white">{action.message}</p>
                      <div className="grid grid-cols-1 gap-2">
                        <Button
                          onClick={() => {
                            // Generate AI-powered collection card suggestions based on context
                            const contextPrompt = `Suggest 6-8 medical cards for: ${action.data.collection.title}

Return JSON array:
[
  {"title": "Card Title", "color": "#hexcolor", "type": "card_type", "description": "Brief description"}
]`;

                            handleSendMessage(contextPrompt, true);
                          }}
                          className="w-full justify-start text-left h-auto p-3 border transition-all duration-200 bg-white border-gray-200 hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 break-words">Suggest relevant cards for this collection</div>
                              <div className="text-sm text-gray-500 break-words whitespace-normal overflow-wrap-anywhere">AI will analyze your space and collection context to suggest relevant cards</div>
                            </div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {action.type === 'suggest_collection_cards' && action.data.cards.map((card: any, cardIndex: number) => {
                    const elementId = `collection-card-${card.title}-${cardIndex}`;
                    const isAdded = addedElements.has(elementId);
                    
                    return (
                      <Button
                        key={cardIndex}
                        onClick={() => executeAction('add_collection_card', {
                          card: card,
                          collection: action.data.collection
                        }, elementId)}
                        className={`w-full justify-start text-left h-auto p-3 border transition-all duration-200 ${
                          isAdded 
                            ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                        disabled={isAdded}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: card.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 break-words">{card.title}</div>
                          </div>
                          {isAdded && (
                            <div className="flex items-center gap-1 text-green-600">
                              <Check className="w-4 h-4" />
                              <span className="text-sm font-medium">Added</span>
                            </div>
                          )}
                        </div>
                      </Button>
                    );
                  })}
                  
                  {action.type === 'card_added' && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Check className="w-5 h-5 text-green-600" />
                        <h3 className="font-medium text-green-800">Card Added!</h3>
                      </div>
                      <p className="text-sm text-green-700 mb-3">{action.message}</p>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setPendingActions([]);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          Continue
                        </Button>
                        <Button
                          onClick={() => {
                            setPendingActions([]);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  )}

                  {action.type === 'error' && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <X className="w-5 h-5 text-red-600" />
                        <h3 className="font-medium text-red-800">Error</h3>
                      </div>
                      <p className="text-sm text-red-700 mb-3">{action.message}</p>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setPendingActions([]);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white"
                          size="sm"
                        >
                          Try Again
                        </Button>
                        <Button
                          onClick={() => {
                            setPendingActions([]);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {action.type === 'select_collection' && action.data.collections.map((collection: any, index: number) => (
                    <Button
                      key={index}
                      onClick={() => executeAction('select_collection', { collection })}
                      className="w-full justify-start text-left h-auto p-3 border transition-all duration-200 bg-white border-gray-200 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <FolderOpen className="w-4 h-4 text-purple-600" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 break-words">{collection.title}</div>
                          <div className="text-sm text-gray-500 break-words whitespace-normal overflow-wrap-anywhere">
                            {collection.children?.length || 0} cards • {collection.description || 'No description'}
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}

                  {action.type === 'collection_management' && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-white">{action.message}</p>
                      <div className="grid grid-cols-1 gap-2">
                        <Button
                          onClick={() => executeAction('open_collection_designer', { collection: action.data.collection })}
                          className="w-full justify-start text-left h-auto p-3 border transition-all duration-200 bg-white border-gray-200 hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <Settings className="w-4 h-4 text-blue-600" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 break-words">Open Collection Designer</div>
                              <div className="text-sm text-gray-500 break-words whitespace-normal overflow-wrap-anywhere">Add, edit, and manage collection cards</div>
                            </div>
                          </div>
                        </Button>
                        
                        <Button
                          onClick={() => {
                            // Generate AI-powered collection card suggestions based on context
                            const contextPrompt = `Suggest 6-8 medical cards for: ${action.data.collection.title}

Return JSON array:
[
  {"title": "Card Title", "color": "#hexcolor", "type": "card_type", "description": "Brief description"}
]`;

                            handleSendMessage(contextPrompt, true);
                          }}
                          className="w-full justify-start text-left h-auto p-3 border transition-all duration-200 bg-white border-gray-200 hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-green-600" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 break-words">Suggest Collection Cards</div>
                              <div className="text-sm text-gray-500 break-words whitespace-normal overflow-wrap-anywhere">AI will analyze your space and suggest relevant cards for this collection</div>
                            </div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  )}

                  {action.type === 'select_card_for_content' && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-white">{action.message}</p>
                      <div className="grid grid-cols-1 gap-2">
                        {action.data.cards.map((card: any, cardIndex: number) => (
                          <Button
                            key={cardIndex}
                            onClick={() => executeAction('select_card_for_content', {
                              card: card
                            })}
                            className="w-full justify-start text-left h-auto p-3 border transition-all duration-200 bg-white border-gray-200 hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: card.color }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 break-words">{card.title}</div>
                                <div className="text-sm text-gray-500 break-words">{card.items?.length || 0} items</div>
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {action.type === 'no_cards_for_content' && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 mb-3">{action.message}</p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setPendingActions([]);
                            handleInitialOption('suggest_cards');
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          size="sm"
                        >
                          Suggest Cards
                        </Button>
                        <Button
                          onClick={() => {
                            setPendingActions([]);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {action.type === 'suggest_cards_first' && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800 mb-3">{action.message}</p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setPendingActions([]);
                            handleInitialOption('suggest_cards');
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          Suggest Cards
                        </Button>
                        <Button
                          onClick={() => {
                            setPendingActions([]);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {action.type === 'space_modification_options' && action.data.map((option: any, optionIndex: number) => (
                    <Button
                      key={optionIndex}
                      onClick={() => {
                        setPendingActions([]);
                        executeAction(option.action, {});
                      }}
                      className="w-full justify-start text-left h-auto p-4 border transition-all duration-200 bg-white border-gray-200 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Settings className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 break-words">{option.title}</div>
                        </div>
                      </div>
                    </Button>
                  ))}

                  {action.type === 'space_description_options' && action.data.map((option: any, optionIndex: number) => (
                    <Button
                      key={optionIndex}
                      onClick={() => {
                        setPendingActions([]);
                        executeAction(option.action, {});
                      }}
                      className="w-full justify-start text-left h-auto p-4 border transition-all duration-200 bg-white border-gray-200 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 break-words">{option.title}</div>
                        </div>
                      </div>
                    </Button>
                  ))}

                  {action.type === 'space_color_options' && action.data.map((option: any, optionIndex: number) => (
                    <Button
                      key={optionIndex}
                      onClick={() => {
                        setPendingActions([]);
                        executeAction(option.action, {});
                      }}
                      className="w-full justify-start text-left h-auto p-4 border transition-all duration-200 bg-white border-gray-200 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Settings className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 break-words">{option.title}</div>
                        </div>
                      </div>
                    </Button>
                  ))}

                  {action.type === 'ask_space_name' && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 mb-3">{action.message}</p>
                      <p className="text-xs text-blue-600">Type your new space name in the input field below and press Enter or click Send.</p>
                    </div>
                  )}

                  {action.type === 'ask_space_description' && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 mb-3">{action.message}</p>
                      <p className="text-xs text-blue-600">Type your space description in the input field below and press Enter or click Send.</p>
                    </div>
                  )}

                  {action.type === 'ai_description_review' && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 mb-3">{action.message}</p>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          onClick={() => executeAction('apply_ai_description', {
                            description: action.data.generatedDescription
                          })}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          size="sm"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Apply Description
                        </Button>
                        <Button
                          onClick={() => executeAction('regenerate_ai_description', {})}
                          variant="outline"
                          size="sm"
                          className="border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Different One
                        </Button>
                        <Button
                          onClick={() => executeAction('back_to_main_options', {})}
                          variant="outline"
                          size="sm"
                          className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {action.type === 'back_to_main_options' && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800 mb-3">{action.message}</p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => executeAction('back_to_main_options', {})}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back to Main Options
                        </Button>
                      </div>
                    </div>
                  )}

                  
                  {action.type === 'workflow_complete' && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Check className="w-5 h-5 text-green-600" />
                        <h3 className="font-medium text-green-800">Workflow Complete!</h3>
                      </div>
                      <p className="text-sm text-green-700 mb-3">{action.message}</p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setPendingActions([]);
                            setCurrentWorkflow(null);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          Start New Collection
                        </Button>
                        <Button
                          onClick={() => {
                            setPendingActions([]);
                            setCurrentWorkflow(null);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* AI Thinking Status - Always at bottom */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-2 max-w-[80%]">
              <div className="p-2 rounded-full bg-purple-500/20 border border-purple-400/30">
                <Bot className="w-4 h-4 text-purple-300" />
              </div>
              <Card className="p-3 bg-white/10 border-purple-400/30 backdrop-blur-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="relative z-10 p-4 border-t border-purple-700/30 bg-purple-900/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your medical space design..."
            className="flex-1 bg-white/10 border-purple-400/30 text-white placeholder-purple-200"
            disabled={isTyping}
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isTyping}
            className="bg-purple-600 hover:bg-purple-700 border-purple-500"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} className="h-1" />
      </div>
    </div>
  );
});

AIDesigner.displayName = 'AIDesigner';

export default AIDesigner;
