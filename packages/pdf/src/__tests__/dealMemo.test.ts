import {
  RealFeasibilityReportGenerator,
  createProjectDeepLink,
  formatFinancialMetrics,
} from '../dealMemo';
import type { Project, Deal, FeasibilityResult } from '@urbanova/types';

// Mock data
const mockProject: Project = {
  id: 'project-123',
  name: 'Progetto Milano Centro',
  description: 'Progetto residenziale in centro',
  type: 'RESIDENTIAL',
  location: {
    address: 'Via Roma 1',
    city: 'Milano',
    province: 'MI',
    region: 'Lombardia',
    country: 'Italia',
  },
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
  status: 'PLANNING',
  ownerId: 'user-123',
  teamMembers: [
    {
      userId: 'user-123',
      role: 'OWNER',
      permissions: [],
      joinedAt: new Date(),
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockDeal: Deal = {
  id: 'deal-456',
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
  id: 'feasibility-789',
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

describe('Deal Memo Service', () => {
  let mockGenerator: RealFeasibilityReportGenerator;

  beforeEach(() => {
    mockGenerator = new RealFeasibilityReportGenerator();
  });

  describe('MockFeasibilityReportGenerator', () => {
    it('should generate deal memo and return URL', async () => {
      const pdfUrl = await mockGenerator.generateDealMemo(mockProject, mockDeal, mockFeasibility);

      expect(pdfUrl).toMatch(/^https:\/\/storage\.googleapis\.com\/mock-bucket\/deal-memos\//);
      expect(pdfUrl).toContain(mockProject.id);
      expect(pdfUrl).toContain(mockDeal.id);
      expect(pdfUrl).toMatch(/\.pdf$/);
    });

    it('should include timestamp in URL for uniqueness', async () => {
      const url1 = await mockGenerator.generateDealMemo(mockProject, mockDeal, mockFeasibility);
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
      const url2 = await mockGenerator.generateDealMemo(mockProject, mockDeal, mockFeasibility);

      expect(url1).not.toBe(url2);
    });

    it('should handle different project and deal combinations', async () => {
      const differentProject = { ...mockProject, id: 'project-999' };
      const differentDeal = { ...mockDeal, id: 'deal-999' };

      const pdfUrl = await mockGenerator.generateDealMemo(
        differentProject,
        differentDeal,
        mockFeasibility
      );

      expect(pdfUrl).toContain('project-999');
      expect(pdfUrl).toContain('deal-999');
    });
  });

  describe('createProjectDeepLink', () => {
    it('should create correct project deep link', () => {
      const projectId = 'project-123';
      const deepLink = createProjectDeepLink(projectId);

      expect(deepLink).toBe('/dashboard/projects/project-123');
    });

    it('should work with different project IDs', () => {
      const projectIds = ['project-abc', 'project-xyz', 'project-123'];

      projectIds.forEach(id => {
        const deepLink = createProjectDeepLink(id);
        expect(deepLink).toBe(`/dashboard/projects/${id}`);
      });
    });
  });

  describe('formatFinancialMetrics', () => {
    it('should format ROI and payback years correctly', () => {
      const metrics = formatFinancialMetrics(mockFeasibility);

      expect(metrics.roi).toBe('15.0%');
      expect(metrics.paybackYears).toBe('5.0 anni');
    });

    it('should handle decimal values', () => {
      const feasibilityWithDecimals = {
        ...mockFeasibility,
        analysis: {
          ...mockFeasibility.analysis,
          financial: {
            ...mockFeasibility.analysis.financial,
            sensitivity: {
              ...mockFeasibility.analysis.financial.sensitivity,
              baseCase: 12.7,
            },
          },
        },
        roi: {
          ...mockFeasibility.roi,
          expected: 12.7,
        },
      };

      const metrics = formatFinancialMetrics(feasibilityWithDecimals);

      expect(metrics.roi).toBe('12.7%');
      expect(metrics.paybackYears).toBe('3.8 anni');
    });

    it('should handle zero values', () => {
      const feasibilityWithZeros = {
        ...mockFeasibility,
        analysis: {
          ...mockFeasibility.analysis,
          financial: {
            ...mockFeasibility.analysis.financial,
            sensitivity: {
              ...mockFeasibility.analysis.financial.sensitivity,
              baseCase: 0,
            },
          },
        },
        roi: {
          ...mockFeasibility.roi,
          expected: 0,
        },
      };

      const metrics = formatFinancialMetrics(feasibilityWithZeros);

      expect(metrics.roi).toBe('0.0%');
      expect(metrics.paybackYears).toBe('0.0 anni');
    });
  });
});
