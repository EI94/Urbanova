'use client';

import {
  GitBranch,
  GitCommit,
  GitCompare,
  GitMerge,
  GitPullRequest,
  Plus,
  Download,
  Eye,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  User,
  FileText,
  Image,
  Layers,
  Box as Cube,
  ArrowUpDown,
  History,
  Tag,
  MessageSquare,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

import { useAuth } from '@/contexts/AuthContext';
import collaborationService, { DesignVersion } from '@/lib/collaborationService';

interface IntelligentVersioningProps {
  designId: string;
  onVersionCreate?: (version: DesignVersion) => void;
  onVersionSelect?: (version: DesignVersion) => void;
  onVersionCompare?: (version1: DesignVersion, version2: DesignVersion) => void;
}

interface VersionFormData {
  versionName: string;
  description: string;
  changes: string[];
  fileUrl?: string;
  thumbnailUrl?: string;
}

interface VersionComparison {
  version1: DesignVersion;
  version2: DesignVersion;
  differences: VersionDifference[];
}

interface VersionDifference {
  type: 'added' | 'removed' | 'modified';
  field: string;
  oldValue?: any;
  newValue?: any;
  description: string;
}

export default function IntelligentVersioning({
  designId,
  onVersionCreate,
  onVersionSelect,
  onVersionCompare,
}: IntelligentVersioningProps) {
  const authContext = useAuth();
  // CHIRURGICO: Protezione ultra-sicura per evitare crash auth destructuring
  const user = (authContext && typeof authContext === 'object' && 'currentUser' in authContext) ? authContext.currentUser : null;
  const [versions, setVersions] = useState<DesignVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<DesignVersion | null>(null);
  const [showVersionForm, setShowVersionForm] = useState(false);
  const [versionForm, setVersionForm] = useState<VersionFormData>({
    versionName: '',
    description: '',
    changes: [],
    fileUrl: '',
    thumbnailUrl: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparison, setComparison] = useState<VersionComparison | null>(null);
  const [filterStatus, setFilterStatus] = useState<DesignVersion['status'] | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline'>('grid');

  useEffect(() => {
    if (!designId || !user) return;

    const unsubscribe = collaborationService.getVersionsRealtime(designId, setVersions);
    return unsubscribe;
  }, [designId, user]);

  const handleVersionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !versionForm.versionName.trim() || !versionForm.description.trim()) return;

    setIsLoading(true);
    try {
      const nextVersionNumber = await collaborationService.getNextVersionNumber(designId);

      const versionData = {
        designId,
        versionNumber: nextVersionNumber,
        versionName: versionForm.versionName.trim(),
        description: versionForm.description.trim(),
        changes: versionForm.changes.filter(change => change.trim()),
        createdBy: user.uid,
        status: 'draft' as const,
        fileUrl: versionForm.fileUrl || undefined,
        thumbnailUrl: versionForm.thumbnailUrl || undefined,
        metadata: {
          fileSize: 0, // Will be updated when file is uploaded
          fileType: 'unknown',
          dimensions: undefined,
          layers: undefined,
          components: undefined,
        },
      };

      const versionId = await collaborationService.createVersion(versionData as any);

      // Reset form
      setVersionForm({
        versionName: '',
        description: '',
        changes: [],
        fileUrl: '',
        thumbnailUrl: '',
      });

      setShowVersionForm(false);
              toast(`Versione ${nextVersionNumber} creata con successo`, { icon: '✅' });

      if (onVersionCreate) {
        const newVersion = { ...versionData, id: versionId } as any;
        onVersionCreate(newVersion);
      }
    } catch (error) {
      console.error('Error creating version:', error);
              toast('Errore nella creazione della versione', { icon: '❌' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVersionApprove = async (versionId: string) => {
    if (!user) return;

    try {
      await collaborationService.approveVersion(versionId, user.uid);
              toast('Versione approvata', { icon: '✅' });
    } catch (error) {
      console.error('Error approving version:', error);
              toast("Errore nell'approvazione della versione", { icon: '❌' });
    }
  };

  const handleVersionReject = async (versionId: string, rejectionReason: string) => {
    if (!user) return;

    try {
      await collaborationService.rejectVersion(versionId, rejectionReason);
              toast('Versione rifiutata', { icon: '✅' });
    } catch (error) {
      console.error('Error rejecting version:', error);
              toast('Errore nel rifiuto della versione', { icon: '❌' });
    }
  };

  const handleVersionCompare = (version1: DesignVersion, version2: DesignVersion) => {
    const differences: VersionDifference[] = [];

    // Compare basic fields
    if (version1.versionName !== version2.versionName) {
      differences.push({
        type: 'modified',
        field: 'Nome Versione',
        oldValue: version1.versionName,
        newValue: version2.versionName,
        description: 'Il nome della versione è stato modificato',
      });
    }

    if (version1.description !== version2.description) {
      differences.push({
        type: 'modified',
        field: 'Descrizione',
        oldValue: version1.description,
        newValue: version2.description,
        description: 'La descrizione è stata modificata',
      });
    }

    // Compare changes
    const addedChanges = version2.changes.filter(change => !version1.changes.includes(change));
    const removedChanges = version1.changes.filter(change => !version2.changes.includes(change));

    addedChanges.forEach(change => {
      differences.push({
        type: 'added',
        field: 'Modifiche',
        newValue: change,
        description: 'Nuova modifica aggiunta',
      });
    });

    removedChanges.forEach(change => {
      differences.push({
        type: 'removed',
        field: 'Modifiche',
        oldValue: change,
        description: 'Modifica rimossa',
      });
    });

    // Compare metadata
    if (version1.metadata.fileSize !== version2.metadata.fileSize) {
      differences.push({
        type: 'modified',
        field: 'Dimensione File',
        oldValue: `${version1.metadata.fileSize} bytes`,
        newValue: `${version2.metadata.fileSize} bytes`,
        description: 'La dimensione del file è cambiata',
      });
    }

    setComparison({
      version1,
      version2,
      differences,
    });

    setComparisonMode(true);

    if (onVersionCompare) {
      onVersionCompare(version1, version2);
    }
  };

  const addChange = () => {
    if (versionForm.changes.length < 10) {
      // Limit to 10 changes
      setVersionForm(prev => ({
        ...prev,
        changes: [...prev.changes, ''],
      }));
    }
  };

  const updateChange = (index: number, value: string) => {
    setVersionForm(prev => ({
      ...prev,
      changes: prev.changes.map((change, i) => (i === index ? value : change)),
    }));
  };

  const removeChange = (index: number) => {
    setVersionForm(prev => ({
      ...prev,
      changes: prev.changes.filter((_, i) => i !== index),
    }));
  };

  const filteredVersions = versions.filter(version => {
    if (filterStatus !== 'all' && version.status !== filterStatus) return false;
    if (
      searchTerm &&
      !version.versionName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !version.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  const getStatusColor = (status: DesignVersion['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: DesignVersion['status']) => {
    switch (status) {
      case 'draft':
        return <FileText className="w-4 h-4" />;
      case 'review':
        return <Eye className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (!user) {
    return (
      <div className="p-6 text-center">
        <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Accedi per gestire le versioni</p>
      </div>
    );
  }

  if (comparisonMode && comparison) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Confronto Versioni</h3>
            <button
              onClick={() => setComparisonMode(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              <GitCommit className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">
                v{comparison.version1.versionNumber} - {comparison.version1.versionName}
              </span>
            </div>
            <GitCompare className="w-4 h-4 text-gray-400" />
            <div className="flex items-center space-x-2">
              <GitCommit className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">
                v{comparison.version2.versionNumber} - {comparison.version2.versionName}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {comparison.differences.length === 0 ? (
            <div className="text-center py-8">
              <GitMerge className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nessuna differenza trovata tra le versioni</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comparison.differences.map((diff, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    diff.type === 'added'
                      ? 'bg-green-50 border-green-200'
                      : diff.type === 'removed'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {diff.type === 'added' && <Plus className="w-4 h-4 text-green-600" />}
                    {diff.type === 'removed' && <Trash2 className="w-4 h-4 text-red-600" />}
                    {diff.type === 'modified' && <Edit3 className="w-4 h-4 text-yellow-600" />}
                    <span
                      className={`text-sm font-medium ${
                        diff.type === 'added'
                          ? 'text-green-800'
                          : diff.type === 'removed'
                            ? 'text-red-800'
                            : 'text-yellow-800'
                      }`}
                    >
                      {diff.field}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 mb-2">{diff.description}</p>

                  {diff.type === 'modified' && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-red-50 p-2 rounded border border-red-200">
                        <div className="font-medium text-red-800">Valore Precedente:</div>
                        <div className="text-red-700">{diff.oldValue || 'N/A'}</div>
                      </div>
                      <div className="bg-green-50 p-2 rounded border border-green-200">
                        <div className="font-medium text-green-800">Nuovo Valore:</div>
                        <div className="text-green-700">{diff.newValue || 'N/A'}</div>
                      </div>
                    </div>
                  )}

                  {diff.type === 'added' && (
                    <div className="bg-green-50 p-2 rounded border border-green-200">
                      <div className="font-medium text-green-800">Nuovo Valore:</div>
                      <div className="text-green-700">{diff.newValue}</div>
                    </div>
                  )}

                  {diff.type === 'removed' && (
                    <div className="bg-red-50 p-2 rounded border border-red-200">
                      <div className="font-medium text-red-800">Valore Rimosso:</div>
                      <div className="text-red-700">{diff.oldValue}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Gestione Versioni Intelligente</h3>
          <div className="flex items-center space-x-2">
            <GitBranch className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">{versions.length} versioni</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Bozze',
              count: versions.filter(v => v.status === 'draft').length,
              color: 'bg-gray-100 text-gray-600',
            },
            {
              label: 'In Revisione',
              count: versions.filter(v => v.status === 'review').length,
              color: 'bg-yellow-100 text-yellow-600',
            },
            {
              label: 'Approvate',
              count: versions.filter(v => v.status === 'approved').length,
              color: 'bg-green-100 text-green-600',
            },
            {
              label: 'Rifiutate',
              count: versions.filter(v => v.status === 'rejected').length,
              color: 'bg-red-100 text-red-600',
            },
          ].map(stat => (
            <div key={stat.label} className={`text-center p-3 rounded-lg ${stat.color}`}>
              <div className="text-2xl font-bold">{stat.count}</div>
              <div className="text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 border-b bg-gray-50">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">Tutti gli stati</option>
              <option value="draft">Bozze</option>
              <option value="review">In Revisione</option>
              <option value="approved">Approvate</option>
              <option value="rejected">Rifiutate</option>
            </select>

            <input
              type="text"
              placeholder="Cerca versioni..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-64"
            />
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex border border-gray-300 rounded-md">
              {[
                { id: 'grid', icon: <Layers className="w-4 h-4" />, label: 'Griglia' },
                { id: 'list', icon: <FileText className="w-4 h-4" />, label: 'Lista' },
                { id: 'timeline', icon: <History className="w-4 h-4" />, label: 'Timeline' },
              ].map(view => (
                <button
                  key={view.id}
                  onClick={() => setViewMode(view.id as any)}
                  className={`p-2 text-sm ${
                    viewMode === view.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  title={view.label}
                >
                  {view.icon}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowVersionForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuova Versione
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {showVersionForm && (
          <div className="mb-6 bg-gray-50 p-6 rounded-lg border">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Crea Nuova Versione</h4>

            <form onSubmit={handleVersionSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Versione *
                  </label>
                  <input
                    type="text"
                    value={versionForm.versionName}
                    onChange={e =>
                      setVersionForm(prev => ({ ...prev, versionName: e.target.value }))
                    }
                    placeholder="es. Versione 2.0 - Layout Finale"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL File (opzionale)
                  </label>
                  <input
                    type="url"
                    value={versionForm.fileUrl}
                    onChange={e => setVersionForm(prev => ({ ...prev, fileUrl: e.target.value }))}
                    placeholder="https://..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrizione *
                </label>
                <textarea
                  value={versionForm.description}
                  onChange={e => setVersionForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrivi le modifiche principali di questa versione..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modifiche (opzionale)
                </label>
                <div className="space-y-2">
                  {versionForm.changes.map((change, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={change}
                        onChange={e => updateChange(index, e.target.value)}
                        placeholder={`Modifica ${index + 1}...`}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeChange(index)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {versionForm.changes.length < 10 && (
                    <button
                      type="button"
                      onClick={addChange}
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Aggiungi Modifica
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowVersionForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={
                    isLoading || !versionForm.versionName.trim() || !versionForm.description.trim()
                  }
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creazione...' : 'Crea Versione'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Versions Display */}
        {filteredVersions.length === 0 ? (
          <div className="text-center py-8">
            <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nessuna versione trovata</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVersions.map(version => (
              <div
                key={version.id}
                className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                  selectedVersion?.id === version.id ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <GitCommit className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          v{version.versionNumber} - {version.versionName}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(version.status)}`}
                        >
                          {getStatusIcon(version.status)}
                          <span className="ml-1">{version.status}</span>
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Creato da {version.createdBy} •{' '}
                        {version.createdAt?.toDate().toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {version.fileUrl && (
                      <button
                        onClick={() => window.open(version.fileUrl, '_blank')}
                        className="p-2 text-gray-600 hover:text-gray-800"
                        title="Scarica file"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedVersion(version)}
                      className="p-2 text-gray-600 hover:text-gray-800"
                      title="Seleziona versione"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-700 mb-3">{version.description}</p>

                {version.changes.length > 0 && (
                  <div className="mb-3">
                    <div className="text-sm font-medium text-gray-700 mb-2">Modifiche:</div>
                    <ul className="space-y-1">
                      {version.changes.map((change, index) => (
                        <li
                          key={index}
                          className="text-sm text-gray-600 flex items-start space-x-2"
                        >
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {version.status === 'draft' && (
                      <button
                        onClick={() => handleVersionApprove(version.id)}
                        className="inline-flex items-center text-sm text-green-600 hover:text-green-800"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approva
                      </button>
                    )}

                    {version.status === 'draft' && (
                      <button
                        onClick={() => {
                          const reason = prompt('Motivo del rifiuto:');
                          if (reason) {
                            handleVersionReject(version.id, reason);
                          }
                        }}
                        className="inline-flex items-center text-sm text-red-600 hover:text-red-800"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Rifiuta
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {versions.length > 1 && (
                      <button
                        onClick={() => {
                          const otherVersion = versions.find(v => v.id !== version.id);
                          if (otherVersion) {
                            handleVersionCompare(version, otherVersion);
                          }
                        }}
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        <GitCompare className="w-4 h-4 mr-1" />
                        Confronta
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
