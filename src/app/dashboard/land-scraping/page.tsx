'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { LandScrapingAgentFactory, LandSearchCriteria, ScrapedLand } from '@/lib/landScrapingAgent';
import { 
  SearchIcon, 
  MailIcon, 
  BuildingIcon, 
  EuroIcon, 
  LocationIcon,
  CalendarIcon,
  TrendingUpIcon,
  AlertIcon,
  CheckCircleIcon
} from '@/components/icons';
import toast from 'react-hot-toast';

export default function LandScrapingPage() {
  const [searchCriteria, setSearchCriteria] = useState<LandSearchCriteria>({
    location: '',
    priceRange: [0, 1000000],
    areaRange: [500, 10000],
    zoning: [],
    buildingRights: true,
    infrastructure: [],
    keywords: []
  });
  
  const [email, setEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ScrapedLand[]>([]);
  const [searchHistory, setSearchHistory] = useState<Array<{
    id: string;
    criteria: LandSearchCriteria;
    email: string;
    date: Date;
    resultsCount: number;
  }>>([]);

  const handleSearch = async () => {
    if (!email) {
      toast.error('Inserisci un indirizzo email per ricevere i risultati');
      return;
    }

    setIsSearching(true);
    toast.loading('🔍 Ricerca terreni in corso...', { id: 'land-search' });

    try {
      const agent = LandScrapingAgentFactory.createAgent();
      
      // Esegui ricerca automatizzata
      await agent.runAutomatedSearch(searchCriteria, email);
      
      // Simula risultati per la visualizzazione
      const mockResults = await agent.scrapeLands(searchCriteria);
      setSearchResults(mockResults);
      
      // Aggiungi alla cronologia
      setSearchHistory(prev => [{
        id: Date.now().toString(),
        criteria: { ...searchCriteria },
        email,
        date: new Date(),
        resultsCount: mockResults.length
      }, ...prev]);

      toast.success(`✅ Trovati ${mockResults.length} terreni! Email inviata a ${email}`, { id: 'land-search' });
    } catch (error) {
      console.error('Errore nella ricerca:', error);
      toast.error('❌ Errore durante la ricerca dei terreni', { id: 'land-search' });
    } finally {
      setIsSearching(false);
    }
  };

  const handleScheduleSearch = () => {
    if (!email) {
      toast.error('Inserisci un indirizzo email');
      return;
    }
    
    toast.success('📅 Ricerca programmata per l\'esecuzione automatica settimanale');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🤖 AI Land Scraping</h1>
            <p className="text-gray-600 mt-1">
              Scopri automaticamente le migliori opportunità di terreni e ricevi notifiche email
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-600 font-medium">Agente Attivo</span>
          </div>
        </div>

        {/* Configurazione Ricerca */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form di Ricerca */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <SearchIcon className="h-5 w-5 mr-2 text-blue-600" />
              Criteri di Ricerca
            </h2>
            
            <div className="space-y-4">
              {/* Localizzazione */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <LocationIcon className="h-4 w-4 inline mr-1" />
                  Localizzazione
                </label>
                <input
                  type="text"
                  placeholder="es. Milano, Roma, Torino..."
                  value={searchCriteria.location || ''}
                  onChange={(e) => setSearchCriteria(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Range Prezzo */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <EuroIcon className="h-4 w-4 inline mr-1" />
                    Prezzo Min (€)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={searchCriteria.priceRange?.[0] || 0}
                    onChange={(e) => setSearchCriteria(prev => ({ 
                      ...prev, 
                      priceRange: [parseInt(e.target.value) || 0, prev.priceRange?.[1] || 1000000] 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <EuroIcon className="h-4 w-4 inline mr-1" />
                    Prezzo Max (€)
                  </label>
                  <input
                    type="number"
                    placeholder="1000000"
                    value={searchCriteria.priceRange?.[1] || 1000000}
                    onChange={(e) => setSearchCriteria(prev => ({ 
                      ...prev, 
                      priceRange: [prev.priceRange?.[0] || 0, parseInt(e.target.value) || 1000000] 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Range Area */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <BuildingIcon className="h-4 w-4 inline mr-1" />
                    Area Min (m²)
                  </label>
                  <input
                    type="number"
                    placeholder="500"
                    value={searchCriteria.areaRange?.[0] || 500}
                    onChange={(e) => setSearchCriteria(prev => ({ 
                      ...prev, 
                      areaRange: [parseInt(e.target.value) || 500, prev.areaRange?.[1] || 10000] 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <BuildingIcon className="h-4 w-4 inline mr-1" />
                    Area Max (m²)
                  </label>
                  <input
                    type="number"
                    placeholder="10000"
                    value={searchCriteria.areaRange?.[1] || 10000}
                    onChange={(e) => setSearchCriteria(prev => ({ 
                      ...prev, 
                      areaRange: [prev.areaRange?.[0] || 500, parseInt(e.target.value) || 10000] 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Destinazione d'Uso */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destinazione d'Uso
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Residenziale', 'Commerciale', 'Industriale', 'Agricolo', 'Misto'].map((zone) => (
                    <label key={zone} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={searchCriteria.zoning?.includes(zone) || false}
                        onChange={(e) => {
                          const currentZoning = searchCriteria.zoning || [];
                          const newZoning = e.target.checked 
                            ? [...currentZoning, zone]
                            : currentZoning.filter(z => z !== zone);
                          setSearchCriteria(prev => ({ ...prev, zoning: newZoning }));
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{zone}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Building Rights */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={searchCriteria.buildingRights || false}
                    onChange={(e) => setSearchCriteria(prev => ({ ...prev, buildingRights: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Solo terreni con permessi edificabilità</span>
                </label>
              </div>
            </div>
          </div>

          {/* Configurazione Email */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <MailIcon className="h-5 w-5 mr-2 text-green-600" />
              Notifiche Email
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email per notifiche
                </label>
                <input
                  type="email"
                  placeholder="tuo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">📧 Cosa riceverai via email:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Top 5 migliori opportunità con AI Score</li>
                  <li>• Riepilogo statistiche (prezzo medio, numero terreni)</li>
                  <li>• Link diretti ai dettagli su portali immobiliari</li>
                  <li>• Contatti agenti per sopralluoghi</li>
                  <li>• Suggerimenti per prossimi passi</li>
                </ul>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSearching ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Ricerca...
                    </>
                  ) : (
                    <>
                      <SearchIcon className="h-4 w-4 mr-2" />
                      Avvia Ricerca
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleScheduleSearch}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Programma
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Fonti di Ricerca */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🔍 Fonti di Ricerca</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {['immobiliare.it', 'casa.it', 'idealista.it', 'subito.it', 'bakeca.it', 'agenziaentrate.gov.it'].map((source) => (
              <div key={source} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-700">{source}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risultati Ultima Ricerca */}
        {searchResults.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUpIcon className="h-5 w-5 mr-2 text-purple-600" />
              Ultimi Risultati ({searchResults.length} terreni)
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.slice(0, 6).map((land) => (
                <div key={land.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{land.title}</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {land.aiScore}/100
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2 flex items-center">
                    <LocationIcon className="h-3 w-3 mr-1" />
                    {land.location}
                  </p>
                  
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold text-green-600">
                      €{land.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {land.area}m²
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>€{land.pricePerSqm}/m²</span>
                    <span>{land.source}</span>
                  </div>
                  
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      land.buildingRights === 'Sì' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {land.buildingRights}
                    </span>
                    <a 
                      href={land.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 text-xs hover:underline"
                    >
                      Vedi →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cronologia Ricerche */}
        {searchHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 Cronologia Ricerche</h2>
            
            <div className="space-y-3">
              {searchHistory.slice(0, 5).map((search) => (
                <div key={search.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <SearchIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {search.criteria.location || 'Tutta Italia'}
                      </p>
                      <p className="text-sm text-gray-600">
                        €{search.criteria.priceRange?.[0]?.toLocaleString()} - €{search.criteria.priceRange?.[1]?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {search.resultsCount} risultati
                    </p>
                    <p className="text-xs text-gray-500">
                      {search.date.toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 