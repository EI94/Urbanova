import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { intentService, UserIntent, ProjectPreview } from '@/lib/intentService';
import { userMemoryService, UserMemoryProfile } from '@/lib/userMemoryService';
import { naturalQueryProcessor } from '@/lib/naturalQueryProcessor';
import { intelligentResponseService, IntelligentResponse } from '@/lib/intelligentResponseService';
import { sofiaOrchestrator, SofiaRequest, SofiaResponse } from '@/lib/sofiaOrchestrator';

// Inizializza OpenAI solo se la chiave è disponibile
let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  try {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log('✅ [Chat API] OpenAI configurato correttamente');
  } catch (error) {
    console.error('❌ [Chat API] Errore configurazione OpenAI:', error);
    openai = null;
  }
} else {
  console.warn('⚠️ [Chat API] OPENAI_API_KEY non configurata. Il chatbot funzionerà in modalità fallback.');
}

export async function POST(request: NextRequest) {
  let message = '';
  
  try {
    const requestData = await request.json();
    message = requestData.message || '';
    const { context, history = [], userId, userEmail } = requestData;

    console.log('🤖 [Chat API] Richiesta chat:', { message: message.substring(0, 100) });
    console.log('🔑 [Chat API] OPENAI_API_KEY presente:', !!process.env.OPENAI_API_KEY);

    // 🚀 SOFIA 2.0 - Sistema conversazionale avanzato
    console.log('🚀 [SOFIA 2.0] Processando richiesta con architettura conversazionale avanzata...');
    
    let sofiaResponse: SofiaResponse | null = null;
    let intelligentResponse: IntelligentResponse | null = null;
    let projectPreview: ProjectPreview | null = null;
    
    // Se abbiamo userId e userEmail, usa SOFIA 2.0
    if (userId && userEmail) {
      try {
        console.log('🎯 [SOFIA 2.0] Processando con sistema conversazionale avanzato...');
        
        const sofiaRequest: SofiaRequest = {
          sessionId: `session_${userId}_${Date.now()}`,
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
          context: { userId, userEmail, history }
        };
        
        sofiaResponse = await sofiaOrchestrator.processRequest(sofiaRequest);
        
        if (sofiaResponse && sofiaResponse.type === 'success') {
          console.log('✅ [SOFIA 2.0] Richiesta processata con successo:', {
            confidence: sofiaResponse.confidence,
            systemsUsed: sofiaResponse.metadata.systemsUsed.length,
            memoryUpdated: sofiaResponse.metadata.memoryUpdated
          });
        } else {
          console.log('⚠️ [SOFIA 2.0] Fallback o escalation:', sofiaResponse?.type);
        }
        
      } catch (error) {
        console.error('❌ [SOFIA 2.0] Errore processamento:', error);
        
        // Fallback al sistema tradizionale
        console.log('🔄 [SOFIA 2.0] Fallback a sistema tradizionale...');
        
        try {
          const queryResult = await userMemoryService.processNaturalQuery(message, userId, userEmail, history);
          
          if (queryResult.success) {
            const userProfile = await userMemoryService.getUserProfile(userId);
            if (userProfile) {
              intelligentResponse = await intelligentResponseService.generateResponse({
                userProfile,
                queryResult,
                conversationHistory: history,
                currentIntent: 'query',
                sessionData: {}
              });
            }
          }
        } catch (fallbackError) {
          console.error('❌ [Sistema Tradizionale] Errore anche nel fallback:', fallbackError);
        }
      }
    }
    
    // Se non abbiamo risposta da SOFIA 2.0, usa il sistema tradizionale
    if (!sofiaResponse && !intelligentResponse) {
      console.log('🔄 [Sistema Tradizionale] Usando sistema tradizionale...');
      
      // Il sistema tradizionale verrà gestito più avanti nel codice
    }

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

    // Se abbiamo una risposta intelligente, usala
    if (intelligentResponse) {
      console.log('✅ [Angelo Custode] Usando risposta intelligente');
      return NextResponse.json({
        success: true,
        response: intelligentResponse.response,
        type: intelligentResponse.type,
        confidence: intelligentResponse.confidence,
        relatedData: intelligentResponse.relatedData,
        followUpQuestions: intelligentResponse.followUpQuestions,
        actions: intelligentResponse.actions,
        visualizations: intelligentResponse.visualizations,
        projectPreview: projectPreview,
        timestamp: new Date().toISOString(),
      });
    }

    // Se non abbiamo risposta intelligente, usa il sistema tradizionale
    let userIntent: UserIntent | null = null;
    
    // Riconosci intent per il sistema tradizionale
    if (!intelligentResponse) {
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
    }

    // Se OpenAI non è disponibile, usa risposte predefinite
    if (!openai) {
      console.warn('⚠️ [Chat API] OpenAI non configurato, usando risposte predefinite');
      return NextResponse.json({
        success: true,
        response: getFallbackResponse(message),
        projectPreview: projectPreview,
        timestamp: new Date().toISOString(),
      });
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

    console.log('🔄 [Chat API] Chiamata a OpenAI...');
    
    const completion = await openai.chat.completions.create({
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
    });

    const response = completion.choices[0]?.message?.content || 'Mi dispiace, non sono riuscito a generare una risposta.';

    console.log('✅ [Chat API] Risposta generata:', response.substring(0, 100));

    // Genera risposta finale
    let finalResponse = response;
    let finalMetadata: any = {};
    
    // Se abbiamo risposta da SOFIA 2.0, usala
    if (sofiaResponse) {
      finalResponse = sofiaResponse.response;
      finalMetadata = {
        sofia: true,
        confidence: sofiaResponse.confidence,
        systemsUsed: sofiaResponse.metadata.systemsUsed,
        memoryUpdated: sofiaResponse.metadata.memoryUpdated,
        personalityAdapted: sofiaResponse.metadata.personalityAdapted,
        learningApplied: sofiaResponse.metadata.learningApplied,
        conversationPhase: sofiaResponse.metadata.conversationPhase,
        userMood: sofiaResponse.metadata.userMood,
        complexity: sofiaResponse.metadata.complexity,
        suggestedActions: sofiaResponse.suggestedActions,
        nextSteps: sofiaResponse.nextSteps,
        systemStatus: sofiaResponse.systemStatus
      };
    } else if (intelligentResponse) {
      // Se abbiamo risposta intelligente tradizionale, usala
      finalResponse = (intelligentResponse as any).response || (intelligentResponse as any).message || 'Risposta intelligente generata';
      finalMetadata = {
        sofia: false,
        intelligent: true,
        confidence: (intelligentResponse as any).confidence || 0.8,
        type: (intelligentResponse as any).type || 'intelligent'
      };
    } else {
      // Se abbiamo un progetto creato, usa la risposta intelligente
      if (projectPreview && userIntent) {
        finalResponse = intentService.generateIntelligentResponse(userIntent, projectPreview);
      } else if (userIntent && userIntent.type !== 'general' && userIntent.missingFields.length > 0) {
        // Se mancano informazioni, usa la risposta intelligente per raccogliere dati
        finalResponse = intentService.generateIntelligentResponse(userIntent);
      }
      
      finalMetadata = {
        sofia: false,
        intelligent: false,
        traditional: true,
        intent: userIntent,
        projectPreview: projectPreview
      };
    }

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
    
    // Se è un errore di autenticazione OpenAI, usa fallback
    if (error instanceof Error && error.message.includes('401')) {
      console.warn('⚠️ [Chat API] Chiave OpenAI non valida, usando fallback');
      return NextResponse.json({
        success: true,
        response: getFallbackResponse(message),
        timestamp: new Date().toISOString(),
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Errore interno del server',
      response: getFallbackResponse(message),
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('analisi') || lowerMessage.includes('fattibilità')) {
    return `📊 **Analisi di Fattibilità**

Posso aiutarti con l'analisi di fattibilità immobiliare! Ecco cosa posso fare:

• **Calcolo ROI e Margini** - Analisi finanziaria completa
• **Proiezioni di Vendita** - Stime basate su dati di mercato
• **Analisi di Sensibilità** - Scenari ottimistici e pessimistici
• **Comparazioni OMI** - Dati ufficiali di mercato
• **Report PDF** - Documenti professionali

Per iniziare, dimmi:
- Che tipo di progetto stai valutando?
- In quale zona?
- Qual è il tuo budget stimato?`;
  }
  
  if (lowerMessage.includes('market') || lowerMessage.includes('mercato') || lowerMessage.includes('intelligence')) {
    return `📈 **Market Intelligence**

Ecco come posso aiutarti con l'analisi di mercato:

• **Trend di Mercato** - Analisi delle tendenze locali
• **Prezzi OMI** - Dati ufficiali aggiornati
• **Demografia** - Analisi della popolazione target
• **Infrastrutture** - Valutazione servizi e trasporti
• **Opportunità** - Identificazione zone promettenti

Per iniziare, specifica:
- La zona di interesse
- Il tipo di immobile
- Il periodo di analisi`;
  }
  
  if (lowerMessage.includes('design') || lowerMessage.includes('progettazione')) {
    return `🎨 **Design Center**

Posso supportarti nella progettazione:

• **Layout Ottimizzati** - Soluzioni spaziali efficienti
• **Rendering 3D** - Visualizzazioni realistiche
• **Materiali e Finiture** - Selezione tecnica
• **Normative** - Conformità edilizia
• **Sostenibilità** - Soluzioni green

Dimmi:
- Che tipo di edificio vuoi progettare?
- Quali sono i tuoi requisiti?
- Hai vincoli particolari?`;
  }
  
  if (lowerMessage.includes('business plan') || lowerMessage.includes('piano')) {
    return `💼 **Business Plan**

Posso aiutarti a creare un business plan completo:

• **Proiezioni Finanziarie** - Flussi di cassa e ROI
• **Analisi di Mercato** - Studio della domanda
• **Strategia Commerciale** - Piano di vendita
• **Gestione Rischio** - Identificazione e mitigazione
• **Presentazione** - Documenti professionali

Per iniziare, ho bisogno di:
- Dettagli del progetto
- Investimento previsto
- Timeline di sviluppo`;
  }
  
  if (lowerMessage.includes('terreni') || lowerMessage.includes('scansione') || lowerMessage.includes('land')) {
    return `🗺️ **Scansione Terreni**

Posso aiutarti a trovare terreni interessanti:

• **Ricerca Automatica** - Scansione portali immobiliari
• **Filtri Avanzati** - Prezzo, zona, superficie
• **Analisi AI** - Valutazione automatica potenziale
• **Report Completi** - Dettagli e raccomandazioni
• **Notifiche** - Aggiornamenti su nuove opportunità

Specifica:
- Zona di interesse
- Budget disponibile
- Caratteristiche richieste`;
  }
  
  // Risposta generica
  return `🤖 **Urbanova Assistant**

Ciao! Sono il tuo assistente intelligente per la gestione immobiliare.

Posso aiutarti con:

• 📊 **Analisi di Fattibilità** - Valutazione progetti immobiliari
• 📈 **Market Intelligence** - Analisi di mercato e trend
• 🎨 **Design Center** - Progettazione e rendering
• 📋 **Gestione Progetti** - Organizzazione e timeline
• 🏗️ **Permessi e Compliance** - Normative edilizie
• 🗺️ **Scansione Terreni** - Ricerca automatica opportunità
• 💼 **Business Plan** - Piani finanziari completi

**Come posso aiutarti oggi?** Sii specifico sulla tua richiesta per ricevere il supporto migliore!`;
}
