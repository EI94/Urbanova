// 🧪 UNIT TEST - Skills Validation & RBAC
// Test validazione input e controllo permessi

import { createExecutionContext } from '../../planner/ActionPlan';
import * as businessPlanRun from '../businessPlan.run';
import * as sensitivityRun from '../sensitivity.run';
import * as rdoCreate from '../rdo.create';
import * as salRecord from '../sal.record';
import * as salesProposal from '../sales.proposal';

describe('Skills Validation', () => {
  describe('businessPlan.run', () => {
    it('dovrebbe validare input validi', async () => {
      const validInputs = {
        projectName: 'Test Project',
        totalUnits: 4,
        averagePrice: 390000,
        constructionCostPerUnit: 200000,
        landScenarios: [
          {
            name: 'Cash',
            type: 'CASH',
            upfrontPayment: 220000,
          },
        ],
      };
      
      const ctx = createExecutionContext('user123', 'session123');
      
      // Non dovrebbe lanciare errore
      const result = await businessPlanRun.invoke(validInputs, ctx);
      
      expect(result).toHaveProperty('scenarios');
      expect(result).toHaveProperty('bestScenario');
      expect(result.scenarios.length).toBeGreaterThan(0);
    });
    
    it('dovrebbe rifiutare input con projectName mancante', async () => {
      const invalidInputs = {
        totalUnits: 4,
        averagePrice: 390000,
        // projectName mancante
      };
      
      const ctx = createExecutionContext('user123', 'session123');
      
      await expect(
        businessPlanRun.invoke(invalidInputs, ctx)
      ).rejects.toThrow();
    });
    
    it('dovrebbe rifiutare unità negative', async () => {
      const invalidInputs = {
        projectName: 'Test',
        totalUnits: -1, // Invalido
        averagePrice: 390000,
        constructionCostPerUnit: 200000,
        landScenarios: [{ name: 'C', type: 'CASH', upfrontPayment: 100000 }],
      };
      
      const ctx = createExecutionContext('user123', 'session123');
      
      await expect(
        businessPlanRun.invoke(invalidInputs, ctx)
      ).rejects.toThrow();
    });
  });
  
  describe('sensitivity.run', () => {
    it('dovrebbe validare range valido', async () => {
      const validInputs = {
        variable: 'price',
        range: 15,
        baseScenario: {
          averagePrice: 400000,
          constructionCostPerUnit: 200000,
          totalUnits: 4,
          landCost: 220000,
          discountRate: 12,
        },
      };
      
      const ctx = createExecutionContext('user123', 'session123');
      
      const result = await sensitivityRun.invoke(validInputs, ctx);
      
      expect(result).toHaveProperty('scenarios');
      expect(result).toHaveProperty('breakeven');
      expect(result.scenarios.length).toBeGreaterThan(0);
    });
    
    it('dovrebbe rifiutare range > 50%', async () => {
      const invalidInputs = {
        variable: 'price',
        range: 60, // Troppo alto
      };
      
      const ctx = createExecutionContext('user123', 'session123');
      
      await expect(
        sensitivityRun.invoke(invalidInputs, ctx)
      ).rejects.toThrow(/range/i);
    });
  });
  
  describe('rdo.create', () => {
    it('dovrebbe validare email fornitori', async () => {
      const validInputs = {
        projectId: 'proj123',
        vendors: [
          { email: 'vendor1@test.com', name: 'Vendor 1' },
          { email: 'vendor2@test.com', name: 'Vendor 2' },
        ],
      };
      
      const ctx = createExecutionContext('user123', 'session123', {
        userRoles: ['editor'], // RDO richiede editor
      });
      
      const result = await rdoCreate.invoke(validInputs, ctx);
      
      expect(result).toHaveProperty('rdoId');
      expect(result).toHaveProperty('sentCount');
      expect(result.vendors.length).toBe(2);
    });
    
    it('dovrebbe rifiutare email invalide', async () => {
      const invalidInputs = {
        projectId: 'proj123',
        vendors: [
          { email: 'email-invalida', name: 'Vendor' }, // Email non valida
        ],
      };
      
      const ctx = createExecutionContext('user123', 'session123', {
        userRoles: ['editor'],
      });
      
      await expect(
        rdoCreate.invoke(invalidInputs, ctx)
      ).rejects.toThrow(/email/i);
    });
    
    it('dovrebbe richiedere almeno un fornitore', async () => {
      const invalidInputs = {
        projectId: 'proj123',
        vendors: [], // Array vuoto
      };
      
      const ctx = createExecutionContext('user123', 'session123', {
        userRoles: ['editor'],
      });
      
      await expect(
        rdoCreate.invoke(invalidInputs, ctx)
      ).rejects.toThrow(/almeno/i);
    });
  });
  
  describe('sal.record', () => {
    it('dovrebbe validare percentuale 0-100', async () => {
      const validInputs = {
        projectId: 'proj123',
        salNumber: 1,
        completionPercentage: 45,
        description: 'Completamento fondamenta e primo piano',
        worksValue: 250000,
      };
      
      const ctx = createExecutionContext('user123', 'session123', {
        userRoles: ['editor'],
      });
      
      const result = await salRecord.invoke(validInputs, ctx);
      
      expect(result).toHaveProperty('salId');
      expect(result.completionPercentage).toBe(45);
    });
    
    it('dovrebbe rifiutare percentuale > 100', async () => {
      const invalidInputs = {
        projectId: 'proj123',
        salNumber: 1,
        completionPercentage: 150, // Invalido
        description: 'Test',
        worksValue: 100000,
      };
      
      const ctx = createExecutionContext('user123', 'session123', {
        userRoles: ['editor'],
      });
      
      await expect(
        salRecord.invoke(invalidInputs, ctx)
      ).rejects.toThrow();
    });
  });
  
  describe('sales.proposal', () => {
    it('dovrebbe validare dati cliente', async () => {
      const validInputs = {
        projectId: 'proj123',
        projectName: 'Residenza Vista Mare',
        unitSize: 95,
        listPrice: 420000,
        clientName: 'Mario Rossi',
        clientEmail: 'mario.rossi@example.com',
      };
      
      const ctx = createExecutionContext('user123', 'session123', {
        userRoles: ['editor'],
      });
      
      const result = await salesProposal.invoke(validInputs, ctx);
      
      expect(result).toHaveProperty('proposalId');
      expect(result).toHaveProperty('pdfUrl');
      expect(result.finalPrice).toBe(420000); // No discount
    });
    
    it('dovrebbe calcolare sconto correttamente', async () => {
      const validInputs = {
        projectId: 'proj123',
        projectName: 'Test',
        unitSize: 100,
        listPrice: 400000,
        discount: 10, // 10%
        clientName: 'Test Client',
        clientEmail: 'test@test.com',
      };
      
      const ctx = createExecutionContext('user123', 'session123', {
        userRoles: ['editor'],
      });
      
      const result = await salesProposal.invoke(validInputs, ctx);
      
      expect(result.finalPrice).toBe(360000); // 400k - 10%
      expect(result.discount).toBe(10);
    });
  });
});

