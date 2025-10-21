// 👤 USER PROFILING SYSTEM - Apprendimento automatico preferenze utente
// Simile a come Cursor apprende le preferenze dello sviluppatore

import { db } from '../../lib/firebase';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';

// ============================================================================
// TYPES
// ============================================================================

export interface UserProfile {
  userId: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Preferenze Progettuali
  preferenze: {
    tipoProgetti: string[]; // ["luxury", "affordable", "commercial", "mixed"]
    zoneGeografiche: string[]; // ["Milano", "Roma", "Firenze"]
    budgetRange: {
      min: number;
      max: number;
    };
    riskTolerance: 'low' | 'medium' | 'high';
    focusMetrics: string[]; // ["ROI", "IRR", "payback", "NPV"]
  };
  
  // Storico Interazioni
  storico: {
    progettiCreati: number;
    analisiEseguite: number;
    businessPlanCreati: number;
    strumentiPreferiti: string[]; // Tool più usati
    orariPicco: string[]; // Fasce orarie di uso
    giorniPicco: string[]; // Giorni della settimana
  };
  
  // Personalità Comunicativa
  personalita: {
    livelloTecnico: 'principiante' | 'intermedio' | 'esperto';
    stileComunicazione: 'formale' | 'casual' | 'tecnico';
    velocitaDecisione: 'veloce' | 'ponderato' | 'molto_ponderato';
    dettaglioPreferito: 'minimo' | 'medio' | 'massimo';
  };
  
  // Pattern Comportamentali
  pattern: {
    cambiaIdeaSpesso: boolean; // Come Laura
    multiProgettoSimultaneo: boolean; // Come Sofia
    inputMinimali: boolean; // Come Chiara
    emotivo: boolean; // Come Valentina
    speedOriented: boolean; // Come Francesco
  };
  
  // Apprendimenti Chiave
  apprendimenti: Array<{
    tipo: 'preferenza' | 'problema' | 'successo';
    descrizione: string;
    timestamp: Date;
    confidence: number; // 0-1
  }>;
}

// ============================================================================
// USER PROFILING SYSTEM
// ============================================================================

export class UserProfilingSystem {
  private profilesCache: Map<string, UserProfile> = new Map();
  
  /**
   * Carica o crea profilo utente
   */
  async loadUserProfile(userId: string, email: string): Promise<UserProfile> {
    try {
      // Check cache
      if (this.profilesCache.has(userId)) {
        return this.profilesCache.get(userId)!;
      }

      // Carica da Firestore
      const profileRef = doc(collection(db, 'os2_user_profiles'), userId);
      const profileDoc = await getDoc(profileRef);

      if (profileDoc.exists()) {
        const profile = profileDoc.data() as UserProfile;
        this.profilesCache.set(userId, profile);
        console.log(`✅ [UserProfile] Caricato profilo per ${userId}`);
        return profile;
      }

      // Crea nuovo profilo
      const newProfile: UserProfile = {
        userId,
        email,
        createdAt: new Date(),
        updatedAt: new Date(),
        preferenze: {
          tipoProgetti: [],
          zoneGeografiche: [],
          budgetRange: { min: 0, max: 10000000 },
          riskTolerance: 'medium',
          focusMetrics: ['ROI', 'IRR'],
        },
        storico: {
          progettiCreati: 0,
          analisiEseguite: 0,
          businessPlanCreati: 0,
          strumentiPreferiti: [],
          orariPicco: [],
          giorniPicco: [],
        },
        personalita: {
          livelloTecnico: 'intermedio',
          stileComunicazione: 'casual',
          velocitaDecisione: 'ponderato',
          dettaglioPreferito: 'medio',
        },
        pattern: {
          cambiaIdeaSpesso: false,
          multiProgettoSimultaneo: false,
          inputMinimali: false,
          emotivo: false,
          speedOriented: false,
        },
        apprendimenti: [],
      };

      await setDoc(profileRef, newProfile);
      this.profilesCache.set(userId, newProfile);
      console.log(`✅ [UserProfile] Creato nuovo profilo per ${userId}`);
      
      return newProfile;
    } catch (error) {
      console.error('❌ [UserProfile] Errore caricamento profilo:', error);
      
      // Fallback profilo vuoto
      return {
        userId,
        email,
        createdAt: new Date(),
        updatedAt: new Date(),
        preferenze: {
          tipoProgetti: [],
          zoneGeografiche: [],
          budgetRange: { min: 0, max: 10000000 },
          riskTolerance: 'medium',
          focusMetrics: ['ROI'],
        },
        storico: {
          progettiCreati: 0,
          analisiEseguite: 0,
          businessPlanCreati: 0,
          strumentiPreferiti: [],
          orariPicco: [],
          giorniPicco: [],
        },
        personalita: {
          livelloTecnico: 'intermedio',
          stileComunicazione: 'casual',
          velocitaDecisione: 'ponderato',
          dettaglioPreferito: 'medio',
        },
        pattern: {
          cambiaIdeaSpesso: false,
          multiProgettoSimultaneo: false,
          inputMinimali: false,
          emotivo: false,
          speedOriented: false,
        },
        apprendimenti: [],
      };
    }
  }

