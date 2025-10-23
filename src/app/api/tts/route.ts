// 🎤 API ENDPOINT PER OPENAI TTS
// Endpoint server-side per sintesi vocale di alta qualità

import { NextRequest, NextResponse } from 'next/server';
import { getOpenAITTS } from '@/services/OpenAITTS';

export async function POST(request: NextRequest) {
  try {
    const { text, voice = 'nova', speed = 1.0, hd = false } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Testo richiesto per sintesi vocale' },
        { status: 400 }
      );
    }

    if (text.length > 4000) {
      return NextResponse.json(
        { error: 'Testo troppo lungo (max 4000 caratteri)' },
        { status: 400 }
      );
    }

    console.log(`🎤 [TTS API] Richiesta sintesi: "${text.substring(0, 50)}..." con voce ${voice}`);

    const tts = getOpenAITTS();
    
    // Usa HD se richiesto, altrimenti normale
    const result = hd 
      ? await tts.synthesizeHD(text, { voice, speed })
      : await tts.synthesize(text, { voice, speed });

    // Converti ArrayBuffer in base64 per il client
    const base64Audio = Buffer.from(result.audioBuffer).toString('base64');

    return NextResponse.json({
      success: true,
      audio: base64Audio,
      duration: result.duration,
      voice: result.voice,
      format: 'mp3'
    });

  } catch (error) {
    console.error('❌ [TTS API] Errore:', error);
    
    return NextResponse.json(
      { 
        error: 'Errore sintesi vocale',
        details: error instanceof Error ? error.message : 'Errore sconosciuto'
      },
      { status: 500 }
    );
  }
}

// Endpoint per ottenere voci disponibili
export async function GET() {
  try {
    const tts = getOpenAITTS();
    const voices = tts.getAvailableVoices();
    const recommendedVoice = tts.getRecommendedVoiceForItalian();

    return NextResponse.json({
      success: true,
      voices,
      recommendedVoice,
      defaultOptions: {
        voice: recommendedVoice,
        speed: 1.0,
        format: 'mp3'
      }
    });

  } catch (error) {
    console.error('❌ [TTS API] Errore GET:', error);
    
    return NextResponse.json(
      { error: 'Errore recupero voci' },
      { status: 500 }
    );
  }
}
