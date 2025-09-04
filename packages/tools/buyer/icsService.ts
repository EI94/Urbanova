import {
  ICSFile,
  ICSEvent,
  ICSAttendee,
  ICSOrganizer,
  ICSAttachment,
  ICSRecurrence,
  Appointment,
} from '@urbanova/types';

/**
 * ICS Service
 *
 * Generazione file ICS RFC 5545:
 * - Eventi singoli e ricorrenti
 * - Partecipanti e organizzatori
 * - Allegati e descrizioni
 * - Timezone support
 * - Download sicuri
 */

export class ICSService {
  private icsFiles: Map<string, ICSFile> = new Map();
  private appointmentService: any; // Riferimento al servizio appuntamenti

  constructor() {
    // Inizializza riferimento al servizio appuntamenti
    this.appointmentService = null;
  }

  /**
   * Genera file ICS per appuntamento
   */
  async generateICS(request: {
    appointmentId: string;
    includeAttachments?: boolean;
    includeRecurrence?: boolean;
    timezone?: string;
  }): Promise<ICSFile> {
    console.log(`📄 Generate ICS - Appointment: ${request.appointmentId}`);

    // Simula recupero appuntamento
    const appointment: Appointment = {
      id: request.appointmentId,
      buyerId: 'buyer_123',
      projectId: 'project_123',
      title: 'Appuntamento Fitting',
      description: 'Appuntamento per finiture appartamento',
      startTime: new Date(),
      endTime: new Date(Date.now() + 60 * 60 * 1000), // 1 ora dopo
      timezone: 'Europe/Rome',
      location: {
        type: 'physical',
        address: 'Via Roma 123, Milano',
        instructions: 'Piano terra, ufficio 5',
      },
      type: 'fitting',
      participants: [
        {
          id: 'participant_1',
          name: 'Mario Rossi',
          email: 'mario.rossi@email.com',
          phone: '+393331234567',
          role: 'buyer',
          confirmed: true,
        },
        {
          id: 'participant_2',
          name: 'Giulia Bianchi',
          email: 'giulia.bianchi@urbanova.com',
          phone: '+393339876543',
          role: 'agent',
          confirmed: true,
        },
      ],
      status: 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date(),



      reminders: [],
      notes: 'Appuntamento per finiture appartamento',
      attachments: [],
    };

    // Genera contenuto ICS
    const icsContent = this.generateICSContent(appointment, {
      includeAttachments: request.includeAttachments !== false,
      includeRecurrence: request.includeRecurrence || false,
      timezone: request.timezone || 'Europe/Rome',
    });

    // Crea file ICS
    const icsFile: ICSFile = {
      id: `ics_${Date.now()}`,
      filename: `appointment_${request.appointmentId}.ics`,
      content: icsContent,
      events: [], // Events will be populated from content parsing
      generatedAt: new Date(),
      downloadUrl: `https://api.urbanova.com/ics/${request.appointmentId}/download`,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 giorni
    };

    this.icsFiles.set(icsFile.id, icsFile);

    console.log(`✅ ICS File Generated - ID: ${icsFile.id}`);

    return icsFile;
  }

