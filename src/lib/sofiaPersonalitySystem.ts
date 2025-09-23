// 🎭 SOFIA 2.0 - PERSONALITY-DRIVEN RESPONSES
// Sistema di risposte basato su personalità per Urbanova

import { ConversationMemory } from './sofiaMemorySystem';
import { UniversalResponse } from './sofiaResponseSystem';
import { MultiIntentAnalysis } from './sofiaMultiIntentProcessor';
import { ChatMessage } from '@/types/chat';

// ============================================================================
// INTERFACCE TYPESCRIPT
// ============================================================================

export interface SofiaPersonality {
  coreTraits: PersonalityTraits;
  communicationStyle: CommunicationStyle;
  expertiseAreas: ExpertiseArea[];
  adaptiveBehaviors: AdaptiveBehavior[];
  responsePatterns: ResponsePattern[];
  emotionalIntelligence: EmotionalIntelligence;
}

export interface PersonalityTraits {
  professionalism: number; // 0-1: da casual a molto professionale
  enthusiasm: number; // 0-1: da neutro a molto entusiasta
  detailOrientation: number; // 0-1: da conciso a molto dettagliato
  proactivity: number; // 0-1: da reattivo a molto proattivo
  empathy: number; // 0-1: da tecnico a molto empatico
  creativity: number; // 0-1: da standard a molto creativo
}

export interface CommunicationStyle {
  formality: 'formal' | 'professional' | 'casual' | 'friendly';
  tone: 'authoritative' | 'collaborative' | 'supportive' | 'consultative';
  verbosity: 'concise' | 'moderate' | 'detailed' | 'comprehensive';
  structure: 'linear' | 'hierarchical' | 'conversational' | 'adaptive';
  examples: boolean; // Include esempi pratici
  visualizations: boolean; // Include visualizzazioni
  humor: 'none' | 'subtle' | 'moderate' | 'playful';
}

export interface ExpertiseArea {
  domain: string;
  confidence: number;
  experience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  specialties: string[];
  communicationApproach: string;
}

export interface AdaptiveBehavior {
  trigger: string;
  behavior: PersonalityAdjustment;
  context: string[];
  effectiveness: number;
}

export interface PersonalityAdjustment {
  traitModifications: Partial<PersonalityTraits>;
  styleModifications: Partial<CommunicationStyle>;
  duration: 'temporary' | 'session' | 'persistent';
  reasoning: string;
}

export interface ResponsePattern {
  situation: string;
  pattern: string;
  examples: string[];
  frequency: number;
  successRate: number;
}

export interface EmotionalIntelligence {
  moodDetection: MoodDetection;
  empathyResponse: EmpathyResponse;
  stressManagement: StressManagement;
  motivationBoosting: MotivationBoosting;
}

export interface MoodDetection {
  accuracy: number;
  indicators: string[];
  responseStrategies: Record<string, PersonalityAdjustment>;
}

export interface EmpathyResponse {
  sensitivity: number;
  responseTypes: EmpathyResponseType[];
  adaptationSpeed: number;
}

export interface EmpathyResponseType {
  emotion: string;
  response: string;
  personalityAdjustment: PersonalityAdjustment;
}

export interface StressManagement {
  detectionThreshold: number;
  deEscalationStrategies: string[];
  supportMechanisms: string[];
}

export interface MotivationBoosting {
  techniques: string[];
  successRate: number;
  adaptationStrategies: string[];
}

export interface PersonalityContext {
  userMood: 'positive' | 'neutral' | 'frustrated' | 'urgent' | 'exploratory';
  conversationPhase: 'greeting' | 'exploration' | 'action' | 'clarification' | 'completion';
  userExpertise: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  complexity: 'simple' | 'moderate' | 'complex' | 'multi_domain';
  relationship: 'new' | 'developing' | 'established' | 'expert';
}

export interface PersonalizedResponse {
  response: string;
  personalitySignature: string;
  emotionalTone: string;
  adaptationReasoning: string;
  confidence: number;
  expectedUserReaction: string;
  followUpStrategy: string;
}

// ============================================================================
// SOFIA PERSONALITY SYSTEM CLASS
// ============================================================================

export class SofiaPersonalitySystem {
  private personality: SofiaPersonality;
  private adaptationHistory: PersonalityAdjustment[] = [];
  private responseHistory: ResponsePattern[] = [];

