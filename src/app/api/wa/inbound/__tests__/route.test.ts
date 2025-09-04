// Tests for WhatsApp Inbound API Route

// Mock Next.js modules
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    constructor(
      public url: string,
      public init: { method: string; body?: string }
    ) {}

    async json() {
      return JSON.parse(this.init.body || '{}');
    }
  },
  NextResponse: {
    json: jest.fn((data, options) => ({
      status: options?.status || 200,
      json: async () => data,
    })),
  },
}));

// Mock the ChatOps agent
jest.mock('@urbanova/agents', () => ({
  chatOpsAgent: {
    handleInboundMessage: jest.fn(),
  },
}));

// Mock chatOpsAgent
const chatOpsAgent = {
  handleInboundMessage: jest.fn(),
};

import { POST, GET } from '../route';

const mockChatOpsAgent = chatOpsAgent as jest.Mocked<typeof chatOpsAgent>;

describe('WhatsApp Inbound API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('should process valid WhatsApp webhook payload', async () => {
      const mockResponse = {
        id: 'response-123',
        commandId: 'msg-123',
        message: 'Ecco lo stato dei tuoi progetti:',
        type: 'TEXT' as const,
        actions: [
          {
            type: 'BUTTON' as const,
            label: 'Visualizza Progetti',
            value: 'view_projects',
            primary: true,
          },
        ],
        metadata: {
          processingTime: 150,
          confidence: 0.8,
          nextSteps: ['Seleziona un progetto per i dettagli'],
        },
        timestamp: new Date(),
      };

      mockChatOpsAgent.handleInboundMessage.mockResolvedValue(mockResponse);

      const request = new (require('next/server').NextRequest)(
        'http://localhost:3000/api/wa/inbound',
        {
          method: 'POST',
          body: JSON.stringify({
            Body: 'Mostra i miei progetti',
            From: '+393331234567',
            MessageSid: 'msg-123',
            AccountSid: 'acc-123',
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.message).toBe('Command processed successfully');
      expect(data.data.response).toBe(
        'Ecco lo stato dei tuoi progetti:\n\n• Progetto A: In corso (75%)\n• Progetto B: Pianificazione\n• Progetto C: Completato'
      );
      expect(data.data.actions).toBeDefined();
      expect(data.data.nextSteps).toBeDefined();
      expect(mockChatOpsAgent.handleInboundMessage).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for invalid webhook payload', async () => {
      const request = new (require('next/server').NextRequest)(
        'http://localhost:3000/api/wa/inbound',
        {
          method: 'POST',
          body: JSON.stringify({
            // Missing required fields
            Body: '',
            From: '',
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Validation error');
      expect(data.details).toBeDefined();
      expect(mockChatOpsAgent.handleInboundMessage).not.toHaveBeenCalled();
    });

    it('should handle ChatOps agent errors gracefully', async () => {
      mockChatOpsAgent.handleInboundMessage.mockRejectedValue(new Error('Agent processing failed'));

      const request = new (require('next/server').NextRequest)(
        'http://localhost:3000/api/wa/inbound',
        {
          method: 'POST',
          body: JSON.stringify({
            Body: 'Test message',
            From: '+393331234567',
            MessageSid: 'msg-123',
            AccountSid: 'acc-123',
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');
      expect(data.message).toBe('Agent processing failed');
    });
  });

  describe('GET', () => {
    it('should return endpoint information', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('WhatsApp Inbound Webhook endpoint');
      expect(data.status).toBe('active');
      expect(data.timestamp).toBeDefined();
    });
  });
});