  /**
   * Aggiorna profilo con nuove osservazioni
   */
  async updateProfile(
    userId: string,
    observations: {
      toolUsato?: string;
      zonaGeografica?: string;
      tipoProgetto?: string;
      inputLength?: number;
      cambioIdea?: boolean;
      veloce?: boolean;
      emotivo?: boolean;
    }
  ): Promise<void> {
    try {
      const profile = await this.loadUserProfile(userId, '');
      let updated = false;

      // Aggiorna preferenze geografiche
      if (observations.zonaGeografica) {
        if (!profile.preferenze.zoneGeografiche.includes(observations.zonaGeografica)) {
          profile.preferenze.zoneGeografiche.push(observations.zonaGeografica);
          updated = true;
        }
      }

      // Aggiorna tipo progetti
      if (observations.tipoProgetto) {
        if (!profile.preferenze.tipoProgetti.includes(observations.tipoProgetto)) {
          profile.preferenze.tipoProgetti.push(observations.tipoProgetto);
          updated = true;
        }
      }

      // Aggiorna strumenti preferiti
      if (observations.toolUsato) {
        const idx = profile.storico.strumentiPreferiti.indexOf(observations.toolUsato);
        if (idx === -1) {
          profile.storico.strumentiPreferiti.push(observations.toolUsato);
        }
        
        // Incrementa counter tool specifico
        if (observations.toolUsato === 'feasibility.analyze') {
          profile.storico.analisiEseguite++;
        } else if (observations.toolUsato === 'business_plan.calculate') {
          profile.storico.businessPlanCreati++;
        }
        updated = true;
      }

      // Identifica pattern comportamentali
      if (observations.inputLength !== undefined && observations.inputLength < 20) {
        profile.pattern.inputMinimali = true;
        updated = true;
      }

      if (observations.cambioIdea) {
        profile.pattern.cambiaIdeaSpesso = true;
        updated = true;
      }

      if (observations.veloce) {
        profile.pattern.speedOriented = true;
        profile.personalita.velocitaDecisione = 'veloce';
        updated = true;
      }

      if (observations.emotivo) {
        profile.pattern.emotivo = true;
        updated = true;
      }

      // Salva se modificato
      if (updated) {
        profile.updatedAt = new Date();
        
        const profileRef = doc(collection(db, 'os2_user_profiles'), userId);
        const cleanProfile = Object.fromEntries(
          Object.entries(profile).filter(([_, v]) => v !== undefined)
        );
        
        await setDoc(profileRef, cleanProfile);
        this.profilesCache.set(userId, profile);
        
        console.log(`✅ [UserProfile] Aggiornato profilo ${userId}`);
      }
    } catch (error) {
      console.error('❌ [UserProfile] Errore aggiornamento profilo:', error);
      // Non bloccare per errori profiling
    }
  }

  /**
   * Genera suggerimenti personalizzati basati su profilo
   */
  generatePersonalizedSuggestions(profile: UserProfile): string {
    const suggestions: string[] = [];

    // Basato su storico
    if (profile.storico.analisiEseguite > profile.storico.businessPlanCreati * 2) {
      suggestions.push("💡 Hai fatto molte analisi. Vuoi che trasformi qualcuna in business plan?");
    }

    // Basato su zone preferite
    if (profile.preferenze.zoneGeografiche.length > 0) {
      const zone = profile.preferenze.zoneGeografiche.slice(0, 3).join(', ');
      suggestions.push(`🌍 Vedo che operi principalmente in: ${zone}`);
    }

    // Basato su pattern
    if (profile.pattern.speedOriented) {
      suggestions.push("⚡ Procedo velocemente come piace a te");
    }

    if (profile.pattern.emotivo) {
      suggestions.push("💚 Capisco quanto sia importante per te questo progetto");
    }

    return suggestions.join('\n');
  }

  /**
   * Adatta stile comunicazione al profilo
   */
  adaptCommunicationStyle(profile: UserProfile): {
    detailLevel: 'low' | 'medium' | 'high';
    tone: 'formal' | 'casual' | 'technical';
    speedHints: boolean;
  } {
    return {
      detailLevel: profile.personalita.dettaglioPreferito === 'minimo' ? 'low' : 
                   profile.personalita.dettaglioPreferito === 'massimo' ? 'high' : 'medium',
      tone: profile.personalita.stileComunicazione,
      speedHints: profile.pattern.speedOriented,
    };
  }
}

