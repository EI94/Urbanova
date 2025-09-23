// Servizio per il riconoscimento degli intent dell'utente e gestione progetti
import { feasibilityService, FeasibilityProject } from '@/lib/feasibilityService';
import { workspaceService } from '@/lib/workspaceService';

// 🛡️ OS PROTECTION - Importa protezione CSS per intent service
import '@/lib/osProtection';

export interface UserIntent {
  type: 'feasibility' | 'business-plan' | 'market-intelligence' | 'design' | 'general';
  confidence: number;
  missingFields: string[];
  collectedData: any;
  suggestions: string[];
}

export interface ProjectPreview {
  id: string;
  name: string;
  type: 'feasibility' | 'business-plan' | 'market-intelligence' | 'design';
  status: 'creating' | 'created' | 'error';
  preview: {
    title: string;
    description: string;
    keyInfo: string[];
    metrics?: any;
  };
  url: string;
}

class IntentService {
  // Campi richiesti per ogni tipo di progetto
  private readonly REQUIRED_FIELDS = {
    feasibility: [
      'projectName',
      'location',
      'propertyType',
      'totalArea',
      'buildableArea',
      'budget',
      'timeline'
    ],
    'business-plan': [
      'projectName',
      'businessType',
      'targetMarket',
      'revenueModel',
      'budget',
      'timeline'
    ],
    'market-intelligence': [
      'location',
      'propertyType',
      'analysisType',
      'timeframe'
    ],
    design: [
      'projectName',
      'location',
      'propertyType',
      'designStyle',
      'layoutType',
      'totalArea',
      'rooms',
      'budget',
      'timeline',
      'materials',
      'specialRequirements'
    ],
  };

  // Riconosce l'intent dell'utente dal messaggio
  async recognizeIntent(message: string, conversationHistory: any[] = []): Promise<UserIntent> {
    const lowerMessage = message.toLowerCase();
    
    // Se c'è cronologia, controlla se l'intent è già stato identificato
    if (conversationHistory.length > 0) {
      const lastIntent = conversationHistory.find(msg => msg.intent && msg.intent.type !== 'general');
      if (lastIntent) {
        console.log('🧠 [Intent] Usando intent dalla cronologia:', lastIntent.intent.type);
        const intent = lastIntent.intent;
        
        // Estrai dati dal messaggio corrente PRIMA di combinare con la cronologia
        const currentData = await this.extractDataFromMessage(message, [], intent.type);
        console.log('🔍 [Intent] Dati dal messaggio corrente:', currentData);
        
        // Combina con i dati della cronologia
        const collectedData = { ...intent.collectedData, ...currentData };
        
        // Estrai anche da tutti i messaggi della cronologia
        const allHistoryData = await this.extractDataFromMessage(
          conversationHistory.map(msg => msg.content).join(' '), 
          [], 
          intent.type
        );
        Object.assign(collectedData, allHistoryData);
        
        console.log('🔍 [Intent] Dati combinati:', collectedData);
        
        const missingFields = this.getMissingFields(collectedData, intent.type);
        const suggestions = this.generateSuggestions(intent.type, missingFields, collectedData);
        
        return {
          type: intent.type,
          confidence: intent.confidence,
          missingFields,
          collectedData,
          suggestions
        };
      }
    }
    
    // Keywords per ogni tipo di progetto
    const intentKeywords = {
      feasibility: [
        'studio di fattibilità', 'analisi fattibilità', 'fattibilità', 'progetto immobiliare',
        'costruire', 'edificio', 'residenziale', 'commerciale', 'uffici', 'appartamenti',
        'investimento immobiliare', 'valutazione progetto', 'roi', 'rendimento',
        'area edificabile', 'metri quadrati', 'budget', 'timeline'
      ],
      'business-plan': [
        'business plan', 'piano d\'affari', 'piano commerciale', 'strategia aziendale',
        'modello di business', 'revenue', 'fatturato', 'mercato target', 'concorrenza'
      ],
      'market-intelligence': [
        'cercare terreni', 'trovare terreni', 'ricerca terreni', 'terreni', 'terreno',
        'ricerca immobiliare', 'investimento terreno', 'acquisto terreno', 'vendita terreno', 
        'opportunità immobiliari', 'ricerca spaziale', 'mappa terreni', 'geolocalizzazione', 
        'zone immobiliari', 'mercato immobiliare', 'prezzi terreni', 'tendenza immobiliare', 
        'analisi mercato', 'intelligence', 'competitor', 'domanda', 'offerta', 
        'valore immobiliare', 'andamento prezzi', 'market intelligence'
      ],
      design: [
        'design center', 'design center', 'progettazione', 'architettura', 'interior design', 
        'stile', 'arredamento', 'layout', 'spazi', 'estetica', 'progetto architettonico',
        'concept design', 'rendering', '3d', 'modellazione', 'planimetrie', 'sezioni',
        'facciate', 'volumetrie', 'distribuzione', 'ambienti', 'finiture', 'materiali',
        'colori', 'illuminazione', 'arredo', 'mobili', 'decorazioni', 'stile moderno',
        'stile classico', 'minimalista', 'contemporaneo', 'vintage', 'industrial', 'scandinavo',
        'mediterraneo', 'tropicale', 'rustico', 'elegante', 'sophisticated', 'luxury',
        'open space', 'living', 'cucina', 'camera', 'bagno', 'soggiorno', 'studio',
        'terrazza', 'giardino', 'piscina', 'garage', 'cantina', 'soffitta'
      ],
    };

    // Calcola confidence per ogni intent
    const scores: { [key: string]: number } = {};
    
    for (const [intent, keywords] of Object.entries(intentKeywords)) {
      let score = 0;
      keywords.forEach(keyword => {
        if (lowerMessage.includes(keyword)) {
          score += 1;
        }
      });
      scores[intent] = score / keywords.length;
    }

    // Priorità speciale per Market Intelligence se ci sono parole chiave specifiche
    if (lowerMessage.includes('cercare terreni') || lowerMessage.includes('trovare terreni') || 
        lowerMessage.includes('ricerca terreni') || lowerMessage.includes('terreni')) {
      scores['market-intelligence'] = Math.max(scores['market-intelligence'] || 0, 0.8);
    }

    // Priorità speciale per Design Center se ci sono parole chiave specifiche
    if (lowerMessage.includes('design center') || lowerMessage.includes('progettazione') || 
        lowerMessage.includes('architettura') || lowerMessage.includes('interior design') ||
        lowerMessage.includes('concept design') || lowerMessage.includes('rendering') ||
        lowerMessage.includes('planimetrie') || lowerMessage.includes('3d')) {
      scores['design'] = Math.max(scores['design'] || 0, 0.8);
    }

    // Priorità speciale per Business Plan se ci sono parole chiave specifiche
    if (lowerMessage.includes('business plan') || lowerMessage.includes('piano d\'affari') || 
        lowerMessage.includes('piano finanziario') || lowerMessage.includes('proiezioni finanziarie') ||
        lowerMessage.includes('modello di business') || lowerMessage.includes('strategia aziendale') ||
        lowerMessage.includes('analisi di mercato') || lowerMessage.includes('proiezioni')) {
      scores['business-plan'] = Math.max(scores['business-plan'] || 0, 0.8);
    }

    // Trova l'intent con confidence più alta
    const entries = Object.entries(scores);
    const bestIntent = entries.length > 0 ? entries.reduce((a, b) => 
      (scores[a[0]] || 0) > (scores[b[0]] || 0) ? a : b
    ) : ['general', '0'];

    const intentType = bestIntent[0] as keyof typeof intentKeywords;
    const confidence = parseFloat(String(bestIntent[1] || '0'));

    // Se confidence è bassa, usa 'general'
    const finalIntent = confidence > 0.1 ? intentType : 'general';

    // Estrai dati dal messaggio e dalla cronologia
    const collectedData = await this.extractDataFromMessage(message, conversationHistory, finalIntent);
    
    // Determina campi mancanti
    const missingFields = this.getMissingFields(collectedData || {}, finalIntent);
    
    // Genera suggerimenti
    const suggestions = this.generateSuggestions(finalIntent, missingFields, collectedData || {});

    return {
      type: finalIntent,
      confidence: Number(confidence),
      missingFields,
      collectedData: collectedData || {},
      suggestions
    };
  }

