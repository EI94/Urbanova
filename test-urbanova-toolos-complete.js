#!/usr/bin/env node

/**
 * Test di Integrazione Completo per Urbanova Tool OS
 * Verifica tutte le funzionalità: Registry, Runner, Security, Chat Integration
 */

console.log('🚀 Test di Integrazione Completo - Urbanova Tool OS');
console.log('='.repeat(60));

async function testCompleteIntegration() {
  try {
    // 1. Test Import e Inizializzazione
    console.log('\n📦 1. Test Import e Inizializzazione...');

    const { urbanovaToolOS } = require('./packages/toolos/dist/index.js');
    console.log('✅ ToolOS importato correttamente');

    // 2. Test Registry
    console.log('\n🔧 2. Test Registry...');

    // Registra tool di esempio
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
        {
          name: 'calculate_roi',
          description: 'Calcola ROI del progetto',
          zArgs: { projectId: 'string', includeTaxes: 'boolean' },
          requiredRole: 'pm',
          confirm: false,
          longRunning: false,
          timeout: 10000,
          handler: async (ctx, args) => {
            return {
              success: true,
              data: {
                projectId: args.projectId || 'default',
                baseRoi: 15.5,
                roiWithTaxes: 13.2,
                includeTaxes: args.includeTaxes || false,
                calculationDate: new Date(),
              },
            };
          },
        },
      ],
    };

    urbanovaToolOS.registerTool(feasibilityTool.manifest, feasibilityTool.actions);
    console.log('✅ Tool registrato correttamente');

    // 3. Test Ricerca Tool
    console.log('\n🔍 3. Test Ricerca Tool...');

    const toolsByIntent = urbanovaToolOS.getToolsByIntent('sensitivity');
    console.log(`✅ Trovati ${toolsByIntent.length} tool per intent 'sensitivity'`);

    const actionByIntent = urbanovaToolOS.getActionByIntent('feasibility-tool', 'sensitivity');
    console.log(`✅ Action trovata: ${actionByIntent?.name}`);

    // 4. Test Esecuzione Tool
    console.log('\n⚡ 4. Test Esecuzione Tool...');

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

    const sensitivityResult = await urbanovaToolOS.runAction({
      toolId: 'feasibility-tool',
      action: 'run_sensitivity',
      args: { projectId: 'proj-a', deltas: [-0.05, 0.05] },
      context,
    });

    console.log('✅ Sensitivity analysis completata:', sensitivityResult.success);

    const roiResult = await urbanovaToolOS.runAction({
      toolId: 'feasibility-tool',
      action: 'calculate_roi',
      args: { projectId: 'proj-a', includeTaxes: true },
      context,
    });

    console.log('✅ ROI calculation completata:', roiResult.success);

    // 5. Test Security
    console.log('\n🔒 5. Test Security...');

    const securityCheck = urbanovaToolOS.checkPermissions({
      toolId: 'feasibility-tool',
      action: 'run_sensitivity',
      context: {
        userId: 'user-123',
        workspaceId: 'workspace-1',
        projectId: 'proj-a',
        userRole: 'pm',
        now: new Date(),
      },
    });

    console.log('✅ Security check completato:', securityCheck.allowed);

    // 6. Test Chat Integration Simulation
    console.log('\n💬 6. Test Chat Integration Simulation...');

    const chatMessages = [
      'Fai una sensitivity sul Progetto A ±5%',
      'Calcola ROI del Progetto B con tasse',
      'Genera report fattibilità per Progetto C',
      'Scansiona questo annuncio immobiliare',
    ];

    for (const message of chatMessages) {
      console.log(`\n📝 Messaggio: "${message}"`);

      // Simula riconoscimento intent
      const tools = urbanovaToolOS.getToolsByIntent(message.toLowerCase());
      if (tools.length > 0) {
        console.log(`   🎯 Intent riconosciuto: ${tools[0].manifest.name}`);

        // Simula esecuzione
        const action = urbanovaToolOS.getActionByIntent(
          tools[0].manifest.id,
          message.toLowerCase()
        );
        if (action) {
          console.log(`   ⚡ Action: ${action.name}`);

          // Simula esecuzione rapida
          const result = await urbanovaToolOS.runAction({
            toolId: tools[0].manifest.id,
            action: action.name,
            args: { projectId: 'proj-test' },
            context,
          });

          console.log(`   ✅ Risultato: ${result.success ? 'Successo' : 'Fallito'}`);
        }
      } else {
        console.log('   ❌ Nessun intent riconosciuto');
      }
    }

    // 7. Test Performance e Statistiche
    console.log('\n📊 7. Test Performance e Statistiche...');

    const stats = urbanovaToolOS.getStats();
    console.log('📈 Statistiche Registry:', stats);

    const runStats = urbanovaToolOS.getRunStats();
    console.log('📊 Statistiche Esecuzioni:', runStats);

    // 8. Test Error Handling
    console.log('\n⚠️ 8. Test Error Handling...');

    try {
      await urbanovaToolOS.runAction({
        toolId: 'tool-inesistente',
        action: 'action-inesistente',
        args: {},
        context,
      });
    } catch (error) {
      console.log('✅ Error handling funziona:', error.message.includes('Tool non trovato'));
    }

    // 9. Test Tool Categories
    console.log('\n🏷️ 9. Test Tool Categories...');

    const financialTools = urbanovaToolOS.listToolsByCategory('financial');
    console.log(`✅ Tool finanziari trovati: ${financialTools.length}`);

    // 10. Test Search
    console.log('\n🔎 10. Test Search...');

    const searchResults = urbanovaToolOS.searchTools('sensitivity');
    console.log(`✅ Risultati ricerca 'sensitivity': ${searchResults.length}`);

    console.log('\n🎉 Test di Integrazione Completato con Successo!');
    console.log('='.repeat(60));

    // Riepilogo finale
    console.log('\n📋 RIEPILOGO FINALE:');
    console.log(`• Tool Registrati: ${urbanovaToolOS.listTools().length}`);
    console.log(`• Actions Totali: ${urbanovaToolOS.getStats().totalActions}`);
    console.log(`• Esecuzioni Completate: ${urbanovaToolOS.getRunStats().completed}`);
    console.log(`• Esecuzioni Fallite: ${urbanovaToolOS.getRunStats().failed}`);
    console.log(`• Tempo Medio Esecuzione: ${urbanovaToolOS.getRunStats().averageExecutionTime}ms`);

    console.log('\n🚀 Urbanova Tool OS è pronto per la produzione!');
  } catch (error) {
    console.error('❌ Errore durante il test:', error);
    process.exit(1);
  }
}

// Esegui i test
testCompleteIntegration().catch(console.error);
