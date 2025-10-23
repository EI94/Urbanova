// 🎤 OPENAI TTS SERVICE - Servizio Text-to-Speech di alta qualità
// Utilizza OpenAI TTS per voci naturali invece del browser speechSynthesis

import OpenAI from 'openai';

export interface TTSOptions {
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed?: number; // 0.25 - 4.0
  format?: 'mp3' | 'opus' | 'aac' | 'flac';
}

export interface TTSResult {
  audioBuffer: ArrayBuffer;
  duration: number;
  voice: string;
}

export class OpenAITTS {
  private openai: OpenAI;
  private defaultOptions: TTSOptions = {
    voice: 'nova', // Voce femminile giovane e naturale per italiano
    speed: 1.0,
    format: 'mp3'
  };

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: false // Solo per server-side
    });
  }

  /**
   * Converte testo in audio usando OpenAI TTS
   */
  async synthesize(text: string, options: Partial<TTSOptions> = {}): Promise<TTSResult> {
    const opts = { ...this.defaultOptions, ...options };
    
    console.log(`🎤 [OpenAI TTS] Sintetizzando: "${text.substring(0, 50)}..." con voce ${opts.voice}`);
    
    try {
      const response = await this.openai.audio.speech.create({
        model: 'tts-1', // Modello base (più veloce)
        voice: opts.voice!,
        input: text,
        speed: opts.speed,
        response_format: opts.format
      });

      const audioBuffer = await response.arrayBuffer();
      
      console.log(`✅ [OpenAI TTS] Audio generato: ${audioBuffer.byteLength} bytes`);
      
      return {
        audioBuffer,
        duration: this.estimateDuration(text, opts.speed!),
        voice: opts.voice!
      };
    } catch (error) {
      console.error('❌ [OpenAI TTS] Errore sintesi:', error);
      throw new Error(`Errore sintesi vocale: ${error}`);
    }
  }

  /**
   * Converte testo in audio usando OpenAI TTS HD (qualità superiore)
   */
  async synthesizeHD(text: string, options: Partial<TTSOptions> = {}): Promise<TTSResult> {
    const opts = { ...this.defaultOptions, ...options };
    
    console.log(`🎤 [OpenAI TTS HD] Sintetizzando HD: "${text.substring(0, 50)}..." con voce ${opts.voice}`);
    
    try {
      const response = await this.openai.audio.speech.create({
        model: 'tts-1-hd', // Modello HD (qualità superiore)
        voice: opts.voice!,
        input: text,
        speed: opts.speed,
        response_format: opts.format
      });

      const audioBuffer = await response.arrayBuffer();
      
      console.log(`✅ [OpenAI TTS HD] Audio HD generato: ${audioBuffer.byteLength} bytes`);
      
      return {
        audioBuffer,
        duration: this.estimateDuration(text, opts.speed!),
        voice: opts.voice!
      };
    } catch (error) {
      console.error('❌ [OpenAI TTS HD] Errore sintesi HD:', error);
      throw new Error(`Errore sintesi vocale HD: ${error}`);
    }
  }

  /**
   * Stima la durata dell'audio basata sul testo e velocità
   */
  private estimateDuration(text: string, speed: number): number {
    // Stima: ~150 parole al minuto per velocità 1.0
    const wordsPerMinute = 150 * speed;
    const wordCount = text.split(/\s+/).length;
    return (wordCount / wordsPerMinute) * 60; // in secondi
  }

  /**
   * Ottiene le voci disponibili
   */
  getAvailableVoices(): Array<{ id: string; name: string; description: string; gender: string }> {
    return [
      { id: 'alloy', name: 'Alloy', description: 'Voce neutra e professionale', gender: 'neutro' },
      { id: 'echo', name: 'Echo', description: 'Voce maschile calda e rassicurante', gender: 'maschile' },
      { id: 'fable', name: 'Fable', description: 'Voce femminile elegante e sofisticata', gender: 'femminile' },
      { id: 'onyx', name: 'Onyx', description: 'Voce maschile profonda e autorevole', gender: 'maschile' },
      { id: 'nova', name: 'Nova', description: 'Voce femminile giovane e naturale', gender: 'femminile' },
      { id: 'shimmer', name: 'Shimmer', description: 'Voce femminile dolce e melodiosa', gender: 'femminile' }
    ];
  }

  /**
   * Ottiene la voce consigliata per italiano
   */
  getRecommendedVoiceForItalian(): string {
    // Nova è ottima per italiano: giovane, naturale, chiara
    return 'nova';
  }
}

// Singleton instance
let ttsInstance: OpenAITTS | null = null;

export function getOpenAITTS(): OpenAITTS {
  if (!ttsInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY non configurata');
    }
    ttsInstance = new OpenAITTS(apiKey);
  }
  return ttsInstance;
}
