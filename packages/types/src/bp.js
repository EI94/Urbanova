'use strict';
// Business Plan Types - Urbanova AI
// Interfacce complete per Business Plan con integrazione Comps/OMI
Object.defineProperty(exports, '__esModule', { value: true });
exports.zBPResult = exports.zBPInput = void 0;
const zod_1 = require('zod');
/**
 * Schema Zod per BPInput
 */
const zBPInput = zod_1.z.object({
  projectId: zod_1.z.string().min(1),
  land: zod_1.z.object({
    priceAsk: zod_1.z.number().positive(),
    taxes: zod_1.z.number().nonnegative().optional(),
    surface: zod_1.z.number().positive(),
    zone: zod_1.z.string().min(1),
  }),
  costs: zod_1.z.object({
    hard: zod_1.z.object({
      perSqm: zod_1.z.number().positive(),
      buildableSqm: zod_1.z.number().positive(),
      infrastructure: zod_1.z.number().nonnegative().optional(),
    }),
    soft: zod_1.z.object({
      design: zod_1.z.number().nonnegative(),
      permits: zod_1.z.number().nonnegative(),
      supervision: zod_1.z.number().nonnegative(),
      other: zod_1.z.number().nonnegative().optional(),
    }),
  }),
  revenues: zod_1.z.object({
    units: zod_1.z.number().positive(),
    averageArea: zod_1.z.number().positive(),
    pricePerSqm: zod_1.z.number().positive(),
  }),
  timeline: zod_1.z.object({
    constructionMonths: zod_1.z.number().positive(),
    sellingMonths: zod_1.z.number().positive(),
  }),
});
exports.zBPInput = zBPInput;
/**
 * Schema Zod per BPResult
 */
const zBPResult = zod_1.z.object({
  roi: zod_1.z.number(),
  marginPct: zod_1.z.number(),
  paybackYears: zod_1.z.number(),
  irr: zod_1.z.number().optional(),
  cashflowMonths: zod_1.z.array(zod_1.z.number()),
  breakEvenMonth: zod_1.z.number(),
  sensitivity: zod_1.z.array(
    zod_1.z.object({
      scenario: zod_1.z.string(),
      roi: zod_1.z.number(),
      marginPct: zod_1.z.number(),
      paybackYears: zod_1.z.number(),
    })
  ),
});
exports.zBPResult = zBPResult;
//# sourceMappingURL=bp.js.map
