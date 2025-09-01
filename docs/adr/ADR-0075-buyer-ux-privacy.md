# ADR-0075: Buyer UX & Privacy - Esperienza Utente e Privacy Acquirente

## Status

Accepted

## Context

Il sistema necessita di un **Buyer Concierge** che gestisca l'esperienza dell'acquirente mantenendo la massima privacy e sicurezza. Il sistema deve gestire:

- **KYC (Know Your Customer)** con upload documenti
- **Appuntamenti** per finiture e visite
- **Reminder** per pagamenti e scadenze
- **Comunicazioni** via WhatsApp/Email

Tutti i dati personali devono essere gestiti con privacy by design e retention configurabile.

## Decision

Implementare un sistema **Buyer Concierge** che:

### 1. **PII (Personally Identifiable Information) Minimale**

- **Dati essenziali**: Nome, email, telefono, ID progetto
- **Dati opzionali**: Preferenze, note, documenti
- **Pseudonimizzazione**: ID univoci per tracking interno
- **Consent management**: Gestione consensi espliciti

### 2. **JWT Links Sicuri**

- **Temporary tokens**: Link temporanei per upload/accesso
- **Scadenza automatica**: Token scadono dopo uso o tempo
- **One-time use**: Link utilizzabili una sola volta
- **Audit trail**: Log completo accessi e azioni

### 3. **Retention Configurabile**

- **Data lifecycle**: Politiche retention automatiche
- **Consent-based**: Retention basata su consensi
- **Project-based**: Retention legata al progetto
- **GDPR compliance**: Diritto all'oblio implementato

### 4. **Upload Sicuri**

- **Doc Hunter integration**: Upload diretti a Doc Hunter
- **Encryption**: Crittografia end-to-end
- **Virus scanning**: Scansione automatica malware
- **Access control**: Controllo accessi granulare

## Consequences

### Positive

- ✅ **Privacy by design** integrata nel sistema
- ✅ **GDPR compliance** completa
- ✅ **User experience** fluida e sicura
- ✅ **Audit trail** completo per compliance
- ✅ **Retention automatica** configurabile

### Negative

- ⚠️ **Complessità** nella gestione consensi
- ⚠️ **Overhead** per audit e retention
- ⚠️ **User friction** per consensi espliciti

### Neutral

- 🔄 **Evoluzione continua** delle policy privacy
- 🔄 **Adattamento** alle nuove normative

## Implementation

### Phase 1: PII Management

```typescript
interface BuyerPII {
  // Dati essenziali (sempre richiesti)
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  projectId: string;

  // Dati opzionali (consent-based)
  preferences?: BuyerPreferences;
  notes?: string;
  documents?: BuyerDocument[];

  // Metadata privacy
  consentGiven: boolean;
  consentDate: Date;
  retentionPolicy: RetentionPolicy;
  dataSubjectRights: DataSubjectRights;
}

interface RetentionPolicy {
  retentionPeriod: number; // giorni
  autoDelete: boolean;
  projectBased: boolean;
  consentBased: boolean;
}
```

### Phase 2: JWT Links

```typescript
interface BuyerJWTLink {
  id: string;
  buyerId: string;
  projectId: string;
  purpose: 'upload' | 'appointment' | 'payment' | 'access';
  token: string;
  expiresAt: Date;
  used: boolean;
  usedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
}

class BuyerJWTService {
  generateUploadLink(buyerId: string, documentType: string): BuyerJWTLink {
    // Genera link temporaneo per upload
  }

  validateToken(token: string): boolean {
    // Valida token e marca come usato
  }
}
```

### Phase 3: Retention Management

```typescript
class BuyerRetentionService {
  async applyRetentionPolicy(buyerId: string): Promise<void> {
    // Applica policy retention automatica
  }

  async handleDataSubjectRequest(buyerId: string, request: DataSubjectRequest): Promise<void> {
    // Gestisce richieste GDPR (accesso, cancellazione, portabilità)
  }

  async anonymizeData(buyerId: string): Promise<void> {
    // Anonimizza dati per diritto all'oblio
  }
}
```

### Phase 4: Upload Security

```typescript
class BuyerUploadService {
  async uploadDocument(buyerId: string, file: File, documentType: string): Promise<UploadResult> {
    // 1. Valida file (virus scan)
    // 2. Crittografa contenuto
    // 3. Upload a Doc Hunter
    // 4. Aggiorna audit trail
  }

  async validateDocument(document: BuyerDocument): Promise<ValidationResult> {
    // Valida documento con Doc Hunter
  }
}
```

## References

- [ADR-0070: Auto WBS](./ADR-0070-auto-wbs.md)
- [ADR-0071: Re-Plan](./ADR-0071-re-plan.md)
- [ADR-0068: Doc Hunter Integration](./ADR-0068-doc-hunter.md)
- [GDPR Compliance Guidelines](https://gdpr.eu/)
