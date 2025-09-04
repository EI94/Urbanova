import {
  Appointment,
  AppointmentLocation,
  AppointmentParticipant,
} from '@urbanova/types';

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

export class AppointmentService {
  private appointments: Map<string, Appointment> = new Map();
  private participants: Map<string, AppointmentParticipant[]> = new Map();

  /**
   * Crea appuntamento
   */
  async createAppointment(request: {
    buyerId: string;
    when: Date;
    location: AppointmentLocation;
    type: 'fitting' | 'visit' | 'consultation' | 'payment' | 'delivery';
    participants: AppointmentParticipant[];
    status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
    createdBy?: string;
    metadata?: any;
  }): Promise<Appointment> {
    const appointment: Appointment = {
      id: `apt_${Date.now()}`,
      buyerId: request.buyerId,
      projectId: 'project_123', // Default project ID
      title: `Appuntamento ${request.type}`,
      description: `Appuntamento di tipo ${request.type}`,
      startTime: request.when,
      endTime: new Date(request.when.getTime() + 60 * 60 * 1000), // 1 ora dopo
      timezone: 'Europe/Rome',
      location: request.location,
      type: request.type,
      participants: request.participants,
      status: request.status || 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date(),

      reminders: [],

      attachments: [],
    };

    this.appointments.set(appointment.id, appointment);
    this.participants.set(appointment.id, request.participants);

    console.log(
      `📅 Appointment Created - ID: ${appointment.id}, Type: ${request.type}, When: ${request.when.toISOString()}`
    );

    return appointment;
  }

  /**
   * Ottieni appuntamento
   */
  async getAppointment(appointmentId: string): Promise<Appointment | null> {
    return this.appointments.get(appointmentId) || null;
  }

