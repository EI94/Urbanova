import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ConversationService } from '@urbanova/leads';
import { MessageService } from '@urbanova/leads';
import { LeadService } from '@urbanova/leads';
import { SendGridService } from '@urbanova/messaging';
import { AuditService } from '@urbanova/compliance';
import { TemplateService } from '@urbanova/leads';

// Schema per la richiesta email reply
const EmailReplySchema = z.object({
  convId: z.string(),
  subject: z.string().optional(),
  text: z.string().optional(),
  html: z.string().optional(),
  templateId: z.string().optional(),
  variables: z.record(z.string()).optional(),
  attachments: z
    .array(
      z.object({
        filename: z.string(),
        content: z.string(), // base64
        contentType: z.string(),
      })
    )
    .optional(),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  scheduledAt: z.string().optional(), // ISO string per email programmate
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Parsing e validazione
    const body = await request.json();
    const validationResult = EmailReplySchema.safeParse(body);

    if (!validationResult.success) {
      console.error('❌ Invalid email reply request:', validationResult.error);
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const {
      convId,
      subject,
      text,
      html,
      templateId,
      variables,
      attachments,
      priority,
      scheduledAt,
    } = validationResult.data;

    // 2. Verifica conversazione
    const conversationService = new ConversationService();
    const conversation = await conversationService.getConversation(convId);

    if (!conversation) {
      console.error(`❌ Conversation not found: ${convId}`);
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // 3. Verifica lead e email
    const leadService = new LeadService();
    const lead = await leadService.getLead(conversation.leadId);

    if (!lead?.email) {
      console.error(`❌ No email for lead: ${conversation.leadId}`);
      return NextResponse.json({ error: 'No email available' }, { status: 400 });
    }

    // 4. Gestione template se specificato
    let finalSubject = subject || `Re: ${lead.subject || 'Richiesta informazioni'}`;
    let finalText = text || '';
    let finalHtml = html || '';

    if (templateId) {
      const templateService = new TemplateService();
      const template = await templateService.getTemplate(templateId);

      if (template) {
        const renderedTemplate = templateService.renderTemplate(template, {
          leadName: lead.name,
          projectId: lead.projectId,
          listingId: lead.listingId,
          ...variables,
        });

        finalSubject = renderedTemplate.subject || finalSubject;
        finalText = renderedTemplate.bodyText || finalText;
        finalHtml = renderedTemplate.bodyHtml || finalHtml;
      }
    }

    // 5. Invio email tramite SendGrid
    const sendGridService = new SendGridService();
    const sendGridResult = await sendGridService.sendEmail({
      to: lead.email,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject: finalSubject,
      text: finalText,
      html: finalHtml,
      attachments: attachments?.map(att => ({
        filename: att.filename,
        content: Buffer.from(att.content, 'base64'),
        contentType: att.contentType,
      })),
      priority,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
    });

    if (!sendGridResult.success) {
      console.error(`❌ SendGrid email send failed: ${sendGridResult.error}`);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    // 6. Creazione messaggio nel database
    const messageService = new MessageService();
    const message = await messageService.createMessage({
      convId,
      direction: 'outbound',
      channel: 'email',
      text: finalText,
      html: finalHtml,
      attachments:
        attachments?.map(att => ({
          url: '', // Non salviamo allegati nel DB, solo metadata
          filename: att.filename,
          contentType: att.contentType,
        })) || [],
      meta: {
        templateId,
        variables,
        priority,
        sendGridId: sendGridResult.id,
        sendGridStatus: sendGridResult.status,
        subject: finalSubject,
      },
      sender: {
        name: 'Urbanova',
        email: process.env.SENDGRID_FROM_EMAIL,
      },
      status: sendGridResult.status,
      externalId: sendGridResult.id,
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
        channel: 'email',
        templateId,
        sendGridId: sendGridResult.id,
        emailAddress: lead.email,
        slaImpact: true,
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    const duration = Date.now() - startTime;
    console.log(`✅ Email sent - SendGrid ID: ${sendGridResult.id}, Duration: ${duration}ms`);

    return NextResponse.json({
      success: true,
      messageId: message.id,
      sendGridId: sendGridResult.id,
      status: sendGridResult.status,
      duration,
    });
  } catch (error) {
    console.error('❌ Email Reply Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Endpoint per webhook SendGrid (delivery status)
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const sendGridId = formData.get('sg_message_id') as string;
    const status = formData.get('event') as string;

    if (!sendGridId) {
      return NextResponse.json({ error: 'Missing sg_message_id' }, { status: 400 });
    }

    // Aggiorna status del messaggio
    const messageService = new MessageService();
    await messageService.updateMessageStatus(sendGridId, status);

    console.log(`📧 Email status update - SendGrid ID: ${sendGridId}, Status: ${status}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Email webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
