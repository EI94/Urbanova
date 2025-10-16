/**
 * 📡 EXECUTOR EVENTS TEST
 * Verifica emissione corretta sequenza eventi durante esecuzione piano
 */

import { PlanExecutor } from '../executor/PlanExecutor';
import { getEventBus } from '../events/EventBus';
import { ActionPlan, ExecutionContext } from '../planner/ActionPlan';
import { getSkillCatalog } from '../skills/SkillCatalog';
import { OsEventData } from '../events/EventBus';

describe('PlanExecutor - Events Emission', () => {
  let executor: PlanExecutor;
  let eventBus: ReturnType<typeof getEventBus>;
  let emittedEvents: OsEventData[] = [];
  
  beforeEach(() => {
    // Reset
    const skillCatalog = getSkillCatalog();
    executor = new PlanExecutor(skillCatalog);
    eventBus = getEventBus();
    emittedEvents = [];
    
    // Subscribe to all events
    eventBus.onAny((event) => {
      emittedEvents.push(event);
    });
  });
  
  afterEach(() => {
    emittedEvents = [];
  });
  
  test('dovrebbe emettere plan_started → step_started → step_succeeded → plan_completed per piano semplice', async () => {
    const plan: ActionPlan = {
      id: 'plan_test_001',
      goal: 'Test plan semplice',
      assumptions: ['Test'],
      steps: [
        {
          skillId: 'business_plan.run',
          inputs: {
            projectId: 'test_proj',
            discountRate: 0.12,
          },
        },
      ],
      risks: [],
      confirmables: [],
    };
    
    const context: ExecutionContext = {
      userId: 'user_test',
      sessionId: 'sess_test',
      projectId: 'test_proj',
      osMode: 'ask_to_act',
      userRole: 'admin',
    };
    
    // Execute
    await executor.execute(plan, context);
    
    // Verify sequence
    expect(emittedEvents.length).toBeGreaterThanOrEqual(4);
    
    // Event 1: plan_started
    const planStarted = emittedEvents.find(e => e.type === 'plan_started');
    expect(planStarted).toBeDefined();
    expect(planStarted?.planId).toBe('plan_test_001');
    expect(planStarted?.userId).toBe('user_test');
    expect(planStarted?.sessionId).toBe('sess_test');
    
    // Event 2: step_started
    const stepStarted = emittedEvents.find(e => e.type === 'step_started');
    expect(stepStarted).toBeDefined();
    expect(stepStarted?.stepIndex).toBe(0);
    expect(stepStarted?.skillId).toBe('business_plan.run');
    expect(stepStarted?.label).toBeDefined();
    
    // Event 3: step_succeeded
    const stepSucceeded = emittedEvents.find(e => e.type === 'step_succeeded');
    expect(stepSucceeded).toBeDefined();
    expect(stepSucceeded?.stepIndex).toBe(0);
    expect(stepSucceeded?.duration).toBeGreaterThan(0);
    
    // Event 4: plan_completed
    const planCompleted = emittedEvents.find(e => e.type === 'plan_completed');
    expect(planCompleted).toBeDefined();
    expect(planCompleted?.planId).toBe('plan_test_001');
    expect(planCompleted?.success).toBe(true);
    expect(planCompleted?.successfulSteps).toBe(1);
    expect(planCompleted?.failedSteps).toBe(0);
  });
  
  test('dovrebbe emettere eventi per piano multi-step (3 step)', async () => {
    const plan: ActionPlan = {
      id: 'plan_multi_001',
      goal: 'Piano 3 step',
      assumptions: [],
      steps: [
        {
          skillId: 'business_plan.run',
          inputs: { projectId: 'test_proj', discountRate: 0.12 },
        },
        {
          skillId: 'sensitivity.run',
          inputs: { projectId: 'test_proj', variables: ['discountRate'] },
        },
        {
          skillId: 'term_sheet.create',
          inputs: { projectId: 'test_proj' },
        },
      ],
      risks: [],
      confirmables: [],
    };
    
    const context: ExecutionContext = {
      userId: 'user_test',
      sessionId: 'sess_test',
      projectId: 'test_proj',
      osMode: 'act',
      userRole: 'admin',
    };
    
    await executor.execute(plan, context);
    
    // Should emit: 1 plan_started + 3 step_started + 3 step_succeeded + 1 plan_completed = 8 events
    expect(emittedEvents.length).toBeGreaterThanOrEqual(8);
    
    // Verify 3 step_started events
    const stepStartedEvents = emittedEvents.filter(e => e.type === 'step_started');
    expect(stepStartedEvents.length).toBe(3);
    expect(stepStartedEvents[0].stepIndex).toBe(0);
    expect(stepStartedEvents[1].stepIndex).toBe(1);
    expect(stepStartedEvents[2].stepIndex).toBe(2);
    
    // Verify 3 step_succeeded events
    const stepSucceededEvents = emittedEvents.filter(e => e.type === 'step_succeeded');
    expect(stepSucceededEvents.length).toBe(3);
    
    // Verify plan completed successfully
    const planCompleted = emittedEvents.find(e => e.type === 'plan_completed');
    expect(planCompleted?.successfulSteps).toBe(3);
    expect(planCompleted?.failedSteps).toBe(0);
  });
  
  test('dovrebbe emettere step_failed quando skill fallisce', async () => {
    const plan: ActionPlan = {
      id: 'plan_fail_001',
      goal: 'Piano con step che fallisce',
      assumptions: [],
      steps: [
        {
          skillId: 'business_plan.run',
          inputs: { projectId: 'test_proj', discountRate: 0.12 },
        },
        {
          // Skill non esistente → fallisce
          skillId: 'nonexistent.skill',
          inputs: {},
        },
      ],
      risks: [],
      confirmables: [],
    };
    
    const context: ExecutionContext = {
      userId: 'user_test',
      sessionId: 'sess_test',
      projectId: 'test_proj',
      osMode: 'act',
      userRole: 'admin',
    };
    
    await executor.execute(plan, context);
    
    // Should have step_failed event
    const stepFailed = emittedEvents.find(e => e.type === 'step_failed');
    expect(stepFailed).toBeDefined();
    expect(stepFailed?.stepIndex).toBe(1);
    expect(stepFailed?.skillId).toBe('nonexistent.skill');
    expect(stepFailed?.message).toBeDefined();
    expect(stepFailed?.duration).toBeGreaterThanOrEqual(0);
    
    // Plan should be marked as failed
    const planCompleted = emittedEvents.find(e => e.type === 'plan_completed');
    expect(planCompleted?.success).toBe(false);
    expect(planCompleted?.successfulSteps).toBe(1);
    expect(planCompleted?.failedSteps).toBe(1);
  });
  
  test('dovrebbe includere label i18n negli eventi step_started', async () => {
    const plan: ActionPlan = {
      id: 'plan_i18n_001',
      goal: 'Test i18n labels',
      assumptions: [],
      steps: [
        {
          skillId: 'business_plan.run',
          inputs: { projectId: 'test_proj', discountRate: 0.12 },
        },
      ],
      risks: [],
      confirmables: [],
    };
    
    const context: ExecutionContext = {
      userId: 'user_test',
      sessionId: 'sess_test',
      projectId: 'test_proj',
      osMode: 'act',
      userRole: 'admin',
    };
    
    await executor.execute(plan, context);
    
    const stepStarted = emittedEvents.find(e => e.type === 'step_started');
    
    // Label should be present and localized (Italian)
    expect(stepStarted?.label).toBeDefined();
    expect(typeof stepStarted?.label).toBe('string');
    expect(stepStarted?.label!.length).toBeGreaterThan(0);
    
    // Should contain meaningful text (not just skillId)
    expect(stepStarted?.label).not.toBe('business_plan.run');
  });
  
  test('dovrebbe tracciare timing correttamente (duration in ms)', async () => {
    const plan: ActionPlan = {
      id: 'plan_timing_001',
      goal: 'Test timing',
      assumptions: [],
      steps: [
        {
          skillId: 'business_plan.run',
          inputs: { projectId: 'test_proj', discountRate: 0.12 },
        },
      ],
      risks: [],
      confirmables: [],
    };
    
    const context: ExecutionContext = {
      userId: 'user_test',
      sessionId: 'sess_test',
      projectId: 'test_proj',
      osMode: 'act',
      userRole: 'admin',
    };
    
    const startTime = Date.now();
    await executor.execute(plan, context);
    const endTime = Date.now();
    
    const planCompleted = emittedEvents.find(e => e.type === 'plan_completed');
    
    // Plan duration should be positive and realistic
    expect(planCompleted?.duration).toBeGreaterThan(0);
    expect(planCompleted?.duration).toBeLessThan(endTime - startTime + 100); // +100ms tolerance
    
    const stepSucceeded = emittedEvents.find(e => e.type === 'step_succeeded');
    expect(stepSucceeded?.duration).toBeGreaterThan(0);
  });
  
  test('dovrebbe emettere eventi nell\'ordine corretto', async () => {
    const plan: ActionPlan = {
      id: 'plan_order_001',
      goal: 'Test ordine eventi',
      assumptions: [],
      steps: [
        {
          skillId: 'business_plan.run',
          inputs: { projectId: 'test_proj', discountRate: 0.12 },
        },
        {
          skillId: 'sensitivity.run',
          inputs: { projectId: 'test_proj', variables: ['discountRate'] },
        },
      ],
      risks: [],
      confirmables: [],
    };
    
    const context: ExecutionContext = {
      userId: 'user_test',
      sessionId: 'sess_test',
      projectId: 'test_proj',
      osMode: 'act',
      userRole: 'admin',
    };
    
    await executor.execute(plan, context);
    
    // Expected order:
    // 1. plan_started
    // 2. step_started (step 0)
    // 3. step_succeeded (step 0)
    // 4. step_started (step 1)
    // 5. step_succeeded (step 1)
    // 6. plan_completed
    
    const eventTypes = emittedEvents.map(e => e.type);
    
    const planStartedIndex = eventTypes.indexOf('plan_started');
    const step0StartedIndex = eventTypes.indexOf('step_started');
    const step0SucceededIndex = eventTypes.indexOf('step_succeeded');
    const planCompletedIndex = eventTypes.lastIndexOf('plan_completed');
    
    // plan_started should be first
    expect(planStartedIndex).toBe(0);
    
    // step_started should come before step_succeeded
    expect(step0StartedIndex).toBeLessThan(step0SucceededIndex);
    
    // plan_completed should be last
    expect(planCompletedIndex).toBe(emittedEvents.length - 1);
  });
});

