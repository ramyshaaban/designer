'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  AlertTriangle, 
  Baby, 
  Stethoscope, 
  GraduationCap, 
  BookOpen,
  Play,
  FileText,
  Image,
  Download,
  ExternalLink,
  Heart,
  Zap,
  Shield,
  Users,
  Clock,
  Star,
  Bot
} from 'lucide-react';

interface IntelligentSpaceContentItem {
  id: string;
  title: string;
  type: 'video' | 'document' | 'guideline' | 'image';
  specialty?: string;
  complexity?: string;
  procedure?: string;
  priority?: number;
  fileUrl?: string;
}

interface IntelligentCollection {
  id: string;
  title: string;
  description: string;
  items: IntelligentSpaceContentItem[];
}

interface IntelligentSpaceCard {
  id: string;
  title: string;
  color: string;
  description: string;
  priority: 'highest' | 'high' | 'medium' | 'low';
  content_count: number;
  collections: IntelligentCollection[];
}

interface IntelligentSpaceData {
  space_cards: IntelligentSpaceCard[];
  total_content: number;
  medical_insights: any;
  patterns: any;
}

export default function IntelligentSpacePage() {
  const [spaceData, setSpaceData] = React.useState<IntelligentSpaceData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/intelligent-space-structure');
        if (!response.ok) {
          throw new Error(`Failed to fetch intelligent space structure: ${response.status}`);
        }
        const data = await response.json();
        setSpaceData(data);
      } catch (err) {
        console.error('Error fetching intelligent space data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load space data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Loading intelligent space structure...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Space</h1>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!spaceData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Loading intelligent space structure...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <IntelligentSpaceContent spaceData={spaceData} />;
}

function IntelligentSpaceContent({ spaceData }: { spaceData: IntelligentSpaceData }) {
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'highest': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high': return <Heart className="w-4 h-4 text-orange-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'low': return <Star className="w-4 h-4 text-green-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'highest': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="w-4 h-4 text-blue-500" />;
      case 'document': return <FileText className="w-4 h-4 text-green-500" />;
      case 'guideline': return <BookOpen className="w-4 h-4 text-purple-500" />;
      case 'image': return <Image className="w-4 h-4 text-pink-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSpecialtyIcon = (specialty: string) => {
    switch (specialty) {
      case 'cardiovascular': return <Heart className="w-4 h-4 text-red-500" />;
      case 'neonatal': return <Baby className="w-4 h-4 text-pink-500" />;
      case 'pediatric': return <Users className="w-4 h-4 text-blue-500" />;
      case 'surgical': return <Stethoscope className="w-4 h-4 text-green-500" />;
      case 'gastrointestinal': return <Activity className="w-4 h-4 text-orange-500" />;
      case 'respiratory': return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'orthopedic': return <Shield className="w-4 h-4 text-purple-500" />;
      case 'urological': return <Activity className="w-4 h-4 text-indigo-500" />;
      case 'oncology': return <Heart className="w-4 h-4 text-pink-500" />;
      case 'infectious_disease': return <Shield className="w-4 h-4 text-red-500" />;
      case 'anesthesia': return <Zap className="w-4 h-4 text-blue-500" />;
      case 'critical_care': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'general': return <Activity className="w-4 h-4 text-gray-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                CCHMC Pediatric Surgery - Intelligent Structure
              </h1>
              <p className="text-lg text-gray-600">
                AI-powered content organization and medical insights
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-green-600/20 text-green-600 border-green-600/30 text-sm px-3 py-1">
                Intelligent Structure
              </Badge>
              <Button
                onClick={() => window.location.href = '/ai-assistant'}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border border-purple-500 px-4 py-2 rounded-lg relative overflow-hidden group hover:scale-105 transition-all duration-300"
              >
                <Bot className="w-4 h-4 mr-2" />
                Ask Sarah
              </Button>
              <Button
                onClick={() => window.location.href = '/voice-assistant'}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border border-purple-500 px-4 py-2 rounded-lg relative overflow-hidden group hover:scale-105 transition-all duration-300"
              >
                <Bot className="w-4 h-4 mr-2" />
                Voice Assistant
              </Button>
            </div>
          </div>
          
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white/80 backdrop-blur-sm border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Total Items</p>
                    <p className="text-2xl font-bold text-gray-900">{spaceData.total_content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600">Space Cards</p>
                    <p className="text-2xl font-bold text-gray-900">{spaceData.space_cards.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-600">High Priority</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {spaceData.space_cards.filter(card => card.priority === 'highest' || card.priority === 'high').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Medical Focus</p>
                    <p className="text-2xl font-bold text-gray-900">Pediatric Surgery</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Space Cards */}
        <div className="space-y-6">
          {spaceData.space_cards.map((spaceCard) => (
            <Card key={spaceCard.id} className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold"
                      style={{ backgroundColor: spaceCard.color }}
                    >
                      {spaceCard.title.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        {spaceCard.title}
                        {getPriorityIcon(spaceCard.priority)}
                      </CardTitle>
                      <p className="text-gray-600 mt-1">{spaceCard.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getPriorityColor(spaceCard.priority)} text-sm px-3 py-1`}>
                      {spaceCard.priority.toUpperCase()} PRIORITY
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-sm px-3 py-1">
                      {spaceCard.content_count} items
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {spaceCard.collections.map((collection) => (
                    <div key={collection.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{collection.title}</h3>
                        <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-xs px-2 py-1">
                          {collection.items.length} items
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{collection.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {collection.items.map((item) => (
                          <div
                            key={item.id}
                            className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => {
                              // Open content in new tab
                              const url = `/api/proxy-content?id=${item.id}`;
                              window.open(url, '_blank');
                            }}
                          >
                            <div className="flex items-start gap-2">
                              <div className="flex-shrink-0 mt-1">
                                {getContentIcon(item.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                                  {item.title}
                                </h4>
                                <div className="flex items-center gap-1 flex-wrap">
                                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs px-1.5 py-0.5">
                                    {item.type}
                                  </Badge>
                                  {item.specialty && (
                                    <div className="flex items-center gap-1">
                                      {getSpecialtyIcon(item.specialty)}
                                      <span className="text-xs text-gray-500">{item.specialty}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}