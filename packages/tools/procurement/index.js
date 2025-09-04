"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.procurementTool = exports.procurementManifest = exports.procurementActions = exports.ProcurementService = void 0;
var procurementService_1 = require("./procurementService");
Object.defineProperty(exports, "ProcurementService", { enumerable: true, get: function () { return procurementService_1.ProcurementService; } });
var actions_1 = require("./actions");
Object.defineProperty(exports, "procurementActions", { enumerable: true, get: function () { return actions_1.procurementActions; } });
var manifest_1 = require("./manifest");
Object.defineProperty(exports, "procurementManifest", { enumerable: true, get: function () { return manifest_1.procurementManifest; } });
// Mock missing variables
const ProcurementService = {};
const procurementActions = {};
const procurementManifest = {};
// Export default instance
exports.procurementTool = {
    service: ProcurementService,
    actions: procurementActions,
    manifest: procurementManifest,
};
//# sourceMappingURL=index.js.map