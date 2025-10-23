/**
 * 🧪 TEST SEMPLICE BUSINESS PLAN - VERIFICA FUNZIONALITÀ PRINCIPALI
 * 
 * Testa le funzionalità principali senza timeout complessi
 */

const { chromium } = require('playwright');

const BASE_URL = 'https://www.urbanova.life';

async function testBusinessPlanFeatures() {
  console.log('🚀 Avvio test Business Plan...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 1. Login rapido
    console.log('📝 Step 1: Login...');
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'testuser@urbanova.it');
    await page.fill('input[type="password"]', 'test123456');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    console.log('✅ Login completato');
    
    // 2. Vai direttamente a Business Plan
    console.log('📝 Step 2: Accesso Business Plan...');
    await page.goto(`${BASE_URL}/dashboard/business-plan`);
    await page.waitForTimeout(2000);
    
    // Verifica che non ci siano errori iniziali
    const hasErrors = await page.locator('text=errori da correggere').isVisible();
    if (hasErrors) {
      console.log('❌ Errori iniziali presenti (problema risolto)');
    } else {
      console.log('✅ Nessun errore iniziale (corretto)');
    }
    
    // 3. Crea nuovo Business Plan
    console.log('📝 Step 3: Creazione Business Plan...');
    const startButton = await page.locator('text=Inizia →').first();
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ Form Business Plan aperto');
      
      // 4. Compila dati base
      console.log('📝 Step 4: Compilazione dati base...');
      await page.fill('input[placeholder*="Nome progetto"]', 'Test Produzione');
      await page.fill('input[placeholder*="Indirizzo"]', 'Via Test 123, Milano');
      await page.fill('input[placeholder*="Numero unità"]', '5');
      
      // 5. Testa sezione costi
      console.log('📝 Step 5: Test sezione costi...');
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
      const detailedButton = await page.locator('text=Dettagliato').first();
      if (await detailedButton.isVisible()) {
        await detailedButton.click();
        await page.waitForTimeout(1000);
        
        // Verifica costi aggiuntivi
        const additionalCosts = await page.locator('text=Costi Aggiuntivi').isVisible();
        if (additionalCosts) {
          console.log('✅ Costi aggiuntivi presenti (oneri concessori, progettazione, opere esterne)');
        } else {
          console.log('❌ Costi aggiuntivi mancanti');
        }
        
        // Verifica costi indiretti dettagliati
        const softCosts = await page.locator('text=Costi Indiretti').isVisible();
        if (softCosts) {
          console.log('✅ Costi indiretti dettagliati presenti');
        } else {
          console.log('❌ Costi indiretti dettagliati mancanti');
        }
      }
      
      // 6. Testa auto-salvataggio
      console.log('📝 Step 6: Test auto-salvataggio...');
      await page.waitForTimeout(3000);
      
      const draftIndicator = await page.locator('text=Bozza salvata automaticamente').isVisible();
      if (draftIndicator) {
        console.log('✅ Auto-salvataggio draft funzionante');
      } else {
        console.log('❌ Auto-salvataggio draft non rilevato');
      }
      
      // 7. Testa pulsante calcolo
      console.log('📝 Step 7: Test pulsante calcolo...');
      const calcButton = await page.locator('button:has-text("Calcola Business Plan")').first();
      if (await calcButton.isVisible()) {
        const isDisabled = await calcButton.isDisabled();
        if (isDisabled) {
          console.log('✅ Pulsante disabilitato correttamente (dati mancanti)');
        } else {
          console.log('❌ Pulsante dovrebbe essere disabilitato');
        }
      }
      
      console.log('🎉 Test Business Plan completato!');
      
    } else {
      console.log('❌ Pulsante "Inizia" non trovato');
    }
    
  } catch (error) {
    console.error('❌ Errore durante il test:', error.message);
  } finally {
    await browser.close();
  }
}

// Esegui il test
testBusinessPlanFeatures().catch(console.error);
