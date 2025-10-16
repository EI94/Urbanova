// 🧪 UNIT TEST - Fallback Chain
// Test gestione fallback quando skill falliscono

import { FallbackManager } from '../Fallbacks';
import { OsActionStep, StepExecutionResult, createExecutionContext } from '../../planner/ActionPlan';

describe('FallbackManager', () => {
  let fallbackManager: FallbackManager;
  
  beforeEach(() => {
    fallbackManager = new FallbackManager();
  });
  
  describe('Fallback Strategy Registration', () => {
    it('dovrebbe registrare strategie di default', () => {
      // Verifica che strategie siano registrate
      expect(fallbackManager.hasFallback('term_sheet.create')).toBe(true);
      expect(fallbackManager.hasFallback('rdo.create')).toBe(true);
      expect(fallbackManager.hasFallback('sales.proposal')).toBe(true);
      expect(fallbackManager.hasFallback('business_plan.run')).toBe(true);
      
      console.log('✅ Strategie di default registrate');
    });
    
    it('dovrebbe ritornare false per skill senza fallback', () => {
      expect(fallbackManager.hasFallback('skill.inesistente')).toBe(false);
    });
  });
  
  describe('Scenario Errore: PDF fallisce → HTML fallback', () => {
    it('dovrebbe usare fallback chain per term_sheet.create', async () => {
      const failedStep: OsActionStep = {
        skillId: 'term_sheet.create',
        inputs: {
          businessPlanId: 'bp123',
          format: 'pdf',
        },
        idempotent: true,
      };
      
      const failedResult: StepExecutionResult = {
        stepIndex: 0,
        skillId: 'term_sheet.create',
        status: 'failed',
        error: {
          message: 'PDF generation failed',
          code: 'PDF_ERROR',
          retryable: false,
        },
        attemptCount: 3,
        executionTimeMs: 2000,
        timestamp: new Date(),
      };
      
      const context = createExecutionContext('user123', 'session456');
      
      const result = await fallbackManager.executeFallbackChain(
        failedStep,
        failedResult,
        context
      );
      
      // Verifica attempts
      expect(result.attempts).toBeDefined();
      expect(result.attempts.length).toBeGreaterThan(1);
      
      // Primo attempt dovrebbe essere il primario (fallito)
      expect(result.attempts[0].skillId).toBe('term_sheet.create');
      expect(result.attempts[0].success).toBe(false);
      
      // Metadata
      expect(result.metadata.primarySkillId).toBe('term_sheet.create');
      expect(result.metadata.fallbacksAttempted).toBeGreaterThan(0);
      expect(result.metadata.totalLatencyMs).toBeGreaterThan(0);
      
      console.log('✅ Fallback chain eseguito:', {
        success: result.success,
        attempts: result.attempts.length,
        usedSkill: result.usedSkillId,
      });
    });
  });
  
  describe('Fallback Visible in Metadata', () => {
    it('dovrebbe includere metadata sul fallback nel risultato', async () => {
      const failedStep: OsActionStep = {
        skillId: 'rdo.create',
        inputs: {
          projectId: 'proj123',
          vendors: [{ email: 'v1@test.com' }],
        },
      };
      
      const failedResult: StepExecutionResult = {
        stepIndex: 0,
        skillId: 'rdo.create',
        status: 'failed',
        error: {
          message: 'Email service unavailable',
          retryable: false,
        },
        attemptCount: 3,
        executionTimeMs: 1500,
        timestamp: new Date(),
      };
      
      const context = createExecutionContext('user123', 'session456');
      
      const result = await fallbackManager.executeFallbackChain(
        failedStep,
        failedResult,
        context
      );
      
      // Metadata dovrebbe mostrare fallback chain
      expect(result.metadata).toBeDefined();
      expect(result.metadata).toHaveProperty('primarySkillId');
      expect(result.metadata).toHaveProperty('fallbacksAttempted');
      expect(result.metadata).toHaveProperty('totalLatencyMs');
      
      expect(result.metadata.primarySkillId).toBe('rdo.create');
      expect(result.metadata.fallbacksAttempted).toBeGreaterThanOrEqual(0);
      
      console.log('✅ Metadata fallback visibile:', result.metadata);
    });
    
    it('dovrebbe tracciare tutti i tentativi nella chain', async () => {
      const failedStep: OsActionStep = {
        skillId: 'term_sheet.create',
        inputs: { businessPlanId: 'bp123', format: 'pdf' },
      };
      
      const failedResult: StepExecutionResult = {
        stepIndex: 0,
        skillId: 'term_sheet.create',
        status: 'failed',
        error: { message: 'Failed', retryable: false },
        attemptCount: 1,
        executionTimeMs: 1000,
        timestamp: new Date(),
      };
      
      const context = createExecutionContext('user123', 'session456');
      
      const result = await fallbackManager.executeFallbackChain(
        failedStep,
        failedResult,
        context
      );
      
      // Attempts dovrebbe contenere primary + fallback attempts
      expect(result.attempts.length).toBeGreaterThan(1);
      
      // Ogni attempt dovrebbe avere skillId e success flag
      result.attempts.forEach(attempt => {
        expect(attempt).toHaveProperty('skillId');
        expect(attempt).toHaveProperty('success');
        
        console.log(`  - ${attempt.skillId}: ${attempt.success ? 'SUCCESS' : 'FAILED'}`);
      });
    });
  });
  
  describe('User Prompt quando tutti fallback falliscono', () => {
    it('dovrebbe generare userPrompt se chain fallisce completamente', async () => {
      const failedStep: OsActionStep = {
        skillId: 'skill_con_fallback_che_fallisce',
        inputs: {},
      };
      
      const failedResult: StepExecutionResult = {
        stepIndex: 0,
        skillId: 'skill_con_fallback_che_fallisce',
        status: 'failed',
        error: { message: 'Failed', retryable: false },
        attemptCount: 3,
        executionTimeMs: 2000,
        timestamp: new Date(),
      };
      
      // Registra strategia custom che fallirà
      fallbackManager.register({
        primarySkillId: 'skill_con_fallback_che_fallisce',
        fallbackChain: [
          { skillId: 'skill.inesistente', reason: 'Fallback 1' },
        ],
        userPrompt: 'Tutti i tentativi falliti. Vuoi riprovare manualmente?',
      });
      
      const context = createExecutionContext('user123', 'session456');
      
      const result = await fallbackManager.executeFallbackChain(
        failedStep,
        failedResult,
        context
      );
      
      // Dovrebbe fallire
      expect(result.success).toBe(false);
      
      // Dovrebbe avere userPrompt
      expect(result.userPrompt).toBeDefined();
      expect(result.userPrompt).toContain('Tutti i tentativi falliti');
      
      console.log('✅ UserPrompt generato:', result.userPrompt);
    });
  });
  
  describe('InputsTransform', () => {
    it('dovrebbe trasformare inputs per fallback skill', () => {
      const strategy = fallbackManager.getStrategy('rdo.create');
      
      expect(strategy).toBeDefined();
      
      if (strategy) {
        const fallbackStep = fallbackManager.generateFallbackStep(
          {
            skillId: 'rdo.create',
            inputs: {
              projectId: 'proj123',
              vendors: [{ email: 'v1@test.com' }],
              title: 'Test RDO',
              description: 'Test description',
            },
          },
          0 // Primo fallback
        );
        
        expect(fallbackStep).not.toBeNull();
        
        if (fallbackStep) {
          expect(fallbackStep.skillId).toBe('email.send');
          
          const inputs = fallbackStep.inputs as any;
          expect(inputs).toHaveProperty('to');
          expect(inputs).toHaveProperty('subject');
          expect(inputs).toHaveProperty('body');
          
          console.log('✅ Inputs trasformati:', fallbackStep.inputs);
        }
      }
    });
  });
});

