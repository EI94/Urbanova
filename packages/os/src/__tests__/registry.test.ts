import { CapabilityRegistry } from '../registry';
import { Capability, CapabilitySpec } from '@urbanova/types';

// Mock capability per i test
const createMockCapability = (name: string): Capability => ({
  spec: {
    name,
    description: `Test capability ${name}`,
    zArgs: { type: 'object' } as any,
    requiredRole: 'pm' as const,
    confirm: false,
    dryRun: false,
  },
  handler: jest.fn().mockResolvedValue(`Result from ${name}`),
});

describe('CapabilityRegistry', () => {
  let registry: CapabilityRegistry;

  beforeEach(() => {
    registry = new CapabilityRegistry();
  });

  describe('register', () => {
    it('should register a capability successfully', () => {
      const capability = createMockCapability('test.capability');

      expect(() => registry.register(capability)).not.toThrow();
      expect(registry.has('test.capability')).toBe(true);
    });

    it('should throw error when registering duplicate capability', () => {
      const capability1 = createMockCapability('test.capability');
      const capability2 = createMockCapability('test.capability');

      registry.register(capability1);

      expect(() => registry.register(capability2)).toThrow(
        'Capability test.capability already registered'
      );
    });
  });

  describe('get', () => {
    it('should return capability when it exists', () => {
      const capability = createMockCapability('test.capability');
      registry.register(capability);

      const retrieved = registry.get('test.capability');
      expect(retrieved).toBe(capability);
    });

    it('should return undefined when capability does not exist', () => {
      const retrieved = registry.get('nonexistent');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('list', () => {
    it('should return all registered capabilities', () => {
      const capability1 = createMockCapability('test.capability1');
      const capability2 = createMockCapability('test.capability2');

      registry.register(capability1);
      registry.register(capability2);

      const list = registry.list();
      expect(list).toHaveLength(2);
      expect(list).toContain(capability1);
      expect(list).toContain(capability2);
    });

    it('should return empty array when no capabilities registered', () => {
      const list = registry.list();
      expect(list).toHaveLength(0);
    });
  });

  describe('listByRole', () => {
    it('should return capabilities filtered by role', () => {
      const pmCapability = createMockCapability('pm.capability');
      const salesCapability = createMockCapability('sales.capability');

      // Override role for sales capability
      salesCapability.spec.requiredRole = 'sales';

      registry.register(pmCapability);
      registry.register(salesCapability);

      const pmCapabilities = registry.listByRole('pm');
      expect(pmCapabilities).toHaveLength(1);
      expect(pmCapabilities[0]).toBe(pmCapability);

      const salesCapabilities = registry.listByRole('sales');
      expect(salesCapabilities).toHaveLength(1);
      expect(salesCapabilities[0]).toBe(salesCapability);
    });
  });

  describe('has', () => {
    it('should return true when capability exists', () => {
      const capability = createMockCapability('test.capability');
      registry.register(capability);

      expect(registry.has('test.capability')).toBe(true);
    });

    it('should return false when capability does not exist', () => {
      expect(registry.has('nonexistent')).toBe(false);
    });
  });

  describe('unregister', () => {
    it('should remove capability successfully', () => {
      const capability = createMockCapability('test.capability');
      registry.register(capability);

      expect(registry.has('test.capability')).toBe(true);

      const removed = registry.unregister('test.capability');
      expect(removed).toBe(true);
      expect(registry.has('test.capability')).toBe(false);
    });

    it('should return false when capability does not exist', () => {
      const removed = registry.unregister('nonexistent');
      expect(removed).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all capabilities', () => {
      const capability1 = createMockCapability('test.capability1');
      const capability2 = createMockCapability('test.capability2');

      registry.register(capability1);
      registry.register(capability2);

      expect(registry.list()).toHaveLength(2);

      registry.clear();

      expect(registry.list()).toHaveLength(0);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      const pmCapability = createMockCapability('pm.capability');
      const salesCapability = createMockCapability('sales.capability');

      // Override role for sales capability
      salesCapability.spec.requiredRole = 'sales';

      registry.register(pmCapability);
      registry.register(salesCapability);

      const stats = registry.getStats();

      expect(stats.total).toBe(2);
      expect(stats.byRole.pm).toBe(1);
      expect(stats.byRole.sales).toBe(1);
    });
  });
});
