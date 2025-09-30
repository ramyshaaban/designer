import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI only if API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export async function POST(request: NextRequest) {
  try {
    const { message, space } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // If OpenAI is not available, return a fallback response
    if (!openai) {
      return NextResponse.json({
        message: "I'm currently running in demo mode. To enable full AI capabilities, please add your OpenAI API key to the environment variables. For now, I can still help you with basic suggestions!",
        actions: []
      });
    }

    // Create a minimal space summary to avoid context length issues
    const spaceSummary = {
      name: space?.name || 'Untitled Space',
      description: space?.description || 'No description',
      cardCount: space?.cards?.length || 0,
      totalItems: space?.cards?.reduce((total: number, card: any) => total + (card.items?.length || 0), 0) || 0
    };

    const systemPrompt = `You are StayCurrentMD Designer, an AI assistant specialized in medical space design.

Space: ${spaceSummary.name} - ${spaceSummary.description}
Cards: ${spaceSummary.cardCount} | Items: ${spaceSummary.totalItems}

HIERARCHY UNDERSTANDING:
- Space: Main container (can modify name, color)
- Space Cards: Organizational bricks that host content and collections
- Collections: Folder system for curating content about specific medical topics
- Collection Cards: Cards inside collections (similar to space cards but with custom colors)
- Content: Final brick - any content type (videos, documents, articles, etc.)

For SPACE CARD suggestions, return JSON with actions:
{"message": "Here are some medical card suggestions for your space:", "actions": [{"type": "suggest_cards", "data": [{"title": "Card Title", "color": "#hexcolor", "type": "card_type", "description": "Brief description"}]}]}

For COLLECTION suggestions, return JSON with actions:
{"message": "Here are some medical collection suggestions for your space:", "actions": [{"type": "suggest_collections", "data": [{"title": "Collection Title", "description": "Collection description", "type": "collection"}]}]}

For CONTENT suggestions, return JSON with actions:
{"message": "Here are some medical content suggestions for your space:", "actions": [{"type": "suggest_content", "data": [{"title": "Content Title", "type": "content", "contentType": "video|podcast|document|infographic|guideline|article|interactive-content|external-link|menu-button", "description": "Brief description"}]}]}

IMPORTANT: When suggesting content, provide a diverse mix of content types. For each content suggestion, choose the most appropriate contentType from: video, podcast, document, infographic, guideline, article, interactive-content, external-link, menu-button. Suggest 6-8 different content items with varied types.

For collection card suggestions, return ONLY a JSON array:
[
  {"title": "Card Title", "color": "#hexcolor", "type": "card_type", "description": "Brief description"}
]

For SPACE MODIFICATION requests (name, description, color), return JSON:
{"message": "I'll help you modify your space", "actions": [{"type": "modify_space", "data": {"field": "name|description|color", "value": "new_value"}}]}

For other requests, return JSON:
{"message": "Your response", "actions": []}

Always provide helpful suggestions even if the space lacks specific medical context. Focus on practical medical content.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      return NextResponse.json({ error: 'No response from OpenAI' }, { status: 500 });
    }

    // Check if this is a description generation request
    if (message.includes('Generate a professional medical space description') && message.includes('Return only the description text, no JSON formatting')) {
      // Return plain text for description generation
      return NextResponse.json({
        message: response,
        actions: []
      });
    }

    try {
      const parsedResponse = JSON.parse(response);
      // If it's an array (collection card suggestions), return it directly
      if (Array.isArray(parsedResponse)) {
        return NextResponse.json(parsedResponse);
      }
      // Otherwise return as normal response
      return NextResponse.json(parsedResponse);
    } catch (parseError) {
      // If JSON parsing fails, return as plain message
      return NextResponse.json({
        message: response,
        actions: []
      });
    }

  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
