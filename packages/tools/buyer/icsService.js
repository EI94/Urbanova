'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ICSService = void 0;
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
class ICSService {
  constructor() {
    this.icsFiles = new Map();
    // Inizializza riferimento al servizio appuntamenti
    this.appointmentService = null;
  }
  /**
   * Genera file ICS per appuntamento
   */
  async generateICS(request) {
    console.log(`📄 Generate ICS - Appointment: ${request.appointmentId}`);
    // Simula recupero appuntamento
    const appointment = {
      id: request.appointmentId,
      buyerId: 'buyer_123',
      when: new Date(),
      location: {
        type: 'physical',
        address: 'Via Roma 123, Milano',
        instructions: 'Piano terra, ufficio 5',
      },
      type: 'fitting',
      participants: [
        {
          name: 'Mario Rossi',
          email: 'mario.rossi@email.com',
          phone: '+393331234567',
          role: 'buyer',
        },
        {
          name: 'Giulia Bianchi',
          email: 'giulia.bianchi@urbanova.com',
          phone: '+393339876543',
          role: 'agent',
        },
      ],
      status: 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
      metadata: {},
      icsFileId: null,
      googleEventId: null,
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
    const icsFile = {
      id: `ics_${Date.now()}`,
      appointmentId: request.appointmentId,
      fileName: `appointment_${request.appointmentId}.ics`,
      content: icsContent,
      size: Buffer.byteLength(icsContent, 'utf8'),
      mimeType: 'text/calendar',
      generatedAt: new Date(),
      downloadUrl: `https://api.urbanova.com/ics/${request.appointmentId}/download`,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 giorni
      metadata: {
        timezone: request.timezone || 'Europe/Rome',
        includeAttachments: request.includeAttachments !== false,
        includeRecurrence: request.includeRecurrence || false,
        version: 'RFC 5545',
      },
    };
    this.icsFiles.set(icsFile.id, icsFile);
    console.log(`✅ ICS File Generated - ID: ${icsFile.id}, Size: ${icsFile.size} bytes`);
    return icsFile;
  }
  /**
   * Genera contenuto ICS RFC 5545
   */
  generateICSContent(appointment, options) {
    const now = new Date();
    const startDate = appointment.when;
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 ora di default
    // Organizzatore
    const organizer = {
      name: 'Urbanova',
      email: 'noreply@urbanova.com',
      uri: 'mailto:noreply@urbanova.com',
    };
    // Partecipanti
    const attendees = appointment.participants.map(participant => ({
      name: participant.name,
      email: participant.email,
      role: participant.role === 'buyer' ? 'REQ-PARTICIPANT' : 'REQ-PARTICIPANT',
      rsvp: true,
      status: 'NEEDS-ACTION',
    }));
    // Allegati se richiesti
    const attachments =
      options.includeAttachments && appointment.attachments.length > 0
        ? appointment.attachments.map(attachment => ({
            url: attachment.url,
            mimeType: attachment.type,
            filename: attachment.name,
          }))
        : [];
    // Ricorrenza se richiesta
    const recurrence = options.includeRecurrence
      ? {
          frequency: 'WEEKLY',
          interval: 1,
          count: 4,
          byDay: ['MO', 'WE', 'FR'],
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
        `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=${attendee.role};PARTSTAT=${attendee.status};RSVP=${attendee.rsvp ? 'TRUE' : 'FALSE'};CN=${attendee.name}:mailto:${attendee.email}`
      );
    });
    // Aggiungi allegati
    attachments.forEach(attachment => {
      icsContent.push(`ATTACH;FMTTYPE=${attachment.mimeType};VALUE=URI:${attachment.url}`);
    });
    // Aggiungi ricorrenza
    if (recurrence) {
      icsContent.push(
        `RRULE:FREQ=${recurrence.frequency};INTERVAL=${recurrence.interval};COUNT=${recurrence.count};BYDAY=${recurrence.byDay.join(',')}`
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
  formatICSDate(date) {
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
  escapeICSValue(value) {
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
  async getICSFile(icsFileId) {
    return this.icsFiles.get(icsFileId) || null;
  }
  /**
   * Ottieni file ICS per appuntamento
   */
  async getICSFileByAppointment(appointmentId) {
    const icsFiles = Array.from(this.icsFiles.values());
    return icsFiles.find(ics => ics.appointmentId === appointmentId) || null;
  }
  /**
   * Aggiorna file ICS
   */
  async updateICSFile(icsFileId, updates) {
    const icsFile = this.icsFiles.get(icsFileId);
    if (!icsFile) {
      throw new Error(`ICS File ${icsFileId} not found`);
    }
    if (updates.content) {
      icsFile.content = updates.content;
      icsFile.size = Buffer.byteLength(updates.content, 'utf8');
    }
    if (updates.downloadUrl) icsFile.downloadUrl = updates.downloadUrl;
    if (updates.expiresAt) icsFile.expiresAt = updates.expiresAt;
    if (updates.metadata) icsFile.metadata = { ...icsFile.metadata, ...updates.metadata };
    console.log(`🔄 ICS File Updated - ID: ${icsFileId}`);
    return icsFile;
  }
  /**
   * Rigenera file ICS
   */
  async regenerateICS(appointmentId, options = {}) {
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
  async validateICS(icsContent) {
    const errors = [];
    const warnings = [];
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
  async deleteICSFile(icsFileId) {
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
  async listICSFiles(filters = {}) {
    let icsFiles = Array.from(this.icsFiles.values());
    if (filters.appointmentId) {
      icsFiles = icsFiles.filter(ics => ics.appointmentId === filters.appointmentId);
    }
    if (filters.fromDate) {
      icsFiles = icsFiles.filter(ics => ics.generatedAt >= filters.fromDate);
    }
    if (filters.toDate) {
      icsFiles = icsFiles.filter(ics => ics.generatedAt <= filters.toDate);
    }
    return icsFiles.sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
  }
  /**
   * Pulisci file ICS scaduti
   */
  async cleanupExpiredICS() {
    const now = new Date();
    const expiredFiles = Array.from(this.icsFiles.values()).filter(ics => ics.expiresAt < now);
    expiredFiles.forEach(ics => {
      this.icsFiles.delete(ics.id);
    });
    console.log(`🧹 Cleaned up ${expiredFiles.length} expired ICS files`);
    return expiredFiles.length;
  }
}
exports.ICSService = ICSService;
//# sourceMappingURL=icsService.js.map
