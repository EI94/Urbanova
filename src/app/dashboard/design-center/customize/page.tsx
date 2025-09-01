'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

import {
  ArrowLeftIcon,
  PlusIcon,
  CheckIcon,
  EyeIcon,
  SaveIcon,
  DownloadIcon,
  MapIcon,
  BuildingIcon,
  EuroIcon,
  ClockIcon,
  UsersIcon,
} from '@/components/icons';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { designCenterService, DesignTemplate } from '@/lib/designCenterService';

export default function TemplateCustomizerPage() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');

  const [template, setTemplate] = useState<DesignTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stati per personalizzazioni
  const [customizations, setCustomizations] = useState({
    name: '',
    description: '',
    area: 0,
    budget: 0,
    bedrooms: 0,
    bathrooms: 0,
    floors: 1,
    parkingSpaces: 0,
    gardenArea: 0,
    balconyArea: 0,
    customFeatures: [] as string[],
    location: '',
    notes: '',
  });

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!templateId) {
          throw new Error('ID template non specificato');
        }

        // Carica template da Firebase o fallback
        const templates = await designCenterService.getTemplates();
        const foundTemplate = templates.find(t => t.id === templateId);

        if (!foundTemplate) {
          throw new Error('Template non trovato');
        }

        setTemplate(foundTemplate);

        // Inizializza personalizzazioni con valori template
        setCustomizations(prev => ({
          ...prev,
          name: foundTemplate.name,
          description: foundTemplate.description,
          area: foundTemplate.minArea,
          budget: foundTemplate.minBudget,
          bedrooms: foundTemplate.bedrooms,
          bathrooms: foundTemplate.bathrooms,
          floors: foundTemplate.floors,
          parkingSpaces: foundTemplate.parkingSpaces,
          gardenArea: foundTemplate.gardenArea,
          balconyArea: foundTemplate.balconyArea,
          customFeatures: [...foundTemplate.features],
        }));

        console.log('✅ [TemplateCustomizer] Template caricato:', foundTemplate.name);
      } catch (error) {
        console.error('❌ [TemplateCustomizer] Errore caricamento:', error);
        setError('Impossibile caricare il template selezionato');
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();
  }, [templateId]);

  const handleCustomizationChange = (field: string, value: any) => {
    setCustomizations(prev => ({ ...prev, [field]: value }));
  };

  const addCustomFeature = () => {
    const feature = prompt('Inserisci una nuova caratteristica:');
    if (feature && feature.trim()) {
      setCustomizations(prev => ({
        ...prev,
        customFeatures: [...prev.customFeatures, feature.trim()],
      }));
    }
  };

  const removeCustomFeature = (index: number) => {
    setCustomizations(prev => ({
      ...prev,
      customFeatures: prev.customFeatures.filter((_, i) => i !== index),
    }));
  };

  const saveCustomization = async () => {
    try {
      console.log('💾 [TemplateCustomizer] Salvataggio personalizzazioni...');

      // TODO: Salva nel database Firebase
      const customizedProject = {
        id: `custom-${Date.now()}`,
        templateId: template?.id,
        originalTemplate: template,
        customizations,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'DRAFT',
      };

      console.log('✅ [TemplateCustomizer] Progetto personalizzato salvato:', customizedProject);
      alert('✅ Personalizzazioni salvate con successo!');
    } catch (error) {
      console.error('❌ [TemplateCustomizer] Errore salvataggio:', error);
      alert('❌ Errore durante il salvataggio. Riprova.');
    }
  };

  const createProject = async () => {
    try {
      console.log('🏗️ [TemplateCustomizer] Creazione progetto personalizzato...');

      // TODO: Crea progetto nel database
      const newProject = {
        id: `project-${Date.now()}`,
        name: customizations.name,
        templateId: template?.id,
        originalTemplate: template,
        customizations,
        status: 'PLANNING',
        createdAt: new Date(),
        updatedAt: new Date(),
        progress: 0,
      };

      console.log('✅ [TemplateCustomizer] Progetto creato:', newProject);
      alert('✅ Progetto creato con successo!');

      // Reindirizza alla dashboard progetti
      window.location.href = '/dashboard/progetti';
    } catch (error) {
      console.error('❌ [TemplateCustomizer] Errore creazione progetto:', error);
      alert('❌ Errore durante la creazione del progetto. Riprova.');
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Personalizzazione Template">
        <div className="flex items-center justify-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
          <span className="ml-3">Caricamento template...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !template) {
    return (
      <DashboardLayout title="Errore">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">!</span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Errore nel caricamento</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error || 'Template non trovato'}</p>
              </div>
              <div className="mt-4">
                <Link
                  href="/dashboard/design-center"
                  className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                >
                  Torna al Design Center
                </Link>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Personalizzazione Template">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/design-center" className="btn btn-outline btn-sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Torna al Design Center
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Personalizza: {template.name}</h1>
              <p className="text-gray-600 mt-1">Adatta il template alle tue esigenze specifiche</p>
            </div>
          </div>

          <div className="flex space-x-3">
            <button onClick={saveCustomization} className="btn btn-outline btn-primary">
              <SaveIcon className="h-4 w-4 mr-2" />
              Salva Bozza
            </button>
            <button onClick={createProject} className="btn btn-primary">
              <PlusIcon className="h-4 w-4 mr-2" />
              Crea Progetto
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Anteprima Template */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Anteprima Template</h3>

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 h-48 rounded-lg flex items-center justify-center mb-4">
                <BuildingIcon className="h-20 w-20 text-gray-300" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Categoria:</span>
                  <span className="text-sm text-gray-900 capitalize">
                    {template.category.toLowerCase()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Zona:</span>
                  <span className="text-sm text-gray-900 capitalize">
                    {template.zone.toLowerCase()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">ROI Stimato:</span>
                  <span className="text-sm font-medium text-green-600">
                    {template.estimatedROI}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Tempo Costruzione:</span>
                  <span className="text-sm text-gray-900">{template.constructionTime} mesi</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Personalizzazioni */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Personalizzazioni</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informazioni Base */}
                <div className="md:col-span-2">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Informazioni Base</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome Progetto
                      </label>
                      <input
                        type="text"
                        value={customizations.name}
                        onChange={e => handleCustomizationChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Es. Villa Moderna Roma"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Località
                      </label>
                      <input
                        type="text"
                        value={customizations.location}
                        onChange={e => handleCustomizationChange('location', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Es. Roma, Italia"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrizione
                    </label>
                    <textarea
                      value={customizations.description}
                      onChange={e => handleCustomizationChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Descrivi il tuo progetto personalizzato..."
                    />
                  </div>
                </div>

                {/* Specifiche Tecniche */}
                <div className="md:col-span-2">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Specifiche Tecniche</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Area (m²)
                      </label>
                      <input
                        type="number"
                        value={customizations.area}
                        onChange={e => handleCustomizationChange('area', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min={template.minArea}
                        max={template.maxArea}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Budget (€)
                      </label>
                      <input
                        type="number"
                        value={customizations.budget}
                        onChange={e => handleCustomizationChange('budget', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min={template.minBudget}
                        max={template.maxBudget}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Piani</label>
                      <input
                        type="number"
                        value={customizations.floors}
                        onChange={e => handleCustomizationChange('floors', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min={1}
                        max={5}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Camere da letto
                      </label>
                      <input
                        type="number"
                        value={customizations.bedrooms}
                        onChange={e =>
                          handleCustomizationChange('bedrooms', Number(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min={0}
                        max={10}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bagni</label>
                      <input
                        type="number"
                        value={customizations.bathrooms}
                        onChange={e =>
                          handleCustomizationChange('bathrooms', Number(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min={1}
                        max={10}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Posti auto
                      </label>
                      <input
                        type="number"
                        value={customizations.parkingSpaces}
                        onChange={e =>
                          handleCustomizationChange('parkingSpaces', Number(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min={0}
                        max={10}
                      />
                    </div>
                  </div>
                </div>

                {/* Caratteristiche Personalizzate */}
                <div className="md:col-span-2">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Caratteristiche Personalizzate
                  </h4>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Caratteristiche Aggiuntive
                      </label>
                      <button onClick={addCustomFeature} className="btn btn-sm btn-outline">
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Aggiungi
                      </button>
                    </div>

                    <div className="space-y-2">
                      {customizations.customFeatures.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg">
                            {feature}
                          </span>
                          <button
                            onClick={() => removeCustomFeature(index)}
                            className="btn btn-sm btn-ghost text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Note Aggiuntive
                    </label>
                    <textarea
                      value={customizations.notes}
                      onChange={e => handleCustomizationChange('notes', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Aggiungi note, richieste speciali, preferenze..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
