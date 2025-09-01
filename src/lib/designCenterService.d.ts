export interface DesignTemplate {
  id: string;
  name: string;
  category: 'RESIDENTIAL' | 'COMMERCIAL' | 'MIXED' | 'INDUSTRIAL';
  zone: 'URBAN' | 'SUBURBAN' | 'RURAL' | 'COASTAL';
  budget: 'ECONOMIC' | 'MEDIUM' | 'PREMIUM' | 'LUXURY';
  density: 'LOW' | 'MEDIUM' | 'HIGH';
  minArea: number;
  maxArea: number;
  minBudget: number;
  maxBudget: number;
  floors: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  gardenArea: number;
  balconyArea: number;
  roofType: 'FLAT' | 'PITCHED' | 'GREEN' | 'SOLAR';
  facadeMaterial: 'BRICK' | 'STONE' | 'GLASS' | 'MIXED';
  energyClass: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  previewImage: string;
  floorPlanImage: string;
  sectionImage: string;
  description: string;
  features: string[];
  estimatedROI: number;
  constructionTime: number;
  popularity: number;
  createdAt: Date;
  updatedAt: Date;
}
export interface ProjectDesign {
  id: string;
  projectId: string;
  templateId: string;
  customizations: DesignCustomization;
  constraints: DesignConstraints;
  location: GeoLocation;
  budget: BudgetBreakdown;
  timeline: ProjectTimeline;
  approvals: ApprovalStatus[];
  status:
    | 'DRAFT'
    | 'IN_REVIEW'
    | 'APPROVED'
    | 'REJECTED'
    | 'PLANNING'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'ON_HOLD';
  createdAt: Date;
  updatedAt: Date;
  name?: string;
  category?: string;
  estimatedROI?: number;
}
export interface DesignCustomization {
  area: number;
  floors: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  gardenArea: number;
  balconyArea: number;
  roofType: string;
  facadeMaterial: string;
  energyClass: string;
  customFeatures: string[];
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  interiorStyle: 'MODERN' | 'CLASSIC' | 'MINIMALIST' | 'LUXURY' | 'ECO_FRIENDLY';
}
export interface DesignConstraints {
  boundaryDistance: number;
  setbackFront: number;
  setbackSide: number;
  setbackRear: number;
  maxHeight: number;
  maxCoverage: number;
  parkingRequirements: number;
  greenAreaMin: number;
  accessibility: boolean;
  fireSafety: boolean;
  seismic: string;
  environmental: string[];
}
export interface GeoLocation {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  cadastral: {
    sheet: string;
    parcel: string;
    subParcel: string;
  };
  zoning: {
    category: string;
    density: string;
    heightLimit: number;
    coverageLimit: number;
  };
  topography: {
    slope: number;
    orientation: string;
    soilType: string;
    waterTable: number;
  };
  infrastructure: {
    water: boolean;
    electricity: boolean;
    gas: boolean;
    sewage: boolean;
    internet: boolean;
    publicTransport: boolean;
  };
  surroundings: {
    schools: number;
    hospitals: number;
    shopping: number;
    parks: number;
    noise: 'LOW' | 'MEDIUM' | 'HIGH';
    pollution: 'LOW' | 'MEDIUM' | 'HIGH';
  };
}
export interface BudgetBreakdown {
  total: number;
  land: number;
  design: number;
  permits: number;
  construction: number;
  materials: number;
  labor: number;
  equipment: number;
  utilities: number;
  landscaping: number;
  contingency: number;
  breakdown: {
    foundation: number;
    structure: number;
    envelope: number;
    interior: number;
    mechanical: number;
    electrical: number;
    finishes: number;
  };
}
export interface ProjectTimeline {
  totalMonths: number;
  phases: {
    design: number;
    permits: number;
    sitePrep: number;
    foundation: number;
    structure: number;
    envelope: number;
    interior: number;
    finishes: number;
    testing: number;
    handover: number;
  };
  milestones: {
    designComplete: Date;
    permitsObtained: Date;
    constructionStart: Date;
    structureComplete: Date;
    envelopeComplete: Date;
    interiorComplete: Date;
    finalInspection: Date;
    handover: Date;
  };
}
export interface ApprovalStatus {
  id: string;
  type: 'DESIGN' | 'STRUCTURAL' | 'FIRE_SAFETY' | 'ENVIRONMENTAL' | 'BUILDING_PERMIT';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  authority: string;
  requirements: string[];
  submittedAt: Date;
  reviewedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  comments: string;
  documents: string[];
}
declare class DesignCenterService {
  private readonly TEMPLATES_COLLECTION;
  private readonly PROJECTS_COLLECTION;
  private readonly CONSTRAINTS_COLLECTION;
  /**
   * Ottiene tutti i template disponibili con filtri
   */
  getTemplates(filters?: {
    category?: string;
    zone?: string;
    budget?: string;
    density?: string;
    minArea?: number;
    maxArea?: number;
    minBudget?: number;
    maxBudget?: number;
  }): Promise<DesignTemplate[]>;
  /**
   * Ottiene un template specifico
   */
  getTemplate(templateId: string): Promise<DesignTemplate | null>;
  /**
   * Crea un nuovo progetto di design
   */
  createProjectDesign(
    projectData: Omit<ProjectDesign, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string>;
  /**
   * Aggiorna un progetto di design esistente
   */
  updateProjectDesign(projectId: string, updates: Partial<ProjectDesign>): Promise<void>;
  /**
   * Ottiene i progetti di design per un progetto specifico
   */
  getProjectDesigns(projectId: string): Promise<ProjectDesign[]>;
  /**
   * Ottiene tutti i progetti di design
   */
  getAllProjectDesigns(): Promise<ProjectDesign[]>;
  /**
   * Valida i vincoli di design per un terreno specifico
   */
  validateDesignConstraints(
    template: DesignTemplate,
    location: GeoLocation,
    customizations: DesignCustomization
  ): Promise<{
    isValid: boolean;
    violations: string[];
    recommendations: string[];
    adjustedConstraints: DesignConstraints;
  }>;
  /**
   * Calcola i vincoli basati su zona e regolamenti
   */
  private calculateConstraints;
  /**
   * Calcola il budget dettagliato per un progetto
   */
  calculateProjectBudget(
    template: DesignTemplate,
    customizations: DesignCustomization,
    location: GeoLocation
  ): Promise<BudgetBreakdown>;
  /**
   * Ottiene i costi base per m² basati su zona e qualità
   */
  private getBaseCostPerSqm;
  /**
   * Moltiplicatore per zona geografica
   */
  private getZoneMultiplier;
  /**
   * Moltiplicatore per qualità del progetto
   */
  private getQualityMultiplier;
  /**
   * Calcola la timeline del progetto
   */
  calculateProjectTimeline(
    template: DesignTemplate,
    customizations: DesignCustomization,
    complexity: 'LOW' | 'MEDIUM' | 'HIGH'
  ): Promise<ProjectTimeline>;
  /**
   * Inizializza i template di esempio se non esistono
   */
  initializeSampleTemplates(): Promise<void>;
}
export declare const designCenterService: DesignCenterService;
export {};
//# sourceMappingURL=designCenterService.d.ts.map
