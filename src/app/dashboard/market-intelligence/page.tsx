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
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { t } = useLanguage();
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

  useEffect(() => {
    // Carica opportunità reali da Firestore (da implementare)
    const loadOpportunities = async () => {
      try {
        // TODO: Implementare caricamento da Firestore
        // const data = await getMarketOpportunities();
        // setOpportunities(data);
        
        // Per ora, array vuoto
        setOpportunities([]);
      } catch (error) {
        console.error('Errore nel caricamento delle opportunità:', error);
        setOpportunities([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadOpportunities();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(navigator.language, { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 80) return 'text-info';
    if (score >= 70) return 'text-warning';
    return 'text-error';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-success';
    if (score >= 80) return 'bg-info';
    if (score >= 70) return 'bg-warning';
    return 'bg-error';
  };

  const filteredOpportunities = opportunities.filter(opp => {
    if (filters.minPrice && opp.price < parseInt(filters.minPrice)) return false;
    if (filters.maxPrice && opp.price > parseInt(filters.maxPrice)) return false;
    if (filters.minArea && opp.area < parseInt(filters.minArea)) return false;
    if (filters.maxArea && opp.area > parseInt(filters.maxArea)) return false;
    if (filters.zoning && !opp.zoning.toLowerCase().includes(filters.zoning.toLowerCase())) return false;
    if (filters.location && !opp.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{t('title', 'marketIntelligence')}</h1>
            <p className="text-neutral-600 mt-1">
              {t('subtitle', 'marketIntelligence')}
            </p>
          </div>
          <Button 
            variant="primary"
            leftIcon={<SearchIcon className="h-4 w-4" />}
            onClick={() => console.log('Avvia ricerca AI')}
          >
            {t('newAISearch', 'marketIntelligence')}
          </Button>
        </div>

        {/* Statistiche */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="stat bg-white shadow-sm rounded-lg p-4">
            <div className="stat-figure text-primary">
              <TrendingUpIcon className="h-6 w-6" />
            </div>
            <div className="stat-title text-neutral-500">{t('totalOpportunities', 'marketIntelligence')}</div>
            <div className="stat-value text-2xl">{opportunities.length}</div>
          </div>
          <div className="stat bg-white shadow-sm rounded-lg p-4">
            <div className="stat-figure text-success">
              <EuroIcon className="h-6 w-6" />
            </div>
            <div className="stat-title text-neutral-500">{t('averageValue', 'marketIntelligence')}</div>
            <div className="stat-value text-2xl">
              {opportunities.length > 0 
                ? formatPrice(opportunities.reduce((sum, opp) => sum + opp.price, 0) / opportunities.length)
                : '€0'
              }
            </div>
          </div>
          <div className="stat bg-white shadow-sm rounded-lg p-4">
            <div className="stat-figure text-info">
              <MapIcon className="h-6 w-6" />
            </div>
            <div className="stat-title text-neutral-500">{t('coveredZones', 'marketIntelligence')}</div>
            <div className="stat-value text-2xl">
              {new Set(opportunities.map(opp => opp.location.split(',')[0])).size}
            </div>
          </div>
          <div className="stat bg-white shadow-sm rounded-lg p-4">
            <div className="stat-figure text-warning">
              <AlertTriangleIcon className="h-6 w-6" />
            </div>
            <div className="stat-title text-neutral-500">{t('highPriority', 'marketIntelligence')}</div>
            <div className="stat-value text-2xl">
              {opportunities.filter(opp => opp.aiScore >= 90).length}
            </div>
          </div>
        </div>

        {/* Filtri */}
        <div className="bg-white shadow-sm rounded-lg p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="label">
                <span className="label-text font-medium">{t('minPrice', 'marketIntelligence')}</span>
              </label>
              <input
                type="number"
                placeholder="€0"
                className="input input-bordered w-full"
                value={filters.minPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
              />
            </div>
            <div className="flex-1">
              <label className="label">
                <span className="label-text font-medium">{t('maxPrice', 'marketIntelligence')}</span>
              </label>
              <input
                type="number"
                placeholder="€10.000.000"
                className="input input-bordered w-full"
                value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
              />
            </div>
            <div className="flex-1">
              <label className="label">
                <span className="label-text font-medium">{t('zone', 'marketIntelligence')}</span>
              </label>
              <input
                type="text"
                placeholder="Milano, Roma..."
                className="input input-bordered w-full"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div className="flex-1">
              <label className="label">
                <span className="label-text font-medium">{t('destination', 'marketIntelligence')}</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={filters.zoning}
                onChange={(e) => setFilters(prev => ({ ...prev, zoning: e.target.value }))}
              >
                <option value="">{t('all', 'marketIntelligence')}</option>
                <option value="Residenziale">Residenziale</option>
                <option value="Commerciale">Commerciale</option>
                <option value="Industriale">Industriale</option>
                <option value="Misto">Misto</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista Opportunità */}
        {filteredOpportunities.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-neutral-400 mb-4">
              <SearchIcon className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-neutral-700 mb-2">
              {t('noOpportunitiesFound', 'marketIntelligence')}
            </h3>
            <p className="text-neutral-500">
              {opportunities.length === 0 
                ? t('startNewSearch', 'marketIntelligence')
                : 'Prova a modificare i filtri di ricerca'
              }
            </p>
            {opportunities.length === 0 && (
              <Button 
                variant="primary"
                className="mt-4"
                onClick={() => console.log('Avvia prima ricerca')}
              >
                {t('startFirstSearch', 'marketIntelligence')}
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOpportunities.map((opportunity) => (
              <div 
                key={opportunity.id}
                className="card bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedOpportunity(opportunity)}
              >
                <div className="card-body p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="card-title text-lg font-semibold text-neutral-900 line-clamp-2">
                      {opportunity.title}
                    </h3>
                    <div className={`badge ${getScoreBgColor(opportunity.aiScore)} text-white`}>
                      {opportunity.aiScore}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 mb-3">
                    <MapIcon className="h-4 w-4" />
                    <span className="text-sm text-neutral-600">{opportunity.location}</span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-500">Prezzo:</span>
                      <span className="text-sm font-medium">{formatPrice(opportunity.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-500">Superficie:</span>
                      <span className="text-sm font-medium">{opportunity.area} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-500">Prezzo/m²:</span>
                      <span className="text-sm font-medium">{formatPrice(opportunity.pricePerSqm)}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {opportunity.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="badge badge-outline badge-sm">
                        {tag}
                      </span>
                    ))}
                    {opportunity.tags.length > 3 && (
                      <span className="badge badge-outline badge-sm">
                        +{opportunity.tags.length - 3}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-neutral-500">
                    <span>{opportunity.source}</span>
                    <span>{opportunity.dateAdded.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 