import { ToolRegistry } from './registry';
import { ToolManifest, ToolActionSpec } from '@urbanova/types';
export declare const defaultManifests: ToolManifest[];
export declare const defaultActions: Record<string, any>;
/**
 * Registra tutti i tool di default nel sistema Urbanova Tool OS
 * Questo metodo viene chiamato all'avvio dell'applicazione
 */
export declare function registerDefaultTools(registry: ToolRegistry): Promise<void>;
/**
 * Registra un singolo tool con validazione
 */
export declare function registerSingleTool(registry: ToolRegistry, manifest: ToolManifest, actions: ToolActionSpec[]): Promise<boolean>;
/**
 * Verifica che tutti i tool di default siano registrati correttamente
 */
export declare function verifyDefaultTools(registry: ToolRegistry): Promise<{
    success: boolean;
    registered: string[];
    missing: string[];
    errors: string[];
}>;
/**
 * Ottiene informazioni sui tool registrati
 */
export declare function getDefaultToolsInfo(registry: ToolRegistry): {
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
};
export default registerDefaultTools;
//# sourceMappingURL=registerDefault.d.ts.map