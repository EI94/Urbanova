import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// Mock services for now - these will be implemented properly later
class LeadService {
  async createLead(data: any): Promise<any> {
    return {
      id: `lead_${Date.now()}`,
      source: data.source,
      status: 'new',
      createdAt: new Date(),
      updatedAt: new Date(),
      priority: 'medium',
      slaStatus: 'on_track',
      tags: [],
      ...data
    };
  }
}

class ConversationService {
  async createConversation(data: any): Promise<any> {
    return {
      id: `conv_${Date.now()}`,
      leadId: data.leadId,
      channel: data.channel || 'email',
      lastMsgAt: new Date(),
      unreadCount: 0,
      status: 'active',
      slaStatus: 'on_track',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data
    };
  }

  async updateSLAStatus(conversationId: string, status: string): Promise<void> {
    console.log(`Updating SLA status for conversation ${conversationId}: ${status}`);
  }
}

class MessageService {
  async addMessage(data: any): Promise<any> {
    return {
      id: `msg_${Date.now()}`,
      conversationId: data.conversationId,
      content: data.content,
      direction: data.direction || 'inbound',
      status: 'sent',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data
    };
  }

  async createMessage(data: any): Promise<any> {
    return this.addMessage(data);
  }
}

class ProjectService {
  async findProjectByListingId(listingId: string): Promise<string | null> {
    console.log(`Finding project by listing ID: ${listingId}`);
    return null;
  }

  async findProjectByCode(code: string): Promise<string | null> {
    console.log(`Finding project by code: ${code}`);
    return null;
  }
}

class GCSService {
  async uploadBuffer(bucket: string, filename: string, buffer: Buffer, metadata?: any): Promise<string> {
    console.log(`Mock GCS upload: ${bucket}/${filename}`);
    return `gs://${bucket}/${filename}`;
  }
}

class AuditService {
  async logEvent(event: any): Promise<void> {
    console.log('Mock audit log:', event);
  }
}

// Schema per il payload SendGrid Inbound Parse
const SendGridInboundSchema = z.object({
  to: z.string().email(),
  from: z.string().email(),
  subject: z.string().optional(),
  text: z.string().optional(),
  html: z.string().optional(),
  attachments: z.number().default(0),
  headers: z.string().optional(),
  dkim: z.string().optional(),
  'x-sg-eid': z.string().optional(),
  'x-sg-msg-id': z.string().optional(),
  'attachment-info': z.string().optional(),
  'attachment-1': z.string().optional(),
  'attachment-2': z.string().optional(),
  'attachment-3': z.string().optional(),
  'attachment-4': z.string().optional(),
  'attachment-5': z.string().optional(),
});

