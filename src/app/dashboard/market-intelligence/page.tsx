'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  MapIcon, 
  SearchIcon, 
  FilterIcon, 
  TrendingUpIcon,
  EuroIcon,
  CalendarIcon,
  AlertTriangleIcon
} from '@/components/icons';
import Button from '@/components/ui/Button';

interface MarketOpportunity {
  id: string;
  title: string;
  location: string;
  price: number;
  pricePerSqm: number;
  area: number;
  zoning: string;
  buildingRights: string;
  aiScore: number;
  tags: string[];
  description: string;
  coordinates: [number, number];
  dateAdded: Date;
  source: string;
}

export default function MarketIntelligencePage() {
  const [opportunities, setOpportunities] = useState<MarketOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOpportunity, setSelectedOpportunity] = useState<MarketOpportunity | null>(null);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minArea: '',
    maxArea: '',
    zoning: '',
    location: ''
  });

  // Dati mock per ora
  const mockOpportunities: MarketOpportunity[] = [
    {
      id: '1',
      title: 'Terreno Edificabile Zona Residenziale',
      location: 'Milano, Porta Nuova',
      price: 2500000,
      pricePerSqm: 2500,
      area: 1000,
      zoning: 'Residenziale',
      buildingRights: '3.000 mc',
      aiScore: 92,
      tags: ['Alta domanda', 'Zona centrale', 'Trasporti'],
      description: 'Terreno edificabile in zona residenziale di pregio con alta domanda abitativa',
      coordinates: [45.4642, 9.1900],
      dateAdded: new Date('2024-01-15'),
      source: 'Agenzia Partner'
    },
    {
      id: '2', 
      title: 'Area Commerciale Centro Storico',
      location: 'Roma, Trastevere',
      price: 1800000,
      pricePerSqm: 3600,
      area: 500,
      zoning: 'Commerciale',
      buildingRights: '1.500 mc',
      aiScore: 87,
      tags: ['Centro storico', 'Turismo', 'Alta visibilità'],
      description: 'Area commerciale strategica in zona ad alto passaggio turistico',
      coordinates: [41.8902, 12.4696],
      dateAdded: new Date('2024-01-12'),
      source: 'Scraping Web'
    },
    {
      id: '3',
      title: 'Complesso Industriale Riconversione',
      location: 'Torino, Mirafiori',
      price: 3200000,
      pricePerSqm: 800,
      area: 4000,
      zoning: 'Industriale/Misto',
      buildingRights: '12.000 mc',
      aiScore: 78,
      tags: ['Riconversione', 'Grande metratura', 'Potenziale'],
      description: 'Ex area industriale con potenziale per sviluppo misto residenziale-commerciale',
      coordinates: [45.0205, 7.6430],
      dateAdded: new Date('2024-01-10'),
      source: 'AI Ricercatore'
    }
  ];

  useEffect(() => {
    // Simula caricamento dati
    setTimeout(() => {
      setOpportunities(mockOpportunities);
      setLoading(false);
    }, 1500);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0 
    }).format(price);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 75) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Market Intelligence Dashboard</h1>
            <p className="text-gray-600">AI-powered real estate opportunities discovery</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" leftIcon={<FilterIcon />}>
              Filtri Avanzati
            </Button>
            <Button variant="primary" leftIcon={<SearchIcon />}>
              Nuova Ricerca AI
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Opportunità Attive</p>
                <p className="text-2xl font-bold text-blue-600">{opportunities.length}</p>
              </div>
              <TrendingUpIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valore Totale</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatPrice(opportunities.reduce((sum, opp) => sum + opp.price, 0))}
                </p>
              </div>
              <EuroIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Score Medio AI</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(opportunities.reduce((sum, opp) => sum + opp.aiScore, 0) / opportunities.length || 0)}
                </p>
              </div>
              <AlertTriangleIcon className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aggiunte Oggi</p>
                <p className="text-2xl font-bold text-orange-600">2</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Opportunities List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Opportunità di Mercato</h3>
                <p className="text-sm text-gray-600">Analizzate e valutate dall'AI</p>
              </div>
              
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {opportunities.map((opp) => (
                      <div 
                        key={opp.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedOpportunity(opp)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900">{opp.title}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(opp.aiScore)}`}>
                                AI Score: {opp.aiScore}/100
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                <MapIcon className="h-4 w-4" />
                                {opp.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <EuroIcon className="h-4 w-4" />
                                {formatPrice(opp.price)}
                              </div>
                              <div>
                                {opp.area.toLocaleString()} m²
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-1">
                              {opp.tags.map((tag) => (
                                <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-sm text-gray-500">€/m²</div>
                            <div className="font-bold text-gray-900">
                              {opp.pricePerSqm.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mappa Opportunità</h3>
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center">
                  <MapIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Mappa Interattiva</p>
                  <p className="text-sm text-gray-400">In arrivo...</p>
                </div>
              </div>
              
              {selectedOpportunity && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900">{selectedOpportunity.title}</h4>
                  <p className="text-sm text-blue-700 mt-1">{selectedOpportunity.description}</p>
                  <div className="mt-3 space-y-1 text-sm">
                    <div><strong>Destinazione:</strong> {selectedOpportunity.zoning}</div>
                    <div><strong>Diritti:</strong> {selectedOpportunity.buildingRights}</div>
                    <div><strong>Fonte:</strong> {selectedOpportunity.source}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 