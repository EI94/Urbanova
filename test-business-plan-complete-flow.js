/**
 * 🧪 TEST COMPLETO BUSINESS PLAN - FLUSSO SALVATAGGIO E RECUPERO
 * 
 * Testa il flusso completo:
 * 1. Creazione Business Plan
 * 2. Auto-salvataggio draft
 * 3. Recupero e modifica
 * 4. Salvataggio completo
 * 5. Verifica persistenza
 */

const { chromium } = require('playwright');

const BASE_URL = 'https://www.urbanova.life';

async function testCompleteBusinessPlanFlow() {
  console.log('🚀 Avvio test completo Business Plan...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 1. Login
    console.log('📝 Step 1: Login...');
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'testuser@urbanova.it');
    await page.fill('input[type="password"]', 'test123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**');
    console.log('✅ Login completato');
    
    // 2. Naviga a Business Plan
    console.log('📝 Step 2: Navigazione Business Plan...');
    await page.goto(`${BASE_URL}/dashboard/business-plan`);
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigazione completata');
    
    // 3. Crea nuovo Business Plan
    console.log('📝 Step 3: Creazione nuovo Business Plan...');
    await page.click('text=Inizia →');
    await page.waitForLoadState('networkidle');
    
    // Compila dati base
    await page.fill('input[placeholder*="Nome progetto"]', 'Test Auto-Save');
    await page.fill('input[placeholder*="Indirizzo"]', 'Via Test 123, Milano');
    await page.fill('input[placeholder*="Numero unità"]', '10');
    
    // Attendi auto-salvataggio
    console.log('⏳ Attesa auto-salvataggio...');
    await page.waitForTimeout(3000);
    
    // Verifica che sia stato salvato come draft
    const draftIndicator = await page.locator('text=Bozza salvata automaticamente').isVisible();
    if (draftIndicator) {
      console.log('✅ Auto-salvataggio draft funzionante');
    } else {
      console.log('❌ Auto-salvataggio draft non rilevato');
    }
    
    // 4. Testa sezione costi migliorata
    console.log('📝 Step 4: Test sezione costi...');
    await page.click('text=Costi');
    await page.waitForTimeout(1000);
    
    // Verifica upload file
    const uploadSection = await page.locator('text=Upload File Costi').isVisible();
    if (uploadSection) {
      console.log('✅ Sezione upload file presente');
    } else {
      console.log('❌ Sezione upload file mancante');
    }
    
    // Testa breakdown dettagliato
    await page.click('text=Dettagliato');
    await page.waitForTimeout(1000);
    
    // Verifica costi aggiuntivi
    const additionalCosts = await page.locator('text=Costi Aggiuntivi').isVisible();
    if (additionalCosts) {
      console.log('✅ Costi aggiuntivi presenti');
    } else {
      console.log('❌ Costi aggiuntivi mancanti');
    }
    
    // Compila alcuni costi
    await page.fill('input[placeholder="es. 400000"]', '400000');
    await page.fill('input[placeholder="es. 200000"]', '200000');
    await page.fill('input[placeholder="es. 150000"]', '150000');
    await page.fill('input[placeholder="es. 50000"]', '50000');
    
    // 5. Testa auto-salvataggio con dati aggiuntivi
    console.log('📝 Step 5: Test auto-salvataggio con dati aggiuntivi...');
    await page.waitForTimeout(3000);
    
    // 6. Naviga via e torna indietro per testare persistenza
    console.log('📝 Step 6: Test persistenza dati...');
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForTimeout(1000);
    await page.goto(`${BASE_URL}/dashboard/business-plan`);
    await page.waitForLoadState('networkidle');
    
    // Verifica che il draft sia ancora presente
    const savedDraft = await page.locator('text=Test Auto-Save').isVisible();
    if (savedDraft) {
      console.log('✅ Draft persistente trovato');
      
      // Clicca sul draft per modificarlo
      await page.click('text=Test Auto-Save');
      await page.waitForLoadState('networkidle');
      
      // Verifica che i dati siano stati recuperati
      const projectName = await page.inputValue('input[placeholder*="Nome progetto"]');
      if (projectName === 'Test Auto-Save') {
        console.log('✅ Dati recuperati correttamente');
      } else {
        console.log('❌ Dati non recuperati correttamente');
      }
    } else {
      console.log('❌ Draft non persistente');
    }
    
    // 7. Testa calcolo Business Plan
    console.log('📝 Step 7: Test calcolo Business Plan...');
    
    // Aggiungi scenario terreno
    await page.click('text=Terreno');
    await page.click('text=Aggiungi Scenario');
    await page.fill('input[placeholder*="Descrizione"]', 'Acquisto cash');
    await page.fill('input[placeholder*="Pagamento anticipato"]', '500000');
    
    // Calcola
    await page.click('text=Calcola Business Plan');
    await page.waitForTimeout(5000);
    
    // Verifica risultati
    const resultsVisible = await page.locator('text=Risultati Business Plan').isVisible();
    if (resultsVisible) {
      console.log('✅ Calcolo Business Plan completato');
    } else {
      console.log('❌ Calcolo Business Plan fallito');
    }
    
    console.log('🎉 Test completo Business Plan terminato!');
    
  } catch (error) {
    console.error('❌ Errore durante il test:', error);
  } finally {
    await browser.close();
  }
}

// Esegui il test
testCompleteBusinessPlanFlow().catch(console.error);