  // Estrae dati dal messaggio e dalla cronologia
  private async extractDataFromMessage(
    message: string, 
    history: any[], 
    intent: string
  ): Promise<any> {
    const data: any = {};
    const lowerMessage = message.toLowerCase();
    
    console.log('🔍 [Intent] Estrazione dati da:', message.substring(0, 50));

    // Estrai informazioni comuni
    if (intent === 'feasibility') {
      // Location - cerca città specifiche
      const simpleCityMatch = message.match(/(Roma|Milano|Torino|Napoli|Firenze|Bologna|Venezia|Genova|Palermo|Catania)/i);
      if (simpleCityMatch) {
        data.location = simpleCityMatch[1];
      } else {
        const locationMatch = message.match(/(?:a|in|presso|zona)\s+([A-Z][a-z]+)/i);
        if (locationMatch && locationMatch[1]) {
          data.location = locationMatch[1].trim();
        } else {
          // Prova pattern alternativo per città
          const cityMatch = message.match(/([A-Z][a-z]+)(?:\s*,|\s+1000|\s+metri)/i);
          if (cityMatch && cityMatch[1]) {
            data.location = cityMatch[1].trim();
          }
        }
      }

      // Nome progetto - genera un nome valido
      if (data.location) {
        data.projectName = `Progetto Residenziale ${data.location}`;
      } else {
        data.projectName = 'Progetto Immobiliare';
      }

      // Area totale (solo se non è specificata come edificabile)
      if (!lowerMessage.includes('edificabile') && !lowerMessage.includes('costruibile')) {
        const areaMatch = message.match(/(\d+)\s*(?:metri|mq|m2)/i);
        if (areaMatch && areaMatch[1]) {
          data.totalArea = parseInt(areaMatch[1]);
        }
      } else {
        // Se c'è "edificabile", cerca l'area totale prima
        const totalAreaMatch = message.match(/(\d+)\s*(?:metri|mq|m2).*?(?:edificabile|costruibile)/i);
        if (totalAreaMatch && totalAreaMatch[1]) {
          data.totalArea = parseInt(totalAreaMatch[1]);
        }
      }

      // Budget
      const budgetMatch = message.match(/(?:budget|investimento|costo)\s*(?:di|:)?\s*([€\d\.,\s]+)/i);
      if (budgetMatch && budgetMatch[1]) {
        data.budget = budgetMatch[1].trim();
      }

      // Tipo proprietà
      if (lowerMessage.includes('residenziale') || lowerMessage.includes('appartamenti')) {
        data.propertyType = 'residenziale';
      } else if (lowerMessage.includes('commerciale') || lowerMessage.includes('uffici')) {
        data.propertyType = 'commerciale';
      } else if (lowerMessage.includes('misto')) {
        data.propertyType = 'misto';
      }

      // Timeline
      const timelineMatch = message.match(/(\d+)\s*(?:mesi|anni|giorni)/i);
      if (timelineMatch && timelineMatch[1]) {
        data.timeline = timelineMatch[1] + ' ' + (timelineMatch[0].includes('anni') ? 'anni' : 'mesi');
      } else if (lowerMessage.includes('urgente') || lowerMessage.includes('veloce')) {
        data.timeline = 'breve';
      } else if (lowerMessage.includes('lungo') || lowerMessage.includes('tempo')) {
        data.timeline = 'lungo';
      }

      // Area edificabile
      const buildableMatch = message.match(/(?:area\s+)?(?:edificabile|costruibile)\s*(?:di|:)?\s*(\d+)\s*(?:metri|mq|m2)/i);
      if (buildableMatch && buildableMatch[1]) {
        data.buildableArea = parseInt(buildableMatch[1]);
        console.log('✅ [Intent] Area edificabile estratta:', data.buildableArea);
      } else {
        // Prova pattern alternativo
        const altMatch = message.match(/(\d+)\s*(?:metri|mq|m2).*?(?:edificabile|costruibile)/i);
        if (altMatch && altMatch[1]) {
          data.buildableArea = parseInt(altMatch[1]);
          console.log('✅ [Intent] Area edificabile estratta (alt):', data.buildableArea);
        } else {
          // Prova pattern più semplice
          const simpleMatch = message.match(/(\d+)\s*(?:metri|mq|m2)/i);
          if (simpleMatch && simpleMatch[1] && lowerMessage.includes('edificabile')) {
            data.buildableArea = parseInt(simpleMatch[1]);
            console.log('✅ [Intent] Area edificabile estratta (simple):', data.buildableArea);
          } else {
            console.log('❌ [Intent] Area edificabile non trovata in:', message);
          }
        }
      }
    }

    // Estrai dati per Market Intelligence
    if (intent === 'market-intelligence') {
      // Location - cerca città specifiche
      const simpleCityMatch = message.match(/(Roma|Milano|Torino|Napoli|Firenze|Bologna|Venezia|Genova|Palermo|Catania)/i);
      if (simpleCityMatch) {
        data.location = simpleCityMatch[1];
      } else {
        const locationMatch = message.match(/(?:a|in|presso|zona|vicino)\s+([A-Z][a-z]+)/i);
        if (locationMatch && locationMatch[1]) {
          data.location = locationMatch[1].trim();
        }
      }

      // Property Type
      if (lowerMessage.includes('residenziale') || lowerMessage.includes('casa') || lowerMessage.includes('appartamento')) {
        data.propertyType = 'residenziale';
      } else if (lowerMessage.includes('commerciale') || lowerMessage.includes('ufficio') || lowerMessage.includes('negozio')) {
        data.propertyType = 'commerciale';
      } else if (lowerMessage.includes('industriale') || lowerMessage.includes('capannone') || lowerMessage.includes('magazzino')) {
        data.propertyType = 'industriale';
      } else if (lowerMessage.includes('misto')) {
        data.propertyType = 'misto';
      }

      // Budget - pattern più flessibili
      const budgetMatch = message.match(/(?:budget|investimento|massimo|fino a|sotto)\s*(?:di|:)?\s*([€\d\.,\s]+)/i);
      if (budgetMatch && budgetMatch[1]) {
        data.budget = budgetMatch[1].trim();
      } else {
        // Prova pattern alternativo per budget
        const altBudgetMatch = message.match(/(\d+)\s*(?:euro|€|eur)/i);
        if (altBudgetMatch) {
          data.budget = altBudgetMatch[1];
        } else {
          // Prova pattern più semplice
          const simpleBudgetMatch = message.match(/(\d{6,})/); // Cerca numeri con 6+ cifre
          if (simpleBudgetMatch) {
            data.budget = simpleBudgetMatch[1];
          }
        }
      }

      // Area - pattern più flessibili
      const areaMatch = message.match(/(?:area|superficie|dimensione|minima)\s*(?:di|:)?\s*(\d+)\s*(?:metri|mq|m2|ettari)/i);
      if (areaMatch && areaMatch[1]) {
        data.area = parseInt(areaMatch[1]);
      } else {
        // Prova pattern alternativo per area
        const altAreaMatch = message.match(/(\d+)\s*(?:mq|m2|metri)/i);
        if (altAreaMatch && altAreaMatch[1]) {
          data.area = parseInt(altAreaMatch[1]);
        }
      }

      // Email
      const emailMatch = message.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
      if (emailMatch) {
        data.email = emailMatch[1];
      }

      // Frequency (immediata, settimanale, mensile)
      if (lowerMessage.includes('immediat') || lowerMessage.includes('ora') || lowerMessage.includes('subito')) {
        data.frequency = 'immediata';
      } else if (lowerMessage.includes('settimanale') || lowerMessage.includes('ogni settimana') || lowerMessage.includes('venerdì')) {
        data.frequency = 'settimanale';
      } else if (lowerMessage.includes('mensile') || lowerMessage.includes('ogni mese')) {
        data.frequency = 'mensile';
      }

      // Analysis Type
      if (lowerMessage.includes('prezzi') || lowerMessage.includes('valutazione')) {
        data.analysisType = 'prezzi';
      } else if (lowerMessage.includes('tendenza') || lowerMessage.includes('andamento')) {
        data.analysisType = 'tendenze';
      } else if (lowerMessage.includes('competitor') || lowerMessage.includes('concorrenza')) {
        data.analysisType = 'competitor';
      } else {
        data.analysisType = 'completa';
      }

      // Timeframe
      if (lowerMessage.includes('ultimi 6 mesi') || lowerMessage.includes('6 mesi')) {
        data.timeframe = '6 mesi';
      } else if (lowerMessage.includes('ultimo anno') || lowerMessage.includes('12 mesi')) {
        data.timeframe = '12 mesi';
      } else if (lowerMessage.includes('ultimi 2 anni') || lowerMessage.includes('24 mesi')) {
        data.timeframe = '24 mesi';
      } else {
        data.timeframe = '12 mesi'; // default
      }
    }

    // Estrai dati per Design Center
    if (intent === 'design') {
      // Location - cerca città specifiche
      const simpleCityMatch = message.match(/(Roma|Milano|Torino|Napoli|Firenze|Bologna|Venezia|Genova|Palermo|Catania)/i);
      if (simpleCityMatch) {
        data.location = simpleCityMatch[1];
      } else {
        const locationMatch = message.match(/(?:a|in|presso|zona|vicino)\s+([A-Z][a-z]+)/i);
        if (locationMatch && locationMatch[1]) {
          data.location = locationMatch[1].trim();
        }
      }

      // Nome progetto - genera un nome valido
      if (data.location) {
        data.projectName = `Progetto Design ${data.location}`;
      } else {
        data.projectName = 'Progetto Architettonico';
      }

      // Property Type
      if (lowerMessage.includes('residenziale') || lowerMessage.includes('casa') || lowerMessage.includes('appartamento') || lowerMessage.includes('villa')) {
        data.propertyType = 'residenziale';
      } else if (lowerMessage.includes('commerciale') || lowerMessage.includes('ufficio') || lowerMessage.includes('negozio') || lowerMessage.includes('ristorante')) {
        data.propertyType = 'commerciale';
      } else if (lowerMessage.includes('industriale') || lowerMessage.includes('capannone') || lowerMessage.includes('magazzino')) {
        data.propertyType = 'industriale';
      } else if (lowerMessage.includes('misto')) {
        data.propertyType = 'misto';
      }

      // Design Style
      if (lowerMessage.includes('moderno') || lowerMessage.includes('contemporaneo')) {
        data.designStyle = 'moderno';
      } else if (lowerMessage.includes('classico') || lowerMessage.includes('tradizionale')) {
        data.designStyle = 'classico';
      } else if (lowerMessage.includes('minimalista') || lowerMessage.includes('minimal')) {
        data.designStyle = 'minimalista';
      } else if (lowerMessage.includes('vintage') || lowerMessage.includes('retro')) {
        data.designStyle = 'vintage';
      } else if (lowerMessage.includes('industrial') || lowerMessage.includes('industriale')) {
        data.designStyle = 'industrial';
      } else if (lowerMessage.includes('scandinavo') || lowerMessage.includes('nordic')) {
        data.designStyle = 'scandinavo';
      } else if (lowerMessage.includes('mediterraneo') || lowerMessage.includes('mediterranean')) {
        data.designStyle = 'mediterraneo';
      } else if (lowerMessage.includes('tropicale') || lowerMessage.includes('tropical')) {
        data.designStyle = 'tropicale';
      } else if (lowerMessage.includes('rustico') || lowerMessage.includes('rustic')) {
        data.designStyle = 'rustico';
      } else if (lowerMessage.includes('elegante') || lowerMessage.includes('sophisticated') || lowerMessage.includes('luxury')) {
        data.designStyle = 'elegante';
      }

      // Layout Type
      if (lowerMessage.includes('open space') || lowerMessage.includes('open space')) {
        data.layoutType = 'open space';
      } else if (lowerMessage.includes('tradizionale') || lowerMessage.includes('classico')) {
        data.layoutType = 'tradizionale';
      } else if (lowerMessage.includes('bifamiliare') || lowerMessage.includes('duplex')) {
        data.layoutType = 'bifamiliare';
      } else if (lowerMessage.includes('monolocale') || lowerMessage.includes('studio')) {
        data.layoutType = 'monolocale';
      } else if (lowerMessage.includes('attico') || lowerMessage.includes('penthouse')) {
        data.layoutType = 'attico';
      }

      // Total Area
      const areaMatch = message.match(/(?:area|superficie|dimensione|mq|metri)\s*(?:di|:)?\s*(\d+)\s*(?:metri|mq|m2|ettari)/i);
      if (areaMatch && areaMatch[1]) {
        data.totalArea = parseInt(areaMatch[1]);
      } else {
        // Prova pattern alternativo per area
        const altAreaMatch = message.match(/(\d+)\s*(?:mq|m2|metri)/i);
        if (altAreaMatch && altAreaMatch[1]) {
          data.totalArea = parseInt(altAreaMatch[1]);
        }
      }

      // Rooms
      const roomsMatch = message.match(/(?:camere|stanze|locali)\s*(?:di|:)?\s*(\d+)/i);
      if (roomsMatch && roomsMatch[1]) {
        data.rooms = parseInt(roomsMatch[1]);
      } else {
        // Prova pattern alternativo per camere
        const altRoomsMatch = message.match(/(\d+)\s*(?:camere|stanze|locali)/i);
        if (altRoomsMatch && altRoomsMatch[1]) {
          data.rooms = parseInt(altRoomsMatch[1]);
        }
      }

      // Budget
      const budgetMatch = message.match(/(?:budget|investimento|costo|prezzo)\s*(?:di|:)?\s*([€\d\.,\s]+)/i);
      if (budgetMatch && budgetMatch[1]) {
        data.budget = budgetMatch[1].trim();
      } else {
        // Prova pattern alternativo per budget
        const altBudgetMatch = message.match(/(\d+)\s*(?:euro|€|eur)/i);
        if (altBudgetMatch) {
          data.budget = altBudgetMatch[1];
        } else {
          // Prova pattern più semplice
          const simpleBudgetMatch = message.match(/(\d{5,})/); // Cerca numeri con 5+ cifre
          if (simpleBudgetMatch) {
            data.budget = simpleBudgetMatch[1];
          }
        }
      }

      // Timeline
      if (lowerMessage.includes('urgente') || lowerMessage.includes('veloce') || lowerMessage.includes('subito')) {
        data.timeline = 'breve';
      } else if (lowerMessage.includes('lungo') || lowerMessage.includes('tempo') || lowerMessage.includes('dettagliato')) {
        data.timeline = 'lungo';
      } else {
        const timelineMatch = message.match(/(\d+)\s*(?:mesi|anni|giorni|settimane)/i);
        if (timelineMatch) {
          data.timeline = timelineMatch[1] + ' ' + (timelineMatch[0].includes('anni') ? 'anni' : 'mesi');
        }
      }

      // Materials
      const materials = [];
      if (lowerMessage.includes('legno') || lowerMessage.includes('wood')) materials.push('legno');
      if (lowerMessage.includes('vetro') || lowerMessage.includes('glass')) materials.push('vetro');
      if (lowerMessage.includes('metallo') || lowerMessage.includes('metal')) materials.push('metallo');
      if (lowerMessage.includes('pietra') || lowerMessage.includes('stone')) materials.push('pietra');
      if (lowerMessage.includes('marmo') || lowerMessage.includes('marble')) materials.push('marmo');
      if (lowerMessage.includes('cemento') || lowerMessage.includes('concrete')) materials.push('cemento');
      if (lowerMessage.includes('mattoni') || lowerMessage.includes('brick')) materials.push('mattoni');
      if (lowerMessage.includes('ceramica') || lowerMessage.includes('ceramic')) materials.push('ceramica');
      if (materials.length > 0) {
        data.materials = materials.join(', ');
      }

      // Special Requirements
      const requirements = [];
      if (lowerMessage.includes('accessibilità') || lowerMessage.includes('disabili')) requirements.push('accessibilità');
      if (lowerMessage.includes('sostenibile') || lowerMessage.includes('green') || lowerMessage.includes('eco')) requirements.push('sostenibilità');
      if (lowerMessage.includes('smart') || lowerMessage.includes('domotica')) requirements.push('domotica');
      if (lowerMessage.includes('piscina') || lowerMessage.includes('pool')) requirements.push('piscina');
      if (lowerMessage.includes('giardino') || lowerMessage.includes('garden')) requirements.push('giardino');
      if (lowerMessage.includes('terrazza') || lowerMessage.includes('terrace')) requirements.push('terrazza');
      if (lowerMessage.includes('garage') || lowerMessage.includes('parcheggio')) requirements.push('garage');
      if (lowerMessage.includes('cantina') || lowerMessage.includes('basement')) requirements.push('cantina');
      if (lowerMessage.includes('soffitta') || lowerMessage.includes('attic')) requirements.push('soffitta');
      if (requirements.length > 0) {
        data.specialRequirements = requirements.join(', ');
      }
    }

    // Estrai dati per Business Plan
    if (intent === 'business-plan') {
      // Location - cerca città specifiche
      const simpleCityMatch = message.match(/(Roma|Milano|Torino|Napoli|Firenze|Bologna|Venezia|Genova|Palermo|Catania)/i);
      if (simpleCityMatch) {
        data.location = simpleCityMatch[1];
      } else {
        const locationMatch = message.match(/(?:a|in|presso|zona|vicino)\s+([A-Z][a-z]+)/i);
        if (locationMatch && locationMatch[1]) {
          data.location = locationMatch[1].trim();
        }
      }

      // Nome progetto - genera un nome valido
      if (data.location) {
        data.projectName = `Business Plan ${data.location}`;
      } else {
        data.projectName = 'Business Plan Aziendale';
      }

      // Business Type
      if (lowerMessage.includes('startup') || lowerMessage.includes('nuova impresa')) {
        data.businessType = 'startup';
      } else if (lowerMessage.includes('azienda') || lowerMessage.includes('società')) {
        data.businessType = 'azienda';
      } else if (lowerMessage.includes('consulenza') || lowerMessage.includes('servizi')) {
        data.businessType = 'consulenza';
      } else if (lowerMessage.includes('e-commerce') || lowerMessage.includes('online')) {
        data.businessType = 'e-commerce';
      } else if (lowerMessage.includes('franchising') || lowerMessage.includes('franchise')) {
        data.businessType = 'franchising';
      } else if (lowerMessage.includes('partnership') || lowerMessage.includes('joint venture')) {
        data.businessType = 'partnership';
      }

      // Sector
      if (lowerMessage.includes('immobiliare') || lowerMessage.includes('real estate')) {
        data.sector = 'immobiliare';
      } else if (lowerMessage.includes('tecnologia') || lowerMessage.includes('tech') || lowerMessage.includes('software')) {
        data.sector = 'tecnologia';
      } else if (lowerMessage.includes('finanza') || lowerMessage.includes('fintech') || lowerMessage.includes('finanziario')) {
        data.sector = 'finanza';
      } else if (lowerMessage.includes('salute') || lowerMessage.includes('healthcare') || lowerMessage.includes('medico')) {
        data.sector = 'salute';
      } else if (lowerMessage.includes('educazione') || lowerMessage.includes('education') || lowerMessage.includes('formazione')) {
        data.sector = 'educazione';
      } else if (lowerMessage.includes('retail') || lowerMessage.includes('vendita') || lowerMessage.includes('commercio')) {
        data.sector = 'retail';
      } else if (lowerMessage.includes('ristorazione') || lowerMessage.includes('food') || lowerMessage.includes('cibo')) {
        data.sector = 'ristorazione';
      } else if (lowerMessage.includes('turismo') || lowerMessage.includes('travel') || lowerMessage.includes('viaggi')) {
        data.sector = 'turismo';
      } else if (lowerMessage.includes('logistica') || lowerMessage.includes('trasporti') || lowerMessage.includes('spedizioni')) {
        data.sector = 'logistica';
      } else if (lowerMessage.includes('energia') || lowerMessage.includes('energy') || lowerMessage.includes('rinnovabile')) {
        data.sector = 'energia';
      }

      // Target Market
      if (lowerMessage.includes('b2b') || lowerMessage.includes('business to business')) {
        data.targetMarket = 'B2B';
      } else if (lowerMessage.includes('b2c') || lowerMessage.includes('business to consumer')) {
        data.targetMarket = 'B2C';
      } else if (lowerMessage.includes('b2g') || lowerMessage.includes('business to government')) {
        data.targetMarket = 'B2G';
      } else if (lowerMessage.includes('b2b2c') || lowerMessage.includes('business to business to consumer')) {
        data.targetMarket = 'B2B2C';
      }

      // Investment Amount
      const investmentMatch = message.match(/(?:investimento|finanziamento|capitale|budget)\s*(?:di|:)?\s*([€\d\.,\s]+)/i);
      if (investmentMatch && investmentMatch[1]) {
        data.investmentAmount = investmentMatch[1].trim();
      } else {
        // Prova pattern alternativo per investimento
        const altInvestmentMatch = message.match(/(\d+)\s*(?:euro|€|eur|mila|milioni)/i);
        if (altInvestmentMatch && altInvestmentMatch[1]) {
          data.investmentAmount = altInvestmentMatch[1];
        } else {
          // Prova pattern più semplice
          const simpleInvestmentMatch = message.match(/(\d{4,})/); // Cerca numeri con 4+ cifre
          if (simpleInvestmentMatch && simpleInvestmentMatch[1]) {
            data.investmentAmount = simpleInvestmentMatch[1];
          }
        }
      }

      // Revenue Projection
      const revenueMatch = message.match(/(?:ricavi|fatturato|entrate|revenue)\s*(?:di|:)?\s*([€\d\.,\s]+)/i);
      if (revenueMatch && revenueMatch[1]) {
        data.revenueProjection = revenueMatch[1].trim();
      } else {
        // Prova pattern alternativo per ricavi
        const altRevenueMatch = message.match(/(\d+)\s*(?:euro|€|eur|mila|milioni)\s*(?:di|in)\s*(?:ricavi|fatturato)/i);
        if (altRevenueMatch && altRevenueMatch[1]) {
          data.revenueProjection = altRevenueMatch[1];
        }
      }

      // Timeline
      if (lowerMessage.includes('breve') || lowerMessage.includes('veloce') || lowerMessage.includes('immediato')) {
        data.timeline = 'breve';
      } else if (lowerMessage.includes('lungo') || lowerMessage.includes('esteso') || lowerMessage.includes('dettagliato')) {
        data.timeline = 'lungo';
      } else {
        const timelineMatch = message.match(/(\d+)\s*(?:mesi|anni|giorni|settimane)/i);
        if (timelineMatch) {
          data.timeline = timelineMatch[1] + ' ' + (timelineMatch[0].includes('anni') ? 'anni' : 'mesi');
        }
      }

      // Team Size
      const teamMatch = message.match(/(?:team|equipe|personale|dipendenti)\s*(?:di|:)?\s*(\d+)/i);
      if (teamMatch && teamMatch[1]) {
        data.teamSize = parseInt(teamMatch[1]);
      } else {
        // Prova pattern alternativo per team
        const altTeamMatch = message.match(/(\d+)\s*(?:persone|dipendenti|membri|risorse)/i);
        if (altTeamMatch && altTeamMatch[1]) {
          data.teamSize = parseInt(altTeamMatch[1]);
        }
      }

      // Competitive Advantage
      const advantages = [];
      if (lowerMessage.includes('innovazione') || lowerMessage.includes('innovative')) advantages.push('innovazione');
      if (lowerMessage.includes('tecnologia') || lowerMessage.includes('tech')) advantages.push('tecnologia');
      if (lowerMessage.includes('prezzo') || lowerMessage.includes('costo')) advantages.push('prezzo competitivo');
      if (lowerMessage.includes('qualità') || lowerMessage.includes('quality')) advantages.push('qualità');
      if (lowerMessage.includes('servizio') || lowerMessage.includes('service')) advantages.push('servizio clienti');
      if (lowerMessage.includes('velocità') || lowerMessage.includes('speed')) advantages.push('velocità');
      if (lowerMessage.includes('esperienza') || lowerMessage.includes('experience')) advantages.push('esperienza');
      if (lowerMessage.includes('rete') || lowerMessage.includes('network')) advantages.push('rete di contatti');
      if (lowerMessage.includes('esclusività') || lowerMessage.includes('exclusive')) advantages.push('esclusività');
      if (advantages.length > 0) {
        data.competitiveAdvantage = advantages.join(', ');
      }

      // Goals
      const goals = [];
      if (lowerMessage.includes('crescita') || lowerMessage.includes('growth')) goals.push('crescita');
      if (lowerMessage.includes('espansione') || lowerMessage.includes('expansion')) goals.push('espansione');
      if (lowerMessage.includes('profittabilità') || lowerMessage.includes('profitability')) goals.push('profittabilità');
      if (lowerMessage.includes('mercato') || lowerMessage.includes('market share')) goals.push('quota di mercato');
      if (lowerMessage.includes('innovazione') || lowerMessage.includes('innovation')) goals.push('innovazione');
      if (lowerMessage.includes('sostenibilità') || lowerMessage.includes('sustainability')) goals.push('sostenibilità');
      if (lowerMessage.includes('internazionalizzazione') || lowerMessage.includes('internationalization')) goals.push('internazionalizzazione');
      if (goals.length > 0) {
        data.goals = goals.join(', ');
      }

      // Risks
      const risks = [];
      if (lowerMessage.includes('mercato') || lowerMessage.includes('market risk')) risks.push('rischio di mercato');
      if (lowerMessage.includes('finanziario') || lowerMessage.includes('financial')) risks.push('rischio finanziario');
      if (lowerMessage.includes('tecnologico') || lowerMessage.includes('technology')) risks.push('rischio tecnologico');
      if (lowerMessage.includes('regolatorio') || lowerMessage.includes('regulatory')) risks.push('rischio regolatorio');
      if (lowerMessage.includes('competizione') || lowerMessage.includes('competition')) risks.push('rischio competitivo');
      if (lowerMessage.includes('operativo') || lowerMessage.includes('operational')) risks.push('rischio operativo');
      if (lowerMessage.includes('liquidità') || lowerMessage.includes('liquidity')) risks.push('rischio di liquidità');
      if (risks.length > 0) {
        data.risks = risks.join(', ');
      }
    }

    // Estrai da cronologia conversazione
    history.forEach(msg => {
      if (msg.type === 'user') {
        const histData = this.extractDataFromMessage(msg.content, [], intent);
        Object.assign(data, histData);
      }
    });

    // Se abbiamo dati dalla cronologia, combinali con i dati attuali
    if (history.length > 0) {
      const allMessages = history.map(msg => msg.content).join(' ');
      const combinedData = this.extractDataFromMessage(allMessages, [], intent);
      Object.assign(data, combinedData);
      
      // Estrai anche dai dati già raccolti nella cronologia
      history.forEach(msg => {
        if (msg.intent && msg.intent.collectedData) {
          Object.assign(data, msg.intent.collectedData);
        }
      });
    }

    return data;
  }

