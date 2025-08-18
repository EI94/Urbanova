'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { addProject, NewProjectData } from '@/lib/firestoreService';
import { BuildingIcon } from '@/components/icons';
import { useLanguage } from '@/contexts/LanguageContext';

export default function NuovoProgettoPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<Partial<NewProjectData>>({
    name: '',
    description: '',
    status: 'PIANIFICAZIONE',
    location: '',
    startDate: undefined,
    endDate: undefined,
    budget: undefined,
    manager: '',
    surface: undefined,
    units: undefined,
    propertyType: 'RESIDENZIALE',
    energyClass: '',
    images: []
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? undefined : Number(value) }));
    } else if (name === 'startDate' || name === 'endDate') {
      setFormData(prev => ({ ...prev, [name]: value ? new Date(value) : undefined }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Validazione
      if (!formData.name || !formData.description || !formData.location) {
        throw new Error(t('form.validation.requiredFields', 'newProject'));
      }
      
      // Invio dati
      await addProject(formData as NewProjectData);
      
      // Reindirizzamento
      router.push('/dashboard/progetti');
    } catch (err: any) {
      setError(err.message || t('form.validation.saveError', 'newProject'));
      console.error('Errore durante il salvataggio:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-6">
            <BuildingIcon className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-800">{t('subtitle', 'newProject')}</h2>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Nome progetto */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('form.projectName', 'newProject')}<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              {/* Descrizione */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('form.description', 'newProject')}<span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              {/* Stato */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('form.status', 'newProject')}<span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="PIANIFICAZIONE">{t('statuses.planning', 'newProject')}</option>
                  <option value="IN_CORSO">{t('statuses.inProgress', 'newProject')}</option>
                  <option value="SOSPESO">{t('statuses.onHold', 'newProject')}</option>
                  <option value="COMPLETATO">{t('statuses.completed', 'newProject')}</option>
                </select>
              </div>
              
              {/* Tipologia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('form.type', 'newProject')}<span className="text-red-500">*</span>
                </label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="RESIDENZIALE">{t('types.residential', 'newProject')}</option>
                  <option value="COMMERCIALE">{t('types.commercial', 'newProject')}</option>
                  <option value="MISTO">{t('types.mixed', 'newProject')}</option>
                  <option value="INDUSTRIALE">{t('types.industrial', 'newProject')}</option>
                </select>
              </div>
              
              {/* Località */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('form.location', 'newProject')}<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              {/* Responsabile */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('form.responsible', 'newProject')}
                </label>
                <input
                  type="text"
                  name="manager"
                  value={formData.manager}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Data inizio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('form.startDate', 'newProject')}
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate ? formData.startDate.toISOString().split('T')[0] : ''}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Data fine prevista */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('form.endDate', 'newProject')}
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate ? formData.endDate.toISOString().split('T')[0] : ''}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('form.budget', 'newProject')}
                </label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget || ''}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Superficie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('form.surface', 'newProject')}
                </label>
                <input
                  type="number"
                  name="surface"
                  value={formData.surface || ''}
                  onChange={handleChange}
                  min="0"
                  step="10"
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Numero unità */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('form.units', 'newProject')}
                </label>
                <input
                  type="number"
                  name="units"
                  value={formData.units || ''}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Classe energetica */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('form.energyClass', 'newProject')}
                </label>
                <input
                  type="text"
                  name="energyClass"
                  value={formData.energyClass}
                  onChange={handleChange}
                  placeholder={t('form.energyClassPlaceholder', 'newProject')}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t('buttons.cancel', 'newProject')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Salvataggio...' : t('buttons.saveProject', 'newProject')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
} 