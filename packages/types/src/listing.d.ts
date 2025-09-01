import { z } from 'zod';
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
export interface PriceGuard {
  enabled: boolean;
  maxDiscountPct: number;
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
export declare const zListingImage: z.ZodObject<
  {
    id: z.ZodString;
    url: z.ZodString;
    alt: z.ZodString;
    type: z.ZodEnum<['main', 'exterior', 'interior', 'plan', 'other']>;
    order: z.ZodNumber;
    width: z.ZodNumber;
    height: z.ZodNumber;
    isPlaceholder: z.ZodBoolean;
  },
  'strip',
  z.ZodTypeAny,
  {
    id: string;
    type: 'other' | 'plan' | 'main' | 'exterior' | 'interior';
    url: string;
    alt: string;
    order: number;
    width: number;
    height: number;
    isPlaceholder: boolean;
  },
  {
    id: string;
    type: 'other' | 'plan' | 'main' | 'exterior' | 'interior';
    url: string;
    alt: string;
    order: number;
    width: number;
    height: number;
    isPlaceholder: boolean;
  }
>;
export declare const zListingAssetDocument: z.ZodObject<
  {
    id: z.ZodString;
    name: z.ZodString;
    url: z.ZodString;
    type: z.ZodEnum<['plan', 'energy', 'technical', 'legal', 'other']>;
    size: z.ZodNumber;
    mimeType: z.ZodString;
  },
  'strip',
  z.ZodTypeAny,
  {
    id: string;
    type: 'other' | 'plan' | 'energy' | 'technical' | 'legal';
    name: string;
    url: string;
    mimeType: string;
    size: number;
  },
  {
    id: string;
    type: 'other' | 'plan' | 'energy' | 'technical' | 'legal';
    name: string;
    url: string;
    mimeType: string;
    size: number;
  }
>;
export declare const zListingPayload: z.ZodObject<
  {
    projectId: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    price: z.ZodNumber;
    pricePerSqm: z.ZodNumber;
    surface: z.ZodNumber;
    rooms: z.ZodNumber;
    bedrooms: z.ZodNumber;
    bathrooms: z.ZodNumber;
    floor: z.ZodNumber;
    totalFloors: z.ZodNumber;
    yearBuilt: z.ZodOptional<z.ZodNumber>;
    condition: z.ZodEnum<['excellent', 'good', 'fair', 'needs_renovation']>;
    features: z.ZodArray<z.ZodString, 'many'>;
    location: z.ZodObject<
      {
        address: z.ZodString;
        city: z.ZodString;
        province: z.ZodString;
        postalCode: z.ZodString;
        coordinates: z.ZodOptional<
          z.ZodObject<
            {
              lat: z.ZodNumber;
              lng: z.ZodNumber;
            },
            'strip',
            z.ZodTypeAny,
            {
              lat: number;
              lng: number;
            },
            {
              lat: number;
              lng: number;
            }
          >
        >;
      },
      'strip',
      z.ZodTypeAny,
      {
        province: string;
        address: string;
        city: string;
        postalCode: string;
        coordinates?:
          | {
              lat: number;
              lng: number;
            }
          | undefined;
      },
      {
        province: string;
        address: string;
        city: string;
        postalCode: string;
        coordinates?:
          | {
              lat: number;
              lng: number;
            }
          | undefined;
      }
    >;
    images: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodString;
          url: z.ZodString;
          alt: z.ZodString;
          type: z.ZodEnum<['main', 'exterior', 'interior', 'plan', 'other']>;
          order: z.ZodNumber;
          width: z.ZodNumber;
          height: z.ZodNumber;
          isPlaceholder: z.ZodBoolean;
        },
        'strip',
        z.ZodTypeAny,
        {
          id: string;
          type: 'other' | 'plan' | 'main' | 'exterior' | 'interior';
          url: string;
          alt: string;
          order: number;
          width: number;
          height: number;
          isPlaceholder: boolean;
        },
        {
          id: string;
          type: 'other' | 'plan' | 'main' | 'exterior' | 'interior';
          url: string;
          alt: string;
          order: number;
          width: number;
          height: number;
          isPlaceholder: boolean;
        }
      >,
      'many'
    >;
    documents: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodString;
          name: z.ZodString;
          url: z.ZodString;
          type: z.ZodEnum<['plan', 'energy', 'technical', 'legal', 'other']>;
          size: z.ZodNumber;
          mimeType: z.ZodString;
        },
        'strip',
        z.ZodTypeAny,
        {
          id: string;
          type: 'other' | 'plan' | 'energy' | 'technical' | 'legal';
          name: string;
          url: string;
          mimeType: string;
          size: number;
        },
        {
          id: string;
          type: 'other' | 'plan' | 'energy' | 'technical' | 'legal';
          name: string;
          url: string;
          mimeType: string;
          size: number;
        }
      >,
      'many'
    >;
    contact: z.ZodObject<
      {
        name: z.ZodString;
        phone: z.ZodString;
        email: z.ZodString;
        agency: z.ZodOptional<z.ZodString>;
      },
      'strip',
      z.ZodTypeAny,
      {
        name: string;
        email: string;
        phone: string;
        agency?: string | undefined;
      },
      {
        name: string;
        email: string;
        phone: string;
        agency?: string | undefined;
      }
    >;
    metadata: z.ZodObject<
      {
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        createdBy: z.ZodString;
        version: z.ZodString;
      },
      'strip',
      z.ZodTypeAny,
      {
        createdAt: Date;
        version: string;
        updatedAt: Date;
        createdBy: string;
      },
      {
        createdAt: Date;
        version: string;
        updatedAt: Date;
        createdBy: string;
      }
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    description: string;
    metadata: {
      createdAt: Date;
      version: string;
      updatedAt: Date;
      createdBy: string;
    };
    projectId: string;
    title: string;
    condition: 'excellent' | 'good' | 'fair' | 'needs_renovation';
    documents: {
      id: string;
      type: 'other' | 'plan' | 'energy' | 'technical' | 'legal';
      name: string;
      url: string;
      mimeType: string;
      size: number;
    }[];
    surface: number;
    pricePerSqm: number;
    features: string[];
    location: {
      province: string;
      address: string;
      city: string;
      postalCode: string;
      coordinates?:
        | {
            lat: number;
            lng: number;
          }
        | undefined;
    };
    price: number;
    images: {
      id: string;
      type: 'other' | 'plan' | 'main' | 'exterior' | 'interior';
      url: string;
      alt: string;
      order: number;
      width: number;
      height: number;
      isPlaceholder: boolean;
    }[];
    rooms: number;
    bedrooms: number;
    bathrooms: number;
    floor: number;
    totalFloors: number;
    contact: {
      name: string;
      email: string;
      phone: string;
      agency?: string | undefined;
    };
    yearBuilt?: number | undefined;
  },
  {
    description: string;
    metadata: {
      createdAt: Date;
      version: string;
      updatedAt: Date;
      createdBy: string;
    };
    projectId: string;
    title: string;
    condition: 'excellent' | 'good' | 'fair' | 'needs_renovation';
    documents: {
      id: string;
      type: 'other' | 'plan' | 'energy' | 'technical' | 'legal';
      name: string;
      url: string;
      mimeType: string;
      size: number;
    }[];
    surface: number;
    pricePerSqm: number;
    features: string[];
    location: {
      province: string;
      address: string;
      city: string;
      postalCode: string;
      coordinates?:
        | {
            lat: number;
            lng: number;
          }
        | undefined;
    };
    price: number;
    images: {
      id: string;
      type: 'other' | 'plan' | 'main' | 'exterior' | 'interior';
      url: string;
      alt: string;
      order: number;
      width: number;
      height: number;
      isPlaceholder: boolean;
    }[];
    rooms: number;
    bedrooms: number;
    bathrooms: number;
    floor: number;
    totalFloors: number;
    contact: {
      name: string;
      email: string;
      phone: string;
      agency?: string | undefined;
    };
    yearBuilt?: number | undefined;
  }
