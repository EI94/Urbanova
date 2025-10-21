// 🛡️ GUARDRAILS SYSTEM - Sistema di sicurezza e controllo per OS 2.0 Smart
// Guardrails multipli per sicurezza, compliance e qualità delle risposte

import { OpenAI } from 'openai';
import { URBANOVA_PARAHELP_TEMPLATE } from './ParaHelpTemplate';

export interface GuardrailResult {
  passed: boolean;
  score: number; // 0-1, dove 1 è perfetto
  violations: GuardrailViolation[];
  recommendations: string[];
}

export interface GuardrailViolation {
  type: 'safety' | 'privacy' | 'compliance' | 'quality' | 'ethical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  suggestion?: string;
}

export interface GuardrailContext {
  userMessage: string;
  assistantResponse?: string;
  functionCalls?: any[];
  userContext: {
    userId: string;
    userRoles: string[];
    projectId?: string;
  };
  conversationHistory: any[];
}

/**
 * Sistema di Guardrails per Urbanova OS 2.0 Smart
 */
export class GuardrailsSystem {
  private openai: OpenAI;
  private template = URBANOVA_PARAHELP_TEMPLATE;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Esegue tutti i guardrails su una risposta
   */
  async validateResponse(context: GuardrailContext): Promise<GuardrailResult> {
    try {
      console.log('🛡️ [Guardrails] Validando risposta...');

      const results = await Promise.all([
        this.contentModerationGuardrail(context),
        this.serviceExclusionsGuardrail(context),
        this.aiDisclosurePreventionGuardrail(context),
        this.meaningfulConversationGuardrail(context),
        this.privacyProtectionGuardrail(context),
        this.complianceGuardrail(context),
      ]);

      // Combina risultati
      const allViolations = results.flatMap(r => r.violations);
      const allRecommendations = results.flatMap(r => r.recommendations);
      const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;

      const passed = allViolations.filter(v => v.severity === 'critical').length === 0;

      console.log(`✅ [Guardrails] Validazione completata: ${passed ? 'PASSED' : 'FAILED'} (score: ${averageScore.toFixed(2)})`);

      return {
        passed,
        score: averageScore,
        violations: allViolations,
        recommendations: allRecommendations,
      };

    } catch (error) {
      console.error('❌ [Guardrails] Errore validazione:', error);
      
      return {
        passed: false,
        score: 0,
        violations: [{
          type: 'safety',
          severity: 'critical',
          message: 'Errore nel sistema di guardrails',
        }],
        recommendations: ['Contattare il supporto tecnico'],
      };
    }
  }

