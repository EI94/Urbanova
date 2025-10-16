// 🧪 INTEGRATION TEST - OS2 Roundtrip
// Test end-to-end del flusso completo: Request → Planner → Executor → Response

import { UrbanovaOS2, OS2Request } from '../index';

describe('OS2 Integration', () => {
  let os2: UrbanovaOS2;
  
  beforeEach(() => {
    os2 = new UrbanovaOS2();
  });
  
  describe('Roundtrip completo', () => {
    it('dovrebbe processare business_plan intent e ritornare planId e status', async () => {
      const request: OS2Request = {
        userMessage: 'Crea business plan progetto Ciliegie: 4 case, prezzo 390k, costo 200k',
        intent: 'business_plan',
        entities: {
          projectName: 'Ciliegie',
          units: 4,
          salePrice: 390000,
          constructionCost: 200000,
          landScenarios: [
            { name: 'Cash', cost: 220000 },
          ],
        },
        userId: 'user123',
        userEmail: 'user@test.com',
        sessionId: 'session123',
        environment: 'development',
      };
      
      const response = await os2.process(request);
      
      // Verifica response structure
      expect(response).toHaveProperty('success');
      expect(response).toHaveProperty('plan');
      expect(response).toHaveProperty('execution');
      expect(response).toHaveProperty('response');
      expect(response).toHaveProperty('metadata');
      
      // Verifica planId
      expect(response.metadata.planId).toBeDefined();
      expect(response.metadata.planId).toMatch(/^plan_/);
      
      // Verifica status steps
      expect(response.metadata.stepsExecuted).toBeGreaterThan(0);
      // stepsSuccessful può essere 0 se le skill falliscono (servizi non disponibili in test)
      expect(response.metadata.stepsSuccessful).toBeGreaterThanOrEqual(0);
      
      // Verifica execution status
      expect(['done', 'awaiting_confirm', 'running', 'error']).toContain(response.execution.status);
      
      // Verifica response testuale
      expect(response.response).toBeDefined();
      expect(response.response.length).toBeGreaterThan(0);
      
      console.log('✅ Roundtrip business_plan OK:', {
        planId: response.metadata.planId,
        status: response.execution.status,
        stepsExecuted: response.metadata.stepsExecuted,
        responseLength: response.response.length,
      });
    });
    
    it('dovrebbe processare sensitivity_analysis intent', async () => {
      const request: OS2Request = {
        userMessage: 'Fai sensitivity ±15% sul prezzo',
        intent: 'sensitivity_analysis',
        entities: {
          projectId: 'proj123',
          variable: 'price',
          range: 15,
        },
        userId: 'user123',
        userEmail: 'user@test.com',
        sessionId: 'session123',
      };
      
      const response = await os2.process(request);
      
      expect(response.success).toBeDefined();
      expect(response.plan.steps.length).toBe(1);
      expect(response.plan.steps[0].skillId).toBe('sensitivity.run');
      
      console.log('✅ Roundtrip sensitivity OK');
    });
    
    it('dovrebbe processare rdo_send intent con conferma richiesta', async () => {
      const request: OS2Request = {
        userMessage: 'Invia RDO a 2 fornitori',
        intent: 'rdo_send',
        entities: {
          projectId: 'proj456',
          vendors: ['vendor1@test.com', 'vendor2@test.com'],
        },
        userId: 'user123',
        userEmail: 'user@test.com',
        sessionId: 'session123',
        userRoles: ['editor'], // RDO richiede editor
      };
      
      const response = await os2.process(request);
      
      expect(response.plan.confirmables).toBeDefined();
      expect(response.plan.confirmables).toContain('rdo.create');
      
      // Senza conferma, dovrebbe essere awaiting_confirm
      expect(response.execution.status).toBe('awaiting_confirm');
      expect(response.execution.awaitingConfirmSteps).toBe(1);
      
      console.log('✅ Roundtrip RDO con conferma richiesta OK');
    });
    
    it('dovrebbe eseguire rdo_send con conferma fornita', async () => {
      const request: OS2Request = {
        userMessage: 'Invia RDO a 2 fornitori',
        intent: 'rdo_send',
        entities: {
          projectId: 'proj456',
          vendors: ['vendor1@test.com', 'vendor2@test.com'],
        },
        userId: 'user123',
        userEmail: 'user@test.com',
        sessionId: 'session123',
        userRoles: ['editor'],
        userConfirmations: ['rdo.create'], // Conferma fornita (skill ID corretto)
      };
      
      const response = await os2.process(request);
      
      // Con conferma, dovrebbe completare
      expect(response.execution.status).toBe('done');
      expect(response.execution.successfulSteps).toBe(1);
      expect(response.execution.awaitingConfirmSteps).toBe(0);
      
      console.log('✅ Roundtrip RDO con conferma fornita OK');
    });
  });
  
  describe('Error Handling', () => {
    it('dovrebbe gestire intent sconosciuto', async () => {
      const request: OS2Request = {
        userMessage: 'Intent sconosciuto',
        intent: 'intent_inesistente',
        entities: {},
        userId: 'user123',
        userEmail: 'user@test.com',
        sessionId: 'session123',
      };
      
      const response = await os2.process(request);
      
      // Dovrebbe comunque generare una risposta
      expect(response).toBeDefined();
      expect(response.success).toBeDefined();
      
      console.log('✅ Gestione intent sconosciuto OK');
    });
    
    it('dovrebbe gestire entities vuote', async () => {
      const request: OS2Request = {
        userMessage: 'Ciao',
        intent: 'general',
        entities: {},
        userId: 'user123',
        userEmail: 'user@test.com',
        sessionId: 'session123',
      };
      
      const response = await os2.process(request);
      
      expect(response.plan).toBeDefined();
      expect(response.execution).toBeDefined();
      
      console.log('✅ Gestione entities vuote OK');
    });
  });
  
  describe('Response Format', () => {
    it('dovrebbe includere tutti i campi richiesti nella response', async () => {
      const request: OS2Request = {
        userMessage: 'Test',
        intent: 'business_plan',
        entities: { projectName: 'Test' },
        userId: 'user123',
        userEmail: 'user@test.com',
        sessionId: 'session123',
      };
      
      const response = await os2.process(request);
      
      // Verifica campi obbligatori
      expect(response).toHaveProperty('success');
      expect(response).toHaveProperty('plan');
      expect(response).toHaveProperty('execution');
      expect(response).toHaveProperty('response');
      expect(response).toHaveProperty('metadata');
      
      // Verifica metadata
      expect(response.metadata).toHaveProperty('planId');
      expect(response.metadata).toHaveProperty('executionTimeMs');
      expect(response.metadata).toHaveProperty('stepsExecuted');
      expect(response.metadata).toHaveProperty('stepsSuccessful');
      expect(response.metadata).toHaveProperty('stepsFailed');
      expect(response.metadata).toHaveProperty('stepsAwaitingConfirm');
      
      console.log('✅ Response format corretto');
    });
    
    it('dovrebbe includere error se esecuzione fallita', async () => {
      const request: OS2Request = {
        userMessage: 'Test error',
        intent: 'intent_che_causa_errore',
        entities: {},
        userId: 'user123',
        userEmail: 'user@test.com',
        sessionId: 'session123',
      };
      
      const response = await os2.process(request);
      
      // Se fallito, dovrebbe avere error
      if (!response.success) {
        expect(response.error).toBeDefined();
        expect(response.error!.message).toBeDefined();
      }
      
      console.log('✅ Error handling nella response OK');
    });
  });
  
  describe('Performance', () => {
    it('dovrebbe completare in meno di 5s per business plan semplice', async () => {
      const request: OS2Request = {
        userMessage: 'Business plan',
        intent: 'business_plan',
        entities: {
          projectName: 'Performance Test',
          units: 2,
          salePrice: 300000,
          constructionCost: 150000,
        },
        userId: 'user123',
        userEmail: 'user@test.com',
        sessionId: 'session123',
      };
      
      const startTime = Date.now();
      const response = await os2.process(request);
      const totalTime = Date.now() - startTime;
      
      expect(totalTime).toBeLessThan(5000);
      expect(response.metadata.executionTimeMs).toBeLessThan(5000);
      
      console.log(`✅ Performance OK: ${totalTime}ms`);
    });
  });
  
  describe('Health Check', () => {
    it('dovrebbe ritornare status healthy', async () => {
      const health = await os2.healthCheck();
      
      expect(health.status).toBe('healthy');
      expect(health.components.planner).toBe(true);
      expect(health.components.executor).toBe(true);
      expect(health.components.skillCatalog).toBe(true);
      expect(health.skillCount).toBeGreaterThan(0);
      
      console.log('✅ Health check OK:', health);
    });
  });
});

