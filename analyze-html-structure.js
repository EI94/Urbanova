// Analisi della struttura HTML reale
const axios = require('axios');
const cheerio = require('cheerio');

async function analyzeHTMLStructure() {
  console.log('🔍 Analisi della struttura HTML reale...');
  
  const testUrl = 'https://www.immobiliare.it/vendita-terreni/milano/';
  
  try {
    const response = await axios.get(testUrl, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // Cerca tutti gli elementi che contengono "€" (prezzi)
    console.log('💰 Cercando elementi con prezzi...');
    const priceElements = $('*:contains("€")');
    console.log(`  Trovati ${priceElements.length} elementi con "€"`);
    
    // Analizza i primi 10 elementi con prezzi
    priceElements.each((index, element) => {
      if (index >= 10) return;
      
      const $el = $(element);
      const tagName = element.tagName || 'unknown';
      const className = $el.attr('class') || 'nessuna';
      const id = $el.attr('id') || 'nessuno';
      const text = $el.text().trim().substring(0, 100);
      
      console.log(`\n  Elemento ${index + 1}:`);
      console.log(`    Tag: ${tagName}`);
      console.log(`    Class: ${className}`);
      console.log(`    ID: ${id}`);
      console.log(`    Testo: "${text}..."`);
      
      // Cerca il parent più vicino che potrebbe essere un container di annuncio
      let parent = $el.parent();
      for (let i = 0; i < 5; i++) {
        if (parent.length === 0) break;
        const parentElement = parent[0];
        if (!parentElement) break;
        
        const parentClass = parent.attr('class') || 'nessuna';
        const parentId = parent.attr('id') || 'nessuno';
        const parentTag = parentElement.tagName || 'unknown';
        console.log(`    Parent ${i + 1}: ${parentTag}.${parentClass}#${parentId}`);
        parent = parent.parent();
      }
    });
    
    // Cerca tutti gli elementi che contengono "m²" (aree)
    console.log('\n📐 Cercando elementi con aree...');
    const areaElements = $('*:contains("m²")');
    console.log(`  Trovati ${areaElements.length} elementi con "m²"`);
    
    // Analizza i primi 5 elementi con aree
    areaElements.each((index, element) => {
      if (index >= 5) return;
      
      const $el = $(element);
      const tagName = element.tagName;
      const className = $el.attr('class') || 'nessuna';
      const text = $el.text().trim().substring(0, 100);
      
      console.log(`\n  Elemento area ${index + 1}:`);
      console.log(`    Tag: ${tagName}`);
      console.log(`    Class: ${className}`);
      console.log(`    Testo: "${text}..."`);
    });
    
    // Cerca tutti i link
    console.log('\n🔗 Cercando link...');
    const links = $('a[href*="/vendita/"], a[href*="/annunci/"], a[href*="/terreni/"]');
    console.log(`  Trovati ${links.length} link di annunci`);
    
    // Analizza i primi 5 link
    links.each((index, element) => {
      if (index >= 5) return;
      
      const $el = $(element);
      const href = $el.attr('href');
      const className = $el.attr('class') || 'nessuna';
      const text = $el.text().trim().substring(0, 50);
      
      console.log(`\n  Link ${index + 1}:`);
      console.log(`    Href: ${href}`);
      console.log(`    Class: ${className}`);
      console.log(`    Testo: "${text}..."`);
    });
    
    // Cerca pattern comuni nella struttura
    console.log('\n🏗️ Analizzando pattern strutturali...');
    
    // Cerca div con classi che potrebbero essere container
    const divs = $('div[class]');
    const classCounts = {};
    
    divs.each((index, element) => {
      const className = $(element).attr('class');
      if (className) {
        const classes = className.split(' ');
        classes.forEach(cls => {
          if (cls.length > 3) { // Ignora classi troppo corte
            classCounts[cls] = (classCounts[cls] || 0) + 1;
          }
        });
      }
    });
    
    // Mostra le classi più comuni
    const sortedClasses = Object.entries(classCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20);
    
    console.log('  Classi più comuni:');
    sortedClasses.forEach(([className, count]) => {
      console.log(`    ${className}: ${count} volte`);
    });
    
  } catch (error) {
    console.error('❌ Errore durante l\'analisi:', error.message);
  }
}

// Esegui l'analisi
analyzeHTMLStructure(); 