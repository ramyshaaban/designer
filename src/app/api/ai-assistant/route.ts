import { NextRequest, NextResponse } from 'next/server';

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

    // Check if OpenAI API key is available
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    let aiResponse = '';
    
    if (openaiApiKey) {
      try {
        // Dynamic import to avoid build-time errors
        const { default: OpenAI } = await import('openai');
        
        const openai = new OpenAI({
          apiKey: openaiApiKey,
        });

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

        aiResponse = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response at this time.";
      } catch (openaiError) {
        console.error('OpenAI API error:', openaiError);
        aiResponse = generateFallbackResponse(query, topResults);
      }
    } else {
      // Fallback response when OpenAI API key is not available
      aiResponse = generateFallbackResponse(query, topResults);
    }

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

function generateFallbackResponse(query: string, results: any[]): string {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('ecmo')) {
    return "ECMO (Extracorporeal Membrane Oxygenation) is a life-saving procedure used in pediatric patients with severe respiratory or cardiac failure. The procedure involves cannulating major vessels to provide temporary cardiopulmonary support. Key considerations include patient selection, cannulation technique, and ongoing monitoring. I've found relevant resources below to support your learning.";
  }
  
  if (lowerQuery.includes('appendectomy')) {
    return "Appendectomy is one of the most common emergency procedures in pediatric surgery. The procedure involves removing the inflamed appendix, typically through laparoscopic or open techniques. Preoperative preparation, antibiotic prophylaxis, and postoperative care are crucial for optimal outcomes. Check the resources below for detailed protocols.";
  }
  
  if (lowerQuery.includes('neonatal') || lowerQuery.includes('newborn')) {
    return "Neonatal surgery requires specialized techniques and considerations due to the unique physiology of newborns. Key factors include temperature regulation, fluid management, and careful monitoring of vital signs. Procedures must be adapted to the smaller anatomy and immature organ systems. I've identified relevant resources for you.";
  }
  
  if (results.length > 0) {
    return `Based on the CCHMC Pediatric Surgery protocols and guidelines, I found ${results.length} relevant resources for your question about "${query}". The available content includes procedures, guidelines, and educational materials. I've highlighted the most relevant resources below to support your learning.`;
  }
  
  return "I don't have specific information about that topic in the current CCHMC Pediatric Surgery content. Could you try rephrasing your question or ask about a different procedure? I'm here to help with pediatric surgery procedures, guidelines, and protocols.";
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
