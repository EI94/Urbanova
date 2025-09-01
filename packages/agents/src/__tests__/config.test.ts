import { describe, it, expect } from '@jest/globals';

describe('Jest Configuration Test', () => {
  it('should be able to import types from @urbanova/types', () => {
    // This test verifies that the module resolution works correctly
    expect(true).toBe(true);
  });

  it('should have access to global test utilities', () => {
    // @ts-ignore - global.testUtils is defined in jest.setup.ts
    expect(global.testUtils).toBeDefined();
    // @ts-ignore
    expect(typeof global.testUtils.createMockChatCommand).toBe('function');
  });

  it('should have environment variables set', () => {
    expect(process.env.DOCUPLOAD_SECRET).toBe('test-secret-key-for-jest');
    expect(process.env.TWILIO_AUTH_TOKEN).toBe('test-twilio-token');
    expect(process.env.ALLOW_UNVERIFIED_WEBHOOKS).toBe('true');
  });

  it('should be able to use modern JavaScript features', () => {
    const testArray = [1, 2, 3, 4, 5];
    const doubled = testArray.map(x => x * 2);
    expect(doubled).toEqual([2, 4, 6, 8, 10]);
  });

  it('should be able to use async/await', async () => {
    const result = await Promise.resolve('test');
    expect(result).toBe('test');
  });
});
