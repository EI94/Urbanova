// ChatOps Agent - Handles chat operations and routing

// Chat types - defined locally until available in @urbanova/types
export interface ChatCommand {
  id: string;
  message: string;
  userId?: string;
  source?: string;
  timestamp?: Date;
}

export interface ChatResponse {
  id: string;
  commandId: string;
  message: string;
  type: string;
  timestamp: Date;
  metadata?: any;
  actions?: any[];
  messageId?: string;
  text?: string;
}

export interface ChatAction {
  type: string;
  payload?: any;
}

export interface ChatMessage {
  id: string;
  text: string;
  timestamp: Date;
  metadata?: any;
  userId?: string;
  workspaceId?: string;
  userRole?: string;
  projectId?: string;
  threadId?: string;
}
import { land } from './scrapers';
// Data functions - commented out until available in @urbanova/data
// import {
//   createProjectFromDeal,
//   createDealFromScraped,
//   createFeasibilityFromAnalysis,
//   persistProject,
//   persistDeal,
//   persistFeasibility,
// } from '@urbanova/data';
import { generateDealMemo, createProjectDeepLink, formatFinancialMetrics } from '@urbanova/pdf';
import { logInfo, createWhatsAppContext } from '@urbanova/infra';

// Import Urbanova OS
import { urbanovaOS } from '@urbanova/os';

// Import Interactive Planner
import {
  InteractivePlannerFacade,
  InteractivePlannerController,
  PlannerContext,
  PlannerRequest,
  PlannerReply,
} from '@urbanova/os';

// TODO: Import Urbanova Tool OS when package is available
// import { urbanovaToolOS } from '@urbanova/toolos';

export interface ChatOpsAgent {
  handleInboundMessage(command: ChatCommand): Promise<ChatResponse>;
}

export class ChatOpsAgentImpl implements ChatOpsAgent {
  private interactivePlanner: InteractivePlannerFacade;
  private plannerController: InteractivePlannerController;
  private activeSessions: Map<string, any> = new Map();

  constructor() {
    // Initialize Interactive Planner
    // TODO: Get these from proper dependency injection
    const {
      InteractivePlanner,
      SessionManager,
      PlanRenderer,
    } = require('@urbanova/os/interactive');
    const toolRegistry = {}; // TODO: Get from Urbanova Tool OS

    const planner = new InteractivePlanner(toolRegistry);
    const sessionManager = new SessionManager();
    const renderer = new PlanRenderer();

    this.interactivePlanner = new InteractivePlannerFacade(planner, sessionManager, renderer);
    this.plannerController = new InteractivePlannerController(this.interactivePlanner);
  }

  async handleInboundMessage(command: ChatCommand): Promise<ChatResponse> {
    const startTime = Date.now();

    try {
      // Validate the incoming command
      if (!this.validateCommand(command)) {
        const processingTime = Date.now() - startTime;
        return {
          id: `response-${Date.now()}`,
          commandId: command.id,
          message: 'Comando non valido. Usa "aiuto" per vedere i comandi disponibili.',
          type: 'TEXT',
          timestamp: new Date(),
          metadata: {
            processingTime,
            confidence: 0,
            nextSteps: ['Verifica il formato del comando'],
          },
        };
      }

      // DELEGA A URBANOVA OS per classificazione e routing
      try {
        const osRequest: any = {
          text: command.message,
          userId: command.userId || 'unknown',
          source: command.source || 'unknown',
        };

        const projectId = this.extractProjectId(command.message);
        if (projectId) {
          osRequest.projectId = projectId;
        }

        const result = await urbanovaOS.execute(osRequest);

        // Se Urbanova OS ha gestito la richiesta
        if (result && result.result && result.result.success !== undefined) {
          const processingTime = Date.now() - startTime;
          return {
            id: `response-${Date.now()}`,
            commandId: command.id,
            message: this.formatOSResponse(result),
            type: 'TEXT',
            timestamp: new Date(),
            metadata: {
              processingTime,
              confidence: result.plan?.confidence || 0.8,
              nextSteps: this.extractNextSteps(result),
            },
          };
        }
      } catch (osError) {
        console.log(
          '[ChatOps] Urbanova OS non ha gestito la richiesta, fallback a logica esistente:',
          osError
        );
        // Fallback alla logica esistente
      }

      // Parse intent and deal input (logica esistente come fallback)
      const intent = this.routeIntent(command.message);
      const dealInput = this.parseDealInput(command.message);

      // Handle DEAL_NEW intent
      if (intent === 'DEAL_NEW' && dealInput) {
        return await this.handleDealNew(command, dealInput);
      }

      // Handle DOC_HUNTER intent
      if (intent === 'DOC_HUNTER') {
        return await this.handleDocHunter(command);
      }

      // Generate response based on intent
      const response = await this.generateResponse(command, intent);

      // Update processing time to include total time
      response.metadata.processingTime = Date.now() - startTime;

      return response;
    } catch (error) {
      console.error('Error handling inbound message:', error);

      const processingTime = Date.now() - startTime;
      return {
        id: `response-${Date.now()}`,
        commandId: command.id,
        message: "Si è verificato un errore durante l'elaborazione. Riprova più tardi.",
        type: 'TEXT',
        timestamp: new Date(),
        metadata: {
          processingTime,
          confidence: 0,
          nextSteps: ['Riprova più tardi'],
        },
      };
    }
  }

