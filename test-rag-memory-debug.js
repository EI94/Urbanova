// Test RAG Memory System

const API_URL = 'http://localhost:3112/api/os2/chat';

async function testMemory() {
  console.log('\n🧪 TEST RAG MEMORY SYSTEM\n');
  
  const userId = 'memory-test-user';
  const sessionId = `session-${Date.now()}`;
  
  // Step 1: Salva informazioni progetto
  console.log('📝 Step 1: Salvo informazioni progetto...');
  const step1 = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Progetto Green Park Residence, Milano, 20 unità eco-friendly, budget 3M',
      userId,
      sessionId,
    })
  }).then(r => r.json());
  
  console.log(`   Response: ${step1.response?.substring(0, 80)}...`);
  console.log(`   Success: ${step1.success}`);
  console.log(`   FunctionCalls: ${step1.functionCalls?.length || 0}`);
  
  await sleep(2000);
  
  // Step 2: Digression
  console.log('\n💭 Step 2: Digression (cambio argomento)...');
  const step2 = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Come funziona Urbanova? Spiegami le features',
      userId,
      sessionId,
    })
  }).then(r => r.json());
  
  console.log(`   Response: ${step2.response?.substring(0, 80)}...`);
  
  await sleep(2000);
  
  // Step 3: Recall memory
  console.log('\n🔍 Step 3: Recall memory (torno al progetto)...');
  const step3 = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Torniamo al progetto, come si chiamava?',
      userId,
      sessionId,
    })
  }).then(r => r.json());
  
  console.log(`   Response: ${step3.response?.substring(0, 150)}...`);
  console.log(`   ✅ Memory Recall: ${step3.response.includes('Green Park') ? 'SUCCESS' : 'FAILED'}`);
  
  await sleep(2000);
  
  // Step 4: Dettagli specifici
  console.log('\n🎯 Step 4: Recall dettagli specifici...');
  const step4 = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Quante unità erano e qual era il budget?',
      userId,
      sessionId,
    })
  }).then(r => r.json());
  
  console.log(`   Response: ${step4.response?.substring(0, 150)}...`);
  const hasUnits = step4.response.includes('20');
  const hasBudget = step4.response.includes('3M') || step4.response.includes('3 milioni') || step4.response.includes('3 million');
  console.log(`   ✅ Details Recall: ${hasUnits && hasBudget ? 'SUCCESS' : 'FAILED'}`);
  
  // Summary
  console.log('\n📊 SUMMARY:');
  const memoryWorks = step3.response.includes('Green Park') && hasUnits && hasBudget;
  console.log(`   Memory System: ${memoryWorks ? '✅ WORKING' : '❌ NOT WORKING'}`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

testMemory().catch(console.error);
