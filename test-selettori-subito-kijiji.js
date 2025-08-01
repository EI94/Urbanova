// Test Selettori Subito.it e Kijiji.it - Trova selettori corretti
const axios = require('axios');
const cheerio = require('cheerio');

function getRealisticHeaders() {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ];
  
  return {
    'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Cache-Control': 'max-age=0'
  };
}

async function analyzeSubitoStructure() {
  console.log('🔍 ANALISI SUBITO.IT - Trova selettori corretti');
  console.log('=' .repeat(60));
  
  try {
    const url = 'https://www.subito.it/immobili/terreni-e-aree-edificabili/roma/vendita/';
    console.log(`📡 URL: ${url}`);
    
    const response = await axios.get(url, {
      timeout: 15000,
      headers: getRealisticHeaders()
    });
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Size: ${response.data.length} chars`);
    
    const $ = cheerio.load(response.data);
    
    // Cerca elementi che contengono "€"
    console.log('\n🔍 Cerca elementi con "€"...');
    const priceElements = $('*:contains("€")');
    console.log(`  Elementi con "€": ${priceElements.length}`);
    
    // Analizza le prime 20 classi più comuni
    console.log('\n🔍 Analizza classi più comuni...');
    const divs = $('div[class]');
    const classCounts = {};
    
    divs.each((index, element) => {
      if (index >= 200) return; // Limita per performance
      const className = $(element).attr('class');
      if (className) {
        const classes = className.split(' ');
        classes.forEach(cls => {
          if (cls.length > 3) {
            classCounts[cls] = (classCounts[cls] || 0) + 1;
          }
        });
      }
    });
    
    const sortedClasses = Object.entries(classCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20);
    
    console.log('  Classi più comuni:');
    sortedClasses.forEach(([className, count]) => {
      console.log(`    ${className}: ${count} volte`);
    });
    
    // Cerca elementi che potrebbero essere annunci
    console.log('\n🔍 Cerca potenziali annunci...');
    const potentialSelectors = [
      'article',
      '[data-testid]',
      '.card',
      '.item',
      '.listing',
      '.announcement',
      '.property',
      '.real-estate',
      '.ad',
      '.listing-item',
      '.item-card'
    ];
    
    potentialSelectors.forEach(selector => {
      const elements = $(selector);
      if (elements.length > 0) {
        console.log(`  ${selector}: ${elements.length} elementi`);
        
        // Analizza i primi 3 elementi
        elements.each((index, element) => {
          if (index >= 3) return;
          
          const $el = $(element);
          const text = $el.text().substring(0, 200);
          const hasPrice = text.includes('€');
          const hasArea = text.includes('m²');
          
          console.log(`    Elemento ${index + 1}: ${hasPrice ? '✅' : '❌'} prezzo, ${hasArea ? '✅' : '❌'} area`);
          console.log(`    Testo: "${text}..."`);
        });
      }
    });
    
    // Cerca link che potrebbero essere annunci
    console.log('\n🔍 Cerca link di annunci...');
    const links = $('a[href*="/annunci/"], a[href*="/item/"], a[href*="/detail/"], a[href*="/immobili/"]');
    console.log(`  Link di annunci: ${links.length}`);
    
    if (links.length > 0) {
      links.each((index, element) => {
        if (index >= 5) return;
        const href = $(element).attr('href');
        const text = $(element).text().trim();
        console.log(`    Link ${index + 1}: ${text} -> ${href}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Errore:', error.message);
    if (error.response) {
      console.error('  Status:', error.response.status);
    }
  }
}

async function analyzeKijijiStructure() {
  console.log('\n🔍 ANALISI KIJIJI.IT - Trova selettori corretti');
  console.log('=' .repeat(60));
  
  try {
    const url = 'https://www.kijiji.it/terreni/roma/vendita/';
    console.log(`📡 URL: ${url}`);
    
    const response = await axios.get(url, {
      timeout: 15000,
      headers: getRealisticHeaders()
    });
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Size: ${response.data.length} chars`);
    
    const $ = cheerio.load(response.data);
    
    // Cerca elementi che contengono "€"
    console.log('\n🔍 Cerca elementi con "€"...');
    const priceElements = $('*:contains("€")');
    console.log(`  Elementi con "€": ${priceElements.length}`);
    
    // Analizza le prime 20 classi più comuni
    console.log('\n🔍 Analizza classi più comuni...');
    const divs = $('div[class]');
    const classCounts = {};
    
    divs.each((index, element) => {
      if (index >= 200) return; // Limita per performance
      const className = $(element).attr('class');
      if (className) {
        const classes = className.split(' ');
        classes.forEach(cls => {
          if (cls.length > 3) {
            classCounts[cls] = (classCounts[cls] || 0) + 1;
          }
        });
      }
    });
    
    const sortedClasses = Object.entries(classCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20);
    
    console.log('  Classi più comuni:');
    sortedClasses.forEach(([className, count]) => {
      console.log(`    ${className}: ${count} volte`);
    });
    
    // Cerca elementi che potrebbero essere annunci
    console.log('\n🔍 Cerca potenziali annunci...');
    const potentialSelectors = [
      'article',
      '[data-testid]',
      '.card',
      '.item',
      '.listing',
      '.announcement',
      '.property',
      '.real-estate',
      '.ad',
      '.listing-item',
      '.item-card'
    ];
    
    potentialSelectors.forEach(selector => {
      const elements = $(selector);
      if (elements.length > 0) {
        console.log(`  ${selector}: ${elements.length} elementi`);
        
        // Analizza i primi 3 elementi
        elements.each((index, element) => {
          if (index >= 3) return;
          
          const $el = $(element);
          const text = $el.text().substring(0, 200);
          const hasPrice = text.includes('€');
          const hasArea = text.includes('m²');
          
          console.log(`    Elemento ${index + 1}: ${hasPrice ? '✅' : '❌'} prezzo, ${hasArea ? '✅' : '❌'} area`);
          console.log(`    Testo: "${text}..."`);
        });
      }
    });
    
    // Cerca link che potrebbero essere annunci
    console.log('\n🔍 Cerca link di annunci...');
    const links = $('a[href*="/annunci/"], a[href*="/item/"], a[href*="/detail/"], a[href*="/terreni/"]');
    console.log(`  Link di annunci: ${links.length}`);
    
    if (links.length > 0) {
      links.each((index, element) => {
        if (index >= 5) return;
        const href = $(element).attr('href');
        const text = $(element).text().trim();
        console.log(`    Link ${index + 1}: ${text} -> ${href}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Errore:', error.message);
    if (error.response) {
      console.error('  Status:', error.response.status);
    }
  }
}

// Esegui le analisi
async function runAnalysis() {
  await analyzeSubitoStructure();
  await analyzeKijijiStructure();
}

runAnalysis(); 