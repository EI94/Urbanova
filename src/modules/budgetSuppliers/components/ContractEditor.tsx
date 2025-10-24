'use client';

/**
 * 📋 CONTRACT EDITOR
 * 
 * Editor per generazione contratti con milestones e firma
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Save, 
  Send, 
  CheckCircle, 
  X, 
  Plus,
  Minus,
  Edit,
  Eye,
  PenTool,
  Calendar,
  Euro,
  Percent,
  AlertCircle,
  Info,
  Clock,
  User,
  Building
} from 'lucide-react';
import { ContractService, ContractTemplate, AwardBundle } from '../api/contract';
import { Contract } from '../lib/types';

interface ContractEditorProps {
  bundle: AwardBundle;
  onContractCreated?: (contract: Contract) => void;
  onClose?: () => void;
}

export function ContractEditor({ bundle, onContractCreated, onClose }: ContractEditorProps) {
  const [contract, setContract] = useState<Partial<Contract>>({
    bundleId: bundle.id,
    vendorId: bundle.vendorName,
    vendorName: bundle.vendorName,
    totalValue: bundle.totalValue,
    milestones: bundle.milestones,
    retention: bundle.retention,
    penalties: bundle.penalties,
    bonuses: bundle.bonuses,
    status: 'draft'
  });
  
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const templatesData = await ContractService.getContractTemplates();
      setTemplates(templatesData);
      if (templatesData.length > 0) {
        setSelectedTemplate(templatesData[0].id);
      }
    } catch (error: any) {
      console.error('❌ [CONTRACT] Errore caricamento template:', error);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    
    if (template) {
      setContract(prev => ({
        ...prev,
        milestones: template.milestones,
        retention: template.defaultRetention,
        penalties: template.defaultPenalties,
        bonuses: template.defaultBonuses
      }));
    }
  };

  const handleMilestoneChange = (index: number, field: string, value: any) => {
    const newMilestones = [...(contract.milestones || [])];
    newMilestones[index] = { ...newMilestones[index], [field]: value };
    
    // Ricalcola amount se cambia percentage
    if (field === 'percentage') {
      newMilestones[index].amount = (contract.totalValue || 0) * (value / 100);
    }
    
    setContract(prev => ({ ...prev, milestones: newMilestones }));
  };

  const handleAddMilestone = () => {
    const newMilestone = {
      id: `milestone_${Date.now()}`,
      name: '',
      percentage: 0,
      amount: 0,
      description: '',
      conditions: []
    };
    
    setContract(prev => ({
      ...prev,
      milestones: [...(prev.milestones || []), newMilestone]
    }));
  };

  const handleRemoveMilestone = (index: number) => {
    const newMilestones = [...(contract.milestones || [])];
    newMilestones.splice(index, 1);
    setContract(prev => ({ ...prev, milestones: newMilestones }));
  };

  const handleAddPenalty = () => {
    const newPenalty = {
      id: `penalty_${Date.now()}`,
      name: '',
      amount: 0,
      conditions: [],
      description: ''
    };
    
    setContract(prev => ({
      ...prev,
      penalties: [...(prev.penalties || []), newPenalty]
    }));
  };

  const handleRemovePenalty = (index: number) => {
    const newPenalties = [...(contract.penalties || [])];
    newPenalties.splice(index, 1);
    setContract(prev => ({ ...prev, penalties: newPenalties }));
  };

  const handleAddBonus = () => {
    const newBonus = {
      id: `bonus_${Date.now()}`,
      name: '',
      amount: 0,
      conditions: [],
      description: ''
    };
    
    setContract(prev => ({
      ...prev,
      bonuses: [...(prev.bonuses || []), newBonus]
    }));
  };

  const handleRemoveBonus = (index: number) => {
    const newBonuses = [...(contract.bonuses || [])];
    newBonuses.splice(index, 1);
    setContract(prev => ({ ...prev, bonuses: newBonuses }));
  };

  const handleSaveContract = async () => {
    try {
      setSaving(true);
      setError(null);
      
      console.log('💾 [CONTRACT] Salvataggio contratto...');
      
      const createdContract = await ContractService.createContractFromBundle(
        bundle,
        selectedTemplate
      );
      
      setContract(createdContract);
      setSuccess('Contratto salvato con successo!');
      
      if (onContractCreated) {
        onContractCreated(createdContract);
      }
      
    } catch (error: any) {
      console.error('❌ [CONTRACT] Errore salvataggio:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      if (!contract.id) {
        setError('Salva prima il contratto per esportare');
        return;
      }
      
      const blob = await ContractService.generateContractPDF(contract as Contract);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contratto-${contract.vendorName}-${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      
    } catch (error: any) {
      console.error('❌ [CONTRACT] Errore esportazione PDF:', error);
      setError(error.message);
    }
  };

  const handleExportDOCX = async () => {
    try {
      if (!contract.id) {
        setError('Salva prima il contratto per esportare');
        return;
      }
      
      const blob = await ContractService.generateContractDOCX(contract as Contract);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contratto-${contract.vendorName}-${new Date().toISOString().split('T')[0]}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      
    } catch (error: any) {
      console.error('❌ [CONTRACT] Errore esportazione DOCX:', error);
      setError(error.message);
    }
  };

  const handleSignContract = async () => {
    try {
      if (!contract.id) {
        setError('Salva prima il contratto per firmare');
        return;
      }
      
      // Simula firma (in produzione integreresti con servizio firma)
      const signatureData = {
        signedBy: 'Mario Rossi', // Utente corrente
        signedAt: new Date().toISOString(),
        signatureType: 'digital'
      };
      
      const signedContract = await ContractService.signContract(contract.id, signatureData);
      setContract(signedContract);
      setSuccess('Contratto firmato con successo!');
      
    } catch (error: any) {
      console.error('❌ [CONTRACT] Errore firma:', error);
      setError(error.message);
    }
  };

  const getTotalMilestonePercentage = () => {
    return contract.milestones?.reduce((sum, m) => sum + m.percentage, 0) || 0;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Editor Contratto</h2>
          <p className="text-gray-600 mt-1">
            Genera contratto per {bundle.vendorName} - €{bundle.totalValue.toLocaleString()}
          </p>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Alert Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">{success}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Contract Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informazioni Contratto</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Contratto
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Vendor Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fornitore
            </label>
            <div className="px-4 py-3 bg-gray-100 rounded-lg text-gray-700 flex items-center space-x-2">
              <Building className="w-4 h-4" />
              <span>{contract.vendorName}</span>
            </div>
          </div>

          {/* Total Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valore Totale
            </label>
            <div className="px-4 py-3 bg-green-100 rounded-lg text-green-800 font-semibold flex items-center space-x-2">
              <Euro className="w-4 h-4" />
              <span>€{contract.totalValue?.toLocaleString()}</span>
            </div>
          </div>

          {/* Retention */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ritenuta (%)
            </label>
            <input
              type="number"
              min="0"
              max="20"
              step="0.1"
              value={contract.retention || 5}
              onChange={(e) => setContract(prev => ({ ...prev, retention: parseFloat(e.target.value) }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Milestone Pagamento</h3>
          <button
            onClick={handleAddMilestone}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Aggiungi</span>
          </button>
        </div>
        
        <div className="space-y-4">
          {contract.milestones?.map((milestone, index) => (
            <div key={milestone.id} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Milestone {index + 1}</h4>
                <button
                  onClick={() => handleRemoveMilestone(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={milestone.name}
                    onChange={(e) => handleMilestoneChange(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="es. Anticipo"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Percentuale (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={milestone.percentage}
                    onChange={(e) => handleMilestoneChange(index, 'percentage', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Importo (€)
                  </label>
                  <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-700 font-semibold">
                    €{milestone.amount?.toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrizione
                </label>
                <textarea
                  value={milestone.description}
                  onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="Descrizione della milestone..."
                />
              </div>
            </div>
          ))}
        </div>
        
        {/* Milestone Summary */}
        <div className="mt-4 bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900">Totale Milestone</span>
            <span className="font-semibold text-gray-900">
              {getTotalMilestonePercentage().toFixed(1)}%
            </span>
          </div>
          {Math.abs(getTotalMilestonePercentage() - 100) > 0.01 && (
            <div className="mt-2 text-sm text-red-600">
              ⚠️ Le percentuali devono sommare 100%
            </div>
          )}
        </div>
      </div>

      {/* Penalties */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Penali</h3>
          <button
            onClick={handleAddPenalty}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Aggiungi</span>
          </button>
        </div>
        
        <div className="space-y-3">
          {contract.penalties?.map((penalty, index) => (
            <div key={penalty.id} className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{penalty.name}</h4>
                <button
                  onClick={() => handleRemovePenalty(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600">{penalty.description}</p>
              <div className="text-sm font-semibold text-red-800">
                €{penalty.amount.toLocaleString()}
              </div>
            </div>
          ))}
          
          {(!contract.penalties || contract.penalties.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Nessuna penale configurata</p>
            </div>
          )}
        </div>
      </div>

      {/* Bonuses */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Bonus</h3>
          <button
            onClick={handleAddBonus}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Aggiungi</span>
          </button>
        </div>
        
        <div className="space-y-3">
          {contract.bonuses?.map((bonus, index) => (
            <div key={bonus.id} className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{bonus.name}</h4>
                <button
                  onClick={() => handleRemoveBonus(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600">{bonus.description}</p>
              <div className="text-sm font-semibold text-green-800">
                €{bonus.amount.toLocaleString()}
              </div>
            </div>
          ))}
          
          {(!contract.bonuses || contract.bonuses.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Nessun bonus configurato</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSaveContract}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Salvataggio...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Salva Contratto</span>
              </>
            )}
          </button>
          
          {contract.id && (
            <button
              onClick={handleSignContract}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <PenTool className="w-4 h-4" />
              <span>Firma Contratto</span>
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {contract.id && (
            <>
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>PDF</span>
              </button>
              
              <button
                onClick={handleExportDOCX}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>DOCX</span>
              </button>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