  // Determina campi mancanti
  private getMissingFields(collectedData: any, intent: string): string[] {
    if (intent === 'general') return [];
    
    const requiredFields = this.REQUIRED_FIELDS[intent as keyof typeof this.REQUIRED_FIELDS] || [];
    return requiredFields.filter(field => !collectedData[field]);
  }

  // Genera suggerimenti intelligenti
  private generateSuggestions(intent: string, missingFields: string[], collectedData: any): string[] {
    const suggestions: string[] = [];

    if (intent === 'feasibility') {
      if (missingFields.includes('projectName')) {
        suggestions.push('Come vorresti chiamare questo progetto?');
      }
      if (missingFields.includes('location')) {
        suggestions.push('In quale città o zona si trova il terreno?');
      }
      if (missingFields.includes('propertyType')) {
        suggestions.push('Che tipo di sviluppo stai considerando? (residenziale, commerciale, misto)');
      }
      if (missingFields.includes('totalArea')) {
        suggestions.push('Qual è la superficie totale del terreno in metri quadrati?');
      }
      if (missingFields.includes('buildableArea')) {
        suggestions.push('Quanti metri quadrati sono edificabili?');
      }
      if (missingFields.includes('budget')) {
        suggestions.push('Qual è il budget previsto per il progetto?');
      }
    }

    if (intent === 'market-intelligence') {
      if (missingFields.includes('location')) {
        suggestions.push('In quale città o zona vuoi cercare terreni?');
      }
      if (missingFields.includes('propertyType')) {
        suggestions.push('Che tipo di proprietà ti interessa? (residenziale, commerciale, industriale, misto)');
      }
      if (missingFields.includes('budget')) {
        suggestions.push('Qual è il tuo budget massimo per l\'investimento?');
      }
      if (missingFields.includes('area')) {
        suggestions.push('Che superficie minima ti serve? (es. 1000 mq, 1 ettaro)');
      }
      if (missingFields.includes('email')) {
        suggestions.push('A quale email vuoi ricevere i risultati della ricerca?');
      }
      if (missingFields.includes('frequency')) {
        suggestions.push('Vuoi una ricerca immediata o programmata? (es. ogni venerdì alle 9)');
      }
    }

    if (intent === 'design') {
      if (missingFields.includes('projectName')) {
        suggestions.push('Come vorresti chiamare questo progetto di design?');
      }
      if (missingFields.includes('location')) {
        suggestions.push('In quale città o zona si trova il progetto?');
      }
      if (missingFields.includes('propertyType')) {
        suggestions.push('Che tipo di immobile stai progettando? (residenziale, commerciale, industriale, misto)');
      }
      if (missingFields.includes('designStyle')) {
        suggestions.push('Che stile preferisci? (moderno, classico, minimalista, vintage, industrial, scandinavo, mediterraneo, elegante)');
      }
      if (missingFields.includes('layoutType')) {
        suggestions.push('Che tipo di layout preferisci? (open space, tradizionale, bifamiliare, monolocale, attico)');
      }
      if (missingFields.includes('totalArea')) {
        suggestions.push('Qual è la superficie totale da progettare? (es. 120 mq, 200 mq)');
      }
      if (missingFields.includes('rooms')) {
        suggestions.push('Quante camere/stanze vuoi progettare? (es. 3 camere, 5 locali)');
      }
      if (missingFields.includes('budget')) {
        suggestions.push('Qual è il budget per il progetto di design?');
      }
      if (missingFields.includes('timeline')) {
        suggestions.push('In quanto tempo vuoi completare il progetto? (es. 3 mesi, 6 mesi)');
      }
      if (missingFields.includes('materials')) {
        suggestions.push('Che materiali preferisci? (legno, vetro, metallo, pietra, marmo, cemento, mattoni, ceramica)');
      }
      if (missingFields.includes('specialRequirements')) {
        suggestions.push('Hai requisiti speciali? (accessibilità, sostenibilità, domotica, piscina, giardino, terrazza, garage)');
      }
    }

    if (intent === 'business-plan') {
      if (missingFields.includes('projectName')) {
        suggestions.push('Come vorresti chiamare questo business plan?');
      }
      if (missingFields.includes('businessType')) {
        suggestions.push('Che tipo di business stai pianificando? (startup, azienda, consulenza, e-commerce, franchising, partnership)');
      }
      if (missingFields.includes('sector')) {
        suggestions.push('In quale settore operi? (immobiliare, tecnologia, finanza, salute, educazione, retail, ristorazione, turismo, logistica, energia)');
      }
      if (missingFields.includes('location')) {
        suggestions.push('In quale città o zona operi?');
      }
      if (missingFields.includes('targetMarket')) {
        suggestions.push('Qual è il tuo mercato target? (B2B, B2C, B2G, B2B2C)');
      }
      if (missingFields.includes('investmentAmount')) {
        suggestions.push('Qual è l\'investimento iniziale previsto? (es. 100.000 euro, 500.000 euro)');
      }
      if (missingFields.includes('revenueProjection')) {
        suggestions.push('Quali sono le proiezioni di ricavi? (es. 200.000 euro nel primo anno)');
      }
      if (missingFields.includes('timeline')) {
        suggestions.push('In quanto tempo vuoi implementare il business plan? (es. 6 mesi, 1 anno, 3 anni)');
      }
      if (missingFields.includes('teamSize')) {
        suggestions.push('Quante persone compongono il team? (es. 5 persone, 10 dipendenti)');
      }
      if (missingFields.includes('competitiveAdvantage')) {
        suggestions.push('Qual è il tuo vantaggio competitivo? (innovazione, tecnologia, prezzo competitivo, qualità, servizio clienti, velocità, esperienza)');
      }
      if (missingFields.includes('goals')) {
        suggestions.push('Quali sono i tuoi obiettivi principali? (crescita, espansione, profittabilità, quota di mercato, innovazione, sostenibilità)');
      }
      if (missingFields.includes('risks')) {
        suggestions.push('Quali sono i principali rischi da considerare? (rischio di mercato, finanziario, tecnologico, regolatorio, competitivo, operativo)');
      }
    }

    return suggestions.slice(0, 3); // Massimo 3 suggerimenti
  }