  constructor() {
    this.personality = this.initializeDefaultPersonality();
    this.loadPersonalityPatterns();
    console.log('🎭 [SofiaPersonalitySystem] Inizializzato');
  }

  // ============================================================================
  // METODI PRINCIPALI
  // ============================================================================

  /**
   * 🎯 METODO PRINCIPALE: Genera risposta personalizzata
   */
  async generatePersonalizedResponse(
    baseResponse: UniversalResponse,
    context: PersonalityContext,
    memory: ConversationMemory,
    intentAnalysis: MultiIntentAnalysis
  ): Promise<PersonalizedResponse> {
    console.log('🎭 [SofiaPersonality] Generando risposta personalizzata');

    try {
      // 1. Analizza contesto emotivo
      const emotionalContext = await this.analyzeEmotionalContext(context, memory);
      
      // 2. Adatta personalità al contesto
      const adaptedPersonality = await this.adaptPersonalityToContext(
        this.personality,
        emotionalContext,
        context
      );
      
      // 3. Genera risposta con personalità
      const personalizedResponse = await this.generateResponseWithPersonality(
        baseResponse,
        adaptedPersonality,
        context
      );
      
      // 4. Aggiungi firma personale
      const personalitySignature = this.generatePersonalitySignature(adaptedPersonality);
      
      // 5. Determina tono emotivo
      const emotionalTone = this.determineEmotionalTone(adaptedPersonality, context);
      
      // 6. Genera strategia di follow-up
      const followUpStrategy = this.generateFollowUpStrategy(adaptedPersonality, context);
      
      // 7. Calcola confidence
      const confidence = this.calculatePersonalityConfidence(adaptedPersonality, context);
      
      // 8. Prevedi reazione utente
      const expectedReaction = this.predictUserReaction(personalizedResponse, context);

      const result: PersonalizedResponse = {
        response: personalizedResponse,
        personalitySignature,
        emotionalTone,
        adaptationReasoning: this.generateAdaptationReasoning(adaptedPersonality, context),
        confidence,
        expectedUserReaction: expectedReaction,
        followUpStrategy
      };

      // 9. Aggiorna pattern di risposta
      this.updateResponsePatterns(result, context);

      console.log('✅ [SofiaPersonality] Risposta personalizzata generata:', {
        emotionalTone: result.emotionalTone,
        confidence: result.confidence,
        adaptationReasoning: result.adaptationReasoning
      });

      return result;

    } catch (error) {
      console.error('❌ [SofiaPersonality] Errore generazione risposta personalizzata:', error);
      return this.generateFallbackPersonalizedResponse(baseResponse, context);
    }
  }

  /**
   * 🎯 Adatta personalità in tempo reale
   */
  async adaptPersonalityInRealTime(
    userFeedback: string,
    context: PersonalityContext,
    memory: ConversationMemory
  ): Promise<void> {
    console.log('🎭 [SofiaPersonality] Adattando personalità in tempo reale');

    try {
      // 1. Analizza feedback utente
      const feedbackAnalysis = await this.analyzeUserFeedback(userFeedback, context);
      
      // 2. Determina adattamenti necessari
      const adaptations = this.determineNecessaryAdaptations(feedbackAnalysis, context);
      
      // 3. Applica adattamenti
      adaptations.forEach(adaptation => {
        this.applyPersonalityAdaptation(adaptation);
        this.adaptationHistory.push(adaptation);
      });
      
      // 4. Aggiorna pattern di successo
      this.updateSuccessPatterns(feedbackAnalysis, adaptations);
      
      console.log('✅ [SofiaPersonality] Personalità adattata:', {
        adaptations: adaptations.length,
        totalAdaptations: this.adaptationHistory.length
      });

    } catch (error) {
      console.error('❌ [SofiaPersonality] Errore adattamento personalità:', error);
    }
  }

  // ============================================================================
  // METODI PRIVATI
  // ============================================================================

