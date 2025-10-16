/**
 * 🎭 E2E TESTS - OS2 STREAMING & LIVE TICKER
 * Playwright tests per verificare SSE streaming e UI real-time updates
 */

import { test, expect, Page } from '@playwright/test';

test.describe('OS2 Streaming & LiveTicker', () => {
  let page: Page;
  
  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Navigate to app (adjust URL as needed)
    await page.goto('http://localhost:3000');
    
    // Login if needed
    // await page.fill('[data-testid="email"]', 'test@urbanova.com');
    // await page.fill('[data-testid="password"]', 'password');
    // await page.click('[data-testid="login-button"]');
    
    // Open OS2 Sidecar
    await page.keyboard.press('Meta+J'); // or 'Control+J' for Windows/Linux
    await page.waitForSelector('[data-testid="os2-sidecar"]', { timeout: 5000 });
  });
  
  test.afterEach(async () => {
    await page.close();
  });
  
  /**
   * TEST 1: Verifica ricezione plan_started entro 400ms
   */
  test('dovrebbe ricevere plan_started entro 400ms dall\'invio richiesta', async () => {
    // Setup SSE event listener
    const sseEvents: any[] = [];
    
    // Intercept SSE stream
    await page.route('**/api/os2/stream**', async (route) => {
      const response = await route.fetch();
      const reader = response.body()?.getReader();
      
      if (reader) {
        const decoder = new TextDecoder();
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const eventData = JSON.parse(line.slice(6));
              sseEvents.push(eventData);
            }
          }
        }
      }
      
      await route.fulfill({ response });
    });
    
    // Send request
    const requestTime = Date.now();
    
    await page.fill('[data-testid="composer-input"]', 'Crea business plan per Progetto Ciliegie');
    await page.click('[data-testid="composer-send"]');
    
    // Wait for plan_started event
    await page.waitForFunction(() => {
      const ticker = document.querySelector('[data-testid="live-ticker"]');
      return ticker && ticker.textContent?.includes('avviato');
    }, { timeout: 600 });
    
    const firstEventTime = Date.now();
    const latency = firstEventTime - requestTime;
    
    // Assert: latency < 400ms
    expect(latency).toBeLessThan(400);
    
    // Verify plan_started event was received
    const planStartedEvent = sseEvents.find(e => e.type === 'plan_started');
    expect(planStartedEvent).toBeDefined();
    expect(planStartedEvent?.planId).toBeDefined();
  });
  
  /**
   * TEST 2: Verifica UI LiveTicker si aggiorna con step_started → step_succeeded
   */
  test('dovrebbe aggiornare LiveTicker UI con step_started e step_succeeded', async () => {
    // Send request
    await page.fill('[data-testid="composer-input"]', 'Crea business plan');
    await page.click('[data-testid="composer-send"]');
    
    // Wait for LiveTicker to appear
    await page.waitForSelector('[data-testid="live-ticker"]', { timeout: 2000 });
    
    // Verify ticker shows "running" state
    const ticker = page.locator('[data-testid="live-ticker"]');
    await expect(ticker).toBeVisible();
    
    // Wait for first step to start
    await page.waitForFunction(() => {
      const steps = document.querySelectorAll('[data-testid^="ticker-step-"]');
      return steps.length > 0;
    }, { timeout: 3000 });
    
    // Get first step element
    const firstStep = page.locator('[data-testid="ticker-step-0"]');
    await expect(firstStep).toBeVisible();
    
    // Verify step shows skill icon
    const stepIcon = firstStep.locator('[data-testid="step-icon"]');
    await expect(stepIcon).toBeVisible();
    
    // Verify step shows label (e.g., "Calcolo VAN/TIR...")
    const stepLabel = firstStep.locator('[data-testid="step-label"]');
    await expect(stepLabel).toHaveText(/Calcol|Gener|Invio/i);
    
    // Verify step status changes: running → success
    await expect(firstStep).toHaveAttribute('data-status', 'running');
    
    // Wait for step to complete
    await page.waitForFunction(() => {
      const step = document.querySelector('[data-testid="ticker-step-0"]');
      return step?.getAttribute('data-status') === 'success';
    }, { timeout: 10000 });
    
    await expect(firstStep).toHaveAttribute('data-status', 'success');
    
    // Verify success icon/indicator
    const successIcon = firstStep.locator('[data-testid="step-status-icon"]');
    await expect(successIcon).toBeVisible();
  });
  
  /**
   * TEST 3: Simula errore skill e verifica step_failed + messaggio UI + fallback
   */
  test('dovrebbe mostrare step_failed e fallback quando skill fallisce', async () => {
    // Mock skill failure
    await page.route('**/api/os2/chat', async (route) => {
      // Intercept and modify response to simulate failure
      const response = await route.fetch();
      const json = await response.json();
      
      // Inject error in plan
      if (json.plan && json.plan.steps) {
        json.plan.steps[0].status = 'failed';
        json.plan.steps[0].error = 'Validation error: missing data';
      }
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(json),
      });
    });
    
    // Send request that will fail
    await page.fill('[data-testid="composer-input"]', 'Crea business plan');
    await page.click('[data-testid="composer-send"]');
    
    // Wait for LiveTicker
    await page.waitForSelector('[data-testid="live-ticker"]', { timeout: 2000 });
    
    // Wait for step to fail
    await page.waitForFunction(() => {
      const step = document.querySelector('[data-testid="ticker-step-0"]');
      return step?.getAttribute('data-status') === 'failed';
    }, { timeout: 10000 });
    
    const failedStep = page.locator('[data-testid="ticker-step-0"]');
    
    // Verify failed status
    await expect(failedStep).toHaveAttribute('data-status', 'failed');
    
    // Verify error icon
    const errorIcon = failedStep.locator('[data-testid="step-status-icon"]');
    await expect(errorIcon).toBeVisible();
    await expect(errorIcon).toHaveClass(/error|failed|red/i);
    
    // Verify error message is displayed
    const errorMessage = failedStep.locator('[data-testid="step-error-message"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText(/error|failed|validation/i);
    
    // Check if fallback step appears (if configured)
    const hasFallback = await page.locator('[data-testid="ticker-step-0-fallback"]').isVisible().catch(() => false);
    
    if (hasFallback) {
      const fallbackStep = page.locator('[data-testid="ticker-step-0-fallback"]');
      await expect(fallbackStep).toBeVisible();
      await expect(fallbackStep.locator('[data-testid="step-label"]')).toHaveText(/fallback|alternativ/i);
    }
    
    // Verify message item shows error state
    const messageItem = page.locator('[data-testid="message-item-latest"]');
    const statusBadge = messageItem.locator('[data-testid="message-status-badge"]');
    await expect(statusBadge).toHaveText(/error|failed/i);
  });
  
  /**
   * TEST 4: Verifica che ticker collassi quando piano completato
   */
  test('dovrebbe collassare ticker quando piano completato', async () => {
    // Send simple request
    await page.fill('[data-testid="composer-input"]', 'Calcola VAN per Progetto Ciliegie');
    await page.click('[data-testid="composer-send"]');
    
    // Wait for ticker to appear
    await page.waitForSelector('[data-testid="live-ticker"]', { timeout: 2000 });
    const ticker = page.locator('[data-testid="live-ticker"]');
    
    // Verify ticker is expanded during execution
    await expect(ticker).toHaveAttribute('data-expanded', 'true');
    
    // Verify ticker shows active steps
    const activeSteps = ticker.locator('[data-testid^="ticker-step-"]');
    await expect(activeSteps.first()).toBeVisible();
    
    // Wait for plan to complete
    await page.waitForFunction(() => {
      const ticker = document.querySelector('[data-testid="live-ticker"]');
      return ticker?.getAttribute('data-status') === 'completed';
    }, { timeout: 15000 });
    
    // Verify ticker collapses
    await page.waitForTimeout(500); // Animation delay
    await expect(ticker).toHaveAttribute('data-expanded', 'false');
    
    // Verify ticker shows summary (e.g., "Completato in 3.2s")
    const summary = ticker.locator('[data-testid="ticker-summary"]');
    await expect(summary).toBeVisible();
    await expect(summary).toHaveText(/completato|done/i);
    await expect(summary).toHaveText(/[0-9]+\.[0-9]+s/); // Duration in seconds
    
    // Verify steps are hidden in collapsed state
    const stepsContainer = ticker.locator('[data-testid="ticker-steps"]');
    await expect(stepsContainer).not.toBeVisible();
    
    // Verify ticker can be re-expanded by clicking
    await summary.click();
    await expect(ticker).toHaveAttribute('data-expanded', 'true');
    await expect(stepsContainer).toBeVisible();
  });
  
  /**
   * BONUS TEST: Verifica comportamento mobile (sticky ticker)
   */
  test('dovrebbe rendere ticker sticky in mobile viewport', async () => {
    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Send request
    await page.fill('[data-testid="composer-input"]', 'Crea business plan');
    await page.click('[data-testid="composer-send"]');
    
    // Wait for ticker
    await page.waitForSelector('[data-testid="live-ticker"]', { timeout: 2000 });
    const ticker = page.locator('[data-testid="live-ticker"]');
    
    // Verify ticker is sticky
    const tickerPosition = await ticker.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.position;
    });
    
    expect(tickerPosition).toBe('sticky');
    
    // Verify ticker stays at top when scrolling
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(200);
    
    const tickerRect = await ticker.boundingBox();
    expect(tickerRect?.y).toBeLessThan(100); // Should be near top
  });
  
  /**
   * BONUS TEST: Verifica SSE reconnection su errore
   */
  test('dovrebbe riconnettersi automaticamente se SSE connection fallisce', async () => {
    let connectionAttempts = 0;
    
    // Intercept SSE stream and fail first connection
    await page.route('**/api/os2/stream**', async (route) => {
      connectionAttempts++;
      
      if (connectionAttempts === 1) {
        // First attempt: fail
        await route.abort('failed');
      } else {
        // Subsequent attempts: succeed
        const response = await route.fetch();
        await route.fulfill({ response });
      }
    });
    
    // Send request
    await page.fill('[data-testid="composer-input"]', 'Test reconnection');
    await page.click('[data-testid="composer-send"]');
    
    // Wait for reconnection (3s timeout + retry)
    await page.waitForTimeout(4000);
    
    // Verify reconnection happened
    expect(connectionAttempts).toBeGreaterThan(1);
    
    // Verify ticker eventually appears (after reconnection)
    const ticker = page.locator('[data-testid="live-ticker"]');
    await expect(ticker).toBeVisible({ timeout: 2000 });
  });
});