  /**
   * Genera contenuto ICS RFC 5545
   */
  private generateICSContent(
    appointment: Appointment,
    options: {
      includeAttachments: boolean;
      includeRecurrence: boolean;
      timezone: string;
    }
  ): string {
    const now = new Date();
    const startDate = appointment.startTime;
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 ora di default

    // Organizzatore
    const organizer: ICSOrganizer = {
      name: 'Urbanova',
      email: 'noreply@urbanova.com',
    };

    // Partecipanti
    const attendees: ICSAttendee[] = appointment.participants.map(participant => ({
      name: participant.name,
      email: participant.email || '',
      role: participant.role === 'buyer' ? 'REQ-PARTICIPANT' : 'REQ-PARTICIPANT',
    }));

    // Allegati se richiesti
    const attachments: ICSAttachment[] =
      options.includeAttachments && appointment.attachments && appointment.attachments.length > 0
        ? appointment.attachments.map(attachment => ({
            url: attachment.url,
            mimeType: attachment.type,
            filename: attachment.filename,
          }))
        : [];

    // Ricorrenza se richiesta
    const recurrence: ICSRecurrence | null = options.includeRecurrence
      ? {
          freq: 'WEEKLY',
          interval: 1,
          until: new Date(Date.now() + 4 * 7 * 24 * 60 * 60 * 1000), // 4 settimane
        }
      : null;

    // Genera contenuto ICS
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Urbanova//Buyer Concierge//IT',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      '',
      'BEGIN:VEVENT',
      `UID:${appointment.id}@urbanova.com`,
      `DTSTAMP:${this.formatICSDate(now)}`,
      `DTSTART;TZID=${options.timezone}:${this.formatICSDate(startDate)}`,
      `DTEND;TZID=${options.timezone}:${this.formatICSDate(endDate)}`,
      `SUMMARY:${this.escapeICSValue(appointment.type === 'fitting' ? 'Finiture Appartamento' : 'Visita Appartamento')}`,
      `DESCRIPTION:${this.escapeICSValue(appointment.notes || 'Appuntamento Urbanova')}`,
      `LOCATION:${this.escapeICSValue(appointment.location.address || appointment.location.virtualUrl || 'Da definire')}`,
      `ORGANIZER;CN=${organizer.name}:mailto:${organizer.email}`,
      `STATUS:CONFIRMED`,
      `CLASS:PUBLIC`,
      `PRIORITY:5`,
      `TRANSP:OPAQUE`,
    ];

    // Aggiungi partecipanti
    attendees.forEach(attendee => {
      icsContent.push(
        `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=${attendee.role};PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN=${attendee.name}:mailto:${attendee.email}`
      );
    });

    // Aggiungi allegati
    attachments.forEach(attachment => {
      icsContent.push(`ATTACH;FMTTYPE=${attachment.mimeType};VALUE=URI:${attachment.url}`);
    });

    // Aggiungi ricorrenza
    if (recurrence) {
      icsContent.push(
        `RRULE:FREQ=${recurrence.freq};INTERVAL=${recurrence.interval}${recurrence.until ? `;UNTIL=${recurrence.until.toISOString().replace(/[-:]/g, '').split('.')[0]}Z` : ''}`
      );
    }

    // Aggiungi istruzioni località
    if (appointment.location.instructions) {
      icsContent.push(`COMMENT:${this.escapeICSValue(appointment.location.instructions)}`);
    }

    // Aggiungi URL meeting virtuale se presente
    if (appointment.location.type === 'virtual' && appointment.location.virtualUrl) {
      icsContent.push(`URL:${appointment.location.virtualUrl}`);
    }

    // Chiudi evento e calendario
    icsContent.push('END:VEVENT', '', 'END:VCALENDAR');

