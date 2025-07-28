'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { LandSearchCriteria } from '@/lib/realWebScraper';
import { emailService, EmailConfig } from '@/lib/emailService';
import { realLandScrapingAgent, RealLandScrapingResult } from '@/lib/realLandScrapingAgent';
import { feasibilityService } from '@/lib/feasibilityService';
import { 
  SearchIcon, 
  MailIcon, 
  BuildingIcon, 
  EuroIcon, 
  LocationIcon,
  CalendarIcon,
  TrendingUpIcon,
  AlertIcon,
  CheckCircleIcon,
  EditIcon,
  TrashIcon,
  SettingsIcon,
  BrainIcon,
  GlobeIcon,
  CalculatorIcon
} from '@/components/icons';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

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
  const [searchResults, setSearchResults] = useState<RealLandScrapingResult | null>(null);
  const [searchHistory, setSearchHistory] = useState<Array<{
    id: string;
    criteria: LandSearchCriteria;
    email: string;
    date: Date;
    resultsCount: number;
    emailSent: boolean;
  }>>([]);
  
  // Nuovi stati per gestione email
  const [emailConfig, setEmailConfig] = useState<EmailConfig | null>(null);
  const [showEmailSettings, setShowEmailSettings] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  
  // Stato servizi
  const [servicesStatus, setServicesStatus] = useState<{
    email: boolean;
    webScraping: boolean;
    ai: boolean;
  } | null>(null);

  const router = useRouter();

  // Carica configurazione email all'avvio
  useEffect(() => {
    loadEmailConfig();
    verifyServices();
  }, []);

  const verifyServices = async () => {
    try {
      const status = await realLandScrapingAgent.verifyAllServices();
      setServicesStatus(status);
      console.log('🔍 Stato servizi verificato:', status);
    } catch (error) {
      console.error('❌ Errore verifica servizi:', error);
    }
  };

  const loadEmailConfig = async () => {
    if (!email) return;
    
    setIsLoadingEmail(true);
    try {
      const config = await emailService.getEmailConfig(email);
      setEmailConfig(config);
    } catch (error) {
      console.error('Errore caricamento email config:', error);
    } finally {
      setIsLoadingEmail(false);
    }
  };

  const handleEmailChange = async (newEmail: string) => {
    setEmail(newEmail);
    
    if (newEmail) {
      setIsLoadingEmail(true);
      try {
        const config = await emailService.getEmailConfig(newEmail);
        setEmailConfig(config);
      } catch (error) {
        console.error('Errore caricamento email config:', error);
      } finally {
        setIsLoadingEmail(false);
      }
    }
  };

  const saveEmailConfig = async () => {
    if (!email) {
      toast.error('Inserisci un indirizzo email');
      return;
    }

    try {
      const configId = await emailService.saveEmailConfig(email);
      const config = await emailService.getEmailConfig(email);
      setEmailConfig(config);
      toast.success('✅ Email configurata con successo!');
      setShowEmailSettings(false);
    } catch (error) {
      console.error('Errore salvataggio email config:', error);
      toast.error('❌ Errore nel salvataggio della configurazione email');
    }
  };

  const updateEmailConfig = async (updates: Partial<EmailConfig>) => {
    if (!emailConfig?.id) return;

    try {
      await emailService.updateEmailConfig(emailConfig.id, updates);
      const updatedConfig = await emailService.getEmailConfig(email);
      setEmailConfig(updatedConfig);
      toast.success('✅ Configurazione aggiornata!');
    } catch (error) {
      console.error('Errore aggiornamento email config:', error);
      toast.error('❌ Errore nell\'aggiornamento della configurazione');
    }
  };

  const handleSearch = async () => {
    if (!email) {
      toast.error('Inserisci un indirizzo email per ricevere i risultati');
      return;
    }

    if (!servicesStatus?.webScraping) {
      toast.error('❌ Servizio Web Scraping non disponibile');
      return;
    }

    setIsSearching(true);
    toast.loading('🔍 Ricerca terreni in corso...', { id: 'land-search' });

    try {
      // Usa l'agente reale invece del mock
      const result = await realLandScrapingAgent.runAutomatedSearch(searchCriteria, email);
      setSearchResults(result);
      
      // Aggiungi alla cronologia
      setSearchHistory(prev => [{
        id: Date.now().toString(),
        criteria: { ...searchCriteria },
        email,
        date: new Date(),
        resultsCount: result.lands.length,
        emailSent: result.emailSent
      }, ...prev]);

      // Salva configurazione email se non esiste
      if (!emailConfig) {
        await saveEmailConfig();
      }

      if (result.emailSent) {
        toast.success(`✅ Trovati ${result.lands.length} terreni! Email inviata a ${email}`, { id: 'land-search' });
      } else {
        toast.success(`✅ Trovati ${result.lands.length} terreni! (Email non inviata)`, { id: 'land-search' });
      }
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

  const handleCreateFeasibilityProject = async (land: any) => {
    try {
      toast.loading('🏗️ Creazione progetto di fattibilità...', { id: 'feasibility-create' });
      
      const projectId = await feasibilityService.createFromLand(land, 'user123');
      
      toast.success('✅ Progetto di fattibilità creato!', { id: 'feasibility-create' });
      
      // Reindirizza alla pagina del progetto
      router.push(`/dashboard/feasibility-analysis/${projectId}`);
    } catch (error) {
      console.error('Errore creazione progetto fattibilità:', error);
      toast.error('❌ Errore nella creazione del progetto', { id: 'feasibility-create' });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
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

        {/* Status Servizi */}
        {servicesStatus && (
          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">🔧 Stato Servizi</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${servicesStatus.email ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium">Email Service</span>
                <span className={`text-xs px-2 py-1 rounded ${servicesStatus.email ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {servicesStatus.email ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${servicesStatus.webScraping ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium">Web Scraping</span>
                <span className={`text-xs px-2 py-1 rounded ${servicesStatus.webScraping ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {servicesStatus.webScraping ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${servicesStatus.ai ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium">AI Analysis</span>
                <span className={`text-xs px-2 py-1 rounded ${servicesStatus.ai ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {servicesStatus.ai ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        )}

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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <MailIcon className="h-5 w-5 mr-2 text-green-600" />
                Notifiche Email
              </h2>
              {emailConfig && (
                <button
                  onClick={() => setShowEmailSettings(!showEmailSettings)}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <SettingsIcon className="h-4 w-4 mr-1" />
                  {showEmailSettings ? 'Chiudi' : 'Impostazioni'}
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email per notifiche
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="email"
                    placeholder="tuo@email.com"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {isLoadingEmail && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  )}
                  {emailConfig && (
                    <div className="flex items-center text-green-600">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      <span className="text-xs">Configurata</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Impostazioni Email */}
              {showEmailSettings && emailConfig && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <h3 className="text-sm font-medium text-blue-900">⚙️ Impostazioni Email</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-1">
                      Frequenza notifiche
                    </label>
                    <select
                      value={emailConfig.preferences.frequency}
                      onChange={(e) => updateEmailConfig({
                        preferences: { ...emailConfig.preferences, frequency: e.target.value as any }
                      })}
                      className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="daily">Giornaliera</option>
                      <option value="weekly">Settimanale</option>
                      <option value="monthly">Mensile</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-1">
                      Numero massimo risultati
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={emailConfig.preferences.maxResults}
                      onChange={(e) => updateEmailConfig({
                        preferences: { ...emailConfig.preferences, maxResults: parseInt(e.target.value) }
                      })}
                      className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={emailConfig.preferences.includeStats}
                        onChange={(e) => updateEmailConfig({
                          preferences: { ...emailConfig.preferences, includeStats: e.target.checked }
                        })}
                        className="mr-2"
                      />
                      <span className="text-sm text-blue-800">Includi statistiche</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={emailConfig.preferences.includeContactInfo}
                        onChange={(e) => updateEmailConfig({
                          preferences: { ...emailConfig.preferences, includeContactInfo: e.target.checked }
                        })}
                        className="mr-2"
                      />
                      <span className="text-sm text-blue-800">Includi contatti agenti</span>
                    </label>
                  </div>

                  <div className="text-xs text-blue-600">
                    Configurata il: {emailConfig.createdAt.toLocaleDateString('it-IT')}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">📧 Cosa riceverai via email:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Top {emailConfig?.preferences.maxResults || 5} migliori opportunità con AI Score</li>
                  <li>• Analisi AI dettagliata con ROI e rischi</li>
                  <li>• Trend di mercato per la zona</li>
                  <li>• Raccomandazioni di investimento personalizzate</li>
                  <li>• Link diretti ai dettagli su portali immobiliari</li>
                </ul>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleSearch}
                  disabled={isSearching || !servicesStatus?.webScraping}
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🔍 Fonti di Ricerca Reali</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'immobiliare.it', status: servicesStatus?.webScraping ? 'online' : 'offline' },
              { name: 'casa.it', status: servicesStatus?.webScraping ? 'online' : 'offline' },
              { name: 'idealista.it', status: servicesStatus?.webScraping ? 'online' : 'offline' }
            ].map((source) => (
              <div key={source.name} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full mr-2 ${source.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium text-gray-700">{source.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risultati Ultima Ricerca */}
        {searchResults && (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">🏠 Risultati Ultima Ricerca</h3>
              <div className="text-sm text-gray-500">
                {searchResults.lands.length} terreni trovati • 
                Email: {searchResults.emailSent ? '✅ Inviata' : '❌ Non inviata'} • 
                Analisi AI: {searchResults.analysis.length}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.lands.slice(0, 6).map((land, index) => (
                <div key={land.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900 truncate">{land.title}</h4>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleCreateFeasibilityProject(land)}
                        className="btn btn-ghost btn-xs text-blue-600"
                        title="Crea Progetto Fattibilità"
                      >
                        <CalculatorIcon className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center text-gray-600">
                      <LocationIcon className="h-3 w-3 mr-1" />
                      {land.location}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prezzo:</span>
                      <span className="font-medium text-green-600">{land.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Superficie:</span>
                      <span className="font-medium">{land.area} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">€/m²:</span>
                      <span className="font-medium">{land.pricePerSqm.toLocaleString()}</span>
                    </div>
                    
                    {/* Analisi AI se disponibile */}
                    {searchResults.analysis[index] && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">ROI:</span>
                          <span className="font-medium text-blue-600">
                            {searchResults.analysis[index].estimatedROI.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Rischio:</span>
                          <span className="font-medium text-orange-600">
                            {searchResults.analysis[index].riskAssessment}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {searchResults.lands.length > 6 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  ... e altri {searchResults.lands.length - 6} terreni
                </p>
              </div>
            )}
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
                    <div className="flex items-center space-x-2">
                      <p className="text-xs text-gray-500">
                        {search.date.toLocaleDateString('it-IT')}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded ${search.emailSent ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {search.emailSent ? 'Email ✓' : 'Email ✗'}
                      </span>
                    </div>
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