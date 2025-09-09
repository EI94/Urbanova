import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

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
  try {
    const { message, context } = await request.json();

    console.log('🤖 [Chat API] Richiesta chat:', { message: message.substring(0, 100) });
    console.log('🔑 [Chat API] OPENAI_API_KEY presente:', !!process.env.OPENAI_API_KEY);

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

    // Se OpenAI non è disponibile, usa risposte predefinite
    if (!openai) {
      console.warn('⚠️ [Chat API] OpenAI non configurato, usando risposte predefinite');
      return NextResponse.json({
        success: true,
        response: getFallbackResponse(message),
        timestamp: new Date().toISOString(),
      });
    }

    // Crea il prompt per Urbanova
    const systemPrompt = `Sei Urbanova, l'assistente intelligente per la gestione immobiliare e sviluppo di progetti smart city.

Il tuo ruolo è aiutare gli utenti con:
- 📊 Analisi di fattibilità immobiliare
- 📈 Market Intelligence e analisi di mercato
- 🎨 Design Center e progettazione
- 📋 Gestione progetti e documenti
- 🏗️ Permessi e compliance
- 📅 Project Timeline AI
- 🗺️ Scansione terreni e land scraping
- 💼 Business Plan e proiezioni finanziarie

Rispondi sempre in italiano, in modo professionale ma amichevole. 
Sii specifico e fornisci consigli pratici quando possibile.
Se l'utente chiede qualcosa di non relativo all'immobiliare, riporta gentilmente la conversazione sui servizi Urbanova.`;

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

    return NextResponse.json({
      success: true,
      response,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ [Chat API] Errore:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Errore interno del server',
      response: getFallbackResponse(''),
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
