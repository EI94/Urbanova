import {
  Appointment,
  AppointmentLocation,
  AppointmentParticipant,
  AppointmentStatus,
  AppointmentType,
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
    type: AppointmentType;
    participants: AppointmentParticipant[];
    status?: AppointmentStatus;
    createdBy?: string;
    metadata?: any;
  }): Promise<Appointment> {
    const appointment: Appointment = {
      id: `apt_${Date.now()}`,
      buyerId: request.buyerId,
      when: request.when,
      location: request.location,
      type: request.type,
      participants: request.participants,
      status: request.status || 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: request.createdBy || 'system',
      metadata: request.metadata || {},
      icsFileId: null,
      googleEventId: null,
      reminders: [],
      notes: null,
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
      status?: AppointmentStatus;
      fromDate?: Date;
      toDate?: Date;
      type?: AppointmentType;
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
      appointments = appointments.filter(apt => apt.when >= filters.fromDate!);
    }

    if (filters.toDate) {
      appointments = appointments.filter(apt => apt.when <= filters.toDate!);
    }

    if (filters.type) {
      appointments = appointments.filter(apt => apt.type === filters.type);
    }

    return appointments.sort((a, b) => a.when.getTime() - b.when.getTime());
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
      type?: AppointmentType;
      status?: AppointmentStatus;
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
    if (updates.when) appointment.when = updates.when;
    if (updates.location) appointment.location = updates.location;
    if (updates.type) appointment.type = updates.type;
    if (updates.status) appointment.status = updates.status;
    if (updates.notes) appointment.notes = updates.notes;
    if (updates.metadata) appointment.metadata = { ...appointment.metadata, ...updates.metadata };

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
    appointment.metadata = {
      ...appointment.metadata,
      cancellationReason: reason,
      cancelledAt: new Date(),
    };

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
    appointment.metadata = {
      ...appointment.metadata,
      confirmedAt: new Date(),
    };

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
    appointment.notes = notes;
    appointment.metadata = {
      ...appointment.metadata,
      completedAt: new Date(),
    };

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

    appointment.reminders.push(reminderId);
    appointment.updatedAt = new Date();

    console.log(`⏰ Reminder Added - Appointment: ${appointmentId}, Reminder: ${reminderId}`);

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

    appointment.attachments.push({
      ...attachment,
      addedAt: new Date(),
    });
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

    appointment.icsFileId = icsFileId;
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
      upcoming: appointments.filter(apt => apt.status === 'scheduled' && apt.when > now).length,
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
