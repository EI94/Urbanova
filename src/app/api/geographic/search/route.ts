/**
 * API Endpoint Ricerca Geografica Production Level
 * Utilizza Firestore per utenti paganti con dati reali italiani
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { firestoreGeographicService } from '@/lib/geographic/firestoreGeographicService';

// Mock rate limiting function
const rateLimit = (config: any) => {
  return (req: any, res: any, next: any) => {
    // Mock implementation - no actual rate limiting
    if (next) next();
  };
};

// Schema di validazione per la richiesta
const SearchRequestSchema = z.object({
  q: z.string().min(1).max(100).optional(),
  type: z.enum(['comune', 'zona', 'all']).optional().default('all'),
  region: z.string().optional(),
  province: z.string().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  radius: z.number().min(0.1).max(1000).optional().default(50),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
  includeCoordinates: z.boolean().optional().default(true),
  includeMetadata: z.boolean().optional().default(true),
  sortBy: z.enum(['relevance', 'distance', 'name', 'population']).optional().default('relevance')
});

// Schema di validazione per la risposta
const SearchResultSchema = z.object({
  id: z.number(),
  nome: z.string(),
  provincia: z.string(),
  regione: z.string(),
  tipo: z.enum(['comune', 'zona']),
  popolazione: z.number().optional(),
  superficie: z.number().optional(),
  latitudine: z.number().optional(),
  longitudine: z.number().optional(),
  metadata: z.record(z.any()).optional(),
  score: z.number().optional(),
  distance: z.number().optional()
});

// Rate limiting rimosso per semplicità

// Interfaccia per il risultato della ricerca
interface SearchResult {
  id: number;
  nome: string;
  provincia: string;
  regione: string;
  tipo: 'comune' | 'zona';
  popolazione?: number;
  superficie?: number;
  latitudine?: number | undefined;
  longitudine?: number | undefined;
  metadata?: Record<string, any> | undefined;
  score?: number;
  distance?: number | undefined;
}

// Interfaccia per la risposta API
interface SearchResponse {
  success: boolean;
  data?: {
    results: SearchResult[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
    query: string;
    filters: Record<string, any>;
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
      lat: searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined,
      lng: searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined,
      radius: searchParams.get('radius') ? parseFloat(searchParams.get('radius')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
      includeCoordinates: searchParams.get('includeCoordinates') === 'true',
      includeMetadata: searchParams.get('includeMetadata') === 'true',
      sortBy: searchParams.get('sortBy') || undefined
    };

    // Valida i parametri
    const validationResult = SearchRequestSchema.safeParse(rawParams);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parametri di ricerca non validi',
        message: 'Parametri di ricerca non validi',
        details: validationResult.error.errors
      }, { status: 400 });
    }

    const params = validationResult.data;

    // Inizializza dati geografici se necessario
    await firestoreGeographicService.initializeGeographicData();

    // Esegui ricerca production level con Firestore
    const searchResults = await firestoreGeographicService.searchGeographicData({
      query: params.q,
      type: params.type,
      region: params.region || undefined,
      province: params.province || undefined,
      lat: params.lat || undefined,
      lng: params.lng || undefined,
      radius: params.radius,
      limit: params.limit,
      offset: params.offset,
      includeCoordinates: params.includeCoordinates,
      includeMetadata: params.includeMetadata,
      sortBy: params.sortBy
    });

    const responseData = {
      results: searchResults.results,
      total: searchResults.total,
      page: Math.floor(params.offset / params.limit) + 1,
      limit: params.limit,
      hasMore: searchResults.hasMore,
      query: params.q,
      filters: {
        type: params.type,
        region: params.region,
        province: params.province,
        lat: params.lat,
        lng: params.lng,
        radius: params.radius
      },
      executionTime: searchResults.executionTime,
      cached: false
    };

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    console.error('❌ Errore API geographic search:', error);

    return NextResponse.json({
      success: false,
      error: 'Errore interno del server',
      message: 'Si è verificato un errore durante la ricerca',
      executionTime
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Per ora POST usa la stessa logica di GET
  return GET(request);
}