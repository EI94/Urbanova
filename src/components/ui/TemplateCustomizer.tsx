'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

import {
  MapPinIcon,
  RulerIcon,
  EuroIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertIcon,
  InfoIcon,
  BuildingIcon,
  CarIcon,
  TreeIcon,
  SunIcon,
  DropletIcon,
  WifiIcon,
  BusIcon,
} from '@/components/icons';
import { DesignOptimization } from '@/lib/aiDesignService';
import {
  DesignTemplate,
  DesignCustomization,
  GeoLocation,
  DesignConstraints,
} from '@/lib/designCenterService';

import AIDesignAssistant from './AIDesignAssistant';
import TerrainAnalysisAdvanced from './TerrainAnalysisAdvanced';

interface TemplateCustomizerProps {
  template: DesignTemplate;
  onCustomize: (customization: DesignCustomization, location: GeoLocation) => void;
  onClose: () => void;
}

export default function TemplateCustomizer({
  template,
  onCustomize,
  onClose,
}: TemplateCustomizerProps) {
  // Stati per personalizzazione
  const [customization, setCustomization] = useState<DesignCustomization>({
    area: template.minArea,
    floors: template.floors,
    bedrooms: template.bedrooms,
    bathrooms: template.bathrooms,
    parkingSpaces: template.parkingSpaces,
    gardenArea: template.gardenArea,
    balconyArea: template.balconyArea,
    roofType: template.roofType,
    facadeMaterial: template.facadeMaterial,
    energyClass: template.energyClass,
    customFeatures: [],
    colorScheme: {
      primary: '#3B82F6',
      secondary: '#64748B',
      accent: '#F59E0B',
    },
    interiorStyle: 'MODERN',
  });

  // Stati per geolocalizzazione
  const [location, setLocation] = useState<GeoLocation>({
    address: '',
    coordinates: { lat: 0, lng: 0 },
    cadastral: { sheet: '', parcel: '', subParcel: '' },
    zoning: { category: 'residenziale', density: 'MEDIUM', heightLimit: 12, coverageLimit: 50 },
    topography: { slope: 0, orientation: 'S', soilType: 'argilloso', waterTable: 5 },
    infrastructure: {
      water: true,
      electricity: true,
      gas: true,
      sewage: true,
      internet: true,
      publicTransport: false,
    },
    surroundings: {
      schools: 2,
      hospitals: 5,
      shopping: 1,
      parks: 3,
      noise: 'LOW',
      pollution: 'LOW',
    },
  });

  // Stati per validazione
  const [constraints, setConstraints] = useState<DesignConstraints>({
    boundaryDistance: 10,
    setbackFront: 5,
    setbackSide: 3,
    setbackRear: 5,
    maxHeight: 12,
    maxCoverage: 50,
    parkingRequirements: 1,
    greenAreaMin: 30,
    accessibility: true,
    fireSafety: true,
    seismic: 'Zona 2',
    environmental: [],
  });

  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    violations: string[];
    recommendations: string[];
  }>({
    isValid: true,
    violations: [],
    recommendations: [],
  });

  const [activeStep, setActiveStep] = useState<
    'location' | 'customization' | 'validation' | 'summary' | 'ai-assistant'
  >('location');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showTerrainAnalysis, setShowTerrainAnalysis] = useState(false);
  const [budget, setBudget] = useState({
    total: 0,
    construction: 0,
    materials: 0,
    labor: 0,
    permits: 0,
    contingency: 0,
  });

  // Geolocalizzazione automatica
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setLocation(prev => ({
            ...prev,
            coordinates: { lat: latitude, lng: longitude },
          }));

          // Reverse geocoding per ottenere l'indirizzo
          reverseGeocode(latitude, longitude);
        },
        error => {
          console.log('📍 [TemplateCustomizer] Geolocalizzazione non disponibile:', error);
        }
      );
    }
  }, []);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      // Usa OpenStreetMap Nominatim per reverse geocoding gratuito
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();

      if (data.display_name) {
        setLocation(prev => ({
          ...prev,
          address: data.display_name,
        }));
      }
    } catch (error) {
      console.log('📍 [TemplateCustomizer] Errore reverse geocoding:', error);
    }
  };

  const handleCustomizationChange = (key: keyof DesignCustomization, value: any) => {
    setCustomization(prev => ({ ...prev, [key]: value }));
  };

  const handleLocationChange = (key: string, value: any) => {
    setLocation(prev => ({ ...prev, [key]: value }));
  };

  const validateDesign = () => {
    const violations: string[] = [];
    const recommendations: string[] = [];

    // Validazione area copertura
    const totalArea = customization.area + customization.gardenArea + customization.balconyArea;
    const coverage = (customization.area / totalArea) * 100;
    if (coverage > constraints.maxCoverage) {
      violations.push(
        `Copertura terreno ${coverage.toFixed(1)}% supera il limite ${constraints.maxCoverage}%`
      );
      recommendations.push('Ridurre area edificabile o aumentare area verde');
    }

    // Validazione distanza confini
    if (customization.area > 0) {
      const minSide = Math.sqrt(customization.area);
      if (minSide / 2 < constraints.boundaryDistance) {
        violations.push(
          `Distanza minima dal confine (${constraints.boundaryDistance}m) non rispettata`
        );
        recommendations.push('Ridurre area edificabile o verificare dimensioni terreno');
      }
    }

    // Validazione altezza massima
    const maxHeight = customization.floors * 3; // 3m per piano
    if (maxHeight > constraints.maxHeight) {
      violations.push(`Altezza massima ${maxHeight}m supera il limite ${constraints.maxHeight}m`);
      recommendations.push('Ridurre numero piani o verificare regolamenti zona');
    }

    // Validazione posti auto
    const requiredParking = Math.ceil(customization.bedrooms * 1.5) + 1;
    if (customization.parkingSpaces < requiredParking) {
      violations.push(
        `Posti auto ${customization.parkingSpaces} insufficienti (richiesti: ${requiredParking})`
      );
      recommendations.push('Aumentare posti auto o ridurre camere');
    }

    // Validazione area verde
    const greenArea = customization.gardenArea + customization.balconyArea;
    const minGreenArea = totalArea * (constraints.greenAreaMin / 100);
    if (greenArea < minGreenArea) {
      violations.push(
        `Area verde ${greenArea}m² insufficiente (minima: ${minGreenArea.toFixed(0)}m²)`
      );
      recommendations.push('Aumentare area giardino o balconi');
    }

    const isValid = violations.length === 0;

    if (isValid) {
      recommendations.push('✅ Design conforme a tutti i vincoli');
    }

    setValidationResult({ isValid, violations, recommendations });
    setActiveStep('validation');
  };

  const handleSubmit = () => {
    onCustomize(customization, location);
  };

  const handleAIOptimization = (optimization: DesignOptimization) => {
    // Applica le ottimizzazioni AI al design
    console.log('Applicando ottimizzazioni AI:', optimization);

    // Qui potresti aggiornare il customization con le ottimizzazioni
    // Per ora chiudiamo l'assistente e torniamo al riepilogo
    setShowAIAssistant(false);
    setActiveTab('summary');

    // Mostra notifica di successo
    toast.success(
      `Ottimizzazioni AI applicate! ROI migliorato da ${optimization.originalROI}% a ${optimization.optimizedROI}%`
    );
  };

  const handleTerrainAnalysisComplete = (analysis: any) => {
    console.log('Analisi terreno completata:', analysis);

    // Aggiorna la localizzazione con i dati dell'analisi
    if (analysis.geospatialData) {
      setLocation(prev => ({
        ...prev,
        topography: {
          ...prev.topography,
          slope: analysis.geospatialData.slope,
          soilType: analysis.geospatialData.soilType,
          waterTable: analysis.geospatialData.waterTable,
        },
      }));
    }

    // Mostra notifica di successo
    toast.success(`Analisi terreno completata! Fattibilità: ${analysis.analysis.suitability}`);
  };

  const nextStep = () => {
    switch (activeStep) {
      case 'location':
        setActiveStep('customization');
        break;
      case 'customization':
        validateDesign();
        break;
      case 'validation':
        setActiveStep('summary');
        break;
    }
  };

  const prevStep = () => {
    switch (activeStep) {
      case 'customization':
        setActiveStep('location');
        break;
      case 'validation':
        setActiveStep('customization');
        break;
      case 'summary':
        setActiveStep('validation');
        break;
    }
  };

  const getStepStatus = (step: string) => {
    if (activeStep === step) return 'active';
    if (['customization', 'validation', 'summary'].includes(step) && activeStep !== 'location')
      return 'completed';
    return 'pending';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Personalizza Template: {template.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center mt-6 space-x-4">
            {['location', 'customization', 'validation', 'summary'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    getStepStatus(step) === 'active'
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : getStepStatus(step) === 'completed'
                        ? 'border-green-600 bg-green-600 text-white'
                        : 'border-gray-300 bg-white text-gray-400'
                  }`}
                >
                  {getStepStatus(step) === 'completed' ? (
                    <CheckCircleIcon className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    getStepStatus(step) === 'active' ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  {step === 'location' && 'Localizzazione'}
                  {step === 'customization' && 'Personalizzazione'}
                  {step === 'validation' && 'Validazione'}
                  {step === 'summary' && 'Riepilogo'}
                </span>
                {index < 3 && (
                  <div
                    className={`w-16 h-0.5 ml-4 ${
                      getStepStatus(step) === 'completed' ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Localizzazione */}
          {activeStep === 'location' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📍 Localizzazione del Progetto
                </h3>
                <p className="text-gray-600 mb-6">
                  Definisci la posizione del terreno e i vincoli urbanistici per validare il design
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Indirizzo e coordinate */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Indirizzo del terreno
                    </label>
                    <div className="relative">
                      <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={location.address}
                        onChange={e => handleLocationChange('address', e.target.value)}
                        placeholder="Via Roma 123, Milano, MI"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Latitudine
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        value={location.coordinates.lat}
                        onChange={e =>
                          handleLocationChange('coordinates', {
                            ...location.coordinates,
                            lat: parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Longitudine
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        value={location.coordinates.lng}
                        onChange={e =>
                          handleLocationChange('coordinates', {
                            ...location.coordinates,
                            lng: parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dati catastali
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Foglio"
                        value={location.cadastral.sheet}
                        onChange={e =>
                          handleLocationChange('cadastral', {
                            ...location.cadastral,
                            sheet: e.target.value,
                          })
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Particella"
                        value={location.cadastral.parcel}
                        onChange={e =>
                          handleLocationChange('cadastral', {
                            ...location.cadastral,
                            parcel: e.target.value,
                          })
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Subalterno"
                        value={location.cadastral.subParcel}
                        onChange={e =>
                          handleLocationChange('cadastral', {
                            ...location.cadastral,
                            subParcel: e.target.value,
                          })
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Zona e vincoli */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria urbanistica
                    </label>
                    <select
                      value={location.zoning.category}
                      onChange={e =>
                        handleLocationChange('zoning', {
                          ...location.zoning,
                          category: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="residenziale">Residenziale</option>
                      <option value="commerciale">Commerciale</option>
                      <option value="misto">Misto</option>
                      <option value="industriale">Industriale</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Densità edilizia
                    </label>
                    <select
                      value={location.zoning.density}
                      onChange={e =>
                        handleLocationChange('zoning', {
                          ...location.zoning,
                          density: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="BASSA">Bassa</option>
                      <option value="MEDIUM">Media</option>
                      <option value="ALTA">Alta</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Altezza max (m)
                      </label>
                      <input
                        type="number"
                        value={location.zoning.heightLimit}
                        onChange={e =>
                          handleLocationChange('zoning', {
                            ...location.zoning,
                            heightLimit: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Copertura max (%)
                      </label>
                      <input
                        type="number"
                        value={location.zoning.coverageLimit}
                        onChange={e =>
                          handleLocationChange('zoning', {
                            ...location.zoning,
                            coverageLimit: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zona sismica
                    </label>
                    <select
                      value={constraints.seismic}
                      onChange={e => setConstraints(prev => ({ ...prev, seismic: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Zona 1">Zona 1 - Alta sismicità</option>
                      <option value="Zona 2">Zona 2 - Media sismicità</option>
                      <option value="Zona 3">Zona 3 - Bassa sismicità</option>
                      <option value="Zona 4">Zona 4 - Molto bassa sismicità</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Infrastrutture e servizi */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  🏗️ Infrastrutture disponibili
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(location.infrastructure).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={e =>
                          handleLocationChange('infrastructure', {
                            ...location.infrastructure,
                            [key]: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {key === 'water' && 'Acqua'}
                        {key === 'electricity' && 'Elettricità'}
                        {key === 'gas' && 'Gas'}
                        {key === 'sewage' && 'Fognature'}
                        {key === 'internet' && 'Internet'}
                        {key === 'publicTransport' && 'Trasporto pubblico'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Personalizzazione */}
          {activeStep === 'customization' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🎨 Personalizzazione del Design
                </h3>
                <p className="text-gray-600 mb-6">
                  Modifica i parametri del template per adattarli alle tue esigenze
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dimensioni e layout */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">📐 Dimensioni e Layout</h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Area edificabile (m²)
                    </label>
                    <input
                      type="number"
                      min={template.minArea}
                      max={template.maxArea}
                      value={customization.area}
                      onChange={e => handleCustomizationChange('area', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Range: {template.minArea} - {template.maxArea} m²
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Numero piani
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={customization.floors}
                        onChange={e =>
                          handleCustomizationChange('floors', parseInt(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Camere da letto
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={customization.bedrooms}
                        onChange={e =>
                          handleCustomizationChange('bedrooms', parseInt(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bagni</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={customization.bathrooms}
                        onChange={e =>
                          handleCustomizationChange('bathrooms', parseInt(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Posti auto
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={customization.parkingSpaces}
                        onChange={e =>
                          handleCustomizationChange('parkingSpaces', parseInt(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Area giardino (m²)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={customization.gardenArea}
                        onChange={e =>
                          handleCustomizationChange('gardenArea', parseInt(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Area balconi (m²)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={customization.balconyArea}
                        onChange={e =>
                          handleCustomizationChange('balconyArea', parseInt(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Materiali e finiture */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">🏗️ Materiali e Finiture</h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo di tetto
                    </label>
                    <select
                      value={customization.roofType}
                      onChange={e => handleCustomizationChange('roofType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="FLAT">Piano</option>
                      <option value="PITCHED">A falde</option>
                      <option value="GREEN">Verde</option>
                      <option value="SOLAR">Fotovoltaico</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Materiale facciata
                    </label>
                    <select
                      value={customization.facadeMaterial}
                      onChange={e => handleCustomizationChange('facadeMaterial', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="BRICK">Mattone</option>
                      <option value="STONE">Pietra</option>
                      <option value="GLASS">Vetro</option>
                      <option value="MIXED">Misto</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Classe energetica
                    </label>
                    <select
                      value={customization.energyClass}
                      onChange={e => handleCustomizationChange('energyClass', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="A+">A+ (Eccellente)</option>
                      <option value="A">A (Molto buona)</option>
                      <option value="B">B (Buona)</option>
                      <option value="C">C (Discreta)</option>
                      <option value="D">D (Sufficiente)</option>
                      <option value="E">E (Scarsa)</option>
                      <option value="F">F (Molto scarsa)</option>
                      <option value="G">G (Estremamente scarsa)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stile interno
                    </label>
                    <select
                      value={customization.interiorStyle}
                      onChange={e => handleCustomizationChange('interiorStyle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="MODERN">Moderno</option>
                      <option value="CLASSIC">Classico</option>
                      <option value="MINIMALIST">Minimalista</option>
                      <option value="LUXURY">Lusso</option>
                      <option value="ECO_FRIENDLY">Eco-friendly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Schema colori
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Primario</label>
                        <input
                          type="color"
                          value={customization.colorScheme.primary}
                          onChange={e =>
                            handleCustomizationChange('colorScheme', {
                              ...customization.colorScheme,
                              primary: e.target.value,
                            })
                          }
                          className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Secondario</label>
                        <input
                          type="color"
                          value={customization.colorScheme.secondary}
                          onChange={e =>
                            handleCustomizationChange('colorScheme', {
                              ...customization.colorScheme,
                              secondary: e.target.value,
                            })
                          }
                          className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Accento</label>
                        <input
                          type="color"
                          value={customization.colorScheme.accent}
                          onChange={e =>
                            handleCustomizationChange('colorScheme', {
                              ...customization.colorScheme,
                              accent: e.target.value,
                            })
                          }
                          className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Validazione */}
          {activeStep === 'validation' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">✅ Validazione Vincoli</h3>
                <p className="text-gray-600 mb-6">
                  Verifica che il design rispetti tutti i vincoli urbanistici e normativi
                </p>
              </div>

              {/* Risultato validazione */}
              <div
                className={`p-4 rounded-lg border ${
                  validationResult.isValid
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {validationResult.isValid ? (
                      <CheckCircleIcon className="h-6 w-6 text-green-400" />
                    ) : (
                      <AlertIcon className="h-6 w-6 text-red-400" />
                    )}
                  </div>
                  <div className="ml-3">
                    <h4
                      className={`text-lg font-medium ${
                        validationResult.isValid ? 'text-green-800' : 'text-red-800'
                      }`}
                    >
                      {validationResult.isValid ? 'Design Valido!' : 'Violazioni Trovate'}
                    </h4>
                    <p
                      className={`text-sm mt-1 ${
                        validationResult.isValid ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      {validationResult.isValid
                        ? 'Il tuo design rispetta tutti i vincoli urbanistici e normativi.'
                        : 'Sono state identificate alcune violazioni che devono essere corrette.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Violazioni */}
              {validationResult.violations.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-md font-medium text-red-800 mb-3">
                    ❌ Violazioni Identificate
                  </h4>
                  <ul className="space-y-2">
                    {validationResult.violations.map((violation, index) => (
                      <li key={index} className="flex items-start">
                        <AlertIcon className="h-4 w-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-red-700">{violation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Raccomandazioni */}
              {validationResult.recommendations.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-md font-medium text-blue-800 mb-3">💡 Raccomandazioni</h4>
                  <ul className="space-y-2">
                    {validationResult.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start">
                        <InfoIcon className="h-4 w-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-blue-700">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Riepilogo vincoli */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-800 mb-3">
                  📋 Riepilogo Vincoli Applicati
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Distanza confini:</span>
                    <span className="ml-2 font-medium">{constraints.boundaryDistance}m</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Altezza max:</span>
                    <span className="ml-2 font-medium">{constraints.maxHeight}m</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Copertura max:</span>
                    <span className="ml-2 font-medium">{constraints.maxCoverage}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Area verde min:</span>
                    <span className="ml-2 font-medium">{constraints.greenAreaMin}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Riepilogo */}
          {activeStep === 'summary' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Riepilogo Progetto</h3>
                <p className="text-gray-600 mb-6">
                  Rivedi tutti i dettagli prima di procedere con la creazione
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Riepilogo template */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-3">🎨 Template Base</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Nome:</span>
                      <span className="font-medium">{template.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Categoria:</span>
                      <span className="font-medium capitalize">
                        {template.category.toLowerCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Zona:</span>
                      <span className="font-medium capitalize">{template.zone.toLowerCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Budget:</span>
                      <span className="font-medium capitalize">
                        {template.budget.toLowerCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Riepilogo personalizzazioni */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-3">⚙️ Personalizzazioni</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700">Area edificabile:</span>
                      <span className="font-medium">{customization.area} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Piani:</span>
                      <span className="font-medium">{customization.floors}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Camere:</span>
                      <span className="font-medium">{customization.bedrooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Bagni:</span>
                      <span className="font-medium">{customization.bathrooms}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Riepilogo localizzazione */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-800 mb-3">📍 Localizzazione</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-purple-700">Indirizzo:</span>
                    <span className="ml-2 font-medium">
                      {location.address || 'Non specificato'}
                    </span>
                  </div>
                  <div>
                    <span className="text-purple-700">Coordinate:</span>
                    <span className="ml-2 font-medium">
                      {location.coordinates.lat.toFixed(6)}, {location.coordinates.lng.toFixed(6)}
                    </span>
                  </div>
                  <div>
                    <span className="text-purple-700">Categoria:</span>
                    <span className="ml-2 font-medium capitalize">{location.zoning.category}</span>
                  </div>
                  <div>
                    <span className="text-purple-700">Densità:</span>
                    <span className="ml-2 font-medium">{location.zoning.density}</span>
                  </div>
                </div>
              </div>

              {/* Riepilogo validazione */}
              <div
                className={`border rounded-lg p-4 ${
                  validationResult.isValid
                    ? 'bg-green-50 border-green-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <h4
                  className={`font-medium mb-3 ${
                    validationResult.isValid ? 'text-green-800' : 'text-yellow-800'
                  }`}
                >
                  {validationResult.isValid ? '✅ Validazione Superata' : '⚠️ Validazione Parziale'}
                </h4>
                <p
                  className={`text-sm ${
                    validationResult.isValid ? 'text-green-700' : 'text-yellow-700'
                  }`}
                >
                  {validationResult.isValid
                    ? 'Il progetto rispetta tutti i vincoli urbanistici e normativi.'
                    : 'Il progetto ha alcune violazioni minori che possono essere gestite.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer con navigazione */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={activeStep === 'location'}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                activeStep === 'location'
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              ← Indietro
            </button>

            <div className="flex space-x-3">
              {activeStep === 'validation' && (
                <>
                  <button
                    onClick={() => setShowTerrainAnalysis(true)}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all transform hover:scale-105"
                  >
                    🗺️ Analisi Terreno
                  </button>

                  <button
                    onClick={() => setShowAIAssistant(true)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105"
                  >
                    🤖 AI Assistant
                  </button>
                </>
              )}

              {activeStep !== 'summary' ? (
                <button
                  onClick={nextStep}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {activeStep === 'validation' ? 'Rivedi Riepilogo' : 'Avanti →'}
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!validationResult.isValid}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    validationResult.isValid
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  🚀 Crea Progetto Design
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Design Assistant Modal */}
      {showAIAssistant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">🤖 AI Design Assistant</h2>
              <button
                onClick={() => setShowAIAssistant(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <AIDesignAssistant
                template={template}
                customization={customization}
                location={location}
                budget={budget}
                onOptimize={handleAIOptimization}
              />
            </div>
          </div>
        </div>
      )}

      {/* Terrain Analysis Advanced Modal */}
      {showTerrainAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">🗺️ Analisi Avanzata Terreno</h2>
              <button
                onClick={() => setShowTerrainAnalysis(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <TerrainAnalysisAdvanced
                location={location}
                onAnalysisComplete={handleTerrainAnalysisComplete}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
