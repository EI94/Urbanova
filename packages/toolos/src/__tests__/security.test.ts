import { SecurityManager } from '../security';
import { ToolActionSpec, ToolContext } from '@urbanova/types';

describe('SecurityManager', () => {
  let security: SecurityManager;

  beforeEach(() => {
    security = new SecurityManager();
  });

  const mockAction: ToolActionSpec = {
    name: 'test_action',
    description: 'Test action',
    zArgs: require('zod').z.object({}),
    requiredRole: 'pm',
  };

  const mockContext: ToolContext = {
    userId: 'user-123',
    workspaceId: 'workspace-123',
    projectId: 'project-123',
    userRole: 'pm',
    now: new Date(),
    logger: {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    },
    db: null,
  };

  describe('checkRole', () => {
    it('should allow user with higher role', () => {
      const ownerContext = { ...mockContext, userRole: 'owner' };
      const result = security.checkRole(mockAction, ownerContext);
      expect(result).toBe(true);
    });

    it('should allow user with same role', () => {
      const result = security.checkRole(mockAction, mockContext);
      expect(result).toBe(true);
    });

    it('should deny user with lower role', () => {
      const salesContext = { ...mockContext, userRole: 'sales' };
      const result = security.checkRole(mockAction, salesContext);
      expect(result).toBe(false);
    });

    it('should handle admin role correctly', () => {
      const adminContext = { ...mockContext, userRole: 'admin' };
      const result = security.checkRole(mockAction, adminContext);
      expect(result).toBe(true);
    });

    it('should handle vendor role correctly', () => {
      const vendorContext = { ...mockContext, userRole: 'vendor' };
      const result = security.checkRole(mockAction, vendorContext);
      expect(result).toBe(false);
    });

    it('should warn for unknown roles', () => {
      const unknownContext = { ...mockContext, userRole: 'unknown' as any };
      const result = security.checkRole(mockAction, unknownContext);
      expect(result).toBe(false);
      expect(mockContext.logger.warn).toHaveBeenCalled();
    });
  });

  describe('checkProjectAccess', () => {
    it('should allow access when no project specified', () => {
      const noProjectContext = { ...mockContext, projectId: undefined };
      const result = security.checkProjectAccess(noProjectContext);
      expect(result).toBe(true);
    });

    it('should allow access to project (for now)', () => {
      const result = security.checkProjectAccess(mockContext);
      expect(result).toBe(true);
    });

    it('should log project access verification', () => {
      security.checkProjectAccess(mockContext);
      expect(mockContext.logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Accesso al progetto project-123 verificato')
      );
    });
  });

  describe('checkWorkspaceAccess', () => {
    it('should deny access when no workspace specified', () => {
      const noWorkspaceContext = { ...mockContext, workspaceId: undefined };
      const result = security.checkWorkspaceAccess(noWorkspaceContext);
      expect(result).toBe(false);
    });

    it('should allow access to workspace (for now)', () => {
      const result = security.checkWorkspaceAccess(mockContext);
      expect(result).toBe(true);
    });

    it('should log workspace access verification', () => {
      security.checkWorkspaceAccess(mockContext);
      expect(mockContext.logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Accesso al workspace workspace-123 verificato')
      );
    });
  });

  describe('checkPermissions', () => {
    it('should allow when all checks pass', () => {
      const result = security.checkPermissions(mockAction, mockContext);
      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should deny when role check fails', () => {
      const salesContext = { ...mockContext, userRole: 'sales' };
      const result = security.checkPermissions(mockAction, salesContext);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Ruolo insufficiente');
    });

    it('should deny when workspace access fails', () => {
      const noWorkspaceContext = { ...mockContext, workspaceId: undefined };
      const result = security.checkPermissions(mockAction, noWorkspaceContext);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Accesso al workspace negato');
    });

    it('should allow when project access passes', () => {
      const result = security.checkPermissions(mockAction, mockContext);
      expect(result.allowed).toBe(true);
    });
  });

  describe('requiresConfirmation', () => {
    it('should return true when action requires confirmation', () => {
      const confirmAction = { ...mockAction, confirm: true };
      const result = security.requiresConfirmation(confirmAction);
      expect(result).toBe(true);
    });

    it('should return false when action does not require confirmation', () => {
      const noConfirmAction = { ...mockAction, confirm: false };
      const result = security.requiresConfirmation(noConfirmAction);
      expect(result).toBe(false);
    });

    it('should return false when confirm is undefined', () => {
      const result = security.requiresConfirmation(mockAction);
      expect(result).toBe(false);
    });
  });

  describe('isLongRunning', () => {
    it('should return true when action is long running', () => {
      const longRunningAction = { ...mockAction, longRunning: true };
      const result = security.isLongRunning(longRunningAction);
      expect(result).toBe(true);
    });

    it('should return false when action is not long running', () => {
      const shortRunningAction = { ...mockAction, longRunning: false };
      const result = security.isLongRunning(shortRunningAction);
      expect(result).toBe(false);
    });

    it('should return false when longRunning is undefined', () => {
      const result = security.isLongRunning(mockAction);
      expect(result).toBe(false);
    });
  });

  describe('getActionTimeout', () => {
    it('should return custom timeout when specified', () => {
      const timeoutAction = { ...mockAction, timeout: 600 };
      const result = security.getActionTimeout(timeoutAction);
      expect(result).toBe(600);
    });

    it('should return default timeout when not specified', () => {
      const result = security.getActionTimeout(mockAction);
      expect(result).toBe(300); // Default 5 minutes
    });

    it('should handle zero timeout', () => {
      const zeroTimeoutAction = { ...mockAction, timeout: 0 };
      const result = security.getActionTimeout(zeroTimeoutAction);
      expect(result).toBe(0);
    });
  });

  describe('role hierarchy', () => {
    it('should have correct role hierarchy', () => {
      // Test all role combinations
      const testCases = [
        { userRole: 'admin', requiredRole: 'vendor', expected: true },
        { userRole: 'admin', requiredRole: 'sales', expected: true },
        { userRole: 'admin', requiredRole: 'pm', expected: true },
        { userRole: 'admin', requiredRole: 'owner', expected: true },
        { userRole: 'admin', requiredRole: 'admin', expected: true },

        { userRole: 'owner', requiredRole: 'vendor', expected: true },
        { userRole: 'owner', requiredRole: 'sales', expected: true },
        { userRole: 'owner', requiredRole: 'pm', expected: true },
        { userRole: 'owner', requiredRole: 'owner', expected: true },
        { userRole: 'owner', requiredRole: 'admin', expected: false },

        { userRole: 'pm', requiredRole: 'vendor', expected: true },
        { userRole: 'pm', requiredRole: 'sales', expected: true },
        { userRole: 'pm', requiredRole: 'pm', expected: true },
        { userRole: 'pm', requiredRole: 'owner', expected: false },
        { userRole: 'pm', requiredRole: 'admin', expected: false },

        { userRole: 'sales', requiredRole: 'vendor', expected: true },
        { userRole: 'sales', requiredRole: 'sales', expected: true },
        { userRole: 'sales', requiredRole: 'pm', expected: false },
        { userRole: 'sales', requiredRole: 'owner', expected: false },
        { userRole: 'sales', requiredRole: 'admin', expected: false },

        { userRole: 'vendor', requiredRole: 'vendor', expected: true },
        { userRole: 'vendor', requiredRole: 'sales', expected: false },
        { userRole: 'vendor', requiredRole: 'pm', expected: false },
        { userRole: 'vendor', requiredRole: 'owner', expected: false },
        { userRole: 'vendor', requiredRole: 'admin', expected: false },
      ];

      testCases.forEach(({ userRole, requiredRole, expected }) => {
        const testAction = { ...mockAction, requiredRole };
        const testContext = { ...mockContext, userRole };
        const result = security.checkRole(testAction, testContext);
        expect(result).toBe(expected);
      });
    });
  });
});
