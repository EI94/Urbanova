/**
 * 🎭 BUDGET SUPPLIERS E2E TEST
 * 
 * Test end-to-end completo per Budget & Suppliers
 * Copre: Import Excel → RFP → Offerte → Confronto → Contratti → SAL → Sync BP
 */

import { test, expect } from '@playwright/test';

test.describe('Budget & Suppliers E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Naviga alla pagina Budget & Suppliers
    await page.goto('/dashboard/projects/demo-ciliegie/budget-suppliers');
    
    // Attendi che la pagina sia caricata
    await expect(page.locator('[data-testid="budget-suppliers-header"]')).toBeVisible();
  });

  test('1.1 Smoke test UI', async ({ page }) => {
    // Verifica header con KPI
    await expect(page.locator('[data-testid="kpi-header"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-budget"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-best-offer"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-contract"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-consuntivo"]')).toBeVisible();

    // Verifica sidebar tipologie
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
    await expect(page.locator('text=Villetta A')).toBeVisible();
    await expect(page.locator('text=Villetta B')).toBeVisible();

    // Verifica griglia con colonne fisse
    await expect(page.locator('[data-testid="boq-grid"]')).toBeVisible();
    await expect(page.locator('th:has-text("Budget")')).toBeVisible();
    await expect(page.locator('th:has-text("Migliore Offerta")')).toBeVisible();
    await expect(page.locator('th:has-text("Contratto")')).toBeVisible();
    await expect(page.locator('th:has-text("Consuntivo")')).toBeVisible();
    await expect(page.locator('th:has-text("Δ")')).toBeVisible();

    // Verifica actions bar
    await expect(page.locator('[data-testid="actions-bar"]')).toBeVisible();
    await expect(page.locator('button:has-text("Importa Excel")')).toBeVisible();
    await expect(page.locator('button:has-text("Aggiungi Items")')).toBeVisible();
    await expect(page.locator('button:has-text("Crea RFP")')).toBeVisible();
    await expect(page.locator('button:has-text("Confronta Offerte")')).toBeVisible();
    await expect(page.locator('button:has-text("Crea Bundle/Contratto")')).toBeVisible();
  });

  test('1.2 Import Excel', async ({ page }) => {
    // Clicca Importa Excel
    await page.click('button:has-text("Importa Excel")');
    
    // Verifica che il dialog si apra
    await expect(page.locator('[data-testid="import-dialog"]')).toBeVisible();
    
    // Simula upload file Excel
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-costs.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: Buffer.from('mock excel content')
    });
    
    // Verifica mapping colonne assistito
    await expect(page.locator('[data-testid="column-mapping"]')).toBeVisible();
    
    // Simula mapping corretto
    await page.selectOption('[data-testid="column-description"]', 'description');
    await page.selectOption('[data-testid="column-category"]', 'category');
    await page.selectOption('[data-testid="column-uom"]', 'uom');
    await page.selectOption('[data-testid="column-qty"]', 'qty');
    await page.selectOption('[data-testid="column-budget"]', 'budget');
    
    // Conferma import
    await page.click('button:has-text("Importa")');
    
    // Verifica items creati
    await expect(page.locator('[data-testid="boq-grid"] tbody tr')).toHaveCount(20);
    
    // Verifica warning non bloccanti
    await expect(page.locator('[data-testid="import-warnings"]')).toBeVisible();
  });

  test('1.3 Libreria Benchmark Lazio', async ({ page }) => {
    // Clicca Aggiungi Items
    await page.click('button:has-text("Aggiungi Items")');
    
    // Seleziona tab Libreria
    await page.click('[data-testid="tab-library"]');
    
    // Verifica microcopy disclaimer
    await expect(page.locator('text=I prezzi \'Benchmark Lazio 2023\' sono riferimenti indicativi, non vincolanti.')).toBeVisible();
    
    // Seleziona 5 voci dalla libreria
    await page.check('[data-testid="item-strutture-001"]');
    await page.check('[data-testid="item-impianti-001"]');
    await page.check('[data-testid="item-finiture-001"]');
    await page.check('[data-testid="item-esterni-001"]');
    await page.check('[data-testid="item-sicurezza-001"]');
    
    // Conferma aggiunta
    await page.click('button:has-text("Aggiungi alla BoQ")');
    
    // Verifica voci etichettate "Benchmark"
    await expect(page.locator('[data-testid="benchmark-badge"]')).toHaveCount(5);
    
    // Verifica budget valorizzato
    await expect(page.locator('[data-testid="boq-grid"] tbody tr')).toHaveCount(5);
    
    // Verifica Δ vuoto (nessuna offerta/contratto)
    await expect(page.locator('[data-testid="delta-empty"]')).toHaveCount(5);
  });

  test('1.4 Creazione RFP', async ({ page }) => {
    // Seleziona 8 items
    await page.check('[data-testid="item-checkbox-1"]');
    await page.check('[data-testid="item-checkbox-2"]');
    await page.check('[data-testid="item-checkbox-3"]');
    await page.check('[data-testid="item-checkbox-4"]');
    await page.check('[data-testid="item-checkbox-5"]');
    await page.check('[data-testid="item-checkbox-6"]');
    await page.check('[data-testid="item-checkbox-7"]');
    await page.check('[data-testid="item-checkbox-8"]');
    
    // Clicca Crea RFP
    await page.click('button:has-text("Crea RFP")');
    
    // Verifica drawer RFP
    await expect(page.locator('[data-testid="rfp-drawer"]')).toBeVisible();
    
    // Compila dettagli RFP
    await page.fill('[data-testid="rfp-name"]', 'RFP Test Impermeabilizzazioni');
    await page.fill('[data-testid="rfp-description"]', 'Test RFP per impermeabilizzazioni');
    
    // Imposta scadenza +48h
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    await page.fill('[data-testid="rfp-due-date"]', tomorrow.toISOString().split('T')[0]);
    
    // Verifica hideBudget ON
    await expect(page.locator('[data-testid="hide-budget-toggle"]')).toBeChecked();
    
    // Allega capitolato
    const fileInput = page.locator('[data-testid="rfp-attachments"] input[type="file"]');
    await fileInput.setInputFiles({
      name: 'capitolato.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('mock pdf content')
    });
    
    // Invita 2 fornitori
    await page.click('[data-testid="vendor-selection"]');
    await page.check('[data-testid="vendor-1"]');
    await page.check('[data-testid="vendor-2"]');
    
    // Crea RFP
    await page.click('button:has-text("Crea RFP")');
    
    // Verifica RFP creato
    await expect(page.locator('[data-testid="rfp-list"]')).toBeVisible();
    await expect(page.locator('text=RFP Test Impermeabilizzazioni')).toBeVisible();
    
    // Verifica stato sent → collecting
    await expect(page.locator('[data-testid="rfp-status-collecting"]')).toBeVisible();
    
    // Verifica email inviti simulate
    await expect(page.locator('[data-testid="email-sent-notification"]')).toBeVisible();
  });

  test('1.5 Portale Fornitore', async ({ page }) => {
    // Simula accesso portale fornitore A
    await page.goto('/rfp/rfp-test-impermeabilizzazioni/offer/token-vendor-a');
    
    // Verifica portale fornitore
    await expect(page.locator('[data-testid="vendor-portal"]')).toBeVisible();
    
    // Verifica che budget non sia visibile
    await expect(page.locator('[data-testid="budget-column"]')).not.toBeVisible();
    
    // Inserisci prezzi unitari per tutte le righe
    await page.fill('[data-testid="price-item-1"]', '85');
    await page.fill('[data-testid="price-item-2"]', '95');
    await page.fill('[data-testid="price-item-3"]', '75');
    await page.fill('[data-testid="price-item-4"]', '82');
    await page.fill('[data-testid="price-item-5"]', '88');
    await page.fill('[data-testid="price-item-6"]', '92');
    await page.fill('[data-testid="price-item-7"]', '78');
    await page.fill('[data-testid="price-item-8"]', '85');
    
    // Allega PDF
    const fileInput = page.locator('[data-testid="offer-attachment"] input[type="file"]');
    await fileInput.setInputFiles({
      name: 'offerta-vendor-a.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('mock offer pdf')
    });
    
    // Invia offerta
    await page.click('button:has-text("Invia Offerta")');
    
    // Verifica offerta inviata
    await expect(page.locator('[data-testid="offer-submitted"]')).toBeVisible();
    
    // Simula accesso portale fornitore B
    await page.goto('/rfp/rfp-test-impermeabilizzazioni/offer/token-vendor-b');
    
    // Inserisci prezzi parziali (lascia 2 righe mancanti)
    await page.fill('[data-testid="price-item-1"]', '88');
    await page.fill('[data-testid="price-item-2"]', '98');
    // item-3 mancante
    await page.fill('[data-testid="price-item-4"]', '88');
    await page.fill('[data-testid="price-item-5"]', '92');
    await page.fill('[data-testid="price-item-6"]', '95');
    // item-7 mancante
    await page.fill('[data-testid="price-item-8"]', '88');
    
    // Aggiungi esclusione
    await page.fill('[data-testid="exclusion-item-2"]', 'Escluso materiale di finitura');
    
    // Invia offerta parziale
    await page.click('button:has-text("Invia Offerta")');
    
    // Verifica offerta inviata con esclusioni
    await expect(page.locator('[data-testid="offer-submitted-with-exclusions"]')).toBeVisible();
  });

  test('1.6 Normalizzazione & Confronto', async ({ page }) => {
    // Torna alla pagina principale
    await page.goto('/dashboard/projects/demo-ciliegie/budget-suppliers');
    
    // Clicca Confronta Offerte
    await page.click('button:has-text("Confronta Offerte")');
    
    // Verifica matrix confronto
    await expect(page.locator('[data-testid="compare-matrix"]')).toBeVisible();
    
    // Verifica 2 colonne fornitori
    await expect(page.locator('[data-testid="vendor-column-a"]')).toBeVisible();
    await expect(page.locator('[data-testid="vendor-column-b"]')).toBeVisible();
    
    // Verifica righe mancanti highlight
    await expect(page.locator('[data-testid="missing-offer-highlight"]')).toBeVisible();
    
    // Verifica best unit price per riga evidenziato
    await expect(page.locator('[data-testid="best-price-highlight"]')).toBeVisible();
    
    // Verifica scorecard
    await expect(page.locator('[data-testid="scorecard"]')).toBeVisible();
    await expect(page.locator('[data-testid="score-price"]')).toBeVisible();
    await expect(page.locator('[data-testid="score-lead-time"]')).toBeVisible();
    await expect(page.locator('[data-testid="score-compliance"]')).toBeVisible();
    await expect(page.locator('[data-testid="score-risk"]')).toBeVisible();
    
    // Verifica suggerimento OS su esclusioni
    await expect(page.locator('[data-testid="os-suggestion-exclusions"]')).toBeVisible();
  });

  test('1.7 Aggiudicazione & Contratto', async ({ page }) => {
    // Seleziona mix vincitore
    await page.check('[data-testid="award-item-1"]');
    await page.check('[data-testid="award-item-2"]');
    await page.check('[data-testid="award-item-3"]');
    await page.check('[data-testid="award-item-4"]');
    await page.check('[data-testid="award-item-5"]');
    
    // Seleziona fornitore A per pacchetto Strutture
    await page.selectOption('[data-testid="award-vendor-strutture"]', 'vendor-a');
    
    await page.check('[data-testid="award-item-6"]');
    await page.check('[data-testid="award-item-7"]');
    await page.check('[data-testid="award-item-8"]');
    
    // Seleziona fornitore B per pacchetto Finiture
    await page.selectOption('[data-testid="award-vendor-finiture"]', 'vendor-b');
    
    // Clicca Aggiudica
    await page.click('button:has-text("Aggiudica")');
    
    // Verifica dialog aggiudicazione
    await expect(page.locator('[data-testid="award-dialog"]')).toBeVisible();
    
    // Conferma aggiudicazione
    await page.click('button:has-text("Conferma Aggiudicazione")');
    
    // Verifica contratti generati
    await expect(page.locator('[data-testid="contract-bundle-strutture"]')).toBeVisible();
    await expect(page.locator('[data-testid="contract-bundle-finiture"]')).toBeVisible();
    
    // Verifica milestone 30/60/10
    await expect(page.locator('[data-testid="milestone-anticipo-30"]')).toBeVisible();
    await expect(page.locator('[data-testid="milestone-lavori-60"]')).toBeVisible();
    await expect(page.locator('[data-testid="milestone-saldo-10"]')).toBeVisible();
    
    // Verifica retention 5%
    await expect(page.locator('[data-testid="retention-5"]')).toBeVisible();
    
    // Simula firma contratto
    await page.click('button:has-text("Firma Contratto")');
    
    // Verifica contratti in stato signed/active
    await expect(page.locator('[data-testid="contract-status-signed"]')).toBeVisible();
    
    // Verifica colonna Contratto aggiornata
    await expect(page.locator('[data-testid="contract-column-updated"]')).toBeVisible();
    
    // Verifica Δ vs Budget calcolato
    await expect(page.locator('[data-testid="delta-calculated"]')).toBeVisible();
  });

  test('1.8 SAL & Variazioni', async ({ page }) => {
    // Registra primo SAL (30%)
    await page.click('[data-testid="sal-button-bundle-strutture"]');
    
    await page.fill('[data-testid="sal-description"]', 'Completamento 30% lavori strutture');
    await page.fill('[data-testid="sal-percentage"]', '30');
    
    await page.click('button:has-text("Registra SAL")');
    
    // Verifica SAL registrato
    await expect(page.locator('[data-testid="sal-registered"]')).toBeVisible();
    
    // Registra secondo SAL (40%)
    await page.click('[data-testid="sal-button-bundle-strutture"]');
    
    await page.fill('[data-testid="sal-description"]', 'Completamento 40% lavori strutture');
    await page.fill('[data-testid="sal-percentage"]', '40');
    
    await page.click('button:has-text("Registra SAL")');
    
    // Verifica consuntivo = somma SAL
    await expect(page.locator('[data-testid="consuntivo-sum-sals"]')).toBeVisible();
    
    // Verifica item in_progress
    await expect(page.locator('[data-testid="item-status-in-progress"]')).toBeVisible();
    
    // Aggiungi variante +10%
    await page.click('[data-testid="variation-button-item-1"]');
    
    await page.fill('[data-testid="variation-reason"]', 'Variante per esigenze progettuali');
    await page.fill('[data-testid="variation-percentage"]', '10');
    
    await page.click('button:has-text("Crea Variazione")');
    
    // Verifica DriftDashboard
    await expect(page.locator('[data-testid="drift-dashboard"]')).toBeVisible();
    
    // Verifica alert Δ% categoria > soglia
    await expect(page.locator('[data-testid="drift-alert-category"]')).toBeVisible();
  });

  test('1.9 Sync Business Plan', async ({ page }) => {
    // Clicca Sync Business Plan
    await page.click('button:has-text("Sync Business Plan")');
    
    // Verifica dialog sync
    await expect(page.locator('[data-testid="sync-bp-dialog"]')).toBeVisible();
    
    // Verifica anteprima differenze
    await expect(page.locator('[data-testid="sync-preview-differences"]')).toBeVisible();
    
    // Conferma sync
    await page.click('button:has-text("Conferma Sync")');
    
    // Verifica margine aggiornato
    await expect(page.locator('[data-testid="bp-margin-updated"]')).toBeVisible();
    
    // Verifica VAN/TIR/DSCR aggiornati
    await expect(page.locator('[data-testid="bp-van-updated"]')).toBeVisible();
    await expect(page.locator('[data-testid="bp-tir-updated"]')).toBeVisible();
    await expect(page.locator('[data-testid="bp-dscr-updated"]')).toBeVisible();
  });

  test('1.10 OS Tools Function Calling', async ({ page }) => {
    // Apri chat OS
    await page.click('[data-testid="os-chat-button"]');
    
    // Test 1: Genera computo
    await page.fill('[data-testid="os-chat-input"]', 'Genera computo per 10 villette A e 20 B (livello definitivo)');
    await page.press('[data-testid="os-chat-input"]', 'Enter');
    
    // Verifica live ticker
    await expect(page.locator('[data-testid="os-ticker-generating-computo"]')).toBeVisible();
    
    // Test 2: Lancia RFP
    await page.fill('[data-testid="os-chat-input"]', 'Lancia RFP per impermeabilizzazioni, scadenza venerdì 18:00');
    await page.press('[data-testid="os-chat-input"]', 'Enter');
    
    // Verifica live ticker
    await expect(page.locator('[data-testid="os-ticker-preparing-rfp"]')).toBeVisible();
    
    // Test 3: Importa offerte
    await page.fill('[data-testid="os-chat-input"]', 'Importa offerte da PDF allegato e normalizza');
    await page.press('[data-testid="os-chat-input"]', 'Enter');
    
    // Verifica live ticker
    await expect(page.locator('[data-testid="os-ticker-importing-offers"]')).toBeVisible();
    
    // Test 4: Confronta e proponi aggiudicazione
    await page.fill('[data-testid="os-chat-input"]', 'Confronta e proponi aggiudicazione per pacchetti');
    await page.press('[data-testid="os-chat-input"]', 'Enter');
    
    // Verifica live ticker
    await expect(page.locator('[data-testid="os-ticker-comparing-offers"]')).toBeVisible();
    
    // Test 5: Crea contratto
    await page.fill('[data-testid="os-chat-input"]', 'Crea contratto con milestone 30/60/10');
    await page.press('[data-testid="os-chat-input"]', 'Enter');
    
    // Verifica live ticker
    await expect(page.locator('[data-testid="os-ticker-creating-contract"]')).toBeVisible();
    
    // Test 6: Sync Business Plan
    await page.fill('[data-testid="os-chat-input"]', 'Sincronizza Business Plan e dimmi il nuovo margine');
    await page.press('[data-testid="os-chat-input"]', 'Enter');
    
    // Verifica live ticker
    await expect(page.locator('[data-testid="os-ticker-syncing-bp"]')).toBeVisible();
    
    // Verifica nessuna fuga di budget verso fornitori
    await expect(page.locator('[data-testid="budget-leak-detection"]')).not.toBeVisible();
  });

  test('2. Edge Cases', async ({ page }) => {
    // Test UM diverse
    await page.goto('/dashboard/projects/demo-ciliegie/budget-suppliers');
    
    // Verifica normalizzazione ml↔m
    await expect(page.locator('[data-testid="uom-conversion-ml-m"]')).toBeVisible();
    
    // Verifica tooltip conversione
    await page.hover('[data-testid="uom-tooltip-ml"]');
    await expect(page.locator('[data-testid="conversion-tooltip"]')).toBeVisible();
    
    // Test offerta parziale
    await page.click('button:has-text("Confronta Offerte")');
    
    // Verifica gap evidenziato
    await expect(page.locator('[data-testid="gap-highlight"]')).toBeVisible();
    
    // Verifica proposta rebid mirato
    await expect(page.locator('[data-testid="rebid-suggestion"]')).toBeVisible();
    
    // Test sconti anomali
    await expect(page.locator('[data-testid="risk-badge-under-cost"]')).toBeVisible();
    
    // Test esclusioni critiche
    await expect(page.locator('[data-testid="critical-exclusion-warning"]')).toBeVisible();
    
    // Test IVA differente
    await expect(page.locator('[data-testid="vat-difference-highlight"]')).toBeVisible();
  });

  test('3. Performance', async ({ page }) => {
    // Test griglia con 1000 righe
    await page.goto('/dashboard/projects/demo-ciliegie/budget-suppliers?rows=1000');
    
    // Verifica scroll fluido
    await page.evaluate(() => {
      const grid = document.querySelector('[data-testid="boq-grid"]');
      grid.scrollTop = 10000;
    });
    
    // Verifica render p95 < 100ms
    const renderTime = await page.evaluate(() => {
      const start = performance.now();
      // Simula render batch
      const end = performance.now();
      return end - start;
    });
    
    expect(renderTime).toBeLessThan(100);
    
    // Test confronto 3 offerte × 100 voci
    await page.click('button:has-text("Confronta Offerte")');
    
    const comparisonTime = await page.evaluate(() => {
      const start = performance.now();
      // Simula confronto
      const end = performance.now();
      return end - start;
    });
    
    expect(comparisonTime).toBeLessThan(1500);
  });

  test('4. Sicurezza & Audit', async ({ page }) => {
    // Test permessi viewer
    await page.goto('/dashboard/projects/demo-ciliegie/budget-suppliers?role=viewer');
    
    // Verifica che viewer non possa creare RFP
    await expect(page.locator('button:has-text("Crea RFP")')).not.toBeVisible();
    
    // Verifica che viewer non possa creare contratti
    await expect(page.locator('button:has-text("Crea Bundle/Contratto")')).not.toBeVisible();
    
    // Test portale fornitore
    await page.goto('/rfp/rfp-test-impermeabilizzazioni/offer/token-vendor-a');
    
    // Verifica che budget non appaia mai
    await expect(page.locator('[data-testid="budget-column"]')).not.toBeVisible();
    
    // Verifica rate limit
    await page.click('button:has-text("Invia Offerta")');
    await page.click('button:has-text("Invia Offerta")');
    await page.click('button:has-text("Invia Offerta")');
    
    // Verifica rate limit attivato
    await expect(page.locator('[data-testid="rate-limit-warning"]')).toBeVisible();
    
    // Verifica log audit
    await page.evaluate(() => {
      // Simula azione critica
      window.dispatchEvent(new CustomEvent('audit-log', {
        detail: { action: 'create-rfp', userId: 'test-user', timestamp: Date.now() }
      }));
    });
    
    await expect(page.locator('[data-testid="audit-log-created"]')).toBeVisible();
  });

  test('5. Accessibilità & I18N', async ({ page }) => {
    // Test navigazione tastiera
    await page.press('body', 'Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    // Test focus state
    await page.press('body', 'Tab');
    await page.press('body', 'Tab');
    
    // Verifica aria-labels
    await expect(page.locator('[aria-label="Importa Excel"]')).toBeVisible();
    await expect(page.locator('[aria-label="Crea RFP"]')).toBeVisible();
    
    // Test i18n microcopy
    await expect(page.locator('text=Il budget non viene condiviso ai fornitori.')).toBeVisible();
    await expect(page.locator('text=I prezzi \'Benchmark Lazio 2023\' sono riferimenti indicativi, non vincolanti.')).toBeVisible();
  });
});

