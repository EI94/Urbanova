import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// 🛡️ OS PROTECTION
import '@/lib/osProtection';

// Inizializza OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, model = 'gpt-4', temperature = 0.1, max_tokens = 1000 } = await request.json();
    
    console.log('🧠 [OPENAI-INTENT] Analizzando intent con LLM...');
    console.log('🧠 [OPENAI-INTENT] Prompt:', prompt.substring(0, 200) + '...');
    
    if (!prompt) {
      return NextResponse.json({
        success: false,
        error: 'Prompt richiesto'
      }, { status: 400 });
    }

    // 🚀 CHIAMATA OPENAI PER ANALISI INTENT
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: 'Sei un assistente AI esperto in riconoscimento intent per sviluppo immobiliare. Analizza i messaggi degli utenti e determina le loro intenzioni con precisione. Rispondi sempre con JSON valido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: temperature,
      max_tokens: max_tokens,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0]?.message?.content || '';
    
    console.log('✅ [OPENAI-INTENT] Risposta LLM ricevuta:', response.substring(0, 200) + '...');
    
    return NextResponse.json({
      success: true,
      response: response,
      model: model,
      usage: completion.usage
    });

  } catch (error) {
    console.error('❌ [OPENAI-INTENT] Errore:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Errore nell\'analisi intent',
      details: (error as Error).message
    }, { status: 500 });
  }
}
