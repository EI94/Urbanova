import { GoogleCalendarConfig, GoogleEvent, GoogleAttendee, AppointmentLocation, AppointmentParticipant } from '@urbanova/types';
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
export declare class GoogleCalendarService {
    private googleEvents;
    private calendarConfig;
    private googleClient;
    constructor();
    /**
     * Inizializza Google client
     */
    private initializeGoogleClient;
    /**
     * Configura Google Calendar
     */
    configureCalendar(config: GoogleCalendarConfig): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Crea evento Google Calendar
     */
    createEvent(request: {
        appointmentId: string;
        buyerId: string;
        when: Date;
        location: AppointmentLocation;
        type: string;
        participants: AppointmentParticipant[];
    }): Promise<GoogleEvent>;
    /**
     * Aggiorna evento Google Calendar
     */
    updateEvent(eventId: string, updates: {
        summary?: string;
        description?: string;
        location?: string;
        start?: Date;
        end?: Date;
        attendees?: GoogleAttendee[];
    }): Promise<GoogleEvent>;
    /**
     * Cancella evento Google Calendar
     */
    deleteEvent(eventId: string): Promise<boolean>;
    /**
     * Ottieni evento Google Calendar
     */
    getEvent(eventId: string): Promise<GoogleEvent | null>;
    /**
     * Lista eventi Google Calendar
     */
    listEvents(filters?: {
        calendarId?: string;
        timeMin?: Date;
        timeMax?: Date;
        buyerId?: string;
    }): Promise<GoogleEvent[]>;
    /**
     * Sincronizza con Google Calendar
     */
    syncWithGoogleCalendar(): Promise<{
        created: number;
        updated: number;
        deleted: number;
        errors: string[];
    }>;
    /**
     * Gestisci conflitti calendario
     */
    resolveConflicts(events: GoogleEvent[]): Promise<{
        resolved: number;
        conflicts: GoogleEvent[];
    }>;
    /**
     * Trova eventi sovrapposti
     */
    private findOverlappingEvents;
    /**
     * Risolvi conflitto
     */
    private resolveConflict;
    /**
     * Ottieni summary evento
     */
    private getEventSummary;
    /**
     * Controlla configurazione
     */
    isConfigured(): Promise<boolean>;
    /**
     * Ottieni configurazione
     */
    getConfiguration(): Promise<GoogleCalendarConfig | null>;
    /**
     * Disconnetti Google Calendar
     */
    disconnect(): Promise<void>;
    /**
     * Statistiche Google Calendar
     */
    getGoogleCalendarStats(): Promise<{
        totalEvents: number;
        upcomingEvents: number;
        pastEvents: number;
        conflicts: number;
    }>;
}
//# sourceMappingURL=googleCalendarService.d.ts.map