/**
 * API Endpoint per Ricerca per Distanza
 * Trova comuni e zone vicini a una posizione specifica
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { z } from 'zod';

// Schema per validazione richiesta
const NearbyRequestSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  radius: z.number().min(0.1).max(1000).default(10), // km
  type: z.enum(['all', 'comune', 'zona']).default('all'),
  limit: z.number().min(1).max(100).default(20),
  includeCoordinates: z.boolean().default(true),
  includeMetadata: z.boolean().default(false)
});

export type NearbyRequest = z.infer<typeof NearbyRequestSchema>;

export interface NearbyResult {
  id: number;
  nome: string;
  tipo: 'comune' | 'zona';
  provincia: string;
  regione: string;
  latitudine: number;
  longitudine: number;
  popolazione?: number;
  superficie?: number;
  distance: number; // km
  metadata?: any;
}

export interface NearbyResponse {
  success: boolean;
  results: NearbyResult[];
  total: number;
  center: {
    lat: number;
    lng: number;
  };
  radius: number;
  filters: {
    type: string;
  };
  performance: {
    queryTime: number;
  };
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Estrai parametri query
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const radius = parseFloat(searchParams.get('radius') || '10');
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '20');
    const includeCoordinates = searchParams.get('includeCoordinates') !== 'false';
    const includeMetadata = searchParams.get('includeMetadata') === 'true';

    // Valida parametri
    const validatedParams = NearbyRequestSchema.parse({
      lat,
      lng,
      radius,
      type,
      limit,
      includeCoordinates,
      includeMetadata
    });

    // Esegui ricerca
    const results = await performNearbySearch(validatedParams);

    const queryTime = Date.now() - startTime;

    const response: NearbyResponse = {
      success: true,
      results: results.results,
      total: results.total,
      center: {
        lat,
        lng
      },
      radius,
      filters: {
        type
      },
      performance: {
        queryTime
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Errore ricerca vicinanze:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
      results: [],
      total: 0,
      center: { lat: 0, lng: 0 },
      radius: 0,
      filters: { type: 'all' },
      performance: {
        queryTime: Date.now() - startTime
      }
    }, { status: 500 });
  }
}

/**
 * Esegue ricerca per distanza
 */
async function performNearbySearch(params: NearbyRequest): Promise<{
  results: NearbyResult[];
  total: number;
}> {
  const { lat, lng, radius, type, limit, includeCoordinates, includeMetadata } = params;

  let sqlQuery = '';
  let countQuery = '';
  const queryParams = [lat, lng, radius * 1000]; // Converte km in metri per PostGIS

  if (type === 'comune') {
    // Ricerca solo comuni
    sqlQuery = `
      SELECT 
        c.id,
        c.nome,
        'comune' as tipo,
        p.nome as provincia,
        r.nome as regione,
        c.latitudine,
        c.longitudine,
        c.popolazione,
        c.superficie,
        ${includeMetadata ? 'c.codice_istat, c.cap, c.zona_climatica' : ''}
        ST_Distance(
          c.geometry::geography,
          ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography
        ) / 1000 as distance
      FROM comuni c
      JOIN regioni r ON c.regione_id = r.id
      JOIN province p ON c.provincia_id = p.id
      WHERE ST_DWithin(
        c.geometry::geography,
        ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
        $3
      )
      ORDER BY distance ASC
      LIMIT $4
    `;
    
    countQuery = `
      SELECT COUNT(*) as count
      FROM comuni c
      WHERE ST_DWithin(
        c.geometry::geography,
        ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
        $3
      )
    `;
    
    queryParams.push(limit);

  } else if (type === 'zona') {
    // Ricerca solo zone
    sqlQuery = `
      SELECT 
        z.id + 1000000 as id,
        z.nome,
        z.tipo_zona as tipo,
        p.nome as provincia,
        r.nome as regione,
        z.latitudine,
        z.longitudine,
        z.popolazione,
        z.superficie,
        ${includeMetadata ? 'z.metadata' : ''}
        ST_Distance(
          z.geometry::geography,
          ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography
        ) / 1000 as distance
      FROM zone_urbane z
      JOIN comuni c ON z.comune_id = c.id
      JOIN regioni r ON c.regione_id = r.id
      JOIN province p ON c.provincia_id = p.id
      WHERE ST_DWithin(
        z.geometry::geography,
        ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
        $3
      )
      ORDER BY distance ASC
      LIMIT $4
    `;
    
    countQuery = `
      SELECT COUNT(*) as count
      FROM zone_urbane z
      WHERE ST_DWithin(
        z.geometry::geography,
        ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
        $3
      )
    `;
    
    queryParams.push(limit);

  } else {
    // Ricerca mista
    sqlQuery = `
      WITH nearby_results AS (
        SELECT 
          c.id,
          c.nome,
          'comune' as tipo,
          p.nome as provincia,
          r.nome as regione,
          c.latitudine,
          c.longitudine,
          c.popolazione,
          c.superficie,
          ${includeMetadata ? 'c.codice_istat, c.cap, c.zona_climatica' : ''}
          ST_Distance(
            c.geometry::geography,
            ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography
          ) / 1000 as distance
        FROM comuni c
        JOIN regioni r ON c.regione_id = r.id
        JOIN province p ON c.provincia_id = p.id
        WHERE ST_DWithin(
          c.geometry::geography,
          ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
          $3
        )
        
        UNION ALL
        
        SELECT 
          z.id + 1000000 as id,
          z.nome,
          z.tipo_zona as tipo,
          p.nome as provincia,
          r.nome as regione,
          z.latitudine,
          z.longitudine,
          z.popolazione,
          z.superficie,
          ${includeMetadata ? 'z.metadata' : ''}
          ST_Distance(
            z.geometry::geography,
            ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography
          ) / 1000 as distance
        FROM zone_urbane z
        JOIN comuni c ON z.comune_id = c.id
        JOIN regioni r ON c.regione_id = r.id
        JOIN province p ON c.provincia_id = p.id
        WHERE ST_DWithin(
          z.geometry::geography,
          ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
          $3
        )
      )
      SELECT * FROM nearby_results
      ORDER BY distance ASC
      LIMIT $4
    `;
    
    countQuery = `
      WITH nearby_results AS (
        SELECT c.id FROM comuni c
        WHERE ST_DWithin(
          c.geometry::geography,
          ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
          $3
        )
        
        UNION ALL
        
        SELECT z.id + 1000000 as id FROM zone_urbane z
        WHERE ST_DWithin(
          z.geometry::geography,
          ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
          $3
        )
      )
      SELECT COUNT(*) as count FROM nearby_results
    `;
    
    queryParams.push(limit);
  }

  // Esegui query
  const [results, countResult] = await Promise.all([
    db.query(sqlQuery, queryParams),
    db.query(countQuery, queryParams.slice(0, -1)) // Rimuovi limit per count
  ]);

  const total = countResult[0].count;
  const nearbyResults: NearbyResult[] = results.map((row: any) => ({
    id: row.id,
    nome: row.nome,
    tipo: row.tipo,
    provincia: row.provincia,
    regione: row.regione,
    latitudine: row.latitudine,
    longitudine: row.longitudine,
    popolazione: row.popolazione,
    superficie: row.superficie,
    distance: Math.round(row.distance * 100) / 100, // Arrotonda a 2 decimali
    metadata: includeMetadata ? {
      codice_istat: row.codice_istat,
      cap: row.cap,
      zona_climatica: row.zona_climatica,
      metadata: row.metadata
    } : undefined
  }));

  return {
    results: nearbyResults,
    total
  };
}
