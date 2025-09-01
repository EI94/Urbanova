# ADR-0076: Calendario - Sistema Appuntamenti e ICS

## Status

Accepted

## Context

Il sistema Buyer Concierge necessita di un sistema di **gestione appuntamenti** completo che permetta di:

- **Schedulare appuntamenti** per finiture, visite, consulenze
- **Generare file ICS** scaricabili e importabili
- **Integrare Google Calendar** opzionalmente
- **Gestire reminder** automatici via WhatsApp/Email
- **Sincronizzare** appuntamenti tra sistemi

Il sistema deve essere flessibile e supportare sia appuntamenti semplici che complessi con più partecipanti.

## Decision

Implementare un sistema **Calendario** che:

### 1. **ICS File Generation Reale**

- **RFC 5545 compliance**: File ICS standard
- **Multi-event support**: Più eventi in un file
- **Attachments**: Allegati documenti correlati
- **Recurring events**: Eventi ricorrenti
- **Timezone support**: Gestione fusi orari

### 2. **Google Calendar Integration Opzionale**

- **Flag configurabile**: Attivazione/disattivazione
- **OAuth 2.0**: Autenticazione sicura
- **Bidirectional sync**: Sincronizzazione bidirezionale
- **Conflict resolution**: Gestione conflitti
- **Selective sync**: Sincronizzazione selettiva

### 3. **Appointment Management**

- **CRUD operations**: Creazione, lettura, aggiornamento, cancellazione
- **Status tracking**: Stato appuntamento (scheduled, confirmed, completed, cancelled)
- **Participant management**: Gestione partecipanti
- **Location management**: Gestione luoghi
- **Notes and attachments**: Note e allegati

### 4. **Reminder System**

- **Multi-channel**: WhatsApp, Email, SMS
- **Template-based**: Template personalizzabili
- **Scheduling**: Pianificazione reminder
- **Confirmation**: Conferma ricezione
- **Escalation**: Escalation automatica

## Consequences

### Positive

- ✅ **Standard compliance** con RFC 5545
- ✅ **Interoperabilità** con tutti i calendari
- ✅ **Flexibility** con integrazione opzionale
- ✅ **User experience** fluida
- ✅ **Automation** completa reminder

### Negative

- ⚠️ **Complessità** nella gestione sincronizzazione
- ⚠️ **Dependency** su servizi esterni (Google Calendar)
- ⚠️ **Data consistency** tra sistemi

### Neutral

- 🔄 **Evoluzione continua** delle integrazioni
- 🔄 **Adattamento** ai nuovi standard

## Implementation

### Phase 1: ICS Generation

```typescript
interface ICSFile {
  id: string;
  filename: string;
  content: string;
  events: ICSEvent[];
  generatedAt: Date;
  expiresAt?: Date;
}

interface ICSEvent {
  uid: string;
  summary: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  timezone: string;
  attendees: ICSAttendee[];
  organizer: ICSOrganizer;
  attachments?: ICSAttachment[];
  recurrence?: ICSRecurrence;
}

class ICSGenerator {
  generateICSFile(events: Appointment[]): ICSFile {
    // Genera file ICS conforme RFC 5545
  }

  addEventToICS(icsFile: ICSFile, event: Appointment): ICSFile {
    // Aggiunge evento a file ICS esistente
  }

  validateICS(icsContent: string): boolean {
    // Valida formato ICS
  }
}
```

### Phase 2: Google Calendar Integration

```typescript
interface GoogleCalendarConfig {
  enabled: boolean;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  syncDirection: 'bidirectional' | 'to_google' | 'from_google';
  conflictResolution: 'local_wins' | 'remote_wins' | 'manual';
}

class GoogleCalendarService {
  async authenticate(userId: string): Promise<GoogleAuthResult> {
    // Autenticazione OAuth 2.0
  }

  async syncAppointments(buyerId: string): Promise<SyncResult> {
    // Sincronizzazione appuntamenti
  }

  async createGoogleEvent(appointment: Appointment): Promise<GoogleEvent> {
    // Crea evento su Google Calendar
  }

  async handleWebhook(payload: GoogleWebhookPayload): Promise<void> {
    // Gestisce webhook da Google Calendar
  }
}
```

### Phase 3: Appointment Management

```typescript
interface Appointment {
  id: string;
  buyerId: string;
  projectId: string;
  type: 'fitting' | 'visit' | 'consultation' | 'payment' | 'delivery';
  title: string;
  description: string;
  location: AppointmentLocation;
  startTime: Date;
  endTime: Date;
  timezone: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  participants: AppointmentParticipant[];
  reminders: AppointmentReminder[];
  notes?: string;
  attachments?: AppointmentAttachment[];
  icsFile?: ICSFile;
  googleEventId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AppointmentLocation {
  type: 'physical' | 'virtual' | 'hybrid';
  address?: string;
  coordinates?: { lat: number; lng: number };
  virtualUrl?: string;
  instructions?: string;
}

class AppointmentService {
  async createAppointment(data: CreateAppointmentRequest): Promise<Appointment> {
    // Crea nuovo appuntamento
  }

  async updateAppointment(id: string, data: UpdateAppointmentRequest): Promise<Appointment> {
    // Aggiorna appuntamento
  }

  async cancelAppointment(id: string, reason: string): Promise<void> {
    // Cancella appuntamento
  }

  async generateICS(appointmentId: string): Promise<ICSFile> {
    // Genera file ICS per appuntamento
  }
}
```

### Phase 4: Reminder System

```typescript
interface AppointmentReminder {
  id: string;
  appointmentId: string;
  type: 'whatsapp' | 'email' | 'sms';
  template: string;
  scheduledAt: Date;
  sentAt?: Date;
  status: 'scheduled' | 'sent' | 'failed' | 'confirmed';
  recipient: string;
  message?: string;
  confirmationReceived?: boolean;
}

class ReminderService {
  async scheduleReminder(
    appointmentId: string,
    reminder: ReminderConfig
  ): Promise<AppointmentReminder> {
    // Pianifica reminder
  }

  async sendReminder(reminderId: string): Promise<ReminderResult> {
    // Invia reminder
  }

  async handleConfirmation(reminderId: string): Promise<void> {
    // Gestisce conferma ricezione
  }

  async escalateReminder(reminderId: string): Promise<void> {
    // Escalation automatica
  }
}
```

### Phase 5: Template System

```typescript
interface ReminderTemplate {
  id: string;
  name: string;
  type: 'whatsapp' | 'email' | 'sms';
  subject?: string;
  body: string;
  variables: string[];
  language: string;
  isActive: boolean;
}

class TemplateService {
  async renderTemplate(templateId: string, variables: Record<string, any>): Promise<string> {
    // Renderizza template con variabili
  }

  async sendTemplatedMessage(
    templateId: string,
    recipient: string,
    variables: Record<string, any>
  ): Promise<SendResult> {
    // Invia messaggio con template
  }
}
```

## References

- [ADR-0075: Buyer UX & Privacy](./ADR-0075-buyer-ux-privacy.md)
- [RFC 5545: iCalendar](https://tools.ietf.org/html/rfc5545)
- [Google Calendar API](https://developers.google.com/calendar)
- [Twilio WhatsApp API](https://www.twilio.com/whatsapp)
