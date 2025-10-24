/**
 * 🧪 BUDGET SUPPLIERS E2E TESTS
 * 
 * Test end-to-end per flusso completo Budget & Suppliers
 */

import { test, expect } from '@playwright/test';

// Test data
const testProjectId = 'test-project-e2e';
const testProjectName = 'Progetto Test E2E';

// Mock Excel data
const mockExcelData = {
  'Opere': [
    { 'Descrizione': 'Struttura portante', 'Categoria': 'Strutture', 'UM': 'mq', 'Quantità': 100, 'Prezzo Budget': 300 },
    { 'Descrizione': 'Impianto elettrico', 'Categoria': 'Impianti', 'UM': 'mq', 'Quantità': 100, 'Prezzo Budget': 80 },
    { 'Descrizione': 'Finiture interne', 'Categoria': 'Finiture', 'UM': 'mq', 'Quantità': 100, 'Prezzo Budget': 50 },
    { 'Descrizione': 'Impermeabilizzazione', 'Categoria': 'Strutture', 'UM': 'mq', 'Quantità': 50, 'Prezzo Budget': 25 },
    { 'Descrizione': 'Rivestimenti esterni', 'Categoria': 'Finiture', 'UM': 'mq', 'Quantità': 200, 'Prezzo Budget': 40 }
  ]
};