  /**
   * Lista appuntamenti con filtri
   */
  async listAppointments(
    filters: {
      buyerId?: string;
      status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
      fromDate?: Date;
      toDate?: Date;
      type?: 'fitting' | 'visit' | 'consultation' | 'payment' | 'delivery';
    } = {}
  ): Promise<Appointment[]> {
    let appointments = Array.from(this.appointments.values());

    if (filters.buyerId) {
      appointments = appointments.filter(apt => apt.buyerId === filters.buyerId);
    }

    if (filters.status) {
      appointments = appointments.filter(apt => apt.status === filters.status);
    }

    if (filters.fromDate) {
      appointments = appointments.filter(apt => apt.startTime >= filters.fromDate!);
    }

    if (filters.toDate) {
      appointments = appointments.filter(apt => apt.startTime <= filters.toDate!);
    }

    if (filters.type) {
      appointments = appointments.filter(apt => apt.type === filters.type);
    }

    return appointments.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  /**
   * Ottieni appuntamenti buyer
   */
  async getBuyerAppointments(buyerId: string): Promise<Appointment[]> {
    return this.listAppointments({ buyerId });
  }

  /**
   * Aggiorna appuntamento
   */
  async updateAppointment(
    appointmentId: string,
    updates: {
      when?: Date;
      location?: AppointmentLocation;
      type?: 'fitting' | 'visit' | 'consultation' | 'payment' | 'delivery';
      status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
      participants?: AppointmentParticipant[];
      notes?: string;
      metadata?: any;
    }
  ): Promise<Appointment> {
    const appointment = this.appointments.get(appointmentId);
    if (!appointment) {
      throw new Error(`Appointment ${appointmentId} not found`);
    }

    // Aggiorna campi
    if (updates.when) appointment.startTime = updates.when;
    if (updates.location) appointment.location = updates.location;
    if (updates.type) appointment.type = updates.type;
    if (updates.status) appointment.status = updates.status;
    if (updates.notes) appointment.notes = updates.notes;
    // Metadata handling removed - not part of Appointment type

    // Aggiorna partecipanti se forniti
    if (updates.participants) {
      appointment.participants = updates.participants;
      this.participants.set(appointmentId, updates.participants);
    }

    appointment.updatedAt = new Date();

    console.log(`🔄 Appointment Updated - ID: ${appointmentId}`);

    return appointment;
  }

  /**
   * Cancella appuntamento
   */
  async cancelAppointment(appointmentId: string, reason?: string): Promise<Appointment> {
    const appointment = this.appointments.get(appointmentId);
    if (!appointment) {
      throw new Error(`Appointment ${appointmentId} not found`);
    }

    appointment.status = 'cancelled';
    appointment.updatedAt = new Date();
    // Metadata handling removed - not part of Appointment type

    console.log(
      `❌ Appointment Cancelled - ID: ${appointmentId}, Reason: ${reason || 'No reason provided'}`
    );

    return appointment;
  }

  /**
   * Conferma appuntamento
   */
  async confirmAppointment(appointmentId: string): Promise<Appointment> {
    const appointment = this.appointments.get(appointmentId);
    if (!appointment) {
      throw new Error(`Appointment ${appointmentId} not found`);
    }

    appointment.status = 'confirmed';
    appointment.updatedAt = new Date();
    // Metadata handling removed - not part of Appointment type

    console.log(`✅ Appointment Confirmed - ID: ${appointmentId}`);

    return appointment;
  }

  /**
   * Completa appuntamento
   */
  async completeAppointment(appointmentId: string, notes?: string): Promise<Appointment> {
    const appointment = this.appointments.get(appointmentId);
    if (!appointment) {
      throw new Error(`Appointment ${appointmentId} not found`);
    }

    appointment.status = 'completed';
    appointment.updatedAt = new Date();
    if (notes) appointment.notes = notes;
    // Metadata handling removed - not part of Appointment type

    console.log(`🏁 Appointment Completed - ID: ${appointmentId}`);

    return appointment;
  }

  /**
   * Aggiungi partecipante
   */
  async addParticipant(
    appointmentId: string,
    participant: AppointmentParticipant
  ): Promise<Appointment> {
    const appointment = this.appointments.get(appointmentId);
    if (!appointment) {
      throw new Error(`Appointment ${appointmentId} not found`);
    }

    appointment.participants.push(participant);
    appointment.updatedAt = new Date();

    // Aggiorna cache partecipanti
    const currentParticipants = this.participants.get(appointmentId) || [];
    currentParticipants.push(participant);
    this.participants.set(appointmentId, currentParticipants);

    console.log(`👤 Participant Added - Appointment: ${appointmentId}, Name: ${participant.name}`);

    return appointment;
  }

  /**
   * Rimuovi partecipante
   */
  async removeParticipant(appointmentId: string, participantEmail: string): Promise<Appointment> {
    const appointment = this.appointments.get(appointmentId);
    if (!appointment) {
      throw new Error(`Appointment ${appointmentId} not found`);
    }

    appointment.participants = appointment.participants.filter(p => p.email !== participantEmail);
    appointment.updatedAt = new Date();

    // Aggiorna cache partecipanti
    const currentParticipants = this.participants.get(appointmentId) || [];
    const updatedParticipants = currentParticipants.filter(p => p.email !== participantEmail);
    this.participants.set(appointmentId, updatedParticipants);

    console.log(
      `👤 Participant Removed - Appointment: ${appointmentId}, Email: ${participantEmail}`
    );

    return appointment;
  }

  /**
   * Aggiungi reminder
   */
  async addReminder(appointmentId: string, reminderId: string): Promise<Appointment> {
    const appointment = this.appointments.get(appointmentId);
    if (!appointment) {
      throw new Error(`Appointment ${appointmentId} not found`);
    }

    // Reminder handling simplified - just log the reminder ID
    console.log(`⏰ Reminder Added - Appointment: ${appointmentId}, Reminder: ${reminderId}`);
    appointment.updatedAt = new Date();

    return appointment;
  }

  /**
   * Aggiungi allegato
   */
  async addAttachment(
    appointmentId: string,
    attachment: {
      id: string;
      name: string;
      url: string;
      type: string;
      size: number;
    }
  ): Promise<Appointment> {
    const appointment = this.appointments.get(appointmentId);
    if (!appointment) {
      throw new Error(`Appointment ${appointmentId} not found`);
    }

    if (appointment.attachments) {
      appointment.attachments.push({
        id: attachment.id,
        filename: attachment.name,
        url: attachment.url,
        type: attachment.type,
      });
    }
    appointment.updatedAt = new Date();

    console.log(`📎 Attachment Added - Appointment: ${appointmentId}, File: ${attachment.name}`);

    return appointment;
  }

  /**
   * Aggiorna ICS file ID
   */
  async updateICSFileId(appointmentId: string, icsFileId: string): Promise<Appointment> {
    const appointment = this.appointments.get(appointmentId);
    if (!appointment) {
      throw new Error(`Appointment ${appointmentId} not found`);
    }

    // ICS File ID handling removed - not part of Appointment type
    appointment.updatedAt = new Date();

    console.log(`📄 ICS File Updated - Appointment: ${appointmentId}, ICS: ${icsFileId}`);

    return appointment;
  }

  /**
   * Aggiorna Google Event ID
   */
  async updateGoogleEventId(appointmentId: string, googleEventId: string): Promise<Appointment> {
    const appointment = this.appointments.get(appointmentId);
    if (!appointment) {
      throw new Error(`Appointment ${appointmentId} not found`);
    }

    appointment.googleEventId = googleEventId;
    appointment.updatedAt = new Date();

    console.log(`📅 Google Event Updated - Appointment: ${appointmentId}, Event: ${googleEventId}`);

    return appointment;
  }

  /**
   * Ottieni appuntamenti prossimi
   */
  async getUpcomingAppointments(buyerId: string, days: number = 7): Promise<Appointment[]> {
    const fromDate = new Date();
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + days);

    return this.listAppointments({
      buyerId,
      status: 'scheduled',
      fromDate,
      toDate,
    });
  }

  /**
   * Ottieni appuntamenti passati
   */
  async getPastAppointments(buyerId: string, days: number = 30): Promise<Appointment[]> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    const toDate = new Date();

    return this.listAppointments({
      buyerId,
      status: 'completed',
      fromDate,
      toDate,
    });
  }

  /**
   * Statistiche appuntamenti
   */
  async getAppointmentStats(buyerId: string): Promise<{
    total: number;
    scheduled: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    upcoming: number;
  }> {
    const appointments = await this.getBuyerAppointments(buyerId);
    const now = new Date();

    const stats = {
      total: appointments.length,
      scheduled: appointments.filter(apt => apt.status === 'scheduled').length,
      confirmed: appointments.filter(apt => apt.status === 'confirmed').length,
      completed: appointments.filter(apt => apt.status === 'completed').length,
      cancelled: appointments.filter(apt => apt.status === 'cancelled').length,
      upcoming: appointments.filter(apt => apt.status === 'scheduled' && apt.startTime > now).length,
    };

    return stats;
  }

  /**
   * Elimina appuntamento
   */
  async deleteAppointment(appointmentId: string): Promise<boolean> {
    const appointment = this.appointments.get(appointmentId);
    if (!appointment) {
      return false;
    }

    this.appointments.delete(appointmentId);
    this.participants.delete(appointmentId);

    console.log(`🗑️ Appointment Deleted - ID: ${appointmentId}`);

    return true;
  }
}
