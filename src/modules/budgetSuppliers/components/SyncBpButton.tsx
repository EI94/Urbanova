'use client';

/**
 * 🔄 SYNC BP BUTTON
 * 
 * Componente per sincronizzazione Business Plan con costi contrattualizzati
 */

import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  DollarSign,
  Percent,
  BarChart3,
  Clock,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  Download
} from 'lucide-react';
import { BusinessPlanSyncService, BusinessPlanSyncResult, ContractCosts } from '../api/syncBusinessPlan';
import { BusinessPlanRefreshService } from '../../businessPlan/api/refreshFromSuppliers';

interface SyncBpButtonProps {
  projectId: string;
  businessPlanId: string;
  onSyncComplete?: (result: BusinessPlanSyncResult) => void;
  showDetails?: boolean;
}

export function SyncBpButton({ 
  projectId, 
  businessPlanId, 
  onSyncComplete,
  showDetails = true 
}: SyncBpButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<BusinessPlanSyncResult | null>(null);
  const [showImpact, setShowImpact] = useState(false);
  const [potentialImpact, setPotentialImpact] = useState<any>(null);
  const [contractCosts, setContractCosts] = useState<ContractCosts[]>([]);

  useEffect(() => {
    loadContractCosts();
    calculatePotentialImpact();
  }, [projectId, businessPlanId]);

  const loadContractCosts = async () => {
    try {
      const costs = await BusinessPlanSyncService.getContractCosts(projectId);
      setContractCosts(costs);
    } catch (error: any) {
      console.error('❌ [SYNC] Errore caricamento costi contrattualizzati:', error);
    }
  };

  const calculatePotentialImpact = async () => {
    try {
      const impact = await BusinessPlanRefreshService.calculatePotentialImpact(projectId, businessPlanId);
      setPotentialImpact(impact);
    } catch (error: any) {
      console.error('❌ [SYNC] Errore calcolo impatto potenziale:', error);
    }
  };

  const handleSync = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      console.log('🔄 [SYNC] Avvio sincronizzazione Business Plan...');
      
      const result = await BusinessPlanRefreshService.refreshBusinessPlanFromSuppliers(
        projectId,
        businessPlanId,
        true // Force refresh
      );
      
      if (result.success && result.result) {
        setSyncResult(result.result);
        setSuccess('Business Plan sincronizzato con successo!');
        
        if (onSyncComplete) {
          onSyncComplete(result.result);
        }
        
        // Ricarica dati
        await loadContractCosts();
        await calculatePotentialImpact();
        
      } else {
        setError(result.error || 'Errore durante la sincronizzazione');
      }
      
    } catch (error: any) {
      console.error('❌ [SYNC] Errore sincronizzazione:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getImpactColor = (value: number): string => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getImpactIcon = (value: number) => {
    if (value > 0) return <ArrowUp className="w-4 h-4 text-green-600" />;
    if (value < 0) return <ArrowDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getImpactLevelColor = (level: string): string => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-4">
      
      {/* Sync Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Sincronizzazione Business Plan</h3>
          <p className="text-sm text-gray-600">
            Aggiorna Business Plan con costi contrattualizzati
          </p>
        </div>
        
        <button
          onClick={handleSync}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Sincronizzando...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Sincronizza BP</span>
            </>
          )}
        </button>
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
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Potential Impact Preview */}
      {potentialImpact && !syncResult && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center space-x-2 mb-3">
            <Eye className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-800">Impatto Potenziale</h4>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Variazione Costi</div>
              <div className={`font-semibold ${getImpactColor(potentialImpact.costChange)}`}>
                {formatCurrency(potentialImpact.costChange)}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Impatto Margine</div>
              <div className={`font-semibold ${getImpactColor(potentialImpact.marginImpact)}`}>
                {formatPercentage(potentialImpact.marginImpact)}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Raccomandazioni</div>
              <div className="font-semibold text-gray-900">
                {potentialImpact.recommendations.length}
              </div>
            </div>
          </div>
          
          {potentialImpact.recommendations.length > 0 && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="text-sm text-blue-700">
                {potentialImpact.recommendations.map((rec: string, index: number) => (
                  <div key={index} className="mb-1">• {rec}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sync Result */}
      {syncResult && (
        <div className="space-y-4">
          
          {/* Impact Summary */}
          <div className={`rounded-lg p-6 border ${
            syncResult.impactAnalysis.impactLevel === 'critical' ? 'bg-red-50 border-red-200' :
            syncResult.impactAnalysis.impactLevel === 'high' ? 'bg-orange-50 border-orange-200' :
            syncResult.impactAnalysis.impactLevel === 'medium' ? 'bg-yellow-50 border-yellow-200' :
            'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h4 className="text-lg font-semibold text-gray-900">Risultato Sincronizzazione</h4>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getImpactLevelColor(syncResult.impactAnalysis.impactLevel)}`}>
                  {syncResult.impactAnalysis.impactLevel.toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => setShowImpact(!showImpact)}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {showImpact ? 'Nascondi' : 'Mostra'} Dettagli
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(syncResult.afterMetrics.totalCosts)}
                </div>
                <div className="text-sm text-gray-600">Costi Totali</div>
                <div className={`text-xs ${getImpactColor(syncResult.impactAnalysis.costChange)}`}>
                  {formatCurrency(syncResult.impactAnalysis.costChange)}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {syncResult.afterMetrics.marginPercentage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Margine</div>
                <div className={`text-xs ${getImpactColor(syncResult.impactAnalysis.marginPercentageChange)}`}>
                  {formatPercentage(syncResult.impactAnalysis.marginPercentageChange)}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(syncResult.afterMetrics.npv)}
                </div>
                <div className="text-sm text-gray-600">NPV</div>
                <div className={`text-xs ${getImpactColor(syncResult.impactAnalysis.npvChange)}`}>
                  {formatCurrency(syncResult.impactAnalysis.npvChange)}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {syncResult.afterMetrics.irr.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">IRR</div>
                <div className={`text-xs ${getImpactColor(syncResult.impactAnalysis.irrChange)}`}>
                  {formatPercentage(syncResult.impactAnalysis.irrChange)}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Impact */}
          {showImpact && (
            <div className="space-y-4">
              
              {/* Cost Updates */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h5 className="text-lg font-semibold text-gray-900 mb-4">Aggiornamenti Costi per Categoria</h5>
                
                <div className="space-y-3">
                  {syncResult.costUpdates.map((cost, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h6 className="font-medium text-gray-900">{cost.category}</h6>
                        <div className="flex items-center space-x-2">
                          {getImpactIcon(cost.driftPercentage)}
                          <span className={`text-sm font-semibold ${getImpactColor(cost.driftPercentage)}`}>
                            {formatPercentage(cost.driftPercentage)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Budget</div>
                          <div className="font-medium text-blue-600">
                            {formatCurrency(cost.budgetAmount)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Contratto</div>
                          <div className="font-medium text-purple-600">
                            {formatCurrency(cost.contractAmount)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Consuntivo</div>
                          <div className="font-medium text-green-600">
                            {formatCurrency(cost.consuntivoAmount)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Finale</div>
                          <div className="font-medium text-orange-600">
                            {formatCurrency(cost.finalAmount)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              {syncResult.impactAnalysis.recommendations.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h5 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Info className="w-5 h-5 text-blue-600" />
                    <span>Raccomandazioni</span>
                  </h5>
                  
                  <div className="space-y-2">
                    {syncResult.impactAnalysis.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metrics Comparison */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h5 className="text-lg font-semibold text-gray-900 mb-4">Confronto Metriche</h5>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-medium text-gray-700">Metrica</th>
                        <th className="text-right py-2 font-medium text-gray-700">Prima</th>
                        <th className="text-right py-2 font-medium text-gray-700">Dopo</th>
                        <th className="text-right py-2 font-medium text-gray-700">Variazione</th>
                      </tr>
                    </thead>
                    <tbody className="space-y-2">
                      <tr className="border-b border-gray-100">
                        <td className="py-2 font-medium text-gray-900">Ricavi Totali</td>
                        <td className="py-2 text-right text-gray-600">
                          {formatCurrency(syncResult.beforeMetrics.totalRevenue)}
                        </td>
                        <td className="py-2 text-right text-gray-600">
                          {formatCurrency(syncResult.afterMetrics.totalRevenue)}
                        </td>
                        <td className="py-2 text-right text-gray-600">
                          {formatCurrency(syncResult.afterMetrics.totalRevenue - syncResult.beforeMetrics.totalRevenue)}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 font-medium text-gray-900">Costi Totali</td>
                        <td className="py-2 text-right text-gray-600">
                          {formatCurrency(syncResult.beforeMetrics.totalCosts)}
                        </td>
                        <td className="py-2 text-right text-gray-600">
                          {formatCurrency(syncResult.afterMetrics.totalCosts)}
                        </td>
                        <td className={`py-2 text-right font-semibold ${getImpactColor(syncResult.impactAnalysis.costChange)}`}>
                          {formatCurrency(syncResult.impactAnalysis.costChange)}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 font-medium text-gray-900">Margine %</td>
                        <td className="py-2 text-right text-gray-600">
                          {syncResult.beforeMetrics.marginPercentage.toFixed(1)}%
                        </td>
                        <td className="py-2 text-right text-gray-600">
                          {syncResult.afterMetrics.marginPercentage.toFixed(1)}%
                        </td>
                        <td className={`py-2 text-right font-semibold ${getImpactColor(syncResult.impactAnalysis.marginPercentageChange)}`}>
                          {formatPercentage(syncResult.impactAnalysis.marginPercentageChange)}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 font-medium text-gray-900">NPV</td>
                        <td className="py-2 text-right text-gray-600">
                          {formatCurrency(syncResult.beforeMetrics.npv)}
                        </td>
                        <td className="py-2 text-right text-gray-600">
                          {formatCurrency(syncResult.afterMetrics.npv)}
                        </td>
                        <td className={`py-2 text-right font-semibold ${getImpactColor(syncResult.impactAnalysis.npvChange)}`}>
                          {formatCurrency(syncResult.impactAnalysis.npvChange)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 font-medium text-gray-900">IRR</td>
                        <td className="py-2 text-right text-gray-600">
                          {syncResult.beforeMetrics.irr.toFixed(1)}%
                        </td>
                        <td className="py-2 text-right text-gray-600">
                          {syncResult.afterMetrics.irr.toFixed(1)}%
                        </td>
                        <td className={`py-2 text-right font-semibold ${getImpactColor(syncResult.impactAnalysis.irrChange)}`}>
                          {formatPercentage(syncResult.impactAnalysis.irrChange)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
