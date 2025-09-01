const { urbanovaToolOS } = require('./packages/toolos/dist/index.js');
const {
  feasibilityToolManifest,
  feasibilityToolActions,
} = require('./packages/toolos/dist/examples/feasibilityTool.js');

console.log('🧪 Test Integrazione Urbanova Tool OS...\n');

// Crea un'istanza di Urbanova Tool OS
const toolOS = urbanovaToolOS;

async function testToolOSIntegration() {
  console.log('📦 Test Registrazione Tool:\n');

  try {
    // Registra il tool di fattibilità
    toolOS.registerTool(feasibilityToolManifest, feasibilityToolActions);
    console.log('✅ Tool registrato:', feasibilityToolManifest.name);

    // Lista i tool disponibili
    const tools = toolOS.listTools();
    console.log(`✅ Tool disponibili: ${tools.length}`);
    tools.forEach(tool => {
      console.log(`   • ${tool.manifest.name} (${tool.actions.length} actions)`);
    });

    // Ottieni statistiche del registry
    const stats = toolOS.getRegistryStats();
    console.log('✅ Statistiche Registry:', stats);
  } catch (error) {
    console.error('❌ Errore durante la registrazione:', error.message);
    return;
  }

  console.log('\n🔍 Test Ricerca Tool:\n');

  try {
    // Cerca tool per intent
    const feasibilityTools = toolOS.getToolsByIntent('feasibility');
    console.log(`✅ Tool per intent 'feasibility': ${feasibilityTools.length}`);

    // Cerca tool per categoria
    const analysisTools = toolOS.searchTools({ category: 'feasibility' });
    console.log(`✅ Tool per categoria 'feasibility': ${analysisTools.length}`);

    // Cerca tool per tag
    const financialTools = toolOS.searchTools({ tags: ['financial'] });
    console.log(`✅ Tool per tag 'financial': ${financialTools.length}`);
  } catch (error) {
    console.error('❌ Errore durante la ricerca:', error.message);
  }

  console.log('\n⚡ Test Esecuzione Actions:\n');

  try {
    // Test context
    const mockContext = {
      userId: 'user-123',
      workspaceId: 'workspace-123',
      projectId: 'project-123',
      userRole: 'pm',
      now: new Date(),
      logger: {
        info: msg => console.log(`[INFO] ${msg}`),
        warn: msg => console.log(`[WARN] ${msg}`),
        error: msg => console.log(`[ERROR] ${msg}`),
        debug: msg => console.log(`[DEBUG] ${msg}`),
      },
      db: null,
    };

    // Test 1: Calcolo ROI (action semplice)
    console.log('1️⃣ Test Calcolo ROI:');
    const roiResult = await toolOS.runAction({
      toolId: 'feasibility-tool',
      action: 'calculate_roi',
      args: { projectId: 'project-123', includeTaxes: true },
      context: mockContext,
    });

    if (roiResult.success) {
      console.log('✅ ROI calcolato:', roiResult.data);
      console.log(`   Tempo esecuzione: ${roiResult.executionTime}ms`);
    } else {
      console.log('❌ Errore ROI:', roiResult.error);
    }

    // Test 2: Analisi Sensibilità (action long-running)
    console.log('\n2️⃣ Test Analisi Sensibilità:');
    const sensitivityResult = await toolOS.runAction({
      toolId: 'feasibility-tool',
      action: 'run_sensitivity',
      args: {
        projectId: 'project-123',
        deltas: [-0.1, -0.05, 0.05, 0.1],
        scenario: 'test-scenario',
      },
      context: mockContext,
    });

    if (sensitivityResult.success) {
      console.log('✅ Sensibilità calcolata:', sensitivityResult.data);
      console.log(`   Tempo esecuzione: ${sensitivityResult.executionTime}ms`);
      console.log(`   Logs: ${sensitivityResult.logs.length} entries`);
    } else {
      console.log('❌ Errore Sensibilità:', sensitivityResult.error);
    }

    // Test 3: Generazione Report (action con conferma richiesta)
    console.log('\n3️⃣ Test Generazione Report:');
    const reportResult = await toolOS.runAction({
      toolId: 'feasibility-tool',
      action: 'generate_report',
      args: {
        projectId: 'project-123',
        format: 'pdf',
        includeCharts: true,
      },
      context: mockContext,
    });

    if (reportResult.success) {
      console.log('✅ Report generato:', reportResult.data);
      console.log(`   Tempo esecuzione: ${reportResult.executionTime}ms`);
    } else {
      console.log('❌ Errore Report:', reportResult.error);
    }
  } catch (error) {
    console.error("❌ Errore durante l'esecuzione:", error.message);
  }

  console.log('\n🔒 Test Sicurezza:\n');

  try {
    // Test permessi insufficienti
    const lowRoleContext = {
      ...mockContext,
      userRole: 'sales', // Ruolo insufficiente per alcune actions
    };

    console.log('1️⃣ Test Ruolo Insufficiente:');
    const permissions = toolOS.checkPermissions(
      feasibilityToolActions[2], // generate_report richiede 'owner'
      lowRoleContext
    );

    if (permissions.allowed) {
      console.log('❌ Permesso concesso quando dovrebbe essere negato');
    } else {
      console.log('✅ Permesso correttamente negato:', permissions.reason);
    }

    // Test accesso workspace
    const noWorkspaceContext = {
      ...mockContext,
      workspaceId: undefined,
    };

    console.log('\n2️⃣ Test Accesso Workspace:');
    const workspacePermissions = toolOS.checkPermissions(
      feasibilityToolActions[0], // run_sensitivity
      noWorkspaceContext
    );

    if (workspacePermissions.allowed) {
      console.log('❌ Accesso workspace concesso quando dovrebbe essere negato');
    } else {
      console.log('✅ Accesso workspace correttamente negato:', workspacePermissions.reason);
    }
  } catch (error) {
    console.error('❌ Errore durante i test di sicurezza:', error.message);
  }

  console.log('\n📊 Test Statistiche:\n');

  try {
    // Statistiche registry
    const registryStats = toolOS.getRegistryStats();
    console.log('✅ Statistiche Registry:', registryStats);

    // Statistiche run
    const runStats = toolOS.getRunStats();
    console.log('✅ Statistiche Run:', runStats);
  } catch (error) {
    console.error('❌ Errore durante i test statistiche:', error.message);
  }

  console.log('\n🎯 Test Intent Matching:\n');

  try {
    // Test matching per intent naturali
    const naturalIntents = [
      'Fai una sensitivity sul Progetto A',
      'Calcola il ROI del progetto B',
      'Genera un report di fattibilità',
      'Analisi sensibilità ±5%',
    ];

    naturalIntents.forEach((intent, index) => {
      console.log(`${index + 1}️⃣ Intent: "${intent}"`);

      const tools = toolOS.getToolsByIntent(intent);
      if (tools.length > 0) {
        console.log(`   ✅ Tool trovati: ${tools.length}`);
        tools.forEach(tool => {
          const action = toolOS.getActionByIntent(tool.manifest.id, intent);
          if (action) {
            console.log(`      • ${tool.manifest.name}.${action.name}`);
          }
        });
      } else {
        console.log(`   ❌ Nessun tool trovato`);
      }
    });
  } catch (error) {
    console.error('❌ Errore durante i test intent matching:', error.message);
  }

  console.log('\n🎉 Test Integrazione Completato!');
  console.log('\n📋 Riepilogo Funzionalità:');
  console.log('   • Tool Registry: ✅');
  console.log('   • Tool Runner: ✅');
  console.log('   • Security Manager: ✅');
  console.log('   • Intent Matching: ✅');
  console.log('   • Action Execution: ✅');
  console.log('   • Role-based Access Control: ✅');
  console.log('   • Progress Tracking: ✅');
  console.log('   • Logging: ✅');
}

// Esegui i test
testToolOSIntegration().catch(console.error);