  /**
   * Estrae l'ID progetto dal messaggio per il contesto OS
   */
  private extractProjectId(message: string): string | undefined {
    const projectMatch = message.match(/progetto\s+([A-Za-z0-9]+)/i);
    if (projectMatch) {
      return projectMatch[1];
    }
    return undefined;
  }

  /**
   * Formatta la risposta di Urbanova OS
   */
  private formatOSResponse(result: any): string {
    // Gestisci risposte di capability specifiche
    if (result.result && result.result.capability) {
      const capability = result.result.capability;
      const data = result.result.data;

      switch (capability) {
        case 'project.get_summary':
          if (data) {
            const { roi, marginPct, paybackYears, docs, milestones } = data;
            const nextMilestone = milestones && milestones.length > 0 ? milestones[0] : null;

            let response = `📊 **Riepilogo Progetto**\n\n`;
            response += `💰 **KPI Finanziari:**\n`;
            response += `• ROI: ${roi}%\n`;
            response += `• Margine: ${marginPct}%\n`;
            response += `• Payback: ${paybackYears.toFixed(1)} anni\n\n`;

            response += `📋 **Documenti:** ${docs.complete}/${docs.total} completati\n`;
            if (docs.missing && docs.missing.length > 0) {
              response += `• Mancanti: ${docs.missing.slice(0, 3).join(', ')}${docs.missing.length > 3 ? '...' : ''}\n`;
            }

            if (nextMilestone) {
              response += `\n⏰ **Prossima Milestone:** ${nextMilestone.title} (${nextMilestone.status === 'overdue' ? '⚠️ SCADUTA' : '📅 In arrivo'})`;
            }

            return response;
          }
          break;

        case 'feasibility.run_sensitivity':
          if (data) {
            const { baseRoi, range, pdfUrl } = data;
            let response = `📈 **Analisi Sensibilità Completata**\n\n`;
            response += `• ROI Base: ${baseRoi}%\n`;
            response += `• Range Scenari: ${range.min.toFixed(1)}% - ${range.max.toFixed(1)}%\n`;
            response += `• PDF: ${pdfUrl}\n\n`;
            response += `📊 I risultati mostrano la variabilità del ROI considerando variazioni nei costi e prezzi.`;
            return response;
          }
          break;

        case 'echo.say':
          if (data && data.text) {
            return `🔊 Echo: ${data.text}`;
          }
          break;
      }
    }

    // Fallback per altre risposte
    if (result.result && result.result.data && result.result.data.message) {
      return result.result.data.message;
    }

    if (result.result && result.result.data && typeof result.result.data === 'string') {
      return result.result.data;
    }

    if (result.result && result.result.success) {
      return `✅ Operazione completata con successo. ${result.result.data ? JSON.stringify(result.result.data) : ''}`;
    }

    if (result.result && result.result.error) {
      return `❌ Errore: ${result.result.error}`;
    }

    return `ℹ️ Risposta ricevuta da Urbanova OS`;
  }

  /**
   * Estrae i passaggi successivi dalla risposta di Urbanova OS
   */
  private extractNextSteps(result: any): string[] {
    if (result.plan && result.plan.nextSteps) {
      return result.plan.nextSteps;
    }
    return [];
  }

  public validateCommand(command: ChatCommand): boolean {
    return !!(command.message && command.message.trim().length > 0);
  }

  public routeIntent(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes('progetto') ||
      lowerMessage.includes('project') ||
      lowerMessage.includes('progetti')
    ) {
      return 'PROJECT_STATUS';
    }

    if (
      lowerMessage.includes('terreno') ||
      lowerMessage.includes('land') ||
      lowerMessage.includes('terreni')
    ) {
      return 'LAND_SEARCH';
    }

    if (
      lowerMessage.includes('fattibilità') ||
      lowerMessage.includes('feasibility') ||
      lowerMessage.includes('analisi')
    ) {
      return 'FEASIBILITY_ANALYSIS';
    }

    if (
      lowerMessage.includes('deals') ||
      lowerMessage.includes('affari') ||
      lowerMessage.includes('deal')
    ) {
      return 'DEAL_STATUS';
    }

    if (
      lowerMessage.includes('aiuto') ||
      lowerMessage.includes('help') ||
      lowerMessage.includes('comandi')
    ) {
      return 'HELP';
    }

    // Check for DEAL_NEW patterns
    if (
      lowerMessage.includes('scansiona') ||
      lowerMessage.includes('annuncio') ||
      lowerMessage.includes('proforma') ||
      lowerMessage.includes('link') ||
      lowerMessage.startsWith('/deal')
    ) {
      return 'DEAL_NEW';
    }