describe('Skills RBAC', () => {
  describe('rdo.create RBAC', () => {
    it('viewer NON dovrebbe poter inviare RDO', async () => {
      const validInputs = {
        projectId: 'proj123',
        vendors: [
          { email: 'vendor@test.com' },
        ],
      };
      
      const ctxViewer = createExecutionContext('user123', 'session123', {
        userRoles: ['viewer'], // Solo viewer
      });
      
      // NOTA: Validazione RBAC avviene nell'Executor, non nella skill
      // La skill stessa si esegue, ma l'Executor la blocca prima
      // Questo test verifica che la skill meta specifichi rbac corretto
      
      expect(rdoCreate.meta.rbac).toBeDefined();
      expect(rdoCreate.meta.rbac).not.toContain('viewer');
      expect(rdoCreate.meta.rbac).toContain('editor');
      expect(rdoCreate.meta.rbac).toContain('admin');
      
      console.log('✅ rdo.create ha RBAC corretto: editor, admin (NO viewer)');
    });
    
    it('editor DOVREBBE poter inviare RDO', async () => {
      expect(rdoCreate.meta.rbac).toContain('editor');
    });
    
    it('admin DOVREBBE poter inviare RDO', async () => {
      expect(rdoCreate.meta.rbac).toContain('admin');
    });
  });
  
  describe('sal.record RBAC', () => {
    it('viewer NON dovrebbe poter registrare SAL', async () => {
      expect(salRecord.meta.rbac).toBeDefined();
      expect(salRecord.meta.rbac).not.toContain('viewer');
    });
    
    it('editor DOVREBBE poter registrare SAL', async () => {
      expect(salRecord.meta.rbac).toContain('editor');
    });
  });
  
  describe('sales.proposal RBAC', () => {
    it('viewer NON dovrebbe poter creare proposte', async () => {
      expect(salesProposal.meta.rbac).not.toContain('viewer');
    });
    
    it('editor DOVREBBE poter creare proposte', async () => {
      expect(salesProposal.meta.rbac).toContain('editor');
    });
  });
  
  describe('businessPlan.run RBAC', () => {
    it('viewer DOVREBBE poter calcolare BP (read-only)', async () => {
      expect(businessPlanRun.meta.rbac).toContain('viewer');
      expect(businessPlanRun.meta.rbac).toContain('editor');
      expect(businessPlanRun.meta.rbac).toContain('admin');
    });
  });
  
  describe('sensitivity.run RBAC', () => {
    it('viewer DOVREBBE poter fare sensitivity (read-only)', async () => {
      expect(sensitivityRun.meta.rbac).toContain('viewer');
    });
  });
});