  // Crea il progetto quando tutti i campi sono completi
  async createProjectFromIntent(
    intent: UserIntent, 
    userId: string, 
    userEmail: string
  ): Promise<ProjectPreview | null> {
    try {
      console.log('🔄 [Intent Service] createProjectFromIntent chiamata');
      
      if (intent.type === 'feasibility' && intent.missingFields.length === 0) {
        console.log('🚀 [Intent Service] Creazione progetto feasibility reale...');
        
        // Crea progetto con dati minimi ma completi
        const projectData = {
          name: intent.collectedData.projectName || 'Progetto da Chat',
          address: intent.collectedData.location || 'Da definire',
          status: 'PIANIFICAZIONE' as const,
          startDate: new Date(),
          constructionStartDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          duration: 12,
          totalArea: intent.collectedData.totalArea || 0,
          createdBy: userId,
          costs: {
            land: { purchasePrice: 0, purchaseTaxes: 0, intermediationFees: 0, subtotal: 0 },
            construction: { excavation: 0, structures: 0, systems: 0, finishes: 0, subtotal: 0 },
            externalWorks: 0, concessionFees: 0, design: 0, bankCharges: 0, exchange: 0, insurance: 0, total: 0
          },
          revenues: {
            units: 1, averageArea: 0, pricePerSqm: 0, revenuePerUnit: 0, totalSales: 0, otherRevenues: 0, total: 0
          },
          results: { profit: 0, margin: 0, roi: 0, paybackPeriod: 0 },
          targetMargin: 20,
          isTargetAchieved: false,
          notes: `Progetto creato tramite chat - Area: ${intent.collectedData.totalArea}mq, Budget: €${intent.collectedData.budget}`
        };

        console.log('🔄 [Intent Service] Tentativo creazione progetto Firebase...');
        const projectId = await feasibilityService.createProject(projectData);
        console.log('✅ [Intent Service] Progetto creato con ID:', projectId);
        
        return {
          id: projectId,
          name: projectData.name,
          type: 'feasibility',
          status: 'created',
          preview: {
            title: projectData.name,
            description: `Progetto a ${intent.collectedData.location}`,
            keyInfo: [
              `Area: ${intent.collectedData.totalArea} mq`,
              `Budget: €${intent.collectedData.budget}`,
              `Tipo: ${intent.collectedData.propertyType}`
            ],
            metrics: { 
              area: intent.collectedData.totalArea || 0, 
              budget: this.parseBudget(intent.collectedData.budget) || 0, 
              type: intent.collectedData.propertyType || 'residenziale' 
            }
          },
          url: `/dashboard/feasibility-analysis/${projectId}`
        };
      }

      // Crea ricerca Market Intelligence
      if (intent.type === 'market-intelligence' && intent.missingFields.length === 0) {
        console.log('🚀 [Intent Service] Creazione ricerca Market Intelligence...');
        
        // Simula la creazione di una ricerca Market Intelligence
        const searchId = 'search-' + Date.now();
        const searchResults = this.generateMockSearchResults(intent.collectedData);
        
        console.log('✅ [Intent Service] Ricerca creata con ID:', searchId);
        
        return {
          id: searchId,
          name: `Ricerca Terreni ${intent.collectedData.location}`,
          type: 'market-intelligence',
          status: 'created',
          preview: {
            title: `Ricerca Terreni ${intent.collectedData.location}`,
            description: `Analisi ${intent.collectedData.propertyType} in ${intent.collectedData.location}`,
            keyInfo: [
              `Terreni trovati: ${searchResults.totalResults}`,
              `Budget: €${this.formatNumber(this.parseBudget(intent.collectedData.budget) || 0)}`,
              `Tipo: ${intent.collectedData.propertyType}`,
              `Frequenza: ${intent.collectedData.frequency || 'immediata'}`
            ],
            metrics: { 
              results: searchResults.totalResults, 
              budget: this.parseBudget(intent.collectedData.budget) || 0, 
              type: intent.collectedData.propertyType || 'residenziale' 
            }
          },
          url: `/dashboard/market-intelligence?search=${searchId}`
        };
      }

      // Crea progetto Design Center
      if (intent.type === 'design' && intent.missingFields.length === 0) {
        console.log('🚀 [Intent Service] Creazione progetto Design Center...');
        
        // Simula la creazione di un progetto Design Center
        const designId = 'design-' + Date.now();
        const designResults = this.generateMockDesignResults(intent.collectedData);
        
        console.log('✅ [Intent Service] Progetto design creato con ID:', designId);
        
        return {
          id: designId,
          name: intent.collectedData.projectName || `Progetto Design ${intent.collectedData.location}`,
          type: 'design',
          status: 'created',
          preview: {
            title: intent.collectedData.projectName || `Progetto Design ${intent.collectedData.location}`,
            description: `Design ${intent.collectedData.designStyle} per ${intent.collectedData.propertyType}`,
            keyInfo: [
              `Stile: ${intent.collectedData.designStyle || 'moderno'}`,
              `Area: ${intent.collectedData.totalArea || 0} mq`,
              `Camere: ${intent.collectedData.rooms || 0}`,
              `Budget: €${this.formatNumber(this.parseBudget(intent.collectedData.budget) || 0)}`,
              `Timeline: ${intent.collectedData.timeline || '6 mesi'}`
            ],
            metrics: { 
              area: intent.collectedData.totalArea || 0, 
              budget: this.parseBudget(intent.collectedData.budget) || 0, 
              type: intent.collectedData.propertyType || 'residenziale',
              style: intent.collectedData.designStyle || 'moderno',
              rooms: intent.collectedData.rooms || 0
            }
          },
          url: `/dashboard/design-center?project=${designId}`
        };
      }

      // Crea Business Plan
      if (intent.type === 'business-plan' && intent.missingFields.length === 0) {
        console.log('🚀 [Intent Service] Creazione Business Plan...');
        
        // Simula la creazione di un Business Plan
        const businessPlanId = 'business-plan-' + Date.now();
        const businessPlanResults = this.generateMockBusinessPlanResults(intent.collectedData);
        
        console.log('✅ [Intent Service] Business Plan creato con ID:', businessPlanId);
        
        return {
          id: businessPlanId,
          name: intent.collectedData.projectName || `Business Plan ${intent.collectedData.location}`,
          type: 'business-plan',
          status: 'created',
          preview: {
            title: intent.collectedData.projectName || `Business Plan ${intent.collectedData.location}`,
            description: `${intent.collectedData.businessType} nel settore ${intent.collectedData.sector}`,
            keyInfo: [
              `Settore: ${intent.collectedData.sector || 'immobiliare'}`,
              `Tipo: ${intent.collectedData.businessType || 'startup'}`,
              `Investimento: €${this.formatNumber(this.parseBudget(intent.collectedData.investmentAmount) || 0)}`,
              `Team: ${intent.collectedData.teamSize || 0} persone`,
              `Timeline: ${intent.collectedData.timeline || '12 mesi'}`
            ],
            metrics: { 
              investment: this.parseBudget(intent.collectedData.investmentAmount) || 0, 
              teamSize: intent.collectedData.teamSize || 0, 
              sector: intent.collectedData.sector || 'immobiliare',
              businessType: intent.collectedData.businessType || 'startup',
              timeline: intent.collectedData.timeline || '12 mesi'
            }
          },
          url: `/dashboard/business-plan?plan=${businessPlanId}`
        };
      }

      console.log('⚠️ [Intent Service] Condizioni non soddisfatte per creazione progetto');
      return null;
    } catch (error) {
      console.error('❌ [Intent Service] Errore creazione progetto:', error);
      
      // Fallback: restituisci un progetto mock se Firebase fallisce
      if (intent.type === 'feasibility') {
        console.log('🔄 [Intent Service] Fallback a progetto mock...');
        return {
          id: 'fallback-project-' + Date.now(),
          name: intent.collectedData.projectName || 'Progetto Test',
          type: 'feasibility',
          status: 'created',
          preview: {
            title: intent.collectedData.projectName || 'Progetto Test',
            description: `Progetto a ${intent.collectedData.location}`,
            keyInfo: [`Area: ${intent.collectedData.totalArea} mq`],
            metrics: { area: intent.collectedData.totalArea || 0, budget: 0, type: 'residenziale' }
          },
          url: `/dashboard/feasibility-analysis/fallback-project`
        };
      }

      // Fallback per Market Intelligence
      if (intent.type === 'market-intelligence') {
        console.log('🔄 [Intent Service] Fallback a ricerca mock...');
        const searchResults = this.generateMockSearchResults(intent.collectedData);
        return {
          id: 'fallback-search-' + Date.now(),
          name: `Ricerca Terreni ${intent.collectedData.location}`,
          type: 'market-intelligence',
          status: 'created',
          preview: {
            title: `Ricerca Terreni ${intent.collectedData.location}`,
            description: `Analisi ${intent.collectedData.propertyType} in ${intent.collectedData.location}`,
            keyInfo: [
              `Terreni trovati: ${searchResults.totalResults}`,
              `Budget: €${this.formatNumber(this.parseBudget(intent.collectedData.budget) || 0)}`
            ],
            metrics: { 
              results: searchResults.totalResults, 
              budget: this.parseBudget(intent.collectedData.budget) || 0, 
              type: intent.collectedData.propertyType || 'residenziale' 
            }
          },
          url: `/dashboard/market-intelligence?search=fallback`
        };
      }

      // Fallback per Design Center
      if (intent.type === 'design') {
        console.log('🔄 [Intent Service] Fallback a progetto design mock...');
        const designResults = this.generateMockDesignResults(intent.collectedData);
        return {
          id: 'fallback-design-' + Date.now(),
          name: intent.collectedData.projectName || `Progetto Design ${intent.collectedData.location}`,
          type: 'design',
          status: 'created',
          preview: {
            title: intent.collectedData.projectName || `Progetto Design ${intent.collectedData.location}`,
            description: `Design ${intent.collectedData.designStyle} per ${intent.collectedData.propertyType}`,
            keyInfo: [
              `Stile: ${intent.collectedData.designStyle || 'moderno'}`,
              `Area: ${intent.collectedData.totalArea || 0} mq`,
              `Budget: €${this.formatNumber(this.parseBudget(intent.collectedData.budget) || 0)}`
            ],
            metrics: { 
              area: intent.collectedData.totalArea || 0, 
              budget: this.parseBudget(intent.collectedData.budget) || 0, 
              type: intent.collectedData.propertyType || 'residenziale',
              style: intent.collectedData.designStyle || 'moderno'
            }
          },
          url: `/dashboard/design-center?project=fallback`
        };
      }

      // Fallback per Business Plan
      if (intent.type === 'business-plan') {
        console.log('🔄 [Intent Service] Fallback a business plan mock...');
        const businessPlanResults = this.generateMockBusinessPlanResults(intent.collectedData);
        return {
          id: 'fallback-business-plan-' + Date.now(),
          name: intent.collectedData.projectName || `Business Plan ${intent.collectedData.location}`,
          type: 'business-plan',
          status: 'created',
          preview: {
            title: intent.collectedData.projectName || `Business Plan ${intent.collectedData.location}`,
            description: `${intent.collectedData.businessType} nel settore ${intent.collectedData.sector}`,
            keyInfo: [
              `Settore: ${intent.collectedData.sector || 'immobiliare'}`,
              `Investimento: €${this.formatNumber(this.parseBudget(intent.collectedData.investmentAmount) || 0)}`,
              `Team: ${intent.collectedData.teamSize || 0} persone`
            ],
            metrics: { 
              investment: this.parseBudget(intent.collectedData.investmentAmount) || 0, 
              teamSize: intent.collectedData.teamSize || 0, 
              sector: intent.collectedData.sector || 'immobiliare'
            }
          },
          url: `/dashboard/business-plan?plan=fallback`
        };
      }
      
      return null;
    }
  }

