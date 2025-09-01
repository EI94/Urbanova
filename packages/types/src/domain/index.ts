// Domain Types - Core business entities

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  type: ProjectType;
  location: Location;
  budget: Budget;
  timeline: Timeline;
  ownerId: string;
  teamMembers: TeamMember[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Deal {
  id: string;
  projectId: string;
  status: DealStatus;
  type: DealType;
  value: number;
  currency: string;
  parties: DealParty[];
  documents: Document[];
  milestones: Milestone[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Parcel {
  id: string;
  address: string;
  coordinates: Coordinates;
  area: number; // m²
  zoning: ZoningInfo;
  ownership: OwnershipInfo;
  restrictions: Restriction[];
  marketValue: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeasibilityInput {
  parcelId: string;
  projectType: ProjectType;
  budget: Budget;
  timeline: Timeline;
  marketConditions: MarketConditions;
  regulatoryContext: RegulatoryContext;
}

export interface FeasibilityResult {
  id: string;
  input: FeasibilityInput;
  analysis: FeasibilityAnalysis;
  recommendations: Recommendation[];
  riskAssessment: RiskAssessment;
  roi: ROIAnalysis;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  url: string;
  size: number;
  mimeType: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vendor {
  id: string;
  name: string;
  type: VendorType;
  contact: ContactInfo;
  services: Service[];
  rating: number;
  availability: Availability;
  createdAt: Date;
  updatedAt: Date;
}

export interface Listing {
  id: string;
  source: string;
  externalId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  location: Location;
  features: string[];
  images: string[];
  contactInfo: ContactInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditEvent {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

export interface UserRole {
  id: string;
  userId: string;
  role: Role;
  permissions: Permission[];
  scope: RoleScope;
  createdAt: Date;
  updatedAt: Date;
}

// Enums and specific types
export type ProjectStatus =
  | 'DRAFT'
  | 'PLANNING'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'CANCELLED';
export type ProjectType =
  | 'RESIDENTIAL'
  | 'COMMERCIAL'
  | 'INDUSTRIAL'
  | 'MIXED_USE'
  | 'INFRASTRUCTURE';
export type DealStatus = 'NEGOTIATION' | 'DUE_DILIGENCE' | 'CONTRACT' | 'CLOSED' | 'CANCELLED';
export type DealType = 'PURCHASE' | 'SALE' | 'JOINT_VENTURE' | 'LEASE' | 'OPTION';
export type DocumentType = 'CONTRACT' | 'PERMIT' | 'PLAN' | 'REPORT' | 'INVOICE' | 'OTHER';
export type VendorType = 'CONTRACTOR' | 'ARCHITECT' | 'ENGINEER' | 'LAWYER' | 'BANK' | 'OTHER';
export type Role = 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' | 'VIEWER';
export type RoleScope = 'GLOBAL' | 'PROJECT' | 'DEAL';

export interface Location {
  address: string;
  city: string;
  province: string;
  region: string;
  country: string;
  coordinates?: Coordinates;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Budget {
  total: number;
  currency: string;
  breakdown: BudgetBreakdown;
  contingency: number;
}

export interface BudgetBreakdown {
  land: number;
  construction: number;
  permits: number;
  design: number;
  other: number;
}

export interface Timeline {
  startDate: Date;
  endDate: Date;
  phases: Phase[];
}

export interface Phase {
  name: string;
  startDate: Date;
  endDate: Date;
  dependencies: string[];
}

export interface TeamMember {
  userId: string;
  role: string;
  permissions: Permission[];
  joinedAt: Date;
}

export interface DealParty {
  id: string;
  name: string;
  type: 'BUYER' | 'SELLER' | 'AGENT' | 'LAWYER';
  contact: ContactInfo;
}

export interface Milestone {
  id: string;
  name: string;
  dueDate: Date;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  deliverables: string[];
}

export interface ZoningInfo {
  zone: string;
  allowedUses: string[];
  restrictions: string[];
  heightLimit?: number;
  densityLimit?: number;
}

export interface OwnershipInfo {
  owner: string;
  ownershipType: 'FREEHOLD' | 'LEASEHOLD' | 'SHARED';
  encumbrances: string[];
}

export interface Restriction {
  type: string;
  description: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface MarketConditions {
  demand: 'LOW' | 'MEDIUM' | 'HIGH';
  supply: 'LOW' | 'MEDIUM' | 'HIGH';
  priceTrend: 'DECREASING' | 'STABLE' | 'INCREASING';
  marketMaturity: 'EMERGING' | 'GROWING' | 'MATURE' | 'DECLINING';
}

export interface RegulatoryContext {
  permits: Permit[];
  regulations: Regulation[];
  compliance: ComplianceStatus;
}

export interface Permit {
  type: string;
  status: 'REQUIRED' | 'APPLIED' | 'APPROVED' | 'REJECTED';
  estimatedTime: number; // days
  estimatedCost: number;
}

export interface Regulation {
  code: string;
  description: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ComplianceStatus {
  overall: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING';
  issues: ComplianceIssue[];
}

export interface ComplianceIssue {
  regulation: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  resolution?: string;
}

export interface FeasibilityAnalysis {
  technical: TechnicalFeasibility;
  financial: FinancialFeasibility;
  regulatory: RegulatoryFeasibility;
  market: MarketFeasibility;
}

export interface TechnicalFeasibility {
  score: number; // 0-100
  factors: FeasibilityFactor[];
  risks: string[];
  opportunities: string[];
}

export interface SensitivityAnalysis {
  baseCase: number;
  optimistic: number; // +10%
  pessimistic: number; // -10%
  variables: {
    name: string;
    impact: number;
    description: string;
  }[];
}

export interface FinancialFeasibility {
  score: number; // 0-100
  npv: number;
  irr: number;
  paybackPeriod: number; // months
  sensitivity: SensitivityAnalysis;
}

export interface RegulatoryFeasibility {
  score: number; // 0-100
  permits: Permit[];
  compliance: ComplianceStatus;
  timeline: number; // months
}

export interface MarketFeasibility {
  score: number; // 0-100
  demand: number; // 0-100
  competition: number; // 0-100
  pricing: number; // 0-100
}

export interface FeasibilityFactor {
  name: string;
  weight: number; // 0-1
  score: number; // 0-100
  impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
}

export interface Recommendation {
  type: 'PROCEED' | 'MODIFY' | 'ABANDON';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  actions: string[];
  timeline: number; // days
}

export interface RiskAssessment {
  overall: 'LOW' | 'MEDIUM' | 'HIGH';
  risks: Risk[];
  mitigation: MitigationStrategy[];
}

export interface Risk {
  category: string;
  probability: 'LOW' | 'MEDIUM' | 'HIGH';
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
}

export interface MitigationStrategy {
  riskId: string;
  strategy: string;
  cost: number;
  effectiveness: number; // 0-100
}

export interface ROIAnalysis {
  expected: number; // percentage
  minimum: number; // percentage
  maximum: number; // percentage
  factors: ROIFactor[];
}

export interface ROIFactor {
  name: string;
  impact: number; // percentage points
  description: string;
}

export interface ContactInfo {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  role?: string;
}

export interface Service {
  name: string;
  description: string;
  pricing: PricingModel;
  availability: Availability;
}

export interface PricingModel {
  type: 'FIXED' | 'HOURLY' | 'PERCENTAGE' | 'VARIABLE';
  amount: number;
  currency: string;
  unit?: string;
}

export interface Availability {
  status: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE';
  nextAvailable?: Date;
  capacity: number; // 0-100
}

export interface Permission {
  resource: string;
  actions: string[];
  conditions?: Record<string, unknown>;
}
