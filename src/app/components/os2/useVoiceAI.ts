'use client';

// 🔍 DEBUG TDZ: Log immediato per capire quando questo file viene valutato
console.log(`🔍 [TDZ DEBUG] useVoiceAI.ts MODULO IMPORTATO - timestamp: ${Date.now()}, typeof window: ${typeof window}, stack:`, new Error().stack?.split('\n').slice(1, 5).join('\n'));

import { useState, useCallback } from 'react';

console.log(`🔍 [TDZ DEBUG] useVoiceAI.ts - React importato, timestamp: ${Date.now()}`);

// Hook per gestire stato Voice AI
export function useVoiceAI() {
  console.log(`🔍 [TDZ DEBUG] useVoiceAI() HOOK CHIAMATO - timestamp: ${Date.now()}`);
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
