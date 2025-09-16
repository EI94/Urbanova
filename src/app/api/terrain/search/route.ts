/**
 * API Endpoint per ricerca terreni
 * Integrazione con database ISTAT completo
 */

import { NextRequest, NextResponse } from 'next/server';
import { TerrainSearchCriteria, TerrainSearchResult, TerrainData } from '@/lib/terrainSearchService';

// Dati mock per terreni (da sostituire con database reale)
const mockTerrainData: TerrainData[] = [
  {
    id: '1',
    comune: 'Roma',
    provincia: 'Roma',
    regione: 'Lazio',
    lat: 41.9028,
    lng: 12.4964,
    price: 2500000,
    area: 5000,
    type: 'residenziale',
    status: 'disponibile',
    features: ['Vista panoramica', 'Accesso diretto', 'Permessi edilizi'],
    images: ['/images/terrain1.jpg'],
    description: 'Terreno residenziale con vista panoramica su Roma, ideale per sviluppo immobiliare di lusso.',
    contact: {
      name: 'Marco Rossi',
      phone: '+39 123 456 7890',
      email: 'marco.rossi@immobiliare.it'
    },
    aiScore: 85,
    riskLevel: 'low',
    opportunities: ['Sviluppo residenziale', 'Investimento sicuro', 'Alto potenziale'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    source: 'immobiliare.it',
    url: 'https://immobiliare.it/terreno-roma-1'
  },
  {
    id: '2',
    comune: 'Milano',
    provincia: 'Milano',
    regione: 'Lombardia',
    lat: 45.4642,
    lng: 9.1900,
    price: 1800000,
    area: 3000,
    type: 'commerciale',
    status: 'disponibile',
    features: ['Zona commerciale', 'Alto traffico', 'Parcheggio'],
    images: ['/images/terrain2.jpg'],
    description: 'Terreno commerciale in zona strategica di Milano, perfetto per centro commerciale o uffici.',
    contact: {
      name: 'Laura Bianchi',
      phone: '+39 987 654 3210',
      email: 'laura.bianchi@immobiliare.it'
    },
    aiScore: 92,
    riskLevel: 'low',
    opportunities: ['Centro commerciale', 'Uffici', 'Ristorante'],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
    source: 'borsinoimmobiliare.it',
    url: 'https://borsinoimmobiliare.it/terreno-milano-2'
  },
  {
    id: '3',
    comune: 'Napoli',
    provincia: 'Napoli',
    regione: 'Campania',
    lat: 40.8518,
    lng: 14.2681,
    price: 1200000,
    area: 4000,
    type: 'residenziale',
    status: 'disponibile',
    features: ['Vista mare', 'Zona residenziale', 'Servizi vicini'],
    images: ['/images/terrain3.jpg'],
    description: 'Terreno residenziale con vista mare a Napoli, ideale per complesso residenziale.',
    contact: {
      name: 'Giuseppe Verdi',
      phone: '+39 333 444 5555',
      email: 'giuseppe.verdi@immobiliare.it'
    },
    aiScore: 78,
    riskLevel: 'medium',
    opportunities: ['Complesso residenziale', 'Vista mare', 'Zona in crescita'],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-15'),
    source: 'immobiliare.it',
    url: 'https://immobiliare.it/terreno-napoli-3'
  },
  {
    id: '4',
    comune: 'Torino',
    provincia: 'Torino',
    regione: 'Piemonte',
    lat: 45.0703,
    lng: 7.6869,
    price: 950000,
    area: 2500,
    type: 'industriale',
    status: 'disponibile',
    features: ['Zona industriale', 'Accesso autostrada', 'Energia elettrica'],
    images: ['/images/terrain4.jpg'],
    description: 'Terreno industriale a Torino con accesso diretto all\'autostrada, perfetto per logistica.',
    contact: {
      name: 'Anna Bianchi',
      phone: '+39 555 666 7777',
      email: 'anna.bianchi@immobiliare.it'
    },
    aiScore: 88,
    riskLevel: 'low',
    opportunities: ['Logistica', 'Magazzino', 'Distribuzione'],
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-19'),
    source: 'borsinoimmobiliare.it',
    url: 'https://borsinoimmobiliare.it/terreno-torino-4'
  },
  {
    id: '5',
    comune: 'Firenze',
    provincia: 'Firenze',
    regione: 'Toscana',
    lat: 43.7696,
    lng: 11.2558,
    price: 1500000,
    area: 3500,
    type: 'residenziale',
    status: 'riservato',
    features: ['Centro storico', 'Vista Duomo', 'Permessi speciali'],
    images: ['/images/terrain5.jpg'],
    description: 'Terreno nel centro storico di Firenze con vista sul Duomo, opportunità unica.',
    contact: {
      name: 'Francesco Rossi',
      phone: '+39 777 888 9999',
      email: 'francesco.rossi@immobiliare.it'
    },
    aiScore: 95,
    riskLevel: 'low',
    opportunities: ['Lusso', 'Centro storico', 'Alto valore'],
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-16'),
    source: 'immobiliare.it',
    url: 'https://immobiliare.it/terreno-firenze-5'
  }
];

export async function POST(request: NextRequest) {
  try {
    const criteria: TerrainSearchCriteria = await request.json();
    
    // Filtra terreni basato sui criteri
    let filteredTerrains = mockTerrainData.filter(terrain => {
      // Filtro per comune
      if (criteria.comune && !terrain.comune.toLowerCase().includes(criteria.comune.toLowerCase())) {
        return false;
      }
      
      // Filtro per provincia
      if (criteria.provincia && terrain.provincia !== criteria.provincia) {
        return false;
      }
      
      // Filtro per regione
      if (criteria.regione && terrain.regione !== criteria.regione) {
        return false;
      }
      
      // Filtro per prezzo
      if (criteria.minPrice && terrain.price < criteria.minPrice) {
        return false;
      }
      if (criteria.maxPrice && terrain.price > criteria.maxPrice) {
        return false;
      }
      
      // Filtro per area
      if (criteria.minArea && terrain.area < criteria.minArea) {
        return false;
      }
      if (criteria.maxArea && terrain.area > criteria.maxArea) {
        return false;
      }
      
      // Filtro per tipo
      if (criteria.type && criteria.type !== 'all' && terrain.type !== criteria.type) {
        return false;
      }
      
      // Filtro per status
      if (criteria.status && criteria.status !== 'all' && terrain.status !== criteria.status) {
        return false;
      }
      
      // Filtro per AI Score
      if (criteria.minAiScore && terrain.aiScore < criteria.minAiScore) {
        return false;
      }
      
      // Filtro per risk level
      if (criteria.riskLevel && criteria.riskLevel !== 'all' && terrain.riskLevel !== criteria.riskLevel) {
        return false;
      }
      
      return true;
    });

    // Ordina risultati
    const sortBy = criteria.sortBy || 'aiScore';
    const sortOrder = criteria.sortOrder || 'desc';
    
    filteredTerrains.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'area':
          aValue = a.area;
          bValue = b.area;
          break;
        case 'aiScore':
          aValue = a.aiScore;
          bValue = b.aiScore;
          break;
        case 'createdAt':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        default:
          aValue = a.aiScore;
          bValue = b.aiScore;
      }
      
      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    // Paginazione
    const page = criteria.page || 1;
    const limit = criteria.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedTerrains = filteredTerrains.slice(startIndex, endIndex);
    
    // Calcola statistiche
    const total = filteredTerrains.length;
    const averagePrice = total > 0 ? filteredTerrains.reduce((sum, t) => sum + t.price, 0) / total : 0;
    const averageArea = total > 0 ? filteredTerrains.reduce((sum, t) => sum + t.area, 0) / total : 0;
    const averageAiScore = total > 0 ? filteredTerrains.reduce((sum, t) => sum + t.aiScore, 0) / total : 0;
    const totalAvailable = filteredTerrains.filter(t => t.status === 'disponibile').length;
    
    const prices = filteredTerrains.map(t => t.price);
    const areas = filteredTerrains.map(t => t.area);
    
    const result: TerrainSearchResult = {
      terrains: paginatedTerrains,
      total,
      page,
      limit,
      hasMore: endIndex < total,
      stats: {
        averagePrice: Math.round(averagePrice),
        averageArea: Math.round(averageArea),
        averageAiScore: Math.round(averageAiScore),
        totalAvailable,
        priceRange: {
          min: prices.length > 0 ? Math.min(...prices) : 0,
          max: prices.length > 0 ? Math.max(...prices) : 0,
        },
        areaRange: {
          min: areas.length > 0 ? Math.min(...areas) : 0,
          max: areas.length > 0 ? Math.max(...areas) : 0,
        },
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Errore ricerca terreni:', error);
    return NextResponse.json(
      { error: 'Errore durante la ricerca terreni' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Ricerca suggerimenti
    const suggestions = mockTerrainData
      .filter(terrain => 
        terrain.comune.toLowerCase().includes(query.toLowerCase()) ||
        terrain.provincia.toLowerCase().includes(query.toLowerCase()) ||
        terrain.regione.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, limit)
      .map(terrain => ({
        id: terrain.id,
        nome: terrain.comune,
        provincia: terrain.provincia,
        regione: terrain.regione,
        tipo: 'comune' as const,
        popolazione: Math.floor(Math.random() * 1000000) + 10000, // Mock population
        superficie: Math.floor(Math.random() * 1000) + 10, // Mock surface
        latitudine: terrain.lat,
        longitudine: terrain.lng,
      }));

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('❌ Errore suggerimenti:', error);
    return NextResponse.json(
      { error: 'Errore durante il recupero suggerimenti' },
      { status: 500 }
    );
  }
}