  // Utility per parsing budget
  private parseBudget(budgetStr?: string): number {
    if (!budgetStr) return 0;
    
    const cleanStr = budgetStr.replace(/[€\s,]/g, '');
    const number = parseFloat(cleanStr);
    return isNaN(number) ? 0 : number;
  }

  // Utility per parsing timeline
  private parseTimeline(timelineStr?: string): number {
    if (!timelineStr) return 12;
    
    // Estrai il numero dai mesi/anni
    const monthsMatch = timelineStr.match(/(\d+)\s*mesi/i);
    if (monthsMatch && monthsMatch[1]) {
      return parseInt(monthsMatch[1]);
    }
    
    const yearsMatch = timelineStr.match(/(\d+)\s*anni/i);
    if (yearsMatch && yearsMatch[1]) {
      return parseInt(yearsMatch[1]) * 12;
    }
    
    return 12; // default
  }

  // Utility per formattazione numeri
  private formatNumber(num: number): string {
    return new Intl.NumberFormat('it-IT').format(num);
  }

  // Genera risultati mock per Market Intelligence
  private generateMockSearchResults(data: any): any {
    const baseResults = Math.floor(Math.random() * 15) + 5; // 5-20 risultati
    const budget = this.parseBudget(data.budget) || 1000000;
    
    // Aggiusta il numero di risultati basato sul budget
    const budgetMultiplier = Math.min(budget / 500000, 2); // Max 2x per budget alti
    const totalResults = Math.floor(baseResults * budgetMultiplier);
    
    return {
      totalResults,
      averagePrice: Math.floor(budget * 0.8 + Math.random() * budget * 0.4),
      bestDeal: {
        price: Math.floor(budget * 0.6),
        area: data.area || 1000,
        location: data.location,
        score: 9.2
      },
      priceRange: {
        min: Math.floor(budget * 0.4),
        max: Math.floor(budget * 1.2)
      }
    };
  }

