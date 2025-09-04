import { Appointment, AppointmentLocation, AppointmentParticipant } from '@urbanova/types';
/**
 * Appointment Service
 *
 * Gestione completa appuntamenti:
 * - Creazione appuntamenti
 * - Gestione partecipanti
 * - Tracking status
 * - Località fisiche/virtuali
 * - Integrazione calendario
 */
export declare class AppointmentService {
    private appointments;
    private participants;
    /**
     * Crea appuntamento
     */
    createAppointment(request: {
        buyerId: string;
        when: Date;
        location: AppointmentLocation;
        type: 'fitting' | 'visit' | 'consultation' | 'payment' | 'delivery';
        participants: AppointmentParticipant[];
        status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
        createdBy?: string;
        metadata?: any;
    }): Promise<Appointment>;
    /**
     * Ottieni appuntamento
     */
    getAppointment(appointmentId: string): Promise<Appointment | null>;
    /**
     * Lista appuntamenti con filtri
     */
    listAppointments(filters?: {
        buyerId?: string;
        status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
        fromDate?: Date;
        toDate?: Date;
        type?: 'fitting' | 'visit' | 'consultation' | 'payment' | 'delivery';
    }): Promise<Appointment[]>;
    /**
     * Ottieni appuntamenti buyer
     */
    getBuyerAppointments(buyerId: string): Promise<Appointment[]>;
    /**
     * Aggiorna appuntamento
     */
    updateAppointment(appointmentId: string, updates: {
        when?: Date;
        location?: AppointmentLocation;
        type?: 'fitting' | 'visit' | 'consultation' | 'payment' | 'delivery';
        status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
        participants?: AppointmentParticipant[];
        notes?: string;
        metadata?: any;
    }): Promise<Appointment>;
    /**
     * Cancella appuntamento
     */
    cancelAppointment(appointmentId: string, reason?: string): Promise<Appointment>;
    /**
     * Conferma appuntamento
     */
    confirmAppointment(appointmentId: string): Promise<Appointment>;
    /**
     * Completa appuntamento
     */
    completeAppointment(appointmentId: string, notes?: string): Promise<Appointment>;
    /**
     * Aggiungi partecipante
     */
    addParticipant(appointmentId: string, participant: AppointmentParticipant): Promise<Appointment>;
    /**
     * Rimuovi partecipante
     */
    removeParticipant(appointmentId: string, participantEmail: string): Promise<Appointment>;
    /**
     * Aggiungi reminder
     */
    addReminder(appointmentId: string, reminderId: string): Promise<Appointment>;
    /**
     * Aggiungi allegato
     */
    addAttachment(appointmentId: string, attachment: {
        id: string;
        name: string;
        url: string;
        type: string;
        size: number;
    }): Promise<Appointment>;
    /**
     * Aggiorna ICS file ID
     */
    updateICSFileId(appointmentId: string, icsFileId: string): Promise<Appointment>;
    /**
     * Aggiorna Google Event ID
     */
    updateGoogleEventId(appointmentId: string, googleEventId: string): Promise<Appointment>;
    /**
     * Ottieni appuntamenti prossimi
     */
    getUpcomingAppointments(buyerId: string, days?: number): Promise<Appointment[]>;
    /**
     * Ottieni appuntamenti passati
     */
    getPastAppointments(buyerId: string, days?: number): Promise<Appointment[]>;
    /**
     * Statistiche appuntamenti
     */
    getAppointmentStats(buyerId: string): Promise<{
        total: number;
        scheduled: number;
        confirmed: number;
        completed: number;
        cancelled: number;
        upcoming: number;
    }>;
    /**
     * Elimina appuntamento
     */
    deleteAppointment(appointmentId: string): Promise<boolean>;
}
//# sourceMappingURL=appointmentService.d.ts.map