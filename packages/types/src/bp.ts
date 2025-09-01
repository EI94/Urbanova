// Business Plan Types - Urbanova AI
// Interfacce complete per Business Plan con integrazione Comps/OMI

import { z } from 'zod';

// ============================================================================
// INPUT TYPES
// ============================================================================

/**
 * Input per il calcolo del Business Plan
 */
interface BPInput {
  /** ID del progetto */
  projectId: string;

  /** Dati del terreno */
  land: {
    /** Prezzo richiesto per il terreno */
    priceAsk: number;
    /** Tasse e oneri (opzionale) */
    taxes?: number;
    /** Superficie del terreno in mq */
    surface: number;
    /** Zona/città del terreno */
    zone: string;
  };

  /** Struttura dei costi */
  costs: {
    /** Costi hard (costruzione) */
    hard: {
      /** Costo per mq di costruzione */
      perSqm: number;
      /** Superficie costruibile in mq */
      buildableSqm: number;
      /** Costi infrastrutturali */
      infrastructure?: number;
    };
    /** Costi soft (progettazione, permessi) */
    soft: {
      /** Progettazione architettonica */
      design: number;
      /** Permessi e pratiche */
      permits: number;
      /** Direzione lavori */
      supervision: number;
      /** Altri costi soft */
      other?: number;
    };
    /** Fees e commissioni */
    fees: {
      /** Commissioni agenzia */
      agency: number;
      /** Notaio */
      notary: number;
      /** Altri fees */
      other?: number;
    };
    /** Contingency (riserva) */
    contingency: number;
  };

  /** Strategia di prezzo */
  prices: {
    /** Prezzo base per mq */
    psqmBase: number;
    /** Prezzi per tipologia (opzionale) */
    byTypology?: {
      /** Appartamenti 2-3 locali */
      small?: number;
      /** Appartamenti 4+ locali */
      large?: number;
      /** Villette */
      villa?: number;
      /** Commerciale */
      commercial?: number;
    };
    /** Strategia di vendita */
    strategy: 'immediate' | 'gradual' | 'auction';
  };

  /** Timeline del progetto */
  timing: {
    /** Mesi di sviluppo/realizzazione */
    monthsDev: number;
    /** Mesi di vendita */
    monthsSales: number;
    /** Mesi di pre-vendita */
    monthsPreSales?: number;
  };

  /** Analisi di sensibilità - FIRST CLASS */
  sensitivity: {
    /** Delta percentuali per i costi */
    costDeltas: number[];
    /** Delta percentuali per i prezzi */
    priceDeltas: number[];
    /** Delta percentuali per i tempi */
    timingDeltas?: number[];
  };

  /** Configurazione aggiuntiva */
  config?: {
    /** Tasso di interesse per finanziamento */
    interestRate?: number;
    /** Inflazione annua prevista */
    inflation?: number;
    /** Tasso di sconto per NPV */
    discountRate?: number;
  };
}

/**
 * Schema Zod per BPInput
 */
const zBPInput = z.object({
  projectId: z.string().min(1),
  land: z.object({
    priceAsk: z.number().positive(),
    taxes: z.number().nonnegative().optional(),
    surface: z.number().positive(),
    zone: z.string().min(1),
  }),
  costs: z.object({
    hard: z.object({
      perSqm: z.number().positive(),
      buildableSqm: z.number().positive(),
      infrastructure: z.number().nonnegative().optional(),
    }),
    soft: z.object({
      design: z.number().nonnegative(),
      permits: z.number().nonnegative(),
      supervision: z.number().nonnegative(),
      other: z.number().nonnegative().optional(),
    }),
  }),
  revenues: z.object({
    units: z.number().positive(),
    averageArea: z.number().positive(),
    pricePerSqm: z.number().positive(),
  }),
  timeline: z.object({
    constructionMonths: z.number().positive(),
    sellingMonths: z.number().positive(),
  }),
});

// ============================================================================
// OUTPUT TYPES
// ============================================================================

/**
 * Risultato del calcolo del Business Plan
 */
interface BPResult {
  /** ROI (Return on Investment) */
  roi: number;

  /** Margine percentuale */
  marginPct: number;

  /** Anni di payback */
  paybackYears: number;

  /** IRR (Internal Rate of Return) - opzionale */
  irr?: number;

