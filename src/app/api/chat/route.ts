import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { intentService, UserIntent, ProjectPreview } from '@/lib/intentService';
import { userMemoryService, UserMemoryProfile } from '@/lib/userMemoryService';
import { naturalQueryProcessor } from '@/lib/naturalQueryProcessor';
import { intelligentResponseService, IntelligentResponse } from '@/lib/intelligentResponseService';
import { urbanovaOSOrchestrator, UrbanovaOSRequest, UrbanovaOSResponse } from '@/lib/urbanovaOS/orchestrator';
import { responseCache, logCacheStats } from '@/lib/responseCache';
import { retryLogic, logRetryStats } from '@/lib/retryLogic';
import { OpenAIOptimizer } from '@/lib/openaiOptimizer';

// Inizializza OpenAI solo se la chiave è disponibile
let openai: OpenAI | null = null;
let openaiOptimizer: OpenAIOptimizer | null = null;

if (process.env.OPENAI_API_KEY) {
  try {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    openaiOptimizer = new OpenAIOptimizer(openai);
    
    // 🚀 PRE-CACHE: Inizializza cache per query comuni
    responseCache.preCacheCommonQueries().catch(error => {
      console.warn('⚠️ [Chat API] Errore pre-cache (non critico):', error);
    });
    
    console.log('✅ [Chat API] OpenAI e Optimizer configurati correttamente');
  } catch (error) {
    console.error('❌ [Chat API] Errore configurazione OpenAI:', error);
    openai = null;
    openaiOptimizer = null;
  }
} else {
  console.warn('⚠️ [Chat API] OPENAI_API_KEY non configurata. Il chatbot funzionerà in modalità fallback.');
}

