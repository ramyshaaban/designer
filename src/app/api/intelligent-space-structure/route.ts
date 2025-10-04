import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Read the intelligent space structure JSON file
    const filePath = path.join(process.cwd(), 'intelligent_space_structure.json');
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Intelligent space structure file not found' },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const intelligentStructure = JSON.parse(fileContent);

    // Validate the structure
    if (!intelligentStructure.space_cards || !Array.isArray(intelligentStructure.space_cards)) {
      return NextResponse.json(
        { error: 'Invalid intelligent space structure format' },
        { status: 500 }
      );
    }

    return NextResponse.json(intelligentStructure);
  } catch (error) {
    console.error('Error loading intelligent space structure:', error);
    return NextResponse.json(
      { error: 'Failed to load intelligent space structure', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
