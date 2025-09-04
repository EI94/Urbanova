// WhatsApp Inbound Webhook API Route

import { NextRequest, NextResponse } from 'next/server';
import { InteractivePlannerController, PlannerContext, PlannerRequest } from '@urbanova/os';

// Mock controller for demonstration - in production this would be injected
const mockController = {
  handleNewRequest: async (request: PlannerRequest) => ({
    session: {
      id: 'wa-session-123',
      projectId: 'project-123',
      userId: 'wa-user-123',
      status: 'awaiting_confirm',
      plan: {
        id: 'plan-123',
        title: 'Analisi di Fattibilità',
        description: "Esegue un'analisi completa di fattibilità del progetto",
        steps: [],
        requirements: [],
        assumptions: [],
        risks: [],
        estimatedDuration: 300,
        totalCost: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      replies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    plan: null,
    preview: null,
    summary: 'Piano creato per analisi di fattibilità',
    action: 'draft',
    message: 'Ho preparato un piano per te. Controlla i dettagli e conferma per procedere.',
  }),
  handleReply: async (reply: any) => ({
    session: {
      id: 'wa-session-123',
      projectId: 'project-123',
      userId: 'wa-user-123',
      status: 'running',
      plan: null,
      replies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    plan: null,
    preview: null,
    summary: 'Piano confermato',
    action: 'run',
    message: "Piano confermato! L'esecuzione è iniziata.",
  }),
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      From,
      Body,
      MessageSid,
      NumMedia,
      MediaUrl0,
      ProjectId, // Custom header for project context
    } = body;

    // Extract WhatsApp sender ID
    const waSenderId = From?.replace('whatsapp:', '') || 'unknown';

    // Create planner context
    const context: PlannerContext = {
      userId: `wa-${waSenderId}`,
      workspaceId: 'default', // In production, resolve from user mapping
      userRole: 'user', // In production, resolve from user permissions
      projectId: ProjectId,
      channel: 'whatsapp',
      channelId: waSenderId,
    };

    // Check if message is a plan request
    const isPlanRequest = (text: string): boolean => {
      const planKeywords = [
        'fattibilità',
        'feasibility',
        'proforma',
        'business plan',
        'sensitivity',
        'scenario',
        'analisi',
        'piano',
        'roi',
        'npv',
        'irr',
        'payback',
        'rendimento',
        'investimento',
        'costruzione',
        'edificio',
        'terreno',
      ];

      const lowerText = text.toLowerCase();
      return planKeywords.some(keyword => lowerText.includes(keyword));
    };

    // Get active session ID
    const getActiveSessionId = (waSenderId: string): string | null => {
      // In production, query database for active sessions
      // For now, return a deterministic session ID
      return `wa-session-${waSenderId}`;
    };

    // Format WhatsApp response
    const formatWhatsAppResponse = (response: any): any => {
      return {
        messaging_product: 'whatsapp',
        to: response.to,
        type: response.type,
        ...response,
      };
    };

    // Check if this is a plan-related request
    const text = Body?.trim() || '';

    if (isPlanRequest(text)) {
      // Handle as new plan request
      const planRequest: PlannerRequest = {
        text,
        context,
      };

      const response = await mockController.handleNewRequest(planRequest);

      // Format response for WhatsApp
      const waResponse = formatWhatsAppResponse(response);

      return NextResponse.json({
        success: true,
        response: waResponse,
        sessionId: response.session.id,
      });
    }

    // Check if this is a reply to existing session
    const sessionId = getActiveSessionId(waSenderId);
    if (sessionId) {
      const reply = {
        sessionId,
        text,
        context,
      };

      const response = await mockController.handleReply(reply);

      // Format response for WhatsApp
      const waResponse = formatWhatsAppResponse(response);

      return NextResponse.json({
        success: true,
        response: waResponse,
        sessionId: response.session.id,
      });
    }

    // Fallback to regular chat
    const fallbackResponse = {
      message: "Ciao! Sono l'assistente Urbanova. Come posso aiutarti oggi?",
      options: [
        '📊 Analisi di fattibilità',
        '🗺️ Scansione terreni',
        '📈 Market intelligence',
        '🏗️ Design center',
      ],
    };

    return NextResponse.json({
      success: true,
      response: fallbackResponse,
    });
  } catch (error) {
    console.error('❌ [WA Inbound] Errore:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}

/**
 * Handle WhatsApp button responses
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { From, ButtonText, ButtonPayload, MessageSid } = body;

    const waSenderId = From?.replace('whatsapp:', '') || 'unknown';

    // Create planner context
    const context: PlannerContext = {
      userId: `wa-${waSenderId}`,
      workspaceId: 'default',
      userRole: 'user',
      projectId: undefined as any,
      channel: 'whatsapp',
      channelId: waSenderId,
    };

    // Map button responses to planner actions
    let text = '';
    switch (ButtonPayload) {
      case 'ok':
        text = 'ok';
        break;
      case 'edit':
        text = 'modifica';
        break;
      case 'dryrun':
        text = 'dryrun';
        break;
      case 'cancel':
        text = 'annulla';
        break;
      case 'status':
        text = 'stato';
        break;
      case 'new':
        text = 'nuovo piano';
        break;
      case 'help':
        text = 'aiuto';
        break;
      default:
        text = ButtonPayload || ButtonText || '';
    }

    // Get active session
    const getActiveSessionId = (senderId: string) => `session-${senderId}-${Date.now()}`;
    const formatWhatsAppResponse = (response: any) => ({
      to: waSenderId,
      type: 'text',
      text: response.message || 'Risposta ricevuta',
    });
    
    const sessionId = getActiveSessionId(waSenderId);
    if (sessionId) {
      const reply = {
        sessionId,
        text,
        context,
      };

      const response = await mockController.handleReply(reply);
      const waResponse = formatWhatsAppResponse(response);

      return NextResponse.json({
        success: true,
        response: waResponse,
        sessionId: response.session.id,
      });
    }

    // Handle new request
    const planRequest: PlannerRequest = {
      text,
      context,
    };

    const response = await mockController.handleNewRequest(planRequest);
    const waResponse = formatWhatsAppResponse(response);

    return NextResponse.json({
      success: true,
      response: waResponse,
      sessionId: response.session.id,
    });
  } catch (error) {
    console.error('WhatsApp button response error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'WhatsApp inbound webhook endpoint',
    status: 'active',
  });
}
