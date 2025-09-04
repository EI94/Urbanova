export { ProcurementService } from './procurementService';
export { procurementActions } from './actions';
export { procurementManifest } from './manifest';

// Mock missing variables
const ProcurementService = {} as any;
const procurementActions = {} as any;
const procurementManifest = {} as any;

// Export default instance
export const procurementTool = {
  service: ProcurementService,
  actions: procurementActions,
  manifest: procurementManifest,
};
