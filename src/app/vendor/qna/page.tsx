'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  AVAILABLE_DOCUMENTS_OPTIONS,
  URBAN_CONSTRAINTS_OPTIONS,
  EASEMENTS_OPTIONS,
  ACCESS_LIMITATIONS_OPTIONS,
} from '@urbanova/types';

interface VendorAnswers {
  cdu: {
    hasCDU: boolean;
    cduDate?: string;
    cduValidity?: string;
    cduNotes?: string;
  };
  project: {
    hasSubmittedProject: boolean;
    projectSubmissionDate?: string;
    projectApprovalStatus?: 'pending' | 'approved' | 'rejected';
    projectNotes?: string;
  };
  sale: {
    saleType: 'asset' | 'spa';
    saleMotivation?: string;
    saleUrgency: 'low' | 'medium' | 'high';
  };
  constraints: {
    urbanConstraints: string[];
    easements: string[];
    accessLimitations: string[];
    constraintNotes?: string;
  };
  documents: {
    availableDocuments: string[];
    documentNotes?: string;
  };
  additional: {
    notes?: string;
    contactPreference?: 'email' | 'phone' | 'meeting';
    bestTimeToContact?: string;
  };
}

export default function VendorQuestionnairePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questionnaire, setQuestionnaire] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [answers, setAnswers] = useState<VendorAnswers>({
    cdu: {
      hasCDU: false,
    },
    project: {
      hasSubmittedProject: false,
    },
    sale: {
      saleType: 'asset',
      saleUrgency: 'medium',
    },
    constraints: {
      urbanConstraints: [],
      easements: [],
      accessLimitations: [],
    },
    documents: {
      availableDocuments: [],
    },
    additional: {},
  });

  // Verifica token e carica questionario
  useEffect(() => {
    if (!token) {
      setError('Token mancante');
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch('/api/vendor/verify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          throw new Error('Token non valido o scaduto');
        }

        const data = await response.json();
        setQuestionnaire(data.questionnaire);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore di verifica');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  // Gestione form
  const updateAnswer = (section: keyof VendorAnswers, field: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const updateArrayField = (
    section: keyof VendorAnswers,
    field: string,
    value: string,
    checked: boolean
  ) => {
    setAnswers(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: checked
          ? [...(prev[section] as any)[field], value]
          : (prev[section] as any)[field].filter((item: string) => item !== value),
      },
    }));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/vendor/submit-answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, answers }),
      });

      if (!response.ok) {
        throw new Error('Errore nel salvataggio delle risposte');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore di invio');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifica token in corso...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accesso Negato</h1>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500 mt-4">
            Il link potrebbe essere scaduto o non valido.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Questionario Completato</h1>
          <p className="text-gray-600 mb-4">
            Grazie per aver compilato il questionario. Le sue risposte sono state salvate con
            successo.
          </p>
          <p className="text-sm text-gray-500">Può chiudere questa pagina.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Questionario Venditore</h1>
          <p className="text-gray-600">
            Progetto: <span className="font-semibold">{questionnaire?.projectId}</span>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Scadenza:{' '}
            {questionnaire?.expiresAt
              ? new Date(questionnaire.expiresAt).toLocaleDateString('it-IT')
              : 'N/A'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* CDU Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📋 CDU (Certificato di Destinazione Urbanistica)
            </h2>

            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={answers.cdu.hasCDU}
                    onChange={e => updateAnswer('cdu', 'hasCDU', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Ha un CDU?</span>
                </label>
              </div>

              {answers.cdu.hasCDU && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data rilascio CDU
                    </label>
                    <input
                      type="date"
                      value={answers.cdu.cduDate || ''}
                      onChange={e => updateAnswer('cdu', 'cduDate', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Validità CDU
                    </label>
                    <input
                      type="text"
                      value={answers.cdu.cduValidity || ''}
                      onChange={e => updateAnswer('cdu', 'cduValidity', e.target.value)}
                      placeholder="es. 5 anni"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note CDU</label>
                <textarea
                  value={answers.cdu.cduNotes || ''}
                  onChange={e => updateAnswer('cdu', 'cduNotes', e.target.value)}
                  rows={3}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Note aggiuntive sul CDU..."
                />
              </div>
            </div>
          </div>

          {/* Project Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🏗️ Progetto Depositato</h2>

            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={answers.project.hasSubmittedProject}
                    onChange={e => updateAnswer('project', 'hasSubmittedProject', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Progetto depositato in Comune?</span>
                </label>
              </div>

              {answers.project.hasSubmittedProject && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data deposito
                    </label>
                    <input
                      type="date"
                      value={answers.project.projectSubmissionDate || ''}
                      onChange={e =>
                        updateAnswer('project', 'projectSubmissionDate', e.target.value)
                      }
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stato approvazione
                    </label>
                    <select
                      value={answers.project.projectApprovalStatus || ''}
                      onChange={e =>
                        updateAnswer('project', 'projectApprovalStatus', e.target.value)
                      }
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Seleziona...</option>
                      <option value="pending">In attesa</option>
                      <option value="approved">Approvato</option>
                      <option value="rejected">Rifiutato</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note progetto
                </label>
                <textarea
                  value={answers.project.projectNotes || ''}
                  onChange={e => updateAnswer('project', 'projectNotes', e.target.value)}
                  rows={3}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Note aggiuntive sul progetto..."
                />
              </div>
            </div>
          </div>

          {/* Sale Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">💰 Tipo Vendita</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo di vendita
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="saleType"
                      value="asset"
                      checked={answers.sale.saleType === 'asset'}
                      onChange={e => updateAnswer('sale', 'saleType', e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">Vendita asset</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="saleType"
                      value="spa"
                      checked={answers.sale.saleType === 'spa'}
                      onChange={e => updateAnswer('sale', 'saleType', e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">Vendita SPA (Società per Azioni)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivazione vendita
                </label>
                <textarea
                  value={answers.sale.saleMotivation || ''}
                  onChange={e => updateAnswer('sale', 'saleMotivation', e.target.value)}
                  rows={3}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Motivazione della vendita..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgenza vendita
                </label>
                <select
                  value={answers.sale.saleUrgency}
                  onChange={e => updateAnswer('sale', 'saleUrgency', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="low">Bassa</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                </select>
              </div>
            </div>
          </div>

          {/* Constraints Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🚧 Vincoli e Limitazioni</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vincoli urbanistici
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {URBAN_CONSTRAINTS_OPTIONS.map(constraint => (
                    <label key={constraint} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={answers.constraints.urbanConstraints.includes(constraint)}
                        onChange={e =>
                          updateArrayField(
                            'constraints',
                            'urbanConstraints',
                            constraint,
                            e.target.checked
                          )
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {constraint.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Servitù</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {EASEMENTS_OPTIONS.map(easement => (
                    <label key={easement} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={answers.constraints.easements.includes(easement)}
                        onChange={e =>
                          updateArrayField('constraints', 'easements', easement, e.target.checked)
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {easement.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Limitazioni accesso
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {ACCESS_LIMITATIONS_OPTIONS.map(limitation => (
                    <label key={limitation} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={answers.constraints.accessLimitations.includes(limitation)}
                        onChange={e =>
                          updateArrayField(
                            'constraints',
                            'accessLimitations',
                            limitation,
                            e.target.checked
                          )
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {limitation.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note vincoli</label>
                <textarea
                  value={answers.constraints.constraintNotes || ''}
                  onChange={e => updateAnswer('constraints', 'constraintNotes', e.target.value)}
                  rows={3}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Note aggiuntive sui vincoli..."
                />
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📄 Documenti Disponibili</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Documenti disponibili
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {AVAILABLE_DOCUMENTS_OPTIONS.map(document => (
                    <label key={document} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={answers.documents.availableDocuments.includes(document)}
                        onChange={e =>
                          updateArrayField(
                            'documents',
                            'availableDocuments',
                            document,
                            e.target.checked
                          )
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {document.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note documenti
                </label>
                <textarea
                  value={answers.documents.documentNotes || ''}
                  onChange={e => updateAnswer('documents', 'documentNotes', e.target.value)}
                  rows={3}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Note sui documenti disponibili..."
                />
              </div>
            </div>
          </div>

          {/* Additional Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">ℹ️ Informazioni Aggiuntive</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note aggiuntive
                </label>
                <textarea
                  value={answers.additional.notes || ''}
                  onChange={e => updateAnswer('additional', 'notes', e.target.value)}
                  rows={3}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Note aggiuntive o informazioni supplementari..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferenza contatto
                  </label>
                  <select
                    value={answers.additional.contactPreference || ''}
                    onChange={e => updateAnswer('additional', 'contactPreference', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Seleziona...</option>
                    <option value="email">Email</option>
                    <option value="phone">Telefono</option>
                    <option value="meeting">Riunione</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Orario migliore per contatto
                  </label>
                  <input
                    type="text"
                    value={answers.additional.bestTimeToContact || ''}
                    onChange={e => updateAnswer('additional', 'bestTimeToContact', e.target.value)}
                    placeholder="es. Mattina, Pomeriggio, Dopo le 18:00"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Invio in corso...
                </span>
              ) : (
                'Invia Questionario'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
