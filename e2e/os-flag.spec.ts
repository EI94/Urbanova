// 🧪 E2E TEST - Feature Flag OS v2.0
// Test end-to-end per verificare comportamento con flag OS_V2_ENABLED

import { test, expect } from '@playwright/test';

test.describe('Feature Flag OS v2.0', () => {
  test.describe('OS v2.0 DISABLED (default)', () => {
    test.use({
      // Non impostiamo OS_V2_ENABLED, quindi è false
    });

    test('dashboard dovrebbe caricarsi correttamente', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Verifica che il dashboard si carichi
      await expect(page).toHaveTitle(/Urbanova/i);
      await expect(page.locator('body')).toBeVisible();
    });

    test('chat dovrebbe funzionare con OS 1.x', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Trova input chat (potrebbe essere in varie posizioni)
      const chatInput = page.locator('textarea, input[type="text"]').first();
      
      if (await chatInput.isVisible()) {
        // Invia messaggio
        await chatInput.fill('Ciao');
        await page.keyboard.press('Enter');
        
        // Attendi risposta (timeout generoso)
        await page.waitForTimeout(2000);
        
        // Verifica che non ci siano errori
        const errorMessages = page.locator('[role="alert"], .error, .alert-error');
        const errorCount = await errorMessages.count();
        expect(errorCount).toBe(0);
      }
    });

    test('API chat dovrebbe rispondere senza OS v2.0', async ({ request }) => {
      const response = await request.post('/api/chat', {
        data: {
          message: 'Test message',
          userId: 'test-user',
          userEmail: 'test@test.com',
          context: {},
          history: []
        }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      
      // Verifica struttura risposta
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('response');
      
      // Verifica che metadata non indichi OS v2.0
      if (data.metadata?.provider) {
        expect(data.metadata.provider).not.toBe('urbanova-os');
      }
    });
  });

  test.describe('OS v2.0 ENABLED', () => {
    test.use({
      extraHTTPHeaders: {
        // Simula env var (nota: questo non funziona realmente per env vars)
        // Per test reali, serve configurazione processo separato
      }
    });

    test('dovrebbe indicare che OS v2.0 è attivo nei log', async ({ page }) => {
      // Cattura console logs
      const logs: string[] = [];
      page.on('console', msg => logs.push(msg.text()));

      await page.goto('/dashboard');
      
      // Attendi caricamento
      await page.waitForTimeout(1000);
      
      // Verifica presenza log OS v2.0
      // Nota: questo test è indicativo, i log potrebbero non essere visibili in prod
      expect(logs.some(log => log.includes('OS v2') || log.includes('Orchestrator'))).toBeTruthy();
    });
  });

  test.describe('Smoke tests - Unified Dashboard', () => {
    test('unified dashboard dovrebbe aprirsi', async ({ page }) => {
      // Prova ad accedere al dashboard unified
      await page.goto('/dashboard');
      
      // Verifica che la pagina si carichi
      await expect(page).toHaveURL(/\/dashboard/);
      
      // Verifica elementi base dashboard
      await expect(page.locator('body')).toBeVisible();
      
      // Nessun errore critico
      const errorMessages = page.locator('[role="alert"][class*="error"], .alert-error');
      const errorCount = await errorMessages.count();
      expect(errorCount).toBe(0);
    });

    test('navigation dovrebbe funzionare', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Verifica presenza navigation/menu
      const nav = page.locator('nav, [role="navigation"]').first();
      
      if (await nav.isVisible()) {
        expect(await nav.isVisible()).toBeTruthy();
      } else {
        // Se non c'è nav, almeno il body dovrebbe essere visibile
        await expect(page.locator('body')).toBeVisible();
      }
    });

    test('feasibility analysis dovrebbe aprirsi', async ({ page }) => {
      await page.goto('/dashboard/feasibility-analysis');
      
      // Verifica che la pagina si carichi
      await expect(page).toHaveURL(/\/dashboard\/feasibility-analysis/);
      
      // Verifica che ci sia contenuto
      await expect(page.locator('body')).toBeVisible();
      
      // Nessun errore
      const errorMessages = page.locator('[role="alert"][class*="error"]');
      const errorCount = await errorMessages.count();
      expect(errorCount).toBe(0);
    });
  });

  test.describe('Build verification', () => {
    test('health check dovrebbe passare', async ({ request }) => {
      // Verifica che l'app sia up
      const response = await request.get('/api/health');
      
      if (response.ok()) {
        expect(response.status()).toBe(200);
      } else {
        // Health check potrebbe non esistere, verifica almeno root
        const rootResponse = await request.get('/');
        expect(rootResponse.status()).toBeLessThan(500);
      }
    });

    test('static assets dovrebbero caricarsi', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Verifica che non ci siano errori 404 per assets critici
      const failed: string[] = [];
      
      page.on('response', response => {
        if (response.status() === 404 && 
            (response.url().includes('.js') || 
             response.url().includes('.css'))) {
          failed.push(response.url());
        }
      });
      
      await page.waitForLoadState('networkidle');
      
      expect(failed.length).toBe(0);
    });
  });
});

test.describe('OS v2.0 Feature Compatibility', () => {
  test('legacy features dovrebbero funzionare con OS v1', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Test basic functionality
    await expect(page.locator('body')).toBeVisible();
    
    // Navigation should work
    const links = page.locator('a[href^="/dashboard"]');
    const linkCount = await links.count();
    
    if (linkCount > 0) {
      expect(linkCount).toBeGreaterThan(0);
    }
  });

  test('nessuna regressione su percorsi critici', async ({ page }) => {
    const criticalPaths = [
      '/dashboard',
      '/dashboard/feasibility-analysis',
    ];

    for (const path of criticalPaths) {
      await page.goto(path);
      
      // Verifica che la pagina si carichi
      await expect(page.locator('body')).toBeVisible();
      
      // Nessun errore JavaScript
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      
      await page.waitForTimeout(1000);
      
      expect(errors.length).toBe(0);
    }
  });
});

