'use client';

// 🎤 VOICE AI CHATGPT STYLE - Design Johnny Ive
// Esperienza identica a ChatGPT con tooltip, modal e gestione permessi

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, Settings, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceAIChatGPTProps {
  onTranscription?: (text: string) => void;
  onSpeaking?: (isSpeaking: boolean) => void;
  disabled?: boolean;
  className?: string;
}

type VoiceAIState = 'idle' | 'requesting_permission' | 'listening' | 'processing' | 'speaking' | 'error';

interface MicrophoneDevice {
  deviceId: string;
  label: string;
  isDefault: boolean;
}

export function VoiceAIChatGPT({ 
  onTranscription, 
  onSpeaking, 
  disabled = false,
  className 
}: VoiceAIChatGPTProps) {
  
  const [state, setState] = useState<VoiceAIState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [microphones, setMicrophones] = useState<MicrophoneDevice[]>([]);
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>('default');
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0); // 🎤 Livello audio in tempo reale

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  // 🎤 Rileva microfono disponibili
  const detectMicrophones = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices
        .filter(device => device.kind === 'audioinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Microfono ${device.deviceId.slice(0, 8)}`,
          isDefault: device.deviceId === 'default'
        }));
      
      setMicrophones(audioInputs);
      console.log('🎤 [VoiceAI] Microfoni rilevati:', audioInputs);
    } catch (error) {
      console.error('❌ [VoiceAI] Errore rilevamento microfoni:', error);
    }
  }, []);

  // 🔐 Controlla permessi microfono
  const checkMicrophonePermission = useCallback(async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setPermissionGranted(result.state === 'granted');
      console.log('🔐 [VoiceAI] Stato permessi:', result.state);
      return result.state === 'granted';
    } catch (error) {
      console.warn('⚠️ [VoiceAI] Impossibile controllare permessi:', error);
      return false;
    }
  }, []);

  // 🎤 Richiedi permessi microfono
  const requestMicrophonePermission = useCallback(async () => {
    try {
      setState('requesting_permission');
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          deviceId: selectedMicrophone === 'default' ? undefined : selectedMicrophone,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // 🎤 MONITORAGGIO LIVELLO AUDIO IN TEMPO REALE
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      // Funzione per aggiornare il livello audio
      const updateAudioLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        const normalizedLevel = Math.min(average / 128, 1); // Normalizza tra 0 e 1
        setAudioLevel(normalizedLevel);
        
        if (stream.active) {
          requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
      
      // Salva stream per cleanup
      streamRef.current = stream;
      
      setPermissionGranted(true);
      setState('idle');
      console.log('✅ [VoiceAI] Permessi microfono concessi');
      
      // Rileva microfoni dopo aver ottenuto i permessi
      await detectMicrophones();
      
      // Chiudi modal dopo successo
      setShowModal(false);
      
    } catch (error) {
      console.error('❌ [VoiceAI] Errore richiesta permessi:', error);
      setPermissionGranted(false);
      setState('error');
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setError('Permessi microfono negati. Abilita l\'accesso al microfono nelle impostazioni del browser.');
        } else if (error.name === 'NotFoundError') {
          setError('Nessun microfono trovato. Collega un microfono e riprova.');
        } else {
          setError(`Errore microfono: ${error.message}`);
        }
      } else {
        setError('Errore sconosciuto durante l\'accesso al microfono.');
      }
    }
  }, [selectedMicrophone, detectMicrophones]);

  // 🎤 Avvia registrazione audio
  const startRecording = useCallback(async () => {
    try {
      setState('listening');
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedMicrophone === 'default' ? undefined : selectedMicrophone,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
      };
      
      mediaRecorder.start();
      console.log('🎤 [VoiceAI] Registrazione avviata');
      
    } catch (error) {
      console.error('❌ [VoiceAI] Errore avvio registrazione:', error);
      setState('error');
      setError('Errore durante l\'avvio della registrazione');
    }
  }, [selectedMicrophone]);

  // 🛑 Ferma registrazione
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      console.log('🛑 [VoiceAI] Registrazione fermata');
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // 📝 Trascrizione audio con Whisper + Fallback Web Speech
  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    try {
      setState('processing');
      
      // Prima prova: Whisper API
      try {
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.webm');
        formData.append('model', 'whisper-1');
        formData.append('language', 'it');
        
        console.log('📝 [VoiceAI] Tentativo Whisper API...');
        
        const response = await fetch('/api/os2/whisper', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const result = await response.json();
          const transcribedText = result.text?.trim();
          
          if (transcribedText) {
            console.log('✅ [VoiceAI] Whisper trascrizione completata:', transcribedText);
            setTranscribedText(transcribedText);
            onTranscription?.(transcribedText);
            setState('idle');
            return;
          }
        }
        
        console.log('⚠️ [VoiceAI] Whisper fallito, provo Web Speech API...');
        
      } catch (whisperError) {
        console.warn('⚠️ [VoiceAI] Whisper errore:', whisperError);
      }
      
      // Fallback: Web Speech API
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        console.log('🔄 [VoiceAI] Usando Web Speech API come fallback...');
        
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'it-IT';
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        
        recognitionRef.current = recognition;
        
        return new Promise<void>((resolve, reject) => {
          recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            console.log('✅ [VoiceAI] Web Speech trascrizione:', transcript);
            setTranscribedText(transcript);
            onTranscription?.(transcript);
            setState('idle');
            resolve();
          };
          
          recognition.onerror = (event: any) => {
            console.error('❌ [VoiceAI] Web Speech errore:', event.error);
            
            let errorMessage = 'Errore trascrizione';
            switch (event.error) {
              case 'no-speech':
                errorMessage = 'Nessun parlato rilevato. Riprova.';
                break;
              case 'audio-capture':
                errorMessage = 'Errore cattura audio. Verifica il microfono.';
                break;
              case 'not-allowed':
                errorMessage = 'Permessi microfono negati.';
                break;
              case 'network':
                errorMessage = 'Errore di rete. Riprova.';
                break;
              default:
                errorMessage = `Errore: ${event.error}`;
            }
            
            setError(errorMessage);
            setState('error');
            reject(new Error(errorMessage));
          };
          
          recognition.onend = () => {
            console.log('🔚 [VoiceAI] Web Speech terminato');
          };
          
          recognition.start();
        });
      }
      
      throw new Error('Nessun servizio di trascrizione disponibile');
      
    } catch (err) {
      console.error('❌ [VoiceAI] Errore trascrizione:', err);
      const errorMessage = err instanceof Error ? err.message : 'Errore trascrizione audio';
      setError(errorMessage);
      setState('error');
      
      // Auto-reset dopo 5 secondi
      setTimeout(() => {
        setError(null);
        setState('idle');
      }, 5000);
    }
  }, [onTranscription]);

  // 🔊 Sintesi vocale
  const speakText = useCallback(async (text: string) => {
    if (isMuted) return;
    
    try {
      setState('speaking');
      onSpeaking?.(true);
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'it-IT';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      utterance.onend = () => {
        setState('idle');
        onSpeaking?.(false);
      };
      
      utterance.onerror = (event) => {
        console.error('❌ [VoiceAI] Errore sintesi vocale:', event.error);
        setState('idle');
        onSpeaking?.(false);
      };
      
      speechSynthesis.speak(utterance);
      
    } catch (error) {
      console.error('❌ [VoiceAI] Errore sintesi vocale:', error);
      setState('idle');
      onSpeaking?.(false);
    }
  }, [isMuted, onSpeaking]);

  // 🎯 Gestione click principale
  const handleMainClick = useCallback(async () => {
    if (disabled) return;
    
    if (state === 'listening') {
      stopRecording();
    } else if (state === 'speaking') {
      speechSynthesis.cancel();
      setState('idle');
      onSpeaking?.(false);
    } else if (state === 'error') {
      setError(null);
      setState('idle');
    } else {
      // Controlla permessi prima di iniziare
      const hasPermission = await checkMicrophonePermission();
      
      if (!hasPermission) {
        setShowModal(true);
        await detectMicrophones();
      } else {
        await startRecording();
      }
    }
  }, [disabled, state, stopRecording, onSpeaking, checkMicrophonePermission, detectMicrophones, startRecording]);

  // 🎯 Gestione hover tooltip
  const handleMouseEnter = useCallback(() => {
    if (!disabled) {
      setShowTooltip(true);
    }
  }, [disabled]);

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);

  // 🎯 Gestione permessi dal modal
  const handlePermissionGranted = useCallback(async () => {
    setShowModal(false);
    await startRecording();
  }, [startRecording]);

  // 🎯 Inizializzazione
  useEffect(() => {
    checkMicrophonePermission();
  }, [checkMicrophonePermission]);

  // 🎯 Cleanup
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

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
      case 'requesting_permission':
        return 'bg-blue-500 hover:bg-blue-600 text-white voice-processing';
      default:
        return 'bg-blue-500 hover:bg-blue-600 text-white';
    }
  };

  const getIcon = () => {
    switch (state) {
      case 'listening':
        return <MicOff className="w-5 h-5" />;
      case 'processing':
      case 'requesting_permission':
        return <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />;
      case 'speaking':
        return <Volume2 className="w-5 h-5" />;
      case 'error':
        return <Mic className="w-5 h-5" />;
      default:
        return <Mic className="w-5 h-5" />;
    }
  };

  const getTooltipText = () => {
    switch (state) {
      case 'listening':
        return 'Registrazione in corso... Clicca per fermare';
      case 'processing':
        return 'Elaborazione audio...';
      case 'speaking':
        return 'Urbanova sta parlando... Clicca per fermare';
      case 'error':
        return 'Errore Voice AI - Clicca per riprovare';
      case 'requesting_permission':
        return 'Richiesta permessi microfono...';
      default:
        return 'Usa modalità vocale';
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* 🎤 Bottone principale Voice AI */}
      <div className="relative">
        <button
          onClick={handleMainClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          disabled={disabled}
          className={cn(
            'voice-mic-button p-3 rounded-full',
            'hover:scale-105 active:scale-95',
            'focus:outline-none focus:ring-2 focus:ring-blue-300',
            getButtonStyle(),
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          title={getTooltipText()}
          aria-label={getTooltipText()}
        >
          {getIcon()}
        </button>

        {/* 🎯 Tooltip stile ChatGPT */}
        {showTooltip && !disabled && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 animate-fade-in whitespace-nowrap z-50">
            {getTooltipText()}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        )}
      </div>

      {/* 🔊 Bottone mute/unmute */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className={cn(
          'p-2 rounded-full transition-colors',
          isMuted ? 'bg-gray-200 text-gray-500' : 'bg-blue-100 text-blue-600 hover:bg-blue-200',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        disabled={disabled}
        title={isMuted ? 'Riattiva audio' : 'Disattiva audio'}
        aria-label={isMuted ? 'Riattiva audio' : 'Disattiva audio'}
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>

      {/* 📝 Testo trascritto */}
      {transcribedText && (
        <div className="voice-transcription max-w-xs">
          {transcribedText}
        </div>
      )}

      {/* ❌ Messaggio di errore */}
      {error && (
        <div className="text-xs text-red-500 max-w-32 truncate">
          {error}
        </div>
      )}

      {/* 🎤 Modal permessi microfono stile ChatGPT */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Permessi microfono
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Urbanova vorrebbe utilizzare il microfono per la modalità vocale.
            </p>
            
            {/* Selezione microfono */}
            {microphones.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleziona microfono:
                </label>
                <select
                  value={selectedMicrophone}
                  onChange={(e) => setSelectedMicrophone(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {microphones.map((mic) => (
                    <option key={mic.deviceId} value={mic.deviceId}>
                      {mic.label} {mic.isDefault ? '(Predefinito)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Indicatore livello audio */}
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-gray-500" />
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-100 ${
                      audioLevel > 0.7 ? 'bg-red-500' : 
                      audioLevel > 0.4 ? 'bg-yellow-500' : 
                      audioLevel > 0.1 ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                    style={{ width: `${Math.max(audioLevel * 100, 5)}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500">
                  {Math.round(audioLevel * 100)}%
                </span>
              </div>
            </div>
            
            {/* Pulsanti azione */}
            <div className="flex gap-3">
              <button
                onClick={requestMicrophonePermission}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Consenti durante la visita
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Non consentire mai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook per gestire stato Voice AI
export function useVoiceAI() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const handleTranscription = useCallback((text: string) => {
    console.log('🎤 [useVoiceAI] Trascrizione ricevuta:', text);
    setIsTranscribing(false);
  }, []);

  const handleSpeaking = useCallback((speaking: boolean) => {
    console.log('🔊 [useVoiceAI] Stato speaking:', speaking);
    setIsSpeaking(speaking);
  }, []);

  return {
    isSpeaking,
    isTranscribing,
    handleTranscription,
    handleSpeaking,
  };
}
