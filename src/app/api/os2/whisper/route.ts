import { NextRequest, NextResponse } from 'next/server';

/**
 * 🎤 API ENDPOINT WHISPER - Trascrizione audio con OpenAI Whisper
 * Converte audio in testo usando Whisper API con rate limiting e fallback
 */

// Rate limiting semplice in memoria
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX_REQUESTS = 10; // Max 10 richieste per minuto per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🎤 [Whisper API] Ricevuta richiesta trascrizione...');
    
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    if (!checkRateLimit(ip)) {
      console.warn('🚫 [Whisper API] Rate limit raggiunto per IP:', ip);
      return NextResponse.json(
        { 
          error: 'Rate limit raggiunto. Riprova tra un minuto.',
          retryAfter: 60 
        },
        { status: 429 }
      );
    }
    
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

    // Retry logic per gestire rate limits OpenAI
    let response;
    let lastError;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
          },
          body: openaiFormData,
        });

        if (response.ok) {
          break; // Successo, esci dal loop
        }

        const errorText = await response.text();
        console.warn(`⚠️ [Whisper API] Tentativo ${attempt}/${maxRetries} fallito:`, response.status, errorText);
        
        // Se è un errore 429 (rate limit), aspetta prima del retry
        if (response.status === 429 && attempt < maxRetries) {
          const retryAfter = response.headers.get('retry-after');
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 2000 * attempt;
          console.log(`⏳ [Whisper API] Rate limit OpenAI, aspetto ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        lastError = { status: response.status, text: errorText };
        
      } catch (error) {
        console.warn(`⚠️ [Whisper API] Tentativo ${attempt}/${maxRetries} errore di rete:`, error);
        lastError = error;
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    if (!response || !response.ok) {
      console.error('❌ [Whisper API] Tutti i tentativi falliti:', lastError);
      
      // Gestione errori specifici
      if (lastError?.status === 429) {
        return NextResponse.json(
          { 
            error: 'OpenAI rate limit raggiunto. Riprova tra qualche minuto.',
            retryAfter: 300 // 5 minuti
          },
          { status: 429 }
        );
      }
      
      if (lastError?.status === 401) {
        return NextResponse.json(
          { 
            error: 'Problema di autenticazione OpenAI. Contatta il supporto.',
          },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Errore trascrizione OpenAI',
          details: lastError?.text || lastError?.message || 'Errore sconosciuto',
          status: lastError?.status || 500
        },
        { status: lastError?.status || 500 }
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
