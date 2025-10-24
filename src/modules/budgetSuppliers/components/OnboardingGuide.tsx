'use client';

/**
 * 🎯 ONBOARDING GUIDE - JOHNNY IVE STYLE
 * 
 * Guida passo-passo per usare Budget & Fornitori
 * Design minimalista e intuitivo come Apple
 */

import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle, Euro, FileText, Users, BarChart3, Target, Zap } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  completed?: boolean;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'project-select',
    title: 'Seleziona il Progetto',
    description: 'Prima di tutto, seleziona il progetto per cui vuoi gestire budget e fornitori.',
    icon: <Target className="w-8 h-8 text-blue-600" />,
    action: 'Vai alla sezione Progetti e seleziona il tuo progetto'
  },
  {
    id: 'import-items',
    title: 'Importa il Computo',
    description: 'Carica il tuo computo metrico in Excel o PDF. Il sistema lo analizzerà automaticamente.',
    icon: <FileText className="w-8 h-8 text-green-600" />,
    action: 'Clicca su "Importa Computo" e carica il tuo file'
  },
  {
    id: 'create-rfp',
    title: 'Crea RFP per Fornitori',
    description: 'Genera automaticamente le richieste di offerta per i fornitori selezionati.',
    icon: <Users className="w-8 h-8 text-purple-600" />,
    action: 'Clicca su "Nuovo RFP" e seleziona i fornitori'
  },
  {
    id: 'compare-offers',
    title: 'Confronta le Offerte',
    description: 'Visualizza tutte le offerte in una matrice comparativa con punteggi automatici.',
    icon: <BarChart3 className="w-8 h-8 text-orange-600" />,
    action: 'Clicca su "Confronta Offerte" per vedere la matrice'
  },
  {
    id: 'award-contract',
    title: 'Aggiudica e Contratta',
    description: 'Seleziona le offerte migliori e genera automaticamente i contratti.',
    icon: <Euro className="w-8 h-8 text-indigo-600" />,
    action: 'Clicca su "Aggiudica" per selezionare le offerte vincenti'
  },
  {
    id: 'track-progress',
    title: 'Monitora i Progressi',
    description: 'Registra i SAL (Stati Avanzamento Lavori) e monitora le variazioni.',
    icon: <Zap className="w-8 h-8 text-yellow-600" />,
    action: 'Usa "SAL Recorder" per registrare i progressi'
  }
];

export function OnboardingGuide() {
  const [isOpen, setIsOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const currentStepData = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsOpen(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setIsOpen(false);
  };

  const handleComplete = () => {
    setCompletedSteps([...completedSteps, currentStepData.id]);
    handleNext();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Benvenuto in Budget & Fornitori</h2>
              <p className="text-blue-100 mt-1">Ti guideremo passo dopo passo</p>
            </div>
            <button
              onClick={handleSkip}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-blue-100 mb-2">
              <span>Passo {currentStep + 1} di {onboardingSteps.length}</span>
              <span>{Math.round(progress)}% completato</span>
            </div>
            <div className="w-full bg-blue-300 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {currentStepData.icon}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {currentStepData.title}
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              {currentStepData.description}
            </p>
          </div>

          {/* Action Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-sm font-bold">!</span>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Cosa fare ora:</h4>
                <p className="text-blue-800">{currentStepData.action}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                currentStep === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Indietro</span>
            </button>

            <div className="flex space-x-3">
              <button
                onClick={handleComplete}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Completato</span>
              </button>
              
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>{currentStep === onboardingSteps.length - 1 ? 'Fine' : 'Avanti'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Steps Indicator */}
        <div className="bg-gray-50 px-8 py-4">
          <div className="flex justify-center space-x-2">
            {onboardingSteps.map((step, index) => (
              <div
                key={step.id}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-blue-600'
                    : index < currentStep
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
