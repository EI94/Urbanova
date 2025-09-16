/**
 * API Endpoint per Ricerca Geografica
 * Endpoint principale per ricerca comuni e zone italiane
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { z } from 'zod';
import { systemMonitor } from '@/lib/monitoring/systemMonitor';

// Schema per validazione richiesta
const SearchRequestSchema = z.object({
  query: z.string().min(1).max(100),
  type: z.enum(['all', 'comune', 'zona']).default('all'),
  region: z.string().optional(),
  province: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  includeCoordinates: z.boolean().default(true),
  includeMetadata: z.boolean().default(false)
});

export type SearchRequest = z.infer<typeof SearchRequestSchema>;

export interface SearchResult {
  id: number;
  nome: string;
  tipo: 'comune' | 'zona';
  provincia: string;
  regione: string;
  latitudine?: number;
  longitudine?: number;
  popolazione?: number;
  superficie?: number;
  metadata?: any;
  score: number;
}

export interface SearchResponse {
  success: boolean;
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  query: string;
  filters: {
    type: string;
    region?: string;
    province?: string;
  };
  performance: {
    queryTime: number;
    cacheHit: boolean;
  };
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Estrai parametri query
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';
    const region = searchParams.get('region') || undefined;
    const province = searchParams.get('province') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const includeCoordinates = searchParams.get('includeCoordinates') !== 'false';
    const includeMetadata = searchParams.get('includeMetadata') === 'true';

    // Valida parametri
    const validatedParams = SearchRequestSchema.parse({
      query,
      type,
      region,
      province,
      limit,
      offset,
      includeCoordinates,
      includeMetadata
    });

    // Esegui ricerca
    const results = await performGeographicSearch(validatedParams);

    // Calcola metriche performance
    const queryTime = Date.now() - startTime;
    
    // Aggiorna statistiche
    await updateSearchStats(validatedParams, results.length, queryTime);

    const response: SearchResponse = {
      success: true,
      results: results.results,
      total: results.total,
      page: Math.floor(offset / limit) + 1,
      limit,
      hasMore: offset + limit < results.total,
      query,
      filters: {
        type,
        region,
        province
      },
      performance: {
        queryTime,
        cacheHit: false // TODO: Implementare cache
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Errore ricerca geografica:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
      results: [],
      total: 0,
      page: 1,
      limit: 20,
      hasMore: false,
      query: '',
      filters: { type: 'all' },
      performance: {
        queryTime: Date.now() - startTime,
        cacheHit: false
      }
    }, { status: 500 });
  }
}

/**
 * Esegue ricerca geografica
 */
