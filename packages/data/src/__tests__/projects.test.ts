import {
  zCreateProjectData,
  zCreateDealData,
  zCreateFeasibilityData,
  createProjectFromDeal,
  createDealFromScraped,
  createFeasibilityFromAnalysis,
} from '../projects';
// Define types locally since they're not exported from @urbanova/types
type Deal = {
  id: string;
  projectId: string;
  status: string;
  type: string;
  value: number;
  currency: string;
  parties: any[];
  documents: any[];
  milestones: any[];
  createdAt: Date;
  updatedAt: Date;
};

type FeasibilityResult = {
  id: string;
  input: any;
  analysis: any;
  recommendations: any[];
  riskAssessment: any;
  roi: any;
  createdAt: Date;
  updatedAt: Date;
};

// Mock data
const mockDeal: Deal = {
  id: 'deal-123',
  projectId: 'project-123',
  status: 'NEGOTIATION',
  type: 'PURCHASE',
  value: 800000,
  currency: 'EUR',
  parties: [],
  documents: [],
  milestones: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockFeasibility: FeasibilityResult = {
  id: 'feasibility-123',
  input: {
    parcelId: 'parcel-123',
    projectType: 'RESIDENTIAL',
    budget: {
      total: 1000000,
      currency: 'EUR',
      breakdown: {
        land: 800000,
        construction: 150000,
        permits: 50000,
        design: 0,
        other: 0,
      },
      contingency: 50000,
    },
    timeline: {
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      phases: [],
    },
    marketConditions: {
      demand: 'HIGH',
      supply: 'LOW',
      priceTrend: 'INCREASING',
      marketMaturity: 'GROWING',
    },
    regulatoryContext: {
      permits: [],
      regulations: [],
      compliance: {
        overall: 'COMPLIANT',
        issues: [],
      },
    },
  },
  analysis: {
    technical: {
      score: 85,
      factors: [],
      risks: ['Costi materiali', 'Tempi permessi'],
      opportunities: ['Mercato in crescita', 'Zona richiesta'],
    },
    financial: {
      score: 80,
      npv: 150000,
      irr: 0.15,
      paybackPeriod: 60,
      sensitivity: {
        baseCase: 15,
        optimistic: 20,
        pessimistic: 10,
        variables: [
          { name: 'Prezzo vendita', impact: 5, description: 'Variazione del 5%' },
          { name: 'Costi costruzione', impact: -3, description: 'Variazione del 3%' },
        ],
      },
    },
    regulatory: {
      score: 90,
      permits: [],
      compliance: {
        overall: 'COMPLIANT',
        issues: [],
      },
      timeline: 12,
    },
    market: {
      score: 85,
      demand: 80,
      competition: 70,
      pricing: 75,
    },
  },
  recommendations: [
    {
      type: 'PROCEED',
      priority: 'HIGH',
      description: "Procedere con l'analisi dettagliata",
      actions: ['Completare analisi di mercato'],
      timeline: 30,
    },
  ],
  riskAssessment: {
    overall: 'LOW',
    risks: [],
    mitigation: [],
  },
  roi: {
    expected: 15,
    minimum: 10,
    maximum: 20,
    factors: [],
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Projects Data Service', () => {
  describe('zCreateProjectData', () => {
    it('should validate valid project data', () => {
      const validData = {
        name: 'Progetto Milano Centro',
        description: 'Progetto residenziale in centro',
        category: 'RESIDENTIAL' as const,
        location: 'Milano',
        budget: {
          estimated: 1000000,
          actual: 1000000,
        },
        ownerId: 'user-123',
        team: ['user-123'],
        tags: ['residential', 'milano'],
      };

      const result = zCreateProjectData.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const invalidData = {
        name: '',
        description: 'Progetto residenziale',
        category: 'RESIDENTIAL' as const,
        location: 'Milano',
        budget: {
          estimated: 1000000,
        },
        ownerId: 'user-123',
      };

      const result = zCreateProjectData.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject negative budget', () => {
      const invalidData = {
        name: 'Progetto Milano',
        description: 'Progetto residenziale',
        category: 'RESIDENTIAL' as const,
        location: 'Milano',
        budget: {
          estimated: -1000000,
        },
        ownerId: 'user-123',
      };

      const result = zCreateProjectData.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept optional fields', () => {
      const minimalData = {
        name: 'Progetto Milano',
        description: 'Progetto residenziale',
        category: 'RESIDENTIAL' as const,
        location: 'Milano',
        budget: {
          estimated: 1000000,
        },
        ownerId: 'user-123',
      };

      const result = zCreateProjectData.safeParse(minimalData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('PLANNING');
        expect((result.data as any).priority).toBe('MEDIUM');
        expect((result.data as any).team).toEqual([]);
        expect((result.data as any).tags).toEqual([]);
      }
    });
  });

  describe('zCreateDealData', () => {
    it('should validate valid deal data', () => {
      const validData = {
        title: 'Terreno Milano Centro',
        description: 'Terreno residenziale in centro',
        location: 'Milano',
        size: 1000,
        price: 800000,
        category: 'RESIDENTIAL' as const,
        ownerId: 'user-123',
      };

      const result = zCreateDealData.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject negative price', () => {
      const invalidData = {
        title: 'Terreno Milano',
        description: 'Terreno residenziale',
        location: 'Milano',
        size: 1000,
        price: -800000,
        category: 'RESIDENTIAL' as const,
        ownerId: 'user-123',
      };

      const result = zCreateDealData.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept optional fields', () => {
      const minimalData = {
        title: 'Terreno Milano',
        description: 'Terreno residenziale',
        location: 'Milano',
        size: 1000,
        price: 800000,
        category: 'RESIDENTIAL' as const,
        ownerId: 'user-123',
      };

      const result = zCreateDealData.safeParse(minimalData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('AVAILABLE');
      }
    });
  });

  describe('zCreateFeasibilityData', () => {
    it('should validate valid feasibility data', () => {
      const validData = {
        dealId: 'deal-123',
        projectId: 'project-123',
        baseCase: {
          roi: 15,
          paybackYears: 5,
          netPresentValue: 150000,
          internalRateOfReturn: 0.15,
        },
        sensitivityAnalysis: {
          optimistic: 20,
          pessimistic: 10,
          variables: [{ name: 'Prezzo vendita', impact: 5, description: 'Variazione del 5%' }],
        },
        generatedBy: 'user-123',
      };

      const result = zCreateFeasibilityData.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        dealId: 'deal-123',
        projectId: 'project-123',
        baseCase: {
          roi: 15,
          paybackYears: 5,
          netPresentValue: 150000,
          internalRateOfReturn: 0.15,
        },
        sensitivityAnalysis: {
          optimistic: 20,
          pessimistic: 10,
          variables: [],
        },
        // Missing generatedBy
      };

      const result = zCreateFeasibilityData.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('createProjectFromDeal', () => {
    it('should create project data from deal and feasibility', () => {
      const userId = 'user-123';
      const projectData = createProjectFromDeal(mockDeal, mockFeasibility, userId);

      expect((projectData as any).name).toContain('Progetto');
      expect((projectData as any).category).toBe('RESIDENTIAL');
      expect((projectData as any).ownerId).toBe(userId);
      expect((projectData as any).team).toContain(userId);
      expect((projectData as any).tags).toContain('deal-generated');
      expect((projectData as any).metadata.dealId).toBe(mockDeal.id);
      expect((projectData as any).metadata.feasibilityId).toBe(mockFeasibility.id);
    });

    it('should set default values correctly', () => {
      const userId = 'user-123';
      const projectData = createProjectFromDeal(mockDeal, mockFeasibility, userId);

      expect((projectData as any).status).toBe('PLANNING');
      expect((projectData as any).priority).toBe('MEDIUM');
      expect((projectData as any).startDate).toBeInstanceOf(Date);
    });
  });

  describe('createDealFromScraped', () => {
    it('should create deal data from scraped data', async () => {
      const userId = 'user-123';
      const scrapedData: Partial<Deal> = {
        id: 'deal-123',
        projectId: 'project-123',
        status: 'NEGOTIATION',
        type: 'PURCHASE',
        value: 500000,
        currency: 'EUR',
        parties: [],
        documents: [],
        milestones: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const dealData = await createDealFromScraped(scrapedData, userId);

      expect((dealData as any).title).toBe('Deal deal-123');
      expect((dealData as any).ownerId).toBe(userId);
      expect((dealData as any).source).toBe('scraping');
      expect((dealData as any).status).toBe('AVAILABLE');
      expect((dealData as any).metadata.scrapedAt).toBeDefined();
    });

    it('should handle missing scraped data with defaults', async () => {
      const userId = 'user-123';
      const scrapedData: Partial<Deal> = {
        id: 'deal-123',
        projectId: 'project-123',
        status: 'NEGOTIATION',
        type: 'PURCHASE',
        value: 500000,
        currency: 'EUR',
        parties: [],
        documents: [],
        milestones: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const dealData = await createDealFromScraped(scrapedData, userId);

      expect((dealData as any).title).toBe('Deal deal-123');
      expect((dealData as any).description).toBe('Deal identificato tramite scraping');
      expect((dealData as any).size).toBe(1000);
      expect((dealData as any).price).toBe(500000);
      expect((dealData as any).category).toBe('RESIDENTIAL');
    });
  });

  describe('createFeasibilityFromAnalysis', () => {
    it('should create feasibility data from analysis', async () => {
      const dealId = 'deal-123';
      const projectId = 'project-123';
      const userId = 'user-123';
      const analysis = {
        roi: 18,
        paybackYears: 4.5,
        npv: 200000,
        irr: 0.18,
        optimistic: 25,
        pessimistic: 12,
        variables: [{ name: 'Prezzo vendita', impact: 6, description: 'Variazione del 6%' }],
      };

      const feasibilityData = await createFeasibilityFromAnalysis(dealId, projectId, analysis, userId);

      expect((feasibilityData as any).dealId).toBe(dealId);
      expect((feasibilityData as any).projectId).toBe(projectId);
      expect((feasibilityData as any).generatedBy).toBe(userId);
      expect((feasibilityData as any).baseCase.roi).toBe(18);
      expect((feasibilityData as any).baseCase.paybackYears).toBe(4.5);
      expect((feasibilityData as any).sensitivityAnalysis.optimistic).toBe(25);
      expect((feasibilityData as any).sensitivityAnalysis.pessimistic).toBe(12);
    });

    it('should use default values when analysis is missing fields', async () => {
      const dealId = 'deal-123';
      const projectId = 'project-123';
      const userId = 'user-123';
      const analysis = {};

      const feasibilityData = await createFeasibilityFromAnalysis(dealId, projectId, analysis, userId);

      expect((feasibilityData as any).baseCase.roi).toBe(15);
      expect((feasibilityData as any).baseCase.paybackYears).toBe(5);
      expect((feasibilityData as any).sensitivityAnalysis.optimistic).toBe(20);
      expect((feasibilityData as any).sensitivityAnalysis.pessimistic).toBe(10);
      expect((feasibilityData as any).assumptions).toContain('Prezzo di vendita standard');
      expect((feasibilityData as any).recommendations).toContain("Procedere con l'analisi dettagliata");
    });
  });
});