describe('Skills Metadata', () => {
  it('tutte le skill dovrebbero avere meta completo', () => {
    const skills = [
      businessPlanRun.meta,
      sensitivityRun.meta,
      rdoCreate.meta,
      salRecord.meta,
      salesProposal.meta,
    ];
    
    skills.forEach(meta => {
      // Campi obbligatori
      expect(meta.id).toBeDefined();
      expect(meta.summary).toBeDefined();
      expect(meta.visibility).toBeDefined();
      expect(meta.inputsSchema).toBeDefined();
      expect(meta.telemetryKey).toBeDefined();
      
      // Campi opzionali ma importanti
      expect(meta).toHaveProperty('latencyBudgetMs');
      expect(meta).toHaveProperty('idempotent');
      expect(meta).toHaveProperty('requiresConfirm');
      expect(meta).toHaveProperty('sideEffects');
      expect(meta).toHaveProperty('rbac');
      expect(meta).toHaveProperty('category');
      expect(meta).toHaveProperty('tags');
      
      console.log(`✅ ${meta.id}: Meta completo`);
    });
  });
  
  it('skill con conferma dovrebbero avere requiresConfirm=true', () => {
    expect(rdoCreate.meta.requiresConfirm).toBe(true);
    // salesProposal non richiede conferma (solo genera PDF)
  });
  
  it('skill con side effects dovrebbero avere idempotent=false', () => {
    // RDO invia email → non idempotent
    expect(rdoCreate.meta.idempotent).toBe(false);
    
    // SAL scrive DB → non idempotent
    expect(salRecord.meta.idempotent).toBe(false);
    
    // Business Plan calculation → idempotent
    expect(businessPlanRun.meta.idempotent).toBe(true);
    
    // Sensitivity → idempotent
    expect(sensitivityRun.meta.idempotent).toBe(true);
  });
  
  it('skill dovrebbero avere visibility corretta', () => {
    // La maggior parte sono global
    expect(businessPlanRun.meta.visibility).toBe('global');
    expect(sensitivityRun.meta.visibility).toBe('global');
    expect(rdoCreate.meta.visibility).toBe('global');
    expect(salesProposal.meta.visibility).toBe('global');
    
    // SAL è context-specific
    expect(salRecord.meta.visibility).toEqual({ context: 'ProjectManagement' });
  });
  
  it('skill dovrebbero avere latency budget ragionevole', () => {
    const skills = [businessPlanRun, sensitivityRun, rdoCreate, salRecord, salesProposal];
    
    skills.forEach(skill => {
      const latency = skill.meta.latencyBudgetMs || 0;
      
      // Latency budget ragionevole: 1-10s
      expect(latency).toBeGreaterThan(0);
      expect(latency).toBeLessThanOrEqual(10000);
    });
  });
});