>;
export declare const zPriceGuard: z.ZodObject<
  {
    enabled: z.ZodBoolean;
    maxDiscountPct: z.ZodNumber;
    minPricePerSqm: z.ZodNumber;
    maxPricePerSqm: z.ZodNumber;
    businessPlanSnapshot: z.ZodObject<
      {
        targetPricePerSqm: z.ZodNumber;
        targetRoi: z.ZodNumber;
        snapshotDate: z.ZodDate;
        version: z.ZodString;
      },
      'strip',
      z.ZodTypeAny,
      {
        version: string;
        targetPricePerSqm: number;
        targetRoi: number;
        snapshotDate: Date;
      },
      {
        version: string;
        targetPricePerSqm: number;
        targetRoi: number;
        snapshotDate: Date;
      }
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    enabled: boolean;
    maxDiscountPct: number;
    minPricePerSqm: number;
    maxPricePerSqm: number;
    businessPlanSnapshot: {
      version: string;
      targetPricePerSqm: number;
      targetRoi: number;
      snapshotDate: Date;
    };
  },
  {
    enabled: boolean;
    maxDiscountPct: number;
    minPricePerSqm: number;
    maxPricePerSqm: number;
    businessPlanSnapshot: {
      version: string;
      targetPricePerSqm: number;
      targetRoi: number;
      snapshotDate: Date;
    };
  }