    return icsContent.join('\r\n');
  }

  /**
   * Formatta data per ICS
   */
  private formatICSDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
  }

  /**
   * Escape valori ICS
   */
  private escapeICSValue(value: string): string {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r');
  }

  /**
   * Ottieni file ICS
   */
  async getICSFile(icsFileId: string): Promise<ICSFile | null> {
    return this.icsFiles.get(icsFileId) || null;
  }

  /**
   * Ottieni file ICS per appuntamento
   */
  async getICSFileByAppointment(appointmentId: string): Promise<ICSFile | null> {
    const icsFiles = Array.from(this.icsFiles.values());
    return icsFiles.find(ics => ics.filename.includes(appointmentId)) || null;
  }

  /**
   * Aggiorna file ICS
   */
  async updateICSFile(
    icsFileId: string,
    updates: {
      content?: string;
      downloadUrl?: string;
      expiresAt?: Date;
      metadata?: any;
    }
  ): Promise<ICSFile> {
    const icsFile = this.icsFiles.get(icsFileId);
    if (!icsFile) {
      throw new Error(`ICS File ${icsFileId} not found`);
    }

    if (updates.content) {
      icsFile.content = updates.content;
      // Size calculation removed - not part of ICSFile type
    }

    if (updates.downloadUrl) icsFile.downloadUrl = updates.downloadUrl;
    if (updates.expiresAt) icsFile.expiresAt = updates.expiresAt;
    // Metadata handling removed - not part of ICSFile type

    console.log(`🔄 ICS File Updated - ID: ${icsFileId}`);

    return icsFile;
  }

  /**
   * Rigenera file ICS
   */
  async regenerateICS(
    appointmentId: string,
    options: {
      includeAttachments?: boolean;
      includeRecurrence?: boolean;
      timezone?: string;
    } = {}
  ): Promise<ICSFile> {
    // Elimina file ICS esistente
    const existingICS = await this.getICSFileByAppointment(appointmentId);
    if (existingICS) {
      this.icsFiles.delete(existingICS.id);
    }

    // Genera nuovo file ICS
    return this.generateICS({
      appointmentId,
      includeAttachments: options.includeAttachments !== false,
      includeRecurrence: options.includeRecurrence || false,
      timezone: options.timezone || 'Europe/Rome',
    });
  }

  /**
   * Valida file ICS
   */
  async validateICS(icsContent: string): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Controlli base RFC 5545
    if (!icsContent.includes('BEGIN:VCALENDAR')) {
      errors.push('Missing BEGIN:VCALENDAR');
    }

    if (!icsContent.includes('END:VCALENDAR')) {
      errors.push('Missing END:VCALENDAR');
    }

    if (!icsContent.includes('BEGIN:VEVENT')) {
      errors.push('Missing BEGIN:VEVENT');
    }

    if (!icsContent.includes('END:VEVENT')) {
      errors.push('Missing END:VEVENT');
    }

    if (!icsContent.includes('VERSION:2.0')) {
      errors.push('Missing VERSION:2.0');
    }

    // Controlla UID
    const uidMatch = icsContent.match(/UID:(.+)/);
    if (!uidMatch) {
      errors.push('Missing UID');
    }

    // Controlla DTSTART
    const dtstartMatch = icsContent.match(/DTSTART[^:]*:(.+)/);
    if (!dtstartMatch) {
      errors.push('Missing DTSTART');
    }

    // Controlla SUMMARY
    const summaryMatch = icsContent.match(/SUMMARY:(.+)/);
    if (!summaryMatch) {
      warnings.push('Missing SUMMARY (recommended)');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Elimina file ICS
   */
  async deleteICSFile(icsFileId: string): Promise<boolean> {
    const icsFile = this.icsFiles.get(icsFileId);
    if (!icsFile) {
      return false;
    }

    this.icsFiles.delete(icsFileId);
    console.log(`🗑️ ICS File Deleted - ID: ${icsFileId}`);

    return true;
  }

  /**
   * Lista file ICS
   */
  async listICSFiles(
    filters: {
      appointmentId?: string;
      fromDate?: Date;
      toDate?: Date;
    } = {}
  ): Promise<ICSFile[]> {
    let icsFiles = Array.from(this.icsFiles.values());

    if (filters.appointmentId) {
      icsFiles = icsFiles.filter(ics => ics.filename.includes(filters.appointmentId!));
    }

    if (filters.fromDate) {
      icsFiles = icsFiles.filter(ics => ics.generatedAt >= filters.fromDate!);
    }

    if (filters.toDate) {
      icsFiles = icsFiles.filter(ics => ics.generatedAt <= filters.toDate!);
    }

    return icsFiles.sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
  }

  /**
   * Pulisci file ICS scaduti
   */
  async cleanupExpiredICS(): Promise<number> {
    const now = new Date();
    const expiredFiles = Array.from(this.icsFiles.values()).filter(ics => ics.expiresAt && ics.expiresAt < now);

    expiredFiles.forEach(ics => {
      this.icsFiles.delete(ics.id);
    });

    console.log(`🧹 Cleaned up ${expiredFiles.length} expired ICS files`);

    return expiredFiles.length;
  }
}
