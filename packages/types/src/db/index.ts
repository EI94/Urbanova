// Database Types - Firestore shapes with common fields

import { Timestamp } from 'firebase/firestore';

// Base interface for all Firestore documents
export interface FirestoreDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  ownerId: string;
  version: number;
  metadata?: Record<string, unknown>;
}

// Project collection
export interface ProjectDocument extends FirestoreDocument {
  name: string;
  description: string;
  status: string;
  type: string;
  location: {
    address: string;
    city: string;
    province: string;
    region: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  budget: {
    total: number;
    currency: string;
    breakdown: {
      land: number;
      construction: number;
      permits: number;
      design: number;
      other: number;
    };
    contingency: number;
  };
  timeline: {
    startDate: Timestamp;
    endDate: Timestamp;
    phases: Array<{
      name: string;
      startDate: Timestamp;
      endDate: Timestamp;
      dependencies: string[];
    }>;
  };
  teamMembers: Array<{
    userId: string;
    role: string;
    permissions: Array<{
      resource: string;
      actions: string[];
      conditions?: Record<string, unknown>;
    }>;
    joinedAt: Timestamp;
  }>;
  tags: string[];
  isPublic: boolean;
  archivedAt?: Timestamp;
}

// Deal collection
export interface DealDocument extends FirestoreDocument {
  projectId: string;
  status: string;
  type: string;
  value: number;
  currency: string;
  parties: Array<{
    id: string;
    name: string;
    type: 'BUYER' | 'SELLER' | 'AGENT' | 'LAWYER';
    contact: {
      name: string;
      email: string;
      phone?: string;
      company?: string;
      role?: string;
    };
  }>;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    size: number;
    mimeType: string;
    metadata: Record<string, unknown>;
    createdAt: Timestamp;
    updatedAt: Timestamp;
  }>;
  milestones: Array<{
    id: string;
    name: string;
    dueDate: Timestamp;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
    deliverables: string[];
  }>;
  negotiationHistory: Array<{
    timestamp: Timestamp;
    action: string;
    userId: string;
    details: Record<string, unknown>;
  }>;
  closingDate?: Timestamp;
  isConfidential: boolean;
}

// Parcel collection
export interface ParcelDocument extends FirestoreDocument {
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  area: number; // m²
  zoning: {
    zone: string;
    allowedUses: string[];
    restrictions: string[];
    heightLimit?: number;
    densityLimit?: number;
  };
  ownership: {
    owner: string;
    ownershipType: 'FREEHOLD' | 'LEASEHOLD' | 'SHARED';
    encumbrances: string[];
  };
  restrictions: Array<{
    type: string;
    description: string;
    impact: 'LOW' | 'MEDIUM' | 'HIGH';
  }>;
  marketValue: number;
  propertyTax: number;
  utilities: {
    water: boolean;
    electricity: boolean;
    gas: boolean;
    sewage: boolean;
    internet: boolean;
  };
  accessibility: {
    roadAccess: boolean;
    publicTransport: boolean;
    parking: boolean;
  };
  environmentalFactors: Array<{
    type: string;
    description: string;
    risk: 'LOW' | 'MEDIUM' | 'HIGH';
  }>;
  images: string[];
  documents: string[];
  isListed: boolean;
  listingPrice?: number;
  listingDate?: Timestamp;
}