>;
export declare const zPriceGuardViolation: z.ZodObject<
  {
    type: z.ZodEnum<
      ['discount_exceeded', 'price_below_min', 'price_above_max', 'roi_below_target']
    >;
    severity: z.ZodEnum<['warning', 'error', 'critical']>;
    message: z.ZodString;
    currentValue: z.ZodNumber;
    thresholdValue: z.ZodNumber;
    difference: z.ZodNumber;
    differencePct: z.ZodNumber;
  },
  'strip',
  z.ZodTypeAny,
  {
    message: string;
    type: 'discount_exceeded' | 'price_below_min' | 'price_above_max' | 'roi_below_target';
    severity: 'warning' | 'error' | 'critical';
    difference: number;
    currentValue: number;
    thresholdValue: number;
    differencePct: number;
  },
  {
    message: string;
    type: 'discount_exceeded' | 'price_below_min' | 'price_above_max' | 'roi_below_target';
    severity: 'warning' | 'error' | 'critical';
    difference: number;
    currentValue: number;
    thresholdValue: number;
    differencePct: number;
  }
>;
export declare const zFeedResult: z.ZodObject<
  {
    feedUrl: z.ZodString;
    zipUrl: z.ZodString;
    violations: z.ZodOptional<
      z.ZodArray<
        z.ZodObject<
          {
            type: z.ZodEnum<
              ['discount_exceeded', 'price_below_min', 'price_above_max', 'roi_below_target']
            >;
            severity: z.ZodEnum<['warning', 'error', 'critical']>;
            message: z.ZodString;
            currentValue: z.ZodNumber;
            thresholdValue: z.ZodNumber;
            difference: z.ZodNumber;
            differencePct: z.ZodNumber;
          },
          'strip',
          z.ZodTypeAny,
          {
            message: string;
            type: 'discount_exceeded' | 'price_below_min' | 'price_above_max' | 'roi_below_target';
            severity: 'warning' | 'error' | 'critical';
            difference: number;
            currentValue: number;
            thresholdValue: number;
            differencePct: number;
          },
          {
            message: string;
            type: 'discount_exceeded' | 'price_below_min' | 'price_above_max' | 'roi_below_target';
            severity: 'warning' | 'error' | 'critical';
            difference: number;
            currentValue: number;
            thresholdValue: number;
            differencePct: number;
          }
        >,
        'many'
      >
    >;
    warnings: z.ZodOptional<z.ZodArray<z.ZodString, 'many'>>;
    metadata: z.ZodObject<
      {
        generatedAt: z.ZodDate;
        portal: z.ZodString;
        projectId: z.ZodString;
        fileSize: z.ZodObject<
          {
            xml: z.ZodNumber;
            zip: z.ZodNumber;
          },
          'strip',
          z.ZodTypeAny,
          {
            xml: number;
            zip: number;
          },
          {
            xml: number;
            zip: number;
          }
        >;
        checksum: z.ZodObject<
          {
            xml: z.ZodString;
            zip: z.ZodString;
          },
          'strip',
          z.ZodTypeAny,
          {
            xml: string;
            zip: string;
          },
          {
            xml: string;
            zip: string;
          }
        >;
      },
      'strip',
      z.ZodTypeAny,
      {
        projectId: string;
        fileSize: {
          xml: number;
          zip: number;
        };
        generatedAt: Date;
        portal: string;
        checksum: {
          xml: string;
          zip: string;
        };
      },
      {
        projectId: string;
        fileSize: {
          xml: number;
          zip: number;
        };
        generatedAt: Date;
        portal: string;
        checksum: {
          xml: string;
          zip: string;
        };
      }
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    metadata: {
      projectId: string;
      fileSize: {
        xml: number;
        zip: number;
      };
      generatedAt: Date;
      portal: string;
      checksum: {
        xml: string;
        zip: string;
      };
    };
    feedUrl: string;
    zipUrl: string;
    violations?:
      | {
          message: string;
          type: 'discount_exceeded' | 'price_below_min' | 'price_above_max' | 'roi_below_target';
          severity: 'warning' | 'error' | 'critical';
          difference: number;
          currentValue: number;
          thresholdValue: number;
          differencePct: number;
        }[]
      | undefined;
    warnings?: string[] | undefined;
  },
  {
    metadata: {
      projectId: string;
      fileSize: {
        xml: number;
        zip: number;
      };
      generatedAt: Date;
      portal: string;
      checksum: {
        xml: string;
        zip: string;
      };
    };
    feedUrl: string;
    zipUrl: string;
    violations?:
      | {
          message: string;
          type: 'discount_exceeded' | 'price_below_min' | 'price_above_max' | 'roi_below_target';
          severity: 'warning' | 'error' | 'critical';
          difference: number;
          currentValue: number;
          thresholdValue: number;
          differencePct: number;
        }[]
      | undefined;
    warnings?: string[] | undefined;
  }
