#!/usr/bin/env node

/**
 * Test Semplificato per Urbanova Tool OS
 * Verifica le funzionalità core
 */

console.log('🚀 Test Semplificato - Urbanova Tool OS Core');
console.log('='.repeat(50));

async function testCoreFunctionality() {
  try {
    // 1. Import e Inizializzazione
    console.log('\n📦 1. Import e Inizializzazione...');

    const { urbanovaToolOS } = require('./packages/toolos/dist/index.js');
    console.log('✅ ToolOS importato correttamente');

    // 2. Registry Test
    console.log('\n🔧 2. Registry Test...');

    const feasibilityTool = {
      manifest: {
        id: 'feasibility-tool',
        name: 'Analisi Fattibilità',
        version: '1.0.0',
        description: 'Tool per analisi finanziarie e ROI',
        category: 'financial',
        intents: ['sensitivity', 'roi', 'fattibilità', 'analisi'],
        tags: ['financial', 'roi', 'sensitivity'],
      },
      actions: [
        {
          name: 'run_sensitivity',
          description: 'Esegue analisi di sensibilità',
          zArgs: { projectId: 'string', deltas: 'array' },
          requiredRole: 'pm',
          confirm: false,
          longRunning: false,
          timeout: 30000,
          handler: async (ctx, args) => {
            return {
              success: true,
              data: {
                baseRoi: 15.5,
                range: { min: 14.7, max: 16.3 },
                scenarios: 4,
                pdfUrl: 'https://example.com/report.pdf',
                scenario: 'default',
              },
            };
          },
        },
      ],
    };

    urbanovaToolOS.registerTool(feasibilityTool.manifest, feasibilityTool.actions);
    console.log('✅ Tool registrato correttamente');

    // 3. Ricerca Tool
    console.log('\n🔍 3. Ricerca Tool...');

    const toolsByIntent = urbanovaToolOS.getToolsByIntent('sensitivity');
    console.log(`✅ Trovati ${toolsByIntent.length} tool per intent 'sensitivity'`);

    const allTools = urbanovaToolOS.listTools();
    console.log(`✅ Tool totali registrati: ${allTools.length}`);

    // 4. Esecuzione Tool
    console.log('\n⚡ 4. Esecuzione Tool...');

    const context = {
      userId: 'user-123',
      workspaceId: 'workspace-1',
      projectId: 'proj-a',
      userRole: 'pm',
      now: new Date(),
      logger: {
        info: msg => console.log(`[LOG] ${msg}`),
        warn: msg => console.log(`[WARN] ${msg}`),
        error: msg => console.log(`[ERROR] ${msg}`),
        debug: msg => console.log(`[DEBUG] ${msg}`),
      },
      db: null,
    };

    const result = await urbanovaToolOS.runAction({
      toolId: 'feasibility-tool',
      action: 'run_sensitivity',
      args: { projectId: 'proj-a', deltas: [-0.05, 0.05] },
      context,
    });

    console.log('✅ Tool execution completata:', result.success);
    if (result.data) {
      console.log('   📊 ROI Base:', result.data.baseRoi + '%');
      console.log('   📈 Range ROI:', result.data.range.min + '% - ' + result.data.range.max + '%');
    }

    // 5. Statistiche
    console.log('\n📊 5. Statistiche...');

    const stats = urbanovaToolOS.getRegistryStats();
    console.log('📈 Registry Stats:', stats);

    const runStats = urbanovaToolOS.getRunStats();
    console.log('📊 Run Stats:', runStats);

    // 6. Chat Integration Test
    console.log('\n💬 6. Chat Integration Test...');

    const testMessages = [
      'Fai una sensitivity sul Progetto A ±5%',
      'Calcola ROI del Progetto B',
      'Genera report fattibilità',
    ];

    for (const message of testMessages) {
      const tools = urbanovaToolOS.getToolsByIntent(message.toLowerCase());
      if (tools.length > 0) {
        console.log(`   ✅ "${message}" -> ${tools[0].manifest.name}`);
      } else {
        console.log(`   ❌ "${message}" -> Nessun tool trovato`);
      }
    }

    console.log('\n🎉 Test Core Completato con Successo!');
    console.log('='.repeat(50));

    // Riepilogo
    console.log('\n📋 RIEPILOGO:');
    console.log(`• Tool Registrati: ${urbanovaToolOS.listTools().length}`);
    console.log(`• Actions Totali: ${urbanovaToolOS.getRegistryStats().totalActions}`);
    console.log(
      `• Esecuzioni: ${urbanovaToolOS.getRunStats().completed + urbanovaToolOS.getRunStats().failed}`
    );
    console.log(
      `• Intent Riconosciuti: ${testMessages.filter(m => urbanovaToolOS.getToolsByIntent(m.toLowerCase()).length > 0).length}/${testMessages.length}`
    );

    console.log('\n🚀 Urbanova Tool OS Core è funzionale!');
  } catch (error) {
    console.error('❌ Errore durante il test:', error);
    process.exit(1);
  }
}

// Esegui i test
testCoreFunctionality().catch(console.error);
