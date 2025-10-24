'use client';

import React, { useEffect, useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, Waves, Zap } from 'lucide-react';

interface VoiceModeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  isListening: boolean;
  isSpeaking: boolean;
  transcribedText: string;
  onToggleMute: () => void;
  isMuted: boolean;
}

export function VoiceModeOverlay({
  isOpen,
  onClose,
  isListening,
  isSpeaking,
  transcribedText,
  onToggleMute,
  isMuted
}: VoiceModeOverlayProps) {
  const [pulseScale, setPulseScale] = useState(1);
  const [waveAnimation, setWaveAnimation] = useState(0);

  // Animazione pulse per listening
  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        setPulseScale(prev => prev === 1 ? 1.2 : 1);
      }, 600);
      return () => clearInterval(interval);
    }
  }, [isListening]);

  // Animazione onde per speaking
  useEffect(() => {
    if (isSpeaking) {
      const interval = setInterval(() => {
        setWaveAnimation(prev => (prev + 1) % 3);
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isSpeaking]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Modalità Voce</h2>
              <p className="text-sm text-gray-500">Urbanova ti ascolta</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Main Voice Interface */}
        <div className="text-center mb-8">
          {/* Voice Status Circle */}
          <div className="relative inline-block mb-6">
            <div 
              className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                isListening 
                  ? 'bg-gradient-to-r from-green-400 to-blue-500 shadow-lg shadow-green-500/30' 
                  : isSpeaking 
                    ? 'bg-gradient-to-r from-purple-400 to-pink-500 shadow-lg shadow-purple-500/30'
                    : 'bg-gradient-to-r from-gray-300 to-gray-400'
              }`}
              style={{
                transform: `scale(${pulseScale})`,
                transition: 'transform 0.6s ease-in-out'
              }}
            >
              {isListening ? (
                <Mic className="w-12 h-12 text-white" />
              ) : isSpeaking ? (
                <Volume2 className="w-12 h-12 text-white" />
              ) : (
                <MicOff className="w-12 h-12 text-white" />
              )}
            </div>

            {/* Wave Animation for Speaking */}
            {isSpeaking && (
              <div className="absolute inset-0 flex items-center justify-center">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`absolute w-32 h-32 rounded-full border-2 border-purple-300 transition-all duration-200 ${
                      waveAnimation === i ? 'opacity-100 scale-150' : 'opacity-0 scale-100'
                    }`}
                    style={{
                      animationDelay: `${i * 200}ms`
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Status Text */}
          <div className="mb-6">
            {isListening && (
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900">Ti sto ascoltando...</h3>
                <p className="text-sm text-gray-600">Parla normalmente, Urbanova capirà quando hai finito</p>
              </div>
            )}
            {isSpeaking && (
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900">Urbanova sta rispondendo...</h3>
                <p className="text-sm text-gray-600">Ascolta la risposta audio</p>
              </div>
            )}
            {!isListening && !isSpeaking && (
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900">Pronto per la modalità voce</h3>
                <p className="text-sm text-gray-600">Clicca il microfono per iniziare</p>
              </div>
            )}
          </div>

          {/* Transcribed Text */}
          {transcribedText && (
            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Waves className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-700 mb-1">Trascrizione:</p>
                  <p className="text-sm text-gray-600 italic">"{transcribedText}"</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={onToggleMute}
            className={`p-3 rounded-full transition-all duration-200 ${
              isMuted 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors font-medium"
          >
            Esci dalla modalità voce
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Puoi uscire dalla modalità voce dicendo "esci dalla modalità voce" o cliccando il pulsante
          </p>
        </div>
      </div>
    </div>
  );
}