  // Genera risultati mock per Design Center
  private generateMockDesignResults(data: any): any {
    const budget = this.parseBudget(data.budget) || 50000;
    const area = data.totalArea || 100;
    const rooms = data.rooms || 3;
    
    // Calcola metriche basate sui parametri
    const costPerSqm = Math.floor(budget / area);
    const designComplexity = this.calculateDesignComplexity(data);
    const estimatedDuration = this.calculateDesignDuration(area, designComplexity);
    
    return {
      designComplexity,
      costPerSqm,
      estimatedDuration,
      deliverables: this.generateDesignDeliverables(data),
      materials: data.materials ? data.materials.split(', ') : ['legno', 'vetro', 'metallo'],
      specialFeatures: data.specialRequirements ? data.specialRequirements.split(', ') : ['illuminazione LED', 'domotica base'],
      renderings: Math.floor(Math.random() * 5) + 3, // 3-7 renderings
      plans: Math.floor(Math.random() * 3) + 2, // 2-4 planimetrie
      sections: Math.floor(Math.random() * 2) + 1 // 1-2 sezioni
    };
  }

  // Calcola complessità del design
  private calculateDesignComplexity(data: any): string {
    let complexity = 0;
    
    if (data.specialRequirements) complexity += 2;
    if (data.materials && data.materials.split(', ').length > 3) complexity += 1;
    if (data.totalArea && data.totalArea > 200) complexity += 1;
    if (data.rooms && data.rooms > 5) complexity += 1;
    if (data.designStyle === 'elegante' || data.designStyle === 'luxury') complexity += 2;
    
    if (complexity <= 2) return 'semplice';
    if (complexity <= 4) return 'media';
    return 'complessa';
  }