// Configurazione sicurezza
const INBOUND_SECRET = process.env.SENDGRID_INBOUND_SECRET;
const ALLOWED_IPS = process.env.LEADS_INBOUND_ALLOWED_IPS?.split(',') || [];
const INBOUND_EMAIL_DOMAIN = process.env.LEADS_INBOUND_EMAIL_DOMAIN || 'inbound.urbanova.milano';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Verifica sicurezza
    const securityCheck = await verifySecurity(request);
    if (!securityCheck.success) {
      console.error('❌ Security check failed:', securityCheck.error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parsing del payload
    const formData = await request.formData();
    const payload = Object.fromEntries(formData.entries());

    const validationResult = SendGridInboundSchema.safeParse(payload);
    if (!validationResult.success) {
      console.error('❌ Invalid payload:', validationResult.error);
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const sendGridData = validationResult.data;
    console.log(
      `📧 SendGrid Inbound Parse - From: ${sendGridData.from}, Subject: ${sendGridData.subject}`
    );

    // 3. Parsing MIME robusto
    const parsedLead = await parseMIMEPayload(sendGridData);
    if (!parsedLead) {
      console.error('❌ Failed to parse MIME payload');
      return NextResponse.json({ error: 'Failed to parse email' }, { status: 400 });
    }

    // 4. Gestione allegati su GCS
    const attachments = await processAttachments(sendGridData, parsedLead.leadId);

    // 5. Matching progetto
    const projectId = await matchProject(parsedLead);

    // 6. Creazione lead
    const leadService = new LeadService();
    const lead = await leadService.createLead({
      projectId,
      source: parsedLead.source,
      listingId: parsedLead.listingId,
      portalLeadId: parsedLead.portalLeadId,
      subject: parsedLead.subject,
      name: parsedLead.name,
      email: parsedLead.email,
      phone: parsedLead.phone,
      message: parsedLead.message,
      rawData: sendGridData,
      metadata: {
        ipAddress: securityCheck.ipAddress,
        userAgent: securityCheck.userAgent,
        portalUrl: parsedLead.portalUrl,
        extractedData: parsedLead,
        attachments: attachments.map(a => ({
          url: a.url,
          filename: a.filename,
          contentType: a.contentType,
        })),
      },
    });

    // 7. Creazione conversazione
    const conversationService = new ConversationService();
    const conversation = await conversationService.createConversation({
      leadId: lead.id,
      projectId,
      channel: getChannelFromSource(parsedLead.source),
      slaDeadline: calculateSLADeadline(new Date()),
    });

    // 8. Creazione messaggio inbound
    const messageService = new MessageService();
    const message = await messageService.createMessage({
      convId: conversation.id,
      direction: 'inbound',
      channel: conversation.channel,
      text: parsedLead.message || 'Richiesta informazioni',
      html: parsedLead.html,
      attachments,
      meta: {
        source: parsedLead.source,
        portalLeadId: parsedLead.portalLeadId,
        listingId: parsedLead.listingId,
        sendGridId: sendGridData['x-sg-msg-id'],
      },
      sender: {
        name: parsedLead.name,
        email: parsedLead.email,
        phone: parsedLead.phone,
      },
      externalId: parsedLead.portalLeadId,
      slaImpact: true,
    });

    // 9. Audit logging
    const auditService = new AuditService();
    await auditService.logEvent({
      eventType: 'lead_created',
      entityType: 'lead',
      entityId: lead.id,
      userId: 'system',
      projectId,
      metadata: {
        source: parsedLead.source,
        piiFields: ['name', 'email', 'phone'].filter(field => parsedLead[field]),
        consentStatus: 'explicit',
        retentionPeriod: 730,
      },
      ipAddress: securityCheck.ipAddress,
      userAgent: securityCheck.userAgent,
    });

    // 10. Aggiorna SLA tracker
    await conversationService.updateSLAStatus(conversation.id, 'on_track');

    const duration = Date.now() - startTime;
    console.log(`✅ Lead created successfully - ID: ${lead.id}, Duration: ${duration}ms`);

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      conversationId: conversation.id,
      messageId: message.id,
      duration,
    });
  } catch (error) {
    console.error('❌ SendGrid Inbound Parse Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function verifySecurity(request: NextRequest) {
  // Verifica IP allowlist
  const clientIP =
    request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  if (ALLOWED_IPS.length > 0 && !ALLOWED_IPS.includes(clientIP)) {
    return { success: false, error: 'IP not allowed', ipAddress: clientIP };
  }

  // Verifica secret nel path (opzionale)
  const url = new URL(request.url);
  const pathSecret = url.pathname.split('/').pop();
  if (INBOUND_SECRET && pathSecret !== INBOUND_SECRET) {
    return { success: false, error: 'Invalid secret', ipAddress: clientIP };
  }

  return {
    success: true,
    ipAddress: clientIP,
    userAgent: request.headers.get('user-agent') || 'unknown',
  };
}

async function parseMIMEPayload(sendGridData: any) {
  const text = sendGridData.text || '';
  const html = sendGridData.html || '';
  const subject = sendGridData.subject || '';
  const from = sendGridData.from || '';

  // Estrazione dati con regex avanzate
  const nameMatch =
    text.match(/(?:Cordiali saluti,|Saluti,|Gentile agente,)\s*([^\n\r]+)/i) ||
    html.match(/(?:Cordiali saluti,|Saluti,|Gentile agente,)\s*([^<]+)/i);

  const emailMatch =
    text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/) ||
    html.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);

  const phoneMatch = text.match(/(\+39\s*\d{10,11})/) || html.match(/(\+39\s*\d{10,11})/);

  const listingMatch =
    text.match(/Rif\.\s*annuncio:\s*([^\n\r]+)/i) ||
    subject.match(/Rif\.\s*annuncio:\s*([^\n\r]+)/i) ||
    text.match(/ID\s*annuncio:\s*([^\n\r]+)/i) ||
    subject.match(/ID\s*annuncio:\s*([^\n\r]+)/i);

  const name = nameMatch ? nameMatch[1].trim() : undefined;
  const email = emailMatch ? emailMatch[1] : undefined;
  const phone = phoneMatch ? phoneMatch[1].replace(/\s/g, '') : undefined;
  const listingId = listingMatch ? listingMatch[1].trim() : undefined;

  // Estrai messaggio (prima di "Cordiali saluti")
  const messageMatch = text.match(/(.*?)(?:Cordiali saluti|Saluti,|Gentile agente,)/is);
  const message = messageMatch ? messageMatch[1].trim() : text;

  // Determina source dal dominio mittente
  const source = determineSource(from);

  // Genera portalLeadId unico
  const portalLeadId = `${source}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return {
    name,
    email,
    phone,
    listingId,
    message,
    subject,
    source,
    portalLeadId,
    portalUrl: getPortalUrl(source),
    html: html || undefined,
  };
}

function determineSource(from: string): string {
  const domain = from.toLowerCase();

  if (domain.includes('immobiliare.it')) return 'immobiliare';
  if (domain.includes('idealista.it')) return 'idealista';
  if (domain.includes('casa.it')) return 'casa';
  if (domain.includes('subito.it')) return 'subito';
  if (domain.includes('casa24.it')) return 'casa24';
  if (domain.includes('bakeca.it')) return 'bakeca';

  return 'email';
}

function getPortalUrl(source: string): string {
  const urls = {
    immobiliare: 'https://www.immobiliare.it',
    idealista: 'https://www.idealista.it',
    casa: 'https://www.casa.it',
    subito: 'https://www.subito.it',
    casa24: 'https://www.casa24.it',
    bakeca: 'https://www.bakeca.it',
  };

  return urls[source as keyof typeof urls] || 'https://urbanova.com';
}

async function processAttachments(sendGridData: any, leadId: string) {
  const attachments = [];
  const gcsService = new GCSService();

  for (let i = 1; i <= 5; i++) {
    const attachmentKey = `attachment-${i}`;
    const attachmentInfoKey = 'attachment-info';

    if (sendGridData[attachmentKey]) {
      try {
        const attachmentData = sendGridData[attachmentKey];
        const attachmentInfo = sendGridData[attachmentInfoKey]
          ? JSON.parse(sendGridData[attachmentInfoKey])
          : {};

        const filename = attachmentInfo[attachmentKey]?.name || `attachment_${i}.bin`;
        const contentType = attachmentInfo[attachmentKey]?.type || 'application/octet-stream';

        // Upload su GCS
        const gcsPath = `leads/${leadId}/attachments/${filename}`;
        const gcsUrl = await gcsService.uploadBuffer(
          Buffer.from(attachmentData, 'base64'),
          gcsPath,
          contentType
        );

        attachments.push({
          url: gcsUrl,
          filename,
          contentType,
          size: attachmentData.length,
        });

        console.log(`📎 Attachment uploaded: ${filename} -> ${gcsUrl}`);
      } catch (error) {
        console.error(`❌ Failed to process attachment ${i}:`, error);
      }
    }
  }

  return attachments;
}

async function matchProject(parsedLead: any) {
  const projectService = new ProjectService();

  // 1. Prova matching per listingId
  if (parsedLead.listingId) {
    const projectByListing = await projectService.findProjectByListingId(parsedLead.listingId);
    if (projectByListing) {
      return projectByListing.id;
    }
  }

  // 2. Prova matching per pattern nel subject
  if (parsedLead.subject) {
    const projectMatch = parsedLead.subject.match(/progetto[:\s]+([a-zA-Z0-9_-]+)/i);
    if (projectMatch) {
      const projectCode = projectMatch[1];
      const projectByCode = await projectService.findProjectByCode(projectCode);
      if (projectByCode) {
        return projectByCode.id;
      }
    }
  }

  // 3. Fallback: progetto default per la zona
  const defaultProject = await projectService.getDefaultProject(parsedLead.source);
  return defaultProject?.id || 'default_project';
}

function getChannelFromSource(source: string): string {
  switch (source) {
    case 'immobiliare':
      return 'portal:immobiliare';
    case 'idealista':
      return 'portal:idealista';
    case 'casa':
      return 'portal:casa';
    case 'subito':
      return 'portal:subito';
    case 'casa24':
      return 'portal:casa24';
    case 'bakeca':
      return 'portal:bakeca';
    case 'email':
      return 'email';
    case 'whatsapp':
      return 'whatsapp';
    default:
      return 'portal:generic';
  }
}

function calculateSLADeadline(createdAt: Date): Date {
  const deadline = new Date(createdAt);
  deadline.setMinutes(deadline.getMinutes() + 15); // 15 minuti SLA
  return deadline;
}
