/**
 * Test Automatizzati Production-Ready per API Geografiche
 * Test completi per ricerca, autocomplete e health check
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import { NextRequest } from 'next/server';
import { db } from '@/lib/database/db';
import { redisClient } from '@/lib/cache/redisClient';
import { CacheService } from '@/lib/cache/redisClient';

// Mock per NextRequest
const createMockRequest = (url: string, method: string = 'GET', body?: any): NextRequest => {
  const mockRequest = {
    url,
    method,
    headers: new Map([
      ['x-request-id', 'test-request-id'],
      ['user-agent', 'test-user-agent'],
      ['x-forwarded-for', '127.0.0.1']
    ]),
    nextUrl: new URL(url),
    ip: '127.0.0.1',
    json: async () => body || {}
  } as any;
  
  return mockRequest;
};

describe('API Geografiche Production Tests', () => {
  beforeAll(async () => {
    // Setup database e cache per i test
    try {
      await db.connect();
      await redisClient.connect();
      
      // Crea dati di test
      await setupTestData();
    } catch (error) {
      console.error('Errore setup test:', error);
    }
  });

  afterAll(async () => {
    // Cleanup
    try {
      await cleanupTestData();
      await redisClient.disconnect();
      await db.disconnect();
    } catch (error) {
      console.error('Errore cleanup test:', error);
    }
  });

  beforeEach(async () => {
    // Pulisci cache prima di ogni test
    await CacheService.clearAllCache();
  });

  describe('GET /api/geographic/search', () => {
    it('dovrebbe restituire risultati di ricerca validi', async () => {
      const mockRequest = createMockRequest('http://localhost:3000/api/geographic/search?q=Roma&limit=10');
      
      // Importa dinamicamente il modulo per evitare problemi di import
      const { GET } = await import('@/app/api/geographic/search/route');
      const response = await GET(mockRequest);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.results).toBeInstanceOf(Array);
      expect(data.data.total).toBeGreaterThanOrEqual(0);
      expect(data.data.executionTime).toBeGreaterThan(0);
    });

    it('dovrebbe gestire parametri di ricerca non validi', async () => {
      const mockRequest = createMockRequest('http://localhost:3000/api/geographic/search?q=&limit=1000');
      
      const { GET } = await import('@/app/api/geographic/search/route');
      const response = await GET(mockRequest);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('dovrebbe supportare ricerca spaziale', async () => {
      const mockRequest = createMockRequest('http://localhost:3000/api/geographic/search?q=Roma&lat=41.9028&lng=12.4964&radius=50');
      
      const { GET } = await import('@/app/api/geographic/search/route');
      const response = await GET(mockRequest);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.results).toBeInstanceOf(Array);
    });

    it('dovrebbe filtrare per tipo elemento', async () => {
      const mockRequest = createMockRequest('http://localhost:3000/api/geographic/search?q=Roma&type=comune');
      
      const { GET } = await import('@/app/api/geographic/search/route');
      const response = await GET(mockRequest);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.results.every((r: any) => r.tipo === 'comune')).toBe(true);
    });

    it('dovrebbe filtrare per regione', async () => {
      const mockRequest = createMockRequest('http://localhost:3000/api/geographic/search?q=Roma&region=Lazio');
      
      const { GET } = await import('@/app/api/geographic/search/route');
      const response = await GET(mockRequest);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.results.every((r: any) => r.regione === 'Lazio')).toBe(true);
    });

    it('dovrebbe implementare paginazione', async () => {
      const mockRequest = createMockRequest('http://localhost:3000/api/geographic/search?q=Roma&limit=5&offset=0');
      
      const { GET } = await import('@/app/api/geographic/search/route');
      const response = await GET(mockRequest);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.results.length).toBeLessThanOrEqual(5);
      expect(data.data.page).toBe(1);
      expect(data.data.hasMore).toBeDefined();
    });

    it('dovrebbe utilizzare cache per query identiche', async () => {
      const mockRequest1 = createMockRequest('http://localhost:3000/api/geographic/search?q=Roma&limit=10');
      const mockRequest2 = createMockRequest('http://localhost:3000/api/geographic/search?q=Roma&limit=10');
      
      const { GET } = await import('@/app/api/geographic/search/route');
      
      const response1 = await GET(mockRequest1);
      const response2 = await GET(mockRequest2);
      
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      
      const data1 = await response1.json();
      const data2 = await response2.json();
      
      expect(data1.success).toBe(true);
      expect(data2.success).toBe(true);
      expect(data2.data.cached).toBe(true);
      expect(data2.data.executionTime).toBeLessThan(data1.data.executionTime);
    });
  });

  describe('POST /api/geographic/search', () => {
    it('dovrebbe accettare richieste POST con body JSON', async () => {
      const mockRequest = createMockRequest('http://localhost:3000/api/geographic/search', 'POST', {
        q: 'Roma',
        limit: 10,
        type: 'comune'
      });
      
      const { POST } = await import('@/app/api/geographic/search/route');
      const response = await POST(mockRequest);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.results).toBeInstanceOf(Array);
    });

    it('dovrebbe validare body della richiesta POST', async () => {
      const mockRequest = createMockRequest('http://localhost:3000/api/geographic/search', 'POST', {
        q: '',
        limit: 1000
      });
      
      const { POST } = await import('@/app/api/geographic/search/route');
      const response = await POST(mockRequest);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });

  describe('GET /api/geographic/autocomplete', () => {
    it('dovrebbe restituire suggerimenti di autocomplete', async () => {
      const mockRequest = createMockRequest('http://localhost:3000/api/geographic/autocomplete?q=Roma&limit=5');
      
      const { GET } = await import('@/app/api/geographic/autocomplete/route');
      const response = await GET(mockRequest);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.suggestions).toBeInstanceOf(Array);
      expect(data.data.suggestions.length).toBeLessThanOrEqual(5);
    });

    it('dovrebbe supportare ricerca fuzzy', async () => {
      const mockRequest = createMockRequest('http://localhost:3000/api/geographic/autocomplete?q=Rmo&fuzzy=true');
      
      const { GET } = await import('@/app/api/geographic/autocomplete/route');
      const response = await GET(mockRequest);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.suggestions).toBeInstanceOf(Array);
    });

    it('dovrebbe evidenziare il testo di ricerca', async () => {
      const mockRequest = createMockRequest('http://localhost:3000/api/geographic/autocomplete?q=Roma');
      
      const { GET } = await import('@/app/api/geographic/autocomplete/route');
      const response = await GET(mockRequest);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.suggestions[0].highlight).toContain('<mark>');
    });

    it('dovrebbe includere coordinate se richiesto', async () => {
      const mockRequest = createMockRequest('http://localhost:3000/api/geographic/autocomplete?q=Roma&includeCoordinates=true');
      
      const { GET } = await import('@/app/api/geographic/autocomplete/route');
      const response = await GET(mockRequest);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.suggestions[0].coordinates).toBeDefined();
      expect(data.data.suggestions[0].coordinates.lat).toBeDefined();
      expect(data.data.suggestions[0].coordinates.lng).toBeDefined();
    });
  });

  describe('GET /api/health', () => {
    it('dovrebbe restituire stato del sistema', async () => {
      const mockRequest = createMockRequest('http://localhost:3000/api/health');
      
      const { GET } = await import('@/app/api/health/route');
      const response = await GET(mockRequest);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.status).toBeDefined();
      expect(data.timestamp).toBeDefined();
      expect(data.version).toBeDefined();
      expect(data.environment).toBeDefined();
      expect(data.uptime).toBeGreaterThan(0);
      expect(data.services).toBeInstanceOf(Array);
      expect(data.system).toBeDefined();
      expect(data.responseTime).toBeGreaterThan(0);
    });

    it('dovrebbe includere stato di tutti i servizi', async () => {
      const mockRequest = createMockRequest('http://localhost:3000/api/health');
      
      const { GET } = await import('@/app/api/health/route');
      const response = await GET(mockRequest);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.services).toBeInstanceOf(Array);
      expect(data.services.length).toBeGreaterThan(0);
      
      const serviceNames = data.services.map((s: any) => s.name);
      expect(serviceNames).toContain('database');
      expect(serviceNames).toContain('redis');
    });

    it('dovrebbe restituire 503 se il sistema è unhealthy', async () => {
      // Mock di un servizio unhealthy
      const originalHealthCheck = db.healthCheck;
      db.healthCheck = jest.fn().mockResolvedValue({
        status: 'unhealthy',
        error: 'Database connection failed'
      });
      
      const mockRequest = createMockRequest('http://localhost:3000/api/health');
      
      const { GET } = await import('@/app/api/health/route');
      const response = await GET(mockRequest);
      
      expect(response.status).toBe(503);
      
      const data = await response.json();
      expect(data.status).toBe('unhealthy');
      
      // Ripristina il mock
      db.healthCheck = originalHealthCheck;
    });
  });

  describe('Performance Tests', () => {
    it('dovrebbe rispondere entro 1000ms per ricerche semplici', async () => {
      const mockRequest = createMockRequest('http://localhost:3000/api/geographic/search?q=Roma&limit=10');
      
      const startTime = Date.now();
      const { GET } = await import('@/app/api/geographic/search/route');
      const response = await GET(mockRequest);
      const endTime = Date.now();
      
      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('dovrebbe rispondere entro 500ms per autocomplete', async () => {
      const mockRequest = createMockRequest('http://localhost:3000/api/geographic/autocomplete?q=Roma&limit=5');
      
      const startTime = Date.now();
      const { GET } = await import('@/app/api/geographic/autocomplete/route');
      const response = await GET(mockRequest);
      const endTime = Date.now();
      
      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(500);
    });

    it('dovrebbe gestire concorrenza', async () => {
      const requests = Array.from({ length: 10 }, (_, i) => 
        createMockRequest(`http://localhost:3000/api/geographic/search?q=Roma${i}&limit=5`)
      );
      
      const { GET } = await import('@/app/api/geographic/search/route');
      
      const startTime = Date.now();
      const responses = await Promise.all(requests.map(req => GET(req)));
      const endTime = Date.now();
      
      expect(responses.every(r => r.status === 200)).toBe(true);
      expect(endTime - startTime).toBeLessThan(2000);
    });
  });

  describe('Error Handling Tests', () => {
    it('dovrebbe gestire errori di database', async () => {
      // Mock di un errore di database
      const originalQuery = db.query;
      db.query = jest.fn().mockRejectedValue(new Error('Database connection failed'));
      
      const mockRequest = createMockRequest('http://localhost:3000/api/geographic/search?q=Roma');
      
      const { GET } = await import('@/app/api/geographic/search/route');
      const response = await GET(mockRequest);
      
      expect(response.status).toBe(500);
      
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
      
      // Ripristina il mock
      db.query = originalQuery;
    });

    it('dovrebbe gestire errori di cache', async () => {
      // Mock di un errore di cache
      const originalGet = redisClient.get;
      redisClient.get = jest.fn().mockRejectedValue(new Error('Cache connection failed'));
      
      const mockRequest = createMockRequest('http://localhost:3000/api/geographic/search?q=Roma');
      
      const { GET } = await import('@/app/api/geographic/search/route');
      const response = await GET(mockRequest);
      
      expect(response.status).toBe(500);
      
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
      
      // Ripristina il mock
      redisClient.get = originalGet;
    });
  });
});

// Funzioni di utilità per i test
async function setupTestData(): Promise<void> {
  try {
    // Crea dati di test per comuni
    await db.query(`
      INSERT INTO comuni (istat_code, name, province, region, population, area_sq_km, geom)
      VALUES 
        ('058091', 'Roma', 'Roma', 'Lazio', 2873000, 1285.31, ST_SetSRID(ST_MakePoint(12.4964, 41.9028), 4326)),
        ('015146', 'Milano', 'Milano', 'Lombardia', 1396000, 181.76, ST_SetSRID(ST_MakePoint(9.1900, 45.4642), 4326)),
        ('063049', 'Napoli', 'Napoli', 'Campania', 914000, 119.02, ST_SetSRID(ST_MakePoint(14.2681, 40.8518), 4326))
      ON CONFLICT (istat_code) DO UPDATE SET
        name = EXCLUDED.name,
        province = EXCLUDED.province,
        region = EXCLUDED.region,
        population = EXCLUDED.population,
        area_sq_km = EXCLUDED.area_sq_km,
        geom = EXCLUDED.geom
    `);
    
    // Crea dati di test per zone
    await db.query(`
      INSERT INTO zone (comune_istat_code, name, type, population, area_sq_km, geom)
      VALUES 
        ('058091', 'Centro Storico', 'quartiere', 50000, 5.0, ST_SetSRID(ST_MakePoint(12.4964, 41.9028), 4326)),
        ('015146', 'Brera', 'quartiere', 30000, 3.0, ST_SetSRID(ST_MakePoint(9.1900, 45.4642), 4326)),
        ('063049', 'Vomero', 'quartiere', 40000, 4.0, ST_SetSRID(ST_MakePoint(14.2681, 40.8518), 4326))
    `);
    
    console.log('Dati di test creati con successo');
  } catch (error) {
    console.error('Errore creazione dati di test:', error);
  }
}

async function cleanupTestData(): Promise<void> {
  try {
    // Pulisci dati di test
    await db.query('DELETE FROM zone WHERE comune_istat_code IN (\'058091\', \'015146\', \'063049\')');
    await db.query('DELETE FROM comuni WHERE istat_code IN (\'058091\', \'015146\', \'063049\')');
    
    console.log('Dati di test puliti con successo');
  } catch (error) {
    console.error('Errore pulizia dati di test:', error);
  }
}
