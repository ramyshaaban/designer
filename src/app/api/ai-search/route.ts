import { NextRequest, NextResponse } from 'next/server';

interface ContentItem {
  id: string;
  title: string;
  type: string;
  specialty?: string;
  fileUrl?: string;
}

interface SearchResult {
  id: string;
  title: string;
  type: string;
  specialty?: string;
  fileUrl?: string;
  relevanceScore: number;
  matchedKeywords: string[];
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

    // Simple keyword-based search
    const searchResults: SearchResult[] = [];
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);

    allItems.forEach(item => {
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

    // Sort by relevance score
    searchResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Return top 10 results
    const topResults = searchResults.slice(0, 10);

    return NextResponse.json({
      query,
      results: topResults,
      totalFound: searchResults.length,
      totalItems: allItems.length
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
