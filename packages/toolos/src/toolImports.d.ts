import { ToolManifest, ToolActionSpec } from '@urbanova/types';
export declare function importTool(toolName: string): Promise<{
    manifest: ToolManifest;
    actions: ToolActionSpec[];
}>;
export declare const AVAILABLE_TOOLS: readonly ["listing", "procurement", "timeline", "buyer", "leads"];
export type AvailableTool = (typeof AVAILABLE_TOOLS)[number];
//# sourceMappingURL=toolImports.d.ts.map