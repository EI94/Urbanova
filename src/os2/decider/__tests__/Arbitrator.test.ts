// 🧪 UNIT TEST - Arbitrator Decision Layer
// Test della logica decisionale basata su confidence

import { Arbitrator } from '../Arbitrator';
import { ClassificationResult } from '@/lib/urbanovaOS/ml/classificationEngine';

describe('Arbitrator', () => {
  let arbitrator: Arbitrator;
  
  beforeEach(() => {
    arbitrator = new Arbitrator();
  });
  
  describe('Scenario 1: Alta Confidence (>= 0.7)', () => {
    it('dovrebbe procedere con Planner per confidence = 0.9', () => {
      const classification: ClassificationResult = {
        category: 'real_estate',
        confidence: 0.9,
        intent: 'business_plan',
        entities: [
          { name: 'projectName', value: 'Ciliegie', confidence: 0.95, type: 'project' },
          { name: 'units', value: '4', confidence: 0.98, type: 'number' },
          { name: 'averagePrice', value: '390000', confidence: 0.92, type: 'number' },
        ],
        sentiment: 'neutral',
        urgency: 'medium',
        complexity: 'medium',
        userExpertise: 'intermediate',
        projectPhase: 'planning',
        actions: [],
      };
      
      const decision = arbitrator.decide(
        classification,
        'Crea BP progetto Ciliegie: 4 case, 390k',
        'user123',
        'session456'
      );
      
      // Verifica tipo decisione
      expect(decision.type).toBe('proceed');
      
      if (decision.type === 'proceed') {
        // Verifica plannerInput
        expect(decision.plannerInput).toBeDefined();
        expect(decision.plannerInput.intent).toBe('business_plan');
        expect(decision.plannerInput.entities.projectName).toBe('Ciliegie');
        expect(decision.plannerInput.entities.units).toBe('4');
        expect(decision.plannerInput.userContext.userId).toBe('user123');
      }
      
      console.log('✅ Alta confidence → PROCEED con Planner');
    });
    
    it('dovrebbe procedere anche per confidence = 0.7 (soglia)', () => {
      const classification: ClassificationResult = {
        category: 'real_estate',
        confidence: 0.7, // Esattamente sulla soglia
        intent: 'sensitivity_analysis',
        entities: [
          { name: 'projectId', value: 'proj123', confidence: 0.8, type: 'project' },
          { name: 'variable', value: 'price', confidence: 0.75, type: 'custom' },
        ],
        sentiment: 'neutral',
        urgency: 'medium',
        complexity: 'simple',
        userExpertise: 'intermediate',
        projectPhase: 'planning',
        actions: [],
      };
      
      const decision = arbitrator.decide(
        classification,
        'Sensitivity ±15% sul prezzo',
        'user123',
        'session456'
      );
      
      expect(decision.type).toBe('proceed');
      
      console.log('✅ Confidence 0.7 (soglia) → PROCEED');
    });
  });
  
  describe('Scenario 2: Media Confidence (0.4-0.7)', () => {
    it('dovrebbe richiedere chiarimento per confidence = 0.6', () => {
      const classification: ClassificationResult = {
        category: 'real_estate',
        confidence: 0.6,
        intent: 'business_plan',
        entities: [
          { name: 'projectName', value: 'Test', confidence: 0.7, type: 'project' },
          // Mancano: units, averagePrice, constructionCost
        ],
        sentiment: 'neutral',
        urgency: 'medium',
        complexity: 'medium',
        userExpertise: 'beginner',
        projectPhase: 'planning',
        actions: [],
      };
      
      const decision = arbitrator.decide(
        classification,
        'Voglio fare un business plan',
        'user123',
        'session456'
      );
      
      // Verifica tipo decisione
      expect(decision.type).toBe('clarify');
      
      if (decision.type === 'clarify') {
        // Verifica clarifyPrompt
        expect(decision.clarifyPrompt).toBeDefined();
        expect(decision.clarifyPrompt.question).toBeDefined();
        expect(decision.clarifyPrompt.question.length).toBeGreaterThan(0);
        
        // Dovrebbe identificare campi mancanti
        expect(decision.clarifyPrompt.missingFields).toBeDefined();
        expect(decision.clarifyPrompt.missingFields.length).toBeGreaterThan(0);
        
        // Context dovrebbe contenere info parziali
        expect(decision.clarifyPrompt.context.intent).toBe('business_plan');
        expect(decision.clarifyPrompt.context.confidence).toBe(0.6);
        expect(decision.clarifyPrompt.context.partialEntities.projectName).toBe('Test');
        
        console.log('✅ Media confidence → CLARIFY:', decision.clarifyPrompt.question);
      }
    });
    
    it('dovrebbe generare suggestedValues per confidence = 0.5', () => {
      const classification: ClassificationResult = {
        category: 'real_estate',
        confidence: 0.5,
        intent: 'sensitivity_analysis',
        entities: [
          { name: 'projectId', value: 'proj123', confidence: 0.6, type: 'project' },
          // Manca: variable
        ],
        sentiment: 'neutral',
        urgency: 'medium',
        complexity: 'medium',
        userExpertise: 'beginner',
        projectPhase: 'planning',
        actions: [],
      };
      
      const decision = arbitrator.decide(
        classification,
        'Fai sensitivity sul progetto',
        'user123',
        'session456'
      );
      
      expect(decision.type).toBe('clarify');
      
      if (decision.type === 'clarify') {
        // Dovrebbe avere suggestedValues
        expect(decision.clarifyPrompt.suggestedValues).toBeDefined();
        expect(decision.clarifyPrompt.suggestedValues!.variable).toBe('price');
        expect(decision.clarifyPrompt.suggestedValues!.range).toBe(15);
        
        console.log('✅ SuggestedValues generati:', decision.clarifyPrompt.suggestedValues);
      }
    });
  });
  
  describe('Scenario 3: Bassa Confidence (< 0.4)', () => {
    it('dovrebbe proporre 2 interpretazioni per confidence = 0.3', () => {
      const classification: ClassificationResult = {
        category: 'general',
        confidence: 0.3,
        intent: 'business_plan',
        entities: [],
        sentiment: 'confused',
        urgency: 'low',
        complexity: 'complex',
        userExpertise: 'beginner',
        projectPhase: 'planning',
        actions: [],
      };
      
      const decision = arbitrator.decide(
        classification,
        'Non so cosa fare',
        'user123',
        'session456'
      );
      
      // Verifica tipo decisione
      expect(decision.type).toBe('disambiguate');
      
      if (decision.type === 'disambiguate') {
        // Dovrebbe avere 2 interpretazioni
        expect(decision.interpretations).toBeDefined();
        expect(decision.interpretations.length).toBe(2);
        
        // Ogni interpretazione dovrebbe avere struttura completa
        decision.interpretations.forEach((interp, idx) => {
          expect(interp.id).toBeDefined();
          expect(interp.intent).toBeDefined();
          expect(interp.description).toBeDefined();
          expect(interp.example).toBeDefined();
          expect(interp.confidence).toBeGreaterThan(0);
          expect(interp.confidence).toBeLessThanOrEqual(1);
          
          console.log(`✅ Interpretazione ${idx + 1}: ${interp.intent} (${interp.confidence})`);
        });
        
        // Interpretazioni dovrebbero essere diverse
        expect(decision.interpretations[0].intent).not.toBe(decision.interpretations[1].intent);
      }
    });
    
    it('dovrebbe proporre interpretazioni plausibili per confidence = 0.2', () => {
      const classification: ClassificationResult = {
        category: 'general',
        confidence: 0.2,
        intent: 'general',
        entities: [],
        sentiment: 'confused',
        urgency: 'low',
        complexity: 'simple',
        userExpertise: 'beginner',
        projectPhase: 'planning',
        actions: [],
      };
      
      const decision = arbitrator.decide(
        classification,
        'Aiuto',
        'user123',
        'session456'
      );
      
      expect(decision.type).toBe('disambiguate');
      
      if (decision.type === 'disambiguate') {
        expect(decision.interpretations.length).toBe(2);
        
        // Almeno una interpretazione dovrebbe avere example
        const hasExample = decision.interpretations.some(i => i.example && i.example.length > 0);
        expect(hasExample).toBe(true);
      }
    });
  });
  
  describe('canProceed helper', () => {
    it('dovrebbe permettere proceed se confidence alta e campi presenti', () => {
      const classification: ClassificationResult = {
        category: 'real_estate',
        confidence: 0.85,
        intent: 'business_plan',
        entities: [
          { name: 'projectName', value: 'Test', confidence: 0.9, type: 'project' },
          { name: 'units', value: '4', confidence: 0.95, type: 'number' },
        ],
        sentiment: 'neutral',
        urgency: 'medium',
        complexity: 'medium',
        userExpertise: 'intermediate',
        projectPhase: 'planning',
        actions: [],
      };
      
      const result = arbitrator.canProceed(classification, ['projectName', 'units']);
      
      expect(result.canProceed).toBe(true);
      expect(result.reason).toBeUndefined();
    });
    
    it('dovrebbe bloccare se confidence bassa', () => {
      const classification: ClassificationResult = {
        category: 'real_estate',
        confidence: 0.5, // < 0.7
        intent: 'business_plan',
        entities: [
          { name: 'projectName', value: 'Test', confidence: 0.6, type: 'project' },
        ],
        sentiment: 'neutral',
        urgency: 'medium',
        complexity: 'medium',
        userExpertise: 'intermediate',
        projectPhase: 'planning',
        actions: [],
      };
      
      const result = arbitrator.canProceed(classification, ['projectName']);
      
      expect(result.canProceed).toBe(false);
      expect(result.reason).toContain('Confidence troppo bassa');
    });
    
    it('dovrebbe bloccare se campi richiesti mancanti', () => {
      const classification: ClassificationResult = {
        category: 'real_estate',
        confidence: 0.9, // Alta
        intent: 'business_plan',
        entities: [
          { name: 'projectName', value: 'Test', confidence: 0.95, type: 'project' },
          // Manca 'units'
        ],
        sentiment: 'neutral',
        urgency: 'medium',
        complexity: 'medium',
        userExpertise: 'intermediate',
        projectPhase: 'planning',
        actions: [],
      };
      
      const result = arbitrator.canProceed(classification, ['projectName', 'units']);
      
      expect(result.canProceed).toBe(false);
      expect(result.reason).toContain('mancanti');
      expect(result.reason).toContain('units');
    });
  });
});

