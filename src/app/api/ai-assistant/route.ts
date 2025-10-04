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

    // Generate URLs for resources (proxy or mock based on AWS availability)
    const resourcesWithUrls = await Promise.all(
      topResults.map(async (result) => {
        try {
          // Check if AWS credentials are available by testing the proxy API with HEAD request
          const proxyTest = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/proxy-content?id=${result.id}`, {
            method: 'HEAD'
          });
          
          if (proxyTest.ok) {
            // Use proxy API when AWS credentials are available
            return {
              id: result.id,
              title: result.title,
              type: result.type,
              specialty: result.specialty,
              fileUrl: `/api/proxy-content?id=${result.id}`,
              relevanceScore: result.relevanceScore,
              matchedKeywords: result.matchedKeywords
            };
          } else {
            // Use mock content API when AWS credentials are not available
            return {
              id: result.id,
              title: result.title,
              type: result.type,
              specialty: result.specialty,
              fileUrl: `/api/mock-content?id=${result.id}`,
              relevanceScore: result.relevanceScore,
              matchedKeywords: result.matchedKeywords,
              note: 'Development mode - AWS credentials not configured'
            };
          }
        } catch (error) {
          console.error('Error determining content access method for', result.id, error);
          // Fallback to mock content
          return {
            id: result.id,
            title: result.title,
            type: result.type,
            specialty: result.specialty,
            fileUrl: `/api/mock-content?id=${result.id}`,
            relevanceScore: result.relevanceScore,
            matchedKeywords: result.matchedKeywords
          };
        }
      })
    );

    return NextResponse.json({
      query,
      response: aiResponse,
      resources: resourcesWithUrls,
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
  
  if (lowerQuery.includes('appendectomy') || lowerQuery.includes('appendicitis') || lowerQuery.includes('apendicitis')) {
    return "Appendicitis is a common condition in pediatric patients where the appendix becomes inflamed and requires surgical intervention. At CCHMC, we have comprehensive guidelines for managing both perforated and non-perforated appendicitis cases. The treatment approach depends on the severity and whether the appendix has ruptured. Our protocols include both operative and non-operative management strategies, with detailed guidelines for each scenario. Check the resources below for specific protocols and procedures.";
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

  // Medical term synonyms and related terms (including common misspellings)
  const medicalSynonyms: { [key: string]: string[] } = {
    'appendicitis': ['appendix', 'appendectomy', 'appendiceal', 'perforated', 'non-operative', 'non-perforated', 'apendicitis', 'apendectomy', 'apendix'],
    'ecmo': ['extracorporeal', 'membrane', 'oxygenation', 'cannulation', 'cannulas'],
    'gastrointestinal': ['gi', 'intestinal', 'bowel', 'stomach', 'digestive'],
    'surgery': ['surgical', 'procedure', 'operation', 'operative'],
    'guideline': ['protocol', 'procedure', 'standard', 'policy'],
    'video': ['recording', 'demonstration', 'tutorial', 'training']
  };

  const searchResults: any[] = [];

  items.forEach(item => {
    const titleLower = item.title.toLowerCase();
    const matchedKeywords: string[] = [];
    let relevanceScore = 0;

    // Exact phrase match (highest priority)
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
      
      // Check for synonyms and related terms
      if (medicalSynonyms[word]) {
        medicalSynonyms[word].forEach(synonym => {
          if (titleLower.includes(synonym)) {
            relevanceScore += 40;
            matchedKeywords.push(synonym);
          }
        });
      }
    });

    // Reverse lookup - check if any query words are synonyms of terms in the title
    Object.keys(medicalSynonyms).forEach(key => {
      if (queryLower.includes(key)) {
        medicalSynonyms[key].forEach(synonym => {
          if (titleLower.includes(synonym)) {
            relevanceScore += 35;
            matchedKeywords.push(synonym);
          }
        });
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

    // Partial word matching for medical terms
    queryWords.forEach(word => {
      if (word.length > 4) { // Only for longer words to avoid false positives
        const partialMatches = titleLower.split(/\s+/).filter(titleWord => 
          titleWord.includes(word) || word.includes(titleWord)
        );
        if (partialMatches.length > 0) {
          relevanceScore += 20;
          matchedKeywords.push(...partialMatches);
        }
      }
    });

    // Fuzzy matching for common misspellings
    queryWords.forEach(word => {
      if (word.length > 6) { // Only for longer words
        // Check for common medical misspellings
        const misspellings: { [key: string]: string[] } = {
          'apendicitis': ['appendicitis'],
          'apendectomy': ['appendectomy'],
          'apendix': ['appendix'],
          'ecmo': ['extracorporeal', 'membrane', 'oxygenation'],
          'neonatal': ['neonatal', 'newborn'],
          'pediatric': ['pediatric', 'paediatric']
        };
        
        if (misspellings[word]) {
          misspellings[word].forEach(correctTerm => {
            if (titleLower.includes(correctTerm)) {
              relevanceScore += 30; // Higher score for corrected misspellings
              matchedKeywords.push(correctTerm);
            }
          });
        }
      }
    });

    if (relevanceScore > 0) {
      searchResults.push({
        ...item,
        relevanceScore: Math.min(relevanceScore, 100), // Cap at 100%
        matchedKeywords: [...new Set(matchedKeywords)] // Remove duplicates
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
