'use client';

/**
 * 📋 RFP LIST
 * 
 * Lista RFP con stato, count offerte e giorni alla scadenza
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Send,
  X
} from 'lucide-react';
import { RfpService, RfpStats } from '../api/rfp';
import { Rfp } from '../lib/types';

interface RfpListProps {
  projectId: string;
  onRfpSelect?: (rfp: Rfp) => void;
}

export function RfpList({ projectId, onRfpSelect }: RfpListProps) {
  const [rfps, setRfps] = useState<Rfp[]>([]);
  const [rfpStats, setRfpStats] = useState<Record<string, RfpStats>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRfps();
  }, [projectId]);

  const loadRfps = async () => {
    try {
      setLoading(true);
      console.log('📋 [RFP] Caricamento RFP per progetto:', projectId);
      
      const rfpsData = await RfpService.listRfps(projectId);
      setRfps(rfpsData);
      
      // Carica statistiche per ogni RFP
      const statsPromises = rfpsData.map(async (rfp) => {
        const stats = await RfpService.getRfpStats(rfp.id);
        return { rfpId: rfp.id, stats };
      });
      
      const statsResults = await Promise.all(statsPromises);
      const statsMap = statsResults.reduce((acc, { rfpId, stats }) => {
        acc[rfpId] = stats;
        return acc;
      }, {} as Record<string, RfpStats>);
      
      setRfpStats(statsMap);
      
      console.log('✅ [RFP] Caricate', rfpsData.length, 'RFP');
      
    } catch (error: any) {
      console.error('❌ [RFP] Errore caricamento RFP:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseRfp = async (rfpId: string) => {
    try {
      await RfpService.closeRfp(rfpId);
      await loadRfps(); // Ricarica la lista
    } catch (error: any) {
      console.error('❌ [RFP] Errore chiusura RFP:', error);
      alert(`Errore chiusura RFP: ${error.message}`);
    }
  };

  const handleReopenRfp = async (rfpId: string) => {
    try {
      await RfpService.reopenRfp(rfpId);
      await loadRfps(); // Ricarica la lista
    } catch (error: any) {
      console.error('❌ [RFP] Errore riapertura RFP:', error);
      alert(`Errore riapertura RFP: ${error.message}`);
    }
  };

  const handleDeleteRfp = async (rfpId: string) => {
    if (confirm('Sei sicuro di voler eliminare questa RFP?')) {
      try {
        await RfpService.deleteRfp(rfpId);
        await loadRfps(); // Ricarica la lista
      } catch (error: any) {
        console.error('❌ [RFP] Errore eliminazione RFP:', error);
        alert(`Errore eliminazione RFP: ${error.message}`);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'text-gray-600 bg-gray-100';
      case 'sent':
        return 'text-blue-600 bg-blue-100';
      case 'collecting':
        return 'text-green-600 bg-green-100';
      case 'closed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Bozza';
      case 'sent':
        return 'Inviata';
      case 'collecting':
        return 'Raccolta';
      case 'closed':
        return 'Chiusa';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className="w-4 h-4" />;
      case 'sent':
        return <Send className="w-4 h-4" />;
      case 'collecting':
        return <TrendingUp className="w-4 h-4" />;
      case 'closed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDaysToDeadline = (dueAt: number) => {
    const now = Date.now();
    const days = Math.ceil((dueAt - now) / (24 * 60 * 60 * 1000));
    return days;
  };

  const getDaysColor = (days: number) => {
    if (days < 0) return 'text-red-600';
    if (days <= 3) return 'text-orange-600';
    if (days <= 7) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-gray-600">Caricamento RFP...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <h4 className="font-medium text-red-800">Errore caricamento RFP</h4>
        </div>
        <p className="text-sm text-red-700 mt-1">{error}</p>
        <button
          onClick={loadRfps}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Riprova
        </button>
      </div>
    );
  }

  if (rfps.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna RFP</h3>
        <p className="text-gray-600 mb-4">
          Non ci sono ancora richieste di offerta per questo progetto.
        </p>
        <p className="text-sm text-gray-500">
          Seleziona degli items e clicca "Crea RFP" per iniziare.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rfps.map((rfp) => {
        const stats = rfpStats[rfp.id];
        const daysToDeadline = getDaysToDeadline(rfp.dueAt);
        
        return (
          <div
            key={rfp.id}
            className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
            onClick={() => onRfpSelect?.(rfp)}
          >
            <div className="p-6">
              
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{rfp.name}</h3>
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rfp.status)}`}>
                      {getStatusIcon(rfp.status)}
                      <span>{getStatusLabel(rfp.status)}</span>
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Creata il {formatDate(rfp.createdAt)} • {rfp.itemIds.length} items
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implementare azioni
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                
                {/* Inviti */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats?.totalInvites || 0}
                  </div>
                  <div className="text-xs text-gray-500">Inviti</div>
                </div>

                {/* Offerte */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats?.respondedInvites || 0}
                  </div>
                  <div className="text-xs text-gray-500">Offerte</div>
                </div>

                {/* Aperture */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats?.openedInvites || 0}
                  </div>
                  <div className="text-xs text-gray-500">Aperture</div>
                </div>

                {/* Scadenza */}
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getDaysColor(daysToDeadline)}`}>
                    {daysToDeadline < 0 ? 'Scaduta' : `${daysToDeadline}d`}
                  </div>
                  <div className="text-xs text-gray-500">Alla scadenza</div>
                </div>

              </div>

              {/* Progress Bar */}
              {stats && stats.totalInvites > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Risposta fornitori</span>
                    <span>{stats.respondedInvites}/{stats.totalInvites}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${(stats.respondedInvites / stats.totalInvites) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Scadenza: {formatDate(rfp.dueAt)}</span>
                  </div>
                  {rfp.hideBudget && (
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>Budget nascosto</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {rfp.status === 'collecting' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloseRfp(rfp.id);
                      }}
                      className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
                    >
                      Chiudi
                    </button>
                  )}
                  {rfp.status === 'closed' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReopenRfp(rfp.id);
                      }}
                      className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                    >
                      Riapri
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRfp(rfp.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
}
