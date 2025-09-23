'use client';

import React, { useState, useEffect } from 'react';
import { complianceService } from '@/lib/complianceService';
import { ComplianceDocument, ComplianceReport, Municipality } from '@urbanova/types';

interface ComplianceStats {
  totalDocuments: number;
  totalSections: number;
  totalRules: number;
  totalReports: number;
  vectorStoreStats: any;
}

export default function ComplianceTab() {
  const [stats, setStats] = useState<ComplianceStats | null>(null);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [recentReports, setRecentReports] = useState<ComplianceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, municipalitiesData] = await Promise.all([
        complianceService.getStats(),
        getMunicipalities(), // Funzione mock per ora
      ]);

      setStats(statsData);
      setMunicipalities(municipalitiesData);

      if (municipalitiesData.length > 0) {
        setSelectedMunicipality(municipalitiesData[0]?.id || '');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore caricamento dati');
      console.error('Errore caricamento compliance:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMunicipalities = async (): Promise<Municipality[]> => {
    // Mock data per ora
    return [
      {
        id: 'milano',
        name: 'Milano',
        province: 'MI',
        region: 'Lombardia',
        cap: '20100',
        coordinates: { latitude: 45.4642, longitude: 9.19 },
        timezone: 'Europe/Rome',
        activeRules: ['rule-1', 'rule-2'],
        lastUpdate: new Date(),
      },
      {
        id: 'roma',
        name: 'Roma',
        province: 'RM',
        region: 'Lazio',
        cap: '00100',
        coordinates: { latitude: 41.9028, longitude: 12.4964 },
        timezone: 'Europe/Rome',
        activeRules: ['rule-3', 'rule-4'],
        lastUpdate: new Date(),
      },
    ];
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !selectedMunicipality) return;

    try {
      setUploading(true);

      const documents = Array.from(files).map(file => ({
        type: 'REGOLAMENTO_URBANISTICO' as const,
        title: file.name,
        description: `Documento caricato: ${file.name}`,
        file,
        version: '1.0',
        effectiveDate: new Date(),
        metadata: {},
      }));

      const response = await fetch('/api/compliance/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          municipalityId: selectedMunicipality,
          documents,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Documenti caricati con successo!');
        loadComplianceData(); // Ricarica i dati
      } else {
        alert(`Errore caricamento: ${result.message}`);
      }
    } catch (error) {
      console.error('Errore upload:', error);
      alert('Errore durante il caricamento dei documenti');
    } finally {
      setUploading(false);
    }
  };

  const handleComplianceCheck = async (projectId: string) => {
    try {
      const response = await fetch('/api/compliance/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          municipalityId: selectedMunicipality,
          includeCitations: true,
          includeRecommendations: true,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`Controllo compliance completato! Score: ${result.report.overallScore}/100`);
        // Qui potresti navigare al report o mostrarlo in un modal
      } else {
        alert(`Errore controllo: ${result.message}`);
      }
    } catch (error) {
      console.error('Errore controllo compliance:', error);
      alert('Errore durante il controllo di compliance');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="text-red-600 text-xl mr-2">❌</div>
          <div>
            <h3 className="text-red-800 font-semibold">Errore Caricamento</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
        <button
          onClick={loadComplianceData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Riprova
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance Urbanistica</h1>
          <p className="text-gray-600">Gestione documenti e controlli di conformità</p>
        </div>
      </div>

      {/* Statistiche */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Documenti</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalDocuments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sezioni</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalSections}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Regole</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalRules}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Report</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalReports}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Documenti */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Aggiungi Documenti</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Seleziona Comune</label>
            <select
              value={selectedMunicipality}
              onChange={e => setSelectedMunicipality(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleziona un comune</option>
              {municipalities.map(municipality => (
                <option key={municipality.id} value={municipality.id}>
                  {municipality.name} ({municipality.province})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Carica Documenti</label>
            <input
              type="file"
              multiple
              accept=".pdf,.html,.htm,.txt"
              onChange={handleFileUpload}
              disabled={!selectedMunicipality || uploading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <p className="text-sm text-gray-500 mt-1">
              Formati supportati: PDF, HTML, TXT. Massimo 10 file.
            </p>
          </div>

          {uploading && (
            <div className="flex items-center text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Caricamento in corso...
            </div>
          )}
        </div>
      </div>

      {/* Controllo Compliance */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Controllo Compliance</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ID Progetto</label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Inserisci ID progetto"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="projectId"
              />
              <button
                onClick={() => {
                  const projectId = (document.getElementById('projectId') as HTMLInputElement)
                    .value;
                  if (projectId) {
                    handleComplianceCheck(projectId);
                  } else {
                    alert('Inserisci un ID progetto');
                  }
                }}
                disabled={!selectedMunicipality}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Controlla
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stato Vector Store */}
      {stats?.vectorStoreStats && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Stato Vector Store</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.vectorStoreStats.type}</div>
              <p className="text-sm text-gray-600">Tipo</p>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.vectorStoreStats.totalSections}
              </div>
              <p className="text-sm text-gray-600">Sezioni Indicizzate</p>
            </div>

            <div className="text-center">
              <div
                className={`text-2xl font-bold ${stats.vectorStoreStats.isInitialized ? 'text-green-600' : 'text-red-600'}`}
              >
                {stats.vectorStoreStats.isInitialized ? '✅' : '❌'}
              </div>
              <p className="text-sm text-gray-600">Inizializzato</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
