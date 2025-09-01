import { InteractivePlanner } from '../interactive/planner';
import { SessionManager } from '../interactive/sessions';
import { PlanRenderer } from '../interactive/renderer';
import { InteractivePlannerFacade } from '../interactive/index';
import { urbanovaToolOS } from '@urbanova/toolos';
import { SessionStatus } from '@urbanova/types';

// Mock the toolos
jest.mock('@urbanova/toolos', () => ({
  urbanovaToolOS: {
    registry: {
      getTool: jest.fn(),
      listTools: jest.fn(),
      getToolsByIntent: jest.fn(),
    },
  },
}));

describe('Interactive Planner', () => {
  let planner: InteractivePlanner;
  let sessionManager: SessionManager;
  let renderer: PlanRenderer;
  let facade: InteractivePlannerFacade;
  let mockGetTool: jest.MockedFunction<any>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Set up mock tool registry
    mockGetTool = urbanovaToolOS.registry.getTool as jest.MockedFunction<any>;

    // Mock feasibility tool
    mockGetTool.mockImplementation((toolId: string) => {
      if (toolId === 'feasibility') {
        return {
          manifest: { id: 'feasibility', name: 'Feasibility Tool' },
          actions: [
            {
              name: 'run_sensitivity',
              zArgs: { projectId: 'string', deltas: 'number[]' },
            },
          ],
        };
      }
      return undefined;
    });

    planner = new InteractivePlanner();
    sessionManager = new SessionManager();
    renderer = new PlanRenderer();
    facade = new InteractivePlannerFacade(planner, sessionManager, renderer);
  });

  describe('InteractivePlanner', () => {
    it('should draft a plan for feasibility analysis', async () => {
      const input = {
        text: 'Fai una sensitivity analysis sul Progetto A',
        projectId: 'project-123',
        userId: 'user-123',
        workspaceId: 'workspace-123',
        userRole: 'pm',
      };

      const context = {
        userId: input.userId,
        projectId: input.projectId,
        workspaceId: input.workspaceId,
        userRole: input.userRole,
        availableTools: [],
      };

      const result = await planner.draftPlan(input);

      expect(result.plan).toBeDefined();
      expect(result.plan.title).toBe('Analisi di Fattibilità');
      expect(result.plan.steps).toHaveLength(1);
      expect(result.plan.steps[0]?.toolId).toBe('feasibility');
      expect(result.plan.steps[0]?.action).toBe('run_sensitivity');
      expect(result.session).toBeDefined();
      expect(result.session.projectId).toBe('project-123');
    });

    it('should validate a plan correctly', () => {
      const plan = {
        id: 'plan-123',
        title: 'Test Plan',
        description: 'Test Description',
        steps: [
          {
            id: 'step-1',
            toolId: 'feasibility',
            action: 'run_sensitivity',
            description: 'Run sensitivity analysis',
            zArgs: { projectId: 'project-123', deltas: [0.1, 0.2] },
            requiredRole: 'pm',
            order: 1,
          },
        ],
        requirements: [],
        assumptions: [],
        risks: [],
        estimatedDuration: 30,
        totalCost: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const validation = planner.validatePlan(plan);
      expect(validation.ready).toBe(true);
      expect(validation.missing).toHaveLength(0);
    });

    it('should detect missing requirements in plan', () => {
      const plan = {
        id: 'plan-123',
        title: 'Test Plan',
        description: 'Test Description',
        steps: [
          {
            id: 'step-1',
            toolId: 'feasibility',
            action: 'run_sensitivity',
            description: 'Run sensitivity analysis',
            zArgs: { projectId: 'project-123' }, // Missing deltas
            requiredRole: 'pm',
            order: 1,
          },
        ],
        requirements: [],
        assumptions: [],
        risks: [],
        estimatedDuration: 30,
        totalCost: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const validation = planner.validatePlan(plan);
      expect(validation.ready).toBe(false);
      expect(validation.missing).toHaveLength(1);
      expect(validation.missing[0]?.field).toBe('deltas');
    });
  });

  describe('SessionManager', () => {
    it('should create a new session', async () => {
      const sessionData = {
        projectId: 'project-123',
        userId: 'user-123',
        status: SessionStatus.COLLECTING,
        plan: {
          id: 'plan-123',
          title: 'Test Plan',
          description: 'Test Description',
          steps: [],
          requirements: [],
          assumptions: [],
          risks: [],
          estimatedDuration: 30,
          totalCost: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        replies: [],
        currentStep: 0,
      };

      const session = await sessionManager.createSession(sessionData);
      expect(session.id).toBeDefined();
      expect(session.createdAt).toBeInstanceOf(Date);
      expect(session.updatedAt).toBeInstanceOf(Date);
    });

    it('should get a session by ID', async () => {
      const sessionData = {
        projectId: 'project-123',
        userId: 'user-123',
        status: SessionStatus.COLLECTING,
        plan: {
          id: 'plan-123',
          title: 'Test Plan',
          description: 'Test Description',
          steps: [],
          requirements: [],
          assumptions: [],
          risks: [],
          estimatedDuration: 30,
          totalCost: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        replies: [],
        currentStep: 0,
      };

      const createdSession = await sessionManager.createSession(sessionData);
      const retrievedSession = await sessionManager.getSession(createdSession.id);

      expect(retrievedSession).toBeDefined();
      expect(retrievedSession?.id).toBe(createdSession.id);
    });

    it('should update session status', async () => {
      const sessionData = {
        projectId: 'project-123',
        userId: 'user-123',
        status: SessionStatus.COLLECTING,
        plan: {
          id: 'plan-123',
          title: 'Test Plan',
          description: 'Test Description',
          steps: [],
          requirements: [],
          assumptions: [],
          risks: [],
          estimatedDuration: 30,
          totalCost: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        replies: [],
        currentStep: 0,
      };

      const session = await sessionManager.createSession(sessionData);
      const updatedSession = await sessionManager.updateSessionStatus(session.id, {
        status: SessionStatus.AWAITING_CONFIRM,
      });

      expect(updatedSession).toBeDefined();
      expect(updatedSession?.status).toBe(SessionStatus.AWAITING_CONFIRM);
    });
  });

  describe('PlanRenderer', () => {
    it('should build a plan preview', () => {
      const session = {
        id: 'session-123',
        projectId: 'project-123',
        userId: 'user-123',
        status: SessionStatus.AWAITING_CONFIRM,
        plan: {
          id: 'plan-123',
          title: 'Test Plan',
          description: 'Test Description',
          steps: [
            {
              id: 'step-1',
              toolId: 'feasibility',
              action: 'run_sensitivity',
              description: 'Run sensitivity analysis',
              zArgs: { projectId: 'project-123', deltas: [0.1, 0.2] },
              requiredRole: 'pm',
              order: 1,
            },
          ],
          requirements: [],
          assumptions: [],
          risks: [],
          estimatedDuration: 30,
          totalCost: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        replies: [],
        currentStep: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const preview = renderer.buildPlanPreview(session);
      expect(preview.title).toBe('Test Plan');
      expect(preview.description).toBe('Test Description');
      expect(preview.steps).toHaveLength(1);
      expect(preview.ctas).toContain('confirm');
    });

    it('should generate plan summary', () => {
      const session = {
        id: 'session-123',
        projectId: 'project-123',
        userId: 'user-123',
        status: SessionStatus.AWAITING_CONFIRM,
        plan: {
          id: 'plan-123',
          title: 'Test Plan',
          description: 'Test Description',
          steps: [
            {
              id: 'step-1',
              toolId: 'feasibility',
              action: 'run_sensitivity',
              description: 'Run sensitivity analysis',
              zArgs: { projectId: 'project-123', deltas: [0.1, 0.2] },
              requiredRole: 'pm',
              order: 1,
            },
          ],
          requirements: [],
          assumptions: [],
          risks: [],
          estimatedDuration: 30,
          totalCost: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        replies: [],
        currentStep: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const summary = renderer.generatePlanSummary(session);
      expect(summary).toContain('Test Plan');
      expect(summary).toContain('Run sensitivity analysis');
    });
  });

  describe('InteractivePlannerFacade', () => {
    it('should process a new request', async () => {
      const input = {
        text: 'Fai una sensitivity analysis sul Progetto A',
        projectId: 'project-123',
        userId: 'user-123',
        workspaceId: 'workspace-123',
        userRole: 'pm',
      };

      const result = await facade.processRequest(input);

      expect(result.session).toBeDefined();
      expect(result.preview).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.ctaText).toBeDefined();
    });

    it('should process a user reply', async () => {
      // First create a session
      const input = {
        text: 'Fai una sensitivity analysis sul Progetto A',
        projectId: 'project-123',
        userId: 'user-123',
        workspaceId: 'workspace-123',
        userRole: 'pm',
      };

      const { session } = await facade.processRequest(input);

      // Then process a reply
      const reply = {
        type: 'confirm' as const,
        userId: 'user-123',
        data: {},
      };

      const result = await facade.processReply(session.id, reply);

      expect(result.session).toBeDefined();
      expect(result.preview).toBeDefined();
      expect(result.action).toBeDefined();
    });
  });
});