>;
export declare const zPortalConfig: z.ZodObject<
  {
    id: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<['getrix', 'immobiliare', 'casa', 'idealista', 'custom']>;
    feedFormat: z.ZodEnum<['xml', 'json', 'csv']>;
    schema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    requirements: z.ZodObject<
      {
        minImages: z.ZodNumber;
        maxImages: z.ZodNumber;
        requiredFields: z.ZodArray<z.ZodString, 'many'>;
        optionalFields: z.ZodArray<z.ZodString, 'many'>;
        imageFormats: z.ZodArray<z.ZodString, 'many'>;
        maxFileSize: z.ZodNumber;
      },
      'strip',
      z.ZodTypeAny,
      {
        minImages: number;
        maxImages: number;
        requiredFields: string[];
        optionalFields: string[];
        imageFormats: string[];
        maxFileSize: number;
      },
      {
        minImages: number;
        maxImages: number;
        requiredFields: string[];
        optionalFields: string[];
        imageFormats: string[];
        maxFileSize: number;
      }
    >;
    endpoints: z.ZodObject<
      {
        feed: z.ZodString;
        upload: z.ZodString;
        status: z.ZodString;
      },
      'strip',
      z.ZodTypeAny,
      {
        status: string;
        upload: string;
        feed: string;
      },
      {
        status: string;
        upload: string;
        feed: string;
      }
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    id: string;
    type: 'custom' | 'immobiliare' | 'idealista' | 'casa' | 'getrix';
    name: string;
    requirements: {
      minImages: number;
      maxImages: number;
      requiredFields: string[];
      optionalFields: string[];
      imageFormats: string[];
      maxFileSize: number;
    };
    feedFormat: 'xml' | 'json' | 'csv';
    schema: Record<string, unknown>;
    endpoints: {
      status: string;
      upload: string;
      feed: string;
    };
  },
  {
    id: string;
    type: 'custom' | 'immobiliare' | 'idealista' | 'casa' | 'getrix';
    name: string;
    requirements: {
      minImages: number;
      maxImages: number;
      requiredFields: string[];
      optionalFields: string[];
      imageFormats: string[];
      maxFileSize: number;
    };
    feedFormat: 'xml' | 'json' | 'csv';
    schema: Record<string, unknown>;
    endpoints: {
      status: string;
      upload: string;
      feed: string;
    };
  }
