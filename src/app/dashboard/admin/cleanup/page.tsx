'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

import {
  TrashIcon,
  CheckCircleIcon,
  AlertIcon,
  DatabaseIcon,
  RefreshIcon,
} from '@/components/icons';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { cleanupService } from '@/lib/cleanupService';

export default function CleanupPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [selectedCollection, setSelectedCollection] = useState('');

  const handleCleanAll = async () => {
    if (
      !confirm(
        '⚠️ ATTENZIONE: Questa operazione eliminerà TUTTI i dati dal database. Sei sicuro di voler continuare?'
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const result = await cleanupService.cleanAllCollections();
      setResults(result);

      if (result.success) {
        toast.success('✅ ' + result.message);
      } else {
        toast.error('❌ ' + result.message);
      }
    } catch (error) {
      console.error('Errore pulizia:', error);
      toast.error('❌ Errore durante la pulizia del database');
    } finally {
      setLoading(false);
    }
  };

  const handleCleanSpecific = async () => {
    if (!selectedCollection) {
      toast.error('Seleziona una collezione da pulire');
      return;
    }

    if (
      !confirm(
        `⚠️ ATTENZIONE: Eliminerai tutti i dati dalla collezione "${selectedCollection}". Sei sicuro?`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const result = await cleanupService.cleanSpecificCollection(selectedCollection);

      if (result.success) {
        toast.success('✅ ' + result.message);
        setResults({
          success: true,
          message: result.message,
          details: {
            [selectedCollection]: {
              total: result.deleted + result.errors,
              deleted: result.deleted,
              errors: result.errors,
            },
          },
        });
      } else {
        toast.error('❌ ' + result.message);
      }
    } catch (error) {
      console.error('Errore pulizia:', error);
      toast.error('❌ Errore durante la pulizia della collezione');
    } finally {
      setLoading(false);
    }
  };

  const collections = cleanupService.getCollectionsList();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🧹 Pulizia Database</h1>
          <p className="text-gray-600 mt-1">Gestisci e pulisci i dati del database Firebase</p>
        </div>

        {/* Warning */}
        <div className="alert alert-warning">
          <AlertIcon className="h-5 w-5" />
          <div>
            <h3 className="font-bold">Attenzione!</h3>
            <div className="text-sm">
              Queste operazioni eliminano permanentemente i dati dal database. Assicurati di avere
              un backup prima di procedere.
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Clean All */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <TrashIcon className="h-5 w-5 mr-2 text-red-600" />
              Pulizia Completa Database
            </h2>

            <p className="text-gray-600 mb-4">
              Elimina tutti i dati da tutte le collezioni del database.
            </p>

            <button onClick={handleCleanAll} disabled={loading} className="btn btn-error w-full">
              {loading ? (
                <>
                  <div className="loading loading-spinner loading-sm mr-2"></div>
                  Pulizia in corso...
                </>
              ) : (
                <>
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Pulisci Tutto il Database
                </>
              )}
            </button>
          </div>

          {/* Clean Specific */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <DatabaseIcon className="h-5 w-5 mr-2 text-blue-600" />
              Pulizia Collezione Specifica
            </h2>

            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">Seleziona Collezione</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={selectedCollection}
                  onChange={e => setSelectedCollection(e.target.value)}
                >
                  <option value="">Scegli una collezione...</option>
                  {collections.map(collection => (
                    <option key={collection} value={collection}>
                      {collection}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleCleanSpecific}
                disabled={loading || !selectedCollection}
                className="btn btn-outline btn-warning w-full"
              >
                {loading ? (
                  <>
                    <div className="loading loading-spinner loading-sm mr-2"></div>
                    Pulizia in corso...
                  </>
                ) : (
                  <>
                    <RefreshIcon className="h-4 w-4 mr-2" />
                    Pulisci Collezione
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600" />
              Risultati Pulizia
            </h2>

            <div className={`alert ${results.success ? 'alert-success' : 'alert-error'} mb-4`}>
              <CheckCircleIcon className="h-5 w-5" />
              <span>{results.message}</span>
            </div>

            {results.details && (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Collezione</th>
                      <th>Totali</th>
                      <th>Eliminati</th>
                      <th>Errori</th>
                      <th>Stato</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(results.details).map(([collection, data]: [string, any]) => (
                      <tr key={collection}>
                        <td className="font-medium">{collection}</td>
                        <td>{data.total}</td>
                        <td className="text-success">{data.deleted}</td>
                        <td className={data.errors > 0 ? 'text-error' : 'text-gray-500'}>
                          {data.errors}
                        </td>
                        <td>
                          {data.total === 0 ? (
                            <span className="badge badge-ghost">Vuota</span>
                          ) : data.errors === 0 ? (
                            <span className="badge badge-success">Completata</span>
                          ) : (
                            <span className="badge badge-warning">Parziale</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Collections Info */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Collezioni Database</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map(collection => (
              <div key={collection} className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900">{collection}</div>
                <div className="text-sm text-gray-500">
                  {collection === 'feasibilityProjects' && 'Progetti di fattibilità'}
                  {collection === 'feasibilityComparisons' && 'Confronti tra progetti'}
                  {collection === 'emailConfigs' && 'Configurazioni email'}
                  {collection === 'emailLogs' && 'Log email inviate'}
                  {collection === 'landSearchResults' && 'Risultati ricerca terreni'}
                  {collection === 'projects' && 'Progetti generali'}
                  {collection === 'users' && 'Utenti'}
                  {collection === 'documents' && 'Documenti'}
                  {collection === 'meetings' && 'Riunioni'}
                  {collection === 'tasks' && 'Attività'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
