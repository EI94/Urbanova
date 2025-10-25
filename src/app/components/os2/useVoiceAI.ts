'use client';

import { useState, useCallback } from 'react';

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