  // Calcola durata stimata del progetto
  private calculateDesignDuration(area: number, complexity: string): number {
    const baseDuration = Math.ceil(area / 50); // 1 settimana ogni 50mq
    const complexityMultiplier = complexity === 'semplice' ? 1 : complexity === 'media' ? 1.5 : 2;
    return Math.ceil(baseDuration * complexityMultiplier);
  }

  // Genera deliverables del progetto
  private generateDesignDeliverables(data: any): string[] {
    const deliverables = ['Planimetrie', 'Renderings 3D', 'Sezioni', 'Facciate'];
    
    if (data.specialRequirements && data.specialRequirements.includes('domotica')) {
      deliverables.push('Schema impianti domotici');
    }
    if (data.specialRequirements && data.specialRequirements.includes('sostenibilità')) {
      deliverables.push('Certificazione energetica');
    }
    if (data.designStyle === 'elegante' || data.designStyle === 'luxury') {
      deliverables.push('Dettagli di finitura', 'Specifiche materiali');
    }
    
    return deliverables;
  }

  // Genera risultati mock per Business Plan
  private generateMockBusinessPlanResults(data: any): any {
    const investment = this.parseBudget(data.investmentAmount) || 100000;
    const teamSize = data.teamSize || 5;
    const sector = data.sector || 'immobiliare';
    
    // Calcola metriche basate sui parametri
    const revenueProjection = this.calculateRevenueProjection(investment, sector);
    const breakEvenMonths = this.calculateBreakEvenMonths(investment, revenueProjection);
    const marketSize = this.calculateMarketSize(sector);
    const competitiveScore = this.calculateCompetitiveScore(data);
    
    return {
      revenueProjection,
      breakEvenMonths,
      marketSize,
      competitiveScore,
      financialProjections: this.generateFinancialProjections(investment, revenueProjection),
      marketAnalysis: this.generateMarketAnalysis(sector),
      riskAssessment: this.generateRiskAssessment(data),
      growthStrategy: this.generateGrowthStrategy(data),
      teamStructure: this.generateTeamStructure(teamSize),
      milestones: this.generateMilestones(data.timeline || '12 mesi')
    };
  }

  // Calcola proiezioni di ricavi
  private calculateRevenueProjection(investment: number, sector: string): number {
    const sectorMultipliers: { [key: string]: number } = {
      'immobiliare': 0.15,
      'tecnologia': 0.25,
      'finanza': 0.20,
      'salute': 0.18,
      'educazione': 0.12,
      'retail': 0.22,
      'ristorazione': 0.30,
      'turismo': 0.16,
      'logistica': 0.14,
      'energia': 0.10
    };
    
    const multiplier = sectorMultipliers[sector] || 0.15;
    return Math.floor(investment * multiplier);
  }

  // Calcola mesi per break-even
  private calculateBreakEvenMonths(investment: number, monthlyRevenue: number): number {
    if (monthlyRevenue <= 0) return 999;
    return Math.ceil(investment / monthlyRevenue);
  }

  // Calcola dimensione del mercato
  private calculateMarketSize(sector: string): string {
    const marketSizes: { [key: string]: string } = {
      'immobiliare': '€50M - €200M',
      'tecnologia': '€100M - €500M',
      'finanza': '€200M - €1B',
      'salute': '€150M - €800M',
      'educazione': '€80M - €300M',
      'retail': '€120M - €600M',
      'ristorazione': '€60M - €250M',
      'turismo': '€90M - €400M',
      'logistica': '€70M - €350M',
      'energia': '€300M - €1.5B'
    };
    
    return marketSizes[sector] || '€100M - €500M';
  }

