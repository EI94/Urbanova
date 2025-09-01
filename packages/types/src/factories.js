'use strict';
// Test factories for @urbanova/types package
Object.defineProperty(exports, '__esModule', { value: true });
exports.createMockData =
  exports.createChatResponse =
  exports.createChatCommand =
  exports.createUserRole =
  exports.createAuditEvent =
  exports.createListing =
  exports.createVendor =
  exports.createDocument =
  exports.createFeasibilityDocument =
  exports.createFeasibilityResult =
  exports.createFeasibilityInput =
  exports.createParcelDocument =
  exports.createParcel =
  exports.createDealDocument =
  exports.createDeal =
  exports.createProjectDocument =
  exports.createProject =
    void 0;
const firestore_1 = require('firebase/firestore');
// Helper function to create Timestamp from Date
const createTimestamp = (date = new Date()) => {
  return firestore_1.Timestamp.fromDate(date);
};
// Helper function to generate random ID
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
// Project factories
const createProject = (overrides = {}) => ({
  id: generateId(),
  name: 'Test Project',
  description: 'A test project for development purposes',
  status: 'PLANNING',
  type: 'RESIDENTIAL',
  location: {
    address: 'Via Roma 123',
    city: 'Milano',
    province: 'MI',
    region: 'Lombardia',
    country: 'Italia',
  },
  budget: {
    total: 1000000,
    currency: 'EUR',
    breakdown: {
      land: 500000,
      construction: 400000,
      permits: 50000,
      design: 30000,
      other: 20000,
    },
    contingency: 100000,
  },
  timeline: {
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    phases: [
      {
        name: 'Planning',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        dependencies: [],
      },
    ],
  },
  ownerId: generateId(),
  teamMembers: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
exports.createProject = createProject;
const createProjectDocument = (overrides = {}) => ({
  id: generateId(),
  name: 'Test Project Document',
  description: 'A test project document for development purposes',
  status: 'PLANNING',
  type: 'RESIDENTIAL',
  location: {
    address: 'Via Roma 123',
    city: 'Milano',
    province: 'MI',
    region: 'Lombardia',
    country: 'Italia',
  },
  budget: {
    total: 1000000,
    currency: 'EUR',
    breakdown: {
      land: 500000,
      construction: 400000,
      permits: 50000,
      design: 30000,
      other: 20000,
    },
    contingency: 100000,
  },
  timeline: {
    startDate: createTimestamp(),
    endDate: createTimestamp(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
    phases: [
      {
        name: 'Planning',
        startDate: createTimestamp(),
        endDate: createTimestamp(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        dependencies: [],
      },
    ],
  },
  teamMembers: [],
  tags: ['test', 'development'],
  isPublic: false,
  createdAt: createTimestamp(),
  updatedAt: createTimestamp(),
  ownerId: generateId(),
  version: 1,
  ...overrides,
});
exports.createProjectDocument = createProjectDocument;
// Deal factories
const createDeal = (overrides = {}) => ({
  id: generateId(),
  projectId: generateId(),
  status: 'NEGOTIATION',
  type: 'PURCHASE',
  value: 500000,
  currency: 'EUR',
  parties: [
    {
      id: generateId(),
      name: 'Test Buyer',
      type: 'BUYER',
      contact: {
        name: 'Test Buyer',
        email: 'buyer@test.com',
        phone: '+39 123 456 789',
      },
    },
  ],
  documents: [],
  milestones: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
exports.createDeal = createDeal;
const createDealDocument = (overrides = {}) => ({
  id: generateId(),
  projectId: generateId(),
  status: 'NEGOTIATION',
  type: 'PURCHASE',
  value: 500000,
  currency: 'EUR',
  parties: [
    {
      id: generateId(),
      name: 'Test Buyer',
      type: 'BUYER',
      contact: {
        name: 'Test Buyer',
        email: 'buyer@test.com',
        phone: '+39 123 456 789',
      },
    },
  ],
  documents: [],
  milestones: [],
  negotiationHistory: [],
  isConfidential: false,
  createdAt: createTimestamp(),
  updatedAt: createTimestamp(),
  ownerId: generateId(),
  version: 1,
  ...overrides,
});
exports.createDealDocument = createDealDocument;
// Parcel factories
const createParcel = (overrides = {}) => ({
  id: generateId(),
  address: 'Via Roma 123, Milano',
  coordinates: {
    latitude: 45.4642,
    longitude: 9.19,
  },
  area: 500,
  zoning: {
    zone: 'RESIDENTIAL',
    allowedUses: ['RESIDENTIAL', 'COMMERCIAL'],
    restrictions: ['Height limit 15m'],
  },
  ownership: {
    owner: 'Test Owner',
    ownershipType: 'FREEHOLD',
    encumbrances: [],
  },
  restrictions: [],
  marketValue: 500000,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
exports.createParcel = createParcel;
const createParcelDocument = (overrides = {}) => ({
  id: generateId(),
  address: 'Via Roma 123, Milano',
  coordinates: {
    latitude: 45.4642,
    longitude: 9.19,
  },
  area: 500,
  zoning: {
    zone: 'RESIDENTIAL',
    allowedUses: ['RESIDENTIAL', 'COMMERCIAL'],
    restrictions: ['Height limit 15m'],
  },
  ownership: {
    owner: 'Test Owner',
    ownershipType: 'FREEHOLD',
    encumbrances: [],
  },
  restrictions: [],
  marketValue: 500000,
  propertyTax: 2000,
  utilities: {
    water: true,
    electricity: true,
    gas: true,
    sewage: true,
    internet: true,
  },
  accessibility: {
    roadAccess: true,
    publicTransport: true,
    parking: true,
  },
  environmentalFactors: [],
  images: [],
  documents: [],
  isListed: false,
  createdAt: createTimestamp(),
  updatedAt: createTimestamp(),
  ownerId: generateId(),
  version: 1,
  ...overrides,
});
exports.createParcelDocument = createParcelDocument;
// Feasibility factories
const createFeasibilityInput = (overrides = {}) => ({
  parcelId: generateId(),
  projectType: 'RESIDENTIAL',
  budget: {
    total: 1000000,
    currency: 'EUR',
    breakdown: {
      land: 500000,
      construction: 400000,
      permits: 50000,
      design: 30000,
      other: 20000,
    },
    contingency: 100000,
  },
  timeline: {
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    phases: [
      {
        name: 'Planning',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        dependencies: [],
      },
    ],
  },
  marketConditions: {
    demand: 'HIGH',
    supply: 'MEDIUM',
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
  ...overrides,
});
exports.createFeasibilityInput = createFeasibilityInput;
const createFeasibilityResult = (overrides = {}) => ({
  id: generateId(),
  input: (0, exports.createFeasibilityInput)(),
  analysis: {
    technical: {
      score: 85,
      factors: [
        {
          name: 'Location',
          weight: 0.3,
          score: 90,
          impact: 'POSITIVE',
        },
      ],
      risks: ['Limited parking'],
      opportunities: ['Good public transport'],
    },
    financial: {
      score: 80,
      npv: 150000,
      irr: 12.5,
      paybackPeriod: 84,
      sensitivity: {
        baseCase: 12.5,
        optimistic: 15.0,
        pessimistic: 8.0,
        variables: [
          {
            name: 'Construction costs',
            impact: -2.0,
            description: '10% increase in construction costs',
          },
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
      timeline: 6,
    },
    market: {
      score: 85,
      demand: 85,
      competition: 70,
      pricing: 90,
    },
  },
  recommendations: [
    {
      type: 'PROCEED',
      priority: 'HIGH',
      description: 'Project shows strong financial viability',
      actions: ['Secure financing', 'Obtain permits'],
      timeline: 30,
    },
  ],
  riskAssessment: {
    overall: 'MEDIUM',
    risks: [
      {
        category: 'Construction',
        probability: 'MEDIUM',
        impact: 'HIGH',
        description: 'Potential construction delays',
      },
    ],
    mitigation: [
      {
        riskId: '1',
        strategy: 'Contingency planning',
        cost: 50000,
        effectiveness: 80,
      },
    ],
  },
  roi: {
    expected: 12.5,
    minimum: 8.0,
    maximum: 15.0,
    factors: [
      {
        name: 'Market growth',
        impact: 2.0,
        description: 'Expected market appreciation',
      },
    ],
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
exports.createFeasibilityResult = createFeasibilityResult;
const createFeasibilityDocument = (overrides = {}) => ({
  id: generateId(),
  parcelId: generateId(),
  projectType: 'RESIDENTIAL',
  input: {
    budget: {
      total: 1000000,
      currency: 'EUR',
      breakdown: {
        land: 500000,
        construction: 400000,
        permits: 50000,
        design: 30000,
        other: 20000,
      },
      contingency: 100000,
    },
    timeline: {
      startDate: createTimestamp(),
      endDate: createTimestamp(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
      phases: [
        {
          name: 'Planning',
          startDate: createTimestamp(),
          endDate: createTimestamp(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
          dependencies: [],
        },
      ],
    },
    marketConditions: {
      demand: 'HIGH',
      supply: 'MEDIUM',
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
      factors: [
        {
          name: 'Location',
          weight: 0.3,
          score: 90,
          impact: 'POSITIVE',
        },
      ],
      risks: ['Limited parking'],
      opportunities: ['Good public transport'],
    },
    financial: {
      score: 80,
      npv: 150000,
      irr: 12.5,
      paybackPeriod: 84,
      sensitivity: {
        baseCase: 12.5,
        optimistic: 15.0,
        pessimistic: 8.0,
        variables: [
          {
            name: 'Construction costs',
            impact: -2.0,
            description: '10% increase in construction costs',
          },
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
      timeline: 6,
    },
    market: {
      score: 85,
      demand: 85,
      competition: 70,
      pricing: 90,
    },
  },
  recommendations: [
    {
      type: 'PROCEED',
      priority: 'HIGH',
      description: 'Project shows strong financial viability',
      actions: ['Secure financing', 'Obtain permits'],
      timeline: 30,
    },
  ],
  riskAssessment: {
    overall: 'MEDIUM',
    risks: [
      {
        category: 'Construction',
        probability: 'MEDIUM',
        impact: 'HIGH',
        description: 'Potential construction delays',
      },
    ],
    mitigation: [
      {
        riskId: '1',
        strategy: 'Contingency planning',
        cost: 50000,
        effectiveness: 80,
      },
    ],
  },
  roi: {
    expected: 12.5,
    minimum: 8.0,
    maximum: 15.0,
    factors: [
      {
        name: 'Market growth',
        impact: 2.0,
        description: 'Expected market appreciation',
      },
    ],
  },
  status: 'DRAFT',
  createdAt: createTimestamp(),
  updatedAt: createTimestamp(),
  ownerId: generateId(),
  version: 1,
  ...overrides,
});
exports.createFeasibilityDocument = createFeasibilityDocument;
// Document factories
const createDocument = (overrides = {}) => ({
  id: generateId(),
  name: 'Test Document',
  type: 'REPORT',
  url: 'https://example.com/test-document.pdf',
  size: 1024 * 1024, // 1MB
  mimeType: 'application/pdf',
  metadata: {
    author: 'Test User',
    version: '1.0',
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
exports.createDocument = createDocument;
// Vendor factories
const createVendor = (overrides = {}) => ({
  id: generateId(),
  name: 'Test Vendor',
  type: 'CONTRACTOR',
  contact: {
    name: 'Test Contact',
    email: 'contact@testvendor.com',
    phone: '+39 123 456 789',
  },
  services: [
    {
      name: 'Construction',
      description: 'General construction services',
      pricing: {
        type: 'FIXED',
        amount: 100000,
        currency: 'EUR',
      },
      availability: {
        status: 'AVAILABLE',
        capacity: 80,
      },
    },
  ],
  rating: 4.5,
  availability: {
    status: 'AVAILABLE',
    capacity: 80,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
exports.createVendor = createVendor;
// Listing factories
const createListing = (overrides = {}) => ({
  id: generateId(),
  source: 'IMMOBILIARE_IT',
  externalId: '12345',
  title: 'Terreno edificabile a Milano',
  description: 'Terreno di 500mq edificabile a Milano',
  price: 500000,
  currency: 'EUR',
  location: {
    address: 'Via Roma 123',
    city: 'Milano',
    province: 'MI',
    region: 'Lombardia',
    country: 'Italia',
  },
  features: ['Edificabile', 'Accesso diretto'],
  images: ['https://example.com/image1.jpg'],
  contactInfo: {
    name: 'Test Agent',
    email: 'agent@test.com',
    phone: '+39 123 456 789',
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
exports.createListing = createListing;
// AuditEvent factories
const createAuditEvent = (overrides = {}) => ({
  id: generateId(),
  userId: generateId(),
  action: 'CREATE',
  resourceType: 'PROJECT',
  resourceId: generateId(),
  details: {
    projectName: 'Test Project',
  },
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0 (Test Browser)',
  timestamp: new Date(),
  ...overrides,
});
exports.createAuditEvent = createAuditEvent;
// UserRole factories
const createUserRole = (overrides = {}) => ({
  id: generateId(),
  userId: generateId(),
  role: 'MEMBER',
  permissions: [
    {
      resource: 'PROJECT',
      actions: ['READ', 'UPDATE'],
    },
  ],
  scope: 'PROJECT',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
exports.createUserRole = createUserRole;
// Chat factories
const createChatCommand = (overrides = {}) => ({
  id: generateId(),
  userId: generateId(),
  message: 'Show me project status',
  timestamp: new Date(),
  source: 'WHATSAPP',
  metadata: {
    phoneNumber: '+39 123 456 789',
    chatId: 'test-chat-id',
    sessionId: 'test-session-id',
    language: 'it',
  },
  ...overrides,
});
exports.createChatCommand = createChatCommand;
const createChatResponse = (overrides = {}) => ({
  id: generateId(),
  commandId: generateId(),
  message: 'Here is your project status',
  type: 'TEXT',
  actions: [
    {
      type: 'BUTTON',
      label: 'View Details',
      value: 'view_project',
      primary: true,
    },
  ],
  metadata: {
    processingTime: 150,
    confidence: 0.95,
    nextSteps: ['Review project details', 'Update timeline if needed'],
  },
  timestamp: new Date(),
  ...overrides,
});
exports.createChatResponse = createChatResponse;
// Utility functions
exports.createMockData = {
  projects: (count = 5) => Array.from({ length: count }, () => (0, exports.createProject)()),
  deals: (count = 5) => Array.from({ length: count }, () => (0, exports.createDeal)()),
  parcels: (count = 5) => Array.from({ length: count }, () => (0, exports.createParcel)()),
  feasibilityResults: (count = 5) =>
    Array.from({ length: count }, () => (0, exports.createFeasibilityResult)()),
  documents: (count = 5) => Array.from({ length: count }, () => (0, exports.createDocument)()),
  vendors: (count = 5) => Array.from({ length: count }, () => (0, exports.createVendor)()),
  listings: (count = 5) => Array.from({ length: count }, () => (0, exports.createListing)()),
  auditEvents: (count = 5) => Array.from({ length: count }, () => (0, exports.createAuditEvent)()),
  userRoles: (count = 5) => Array.from({ length: count }, () => (0, exports.createUserRole)()),
  chatCommands: (count = 5) =>
    Array.from({ length: count }, () => (0, exports.createChatCommand)()),
  chatResponses: (count = 5) =>
    Array.from({ length: count }, () => (0, exports.createChatResponse)()),
};
//# sourceMappingURL=factories.js.map
