// Usa fetch nativo di Node.js (disponibile da Node 18+)

// Test delle API endpoints per Urbanova Tool OS
async function testAPIEndpoints() {
  console.log('🧪 Test delle API endpoints per Urbanova Tool OS\n');

  // Test 1: Lista tools
  console.log('1️⃣ Test GET /api/tools/list');
  try {
    const toolsResponse = await fetch('http://localhost:3112/api/tools/list');
    const toolsData = await toolsResponse.json();

    if (toolsResponse.ok && toolsData.success) {
      console.log('✅ Tools API funziona correttamente');
      console.log(`   Tools disponibili: ${toolsData.data.tools.length}`);
      console.log(`   Primo tool: ${toolsData.data.tools[0]?.name || 'N/A'}`);
    } else {
      console.log('❌ Tools API ha restituito errore:', toolsData.error);
    }
  } catch (error) {
    console.log('❌ Errore nella chiamata Tools API:', error.message);
  }

  console.log('');

  // Test 2: Lista tool runs
  console.log('2️⃣ Test GET /api/tools/runs');
  try {
    const runsResponse = await fetch('http://localhost:3112/api/tools/runs?limit=5');
    const runsData = await runsResponse.json();

    if (runsResponse.ok && runsData.success) {
      console.log('✅ Tool Runs API funziona correttamente');
      console.log(`   Runs totali: ${runsData.data.pagination.total}`);
      console.log(`   Runs restituiti: ${runsData.data.runs.length}`);
      console.log(`   Statistiche: ${Object.keys(runsData.data.stats.byStatus).length} stati`);
    } else {
      console.log('❌ Tool Runs API ha restituito errore:', runsData.error);
    }
  } catch (error) {
    console.log('❌ Errore nella chiamata Tool Runs API:', error.message);
  }

  console.log('');

  // Test 3: Esecuzione tool action
  console.log('3️⃣ Test POST /api/tools/run');
  try {
    const runResponse = await fetch('http://localhost:3112/api/tools/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        toolId: 'feasibility-tool',
        action: 'run_sensitivity',
        projectId: 'test-project',
        args: {
          deltas: [-0.05, 0.05],
          includeTaxes: false,
        },
        context: {
          userId: 'test-user',
          workspaceId: 'test-workspace',
        },
      }),
    });

    const runData = await runResponse.json();

    if (runResponse.ok && runData.success) {
      console.log('✅ Tool Run API funziona correttamente');
      console.log(`   Run ID: ${runData.data.runId}`);
      console.log(`   Status: ${runData.data.status}`);
      console.log(`   Tempo stimato: ${runData.data.estimatedTime}ms`);
    } else {
      console.log('❌ Tool Run API ha restituito errore:', runData.error);
    }
  } catch (error) {
    console.log('❌ Errore nella chiamata Tool Run API:', error.message);
  }

  console.log('');

  // Test 4: Status di un run specifico
  console.log('4️⃣ Test GET /api/tools/run con runId');
  try {
    // Prima creiamo un run
    const createResponse = await fetch('http://localhost:3112/api/tools/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        toolId: 'land-scraper',
        action: 'analyze_market',
        projectId: 'test-project-2',
        args: { location: 'Milano' },
        context: { userId: 'test-user', workspaceId: 'test-workspace' },
      }),
    });

    if (createResponse.ok) {
      const createData = await createResponse.json();
      const runId = createData.data.runId;

      console.log(`   Run creato con ID: ${runId}`);

      // Ora testiamo il recupero dello status
      const statusResponse = await fetch(`http://localhost:3112/api/tools/run?runId=${runId}`);
      const statusData = await statusResponse.json();

      if (statusResponse.ok && statusData.success) {
        console.log('✅ Tool Run Status API funziona correttamente');
        console.log(`   Status: ${statusData.data.status}`);
        console.log(`   Progress: ${statusData.data.progress || 'N/A'}`);
      } else {
        console.log('❌ Tool Run Status API ha restituito errore:', statusData.error);
      }
    } else {
      console.log('❌ Impossibile creare run per test status');
    }
  } catch (error) {
    console.log('❌ Errore nel test Tool Run Status API:', error.message);
  }

  console.log('\n🎯 Test completati!');
}

// Esegui i test
testAPIEndpoints().catch(console.error);
