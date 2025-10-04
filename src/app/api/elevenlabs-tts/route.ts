import { NextResponse } from 'next/server';
import { ElevenLabs } from '@elevenlabs/elevenlabs-js';

const elevenlabs = new ElevenLabs({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export async function POST(req: Request) {
  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      return new NextResponse(JSON.stringify({ error: 'ElevenLabs API Key not configured.' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const { text } = await req.json();

    if (!text) {
      return new NextResponse(JSON.stringify({ error: 'Text is required for TTS.' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Use a natural female voice (Sarah)
    const audio = await elevenlabs.generate({
      voice: "Sarah", // Natural female voice
      text: text,
      model_id: "eleven_multilingual_v2", // High quality model
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5,
        style: 0.0,
        use_speaker_boost: true
      }
    });

    // Convert the audio stream to buffer
    const chunks = [];
    const reader = audio.getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error('ElevenLabs TTS API error:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to generate speech.' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
