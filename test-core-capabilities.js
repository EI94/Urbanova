// Test Core Capabilities - Urbanova OS
const { UrbanovaOS } = require('./packages/os/dist/index.js');

// Crea un'istanza di UrbanovaOS
const urbanovaOS = new UrbanovaOS();

async function testCoreCapabilities() {
  console.log('🧪 Test Core Capabilities - Urbanova OS...\n');

  // Test semplice per vedere i log del planner
  console.log('1️⃣ Test Planner Debug:');
  const result = await urbanovaOS.execute({
    text: 'Dammi il riepilogo del Progetto A',
    userId: 'user-123',
    source: 'whatsapp',
  });
  console.log('✅ Result:', JSON.stringify(result, null, 2));

  // Test sensitivity
  console.log('\n2️⃣ Test Sensitivity:');
  const sensitivityResult = await urbanovaOS.execute({
    text: 'Fai analisi sensibilità ±5% su Progetto B',
    userId: 'user-123',
    source: 'whatsapp',
  });
  console.log('✅ Sensitivity Result:', JSON.stringify(sensitivityResult, null, 2));
}

// Esegui i test
testCoreCapabilities().catch(console.error);
