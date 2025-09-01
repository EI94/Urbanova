import { ToolRegistry } from './registry';
import { ToolManifest, ToolActionSpec } from '@urbanova/types';
import { importTool, AVAILABLE_TOOLS } from './toolImports';

// Default manifests e actions saranno caricati dinamicamente
export const defaultManifests: ToolManifest[] = [];
export const defaultActions: Record<string, any> = {};

/**
 * Registra tutti i tool di default nel sistema Urbanova Tool OS
 * Questo metodo viene chiamato all'avvio dell'applicazione
 */
export async function registerDefaultTools(registry: ToolRegistry): Promise<void> {
  console.log('🚀 Registrazione tool di default...');

  try {
    // Caricamento dinamico di tutti i tool disponibili
    for (const toolName of AVAILABLE_TOOLS) {
      try {
        console.log(`📝 Registrazione ${toolName} Tool...`);
        const { manifest, actions } = await importTool(toolName);
        await registry.registerTool(manifest, actions);
        console.log(`✅ ${toolName} Tool registrato`);

        // Aggiungi ai default per compatibilità
        defaultManifests.push(manifest);
        Object.assign(defaultActions, actions);
      } catch (error) {
        console.warn(`⚠️ Errore nel caricamento del tool ${toolName}:`, error);
      }
    }

    // 5. Verifica registrazione
    const stats = registry.getStats();
    console.log(`🎯 Tool registrati con successo: ${stats.total}`);
    console.log(`📊 Azioni totali disponibili: ${stats.total}`);

    // 6. Log dettagli per ogni tool
    const tools = registry.listTools();
    tools.forEach(tool => {
      console.log(`  • ${tool.manifest.name} (${tool.manifest.id}): ${tool.actions.length} azioni`);
    });

    console.log('🎉 Registrazione tool di default completata con successo!');
  } catch (error) {
    console.error('❌ Errore durante registrazione tool di default:', error);
    throw new Error(
      `Registrazione tool fallita: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`
    );
  }
}

/**
 * Registra un singolo tool con validazione
 */
export async function registerSingleTool(
  registry: ToolRegistry,
  manifest: ToolManifest,
  actions: ToolActionSpec[]
): Promise<boolean> {
  try {
    // Validazione manifest
    if (!manifest.id || !manifest.name || !manifest.version) {
      throw new Error('Manifest incompleto: id, name e version sono obbligatori');
    }

    // Validazione actions
    if (!Array.isArray(actions) || actions.length === 0) {
      throw new Error('Actions deve essere un array non vuoto');
    }

    // Validazione ogni action
    actions.forEach((action, index) => {
      if (!action.name || !action.description) {
        throw new Error(`Action ${index}: name e description sono obbligatori`);
      }
    });

    // Registrazione
    await registry.registerTool(manifest, actions);
    console.log(`✅ Tool ${manifest.name} (${manifest.id}) registrato con successo`);
    return true;
  } catch (error) {
    console.error(`❌ Errore registrazione tool ${manifest.id}:`, error);
    return false;
  }
}

/**
 * Verifica che tutti i tool di default siano registrati correttamente
 */
export async function verifyDefaultTools(registry: ToolRegistry): Promise<{
  success: boolean;
  registered: string[];
  missing: string[];
  errors: string[];
}> {
  const expectedTools = ['land', 'feasibility', 'design', 'docs', 'market'];

  const result = {
    success: true,
    registered: [] as string[],
    missing: [] as string[],
    errors: [] as string[],
  };

  try {
    for (const toolId of expectedTools) {
      try {
        const tool = registry.getTool(toolId);
        if (tool) {
          result.registered.push(toolId);
          console.log(`✅ Tool ${toolId} verificato: ${tool.manifest.name}`);
        } else {
          result.missing.push(toolId);
          result.success = false;
          console.log(`❌ Tool ${toolId} mancante`);
        }
      } catch (error) {
        result.errors.push(
          `Errore verifica tool ${toolId}: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`
        );
        result.success = false;
      }
    }

    if (result.success) {
      console.log('🎯 Tutti i tool di default sono registrati correttamente');
    } else {
      console.log('⚠️ Alcuni tool di default sono mancanti o hanno errori');
    }

    return result;
  } catch (error) {
    console.error('❌ Errore durante verifica tool:', error);
    result.success = false;
    result.errors.push(
      `Errore generale: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`
    );
    return result;
  }
}

/**
 * Ottiene informazioni sui tool registrati
 */
export function getDefaultToolsInfo(registry: ToolRegistry): {
  tools: Array<{
    id: string;
    name: string;
    version: string;
    category: string;
    actions: number;
    intents: string[];
  }>;
  summary: {
    totalTools: number;
    totalActions: number;
    categories: string[];
  };
} {
  try {
    const tools = registry.listTools();
    const categories = new Set<string>();

    const toolsInfo = tools.map(tool => {
      categories.add(tool.manifest.category);
      return {
        id: tool.manifest.id,
        name: tool.manifest.name,
        version: tool.manifest.version,
        category: tool.manifest.category,
        actions: tool.actions.length,
        intents: tool.manifest.intents || [],
      };
    });

    return {
      tools: toolsInfo,
      summary: {
        totalTools: tools.length,
        totalActions: tools.reduce((sum, tool) => sum + tool.actions.length, 0),
        categories: Array.from(categories),
      },
    };
  } catch (error) {
    console.error('Errore durante recupero info tool:', error);
    return {
      tools: [],
      summary: {
        totalTools: 0,
        totalActions: 0,
        categories: [],
      },
    };
  }
}

// Export default registration function
export default registerDefaultTools;