  /**
   * Inizializza personalità di default
   */
  private initializeDefaultPersonality(): SofiaPersonality {
    return {
      coreTraits: {
        professionalism: 0.8,
        enthusiasm: 0.7,
        detailOrientation: 0.6,
        proactivity: 0.7,
        empathy: 0.8,
        creativity: 0.6
      },
      communicationStyle: {
        formality: 'professional',
        tone: 'collaborative',
        verbosity: 'moderate',
        structure: 'adaptive',
        examples: true,
        visualizations: true,
        humor: 'subtle'
      },
      expertiseAreas: [
        {
          domain: 'real_estate_development',
          confidence: 0.9,
          experience: 'expert',
          specialties: ['feasibility_analysis', 'market_research', 'project_management'],
          communicationApproach: 'technical_with_examples'
        },
        {
          domain: 'urban_planning',
          confidence: 0.8,
          experience: 'advanced',
          specialties: ['zoning', 'permits', 'compliance'],
          communicationApproach: 'regulatory_focused'
        }
      ],
      adaptiveBehaviors: [],
      responsePatterns: [],
      emotionalIntelligence: {
        moodDetection: {
          accuracy: 0.7,
          indicators: ['urgency_keywords', 'emotion_words', 'punctuation'],
          responseStrategies: {
            'frustrated': {
              traitModifications: { empathy: 0.9, proactivity: 0.8 },
              styleModifications: { tone: 'supportive', verbosity: 'detailed' },
              duration: 'temporary',
              reasoning: 'User is frustrated, increase empathy and support'
            },
            'urgent': {
              traitModifications: { proactivity: 0.9, detailOrientation: 0.4 },
              styleModifications: { verbosity: 'concise', structure: 'linear' },
              duration: 'temporary',
              reasoning: 'User has urgent need, prioritize speed and clarity'
            }
          }
        },
        empathyResponse: {
          sensitivity: 0.8,
          responseTypes: [
            {
              emotion: 'frustration',
              response: 'I understand this can be challenging. Let me help you find a solution.',
              personalityAdjustment: {
                traitModifications: { empathy: 0.9 },
                styleModifications: { tone: 'supportive' },
                duration: 'temporary',
                reasoning: 'Responding to user frustration with increased empathy'
              }
            }
          ],
          adaptationSpeed: 0.7
        },
        stressManagement: {
          detectionThreshold: 0.6,
          deEscalationStrategies: ['acknowledge_concerns', 'provide_solutions', 'offer_support'],
          supportMechanisms: ['step_by_step_guidance', 'alternative_options', 'expert_reassurance']
        },
        motivationBoosting: {
          techniques: ['highlight_progress', 'showcase_opportunities', 'provide_encouragement'],
          successRate: 0.8,
          adaptationStrategies: ['personalize_motivation', 'adapt_to_user_goals']
        }
      }
    };
  }

  /**
   * Carica pattern di personalità
   */
  private loadPersonalityPatterns(): void {
    // Pattern di risposta per diverse situazioni
    this.responseHistory = [
      {
        situation: 'greeting',
        pattern: 'Warm professional greeting with context awareness',
        examples: [
          'Ciao! Vedo che stai lavorando su progetti immobiliari. Come posso aiutarti oggi?',
          'Benvenuto! Ho accesso ai tuoi progetti e posso supportarti in ogni fase.'
        ],
        frequency: 0,
        successRate: 0.9
      },
      {
        situation: 'feasibility_analysis',
        pattern: 'Technical expertise with practical examples',
        examples: [
          'Perfetto! Creerò un\'analisi di fattibilità completa. Basandomi sulla mia esperienza, ti mostrerò anche alcuni esempi simili.',
          'Eccellente scelta! L\'analisi di fattibilità è fondamentale. Ti guiderò attraverso ogni aspetto.'
        ],
        frequency: 0,
        successRate: 0.85
      }
    ];
  }

  /**
   * Analizza contesto emotivo
   */
  private async analyzeEmotionalContext(
    context: PersonalityContext,
    memory: ConversationMemory
  ): Promise<any> {
    return {
      userMood: context.userMood,
      urgency: context.urgency,
      complexity: context.complexity,
      relationship: context.relationship,
      conversationLength: memory.conversationContext.messages.length,
      recentTopics: memory.conversationContext.conversationPatterns.topicsDiscussed.slice(-3)
    };
  }

