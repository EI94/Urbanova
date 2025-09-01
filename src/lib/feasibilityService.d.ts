export interface FeasibilityProject {
  id?: string;
  name: string;
  address: string;
  status: 'PIANIFICAZIONE' | 'IN_CORSO' | 'COMPLETATO' | 'SOSPESO';
  startDate: Date;
  constructionStartDate: Date;
  duration: number;
  totalArea?: number;
  costs: {
    land: {
      purchasePrice: number;
      purchaseTaxes: number;
      intermediationFees: number;
      subtotal: number;
    };
    construction: {
      excavation: number;
      structures: number;
      systems: number;
      finishes: number;
      subtotal: number;
    };
    externalWorks: number;
    concessionFees: number;
    design: number;
    bankCharges: number;
    exchange: number;
    insurance: number;
    total: number;
  };
  revenues: {
    units: number;
    averageArea: number;
    pricePerSqm: number;
    revenuePerUnit: number;
    totalSales: number;
    otherRevenues: number;
    total: number;
  };
  results: {
    profit: number;
    margin: number;
    roi: number;
    paybackPeriod: number;
  };
  targetMargin: number;
  isTargetAchieved: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  sourceLandId?: string;
  notes?: string;
}
export interface FeasibilityComparison {
  id?: string;
  name: string;
  project1Id: string;
  project2Id: string;
  comparisonDate: Date;
  createdBy: string;
  insights: string[];
}
export declare class FeasibilityService {
  private readonly COLLECTION;
  private readonly COMPARISON_COLLECTION;
  createProject(
    projectData: Omit<FeasibilityProject, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string>;
  createProjectWithTransaction(
    projectData: Omit<FeasibilityProject, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string>;
  createProjectWithBatch(
    projectData: Omit<FeasibilityProject, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string>;
  getAllProjects(): Promise<FeasibilityProject[]>;
  getProjectsByUser(userId: string): Promise<FeasibilityProject[]>;
  getProjectById(id: string): Promise<FeasibilityProject | null>;
  updateProject(id: string, updates: Partial<FeasibilityProject>): Promise<void>;
  deleteProject(id: string): Promise<void>;
  testConnection(): Promise<boolean>;
  calculateCosts(
    project: Partial<FeasibilityProject>,
    constructionCostMode?: 'perSqm' | 'total'
  ): {
    land: {
      purchasePrice: number;
      purchaseTaxes: number;
      intermediationFees: number;
      subtotal: number;
    };
    construction: {
      excavation: number;
      structures: number;
      systems: number;
      finishes: number;
      subtotal: number;
    };
    externalWorks: number;
    concessionFees: number;
    design: number;
    bankCharges: number;
    exchange: number;
    insurance: number;
    total: number;
  };
  calculateRevenues(project: Partial<FeasibilityProject>): {
    units: number;
    averageArea: number;
    pricePerSqm: number;
    revenuePerUnit: number;
    totalSales: number;
    otherRevenues: number;
    total: number;
  };
  calculateResults(
    costs: any,
    revenues: any,
    targetMargin: number
  ): {
    profit: number;
    margin: number;
    roi: number;
    paybackPeriod: number;
  };
  calculateFeasibility(project: FeasibilityProject): {
    isFeasible: boolean;
    score: number;
    risks: string[];
    recommendations: string[];
  };
  getProjectsRanking(): Promise<FeasibilityProject[]>;
  getStatistics(): Promise<any>;
  recalculateAllProjects(): Promise<void>;
  compareProjects(project1Id: string, project2Id: string, userId: string): Promise<any>;
}
export declare const feasibilityService: FeasibilityService;
//# sourceMappingURL=feasibilityService.d.ts.map
