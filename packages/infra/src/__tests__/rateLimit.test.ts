import {
  TokenBucketRateLimiter,
  rateLimiter,
  checkWhatsAppRateLimit,
  getWhatsAppRateLimitStatus,
} from '../rateLimit';
import { RateLimitResult, RateLimitConfig } from '@urbanova/types';

// Mock firebase-admin
const mockFirestore = {
  collection: jest.fn(),
  doc: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
  serverTimestamp: jest.fn(() => ({ _methodName: 'serverTimestamp' })),
};

const mockDoc = {
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
};

const mockCollection = {
  doc: jest.fn(() => mockDoc),
};

jest.mock('firebase-admin', () => ({
  firestore: () => mockFirestore,
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
  },
}));

// Mock the firebase module
jest.mock('../firebase', () => ({
  getFirestoreInstance: jest.fn(() => mockFirestore),
  serverTimestamp: jest.fn(() => ({ _methodName: 'serverTimestamp' })),
}));

describe('TokenBucketRateLimiter', () => {
  let limiter: TokenBucketRateLimiter;
  const mockConfig: RateLimitConfig = {
    capacity: 10,
    refillRate: 1,
    refillInterval: 20000, // 20 seconds
  };

  beforeEach(() => {
    jest.clearAllMocks();
    limiter = new TokenBucketRateLimiter();

    mockFirestore.collection.mockReturnValue(mockCollection);
    mockCollection.doc.mockReturnValue(mockDoc);
  });

  describe('checkRateLimit', () => {
    it('should allow request when bucket has tokens', async () => {
      const now = Date.now();
      const mockState = {
        tokens: 5,
        lastRefill: now - 10000, // 10 seconds ago
        createdAt: { _seconds: Math.floor(now / 1000) - 3600 },
        updatedAt: { _seconds: Math.floor(now / 1000) - 10 },
      };

      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockState,
      });
      mockDoc.update.mockResolvedValue({});

      const result = await limiter.checkRateLimit('test-key', mockConfig);

      expect(result).toEqual({
        allowed: true,
        remainingTokens: expect.any(Number),
        resetTime: expect.any(Number),
        retryAfter: 0,
      });
      expect(mockDoc.update).toHaveBeenCalled();
    });

    it('should deny request when bucket is empty', async () => {
      const now = Date.now();
      const mockState = {
        tokens: 0,
        lastRefill: now - 10000,
        createdAt: { _seconds: Math.floor(now / 1000) - 3600 },
        updatedAt: { _seconds: Math.floor(now / 1000) - 10 },
      };

      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockState,
      });

      const result = await limiter.checkRateLimit('test-key', mockConfig);

      expect(result).toEqual({
        allowed: false,
        remainingTokens: 0,
        resetTime: expect.any(Number),
        retryAfter: expect.any(Number),
      });
      expect(mockDoc.update).not.toHaveBeenCalled();
    });

    it('should create new bucket when key does not exist', async () => {
      mockDoc.get.mockResolvedValue({
        exists: false,
      });
      mockDoc.set.mockResolvedValue({});

      const result = await limiter.checkRateLimit('new-key', mockConfig);

      expect(result).toEqual({
        allowed: true,
        remainingTokens: mockConfig.capacity - 1,
        resetTime: expect.any(Number),
        retryAfter: 0,
      });
      expect(mockDoc.set).toHaveBeenCalledWith({
        tokens: mockConfig.capacity - 1,
        lastRefill: expect.any(Number),
        createdAt: expect.any(Object),
        updatedAt: expect.any(Object),
      });
    });

    it('should refill tokens based on time elapsed', async () => {
      const now = Date.now();
      const mockState = {
        tokens: 2,
        lastRefill: now - 60000, // 60 seconds ago (should refill 3 tokens)
        createdAt: { _seconds: Math.floor(now / 1000) - 3600 },
        updatedAt: { _seconds: Math.floor(now / 1000) - 60 },
      };

      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockState,
      });
      mockDoc.update.mockResolvedValue({});

      const result = await limiter.checkRateLimit('test-key', mockConfig);

      expect(result.allowed).toBe(true);
      expect(result.remainingTokens).toBeGreaterThan(2); // Should have more tokens after refill
      expect(mockDoc.update).toHaveBeenCalled();
    });

    it('should handle Firestore errors gracefully', async () => {
      const error = new Error('Firestore error');
      mockDoc.get.mockRejectedValue(error);

      const result = await limiter.checkRateLimit('test-key', mockConfig);

      expect(result).toEqual({
        allowed: false,
        remainingTokens: 0,
        resetTime: expect.any(Number),
        retryAfter: expect.any(Number),
      });
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return current bucket status', async () => {
      const now = Date.now();
      const mockState = {
        tokens: 7,
        lastRefill: now - 5000,
        createdAt: { _seconds: Math.floor(now / 1000) - 3600 },
        updatedAt: { _seconds: Math.floor(now / 1000) - 5 },
      };

      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockState,
      });

      const result = await limiter.getRateLimitStatus('test-key', mockConfig);

      expect(result).toEqual({
        allowed: true,
        remainingTokens: expect.any(Number),
        resetTime: expect.any(Number),
        retryAfter: 0,
      });
    });

    it('should return default status for non-existent key', async () => {
      mockDoc.get.mockResolvedValue({
        exists: false,
      });

      const result = await limiter.getRateLimitStatus('new-key', mockConfig);

      expect(result).toEqual({
        allowed: true,
        remainingTokens: mockConfig.capacity,
        resetTime: expect.any(Number),
        retryAfter: 0,
      });
    });

    it('should handle Firestore errors in status check', async () => {
      const error = new Error('Firestore error');
      mockDoc.get.mockRejectedValue(error);

      const result = await limiter.getRateLimitStatus('test-key', mockConfig);

      expect(result).toEqual({
        allowed: false,
        remainingTokens: 0,
        resetTime: expect.any(Number),
        retryAfter: expect.any(Number),
      });
    });
  });
});

