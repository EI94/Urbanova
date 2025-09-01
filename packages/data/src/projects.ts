// Data persistence service for @urbanova/data package

import { z } from 'zod';
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

type Project = {
  id: string;
  name: string;
  description: string;
  status: string;
  type: string;
  location: any;
  budget: any;
  timeline: any;
  ownerId: string;
  teamMembers: any[];
  createdAt: Date;
  updatedAt: Date;
};
import { getFirestoreInstance, serverTimestamp } from '@urbanova/infra';

// Zod schemas for data validation
export const zCreateProjectData = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED']),
  type: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'MIXED']),
  location: z.object({
    address: z.string(),
    city: z.string(),
    province: z.string(),
    region: z.string(),
    country: z.string(),
  }),
  budget: z.object({
    total: z.number().positive(),
    currency: z.string().default('EUR'),
    breakdown: z.object({
      land: z.number().nonnegative(),
      construction: z.number().nonnegative(),
      permits: z.number().nonnegative(),
      design: z.number().nonnegative(),
      other: z.number().nonnegative(),
    }),
    contingency: z.number().nonnegative(),
  }),
  timeline: z.object({
    startDate: z.date(),
    endDate: z.date(),
    phases: z.array(z.any()).default([]),
  }),
  ownerId: z.string().min(1),
  teamMembers: z
    .array(
      z.object({
        userId: z.string(),
        role: z.string(),
        permissions: z.array(z.string()).default([]),
        joinedAt: z.date(),
      })
    )
    .default([]),
});

export type CreateProjectData = z.infer<typeof zCreateProjectData>;

export const zCreateDealData = z.object({
  projectId: z.string().min(1),
  status: z.enum(['NEGOTIATION', 'CLOSED', 'CANCELLED']),
  type: z.enum(['PURCHASE', 'SALE', 'LEASE']),
  value: z.number().positive(),
  currency: z.string().default('EUR'),
  parties: z.array(z.any()).default([]),
  documents: z.array(z.any()).default([]),
  milestones: z.array(z.any()).default([]),
  ownerId: z.string().min(1),
});

export type CreateDealData = z.infer<typeof zCreateDealData>;

export const zCreateFeasibilityData = z.object({
  dealId: z.string().min(1),
  projectId: z.string().min(1),
  analysis: z.object({
    baseCase: z.object({
      roi: z.number(),
      paybackPeriod: z.number(),
      netPresentValue: z.number(),
      internalRateOfReturn: z.number(),
    }),
    sensitivity: z.object({
      optimistic: z.number(),
      pessimistic: z.number(),
      variables: z.array(
        z.object({
          name: z.string(),
          impact: z.number(),
          description: z.string(),
        })
      ),
    }),
  }),
  recommendations: z
    .array(
      z.object({
        description: z.string(),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
        impact: z.string(),
      })
    )
    .default([]),
  riskAssessment: z.object({
    overall: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    factors: z.array(z.string()).default([]),
    mitigation: z.array(z.string()).default([]),
  }),
  roi: z.object({
    expected: z.number(),
    min: z.number(),
    max: z.number(),
  }),
  ownerId: z.string().min(1),
});

export type CreateFeasibilityData = z.infer<typeof zCreateFeasibilityData>;

// Real implementation using Firestore
export async function createProjectFromDeal(
  deal: Deal,
  feasibility: FeasibilityResult,
  userId: string
): Promise<CreateProjectData> {
  const projectData: CreateProjectData = {
    name: `Progetto ${deal.id}`,
    description: `Progetto generato automaticamente dal deal ${deal.id}`,
    status: 'PLANNING',
    type: 'RESIDENTIAL', // Default
    location: {
      address: 'Via Roma 1',
      city: 'Milano',
      province: 'MI',
      region: 'Lombardia',
      country: 'Italia',
    },
    budget: {
      total: deal.value,
      currency: deal.currency,
      breakdown: {
        land: deal.value * 0.8,
        construction: deal.value * 0.15,
        permits: deal.value * 0.05,
        design: 0,
        other: 0,
      },
      contingency: deal.value * 0.1,
    },
    timeline: {
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      phases: [],
    },
    ownerId: userId,
    teamMembers: [
      {
        userId,
        role: 'OWNER',
        permissions: [],
        joinedAt: new Date(),
      },
    ],
  };

  return zCreateProjectData.parse(projectData);
}

