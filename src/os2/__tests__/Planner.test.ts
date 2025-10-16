// 🧪 UNIT TEST - Planner
// Test del sistema di pianificazione

import { Planner } from '../planner/Planner';
import { PlannerInput, createExecutionContext } from '../planner/ActionPlan';

describe('Planner', () => {
  let planner: Planner;
  
  beforeEach(() => {
    planner = new Planner();
  });
  
  describe('Business Plan Intent', () => {
    it('dovrebbe generare plan con step business_plan.run', async () => {
      const input: PlannerInput = {
        intent: 'business_plan',
        entities: {
          projectName: 'Test Project',
          units: 4,
          salePrice: 390000,
          constructionCost: 200000,
          landScenarios: [
            { name: 'Cash', type: 'CASH', upfrontPayment: 220000 },
          ],
        },
        userMessage: 'Crea business plan per Test Project',
        userContext: createExecutionContext('user123', 'session123'),
      };
      
      const plan = await planner.plan(input);
      
      // Verifica struttura plan
      expect(plan).toHaveProperty('id');
      expect(plan).toHaveProperty('goal');
      expect(plan).toHaveProperty('steps');
      expect(plan).toHaveProperty('assumptions');
      
      // Verifica goal
      expect(plan.goal).toContain('Test Project');
      
      // Verifica steps
      expect(plan.steps.length).toBeGreaterThan(0);
      expect(plan.steps[0].skillId).toBe('business_plan.run');
      
      // Verifica inputs primo step
      const firstStepInputs = plan.steps[0].inputs as Record<string, unknown>;
      expect(firstStepInputs.projectName).toBe('Test Project');
      expect(firstStepInputs.totalUnits).toBe(4);
      expect(firstStepInputs.averagePrice).toBe(390000);
      
      // Verifica idempotent
      expect(plan.steps[0].idempotent).toBe(true);
      
      console.log('✅ Business Plan plan generato:', plan);
    });
    
    it('dovrebbe generare plan con 1 step (BP non salva più automaticamente)', async () => {
      const input: PlannerInput = {
        intent: 'business_plan',
        entities: {
          projectName: 'Test',
          units: 2,
          salePrice: 300000,
          constructionCost: 150000,
        },
        userMessage: 'Business plan',
        userContext: createExecutionContext('user123', 'session123'),
      };
      
      const plan = await planner.plan(input);
      
      // Ora dovrebbe avere solo 1 step (calculate, senza save)
      expect(plan.steps.length).toBe(1);
      expect(plan.steps[0].skillId).toBe('business_plan.run');
    });
  });
  
  describe('Sensitivity Analysis Intent', () => {
    it('dovrebbe generare plan con step sensitivity.run', async () => {
      const input: PlannerInput = {
        intent: 'sensitivity_analysis',
        entities: {
          projectId: 'proj123',
          variable: 'price',
          range: 15,
        },
        userMessage: 'Fai sensitivity ±15% sul prezzo',
        userContext: createExecutionContext('user123', 'session123'),
      };
      
      const plan = await planner.plan(input);
      
      // Verifica steps
      expect(plan.steps.length).toBe(1);
      expect(plan.steps[0].skillId).toBe('sensitivity.run');
      
      // Verifica inputs
      const inputs = plan.steps[0].inputs as Record<string, unknown>;
      expect(inputs.projectId).toBe('proj123');
      expect(inputs.variable).toBe('price');
      expect(inputs.range).toBe(15);
      
      // Verifica idempotent
      expect(plan.steps[0].idempotent).toBe(true);
      
      console.log('✅ Sensitivity plan generato:', plan);
    });
  });
  
  describe('RDO Send Intent', () => {
    it('dovrebbe generare plan con step rdo.create che richiede conferma', async () => {
      const input: PlannerInput = {
        intent: 'rdo_send',
        entities: {
          projectId: 'proj456',
          vendors: ['vendor1@example.com', 'vendor2@example.com'],
        },
        userMessage: 'Invia RDO a 2 fornitori',
        userContext: createExecutionContext('user123', 'session123'),
      };
      
      const plan = await planner.plan(input);
      
      // Verifica step
      expect(plan.steps.length).toBe(1);
      expect(plan.steps[0].skillId).toBe('rdo.create');
      
      // Verifica conferma richiesta
      expect(plan.steps[0].confirm).toBe(true);
      expect(plan.confirmables).toContain('rdo.create');
      
      // Verifica non idempotent (invia email)
      expect(plan.steps[0].idempotent).toBe(false);
      
      // Verifica inputs
      const inputs = plan.steps[0].inputs as Record<string, unknown>;
      expect(inputs.projectId).toBe('proj456');
      expect((inputs.vendors as Array<{email: string}>).length).toBe(2);
      
      console.log('✅ RDO plan generato con conferma:', plan);
    });
    
    it('dovrebbe identificare risk per step con conferma', async () => {
      const input: PlannerInput = {
        intent: 'rdo_send',
        entities: {
          projectId: 'proj456',
          vendors: ['vendor1@example.com'],
        },
        userMessage: 'Invia RDO',
        userContext: createExecutionContext('user123', 'session123'),
      };
      
      const plan = await planner.plan(input);
      
      // Dovrebbe avere risks per step con conferma
      expect(plan.risks).toBeDefined();
      expect(plan.risks!.length).toBeGreaterThan(0);
      
      // Risk dovrebbe menzionare conferma
      const hasConfirmRisk = plan.risks!.some(r => r.includes('conferma'));
      expect(hasConfirmRisk).toBe(true);
    });
  });
  
  describe('Plan Metadata', () => {
    it('dovrebbe includere metadata con intent, entities, confidence', async () => {
      const input: PlannerInput = {
        intent: 'feasibility_analysis',
        entities: {
          landArea: 1000,
          constructionCostPerSqm: 2000,
          salePrice: 5000,
        },
        userMessage: 'Analisi fattibilità',
        userContext: createExecutionContext('user123', 'session123'),
      };
      
      const plan = await planner.plan(input);
      
      expect(plan.metadata).toBeDefined();
      expect(plan.metadata!.intent).toBe('feasibility_analysis');
      expect(plan.metadata!.entities).toEqual(input.entities);
      expect(plan.metadata!.confidence).toBeGreaterThanOrEqual(0.5);
      expect(plan.metadata!.confidence).toBeLessThanOrEqual(1.0);
      expect(plan.metadata!.estimatedDurationMs).toBeGreaterThan(0);
    });
    
    it('dovrebbe ridurre confidence se dati mancanti', async () => {
      const inputComplete: PlannerInput = {
        intent: 'business_plan',
        entities: {
          projectName: 'Test',
          units: 4,
          salePrice: 390000,
          constructionCost: 200000,
          landScenarios: [{ name: 'Cash', type: 'CASH', upfrontPayment: 200000 }],
        },
        userMessage: 'BP',
        userContext: createExecutionContext('user123', 'session123'),
      };
      
      const inputIncomplete: PlannerInput = {
        intent: 'business_plan',
        entities: {
          projectName: 'Test',
        },
        userMessage: 'BP',
        userContext: createExecutionContext('user123', 'session123'),
      };
      
      const planComplete = await planner.plan(inputComplete);
      const planIncomplete = await planner.plan(inputIncomplete);
      
      // Plan incompleto dovrebbe avere confidence uguale o più bassa
      expect(planIncomplete.metadata!.confidence).toBeLessThanOrEqual(planComplete.metadata!.confidence);
    });
  });
  
  describe('Assumptions', () => {
    it('dovrebbe identificare assumptions per dati mancanti', async () => {
      const input: PlannerInput = {
        intent: 'business_plan',
        entities: {
          // Dati minimi
        },
        userMessage: 'Crea BP',
        userContext: createExecutionContext('user123', 'session123'),
      };
      
      const plan = await planner.plan(input);
      
      // Dovrebbe avere assumptions
      expect(plan.assumptions.length).toBeGreaterThan(0);
      
      // Assumptions dovrebbero menzionare defaults
      const hasDefaultAssumption = plan.assumptions.some(a => 
        a.includes('default') || a.includes('non specificato')
      );
      expect(hasDefaultAssumption).toBe(true);
    });
  });
});