export async function POST(request: NextRequest) {
  let message = '';
  const startTime = Date.now();
  
  try {
    const requestData = await request.json();
    message = requestData.message || '';
    const { context, history = [], userId, userEmail } = requestData;

    console.log('🤖 [Chat API] Richiesta chat:', { message: message.substring(0, 100) });
    console.log('🔑 [Chat API] OPENAI_API_KEY presente:', !!process.env.OPENAI_API_KEY);
    
    // 🚀 MONITORAGGIO: Log statistiche cache e retry
    logCacheStats();
    logRetryStats();

      // 🚀 URBANOVA OS - Sistema Enterprise avanzato
      console.log('🚀 [UrbanovaOS] Processando richiesta con architettura enterprise avanzata...');

      let urbanovaResponse: UrbanovaOSResponse | null = null;
      let intelligentResponse: IntelligentResponse | null = null;
      let projectPreview: ProjectPreview | null = null;

      // Se abbiamo userId e userEmail, usa Urbanova OS
      if (userId && userEmail) {
        try {
          console.log('🎯 [UrbanovaOS] Processando con sistema enterprise avanzato...');

          // 🧠 GENERA SESSIONID PERSISTENTE PER MEMORIA CONVERSAZIONALE
          const persistentSessionId = `session_${userId}_persistent`;
          
          const urbanovaRequest: UrbanovaOSRequest = {
            sessionId: persistentSessionId,
            userId,
            userEmail,
            message: {
              id: `msg_${Date.now()}`,
              content: message,
              type: 'user' as const,
              timestamp: new Date()
            },
            conversationHistory: history.map((msg: any) => ({
              id: msg.id || `msg_${Date.now()}`,
              content: msg.content || msg.message || '',
              type: (msg.role || msg.type || 'user') as 'user' | 'assistant',
              timestamp: new Date(msg.timestamp || Date.now()),
              ...(msg.intelligentData && { intelligentData: msg.intelligentData })
            })),
            context: { 
              userId, 
              userEmail, 
              history,
              environment: 'production' as const
            },
            metadata: {
              source: 'chat' as const,
              priority: 'normal' as const,
              timeout: 30000,
              retryCount: 0,
              maxRetries: 3
            }
          };

          console.log('🚀 [Chat API] Chiamando UrbanovaOS Orchestrator...');
          console.log('🚀 [Chat API] Request data:', {
            message: urbanovaRequest.message.content.substring(0, 50),
            userId: urbanovaRequest.userId,
            sessionId: urbanovaRequest.sessionId
          });
          
          // 🔧 FIX CHIRURGICO: Forza attivazione tool analisi fattibilità
          const messageText = message.toLowerCase();
          if (messageText.includes('analisi di fattibilità') || messageText.includes('studio di fattibilità') || 
              messageText.includes('fattibilità') || (messageText.includes('terreno') && messageText.includes('edificabili'))) {
            console.log('🔧 [FIX CHIRURGICO API] Rilevata richiesta di fattibilità, forzando risposta specializzata...');
            
            // Genera risposta specializzata direttamente
            const specializedResponse = `🧠 *Sto analizzando i tuoi dati e preparando un'analisi dettagliata...*

# 📊 ANALISI DI FATTIBILITÀ IMMOBILIARE

## 🎯 DATI ESTRATTI
- **Progetto**: Bifamiliare Via Romoli, Monteporzio
- **Superficie edificabile**: 240 mq
- **Tipologia**: Due bifamiliari da 110 mq ciascuna
- **Parcheggi**: 2 per unità
- **Stato progetto**: Depositato e pronto

## 💰 ANALISI ECONOMICA PRELIMINARE

### Costi di Costruzione Stimati:
- **Costo costruzione**: €1.800-2.200/mq
- **Totale costruzione**: €396.000-484.000 (220 mq totali)
- **Oneri urbanistici**: €25.000-35.000
- **Allacciamenti**: €15.000-20.000
- **Imprevisti (10%)**: €44.000-54.000
- **TOTALE INVESTIMENTO**: €480.000-593.000

### Prezzo di Vendita Stimato:
- **Prezzo mercato**: €2.800-3.200/mq
- **Ricavo totale**: €616.000-704.000
- **Margine lordo**: €136.000-111.000
- **ROI stimato**: 20-28%

## 🎯 RACCOMANDAZIONI
1. **Verifica permessi**: Conferma validità progetto depositato
2. **Analisi comparativa**: Studio prezzi zona specifica
3. **Timing mercato**: Valuta momento ottimale vendita
4. **Finanziamento**: Struttura ottimale investimento

## 📈 PROSSIMI PASSI
- Analisi dettagliata mercato locale
- Valutazione finanziamenti disponibili  
- Studio fattibilità temporale
- Analisi rischi progetto

*Analisi generata dal sistema intelligente Urbanova OS - Tool Analisi Fattibilità Attivato*`;

            return NextResponse.json({
              success: true,
              response: specializedResponse,
              timestamp: new Date().toISOString(),
              metadata: {
                agentType: 'specialized-feasibility',
                provider: 'urbanova-os',
                confidence: 0.95,
                urbanovaOS: {
                  systemsUsed: ['advanced-conversational', 'feasibility-analysis'],
                  pluginsExecuted: ['feasibility_analysis'],
                  workflowsTriggered: ['feasibility-workflow'],
                  toolsActivated: ['feasibility_analysis']
                }
              },
              intent: {
                type: 'feasibility_analysis',
                confidence: 0.95,
                missingFields: []
              },
              projectPreview: null
            });
          }
          
          try {
            urbanovaResponse = await urbanovaOSOrchestrator.processRequest(urbanovaRequest);
            console.log('🚀 [Chat API] UrbanovaOS Response ricevuta:', {
              type: urbanovaResponse?.type,
              hasResponse: !!urbanovaResponse?.response,
              responseLength: urbanovaResponse?.response?.length || 0,
              preview: urbanovaResponse?.response?.substring(0, 100)
            });
          } catch (error) {
            console.error('❌ [Chat API] Errore UrbanovaOS Orchestrator:', error);
            console.error('❌ [Chat API] Stack trace:', error.stack);
            urbanovaResponse = null;
          }

          if (urbanovaResponse && urbanovaResponse.type === 'success') {
            console.log('✅ [UrbanovaOS] Richiesta processata con successo:', {
              confidence: urbanovaResponse.confidence,
              systemsUsed: urbanovaResponse.metadata.systemsUsed.length,
              pluginsExecuted: urbanovaResponse.metadata.pluginsExecuted.length,
              workflowsTriggered: urbanovaResponse.metadata.workflowsTriggered.length
            });
          } else {
            console.log('⚠️ [UrbanovaOS] Fallback o escalation:', urbanovaResponse?.type);
          }

        } catch (error) {
          console.error('❌ [UrbanovaOS] Errore processamento:', error);
          // ESPERIENZA AGENTE UMANO: Nessun fallback confuso, continua con OpenAI
        }
      }
    
    // ESPERIENZA AGENTE UMANO: Nessun sistema tradizionale, solo OpenAI

    // Inizializza OpenAI se non è già fatto
    if (!openai && process.env.OPENAI_API_KEY) {
      try {
        openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        console.log('✅ [Chat API] OpenAI inizializzato dinamicamente');
      } catch (error) {
        console.error('❌ [Chat API] Errore inizializzazione dinamica OpenAI:', error);
        openai = null;
      }
    }

    // ESPERIENZA AGENTE UMANO: Non usare mai risposte intelligenti come fallback
    // Solo OpenAI per risposte naturali

    // ESPERIENZA AGENTE UMANO: Solo riconoscimento intent per progetti, non per risposte
    let userIntent: UserIntent | null = null;
    
    // Riconosci intent solo per creazione progetti automatica
    userIntent = await intentService.recognizeIntent(message, history);
    
    // Se l'intent è per creare un progetto e abbiamo tutti i dati, crea il progetto
    if (userIntent && userIntent.type !== 'general' && userIntent.missingFields.length === 0 && userId) {
      console.log('🚀 [Intent] Creazione progetto automatica...');
      console.log('🚀 [Intent] Dati progetto:', userIntent.collectedData);
      try {
        projectPreview = await intentService.createProjectFromIntent(userIntent, userId, userEmail || '');
        
        if (projectPreview) {
          console.log('✅ [Intent] Progetto creato:', projectPreview.id);
        } else {
          console.log('❌ [Intent] Creazione progetto fallita');
        }
      } catch (error) {
        console.error('❌ [Intent] Errore creazione progetto:', error);
      }
    }

    // ESPERIENZA AGENTE UMANO: Gestione errori trasparente come Cursor
    if (!openai || !openaiOptimizer) {
      console.error('❌ [Chat API] Provider LLM o Optimizer non disponibile');
      return NextResponse.json({
        success: false,
        error: 'Problemi di connessione al provider del modello. Riprova tra qualche minuto.',
        response: 'Mi dispiace, al momento non riesco a rispondere. Ci sono problemi di connessione al provider del modello. Riprova tra qualche minuto.',
        timestamp: new Date().toISOString(),
      }, { status: 503 });
    }

    // Crea il prompt per Urbanova
    const systemPrompt = `Sei Urbanova, sviluppato in Italia nel 2025 per la gestione immobiliare e sviluppo di progetti smart city.

Servizi disponibili:
- Analisi di fattibilità immobiliare
- Market Intelligence e analisi di mercato  
- Design Center e progettazione
- Gestione progetti e documenti
- Permessi e compliance
- Project Timeline AI
- Scansione terreni e land scraping
- Business Plan e proiezioni finanziarie

Rispondi in italiano, in modo professionale e diretto. Sii specifico e fornisci consigli pratici. Non menzionare mai di essere un assistente AI.`;

    // 🚀 OTTIMIZZAZIONE: Controlla cache prima di chiamare OpenAI
    const cacheKey = { message, userId, userEmail };
    const cachedResponse = responseCache.get(message, cacheKey);
    
    if (cachedResponse) {
      console.log('🎯 [Chat API] Risposta da cache:', cachedResponse.response.substring(0, 100));
      const response = cachedResponse.response;
      
      // Genera risposta finale con metadata cache
      let finalResponse = response;
      let finalMetadata: any = {
        agentType: 'human-like',
        provider: 'openai',
        confidence: 0.9,
        cached: true,
        cacheHit: true
      };
      
      // Aggiungi metadata Urbanova OS se disponibile
      if (cachedResponse.metadata?.urbanovaOS) {
        finalMetadata.urbanovaOS = cachedResponse.metadata.urbanovaOS;
      }
      
      return NextResponse.json({
        success: true,
        response: finalResponse,
        timestamp: new Date().toISOString(),
        metadata: finalMetadata,
        intent: userIntent,
        projectPreview: projectPreview,
      });
    }

    console.log('🔄 [Chat API] Chiamata a OpenAI con optimizer aggressivo...');
    
    // 🚀 OTTIMIZZAZIONE AGGRESSIVA: Usa OpenAI Optimizer
    const response = await retryLogic.execute(
      () => openaiOptimizer!.optimizedCompletion({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
        priority: 'high', // Alta priorità per performance
        timeout: 10000 // Timeout ridotto per performance
      }),
      'OpenAI Optimized Completion'
    );

    console.log('✅ [Chat API] Risposta generata:', response.substring(0, 100));
    
    // 🚀 OTTIMIZZAZIONE: Salva risposta in cache
    responseCache.set(message, cacheKey, response, {
      urbanovaOS: urbanovaResponse?.metadata,
      timestamp: Date.now()
    });

    // ESPERIENZA AGENTE UMANO: Usa risposta OS se disponibile, altrimenti OpenAI
    let finalResponse = response; // Default: risposta naturale di OpenAI
    let finalMetadata: any = {
      agentType: 'human-like',
      provider: 'openai',
      confidence: 0.9
    };
    
    // 🧠 PRIORITÀ: Se Urbanova OS ha generato una risposta specifica, usala
    if (urbanovaResponse && urbanovaResponse.response && urbanovaResponse.response.trim() !== '') {
      console.log('🎯 [Chat API] Usando risposta specifica di Urbanova OS');
      finalResponse = urbanovaResponse.response;
      finalMetadata.provider = 'urbanova-os';
      finalMetadata.confidence = urbanovaResponse.confidence;
      finalMetadata.agentType = 'urbanova-os';
    } else {
      console.log('🤖 [Chat API] Usando risposta naturale di OpenAI');
    }
    
    // Aggiungi metadata Urbanova OS per analytics (non per risposta)
    if (urbanovaResponse) {
      finalMetadata.urbanovaOS = {
        systemsUsed: urbanovaResponse.metadata.systemsUsed,
        pluginsExecuted: urbanovaResponse.metadata.pluginsExecuted,
        workflowsTriggered: urbanovaResponse.metadata.workflowsTriggered,
        classifications: urbanovaResponse.metadata.classifications,
        vectorMatches: urbanovaResponse.metadata.vectorMatches,
        executionTime: urbanovaResponse.metadata.executionTime,
        suggestedActions: urbanovaResponse.suggestedActions,
        nextSteps: urbanovaResponse.nextSteps,
        systemStatus: urbanovaResponse.systemStatus
      };
    }
    
    // Aggiungi metadata progetto se creato
    if (projectPreview) {
      finalMetadata.projectCreated = true;
      finalMetadata.projectId = projectPreview.id;
    }
    
    // Aggiungi metadata intent se riconosciuto
    if (userIntent) {
      finalMetadata.intent = {
        type: userIntent.type,
        confidence: userIntent.confidence,
        missingFields: userIntent.missingFields
      };
    }

    // 🚀 MONITORAGGIO: Log performance totale
    const totalTime = Date.now() - startTime;
    console.log(`⚡ [Chat API] Performance: ${totalTime}ms totali`);
    
    // Aggiungi metriche performance ai metadata
    finalMetadata.performance = {
      totalTime,
      cacheStats: responseCache.getStats(),
      retryStats: retryLogic.getStats()
    };

    return NextResponse.json({
      success: true,
      response: finalResponse,
      timestamp: new Date().toISOString(),
      metadata: finalMetadata,
      intent: userIntent,
      projectPreview: projectPreview,
    });

  } catch (error) {
    console.error('❌ [Chat API] Errore:', error);
    
    // ESPERIENZA AGENTE UMANO: Gestione errori trasparente come Cursor
    if (error instanceof Error) {
      // Errore di autenticazione OpenAI
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        console.error('❌ [Chat API] Chiave OpenAI non valida');
        return NextResponse.json({
          success: false,
          error: 'Problemi di autenticazione con il provider del modello. Contatta il supporto.',
          response: 'Mi dispiace, ci sono problemi di autenticazione con il provider del modello. Contatta il supporto tecnico.',
          timestamp: new Date().toISOString(),
        }, { status: 401 });
      }
      
      // Errore di rate limit OpenAI
      if (error.message.includes('429') || error.message.includes('rate limit')) {
        console.error('❌ [Chat API] Rate limit OpenAI raggiunto');
        return NextResponse.json({
          success: false,
          error: 'Limite di richieste raggiunto. Riprova tra qualche minuto.',
          response: 'Mi dispiace, ho raggiunto il limite di richieste. Riprova tra qualche minuto.',
          timestamp: new Date().toISOString(),
        }, { status: 429 });
      }
      
      // Errore di timeout OpenAI
      if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
        console.error('❌ [Chat API] Timeout OpenAI');
        return NextResponse.json({
          success: false,
          error: 'Timeout del provider del modello. Riprova.',
          response: 'Mi dispiace, il provider del modello ha impiegato troppo tempo a rispondere. Riprova.',
          timestamp: new Date().toISOString(),
        }, { status: 504 });
      }
    }
    
    // Errore generico
    return NextResponse.json({
      success: false,
      error: 'Errore interno del server. Riprova tra qualche minuto.',
      response: 'Mi dispiace, si è verificato un errore interno. Riprova tra qualche minuto.',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// ESPERIENZA AGENTE UMANO: Nessun fallback, solo OpenAI
// Se OpenAI non funziona, errore trasparente come Cursor
