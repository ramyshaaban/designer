import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return new NextResponse(JSON.stringify({ error: 'Text is required for TTS.' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Generate unique filename for audio output
    const timestamp = Date.now();
    const audioFile = join(process.cwd(), `temp_audio_${timestamp}.wav`);

    try {
      // Try eSpeak first (more natural sounding)
      await generateSpeechWithEspeak(text, audioFile);
    } catch (espeakError) {
      console.log('eSpeak failed, trying Festival:', espeakError);
      try {
        // Fallback to Festival
        await generateSpeechWithFestival(text, audioFile);
      } catch (festivalError) {
        console.log('Festival failed, using browser TTS fallback:', festivalError);
        throw new Error('Both eSpeak and Festival failed');
      }
    }

    // Read the generated audio file
    const audioBuffer = require('fs').readFileSync(audioFile);
    
    // Clean up the temporary file
    unlinkSync(audioFile);

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error('Free TTS API error:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to generate speech with free TTS.' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// Generate speech using eSpeak
function generateSpeechWithEspeak(text: string, outputFile: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const espeak = spawn('espeak', [
      '-s', '150',        // Speed (words per minute)
      '-v', 'en+f3',      // Voice (English female)
      '-w', outputFile,   // Output file
      text
    ]);

    espeak.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`eSpeak exited with code ${code}`));
      }
    });

    espeak.on('error', (error) => {
      reject(error);
    });
  });
}

// Generate speech using Festival
function generateSpeechWithFestival(text: string, outputFile: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const festival = spawn('festival', [
      '--tts',
      '--pipe'
    ]);

    festival.stdin.write(`(utt.save.wave (utt.synth (Utterance Text "${text}")) "${outputFile}")`);
    festival.stdin.end();

    festival.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Festival exited with code ${code}`));
      }
    });

    festival.on('error', (error) => {
      reject(error);
    });
  });
}
