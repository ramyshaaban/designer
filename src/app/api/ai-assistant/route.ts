import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ContentItem {
  id: string;
  title: string;
  type: string;
  specialty?: string;
  fileUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Load the intelligent space structure
    const fs = require('fs');
    const path = require('path');
    
    const structurePath = path.join(process.cwd(), 'intelligent_space_structure.json');
    const structureData = JSON.parse(fs.readFileSync(structurePath, 'utf8'));

    // Extract all content items
    const allItems: ContentItem[] = [];
    structureData.space_cards.forEach((spaceCard: any) => {
      spaceCard.collections.forEach((collection: any) => {
        collection.items.forEach((item: any) => {
          allItems.push({
            id: item.id,
            title: item.title,
            type: item.type,
            specialty: item.specialty,
            fileUrl: item.fileUrl
          });
        });
      });
    });

    // Search for relevant content
    const searchResults = searchContent(query, allItems);
    const topResults = searchResults.slice(0, 5);

    // Create context for OpenAI
    const context = createContext(topResults, query);

    // Generate AI response using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are Sarah, a CCHMC Pediatric Surgery AI Assistant. You are knowledgeable, professional, and helpful. You provide evidence-based answers about pediatric surgery procedures, guidelines, and protocols. Always be concise and clear, especially for mobile users.`
        },
        {
          role: "user",
          content: `Context: ${context}\n\nQuestion: ${query}\n\nPlease provide a helpful answer based on the available CCHMC content. If relevant resources are available, mention them naturally in your response.`
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response at this time.";

    return NextResponse.json({
      query,
      response: aiResponse,
      resources: topResults.map(result => ({
        id: result.id,
        title: result.title,
        type: result.type,
        specialty: result.specialty,
        fileUrl: result.fileUrl,
        relevanceScore: result.relevanceScore,
        matchedKeywords: result.matchedKeywords
      })),
      totalFound: searchResults.length,
      totalItems: allItems.length
    });

  } catch (error) {
    console.error('AI Assistant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function searchContent(query: string, items: ContentItem[]): any[] {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);

  const searchResults: any[] = [];

  items.forEach(item => {
    const titleLower = item.title.toLowerCase();
    const matchedKeywords: string[] = [];
    let relevanceScore = 0;

    // Exact phrase match
    if (titleLower.includes(queryLower)) {
      relevanceScore += 100;
      matchedKeywords.push(queryLower);
    }

    // Individual word matches
    queryWords.forEach(word => {
      if (titleLower.includes(word)) {
        relevanceScore += 50;
        matchedKeywords.push(word);
      }
    });

    // Type-based scoring
    if (queryLower.includes('video') && item.type === 'video') {
      relevanceScore += 25;
    }
    if (queryLower.includes('guideline') && item.type === 'guideline') {
      relevanceScore += 25;
    }
    if (queryLower.includes('document') && item.type === 'document') {
      relevanceScore += 25;
    }

    // Specialty-based scoring
    if (item.specialty && queryLower.includes(item.specialty)) {
      relevanceScore += 30;
      matchedKeywords.push(item.specialty);
    }

    if (relevanceScore > 0) {
      searchResults.push({
        ...item,
        relevanceScore,
        matchedKeywords
      });
    }
  });

  return searchResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

function createContext(results: any[], query: string): string {
  if (results.length === 0) {
    return "No specific content found for this query.";
  }

  let context = "Available CCHMC Pediatric Surgery content:\n";
  
  results.forEach((result, index) => {
    context += `${index + 1}. ${result.title} (${result.type})`;
    if (result.specialty) {
      context += ` - Specialty: ${result.specialty}`;
    }
    context += `\n`;
  });

  return context;
}
