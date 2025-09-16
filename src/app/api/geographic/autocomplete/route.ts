/**
 * API Endpoint Autocomplete Production Level
 * Utilizza Firestore per utenti paganti con dati reali italiani
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { firestoreGeographicService } from '@/lib/geographic/firestoreGeographicService';

// Schema di validazione per la richiesta
const AutocompleteRequestSchema = z.object({
  q: z.string().min(1).max(50).optional(),
  type: z.enum(['comune', 'zona', 'all']).optional().default('all'),
  region: z.string().optional(),
  province: z.string().optional(),
  limit: z.number().min(1).max(50).optional().default(10),
  includeCoordinates: z.boolean().optional().default(false),
  fuzzy: z.boolean().optional().default(true)
});

// Interfaccia per il suggerimento
interface AutocompleteSuggestion {
  id: number;
  text: string;
  type: 'comune' | 'zona';
  region: string;
  province: string;
  population?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  score: number;
  highlight: string;
}

// Interfaccia per la risposta API
interface AutocompleteResponse {
  success: boolean;
  data?: {
    suggestions: AutocompleteSuggestion[];
    query: string;
    total: number;
    executionTime: number;
    cached: boolean;
  };
  error?: string;
  message?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  
  try {
    // Estrai parametri dalla query string
    const searchParams = request.nextUrl.searchParams;
    const rawParams = {
      q: searchParams.get('q') || undefined,
      type: searchParams.get('type') || undefined,
      region: searchParams.get('region') || undefined,
      province: searchParams.get('province') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      includeCoordinates: searchParams.get('includeCoordinates') === 'true',
      fuzzy: searchParams.get('fuzzy') !== 'false'
    };

    // Valida i parametri
    const validationResult = AutocompleteRequestSchema.safeParse(rawParams);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parametri di autocomplete non validi',
        message: 'Parametri di autocomplete non validi',
        details: validationResult.error.errors
      }, { status: 400 });
    }

    const params = validationResult.data;

    // Inizializza dati geografici se necessario
    await firestoreGeographicService.initializeGeographicData();

    // Esegui autocomplete production level con Firestore
    const autocompleteResults = await firestoreGeographicService.autocompleteGeographicData({
      query: params.q,
      type: params.type,
      region: params.region || undefined,
      province: params.province || undefined,
      limit: params.limit,
      includeCoordinates: params.includeCoordinates,
      fuzzy: params.fuzzy
    });

    const responseData = {
      suggestions: autocompleteResults,
      query: params.q,
      total: autocompleteResults.length,
      executionTime: Date.now() - startTime,
      cached: false
    };

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    console.error('❌ Errore API geographic autocomplete:', error);

    return NextResponse.json({
      success: false,
      error: 'Errore interno del server',
      message: 'Si è verificato un errore durante l\'autocomplete',
      executionTime
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Per ora POST usa la stessa logica di GET
  return GET(request);
}
