'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.GoogleCalendarService = void 0;
/**
 * Google Calendar Service
 *
 * Integrazione Google Calendar:
 * - OAuth 2.0 authentication
 * - Creazione eventi
 * - Sincronizzazione bidirezionale
 * - Gestione conflitti
 * - Timezone support
 */
class GoogleCalendarService {
  constructor() {
    this.googleEvents = new Map();
    this.calendarConfig = null;
    this.initializeGoogleClient();
  }
  /**
   * Inizializza Google client
   */
  initializeGoogleClient() {
    // Simulazione Google Calendar API
    this.googleClient = {
      authenticate: async config => {
        console.log(`🔐 Google Calendar Auth - Client ID: ${config.clientId}`);
        return {
          accessToken: `access_token_${Date.now()}`,
          refreshToken: `refresh_token_${Date.now()}`,
          expiresAt: new Date(Date.now() + 3600 * 1000), // 1 ora
        };
      },
      createEvent: async event => {
        console.log(`📅 Google Calendar Create Event - Summary: ${event.summary}`);
        return {
          id: `google_event_${Date.now()}`,
          htmlLink: `https://calendar.google.com/event?eid=${Date.now()}`,
          status: 'confirmed',
          created: new Date(),
          updated: new Date(),
        };
      },
      updateEvent: async (eventId, event) => {
        console.log(`🔄 Google Calendar Update Event - ID: ${eventId}`);
        return {
          id: eventId,
          htmlLink: `https://calendar.google.com/event?eid=${eventId}`,
          status: 'confirmed',
          updated: new Date(),
        };
      },
      deleteEvent: async eventId => {
        console.log(`🗑️ Google Calendar Delete Event - ID: ${eventId}`);
        return { success: true };
      },
      listEvents: async (calendarId, timeMin, timeMax) => {
        console.log(`📋 Google Calendar List Events - Calendar: ${calendarId}`);
        return [];
      },
    };
  }
  /**
   * Configura Google Calendar
   */
  async configureCalendar(config) {
    try {
      const authResult = await this.googleClient.authenticate(config);
      this.calendarConfig = {
        ...config,
        accessToken: authResult.accessToken,
        refreshToken: authResult.refreshToken,
        expiresAt: authResult.expiresAt,
      };
      console.log(`✅ Google Calendar Configured - Calendar ID: ${config.calendarId}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Google Calendar Configuration Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Configuration failed',
      };
    }
  }
  /**
   * Crea evento Google Calendar
   */
  async createEvent(request) {
    if (!this.calendarConfig) {
      throw new Error('Google Calendar not configured');
    }
    const endTime = new Date(request.when.getTime() + 60 * 60 * 1000); // 1 ora di default
    // Organizzatore
    const organizer = {
      email: 'noreply@urbanova.com',
      displayName: 'Urbanova',
      self: true,
    };
    // Partecipanti
    const attendees = request.participants.map(participant => ({
      email: participant.email,
      displayName: participant.name,
      responseStatus: 'needsAction',
      organizer: participant.role === 'agent',
    }));
    // Crea evento Google Calendar
    const googleEvent = {
      id: `google_event_${Date.now()}`,
      appointmentId: request.appointmentId,
      summary: this.getEventSummary(request.type),
      description: `Appuntamento Urbanova - ${request.type}`,
      location: request.location.address || request.location.virtualUrl || 'Da definire',
      start: {
        dateTime: request.when.toISOString(),
        timeZone: 'Europe/Rome',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'Europe/Rome',
      },
      organizer,
      attendees,
      status: 'confirmed',
      transparency: 'opaque',
      visibility: 'private',
      reminders: {
        useDefault: false,
        overrides: [
          {
            method: 'email',
            minutes: 1440, // 24 ore prima
          },
          {
            method: 'popup',
            minutes: 60, // 1 ora prima
          },
        ],
      },
      created: new Date(),
      updated: new Date(),
      htmlLink: '',
      hangoutLink: request.location.type === 'virtual' ? request.location.virtualUrl : null,
    };
    // Invia a Google Calendar
    const googleResult = await this.googleClient.createEvent(googleEvent);
    googleEvent.id = googleResult.id;
    googleEvent.htmlLink = googleResult.htmlLink;
    googleEvent.created = googleResult.created;
    googleEvent.updated = googleResult.updated;
    this.googleEvents.set(googleEvent.id, googleEvent);
    console.log(`✅ Google Event Created - ID: ${googleEvent.id}, Summary: ${googleEvent.summary}`);
    return googleEvent;
  }
  /**
   * Aggiorna evento Google Calendar
   */
  async updateEvent(eventId, updates) {
    const googleEvent = this.googleEvents.get(eventId);
    if (!googleEvent) {
      throw new Error(`Google Event ${eventId} not found`);
    }
    // Aggiorna campi
    if (updates.summary) googleEvent.summary = updates.summary;
    if (updates.description) googleEvent.description = updates.description;
    if (updates.location) googleEvent.location = updates.location;
    if (updates.start) googleEvent.start.dateTime = updates.start.toISOString();
    if (updates.end) googleEvent.end.dateTime = updates.end.toISOString();
    if (updates.attendees) googleEvent.attendees = updates.attendees;
    googleEvent.updated = new Date();
    // Invia aggiornamento a Google Calendar
    const googleResult = await this.googleClient.updateEvent(eventId, googleEvent);
    googleEvent.updated = googleResult.updated;
    console.log(`🔄 Google Event Updated - ID: ${eventId}`);
    return googleEvent;
  }
  /**
   * Cancella evento Google Calendar
   */
  async deleteEvent(eventId) {
    const googleEvent = this.googleEvents.get(eventId);
    if (!googleEvent) {
      return false;
    }
    // Cancella da Google Calendar
    await this.googleClient.deleteEvent(eventId);
    // Rimuovi da cache locale
    this.googleEvents.delete(eventId);
    console.log(`🗑️ Google Event Deleted - ID: ${eventId}`);
    return true;
  }
  /**
   * Ottieni evento Google Calendar
   */
  async getEvent(eventId) {
    return this.googleEvents.get(eventId) || null;
  }
  /**
   * Lista eventi Google Calendar
   */
  async listEvents(filters = {}) {
    let events = Array.from(this.googleEvents.values());
    if (filters.buyerId) {
      // Filtra per buyer (attraverso appointmentId)
      events = events.filter(event => event.appointmentId?.includes(filters.buyerId));
    }
    if (filters.timeMin) {
      events = events.filter(event => new Date(event.start.dateTime) >= filters.timeMin);
    }
    if (filters.timeMax) {
      events = events.filter(event => new Date(event.start.dateTime) <= filters.timeMax);
    }
    return events.sort(
      (a, b) => new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime()
    );
  }
  /**
   * Sincronizza con Google Calendar
   */
  async syncWithGoogleCalendar() {
    if (!this.calendarConfig) {
      throw new Error('Google Calendar not configured');
    }
    const results = {
      created: 0,
      updated: 0,
      deleted: 0,
      errors: [],
    };
    try {
      // Simula sincronizzazione
      const now = new Date();
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const googleEvents = await this.googleClient.listEvents(
        this.calendarConfig.calendarId,
        now,
        oneWeekFromNow
      );
      // Confronta con eventi locali
      const localEvents = Array.from(this.googleEvents.values());
      for (const localEvent of localEvents) {
        const googleEvent = googleEvents.find(ge => ge.id === localEvent.id);
        if (!googleEvent) {
          // Evento locale non esiste su Google, crealo
          try {
            await this.googleClient.createEvent(localEvent);
            results.created++;
          } catch (error) {
            results.errors.push(`Failed to create event ${localEvent.id}: ${error}`);
          }
        } else {
          // Evento esiste, controlla se aggiornare
          if (googleEvent.updated < localEvent.updated) {
            try {
              await this.googleClient.updateEvent(localEvent.id, localEvent);
              results.updated++;
            } catch (error) {
              results.errors.push(`Failed to update event ${localEvent.id}: ${error}`);
            }
          }
        }
      }
      console.log(
        `🔄 Google Calendar Sync - Created: ${results.created}, Updated: ${results.updated}, Errors: ${results.errors.length}`
      );
    } catch (error) {
      results.errors.push(
        `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
    return results;
  }
  /**
   * Gestisci conflitti calendario
   */
  async resolveConflicts(events) {
    const conflicts = [];
    let resolved = 0;
    for (const event of events) {
      const overlappingEvents = await this.findOverlappingEvents(event);
      if (overlappingEvents.length > 0) {
        conflicts.push(event);
        // Risolvi conflitto (es. sposta evento)
        const resolvedEvent = await this.resolveConflict(event, overlappingEvents);
        if (resolvedEvent) {
          resolved++;
        }
      }
    }
    console.log(`⚔️ Calendar Conflicts - Resolved: ${resolved}, Conflicts: ${conflicts.length}`);
    return { resolved, conflicts };
  }
  /**
   * Trova eventi sovrapposti
   */
  async findOverlappingEvents(event) {
    const eventStart = new Date(event.start.dateTime);
    const eventEnd = new Date(event.end.dateTime);
    const allEvents = Array.from(this.googleEvents.values());
    return allEvents.filter(otherEvent => {
      if (otherEvent.id === event.id) return false;
      const otherStart = new Date(otherEvent.start.dateTime);
      const otherEnd = new Date(otherEvent.end.dateTime);
      return eventStart < otherEnd && eventEnd > otherStart;
    });
  }
  /**
   * Risolvi conflitto
   */
  async resolveConflict(event, conflicts) {
    // Strategia semplice: sposta evento di 1 ora
    const newStart = new Date(event.start.dateTime);
    newStart.setHours(newStart.getHours() + 1);
    const newEnd = new Date(event.end.dateTime);
    newEnd.setHours(newEnd.getHours() + 1);
    const resolvedEvent = {
      ...event,
      start: {
        dateTime: newStart.toISOString(),
        timeZone: event.start.timeZone,
      },
      end: {
        dateTime: newEnd.toISOString(),
        timeZone: event.end.timeZone,
      },
      updated: new Date(),
    };
    // Aggiorna evento
    await this.updateEvent(event.id, {
      start: newStart,
      end: newEnd,
    });
    return resolvedEvent;
  }
  /**
   * Ottieni summary evento
   */
  getEventSummary(type) {
    switch (type) {
      case 'fitting':
        return 'Finiture Appartamento - Urbanova';
      case 'visit':
        return 'Visita Appartamento - Urbanova';
      case 'consultation':
        return 'Consulenza - Urbanova';
      default:
        return 'Appuntamento Urbanova';
    }
  }
  /**
   * Controlla configurazione
   */
  async isConfigured() {
    return this.calendarConfig !== null;
  }
  /**
   * Ottieni configurazione
   */
  async getConfiguration() {
    return this.calendarConfig;
  }
  /**
   * Disconnetti Google Calendar
   */
  async disconnect() {
    this.calendarConfig = null;
    this.googleEvents.clear();
    console.log(`🔌 Google Calendar Disconnected`);
  }
  /**
   * Statistiche Google Calendar
   */
  async getGoogleCalendarStats() {
    const events = Array.from(this.googleEvents.values());
    const now = new Date();
    const upcomingEvents = events.filter(event => new Date(event.start.dateTime) > now);
    const pastEvents = events.filter(event => new Date(event.start.dateTime) <= now);
    // Conta conflitti
    let conflicts = 0;
    for (const event of events) {
      const overlapping = await this.findOverlappingEvents(event);
      if (overlapping.length > 0) {
        conflicts++;
      }
    }
    return {
      totalEvents: events.length,
      upcomingEvents: upcomingEvents.length,
      pastEvents: pastEvents.length,
      conflicts,
    };
  }
}
exports.GoogleCalendarService = GoogleCalendarService;
//# sourceMappingURL=googleCalendarService.js.map
