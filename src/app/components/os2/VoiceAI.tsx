'use client';

// 🎤 VOICE AI COMPONENT - Parlare e ascoltare come ChatGPT
// Integrazione Whisper + Text-to-Speech per OS 2.0

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Play, Pause, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import '@/app/styles/voice-ai.css';

interface VoiceAIProps {
  onTranscription?: (text: string) => void;
  onSpeaking?: (isSpeaking: boolean) => void;
  disabled?: boolean;
  className?: string;
}

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export function VoiceAI({ 
  onTranscription, 
  onSpeaking, 
  disabled = false,
  className 
}: VoiceAIProps) {
  const [state, setState] = useState<VoiceState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 🎤 Avvia registrazione audio
  const startListening = useCallback(async () => {
    try {
      setError(null);
      setState('listening');
      
      // Richiedi accesso al microfono
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      streamRef.current = stream;
      
      // Configura MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      // Gestisci dati audio
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Quando finisce la registrazione
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
      };
      
      // Avvia registrazione
      mediaRecorder.start();
      
      console.log('🎤 [VoiceAI] Registrazione audio avviata');
      
    } catch (err) {
      console.error('❌ [VoiceAI] Errore accesso microfono:', err);
      setError('Errore accesso microfono');
      setState('error');
    }
  }, []);

  // 🛑 Ferma registrazione audio
  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      console.log('🛑 [VoiceAI] Registrazione audio fermata');
    }
    
    // Chiudi stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // 📝 Trascrizione audio con Whisper
  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    try {
      setState('processing');
      
      // Crea FormData per Whisper API
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', 'it'); // Italiano
      
      console.log('📝 [VoiceAI] Invio audio a Whisper API...');
      
      // Chiama API Whisper tramite nostro endpoint
      const response = await fetch('/api/os2/whisper', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Whisper API error: ${response.status}`);
      }
      
      const result = await response.json();
      const transcribedText = result.text?.trim();
      
      if (transcribedText) {
        console.log('✅ [VoiceAI] Trascrizione completata:', transcribedText);
        setTranscribedText(transcribedText);
        onTranscription?.(transcribedText);
        setState('idle');
      } else {
        throw new Error('Nessun testo trascritto');
      }
      
    } catch (err) {
      console.error('❌ [VoiceAI] Errore trascrizione:', err);
      setError('Errore trascrizione audio');
      setState('error');
    }
  }, [onTranscription]);

  // 🔊 Sintesi vocale
  const speakText = useCallback(async (text: string) => {
    if (isMuted) return;
    
    try {
      setState('speaking');
      onSpeaking?.(true);
      
      // Ferma sintesi precedente
      if (speechSynthesisRef.current) {
        speechSynthesis.cancel();
      }
      
      // Crea utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'it-IT';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      speechSynthesisRef.current = utterance;
      
      // Eventi sintesi vocale
      utterance.onstart = () => {
        console.log('🔊 [VoiceAI] Sintesi vocale avviata');
      };
      
      utterance.onend = () => {
        console.log('🔊 [VoiceAI] Sintesi vocale completata');
        setState('idle');
        onSpeaking?.(false);
      };
      
      utterance.onerror = (event) => {
        console.error('❌ [VoiceAI] Errore sintesi vocale:', event.error);
        setState('error');
        onSpeaking?.(false);
      };
      
      // Avvia sintesi
      speechSynthesis.speak(utterance);
      
    } catch (err) {
      console.error('❌ [VoiceAI] Errore sintesi vocale:', err);
      setState('error');
      onSpeaking?.(false);
    }
  }, [isMuted, onSpeaking]);

  // 🛑 Ferma sintesi vocale
  const stopSpeaking = useCallback(() => {
    speechSynthesis.cancel();
    setState('idle');
    onSpeaking?.(false);
    console.log('🛑 [VoiceAI] Sintesi vocale fermata');
  }, [onSpeaking]);

  // 🎛️ Toggle muto
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      if (newMuted) {
        speechSynthesis.cancel();
        onSpeaking?.(false);
      }
      console.log(`🔇 [VoiceAI] Muto ${newMuted ? 'attivato' : 'disattivato'}`);
      return newMuted;
    });
  }, [onSpeaking]);

  // 🧹 Cleanup
  useEffect(() => {
    return () => {
      stopListening();
      stopSpeaking();
    };
  }, [stopListening, stopSpeaking]);

  // 🎯 Gestione click principale
  const handleMainClick = useCallback(() => {
    if (disabled) return;
    
    switch (state) {
      case 'idle':
        startListening();
        break;
      case 'listening':
        stopListening();
        break;
      case 'speaking':
        stopSpeaking();
        break;
      case 'error':
        setError(null);
        setState('idle');
        break;
    }
  }, [state, disabled, startListening, stopListening, stopSpeaking]);

  // 🎨 Stili dinamici
  const getButtonStyle = () => {
    switch (state) {
      case 'listening':
        return 'bg-red-500 hover:bg-red-600 text-white voice-listening';
      case 'processing':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white voice-processing';
      case 'speaking':
        return 'bg-green-500 hover:bg-green-600 text-white voice-speaking';
      case 'error':
        return 'bg-red-600 hover:bg-red-700 text-white voice-error';
      default:
        return 'bg-blue-500 hover:bg-blue-600 text-white';
    }
  };

  const getIcon = () => {
    switch (state) {
      case 'listening':
        return <MicOff className="w-5 h-5" />;
      case 'processing':
        return <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />;
      case 'speaking':
        return <Square className="w-5 h-5" />;
      default:
        return <Mic className="w-5 h-5" />;
    }
  };

  const getTooltip = () => {
    switch (state) {
      case 'listening':
        return 'Ferma ascolto (clicca per fermare)';
      case 'processing':
        return 'Elaborazione audio...';
      case 'speaking':
        return 'Ferma sintesi vocale';
      case 'error':
        return 'Errore - clicca per riprovare';
      default:
        return 'Inizia ascolto (clicca per parlare)';
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Pulsante principale */}
      <button
        onClick={handleMainClick}
        disabled={disabled}
        className={cn(
          'voice-mic-button p-3 rounded-full',
          'hover:scale-105 active:scale-95',
          'focus:outline-none focus:ring-2 focus:ring-blue-300',
          getButtonStyle(),
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        title={getTooltip()}
        aria-label={getTooltip()}
      >
        {getIcon()}
      </button>

      {/* Pulsante muto */}
      <button
        onClick={toggleMute}
        className={cn(
          'p-2 rounded-full transition-colors',
          isMuted 
            ? 'bg-gray-500 hover:bg-gray-600 text-white' 
            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
        )}
        title={isMuted ? 'Riattiva audio' : 'Disattiva audio'}
        aria-label={isMuted ? 'Riattiva audio' : 'Disattiva audio'}
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>

      {/* Indicatore stato */}
      {transcribedText && (
        <div className="voice-transcription">
          {transcribedText}
        </div>
      )}

      {/* Messaggio errore */}
      {error && (
        <div className="text-xs text-red-500 max-w-32 truncate">
          {error}
        </div>
      )}
    </div>
  );
}

// 🎤 Hook per gestire Voice AI nell'OS 2.0
export function useVoiceAI() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastTranscription, setLastTranscription] = useState('');

  const handleTranscription = useCallback((text: string) => {
    setLastTranscription(text);
    console.log('🎤 [useVoiceAI] Trascrizione ricevuta:', text);
  }, []);

  const handleSpeaking = useCallback((speaking: boolean) => {
    setIsSpeaking(speaking);
    console.log('🔊 [useVoiceAI] Stato sintesi vocale:', speaking);
  }, []);

  return {
    isListening,
    isSpeaking,
    lastTranscription,
    handleTranscription,
    handleSpeaking,
  };
}
