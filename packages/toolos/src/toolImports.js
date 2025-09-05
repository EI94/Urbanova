"use strict";
// Tool Imports Bridge - Soluzione definitiva per importare i tool
// Questo file risolve i problemi di rootDir e permette import puliti
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AVAILABLE_TOOLS = void 0;
exports.importTool = importTool;
// Import dinamici per evitare problemi di rootDir
async function importTool(toolName) {
    switch (toolName) {
        case 'listing':
            const listing = await Promise.resolve().then(() => __importStar(require('../../tools/listing')));
            return {
                manifest: listing.listingManifest,
                actions: listing.listingActions,
            };
        case 'procurement':
            const procurement = await Promise.resolve().then(() => __importStar(require('../../tools/procurement')));
            return {
                manifest: procurement.procurementManifest,
                actions: procurement.procurementActions,
            };
        case 'timeline':
            const timeline = await Promise.resolve().then(() => __importStar(require('../../tools/timeline')));
            return {
                manifest: timeline.timelineManifest,
                actions: timeline.timelineActions,
            };
        case 'buyer':
            const buyer = await Promise.resolve().then(() => __importStar(require('../../tools/buyer')));
            return {
                manifest: buyer.buyerManifest,
                actions: buyer.buyerActions,
            };
        case 'leads':
            const leads = await Promise.resolve().then(() => __importStar(require('../../tools/leads')));
            return {
                manifest: leads.leadsManifest,
                actions: leads.leadsActions,
            };
        default:
            throw new Error(`Tool ${toolName} non trovato`);
    }
}
// Export dei tool disponibili
exports.AVAILABLE_TOOLS = ['listing', 'procurement', 'timeline', 'buyer', 'leads'];
//# sourceMappingURL=toolImports.js.map