>;
export declare const zListingPrepareRequest: z.ZodObject<
  {
    projectId: z.ZodString;
    portal: z.ZodString;
    priceGuard: z.ZodObject<
      {
        enabled: z.ZodBoolean;
        maxDiscountPct: z.ZodNumber;
        minPricePerSqm: z.ZodNumber;
        maxPricePerSqm: z.ZodNumber;
        businessPlanSnapshot: z.ZodObject<
          {
            targetPricePerSqm: z.ZodNumber;
            targetRoi: z.ZodNumber;
            snapshotDate: z.ZodDate;
            version: z.ZodString;
          },
          'strip',
          z.ZodTypeAny,
          {
            version: string;
            targetPricePerSqm: number;
            targetRoi: number;
            snapshotDate: Date;
          },
          {
            version: string;
            targetPricePerSqm: number;
            targetRoi: number;
            snapshotDate: Date;
          }
        >;
      },
      'strip',
      z.ZodTypeAny,
      {
        enabled: boolean;
        maxDiscountPct: number;
        minPricePerSqm: number;
        maxPricePerSqm: number;
        businessPlanSnapshot: {
          version: string;
          targetPricePerSqm: number;
          targetRoi: number;
          snapshotDate: Date;
        };
      },
      {
        enabled: boolean;
        maxDiscountPct: number;
        minPricePerSqm: number;
        maxPricePerSqm: number;
        businessPlanSnapshot: {
          version: string;
          targetPricePerSqm: number;
          targetRoi: number;
          snapshotDate: Date;
        };
      }
    >;
    options: z.ZodOptional<
      z.ZodObject<
        {
          includePlaceholders: z.ZodOptional<z.ZodBoolean>;
          generatePdf: z.ZodOptional<z.ZodBoolean>;
          compressImages: z.ZodOptional<z.ZodBoolean>;
          watermark: z.ZodOptional<z.ZodBoolean>;
        },
        'strip',
        z.ZodTypeAny,
        {
          includePlaceholders?: boolean | undefined;
          generatePdf?: boolean | undefined;
          compressImages?: boolean | undefined;
          watermark?: boolean | undefined;
        },
        {
          includePlaceholders?: boolean | undefined;
          generatePdf?: boolean | undefined;
          compressImages?: boolean | undefined;
          watermark?: boolean | undefined;
        }
      >
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    projectId: string;
    portal: string;
    priceGuard: {
      enabled: boolean;
      maxDiscountPct: number;
      minPricePerSqm: number;
      maxPricePerSqm: number;
      businessPlanSnapshot: {
        version: string;
        targetPricePerSqm: number;
        targetRoi: number;
        snapshotDate: Date;
      };
    };
    options?:
      | {
          includePlaceholders?: boolean | undefined;
          generatePdf?: boolean | undefined;
          compressImages?: boolean | undefined;
          watermark?: boolean | undefined;
        }
      | undefined;
  },
  {
    projectId: string;
    portal: string;
    priceGuard: {
      enabled: boolean;
      maxDiscountPct: number;
      minPricePerSqm: number;
      maxPricePerSqm: number;
      businessPlanSnapshot: {
        version: string;
        targetPricePerSqm: number;
        targetRoi: number;
        snapshotDate: Date;
      };
    };
    options?:
      | {
          includePlaceholders?: boolean | undefined;
          generatePdf?: boolean | undefined;
          compressImages?: boolean | undefined;
          watermark?: boolean | undefined;
        }
      | undefined;
  }
