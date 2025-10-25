'use client';

// 🎤 VOICE AI CHATGPT STYLE - Design Johnny Ive
// Esperienza identica a ChatGPT con permessi nativi browser e overlay fluido

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoiceModeOverlay } from '@/components/ui/VoiceModeOverlay';

interface VoiceAIChatGPTProps {
  onTranscription?: (text: string) => void;
  onSpeaking?: (isSpeaking: boolean) => void;
  disabled?: boolean;
  className?: string;
}

type VoiceAIState = 'idle' | 'requesting_permission' | 'listening' | 'processing' | 'speaking' | 'error';

// 🎤 INTERFACCIA SEMPLIFICATA - Solo permessi nativi browser

export function VoiceAIChatGPT({ 
  onTranscription, 
  onSpeaking, 
  disabled = false,
  className 
}: VoiceAIChatGPTProps) {
  
  const [state, setState] = useState<VoiceAIState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [audioLevel, setAudioLevel] = useState<number>(0); // 🎤 Livello audio in tempo reale
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false); // 🎨 Overlay Johnny Ive
  const [isVoiceModeActive, setIsVoiceModeActive] = useState(false); // 🎯 Modalità voce attiva

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // 🎯 Gestione click principale - SOLO PERMESSI NATIVI BROWSER
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
      // 🚀 DIRETTO ALLA REGISTRAZIONE - Il browser gestirà i permessi
      await startRecording();
    }
  }, [disabled, state, stopRecording, onSpeaking, startRecording]);

  // 🎤 Avvia registrazione audio con rilevamento automatico fine parlato
  const startRecording = useCallback(async () => {
    try {
      setState('listening');
      setError(null);
      setShowVoiceOverlay(true); // 🎨 Mostra overlay Johnny Ive
      setIsVoiceModeActive(true); // 🎯 Attiva modalità voce
      
      // 🚀 PERMESSI NATIVI BROWSER - Nessuna modal custom
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      streamRef.current = stream;
      
      // 🎤 SETUP AUDIO CONTEXT PER RILEVAMENTO SILENZIO
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      // 🎯 RILEVAMENTO AUTOMATICO FINE PARLATO
      let isSpeaking = false;
      let silenceStartTime = 0;
      const SILENCE_THRESHOLD = 0.01; // Soglia silenzio
      const SILENCE_DURATION = 2000; // 2 secondi di silenzio per fermare
      
      const checkAudioLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        const normalizedLevel = Math.min(average / 128, 1);
        
        setAudioLevel(normalizedLevel);
        
        if (normalizedLevel > SILENCE_THRESHOLD) {
          // 🎤 UTENTE STA PARLANDO
          isSpeaking = true;
          silenceStartTime = 0;
          
          // Cancella timeout silenzio
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = null;
          }
        } else if (isSpeaking) {
          // 🔇 SILENZIO RILEVATO
          if (silenceStartTime === 0) {
            silenceStartTime = Date.now();
          }
          
          const silenceDuration = Date.now() - silenceStartTime;
          
          if (silenceDuration >= SILENCE_DURATION) {
            // 🛑 FERMA AUTOMATICAMENTE DOPO SILENZIO
            console.log('🔇 [VoiceAI] Silenzio rilevato, fermando registrazione...');
            stopRecording();
            return;
          }
        }
        
        if (stream.active) {
          requestAnimationFrame(checkAudioLevel);
        }
      };
      
      checkAudioLevel();
      
      // 🎤 SETUP MEDIA RECORDER
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
      console.log('🎤 [VoiceAI] Registrazione avviata con rilevamento automatico fine parlato');
      
    } catch (error) {
      console.error('❌ [VoiceAI] Errore avvio registrazione:', error);
      setState('error');
      setError('Errore durante l\'avvio della registrazione');
      setShowVoiceOverlay(false);
      setIsVoiceModeActive(false);
      
      // 🎯 GESTIONE ERRORI PERMESSI NATIVI
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setError('Permessi microfono negati. Abilita l\'accesso al microfono nelle impostazioni del browser.');
        } else if (error.name === 'NotFoundError') {
          setError('Nessun microfono trovato. Collega un microfono e riprova.');
        } else {
          setError(`Errore microfono: ${error.message}`);
        }
      }
    }
  }, []);

  // 🛑 Ferma registrazione
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      console.log('🛑 [VoiceAI] Registrazione fermata');
    }
    
    // 🧹 CLEANUP AUDIO CONTEXT
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // 🧹 CLEANUP TIMEOUT SILENZIO
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
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
            
            // 🚀 AI NATIVE: INVIO DIRETTO E RISPOSTA VOCALE IMMEDIATA
            console.log('🚀 [VoiceAI] Auto-invio messaggio trascritto:', transcribedText);
            onTranscription?.(transcribedText);
            
            // 🎯 GENERA RISPOSTA VOCALE IMMEDIATA
            setTimeout(async () => {
              await generateVoiceResponse(transcribedText);
            }, 300); // Ridotto da 500ms a 300ms per velocità
            
            // 🔄 RIMANI IN MODALITÀ VOCE - Non chiudere overlay
            setState('processing');
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
            
            // 🚀 AI NATIVE: INVIO DIRETTO E RISPOSTA VOCALE IMMEDIATA
            console.log('🚀 [VoiceAI] Auto-invio messaggio trascritto:', transcript);
            onTranscription?.(transcript);
            
            // 🎯 GENERA RISPOSTA VOCALE IMMEDIATA
            setTimeout(async () => {
              await generateVoiceResponse(transcript);
            }, 300); // Ridotto da 500ms a 300ms per velocità
            
            // 🔄 RIMANI IN MODALITÀ VOCE - Non chiudere overlay
            setState('processing');
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


  // 🎯 Gestione hover tooltip
  const handleMouseEnter = useCallback(() => {
    if (!disabled) {
      setShowTooltip(true);
    }
  }, [disabled]);

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);

  // 🎯 Genera risposta vocale immediata (AI Native)
  const generateVoiceResponse = useCallback(async (userMessage: string) => {
    try {
      console.log('🎯 [VoiceAI] Generando risposta vocale per:', userMessage);
      
      // 🚀 SIMULAZIONE RISPOSTA IMMEDIATA (da sostituire con API reale)
      const responses = [
        "Ho capito perfettamente quello che hai detto. Come posso aiutarti?",
        "Interessante! Dimmi di più su quello che hai in mente.",
        "Perfetto, ho ascoltato la tua richiesta. Procedo subito.",
        "Capito! Sto elaborando la tua domanda.",
        "Ottimo! Ho ricevuto il tuo messaggio. Ecco la mia risposta."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      // 🎤 SINTESI VOCALE IMMEDIATA
      const utterance = new SpeechSynthesisUtterance(randomResponse);
      utterance.lang = 'it-IT';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onstart = () => {
        console.log('🎤 [VoiceAI] Inizio sintesi vocale');
        setState('speaking');
        onSpeaking?.(true);
      };
      
      utterance.onend = () => {
        console.log('🎤 [VoiceAI] Fine sintesi vocale');
        setState('idle');
        onSpeaking?.(false);
        
        // 🔄 RIMANI IN MODALITÀ VOCE PER PROSSIMA INTERAZIONE
        setTimeout(() => {
          console.log('🔄 [VoiceAI] Pronto per prossima registrazione');
          setState('idle');
          // Non chiudere overlay, rimani in modalità voce
        }, 500);
      };
      
      utterance.onerror = (event) => {
        console.error('❌ [VoiceAI] Errore sintesi vocale:', event.error);
        setState('error');
        setError('Errore durante la sintesi vocale');
      };
      
      speechSynthesis.speak(utterance);
      
    } catch (error) {
      console.error('❌ [VoiceAI] Errore generazione risposta:', error);
      setState('error');
      setError('Errore durante la generazione della risposta');
    }
  }, [onSpeaking]);

  // 🚪 Esci dalla modalità voce
  const exitVoiceMode = useCallback(() => {
    console.log('🚪 [VoiceAI] Uscita dalla modalità voce');
    setIsVoiceModeActive(false);
    setShowVoiceOverlay(false);
    setTranscribedText('');
    setState('idle');
    
    // Ferma eventuali registrazioni o sintesi in corso
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      stopRecording();
    }
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
  }, [stopRecording]);

  // 🎯 Cleanup
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
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

      {/* 🎨 OVERLAY JOHNNY IVE - Modalità Voce */}
      <VoiceModeOverlay
        isOpen={showVoiceOverlay}
        onClose={() => setShowVoiceOverlay(false)}
        isListening={state === 'listening'}
        isSpeaking={state === 'speaking'}
        isProcessing={state === 'processing'}
        transcribedText={transcribedText}
        audioLevel={audioLevel}
        onToggleMute={() => setIsMuted(!isMuted)}
        isMuted={isMuted}
        onExitVoiceMode={exitVoiceMode}
      />
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
