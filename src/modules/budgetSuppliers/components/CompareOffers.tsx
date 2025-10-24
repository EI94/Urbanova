'use client';

/**
 * 📊 COMPARE OFFERS
 * 
 * Componente per confronto matrix offerte fornitori
 */

import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  AlertCircle, 
  CheckCircle, 
  Clock,
  Euro,
  Package,
  Download,
  Settings,
  Star,
  X,
  Plus,
  Filter,
  BarChart3
} from 'lucide-react';
import { OfferParser, ParsedOffer } from '../parsers/offerParser';
import { Normalizer, NormalizedOffer } from '../lib/normalize';
import { CompareService, ComparisonResult, VendorScore } from '../api/compare';
import { AwardDialog } from './AwardDialog';
import { ContractEditor } from './ContractEditor';
import { AwardBundle, Contract } from '../api/contract';
import { MicrocopyDisplay, useBudgetSuppliersMicrocopy } from '../hooks/useMicrocopy';

interface CompareOffersProps {
  onComparisonComplete?: (result: ComparisonResult) => void;
}

export function CompareOffers({ onComparisonComplete }: CompareOffersProps) {
  const microcopy = useBudgetSuppliersMicrocopy();
  const [offers, setOffers] = useState<NormalizedOffer[]>([]);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weights, setWeights] = useState({ price: 60, leadTime: 20, compliance: 20 });
  const [defaultVatRate, setDefaultVatRate] = useState(22);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [isAwardDialogOpen, setIsAwardDialogOpen] = useState(false);
  const [isContractEditorOpen, setIsContractEditorOpen] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<AwardBundle | null>(null);
  const [awardedBundles, setAwardedBundles] = useState<AwardBundle[]>([]);

  const handleFileUpload = async (files: FileList) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📄 [COMPARE] Upload files:', files.length);
      
      const newOffers: NormalizedOffer[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Parse offerta
        const parsedOffer = await OfferParser.parseOffer(file);
        
        // Normalizza offerta
        const normalizedOffer = Normalizer.normalizeOffer(parsedOffer, defaultVatRate);
        
        newOffers.push(normalizedOffer);
      }
      
      setOffers(prev => [...prev, ...newOffers]);
      
      // Auto-confronto se abbiamo almeno 2 offerte
      if (offers.length + newOffers.length >= 2) {
        await performComparison([...offers, ...newOffers]);
      }
      
    } catch (error: any) {
      console.error('❌ [COMPARE] Errore upload files:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const performComparison = async (offersToCompare: NormalizedOffer[]) => {
    try {
      console.log('📊 [COMPARE] Esecuzione confronto:', offersToCompare.length);
      
      const result = await CompareService.compareOffers(offersToCompare, weights);
      setComparison(result);
      
      if (onComparisonComplete) {
        onComparisonComplete(result);
      }
      
    } catch (error: any) {
      console.error('❌ [COMPARE] Errore confronto:', error);
      setError(error.message);
    }
  };

  const handleRemoveOffer = (index: number) => {
    const newOffers = offers.filter((_, i) => i !== index);
    setOffers(newOffers);
    
    if (newOffers.length >= 2) {
      performComparison(newOffers);
    } else {
      setComparison(null);
    }
  };

  const handleWeightChange = (field: keyof typeof weights, value: number) => {
    const newWeights = { ...weights, [field]: value };
    
    // Normalizza pesi
    const total = newWeights.price + newWeights.leadTime + newWeights.compliance;
    const normalizedWeights = {
      price: (newWeights.price / total) * 100,
      leadTime: (newWeights.leadTime / total) * 100,
      compliance: (newWeights.compliance / total) * 100
    };
    
    setWeights(normalizedWeights);
    
    if (offers.length >= 2) {
      performComparison(offers);
    }
  };

  const handleExportExcel = async () => {
    if (!comparison) return;
    
    try {
      const blob = await CompareService.exportComparisonToExcel(comparison);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `confronto-offerte-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('❌ [COMPARE] Errore esportazione:', error);
      setError(error.message);
    }
  };

  const handleAwardOffers = () => {
    if (!comparison) return;
    setIsAwardDialogOpen(true);
  };

  const handleAwardComplete = (bundles: AwardBundle[]) => {
    setAwardedBundles(bundles);
    console.log('🏆 [COMPARE] Aggiudicazione completata:', bundles);
  };

  const handleCreateContract = (bundle: AwardBundle) => {
    setSelectedBundle(bundle);
    setIsContractEditorOpen(true);
  };

  const handleContractCreated = (contract: Contract) => {
    console.log('📋 [COMPARE] Contratto creato:', contract);
    setIsContractEditorOpen(false);
    setSelectedBundle(null);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    if (score >= 0.4) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getPriceColor = (item: any, vendorName: string): string => {
    if (!item.offers[vendorName]?.hasOffer) return 'text-gray-400';
    if (item.bestOffer?.vendorName === vendorName) return 'text-green-600 font-bold';
    return 'text-gray-900';
  };

  const filteredItems = comparison?.items.filter(item => {
    if (filterCategory && item.category !== filterCategory) return false;
    return true;
  }) || [];

  const categories = [...new Set(comparison?.items.map(item => item.category).filter(Boolean))] || [];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Confronto Offerte</h2>
          <p className="text-gray-600 mt-1">
            Carica e confronta offerte fornitori per trovare la migliore soluzione
          </p>
        </div>
        
        {comparison && (
          <div className="flex items-center space-x-3">
            <button
              onClick={handleAwardOffers}
              className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Aggiudica Offerte
            </button>
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Esporta Excel
            </button>
          </div>
        )}
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Carica Offerte</h3>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            Carica file Excel, PDF o email con le offerte fornitori
          </p>
          <input
            type="file"
            multiple
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className="hidden"
            id="offer-upload"
            accept=".xlsx,.xls,.pdf,.eml,.msg"
          />
          <label
            htmlFor="offer-upload"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Seleziona File</span>
          </label>
        </div>
        
        {loading && (
          <div className="mt-4 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3" />
            <span className="text-gray-600">Elaborazione offerte...</span>
          </div>
        )}
      </div>

      {/* Offers List */}
      {offers.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Offerte Caricate</h3>
          
          <div className="space-y-3">
            {offers.map((offer, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">{offer.vendorName}</h4>
                    <p className="text-sm text-gray-600">
                      {offer.lines.length} items • €{offer.metadata.totalValueWithVat.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">{offer.metadata.fileType}</span>
                  <button
                    onClick={() => handleRemoveOffer(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings */}
      {offers.length >= 2 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Impostazioni Confronto</h3>
          
          {/* Microcopy Offer Validation */}
          <MicrocopyDisplay type="offerValidation" showDescription={true} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            
            {/* Pesi Score */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Pesi Score</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Prezzo ({weights.price.toFixed(0)}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weights.price}
                    onChange={(e) => handleWeightChange('price', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Lead Time ({weights.leadTime.toFixed(0)}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weights.leadTime}
                    onChange={(e) => handleWeightChange('leadTime', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Compliance ({weights.compliance.toFixed(0)}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weights.compliance}
                    onChange={(e) => handleWeightChange('compliance', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* IVA Default */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">IVA Default</h4>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={defaultVatRate}
                  onChange={(e) => setDefaultVatRate(parseFloat(e.target.value))}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-sm text-gray-600">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                IVA applicata se non specificata nell'offerta
              </p>
            </div>

          </div>
        </div>
      )}

      {/* Comparison Results */}
      {comparison && (
        <div className="space-y-6">
          
          {/* Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Riepilogo Confronto</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{comparison.summary.totalItems}</div>
                <div className="text-sm text-gray-600">Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{comparison.summary.totalVendors}</div>
                <div className="text-sm text-gray-600">Fornitori</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {comparison.summary.bestOverallVendor}
                </div>
                <div className="text-sm text-gray-600">Migliore</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  €{comparison.summary.totalSavings.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Risparmio</div>
              </div>
            </div>
          </div>

          {/* Vendor Scores */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Fornitori</h3>
            
            <div className="space-y-4">
              {comparison.vendorScores
                .sort((a, b) => b.totalScore - a.totalScore)
                .map((vendor, index) => (
                <div key={vendor.vendorName} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {index === 0 && <Star className="w-5 h-5 text-yellow-500" />}
                      <h4 className="font-semibold text-gray-900">{vendor.vendorName}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(vendor.totalScore)}`}>
                        {(vendor.totalScore * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        €{vendor.totalValueWithVat.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {vendor.itemsOffered}/{comparison.summary.totalItems} items
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Prezzo</div>
                      <div className="font-medium">{(vendor.breakdown.priceScore * 100).toFixed(0)}%</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Lead Time</div>
                      <div className="font-medium">{(vendor.breakdown.leadTimeScore * 100).toFixed(0)}%</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Compliance</div>
                      <div className="font-medium">{(vendor.breakdown.complianceScore * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison Matrix */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Matrix Confronto</h3>
              
              {categories.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Tutte le categorie</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Item</th>
                    <th className="text-center py-3 px-2 font-medium text-gray-900">UM</th>
                    <th className="text-center py-3 px-2 font-medium text-gray-900">Q.tà</th>
                    {comparison.vendorScores.map(vendor => (
                      <th key={vendor.vendorName} className="text-center py-3 px-2 font-medium text-gray-900 min-w-32">
                        {vendor.vendorName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{item.description}</div>
                          {item.code && (
                            <div className="text-sm text-gray-500">{item.code}</div>
                          )}
                        </div>
                      </td>
                      <td className="text-center py-3 px-2 text-sm text-gray-600">
                        {item.uom}
                      </td>
                      <td className="text-center py-3 px-2 text-sm text-gray-600">
                        {item.qty.toLocaleString()}
                      </td>
                      {comparison.vendorScores.map(vendor => {
                        const offer = item.offers[vendor.vendorName];
                        return (
                          <td key={vendor.vendorName} className="text-center py-3 px-2">
                            {offer?.hasOffer ? (
                              <div className={`text-sm ${getPriceColor(item, vendor.vendorName)}`}>
                                <div className="font-medium">
                                  €{offer.unitPriceWithVat.toLocaleString()}
                                </div>
                                {offer.isExcluded && (
                                  <div className="text-xs text-red-600">Escluso</div>
                                )}
                                {offer.leadTime && (
                                  <div className="text-xs text-gray-500">{offer.leadTime}</div>
                                )}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-400">
                                <AlertCircle className="w-4 h-4 mx-auto" />
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Awarded Bundles */}
      {awardedBundles.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bundle Aggiudicati</h3>
          
          <div className="space-y-4">
            {awardedBundles.map((bundle, index) => (
              <div key={bundle.id} className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{bundle.name}</h4>
                    <p className="text-sm text-gray-600">{bundle.vendorName}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      €{bundle.totalValue.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {bundle.items.length} items
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Ritenuta: {bundle.retention}%</span>
                    <span>Milestone: {bundle.milestones.length}</span>
                    <span>Penali: {bundle.penalties.length}</span>
                  </div>
                  
                  <button
                    onClick={() => handleCreateContract(bundle)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Crea Contratto</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Award Dialog */}
      <AwardDialog
        isOpen={isAwardDialogOpen}
        onClose={() => setIsAwardDialogOpen(false)}
        comparison={comparison!}
        onAwardComplete={handleAwardComplete}
      />

      {/* Contract Editor */}
      {isContractEditorOpen && selectedBundle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-6xl h-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Editor Contratto</h2>
              <button
                onClick={() => setIsContractEditorOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <ContractEditor
                bundle={selectedBundle}
                onContractCreated={handleContractCreated}
              />
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">Errore</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

    </div>
  );
}
