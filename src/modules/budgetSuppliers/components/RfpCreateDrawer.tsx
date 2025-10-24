'use client';

/**
 * 📋 RFP CREATE DRAWER
 * 
 * Drawer per creazione RFP con selezione items, fornitori e configurazione
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Users, 
  FileText, 
  Settings, 
  Send,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { RfpService, Vendor } from '../api/rfp';
import { CreateRfpInput } from '../lib/types';

interface BoqItem {
  id: string;
  code: string;
  description: string;
  category: string;
  uom: string;
  qty: number;
  budget?: number;
}

interface RfpCreateDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: BoqItem[];
  onRfpCreated: (rfp: any) => void;
}

export function RfpCreateDrawer({ isOpen, onClose, selectedItems, onRfpCreated }: RfpCreateDrawerProps) {
  const [step, setStep] = useState<'items' | 'details' | 'vendors' | 'review'>('items');
  const [rfpData, setRfpData] = useState<Partial<CreateRfpInput>>({
    projectId: 'test-project',
    name: '',
    itemIds: selectedItems.map(item => item.id),
    inviteVendorIds: [],
    dueAt: Date.now() + (14 * 24 * 60 * 60 * 1000), // 14 giorni da ora
    hideBudget: true,
    rules: {
      requireUnitPrices: true,
      requireLeadTime: true,
      paymentTerms: '30 giorni'
    }
  });
  
  const [vendorSearch, setVendorSearch] = useState('');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<Vendor[]>([]);
  const [manualEmails, setManualEmails] = useState<string[]>(['']);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Carica fornitori quando cambia la ricerca
  useEffect(() => {
    if (vendorSearch.length > 2) {
      const categories = [...new Set(selectedItems.map(item => item.category))];
      RfpService.searchVendors(vendorSearch, categories).then(setVendors);
    } else {
      setVendors([]);
    }
  }, [vendorSearch, selectedItems]);

  // Aggiorna itemIds quando cambiano gli items selezionati
  useEffect(() => {
    setRfpData(prev => ({
      ...prev,
      itemIds: selectedItems.map(item => item.id)
    }));
  }, [selectedItems]);

  const handleNext = () => {
    if (step === 'items') setStep('details');
    else if (step === 'details') setStep('vendors');
    else if (step === 'vendors') setStep('review');
  };

  const handleBack = () => {
    if (step === 'details') setStep('items');
    else if (step === 'vendors') setStep('details');
    else if (step === 'review') setStep('vendors');
  };

  const handleVendorSelect = (vendor: Vendor) => {
    if (!selectedVendors.find(v => v.id === vendor.id)) {
      setSelectedVendors(prev => [...prev, vendor]);
    }
    setVendorSearch('');
  };

  const handleVendorRemove = (vendorId: string) => {
    setSelectedVendors(prev => prev.filter(v => v.id !== vendorId));
  };

  const handleManualEmailChange = (index: number, value: string) => {
    const newEmails = [...manualEmails];
    newEmails[index] = value;
    setManualEmails(newEmails);
  };

  const handleAddManualEmail = () => {
    setManualEmails(prev => [...prev, '']);
  };

  const handleRemoveManualEmail = (index: number) => {
    if (manualEmails.length > 1) {
      setManualEmails(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const handleCreateRfp = async () => {
    setIsCreating(true);
    try {
      console.log('📋 [RFP] Creazione RFP...', rfpData);
      
      // Crea RFP
      const rfp = await RfpService.createRfp(rfpData as CreateRfpInput);
      
      // Prepara email fornitori
      const vendorEmails = [
        ...selectedVendors.map(v => v.email),
        ...manualEmails.filter(email => email.trim() && email.includes('@'))
      ];
      
      // Invia inviti
      if (vendorEmails.length > 0) {
        await RfpService.sendRfpInvites(rfp.id, vendorEmails);
      }
      
      console.log('✅ [RFP] RFP creata con successo:', rfp.id);
      
      onRfpCreated(rfp);
      onClose();
      
    } catch (error: any) {
      console.error('❌ [RFP] Errore creazione RFP:', error);
      alert(`Errore creazione RFP: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getTotalBudget = () => {
    return selectedItems.reduce((sum, item) => sum + (item.budget || 0), 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
      <div className="bg-white w-full max-w-4xl h-full overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Crea Richiesta di Offerta</h2>
              <p className="text-sm text-gray-600">
                Step {step === 'items' ? '1' : step === 'details' ? '2' : step === 'vendors' ? '3' : '4'} di 4
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {['items', 'details', 'vendors', 'review'].map((stepName, index) => (
              <div key={stepName} className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === stepName 
                    ? 'bg-green-500 text-white' 
                    : ['items', 'details', 'vendors', 'review'].indexOf(step) > index
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-200 text-gray-500'
                }`}>
                  {index + 1}
                </div>
                <span className={`text-sm font-medium ${
                  step === stepName ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {stepName === 'items' ? 'Items' : 
                   stepName === 'details' ? 'Dettagli' :
                   stepName === 'vendors' ? 'Fornitori' : 'Riepilogo'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          
          {/* Step 1: Items */}
          {step === 'items' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Items Selezionati</h3>
                <div className="space-y-3">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900">{item.code}</span>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                              {item.category}
                            </span>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {item.uom}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{item.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Q.tà: {item.qty.toLocaleString()}</span>
                            {item.budget && (
                              <>
                                <span>•</span>
                                <span>Budget: €{item.budget.toLocaleString()}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <h4 className="font-medium text-blue-800">Importante</h4>
                  </div>
                  <p className="text-sm text-blue-700">
                    I prezzi budget non verranno mai inclusi nelle email o nel portale fornitore. 
                    I fornitori vedranno solo descrizioni, quantità e unità di misura.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 'details' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Dettagli RFP</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Nome RFP */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Richiesta di Offerta *
                    </label>
                    <input
                      type="text"
                      value={rfpData.name || ''}
                      onChange={(e) => setRfpData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="es. RFP Opere Strutturali - Fase 1"
                    />
                  </div>

                  {/* Scadenza */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scadenza *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        value={formatDate(rfpData.dueAt || Date.now())}
                        onChange={(e) => setRfpData(prev => ({ 
                          ...prev, 
                          dueAt: new Date(e.target.value).getTime() 
                        }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Nascondi Budget */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={rfpData.hideBudget}
                        onChange={(e) => setRfpData(prev => ({ ...prev, hideBudget: e.target.checked }))}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <label className="ml-2 text-sm font-medium text-gray-700">
                        Nascondi prezzi budget
                      </label>
                    </div>
                    {rfpData.hideBudget ? (
                      <EyeOff className="w-4 h-4 text-green-600" />
                    ) : (
                      <Eye className="w-4 h-4 text-red-600" />
                    )}
                  </div>

                  {/* Regole */}
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Regole RFP</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={rfpData.rules?.requireUnitPrices}
                          onChange={(e) => setRfpData(prev => ({ 
                            ...prev, 
                            rules: { ...prev.rules!, requireUnitPrices: e.target.checked }
                          }))}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <label className="text-sm text-gray-700">
                          Richiedi prezzi unitari per ogni voce
                        </label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={rfpData.rules?.requireLeadTime}
                          onChange={(e) => setRfpData(prev => ({ 
                            ...prev, 
                            rules: { ...prev.rules!, requireLeadTime: e.target.checked }
                          }))}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <label className="text-sm text-gray-700">
                          Richiedi tempi di consegna
                        </label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Termini di pagamento
                        </label>
                        <input
                          type="text"
                          value={rfpData.rules?.paymentTerms || ''}
                          onChange={(e) => setRfpData(prev => ({ 
                            ...prev, 
                            rules: { ...prev.rules!, paymentTerms: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="es. 30 giorni dalla consegna"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Allegati */}
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Allegati</h4>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Carica capitolati, disegni o documenti aggiuntivi
                      </p>
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors"
                      >
                        Seleziona File
                      </label>
                    </div>
                    {attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                            <span className="text-sm text-gray-700">{file.name}</span>
                            <button
                              onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* Step 3: Vendors */}
          {step === 'vendors' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Seleziona Fornitori</h3>
                
                {/* Ricerca fornitori */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cerca fornitori
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={vendorSearch}
                      onChange={(e) => setVendorSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Nome, azienda o email..."
                    />
                  </div>
                  
                  {/* Risultati ricerca */}
                  {vendors.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {vendors.map((vendor) => (
                        <div
                          key={vendor.id}
                          onClick={() => handleVendorSelect(vendor)}
                          className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-300 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{vendor.name}</p>
                              <p className="text-sm text-gray-600">{vendor.company}</p>
                              <p className="text-xs text-gray-500">{vendor.email}</p>
                            </div>
                            <div className="flex space-x-1">
                              {vendor.category.map((cat) => (
                                <span key={cat} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                  {cat}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Fornitori selezionati */}
                {selectedVendors.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Fornitori Selezionati</h4>
                    <div className="space-y-2">
                      {selectedVendors.map((vendor) => (
                        <div key={vendor.id} className="flex items-center justify-between bg-green-50 rounded-lg p-3 border border-green-200">
                          <div>
                            <p className="font-medium text-gray-900">{vendor.name}</p>
                            <p className="text-sm text-gray-600">{vendor.company} • {vendor.email}</p>
                          </div>
                          <button
                            onClick={() => handleVendorRemove(vendor.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Email manuali */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Email Manuali</h4>
                  <div className="space-y-2">
                    {manualEmails.map((email, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => handleManualEmailChange(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="email@fornitore.it"
                        />
                        {manualEmails.length > 1 && (
                          <button
                            onClick={() => handleRemoveManualEmail(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={handleAddManualEmail}
                      className="flex items-center space-x-2 text-green-600 hover:text-green-800 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Aggiungi email</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 'review' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Riepilogo RFP</h3>
                
                <div className="space-y-6">
                  
                  {/* Dettagli */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Dettagli</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Nome:</span>
                        <p className="font-medium">{rfpData.name}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Scadenza:</span>
                        <p className="font-medium">{formatDate(rfpData.dueAt || Date.now())}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Items:</span>
                        <p className="font-medium">{selectedItems.length} voci</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Budget Totale:</span>
                        <p className="font-medium">€{getTotalBudget().toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Items ({selectedItems.length})</h4>
                    <div className="space-y-2">
                      {selectedItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span>{item.code} - {item.description}</span>
                          <span className="text-gray-600">{item.qty} {item.uom}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fornitori */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Fornitori ({selectedVendors.length + manualEmails.filter(e => e.trim()).length})
                    </h4>
                    <div className="space-y-2">
                      {selectedVendors.map((vendor) => (
                        <div key={vendor.id} className="text-sm">
                          <span className="font-medium">{vendor.name}</span> - {vendor.email}
                        </div>
                      ))}
                      {manualEmails.filter(e => e.trim()).map((email, index) => (
                        <div key={index} className="text-sm">
                          <span className="text-gray-600">{email}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Regole */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Regole</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center space-x-2">
                        {rfpData.hideBudget ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span>Prezzi budget nascosti ai fornitori</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {rfpData.rules?.requireUnitPrices ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-gray-400" />
                        )}
                        <span>Prezzi unitari richiesti</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {rfpData.rules?.requireLeadTime ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-gray-400" />
                        )}
                        <span>Tempi di consegna richiesti</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {step === 'items' && `${selectedItems.length} items selezionati`}
            {step === 'details' && 'Configurazione RFP'}
            {step === 'vendors' && `${selectedVendors.length + manualEmails.filter(e => e.trim()).length} fornitori`}
            {step === 'review' && 'Pronto per la creazione'}
          </div>
          <div className="flex items-center space-x-3">
            {step !== 'items' && (
              <button
                onClick={handleBack}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Indietro
              </button>
            )}
            {step !== 'review' ? (
              <button
                onClick={handleNext}
                disabled={
                  (step === 'details' && !rfpData.name) ||
                  (step === 'vendors' && selectedVendors.length === 0 && manualEmails.every(e => !e.trim()))
                }
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Avanti
              </button>
            ) : (
              <button
                onClick={handleCreateRfp}
                disabled={isCreating}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creazione...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Crea RFP</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