    // Check for DOC_HUNTER patterns
    if (
      lowerMessage.includes('documento') ||
      lowerMessage.includes('doc') ||
      lowerMessage.includes('cdu') ||
      lowerMessage.includes('visura') ||
      lowerMessage.includes('durc') ||
      lowerMessage.includes('planimetria') ||
      lowerMessage.startsWith('/doc')
    ) {
      return 'DOC_HUNTER';
    }

    return 'UNKNOWN';
  }

  private parseDealInput(message: string): any {
    // Try to parse as slash command first
    if (message.startsWith('/deal')) {
      return this.parseSlashCommand(message);
    }

    // Try to parse as natural language
    return this.parseNaturalLanguage(message);
  }

  private parseSlashCommand(message: string): any {
    // Parse /deal link:URL sensitivity:OPTIMISTIC
    const linkMatch = message.match(/link:([^\s]+)/);
    const sensitivityMatch = message.match(/sensitivity:(\w+)/);

    if (linkMatch) {
      return {
        type: 'LINK',
        link: linkMatch[1],
        sensitivity: sensitivityMatch ? sensitivityMatch[1] : 'BASE',
      };
    }

    return null;
  }

  private parseNaturalLanguage(message: string): any {
    // Parse natural language patterns
    if (message.includes('scansiona') || message.includes('annuncio')) {
      const linkMatch = message.match(/(https?:\/\/[^\s]+)/);
      if (linkMatch) {
        return {
          type: 'LINK',
          link: linkMatch[1],
          sensitivity: 'BASE',
        };
      }
    }

    if (message.includes('cerca') || message.includes('trova')) {
      const cityMatch = message.match(/a\s+(\w+)/i);
      const budgetMatch = message.match(/(\d+)\s*(?:k|m|milioni?|mila)/i);

      if (cityMatch) {
        return {
          type: 'SEARCH',
          searchParams: {
            city: cityMatch[1],
            budgetMax: budgetMatch ? budgetMatch[1] : '1000000',
          },
          sensitivity: 'BASE',
        };
      }
    }

    return null;
  }

  private async generateFeasibility(deal: any, sensitivity: string): Promise<any> {
    // Mock feasibility generation
    const baseROI = 15;
    const sensitivityMultiplier =
      sensitivity === 'OPTIMISTIC' ? 1.2 : sensitivity === 'PESSIMISTIC' ? 0.8 : 1.0;

    return {
      baseCase: {
        roi: baseROI * sensitivityMultiplier,
        paybackPeriod: 60,
        netPresentValue: 150000 * sensitivityMultiplier,
        internalRateOfReturn: 0.15 * sensitivityMultiplier,
      },
      sensitivityAnalysis: {
        optimistic: baseROI * 1.2,
        pessimistic: baseROI * 0.8,
        variables: ['Mercato', 'Permessi', 'Costi'],
      },
      recommendations: ["Procedere con l'analisi dettagliata", 'Verificare permessi urbanistici'],
      riskAssessment: {
        overall: 'MEDIUM',
        risks: ['Vincoli urbanistici', 'Costi di costruzione'],
        mitigation: ['Analisi preliminare', 'Budget di contingenza'],
      },
      roi: {
        expected: baseROI * sensitivityMultiplier,
        min: baseROI * 0.8,
        max: baseROI * 1.2,
      },
    };
  }

  private async handleDealNew(command: ChatCommand, dealInput: any): Promise<ChatResponse> {
    try {
      // Parse deal input
      let deal: any;
      let feasibility: any;

      if (dealInput.type === 'LINK') {
        // Scrape from link
        deal = await land.byLink(dealInput.link);
      } else if (dealInput.type === 'SEARCH') {
        // Search and pick top result
        const listings = await land.search(dealInput.searchParams);
        if (listings.length === 0) {
          return {
            id: `response-${Date.now()}`,
            commandId: command.id,
            message: 'Nessun terreno trovato con i parametri specificati.',
            type: 'TEXT',
            timestamp: new Date(),
            metadata: {
              processingTime: 0,
              confidence: 0,
              nextSteps: ['Prova con parametri diversi'],
            },
          };
        }
        deal = listings[0] as any;
      } else {
        throw new Error('Invalid deal input type');
      }

      // Generate feasibility analysis
      feasibility = await this.generateFeasibility(deal, dealInput.sensitivity);

      // Create project data - commented out until functions are available
      // const projectData = await createProjectFromDeal(deal, feasibility, command.userId);

      // Persist project to Firestore - commented out until functions are available
      // const projectId = await persistProject(projectData);
      const projectId = 'temp-project-id';

      // Create mock projectData since the function is commented out
      const projectData = {
        name: `Progetto ${projectId}`,
        description: 'Progetto generato tramite ChatOps',
        status: 'PLANNING',
        type: 'RESIDENTIAL',
        location: {
          address: 'Via Roma 1',
          city: 'Milano',
          province: 'MI',
          region: 'Lombardia',
          country: 'Italia',
        },
        budget: {
          total: 1000000,
          currency: 'EUR',
          breakdown: {
            land: 500000,
            construction: 400000,
            permits: 50000,
            design: 30000,
            other: 20000,
          },
          contingency: 100000,
        },
        timeline: {
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          phases: [],
        },
        ownerId: command.userId,
      };

      // Update project object with real ID
      const project: any = {
        // Changed from Project to any as Project type is not imported
        id: projectId,
        name: projectData.name,
        description: projectData.description,
        status: projectData.status,
        type: projectData.type,
        location: projectData.location,
        budget: projectData.budget,
        timeline: projectData.timeline,
        ownerId: projectData.ownerId,
        teamMembers: [
          {
            userId: command.userId,
            role: 'OWNER',
            permissions: [{ resource: 'project', actions: ['READ', 'WRITE', 'DELETE'] }],
            joinedAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Persist deal to Firestore - commented out until functions are available
      // const dealId = await persistDeal({...});
      const dealId = 'temp-deal-id';

      // Persist feasibility to Firestore - commented out until functions are available
      // await persistFeasibility({...});

      // Log the creation
      console.log('Project, Deal, and Feasibility created via ChatOps', {
        projectId,
        dealId,
        intent: 'DEAL_NEW',
      });

      const pdfUrl = await generateDealMemo(project, deal, feasibility);
      const projectDeepLink = createProjectDeepLink(project.id);

      // Format response
      const metrics = formatFinancialMetrics(feasibility);
      const dealTitle = 'title' in deal ? deal.title : `Terreno ${deal.id}`;
      const message = `✅ Deal Memo pronto: ${dealTitle} | ROI ${metrics.roi} | Payback ${metrics.paybackYears}\n\nPDF: ${pdfUrl}\nProgetto: ${projectDeepLink}`;

      return {
        id: `response-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        commandId: command.id,
        message,
        type: 'TEXT',
        timestamp: new Date(),
        actions: [
          {
            type: 'LINK',
            label: 'Visualizza PDF',
            value: pdfUrl,
            primary: true,
          },
          {
            type: 'LINK',
            label: 'Vai al Progetto',
            value: projectDeepLink,
            primary: false,
          },
        ],
        metadata: {
          processingTime: 0,
          confidence: 0.9,
          nextSteps: ['Rivedi il progetto', 'Condividi con il team'],
        },
      };
    } catch (error) {
      console.error('Error handling deal new:', error);

      return {
        id: `response-${Date.now()}`,
        commandId: command.id,
        message: 'Errore durante la creazione del deal. Riprova più tardi.',
        type: 'TEXT',
        timestamp: new Date(),
        metadata: {
          processingTime: 0,
          confidence: 0,
          nextSteps: ['Verifica i parametri', 'Riprova più tardi'],
        },
      };
    }
  }

  private async handleDocHunter(command: ChatCommand): Promise<ChatResponse> {
    try {
      const message = command.message.toLowerCase();

      // Parse document request command
      if (message.startsWith('/doc request')) {
        return await this.handleDocRequest(command);
      }

      // Parse document status command
      if (message.startsWith('/doc status')) {
        return await this.handleDocStatus(command);
      }

      // Parse natural language document requests
      if (message.includes('richiedi') || message.includes('chiedi') || message.includes('serve')) {
        return await this.handleNaturalDocRequest(command);
      }

      // Default response for document-related queries
      return {
        id: `response-${Date.now()}`,
        commandId: command.id,
        message: `📋 **Doc Hunter** - Gestione Documenti Progetto

Comandi disponibili:
• \`/doc request kind:CDU project:XYZ vendor:+39...\` - Richiedi documento
• \`/doc status project:XYZ\` - Stato documenti progetto

Tipi documento supportati:
• CDU (Certificato Destinazione Urbanistica)
• VISURA (Visura Camerale)
• DURC (Documento Regolarità Contributiva)
• PLANIMETRIA (Planimetria Tecnica)
• PROGETTO (Progetto Architettonico)

Esempio: \`/doc request kind:CDU project:proj123 vendor:+393331234567\``,
        type: 'TEXT',
        timestamp: new Date(),
        metadata: {
          processingTime: 0,
          confidence: 0.8,
          nextSteps: ['Usa i comandi per richiedere documenti', 'Controlla lo stato dei documenti'],
        },
      };
    } catch (error) {
      console.error('Error handling doc hunter:', error);

      return {
        id: `response-${Date.now()}`,
        commandId: command.id,
        message: 'Errore durante la gestione documenti. Riprova più tardi.',
        type: 'TEXT',
        timestamp: new Date(),
        metadata: {
          processingTime: 0,
          confidence: 0,
          nextSteps: ['Verifica i parametri', 'Riprova più tardi'],
        },
      };
    }
  }

  private async handleDocRequest(command: ChatCommand): Promise<ChatResponse> {
    try {
      // Parse slash command: /doc request kind:CDU project:proj123 vendor:+393331234567
      const message = command.message;
      const kindMatch = message.match(/kind:(\w+)/i);
      const projectMatch = message.match(/project:(\w+)/i);
      const vendorMatch = message.match(/vendor:([+\d\s]+)/i);

      if (!kindMatch || !projectMatch) {
        return {
          id: `response-${Date.now()}`,
          commandId: command.id,
          message:
            '❌ Formato comando non valido. Usa: `/doc request kind:CDU project:proj123 vendor:+393331234567`',
          type: 'TEXT',
          timestamp: new Date(),
          metadata: {
            processingTime: 0,
            confidence: 0,
            nextSteps: ['Verifica il formato del comando', 'Usa la sintassi corretta'],
          },
        };
      }

      const kind = kindMatch[1]?.toUpperCase();
      const projectId = projectMatch[1];
      const vendorPhone = vendorMatch?.[1]?.trim();

      // Validate required parameters
      if (!kind || !projectId) {
        return {
          id: `response-${Date.now()}`,
          commandId: command.id,
          message:
            '❌ Parametri mancanti o non validi.\n\nSintassi: `/doc request kind:<TIPO> project:<ID> vendor:<TELEFONO>`\n\nEsempio: `/doc request kind:CDU project:proj123 vendor:+393331234567`',
          type: 'TEXT',
          timestamp: new Date(),
          metadata: {
            processingTime: 0,
            confidence: 0,
            nextSteps: ['Verifica i parametri', 'Usa la sintassi corretta'],
          },
        };
      }

      // Validate document kind
      const validKinds = ['CDU', 'VISURA', 'DURC', 'PLANIMETRIA', 'PROGETTO'] as const;
      if (!validKinds.includes(kind as any)) {
        return {
          id: `response-${Date.now()}`,
          commandId: command.id,
          message: `❌ Tipo documento non valido: ${kind}\n\nTipi supportati: ${validKinds.join(', ')}`,
          type: 'TEXT',
          timestamp: new Date(),
          metadata: {
            processingTime: 0,
            confidence: 0,
            nextSteps: ['Usa un tipo documento valido', 'Verifica la sintassi'],
          },
        };
      }

      // TODO: Call document request API to generate upload link
      // For now, return mock response
      const uploadUrl = `https://example.com/docs/upload?token=mock-token-${Date.now()}`;

      const messageText = `📋 **Richiesta Documento ${kind}**

✅ Richiesta creata per il progetto: ${projectId}
🔗 Link upload: ${uploadUrl}
⏰ Scade tra: 48 ore

**Messaggio da inviare al fornitore:**
Gentile Fornitore,

Per il progetto ${projectId}, abbiamo bisogno del documento ${kind}.

Utilizzi il link sicuro qui sotto per caricare il documento:
${uploadUrl}

Il link scade tra 48 ore.

Grazie per la collaborazione.

Cordiali saluti,
Urbanova Team

---
💡 **Prossimi passi:**
1. Invia questo messaggio al fornitore
2. Il fornitore caricherà il documento
3. Il sistema processerà automaticamente il documento
4. Riceverai notifica quando il documento sarà pronto`;

      return {
        id: `response-${Date.now()}`,
        commandId: command.id,
        message: messageText,
        type: 'TEXT',
        timestamp: new Date(),
        actions: [
          {
            type: 'LINK',
            label: 'Link Upload',
            value: uploadUrl,
            primary: true,
          },
          {
            type: 'LINK',
            label: 'Copia Messaggio',
            value: `Richiesta documento ${kind} per progetto ${projectId}`,
            primary: false,
          },
        ],
        metadata: {
          processingTime: 0,
          confidence: 0.9,
          nextSteps: ['Invia messaggio al fornitore', 'Monitora stato documento'],
        },
      };
    } catch (error) {
      console.error('Error handling doc request:', error);

      return {
        id: `response-${Date.now()}`,
        commandId: command.id,
        message: 'Errore durante la richiesta documento. Riprova più tardi.',
        type: 'TEXT',
        timestamp: new Date(),
        metadata: {
          processingTime: 0,
          confidence: 0,
          nextSteps: ['Verifica i parametri', 'Riprova più tardi'],
        },
      };
    }
  }

  private async handleDocStatus(command: ChatCommand): Promise<ChatResponse> {
    try {
      // Parse slash command: /doc status project:proj123
      const message = command.message;
      const projectMatch = message.match(/project:(\w+)/i);

      if (!projectMatch) {
        return {
          id: `response-${Date.now()}`,
          commandId: command.id,
          message: '❌ Formato comando non valido. Usa: `/doc status project:proj123`',
          type: 'TEXT',
          timestamp: new Date(),
          metadata: {
            processingTime: 0,
            confidence: 0,
            nextSteps: ['Verifica il formato del comando', 'Usa la sintassi corretta'],
          },
        };
      }

      const projectId = projectMatch[1];

      // TODO: Call document status API to get checklist
      // For now, return mock response
      const mockChecklist: {
        projectId: string;
        overallStatus: 'INCOMPLETE' | 'COMPLETE' | 'VALIDATION_REQUIRED';
        completionPercentage: number;
        items: Array<{
          kind: 'CDU' | 'VISURA' | 'DURC' | 'PLANIMETRIA' | 'PROGETTO';
          status: 'REQUESTED' | 'UPLOADED' | 'EXTRACTED' | 'VALIDATED' | 'EXPIRED';
          lastUpdate: Date;
        }>;
      } = {
        projectId: projectId || 'unknown',
        overallStatus: 'INCOMPLETE',
        completionPercentage: 60,
        items: [
          { kind: 'CDU', status: 'VALIDATED', lastUpdate: new Date() },
          { kind: 'VISURA', status: 'EXTRACTED', lastUpdate: new Date() },
          { kind: 'DURC', status: 'REQUESTED', lastUpdate: new Date() },
        ],
      };

      const messageText = `📊 **Stato Documenti Progetto: ${projectId}**

📈 Completamento: ${mockChecklist.completionPercentage}%
🎯 Status: ${mockChecklist.overallStatus === 'COMPLETE' ? '✅ COMPLETO' : '⏳ IN COMPLETAMENTO'}

**Documenti:**
${mockChecklist.items
  .map(item => {
    const statusIcon =
      item.status === 'VALIDATED'
        ? '✅'
        : item.status === 'EXTRACTED'
          ? '🔄'
          : item.status === 'UPLOADED'
            ? '📤'
            : '⏳';
    return `${statusIcon} ${item.kind}: ${item.status}`;
  })
  .join('\n')}

---
💡 **Prossimi passi:**
• DURC: Richiedi al fornitore
• VISURA: Verifica estrazione OCR
• CDU: ✅ Completato`;

      return {
        id: `response-${Date.now()}`,
        commandId: command.id,
        message: messageText,
        type: 'TEXT',
        timestamp: new Date(),
        metadata: {
          processingTime: 0,
          confidence: 0.9,
          nextSteps: ['Richiedi documenti mancanti', 'Verifica estrazioni OCR'],
        },
      };
    } catch (error) {
      console.error('Error handling doc status:', error);

      return {
        id: `response-${Date.now()}`,
        commandId: command.id,
        message: 'Errore durante il controllo stato documenti. Riprova più tardi.',
        type: 'TEXT',
        timestamp: new Date(),
        metadata: {
          processingTime: 0,
          confidence: 0,
          nextSteps: ['Verifica i parametri', 'Riprova più tardi'],
        },
      };
    }
  }

  private async handleNaturalDocRequest(command: ChatCommand): Promise<ChatResponse> {
    try {
      const message = command.message.toLowerCase();

      // Extract document type from natural language
      let docKind = '';
      if (message.includes('cdu') || message.includes('destinazione urbanistica')) {
        docKind = 'CDU';
      } else if (message.includes('visura') || message.includes('camerale')) {
        docKind = 'VISURA';
      } else if (message.includes('durc') || message.includes('regolarità contributiva')) {
        docKind = 'DURC';
      } else if (message.includes('planimetria') || message.includes('disegno')) {
        docKind = 'PLANIMETRIA';
      } else if (message.includes('progetto') || message.includes('architettonico')) {
        docKind = 'PROGETTO';
      }

      if (!docKind) {
        return {
          id: `response-${Date.now()}`,
          commandId: command.id,
          message:
            '❓ Non ho capito che tipo di documento vuoi richiedere.\n\nUsa uno di questi termini:\n• CDU o destinazione urbanistica\n• Visura o camerale\n• DURC o regolarità contributiva\n• Planimetria o disegno\n• Progetto o architettonico\n\nOppure usa il comando: `/doc request kind:CDU project:proj123`',
          type: 'TEXT',
          timestamp: new Date(),
          metadata: {
            processingTime: 0,
            confidence: 0,
            nextSteps: ['Specifica il tipo documento', 'Usa il comando slash'],
          },
        };
      }

      // Extract project ID if mentioned
      const projectMatch = message.match(/progetto\s+(\w+)/i);
      const projectId = projectMatch ? projectMatch[1] : 'proj123'; // Default project ID

      return {
        id: `response-${Date.now()}`,
        commandId: command.id,
        message: `📋 **Richiesta Documento ${docKind}**

Ho capito che vuoi richiedere un documento ${docKind} per il progetto ${projectId}.

**Per procedere, usa il comando:**
\`/doc request kind:${docKind} project:${projectId} vendor:+393331234567\`

**Oppure specifica:**
• ID progetto esatto
• Numero di telefono del fornitore
• Eventuali dettagli specifici

💡 **Tip:** Puoi anche dire "richiedi CDU per progetto ABC123"`,
        type: 'TEXT',
        timestamp: new Date(),
        metadata: {
          processingTime: 0,
          confidence: 0.7,
          nextSteps: ['Usa il comando slash completo', 'Specifica progetto e fornitore'],
        },
      };
    } catch (error) {
      console.error('Error handling natural doc request:', error);

      return {
        id: `response-${Date.now()}`,
        commandId: command.id,
        message: "Errore durante l'analisi della richiesta. Riprova più tardi.",
        type: 'TEXT',
        timestamp: new Date(),
        metadata: {
          processingTime: 0,
          confidence: 0,
          nextSteps: ['Verifica i parametri', 'Riprova più tardi'],
        },
      };
    }
  }

  private async generateResponse(command: ChatCommand, intent: string): Promise<ChatResponse> {
    const processingTime = Date.now() - Date.now(); // Will be updated by caller

    switch (intent) {
      case 'PROJECT_STATUS':
        return {
          id: `response-${Date.now()}`,
          commandId: command.id,
          message:
            '📊 **Stato Progetti**\n\nFunzionalità in sviluppo. Presto potrai controllare lo stato dei tuoi progetti.',
          type: 'TEXT',
          timestamp: new Date(),
          metadata: {
            processingTime,
            confidence: 0.8,
            nextSteps: ['Aspetta il rilascio della feature'],
          },
        };

      case 'LAND_SEARCH':
        return {
          id: `response-${Date.now()}`,
          commandId: command.id,
          message:
            '🔍 **Ricerca Terreni**\n\nFunzionalità in sviluppo. Presto potrai cercare terreni disponibili.',
          type: 'TEXT',
          timestamp: new Date(),
          metadata: {
            processingTime,
            confidence: 0.8,
            nextSteps: ['Aspetta il rilascio della feature'],
          },
        };

      case 'FEASIBILITY_ANALYSIS':
        return {
          id: `response-${Date.now()}`,
          commandId: command.id,
          message:
            '📈 **Analisi Fattibilità**\n\nFunzionalità in sviluppo. Presto potrai analizzare la fattibilità dei tuoi progetti.',
          type: 'TEXT',
          timestamp: new Date(),
          metadata: {
            processingTime,
            confidence: 0.8,
            nextSteps: ['Aspetta il rilascio della feature'],
          },
        };

      case 'DEAL_STATUS':
        return {
          id: `response-${Date.now()}`,
          commandId: command.id,
          message:
            '💼 **Stato Deals**\n\nFunzionalità in sviluppo. Presto potrai controllare lo stato dei tuoi deals.',
          type: 'TEXT',
          timestamp: new Date(),
          metadata: {
            processingTime,
            confidence: 0.8,
            nextSteps: ['Aspetta il rilascio della feature'],
          },
        };

      case 'HELP':
        return {
          id: `response-${Date.now()}`,
          commandId: command.id,
          message: `🤖 **Urbanova ChatOps - Comandi Disponibili**

**Deal Management:**
• \`/deal link:URL\` - Analizza terreno da link
• \`scansiona questo annuncio\` - Analizza annuncio
• \`cerca terreno a Milano\` - Cerca terreni

**Document Management (Doc Hunter):**
• \`/doc request kind:CDU project:XYZ vendor:+39...\` - Richiedi documento
• \`/doc status project:XYZ\` - Stato documenti progetto
• \`richiedi CDU per progetto ABC\` - Richiesta naturale

**Esempi:**
• \`/deal link:https://example.com/terreno\`
• \`/doc request kind:CDU project:proj123 vendor:+393331234567\`
• \`/doc status project:proj123\`

💡 **Tip:** Puoi usare sia comandi slash che linguaggio naturale!`,
          type: 'TEXT',
          timestamp: new Date(),
          metadata: {
            processingTime,
            confidence: 0.9,
            nextSteps: ['Prova i comandi disponibili', 'Usa "aiuto" per assistenza'],
          },
        };

      default:
        return {
          id: `response-${Date.now()}`,
          commandId: command.id,
          message:
            '❓ Non ho capito cosa vuoi fare.\n\nUsa "aiuto" per vedere i comandi disponibili.',
          type: 'TEXT',
          timestamp: new Date(),
          metadata: {
            processingTime,
            confidence: 0,
            nextSteps: ['Usa "aiuto" per assistenza', 'Verifica il formato del comando'],
          },
        };
    }
  }

  async processMessage(message: ChatMessage): Promise<ChatResponse> {
    const { text, userId, workspaceId, userRole, projectId, threadId } = message;

    // Check if this is a plan-related command
    if (this.isPlanCommand(text)) {
      return this.handlePlanCommand(text, message);
    }

    // Check if this is a reply to an existing plan session
    const planResponse = await this.handlePlanRequest(text, message);
    if (planResponse) {
      return this.formatPlanResponse(planResponse, message);
    }

    // Fall back to regular chat processing
    return this.handleRegularChat(text, message);
  }

  /**
   * Check if message is a plan command
   */
  private isPlanCommand(text: string): boolean {
    return text.trim().startsWith('/plan ');
  }

  /**
   * Handle plan commands
   */
  private async handlePlanCommand(text: string, message: ChatMessage): Promise<ChatResponse> {
    try {
      const context: PlannerContext = {
        userId: message.userId || 'unknown',
        workspaceId: message.workspaceId || 'default',
        userRole: message.userRole || 'user',
        projectId: message.projectId || 'default',
        channel: 'chat',
        channelId: message.threadId || 'default',
      };

      const reply: PlannerReply = {
        sessionId: '', // Will be resolved by controller
        slashCommand: text,
        context,
      };

      const response = await this.plannerController.handleReply(reply);

      return this.formatPlanResponse(response, message);
    } catch (error) {
      return {
        id: `response-${Date.now()}`,
        commandId: message.id,
        message: `Errore nel comando piano: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
        type: 'TEXT',
        timestamp: new Date(),
        messageId: message.id,
        text: `Errore nel comando piano: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
        metadata: {
          error: true,
          command: text,
        },
      };
    }
  }

  /**
   * Handle plan requests (new or continuing)
   */
  private async handlePlanRequest(text: string, message: ChatMessage): Promise<any> {
    try {
      const context: PlannerContext = {
        userId: message.userId || 'unknown',
        workspaceId: message.workspaceId || 'default',
        userRole: message.userRole || 'user',
        projectId: message.projectId || 'default',
        channel: 'chat',
        channelId: message.threadId || 'default',
      };

      const request: PlannerRequest = {
        text,
        context,
      };

      const response = await this.plannerController.handleNewRequest(request);

      // Check if this is a plan-related request
      if (response.action && response.action !== 'continue') {
        return response;
      }

      return null; // Not a plan request
    } catch (error) {
      console.error('Error handling plan request:', error);
      return null;
    }
  }

  /**
   * Format plan response for chat
   */
  private formatPlanResponse(planResponse: any, message: ChatMessage): ChatResponse {
    const {
      session,
      plan,
      preview,
      summary,
      action,
      message: responseMessage,
      options,
    } = planResponse;

    let responseText = responseMessage || 'Risposta del planner';

    // Add action-specific formatting
    switch (action) {
      case 'draft':
        responseText = `📋 **Nuovo Piano Creato**\n\n${responseText}\n\n${summary || ''}`;
        break;

      case 'confirm':
        responseText = `✅ **Piano Confermato**\n\n${responseText}`;
        break;

      case 'cancel':
        responseText = `❌ **Piano Annullato**\n\n${responseText}`;
        break;

      case 'dryrun':
        responseText = `🔍 **Simulazione Esecuzione**\n\n${responseText}\n\n${summary || ''}`;
        break;

      case 'edit':
        responseText = `✏️ **Parametri Aggiornati**\n\n${responseText}`;
        break;

      case 'run':
        responseText = `🚀 **Esecuzione Avviata**\n\n${responseText}`;
        break;

      case 'continue':
        if (options && options.length > 0) {
          responseText +=
            '\n\n**Opzioni disponibili:**\n' +
            options
              .map((opt: any, idx: number) => `${idx + 1}. ${opt.label}: ${opt.description}`)
              .join('\n');
        }
        break;
    }

    return {
      id: `response-${Date.now()}`,
      commandId: message.id,
      message: responseText,
      type: 'TEXT',
      timestamp: new Date(),
      messageId: message.id,
      text: responseText,
      metadata: {
        planSessionId: session.id,
        planAction: action,
        planPreview: preview,
        planOptions: options,
      },
    };
  }

  /**
   * Handle regular chat (non-plan related)
   */
  private async handleRegularChat(text: string, message: ChatMessage): Promise<ChatResponse> {
    // This would contain the existing chat logic
    // For now, return a simple response
    return {
      id: `response-${Date.now()}`,
      commandId: message.id,
      message: `Ricevuto messaggio: "${text}". Questa è la risposta standard del chat.`,
      type: 'TEXT',
      timestamp: new Date(),
      messageId: message.id,
      text: `Ricevuto messaggio: "${text}". Questa è la risposta standard del chat.`,
      metadata: {
        processed: true,
      },
    };
  }

  /**
   * Check if message is a confirmation for an existing plan
   */
  private async checkForPlanConfirmation(text: string, message: ChatMessage): Promise<boolean> {
    const lowerText = text.toLowerCase().trim();
    const confirmationKeywords = ['ok', 'conferma', 'vai', 'si', 'yes', 'procedi', 'esegui'];

    if (confirmationKeywords.includes(lowerText)) {
      // Check if there's an active plan session
      const context: PlannerContext = {
        userId: message.userId || 'unknown',
        workspaceId: message.workspaceId || 'default',
        userRole: message.userRole || 'user',
        projectId: message.projectId || 'default',
        channel: 'chat',
        channelId: message.threadId || 'default',
      };

      try {
        const activeSession = await this.plannerController['getActiveSession'](context);
        if (activeSession && activeSession.status === 'awaiting_confirm') {
          return true;
        }
      } catch (error) {
        console.error('Error checking for plan confirmation:', error);
      }
    }

    return false;
  }

  /**
   * Handle project ambiguity resolution
   */
  private async handleProjectAmbiguity(
    text: string,
    message: ChatMessage
  ): Promise<ChatResponse | null> {
    // Check if this is a project selection (1, 2, 3)
    if (/^[1-3]$/.test(text.trim())) {
      const context: PlannerContext = {
        userId: message.userId || 'unknown',
        workspaceId: message.workspaceId || 'default',
        userRole: message.userRole || 'user',
        projectId: message.projectId || 'default',
        channel: 'chat',
        channelId: message.threadId || 'default',
      };

      try {
        const activeSession = await this.plannerController['getActiveSession'](context);
        if (activeSession) {
          const reply: PlannerReply = {
            sessionId: activeSession.id,
            text,
            context,
          };

          const response = await this.plannerController.handleReply(reply);
          return this.formatPlanResponse(response, message);
        }
      } catch (error) {
        console.error('Error handling project ambiguity:', error);
      }
    }

    return null;
  }
}

export const chatOpsAgent = new ChatOpsAgentImpl();