  // Calcola score competitivo
  private calculateCompetitiveScore(data: any): number {
    let score = 5; // Base score
    
    if (data.competitiveAdvantage) score += 2;
    if (data.teamSize && data.teamSize > 10) score += 1;
    if (data.sector === 'tecnologia') score += 1;
    if (data.businessType === 'startup') score += 1;
    
    return Math.min(score, 10);
  }

  // Genera proiezioni finanziarie
  private generateFinancialProjections(investment: number, monthlyRevenue: number): any {
    return {
      year1: {
        revenue: monthlyRevenue * 12,
        costs: Math.floor(investment * 0.6),
        profit: (monthlyRevenue * 12) - Math.floor(investment * 0.6)
      },
      year2: {
        revenue: Math.floor(monthlyRevenue * 12 * 1.5),
        costs: Math.floor(investment * 0.4),
        profit: Math.floor(monthlyRevenue * 12 * 1.5) - Math.floor(investment * 0.4)
      },
      year3: {
        revenue: Math.floor(monthlyRevenue * 12 * 2.2),
        costs: Math.floor(investment * 0.3),
        profit: Math.floor(monthlyRevenue * 12 * 2.2) - Math.floor(investment * 0.3)
      }
    };
  }

  // Genera analisi di mercato
  private generateMarketAnalysis(sector: string): any {
    return {
      marketTrend: 'Crescita positiva',
      competitionLevel: 'Media',
      barriersToEntry: 'Moderate',
      opportunities: ['Digitalizzazione', 'Sostenibilità', 'Innovazione'],
      threats: ['Competizione', 'Regolamentazione', 'Costi crescenti']
    };
  }

  // Genera valutazione dei rischi
  private generateRiskAssessment(data: any): any {
    return {
      financialRisk: 'Media',
      marketRisk: 'Bassa',
      operationalRisk: 'Bassa',
      regulatoryRisk: 'Media',
      mitigationStrategies: ['Diversificazione', 'Assicurazioni', 'Controlli interni']
    };
  }

  // Genera strategia di crescita
  private generateGrowthStrategy(data: any): any {
    return {
      phase1: 'Validazione del mercato',
      phase2: 'Espansione locale',
      phase3: 'Scalabilità nazionale',
      keyMetrics: ['Crescita ricavi', 'Soddisfazione clienti', 'Efficienza operativa']
    };
  }

  // Genera struttura del team
  private generateTeamStructure(teamSize: number): any {
    const roles = ['CEO', 'CTO', 'CFO', 'Marketing Manager', 'Sales Manager'];
    return {
      currentTeam: teamSize,
      keyRoles: roles.slice(0, Math.min(teamSize, roles.length)),
      hiringPlan: teamSize < 10 ? 'Espansione graduale' : 'Team completo'
    };
  }

  // Genera milestone
  private generateMilestones(timeline: string): any[] {
    const months = parseInt(timeline) || 12;
    const milestones = [];
    
    for (let i = 1; i <= Math.min(months, 12); i += 3) {
      milestones.push({
        month: i,
        milestone: `Milestone ${Math.ceil(i/3)}`,
        description: `Obiettivo raggiunto al mese ${i}`
      });
    }
    
    return milestones;
  }

  // Genera risposta intelligente basata sull'intent
  generateIntelligentResponse(intent: UserIntent, projectPreview?: ProjectPreview): string {
    if (projectPreview && projectPreview.status === 'created') {
      if (projectPreview.type === 'feasibility') {
        return `🎉 **Studio di Fattibilità Creato!**

Ho creato il tuo studio di fattibilità "${projectPreview.name}". 

**Dettagli Progetto:**
${projectPreview.preview.keyInfo.map(info => `• ${info}`).join('\n')}

Clicca sul progetto qui sotto per visualizzarlo e modificarlo come preferisci!`;
      } else if (projectPreview.type === 'market-intelligence') {
        return `🔍 **Ricerca Market Intelligence Completata!**

Ho completato la tua ricerca terreni "${projectPreview.name}". 

**Risultati della Ricerca:**
${projectPreview.preview.keyInfo.map(info => `• ${info}`).join('\n')}

Clicca sulla ricerca qui sotto per visualizzare tutti i dettagli e i terreni trovati!`;
      } else if (projectPreview.type === 'design') {
        return `🎨 **Progetto Design Center Creato!**

Ho creato il tuo progetto di design "${projectPreview.name}". 

**Dettagli del Progetto:**
${projectPreview.preview.keyInfo.map(info => `• ${info}`).join('\n')}

Clicca sul progetto qui sotto per visualizzare renderings, planimetrie e tutti i dettagli del design!`;
      } else if (projectPreview.type === 'business-plan') {
        return `📊 **Business Plan Creato!**

Ho creato il tuo business plan "${projectPreview.name}". 

**Dettagli del Business Plan:**
${projectPreview.preview.keyInfo.map(info => `• ${info}`).join('\n')}

Clicca sul business plan qui sotto per visualizzare proiezioni finanziarie, analisi di mercato e strategia di crescita!`;
      }
    }

    if (intent.type === 'feasibility') {
      if (intent.missingFields.length > 0) {
        return `Per creare il tuo studio di fattibilità, ho bisogno di alcune informazioni aggiuntive:

**Informazioni Mancanti:**
${intent.missingFields.map(field => `• ${this.getFieldDisplayName(field)}`).join('\n')}

**Suggerimenti:**
${intent.suggestions.map(suggestion => `• ${suggestion}`).join('\n')}

Una volta che mi darai queste informazioni, creerò automaticamente il tuo studio di fattibilità!`;
      }
    }

    if (intent.type === 'market-intelligence') {
      if (intent.missingFields.length > 0) {
        return `Per avviare la tua ricerca Market Intelligence, ho bisogno di alcune informazioni:

**Informazioni Mancanti:**
${intent.missingFields.map(field => `• ${this.getFieldDisplayName(field)}`).join('\n')}

**Suggerimenti:**
${intent.suggestions.map(suggestion => `• ${suggestion}`).join('\n')}

Una volta che mi darai queste informazioni, avvierò la ricerca e ti mostrerò i terreni migliori!`;
      }
    }

    if (intent.type === 'design') {
      if (intent.missingFields.length > 0) {
        return `Per creare il tuo progetto Design Center, ho bisogno di alcune informazioni:

**Informazioni Mancanti:**
${intent.missingFields.map(field => `• ${this.getFieldDisplayName(field)}`).join('\n')}

**Suggerimenti:**
${intent.suggestions.map(suggestion => `• ${suggestion}`).join('\n')}

Una volta che mi darai queste informazioni, creerò il tuo progetto di design con renderings, planimetrie e tutti i dettagli!`;
      }
    }

    if (intent.type === 'business-plan') {
      if (intent.missingFields.length > 0) {
        return `Per creare il tuo business plan, ho bisogno di alcune informazioni:

**Informazioni Mancanti:**
${intent.missingFields.map(field => `• ${this.getFieldDisplayName(field)}`).join('\n')}

**Suggerimenti:**
${intent.suggestions.map(suggestion => `• ${suggestion}`).join('\n')}

Una volta che mi darai queste informazioni, creerò il tuo business plan con proiezioni finanziarie, analisi di mercato e strategia di crescita!`;
      }
    }

    return 'Come posso aiutarti oggi?';
  }

  private getFieldDisplayName(field: string): string {
    const fieldNames: { [key: string]: string } = {
      projectName: 'Nome del progetto',
      location: 'Localizzazione',
      propertyType: 'Tipo di proprietà',
      totalArea: 'Superficie totale',
      buildableArea: 'Area edificabile',
      budget: 'Budget',
      timeline: 'Timeline',
      area: 'Superficie minima',
      email: 'Email per i risultati',
      frequency: 'Frequenza della ricerca',
      analysisType: 'Tipo di analisi',
      timeframe: 'Periodo di analisi',
      designStyle: 'Stile di design',
      layoutType: 'Tipo di layout',
      rooms: 'Numero di camere',
      materials: 'Materiali',
      specialRequirements: 'Requisiti speciali',
      businessType: 'Tipo di business',
      sector: 'Settore',
      targetMarket: 'Mercato target',
      investmentAmount: 'Investimento iniziale',
      revenueProjection: 'Proiezioni di ricavi',
      teamSize: 'Dimensione del team',
      competitiveAdvantage: 'Vantaggio competitivo',
      goals: 'Obiettivi',
      risks: 'Rischi'
    };
    return fieldNames[field] || field;
  }
}

export const intentService = new IntentService();
