/**
 * API Endpoint Ricerca Geografica con Firestore
 * Utilizza il database Firebase esistente di Urbanova
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, startAfter } from 'firebase/firestore';

// Mock rate limiting function
const rateLimit = (config: any) => {
  return (req: any, res: any, next: any) => {
    // Mock implementation - no actual rate limiting
    if (next) next();
  };
};

// Schema di validazione per la richiesta
const SearchRequestSchema = z.object({
  q: z.string().min(1).max(100),
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
  latitudine?: number;
  longitudine?: number;
  metadata?: Record<string, any>;
  score?: number;
  distance?: number;
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
  const requestId = request.headers.get('x-request-id') || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Log della richiesta
  LoggerService.logApiRequest({
    method: 'GET',
    endpoint: '/api/geographic/search',
    ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    requestId,
    query: Object.fromEntries(request.nextUrl.searchParams)
  });

  try {
    // Estrai parametri dalla query string
    const searchParams = request.nextUrl.searchParams;
    const rawParams = {
      q: searchParams.get('q'),
      type: searchParams.get('type'),
      region: searchParams.get('region'),
      province: searchParams.get('province'),
      lat: searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined,
      lng: searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined,
      radius: searchParams.get('radius') ? parseFloat(searchParams.get('radius')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
      includeCoordinates: searchParams.get('includeCoordinates') === 'true',
      includeMetadata: searchParams.get('includeMetadata') === 'true',
      sortBy: searchParams.get('sortBy')
    };

    // Valida i parametri
    const validationResult = SearchRequestSchema.safeParse(rawParams);
    if (!validationResult.success) {
      const errorMessage = 'Parametri di ricerca non validi';
      LoggerService.logApiError({
        method: 'GET',
        endpoint: '/api/geographic/search',
        statusCode: 400,
        error: new Error(errorMessage),
        requestId,
        query: rawParams
      });

      return NextResponse.json({
        success: false,
        error: errorMessage,
        message: 'Parametri di ricerca non validi',
        details: validationResult.error.errors
      }, { status: 400 });
    }

    const params = validationResult.data;

    // Genera chiave cache
    const cacheKey = `search:${Buffer.from(JSON.stringify(params)).toString('base64')}`;
    
    // Controlla cache
    let cachedResult = await CacheService.getCachedSearchResult(cacheKey);
    if (cachedResult) {
      const executionTime = Date.now() - startTime;
      
      LoggerService.logApiResponse({
        method: 'GET',
        endpoint: '/api/geographic/search',
        statusCode: 200,
        responseTime: executionTime,
        requestId
      });

      return NextResponse.json({
        success: true,
        data: {
          ...cachedResult,
          executionTime,
          cached: true
        }
      });
    }

    // Esegui ricerca nel database
    let query: string;
    let queryParams: any[];
    let countQuery: string;
    let countParams: any[];

    if (params.lat && params.lng) {
      // Ricerca combinata (full-text + spaziale)
      const columns = ['nome', 'provincia', 'regione'];
      const searchVector = columns.map(col => `to_tsvector('italian', ${col})`).join(' || ');
      const searchQuery = `to_tsquery('italian', $1)`;
      
      query = `
        SELECT 
          id,
          nome,
          provincia,
          regione,
          'comune' as tipo,
          popolazione,
          superficie,
          ST_Y(geom) as latitudine,
          ST_X(geom) as longitudine,
          ts_rank(${searchVector}, ${searchQuery}) as score,
          ST_Distance(geom, ST_SetSRID(ST_MakePoint($3, $2), 4326)) as distance
        FROM comuni
        WHERE ${searchVector} @@ ${searchQuery}
          AND ST_DWithin(geom, ST_SetSRID(ST_MakePoint($3, $2), 4326), $4 * 1000)
          ${params.type === 'comune' ? '' : `
        UNION ALL
        SELECT 
          id,
          nome,
          provincia,
          regione,
          'zona' as tipo,
          popolazione,
          superficie,
          ST_Y(geom) as latitudine,
          ST_X(geom) as longitudine,
          ts_rank(${searchVector}, ${searchQuery}) as score,
          ST_Distance(geom, ST_SetSRID(ST_MakePoint($3, $2), 4326)) as distance
        FROM zone
        WHERE ${searchVector} @@ ${searchQuery}
          AND ST_DWithin(geom, ST_SetSRID(ST_MakePoint($3, $2), 4326), $4 * 1000)
          `}
        ORDER BY score DESC, distance ASC
        LIMIT $5 OFFSET $6
      `;
      
      queryParams = [params.q, params.lat, params.lng, params.radius, params.limit, params.offset];
      
      countQuery = `
        SELECT COUNT(*) as total FROM (
          SELECT 1 FROM comuni
          WHERE ${searchVector} @@ ${searchQuery}
            AND ST_DWithin(geom, ST_SetSRID(ST_MakePoint($3, $2), 4326), $4 * 1000)
          ${params.type === 'comune' ? '' : `
          UNION ALL
          SELECT 1 FROM zone
          WHERE ${searchVector} @@ ${searchQuery}
            AND ST_DWithin(geom, ST_SetSRID(ST_MakePoint($3, $2), 4326), $4 * 1000)
          `}
        ) as combined_results
      `;
      
      countParams = [params.q, params.lat, params.lng, params.radius];
    } else {
      // Ricerca solo full-text
      const columns = ['nome', 'provincia', 'regione'];
      const searchVector = columns.map(col => `to_tsvector('italian', ${col})`).join(' || ');
      const searchQuery = `to_tsquery('italian', $1)`;
      
      query = `
        SELECT 
          id,
          nome,
          provincia,
          regione,
          'comune' as tipo,
          popolazione,
          superficie,
          ST_Y(geom) as latitudine,
          ST_X(geom) as longitudine,
          ts_rank(${searchVector}, ${searchQuery}) as score
        FROM comuni
        WHERE ${searchVector} @@ ${searchQuery}
          ${params.region ? 'AND regione = $2' : ''}
          ${params.province ? `AND provincia = $${params.region ? '3' : '2'}` : ''}
        ${params.type === 'comune' ? '' : `
        UNION ALL
        SELECT 
          id,
          nome,
          provincia,
          regione,
          'zona' as tipo,
          popolazione,
          superficie,
          ST_Y(geom) as latitudine,
          ST_X(geom) as longitudine,
          ts_rank(${searchVector}, ${searchQuery}) as score
        FROM zone
        WHERE ${searchVector} @@ ${searchQuery}
          ${params.region ? 'AND regione = $2' : ''}
          ${params.province ? `AND provincia = $${params.region ? '3' : '2'}` : ''}
        `}
        ORDER BY score DESC, nome ASC
        LIMIT $${params.region ? (params.province ? '4' : '3') : (params.province ? '3' : '2')} 
        OFFSET $${params.region ? (params.province ? '5' : '4') : (params.province ? '4' : '3')}
      `;
      
      queryParams = [params.q];
      if (params.region) queryParams.push(params.region);
      if (params.province) queryParams.push(params.province);
      queryParams.push(params.limit, params.offset);
      
      countQuery = `
        SELECT COUNT(*) as total FROM (
          SELECT 1 FROM comuni
          WHERE ${searchVector} @@ ${searchQuery}
            ${params.region ? 'AND regione = $2' : ''}
            ${params.province ? `AND provincia = $${params.region ? '3' : '2'}` : ''}
          ${params.type === 'comune' ? '' : `
          UNION ALL
          SELECT 1 FROM zone
          WHERE ${searchVector} @@ ${searchQuery}
            ${params.region ? 'AND regione = $2' : ''}
            ${params.province ? `AND provincia = $${params.region ? '3' : '2'}` : ''}
          `}
        ) as combined_results
      `;
      
      countParams = [params.q];
      if (params.region) countParams.push(params.region);
      if (params.province) countParams.push(params.province);
    }

    // Esegui query in parallelo
    const [results, countResult] = await Promise.all([
      db.query(query, queryParams),
      db.query(countQuery, countParams)
    ]);

    const total = parseInt(countResult.rows[0].total);
    const hasMore = params.offset + params.limit < total;

    // Formatta risultati
    const formattedResults: SearchResult[] = results.rows.map(row => ({
      id: row.id,
      nome: row.nome,
      provincia: row.provincia,
      regione: row.regione,
      tipo: row.tipo,
      popolazione: row.popolazione,
      superficie: row.superficie,
      latitudine: params.includeCoordinates ? row.latitudine : undefined,
      longitudine: params.includeCoordinates ? row.longitudine : undefined,
      metadata: params.includeMetadata ? {
        score: row.score,
        distance: row.distance
      } : undefined,
      score: row.score,
      distance: row.distance
    }));

    const responseData = {
      results: formattedResults,
      total,
      page: Math.floor(params.offset / params.limit) + 1,
      limit: params.limit,
      hasMore,
      query: params.q,
      filters: {
        type: params.type,
        region: params.region,
        province: params.province,
        lat: params.lat,
        lng: params.lng,
        radius: params.radius
      },
      executionTime: Date.now() - startTime,
      cached: false
    };

    // Cache il risultato
    await CacheService.cacheSearchResult(cacheKey, responseData);

    // Log della risposta
    LoggerService.logApiResponse({
      method: 'GET',
      endpoint: '/api/geographic/search',
      statusCode: 200,
      responseTime: responseData.executionTime,
      requestId
    });

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    LoggerService.logApiError({
      method: 'GET',
      endpoint: '/api/geographic/search',
      statusCode: 500,
      error: error as Error,
      requestId
    });

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