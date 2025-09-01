'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.zListingPushRequest =
  exports.zListingPrepareRequest =
  exports.zPortalConfig =
  exports.zFeedResult =
  exports.zPriceGuardViolation =
  exports.zPriceGuard =
  exports.zListingPayload =
  exports.zListingAssetDocument =
  exports.zListingImage =
    void 0;
// Urbanova Listing System Types
const zod_1 = require('zod');
// ===========================================
// ZOD SCHEMAS
// ===========================================
exports.zListingImage = zod_1.z.object({
  id: zod_1.z.string(),
  url: zod_1.z.string().url(),
  alt: zod_1.z.string(),
  type: zod_1.z.enum(['main', 'exterior', 'interior', 'plan', 'other']),
  order: zod_1.z.number().int().min(0),
  width: zod_1.z.number().int().positive(),
  height: zod_1.z.number().int().positive(),
  isPlaceholder: zod_1.z.boolean(),
});
exports.zListingAssetDocument = zod_1.z.object({
  id: zod_1.z.string(),
  name: zod_1.z.string(),
  url: zod_1.z.string().url(),
  type: zod_1.z.enum(['plan', 'energy', 'technical', 'legal', 'other']),
  size: zod_1.z.number().int().positive(),
  mimeType: zod_1.z.string(),
});
exports.zListingPayload = zod_1.z.object({
  projectId: zod_1.z.string(),
  title: zod_1.z.string().min(10),
  description: zod_1.z.string().min(50),
  price: zod_1.z.number().positive(),
  pricePerSqm: zod_1.z.number().positive(),
  surface: zod_1.z.number().positive(),
  rooms: zod_1.z.number().int().positive(),
  bedrooms: zod_1.z.number().int().min(0),
  bathrooms: zod_1.z.number().int().min(0),
  floor: zod_1.z.number().int().min(0),
  totalFloors: zod_1.z.number().int().positive(),
  yearBuilt: zod_1.z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  condition: zod_1.z.enum(['excellent', 'good', 'fair', 'needs_renovation']),
  features: zod_1.z.array(zod_1.z.string()),
  location: zod_1.z.object({
    address: zod_1.z.string(),
    city: zod_1.z.string(),
    province: zod_1.z.string().length(2),
    postalCode: zod_1.z.string().regex(/^\d{5}$/),
    coordinates: zod_1.z
      .object({
        lat: zod_1.z.number().min(-90).max(90),
        lng: zod_1.z.number().min(-180).max(180),
      })
      .optional(),
  }),
  images: zod_1.z.array(exports.zListingImage).min(1),
  documents: zod_1.z.array(exports.zListingAssetDocument),
  contact: zod_1.z.object({
    name: zod_1.z.string(),
    phone: zod_1.z.string(),
    email: zod_1.z.string().email(),
    agency: zod_1.z.string().optional(),
  }),
  metadata: zod_1.z.object({
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    createdBy: zod_1.z.string(),
    version: zod_1.z.string(),
  }),
});
exports.zPriceGuard = zod_1.z.object({
  enabled: zod_1.z.boolean(),
  maxDiscountPct: zod_1.z.number().min(0).max(100),
  minPricePerSqm: zod_1.z.number().positive(),
  maxPricePerSqm: zod_1.z.number().positive(),
  businessPlanSnapshot: zod_1.z.object({
    targetPricePerSqm: zod_1.z.number().positive(),
    targetRoi: zod_1.z.number().positive(),
    snapshotDate: zod_1.z.date(),
    version: zod_1.z.string(),
  }),
});
exports.zPriceGuardViolation = zod_1.z.object({
  type: zod_1.z.enum([
    'discount_exceeded',
    'price_below_min',
    'price_above_max',
    'roi_below_target',
  ]),
  severity: zod_1.z.enum(['warning', 'error', 'critical']),
  message: zod_1.z.string(),
  currentValue: zod_1.z.number(),
  thresholdValue: zod_1.z.number(),
  difference: zod_1.z.number(),
  differencePct: zod_1.z.number(),
});
exports.zFeedResult = zod_1.z.object({
  feedUrl: zod_1.z.string().url(),
  zipUrl: zod_1.z.string().url(),
  violations: zod_1.z.array(exports.zPriceGuardViolation).optional(),
  warnings: zod_1.z.array(zod_1.z.string()).optional(),
  metadata: zod_1.z.object({
    generatedAt: zod_1.z.date(),
    portal: zod_1.z.string(),
    projectId: zod_1.z.string(),
    fileSize: zod_1.z.object({
      xml: zod_1.z.number().positive(),
      zip: zod_1.z.number().positive(),
    }),
    checksum: zod_1.z.object({
      xml: zod_1.z.string(),
      zip: zod_1.z.string(),
    }),
  }),
});
exports.zPortalConfig = zod_1.z.object({
  id: zod_1.z.string(),
  name: zod_1.z.string(),
  type: zod_1.z.enum(['getrix', 'immobiliare', 'casa', 'idealista', 'custom']),
  feedFormat: zod_1.z.enum(['xml', 'json', 'csv']),
  schema: zod_1.z.record(zod_1.z.unknown()),
  requirements: zod_1.z.object({
    minImages: zod_1.z.number().int().min(0),
    maxImages: zod_1.z.number().int().positive(),
    requiredFields: zod_1.z.array(zod_1.z.string()),
    optionalFields: zod_1.z.array(zod_1.z.string()),
    imageFormats: zod_1.z.array(zod_1.z.string()),
    maxFileSize: zod_1.z.number().positive(),
  }),
  endpoints: zod_1.z.object({
    feed: zod_1.z.string().url(),
    upload: zod_1.z.string().url(),
    status: zod_1.z.string().url(),
  }),
});
exports.zListingPrepareRequest = zod_1.z.object({
  projectId: zod_1.z.string(),
  portal: zod_1.z.string(),
  priceGuard: exports.zPriceGuard,
  options: zod_1.z
    .object({
      includePlaceholders: zod_1.z.boolean().optional(),
      generatePdf: zod_1.z.boolean().optional(),
      compressImages: zod_1.z.boolean().optional(),
      watermark: zod_1.z.boolean().optional(),
    })
    .optional(),
});
exports.zListingPushRequest = zod_1.z.object({
  projectId: zod_1.z.string(),
  portal: zod_1.z.string(),
  feedResult: exports.zFeedResult,
  confirmOverride: zod_1.z.boolean().optional(),
  overrideReason: zod_1.z.string().optional(),
});
//# sourceMappingURL=listing.js.map
