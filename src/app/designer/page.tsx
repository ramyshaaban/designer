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
import { Plus, Edit, Trash2, Move, Eye, EyeOff, Save, X, Image, Link, FileText, Video, Calendar, Users, Settings, Folder, FolderOpen, Palette, Layout, Upload, Play, Mic, FileImage, BookOpen, ExternalLink, ChevronRight, ChevronLeft, PlayCircle, ChevronUp, ChevronDown, Share, Heart, Search, HelpCircle, ArrowRight, ArrowLeft, FileVideo, Headphones, File, BarChart3, ClipboardList, Newspaper, Gamepad2, Menu, Stethoscope, Star, Bot } from "lucide-react";
import AIDesigner from '@/components/AIDesigner';
import CollectionDesigner from '@/components/CollectionDesigner';
import MagicalStar from '@/components/MagicalStar';

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
    description: "My Space",
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
  const [showCollectionDialog, setShowCollectionDialog] = useState(false);
  const [showCollectionDesigner, setShowCollectionDesigner] = useState(false);
  const [magicalStarTarget, setMagicalStarTarget] = useState<string | null>(null);
  const [showSpaceSettingsDialog, setShowSpaceSettingsDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showCollectionTemplateDialog, setShowCollectionTemplateDialog] = useState(false);
  const [showAddCardDialog, setShowAddCardDialog] = useState(false);
  const [showEditCardDialog, setShowEditCardDialog] = useState(false);
  const [editCardTitle, setEditCardTitle] = useState("");
  const [editCardColor, setEditCardColor] = useState("#f3f4f6");
  const [isEditingSpaceTitle, setIsEditingSpaceTitle] = useState(false);
  const [showLogoUpload, setShowLogoUpload] = useState(false);
  const [currentCardId, setCurrentCardId] = useState<string | null>(null);
  const [currentCollection, setCurrentCollection] = useState<ContentItem | null>(null);
  const [collectionPath, setCollectionPath] = useState<string[]>([]); // Track path to current collection
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");

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

  // Auto-save space data when it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && hasUnsavedChanges) {
      const timer = setTimeout(() => {
        console.log('Auto-saving space data');
        localStorage.setItem('designer-space', JSON.stringify(space));
      }, 500); // Debounce for 500ms
      
      return () => clearTimeout(timer);
    }
  }, [space, hasUnsavedChanges]);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showAIDesigner, setShowAIDesigner] = useState(false);
  const [showCardMenu, setShowCardMenu] = useState<string | null>(null);
  const [showCollectionMenu, setShowCollectionMenu] = useState(false);

  // Close menus when clicking outside (no longer needed with Dialog components)
  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     if (showHamburgerMenu && !(event.target as Element).closest('.hamburger-menu')) {
  //       setShowHamburgerMenu(false);
  //     }
  //     if (showPlusMenu && !(event.target as Element).closest('.plus-menu')) {
  //       setShowPlusMenu(false);
  //     }
  //   };

  //   document.addEventListener('mousedown', handleClickOutside);
  //   return () => {
  //     document.removeEventListener('mousedown', handleClickOutside);
  //   };
  // }, [showHamburgerMenu, showPlusMenu]);

  // Close card menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showCardMenu && !(event.target as Element).closest('.card-menu')) {
        setShowCardMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCardMenu]);

  // Close collection menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showCollectionMenu && !(event.target as Element).closest('.collection-menu')) {
        setShowCollectionMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCollectionMenu]);

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
              isExpanded: card.isExpanded !== undefined ? card.isExpanded : false,
              // Ensure items also have proper structure
              items: card.items?.map((item: any) => {
                if (item.type === 'collection' && item.children) {
                  return {
                    ...item,
                    children: item.children.map((childCard: any) => ({
                      ...childCard,
                      isExpanded: childCard.isExpanded !== undefined ? childCard.isExpanded : false
                    }))
                  };
                }
                return item;
              }) || []
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
          // Collection cards have items, not children
          if (card.items) {
            allItems.push(...card.items);
            // Recursively add items from subcollections
            card.items.forEach(item => {
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
        description: "My Space",
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

  const handleAddCard = () => {
    addCard();
  };

  const handleEditCard = () => {
    // TODO: Implement edit card functionality
    setShowEditCardDialog(false);
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
    
    try {
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
        
        // Mark as changed to persist the expansion state
        markAsChanged();
      }
    } catch (error) {
      console.error('Error toggling card expansion:', error);
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

  const moveCollectionCardUp = (cardId: string) => {
    if (!currentCollection?.children) return;
    
    const cards = [...currentCollection.children];
    const currentIndex = cards.findIndex(card => card.id === cardId);
    
    if (currentIndex > 0) {
      // Swap with the card above
      [cards[currentIndex], cards[currentIndex - 1]] = [cards[currentIndex - 1], cards[currentIndex]];
      
      // Update order values
      cards.forEach((card, index) => {
        card.order = index;
      });
      
      setCurrentCollection({
        ...currentCollection,
        children: cards
      });
      markAsChanged();
    }
  };

  const moveCollectionCardDown = (cardId: string) => {
    if (!currentCollection?.children) return;
    
    const cards = [...currentCollection.children];
    const currentIndex = cards.findIndex(card => card.id === cardId);
    
    if (currentIndex < cards.length - 1) {
      // Swap with the card below
      [cards[currentIndex], cards[currentIndex + 1]] = [cards[currentIndex + 1], cards[currentIndex]];
      
      // Update order values
      cards.forEach((card, index) => {
        card.order = index;
      });
      
      setCurrentCollection({
        ...currentCollection,
        children: cards
      });
      markAsChanged();
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
      return 'https://designer.ramyshaaban.org';
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
      // For production, use path segments with /designer/ prefix
      return `https://designer.ramyshaaban.org/designer/${slug}`;
    }
    return `${getBaseUrl()}?version=${slug}`; // fallback
  };

  // Versioning functions
  const saveProductionVersion = async () => {
    try {
      // Generate a unique version ID
      const versionId = `production-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Generate a clean slug from the space name
      const versionSlug = space.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'production';
      
      // Create production version data (same as regular version but with production prefix)
      const versionData = {
        id: versionId,
        slug: versionSlug,
        name: `${space.name} - Production`,
        description: `Production version of ${space.name}`,
        space: space,
        timestamp: new Date().toISOString(),
        isProduction: true
      };

      // Save to localStorage
      const savedVersions = JSON.parse(localStorage.getItem('designer-versions') || '[]');
      savedVersions.push(versionData);
      localStorage.setItem('designer-versions', JSON.stringify(savedVersions));

      // Generate shareable URL
      const versionUrl = `${window.location.origin}/designer/${versionSlug}`;
      
      // Update saved versions list
      setSavedVersions(prev => [...prev, {
        id: versionId,
        name: versionData.name,
        description: versionData.description,
        timestamp: new Date(versionData.timestamp),
        url: versionUrl
      }]);

      // Show success message
      const shareText = `Production version "${versionData.name}" saved! Share this link: ${versionUrl}`;
      alert(shareText);
      
      // Copy to clipboard
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(versionUrl);
      }
      
    } catch (error) {
      console.error('Error saving production version:', error);
      alert('Failed to save production version. Please try again.');
    }
  };

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
      markAsChanged();
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
      markAsChanged();
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
      
      // Ensure all space cards have isExpanded property
      const ensureExpansionProperty = (cards: SpaceCard[]): SpaceCard[] => {
        return cards.map(card => ({
          ...card,
          isExpanded: card.isExpanded !== undefined ? card.isExpanded : false,
          items: card.items ? card.items.map(item => {
            if (item.type === 'collection' && item.children) {
              return {
                ...item,
                children: item.children.map(childCard => ({
                  ...childCard,
                  isExpanded: childCard.isExpanded !== undefined ? childCard.isExpanded : false
                }))
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

  const getCollectionCardCount = (collection: ContentItem) => {
    if (!collection.children) return 0;
    return collection.children.length;
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
    <div className="h-screen bg-gray-50 flex justify-center">
      {/* Magical Star Animation */}
      {magicalStarTarget && (
        <MagicalStar
          targetId={magicalStarTarget}
          duration={3000}
          size={20}
          color="#8B5CF6"
          onComplete={() => setMagicalStarTarget(null)}
        />
      )}
      
      {/* Main App Container */}
      <div className={`${showAIDesigner ? 'w-1/2' : 'w-full'} max-w-md bg-white h-screen overflow-y-auto relative`}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 z-50">
          {/* Mode Toggle and Hamburger Menu */}
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
            
            {/* AI Designer Button - Only in Design Mode */}
            {isDesignMode && (
            <div className="relative">
            <Button
              variant="outline"
              size="sm"
                onClick={() => setShowAIDesigner(!showAIDesigner)}
              className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 border border-purple-500 text-white shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:text-purple-200 hover:drop-shadow-[0_0_8px_rgba(196,181,253,0.8)] transition-all duration-300"
                title="AI Designer"
            >
                <Bot className="w-4 h-4" />
            </Button>
            </div>
            )}
            
            {/* Hamburger Menu */}
            <div className="relative hamburger-menu">
            <Button
              variant="outline"
              size="sm"
                onClick={() => setShowHamburgerMenu(!showHamburgerMenu)}
              className="bg-transparent hover:bg-gray-100 border border-gray-300"
                title="Menu"
            >
                <Menu className="w-4 h-4" />
            </Button>
            </div>
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
                {isDesignMode && isEditingSpaceTitle ? (
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
                    className={`text-xl font-bold text-gray-900 ${isDesignMode ? 'cursor-pointer hover:text-gray-600 transition-colors' : ''}`}
                    onClick={isDesignMode ? () => setIsEditingSpaceTitle(true) : undefined}
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

          {/* Settings Button - only in design mode */}
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
              
              <div className="flex justify-center gap-2">
                {/* Plus Menu */}
                <div className="relative plus-menu">
                <Button
                    variant="ghost"
                  size="sm"
                    onClick={() => setShowPlusMenu(!showPlusMenu)}
                    className="bg-transparent hover:bg-gray-100 border border-gray-300"
                    title="Add Content"
                  >
                    <Plus className="w-4 h-4" />
                </Button>
                </div>
                
                {/* Save Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={saveSpaceData}
                  disabled={isSaving}
                  className={`bg-transparent hover:bg-gray-100 border border-gray-300 ${
                    hasUnsavedChanges ? 'border-orange-300 bg-orange-50 text-orange-700' : ''
                  } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save (unsaved changes)' : 'Save'}
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                </Button>
                
                {/* Settings Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSpaceSettingsDialog(true)}
                  className="bg-transparent hover:bg-gray-100 border border-gray-300"
                  data-onboarding="space-settings-button"
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
                  <p className="text-gray-600">Use the + button above to add content to your space.</p>
                </div>
              ) : (
                // Cards Grid
                <div className="space-y-4">
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
                            <div className="flex items-center gap-1" data-onboarding="card-actions">
                              <div className="relative card-menu">
                              <Button
                                variant="ghost"
                                size="sm"
                                  onClick={() => setShowCardMenu(card.id)}
                                className="bg-transparent hover:bg-gray-100 border border-gray-300"
                                  title="Card Actions"
                              >
                                  <Menu className="w-4 h-4" />
                              </Button>
                                
                                {/* Card Menu Dropdown */}
                                {showCardMenu === card.id && (
                                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                                    <div className="py-1">
                                      <button
                                        onClick={() => {
                                          setEditingCard(card);
                                          setShowCardMenu(null);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 whitespace-nowrap"
                                      >
                                        <Edit className="w-4 h-4" />
                                        Edit Card
                                      </button>
                                      <button
                                        onClick={() => {
                                          setCurrentCardId(card.id);
                                          setShowAddItemDialog(true);
                                          setShowCardMenu(null);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 whitespace-nowrap"
                                      >
                                        <Plus className="w-4 h-4" />
                                        Add Item
                                      </button>
                                      <button
                                        onClick={() => {
                                          deleteCard(card.id);
                                          setShowCardMenu(null);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 whitespace-nowrap"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        Delete Card
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
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
                                        <div className={`rounded-lg border flex items-center justify-center bg-white relative ${item.type === 'collection' ? 'shadow-lg' : ''}`} style={{ borderColor: space.borderColor, width: '100px', height: '120px', minHeight: '120px', maxHeight: '120px' }}>
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
                                          {/* Edit/Delete buttons above icon container */}
                                          {isDesignMode && (
                                            <div className="absolute -top-2 -right-2 flex gap-2 z-10">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                if (item.type === 'collection') {
                                                  setCurrentCollection(item);
                                                  setShowCollectionDesigner(true);
                                                } else {
                                                setEditingItem(item);
                                                setCurrentCardId(card.id);
                                                setShowAddItemDialog(true);
                                                }
                                              }}
                                                className="h-8 w-8 p-0 bg-white hover:bg-blue-50 border-2 border-blue-200 text-blue-600 hover:text-blue-700 shadow-lg rounded-full hover:scale-105 transition-all duration-200"
                                                title="Edit item"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                deleteItem(card.id, item.id);
                                              }}
                                                className="h-8 w-8 p-0 bg-white hover:bg-red-50 border-2 border-red-200 text-red-600 hover:text-red-700 shadow-lg rounded-full hover:scale-105 transition-all duration-200"
                                                title="Delete item"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                          </div>
                                        )}
                                          <div className="relative z-10 -mt-8">
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
                                            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex flex-col space-y-1" data-onboarding="collection-count">
                                              <div className="bg-purple-100 text-purple-600 text-[10px] font-medium px-3 py-1 rounded-full text-center min-w-[70px]">
                                                <div className="truncate">{getCollectionCardCount(item)} cards</div>
                                              </div>
                                              <div className="bg-purple-100 text-purple-600 text-[10px] font-medium px-3 py-1 rounded-full text-center min-w-[70px]">
                                                <div className="truncate">{getCollectionItemCount(item)} items</div>
                                              </div>
                                          </div>
                                        )}
                                        </div>
                                        <div className="w-full h-12 flex flex-col justify-center">
                                          <p className={`text-xs font-medium leading-tight line-clamp-2 ${item.type === 'collection' ? '' : ''}`} style={item.type === 'collection' ? { color: space.borderColor } : {}}>{item.title}</p>
                                          <p className="text-xs text-gray-600 line-clamp-1 leading-tight">{item.description}</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                )}
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
                                        <div className="bg-purple-100 text-purple-600 text-[10px] font-medium px-3 py-1 rounded-full text-center min-w-[70px]">
                                          <div className="truncate">{getCollectionCardCount(item)} cards</div>
                                        </div>
                                        <div className="bg-purple-100 text-purple-600 text-[10px] font-medium px-3 py-1 rounded-full text-center min-w-[70px]">
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
                                        className="text-xs text-blue-600 hover:underline block mt-1"
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
          )}
        </div>

        {/* Add Card Dialog */}
        <Dialog open={showAddCardDialog} onOpenChange={setShowAddCardDialog}>
          <DialogContent className="max-w-sm mx-auto max-w-[calc(100vw-1rem)] w-[calc(100vw-1rem)] sm:max-w-sm">
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
                  className="min-h-[44px] text-base"
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
          <DialogContent className="max-w-md mx-auto max-w-[calc(100vw-1rem)] w-[calc(100vw-1rem)] sm:max-w-md">
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
          <DialogContent className="max-w-md mx-auto max-w-[calc(100vw-1rem)] w-[calc(100vw-1rem)] sm:max-w-md z-70">
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


        {/* Edit Card Dialog */}
        <Dialog open={showEditCardDialog} onOpenChange={setShowEditCardDialog}>
          <DialogContent className="max-w-sm mx-auto max-w-[calc(100vw-1rem)] w-[calc(100vw-1rem)] sm:max-w-sm z-70">
            <DialogHeader>
              <DialogTitle>Edit Card</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Card Title</label>
                <Input
                  placeholder="Enter card title"
                  value={editCardTitle}
                  onChange={(e) => setEditCardTitle(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Card Color</label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="color"
                    value={editCardColor}
                    onChange={(e) => setEditCardColor(e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <Input
                    value={editCardColor}
                    onChange={(e) => setEditCardColor(e.target.value)}
                    placeholder="#f3f4f6"
                    className="font-mono text-sm"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Choose a color for this collection card</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEditCardDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditCard} disabled={!editCardTitle.trim()}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Menu Button Search Dialog */}
        <Dialog open={showMenuButtonSearch} onOpenChange={setShowMenuButtonSearch}>
          <DialogContent className="max-w-md mx-auto max-w-[calc(100vw-1rem)] w-[calc(100vw-1rem)] sm:max-w-md">
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
                  className="min-h-[44px] text-base"
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
          <DialogContent className="max-w-md mx-auto max-w-[calc(100vw-1rem)] w-[calc(100vw-1rem)] sm:max-w-md">
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
                  className="min-h-[44px] text-base"
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
          <DialogContent className="max-w-sm mx-auto max-w-[calc(100vw-1rem)] w-[calc(100vw-1rem)] sm:max-w-sm z-[70]">
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
                  className="min-h-[44px] text-base"
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
                        className="min-h-[44px] text-base"
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
            <DialogContent className="max-w-sm mx-auto max-w-[calc(100vw-1rem)] w-[calc(100vw-1rem)] sm:max-w-sm">
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
                      className="min-h-[44px] text-base"
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
        {currentCollection && showCollectionDialog && (
          <div className="absolute inset-0 bg-black/50 z-60 flex items-center justify-center">
            <div 
              className="w-96 max-h-[calc(100vh-2rem)] overflow-y-auto bg-white border shadow-lg rounded-lg" 
              data-onboarding="collection-dialog"
            >
              <div className="p-6 pb-0">
                {isDesignMode ? (
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <FolderOpen className="w-6 h-6 text-purple-600" />
                    {currentCollection.title}
                  </h2>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">{space.name}'s Collections</p>
                    <h2 className="text-xl font-bold">
                      {currentCollection.title}
                    </h2>
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
                  
                  {/* Collection Menu */}
                  {isDesignMode && (
                    <div className="relative collection-menu">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCollectionMenu(!showCollectionMenu)}
                        className="flex items-center gap-1 px-3 py-1 bg-transparent hover:bg-gray-100 border border-gray-300 text-gray-600"
                        title="Add to Collection"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      
                      {/* Collection Menu Dropdown */}
                      {showCollectionMenu && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50 transform -translate-x-4">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                setShowAddCardDialog(true);
                                setShowCollectionMenu(false);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 whitespace-nowrap"
                            >
                              <Plus className="w-4 h-4" />
                              Add New Card
                            </button>
                            <button
                              onClick={() => {
                                setShowCollectionTemplateDialog(true);
                                setShowCollectionMenu(false);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 whitespace-nowrap"
                            >
                              <Layout className="w-4 h-4" />
                              Use Collection Template
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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
                            {isDesignMode && (
                              <div className="flex items-center justify-end gap-1 mb-2 -mt-3">
                                <div className="relative card-menu">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                    onClick={() => setShowCardMenu(card.id)}
                                  className="bg-transparent hover:bg-gray-100 border border-gray-300 h-8 w-8 p-0"
                                    title="Card Actions"
                                >
                                    <Menu className="w-3 h-3" />
                                </Button>
                                  
                                  {/* Card Menu Dropdown */}
                                  {showCardMenu === card.id && (
                                    <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                                      <div className="py-1">
                                        <button
                                          onClick={() => {
                                            setEditingCard(card);
                                            setShowCardMenu(null);
                                          }}
                                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 whitespace-nowrap"
                                        >
                                          <Edit className="w-4 h-4" />
                                          Edit Card
                                        </button>
                                        <button
                                          onClick={() => {
                                            setCurrentCardId(card.id);
                                            setShowAddItemDialog(true);
                                            setShowCardMenu(null);
                                          }}
                                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 whitespace-nowrap"
                                        >
                                          <Plus className="w-4 h-4" />
                                          Add Item
                                        </button>
                                        <button
                                  onClick={() => {
                                    setCurrentCollection({
                                      ...currentCollection,
                                      children: currentCollection.children?.filter(c => c.id !== card.id)
                                    });
                                            markAsChanged();
                                            setShowCardMenu(null);
                                  }}
                                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 whitespace-nowrap"
                                >
                                  <Trash2 className="w-4 h-4" />
                                          Delete Card
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveCollectionCardUp(card.id)}
                                  disabled={currentCollection.children?.findIndex(c => c.id === card.id) === 0}
                                  className="bg-transparent hover:bg-gray-100 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed h-8 w-8 p-0"
                                  title="Move up"
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveCollectionCardDown(card.id)}
                                  disabled={currentCollection.children?.findIndex(c => c.id === card.id) === (currentCollection.children?.length || 0) - 1}
                                  className="bg-transparent hover:bg-gray-100 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed h-8 w-8 p-0"
                                  title="Move down"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
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
                                      <div className={`rounded-lg border flex items-center justify-center bg-white relative ${item.type === 'collection' ? 'shadow-lg' : ''}`} style={{ borderColor: space.borderColor, width: '100px', height: '120px', minHeight: '120px', maxHeight: '120px' }}>
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
                                        {/* Edit/Delete buttons above icon container */}
                                        {isDesignMode && (
                                          <div className="absolute -top-2 -right-2 flex gap-2 z-10">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (item.type === 'collection') {
                                                setCurrentCollection(item);
                                                setShowCollectionDesigner(true);
                                              } else {
                                              setEditingItem(item);
                                              setCurrentCardId(card.id);
                                              setShowAddItemDialog(true);
                                              }
                                            }}
                                              className="h-8 w-8 p-0 bg-white hover:bg-blue-50 border-2 border-blue-200 text-blue-600 hover:text-blue-700 shadow-lg rounded-full hover:scale-105 transition-all duration-200"
                                              title="Edit item"
                                          >
                                              <Edit className="w-4 h-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              deleteItem(card.id, item.id);
                                            }}
                                              className="h-8 w-8 p-0 bg-white hover:bg-red-50 border-2 border-red-200 text-red-600 hover:text-red-700 shadow-lg rounded-full hover:scale-105 transition-all duration-200"
                                              title="Delete item"
                                          >
                                              <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      )}
                                        <div className="relative z-10 -mt-8">
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
                                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex flex-col space-y-1">
                                            <div className="bg-purple-100 text-purple-600 text-[10px] font-medium px-3 py-1 rounded-full text-center min-w-[70px]">
                                              <div className="truncate">{getCollectionCardCount(item)} cards</div>
                                            </div>
                                            <div className="bg-purple-100 text-purple-600 text-[10px] font-medium px-3 py-1 rounded-full text-center min-w-[70px]">
                                              <div className="truncate">{getCollectionItemCount(item)} items</div>
                                            </div>
                                        </div>
                                      )}
                                      </div>
                                      <div className="w-full h-12 flex flex-col justify-center">
                                        <p className={`text-xs font-medium line-clamp-2 ${item.type === 'collection' ? '' : ''}`} style={item.type === 'collection' ? { color: space.borderColor } : {}}>{item.title}</p>
                                        <p className="text-xs text-gray-600 line-clamp-1 leading-tight">{item.description}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="col-span-3 text-center py-4">
                                  <p className="text-xs text-gray-500 italic">No items yet</p>
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
                  <div className="text-center py-8 mt-8">
                    <p className="text-sm text-gray-500 italic">No cards in this collection yet</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between gap-2 pt-4 px-6 pb-6">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    saveCollectionChanges();
                    setCollectionPath([]);
                    setShowCollectionDialog(false);
                  }}
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
            </div>
          </div>
        )}

        {/* Hamburger Menu Modal */}
        <Dialog open={showHamburgerMenu} onOpenChange={setShowHamburgerMenu}>
          <DialogContent className="max-w-sm mx-auto max-w-[calc(100vw-1rem)] w-[calc(100vw-1rem)] sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Menu</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Button
                onClick={() => {
                  resetOnboarding();
                  setShowHamburgerMenu(false);
                }}
                variant="outline"
                className="w-full flex items-center gap-3 justify-start h-12 text-base"
              >
                <HelpCircle className="w-5 h-5" />
                Start Tutorial
              </Button>
              <Button
                onClick={() => {
                  setShowVersionDialog(true);
                  setShowHamburgerMenu(false);
                }}
                variant="outline"
                className="w-full flex items-center gap-3 justify-start h-12 text-base"
              >
                <Save className="w-5 h-5" />
                Save Version
              </Button>
              <Button
                onClick={() => {
                  saveProductionVersion();
                  setShowHamburgerMenu(false);
                }}
                variant="outline"
                className="w-full flex items-center gap-3 justify-start h-12 text-base"
              >
                <Eye className="w-5 h-5" />
                Save Production Version
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Plus Menu Modal */}
        <Dialog open={showPlusMenu} onOpenChange={setShowPlusMenu}>
          <DialogContent className="max-w-sm mx-auto max-w-[calc(100vw-1rem)] w-[calc(100vw-1rem)] sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Add Content</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Button
                onClick={() => {
                  setShowAddCardDialog(true);
                  setShowPlusMenu(false);
                }}
                variant="outline"
                className="w-full flex items-center gap-3 justify-start h-12 text-base"
              >
                <Plus className="w-5 h-5" />
                Add New Card
              </Button>
              {!hasPortalsCard() && (
                <Button
                  onClick={() => {
                    createPortalsCard();
                    setShowPlusMenu(false);
                  }}
                  variant="outline"
                  className="w-full flex items-center gap-3 justify-start h-12 text-base"
                >
                  <Plus className="w-5 h-5" />
                  Add Portals Card
                </Button>
              )}
              <Button
                onClick={() => {
                  setShowTemplateDialog(true);
                  setShowPlusMenu(false);
                }}
                variant="outline"
                className="w-full flex items-center gap-3 justify-start h-12 text-base"
              >
                <Layout className="w-5 h-5" />
                Use Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Space Settings Dialog */}
        <Dialog open={showSpaceSettingsDialog} onOpenChange={setShowSpaceSettingsDialog}>
          <DialogContent className="max-w-sm mx-auto max-w-[calc(100vw-1rem)] w-[calc(100vw-1rem)] sm:max-w-sm">
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
                  onChange={(e) => {
                    setSpace({ ...space, name: e.target.value });
                    markAsChanged();
                  }}
                  className="min-h-[44px] text-base"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  data-onboarding="space-description"
                  placeholder="Enter space description"
                  value={space.description}
                  onChange={(e) => {
                    setSpace({ ...space, description: e.target.value });
                    markAsChanged();
                  }}
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
            <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                  // Save the space data to localStorage
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('designer-space', JSON.stringify(space));
                  }
                  setHasUnsavedChanges(false);
                    setShowSpaceSettingsDialog(false);
                  }}
                className="text-green-600 border-green-300 hover:bg-green-50"
                >
                <Save className="w-4 h-4 mr-2" />
                Save
                </Button>
                <Button variant="outline" onClick={() => setShowSpaceSettingsDialog(false)}>
                  Close
                </Button>
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
      
      {/* AI Designer Container */}
      {showAIDesigner && (
      <div className="w-1/2 max-w-md h-screen">
        <AIDesigner 
          ref={(ref) => { if (ref) (window as any).aiDesignerRef = ref; }}
          space={space}
          onAddCard={(cardData) => {
            const newCard: SpaceCard = {
              id: `card-${Date.now()}`,
              title: cardData.title,
              color: cardData.color || '#f3f4f6',
              items: [],
              order: space.cards.length,
              isExpanded: false,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            setSpace({ ...space, cards: [...space.cards, newCard] });
            markAsChanged();
            
            // Trigger magical star animation
            setTimeout(() => {
              setMagicalStarTarget(newCard.id);
            }, 100);
          }}
          onDeleteCard={(cardId) => {
            setSpace({ ...space, cards: space.cards.filter(card => card.id !== cardId) });
            markAsChanged();
          }}
          onModifyCard={(cardId, cardData) => {
            setSpace({
              ...space,
              cards: space.cards.map(card => 
                card.id === cardId 
                  ? { ...card, ...cardData, updatedAt: new Date() }
                  : card
              )
            });
            markAsChanged();
          }}
          onAddCollection={(collectionData, targetCardId) => {
            const newCollection: ContentItem = {
              id: `collection-${Date.now()}`,
              type: 'collection',
              title: collectionData.title,
              description: collectionData.description,
              icon: FolderOpen,
              isPublic: false,
              children: [],
              order: 0,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            if (targetCardId) {
              // Add to specific card
              setSpace(prevSpace => {
                const updatedSpace = {
                  ...prevSpace,
                  cards: prevSpace.cards.map(card => 
                    card.id === targetCardId 
                      ? { ...card, items: [...card.items, newCollection], updatedAt: new Date() }
                      : card
                  )
                };
                
                // Notify AI Designer about the created collection
                console.log('Main app: Notifying AI Designer about created collection:', newCollection);
                if ((window as any).aiDesignerRef && (window as any).aiDesignerRef.onCollectionCreated) {
                  console.log('Main app: Calling onCollectionCreated callback');
                  (window as any).aiDesignerRef.onCollectionCreated(newCollection);
                } else {
                  console.log('Main app: AI Designer ref or callback not available');
                }
                
                return updatedSpace;
              });
            } else {
              // Add to first card or create a default card
              if (space.cards.length > 0) {
                const firstCard = space.cards[0];
                setSpace(prevSpace => {
                  const updatedSpace = {
                    ...prevSpace,
                    cards: prevSpace.cards.map(card => 
                      card.id === firstCard.id 
                        ? { ...card, items: [...card.items, newCollection], updatedAt: new Date() }
                        : card
                    )
                  };
                  
                  // Notify AI Designer about the created collection
                  console.log('Main app: Notifying AI Designer about created collection (fallback):', newCollection);
                  if ((window as any).aiDesignerRef && (window as any).aiDesignerRef.onCollectionCreated) {
                    console.log('Main app: Calling onCollectionCreated callback (fallback)');
                    (window as any).aiDesignerRef.onCollectionCreated(newCollection);
                  } else {
                    console.log('Main app: AI Designer ref or callback not available (fallback)');
                  }
                  
                  return updatedSpace;
                });
              }
            }
            markAsChanged();
            
            // Trigger magical star animation
            setTimeout(() => {
              setMagicalStarTarget(newCollection.id);
            }, 100);
          }}
          onAddCollectionCards={(collection, cards) => {
            console.log('Adding collection cards:', { collection, cards });
            console.log('Current space before update:', space);
            
            // Find the collection in the space and add cards to it
            setSpace(prevSpace => {
              console.log('Previous space:', prevSpace);
              
              const updatedSpace = {
                ...prevSpace,
                cards: prevSpace.cards.map(card => {
                  console.log('Processing card:', card.title, 'items:', card.items);
                  
                  const hasCollection = card.items.some((item: any) => item.id === collection.id);
                  console.log('Card has collection?', hasCollection, 'collection.id:', collection.id);
                  
                  if (hasCollection) {
                    console.log('Found collection in card:', card.title);
                    return {
                      ...card,
                      items: card.items.map((item: any) => {
                        console.log('Processing item:', item.title, 'item.id:', item.id, 'collection.id:', collection.id);
                        
                        if (item.id === collection.id) {
                          console.log('Found matching collection item, adding cards');
                          const newCards = cards.map((cardData: any, index: number) => ({
                            id: `collection-card-${Date.now()}-${index}`,
                            title: cardData.title,
                            color: cardData.color,
                            items: [],
                            order: (item.children || []).length + index,
                            isExpanded: false,
                            createdAt: new Date(),
                            updatedAt: new Date()
                          }));
                          
                          console.log('New cards to add:', newCards);
                          
                          return {
                            ...item,
                            children: [
                              ...(item.children || []),
                              ...newCards
                            ],
                            updatedAt: new Date()
                          };
                        }
                        return item;
                      }),
                      updatedAt: new Date()
                    };
                  }
                  return card;
                })
              };
              
              console.log('Updated space:', updatedSpace);
              
              // Find the updated collection and open it
              const updatedCollection = updatedSpace.cards
                .flatMap(card => card.items)
                .find(item => item.id === collection.id);
              
              console.log('Updated collection found:', updatedCollection);
              
              if (updatedCollection) {
                console.log('Opening collection dialog for:', updatedCollection);
                setCurrentCollection(updatedCollection);
                setCollectionPath([]);
                setShowCollectionDialog(true);
              }
              
              return updatedSpace;
            });
            markAsChanged();
          }}
          onAddContent={(cardId, contentData) => {
            const newContent: ContentItem = {
              id: `content-${Date.now()}`,
              type: 'content',
              title: contentData.title,
              description: '',
              contentType: contentData.contentType,
              icon: FileText,
              isPublic: false,
              order: 0,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            setSpace({
              ...space,
              cards: space.cards.map(card => 
                card.id === cardId 
                  ? { ...card, items: [...card.items, newContent], updatedAt: new Date() }
                  : card
              )
            });
            markAsChanged();
            
            // Trigger magical star animation
            setTimeout(() => {
              setMagicalStarTarget(newContent.id);
            }, 100);
          }}
          onModifySpace={(spaceData) => {
            setSpace({ ...space, ...spaceData, updatedAt: new Date() });
            markAsChanged();
          }}
          onOpenCollectionDesigner={(collection) => {
            setCurrentCollection(collection);
            setShowCollectionDesigner(true);
          }}
        />
      </div>
      )}
      
      {/* Collection Designer */}
      <CollectionDesigner
        collection={currentCollection}
        isOpen={showCollectionDesigner}
        onClose={() => setShowCollectionDesigner(false)}
        onSave={(updatedCollection) => {
          // Update the collection in the space
          setSpace(prevSpace => ({
            ...prevSpace,
            cards: prevSpace.cards.map(card => ({
              ...card,
              items: card.items.map(item => 
                item.id === updatedCollection.id ? {
                  ...item,
                  title: updatedCollection.title,
                  description: updatedCollection.description || ''
                } : item
              )
            }))
          }));
          setCurrentCollection({
            ...currentCollection!,
            title: updatedCollection.title,
            description: updatedCollection.description || ''
          });
          markAsChanged();
        }}
        onAddCard={(cardData) => {
          if (currentCollection) {
            const newCard: CollectionCard = {
              id: `collection-card-${Date.now()}`,
              title: cardData.title,
              color: cardData.color,
              items: [],
              order: (currentCollection.children?.length || 0) + 1,
              isExpanded: false,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            const updatedCollection = {
              ...currentCollection,
              children: [...(currentCollection.children || []), newCard]
            };
            
            setCurrentCollection(updatedCollection);
            
            // Trigger magical star animation
            setTimeout(() => {
              setMagicalStarTarget(newCard.id);
            }, 100);
            
            // Update in space
            setSpace(prevSpace => ({
              ...prevSpace,
              cards: prevSpace.cards.map(card => ({
                ...card,
                items: card.items.map(item => 
                  item.id === currentCollection.id ? updatedCollection : item
                )
              }))
            }));
            markAsChanged();
          }
        }}
        onEditCard={(cardId, cardData) => {
          if (currentCollection) {
            const updatedCollection = {
              ...currentCollection,
              children: currentCollection.children?.map(card => 
                card.id === cardId 
                  ? { ...card, ...cardData, updatedAt: new Date() }
                  : card
              ) || []
            };
            
            setCurrentCollection(updatedCollection);
            
            // Update in space
            setSpace(prevSpace => ({
              ...prevSpace,
              cards: prevSpace.cards.map(card => ({
                ...card,
                items: card.items.map(item => 
                  item.id === currentCollection.id ? updatedCollection : item
                )
              }))
            }));
            markAsChanged();
          }
        }}
        onDeleteCard={(cardId) => {
          if (currentCollection) {
            const updatedCollection = {
              ...currentCollection,
              children: currentCollection.children?.filter(card => card.id !== cardId) || []
            };
            
            setCurrentCollection(updatedCollection);
            
            // Update in space
            setSpace(prevSpace => ({
              ...prevSpace,
              cards: prevSpace.cards.map(card => ({
                ...card,
                items: card.items.map(item => 
                  item.id === currentCollection.id ? updatedCollection : item
                )
              }))
            }));
            markAsChanged();
          }
        }}
        onReorderCards={(cardIds) => {
          if (currentCollection && currentCollection.children) {
            const reorderedCards = cardIds.map((id, index) => {
              const card = currentCollection.children!.find(c => c.id === id);
              return card ? { ...card, order: index + 1 } : null;
            }).filter(Boolean) as CollectionCard[];
            
            const updatedCollection = {
              ...currentCollection,
              children: reorderedCards
            };
            
            setCurrentCollection(updatedCollection);
            
            // Update in space
            setSpace(prevSpace => ({
              ...prevSpace,
              cards: prevSpace.cards.map(card => ({
                ...card,
                items: card.items.map(item => 
                  item.id === currentCollection.id ? updatedCollection : item
                )
              }))
            }));
            markAsChanged();
          }
        }}
        showAddCardDialog={showAddCardDialog}
        setShowAddCardDialog={setShowAddCardDialog}
        showEditCardDialog={showEditCardDialog}
        setShowEditCardDialog={setShowEditCardDialog}
      />
    </div>
  );
}
