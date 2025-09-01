export { ProcurementService } from './procurementService';
export { procurementActions } from './actions';
export { procurementManifest } from './manifest';

// Export default instance
export const procurementTool = {
  service: ProcurementService,
  actions: procurementActions,
  manifest: procurementManifest,
};
