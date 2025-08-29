'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bug, Lightbulb, Star, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

interface FeedbackData {
  type: 'bug' | 'improvement' | 'feature' | 'other';
  category: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  screen?: string;
  userAgent: string;
  timestamp: Date;
  userEmail?: string;
  userName?: string;
  userLastName?: string;
  userRole?: string;
  userCompany?: string;
  attachments?: string[];
}

interface FeedbackWidgetProps {
  className?: string;
}

const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({ className = '' }) => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({
    type: 'bug',
    category: '',
    title: '',
    description: '',
    priority: 'medium',
    screen: '',
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
    timestamp: new Date(),
    userEmail: currentUser?.email || '',
    attachments: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Aggiorna l'email quando l'utente cambia
  useEffect(() => {
    if (currentUser?.email) {
      setFeedbackData(prev => ({ ...prev, userEmail: currentUser.email }));
    }
  }, [currentUser]);

  const feedbackTypes = [
    {
      id: 'bug',
      label: 'Bug o Problema',
      description: 'Qualcosa non funziona correttamente',
      icon: Bug,
      color: 'text-red-600 bg-red-50 border-red-200'
    },
    {
      id: 'improvement',
      label: 'Idea di Miglioramento',
      description: 'Suggerimento per migliorare l\'esperienza',
      icon: Lightbulb,
      color: 'text-blue-600 bg-blue-50 border-blue-200'
    },
    {
      id: 'feature',
      label: 'Nuova Funzionalità',
      description: 'Richiesta per una nuova caratteristica',
      icon: Star,
      color: 'text-green-600 bg-green-50 border-green-200'
    },
    {
      id: 'other',
      label: 'Altro',
      description: 'Altro tipo di feedback',
      icon: AlertCircle,
      color: 'text-gray-600 bg-gray-50 border-gray-200'
    }
  ];

  const priorityLevels = [
    { id: 'low', label: 'Bassa', description: 'Non urgente', color: 'text-green-600' },
    { id: 'medium', label: 'Media', description: 'Importante', color: 'text-yellow-600' },
    { id: 'high', label: 'Alta', description: 'Molto importante', color: 'text-orange-600' },
    { id: 'critical', label: 'Critica', description: 'Blocca l\'uso', color: 'text-red-600' }
  ];

  const screens = [
    'Dashboard',
    'Design Center',
    'Analisi di Fattibilità',
    'Market Intelligence',
    'Mappa Progetti',
    'Project Timeline',
    'Permessi & Compliance',
    'Impostazioni',
    'Altro'
  ];

  const handleTypeSelect = (type: FeedbackData['type']) => {
    setFeedbackData(prev => ({ ...prev, type }));
    setCurrentStep(2);
  };

  const handlePrioritySelect = (priority: FeedbackData['priority']) => {
    setFeedbackData(prev => ({ ...prev, priority }));
    setCurrentStep(3);
  };

  const handleScreenSelect = (screen: string) => {
    setFeedbackData(prev => ({ ...prev, screen }));
    setCurrentStep(4);
  };

  const handleInputChange = (field: keyof FeedbackData, value: string) => {
    setFeedbackData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) { // 5MB limit
      setSelectedFile(file);
    } else if (file) {
      toast('File troppo grande. Massimo 5MB consentiti.', { icon: '❌' });
    }
  };

  const handleSubmit = async () => {
    if (!feedbackData.title.trim() || !feedbackData.description.trim()) {
      toast('Compila tutti i campi obbligatori', { icon: '❌' });
      return;
    }

    // Verifica che l'utente sia autenticato
    if (!currentUser?.email) {
      toast('Devi essere autenticato per inviare feedback', { icon: '❌' });
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepara i dati del feedback con informazioni complete dell'utente
      const enhancedFeedbackData = {
        ...feedbackData,
        userEmail: currentUser.email,
        userName: currentUser.displayName || currentUser.firstName || 'Utente',
        userLastName: currentUser.lastName || '',
        userRole: currentUser.role || 'USER',
        userCompany: currentUser.company || '',
        timestamp: new Date().toISOString()
      };

      console.log('📝 [Feedback] Preparazione dati per invio:', enhancedFeedbackData);
      
      const formData = new FormData();
      const feedbackJson = JSON.stringify(enhancedFeedbackData);
      formData.append('feedback', feedbackJson);
      
      console.log('📝 [Feedback] FormData preparato:', {
        feedback: feedbackJson,
        formDataEntries: Array.from(formData.entries())
      });

      const response = await fetch('/api/feedback', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast('Grazie per il tuo feedback! È molto importante per noi.', { icon: '✅' });
        setIsOpen(false);
        setCurrentStep(1);
        setFeedbackData({
          type: 'bug',
          category: '',
          title: '',
          description: '',
          priority: 'medium',
          screen: '',
          userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
          timestamp: new Date(),
          userEmail: currentUser.email || '',
          attachments: []
        });
        setSelectedFile(null);
      } else {
        throw new Error('Errore nell\'invio');
      }
    } catch (error) {
      console.error('Errore invio feedback:', error);
      toast('Errore nell\'invio del feedback. Riprova più tardi.', { icon: '❌' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetToStep = (step: number) => {
    setCurrentStep(step);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Cosa vuoi segnalare?';
      case 2: return 'Quanto è importante?';
      case 3: return 'A quale schermata si riferisce?';
      case 4: return 'Dettagli del feedback';
      default: return '';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1: return 'Scegli il tipo di feedback che vuoi inviarci. Il tuo contributo è fondamentale per migliorare Urbanova AI!';
      case 2: return 'Aiutaci a capire l\'urgenza del tuo feedback per poterlo gestire al meglio.';
      case 3: return 'Se il feedback si riferisce a una schermata specifica, selezionala per aiutarci a localizzare il problema.';
      case 4: return 'Descrivi nel dettaglio il tuo feedback. Più informazioni ci dai, meglio possiamo aiutarti!';
      default: return '';
    }
  };

  return (
    <>
      {/* Icona Feedback Globale */}
      <button
        onClick={() => {
          if (!currentUser?.email) {
            toast('Devi essere autenticato per inviare feedback', { icon: '❌' });
            return;
          }
          setIsOpen(true);
        }}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 ${
          currentUser?.email 
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
            : 'bg-gray-400 text-gray-200 cursor-not-allowed'
        } ${className}`}
        title={currentUser?.email ? "Invia feedback o segnala un problema" : "Accedi per inviare feedback"}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Modal Feedback */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          {!currentUser?.email ? (
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
              <div className="text-red-500 mb-4">
                <MessageSquare className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Accesso Richiesto</h3>
              <p className="text-gray-600 mb-4">
                Devi essere autenticato per inviare feedback. Accedi al tuo account e riprova.
              </p>
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Chiudi
              </button>
            </div>
          ) : (
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Feedback & Supporto</h2>
                  <p className="text-blue-100 mt-1">Il tuo contributo è prezioso per noi</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-blue-100 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="px-6 py-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Passo {currentStep} di 4</span>
                <span className="text-sm text-gray-500">{Math.round((currentStep / 4) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {/* Step 1: Tipo di Feedback */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">{getStepTitle()}</h3>
                    <p className="text-gray-600 mt-2">{getStepDescription()}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {feedbackTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.id}
                          onClick={() => handleTypeSelect(type.id as FeedbackData['type'])}
                          className={`p-4 rounded-lg border-2 hover:border-blue-300 transition-all duration-200 ${type.color} hover:shadow-md`}
                        >
                          <Icon className="w-8 h-8 mx-auto mb-2" />
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm opacity-75">{type.description}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 2: Priorità */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">{getStepTitle()}</h3>
                    <p className="text-gray-600 mt-2">{getStepDescription()}</p>
                  </div>
                  <div className="space-y-3">
                    {priorityLevels.map((priority) => (
                      <button
                        key={priority.id}
                        onClick={() => handlePrioritySelect(priority.id as FeedbackData['priority'])}
                        className={`w-full p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 text-left ${priority.color}`}
                      >
                        <div className="font-medium">{priority.label}</div>
                        <div className="text-sm opacity-75">{priority.description}</div>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => resetToStep(1)}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    ← Torna indietro
                  </button>
                </div>
              )}

              {/* Step 3: Schermata */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">{getStepTitle()}</h3>
                    <p className="text-gray-600 mt-2">{getStepDescription()}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {screens.map((screen) => (
                      <button
                        key={screen}
                        onClick={() => handleScreenSelect(screen)}
                        className="p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 text-center hover:bg-blue-50"
                      >
                        {screen}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => resetToStep(2)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      ← Torna indietro
                    </button>
                    <button
                      onClick={() => handleScreenSelect('Nessuna schermata specifica')}
                      className="text-gray-600 hover:text-gray-700 text-sm"
                    >
                      Non si riferisce a nessuna schermata →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Dettagli */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">{getStepTitle()}</h3>
                    <p className="text-gray-600 mt-2">{getStepDescription()}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Titolo del feedback *
                      </label>
                      <input
                        type="text"
                        value={feedbackData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Es: Problema con il salvataggio del progetto"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        maxLength={100}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descrizione dettagliata *
                      </label>
                      <textarea
                        value={feedbackData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Descrivi nel dettaglio il problema, l'idea o la richiesta. Più informazioni ci dai, meglio possiamo aiutarti!"
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        maxLength={1000}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dati Utente
                      </label>
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {currentUser?.displayName || currentUser?.firstName || 'Utente'}
                              {currentUser?.lastName && ` ${currentUser.lastName}`}
                            </div>
                            <div className="text-sm text-gray-600">
                              {currentUser?.email || 'Email non disponibile'}
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        I tuoi dati vengono presi automaticamente dal tuo profilo
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Allegato (opzionale, max 5MB)
                      </label>
                      <input
                        type="file"
                        onChange={handleFileSelect}
                        accept=".png,.jpg,.jpeg,.gif,.pdf,.doc,.docx,.txt"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {selectedFile && (
                        <div className="mt-2 text-sm text-gray-600">
                          File selezionato: {selectedFile.name}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => resetToStep(3)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      ← Torna indietro
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {currentStep === 4 && (
                    <span>I campi con * sono obbligatori</span>
                  )}
                </div>
                {currentStep === 4 && (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !feedbackData.title.trim() || !feedbackData.description.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Invio in corso...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Invia Feedback
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
          )}
        </div>
      )}
    </>
  );
};

export default FeedbackWidget;
