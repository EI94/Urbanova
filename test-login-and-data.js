// Test script per verificare login e recupero dati
const puppeteer = require('puppeteer');

async function testLoginAndData() {
  let browser;
  
  try {
    console.log('🔄 Avvio test con Puppeteer...');
    
    browser = await puppeteer.launch({ 
      headless: false, // Mostra il browser per debug
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Vai alla pagina di login
    console.log('📱 Navigazione alla pagina di login...');
    await page.goto('http://localhost:3112/auth/login');
    
    // Aspetta che la pagina si carichi
    await page.waitForSelector('input[name="email"]');
    
    // Compila il form di login
    console.log('✍️ Compilazione form di login...');
    await page.type('input[name="email"]', 'pierpaolo.laurito@gmail.com');
    await page.type('input[name="password"]', 'password123'); // Password di test
    
    // Clicca sul pulsante di login
    console.log('🔐 Tentativo di login...');
    await page.click('button[type="submit"]');
    
    // Aspetta il redirect o errore
    await page.waitForTimeout(3000);
    
    // Controlla se siamo stati reindirizzati
    const currentUrl = page.url();
    console.log(`📍 URL corrente: ${currentUrl}`);
    
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ Login riuscito! Navigazione alla pagina fattibilità...');
      
      // Vai alla pagina di analisi di fattibilità
      await page.goto('http://localhost:3112/dashboard/feasibility-analysis');
      await page.waitForTimeout(5000); // Aspetta il caricamento
      
      // Controlla se ci sono progetti
      const projects = await page.evaluate(() => {
        // Cerca elementi che contengono progetti
        const projectElements = document.querySelectorAll('[data-testid="project-card"], .project-card, [class*="project"]');
        return Array.from(projectElements).map(el => ({
          text: el.textContent,
          className: el.className
        }));
      });
      
      console.log(`📊 Progetti trovati: ${projects.length}`);
      projects.forEach((project, index) => {
        console.log(`  ${index + 1}. ${project.text.substring(0, 100)}...`);
      });
      
      // Cerca specificamente "Ciliegie"
      const pageContent = await page.content();
      if (pageContent.includes('Ciliegie')) {
        console.log('🍒 TROVATO PROGETTO CILIEGIE!');
      } else {
        console.log('❌ Progetto Ciliegie non trovato');
      }
      
      // Controlla i log della console
      const logs = await page.evaluate(() => {
        return window.consoleLogs || [];
      });
      
      console.log('\n📝 Log della console:');
      logs.forEach(log => console.log(`  ${log}`));
      
    } else {
      console.log('❌ Login fallito o errore di autenticazione');
      
      // Controlla se ci sono errori
      const errorElements = await page.$$('.error, [class*="error"]');
      if (errorElements.length > 0) {
        const errorText = await page.evaluate(() => {
          const errorEl = document.querySelector('.error, [class*="error"]');
          return errorEl ? errorEl.textContent : 'Errore sconosciuto';
        });
        console.log(`❌ Errore: ${errorText}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Errore durante il test:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Esegui il test
testLoginAndData();
