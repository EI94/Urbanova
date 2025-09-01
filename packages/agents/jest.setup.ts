// Jest setup for @urbanova/agents package

// Mock environment variables
process.env.DOCUPLOAD_SECRET = 'test-secret-key-for-jest';
process.env.TWILIO_AUTH_TOKEN = 'test-twilio-token';
process.env.ALLOW_UNVERIFIED_WEBHOOKS = 'true';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock crypto module for Node.js environment
if (typeof global.crypto === 'undefined') {
  global.crypto = require('crypto').webcrypto;
}

// Mock URLSearchParams for Node.js environment
if (typeof global.URLSearchParams === 'undefined') {
  global.URLSearchParams = require('url').URLSearchParams;
}

// Mock fetch for Node.js environment
if (typeof global.fetch === 'undefined') {
  global.fetch = jest.fn();
}

// Mock Date.now for consistent testing
const mockDate = new Date('2024-01-01T00:00:00.000Z');
jest.spyOn(Date, 'now').mockImplementation(() => mockDate.getTime());

// Mock Math.random for consistent testing
jest.spyOn(Math, 'random').mockImplementation(() => 0.5);

// Global test utilities
(global as any).testUtils = {
  createMockChatCommand: (overrides = {}) => ({
    id: 'test-command-id',
    userId: 'test-user-id',
    message: 'Test message',
    timestamp: new Date(),
    source: 'WHATSAPP' as const,
    metadata: {},
    ...overrides,
  }),

  createMockChatResponse: (overrides = {}) => ({
    id: 'test-response-id',
    commandId: 'test-command-id',
    message: 'Test response',
    type: 'TEXT' as const,
    timestamp: new Date(),
    metadata: {
      processingTime: 0,
      confidence: 0.8,
      nextSteps: [],
    },
    ...overrides,
  }),

  createMockDocumentEntity: (overrides = {}) => ({
    id: 'test-doc-id',
    meta: {
      kind: 'CDU' as const,
      projectId: 'test-project-id',
      vendorId: 'test-vendor-id',
      required: true,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    status: 'REQUESTED' as const,
    fileUrl: undefined,
    extracted: undefined,
    issues: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),
};
