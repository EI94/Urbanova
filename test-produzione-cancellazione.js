// Test Produzione Cancellazione Progetti - Urbanova
const puppeteer = require('puppeteer');

async function testProduzioneCancellazione() {
  console.log('🧪 AVVIO TEST PRODUZIONE CANCELLAZIONE PROGETTI...');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized'],
  });

  try {
    const page = await browser.newPage();

    // 1. Vai alla pagina principale
    console.log('📍 Navigazione a https://www.urbanova.life...');
    await page.goto('https://www.urbanova.life', { waitUntil: 'networkidle2' });

    // 2. Aspetta che la pagina carichi
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 3. Verifica se siamo nella pagina di login
    const pageContent = await page.content();
    if (pageContent.includes('Accedi al tuo account')) {
      console.log('🔐 Pagina di login rilevata, procedo con login...');

      // 4. Cerca i campi di login
      const emailInput = await page.$('input[type="email"], input[name="email"]');
      const passwordInput = await page.$('input[type="password"], input[name="password"]');
      const loginButton = await page.$('button[type="submit"], button:contains("Accedi")');

      if (emailInput && passwordInput && loginButton) {
        console.log('✅ Campi login trovati, inserisco credenziali...');

        // 5. Inserisci credenziali (usa le tue credenziali reali)
        await emailInput.type('pierpaolo.laurito@gmail.com');
        await passwordInput.type('test123'); // Sostituisci con la password reale

        // 6. Clicca su Accedi
        await loginButton.click();
        console.log('✅ Login effettuato, attendo redirect...');

        // 7. Aspetta il redirect alla dashboard
        await new Promise(resolve => setTimeout(resolve, 5000));

        // 8. Verifica se siamo nella dashboard
        const newPageContent = await page.content();
        if (
          newPageContent.includes('Dashboard') ||
          newPageContent.includes('Analisi di Fattibilità')
        ) {
          console.log('✅ Login riuscito, siamo nella dashboard!');
        } else {
          console.log('⚠️ Login effettuato ma non siamo ancora nella dashboard');
        }
      } else {
        console.log('❌ Campi login non trovati');
      }
    } else {
      console.log('⚠️ Non siamo nella pagina di login');
    }

    // 5. Cerca la sezione "Analisi di Fattibilità"
    console.log('🔍 Cercando sezione Analisi di Fattibilità...');

    try {
      // Cerca nel testo della pagina
      const pageContent = await page.content();
      if (pageContent.includes('Analisi di Fattibilità')) {
        console.log('✅ Testo "Analisi di Fattibilità" trovato nella pagina');
      } else {
        console.log('⚠️ Testo "Analisi di Fattibilità" non trovato, cerco altri elementi...');

        // Cerca titoli e contenuti
        const titles = await page.$$('h1, h2, h3');
        for (const title of titles) {
          const text = await title.evaluate(el => el.textContent);
          console.log(`📝 Titolo trovato: ${text}`);
        }
      }
    } catch (error) {
      console.log('⚠️ Errore nella ricerca sezione:', error.message);
    }

    // 6. Cerca progetti esistenti
    console.log('🔍 Cercando progetti esistenti...');

    const projects = await page.$$('[data-testid="project-card"], .project-card, .bg-white');
    console.log(`📊 Progetti trovati: ${projects.length}`);

    if (projects.length > 0) {
      console.log('✅ Progetti trovati, procedo con test cancellazione...');

      // 7. Clicca sul primo progetto per vedere le azioni
      await projects[0].click();
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 8. Cerca il menu azioni (tre punti o icona)
      const actionMenus = await page.$$('[data-testid="action-menu"], .action-menu, .dropdown');
      console.log(`🔧 Menu azioni trovati: ${actionMenus.length}`);

      if (actionMenus.length > 0) {
        // 9. Clicca sul menu azioni
        await actionMenus[0].click();
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 10. Cerca il pulsante "Elimina"
        const deleteButtons = await page.$$(
          'button:contains("Elimina"), [data-testid="delete-button"]'
        );
        console.log(`🗑️ Pulsanti elimina trovati: ${deleteButtons.length}`);

        if (deleteButtons.length > 0) {
          console.log('✅ Pulsante Elimina trovato, procedo con test...');

          // 11. Clicca su Elimina
          await deleteButtons[0].click();
          await new Promise(resolve => setTimeout(resolve, 2000));

          // 12. Cerca la conferma
          const confirmButtons = await page.$$(
            'button:contains("Conferma"), button:contains("OK"), button:contains("Sì")'
          );
          console.log(`✅ Pulsanti conferma trovati: ${confirmButtons.length}`);

          if (confirmButtons.length > 0) {
            // 13. Conferma la cancellazione
            await confirmButtons[0].click();
            console.log('✅ Conferma cliccata, attendo cancellazione...');

            // 14. Aspetta che la cancellazione si completi
            await new Promise(resolve => setTimeout(resolve, 5000));

            // 15. Verifica se il progetto è stato rimosso
            const projectsAfter = await page.$$(
              '[data-testid="project-card"], .project-card, .bg-white'
            );
            console.log(`📊 Progetti dopo cancellazione: ${projectsAfter.length}`);

            if (projectsAfter.length < projects.length) {
              console.log('✅ SUCCESSO: Progetto cancellato correttamente!');
            } else {
              console.log('❌ FALLIMENTO: Progetto non cancellato');
            }
          } else {
            console.log('⚠️ Pulsante conferma non trovato');
          }
        } else {
          console.log('⚠️ Pulsante Elimina non trovato');
        }
      } else {
        console.log('⚠️ Menu azioni non trovato');
      }
    } else {
      console.log('⚠️ Nessun progetto trovato per il test');
    }

    // 16. Screenshot finale
    await page.screenshot({ path: 'test-produzione-finale.png', fullPage: true });
    console.log('📸 Screenshot finale salvato');
  } catch (error) {
    console.error('❌ ERRORE durante il test:', error);
    await page.screenshot({ path: 'test-produzione-errore.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('🏁 Test completato');
  }
}

// Esegui il test
testProduzioneCancellazione().catch(console.error);
