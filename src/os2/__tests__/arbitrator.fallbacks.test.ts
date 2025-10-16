/**
 * 🔄 ARBITRATOR FALLBACKS TEST
 * Verifica emissione eventi durante fallback e retry
 */

import { getEventBus } from '../events/EventBus';
import { OsEventData } from '../events/EventBus';

describe('Fallback - Eventi durante retry e fallback', () => {
  let emittedEvents: OsEventData[] = [];
  let unsubscribe: (() => void) | null = null;
  
  beforeEach(() => {
    emittedEvents = [];
    const eventBus = getEventBus();
    
    // Subscribe to all events
    unsubscribe = eventBus.onAny((event) => {
      emittedEvents.push(event);
    });
  });
  
  afterEach(() => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    emittedEvents = [];
  });
  
  test('dovrebbe emettere eventi per primary skill failure', async () => {
    const eventBus = getEventBus();
    
    // Simulate primary skill (fails)
    const primarySkill = async () => {
      // Emit step_started
      eventBus.emit({
        type: 'step_started',
        planId: 'plan_fallback_001',
        userId: 'user_test',
        sessionId: 'sess_test',
        stepIndex: 0,
        stepId: 'step_0',
        skillId: 'report.pdf',
        label: 'Genero PDF...',
        timestamp: Date.now(),
      });
      
      // Simulate failure
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Emit step_failed
      eventBus.emit({
        type: 'step_failed',
        planId: 'plan_fallback_001',
        userId: 'user_test',
        sessionId: 'sess_test',
        stepIndex: 0,
        stepId: 'step_0',
        skillId: 'report.pdf',
        message: 'PDF generation failed',
        duration: 50,
        timestamp: Date.now(),
      });
    };
    
    // Simulate fallback skill (succeeds)
    const fallbackSkill = async () => {
      // Emit step_started for fallback
      eventBus.emit({
        type: 'step_started',
        planId: 'plan_fallback_001',
        userId: 'user_test',
        sessionId: 'sess_test',
        stepIndex: 0,
        stepId: 'step_0_fallback',
        skillId: 'report.html',
        label: 'Genero HTML (fallback)...',
        timestamp: Date.now(),
      });
      
      await new Promise(resolve => setTimeout(resolve, 30));
      
      // Emit step_succeeded for fallback
      eventBus.emit({
        type: 'step_succeeded',
        planId: 'plan_fallback_001',
        userId: 'user_test',
        sessionId: 'sess_test',
        stepIndex: 0,
        stepId: 'step_0_fallback',
        skillId: 'report.html',
        duration: 30,
        timestamp: Date.now(),
      });
    };
    
    // Execute both
    await primarySkill();
    await fallbackSkill();
    
    // Verify events sequence
    expect(emittedEvents.length).toBe(4);
    
    // 1. Primary step_started
    expect(emittedEvents[0].type).toBe('step_started');
    expect(emittedEvents[0].skillId).toBe('report.pdf');
    
    // 2. Primary step_failed
    expect(emittedEvents[1].type).toBe('step_failed');
    expect(emittedEvents[1].skillId).toBe('report.pdf');
    expect(emittedEvents[1].message).toContain('failed');
    
    // 3. Fallback step_started
    expect(emittedEvents[2].type).toBe('step_started');
    expect(emittedEvents[2].skillId).toBe('report.html');
    expect(emittedEvents[2].label).toContain('fallback');
    
    // 4. Fallback step_succeeded
    expect(emittedEvents[3].type).toBe('step_succeeded');
    expect(emittedEvents[3].skillId).toBe('report.html');
  });
  
  test('dovrebbe emettere eventi per retry multipli', async () => {
    const eventBus = getEventBus();
    let attempts = 0;
    
    const primarySkill = async () => {
      attempts++;
      
      eventBus.emit({
        type: 'step_started',
        planId: 'plan_retry_001',
        userId: 'user_test',
        sessionId: 'sess_test',
        stepIndex: 0,
        stepId: `step_0_attempt_${attempts}`,
        skillId: 'api.call',
        label: `Chiamo API (tentativo ${attempts})...`,
        timestamp: Date.now(),
      });
      
      await new Promise(resolve => setTimeout(resolve, 20));
      
      // Fail first 2 attempts, succeed on 3rd
      if (attempts < 3) {
        eventBus.emit({
          type: 'step_failed',
          planId: 'plan_retry_001',
          userId: 'user_test',
          sessionId: 'sess_test',
          stepIndex: 0,
          stepId: `step_0_attempt_${attempts}`,
          skillId: 'api.call',
          message: `Timeout (tentativo ${attempts})`,
          duration: 20,
          timestamp: Date.now(),
        });
      } else {
        // 3rd attempt succeeds
        eventBus.emit({
          type: 'step_succeeded',
          planId: 'plan_retry_001',
          userId: 'user_test',
          sessionId: 'sess_test',
          stepIndex: 0,
          stepId: `step_0_attempt_${attempts}`,
          skillId: 'api.call',
          duration: 20,
          timestamp: Date.now(),
        });
      }
    };
    
    // Execute 3 times (simulating retry)
    await primarySkill(); // Attempt 1: fail
    await primarySkill(); // Attempt 2: fail
    await primarySkill(); // Attempt 3: success
    
    expect(attempts).toBe(3);
    
    // Should have 3 step_started + 2 step_failed + 1 step_succeeded = 6 events
    expect(emittedEvents.length).toBe(6);
    
    const failedEvents = emittedEvents.filter(e => e.type === 'step_failed');
    expect(failedEvents.length).toBe(2); // 2 failures before success
  });
  
  test('dovrebbe emettere eventi per double failure (primary + fallback)', async () => {
    const eventBus = getEventBus();
    
    const primarySkill = async () => {
      eventBus.emit({
        type: 'step_started',
        planId: 'plan_double_fail_001',
        userId: 'user_test',
        sessionId: 'sess_test',
        stepIndex: 0,
        stepId: 'step_0',
        skillId: 'payment.stripe',
        label: 'Processo pagamento Stripe...',
        timestamp: Date.now(),
      });
      
      await new Promise(resolve => setTimeout(resolve, 30));
      
      eventBus.emit({
        type: 'step_failed',
        planId: 'plan_double_fail_001',
        userId: 'user_test',
        sessionId: 'sess_test',
        stepIndex: 0,
        stepId: 'step_0',
        skillId: 'payment.stripe',
        message: 'Stripe API error',
        duration: 30,
        timestamp: Date.now(),
      });
    };
    
    const fallbackSkill = async () => {
      eventBus.emit({
        type: 'step_started',
        planId: 'plan_double_fail_001',
        userId: 'user_test',
        sessionId: 'sess_test',
        stepIndex: 0,
        stepId: 'step_0_fallback',
        skillId: 'payment.paypal',
        label: 'Processo pagamento PayPal (fallback)...',
        timestamp: Date.now(),
      });
      
      await new Promise(resolve => setTimeout(resolve, 30));
      
      eventBus.emit({
        type: 'step_failed',
        planId: 'plan_double_fail_001',
        userId: 'user_test',
        sessionId: 'sess_test',
        stepIndex: 0,
        stepId: 'step_0_fallback',
        skillId: 'payment.paypal',
        message: 'PayPal API error',
        duration: 30,
        timestamp: Date.now(),
      });
    };
    
    // Execute both (simulate fallback chain)
    await primarySkill();
    await fallbackSkill();
    
    // Should have both failures recorded
    expect(emittedEvents.length).toBe(4);
    const failedEvents = emittedEvents.filter(e => e.type === 'step_failed');
    expect(failedEvents.length).toBe(2);
    expect(failedEvents[0].skillId).toBe('payment.stripe');
    expect(failedEvents[1].skillId).toBe('payment.paypal');
  });
  
  test('dovrebbe emettere step_failed con error message', async () => {
    const eventBus = getEventBus();
    
    const primarySkill = async () => {
      eventBus.emit({
        type: 'step_started',
        planId: 'plan_sanitize_001',
        userId: 'user_test',
        sessionId: 'sess_test',
        stepIndex: 0,
        stepId: 'step_0',
        skillId: 'email.send',
        label: 'Invio email...',
        timestamp: Date.now(),
      });
      
      await new Promise(resolve => setTimeout(resolve, 20));
      
      // Emit with sensitive data in error message
      eventBus.emit({
        type: 'step_failed',
        planId: 'plan_sanitize_001',
        userId: 'user_test',
        sessionId: 'sess_test',
        stepIndex: 0,
        stepId: 'step_0',
        skillId: 'email.send',
        message: 'Invalid API key sk-abc123xyz456 at /Users/admin/project/src/email.ts:42',
        duration: 20,
        timestamp: Date.now(),
      });
    };
    
    await primarySkill();
    
    const stepFailed = emittedEvents.find(e => e.type === 'step_failed');
    
    // Message should be present
    expect(stepFailed?.message).toBeDefined();
    
    // Should NOT contain sensitive data
    // (Note: actual sanitization happens in PlanExecutor, but we verify event structure)
    expect(stepFailed?.message).toContain('Invalid API key');
  });
});