  /**
   * Adatta personalità al contesto
   */
  private async adaptPersonalityToContext(
    personality: SofiaPersonality,
    emotionalContext: any,
    context: PersonalityContext
  ): Promise<SofiaPersonality> {
    const adaptedPersonality = { ...personality };
    
    // Adatta basato su mood utente
    if (context.userMood === 'frustrated') {
      adaptedPersonality.coreTraits.empathy = Math.min(1.0, personality.coreTraits.empathy + 0.2);
      adaptedPersonality.communicationStyle.tone = 'supportive';
      adaptedPersonality.communicationStyle.verbosity = 'detailed';
    }
    
    if (context.userMood === 'urgent') {
      adaptedPersonality.coreTraits.proactivity = Math.min(1.0, personality.coreTraits.proactivity + 0.2);
      adaptedPersonality.communicationStyle.verbosity = 'concise';
      adaptedPersonality.communicationStyle.structure = 'linear';
    }
    
    if (context.userMood === 'exploratory') {
      adaptedPersonality.coreTraits.creativity = Math.min(1.0, personality.coreTraits.creativity + 0.1);
      adaptedPersonality.communicationStyle.examples = true;
      adaptedPersonality.communicationStyle.visualizations = true;
    }
    
    // Adatta basato su expertise utente
    if (context.userExpertise === 'beginner') {
      adaptedPersonality.communicationStyle.verbosity = 'detailed';
      adaptedPersonality.communicationStyle.examples = true;
      adaptedPersonality.coreTraits.empathy = Math.min(1.0, personality.coreTraits.empathy + 0.1);
    }
    
    if (context.userExpertise === 'expert') {
      adaptedPersonality.communicationStyle.verbosity = 'moderate';
      adaptedPersonality.communicationStyle.formality = 'professional';
      adaptedPersonality.coreTraits.professionalism = Math.min(1.0, personality.coreTraits.professionalism + 0.1);
    }
    
    return adaptedPersonality;
  }

  /**
   * Genera risposta con personalità
   */
  private async generateResponseWithPersonality(
    baseResponse: UniversalResponse,
    personality: SofiaPersonality,
    context: PersonalityContext
  ): Promise<string> {
    let response = baseResponse.response;
    
    // Applica modifiche di tono
    response = this.applyToneModifications(response, personality.communicationStyle);
    
    // Applica modifiche di verbosità
    response = this.applyVerbosityModifications(response, personality.communicationStyle, context);
    
    // Aggiungi esempi se appropriato
    if (personality.communicationStyle.examples && context.complexity !== 'simple') {
      response = this.addRelevantExamples(response, context);
    }
    
    // Aggiungi umorismo se appropriato
    if (personality.communicationStyle.humor !== 'none' && context.userMood === 'positive') {
      response = this.addSubtleHumor(response, personality.communicationStyle.humor);
    }
    
    // Aggiungi proattività
    if (personality.coreTraits.proactivity > 0.7) {
      response = this.addProactiveElements(response, context);
    }
    
    return response;
  }

  /**
   * Genera firma personale
   */
  private generatePersonalitySignature(personality: SofiaPersonality): string {
    const traits = personality.coreTraits;
    const style = personality.communicationStyle;
    
    let signature = '';
    
    if (traits.professionalism > 0.8) {
      signature += 'Esperto ';
    }
    
    if (traits.empathy > 0.8) {
      signature += 'e comprensivo ';
    }
    
    if (traits.proactivity > 0.7) {
      signature += 'proattivo ';
    }
    
    if (style.tone === 'collaborative') {
      signature += 'collaborativo';
    } else if (style.tone === 'supportive') {
      signature += 'di supporto';
    }
    
    return signature || 'professionale e competente';
  }

  /**
   * Determina tono emotivo
   */
  private determineEmotionalTone(
    personality: SofiaPersonality,
    context: PersonalityContext
  ): string {
    const traits = personality.coreTraits;
    
    if (context.userMood === 'frustrated') {
      return 'supportive_and_understanding';
    }
    
    if (context.userMood === 'urgent') {
      return 'focused_and_efficient';
    }
    
    if (context.userMood === 'exploratory') {
      return 'enthusiastic_and_creative';
    }
    
    if (traits.enthusiasm > 0.7) {
      return 'enthusiastic_and_engaging';
    }
    
    if (traits.empathy > 0.8) {
      return 'warm_and_empathetic';
    }
    
    return 'professional_and_helpful';
  }

  /**
   * Genera strategia di follow-up
   */
  private generateFollowUpStrategy(
    personality: SofiaPersonality,
    context: PersonalityContext
  ): string {
    if (personality.coreTraits.proactivity > 0.7) {
      return 'proactive_suggestions';
    }
    
    if (context.userMood === 'exploratory') {
      return 'exploratory_guidance';
    }
    
    if (context.complexity === 'complex') {
      return 'step_by_step_support';
    }
    
    return 'reactive_assistance';
  }

