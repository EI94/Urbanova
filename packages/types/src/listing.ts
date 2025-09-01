// Urbanova Listing System Types
import { z } from 'zod';

// ===========================================
// LISTING PAYLOAD
// ===========================================

export interface ListingPayload {
  projectId: string;
  title: string;
  description: string;
  price: number;
  pricePerSqm: number;
  surface: number;
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  floor: number;
  totalFloors: number;
  yearBuilt?: number;
  condition: 'excellent' | 'good' | 'fair' | 'needs_renovation';
  features: string[];
  location: {
    address: string;
    city: string;
    province: string;
    postalCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  images: ListingImage[];
  documents: ListingAssetDocument[];
  contact: {
    name: string;
    phone: string;
    email: string;
    agency?: string;
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    version: string;
  };
}

export interface ListingImage {
  id: string;
  url: string;
  alt: string;
  type: 'main' | 'exterior' | 'interior' | 'plan' | 'other';
  order: number;
  width: number;
  height: number;
  isPlaceholder: boolean;
}

export interface ListingAssetDocument {
  id: string;
  name: string;
  url: string;
  type: 'plan' | 'energy' | 'technical' | 'legal' | 'other';
  size: number;
  mimeType: string;
}

// ===========================================
// PRICE GUARD
// ===========================================

export interface PriceGuard {
  enabled: boolean;
  maxDiscountPct: number; // e.g., 15 means max 15% discount
  minPricePerSqm: number;
  maxPricePerSqm: number;
  businessPlanSnapshot: {
    targetPricePerSqm: number;
    targetRoi: number;
    snapshotDate: Date;
    version: string;
  };
}

export interface PriceGuardViolation {
  type: 'discount_exceeded' | 'price_below_min' | 'price_above_max' | 'roi_below_target';
  severity: 'warning' | 'error' | 'critical';
  message: string;
  currentValue: number;
  thresholdValue: number;
  difference: number;
  differencePct: number;
}

// ===========================================
// FEED RESULT
// ===========================================

export interface FeedResult {
  feedUrl: string;
  zipUrl: string;
  violations?: PriceGuardViolation[];
  warnings?: string[];
  metadata: {
    generatedAt: Date;
    portal: string;
    projectId: string;
    fileSize: {
      xml: number;
      zip: number;
    };
    checksum: {
      xml: string;
      zip: string;
    };
  };
}

// ===========================================
// PORTAL CONFIGURATION
// ===========================================

export interface PortalConfig {
  id: string;
  name: string;
  type: 'getrix' | 'immobiliare' | 'casa' | 'idealista' | 'custom';
  feedFormat: 'xml' | 'json' | 'csv';
  schema: Record<string, unknown>;
  requirements: {
    minImages: number;
    maxImages: number;
    requiredFields: string[];
    optionalFields: string[];
    imageFormats: string[];
    maxFileSize: number;
  };
  endpoints: {
    feed: string;
    upload: string;
    status: string;
  };
}

// ===========================================
// LISTING TOOL ACTIONS
// ===========================================

export interface ListingPrepareRequest {
  projectId: string;
  portal: string;
  priceGuard: PriceGuard;
  options?: {
    includePlaceholders: boolean;
    generatePdf: boolean;
    compressImages: boolean;
    watermark: boolean;
  };
}

export interface ListingPushRequest {
  projectId: string;
  portal: string;
  feedResult: FeedResult;
  confirmOverride?: boolean;
  overrideReason?: string;
}

// ===========================================
// ZOD SCHEMAS
// ===========================================

export const zListingImage = z.object({
  id: z.string(),
  url: z.string().url(),
  alt: z.string(),
  type: z.enum(['main', 'exterior', 'interior', 'plan', 'other']),
  order: z.number().int().min(0),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  isPlaceholder: z.boolean(),
});

export const zListingAssetDocument = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().url(),
  type: z.enum(['plan', 'energy', 'technical', 'legal', 'other']),
  size: z.number().int().positive(),
  mimeType: z.string(),
});

export const zListingPayload = z.object({
  projectId: z.string(),
  title: z.string().min(10),
  description: z.string().min(50),
  price: z.number().positive(),
  pricePerSqm: z.number().positive(),
  surface: z.number().positive(),
  rooms: z.number().int().positive(),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  floor: z.number().int().min(0),
  totalFloors: z.number().int().positive(),
  yearBuilt: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  condition: z.enum(['excellent', 'good', 'fair', 'needs_renovation']),
  features: z.array(z.string()),
  location: z.object({
    address: z.string(),
    city: z.string(),
    province: z.string().length(2),
    postalCode: z.string().regex(/^\d{5}$/),
    coordinates: z
      .object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
      })
      .optional(),
  }),
  images: z.array(zListingImage).min(1),
  documents: z.array(zListingAssetDocument),
  contact: z.object({
    name: z.string(),
    phone: z.string(),
    email: z.string().email(),
    agency: z.string().optional(),
  }),
  metadata: z.object({
    createdAt: z.date(),
    updatedAt: z.date(),
    createdBy: z.string(),
    version: z.string(),
  }),
});

export const zPriceGuard = z.object({
  enabled: z.boolean(),
  maxDiscountPct: z.number().min(0).max(100),
  minPricePerSqm: z.number().positive(),
  maxPricePerSqm: z.number().positive(),
  businessPlanSnapshot: z.object({
    targetPricePerSqm: z.number().positive(),
    targetRoi: z.number().positive(),
    snapshotDate: z.date(),
    version: z.string(),
  }),
});

export const zPriceGuardViolation = z.object({
  type: z.enum(['discount_exceeded', 'price_below_min', 'price_above_max', 'roi_below_target']),
  severity: z.enum(['warning', 'error', 'critical']),
  message: z.string(),
  currentValue: z.number(),
  thresholdValue: z.number(),
  difference: z.number(),
  differencePct: z.number(),
});

export const zFeedResult = z.object({
  feedUrl: z.string().url(),
  zipUrl: z.string().url(),
  violations: z.array(zPriceGuardViolation).optional(),
  warnings: z.array(z.string()).optional(),
  metadata: z.object({
    generatedAt: z.date(),
    portal: z.string(),
    projectId: z.string(),
    fileSize: z.object({
      xml: z.number().positive(),
      zip: z.number().positive(),
    }),
    checksum: z.object({
      xml: z.string(),
      zip: z.string(),
    }),
  }),
});

export const zPortalConfig = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['getrix', 'immobiliare', 'casa', 'idealista', 'custom']),
  feedFormat: z.enum(['xml', 'json', 'csv']),
  schema: z.record(z.unknown()),
  requirements: z.object({
    minImages: z.number().int().min(0),
    maxImages: z.number().int().positive(),
    requiredFields: z.array(z.string()),
    optionalFields: z.array(z.string()),
    imageFormats: z.array(z.string()),
    maxFileSize: z.number().positive(),
  }),
  endpoints: z.object({
    feed: z.string().url(),
    upload: z.string().url(),
    status: z.string().url(),
  }),
});

export const zListingPrepareRequest = z.object({
  projectId: z.string(),
  portal: z.string(),
  priceGuard: zPriceGuard,
  options: z
    .object({
      includePlaceholders: z.boolean().optional(),
      generatePdf: z.boolean().optional(),
      compressImages: z.boolean().optional(),
      watermark: z.boolean().optional(),
    })
    .optional(),
});

export const zListingPushRequest = z.object({
  projectId: z.string(),
  portal: z.string(),
  feedResult: zFeedResult,
  confirmOverride: z.boolean().optional(),
  overrideReason: z.string().optional(),
});