describe('Skills Telemetry', () => {
  it('dovrebbe emettere event skill_invoked', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    
    const validInputs = {
      projectName: 'Test',
      totalUnits: 2,
      averagePrice: 300000,
      constructionCostPerUnit: 150000,
      landScenarios: [{ name: 'C', type: 'CASH', upfrontPayment: 100000 }],
    };
    
    const ctx = createExecutionContext('user_test', 'session_test');
    
    await businessPlanRun.invoke(validInputs, ctx);
    
    // Verifica telemetry chiamato
    const telemetryCalls = consoleSpy.mock.calls.filter(call => 
      call[0]?.includes('[Telemetry]') && call[0]?.includes('skill_invoked')
    );
    
    expect(telemetryCalls.length).toBeGreaterThan(0);
    
    consoleSpy.mockRestore();
  });
  
  it('dovrebbe emettere event skill_completed con latency', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    
    const validInputs = {
      variable: 'price',
      range: 10,
      baseScenario: {
        averagePrice: 400000,
        constructionCostPerUnit: 200000,
        totalUnits: 4,
        landCost: 220000,
        discountRate: 12,
      },
    };
    
    const ctx = createExecutionContext('user_test', 'session_test');
    
    await sensitivityRun.invoke(validInputs, ctx);
    
    // Verifica completed event
    const completedCalls = consoleSpy.mock.calls.filter(call => 
      call[0]?.includes('[Telemetry]') && call[0]?.includes('skill_completed')
    );
    
    expect(completedCalls.length).toBeGreaterThan(0);
    
    // Verifica latency nel log
    const hasLatency = completedCalls.some(call => 
      JSON.stringify(call).includes('latency')
    );
    expect(hasLatency).toBe(true);
    
    consoleSpy.mockRestore();
  });
});

describe('Skills Integration with Services', () => {
  it('businessPlan.run dovrebbe usare businessPlanService se disponibile', async () => {
    const validInputs = {
      projectName: 'Integration Test',
      totalUnits: 4,
      averagePrice: 390000,
      constructionCostPerUnit: 200000,
      landScenarios: [{ name: 'Cash', type: 'CASH', upfrontPayment: 220000 }],
    };
    
    const ctx = createExecutionContext('user123', 'session123');
    
    const result = await businessPlanRun.invoke(validInputs, ctx);
    
    // Verifica che il risultato abbia la struttura corretta
    expect(result.scenarios).toBeDefined();
    expect(result.bestScenario).toBeDefined();
    expect(result.summary).toBeDefined();
    
    // Deve avere almeno uno scenario
    expect(result.scenarios.length).toBeGreaterThan(0);
    
    // Scenario deve avere metriche chiave
    const scenario = result.scenarios[0];
    expect(scenario).toHaveProperty('npv');
    expect(scenario).toHaveProperty('irr');
    expect(scenario).toHaveProperty('payback');
    expect(scenario).toHaveProperty('grossMargin');
  });
  
  it('sensitivity.run dovrebbe calcolare breakeven', async () => {
    const validInputs = {
      variable: 'price',
      range: 20,
      baseScenario: {
        averagePrice: 400000,
        constructionCostPerUnit: 200000,
        totalUnits: 4,
        landCost: 220000,
        discountRate: 12,
      },
    };
    
    const ctx = createExecutionContext('user123', 'session123');
    
    const result = await sensitivityRun.invoke(validInputs, ctx);
    
    expect(result.breakeven).toBeDefined();
    expect(typeof result.breakeven).toBe('number');
    
    // Breakeven dovrebbe essere nel range testato
    expect(result.breakeven).toBeGreaterThanOrEqual(-20);
    expect(result.breakeven).toBeLessThanOrEqual(20);
    
    // Dovrebbe avere risk analysis
    expect(result.riskAnalysis).toBeDefined();
    expect(result.riskAnalysis.probabilityNegativeNPV).toBeGreaterThanOrEqual(0);
    expect(result.riskAnalysis.probabilityNegativeNPV).toBeLessThanOrEqual(100);
  });
});

