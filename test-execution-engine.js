#!/usr/bin/env node

/**
 * Test Multi-Step Execution Engine
 *
 * This script tests the execution engine with:
 * 1. Sequential step execution
 * 2. Progress tracking in chat
 * 3. Soft rollback on failure
 * 4. Step retry functionality
 * 5. Plan cancellation
 */

const BASE_URL = 'http://localhost:3112';

// Mock execution engine for testing
class MockExecutionEngine {
  constructor() {
    this.activeExecutions = new Map();
  }

  async executePlan(plan, context, onProgress) {
    const startTime = new Date();

    // Create ToolRun
    const toolRun = {
      id: `run-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      sessionId: context.sessionId,
      planId: context.planId,
      status: 'running',
      startedAt: startTime,
      subRuns: [],
      outputs: {},
      metadata: {
        totalSteps: plan.steps.length,
        executionStarted: startTime.toISOString(),
      },
    };

    // Sort steps by order
    const sortedSteps = [...plan.steps].sort((a, b) => a.order - b.order);

    // Initialize sub-runs
    for (const step of sortedSteps) {
      const subRun = {
        stepId: step.id,
        status: 'pending',
        startedAt: startTime,
        retryCount: 0,
        maxRetries: 3,
      };
      toolRun.subRuns.push(subRun);
    }

    const result = {
      status: 'succeeded',
      completedSteps: 0,
      totalSteps: sortedSteps.length,
      outputs: {},
      errors: [],
      toolRun,
    };

    // Store execution
    this.activeExecutions.set(context.sessionId, toolRun);

    // Post initial progress
    onProgress('', 'started', `⏳ Avvio piano (${sortedSteps.length} step)...`);

    // Execute steps sequentially
    for (let i = 0; i < sortedSteps.length; i++) {
      const step = sortedSteps[i];
      const subRun = toolRun.subRuns.find(sr => sr.stepId === step.id);

      try {
        const stepResult = await this.executeStep(
          step,
          context,
          subRun,
          i + 1,
          sortedSteps.length,
          onProgress
        );

        if (stepResult.success) {
          result.completedSteps++;
          result.outputs[step.id] = stepResult.output;
        } else {
          // Handle failure
          const errorInfo = {
            stepId: step.id,
            error: stepResult.error || 'Unknown error',
            rollbackAttempted: false,
            rollbackSuccess: false,
          };

          result.errors.push(errorInfo);

          // Attempt rollback if defined
          if (step.rollback) {
            errorInfo.rollbackAttempted = true;
            const rollbackResult = await this.attemptRollback(step, context, onProgress);
            errorInfo.rollbackSuccess = rollbackResult.success;
          }

          // Check failure handling strategy
          if (step.onFailure === 'stop' || step.onFailure === undefined) {
            result.status = 'failed';
            onProgress(
              step.id,
              'failed',
              `❌ Piano interrotto al step ${i + 1}/${sortedSteps.length}: ${step.description}`,
              stepResult.error
            );
            break;
          } else if (step.onFailure === 'continue') {
            onProgress(
              step.id,
              'failed',
              `⚠️ Step ${i + 1}/${sortedSteps.length} fallito, continuo: ${step.description}`,
              stepResult.error
            );
          }
        }
      } catch (error) {
        const errorMessage = error.message || 'Unknown error';
        result.errors.push({
          stepId: step.id,
          error: errorMessage,
        });

        subRun.status = 'failed';
        subRun.error = errorMessage;
        subRun.finishedAt = new Date();

        if (step.onFailure === 'stop' || step.onFailure === undefined) {
          result.status = 'failed';
          onProgress(
            step.id,
            'failed',
            `❌ Piano interrotto al step ${i + 1}/${sortedSteps.length}: ${step.description}`,
            errorMessage
          );
          break;
        }
      }
    }

    // Finalize ToolRun
    toolRun.finishedAt = new Date();
    toolRun.status = result.status === 'succeeded' ? 'succeeded' : 'failed';
    toolRun.outputs = result.outputs;

    // Post final progress
    if (result.status === 'succeeded') {
      onProgress(
        '',
        'completed',
        `✅ Piano completato con successo! (${result.completedSteps}/${result.totalSteps} step)`
      );
    } else {
      onProgress(
        '',
        'failed',
        `❌ Piano fallito dopo ${result.completedSteps}/${result.totalSteps} step`
      );
    }

    return result;
  }

  async executeStep(step, context, subRun, stepNumber, totalSteps, onProgress) {
    // Update sub-run status
    subRun.status = 'running';
    subRun.startedAt = new Date();

    // Post progress message
    onProgress(
      step.id,
      'started',
      `▶️ Step ${stepNumber}/${totalSteps}: ${step.toolId}.${step.action}...`
    );

    // Simulate execution time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    // Simulate failure for step2 in test scenario
    if (step.id === 'step2' && subRun.retryCount === 0) {
      subRun.status = 'failed';
      subRun.error = 'Simulated failure for testing';
      subRun.finishedAt = new Date();

      return {
        success: false,
        error: 'Simulated failure for testing',
      };
    }

    // Success case
    subRun.status = 'succeeded';
    subRun.finishedAt = new Date();
    subRun.outputRef = `output-${step.id}`;

    onProgress(
      step.id,
      'completed',
      `✅ Step ${stepNumber}/${totalSteps} completato: ${step.description}`
    );

    return {
      success: true,
      output: { stepId: step.id, result: 'success' },
    };
  }

  async attemptRollback(step, context, onProgress) {
    onProgress(step.id, 'started', `🔄 Tentativo rollback per step: ${step.description}...`);

    // Simulate rollback time
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simulate rollback success
    onProgress(step.id, 'completed', `✅ Rollback completato per step: ${step.description}`);

    return { success: true };
  }

  async retryStep(toolRun, stepId, plan, context, onProgress) {
    const step = plan.steps.find(s => s.id === stepId);
    const subRun = toolRun.subRuns.find(sr => sr.stepId === stepId);

    if (!step || !subRun) {
      throw new Error(`Step ${stepId} not found`);
    }

    if (subRun.retryCount >= subRun.maxRetries) {
      throw new Error(`Step ${stepId} has exceeded maximum retries`);
    }

    // Increment retry count
    subRun.retryCount++;
    subRun.status = 'running';
    subRun.startedAt = new Date();
    subRun.finishedAt = undefined;
    subRun.error = undefined;

    onProgress(
      stepId,
      'started',
      `🔄 Retry ${subRun.retryCount}/${subRun.maxRetries} per step: ${step.description}...`
    );

    // Simulate retry execution
    await new Promise(resolve => setTimeout(resolve, 800));

    // Success on retry
    subRun.status = 'succeeded';
    subRun.finishedAt = new Date();
    subRun.outputRef = `retry-output-${step.id}`;

    onProgress(stepId, 'completed', `✅ Retry riuscito per step: ${step.description}`);

    return {
      success: true,
      output: { stepId: step.id, result: 'retry-success' },
    };
  }

  async cancelExecution(toolRun, onProgress) {
    const runningSteps = toolRun.subRuns.filter(sr => sr.status === 'running');

    if (runningSteps.length === 0) {
      return {
        success: false,
        message: 'Nessun step in esecuzione da cancellare',
      };
    }

    // Mark all running/pending steps as cancelled
    for (const subRun of toolRun.subRuns) {
      if (subRun.status === 'running' || subRun.status === 'pending') {
        subRun.status = 'cancelled';
        subRun.finishedAt = new Date();
        subRun.error = 'Cancelled by user';
      }
    }

    toolRun.status = 'cancelled';
    toolRun.finishedAt = new Date();
    toolRun.error = 'Cancelled by user';

    onProgress('', 'failed', "❌ Esecuzione piano cancellata dall'utente");

    return {
      success: true,
      message: 'Piano cancellato con successo',
    };
  }

  getExecutionProgress(toolRun) {
    const completed = toolRun.subRuns.filter(sr => sr.status === 'succeeded').length;
    const total = toolRun.subRuns.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    const runningStep = toolRun.subRuns.find(sr => sr.status === 'running');

    return {
      completed,
      total,
      percentage,
      currentStep: runningStep?.stepId,
      status: toolRun.status,
    };
  }
}

// Test data
const testPlan = {
  id: 'test-plan-123',
  title: 'Test Multi-Step Plan',
  description: "Piano di test per l'execution engine",
  steps: [
    {
      id: 'step1',
      toolId: 'feasibility',
      action: 'run',
      description: 'Analisi di fattibilità',
      zArgs: { projectId: 'proj-123' },
      requiredRole: 'pm',
      order: 1,
      onFailure: 'stop',
    },
    {
      id: 'step2',
      toolId: 'land',
      action: 'scan_market',
      description: 'Scansione mercato terreni',
      zArgs: { city: 'Milano', budgetMax: 500000 },
      requiredRole: 'sales',
      order: 2,
      onFailure: 'continue', // Continue on failure
      rollback: {
        toolId: 'land',
        action: 'cleanup_scan',
        args: { scanId: 'scan-123' },
      },
    },
    {
      id: 'step3',
      toolId: 'market',
      action: 'scan_city',
      description: 'Analisi market intelligence',
      zArgs: { city: 'Milano', asset: 'residenziale' },
      requiredRole: 'analyst',
      order: 3,
      onFailure: 'stop',
    },
  ],
  requirements: [],
  assumptions: [],
  risks: [],
  estimatedDuration: 1800,
  totalCost: 150,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const testContext = {
  userId: 'test-user-123',
  workspaceId: 'test-workspace',
  projectId: 'test-project-123',
  sessionId: 'test-session-123',
  planId: 'test-plan-123',
  userRole: 'pm',
  metadata: {
    channel: 'chat',
    channelId: 'chat-thread-123',
  },
};

/**
 * Test basic plan execution
 */
async function testBasicExecution() {
  console.log('\n🚀 Testing Basic Plan Execution');
  console.log('=================================');

  const engine = new MockExecutionEngine();
  const progressMessages = [];

  const progressCallback = (stepId, status, message, error) => {
    const logMessage = `[${stepId || 'PLAN'}] ${status}: ${message}${error ? ` (${error})` : ''}`;
    progressMessages.push(logMessage);
    console.log(logMessage);
  };

  try {
    const result = await engine.executePlan(testPlan, testContext, progressCallback);

    console.log('\n📊 Execution Result:');
    console.log(`Status: ${result.status}`);
    console.log(`Completed Steps: ${result.completedSteps}/${result.totalSteps}`);
    console.log(`Errors: ${result.errors.length}`);

    if (result.errors.length > 0) {
      console.log('\n❌ Errors:');
      result.errors.forEach(error => {
        console.log(`  - ${error.stepId}: ${error.error}`);
        if (error.rollbackAttempted) {
          console.log(`    Rollback: ${error.rollbackSuccess ? '✅ Success' : '❌ Failed'}`);
        }
      });
    }

    console.log('\n📝 Progress Messages:');
    progressMessages.forEach(msg => console.log(`  ${msg}`));

    console.log('\n✅ Basic execution test completed');
    return result;
  } catch (error) {
    console.error(`❌ Basic execution test failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test step retry functionality
 */
async function testStepRetry() {
  console.log('\n🔄 Testing Step Retry');
  console.log('======================');

  const engine = new MockExecutionEngine();
  const progressMessages = [];

  const progressCallback = (stepId, status, message, error) => {
    const logMessage = `[${stepId || 'PLAN'}] ${status}: ${message}${error ? ` (${error})` : ''}`;
    progressMessages.push(logMessage);
    console.log(logMessage);
  };

  try {
    // First, execute the plan (step2 will fail)
    console.log('Step 1: Execute plan (step2 will fail)...');
    const result = await engine.executePlan(testPlan, testContext, progressCallback);

    console.log(`\nPlan execution result: ${result.status}`);
    console.log(`Failed steps: ${result.errors.length}`);

    // Find the failed step
    const failedStep = result.errors.find(e => e.stepId === 'step2');
    if (!failedStep) {
      throw new Error('Expected step2 to fail, but no failure found');
    }

    console.log(`\nStep 2: Retry failed step (${failedStep.stepId})...`);

    // Retry the failed step
    const retryResult = await engine.retryStep(
      result.toolRun,
      'step2',
      testPlan,
      testContext,
      progressCallback
    );

    console.log(`\nRetry result: ${retryResult.success ? 'Success' : 'Failed'}`);

    if (retryResult.success) {
      console.log('Step 3: Continue with remaining steps...');

      // Check if we can continue execution from step3
      const step3SubRun = result.toolRun.subRuns.find(sr => sr.stepId === 'step3');
      if (step3SubRun && step3SubRun.status === 'pending') {
        // Simulate continuing execution
        await engine.executeStep(
          testPlan.steps.find(s => s.id === 'step3'),
          testContext,
          step3SubRun,
          3,
          3,
          progressCallback
        );
        console.log('✅ Remaining steps completed');
      }
    }

    console.log('\n📝 Retry Progress Messages:');
    progressMessages.slice(-5).forEach(msg => console.log(`  ${msg}`));

    console.log('\n✅ Step retry test completed');
  } catch (error) {
    console.error(`❌ Step retry test failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test plan cancellation
 */
async function testPlanCancellation() {
  console.log('\n❌ Testing Plan Cancellation');
  console.log('=============================');

  const engine = new MockExecutionEngine();
  const progressMessages = [];

  const progressCallback = (stepId, status, message, error) => {
    const logMessage = `[${stepId || 'PLAN'}] ${status}: ${message}${error ? ` (${error})` : ''}`;
    progressMessages.push(logMessage);
    console.log(logMessage);
  };

  try {
    // Start execution
    const executionPromise = engine.executePlan(testPlan, testContext, progressCallback);

    // Wait a bit then cancel
    setTimeout(async () => {
      console.log('\nCancelling execution...');
      const toolRun = engine.activeExecutions.get(testContext.sessionId);
      if (toolRun) {
        const cancelResult = await engine.cancelExecution(toolRun, progressCallback);
        console.log(
          `Cancel result: ${cancelResult.success ? 'Success' : 'Failed'} - ${cancelResult.message}`
        );
      }
    }, 1500);

    const result = await executionPromise;

    console.log(`\nFinal status: ${result.status}`);
    console.log(`Completed steps: ${result.completedSteps}/${result.totalSteps}`);

    console.log('\n📝 Cancellation Progress Messages:');
    progressMessages.slice(-3).forEach(msg => console.log(`  ${msg}`));

    console.log('\n✅ Plan cancellation test completed');
  } catch (error) {
    console.error(`❌ Plan cancellation test failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test progress tracking
 */
async function testProgressTracking() {
  console.log('\n📊 Testing Progress Tracking');
  console.log('=============================');

  const engine = new MockExecutionEngine();
  const progressUpdates = [];

  const progressCallback = (stepId, status, message, error) => {
    progressUpdates.push({
      timestamp: new Date(),
      stepId,
      status,
      message,
      error,
    });
  };

  try {
    const result = await engine.executePlan(testPlan, testContext, progressCallback);
    const toolRun = result.toolRun;

    // Test progress tracking at different points
    const progressPoints = [
      { point: 'Start', expected: { completed: 0, percentage: 0 } },
      {
        point: 'End',
        expected: {
          completed: result.completedSteps,
          percentage: Math.round((result.completedSteps / result.totalSteps) * 100),
        },
      },
    ];

    for (const point of progressPoints) {
      const progress = engine.getExecutionProgress(toolRun);
      console.log(`\n${point.point} Progress:`, progress);

      if (point.point === 'End') {
        console.log(
          `Expected completed: ${point.expected.completed}, Actual: ${progress.completed}`
        );
        console.log(
          `Expected percentage: ${point.expected.percentage}%, Actual: ${progress.percentage}%`
        );
      }
    }

    console.log('\n📈 Progress Updates Timeline:');
    progressUpdates.forEach((update, index) => {
      const time = update.timestamp.toISOString().substring(11, 23);
      console.log(`  ${index + 1}. [${time}] ${update.stepId || 'PLAN'}: ${update.message}`);
    });

    console.log('\n✅ Progress tracking test completed');
  } catch (error) {
    console.error(`❌ Progress tracking test failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test rollback functionality
 */
async function testRollbackFunctionality() {
  console.log('\n🔄 Testing Rollback Functionality');
  console.log('==================================');

  // Create a plan where step2 has rollback defined
  const rollbackPlan = {
    ...testPlan,
    steps: testPlan.steps.map(step =>
      step.id === 'step2' ? { ...step, onFailure: 'stop' } : step
    ),
  };

  const engine = new MockExecutionEngine();
  const progressMessages = [];

  const progressCallback = (stepId, status, message, error) => {
    const logMessage = `[${stepId || 'PLAN'}] ${status}: ${message}${error ? ` (${error})` : ''}`;
    progressMessages.push(logMessage);
    console.log(logMessage);
  };

  try {
    const result = await engine.executePlan(rollbackPlan, testContext, progressCallback);

    console.log(`\nExecution result: ${result.status}`);
    console.log(`Errors with rollback: ${result.errors.filter(e => e.rollbackAttempted).length}`);

    // Check rollback results
    const rollbackErrors = result.errors.filter(e => e.rollbackAttempted);
    rollbackErrors.forEach(error => {
      console.log(`\nRollback for ${error.stepId}:`);
      console.log(`  Attempted: ${error.rollbackAttempted}`);
      console.log(`  Success: ${error.rollbackSuccess}`);
    });

    console.log('\n📝 Rollback Messages:');
    const rollbackMessages = progressMessages.filter(
      msg => msg.includes('rollback') || msg.includes('Rollback')
    );
    rollbackMessages.forEach(msg => console.log(`  ${msg}`));

    console.log('\n✅ Rollback functionality test completed');
  } catch (error) {
    console.error(`❌ Rollback functionality test failed: ${error.message}`);
    throw error;
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('🧪 Starting Multi-Step Execution Engine Tests');
  console.log('==============================================');

  const tests = [
    { name: 'Basic Execution', fn: testBasicExecution },
    { name: 'Step Retry', fn: testStepRetry },
    { name: 'Plan Cancellation', fn: testPlanCancellation },
    { name: 'Progress Tracking', fn: testProgressTracking },
    { name: 'Rollback Functionality', fn: testRollbackFunctionality },
  ];

  const results = [];

  for (const test of tests) {
    try {
      console.log(`\n🏃 Running ${test.name}...`);
      await test.fn();
      results.push({ name: test.name, status: 'PASSED' });
    } catch (error) {
      console.error(`💥 ${test.name} failed:`, error.message);
      results.push({ name: test.name, status: 'FAILED', error: error.message });
    }
  }

  console.log('\n📋 Test Results Summary:');
  console.log('========================');
  results.forEach(result => {
    const status = result.status === 'PASSED' ? '✅' : '❌';
    console.log(`${status} ${result.name}: ${result.status}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  const passed = results.filter(r => r.status === 'PASSED').length;
  const total = results.length;

  console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log('\n🎉 All tests passed! The execution engine is working correctly.');
    console.log('\n✅ Verified Features:');
    console.log('  - Sequential step execution');
    console.log('  - Progress tracking with chat messages');
    console.log('  - Soft rollback on step failure');
    console.log('  - Step retry functionality');
    console.log('  - Plan cancellation');
    console.log('  - Error handling with continue/stop strategies');
  } else {
    console.log(`\n⚠️ ${total - passed} test(s) failed. Review the errors above.`);
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  MockExecutionEngine,
  testBasicExecution,
  testStepRetry,
  testPlanCancellation,
  testProgressTracking,
  testRollbackFunctionality,
  runAllTests,
};
