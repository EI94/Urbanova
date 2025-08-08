const axios = require('axios');

const BASE_URL = 'http://localhost:3112';

async function testMultiLocationSearch() {
  console.log('🧪 TEST SELEZIONE MULTIPLE LOCALITÀ');
  console.log('=====================================\n');

  const testCases = [
    {
      name: 'Test Latina singola',
      criteria: {
        location: 'Latina',
        minPrice: 100000,
        maxPrice: 500000,
        minArea: 500,
        maxArea: 2000,
        propertyType: 'residenziale'
      }
    },
    {
      name: 'Test multiple località (Latina, Roma)',
      criteria: {
        location: 'Latina, Roma',
        minPrice: 100000,
        maxPrice: 500000,
        minArea: 500,
        maxArea: 2000,
        propertyType: 'residenziale'
      }
    },
    {
      name: 'Test multiple località (Latina, Milano, Firenze)',
      criteria: {
        location: 'Latina, Milano, Firenze',
        minPrice: 100000,
        maxPrice: 1000000,
        minArea: 500,
        maxArea: 5000,
        propertyType: 'residenziale'
      }
    },
    {
      name: 'Test regione Lazio',
      criteria: {
        location: 'Lazio',
        minPrice: 50000,
        maxPrice: 2000000,
        minArea: 100,
        maxArea: 10000,
        propertyType: 'residenziale'
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`📍 ${testCase.name}`);
    console.log(`Criteri: ${JSON.stringify(testCase.criteria, null, 2)}`);
    
    try {
      const startTime = Date.now();
      
      const response = await axios.post(`${BASE_URL}/api/land-scraping`, {
        location: testCase.criteria.location,
        criteria: {
          minPrice: testCase.criteria.minPrice,
          maxPrice: testCase.criteria.maxPrice,
          minArea: testCase.criteria.minArea,
          maxArea: testCase.criteria.maxArea,
          propertyType: testCase.criteria.propertyType
        },
        aiAnalysis: true,
        email: 'test@urbanova.com'
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`✅ Status: ${response.status}`);
      console.log(`⏱️  Durata: ${duration}ms`);
      console.log(`📊 Risultati: ${response.data.lands?.length || 0} terreni`);
      console.log(`📧 Email inviata: ${response.data.emailSent}`);
      
      if (response.data.lands && response.data.lands.length > 0) {
        console.log('🏠 Primi 3 terreni:');
        response.data.lands.slice(0, 3).forEach((land, index) => {
          console.log(`  ${index + 1}. ${land.title} - ${land.location} - €${land.price.toLocaleString()}`);
        });
      }
      
      console.log('---\n');
    } catch (error) {
      console.error(`❌ Errore: ${error.message}`);
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
      console.log('---\n');
    }
  }
}

// Esegui il test
testMultiLocationSearch().catch(console.error);