  /**
   * Guardrail 1: Content Moderation
   */
  private async contentModerationGuardrail(context: GuardrailContext): Promise<GuardrailResult> {
    const violations: GuardrailViolation[] = [];
    const recommendations: string[] = [];

    try {
      // Controlla contenuto offensivo o inappropriato
      const moderationPrompt = `Analizza questo contenuto per contenuti offensivi, inappropriati o non professionali:

Messaggio utente: "${context.userMessage}"
Risposta assistente: "${context.assistantResponse || 'N/A'}"

Controlla per:
- Linguaggio offensivo o inappropriato
- Contenuti non professionali
- Informazioni false o fuorvianti
- Raccomandazioni non qualificate

Rispondi solo con: SAFE o UNSAFE seguito da una breve spiegazione.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: moderationPrompt }],
        max_tokens: 100,
        temperature: 0,
      });

      const result = response.choices[0].message.content || '';
      
      if (result.includes('UNSAFE')) {
        violations.push({
          type: 'safety',
          severity: 'high',
          message: 'Contenuto inappropriato rilevato',
          suggestion: 'Riformulare la risposta in modo professionale',
        });
      }

    } catch (error) {
      console.error('❌ [Guardrails] Errore content moderation:', error);
    }

    return {
      passed: violations.length === 0,
      score: violations.length === 0 ? 1 : 0.3,
      violations,
      recommendations,
    };
  }

  /**
   * Guardrail 2: Service Exclusions
   */
  private serviceExclusionsGuardrail(context: GuardrailContext): Promise<GuardrailResult> {
    const violations: GuardrailViolation[] = [];
    const recommendations: string[] = [];

    // Controlla azioni proibite
    const forbiddenActions = this.template.exclusions.forbidden_actions;
    
    if (context.functionCalls) {
      for (const functionCall of context.functionCalls) {
        if (forbiddenActions.includes(functionCall.name)) {
          violations.push({
            type: 'compliance',
            severity: 'critical',
            message: `Azione proibita: ${functionCall.name}`,
            suggestion: 'Utilizzare alternative permesse',
          });
        }
      }
    }

    // Controlla accesso a dati ristretti
    const restrictedData = this.template.exclusions.restricted_data_access;
    const messageText = `${context.userMessage} ${context.assistantResponse || ''}`.toLowerCase();
    
    for (const dataType of restrictedData) {
      if (messageText.includes(dataType.replace('_', ' '))) {
        violations.push({
          type: 'privacy',
          severity: 'high',
          message: `Tentativo di accesso a dati ristretti: ${dataType}`,
          suggestion: 'Non accedere a dati sensibili senza autorizzazione',
        });
      }
    }

    return Promise.resolve({
      passed: violations.length === 0,
      score: violations.length === 0 ? 1 : 0.2,
      violations,
      recommendations,
    });
  }

  /**
   * Guardrail 3: AI Disclosure Prevention
   */
  private async aiDisclosurePreventionGuardrail(context: GuardrailContext): Promise<GuardrailResult> {
    const violations: GuardrailViolation[] = [];
    const recommendations: string[] = [];

    // Controlla se la risposta rivela troppo sulla natura AI
    const aiKeywords = [
      'sono un ai', 'sono un\'ai', 'sono artificiale', 'sono un bot',
      'come modello di linguaggio', 'come ai', 'come assistente virtuale'
    ];

    const responseText = (context.assistantResponse || '').toLowerCase();
    
    for (const keyword of aiKeywords) {
      if (responseText.includes(keyword)) {
        violations.push({
          type: 'quality',
          severity: 'medium',
          message: 'Rivelazione eccessiva della natura AI',
          suggestion: 'Mantenere un tono più naturale e professionale',
        });
        break;
      }
    }

    return {
      passed: violations.length === 0,
      score: violations.length === 0 ? 1 : 0.7,
      violations,
      recommendations,
    };
  }

  /**
   * Guardrail 4: Meaningful Conversation
   */
  private async meaningfulConversationGuardrail(context: GuardrailContext): Promise<GuardrailResult> {
    const violations: GuardrailViolation[] = [];
    const recommendations: string[] = [];

    try {
      // Controlla se la risposta è significativa e utile
      const meaningfulPrompt = `Valuta se questa risposta è significativa e utile per uno sviluppatore immobiliare:

Messaggio utente: "${context.userMessage}"
Risposta assistente: "${context.assistantResponse || 'N/A'}"

Controlla per:
- Risposta troppo generica o vaga
- Mancanza di informazioni concrete
- Risposta non correlata alla domanda
- Suggerimenti non pratici

Rispondi solo con: MEANINGFUL o NOT_MEANINGFUL seguito da una breve spiegazione.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: meaningfulPrompt }],
        max_tokens: 100,
        temperature: 0,
      });

      const result = response.choices[0].message.content || '';
      
      if (result.includes('NOT_MEANINGFUL')) {
        violations.push({
          type: 'quality',
          severity: 'medium',
          message: 'Risposta non sufficientemente significativa',
          suggestion: 'Fornire informazioni più concrete e pratiche',
        });
      }

    } catch (error) {
      console.error('❌ [Guardrails] Errore meaningful conversation:', error);
    }

    return {
      passed: violations.length === 0,
      score: violations.length === 0 ? 1 : 0.5,
      violations,
      recommendations,
    };
  }

  /**
   * Guardrail 5: Privacy Protection
   */
  private privacyProtectionGuardrail(context: GuardrailContext): Promise<GuardrailResult> {
    const violations: GuardrailViolation[] = [];
    const recommendations: string[] = [];

    // Controlla dati sensibili nel messaggio utente
    const sensitivePatterns = [
      /\b\d{16}\b/g, // Carte di credito
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
      /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
      /\b\d{11}\b/g, // Codici fiscali italiani
    ];

    const messageText = context.userMessage;
    
    for (const pattern of sensitivePatterns) {
      if (pattern.test(messageText)) {
        violations.push({
          type: 'privacy',
          severity: 'high',
          message: 'Dati sensibili rilevati nel messaggio',
          suggestion: 'Non elaborare o memorizzare dati sensibili',
        });
        break;
      }
    }

    return Promise.resolve({
      passed: violations.length === 0,
      score: violations.length === 0 ? 1 : 0.3,
      violations,
      recommendations,
    });
  }

  /**
   * Guardrail 6: Compliance
   */
  private complianceGuardrail(context: GuardrailContext): Promise<GuardrailResult> {
    const violations: GuardrailViolation[] = [];
    const recommendations: string[] = [];

    // Controlla compliance normativa italiana
    const complianceKeywords = [
      'permessi edilizi', 'regolamento comunale', 'codice appalti',
      'normativa ambientale', 'sicurezza cantiere', 'responsabilità civile'
    ];

    const responseText = (context.assistantResponse || '').toLowerCase();
    
    for (const keyword of complianceKeywords) {
      if (responseText.includes(keyword)) {
        // Verifica se ci sono disclaimer appropriati
        if (!responseText.includes('consulta un professionista') && 
            !responseText.includes('verifica con le autorità')) {
          violations.push({
            type: 'compliance',
            severity: 'medium',
            message: 'Mancanza di disclaimer per questioni normative',
            suggestion: 'Aggiungere disclaimer per questioni legali/normative',
          });
        }
      }
    }

    return Promise.resolve({
      passed: violations.length === 0,
      score: violations.length === 0 ? 1 : 0.6,
      violations,
      recommendations,
    });
  }

  /**
   * Applica correzioni automatiche basate sui guardrails
   */
  async applyCorrections(
    originalResponse: string,
    violations: GuardrailViolation[]
  ): Promise<string> {
    try {
      if (violations.length === 0) return originalResponse;

      const correctionPrompt = `Correggi questa risposta per uno sviluppatore immobiliare professionale:

Risposta originale: "${originalResponse}"

Violazioni rilevate:
${violations.map(v => `- ${v.message}: ${v.suggestion}`).join('\n')}

Fornisci una versione corretta che:
1. Mantiene il contenuto utile
2. È professionale e appropriata
3. Include disclaimer quando necessario
4. È specifica per il settore immobiliare

Risposta corretta:`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: correctionPrompt }],
        max_tokens: 500,
        temperature: 0.3,
      });

      return response.choices[0].message.content || originalResponse;

    } catch (error) {
      console.error('❌ [Guardrails] Errore applicazione correzioni:', error);
      return originalResponse;
    }
  }
}

/**
 * Singleton per il sistema Guardrails
 */
let guardrailsInstance: GuardrailsSystem;

export function getGuardrailsSystem(): GuardrailsSystem {
  if (!guardrailsInstance) {
    guardrailsInstance = new GuardrailsSystem();
  }
  return guardrailsInstance;
}
