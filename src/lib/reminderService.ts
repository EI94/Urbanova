import { addDays, addHours, addMinutes, isAfter, isBefore, startOfDay } from 'date-fns';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export interface ProjectReminder {
  id: string;
  projectId: string;
  projectName: string;
  userId: string;
  userEmail: string;
  reminderDate: Date;
  reminderTime: string; // "09:00", "14:30", etc.
  note: string;
  status: 'pending' | 'sent' | 'cancelled';
  createdAt: Date;
  sentAt?: Date;
}

export interface ReminderEmailData {
  projectName: string;
  reminderDate: string;
  reminderTime: string;
  note: string;
  projectLink: string;
  projectReport: string;
}

class ReminderService {
  private reminders: ProjectReminder[] = [];

  // Crea un nuovo reminder
  async createReminder(
    reminderData: Omit<ProjectReminder, 'id' | 'status' | 'createdAt'>
  ): Promise<ProjectReminder> {
    try {
      console.log('🔄 Creazione reminder...', reminderData);

      const reminder: ProjectReminder = {
        ...reminderData,
        id: this.generateId(),
        status: 'pending',
        createdAt: new Date(),
      };

      // Aggiungi alla lista locale (in produzione sarebbe nel database)
      this.reminders.push(reminder);

      // Programma l'invio della mail
      this.scheduleReminderEmail(reminder);

      console.log('✅ Reminder creato:', reminder);
      return reminder;
    } catch (error) {
      console.error('❌ Errore creazione reminder:', error);
      throw new Error('Impossibile creare il reminder');
    }
  }

  // Programma l'invio della mail del reminder
  private scheduleReminderEmail(reminder: ProjectReminder): void {
    try {
      const reminderDateTime = this.combineDateAndTime(
        reminder.reminderDate,
        reminder.reminderTime
      );
      const now = new Date();

      if (isBefore(reminderDateTime, now)) {
        console.warn('⚠️ Data reminder nel passato, invio immediato');
        this.sendReminderEmail(reminder);
        return;
      }

      const delayMs = reminderDateTime.getTime() - now.getTime();

      console.log(
        `⏰ Reminder programmato per ${reminderDateTime.toLocaleString('it-IT')} (tra ${Math.round(delayMs / 1000 / 60)} minuti)`
      );

      setTimeout(() => {
        this.sendReminderEmail(reminder);
      }, delayMs);
    } catch (error) {
      console.error('❌ Errore programmazione reminder:', error);
    }
  }

  // Combina data e ora per creare un DateTime completo
  private combineDateAndTime(date: Date, time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const combinedDate = new Date(date);
    combinedDate.setHours(hours, minutes, 0, 0);
    return combinedDate;
  }

  // Invia la mail del reminder
  private async sendReminderEmail(reminder: ProjectReminder): Promise<void> {
    try {
      console.log('📧 Invio mail reminder...', reminder.id);

      // Genera il report del progetto
      const projectReport = await this.generateProjectReport(reminder.projectId);

      // Prepara i dati per la mail
      const emailData: ReminderEmailData = {
        projectName: reminder.projectName,
        reminderDate: format(reminder.reminderDate, 'EEEE d MMMM yyyy', { locale: it }),
        reminderTime: reminder.reminderTime,
        note: reminder.note,
        projectLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/feasibility-analysis/${reminder.projectId}`,
        projectReport: projectReport,
      };

      // Invia la mail (qui integreremo con il servizio email esistente)
      await this.sendReminderEmailViaAPI(emailData, reminder.userEmail);

      // Aggiorna lo stato del reminder
      reminder.status = 'sent';
      reminder.sentAt = new Date();

      console.log('✅ Mail reminder inviata con successo');
    } catch (error) {
      console.error('❌ Errore invio mail reminder:', error);
      reminder.status = 'pending'; // Riprova più tardi
    }
  }

  // Genera un report sintetico del progetto
  private async generateProjectReport(projectId: string): Promise<string> {
    try {
      // In produzione, questo recupererebbe i dati reali dal database
      // Per ora restituiamo un template
      return `
📊 REPORT PROGETTO URBANOVA

🏗️ Dettagli Progetto:
• ID: ${projectId}
• Data Creazione: ${new Date().toLocaleDateString('it-IT')}

💰 Analisi Finanziaria:
• Costi Totali: [Calcolati dinamicamente]
• Ricavi Attesi: [Calcolati dinamicamente]
• Marginalità: [Calcolata dinamicamente]

📈 Raccomandazioni:
• Valutazione di fattibilità completata
• Analisi dettagliata disponibile nella dashboard
• Contatti e documenti aggiornati

🔗 Accedi al progetto completo per maggiori dettagli.
      `.trim();
    } catch (error) {
      console.error('❌ Errore generazione report:', error);
      return 'Report non disponibile al momento.';
    }
  }

  // Invia la mail del reminder tramite API
  private async sendReminderEmailViaAPI(
    emailData: ReminderEmailData,
    userEmail: string
  ): Promise<void> {
    try {
      const response = await fetch('/api/send-reminder-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailData,
          userEmail,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('✅ Mail reminder inviata tramite API');
    } catch (error) {
      console.error('❌ Errore invio mail tramite API:', error);
      throw error;
    }
  }

  // Ottieni tutti i reminder di un utente
  async getUserReminders(userId: string): Promise<ProjectReminder[]> {
    return this.reminders.filter(r => r.userId === userId);
  }

  // Ottieni tutti i reminder di un progetto
  async getProjectReminders(projectId: string): Promise<ProjectReminder[]> {
    return this.reminders.filter(r => r.projectId === projectId);
  }

  // Cancella un reminder
  async cancelReminder(reminderId: string): Promise<boolean> {
    try {
      const reminder = this.reminders.find(r => r.id === reminderId);
      if (reminder) {
        reminder.status = 'cancelled';
        console.log('✅ Reminder cancellato:', reminderId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Errore cancellazione reminder:', error);
      return false;
    }
  }

  // Genera un ID univoco
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  // Ottieni orari disponibili per i reminder (ogni 30 minuti)
  getAvailableTimes(): string[] {
    const times: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeString);
      }
    }
    return times;
  }

  // Ottieni date disponibili per i reminder (prossimi 30 giorni)
  getAvailableDates(): Date[] {
    const dates: Date[] = [];
    const today = startOfDay(new Date());

    for (let i = 0; i < 30; i++) {
      dates.push(addDays(today, i));
    }

    return dates;
  }
}

export const reminderService = new ReminderService();
