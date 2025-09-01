import { Template } from '@urbanova/types';

/**
 * Template System per Lead/Chat Unifier v1
 *
 * Template predefiniti per:
 * - First Response (prima risposta)
 * - Follow-up (follow-up)
 * - Documents Request (richiesta documenti)
 * - Appointment Scheduling (prenotazione appuntamento)
 * - Payment Reminder (promemoria pagamento)
 */

export const LEAD_TEMPLATES: Record<string, Template> = {
  // Template per prima risposta
  first_response: {
    id: 'first_response',
    name: 'Prima Risposta',
    description: 'Template automatico per la prima risposta a un nuovo lead',
    subject: 'Grazie per il tuo interesse - Urbanova',
    bodyText: `Gentile {{leadName}},

Grazie per il suo interesse nell'appartamento {{listingId}}.

Un nostro agente la contatterà entro 15 minuti per fornirle tutte le informazioni richieste e rispondere alle sue domande.

Nel frattempo, può consultare la nostra brochure completa all'indirizzo:
https://urbanova.com/progetti/{{projectId}}

Cordiali saluti,
Team Urbanova
Tel: +39 02 12345678
Email: info@urbanova.com`,
    bodyHtml: `<p>Gentile <strong>{{leadName}}</strong>,</p>
<p>Grazie per il suo interesse nell'appartamento <strong>{{listingId}}</strong>.</p>
<p>Un nostro agente la contatterà entro 15 minuti per fornirle tutte le informazioni richieste e rispondere alle sue domande.</p>
<p>Nel frattempo, può consultare la nostra <a href="https://urbanova.com/progetti/{{projectId}}">brochure completa</a>.</p>
<p>Cordiali saluti,<br>
<strong>Team Urbanova</strong><br>
Tel: +39 02 12345678<br>
Email: info@urbanova.com</p>`,
    variables: ['leadName', 'listingId', 'projectId'],
    category: 'response',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Template per follow-up
  follow_up: {
    id: 'follow_up',
    name: 'Follow-up',
    description: 'Template per follow-up dopo il primo contatto',
    subject: 'Follow-up - Appartamento {{listingId}}',
    bodyText: `Gentile {{leadName}},

Spero che il nostro primo contatto sia stato utile.

Vorrei sapere se ha avuto modo di valutare l'appartamento {{listingId}} e se ha domande specifiche.

Sono disponibile per:
- Visita guidata dell'immobile
- Valutazione personalizzata
- Consulenza finanziaria
- Confronto con altre soluzioni

La contatto telefonicamente nei prossimi giorni per un aggiornamento.

Cordiali saluti,
{{agentName}}
Urbanova`,
    bodyHtml: `<p>Gentile <strong>{{leadName}}</strong>,</p>
<p>Spero che il nostro primo contatto sia stato utile.</p>
<p>Vorrei sapere se ha avuto modo di valutare l'appartamento <strong>{{listingId}}</strong> e se ha domande specifiche.</p>
<p>Sono disponibile per:</p>
<ul>
<li>Visita guidata dell'immobile</li>
<li>Valutazione personalizzata</li>
<li>Consulenza finanziaria</li>
<li>Confronto con altre soluzioni</li>
</ul>
<p>La contatto telefonicamente nei prossimi giorni per un aggiornamento.</p>
<p>Cordiali saluti,<br>
<strong>{{agentName}}</strong><br>
Urbanova</p>`,
    variables: ['leadName', 'listingId', 'agentName'],
    category: 'follow_up',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Template per richiesta documenti
  documents_request: {
    id: 'documents_request',
    name: 'Richiesta Documenti',
    description: 'Template per richiedere documenti al lead',
    subject: 'Documentazione richiesta - {{listingId}}',
    bodyText: `Gentile {{leadName}},

Per procedere con la valutazione dell'appartamento {{listingId}}, abbiamo bisogno di alcuni documenti:

DOCUMENTI RICHIESTI:
- Documento d'identità (carta d'identità o passaporto)
- Certificato di residenza
- Ultime 3 buste paga o dichiarazione dei redditi
- Visura catastale (se proprietario di altri immobili)

Può inviare i documenti:
- Via email: documenti@urbanova.com
- Via WhatsApp: +39 333 9876543
- Tramite il link sicuro: https://urbanova.com/upload/{{secureLink}}

I suoi dati sono protetti e trattati secondo il GDPR.

Cordiali saluti,
{{agentName}}
Urbanova`,
    bodyHtml: `<p>Gentile <strong>{{leadName}}</strong>,</p>
<p>Per procedere con la valutazione dell'appartamento <strong>{{listingId}}</strong>, abbiamo bisogno di alcuni documenti:</p>
<p><strong>DOCUMENTI RICHIESTI:</strong></p>
<ul>
<li>Documento d'identità (carta d'identità o passaporto)</li>
<li>Certificato di residenza</li>
<li>Ultime 3 buste paga o dichiarazione dei redditi</li>
<li>Visura catastale (se proprietario di altri immobili)</li>
</ul>
<p>Può inviare i documenti:</p>
<ul>
<li>Via email: documenti@urbanova.com</li>
<li>Via WhatsApp: +39 333 9876543</li>
<li>Tramite il <a href="https://urbanova.com/upload/{{secureLink}}">link sicuro</a></li>
</ul>
<p>I suoi dati sono protetti e trattati secondo il GDPR.</p>
<p>Cordiali saluti,<br>
<strong>{{agentName}}</strong><br>
Urbanova</p>`,
    variables: ['leadName', 'listingId', 'agentName', 'secureLink'],
    category: 'documents',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Template per prenotazione appuntamento
  appointment_scheduling: {
    id: 'appointment_scheduling',
    name: 'Prenotazione Appuntamento',
    description: 'Template per programmare una visita guidata',
    subject: 'Prenotazione visita - {{listingId}}',
    bodyText: `Gentile {{leadName}},

Perfetto! Ho prenotato la visita guidata dell'appartamento {{listingId}} per:

DATA: {{appointmentDate}}
ORA: {{appointmentTime}}
DURATA: circa 45 minuti
INDIRIZZO: {{propertyAddress}}

IL NOSTRO AGENTE:
{{agentName}}
Tel: {{agentPhone}}
Email: {{agentEmail}}

COSA PORTARE:
- Documento d'identità
- Eventuali domande scritte

Se non può presentarsi, la prego di avvisarci almeno 24 ore prima.

Cordiali saluti,
{{agentName}}
Urbanova`,
    bodyHtml: `<p>Gentile <strong>{{leadName}}</strong>,</p>
<p>Perfetto! Ho prenotato la visita guidata dell'appartamento <strong>{{listingId}}</strong> per:</p>
<p><strong>DATA:</strong> {{appointmentDate}}<br>
<strong>ORA:</strong> {{appointmentTime}}<br>
<strong>DURATA:</strong> circa 45 minuti<br>
<strong>INDIRIZZO:</strong> {{propertyAddress}}</p>
<p><strong>IL NOSTRO AGENTE:</strong><br>
{{agentName}}<br>
Tel: {{agentPhone}}<br>
Email: {{agentEmail}}</p>
<p><strong>COSA PORTARE:</strong></p>
<ul>
<li>Documento d'identità</li>
<li>Eventuali domande scritte</li>
</ul>
<p>Se non può presentarsi, la prego di avvisarci almeno 24 ore prima.</p>
<p>Cordiali saluti,<br>
<strong>{{agentName}}</strong><br>
Urbanova</p>`,
    variables: [
      'leadName',
      'listingId',
      'appointmentDate',
      'appointmentTime',
      'propertyAddress',
      'agentName',
      'agentPhone',
      'agentEmail',
    ],
    category: 'appointment',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Template per promemoria pagamento
  payment_reminder: {
    id: 'payment_reminder',
    name: 'Promemoria Pagamento',
    description: 'Template per ricordare scadenze di pagamento',
    subject: 'Promemoria pagamento - {{listingId}}',
    bodyText: `Gentile {{leadName}},

Le ricordo che il {{paymentDate}} scade il pagamento per l'appartamento {{listingId}}.

DETTAGLI PAGAMENTO:
Importo: €{{amount}}
Scadenza: {{paymentDate}}
Riferimento: {{paymentReference}}

MODALITÀ DI PAGAMENTO:
- Bonifico bancario: IT60 X054 2811 1010 0000 0123 456
- Assegno circolare
- Pagamento online: https://urbanova.com/pay/{{paymentLink}}

Se ha già effettuato il pagamento, può ignorare questo messaggio.

Per qualsiasi chiarimento, non esiti a contattarci.

Cordiali saluti,
{{agentName}}
Urbanova`,
    bodyHtml: `<p>Gentile <strong>{{leadName}}</strong>,</p>
<p>Le ricordo che il <strong>{{paymentDate}}</strong> scade il pagamento per l'appartamento <strong>{{listingId}}</strong>.</p>
<p><strong>DETTAGLI PAGAMENTO:</strong><br>
Importo: €{{amount}}<br>
Scadenza: {{paymentDate}}<br>
Riferimento: {{paymentReference}}</p>
<p><strong>MODALITÀ DI PAGAMENTO:</strong></p>
<ul>
<li>Bonifico bancario: IT60 X054 2811 1010 0000 0123 456</li>
<li>Assegno circolare</li>
<li><a href="https://urbanova.com/pay/{{paymentLink}}">Pagamento online</a></li>
</ul>
<p>Se ha già effettuato il pagamento, può ignorare questo messaggio.</p>
<p>Per qualsiasi chiarimento, non esiti a contattarci.</p>
<p>Cordiali saluti,<br>
<strong>{{agentName}}</strong><br>
Urbanova</p>`,
    variables: [
      'leadName',
      'listingId',
      'paymentDate',
      'amount',
      'paymentReference',
      'paymentLink',
      'agentName',
    ],
    category: 'payment',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Template per WhatsApp (versione breve)
  whatsapp_first_response: {
    id: 'whatsapp_first_response',
    name: 'Prima Risposta WhatsApp',
    description: 'Template breve per prima risposta WhatsApp',
    bodyText: `Ciao {{leadName}}! 

Grazie per il tuo interesse nell'appartamento {{listingId}}.

Un nostro agente ti contatterà entro 15 minuti per fornirti tutte le informazioni richieste.

Cordiali saluti,
Team Urbanova`,
    bodyHtml: undefined, // WhatsApp non usa HTML
    variables: ['leadName', 'listingId'],
    category: 'whatsapp',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Template per WhatsApp follow-up
  whatsapp_follow_up: {
    id: 'whatsapp_follow_up',
    name: 'Follow-up WhatsApp',
    description: 'Template breve per follow-up WhatsApp',
    bodyText: `Ciao {{leadName}}!

Hai avuto modo di valutare l'appartamento {{listingId}}?

Ti chiamo nei prossimi giorni per un aggiornamento.

{{agentName}}
Urbanova`,
    bodyHtml: undefined,
    variables: ['leadName', 'listingId', 'agentName'],
    category: 'whatsapp',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

/**
 * Classe per la gestione dei template
 */
export class TemplateManager {
  private templates: Map<string, Template>;

  constructor() {
    this.templates = new Map();
    this.initializeTemplates();
  }

  private initializeTemplates() {
    Object.values(LEAD_TEMPLATES).forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  /**
   * Ottiene un template per ID
   */
  getTemplate(id: string): Template | undefined {
    return this.templates.get(id);
  }

  /**
   * Lista tutti i template attivi
   */
  getActiveTemplates(): Template[] {
    return Array.from(this.templates.values()).filter(t => t.isActive);
  }

  /**
   * Lista template per categoria
   */
  getTemplatesByCategory(category: string): Template[] {
    return Array.from(this.templates.values()).filter(t => t.category === category && t.isActive);
  }

  /**
   * Renderizza un template con le variabili
   */
  renderTemplate(
    template: Template,
    variables: Record<string, string>
  ): {
    subject?: string;
    bodyText: string;
    bodyHtml?: string;
  } {
    let renderedSubject = template.subject;
    let renderedText = template.bodyText;
    let renderedHtml = template.bodyHtml;

    // Sostituisce le variabili nel testo
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      if (renderedSubject) {
        renderedSubject = renderedSubject.replace(new RegExp(placeholder, 'g'), value);
      }
      renderedText = renderedText.replace(new RegExp(placeholder, 'g'), value);
      if (renderedHtml) {
        renderedHtml = renderedHtml.replace(new RegExp(placeholder, 'g'), value);
      }
    });

    return {
      subject: renderedSubject,
      bodyText: renderedText,
      bodyHtml: renderedHtml,
    };
  }

  /**
   * Aggiunge un nuovo template
   */
  addTemplate(template: Template): void {
    this.templates.set(template.id, template);
  }

  /**
   * Aggiorna un template esistente
   */
  updateTemplate(id: string, updates: Partial<Template>): boolean {
    const template = this.templates.get(id);
    if (!template) return false;

    const updatedTemplate = { ...template, ...updates, updatedAt: new Date() };
    this.templates.set(id, updatedTemplate);
    return true;
  }

  /**
   * Disattiva un template
   */
  deactivateTemplate(id: string): boolean {
    return this.updateTemplate(id, { isActive: false });
  }

  /**
   * Attiva un template
   */
  activateTemplate(id: string): boolean {
    return this.updateTemplate(id, { isActive: true });
  }

  /**
   * Elimina un template
   */
  deleteTemplate(id: string): boolean {
    return this.templates.delete(id);
  }

  /**
   * Valida un template
   */
  validateTemplate(template: Template): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!template.id) errors.push('ID is required');
    if (!template.name) errors.push('Name is required');
    if (!template.bodyText) errors.push('Body text is required');
    if (template.bodyHtml && !template.bodyText) errors.push('HTML requires text version');

    // Valida variabili nel testo
    const textVariables = this.extractVariables(template.bodyText);
    const htmlVariables = template.bodyHtml ? this.extractVariables(template.bodyHtml) : [];
    const subjectVariables = template.subject ? this.extractVariables(template.subject) : [];

    const allVariables = [...new Set([...textVariables, ...htmlVariables, ...subjectVariables])];
    const declaredVariables = template.variables || [];

    const missingVariables = allVariables.filter(v => !declaredVariables.includes(v));
    const unusedVariables = declaredVariables.filter(v => !allVariables.includes(v));

    if (missingVariables.length > 0) {
      errors.push(`Missing variables: ${missingVariables.join(', ')}`);
    }

    if (unusedVariables.length > 0) {
      errors.push(`Unused variables: ${unusedVariables.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Estrae le variabili da un testo
   */
  private extractVariables(text: string): string[] {
    const matches = text.match(/\{\{([^}]+)\}\}/g);
    if (!matches) return [];

    return matches.map(match => match.slice(2, -2)); // Rimuove {{ }}
  }
}

// Istanza globale del template manager
export const templateManager = new TemplateManager();