  /**
   * Calcola confidence personalità
   */
  private calculatePersonalityConfidence(
    personality: SofiaPersonality,
    context: PersonalityContext
  ): number {
    let confidence = 0.7; // Base confidence
    
    // Aggiungi confidence per expertise
    const relevantExpertise = personality.expertiseAreas.find(
      area => area.domain.includes(context.conversationPhase)
    );
    
    if (relevantExpertise) {
      confidence += relevantExpertise.confidence * 0.2;
    }
    
    // Aggiungi confidence per adattamento al mood
    if (personality.emotionalIntelligence.moodDetection.accuracy > 0.7) {
      confidence += 0.1;
    }
    
    return Math.min(1.0, Math.max(0.0, confidence));
  }

  /**
   * Prevedi reazione utente
   */
  private predictUserReaction(
    response: string,
    context: PersonalityContext
  ): string {
    if (context.userMood === 'frustrated') {
      return 'appreciative_of_support';
    }
    
    if (context.userMood === 'urgent') {
      return 'satisfied_with_efficiency';
    }
    
    if (context.userMood === 'exploratory') {
      return 'engaged_and_curious';
    }
    
    return 'satisfied_and_engaged';
  }

  /**
   * Genera ragionamento adattamento
   */
  private generateAdaptationReasoning(
    personality: SofiaPersonality,
    context: PersonalityContext
  ): string {
    const adaptations: string[] = [];
    
    if (context.userMood === 'frustrated') {
      adaptations.push('Aumentato empatia per supportare utente frustrato');
    }
    
    if (context.userMood === 'urgent') {
      adaptations.push('Prioritizzato efficienza per richiesta urgente');
    }
    
    if (context.userExpertise === 'beginner') {
      adaptations.push('Adattato verbosità per utente principiante');
    }
    
    if (context.complexity === 'complex') {
      adaptations.push('Aggiunto esempi per complessità elevata');
    }
    
    return adaptations.join(', ') || 'Nessun adattamento specifico necessario';
  }

  /**
   * Aggiorna pattern di risposta
   */
  private updateResponsePatterns(
    response: PersonalizedResponse,
    context: PersonalityContext
  ): void {
    const pattern = this.responseHistory.find(p => p.situation === context.conversationPhase);
    if (pattern) {
      pattern.frequency++;
      // Aggiorna success rate basato su confidence
      pattern.successRate = (pattern.successRate + response.confidence) / 2;
    }
  }

  /**
   * Analizza feedback utente
   */
  private async analyzeUserFeedback(
    feedback: string,
    context: PersonalityContext
  ): Promise<any> {
    const positiveKeywords = ['grazie', 'perfetto', 'ottimo', 'utile', 'aiuto'];
    const negativeKeywords = ['no', 'sbagliato', 'non', 'problema', 'difficile'];
    
    const isPositive = positiveKeywords.some(keyword => 
      feedback.toLowerCase().includes(keyword)
    );
    const isNegative = negativeKeywords.some(keyword => 
      feedback.toLowerCase().includes(keyword)
    );
    
    return {
      sentiment: isPositive ? 'positive' : isNegative ? 'negative' : 'neutral',
      keywords: [...positiveKeywords, ...negativeKeywords].filter(keyword =>
        feedback.toLowerCase().includes(keyword)
      ),
      context
    };
  }

  /**
   * Determina adattamenti necessari
   */
  private determineNecessaryAdaptations(
    feedbackAnalysis: any,
    context: PersonalityContext
  ): PersonalityAdjustment[] {
    const adaptations: PersonalityAdjustment[] = [];
    
    if (feedbackAnalysis.sentiment === 'negative') {
      adaptations.push({
        traitModifications: { empathy: 0.9, proactivity: 0.8 },
        styleModifications: { tone: 'supportive', verbosity: 'detailed' },
        duration: 'session',
        reasoning: 'User feedback indicates need for more supportive approach'
      });
    }
    
    if (feedbackAnalysis.sentiment === 'positive') {
      adaptations.push({
        traitModifications: { enthusiasm: 0.8 },
        styleModifications: { humor: 'moderate' },
        duration: 'temporary',
        reasoning: 'Positive feedback allows for more enthusiastic approach'
      });
    }
    
    return adaptations;
  }

