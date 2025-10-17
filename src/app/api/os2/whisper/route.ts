import { NextRequest, NextResponse } from 'next/server';

/**
 * 🎤 API ENDPOINT WHISPER - Trascrizione audio con OpenAI Whisper
 * Converte audio in testo usando Whisper API
 */

export async function POST(request: NextRequest) {
  try {
    console.log('🎤 [Whisper API] Ricevuta richiesta trascrizione...');
    
    // Verifica API key OpenAI
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.error('❌ [Whisper API] OPENAI_API_KEY non configurata');
      return NextResponse.json(
        { error: 'OpenAI API key non configurata' },
        { status: 500 }
      );
    }

    // Estrai FormData dalla richiesta
    const formData = await request.formData();
    const audioFile = formData.get('file') as File;
    const model = formData.get('model') as string || 'whisper-1';
    const language = formData.get('language') as string || 'it';

    if (!audioFile) {
      console.error('❌ [Whisper API] Nessun file audio ricevuto');
      return NextResponse.json(
        { error: 'Nessun file audio fornito' },
        { status: 400 }
      );
    }

    console.log('📁 [Whisper API] File audio ricevuto:', {
      name: audioFile.name,
      size: audioFile.size,
      type: audioFile.type,
      model,
      language
    });

    // Verifica dimensioni file (max 25MB per Whisper)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (audioFile.size > maxSize) {
      console.error('❌ [Whisper API] File troppo grande:', audioFile.size);
      return NextResponse.json(
        { error: 'File audio troppo grande (max 25MB)' },
        { status: 400 }
      );
    }

    // Prepara FormData per OpenAI
    const openaiFormData = new FormData();
    openaiFormData.append('file', audioFile);
    openaiFormData.append('model', model);
    openaiFormData.append('language', language);
    openaiFormData.append('response_format', 'json');

    console.log('🚀 [Whisper API] Invio richiesta a OpenAI Whisper...');

    // Chiama OpenAI Whisper API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: openaiFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [Whisper API] Errore OpenAI:', response.status, errorText);
      
      return NextResponse.json(
        { 
          error: 'Errore trascrizione OpenAI',
          details: errorText,
          status: response.status 
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    
    console.log('✅ [Whisper API] Trascrizione completata:', {
      text: result.text?.substring(0, 100) + '...',
      length: result.text?.length
    });

    return NextResponse.json({
      success: true,
      text: result.text,
      model: model,
      language: language,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [Whisper API] Errore generale:', error);
    
    return NextResponse.json(
      { 
        error: 'Errore interno trascrizione',
        details: error instanceof Error ? error.message : 'Errore sconosciuto'
      },
      { status: 500 }
    );
  }
}

// Gestione metodi non supportati
export async function GET() {
  return NextResponse.json(
    { error: 'Metodo GET non supportato. Usa POST.' },
    { status: 405 }
  );
}
