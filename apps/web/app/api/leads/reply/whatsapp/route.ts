import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ConversationService } from '@urbanova/leads';
import { MessageService } from '@urbanova/leads';
import { LeadService } from '@urbanova/leads';
import { TwilioService } from '@urbanova/messaging';
import { AuditService } from '@urbanova/compliance';
import { TemplateService } from '@urbanova/leads';

// Schema per la richiesta WhatsApp reply
const WhatsAppReplySchema = z.object({
  convId: z.string(),
  text: z.string().min(1),
  templateId: z.string().optional(),
  variables: z.record(z.string()).optional(),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  scheduledAt: z.string().optional(), // ISO string per messaggi programmati
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Parsing e validazione
    const body = await request.json();
    const validationResult = WhatsAppReplySchema.safeParse(body);

    if (!validationResult.success) {
      console.error('❌ Invalid WhatsApp reply request:', validationResult.error);
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { convId, text, templateId, variables, priority, scheduledAt } = validationResult.data;

    // 2. Verifica conversazione
    const conversationService = new ConversationService();
    const conversation = await conversationService.getConversation(convId);

    if (!conversation) {
      console.error(`❌ Conversation not found: ${convId}`);
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // 3. Verifica lead e telefono
    const leadService = new LeadService();
    const lead = await leadService.getLead(conversation.leadId);

    if (!lead?.phone) {
      console.error(`❌ No phone number for lead: ${conversation.leadId}`);
      return NextResponse.json({ error: 'No phone number available' }, { status: 400 });
    }

    // 4. Gestione template se specificato
    let finalText = text;
    if (templateId) {
      const templateService = new TemplateService();
      const template = await templateService.getTemplate(templateId);

      if (template) {
        finalText = templateService.renderTemplate(template, {
          leadName: lead.name,
          projectId: lead.projectId,
          listingId: lead.listingId,
          ...variables,
        });
      }
    }

    // 5. Invio messaggio WhatsApp tramite Twilio
    const twilioService = new TwilioService();
    const twilioResult = await twilioService.sendWhatsApp({
      to: lead.phone,
      from: process.env.TWILIO_WHATSAPP_NUMBER!,
      body: finalText,
      priority,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
    });

    if (!twilioResult.success) {
      console.error(`❌ Twilio WhatsApp send failed: ${twilioResult.error}`);
      return NextResponse.json({ error: 'Failed to send WhatsApp message' }, { status: 500 });
    }

    // 6. Creazione messaggio nel database
    const messageService = new MessageService();
    const message = await messageService.createMessage({
      convId,
      direction: 'outbound',
      channel: 'whatsapp',
      text: finalText,
      meta: {
        templateId,
        variables,
        priority,
        twilioSid: twilioResult.sid,
        twilioStatus: twilioResult.status,
      },
      sender: {
        name: 'Urbanova',
        phone: process.env.TWILIO_WHATSAPP_NUMBER,
      },
      status: twilioResult.status,
      externalId: twilioResult.sid,
      slaImpact: true,
    });

    // 7. Aggiorna conversazione
    await conversationService.updateConversation(convId, {
      lastMsgAt: new Date(),
      unreadCount: 0,
      slaStatus: 'on_track',
    });

    // 8. Aggiorna lead
    await leadService.updateLead(conversation.leadId, {
      lastContactAt: new Date(),
      status: lead.status === 'new' ? 'contacted' : lead.status,
    });

    // 9. Audit logging
    const auditService = new AuditService();
    await auditService.logEvent({
      eventType: 'message_sent',
      entityType: 'message',
      entityId: message.id,
      userId: request.headers.get('x-user-id') || 'system',
      projectId: conversation.projectId,
      metadata: {
        channel: 'whatsapp',
        templateId,
        twilioSid: twilioResult.sid,
        phoneNumber: lead.phone,
        slaImpact: true,
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    const duration = Date.now() - startTime;
    console.log(`✅ WhatsApp message sent - SID: ${twilioResult.sid}, Duration: ${duration}ms`);

    return NextResponse.json({
      success: true,
      messageId: message.id,
      twilioSid: twilioResult.sid,
      status: twilioResult.status,
      duration,
    });
  } catch (error) {
    console.error('❌ WhatsApp Reply Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Endpoint per webhook Twilio (status updates)
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const twilioSid = formData.get('MessageSid') as string;
    const status = formData.get('MessageStatus') as string;

    if (!twilioSid) {
      return NextResponse.json({ error: 'Missing MessageSid' }, { status: 400 });
    }

    // Aggiorna status del messaggio
    const messageService = new MessageService();
    await messageService.updateMessageStatus(twilioSid, status);

    console.log(`📱 WhatsApp status update - SID: ${twilioSid}, Status: ${status}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ WhatsApp webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
