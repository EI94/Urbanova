import React, { useEffect, useState } from 'react';
import { Mic, Volume2, VolumeX, X, Loader, MessageCircle, Zap } from 'lucide-react';

interface VoiceModeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  transcribedText: string;
  audioLevel: number;
  onToggleMute: () => void;
  isMuted: boolean;
  onExitVoiceMode: () => void;
}

export function VoiceModeOverlay({
  isOpen,
  onClose,
  isListening,
  isSpeaking,
  isProcessing,
  transcribedText,
  audioLevel,
  onToggleMute,
  isMuted,
  onExitVoiceMode,
}: VoiceModeOverlayProps) {
  const [pulseAnimation, setPulseAnimation] = useState(false);

  useEffect(() => {
    if (isListening || isSpeaking) {
      setPulseAnimation(true);
    } else {
      setPulseAnimation(false);
    }
  }, [isListening, isSpeaking]);

  if (!isOpen) return null;

  const getStatusText = () => {
    if (isProcessing) return 'Urbanova sta elaborando...';
    if (isListening) return 'Urbanova ti sta ascoltando...';
    if (isSpeaking) return 'Urbanova sta rispondendo...';
    return 'Modalità Vocale Attiva';
  };

  const getStatusIcon = () => {
    if (isProcessing) {
      return <Loader className="w-16 h-16 text-white animate-spin" />;
    }
    if (isListening) {
      return <Mic className="w-16 h-16 text-white animate-pulse" />;
    }
    if (isSpeaking) {
      return <Volume2 className="w-16 h-16 text-white animate-bounce" />;
    }
    return <MessageCircle className="w-16 h-16 text-white" />;
  };

  const getAudioLevelColor = () => {
    if (audioLevel > 0.7) return 'bg-red-500';
    if (audioLevel > 0.4) return 'bg-yellow-500';
    if (audioLevel > 0.1) return 'bg-green-500';
    return 'bg-gray-400';
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 z-[100] flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
      </div>

      {/* Close Button */}
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 text-white hover:text-gray-200 transition-colors z-10"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Main Content */}
      <div className="flex flex-col items-center text-white text-center space-y-8 max-w-2xl mx-auto">
        
        {/* Icon Container */}
        <div className="relative flex items-center justify-center w-40 h-40 bg-white bg-opacity-20 rounded-full backdrop-blur-sm">
          {getStatusIcon()}
          
          {/* Pulse Animation */}
          {(isListening || isSpeaking) && (
            <>
              <div className="absolute inset-0 rounded-full border-4 border-white border-opacity-30 animate-ping"></div>
              <div className="absolute inset-0 rounded-full border-2 border-white border-opacity-50 animate-pulse"></div>
            </>
          )}
          
          {/* Audio Level Indicator */}
          {isListening && (
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-100 ${getAudioLevelColor()}`}
                style={{ width: `${Math.max(audioLevel * 100, 5)}%` }}
              ></div>
            </div>
          )}
        </div>

        {/* Status Text */}
        <div className="space-y-4">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            {getStatusText()}
          </h2>
          
          {transcribedText && (
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 border border-white border-opacity-20">
              <p className="text-xl text-white text-opacity-90 italic leading-relaxed">
                "{transcribedText}"
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-6 mt-8">
          {/* Mute Toggle */}
          <button
            onClick={onToggleMute}
            className="p-4 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-200 backdrop-blur-sm border border-white border-opacity-20 flex items-center space-x-3"
          >
            {isMuted ? (
              <VolumeX className="w-6 h-6 text-white" />
            ) : (
              <Volume2 className="w-6 h-6 text-white" />
            )}
            <span className="text-lg font-medium">
              {isMuted ? 'Riattiva Audio' : 'Muto'}
            </span>
          </button>

          {/* Exit Voice Mode */}
          <button
            onClick={onExitVoiceMode}
            className="p-4 bg-red-500 bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all duration-200 backdrop-blur-sm border border-red-400 border-opacity-50 flex items-center space-x-3"
          >
            <Zap className="w-6 h-6 text-white" />
            <span className="text-lg font-medium">Esci Modalità Voce</span>
          </button>
        </div>

        {/* Instructions */}
        <div className="text-center text-white text-opacity-70 text-sm max-w-md">
          <p>
            {isListening 
              ? "Parla normalmente, Urbanova capirà quando hai finito"
              : isSpeaking 
              ? "Urbanova sta rispondendo alla tua domanda"
              : "Clicca sul microfono per iniziare a parlare"
            }
          </p>
        </div>
      </div>
    </div>
  );
}