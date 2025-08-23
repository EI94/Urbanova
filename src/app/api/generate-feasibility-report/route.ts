import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { PDFGeneratorService } from '@/lib/pdfGeneratorService';

// Inizializza OpenAI solo se la chiave è disponibile
let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Inizializza servizio PDF
const pdfService = new PDFGeneratorService();

export async function POST(request: NextRequest) {
  try {
    const { analysisId, notes } = await request.json();

    // Simula recupero dati dell'analisi (in produzione verrebbe dal database)
    const analysis = {
      id: analysisId,
      title: "Villa di Lusso a Roma",
      location: "Roma, Lazio",
      propertyType: "Villa Unifamiliare",
      totalInvestment: 850000,
      expectedROI: 12.5,
      paybackPeriod: 8.2,
      netPresentValue: 125000,
      internalRateOfReturn: 15.8,
      riskLevel: "MEDIUM" as const,
      marketTrend: "POSITIVE" as const,
      recommendations: [
        "L'investimento mostra un ROI attraente del 12.5% con un periodo di recupero ragionevole",
        "La posizione centrale di Roma garantisce una forte domanda di mercato",
        "Considerare la diversificazione del portafoglio per ridurre il rischio complessivo",
        "Monitorare le tendenze del mercato immobiliare romano per ottimizzare i tempi di vendita"
      ],
      createdAt: new Date().toISOString()
    };

    // Genera analisi AI con OpenAI
    const aiAnalysis = await generateAIAnalysis(analysis, notes);

    // Genera PDF avanzato con il servizio
    const pdfBuffer = await pdfService.generateFeasibilityReport(analysis, aiAnalysis);

    // Restituisci il PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Studio-Fattibilita-${analysis.title.replace(/\s+/g, '-')}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Errore generazione report:', error);
    return NextResponse.json(
      { error: 'Errore nella generazione del report' },
      { status: 500 }
    );
  }
}

async function generateAIAnalysis(analysis: any, notes?: string) {
  try {
    // Se OpenAI non è disponibile, usa analisi predefinita
    if (!openai) {
      return {
        pros: [
          `ROI attraente del ${analysis.expectedROI.toFixed(1)}%`,
          `Posizione strategica a ${analysis.location}`,
          `Tipo immobile richiesto: ${analysis.propertyType}`,
          `Periodo di recupero ragionevole: ${analysis.paybackPeriod.toFixed(1)} anni`
        ],
        cons: [
          "Rischi di mercato immobiliare",
          "Tempistiche di vendita variabili",
          "Costi di gestione e manutenzione"
        ],
        recommendation: notes && notes.trim() 
          ? `L'investimento mostra potenziale con un ROI attraente, ma richiede attenta valutazione dei rischi di mercato. Considerazioni aggiuntive: ${notes}`
          : "L'investimento mostra potenziale con un ROI attraente, ma richiede attenta valutazione dei rischi di mercato.",
        strategies: [
          "Monitorare le tendenze del mercato immobiliare locale",
          "Ottimizzare i tempi di vendita in base alla domanda",
          "Considerare la diversificazione del portafoglio",
          "Valutare opzioni di affitto temporaneo"
        ]
      };
    }

    const prompt = `
    Analizza questo studio di fattibilità immobiliare e fornisci:
    
    1. PRO dell'investimento (3-4 punti chiave)
    2. CONTRO dell'investimento (2-3 rischi principali)
    3. Raccomandazione finale (investire o no?)
    4. Strategie per massimizzare il ROI
    
    Dati dell'analisi:
    - Progetto: ${analysis.title}
    - Località: ${analysis.location}
    - Investimento: €${analysis.totalInvestment.toLocaleString('it-IT')}
    - ROI atteso: ${analysis.expectedROI}%
    - Periodo di recupero: ${analysis.paybackPeriod} anni
    - Livello di rischio: ${analysis.riskLevel}
    - Trend di mercato: ${analysis.marketTrend}
    ${notes && notes.trim() ? `\nNote e considerazioni aggiuntive: ${notes}` : ''}
    
    Rispondi in italiano, in modo professionale ma comprensibile.
    ${notes && notes.trim() ? 'Utilizza le note fornite per personalizzare l\'analisi e fornire raccomandazioni più specifiche e contestuali.' : ''}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Sei un esperto analista immobiliare italiano. Fornisci analisi professionali e raccomandazioni concrete."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content || "Analisi AI non disponibile";
    
    // Parsing dell'analisi AI per estrarre PRO, CONTRO, raccomandazione e strategie
    return parseAIAnalysis(content);

  } catch (error) {
    console.error('Errore OpenAI:', error);
    return {
      pros: [
        `ROI attraente del ${analysis.expectedROI.toFixed(1)}%`,
        `Posizione strategica a ${analysis.location}`,
        `Tipo immobile richiesto: ${analysis.propertyType}`
      ],
      cons: [
        "Rischi di mercato immobiliare",
        "Tempistiche di vendita variabili"
      ],
      recommendation: notes && notes.trim() 
        ? `L'investimento mostra potenziale ma richiede attenta valutazione. Considerazioni aggiuntive: ${notes}`
        : "L'investimento mostra potenziale ma richiede attenta valutazione",
      strategies: [
        "Monitorare il mercato e ottimizzare i tempi",
        "Considerare la diversificazione del portafoglio"
      ]
    };
  }
}

function parseAIAnalysis(content: string) {
  // Parsing semplice dell'analisi AI
  const lines = content.split('\n').filter(line => line.trim());
  
  const pros: string[] = [];
  const cons: string[] = [];
  const strategies: string[] = [];
  let recommendation = "Analisi in corso...";
  
  let currentSection = '';
  
  for (const line of lines) {
    if (line.includes('PRO') || line.includes('pro') || line.includes('Vantaggi')) {
      currentSection = 'pros';
    } else if (line.includes('CONTRO') || line.includes('contro') || line.includes('Rischi')) {
      currentSection = 'cons';
    } else if (line.includes('Strategie') || line.includes('strategie')) {
      currentSection = 'strategies';
    } else if (line.includes('Raccomandazione') || line.includes('raccomandazione')) {
      currentSection = 'recommendation';
    } else if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
      const item = line.trim().substring(1).trim();
      if (currentSection === 'pros') pros.push(item);
      else if (currentSection === 'cons') cons.push(item);
      else if (currentSection === 'strategies') strategies.push(item);
    } else if (currentSection === 'recommendation' && line.trim()) {
      recommendation = line.trim();
    }
  }
  
  // Fallback se non è stato possibile estrarre dati strutturati
  if (pros.length === 0) pros.push("ROI attraente e posizione strategica");
  if (cons.length === 0) cons.push("Rischi di mercato e tempistiche di vendita");
  if (strategies.length === 0) strategies.push("Monitorare il mercato e ottimizzare i tempi");
  if (recommendation === "Analisi in corso...") {
    recommendation = "L'investimento mostra potenziale ma richiede attenta valutazione";
  }
  
  return { pros, cons, recommendation, strategies };
}