test.describe('Budget Suppliers E2E Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to Budget Suppliers page
    await page.goto(`/dashboard/projects/${testProjectId}/budget-suppliers`);
    
    // Wait for page to load
    await page.waitForSelector('[data-testid="budget-suppliers-layout"]', { timeout: 10000 });
  });
  
  test('1. Import Excel fittizio → items creati', async ({ page }) => {
    // Click Import Excel button
    await page.click('[data-testid="import-excel-button"]');
    
    // Wait for import dialog
    await page.waitForSelector('[data-testid="import-dialog"]');
    
    // Mock file upload
    const fileInput = page.locator('[data-testid="file-input"]');
    await fileInput.setInputFiles({
      name: 'test-budget.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: Buffer.from('mock excel data')
    });
    
    // Wait for file processing
    await page.waitForSelector('[data-testid="processing-indicator"]');
    await page.waitForSelector('[data-testid="processing-indicator"]', { state: 'hidden', timeout: 5000 });
    
    // Verify mapping dialog appears
    await page.waitForSelector('[data-testid="mapping-dialog"]');
    
    // Confirm mapping (default mapping should be correct)
    await page.click('[data-testid="confirm-mapping-button"]');
    
    // Wait for import completion
    await page.waitForSelector('[data-testid="import-success"]');
    
    // Verify items are created in grid
    await page.waitForSelector('[data-testid="boq-grid"]');
    
    // Check that items are displayed
    const itemRows = page.locator('[data-testid="boq-item-row"]');
    await expect(itemRows).toHaveCount(5);
    
    // Verify specific items
    await expect(page.locator('[data-testid="boq-item-row"]').first()).toContainText('Struttura portante');
    await expect(page.locator('[data-testid="boq-item-row"]').nth(1)).toContainText('Impianto elettrico');
    await expect(page.locator('[data-testid="boq-item-row"]').nth(2)).toContainText('Finiture interne');
    await expect(page.locator('[data-testid="boq-item-row"]').nth(3)).toContainText('Impermeabilizzazione');
    await expect(page.locator('[data-testid="boq-item-row"]').nth(4)).toContainText('Rivestimenti esterni');
  });
  
  test('2. Crea RFP su 5 items, invita 2 fornitori → link portale funziona', async ({ page }) => {
    // Select items for RFP
    await page.check('[data-testid="boq-item-checkbox-0"]'); // Struttura portante
    await page.check('[data-testid="boq-item-checkbox-1"]'); // Impianto elettrico
    await page.check('[data-testid="boq-item-checkbox-2"]'); // Finiture interne
    await page.check('[data-testid="boq-item-checkbox-3"]'); // Impermeabilizzazione
    await page.check('[data-testid="boq-item-checkbox-4"]'); // Rivestimenti esterni
    
    // Click Create RFP button
    await page.click('[data-testid="create-rfp-button"]');
    
    // Wait for RFP creation dialog
    await page.waitForSelector('[data-testid="rfp-create-drawer"]');
    
    // Fill RFP details
    await page.fill('[data-testid="rfp-name-input"]', 'RFP Test E2E');
    await page.fill('[data-testid="rfp-description-input"]', 'RFP per test end-to-end');
    
    // Set due date (7 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    await page.fill('[data-testid="rfp-due-date-input"]', dueDate.toISOString().split('T')[0]);
    
    // Add vendors
    await page.click('[data-testid="add-vendor-button"]');
    await page.fill('[data-testid="vendor-name-input"]', 'Vendor A');
    await page.fill('[data-testid="vendor-email-input"]', 'vendorA@test.com');
    await page.click('[data-testid="confirm-vendor-button"]');
    
    await page.click('[data-testid="add-vendor-button"]');
    await page.fill('[data-testid="vendor-name-input"]', 'Vendor B');
    await page.fill('[data-testid="vendor-email-input"]', 'vendorB@test.com');
    await page.click('[data-testid="confirm-vendor-button"]');
    
    // Create RFP
    await page.click('[data-testid="create-rfp-confirm-button"]');
    
    // Wait for RFP creation
    await page.waitForSelector('[data-testid="rfp-created-success"]');
    
    // Verify RFP appears in list
    await page.waitForSelector('[data-testid="rfp-list"]');
    const rfpCards = page.locator('[data-testid="rfp-card"]');
    await expect(rfpCards).toHaveCount(1);
    
    // Verify RFP details
    await expect(page.locator('[data-testid="rfp-card"]')).toContainText('RFP Test E2E');
    await expect(page.locator('[data-testid="rfp-card"]')).toContainText('5 items');
    await expect(page.locator('[data-testid="rfp-card"]')).toContainText('2 fornitori');
    
    // Get RFP link for vendor portal
    const rfpLink = await page.locator('[data-testid="rfp-vendor-link"]').getAttribute('href');
    expect(rfpLink).toBeDefined();
    expect(rfpLink).toContain('/rfp/');
    
    // Test vendor portal link
    await page.goto(rfpLink!);
    await page.waitForSelector('[data-testid="vendor-portal"]');
    
    // Verify vendor portal shows RFP items
    await expect(page.locator('[data-testid="vendor-portal"]')).toContainText('RFP Test E2E');
    await expect(page.locator('[data-testid="vendor-portal"]')).toContainText('Struttura portante');
    await expect(page.locator('[data-testid="vendor-portal"]')).toContainText('Impianto elettrico');
  });
  
  test('3. Inserisci 2 offerte (una con esclusione) → matrix confronto OK', async ({ page }) => {
    // Navigate to RFP list
    await page.goto(`/dashboard/projects/${testProjectId}/budget-suppliers`);
    await page.waitForSelector('[data-testid="rfp-list"]');
    
    // Click on RFP card
    await page.click('[data-testid="rfp-card"]');
    
    // Wait for RFP details
    await page.waitForSelector('[data-testid="rfp-details"]');
    
    // Submit first offer (Vendor A)
    await page.click('[data-testid="submit-offer-button"]');
    await page.waitForSelector('[data-testid="offer-entry-form"]');
    
    // Fill offer details for Vendor A
    await page.fill('[data-testid="vendor-name-input"]', 'Vendor A');
    await page.fill('[data-testid="item-price-input-0"]', '280'); // Struttura portante
    await page.fill('[data-testid="item-price-input-1"]', '75');  // Impianto elettrico
    await page.fill('[data-testid="item-price-input-2"]', '45');  // Finiture interne
    await page.fill('[data-testid="item-price-input-3"]', '20'); // Impermeabilizzazione
    await page.fill('[data-testid="item-price-input-4"]', '35');  // Rivestimenti esterni
    
    await page.fill('[data-testid="offer-notes-input"]', 'Offerta competitiva senza esclusioni');
    
    // Submit offer
    await page.click('[data-testid="submit-offer-confirm-button"]');
    await page.waitForSelector('[data-testid="offer-submitted-success"]');
    
    // Submit second offer (Vendor B) with exclusions
    await page.click('[data-testid="submit-offer-button"]');
    await page.waitForSelector('[data-testid="offer-entry-form"]');
    
    // Fill offer details for Vendor B
    await page.fill('[data-testid="vendor-name-input"]', 'Vendor B');
    await page.fill('[data-testid="item-price-input-0"]', '290'); // Struttura portante
    await page.fill('[data-testid="item-price-input-1"]', '85');  // Impianto elettrico
    await page.fill('[data-testid="item-price-input-2"]', '55');  // Finiture interne
    await page.fill('[data-testid="item-price-input-3"]', '25');  // Impermeabilizzazione
    await page.fill('[data-testid="item-price-input-4"]', '40');  // Rivestimenti esterni
    
    // Add exclusions for item 1 (Impianto elettrico)
    await page.click('[data-testid="add-exclusion-button-1"]');
    await page.fill('[data-testid="exclusion-input-1"]', 'Trasporto non incluso');
    
    await page.fill('[data-testid="offer-notes-input"]', 'Offerta premium con alcune esclusioni');
    
    // Submit offer
    await page.click('[data-testid="submit-offer-confirm-button"]');
    await page.waitForSelector('[data-testid="offer-submitted-success"]');
    
    // Navigate to comparison
    await page.click('[data-testid="compare-offers-button"]');
    await page.waitForSelector('[data-testid="compare-offers-dialog"]');
    
    // Verify comparison matrix
    await expect(page.locator('[data-testid="comparison-matrix"]')).toBeVisible();
    
    // Check vendor rows
    const vendorRows = page.locator('[data-testid="vendor-row"]');
    await expect(vendorRows).toHaveCount(2);
    
    // Check item columns
    const itemColumns = page.locator('[data-testid="item-column"]');
    await expect(itemColumns).toHaveCount(5);
    
    // Verify Vendor A prices (no exclusions)
    const vendorARow = page.locator('[data-testid="vendor-row"]').first();
    await expect(vendorARow).toContainText('280'); // Struttura portante
    await expect(vendorARow).toContainText('75');  // Impianto elettrico
    await expect(vendorARow).toContainText('45');  // Finiture interne
    await expect(vendorARow).toContainText('20');  // Impermeabilizzazione
    await expect(vendorARow).toContainText('35');  // Rivestimenti esterni
    
    // Verify Vendor B prices (with exclusions)
    const vendorBRow = page.locator('[data-testid="vendor-row"]').nth(1);
    await expect(vendorBRow).toContainText('290'); // Struttura portante
    await expect(vendorBRow).toContainText('85');   // Impianto elettrico
    await expect(vendorBRow).toContainText('55');   // Finiture interne
    await expect(vendorBRow).toContainText('25');   // Impermeabilizzazione
    await expect(vendorBRow).toContainText('40');   // Rivestimenti esterni
    
    // Verify exclusions are highlighted
    await expect(page.locator('[data-testid="exclusion-indicator-1-1"]')).toBeVisible();
    
    // Verify best offer highlighting
    await expect(page.locator('[data-testid="best-offer-indicator-0-0"]')).toBeVisible(); // Vendor A for item 0
    await expect(page.locator('[data-testid="best-offer-indicator-1-0"]')).toBeVisible(); // Vendor A for item 1
    await expect(page.locator('[data-testid="best-offer-indicator-2-0"]')).toBeVisible(); // Vendor A for item 2
    await expect(page.locator('[data-testid="best-offer-indicator-3-0"]')).toBeVisible(); // Vendor A for item 3
    await expect(page.locator('[data-testid="best-offer-indicator-4-0"]')).toBeVisible(); // Vendor A for item 4
  });
  
  test('4. Aggiudica 3 items a vendor A, 2 a vendor B (bundle) → crea contratto', async ({ page }) => {
    // Navigate to comparison
    await page.goto(`/dashboard/projects/${testProjectId}/budget-suppliers`);
    await page.waitForSelector('[data-testid="rfp-list"]');
    await page.click('[data-testid="rfp-card"]');
    await page.click('[data-testid="compare-offers-button"]');
    await page.waitForSelector('[data-testid="compare-offers-dialog"]');
    
    // Award items to vendors
    await page.click('[data-testid="award-item-button-0-0"]'); // Item 0 to Vendor A
    await page.click('[data-testid="award-item-button-1-0"]'); // Item 1 to Vendor A
    await page.click('[data-testid="award-item-button-2-0"]'); // Item 2 to Vendor A
    await page.click('[data-testid="award-item-button-3-1"]'); // Item 3 to Vendor B
    await page.click('[data-testid="award-item-button-4-1"]'); // Item 4 to Vendor B
    
    // Verify awards are marked
    await expect(page.locator('[data-testid="awarded-indicator-0-0"]')).toBeVisible();
    await expect(page.locator('[data-testid="awarded-indicator-1-0"]')).toBeVisible();
    await expect(page.locator('[data-testid="awarded-indicator-2-0"]')).toBeVisible();
    await expect(page.locator('[data-testid="awarded-indicator-3-1"]')).toBeVisible();
    await expect(page.locator('[data-testid="awarded-indicator-4-1"]')).toBeVisible();
    
    // Create contract bundles
    await page.click('[data-testid="create-contract-button"]');
    await page.waitForSelector('[data-testid="contract-creation-dialog"]');
    
    // Create Vendor A bundle
    await page.click('[data-testid="create-bundle-button"]');
    await page.fill('[data-testid="bundle-name-input"]', 'Bundle Vendor A');
    await page.selectOption('[data-testid="bundle-vendor-select"]', 'vendor-a');
    
    // Select items for Vendor A bundle
    await page.check('[data-testid="bundle-item-checkbox-0"]');
    await page.check('[data-testid="bundle-item-checkbox-1"]');
    await page.check('[data-testid="bundle-item-checkbox-2"]');
    
    // Set milestones for Vendor A bundle
    await page.fill('[data-testid="milestone-name-input-0"]', 'Anticipo');
    await page.fill('[data-testid="milestone-percentage-input-0"]', '30');
    await page.fill('[data-testid="milestone-description-input-0"]', 'Pagamento anticipato');
    
    await page.click('[data-testid="add-milestone-button"]');
    await page.fill('[data-testid="milestone-name-input-1"]', 'Sal');
    await page.fill('[data-testid="milestone-percentage-input-1"]', '60');
    await page.fill('[data-testid="milestone-description-input-1"]', 'Pagamento a sal');
    
    await page.click('[data-testid="add-milestone-button"]');
    await page.fill('[data-testid="milestone-name-input-2"]', 'Collaudo');
    await page.fill('[data-testid="milestone-percentage-input-2"]', '10');
    await page.fill('[data-testid="milestone-description-input-2"]', 'Pagamento finale');
    
    await page.click('[data-testid="create-bundle-confirm-button"]');
    
    // Create Vendor B bundle
    await page.click('[data-testid="create-bundle-button"]');
    await page.fill('[data-testid="bundle-name-input"]', 'Bundle Vendor B');
    await page.selectOption('[data-testid="bundle-vendor-select"]', 'vendor-b');
    
    // Select items for Vendor B bundle
    await page.check('[data-testid="bundle-item-checkbox-3"]');
    await page.check('[data-testid="bundle-item-checkbox-4"]');
    
    // Set milestones for Vendor B bundle
    await page.fill('[data-testid="milestone-name-input-0"]', 'Anticipo');
    await page.fill('[data-testid="milestone-percentage-input-0"]', '40');
    await page.fill('[data-testid="milestone-description-input-0"]', 'Pagamento anticipato');
    
    await page.click('[data-testid="add-milestone-button"]');
    await page.fill('[data-testid="milestone-name-input-1"]', 'Sal');
    await page.fill('[data-testid="milestone-percentage-input-1"]', '60');
    await page.fill('[data-testid="milestone-description-input-1"]', 'Pagamento a sal');
    
    await page.click('[data-testid="create-bundle-confirm-button"]');
    
    // Generate contracts
    await page.click('[data-testid="generate-contracts-button"]');
    await page.waitForSelector('[data-testid="contract-generation-progress"]');
    await page.waitForSelector('[data-testid="contract-generation-success"]');
    
    // Verify contracts are created
    await page.waitForSelector('[data-testid="contract-list"]');
    const contractCards = page.locator('[data-testid="contract-card"]');
    await expect(contractCards).toHaveCount(2);
    
    // Verify contract details
    await expect(page.locator('[data-testid="contract-card"]').first()).toContainText('Bundle Vendor A');
    await expect(page.locator('[data-testid="contract-card"]').first()).toContainText('3 items');
    await expect(page.locator('[data-testid="contract-card"]').first()).toContainText('€37,000'); // 280*100 + 75*100 + 45*100
    
    await expect(page.locator('[data-testid="contract-card"]').nth(1)).toContainText('Bundle Vendor B');
    await expect(page.locator('[data-testid="contract-card"]').nth(1)).toContainText('2 items');
    await expect(page.locator('[data-testid="contract-card"]').nth(1)).toContainText('€7,500'); // 25*50 + 40*200
  });
  
  test('5. Registra 2 SAL → consuntivo aggiornato', async ({ page }) => {
    // Navigate to contracts
    await page.goto(`/dashboard/projects/${testProjectId}/budget-suppliers`);
    await page.waitForSelector('[data-testid="contract-list"]');
    
    // Click on first contract
    await page.click('[data-testid="contract-card"]');
    await page.waitForSelector('[data-testid="contract-details"]');
    
    // Record first SAL
    await page.click('[data-testid="record-sal-button"]');
    await page.waitForSelector('[data-testid="sal-recorder-dialog"]');
    
    await page.fill('[data-testid="sal-item-select"]', 'item-0'); // Struttura portante
    await page.fill('[data-testid="sal-amount-input"]', '10000');
    await page.fill('[data-testid="sal-description-input"]', 'SAL 1 - Struttura portante');
    
    await page.click('[data-testid="record-sal-confirm-button"]');
    await page.waitForSelector('[data-testid="sal-recorded-success"]');
    
    // Record second SAL
    await page.click('[data-testid="record-sal-button"]');
    await page.waitForSelector('[data-testid="sal-recorder-dialog"]');
    
    await page.fill('[data-testid="sal-item-select"]', 'item-1'); // Impianto elettrico
    await page.fill('[data-testid="sal-amount-input"]', '5000');
    await page.fill('[data-testid="sal-description-input"]', 'SAL 2 - Impianto elettrico');
    
    await page.click('[data-testid="record-sal-confirm-button"]');
    await page.waitForSelector('[data-testid="sal-recorded-success"]');
    
    // Verify SALs are recorded
    await page.waitForSelector('[data-testid="sal-list"]');
    const salRows = page.locator('[data-testid="sal-row"]');
    await expect(salRows).toHaveCount(2);
    
    // Verify SAL details
    await expect(page.locator('[data-testid="sal-row"]').first()).toContainText('Struttura portante');
    await expect(page.locator('[data-testid="sal-row"]').first()).toContainText('€10,000');
    await expect(page.locator('[data-testid="sal-row"]').first()).toContainText('SAL 1');
    
    await expect(page.locator('[data-testid="sal-row"]').nth(1)).toContainText('Impianto elettrico');
    await expect(page.locator('[data-testid="sal-row"]').nth(1)).toContainText('€5,000');
    await expect(page.locator('[data-testid="sal-row"]').nth(1)).toContainText('SAL 2');
    
    // Verify consuntivo is updated in BoQ grid
    await page.click('[data-testid="back-to-boq-button"]');
    await page.waitForSelector('[data-testid="boq-grid"]');
    
    // Check consuntivo column
    await expect(page.locator('[data-testid="consuntivo-cell-0"]')).toContainText('€10,000');
    await expect(page.locator('[data-testid="consuntivo-cell-1"]')).toContainText('€5,000');
    
    // Check delta vs budget
    await expect(page.locator('[data-testid="delta-cell-0"]')).toContainText('-€20,000'); // 10000 - 30000
    await expect(page.locator('[data-testid="delta-cell-1"]')).toContainText('-€3,000');  // 5000 - 8000
  });
  
  test('6. Sync Business Plan → margine aggiorna', async ({ page }) => {
    // Navigate to Business Plan sync
    await page.goto(`/dashboard/projects/${testProjectId}/budget-suppliers`);
    await page.waitForSelector('[data-testid="sync-bp-button"]');
    
    // Click sync Business Plan button
    await page.click('[data-testid="sync-bp-button"]');
    await page.waitForSelector('[data-testid="sync-bp-dialog"]');
    
    // Verify sync preview
    await expect(page.locator('[data-testid="sync-preview"]')).toBeVisible();
    await expect(page.locator('[data-testid="cost-updates-count"]')).toContainText('5'); // 5 items updated
    await expect(page.locator('[data-testid="margin-impact"]')).toContainText('-€15,000'); // Total SAL impact
    
    // Confirm sync
    await page.click('[data-testid="confirm-sync-button"]');
    await page.waitForSelector('[data-testid="sync-progress"]');
    
    // Wait for sync completion
    await page.waitForSelector('[data-testid="sync-success"]');
    
    // Verify sync results
    await expect(page.locator('[data-testid="sync-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="margin-change"]')).toContainText('-2.3%'); // Approximate margin change
    await expect(page.locator('[data-testid="npv-change"]')).toContainText('-€15,000'); // NPV change
    await expect(page.locator('[data-testid="impact-level"]')).toContainText('MEDIUM'); // Impact level
    
    // Verify recommendations
    await expect(page.locator('[data-testid="sync-recommendations"]')).toBeVisible();
    await expect(page.locator('[data-testid="sync-recommendations"]')).toContainText('Considerare negoziazione fornitori');
    
    // Navigate to Business Plan to verify updates
    await page.goto(`/dashboard/business-plan?projectId=${testProjectId}`);
    await page.waitForSelector('[data-testid="business-plan-form"]');
    
    // Verify cost updates are reflected
    await expect(page.locator('[data-testid="construction-costs"]')).toContainText('€37,000'); // Updated construction costs
    await expect(page.locator('[data-testid="total-costs"]')).toContainText('€44,500'); // Updated total costs
    
    // Verify margin is updated
    await expect(page.locator('[data-testid="margin-percentage"]')).toContainText('12.7%'); // Updated margin
    await expect(page.locator('[data-testid="margin-change-indicator"]')).toContainText('-2.3%'); // Margin change
  });
  
  test('Complete E2E flow integration', async ({ page }) => {
    // Run all steps in sequence
    await test.step('1. Import Excel', async () => {
      await page.goto(`/dashboard/projects/${testProjectId}/budget-suppliers`);
      await page.waitForSelector('[data-testid="budget-suppliers-layout"]');
      
      await page.click('[data-testid="import-excel-button"]');
      await page.waitForSelector('[data-testid="import-dialog"]');
      
      const fileInput = page.locator('[data-testid="file-input"]');
      await fileInput.setInputFiles({
        name: 'test-budget.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        buffer: Buffer.from('mock excel data')
      });
      
      await page.waitForSelector('[data-testid="processing-indicator"]');
      await page.waitForSelector('[data-testid="processing-indicator"]', { state: 'hidden', timeout: 5000 });
      
      await page.waitForSelector('[data-testid="mapping-dialog"]');
      await page.click('[data-testid="confirm-mapping-button"]');
      await page.waitForSelector('[data-testid="import-success"]');
      
      await page.waitForSelector('[data-testid="boq-grid"]');
      const itemRows = page.locator('[data-testid="boq-item-row"]');
      await expect(itemRows).toHaveCount(5);
    });
    
    await test.step('2. Create RFP', async () => {
      // Select all items
      for (let i = 0; i < 5; i++) {
        await page.check(`[data-testid="boq-item-checkbox-${i}"]`);
      }
      
      await page.click('[data-testid="create-rfp-button"]');
      await page.waitForSelector('[data-testid="rfp-create-drawer"]');
      
      await page.fill('[data-testid="rfp-name-input"]', 'RFP Test E2E Complete');
      await page.fill('[data-testid="rfp-description-input"]', 'RFP per test completo');
      
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);
      await page.fill('[data-testid="rfp-due-date-input"]', dueDate.toISOString().split('T')[0]);
      
      // Add vendors
      await page.click('[data-testid="add-vendor-button"]');
      await page.fill('[data-testid="vendor-name-input"]', 'Vendor A');
      await page.fill('[data-testid="vendor-email-input"]', 'vendorA@test.com');
      await page.click('[data-testid="confirm-vendor-button"]');
      
      await page.click('[data-testid="add-vendor-button"]');
      await page.fill('[data-testid="vendor-name-input"]', 'Vendor B');
      await page.fill('[data-testid="vendor-email-input"]', 'vendorB@test.com');
      await page.click('[data-testid="confirm-vendor-button"]');
      
      await page.click('[data-testid="create-rfp-confirm-button"]');
      await page.waitForSelector('[data-testid="rfp-created-success"]');
      
      await page.waitForSelector('[data-testid="rfp-list"]');
      const rfpCards = page.locator('[data-testid="rfp-card"]');
      await expect(rfpCards).toHaveCount(1);
    });
    
    await test.step('3. Submit offers and compare', async () => {
      await page.click('[data-testid="rfp-card"]');
      await page.waitForSelector('[data-testid="rfp-details"]');
      
      // Submit Vendor A offer
      await page.click('[data-testid="submit-offer-button"]');
      await page.waitForSelector('[data-testid="offer-entry-form"]');
      
      await page.fill('[data-testid="vendor-name-input"]', 'Vendor A');
      await page.fill('[data-testid="item-price-input-0"]', '280');
      await page.fill('[data-testid="item-price-input-1"]', '75');
      await page.fill('[data-testid="item-price-input-2"]', '45');
      await page.fill('[data-testid="item-price-input-3"]', '20');
      await page.fill('[data-testid="item-price-input-4"]', '35');
      await page.fill('[data-testid="offer-notes-input"]', 'Offerta competitiva');
      
      await page.click('[data-testid="submit-offer-confirm-button"]');
      await page.waitForSelector('[data-testid="offer-submitted-success"]');
      
      // Submit Vendor B offer with exclusions
      await page.click('[data-testid="submit-offer-button"]');
      await page.waitForSelector('[data-testid="offer-entry-form"]');
      
      await page.fill('[data-testid="vendor-name-input"]', 'Vendor B');
      await page.fill('[data-testid="item-price-input-0"]', '290');
      await page.fill('[data-testid="item-price-input-1"]', '85');
      await page.fill('[data-testid="item-price-input-2"]', '55');
      await page.fill('[data-testid="item-price-input-3"]', '25');
      await page.fill('[data-testid="item-price-input-4"]', '40');
      
      await page.click('[data-testid="add-exclusion-button-1"]');
      await page.fill('[data-testid="exclusion-input-1"]', 'Trasporto non incluso');
      await page.fill('[data-testid="offer-notes-input"]', 'Offerta premium con esclusioni');
      
      await page.click('[data-testid="submit-offer-confirm-button"]');
      await page.waitForSelector('[data-testid="offer-submitted-success"]');
      
      // Compare offers
      await page.click('[data-testid="compare-offers-button"]');
      await page.waitForSelector('[data-testid="compare-offers-dialog"]');
      
      await expect(page.locator('[data-testid="comparison-matrix"]')).toBeVisible();
      const vendorRows = page.locator('[data-testid="vendor-row"]');
      await expect(vendorRows).toHaveCount(2);
    });
    
    await test.step('4. Award contracts', async () => {
      await page.click('[data-testid="award-item-button-0-0"]'); // Item 0 to Vendor A
      await page.click('[data-testid="award-item-button-1-0"]'); // Item 1 to Vendor A
      await page.click('[data-testid="award-item-button-2-0"]'); // Item 2 to Vendor A
      await page.click('[data-testid="award-item-button-3-1"]'); // Item 3 to Vendor B
      await page.click('[data-testid="award-item-button-4-1"]'); // Item 4 to Vendor B
      
      await page.click('[data-testid="create-contract-button"]');
      await page.waitForSelector('[data-testid="contract-creation-dialog"]');
      
      // Create bundles and contracts (simplified)
      await page.click('[data-testid="create-bundle-button"]');
      await page.fill('[data-testid="bundle-name-input"]', 'Bundle Vendor A');
      await page.selectOption('[data-testid="bundle-vendor-select"]', 'vendor-a');
      
      for (let i = 0; i < 3; i++) {
        await page.check(`[data-testid="bundle-item-checkbox-${i}"]`);
      }
      
      await page.fill('[data-testid="milestone-name-input-0"]', 'Anticipo');
      await page.fill('[data-testid="milestone-percentage-input-0"]', '30');
      await page.fill('[data-testid="milestone-description-input-0"]', 'Pagamento anticipato');
      
      await page.click('[data-testid="create-bundle-confirm-button"]');
      
      await page.click('[data-testid="generate-contracts-button"]');
      await page.waitForSelector('[data-testid="contract-generation-success"]');
      
      await page.waitForSelector('[data-testid="contract-list"]');
      const contractCards = page.locator('[data-testid="contract-card"]');
      await expect(contractCards).toHaveCount(1);
    });
    
    await test.step('5. Record SALs', async () => {
      await page.click('[data-testid="contract-card"]');
      await page.waitForSelector('[data-testid="contract-details"]');
      
      // Record SALs
      await page.click('[data-testid="record-sal-button"]');
      await page.waitForSelector('[data-testid="sal-recorder-dialog"]');
      
      await page.fill('[data-testid="sal-item-select"]', 'item-0');
      await page.fill('[data-testid="sal-amount-input"]', '10000');
      await page.fill('[data-testid="sal-description-input"]', 'SAL 1');
      
      await page.click('[data-testid="record-sal-confirm-button"]');
      await page.waitForSelector('[data-testid="sal-recorded-success"]');
      
      await page.click('[data-testid="record-sal-button"]');
      await page.waitForSelector('[data-testid="sal-recorder-dialog"]');
      
      await page.fill('[data-testid="sal-item-select"]', 'item-1');
      await page.fill('[data-testid="sal-amount-input"]', '5000');
      await page.fill('[data-testid="sal-description-input"]', 'SAL 2');
      
      await page.click('[data-testid="record-sal-confirm-button"]');
      await page.waitForSelector('[data-testid="sal-recorded-success"]');
      
      await page.waitForSelector('[data-testid="sal-list"]');
      const salRows = page.locator('[data-testid="sal-row"]');
      await expect(salRows).toHaveCount(2);
    });
    
    await test.step('6. Sync Business Plan', async () => {
      await page.goto(`/dashboard/projects/${testProjectId}/budget-suppliers`);
      await page.waitForSelector('[data-testid="sync-bp-button"]');
      
      await page.click('[data-testid="sync-bp-button"]');
      await page.waitForSelector('[data-testid="sync-bp-dialog"]');
      
      await page.click('[data-testid="confirm-sync-button"]');
      await page.waitForSelector('[data-testid="sync-progress"]');
      await page.waitForSelector('[data-testid="sync-success"]');
      
      await expect(page.locator('[data-testid="sync-results"]')).toBeVisible();
      await expect(page.locator('[data-testid="margin-change"]')).toContainText('-2.3%');
    });
  });
});

