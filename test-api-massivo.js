// Test massivo dell'API - TUTTO REALE
const axios = require('axios');

async function testAPIMassivo() {
  console.log('🧪 TEST MASSIVO API - TUTTO REALE');
  console.log('=' .repeat(60));
  
  const apiUrl = 'http://localhost:3000/api/land-scraping';
  
  // Test con parametri ampi
  const testData = {
    location: 'Milano',
    criteria: {
      minPrice: 10000,    // Prezzo minimo molto basso
      maxPrice: 10000000, // Prezzo massimo molto alto
      minArea: 10,        // Area minima molto bassa
      maxArea: 100000     // Area massima molto alta
    },
    aiAnalysis: true,
    email: 'test@example.com'
  };
  
  try {
    console.log('📡 1. Test connessione API...');
    console.log('URL:', apiUrl);
    console.log('Dati:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post(apiUrl, testData, {
      timeout: 120000, // 2 minuti di timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ API risposta ricevuta!');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    
    const data = response.data;
    console.log('\n📊 2. Analisi risposta API...');
    console.log('Success:', data.success);
    console.log('Location:', data.location);
    console.log('Email:', data.email);
    console.log('Timestamp:', data.timestamp);
    
    if (data.emailError) {
      console.log('⚠️ Email Error:', data.emailError);
    }
    
    if (data.data) {
      const result = data.data;
      console.log('\n📈 3. Analisi risultati...');
      console.log('Lands found:', result.lands?.length || 0);
      console.log('Email sent:', result.emailSent);
      
      if (result.summary) {
        console.log('Total found:', result.summary.totalFound);
        console.log('Average price:', result.summary.averagePrice);
        console.log('Market trends:', result.summary.marketTrends);
        console.log('Recommendations:', result.summary.recommendations);
      }
      
      if (result.lands && result.lands.length > 0) {
        console.log('\n🏠 4. Dettagli terreni trovati...');
        result.lands.forEach((land, index) => {
          console.log(`\nTerreno ${index + 1}:`);
          console.log(`  ID: ${land.id}`);
          console.log(`  Titolo: ${land.title}`);
          console.log(`  Prezzo: €${land.price.toLocaleString()}`);
          console.log(`  Area: ${land.area}m²`);
          console.log(`  Location: ${land.location}`);
          console.log(`  Source: ${land.source}`);
          console.log(`  URL: ${land.url}`);
          console.log(`  Has Real Price: ${land.hasRealPrice}`);
          console.log(`  Has Real Area: ${land.hasRealArea}`);
        });
      } else {
        console.log('\n❌ PROBLEMA: Nessun terreno trovato nell\'API!');
        console.log('🔍 Possibili cause:');
        console.log('  - Problema nella logica di validazione');
        console.log('  - Problema nel filtro dei criteri');
        console.log('  - Problema nella conversione dei dati');
        console.log('  - Problema nel web scraper integrato');
      }
    } else {
      console.log('\n❌ PROBLEMA: Nessun dato nella risposta API!');
    }
    
  } catch (error) {
    console.error('❌ Errore durante il test API:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('Request error:', error.request);
    }
  }
}

// Test anche con server locale se disponibile
async function testLocalServer() {
  console.log('\n🔧 Test server locale...');
  
  try {
    const healthResponse = await axios.get('http://localhost:3000/api/health', {
      timeout: 5000
    });
    console.log('✅ Server locale attivo:', healthResponse.data);
    return true;
  } catch (error) {
    console.log('❌ Server locale non disponibile:', error.message);
    return false;
  }
}

// Esegui i test
async function runTests() {
  const serverActive = await testLocalServer();
  
  if (serverActive) {
    await testAPIMassivo();
  } else {
    console.log('\n💡 Per testare l\'API completa, avvia il server locale con:');
    console.log('   npm run dev');
    console.log('\n🔍 Oppure testa direttamente in produzione');
  }
}

runTests(); 