>;
export declare const zListingPushRequest: z.ZodObject<
  {
    projectId: z.ZodString;
    portal: z.ZodString;
    feedResult: z.ZodObject<
      {
        feedUrl: z.ZodString;
        zipUrl: z.ZodString;
        violations: z.ZodOptional<
          z.ZodArray<
            z.ZodObject<
              {
                type: z.ZodEnum<
                  ['discount_exceeded', 'price_below_min', 'price_above_max', 'roi_below_target']
                >;
                severity: z.ZodEnum<['warning', 'error', 'critical']>;
                message: z.ZodString;
                currentValue: z.ZodNumber;
                thresholdValue: z.ZodNumber;
                difference: z.ZodNumber;
                differencePct: z.ZodNumber;
              },
              'strip',
              z.ZodTypeAny,
              {
                message: string;
                type:
                  | 'discount_exceeded'
                  | 'price_below_min'
                  | 'price_above_max'
                  | 'roi_below_target';
                severity: 'warning' | 'error' | 'critical';
                difference: number;
                currentValue: number;
                thresholdValue: number;
                differencePct: number;
              },
              {
                message: string;
                type:
                  | 'discount_exceeded'
                  | 'price_below_min'
                  | 'price_above_max'
                  | 'roi_below_target';
                severity: 'warning' | 'error' | 'critical';
                difference: number;
                currentValue: number;
                thresholdValue: number;
                differencePct: number;
              }
            >,
            'many'
          >
        >;
        warnings: z.ZodOptional<z.ZodArray<z.ZodString, 'many'>>;
        metadata: z.ZodObject<
          {
            generatedAt: z.ZodDate;
            portal: z.ZodString;
            projectId: z.ZodString;
            fileSize: z.ZodObject<
              {
                xml: z.ZodNumber;
                zip: z.ZodNumber;
              },
              'strip',
              z.ZodTypeAny,
              {
                xml: number;
                zip: number;
              },
              {
                xml: number;
                zip: number;
              }
            >;
            checksum: z.ZodObject<
              {
                xml: z.ZodString;
                zip: z.ZodString;
              },
              'strip',
              z.ZodTypeAny,
              {
                xml: string;
                zip: string;
              },
              {
                xml: string;
                zip: string;
              }
            >;
          },
          'strip',
          z.ZodTypeAny,
          {
            projectId: string;
            fileSize: {
              xml: number;
              zip: number;
            };
            generatedAt: Date;
            portal: string;
            checksum: {
              xml: string;
              zip: string;
            };
          },
          {
            projectId: string;
            fileSize: {
              xml: number;
              zip: number;
            };
            generatedAt: Date;
            portal: string;
            checksum: {
              xml: string;
              zip: string;
            };
          }
        >;
      },
      'strip',
      z.ZodTypeAny,
      {
        metadata: {
          projectId: string;
          fileSize: {
            xml: number;
            zip: number;
          };
          generatedAt: Date;
          portal: string;
          checksum: {
            xml: string;
            zip: string;
          };
        };
        feedUrl: string;
        zipUrl: string;
        violations?:
          | {
              message: string;
              type:
                | 'discount_exceeded'
                | 'price_below_min'
                | 'price_above_max'
                | 'roi_below_target';
              severity: 'warning' | 'error' | 'critical';
              difference: number;
              currentValue: number;
              thresholdValue: number;
              differencePct: number;
            }[]
          | undefined;
        warnings?: string[] | undefined;
      },
      {
        metadata: {
          projectId: string;
          fileSize: {
            xml: number;
            zip: number;
          };
          generatedAt: Date;
          portal: string;
          checksum: {
            xml: string;
            zip: string;
          };
        };
        feedUrl: string;
        zipUrl: string;
        violations?:
          | {
              message: string;
              type:
                | 'discount_exceeded'
                | 'price_below_min'
                | 'price_above_max'
                | 'roi_below_target';
              severity: 'warning' | 'error' | 'critical';
              difference: number;
              currentValue: number;
              thresholdValue: number;
              differencePct: number;
            }[]
          | undefined;
        warnings?: string[] | undefined;
      }
    >;
    confirmOverride: z.ZodOptional<z.ZodBoolean>;
    overrideReason: z.ZodOptional<z.ZodString>;
  },
  'strip',
  z.ZodTypeAny,
  {
    projectId: string;
    portal: string;
    feedResult: {
      metadata: {
        projectId: string;
        fileSize: {
          xml: number;
          zip: number;
        };
        generatedAt: Date;
        portal: string;
        checksum: {
          xml: string;
          zip: string;
        };
      };
      feedUrl: string;
      zipUrl: string;
      violations?:
        | {
            message: string;
            type: 'discount_exceeded' | 'price_below_min' | 'price_above_max' | 'roi_below_target';
            severity: 'warning' | 'error' | 'critical';
            difference: number;
            currentValue: number;
            thresholdValue: number;
            differencePct: number;
          }[]
        | undefined;
      warnings?: string[] | undefined;
    };
    confirmOverride?: boolean | undefined;
    overrideReason?: string | undefined;
  },
  {
    projectId: string;
    portal: string;
    feedResult: {
      metadata: {
        projectId: string;
        fileSize: {
          xml: number;
          zip: number;
        };
        generatedAt: Date;
        portal: string;
        checksum: {
          xml: string;
          zip: string;
        };
      };
      feedUrl: string;
      zipUrl: string;
      violations?:
        | {
            message: string;
            type: 'discount_exceeded' | 'price_below_min' | 'price_above_max' | 'roi_below_target';
            severity: 'warning' | 'error' | 'critical';
            difference: number;
            currentValue: number;
            thresholdValue: number;
            differencePct: number;
          }[]
        | undefined;
      warnings?: string[] | undefined;
    };
    confirmOverride?: boolean | undefined;
    overrideReason?: string | undefined;
  }
>;
//# sourceMappingURL=listing.d.ts.map