// Feasibility collection
export interface FeasibilityDocument extends FirestoreDocument {
  parcelId: string;
  projectType: string;
  input: {
    budget: {
      total: number;
      currency: string;
      breakdown: {
        land: number;
        construction: number;
        permits: number;
        design: number;
        other: number;
      };
      contingency: number;
    };
    timeline: {
      startDate: Timestamp;
      endDate: Timestamp;
      phases: Array<{
        name: string;
        startDate: Timestamp;
        endDate: Timestamp;
        dependencies: string[];
      }>;
    };
    marketConditions: {
      demand: 'LOW' | 'MEDIUM' | 'HIGH';
      supply: 'LOW' | 'MEDIUM' | 'HIGH';
      priceTrend: 'DECREASING' | 'STABLE' | 'INCREASING';
      marketMaturity: 'EMERGING' | 'GROWING' | 'MATURE' | 'DECLINING';
    };
    regulatoryContext: {
      permits: Array<{
        type: string;
        status: 'REQUIRED' | 'APPLIED' | 'APPROVED' | 'REJECTED';
        estimatedTime: number;
        estimatedCost: number;
      }>;
      regulations: Array<{
        code: string;
        description: string;
        impact: 'LOW' | 'MEDIUM' | 'HIGH';
      }>;
      compliance: {
        overall: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING';
        issues: Array<{
          regulation: string;
          severity: 'LOW' | 'MEDIUM' | 'HIGH';
          description: string;
          resolution?: string;
        }>;
      };
    };
  };
  analysis: {
    technical: {
      score: number;
      factors: Array<{
        name: string;
        weight: number;
        score: number;
        impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
      }>;
      risks: string[];
      opportunities: string[];
    };
    financial: {
      score: number;
      npv: number;
      irr: number;
      paybackPeriod: number;
      sensitivity: {
        baseCase: number;
        optimistic: number;
        pessimistic: number;
        variables: Array<{
          name: string;
          impact: number;
          description: string;
        }>;
      };
    };
    regulatory: {
      score: number;
      permits: Array<{
        type: string;
        status: 'REQUIRED' | 'APPLIED' | 'APPROVED' | 'REJECTED';
        estimatedTime: number;
        estimatedCost: number;
      }>;
      compliance: {
        overall: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING';
        issues: Array<{
          regulation: string;
          severity: 'LOW' | 'MEDIUM' | 'HIGH';
          description: string;
          resolution?: string;
        }>;
      };
      timeline: number;
    };
    market: {
      score: number;
      demand: number;
      competition: number;
      pricing: number;
    };
  };
  recommendations: Array<{
    type: 'PROCEED' | 'MODIFY' | 'ABANDON';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    description: string;
    actions: string[];
    timeline: number;
  }>;
  riskAssessment: {
    overall: 'LOW' | 'MEDIUM' | 'HIGH';
    risks: Array<{
      category: string;
      probability: 'LOW' | 'MEDIUM' | 'HIGH';
      impact: 'LOW' | 'MEDIUM' | 'HIGH';
      description: string;
    }>;
    mitigation: Array<{
      riskId: string;
      strategy: string;
      cost: number;
      effectiveness: number;
    }>;
  };
  roi: {
    expected: number;
    minimum: number;
    maximum: number;
    factors: Array<{
      name: string;
      impact: number;
      description: string;
    }>;
  };
  status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  reviewNotes?: string;
}

// Document collection
export interface DocumentDocument extends FirestoreDocument {
  name: string;
  type: string;
  url: string;
  size: number;
  mimeType: string;
  metadata: Record<string, unknown>;
  category: string;
  tags: string[];
  isPublic: boolean;
  accessControl: {
    allowedUsers: string[];
    allowedRoles: string[];
    allowedProjects: string[];
  };
  version: number;
  previousVersions: string[];
  checksum: string;
  expiresAt?: Timestamp;
  archivedAt?: Timestamp;
}

// Vendor collection
export interface VendorDocument extends FirestoreDocument {
  name: string;
  type: string;
  contact: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    role?: string;
  };
  services: Array<{
    name: string;
    description: string;
    pricing: {
      type: 'FIXED' | 'HOURLY' | 'PERCENTAGE' | 'VARIABLE';
      amount: number;
      currency: string;
      unit?: string;
    };
    availability: {
      status: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE';
      nextAvailable?: Timestamp;
      capacity: number;
    };
  }>;
  rating: number;
  reviews: Array<{
    userId: string;
    rating: number;
    comment: string;
    timestamp: Timestamp;
  }>;
  availability: {
    status: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE';
    nextAvailable?: Timestamp;
    capacity: number;
  };
  certifications: string[];
  insurance: {
    hasInsurance: boolean;
    provider?: string;
    expiryDate?: Timestamp;
    coverage?: number;
  };
  isVerified: boolean;
  verifiedAt?: Timestamp;
  verifiedBy?: string;
  isActive: boolean;
  deactivatedAt?: Timestamp;
  deactivatedBy?: string;
}

// Listing collection
export interface ListingDocument extends FirestoreDocument {
  source: string;
  externalId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  location: {
    address: string;
    city: string;
    province: string;
    region: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  features: string[];
  images: string[];
  contactInfo: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    role?: string;
  };
  status: 'ACTIVE' | 'PENDING' | 'SOLD' | 'EXPIRED' | 'REMOVED';
  lastUpdated: Timestamp;
  sourceUrl: string;
  isVerified: boolean;
  verificationDate?: Timestamp;
  verificationMethod?: string;
  isPremium: boolean;
  featuredUntil?: Timestamp;
  views: number;
  inquiries: number;
  favorites: number;
}

