"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.urbanovaToolOS = exports.UrbanovaToolOS = exports.zToolExecutionResult = exports.zTool = exports.zToolRun = exports.zToolInstall = exports.zToolActionSpec = exports.zToolManifest = void 0;
// Urbanova Tool OS - Main Export
const registry_1 = require("./registry");
const runner_1 = require("./runner");
const security_1 = require("./security");
const registerDefault_1 = require("./registerDefault");
var types_1 = require("@urbanova/types");
Object.defineProperty(exports, "zToolManifest", { enumerable: true, get: function () { return types_1.zToolManifest; } });
Object.defineProperty(exports, "zToolActionSpec", { enumerable: true, get: function () { return types_1.zToolActionSpec; } });
Object.defineProperty(exports, "zToolInstall", { enumerable: true, get: function () { return types_1.zToolInstall; } });
Object.defineProperty(exports, "zToolRun", { enumerable: true, get: function () { return types_1.zToolRun; } });
Object.defineProperty(exports, "zTool", { enumerable: true, get: function () { return types_1.zTool; } });
Object.defineProperty(exports, "zToolExecutionResult", { enumerable: true, get: function () { return types_1.zToolExecutionResult; } });
// Main ToolOS class
class UrbanovaToolOS {
    constructor() {
        this.initialized = false;
    }
    /**
     * Inizializza il Tool OS e registra i tool di default
     */
    async initialize() {
        if (this.initialized) {
            console.log('🔄 Tool OS già inizializzato');
            return;
        }
        try {
            console.log('🚀 Inizializzazione Urbanova Tool OS...');
            // Registra tool di default
            await (0, registerDefault_1.registerDefaultTools)(registry_1.toolRegistry);
            // Verifica registrazione
            const verification = await (0, registerDefault_1.verifyDefaultTools)(registry_1.toolRegistry);
            if (!verification.success) {
                console.warn('⚠️ Alcuni tool non sono stati registrati correttamente:', verification.verification.missing);
            }
            this.initialized = true;
            console.log('✅ Urbanova Tool OS inizializzato con successo');
        }
        catch (error) {
            console.error('❌ Errore durante inizializzazione Tool OS:', error);
            throw error;
        }
    }
    /**
     * Registra un nuovo tool
     */
    registerTool(manifest, actions) {
        registry_1.toolRegistry.registerTool(manifest, actions);
    }
    /**
     * Esegue un'action di un tool
     */
    async runAction(request, options = {}) {
        return await runner_1.toolRunner.runAction(request, options);
    }
    /**
     * Ottiene informazioni su un tool
     */
    getTool(id) {
        return registry_1.toolRegistry.getTool(id);
    }
    /**
     * Lista tutti i tool disponibili
     */
    listTools() {
        return registry_1.toolRegistry.listTools();
    }
    /**
     * Cerca tool per criteri
     */
    searchTools(criteria) {
        return registry_1.toolRegistry.searchTools(criteria);
    }
    /**
     * Ottiene statistiche del registry
     */
    getRegistryStats() {
        return registry_1.toolRegistry.getStats();
    }
    /**
     * Ottiene statistiche dei run
     */
    getRunStats() {
        return runner_1.toolRunner.getRunStats();
    }
    /**
     * Ottiene tool per intent
     */
    getToolsByIntent(intent) {
        return registry_1.toolRegistry.getToolsByIntent(intent);
    }
    /**
     * Ottiene action per intent e tool
     */
    getActionByIntent(toolId, intent) {
        return registry_1.toolRegistry.getActionByIntent(toolId, intent);
    }
    /**
     * Verifica permessi per un'action
     */
    checkPermissions(action, context) {
        return security_1.securityManager.checkPermissions(action, context);
    }
    // Accesso ai servizi interni
    get registry() {
        return registry_1.toolRegistry;
    }
    get runner() {
        return runner_1.toolRunner;
    }
    get security() {
        return security_1.securityManager;
    }
    // Initialization status
    isInitialized() {
        return this.initialized;
    }
    // Get default tools info
    getDefaultToolsInfo() {
        if (!this.initialized) {
            throw new Error('Tool OS non ancora inizializzato. Chiama initialize() prima.');
        }
        const tools = this.listTools();
        const categories = new Set();
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
    }
}
exports.UrbanovaToolOS = UrbanovaToolOS;
// Singleton instance
exports.urbanovaToolOS = new UrbanovaToolOS();
// Auto-initialize when module is imported
exports.urbanovaToolOS.initialize().catch(error => {
    console.error('❌ Errore durante auto-inizializzazione Tool OS:', error);
});
//# sourceMappingURL=index.js.map