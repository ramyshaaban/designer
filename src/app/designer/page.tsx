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
import { Plus, Edit, Trash2, Move, Eye, EyeOff, Save, X, Image, Link, FileText, Video, Calendar, Users, Settings, Folder, FolderOpen, Palette, Layout, Upload, Play, Mic, FileImage, BookOpen, ExternalLink, ChevronRight, ChevronLeft, PlayCircle, ChevronUp, ChevronDown, Share, Heart, Search, HelpCircle, ArrowRight, ArrowLeft, FileVideo, Headphones, File, BarChart3, ClipboardList, Newspaper, Gamepad2, Menu, Stethoscope, Star } from "lucide-react";
import { AI_CONFIG } from '@/config/ai';

type ContentType = 'video' | 'podcast' | 'document' | 'infographic' | 'guideline' | 'article' | 'interactive-content' | 'external-link' | 'menu-button';

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
  menuButtonTarget?: string; // For menu buttons - ID of target content
  children?: CollectionCard[]; // For collections - use CollectionCard type
  order: number;
  createdAt: Date;
  updatedAt: Date;
  // Crowdsourcing fields (for collections)
  likes?: number;
  isLiked?: boolean;
  shares?: number;
};

type Portal = {
  id: string;
  spaceId: string;
  spaceName: string;
  spaceDescription: string;
  spaceColor: string;
  spaceIcon: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

type SpaceCard = {
  id: string;
  title: string;
  items: ContentItem[];
  portals?: Portal[]; // For portals card
  color: string; // Hex color for the card
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

type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector or element ID
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: string; // Optional action to perform
  skipable?: boolean;
};

type OnboardingTour = {
  id: string;
  name: string;
  description: string;
  steps: OnboardingStep[];
};

export default function DesignerPage() {
  const [space, setSpace] = useState<Space>({
    id: "space-1",
    name: "Space Name",
    description: "Customize your space by adding cards and content",
    backgroundColor: "#f8fafc", // Light blue background
    borderColor: "#93c5fd", // Blue border
    cards: [],
    likes: 0,
    isLiked: false,
    shares: 0
  });


  // Debug useEffect to track space state changes
  useEffect(() => {
    console.log('Space state changed:', space);
    console.log('Cards with isExpanded:', space.cards.map(card => ({ id: card.id, title: card.title, isExpanded: card.isExpanded })));
  }, [space]);



  // Track changes to space
  const markAsChanged = () => {
    setHasUnsavedChanges(true);
  };

  // Onboarding functions
  const startOnboarding = (tourId: string) => {
    const tour = onboardingTours.find(t => t.id === tourId);
    if (tour) {
      setOnboardingTour(tour);
      setCurrentOnboardingStep(0);
      setShowOnboarding(true);
    }
  };

  // Contextual onboarding - trigger based on UI state
  const triggerContextualOnboarding = () => {
    if (!showOnboarding) return;

    // If space settings dialog is open, show space branding tour
    if (showSpaceSettingsDialog && onboardingTour?.id !== 'space-settings-tour') {
      const spaceSettingsTour = onboardingTours.find(t => t.id === 'space-settings-tour');
      if (spaceSettingsTour) {
        setOnboardingTour(spaceSettingsTour);
        setCurrentOnboardingStep(0);
        console.log('Switched to space settings tour');
      }
    }
    // If we're back to main space and not in any dialog, show main tour
    else if (!showSpaceSettingsDialog && !showTemplateDialog && !showCollectionTemplateDialog && onboardingTour?.id !== 'main-space-tour') {
      const mainTour = onboardingTours.find(t => t.id === 'main-space-tour');
      if (mainTour) {
        setOnboardingTour(mainTour);
        setCurrentOnboardingStep(0);
        console.log('Switched back to main space tour');
      }
    }
  };

  const nextOnboardingStep = () => {
    if (onboardingTour && currentOnboardingStep < onboardingTour.steps.length - 1) {
      setCurrentOnboardingStep(currentOnboardingStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const previousOnboardingStep = () => {
    if (currentOnboardingStep > 0) {
      setCurrentOnboardingStep(currentOnboardingStep - 1);
    }
  };

  const skipOnboarding = () => {
    completeOnboarding();
  };

  const completeOnboarding = () => {
    setShowOnboarding(false);
    setOnboardingTour(null);
    setCurrentOnboardingStep(0);
    setOnboardingCompleted(true);
    localStorage.setItem('designer-onboarding-completed', 'true');
  };

  const resetOnboarding = () => {
    localStorage.removeItem('designer-onboarding-completed');
    setOnboardingCompleted(false);
    setShowOnboarding(true);
    setOnboardingTour(onboardingTours[0]);
    setCurrentOnboardingStep(0);
    console.log('Tutorial restarted - starting main space tour');
  };

  // Separate AI Designer initialization functions
  const initializeSpaceAIDesigner = () => {
    setSpaceAiContext({});
    setShowSpaceAIDesigner(true);
    if (spaceAiMessages.length === 0) {
      // Context-aware welcome message based on space state
      const hasCards = space.cards.length > 0;
      const hasDescription = space.description && space.description.trim() !== '';
      const spaceContext = hasCards ? 
        `I can see you already have ${space.cards.length} cards in your space.` : 
        'I can see this is a new, empty space.';
      
      const missingInfo = [];
      if (!hasDescription) missingInfo.push('space description');
      if (!hasCards) missingInfo.push('specific medical specialty or target audience');
      
      const contextPrompt = missingInfo.length > 0 ? 
        `To provide the best suggestions, I'd love to know more about your ${missingInfo.join(' and ')}.` :
        'I can help you enhance your existing space or add new content.';
      
      const welcomeMessage = `Hello! I'm your AI Space Designer for your medical education space "${space.name}". 

${spaceContext} ${contextPrompt}

I specialize in creating SPACE-LEVEL organization by suggesting:

🎯 **Space Organization Cards**: 4-6 space cards that organize your hospital space logically (e.g., "Featured Content", "Featured Categories", "Other Resources", "Residents Resources")
📚 **Space Structure**: How to organize your entire medical education space
🎨 **Space-Level Templates**: Complete space layouts for different medical specialties

What would you like me to help you create? Tell me about your medical specialty, target audience, or specific learning goals!`;
      
      const message = {
        id: 'welcome',
        role: 'assistant' as const,
        content: welcomeMessage,
        timestamp: new Date()
      };
      setSpaceAiMessages([message]);
    }
  };

  const initializeCollectionAIDesigner = (targetId: string, targetTitle: string) => {
    setCollectionAiContext({ targetId, targetTitle });
    setShowCollectionAIDesigner(true);
    if (collectionAiMessages.length === 0) {
      const welcomeMessage = `Hello! I'm your AI Collection Designer for the "${targetTitle}" collection!

I specialize in creating COLLECTION-LEVEL organization by suggesting:

🎯 **Collection Cards**: 4-6 collection cards that categorize content within this specific medical topic (e.g., "Topic Overview", "Workup Algorithm", "Technique Videos", "Postoperative Care")
📚 **Content Organization**: How to structure content within this collection
🗂️ **Learning Paths**: Sequential content for progressive learning within this topic
🎨 **Topic-Specific Templates**: Detailed card structures for this medical specialty

What kind of collection are you building? Tell me about the medical topic or learning goals for this collection!`;
      
      const message = {
        id: 'welcome',
        role: 'assistant' as const,
        content: welcomeMessage,
        timestamp: new Date()
      };
      setCollectionAiMessages([message]);
    }
  };

  const initializeCardAIDesigner = (targetId: string, targetTitle: string) => {
    setCardAiContext({ targetId, targetTitle });
    setShowCardAIDesigner(true);
    if (cardAiMessages.length === 0) {
      const welcomeMessage = `Hello! I'm your AI Content Designer for the "${targetTitle}" card!

I specialize in creating CARD-LEVEL content by suggesting:

📹 **Video Content**: Surgical procedures, patient consultations, educational lectures
🎧 **Podcast Content**: Medical discussions, case studies, continuing education
📄 **Document Content**: Guidelines, protocols, research papers, study materials
📊 **Infographic Content**: Visual learning materials, statistics, medical concepts
🔗 **External Links**: Useful resources and tools
📁 **Collections**: Organized sub-collections within this card

What type of content would work best for this card? Tell me about your specialty or learning objectives!`;
      
      const message = {
        id: 'welcome',
        role: 'assistant' as const,
        content: welcomeMessage,
        timestamp: new Date()
      };
      setCardAiMessages([message]);
    }
  };

  // Separate send message functions for each AI Designer
  const sendSpaceAIMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content: message.trim(),
      timestamp: new Date()
    };

    setSpaceAiMessages(prev => [...prev, userMessage]);
    setSpaceAiInput('');
    setIsSpaceAiLoading(true);

      try {
        const response = await generateSpaceAIResponse(message);
      
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant' as const,
        content: response,
        timestamp: new Date()
      };

      setSpaceAiMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Space AI Error:', error);
      const errorMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error. Please try again or check your API configuration.',
        timestamp: new Date()
      };
      setSpaceAiMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSpaceAiLoading(false);
    }
  };

  const sendCollectionAIMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content: message.trim(),
      timestamp: new Date()
    };

    setCollectionAiMessages(prev => [...prev, userMessage]);
    setCollectionAiInput('');
    setIsCollectionAiLoading(true);

      try {
        const response = await generateCollectionAIResponse(message);
      
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant' as const,
        content: response,
        timestamp: new Date()
      };

      setCollectionAiMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Collection AI Error:', error);
      const errorMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error. Please try again or check your API configuration.',
        timestamp: new Date()
      };
      setCollectionAiMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsCollectionAiLoading(false);
    }
  };

  const sendCardAIMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content: message.trim(),
      timestamp: new Date()
    };

    setCardAiMessages(prev => [...prev, userMessage]);
    setCardAiInput('');
    setIsCardAiLoading(true);

      try {
        const response = await generateCardAIResponse(message);
      
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant' as const,
        content: response,
        timestamp: new Date()
      };

      setCardAiMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Card AI Error:', error);
      const errorMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error. Please try again or check your API configuration.',
        timestamp: new Date()
      };
      setCardAiMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsCardAiLoading(false);
    }
  };

  // Separate AI response generation functions
  const generateSpaceAIResponse = async (message: string): Promise<string> => {
      try {
        console.log('AI_CONFIG.OPENAI_API_KEY:', AI_CONFIG.OPENAI_API_KEY ? 'Present' : 'Missing');
        console.log('API Key length:', AI_CONFIG.OPENAI_API_KEY?.length || 0);
        console.log('AI_CONFIG:', AI_CONFIG);
        
        if (!AI_CONFIG.OPENAI_API_KEY) {
          throw new Error('OpenAI API key is not configured');
        }
        const systemPrompt = `You are an AI Space Designer for a medical education app called "StayCurrentMD Space Designer". 

**CURRENT SPACE CONTEXT:**
- Space Name: "${space.name}"
- Space Description: "${space.description || 'No description provided'}"
    - Space Color: ${space.borderColor}
- Current Cards: ${space.cards.length} cards
- Current Collections: ${space.cards.reduce((acc, card) => acc + card.items.filter(item => item.type === 'collection').length, 0)} collections
- Total Content Items: ${space.cards.reduce((acc, card) => acc + card.items.filter(item => item.type === 'content').length, 0)} items

**YOUR SPECIALTY: SPACE-LEVEL ORGANIZATION**
You specialize in creating SPACE CARDS that organize the entire hospital space logically. These are organizing units for the hospital space.

**SPACE CARD EXAMPLES:**
- "Featured Content" - Essential resources and protocols
- "Featured Categories" - Organized topics and specialties  
- "Other Resources" - Additional tools and references
- "Residents Resources" - Educational materials for residents
- "Quick Access" - Frequently used tools and links
- "Emergency Protocols" - Critical emergency procedures

**RESPONSE GUIDELINES:**
- Always suggest AT LEAST 4 space cards for any template
- Focus on SPACE-LEVEL organization, not topic-specific content
- Ask for missing information if space context is incomplete
- Provide specific, actionable space organization suggestions
- Use medical terminology appropriately
- Be encouraging and helpful

**CONTEXT ANALYSIS:**
${space.cards.length === 0 ? 'This is a new, empty space. Ask about the medical specialty, target audience, and learning goals.' : `This space has existing content. Analyze the current structure and suggest improvements or additions.`}

Current context: The user is working on the main space and needs help with SPACE-LEVEL organization.`;

        const response = await fetch(AI_CONFIG.OPENAI_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AI_CONFIG.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              { role: 'system', content: systemPrompt },
              ...spaceAiMessages.map(msg => ({ role: msg.role, content: msg.content })),
              { role: 'user', content: message }
            ],
            max_tokens: 1000,
            temperature: 0.7
          })
        });

        console.log('OpenAI API response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('OpenAI API error response:', errorText);
          throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('OpenAI API response data:', data);
        return data.choices[0].message.content;
      } catch (error) {
        console.error('OpenAI API error:', error);
        return `Sorry, I encountered an error: ${error.message}. Please try again.`;
      }
  };

  const generateCollectionAIResponse = async (message: string): Promise<string> => {
      try {
        const systemPrompt = `You are an AI Collection Designer for a medical education app called "StayCurrentMD Space Designer". 

**CURRENT SPACE CONTEXT:**
- Space Name: "${space.name}"
- Space Description: "${space.description || 'No description provided'}"
    - Space Color: ${space.borderColor}
- Current Cards: ${space.cards.length} cards
- Current Collections: ${space.cards.reduce((acc, card) => acc + card.items.filter(item => item.type === 'collection').length, 0)} collections
- Total Content Items: ${space.cards.reduce((acc, card) => acc + card.items.filter(item => item.type === 'content').length, 0)} items

**CURRENT COLLECTION:**
- Collection: "${collectionAiContext.targetTitle}"
- Collection ID: ${collectionAiContext.targetId}

**YOUR SPECIALTY: COLLECTION-LEVEL ORGANIZATION**
You specialize in creating COLLECTION CARDS that categorize content within a specific medical topic/collection. These are topic-specific categorization cards.

**COLLECTION CARD EXAMPLES:**
- "Topic Overview" - Comprehensive introduction to the medical topic
- "Workup Algorithm" - Diagnostic pathway and staging workup
- "Preoperative Planning" - Surgical indications and assessment
- "Technique Videos" - Surgical procedures and demonstrations
- "Postoperative Care" - Recovery protocols and monitoring
- "Patient Education Materials" - Family counseling and support resources
- "Key Articles" - Evidence-based literature and research
- "Assessment Tools" - Knowledge checks and evaluations

**RESPONSE GUIDELINES:**
- Always suggest AT LEAST 4 collection cards for any template
- Focus on COLLECTION-LEVEL organization within the specific topic
- Ask for missing information about the medical topic
- Provide specific, actionable collection organization suggestions
- Use medical terminology appropriately
- Be encouraging and helpful

Current context: The user is working on the "${collectionAiContext.targetTitle}" collection and needs help with COLLECTION-LEVEL organization.`;

        const response = await fetch(AI_CONFIG.OPENAI_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AI_CONFIG.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              { role: 'system', content: systemPrompt },
              ...collectionAiMessages.map(msg => ({ role: msg.role, content: msg.content })),
              { role: 'user', content: message }
            ],
            max_tokens: 1000,
            temperature: 0.7
          })
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
      } catch (error) {
        console.error('OpenAI API error:', error);
        return 'Sorry, I encountered an error. Please try again.';
      }
  };

  const generateCardAIResponse = async (message: string): Promise<string> => {
      try {
        const systemPrompt = `You are an AI Content Designer for a medical education app called "StayCurrentMD Space Designer". 

**CURRENT SPACE CONTEXT:**
- Space Name: "${space.name}"
- Space Description: "${space.description || 'No description provided'}"
    - Space Color: ${space.borderColor}
- Current Cards: ${space.cards.length} cards
- Current Collections: ${space.cards.reduce((acc, card) => acc + card.items.filter(item => item.type === 'collection').length, 0)} collections
- Total Content Items: ${space.cards.reduce((acc, card) => acc + card.items.filter(item => item.type === 'content').length, 0)} items

**CURRENT CARD:**
- Card: "${cardAiContext.targetTitle}"
- Card ID: ${cardAiContext.targetId}

**YOUR SPECIALTY: CARD-LEVEL CONTENT**
You specialize in creating CONTENT ITEMS within a specific card. These are individual content pieces like videos, articles, documents, etc.

**CONTENT TYPE EXAMPLES:**
- Video: Surgical procedures, patient consultations, educational lectures
- Podcast: Medical discussions, case studies, continuing education
- Document: Guidelines, protocols, research papers, study materials
- Infographic: Visual learning materials, statistics, medical concepts
- External Link: Useful resources and tools
- Collection: Organized sub-collections within this card

**RESPONSE GUIDELINES:**
- Focus on CARD-LEVEL content creation
- Suggest specific content items for this card
- Ask for missing information about the card's purpose
- Provide specific, actionable content suggestions
- Use medical terminology appropriately
- Be encouraging and helpful

Current context: The user is working on the "${cardAiContext.targetTitle}" card and needs help with CARD-LEVEL content creation.`;

        const response = await fetch(AI_CONFIG.OPENAI_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AI_CONFIG.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              { role: 'system', content: systemPrompt },
              ...cardAiMessages.map(msg => ({ role: msg.role, content: msg.content })),
              { role: 'user', content: message }
            ],
            max_tokens: 1000,
            temperature: 0.7
          })
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
      } catch (error) {
        console.error('OpenAI API error:', error);
        return 'Sorry, I encountered an error. Please try again.';
      }
  };

  // Separate suggestion application functions
  const applySpaceAISuggestion = (suggestion: string) => {
    console.log('Applying Space AI suggestion:', suggestion);
    
    // Add magic effect - show loading state
    setIsSpaceAiLoading(true);
    
    // Parse AI suggestions and create space cards based on the actual suggestion content
    // Try to extract card titles from the AI suggestion
    const cardTitles = extractCardTitlesFromSuggestion(suggestion);
    
    if (cardTitles.length > 0) {
      // Create cards based on AI suggestion
      createCardsFromAISuggestion(cardTitles);
    } else {
      // Fallback to keyword-based templates
      if (suggestion.toLowerCase().includes('neuroblastoma') || suggestion.toLowerCase().includes('pediatric') && suggestion.toLowerCase().includes('oncology')) {
        createNeuroblastomaTemplate();
      } else if (suggestion.toLowerCase().includes('emergency') || suggestion.toLowerCase().includes('trauma')) {
        createEmergencyMedicineTemplate();
      } else if (suggestion.toLowerCase().includes('surgery') || suggestion.toLowerCase().includes('surgical')) {
        createSurgeryTemplate();
      } else if (suggestion.toLowerCase().includes('cardiology') || suggestion.toLowerCase().includes('heart')) {
        createCardiologyTemplate();
      } else if (suggestion.toLowerCase().includes('pediatrics') || suggestion.toLowerCase().includes('pediatric')) {
        createPediatricsTemplate();
      } else if (suggestion.toLowerCase().includes('neurology') || suggestion.toLowerCase().includes('brain')) {
        createNeurologyTemplate();
      } else if (suggestion.toLowerCase().includes('clinical decision') || suggestion.toLowerCase().includes('decision making')) {
        createClinicalDecisionMakingTemplate();
      } else {
        // Default medical education template
        createDefaultMedicalTemplate();
      }
    }
    
    // Auto-close AI Designer after applying suggestion
    setTimeout(() => {
      setIsSpaceAiLoading(false);
      setShowSpaceAIDesigner(false);
      setSpaceAiMessages([]);
      setSpaceAiInput('');
    }, 1500); // 1.5 second delay to show the magic effect
  };

  // Helper function to check if a message contains actionable suggestions
  const isActionableSuggestion = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    
    // Exclude casual conversation patterns
    const casualPatterns = [
      'how are you', 'how do you do', 'hello', 'hi', 'thanks', 'thank you',
      'good morning', 'good afternoon', 'good evening', 'nice to meet you',
      'what can you do', 'what are you', 'who are you', 'tell me about yourself',
      'i am fine', 'i am good', 'i am well', 'doing well', 'doing good'
    ];
    
    if (casualPatterns.some(pattern => lowerMessage.includes(pattern))) {
      return false;
    }
    
    // Look for specific actionable patterns
    const actionablePatterns = [
      /^\d+\.\s*\*\*"[^"]+"\*\*:/,  // "1. **"Card Title"**:"
      /^\d+\.\s*\*\*[^*]+\*\*:/,    // "1. **Card Title**:"
      /^\d+\.\s*"[^"]+":/,          // "1. "Card Title":"
      /^\d+\.\s*[^:]+:/,            // "1. Card Title:"
      /^[•·\-\*]\s*[^:]+:/,         // "• Card Title:"
      /create\s+\d+\s+cards?/i,     // "create 5 cards"
      /add\s+\d+\s+cards?/i,        // "add 3 cards"
      /generate\s+\d+\s+cards?/i,   // "generate 4 cards"
      /suggest\s+\d+\s+cards?/i,    // "suggest 6 cards"
      /recommend\s+\d+\s+cards?/i,  // "recommend 2 cards"
      /here\s+are\s+\d+\s+cards?/i, // "here are 5 cards"
      /i\s+suggest\s+\d+\s+cards?/i, // "i suggest 3 cards"
      /i\s+recommend\s+\d+\s+cards?/i, // "i recommend 4 cards"
      /template\s+with\s+\d+\s+cards?/i, // "template with 5 cards"
      /structure\s+with\s+\d+\s+cards?/i, // "structure with 3 cards"
    ];
    
    // Check for actionable patterns
    const hasActionablePattern = actionablePatterns.some(pattern => pattern.test(message));
    
    // Also check for content-specific patterns
    const contentPatterns = [
      /create\s+content/i,
      /add\s+content/i,
      /generate\s+content/i,
      /suggest\s+content/i,
      /here\s+are\s+some\s+content/i,
      /i\s+suggest\s+adding/i,
      /i\s+recommend\s+adding/i,
      /video\s+content/i,
      /article\s+content/i,
      /document\s+content/i,
      /guideline\s+content/i,
    ];
    
    const hasContentPattern = contentPatterns.some(pattern => pattern.test(message));
    
    return hasActionablePattern || hasContentPattern;
  };

  // Helper function to extract card titles from AI suggestion
  const extractCardTitlesFromSuggestion = (suggestion: string): string[] => {
    console.log('Parsing AI suggestion:', suggestion);
    const cardTitles: string[] = [];
    
    // Look for patterns like "1. **"Card Title"**:", "• Card Title", "- Card Title", etc.
    const patterns = [
      /^\d+\.\s*\*\*"([^"]+)"\*\*:/gm,  // "1. **"Card Title"**:"
      /^\d+\.\s*\*\*([^*]+)\*\*:/gm,    // "1. **Card Title**:"
      /^\d+\.\s*"([^"]+)":/gm,          // "1. "Card Title":"
      /^\d+\.\s*(.+?):/gm,              // "1. Card Title:"
      /^\d+\.\s*(.+)$/gm,               // "1. Card Title"
      /^[•·]\s*(.+)$/gm,                // "• Card Title"
      /^-\s*(.+)$/gm,                   // "- Card Title"
      /^\*\s*(.+)$/gm,                  // "* Card Title"
    ];
    
    for (const pattern of patterns) {
      const matches = suggestion.match(pattern);
      if (matches) {
        console.log('Found matches with pattern:', pattern, matches);
        for (const match of matches) {
          let title = match.replace(/^\d+\.\s*|[•·*-]\s*/, '').trim();
          // Remove markdown formatting
          title = title.replace(/\*\*([^*]+)\*\*/, '$1'); // Remove **bold**
          title = title.replace(/"([^"]+)":?/, '$1'); // Remove quotes and colons
          title = title.replace(/:\s*.*$/, ''); // Remove everything after colon
          
          if (title && title.length > 3 && title.length < 50) {
            cardTitles.push(title);
          }
        }
      }
    }
    
    // If no patterns found, try to extract from common medical card patterns
    if (cardTitles.length === 0) {
      console.log('No patterns found, trying medical patterns');
      const medicalPatterns = [
        'Featured Content',
        'Featured Categories', 
        'Other Resources',
        'Residents Resources',
        'Quick Access',
        'Emergency Protocols',
        'Learning Materials',
        'Assessment Tools',
        'Case Studies',
        'Guidelines',
        'Procedures',
        'Diagnostics'
      ];
      
      for (const pattern of medicalPatterns) {
        if (suggestion.toLowerCase().includes(pattern.toLowerCase())) {
          cardTitles.push(pattern);
        }
      }
    }
    
    console.log('Extracted card titles:', cardTitles);
    return cardTitles.slice(0, 6); // Limit to 6 cards max
  };

  // Helper function to create cards from AI suggestion
  const createCardsFromAISuggestion = (cardTitles: string[]) => {
    console.log('Creating cards from AI suggestion:', cardTitles);
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    
    const newCards: SpaceCard[] = cardTitles.map((title, index) => ({
      id: `ai-card-${Date.now()}-${index}`,
      title: title,
      description: `AI-generated card: ${title}`,
      color: colors[index % colors.length],
      order: space.cards.length + index,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isExpanded: false
    }));

    console.log('Created new cards:', newCards);
    setSpace(prev => ({
      ...prev,
      cards: [...prev.cards, ...newCards]
    }));
  };

  // Helper function to create collection cards from AI suggestion
  const createCollectionCardsFromAISuggestion = (collectionId: string, cardTitles: string[]) => {
    console.log('Creating collection cards from AI suggestion:', collectionId, cardTitles);
    console.log('Current space cards:', space.cards);
    
    // Find the collection in the space
    const findCollectionInCards = (cards: SpaceCard[]): ContentItem | null => {
      console.log('Searching in cards:', cards.length);
      for (const card of cards) {
        console.log('Checking card:', card.title, 'with', card.items.length, 'items');
        for (const item of card.items) {
          console.log('Checking item:', item.id, 'type:', item.type, 'title:', item.title);
          if (item.id === collectionId) {
            console.log('Found collection by ID match!');
            return item;
          }
          if (item.type === 'collection' && item.children) {
            console.log('Found nested collection, searching children...');
            const found = findCollectionInCards(item.children);
            if (found) return found;
          }
        }
      }
      return null;
    };

    // Also search in the current collection if we're in a collection context
    const findCollectionInCurrentCollection = (): ContentItem | null => {
      if (currentCollection && currentCollection.id === collectionId) {
        console.log('Found current collection by ID match!');
        return currentCollection;
      }
      return null;
    };

    let collection = findCollectionInCards(space.cards);
    if (!collection) {
      collection = findCollectionInCurrentCollection();
    }
    
    console.log('Found collection:', collection);
    
    if (!collection || collection.type !== 'collection') {
      console.log('Collection not found or not a collection type');
      console.log('Available collections in space:');
      space.cards.forEach(card => {
        card.items.forEach(item => {
          if (item.type === 'collection') {
            console.log('- Collection:', item.id, item.title);
          }
        });
      });
      console.log('Current collection:', currentCollection);
      return;
    }

    const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];
    
    const newCards: ContentItem[] = cardTitles.map((title, index) => ({
      id: `collection-card-${Date.now()}-${index}`,
      type: 'collection' as const,
      title: title,
      description: `AI-generated collection card: ${title}`,
      color: colors[index % colors.length],
      order: (collection.children?.length || 0) + index,
      children: [],
      isExpanded: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    console.log('Created new collection cards:', newCards);
    console.log('Current collection children:', collection.children);

    // Update the collection with new cards
    setSpace(prev => {
      console.log('Updating space with new collection cards');
      const updated = {
        ...prev,
        cards: prev.cards.map(card => ({
          ...card,
          items: card.items.map(item => {
            if (item.id === collectionId && item.type === 'collection') {
              console.log('Updating collection:', item.title);
              const updatedItem = {
                ...item,
                children: [...(item.children || []), ...newCards]
              };
              console.log('Updated collection children:', updatedItem.children);
              return updatedItem;
            }
            return item;
          })
        }))
      };
      console.log('Updated space:', updated);
      return updated;
    });

    // Also update the current collection if it's the same one
    if (currentCollection && currentCollection.id === collectionId) {
      console.log('Updating current collection with new cards');
      setCurrentCollection({
        ...currentCollection,
        children: [...(currentCollection.children || []), ...newCards]
      });
    }
  };

  const applyCollectionAISuggestion = (suggestion: string) => {
    console.log('Applying Collection AI suggestion:', suggestion);
    
    // Add magic effect - show loading state
    setIsCollectionAiLoading(true);
    
    // Parse AI suggestions and create collection cards based on the actual suggestion content
    const cardTitles = extractCardTitlesFromSuggestion(suggestion);
    
    if (cardTitles.length > 0) {
      // Create collection cards based on AI suggestion
      createCollectionCardsFromAISuggestion(collectionAiContext.targetId!, cardTitles);
    } else {
      // Fallback to keyword-based templates
      generateCollectionTemplate(collectionAiContext.targetId!, suggestion);
    }
    
    // Auto-close AI Designer after applying suggestion
    setTimeout(() => {
      setIsCollectionAiLoading(false);
      setShowCollectionAIDesigner(false);
      setCollectionAiMessages([]);
      setCollectionAiInput('');
    }, 1500); // 1.5 second delay to show the magic effect
  };

  const applyCardAISuggestion = (suggestion: string) => {
    console.log('Applying Card AI suggestion:', suggestion);
    
    // Add magic effect - show loading state
    setIsCardAiLoading(true);
    
    // Generate content for specific card
    generateCardContent(cardAiContext.targetId!, suggestion);
    
    // Auto-close AI Designer after applying suggestion
    setTimeout(() => {
      setIsCardAiLoading(false);
      setShowCardAIDesigner(false);
      setCardAiMessages([]);
      setCardAiInput('');
    }, 1500); // 1.5 second delay to show the magic effect
  };

  // Template creation functions
  const createEmergencyMedicineTemplate = () => {
    const emergencyCards = [
      {
        id: `emergency-${Date.now()}-1`,
        title: 'Triage Protocols',
        description: 'Emergency triage guidelines and protocols',
        color: '#ef4444',
        order: space.cards.length,
        items: [
          {
            id: `emergency-item-${Date.now()}-1`,
            type: 'content' as const,
            title: 'ESI Triage System',
            description: 'Emergency Severity Index triage guidelines',
            contentType: 'guideline' as const,
            icon: ClipboardList as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          },
          {
            id: `emergency-item-${Date.now()}-2`,
            type: 'content' as const,
            title: 'Trauma Triage Protocol',
            description: 'Step-by-step trauma triage procedures',
            contentType: 'video' as const,
            icon: PlayCircle as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isExpanded: false
      },
      {
        id: `emergency-${Date.now()}-2`,
        title: 'Critical Care Procedures',
        description: 'Essential emergency procedures and techniques',
        color: '#dc2626',
        order: space.cards.length + 1,
        items: [
          {
            id: `emergency-item-${Date.now()}-3`,
            type: 'content' as const,
            title: 'Airway Management',
            description: 'Emergency airway techniques and protocols',
            contentType: 'video' as const,
            icon: PlayCircle as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          },
          {
            id: `emergency-item-${Date.now()}-4`,
            type: 'content' as const,
            title: 'Shock Management',
            description: 'Recognition and treatment of shock states',
            contentType: 'article' as const,
            icon: Newspaper as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isExpanded: false
      },
      {
        id: `emergency-${Date.now()}-3`,
        title: 'Other Resources',
        description: 'Additional emergency medicine tools and references',
        color: '#eab308',
        order: space.cards.length + 2,
        items: [
          {
            id: `emergency-item-${Date.now()}-5`,
            type: 'content' as const,
            title: 'Drug Dosing Calculator',
            description: 'Emergency medication dosing and calculations',
            contentType: 'interactive-content' as const,
            icon: Gamepad2 as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          },
          {
            id: `emergency-item-${Date.now()}-6`,
            type: 'content' as const,
            title: 'Emergency Guidelines',
            description: 'Latest emergency medicine guidelines and protocols',
            contentType: 'guideline' as const,
            icon: ClipboardList as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 1
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isExpanded: false
      },
      {
        id: `emergency-${Date.now()}-4`,
        title: 'Residents Resources',
        description: 'Educational materials for emergency medicine residents',
        color: '#22c55e',
        order: space.cards.length + 3,
        items: [
          {
            id: `emergency-item-${Date.now()}-7`,
            type: 'content' as const,
            title: 'Resident Handbook',
            description: 'Comprehensive guide for emergency medicine residents',
            contentType: 'document' as const,
            icon: File as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          },
          {
            id: `emergency-item-${Date.now()}-8`,
            type: 'content' as const,
            title: 'Case Studies',
            description: 'Real emergency medicine cases for learning',
            contentType: 'article' as const,
            icon: Newspaper as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 1
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isExpanded: false
      }
    ];

    setSpace(prev => ({
      ...prev,
      cards: [...prev.cards, ...emergencyCards]
    }));
  };

  const createSurgeryTemplate = () => {
    const surgeryCards = [
      {
        id: `surgery-${Date.now()}-1`,
        title: 'Preoperative Assessment',
        description: 'Pre-surgical evaluation and preparation',
        color: '#059669',
        order: space.cards.length,
        items: [
          {
            id: `surgery-item-${Date.now()}-1`,
            type: 'content' as const,
            title: 'Pre-op Checklist',
            description: 'Comprehensive preoperative checklist',
            contentType: 'guideline' as const,
            icon: ClipboardList as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          },
          {
            id: `surgery-item-${Date.now()}-2`,
            type: 'content' as const,
            title: 'Risk Assessment',
            description: 'Surgical risk evaluation protocols',
            contentType: 'article' as const,
            icon: Newspaper as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isExpanded: false
      },
      {
        id: `surgery-${Date.now()}-2`,
        title: 'Surgical Techniques',
        description: 'Core surgical procedures and methods',
        color: '#047857',
        order: space.cards.length + 1,
        items: [
          {
            id: `surgery-item-${Date.now()}-3`,
            type: 'content' as const,
            title: 'Laparoscopic Techniques',
            description: 'Minimally invasive surgical procedures',
            contentType: 'video' as const,
            icon: PlayCircle as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          },
          {
            id: `surgery-item-${Date.now()}-4`,
            type: 'content' as const,
            title: 'Suture Techniques',
            description: 'Essential suturing methods and materials',
            contentType: 'video' as const,
            icon: PlayCircle as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isExpanded: false
      }
    ];

    setSpace(prev => ({
      ...prev,
      cards: [...prev.cards, ...surgeryCards]
    }));
  };

  const createCardiologyTemplate = () => {
    const cardiologyCards = [
      {
        id: `cardio-${Date.now()}-1`,
        title: 'ECG Interpretation',
        description: 'Electrocardiogram reading and analysis',
        color: '#dc2626',
        order: space.cards.length,
        items: [
          {
            id: `cardio-item-${Date.now()}-1`,
            type: 'content' as const,
            title: 'Basic ECG Patterns',
            description: 'Fundamental ECG waveform interpretation',
            contentType: 'infographic' as const,
            icon: BarChart3 as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          },
          {
            id: `cardio-item-${Date.now()}-2`,
            type: 'content' as const,
            title: 'Arrhythmia Recognition',
            description: 'Identifying common cardiac arrhythmias',
            contentType: 'video' as const,
            icon: PlayCircle as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isExpanded: false
      }
    ];

    setSpace(prev => ({
      ...prev,
      cards: [...prev.cards, ...cardiologyCards]
    }));
  };

  const createPediatricsTemplate = () => {
    const pediatricsCards = [
      {
        id: `peds-${Date.now()}-1`,
        title: 'Growth & Development',
        description: 'Pediatric growth charts and milestones',
        color: '#f59e0b',
        order: space.cards.length,
        items: [
          {
            id: `peds-item-${Date.now()}-1`,
            type: 'content' as const,
            title: 'Growth Charts',
            description: 'WHO and CDC growth reference charts',
            contentType: 'infographic' as const,
            icon: BarChart3 as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          },
          {
            id: `peds-item-${Date.now()}-2`,
            type: 'content' as const,
            title: 'Developmental Milestones',
            description: 'Key developmental stages and markers',
            contentType: 'guideline' as const,
            icon: ClipboardList as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isExpanded: false
      }
    ];

    setSpace(prev => ({
      ...prev,
      cards: [...prev.cards, ...pediatricsCards]
    }));
  };

  const createNeurologyTemplate = () => {
    const neurologyCards = [
      {
        id: `neuro-${Date.now()}-1`,
        title: 'Neurological Examination',
        description: 'Comprehensive neurological assessment',
        color: '#7c3aed',
        order: space.cards.length,
        items: [
          {
            id: `neuro-item-${Date.now()}-1`,
            type: 'content' as const,
            title: 'Cranial Nerve Exam',
            description: 'Systematic cranial nerve assessment',
            contentType: 'video' as const,
            icon: PlayCircle as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          },
          {
            id: `neuro-item-${Date.now()}-2`,
            type: 'content' as const,
            title: 'Motor Function Assessment',
            description: 'Motor strength and coordination testing',
            contentType: 'article' as const,
            icon: Newspaper as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isExpanded: false
      }
    ];

    setSpace(prev => ({
      ...prev,
      cards: [...prev.cards, ...neurologyCards]
    }));
  };

  const createDefaultMedicalTemplate = () => {
    const defaultCards = [
      {
        id: `default-${Date.now()}-1`,
        title: 'Clinical Guidelines',
        description: 'Evidence-based clinical practice guidelines',
        color: '#3b82f6',
        order: space.cards.length,
        items: [
          {
            id: `default-item-${Date.now()}-1`,
            type: 'content' as const,
            title: 'Treatment Protocols',
            description: 'Standard treatment protocols and procedures',
            contentType: 'guideline' as const,
            icon: ClipboardList as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isExpanded: false
      },
      {
        id: `default-${Date.now()}-2`,
        title: 'Educational Resources',
        description: 'Learning materials and study resources',
        color: '#6366f1',
        order: space.cards.length + 1,
        items: [
          {
            id: `default-item-${Date.now()}-2`,
            type: 'content' as const,
            title: 'Case Studies',
            description: 'Clinical case studies and analysis',
            contentType: 'article' as const,
            icon: Newspaper as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isExpanded: false
      }
    ];

    setSpace(prev => ({
      ...prev,
      cards: [...prev.cards, ...defaultCards]
    }));
  };

  // Detailed Medical Template Functions
  const createNeuroblastomaTemplate = () => {
    const neuroblastomaCards = [
      {
        id: `neuroblastoma-${Date.now()}-1`,
        title: 'Topic Overview',
        description: 'Comprehensive introduction to neuroblastoma for pediatric residents',
        color: '#8b5cf6',
        order: space.cards.length,
        items: [
          {
            id: `neuroblastoma-item-${Date.now()}-1`,
            type: 'content' as const,
            title: 'Disease Overview',
            description: 'Introduction to neuroblastoma epidemiology and pathophysiology',
            contentType: 'article' as const,
            icon: Newspaper as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          },
          {
            id: `neuroblastoma-item-${Date.now()}-2`,
            type: 'content' as const,
            title: 'Risk Stratification',
            description: 'INRG staging system and risk group classification',
            contentType: 'guideline' as const,
            icon: ClipboardList as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isExpanded: false
      },
      {
        id: `neuroblastoma-${Date.now()}-2`,
        title: 'Workup Algorithm',
        description: 'Diagnostic pathway and staging workup for neuroblastoma',
        color: '#06b6d4',
        order: space.cards.length + 1,
        items: [
          {
            id: `neuroblastoma-item-${Date.now()}-3`,
            type: 'content' as const,
            title: 'Initial Diagnostic Workup',
            description: 'Laboratory tests, imaging studies, and biopsy procedures',
            contentType: 'guideline' as const,
            icon: ClipboardList as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          },
          {
            id: `neuroblastoma-item-${Date.now()}-4`,
            type: 'content' as const,
            title: 'Staging Studies',
            description: 'MIBG scan, CT/MRI, bone marrow biopsy protocols',
            contentType: 'video' as const,
            icon: PlayCircle as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isExpanded: false
      },
      {
        id: `neuroblastoma-${Date.now()}-3`,
        title: 'Preoperative Planning',
        description: 'Surgical considerations and preparation for neuroblastoma resection',
        color: '#10b981',
        order: space.cards.length + 2,
        items: [
          {
            id: `neuroblastoma-item-${Date.now()}-5`,
            type: 'content' as const,
            title: 'Surgical Indications',
            description: 'When to consider surgical resection vs. chemotherapy first',
            contentType: 'guideline' as const,
            icon: ClipboardList as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          },
          {
            id: `neuroblastoma-item-${Date.now()}-6`,
            type: 'content' as const,
            title: 'Preoperative Assessment',
            description: 'Cardiac evaluation, renal function, and anesthesia considerations',
            contentType: 'article' as const,
            icon: Newspaper as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isExpanded: false
      },
      {
        id: `neuroblastoma-${Date.now()}-4`,
        title: 'Technique Videos',
        description: 'Surgical procedures and techniques for neuroblastoma management',
        color: '#f59e0b',
        order: space.cards.length + 3,
        items: [
          {
            id: `neuroblastoma-item-${Date.now()}-7`,
            type: 'content' as const,
            title: 'Laparoscopic Adrenalectomy',
            description: 'Minimally invasive adrenal tumor resection techniques',
            contentType: 'video' as const,
            icon: PlayCircle as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          },
          {
            id: `neuroblastoma-item-${Date.now()}-8`,
            type: 'content' as const,
            title: 'Open Tumor Resection',
            description: 'Traditional open surgical approaches for large tumors',
            contentType: 'video' as const,
            icon: PlayCircle as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isExpanded: false
      },
      {
        id: `neuroblastoma-${Date.now()}-5`,
        title: 'Postoperative Care',
        description: 'Recovery protocols and monitoring after neuroblastoma surgery',
        color: '#ef4444',
        order: space.cards.length + 4,
        items: [
          {
            id: `neuroblastoma-item-${Date.now()}-9`,
            type: 'content' as const,
            title: 'ICU Management',
            description: 'Postoperative monitoring and critical care considerations',
            contentType: 'guideline' as const,
            icon: ClipboardList as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          },
          {
            id: `neuroblastoma-item-${Date.now()}-10`,
            type: 'content' as const,
            title: 'Pain Management',
            description: 'Pediatric pain control strategies and medication protocols',
            contentType: 'article' as const,
            icon: Newspaper as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isExpanded: false
      },
      {
        id: `neuroblastoma-${Date.now()}-6`,
        title: 'Patient Education Materials',
        description: 'Family resources and educational materials for neuroblastoma',
        color: '#84cc16',
        order: space.cards.length + 5,
        items: [
          {
            id: `neuroblastoma-item-${Date.now()}-11`,
            type: 'content' as const,
            title: 'Family Counseling Guide',
            description: 'Talking to families about neuroblastoma diagnosis and treatment',
            contentType: 'article' as const,
            icon: Newspaper as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          },
          {
            id: `neuroblastoma-item-${Date.now()}-12`,
            type: 'content' as const,
            title: 'Support Resources',
            description: 'Patient advocacy groups and family support networks',
            contentType: 'external-link' as const,
            icon: ExternalLink as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isExpanded: false
      },
      {
        id: `neuroblastoma-${Date.now()}-7`,
        title: 'Key Articles',
        description: 'Evidence-based literature and recent research on neuroblastoma',
        color: '#6366f1',
        order: space.cards.length + 6,
        items: [
          {
            id: `neuroblastoma-item-${Date.now()}-13`,
            type: 'content' as const,
            title: 'COG Protocols',
            description: 'Children\'s Oncology Group treatment protocols and guidelines',
            contentType: 'article' as const,
            icon: Newspaper as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          },
          {
            id: `neuroblastoma-item-${Date.now()}-14`,
            type: 'content' as const,
            title: 'Recent Research',
            description: 'Latest advances in neuroblastoma treatment and immunotherapy',
            contentType: 'article' as const,
            icon: Newspaper as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isExpanded: false
      }
    ];

    setSpace(prev => ({
      ...prev,
      cards: [...prev.cards, ...neuroblastomaCards]
    }));
  };

  const createClinicalDecisionMakingTemplate = () => {
    const clinicalDecisionCards = [
      {
        id: `clinical-${Date.now()}-1`,
        title: 'Topic Overview',
        description: 'Comprehensive introduction to clinical decision making',
        color: '#3b82f6',
        order: space.cards.length,
        items: [
          {
            id: `clinical-item-${Date.now()}-1`,
            type: 'content' as const,
            title: 'Decision Making Framework',
            description: 'Evidence-based approach to clinical decision making',
            contentType: 'article' as const,
            icon: Newspaper as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isExpanded: false
      },
      {
        id: `clinical-${Date.now()}-2`,
        title: 'Workup Algorithm',
        description: 'Diagnostic algorithms and clinical pathways',
        color: '#06b6d4',
        order: space.cards.length + 1,
        items: [
          {
            id: `clinical-item-${Date.now()}-2`,
            type: 'content' as const,
            title: 'Diagnostic Decision Trees',
            description: 'Step-by-step diagnostic algorithms',
            contentType: 'infographic' as const,
            icon: BarChart3 as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isExpanded: false
      },
      {
        id: `clinical-${Date.now()}-3`,
        title: 'Preoperative Planning',
        description: 'Surgical decision making and preoperative considerations',
        color: '#10b981',
        order: space.cards.length + 2,
        items: [
          {
            id: `clinical-item-${Date.now()}-3`,
            type: 'content' as const,
            title: 'Surgical Indications',
            description: 'When to proceed with surgical intervention',
            contentType: 'guideline' as const,
            icon: ClipboardList as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isExpanded: false
      },
      {
        id: `clinical-${Date.now()}-4`,
        title: 'Technique Videos',
        description: 'Procedural demonstrations and technique videos',
        color: '#f59e0b',
        order: space.cards.length + 3,
        items: [
          {
            id: `clinical-item-${Date.now()}-4`,
            type: 'content' as const,
            title: 'Procedure Demonstrations',
            description: 'Video demonstrations of key procedures',
            contentType: 'video' as const,
            icon: PlayCircle as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isExpanded: false
      },
      {
        id: `clinical-${Date.now()}-5`,
        title: 'Postoperative Care',
        description: 'Postoperative decision making and care protocols',
        color: '#ef4444',
        order: space.cards.length + 4,
        items: [
          {
            id: `clinical-item-${Date.now()}-5`,
            type: 'content' as const,
            title: 'Recovery Protocols',
            description: 'Postoperative care and monitoring guidelines',
            contentType: 'guideline' as const,
            icon: ClipboardList as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isExpanded: false
      },
      {
        id: `clinical-${Date.now()}-6`,
        title: 'Patient Education Materials',
        description: 'Patient and family education resources',
        color: '#84cc16',
        order: space.cards.length + 5,
        items: [
          {
            id: `clinical-item-${Date.now()}-6`,
            type: 'content' as const,
            title: 'Patient Counseling',
            description: 'Communication strategies for patient education',
            contentType: 'article' as const,
            icon: Newspaper as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isExpanded: false
      },
      {
        id: `clinical-${Date.now()}-7`,
        title: 'Key Articles',
        description: 'Evidence-based literature and clinical guidelines',
        color: '#6366f1',
        order: space.cards.length + 6,
        items: [
          {
            id: `clinical-item-${Date.now()}-7`,
            type: 'content' as const,
            title: 'Clinical Guidelines',
            description: 'Evidence-based clinical practice guidelines',
            contentType: 'article' as const,
            icon: Newspaper as any,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isExpanded: false
      }
    ];

    setSpace(prev => ({
      ...prev,
      cards: [...prev.cards, ...clinicalDecisionCards]
    }));
  };

  const generateCardContent = (cardId: string, suggestion: string) => {
    // First try to find the card in space cards
    let card = space.cards.find(c => c.id === cardId);
    
    // If not found in space cards, try to find it in current collection
    if (!card && currentCollection) {
      card = currentCollection.children?.find(c => c.id === cardId);
    }
    
    if (!card) {
      console.log('Card not found:', cardId);
      return;
    }

    // Generate content based on suggestion keywords
    const newItems: ContentItem[] = [];
    
    if (suggestion.toLowerCase().includes('video')) {
      newItems.push({
        id: `ai-content-${Date.now()}-1`,
        type: 'content',
        title: 'Educational Video',
        description: 'AI-generated video content suggestion',
        contentType: 'video',
        icon: PlayCircle as any,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        order: 0
      });
    }
    
    if (suggestion.toLowerCase().includes('article') || suggestion.toLowerCase().includes('document')) {
      newItems.push({
        id: `ai-content-${Date.now()}-2`,
        type: 'content',
        title: 'Research Article',
        description: 'AI-generated article content suggestion',
        contentType: 'article',
        icon: Newspaper as any,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        order: 0
      });
    }
    
    if (suggestion.toLowerCase().includes('guideline') || suggestion.toLowerCase().includes('protocol')) {
      newItems.push({
        id: `ai-content-${Date.now()}-3`,
        type: 'content',
        title: 'Clinical Guideline',
        description: 'AI-generated guideline content suggestion',
        contentType: 'guideline',
        icon: ClipboardList as any,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        order: 0
      });
    }

    if (newItems.length > 0) {
      // Check if this is a space card or collection card
      const isSpaceCard = space.cards.some(c => c.id === cardId);
      
      if (isSpaceCard) {
        // Update space card
        setSpace(prev => ({
          ...prev,
          cards: prev.cards.map(c => 
            c.id === cardId 
              ? { ...c, items: [...c.items, ...newItems] }
              : c
          )
        }));
      } else if (currentCollection) {
        // Update collection card
        setCurrentCollection({
          ...currentCollection,
          children: currentCollection.children?.map(c => 
            c.id === cardId 
              ? { ...c, children: [...(c.children || []), ...newItems] }
              : c
          ) || []
        });
      }
    }
  };

  const generateCollectionTemplate = (collectionId: string, suggestion: string) => {
    // Find the collection in the space
    const findCollectionInCards = (cards: SpaceCard[]): ContentItem | null => {
      for (const card of cards) {
        for (const item of card.items) {
          if (item.id === collectionId) {
            return item;
          }
          if (item.type === 'collection' && item.children) {
            const found = findCollectionInCards(item.children);
            if (found) return found;
          }
        }
      }
      return null;
    };

    const collection = findCollectionInCards(space.cards);
    if (!collection || collection.type !== 'collection') return;

    // Generate collection cards based on suggestion (these are collection-level cards, not space cards)
    const newCards: CollectionCard[] = [];
    
    if (suggestion.toLowerCase().includes('neuroblastoma') || suggestion.toLowerCase().includes('pediatric') && suggestion.toLowerCase().includes('oncology')) {
      // Create neuroblastoma-specific collection cards
      newCards.push(
        {
          id: `collection-card-${Date.now()}-1`,
          title: 'Topic Overview',
          color: '#8b5cf6',
          order: collection.children?.length || 0,
          items: [],
          isExpanded: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: `collection-card-${Date.now()}-2`,
          title: 'Workup Algorithm',
          color: '#06b6d4',
          order: (collection.children?.length || 0) + 1,
          items: [],
          isExpanded: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: `collection-card-${Date.now()}-3`,
          title: 'Preoperative Planning',
          color: '#10b981',
          order: (collection.children?.length || 0) + 2,
          items: [],
          isExpanded: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: `collection-card-${Date.now()}-4`,
          title: 'Technique Videos',
          color: '#f59e0b',
          order: (collection.children?.length || 0) + 3,
          items: [],
          isExpanded: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: `collection-card-${Date.now()}-5`,
          title: 'Postoperative Care',
          color: '#ef4444',
          order: (collection.children?.length || 0) + 4,
          items: [],
          isExpanded: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: `collection-card-${Date.now()}-6`,
          title: 'Patient Education Materials',
          color: '#8b5cf6',
          order: (collection.children?.length || 0) + 5,
          items: [],
          isExpanded: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      );
    } else {
      // Default collection cards for any medical topic
      newCards.push(
        {
          id: `collection-card-${Date.now()}-1`,
          title: 'Core Concepts',
          color: '#3b82f6',
          order: collection.children?.length || 0,
          items: [],
          isExpanded: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: `collection-card-${Date.now()}-2`,
          title: 'Diagnostic Approach',
          color: '#10b981',
          order: (collection.children?.length || 0) + 1,
          items: [],
          isExpanded: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: `collection-card-${Date.now()}-3`,
          title: 'Treatment Protocols',
          color: '#f59e0b',
          order: (collection.children?.length || 0) + 2,
          items: [],
          isExpanded: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: `collection-card-${Date.now()}-4`,
          title: 'Case Studies',
          color: '#ef4444',
          order: (collection.children?.length || 0) + 3,
          items: [],
          isExpanded: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: `collection-card-${Date.now()}-5`,
          title: 'Assessment Tools',
          color: '#8b5cf6',
          order: (collection.children?.length || 0) + 4,
          items: [],
          isExpanded: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: `collection-card-${Date.now()}-6`,
          title: 'Key Articles',
          color: '#06b6d4',
          order: (collection.children?.length || 0) + 5,
          items: [],
          isExpanded: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      );
    }

    // Update the collection with new cards
    setSpace(prev => ({
      ...prev,
      cards: prev.cards.map(card => ({
        ...card,
        items: card.items.map(item => {
          if (item.id === collectionId && item.type === 'collection') {
            return {
              ...item,
              children: [...(item.children || []), ...newCards]
            };
          }
          return item;
        })
      }))
    }));
  };

  // Manual save function instead of automatic saving
  const saveSpaceData = async () => {
    setIsSaving(true);
    try {
      if (typeof window !== 'undefined') {
        console.log('Saving space data:', space);
        localStorage.setItem('designer-space', JSON.stringify(space));
        
        // Update saved state and clear unsaved changes flag
        setLastSavedState(JSON.stringify(space));
        setHasUnsavedChanges(false);
        
        // If we're working on a version, also save to that version
        if (currentVersionId) {
          console.log('Saving to current version:', currentVersionId);
          const savedVersions = JSON.parse(localStorage.getItem('designer-versions') || '[]');
          const versionIndex = savedVersions.findIndex((v: any) => v.id === currentVersionId);
          
          if (versionIndex !== -1) {
            savedVersions[versionIndex].space = space;
            savedVersions[versionIndex].timestamp = new Date().toISOString();
            localStorage.setItem('designer-versions', JSON.stringify(savedVersions));
            console.log('Version updated successfully');
          }
        }
        
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

  // Versioning states
  const [showVersionDialog, setShowVersionDialog] = useState(false);
  const [versionName, setVersionName] = useState("");
  const [versionDescription, setVersionDescription] = useState("");
  const [savedVersions, setSavedVersions] = useState<Array<{id: string, name: string, description: string, timestamp: Date, url: string}>>([]);
  const [isSavingVersion, setIsSavingVersion] = useState(false);
  const [currentVersionId, setCurrentVersionId] = useState<string | null>(null);
  
  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentOnboardingStep, setCurrentOnboardingStep] = useState(0);
  const [onboardingTour, setOnboardingTour] = useState<OnboardingTour | null>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  // AI Designer state
  // Separate AI Designers for different contexts
  const [showSpaceAIDesigner, setShowSpaceAIDesigner] = useState(false);
  const [showCollectionAIDesigner, setShowCollectionAIDesigner] = useState(false);
  const [showCardAIDesigner, setShowCardAIDesigner] = useState(false);
  
  // Separate AI states for each context
  const [spaceAiMessages, setSpaceAiMessages] = useState<Array<{id: string, role: 'user' | 'assistant', content: string, timestamp: Date}>>([]);
  const [collectionAiMessages, setCollectionAiMessages] = useState<Array<{id: string, role: 'user' | 'assistant', content: string, timestamp: Date}>>([]);
  const [cardAiMessages, setCardAiMessages] = useState<Array<{id: string, role: 'user' | 'assistant', content: string, timestamp: Date}>>([]);
  
  const [spaceAiInput, setSpaceAiInput] = useState('');
  const [collectionAiInput, setCollectionAiInput] = useState('');
  const [cardAiInput, setCardAiInput] = useState('');
  
  const [isSpaceAiLoading, setIsSpaceAiLoading] = useState(false);
  const [isCollectionAiLoading, setIsCollectionAiLoading] = useState(false);
  const [isCardAiLoading, setIsCardAiLoading] = useState(false);
  
  
  // Separate contexts for each AI Designer
  const [spaceAiContext, setSpaceAiContext] = useState<{
    targetId?: string;
    targetTitle?: string;
  }>({});
  
  const [collectionAiContext, setCollectionAiContext] = useState<{
    targetId?: string;
    targetTitle?: string;
  }>({});
  
  const [cardAiContext, setCardAiContext] = useState<{
    targetId?: string;
    targetTitle?: string;
  }>({});

  // Force re-render when switching modes to ensure state consistency
  useEffect(() => {
    console.log('Mode changed to:', isDesignMode ? 'Design' : 'Production');
    // Force a state update to ensure React re-renders the cards properly
    setSpace(prevSpace => ({
      ...prevSpace,
      cards: prevSpace.cards.map(card => ({
        ...card,
        // Ensure isExpanded property exists and is properly set
        isExpanded: card.isExpanded !== undefined ? card.isExpanded : false
      }))
    }));
  }, [isDesignMode]);

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
  const [newItemMenuButtonTarget, setNewItemMenuButtonTarget] = useState("");
  const [showMenuButtonSearch, setShowMenuButtonSearch] = useState(false);
  const [menuButtonSearchQuery, setMenuButtonSearchQuery] = useState("");
  
  // Unsaved changes tracking
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedState, setLastSavedState] = useState<string>("");
  const [showPortalDialog, setShowPortalDialog] = useState(false);
  const [portalSearchQuery, setPortalSearchQuery] = useState("");

  const dragRef = useRef<HTMLDivElement>(null);

  // Load space data from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('designer-space');
      if (saved) {
        try {
          const parsedSpace = JSON.parse(saved);
          console.log('Loaded space data:', parsedSpace);
          
          // Ensure all cards have isExpanded property
          const spaceWithExpansion = {
            ...parsedSpace,
            cards: parsedSpace.cards?.map((card: any) => ({
              ...card,
              isExpanded: card.isExpanded !== undefined ? card.isExpanded : false
            })) || []
          };
          
          setSpace(spaceWithExpansion);
          setLastSavedState(saved); // Initialize saved state
        } catch (error) {
          console.error('Error parsing saved space data:', error);
        }
      } else {
        console.log('No saved space data found, using default');
        // Initialize saved state with default space
        setLastSavedState(JSON.stringify(space));
      }
    }
  }, []);

  // Handle page refresh warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Load version from URL parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check for version in query parameter (supports both ID and slug)
      const urlParams = new URLSearchParams(window.location.search);
      const versionParam = urlParams.get('version');
      
      if (versionParam) {
        console.log('Loading version from URL parameter:', versionParam);
        // Try to load by slug first, then by ID
        loadVersionBySlug(versionParam);
        // If slug loading fails, it will fall back to default space
      } else {
        // Check for version in path (production format)
        const pathSegments = window.location.pathname.split('/').filter(Boolean);
        if (pathSegments.length > 0 && pathSegments[0] !== 'designer') {
          const versionSlug = pathSegments[0];
          console.log('Loading version from path slug:', versionSlug);
          loadVersionBySlug(versionSlug);
        }
      }
      
      // Load saved versions list
      loadSavedVersions();
      
      // Check if onboarding has been completed
      const onboardingCompleted = localStorage.getItem('designer-onboarding-completed');
      if (!onboardingCompleted) {
        setShowOnboarding(true);
        setOnboardingTour(onboardingTours[0]); // Start with main space tour
      }
    }
  }, []);

  // Trigger contextual onboarding when UI state changes
  useEffect(() => {
    triggerContextualOnboarding();
  }, [showSpaceSettingsDialog, showTemplateDialog, showCollectionTemplateDialog, showOnboarding]);

  // Helper functions
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

  const getContentTypeEmoji = (type: ContentType) => {
    const emojis = {
      video: "🎥",
      podcast: "🎙️",
      document: "📄",
      infographic: "📊",
      guideline: "📋",
      article: "📰",
      'interactive-content': "🎮",
      'external-link': "🔗",
      'menu-button': "🔘"
    };
    return emojis[type];
  };

  // Helper function to get all content items for menu button search
  const getAllContentItems = (): ContentItem[] => {
    const allItems: ContentItem[] = [];
    
    // Add items from main space cards
    space.cards.forEach(card => {
      allItems.push(...card.items);
    });
    
    // Add items from collections (recursively)
    const addCollectionItems = (collection: ContentItem) => {
      if (collection.type === 'collection' && collection.children) {
        collection.children.forEach(card => {
          // Collection cards have children, not items
          if (card.children) {
            allItems.push(...card.children);
            // Recursively add items from subcollections
            card.children.forEach(item => {
              if (item.type === 'collection' && item.children) {
                addCollectionItems(item);
              }
            });
          }
        });
      }
    };
    
    // Add items from ALL collections in the main space
    space.cards.forEach(card => {
      card.items.forEach(item => {
        if (item.type === 'collection') {
          addCollectionItems(item);
        }
      });
    });
    
    return allItems.filter(item => item.type === 'content');
  };

  // Portal helper functions
  const hasPortalsCard = (): boolean => {
    return space.cards.some(card => card.title === 'Portals');
  };

  const getPortalsCard = (): SpaceCard | null => {
    return space.cards.find(card => card.title === 'Portals') || null;
  };

  const addPortal = (spaceData: typeof sampleSpaces[0]) => {
    const portalsCard = getPortalsCard();
    if (!portalsCard) return;

    const newPortal: Portal = {
      id: `portal-${Date.now()}`,
      spaceId: spaceData.id,
      spaceName: spaceData.name,
      spaceDescription: spaceData.description,
      spaceColor: spaceData.color,
      spaceIcon: spaceData.icon,
      order: portalsCard.portals?.length || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedCards = space.cards.map(card => {
      if (card.id === portalsCard.id) {
        return {
          ...card,
          portals: [...(card.portals || []), newPortal],
          updatedAt: new Date()
        };
      }
      return card;
    });

    setSpace({
      ...space,
      cards: updatedCards
    });

    setShowPortalDialog(false);
    setPortalSearchQuery("");
  };

  const removePortal = (portalId: string) => {
    const portalsCard = getPortalsCard();
    if (!portalsCard) return;

    const updatedCards = space.cards.map(card => {
      if (card.id === portalsCard.id) {
        return {
          ...card,
          portals: card.portals?.filter(portal => portal.id !== portalId) || [],
          updatedAt: new Date()
        };
      }
      return card;
    });

    setSpace({
      ...space,
      cards: updatedCards
    });
  };

  const createPortalsCard = () => {
    const newCard: SpaceCard = {
      id: `card-${Date.now()}`,
      title: 'Portals',
      items: [],
      portals: [],
      color: space.borderColor + '20', // Light version of space border color
      order: space.cards.length,
      isExpanded: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setSpace({
      ...space,
      cards: [...space.cards, newCard]
    });
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
          items: [],
          order: 0,
          isExpanded: false
        },
        {
          title: 'In-Depth Reviews',
          color: '#1e40af', // Dark blue
          items: [],
          order: 1,
          isExpanded: false
        },
        {
          title: 'Workup and Treatment',
          color: '#166534', // Dark green
          items: [],
          order: 2,
          isExpanded: false
        },
        {
          title: 'Technique Videos',
          color: '#be185d', // Dark pink
          items: [],
          order: 3,
          isExpanded: false
        },
        {
          title: 'Test your Knowledge',
          color: '#7c3aed', // Dark purple
          items: [],
          order: 4,
          isExpanded: false
        }
      ]
    },
    {
      id: 'clinical-workflow',
      name: 'Clinical Workflow',
      description: 'Complete clinical workflow from diagnosis to treatment',
      icon: Users,
      category: 'clinical',
      cards: [
        {
          title: 'Topic Overview',
          color: '#dc2626', // Dark red
          items: [],
          order: 0,
          isExpanded: false
        },
        {
          title: 'Workup Algorithm',
          color: '#ea580c', // Dark orange
          items: [],
          order: 1,
          isExpanded: false
        },
        {
          title: 'Preoperative',
          color: '#ca8a04', // Dark yellow
          items: [],
          order: 2,
          isExpanded: false
        },
        {
          title: 'Technique Videos',
          color: '#7c2d12', // Dark brown
          items: [],
          order: 3,
          isExpanded: false
        },
        {
          title: 'Postoperative',
          color: '#1f2937', // Dark gray
          items: [],
          order: 4,
          isExpanded: false
        },
        {
          title: 'Patient Education Materials',
          color: '#059669', // Dark emerald
          items: [],
          order: 5,
          isExpanded: false
        },
        {
          title: 'Key Articles',
          color: '#7c3aed', // Dark purple
          items: [],
          order: 6,
          isExpanded: false
        }
      ]
    },
    {
      id: 'curriculum',
      name: 'Curriculum',
      description: 'Structured learning curriculum with objectives and assessments',
      icon: Calendar,
      category: 'education',
      cards: [
        {
          title: 'Learning Objectives',
          color: '#1e40af', // Dark blue
          items: [],
          order: 0,
          isExpanded: false
        },
        {
          title: 'Learning Materials',
          color: '#059669', // Dark emerald
          items: [],
          order: 1,
          isExpanded: false
        },
        {
          title: 'Interactive Scenarios',
          color: '#dc2626', // Dark red
          items: [],
          order: 2,
          isExpanded: false
        },
        {
          title: 'Assessment',
          color: '#7c2d12', // Dark brown
          items: [],
          order: 3,
          isExpanded: false
        },
        {
          title: 'CME',
          color: '#7c3aed', // Dark purple
          items: [],
          order: 4,
          isExpanded: false
        }
      ]
    }
  ];

  // Sample spaces for portal selection
  const sampleSpaces = [
    {
      id: 'cardiology-space',
      name: 'Cardiology Department',
      description: 'Cardiovascular medicine resources and protocols',
      color: '#dc2626',
      icon: '❤️'
    },
    {
      id: 'emergency-space',
      name: 'Emergency Medicine',
      description: 'Emergency protocols and trauma care guidelines',
      color: '#ea580c',
      icon: '🚨'
    },
    {
      id: 'surgery-space',
      name: 'Surgery Department',
      description: 'Surgical procedures and operating room protocols',
      color: '#059669',
      icon: '⚕️'
    },
    {
      id: 'pediatrics-space',
      name: 'Pediatrics',
      description: 'Child health and pediatric care resources',
      color: '#2563eb',
      icon: '👶'
    },
    {
      id: 'radiology-space',
      name: 'Radiology & Imaging',
      description: 'Medical imaging and diagnostic procedures',
      color: '#7c3aed',
      icon: '📷'
    },
    {
      id: 'pharmacy-space',
      name: 'Pharmacy Services',
      description: 'Medication management and drug information',
      color: '#ca8a04',
      icon: '💊'
    }
  ];

  // Onboarding tours
  const onboardingTours: OnboardingTour[] = [
    {
      id: 'main-space-tour',
      name: 'Main Space Tour',
      description: 'Learn how to use the main space features',
      steps: [
        {
          id: 'space-title',
          title: 'Space Name',
          description: 'This is your space name. Click to edit it and customize your space name.',
          target: '[data-onboarding="space-title"]',
          position: 'bottom',
          skipable: true
        },
        {
          id: 'mode-toggle',
          title: 'Design & Production Modes',
          description: 'Switch between Design Mode (for editing) and Production Mode (for viewing). Design Mode lets you add, edit, and organize content.',
          target: '[data-onboarding="mode-toggle"]',
          position: 'bottom',
          skipable: true
        },
        {
          id: 'space-settings-button',
          title: 'Space Settings',
          description: 'Click the gear icon to open space settings where you can customize your space branding, colors, and more.',
          target: '[data-onboarding="space-settings-button"]',
          position: 'bottom',
          skipable: true
        },
        {
          id: 'add-card-button',
          title: 'Add Your First Card',
          description: 'Click here to create your first card. Cards are containers that hold your content and collections.',
          target: '[data-onboarding="add-card-button"]',
          position: 'top',
          action: 'highlight-add-card',
          skipable: true
        },
        {
          id: 'save-button',
          title: 'Save Your Work',
          description: 'Always save your changes! Click this button to save your space to your browser\'s local storage.',
          target: '[data-onboarding="save-button"]',
          position: 'bottom',
          skipable: true
        }
      ]
    },
    {
      id: 'space-settings-tour',
      name: 'Space Settings Tour',
      description: 'Learn how to customize your space branding',
      steps: [
        {
          id: 'space-title-input',
          title: 'Space Name',
          description: 'Edit your space name here. This will be displayed at the top of your space.',
          target: '[data-onboarding="space-title-input"]',
          position: 'bottom',
          skipable: true
        },
        {
          id: 'space-description',
          title: 'Space Description',
          description: 'Add a description for your space. This helps others understand what your space is about.',
          target: '[data-onboarding="space-description"]',
          position: 'bottom',
          skipable: true
        },
        {
          id: 'space-color-picker',
          title: 'Space Color',
          description: 'Choose a color for your space. This will brand all your cards, buttons, and UI elements with your chosen color.',
          target: '[data-onboarding="space-color-picker"]',
          position: 'bottom',
          skipable: true
        },
        {
          id: 'space-logo',
          title: 'Space Logo',
          description: 'Upload a logo for your space. This will appear next to your space name.',
          target: '[data-onboarding="space-logo"]',
          position: 'bottom',
          skipable: true
        }
      ]
    },
    {
      id: 'card-management-tour',
      name: 'Card Management Tour',
      description: 'Learn how to manage cards and their content',
      steps: [
        {
          id: 'card-expansion',
          title: 'Card Expansion',
          description: 'Cards start minimized. Click anywhere on a card to expand it and see its contents.',
          target: '[data-onboarding="card-expansion"]',
          position: 'top',
          skipable: true
        },
        {
          id: 'card-actions',
          title: 'Card Actions',
          description: 'Use these buttons to reorder cards (up/down arrows), edit card details, or delete cards.',
          target: '[data-onboarding="card-actions"]',
          position: 'left',
          skipable: true
        },
        {
          id: 'add-item-button',
          title: 'Add Content',
          description: 'Click this button to add content (videos, articles, etc.) or create collections (folders) inside this card.',
          target: '[data-onboarding="add-item-button"]',
          position: 'top',
          skipable: true
        },
        {
          id: 'content-grid',
          title: 'Content Grid',
          description: 'Your content appears in a 3-column grid. Each item shows an icon, title, and description.',
          target: '[data-onboarding="content-grid"]',
          position: 'top',
          skipable: true
        }
      ]
    },
    {
      id: 'collection-tour',
      name: 'Collection Management Tour',
      description: 'Learn how to work with collections',
      steps: [
        {
          id: 'collection-item',
          title: 'Collection Item',
          description: 'Collections are folders that can contain more cards and content. Click on a collection to open it.',
          target: '[data-onboarding="collection-item"]',
          position: 'top',
          skipable: true
        },
        {
          id: 'collection-count',
          title: 'Item Counter',
          description: 'This shows how many content items are inside the collection (not counting sub-collections).',
          target: '[data-onboarding="collection-count"]',
          position: 'top',
          skipable: true
        },
        {
          id: 'collection-dialog',
          title: 'Collection Workspace',
          description: 'When you open a collection, you get a full workspace just like the main space. You can add cards, content, and even sub-collections here.',
          target: '[data-onboarding="collection-dialog"]',
          position: 'top',
          skipable: true
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
        name: "Space Name",
        description: "Customize your space by adding cards and content",
        backgroundColor: "#f8fafc",
        borderColor: "#93c5fd",
        cards: [],
        likes: 0,
        isLiked: false,
        shares: 0
      });
      setCurrentVersionId(null); // Clear current version
      alert('All data cleared successfully!');
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
        setNewItemMenuButtonTarget(editingItem.menuButtonTarget || '');
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
        markAsChanged();
        } else {
          // Create a SpaceCard for main space
          const newCard: SpaceCard = {
            id: `card-${Date.now()}`,
            title: newCardTitle.trim(),
            items: [],
            color: newCardColor, // Add color property
            order: space.cards.length + 1,
            isExpanded: false, // Minimized by default
            createdAt: new Date(),
            updatedAt: new Date()
          };
        
        setSpace({
          ...space,
          cards: [...space.cards, newCard]
        });
        markAsChanged();
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
    console.log('Toggling card expansion for:', cardId);
    console.log('Current collection:', currentCollection);
    console.log('Current space cards:', space.cards);
    console.log('Current mode:', isDesignMode ? 'Design' : 'Production');
    
    if (currentCollection) {
      console.log('Toggling collection card expansion');
      setCurrentCollection({
        ...currentCollection,
        children: currentCollection.children?.map(card => {
          if (card.id === cardId) {
            console.log('Found collection card to toggle:', card, 'Current isExpanded:', card.isExpanded);
            return { ...card, isExpanded: !card.isExpanded, updatedAt: new Date() };
          }
          return card;
        })
      });
    } else {
      console.log('Toggling main space card expansion');
      // Toggle expansion for main space cards
      const updatedCards = space.cards.map(card => {
        if (card.id === cardId) {
          console.log('Found main space card to toggle:', card, 'Current isExpanded:', card.isExpanded);
          return { ...card, isExpanded: !card.isExpanded, updatedAt: new Date() };
        }
        return card;
      });
      console.log('Updated cards:', updatedCards);
      setSpace({
        ...space,
        cards: updatedCards
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

  // Helper function to get the base URL for version links
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      // For local development, use localhost with designer route
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return `http://localhost:${window.location.port || '3001'}/designer`;
      }
      // For production, use the custom domain
      return 'https://scmd.ramyshaaban.com';
    }
    return 'http://localhost:3001/designer'; // fallback
  };

  // Helper function to generate version URL
  const getVersionUrl = (slug: string) => {
    if (typeof window !== 'undefined') {
      // For local development, use query parameter
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return `${getBaseUrl()}?version=${slug}`;
      }
      // For production, use path segments
      return `https://scmd.ramyshaaban.com/${slug}`;
    }
    return `${getBaseUrl()}?version=${slug}`; // fallback
  };

  // Versioning functions
  const saveVersion = async () => {
    if (!versionName.trim()) {
      alert('Please enter a version name');
      return;
    }

    setIsSavingVersion(true);
    try {
      // Generate a unique version ID
      const versionId = `version-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Generate a clean slug from the version name
      const versionSlug = versionName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      
      // Create version data
      const versionData = {
        id: versionId,
        slug: versionSlug,
        name: versionName.trim(),
        description: versionDescription.trim(),
        space: space,
        timestamp: new Date().toISOString()
      };

      // Save to localStorage
      const savedVersions = JSON.parse(localStorage.getItem('designer-versions') || '[]');
      savedVersions.push(versionData);
      localStorage.setItem('designer-versions', JSON.stringify(savedVersions));

      // Generate shareable URL with cleaner structure
      const versionUrl = getVersionUrl(versionSlug);

      // Update saved versions list
      setSavedVersions(prev => [...prev, {
        id: versionId,
        name: versionName.trim(),
        description: versionDescription.trim(),
        timestamp: new Date(),
        url: versionUrl
      }]);

      // Set this as the current version
      setCurrentVersionId(versionId);
      console.log('Created new version:', versionName.trim(), 'ID:', versionId);

      // Show success message with copyable link
      const shareText = `Version "${versionName.trim()}" saved! Share this link to continue working: ${versionUrl}`;
      navigator.clipboard.writeText(versionUrl).then(() => {
        alert(shareText);
      }).catch(() => {
        alert(shareText);
      });

      // Reset form
      setVersionName("");
      setVersionDescription("");
      setShowVersionDialog(false);

    } catch (error) {
      console.error('Error saving version:', error);
      alert('Error saving version: ' + (error as Error).message);
    } finally {
      setIsSavingVersion(false);
    }
  };

  const loadVersionBySlug = (slug: string) => {
    try {
      const savedVersions = JSON.parse(localStorage.getItem('designer-versions') || '[]');
      const version = savedVersions.find((v: any) => v.slug === slug);
      
      if (version) {
        setSpace(version.space);
        setCurrentVersionId(version.id); // Set the current version ID
        console.log('Loaded version by slug:', version.name, 'Slug:', slug);
      } else {
        console.log('Version not found for slug:', slug);
        // If no version found, continue with default space
      }
    } catch (error) {
      console.error('Error loading version by slug:', error);
      // If error, continue with default space
    }
  };

  const loadVersion = (versionId: string) => {
    try {
      const savedVersions = JSON.parse(localStorage.getItem('designer-versions') || '[]');
      const version = savedVersions.find((v: any) => v.id === versionId);
      
      if (version) {
        setSpace(version.space);
        setCurrentVersionId(versionId); // Set the current version ID
        console.log('Loaded version:', version.name, 'ID:', versionId);
      } else {
        alert('Version not found');
      }
    } catch (error) {
      console.error('Error loading version:', error);
      alert('Error loading version: ' + (error as Error).message);
    }
  };

  const loadSavedVersions = () => {
    try {
      const savedVersions = JSON.parse(localStorage.getItem('designer-versions') || '[]');
      const versionsList = savedVersions.map((v: any) => ({
        id: v.id,
        name: v.name,
        description: v.description,
        timestamp: new Date(v.timestamp),
        url: v.slug ? getVersionUrl(v.slug) : `${window.location.origin}${window.location.pathname}?version=${v.id}`
      }));
      setSavedVersions(versionsList);
    } catch (error) {
      console.error('Error loading saved versions:', error);
    }
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
      color: '#f3f4f6', // Default gray color for template cards
      order: space.cards.length + 1,
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
      isExpanded: false, // Ensure isExpanded property exists
      items: card.items.map((item, itemIndex) => ({
        ...item,
        id: `item-${Date.now()}-${index}-${itemIndex}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        order: 0
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
        fileUrl: newItemType === "content" && newItemContentType !== 'external-link' && newItemContentType !== 'menu-button' ? newItemFileUrl : undefined,
        externalUrl: newItemType === "content" && newItemContentType === 'external-link' ? newItemExternalUrl : undefined,
        menuButtonTarget: newItemType === "content" && newItemContentType === 'menu-button' ? newItemMenuButtonTarget : undefined,
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
        markAsChanged();
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
        markAsChanged();
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
      setNewItemMenuButtonTarget("");
      setShowMenuButtonSearch(false);
      setMenuButtonSearchQuery("");
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
      
      // Ensure all collection cards have isExpanded property
      const ensureExpansionProperty = (cards: ContentItem[]): ContentItem[] => {
        return cards.map(card => ({
          ...card,
          isExpanded: card.isExpanded !== undefined ? card.isExpanded : false,
          children: card.children ? card.children.map(item => {
            if (item.type === 'collection' && item.children) {
              return {
                ...item,
                children: ensureExpansionProperty(item.children)
              };
            }
            return item;
          }) : []
        }));
      };
      
      const cardsWithExpansion = ensureExpansionProperty(newCards);
      
      setSpace({
        ...updatedSpace,
        cards: cardsWithExpansion
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

  // Enhanced Onboarding Component with Spotlight
  const OnboardingPointer = ({ step, isVisible }: { step: OnboardingStep; isVisible: boolean }) => {
    if (!isVisible || !onboardingTour) return null;

    const currentStep = onboardingTour.steps[currentOnboardingStep];
    if (currentStep.id !== step.id) return null;

    const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

    useEffect(() => {
      // Add a small delay to ensure DOM elements are fully rendered
      const timer = setTimeout(() => {
        const element = document.querySelector(currentStep.target) as HTMLElement;
        if (element) {
          setTargetElement(element);
          console.log('Highlighting element:', currentStep.target, 'Rect:', element.getBoundingClientRect());
        } else {
          console.warn('Element not found for target:', currentStep.target);
          setTargetElement(null);
        }
      }, 100); // 100ms delay

      return () => clearTimeout(timer);
    }, [currentStep.target, currentOnboardingStep]);

    const getTooltipPosition = () => {
      if (!targetElement) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
      
      const rect = targetElement.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Determine position based on step preference and available space
      let position = currentStep.position || 'bottom';
      
      // Adjust position if element is near edges
      if (rect.right > viewportWidth - 300) position = 'left';
      if (rect.left < 300) position = 'right';
      if (rect.bottom > viewportHeight - 200) position = 'top';
      
      const tooltipWidth = 320;
      const tooltipHeight = 200;
      const offset = 20;
      
      switch (position) {
        case 'top':
          return {
            top: rect.top - tooltipHeight - offset,
            left: Math.max(20, Math.min(rect.left + rect.width/2 - tooltipWidth/2, viewportWidth - tooltipWidth - 20)),
            transform: 'none'
          };
        case 'bottom':
          return {
            top: rect.bottom + offset,
            left: Math.max(20, Math.min(rect.left + rect.width/2 - tooltipWidth/2, viewportWidth - tooltipWidth - 20)),
            transform: 'none'
          };
        case 'left':
          return {
            top: Math.max(20, Math.min(rect.top + rect.height/2 - tooltipHeight/2, viewportHeight - tooltipHeight - 20)),
            left: rect.left - tooltipWidth - offset,
            transform: 'none'
          };
        case 'right':
          return {
            top: Math.max(20, Math.min(rect.top + rect.height/2 - tooltipHeight/2, viewportHeight - tooltipHeight - 20)),
            left: rect.right + offset,
            transform: 'none'
          };
        default:
          return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
      }
    };

    const tooltipStyle = getTooltipPosition();

    return (
      <div className="fixed inset-0 z-50 pointer-events-none">
        {/* Dark Overlay with Rounded Cutout */}
        <div 
          className="absolute pointer-events-auto"
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 9998,
            clipPath: targetElement ? `polygon(
              0% 0%, 
              0% 100%, 
              ${targetElement.getBoundingClientRect().left - 8}px 100%, 
              ${targetElement.getBoundingClientRect().left - 8}px ${targetElement.getBoundingClientRect().top - 8}px, 
              ${targetElement.getBoundingClientRect().right + 8}px ${targetElement.getBoundingClientRect().top - 8}px, 
              ${targetElement.getBoundingClientRect().right + 8}px ${targetElement.getBoundingClientRect().bottom + 8}px, 
              ${targetElement.getBoundingClientRect().left - 8}px ${targetElement.getBoundingClientRect().bottom + 8}px, 
              ${targetElement.getBoundingClientRect().left - 8}px 100%, 
              100% 100%, 
              100% 0%
            )` : 'none'
          }}
        />
        
        {/* Rounded Border around Cutout */}
        {targetElement && (
          <div 
            className="absolute pointer-events-none"
            style={{
              top: targetElement.getBoundingClientRect().top - 8,
              left: targetElement.getBoundingClientRect().left - 8,
              width: targetElement.getBoundingClientRect().width + 16,
              height: targetElement.getBoundingClientRect().height + 16,
              borderRadius: '12px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              zIndex: 9999,
              boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)'
            }}
          />
        )}
        
        
        {/* Tooltip */}
        <div 
          className="absolute bg-white rounded-xl shadow-2xl border border-gray-200 pointer-events-auto"
          style={{
            ...tooltipStyle,
            width: '320px',
            maxWidth: '90vw',
            zIndex: 10000 // Higher than spotlight
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <h3 className="font-semibold text-gray-900 text-lg">{currentStep.title}</h3>
            </div>
            <button
              onClick={skipOnboarding}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-4">
            <p className="text-gray-700 text-sm leading-relaxed mb-4">{currentStep.description}</p>
            
            {/* Progress */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">
                  Step {currentOnboardingStep + 1} of {onboardingTour.steps.length}
                </span>
              </div>
              <div className="flex space-x-1">
                {onboardingTour.steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentOnboardingStep ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={skipOnboarding}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Skip Tour
              </button>
              
              <div className="flex items-center space-x-2">
                {currentOnboardingStep > 0 && (
                  <button
                    onClick={previousOnboardingStep}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Previous
                  </button>
                )}
                
                {currentOnboardingStep < onboardingTour.steps.length - 1 ? (
                  <button
                    onClick={nextOnboardingStep}
                    className="px-4 py-1.5 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded-md transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={completeOnboarding}
                    className="px-4 py-1.5 text-sm bg-green-500 text-white hover:bg-green-600 rounded-md transition-colors"
                  >
                    Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 z-10">
          {/* Mode Toggle - Above Everything */}
          <div className="flex items-center justify-center gap-2 mb-4" data-onboarding="mode-toggle">
            <div className="flex">
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => resetOnboarding()}
              className="bg-transparent hover:bg-gray-100 border border-gray-300"
              title="Start Tutorial"
            >
              <HelpCircle className="w-4 h-4" />
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
              
              {/* Space Name */}
              <div data-onboarding="space-title">
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
            <div className="space-y-2">
              {/* Unsaved changes warning */}
              {hasUnsavedChanges && (
                <div className="bg-orange-50 border border-orange-200 rounded-md p-2 text-sm text-orange-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    You have unsaved changes. Don't forget to save your work!
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => initializeSpaceAIDesigner()}
                  className="bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border border-purple-200 text-purple-700 whitespace-nowrap"
                  title="AI Space Designer"
                >
                  <Star className="w-4 h-4 mr-2" />
                  AI Space Designer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveSpaceData}
                  disabled={isSaving}
                  className={`bg-transparent hover:bg-gray-100 border ${hasUnsavedChanges ? 'border-orange-300 bg-orange-50' : 'border-gray-300'} whitespace-nowrap`}
                  data-onboarding="save-button"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save {hasUnsavedChanges && <span className="text-orange-600">•</span>}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVersionDialog(true)}
                  className="bg-transparent hover:bg-gray-100 border border-gray-300 whitespace-nowrap"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Version
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
                      data-onboarding="add-card-button"
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

                    <Button 
                      variant="outline"
                      onClick={() => initializeSpaceAIDesigner()}
                      className="flex items-center gap-2 border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 text-purple-700 transition-all duration-200"
                    >
                      <Star className="w-4 h-4" />
                      AI Space Designer
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
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowAddCardDialog(true)}
                      variant="outline"
                      className="flex-1 flex items-center gap-2 border hover:shadow-lg transition-all duration-200"
                      style={{ 
                        backgroundColor: space.backgroundColor,
                        borderColor: space.borderColor,
                        color: getTextColorForBackground(space.backgroundColor) === 'text-gray-900' ? '#1f2937' : '#ffffff'
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Add New Card
                    </Button>
                    
                    <Button
                      onClick={() => initializeSpaceAIDesigner()}
                      variant="outline"
                      className="flex items-center gap-2 border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 text-purple-700 transition-all duration-200"
                      title="AI Space Designer"
                    >
                      <Star className="w-4 h-4" />
                      AI Space Designer
                    </Button>
                  </div>

                  {/* Add Portals Card Button - Only show if no portals card exists */}
                  {!hasPortalsCard() && (
                    <Button
                      onClick={() => createPortalsCard()}
                      variant="outline"
                      className="w-full flex items-center gap-2 border hover:shadow-lg transition-all duration-200"
                      style={{ 
                        backgroundColor: space.backgroundColor,
                        borderColor: space.borderColor,
                        color: getTextColorForBackground(space.backgroundColor) === 'text-gray-900' ? '#1f2937' : '#ffffff'
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Add Portals Card
                    </Button>
                  )}

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
                            <div className="flex items-center gap-1" data-onboarding="card-actions">
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
                          {card.title === 'Portals' ? (
                            // Special Portals card rendering
                            <div className="space-y-4">
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
                                      {/* Delete button */}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          removePortal(portal.id);
                                        }}
                                        className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  ))
                                ) : (
                                  <div className="col-span-3 text-center py-8">
                                    <p className="text-sm text-gray-500 italic">No portals added yet</p>
                                  </div>
                                )}
                              </div>
                              
                              {/* Add Portal Button */}
                              <Button
                                onClick={() => setShowPortalDialog(true)}
                                variant="outline"
                                className="w-full flex items-center gap-2 border hover:shadow-lg transition-all duration-200"
                                style={{ 
                                  backgroundColor: space.backgroundColor,
                                  borderColor: space.borderColor,
                                  color: getTextColorForBackground(space.backgroundColor) === 'text-gray-900' ? '#1f2937' : '#ffffff'
                                }}
                              >
                                <Plus className="w-4 h-4" />
                                Add Portal
                              </Button>
                            </div>
                          ) : (
                            // Regular card rendering
                            <div>
                              <div className="grid grid-cols-3 gap-2" data-onboarding="content-grid">
                                {card.items.length === 0 ? (
                                  <div className="col-span-3 text-center py-4">
                                    <p className="text-sm text-gray-500 italic">No items yet</p>
                                  </div>
                                ) : (
                                  card.items.map((item) => (
                                    <div 
                                      key={item.id} 
                                      className={`relative group rounded-lg p-2 transition-colors cursor-pointer`}
                                      onClick={() => {
                                        if (item.type === 'collection') {
                                          setCurrentCollection(item);
                                          setCollectionPath([...collectionPath, item.id]);
                                          setShowCollectionDialog(true);
                                        }
                                      }}
                                    >
                                      <div className="flex flex-col items-center text-center space-y-2 h-full justify-center">
                                        <div className={`rounded-lg border flex items-center justify-center bg-white relative ${item.type === 'collection' ? 'shadow-lg' : ''}`} style={{ borderColor: space.borderColor, width: '100px', height: '100px', minHeight: '100px', maxHeight: '100px' }}>
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
                                          <div className="relative z-10">
                                            {item.type === 'collection' ? <FolderOpen className="w-8 h-8" style={{ color: space.borderColor, strokeWidth: 1 }} /> : 
                                              typeof item.icon === 'string' ? 
                                                <span className="text-2xl">{item.icon}</span> : 
                                                typeof item.icon === 'object' && item.contentType ?
                                                  React.createElement(getContentTypeIcon(item.contentType) || FileText, { className: "w-8 h-8", style: { color: space.borderColor, strokeWidth: 1 } }) :
                                                  <FileText className="w-8 h-8" style={{ color: space.borderColor, strokeWidth: 1 }} />
                                            }
                                          </div>
                                          {/* Item count inside container for collections */}
                                          {item.type === 'collection' && (
                                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20" data-onboarding="collection-count">
                                              <div className="bg-purple-100 text-purple-600 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">
                                                {getCollectionItemCount(item)} {getCollectionItemCount(item) === 1 ? 'item' : 'items'}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                        <div className="w-full h-12 flex flex-col justify-center">
                                          <p className={`text-xs font-medium leading-tight line-clamp-2 ${item.type === 'collection' ? '' : ''}`} style={item.type === 'collection' ? { color: space.borderColor } : {}}>{item.title}</p>
                                          <p className="text-xs text-gray-600 line-clamp-1 leading-tight">{item.description}</p>
                                        </div>
                                        
                                        {/* Edit/Delete buttons for collections */}
                                        {item.type === 'collection' && isDesignMode && (
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
                                              className="h-6 w-6 p-0 bg-transparent hover:bg-red-100 border border-red-300 text-red-600 hover:text-red-700"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </Button>
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
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => {
                                      setCurrentCardId(card.id);
                                      setShowAddItemDialog(true);
                                    }}
                                    data-onboarding="add-item-button"
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Item
                                  </Button>
                                  
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => initializeCardAIDesigner(card.id, card.title)}
                                    className="border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 text-purple-700"
                                    title={`AI Designer for ${card.title}`}
                                  >
                                    <Star className="w-4 h-4 mr-1" />
                                    AI
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
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
                            data-onboarding="card-expansion"
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
                                    ? 'bg-gradient-to-br from-purple-50 to-blue-50' 
                                    : ''
                                }`}
                                onClick={() => item.type === 'collection' && (setCurrentCollection(item), setCollectionPath([...collectionPath, item.id]), setShowCollectionDialog(true))}
                              >
                                <div className="flex flex-col items-center text-center space-y-2 h-full justify-center">
                                  <div className={`rounded-lg border flex items-center justify-center bg-white relative ${item.type === 'collection' ? 'shadow-lg' : ''}`} style={{ borderColor: space.borderColor, width: '100px', height: '100px' }}>
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
                                    <div className="relative z-10 flex items-center justify-center w-full h-full">
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
                                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20">
                                        <div className="bg-purple-100 text-purple-600 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">
                                          {(item.children?.length || 0)} {(item.children?.length || 0) === 1 ? 'item' : 'items'}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <div className="w-full h-12 flex flex-col justify-center">
                                    <h4 className={`text-xs font-medium line-clamp-2 ${item.type === 'collection' ? '' : ''}`} style={item.type === 'collection' ? { color: space.borderColor } : {}}>{item.title}</h4>
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

        {/* Menu Button Search Dialog */}
        <Dialog open={showMenuButtonSearch} onOpenChange={setShowMenuButtonSearch}>
          <DialogContent className="max-w-md mx-auto max-w-[calc(100vw-2rem)] w-[calc(100vw-2rem)]">
            <DialogHeader>
              <DialogTitle>Select Target Content</DialogTitle>
              <p className="text-sm text-gray-600">Choose the content this menu button will link to</p>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Search content..."
                  value={menuButtonSearchQuery}
                  onChange={(e) => setMenuButtonSearchQuery(e.target.value)}
                />
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {(() => {
                  const allItems = getAllContentItems();
                  const filteredItems = allItems.filter(item => 
                    item.title.toLowerCase().includes(menuButtonSearchQuery.toLowerCase()) ||
                    item.description.toLowerCase().includes(menuButtonSearchQuery.toLowerCase())
                  );
                  
                  console.log('All content items:', allItems);
                  console.log('Search query:', menuButtonSearchQuery);
                  console.log('Filtered items:', filteredItems);
                  
                  return filteredItems.map((item) => {
                    const IconComponent = item.contentType ? getContentTypeIcon(item.contentType) : FileText;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          setNewItemMenuButtonTarget(item.id);
                          setShowMenuButtonSearch(false);
                          setMenuButtonSearchQuery("");
                        }}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3" style={{ backgroundColor: `${item.contentType === 'menu-button' ? '#f3f4f6' : '#e5e7eb'}` }}>
                          <IconComponent className="w-4 h-4" style={{ color: item.contentType === 'menu-button' ? '#6b7280' : '#374151' }} />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.title}</div>
                          <div className="text-xs text-gray-500">{item.description}</div>
                        </div>
                      </div>
                    );
                  });
                })()}
                {getAllContentItems().filter(item => 
                  item.title.toLowerCase().includes(menuButtonSearchQuery.toLowerCase()) ||
                  item.description.toLowerCase().includes(menuButtonSearchQuery.toLowerCase())
                ).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No content found</p>
                    <p className="text-xs">Try adjusting your search terms</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => {
                setShowMenuButtonSearch(false);
                setMenuButtonSearchQuery("");
              }}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Portal Selection Dialog */}
        <Dialog open={showPortalDialog} onOpenChange={setShowPortalDialog}>
          <DialogContent className="max-w-md mx-auto max-w-[calc(100vw-2rem)] w-[calc(100vw-2rem)]">
            <DialogHeader>
              <DialogTitle>Select Space to Add as Portal</DialogTitle>
              <p className="text-sm text-gray-600">Choose a space to create a portal to</p>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Search spaces..."
                  value={portalSearchQuery}
                  onChange={(e) => setPortalSearchQuery(e.target.value)}
                />
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {sampleSpaces
                  .filter(space => 
                    space.name.toLowerCase().includes(portalSearchQuery.toLowerCase()) ||
                    space.description.toLowerCase().includes(portalSearchQuery.toLowerCase())
                  )
                  .map((spaceData) => (
                    <div
                      key={spaceData.id}
                      className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      onClick={() => addPortal(spaceData)}
                    >
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center mr-3 shadow-md" 
                        style={{ backgroundColor: spaceData.color + '20', borderColor: spaceData.color }}
                      >
                        <span className="text-xl">{spaceData.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{spaceData.name}</div>
                        <div className="text-xs text-gray-500">{spaceData.description}</div>
                      </div>
                    </div>
                  ))}
                {sampleSpaces.filter(space => 
                  space.name.toLowerCase().includes(portalSearchQuery.toLowerCase()) ||
                  space.description.toLowerCase().includes(portalSearchQuery.toLowerCase())
                ).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No spaces found</p>
                    <p className="text-xs">Try adjusting your search terms</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => {
                setShowPortalDialog(false);
                setPortalSearchQuery("");
              }}>
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
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="infographic">Infographic</SelectItem>
                        <SelectItem value="guideline">Guideline</SelectItem>
                        <SelectItem value="article">Article</SelectItem>
                        <SelectItem value="interactive-content">Interactive Content</SelectItem>
                        <SelectItem value="external-link">External Link</SelectItem>
                        <SelectItem value="menu-button">Menu Button</SelectItem>
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
                  ) : newItemContentType === 'menu-button' ? (
                    <div>
                      <label className="text-sm font-medium">Target Content</label>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowMenuButtonSearch(true)}
                          className="w-full justify-start"
                        >
                          <Search className="w-4 h-4 mr-2" />
                          {newItemMenuButtonTarget ? 'Change Target' : 'Select Target Content'}
                        </Button>
                        {newItemMenuButtonTarget && (
                          <div className="text-sm text-gray-600">
                            Target: {getAllContentItems().find(item => item.id === newItemMenuButtonTarget)?.title || 'Unknown'}
                          </div>
                        )}
                      </div>
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
                  {editingCard.title === 'Portals' ? (
                    <div className="text-center py-2 px-3 bg-gray-50 rounded border text-sm text-gray-600">
                      Portals (Cannot be changed)
                    </div>
                  ) : (
                    <Input
                      value={editingCard.title}
                      onChange={(e) => setEditingCard({ ...editingCard, title: e.target.value })}
                    />
                  )}
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
            <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto w-full max-w-[calc(100vw-2rem)] w-[calc(100vw-2rem)]" data-onboarding="collection-dialog">
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
                                  {(card.children || []).length} {(card.children || []).length === 1 ? 'item' : 'items'}
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
                              {card.children && card.children.length > 0 ? (
                                card.children.map((item) => (
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
                                        data-onboarding="collection-item"
                                      >
                                    <div className="flex flex-col items-center text-center space-y-2 h-full justify-center">
                                      <div className={`rounded-lg border flex items-center justify-center bg-white relative ${item.type === 'collection' ? 'shadow-lg' : ''}`} style={{ borderColor: space.borderColor, width: '100px', height: '100px', minHeight: '100px', maxHeight: '100px' }}>
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
                                        <div className="relative z-10">
                                          {item.type === 'collection' ? <FolderOpen className="w-8 h-8" style={{ color: space.borderColor, strokeWidth: 1 }} /> : 
                                            typeof item.icon === 'string' ? 
                                              <span className="text-2xl">{item.icon}</span> : 
                                              typeof item.icon === 'object' && item.contentType ?
                                                React.createElement(getContentTypeIcon(item.contentType) || FileText, { className: "w-8 h-8", style: { color: space.borderColor, strokeWidth: 1 } }) :
                                                <FileText className="w-8 h-8" style={{ color: space.borderColor, strokeWidth: 1 }} />
                                          }
                                        </div>
                                        {/* Item count inside container for collections */}
                                        {item.type === 'collection' && (
                                          <div className="absolute bottom-1 right-1 bg-purple-100 text-purple-600 text-xs font-medium px-2 py-1 rounded-full">
                                            {(item.children?.length || 0)} {(item.children?.length || 0) === 1 ? 'item' : 'items'}
                                          </div>
                                        )}
                                      </div>
                                      <div className="w-full h-12 flex flex-col justify-center">
                                        <p className={`text-xs font-medium line-clamp-2 ${item.type === 'collection' ? '' : ''}`} style={item.type === 'collection' ? { color: space.borderColor } : {}}>{item.title}</p>
                                        <p className="text-xs text-gray-600 line-clamp-1 leading-tight">{item.description}</p>
                                      </div>
                                      
                                      {/* Edit/Delete buttons for collections */}
                                      {item.type === 'collection' && isDesignMode && (
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
                                            className="h-6 w-6 p-0 bg-transparent hover:bg-red-100 border border-red-300 text-red-600 hover:text-red-700"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
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
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => {
                                      setCurrentCardId(card.id);
                                      setShowAddItemDialog(true);
                                    }}
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Item
                                  </Button>
                                  
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => initializeCardAIDesigner(card.id, card.title)}
                                    className="border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 text-purple-700"
                                    title={`AI Designer for ${card.title}`}
                                  >
                                    <Star className="w-4 h-4 mr-1" />
                                    AI
                                  </Button>
                                </div>
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
                  <div className="pt-4 border-t space-y-2">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 border hover:shadow-lg transition-all duration-200"
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
                      
                      <Button
                        variant="outline"
                        onClick={() => initializeCollectionAIDesigner(currentCollection.id, currentCollection.title)}
                        className="border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 text-purple-700"
                        title={`AI Designer for ${currentCollection.title}`}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        AI Collection Designer
                      </Button>
                    </div>
                    
                    {/* Collection Template Button */}
                    <Button
                      variant="outline"
                      className="w-full"
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
                <label className="text-sm font-medium">Space Name</label>
                <Input
                  data-onboarding="space-title-input"
                  placeholder="Enter space name"
                  value={space.name}
                  onChange={(e) => setSpace({ ...space, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  data-onboarding="space-description"
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
                    data-onboarding="space-color-picker"
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
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    resetOnboarding();
                    setShowSpaceSettingsDialog(false);
                  }}
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Restart Tutorial
                </Button>
                <Button variant="outline" onClick={() => setShowSpaceSettingsDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* AI Designer Dialogs - Replaced with separate dialogs */}
        
        {/* Space AI Designer Dialog */}
        <Dialog open={showSpaceAIDesigner} onOpenChange={setShowSpaceAIDesigner}>
          <DialogContent className="!max-w-4xl !w-[95vw] !max-h-[90vh] !h-[90vh] flex flex-col !top-[5vh] !left-[2.5vw] !translate-x-0 !translate-y-0">
            {/* AI Magic Effect Overlay */}
            {isSpaceAiLoading && (
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 opacity-90 z-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="relative">
                    {/* Spinning stars */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Star className="w-8 h-8 text-purple-500 animate-spin" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Star className="w-6 h-6 text-blue-500 animate-spin" style={{ animationDelay: '0.5s' }} />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Star className="w-4 h-4 text-pink-500 animate-spin" style={{ animationDelay: '1s' }} />
                    </div>
                  </div>
                  <div className="mt-4 text-lg font-semibold text-purple-700">
                    ✨ Creating Space Organization ✨
                  </div>
                  <div className="text-sm text-purple-600 mt-1">
                    Applying space-level suggestions...
                  </div>
                </div>
              </div>
            )}
            
            <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="w-6 h-6" />
              AI Design Assistant
            </DialogTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Powered by OpenAI</span>
              </div>
            </DialogHeader>
            
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 p-4 border rounded-lg bg-gray-50">
            {spaceAiMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  <div className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                  
                  {/* Apply Suggestion Button for AI messages */}
                  {message.role === 'assistant' && message.id !== 'welcome' && isActionableSuggestion(message.content) && (
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applyCardAISuggestion(message.content)}
                        className="w-full bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border border-purple-200 text-purple-700"
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Apply This Suggestion
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isSpaceAiLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                    AI Space Designer is thinking...
                  </div>
                </div>
              </div>
            )}
          </div>
            
            {/* Input Area */}
            <div className="flex gap-2 p-4 border-t">
              <Input
                value={spaceAiInput}
                onChange={(e) => setSpaceAiInput(e.target.value)}
                placeholder="Ask me about space organization, medical specialties, or learning goals..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendSpaceAIMessage(spaceAiInput);
                  }
                }}
                disabled={isSpaceAiLoading}
                className="flex-1"
              />
              <Button
                onClick={() => sendSpaceAIMessage(spaceAiInput)}
                disabled={!spaceAiInput.trim() || isSpaceAiLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            
          {/* Quick Actions */}
          <div className="p-4 border-t bg-gray-50">
            <div className="text-sm font-medium text-gray-700 mb-2">Quick Actions:</div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendSpaceAIMessage("Create an emergency medicine template with triage protocols and critical care procedures")}
                disabled={isSpaceAiLoading}
                className="text-xs"
              >
                🚨 Emergency Medicine Template
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendSpaceAIMessage("Create a surgery template with preoperative assessment and technique videos")}
                disabled={isSpaceAiLoading}
                className="text-xs"
              >
                ⚕️ Surgery Template
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendSpaceAIMessage("Create a cardiology template with diagnostic tools and treatment protocols")}
                disabled={isSpaceAiLoading}
                className="text-xs"
              >
                ❤️ Cardiology Template
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendSpaceAIMessage("Create a pediatrics template with growth charts and developmental milestones")}
                disabled={isSpaceAiLoading}
                className="text-xs"
              >
                👶 Pediatrics Template
              </Button>
            </div>
          </div>
          </DialogContent>
        </Dialog>

        {/* Version Save Dialog */}
        <Dialog open={showVersionDialog} onOpenChange={setShowVersionDialog}>
          <DialogContent className="w-full max-w-[calc(100vw-2rem)]">
            <DialogHeader>
              <DialogTitle>Save Version</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Version Name *</label>
                <Input
                  placeholder="e.g., Medical Education v1.0"
                  value={versionName}
                  onChange={(e) => setVersionName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Description (Optional)</label>
                <Textarea
                  placeholder="Describe this version..."
                  value={versionDescription}
                  onChange={(e) => setVersionDescription(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>What happens when you save:</strong>
                </p>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  <li>• Your current space will be saved as a version</li>
                  <li>• You'll get a shareable link to continue working on this version</li>
                  <li>• The link can be shared with others or bookmarked</li>
                  <li>• You can create multiple versions of your space</li>
                </ul>
              </div>
            </div>
            <div className="flex justify-between gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowVersionDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={saveVersion}
                disabled={!versionName.trim() || isSavingVersion}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSavingVersion ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Version
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Space AI Designer Dialog */}
        <Dialog open={showSpaceAIDesigner} onOpenChange={setShowSpaceAIDesigner}>
          <DialogContent className="!max-w-4xl !w-[95vw] !max-h-[90vh] !h-[90vh] flex flex-col !top-[5vh] !left-[2.5vw] !translate-x-0 !translate-y-0">
            {/* AI Magic Effect Overlay */}
            {isSpaceAiLoading && (
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 opacity-90 z-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="relative">
                    {/* Spinning stars */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Star className="w-8 h-8 text-purple-500 animate-spin" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Star className="w-6 h-6 text-blue-500 animate-spin" style={{ animationDelay: '0.5s' }} />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Star className="w-4 h-4 text-pink-500 animate-spin" style={{ animationDelay: '1s' }} />
                    </div>
                  </div>
                  <div className="mt-4 text-lg font-semibold text-purple-700">
                    ✨ Creating Space Organization ✨
                  </div>
                  <div className="text-sm text-purple-600 mt-1">
                    Applying space-level suggestions...
                  </div>
                </div>
              </div>
            )}
            
            <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="w-6 h-6" />
              AI Space Designer
            </DialogTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Powered by OpenAI</span>
              </div>
            </DialogHeader>
            
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 p-4 border rounded-lg bg-gray-50">
            {spaceAiMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  <div className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                  
                  {/* Apply Suggestion Button for AI messages */}
                  {message.role === 'assistant' && message.id !== 'welcome' && (
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applySpaceAISuggestion(message.content)}
                        className="w-full bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border border-purple-200 text-purple-700"
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Apply This Space Organization
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isSpaceAiLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                    AI Space Designer is thinking...
                  </div>
                </div>
              </div>
            )}
          </div>
            
            {/* Input Area */}
            <div className="flex gap-2 p-4 border-t">
              <Input
                value={spaceAiInput}
                onChange={(e) => setSpaceAiInput(e.target.value)}
                placeholder="Ask me about space organization, medical specialties, or learning goals..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendSpaceAIMessage(spaceAiInput);
                  }
                }}
                disabled={isSpaceAiLoading}
                className="flex-1"
              />
              <Button
                onClick={() => sendSpaceAIMessage(spaceAiInput)}
                disabled={!spaceAiInput.trim() || isSpaceAiLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            
          {/* Quick Actions */}
          <div className="p-4 border-t bg-gray-50">
            <div className="text-sm font-medium text-gray-700 mb-2">Quick Actions:</div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendSpaceAIMessage("Create an emergency medicine template with triage protocols and critical care procedures")}
                className="text-xs"
              >
                🚨 Emergency Medicine Template
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendSpaceAIMessage("Create a surgery template with preoperative assessment and technique videos")}
                className="text-xs"
              >
                ⚕️ Surgery Template
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendSpaceAIMessage("Create a cardiology template with diagnostic tools and treatment protocols")}
                className="text-xs"
              >
                ❤️ Cardiology Template
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendSpaceAIMessage("Create a pediatrics template with growth charts and developmental milestones")}
                className="text-xs"
              >
                👶 Pediatrics Template
              </Button>
            </div>
          </div>
          </DialogContent>
        </Dialog>

        {/* Collection AI Designer Dialog */}
        <Dialog open={showCollectionAIDesigner} onOpenChange={setShowCollectionAIDesigner}>
          <DialogContent className="!max-w-4xl !w-[95vw] !max-h-[90vh] !h-[90vh] flex flex-col !top-[5vh] !left-[2.5vw] !translate-x-0 !translate-y-0">
            {/* AI Magic Effect Overlay */}
            {isCollectionAiLoading && (
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 opacity-90 z-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="relative">
                    {/* Spinning stars */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Star className="w-8 h-8 text-purple-500 animate-spin" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Star className="w-6 h-6 text-blue-500 animate-spin" style={{ animationDelay: '0.5s' }} />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Star className="w-4 h-4 text-pink-500 animate-spin" style={{ animationDelay: '1s' }} />
                    </div>
                  </div>
                  <div className="mt-4 text-lg font-semibold text-purple-700">
                    ✨ Creating Collection Structure ✨
                  </div>
                  <div className="text-sm text-purple-600 mt-1">
                    Applying collection-level suggestions...
                  </div>
                </div>
              </div>
            )}
            
            <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="w-6 h-6" />
              AI Collection Designer
            </DialogTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Powered by OpenAI</span>
              </div>
            </DialogHeader>
            
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 p-4 border rounded-lg bg-gray-50">
            {collectionAiMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  <div className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                  
                  {/* Apply Suggestion Button for AI messages */}
                  {message.role === 'assistant' && message.id !== 'welcome' && isActionableSuggestion(message.content) && (
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applyCollectionAISuggestion(message.content)}
                        className="w-full bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border border-purple-200 text-purple-700"
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Apply This Collection Structure
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isCollectionAiLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                    AI Collection Designer is thinking...
                  </div>
                </div>
              </div>
            )}
          </div>
            
            {/* Input Area */}
            <div className="flex gap-2 p-4 border-t">
              <Input
                value={collectionAiInput}
                onChange={(e) => setCollectionAiInput(e.target.value)}
                placeholder="Ask me about collection organization, medical topics, or learning paths..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendCollectionAIMessage(collectionAiInput);
                  }
                }}
                disabled={isCollectionAiLoading}
                className="flex-1"
              />
              <Button
                onClick={() => sendCollectionAIMessage(collectionAiInput)}
                disabled={!collectionAiInput.trim() || isCollectionAiLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            
          {/* Quick Actions */}
          <div className="p-4 border-t bg-gray-50">
            <div className="text-sm font-medium text-gray-700 mb-2">Quick Actions:</div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendCollectionAIMessage("Create cards for learning objectives and assessment")}
                className="text-xs"
              >
                📚 Learning Objectives
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendCollectionAIMessage("Create cards for case studies and clinical scenarios")}
                className="text-xs"
              >
                🏥 Case Studies
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendCollectionAIMessage("Create cards for diagnostic approach and treatment protocols")}
                className="text-xs"
              >
                🔬 Diagnostic Approach
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendCollectionAIMessage("Create cards for patient education and family counseling")}
                className="text-xs"
              >
                👨‍👩‍👧‍👦 Patient Education
              </Button>
            </div>
          </div>
          </DialogContent>
        </Dialog>

        {/* Card AI Designer Dialog */}
        <Dialog open={showCardAIDesigner} onOpenChange={setShowCardAIDesigner}>
          <DialogContent className="!max-w-4xl !w-[95vw] !max-h-[90vh] !h-[90vh] flex flex-col !top-[5vh] !left-[2.5vw] !translate-x-0 !translate-y-0">
            {/* AI Magic Effect Overlay */}
            {isCardAiLoading && (
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 opacity-90 z-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="relative">
                    {/* Spinning stars */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Star className="w-8 h-8 text-purple-500 animate-spin" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Star className="w-6 h-6 text-blue-500 animate-spin" style={{ animationDelay: '0.5s' }} />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Star className="w-4 h-4 text-pink-500 animate-spin" style={{ animationDelay: '1s' }} />
                    </div>
                  </div>
                  <div className="mt-4 text-lg font-semibold text-purple-700">
                    ✨ Creating Content ✨
                  </div>
                  <div className="text-sm text-purple-600 mt-1">
                    Applying content suggestions...
                  </div>
                </div>
              </div>
            )}
            
            <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="w-6 h-6" />
              AI Content Designer
            </DialogTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Powered by OpenAI</span>
              </div>
            </DialogHeader>
            
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 p-4 border rounded-lg bg-gray-50">
            {cardAiMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  <div className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                  
                  {/* Apply Suggestion Button for AI messages */}
                  {message.role === 'assistant' && message.id !== 'welcome' && isActionableSuggestion(message.content) && (
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applyCardAISuggestion(message.content)}
                        className="w-full bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border border-purple-200 text-purple-700"
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Apply This Content
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isCardAiLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                    AI Content Designer is thinking...
                  </div>
                </div>
              </div>
            )}
          </div>
            
            {/* Input Area */}
            <div className="flex gap-2 p-4 border-t">
              <Input
                value={cardAiInput}
                onChange={(e) => setCardAiInput(e.target.value)}
                placeholder="Ask me about content types, medical resources, or specific materials..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendCardAIMessage(cardAiInput);
                  }
                }}
                disabled={isCardAiLoading}
                className="flex-1"
              />
              <Button
                onClick={() => sendCardAIMessage(cardAiInput)}
                disabled={!cardAiInput.trim() || isCardAiLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            
          {/* Quick Actions */}
          <div className="p-4 border-t bg-gray-50">
            <div className="text-sm font-medium text-gray-700 mb-2">Quick Actions:</div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendCardAIMessage("Add video content for surgical procedures and patient consultations")}
                className="text-xs"
              >
                📹 Video Content
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendCardAIMessage("Add podcast content for medical discussions and case studies")}
                className="text-xs"
              >
                🎧 Podcast Content
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendCardAIMessage("Add document content for guidelines and protocols")}
                className="text-xs"
              >
                📄 Document Content
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendCardAIMessage("Add infographic content for visual learning materials")}
                className="text-xs"
              >
                📊 Infographic Content
              </Button>
            </div>
          </div>
          </DialogContent>
        </Dialog>
        
        {/* Onboarding Pointers */}
        {showOnboarding && onboardingTour && (
          <>
            <OnboardingPointer step={onboardingTour.steps[currentOnboardingStep]} isVisible={true} />
          </>
        )}
      </div>
    </div>
  );
}