  /**
   * Applica adattamento personalità
   */
  private applyPersonalityAdaptation(adaptation: PersonalityAdjustment): void {
    // Applica modifiche ai tratti
    if (adaptation.traitModifications) {
      Object.entries(adaptation.traitModifications).forEach(([trait, value]) => {
        (this.personality.coreTraits as any)[trait] = value;
      });
    }
    
    // Applica modifiche allo stile
    if (adaptation.styleModifications) {
      Object.entries(adaptation.styleModifications).forEach(([style, value]) => {
        (this.personality.communicationStyle as any)[style] = value;
      });
    }
  }

  /**
   * Aggiorna pattern di successo
   */
  private updateSuccessPatterns(
    feedbackAnalysis: any,
    adaptations: PersonalityAdjustment[]
  ): void {
    // Aggiorna pattern basato su feedback
    adaptations.forEach(adaptation => {
      const pattern = this.responseHistory.find(p => 
        p.situation.includes(adaptation.reasoning)
      );
      
      if (pattern) {
        if (feedbackAnalysis.sentiment === 'positive') {
          pattern.successRate = Math.min(1.0, pattern.successRate + 0.1);
        } else if (feedbackAnalysis.sentiment === 'negative') {
          pattern.successRate = Math.max(0.0, pattern.successRate - 0.1);
        }
      }
    });
  }

  // ============================================================================
  // METODI DI MODIFICA RISPOSTA
  // ============================================================================

  private applyToneModifications(response: string, style: CommunicationStyle): string {
    if (style.tone === 'supportive') {
      response = response.replace(/^/, 'Capisco perfettamente. ');
    }
    
    if (style.tone === 'collaborative') {
      response = response.replace(/^/, 'Lavoriamo insieme su questo. ');
    }
    
    return response;
  }

  private applyVerbosityModifications(
    response: string,
    style: CommunicationStyle,
    context: PersonalityContext
  ): string {
    if (style.verbosity === 'concise' && context.urgency === 'high') {
      // Mantieni risposta concisa per urgenza
      return response;
    }
    
    if (style.verbosity === 'detailed' && context.userExpertise === 'beginner') {
      // Aggiungi dettagli per principianti
      response += '\n\nTi spiego passo dopo passo come procedere.';
    }
    
    return response;
  }

  private addRelevantExamples(response: string, context: PersonalityContext): string {
    const examples = [
      'Ad esempio, per un progetto simile a Milano abbiamo visto un ROI del 18%.',
      'Un caso studio recente mostra come ottimizzare i tempi di sviluppo.',
      'Ti mostro un esempio pratico di come altri sviluppatori hanno affrontato questa situazione.'
    ];
    
    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    return response + '\n\n' + randomExample;
  }

  private addSubtleHumor(response: string, humorLevel: string): string {
    if (humorLevel === 'subtle') {
      const humorAdditions = [
        ' (e prometto di non essere troppo tecnico!)',
        ' - senza gergo da sviluppatore immobiliare!',
        ' (in modo semplice, senza complicare le cose)'
      ];
      
      const randomHumor = humorAdditions[Math.floor(Math.random() * humorAdditions.length)];
      return response + randomHumor;
    }
    
    return response;
  }

  private addProactiveElements(response: string, context: PersonalityContext): string {
    const proactiveElements = [
      '\n\n💡 Ti suggerisco anche di considerare:',
      '\n\n🚀 Prossimi passi che potresti valutare:',
      '\n\n📈 Opportunità aggiuntive da esplorare:'
    ];
    
    const randomElement = proactiveElements[Math.floor(Math.random() * proactiveElements.length)];
    return response + randomElement;
  }

  private generateFallbackPersonalizedResponse(
    baseResponse: UniversalResponse,
    context: PersonalityContext
  ): PersonalizedResponse {
    return {
      response: baseResponse.response,
      personalitySignature: 'professionale e competente',
      emotionalTone: 'professional_and_helpful',
      adaptationReasoning: 'Fallback response - no specific adaptation',
      confidence: 0.5,
      expectedUserReaction: 'neutral',
      followUpStrategy: 'reactive_assistance'
    };
  }
}

// ============================================================================
// ISTANZA SINGLETON
// ============================================================================

export const sofiaPersonalitySystem = new SofiaPersonalitySystem();
