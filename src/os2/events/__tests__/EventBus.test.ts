// 🧪 UNIT TEST - EventBus
// Test emission e subscription eventi

import { EventBus, PlanStartedEvent, StepStartedEvent, StepSucceededEvent } from '../EventBus';

describe('EventBus', () => {
  let eventBus: EventBus;
  
  beforeEach(() => {
    eventBus = EventBus.getInstance();
    eventBus.clear(); // Clear handlers
  });
  
  describe('Event Emission', () => {
    it('dovrebbe emettere plan_started event', () => {
      const handler = jest.fn();
      
      eventBus.on('plan_started', handler);
      
      const event: PlanStartedEvent = {
        type: 'plan_started',
        planId: 'plan_001',
        userId: 'user123',
        sessionId: 'sess456',
        stepsCount: 3,
        timestamp: Date.now(),
      };
      
      eventBus.emit(event);
      
      expect(handler).toHaveBeenCalledWith(event);
      expect(handler).toHaveBeenCalledTimes(1);
      
      console.log('✅ plan_started event emesso');
    });
    
    it('dovrebbe emettere step_started event', () => {
      const handler = jest.fn();
      
      eventBus.on('step_started', handler);
      
      const event: StepStartedEvent = {
        type: 'step_started',
        planId: 'plan_001',
        userId: 'user123',
        sessionId: 'sess456',
        stepIndex: 0,
        stepId: 'step_0',
        skillId: 'business_plan.run',
        label: 'Calcolo VAN/TIR…',
        timestamp: Date.now(),
      };
      
      eventBus.emit(event);
      
      expect(handler).toHaveBeenCalledWith(event);
      
      console.log('✅ step_started event emesso');
    });
    
    it('dovrebbe chiamare handlers multipli per stesso tipo', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      eventBus.on('step_succeeded', handler1);
      eventBus.on('step_succeeded', handler2);
      
      const event: StepSucceededEvent = {
        type: 'step_succeeded',
        planId: 'plan_001',
        userId: 'user123',
        sessionId: 'sess456',
        stepIndex: 0,
        stepId: 'step_0',
        skillId: 'business_plan.run',
        duration: 2000,
        timestamp: Date.now(),
      };
      
      eventBus.emit(event);
      
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
      
      console.log('✅ Multiple handlers chiamati');
    });
  });
  
  describe('Wildcard Subscription', () => {
    it('dovrebbe chiamare onAny per tutti gli eventi', () => {
      const handler = jest.fn();
      
      eventBus.onAny(handler);
      
      // Emit different event types
      eventBus.emit({
        type: 'plan_started',
        planId: 'plan_001',
        userId: 'user123',
        sessionId: 'sess456',
        stepsCount: 2,
        timestamp: Date.now(),
      });
      
      eventBus.emit({
        type: 'step_started',
        planId: 'plan_001',
        userId: 'user123',
        sessionId: 'sess456',
        stepIndex: 0,
        stepId: 'step_0',
        skillId: 'test.skill',
        label: 'Test',
        timestamp: Date.now(),
      });
      
      expect(handler).toHaveBeenCalledTimes(2);
      
      console.log('✅ onAny handler riceve tutti gli eventi');
    });
  });
  
  describe('Unsubscribe', () => {
    it('dovrebbe permettere unsubscribe', () => {
      const handler = jest.fn();
      
      const unsubscribe = eventBus.on('plan_completed', handler);
      
      // Emit before unsubscribe
      eventBus.emit({
        type: 'plan_completed',
        planId: 'plan_001',
        userId: 'user123',
        sessionId: 'sess456',
        duration: 5000,
        successfulSteps: 3,
        failedSteps: 0,
        success: true,
        timestamp: Date.now(),
      });
      
      expect(handler).toHaveBeenCalledTimes(1);
      
      // Unsubscribe
      unsubscribe();
      
      // Emit after unsubscribe
      eventBus.emit({
        type: 'plan_completed',
        planId: 'plan_002',
        userId: 'user123',
        sessionId: 'sess456',
        duration: 3000,
        successfulSteps: 2,
        failedSteps: 0,
        success: true,
        timestamp: Date.now(),
      });
      
      // Handler non deve essere chiamato
      expect(handler).toHaveBeenCalledTimes(1);
      
      console.log('✅ Unsubscribe funziona');
    });
  });
  
  describe('Flow completo 3-step plan', () => {
    it('dovrebbe emettere 1+3+3+1 eventi per piano 3 step', () => {
      const events: any[] = [];
      
      eventBus.onAny((event) => {
        events.push(event);
      });
      
      // Simula execution di piano 3 step
      const planId = 'plan_001';
      const userId = 'user123';
      const sessionId = 'sess456';
      
      // 1. plan_started
      eventBus.emit({
        type: 'plan_started',
        planId,
        userId,
        sessionId,
        stepsCount: 3,
        timestamp: Date.now(),
      });
      
      // 2-4. step_started × 3
      for (let i = 0; i < 3; i++) {
        eventBus.emit({
          type: 'step_started',
          planId,
          userId,
          sessionId,
          stepIndex: i,
          stepId: `step_${i}`,
          skillId: `skill_${i}`,
          label: `Step ${i}`,
          timestamp: Date.now(),
        });
      }
      
      // 5-7. step_succeeded × 3
      for (let i = 0; i < 3; i++) {
        eventBus.emit({
          type: 'step_succeeded',
          planId,
          userId,
          sessionId,
          stepIndex: i,
          stepId: `step_${i}`,
          skillId: `skill_${i}`,
          duration: 1000 * (i + 1),
          timestamp: Date.now(),
        });
      }
      
      // 8. plan_completed
      eventBus.emit({
        type: 'plan_completed',
        planId,
        userId,
        sessionId,
        duration: 6000,
        successfulSteps: 3,
        failedSteps: 0,
        success: true,
        timestamp: Date.now(),
      });
      
      // Verify event count: 1 + 3 + 3 + 1 = 8
      expect(events).toHaveLength(8);
      
      // Verify sequence
      expect(events[0].type).toBe('plan_started');
      expect(events[1].type).toBe('step_started');
      expect(events[4].type).toBe('step_succeeded');
      expect(events[7].type).toBe('plan_completed');
      
      console.log('✅ Piano 3 step: 8 eventi coerenti (1+3+3+1)');
    });
    
    it('dovrebbe emettere step_failed quando step fallisce', () => {
      const events: any[] = [];
      
      eventBus.onAny((event) => {
        events.push(event);
      });
      
      const planId = 'plan_002';
      const userId = 'user123';
      const sessionId = 'sess456';
      
      // plan_started
      eventBus.emit({
        type: 'plan_started',
        planId,
        userId,
        sessionId,
        stepsCount: 2,
        timestamp: Date.now(),
      });
      
      // step_started (step 0)
      eventBus.emit({
        type: 'step_started',
        planId,
        userId,
        sessionId,
        stepIndex: 0,
        stepId: 'step_0',
        skillId: 'test.skill',
        label: 'Test',
        timestamp: Date.now(),
      });
      
      // step_failed (step 0)
      eventBus.emit({
        type: 'step_failed',
        planId,
        userId,
        sessionId,
        stepIndex: 0,
        stepId: 'step_0',
        skillId: 'test.skill',
        message: 'Validation error',
        duration: 500,
        timestamp: Date.now(),
      });
      
      // Verify
      const failedEvent = events.find(e => e.type === 'step_failed');
      expect(failedEvent).toBeDefined();
      expect(failedEvent.message).toBe('Validation error');
      
      console.log('✅ step_failed emesso correttamente');
    });
  });
});