async function performGeographicSearch(params: SearchRequest): Promise<{
  results: SearchResult[];
  total: number;
}> {
  const { query, type, region, province, limit, offset, includeCoordinates, includeMetadata } = params;

  // Costruisci query SQL
  let sqlQuery = '';
  let countQuery = '';
  const queryParams: any[] = [];
  let paramIndex = 1;

  if (type === 'comune') {
    // Ricerca solo comuni
    sqlQuery = `
      SELECT 
        c.id,
        c.nome,
        'comune' as tipo,
        p.nome as provincia,
        r.nome as regione,
        ${includeCoordinates ? 'c.latitudine, c.longitudine,' : ''}
        c.popolazione,
        c.superficie,
        ${includeMetadata ? 'c.codice_istat, c.cap, c.zona_climatica' : ''}
        ts_rank(
          to_tsvector('italian', c.nome || ' ' || COALESCE(c.nome_ascii, '')),
          plainto_tsquery('italian', $${paramIndex})
        ) as score
      FROM comuni c
      JOIN regioni r ON c.regione_id = r.id
      JOIN province p ON c.provincia_id = p.id
      WHERE to_tsvector('italian', c.nome || ' ' || COALESCE(c.nome_ascii, ''))
            @@ plainto_tsquery('italian', $${paramIndex})
    `;
    
    countQuery = `
      SELECT COUNT(*) as count
      FROM comuni c
      JOIN regioni r ON c.regione_id = r.id
      JOIN province p ON c.provincia_id = p.id
      WHERE to_tsvector('italian', c.nome || ' ' || COALESCE(c.nome_ascii, ''))
            @@ plainto_tsquery('italian', $${paramIndex})
    `;
    
    queryParams.push(query);
    paramIndex++;

  } else if (type === 'zona') {
    // Ricerca solo zone
    sqlQuery = `
      SELECT 
        z.id + 1000000 as id,
        z.nome,
        z.tipo_zona as tipo,
        p.nome as provincia,
        r.nome as regione,
        ${includeCoordinates ? 'z.latitudine, z.longitudine,' : ''}
        z.popolazione,
        z.superficie,
        ${includeMetadata ? 'z.metadata' : ''}
        ts_rank(
          to_tsvector('italian', z.nome),
          plainto_tsquery('italian', $${paramIndex})
        ) as score
      FROM zone_urbane z
      JOIN comuni c ON z.comune_id = c.id
      JOIN regioni r ON c.regione_id = r.id
      JOIN province p ON c.provincia_id = p.id
      WHERE to_tsvector('italian', z.nome) @@ plainto_tsquery('italian', $${paramIndex})
    `;
    
    countQuery = `
      SELECT COUNT(*) as count
      FROM zone_urbane z
      JOIN comuni c ON z.comune_id = c.id
      JOIN regioni r ON c.regione_id = r.id
      JOIN province p ON c.provincia_id = p.id
      WHERE to_tsvector('italian', z.nome) @@ plainto_tsquery('italian', $${paramIndex})
    `;
    
    queryParams.push(query);
    paramIndex++;

  } else {
    // Ricerca mista
    sqlQuery = `
      WITH search_results AS (
        SELECT 
          c.id,
          c.nome,
          'comune' as tipo,
          p.nome as provincia,
          r.nome as regione,
          ${includeCoordinates ? 'c.latitudine, c.longitudine,' : ''}
          c.popolazione,
          c.superficie,
          ${includeMetadata ? 'c.codice_istat, c.cap, c.zona_climatica' : ''}
          ts_rank(
            to_tsvector('italian', c.nome || ' ' || COALESCE(c.nome_ascii, '')),
            plainto_tsquery('italian', $${paramIndex})
          ) as score
        FROM comuni c
        JOIN regioni r ON c.regione_id = r.id
        JOIN province p ON c.provincia_id = p.id
        WHERE to_tsvector('italian', c.nome || ' ' || COALESCE(c.nome_ascii, ''))
              @@ plainto_tsquery('italian', $${paramIndex})
        
        UNION ALL
        
        SELECT 
          z.id + 1000000 as id,
          z.nome,
          z.tipo_zona as tipo,
          p.nome as provincia,
          r.nome as regione,
          ${includeCoordinates ? 'z.latitudine, z.longitudine,' : ''}
          z.popolazione,
          z.superficie,
          ${includeMetadata ? 'z.metadata' : ''}
          ts_rank(
            to_tsvector('italian', z.nome),
            plainto_tsquery('italian', $${paramIndex})
          ) as score
        FROM zone_urbane z
        JOIN comuni c ON z.comune_id = c.id
        JOIN regioni r ON c.regione_id = r.id
        JOIN province p ON c.provincia_id = p.id
        WHERE to_tsvector('italian', z.nome) @@ plainto_tsquery('italian', $${paramIndex})
      )
      SELECT * FROM search_results
    `;
    
    countQuery = `
      WITH search_results AS (
        SELECT c.id FROM comuni c
        JOIN regioni r ON c.regione_id = r.id
        JOIN province p ON c.provincia_id = p.id
        WHERE to_tsvector('italian', c.nome || ' ' || COALESCE(c.nome_ascii, ''))
              @@ plainto_tsquery('italian', $${paramIndex})
        
        UNION ALL
        
        SELECT z.id + 1000000 as id FROM zone_urbane z
        JOIN comuni c ON z.comune_id = c.id
        JOIN regioni r ON c.regione_id = r.id
        JOIN province p ON c.provincia_id = p.id
        WHERE to_tsvector('italian', z.nome) @@ plainto_tsquery('italian', $${paramIndex})
      )
      SELECT COUNT(*) as count FROM search_results
    `;
    
    queryParams.push(query);
    paramIndex++;
  }

  // Aggiungi filtri regione e provincia
  if (region) {
    sqlQuery += ` AND r.nome = $${paramIndex}`;
    countQuery += ` AND r.nome = $${paramIndex}`;
    queryParams.push(region);
    paramIndex++;
  }

  if (province) {
    sqlQuery += ` AND p.nome = $${paramIndex}`;
    countQuery += ` AND p.nome = $${paramIndex}`;
    queryParams.push(province);
    paramIndex++;
  }

  // Aggiungi ordinamento e limiti
  sqlQuery += ` ORDER BY score DESC, popolazione DESC NULLS LAST LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  queryParams.push(limit, offset);

  // Esegui query
  const [results, countResult] = await Promise.all([
    db.query(sqlQuery, queryParams),
    db.query(countQuery, queryParams.slice(0, -2)) // Rimuovi limit e offset per count
  ]);

  const total = countResult[0].count;
  const searchResults: SearchResult[] = results.map((row: any) => ({
    id: row.id,
    nome: row.nome,
    tipo: row.tipo,
    provincia: row.provincia,
    regione: row.regione,
    latitudine: includeCoordinates ? row.latitudine : undefined,
    longitudine: includeCoordinates ? row.longitudine : undefined,
    popolazione: row.popolazione,
    superficie: row.superficie,
    metadata: includeMetadata ? {
      codice_istat: row.codice_istat,
      cap: row.cap,
      zona_climatica: row.zona_climatica,
      metadata: row.metadata
    } : undefined,
    score: row.score
  }));

  return {
    results: searchResults,
    total
  };
}

/**
 * Aggiorna statistiche ricerca
 */
async function updateSearchStats(params: SearchRequest, resultCount: number, queryTime: number): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    await db.query(`
      INSERT INTO usage_stats (date, total_searches, successful_searches, avg_response_time)
      VALUES ($1, 1, $2, $3)
      ON CONFLICT (date) DO UPDATE SET
        total_searches = usage_stats.total_searches + 1,
        successful_searches = usage_stats.successful_searches + $2,
        avg_response_time = (usage_stats.avg_response_time * usage_stats.total_searches + $3) / (usage_stats.total_searches + 1)
    `, [today, resultCount > 0 ? 1 : 0, queryTime]);
    
  } catch (error) {
    console.warn('Errore aggiornamento statistiche:', error);
  }
}
