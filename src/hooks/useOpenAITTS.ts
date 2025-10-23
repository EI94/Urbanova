// 🎤 REACT HOOK PER OPENAI TTS
// Hook per utilizzare OpenAI TTS nel frontend

import { useState, useCallback, useRef } from 'react';

export interface TTSOptions {
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed?: number;
  hd?: boolean;
}

export interface TTSState {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  currentVoice: string;
  duration: number;
}

export interface VoiceInfo {
  id: string;
  name: string;
  description: string;
  gender: string;
}

export function useOpenAITTS() {
  const [state, setState] = useState<TTSState>({
    isPlaying: false,
    isLoading: false,
    error: null,
    currentVoice: 'nova',
    duration: 0
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioRef = useRef<string | null>(null);

  /**
   * Sintetizza testo in audio usando OpenAI TTS
   */
  const synthesize = useCallback(async (text: string, options: TTSOptions = {}) => {
    if (!text.trim()) {
      setState(prev => ({ ...prev, error: 'Testo vuoto' }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null 
    }));

    try {
      console.log(`🎤 [TTS Hook] Sintetizzando: "${text.substring(0, 50)}..."`);

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice: options.voice || 'nova',
          speed: options.speed || 1.0,
          hd: options.hd || false
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore sintesi vocale');
      }

      const data = await response.json();
      
      // Crea blob audio dal base64
      const audioBlob = new Blob([
        Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))
      ], { type: 'audio/mp3' });

      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Ferma audio precedente se in riproduzione
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // Crea nuovo elemento audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      currentAudioRef.current = text;

      // Event listeners
      audio.onloadstart = () => {
        console.log('🎤 [TTS Hook] Caricamento audio iniziato');
      };

      audio.oncanplay = () => {
        console.log('🎤 [TTS Hook] Audio pronto per riproduzione');
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          duration: data.duration,
          currentVoice: data.voice
        }));
      };

      audio.onplay = () => {
        console.log('🎤 [TTS Hook] Riproduzione iniziata');
        setState(prev => ({ ...prev, isPlaying: true }));
      };

      audio.onpause = () => {
        console.log('🎤 [TTS Hook] Riproduzione in pausa');
        setState(prev => ({ ...prev, isPlaying: false }));
      };

      audio.onended = () => {
        console.log('🎤 [TTS Hook] Riproduzione completata');
        setState(prev => ({ ...prev, isPlaying: false }));
        URL.revokeObjectURL(audioUrl); // Cleanup
      };

      audio.onerror = (event) => {
        console.error('❌ [TTS Hook] Errore riproduzione audio:', event);
        setState(prev => ({ 
          ...prev, 
          isPlaying: false, 
          isLoading: false,
          error: 'Errore riproduzione audio'
        }));
      };

      // Avvia riproduzione automatica
      await audio.play();

    } catch (error) {
      console.error('❌ [TTS Hook] Errore sintesi:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      }));
    }
  }, []);

  /**
   * Ferma la riproduzione corrente
   */
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  }, []);

  /**
   * Pausa/riprende la riproduzione
   */
  const toggle = useCallback(async () => {
    if (!audioRef.current) return;

    if (state.isPlaying) {
      audioRef.current.pause();
    } else {
      try {
        await audioRef.current.play();
      } catch (error) {
        console.error('❌ [TTS Hook] Errore riproduzione:', error);
        setState(prev => ({ ...prev, error: 'Errore riproduzione' }));
      }
    }
  }, [state.isPlaying]);

  /**
   * Ottiene le voci disponibili
   */
  const getVoices = useCallback(async (): Promise<VoiceInfo[]> => {
    try {
      const response = await fetch('/api/tts');
      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('❌ [TTS Hook] Errore recupero voci:', error);
      return [];
    }
  }, []);

  return {
    ...state,
    synthesize,
    stop,
    toggle,
    getVoices
  };
}