// AuditEvent collection
export interface AuditEventDocument extends FirestoreDocument {
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: Timestamp;
  sessionId: string;
  requestId: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category:
    | 'AUTHENTICATION'
    | 'AUTHORIZATION'
    | 'DATA_ACCESS'
    | 'DATA_MODIFICATION'
    | 'SYSTEM'
    | 'OTHER';
  outcome: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
  errorCode?: string;
  errorMessage?: string;
  relatedEvents: string[];
  metadata: Record<string, unknown>;
}

// UserRole collection
export interface UserRoleDocument extends FirestoreDocument {
  userId: string;
  role: string;
  permissions: Array<{
    resource: string;
    actions: string[];
    conditions?: Record<string, unknown>;
  }>;
  scope: string;
  grantedBy: string;
  grantedAt: Timestamp;
  expiresAt?: Timestamp;
  isActive: boolean;
  deactivatedAt?: Timestamp;
  deactivatedBy?: string;
  deactivationReason?: string;
  lastUsed?: Timestamp;
  usageCount: number;
  metadata: Record<string, unknown>;
}

// SAL (Sales Activity Log) collection
export interface SALDocument extends FirestoreDocument {
  dealId: string;
  activityType: 'CALL' | 'EMAIL' | 'MEETING' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSING' | 'OTHER';
  description: string;
  outcome: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'PENDING';
  nextAction?: string;
  nextActionDate?: Timestamp;
  participants: Array<{
    userId: string;
    role: string;
    name: string;
  }>;
  duration?: number; // minutes
  location?: string;
  notes: string;
  attachments: string[];
  followUpRequired: boolean;
  followUpDate?: Timestamp;
  followUpNotes?: string;
  isCompleted: boolean;
  completedAt?: Timestamp;
  completedBy?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  tags: string[];
}

// RDO (Real Estate Development Opportunity) collection
export interface RDODocument extends FirestoreDocument {
  title: string;
  description: string;
  location: {
    address: string;
    city: string;
    province: string;
    region: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  propertyType: string;
  currentUse: string;
  proposedUse: string;
  landArea: number;
  buildingArea?: number;
  zoning: {
    current: string;
    proposed: string;
    restrictions: string[];
  };
  marketAnalysis: {
    demand: 'LOW' | 'MEDIUM' | 'HIGH';
    supply: 'LOW' | 'MEDIUM' | 'HIGH';
    priceTrend: 'DECREASING' | 'STABLE' | 'INCREASING';
    marketMaturity: 'EMERGING' | 'GROWING' | 'MATURE' | 'DECLINING';
  };
  financialAnalysis: {
    currentValue: number;
    developmentCost: number;
    projectedValue: number;
    roi: number;
    paybackPeriod: number;
  };
  regulatoryAnalysis: {
    permits: Array<{
      type: string;
      status: 'REQUIRED' | 'APPLIED' | 'APPROVED' | 'REJECTED';
      estimatedTime: number;
      estimatedCost: number;
    }>;
    compliance: {
      overall: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING';
      issues: Array<{
        regulation: string;
        severity: 'LOW' | 'MEDIUM' | 'HIGH';
        description: string;
        resolution?: string;
      }>;
    };
  };
  riskAssessment: {
    overall: 'LOW' | 'MEDIUM' | 'HIGH';
    risks: Array<{
      category: string;
      probability: 'LOW' | 'MEDIUM' | 'HIGH';
      impact: 'LOW' | 'MEDIUM' | 'HIGH';
      description: string;
    }>;
    mitigation: Array<{
      riskId: string;
      strategy: string;
      cost: number;
      effectiveness: number;
    }>;
  };
  status: 'IDENTIFIED' | 'ANALYZING' | 'FEASIBLE' | 'NOT_FEASIBLE' | 'IN_DEVELOPMENT' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedTo?: string;
  dueDate?: Timestamp;
  tags: string[];
  isPublic: boolean;
  source: string;
  externalId?: string;
  lastUpdated: Timestamp;
  nextReviewDate?: Timestamp;
}