  /** Cash flow mensile */
  cashflowMonths: number[];

  /** Scenari di sensibilità */
  scenarios: Array<{
    /** Etichetta del delta (es. "+5% costi, -10% prezzi") */
    deltaLabel: string;
    /** ROI per questo scenario */
    roi: number;
    /** Margine percentuale per questo scenario */
    marginPct: number;
    /** Payback per questo scenario */
    paybackYears: number;
    /** IRR per questo scenario */
    irr?: number;
  }>;

  /** Comps utilizzati per i calcoli */
  compsUsed: {
    /** Dati OMI */
    omi: {
      /** Zona OMI */
      zone: string;
      /** Range di prezzi OMI */
      range: {
        min: number;
        max: number;
        median: number;
        confidence: number;
      };
    };
    /** Comps interni */
    internal: {
      /** Numero di comps trovati */
      count: number;
      /** Percentile 50 */
      p50: number;
      /** Percentile 75 */
      p75: number;
      /** Filtro outlier applicato */
      outliersRemoved: number;
      /** Raggio di ricerca utilizzato */
      searchRadius: number;
    };
  };

  /** Metadati del calcolo */
  metadata: {
    /** Timestamp del calcolo */
    calculatedAt: Date;
    /** Versione del modello */
    modelVersion: string;
    /** Tempo di esecuzione in ms */
    executionTime: number;
    /** Input utilizzato (snapshot) */
    inputSnapshot: BPInput;
    /** Provenance dei dati */
    dataProvenance: {
      omi: {
        source: 'API' | 'CACHE' | 'FALLBACK';
        timestamp: Date;
        confidence: number;
      };
      internal: {
        source: 'FIRESTORE' | 'CACHE';
        timestamp: Date;
        confidence: number;
      };
    };
  };
}

/**
 * Schema Zod per BPResult
 */
const zBPResult = z.object({
  roi: z.number(),
  marginPct: z.number(),
  paybackYears: z.number(),
  irr: z.number().optional(),
  cashflowMonths: z.array(z.number()),
  breakEvenMonth: z.number(),
  sensitivity: z.array(
    z.object({
      scenario: z.string(),
      roi: z.number(),
      marginPct: z.number(),
      paybackYears: z.number(),
    })
  ),
});

// ============================================================================
// COMPUTATION TYPES
// ============================================================================

/**
 * Scenario di sensibilità
 */
interface SensitivityScenario {
  /** Nome dello scenario */
  name: string;
  /** Delta per i costi */
  costDelta: number;
  /** Delta per i prezzi */
  priceDelta: number;
  /** Delta per i tempi */
  timingDelta?: number;
  /** Input modificato per questo scenario */
  modifiedInput: BPInput;
}

/**
 * Risultato dello scenario
 */
interface ScenarioResult {
  /** Scenario di input */
  scenario: SensitivityScenario;
  /** Risultato calcolato */
  result: {
    roi: number;
    marginPct: number;
    paybackYears: number;
    irr?: number;
    npv: number;
  };
}

/**
 * Configurazione per il calcolo
 */
interface BPCalculationConfig {
  /** Abilita outlier filtering */
  enableOutlierFiltering: boolean;
  /** Soglia per outlier (percentile) */
  outlierThreshold: number;
  /** Raggio di ricerca per comps interni (km) */
  searchRadius: number;
  /** Abilita caching */
  enableCaching: boolean;
  /** TTL cache in secondi */
  cacheTTL: number;
  /** Abilita fallback */
  enableFallback: boolean;
  /** Timeout per API esterne (ms) */
  apiTimeout: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Range di prezzi
 */
interface PriceRange {
  min: number;
  max: number;
  median: number;
  mean: number;
  stdDev: number;
  confidence: number;
}

/**
 * Statistiche dei comps
 */
interface CompsStats {
  count: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  outliersRemoved: number;
  confidence: number;
}

/**
 * Provenance dei dati
 */
interface DataProvenance {
  source: string;
  timestamp: Date;
  confidence: number;
  lastUpdated: Date;
  version: string;
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  BPInput,
  BPResult,
  SensitivityScenario,
  ScenarioResult,
  BPCalculationConfig,
  PriceRange,
  CompsStats,
  DataProvenance,
};

export { zBPInput, zBPResult };