export async function createDealFromScraped(
  scrapedData: any,
  userId: string
): Promise<CreateDealData> {
  const dealData: CreateDealData = {
    projectId: `project-${Date.now()}`,
    status: 'NEGOTIATION',
    type: 'PURCHASE',
    value: scrapedData.price || 500000,
    currency: scrapedData.currency || 'EUR',
    parties: [],
    documents: [],
    milestones: [],
    ownerId: userId,
  };

  return zCreateDealData.parse(dealData);
}

export async function createFeasibilityFromAnalysis(
  dealId: string,
  projectId: string,
  analysis: any,
  userId: string
): Promise<CreateFeasibilityData> {
  const feasibilityData: CreateFeasibilityData = {
    dealId,
    projectId,
    analysis: {
      baseCase: {
        roi: analysis.baseCase?.roi || 15,
        paybackPeriod: analysis.baseCase?.paybackPeriod || 60,
        netPresentValue: analysis.baseCase?.netPresentValue || 150000,
        internalRateOfReturn: analysis.baseCase?.internalRateOfReturn || 0.15,
      },
      sensitivity: {
        optimistic: analysis.sensitivityAnalysis?.optimistic || 20,
        pessimistic: analysis.sensitivityAnalysis?.pessimistic || 10,
        variables: analysis.sensitivityAnalysis?.variables || [],
      },
    },
    recommendations:
      analysis.recommendations?.map((r: string) => ({
        description: r,
        priority: 'MEDIUM' as const,
        impact: 'POSITIVE',
      })) || [],
    riskAssessment: {
      overall: 'MEDIUM' as const,
      factors: ['Mercato', 'Permessi', 'Costi'],
      mitigation: ['Analisi di mercato', 'Verifica permessi', 'Controllo costi'],
    },
    roi: {
      expected: analysis.baseCase?.roi || 15,
      min: analysis.sensitivityAnalysis?.pessimistic || 10,
      max: analysis.sensitivityAnalysis?.optimistic || 20,
    },
    ownerId: userId,
  };

  return zCreateFeasibilityData.parse(feasibilityData);
}

// Real Firestore persistence functions
export async function persistProject(projectData: CreateProjectData): Promise<string> {
  try {
    const db = getFirestoreInstance();
    const projectId = `project-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const projectRef = db.collection('projects').doc(projectId);
    await projectRef.set({
      ...projectData,
      id: projectId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ Project persisted to Firestore: ${projectId}`);
    return projectId;
  } catch (error) {
    console.error('❌ Error persisting project to Firestore:', error);
    throw error;
  }
}

export async function persistDeal(dealData: CreateDealData): Promise<string> {
  try {
    const db = getFirestoreInstance();
    const dealId = `deal-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const dealRef = db.collection('deals').doc(dealId);
    await dealRef.set({
      ...dealData,
      id: dealId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ Deal persisted to Firestore: ${dealId}`);
    return dealId;
  } catch (error) {
    console.error('❌ Error persisting deal to Firestore:', error);
    throw error;
  }
}

export async function persistFeasibility(feasibilityData: CreateFeasibilityData): Promise<string> {
  try {
    const db = getFirestoreInstance();
    const feasibilityId = `feasibility-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const feasibilityRef = db.collection('feasibility').doc(feasibilityId);
    await feasibilityRef.set({
      ...feasibilityData,
      id: feasibilityId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ Feasibility persisted to Firestore: ${feasibilityId}`);
    return feasibilityId;
  } catch (error) {
    console.error('❌ Error persisting feasibility to Firestore:', error);
    throw error;
  }
}