describe('WhatsApp rate limiting functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFirestore.collection.mockReturnValue(mockCollection);
    mockCollection.doc.mockReturnValue(mockDoc);
  });

  describe('checkWhatsAppRateLimit', () => {
    it('should check rate limit for WhatsApp sender', async () => {
      const mockState = {
        tokens: 5,
        lastRefill: Date.now() - 10000,
        createdAt: { _seconds: Math.floor(Date.now() / 1000) - 3600 },
        updatedAt: { _seconds: Math.floor(Date.now() / 1000) - 10 },
      };

      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockState,
      });
      mockDoc.update.mockResolvedValue({});

      const result = await checkWhatsAppRateLimit('wa:+1234567890');

      expect(result.allowed).toBe(true);
      expect(mockFirestore.collection).toHaveBeenCalledWith('rateLimits');
      expect(mockCollection.doc).toHaveBeenCalledWith('wa:+1234567890');
    });
  });

  describe('getWhatsAppRateLimitStatus', () => {
    it('should get rate limit status for WhatsApp sender', async () => {
      const mockState = {
        tokens: 3,
        lastRefill: Date.now() - 15000,
        createdAt: { _seconds: Math.floor(Date.now() / 1000) - 3600 },
        updatedAt: { _seconds: Math.floor(Date.now() / 1000) - 15 },
      };

      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockState,
      });

      const result = await getWhatsAppRateLimitStatus('wa:+1234567890');

      expect(result.allowed).toBe(true);
      expect(mockFirestore.collection).toHaveBeenCalledWith('rateLimits');
      expect(mockCollection.doc).toHaveBeenCalledWith('wa:+1234567890');
    });
  });
});

describe('singleton rate limiter', () => {
  it('should export a singleton instance', () => {
    expect(rateLimiter).toBeInstanceOf(TokenBucketRateLimiter);
  });
});
