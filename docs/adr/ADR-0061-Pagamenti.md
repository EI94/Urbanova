# ADR-0061: Sistema Pagamenti

## Status

DRAFT

## Context

Il sistema SAL richiede un meccanismo di pagamento sicuro e tracciabile per completare il flusso di approvazione.

## Decision

Integrare Stripe in modalità test per gestire i pagamenti dei SAL, con validazione delle certificazioni tramite Doc Hunter.

## Consequences

### Integrazione Stripe

- **Modalità Test**: Nessun addebito reale, solo simulazione
- **PaymentIntent**: Creazione automatica per ogni SAL approvato
- **Receipt URL**: Tracciamento completo per audit
- **Webhook**: Gestione eventi di pagamento

### Validazioni Pre-Pagamento

- **Doc Hunter**: Verifica certificazioni vendor (DURC, visure, assicurazioni)
- **Stato SAL**: Solo SAL in stato READY_TO_PAY possono essere pagati
- **Firme**: Entrambe le parti devono aver firmato

### Sicurezza

- **API Keys**: Gestione sicura delle chiavi Stripe
- **Webhook Signature**: Verifica autenticità delle notifiche
- **Audit Trail**: Log completo di tutte le operazioni

### Storage

- **PDF Ricevuta**: Salvataggio su Google Cloud Storage
- **Metadati**: Tracciamento URL ricevuta e stato pagamento
- **Backup**: Redundanza per documenti critici

## Implementation

- Service `stripeService.ts` per integrazione
- Middleware di validazione pre-pagamento
- Webhook handler per aggiornamenti automatici
- GCS integration per storage PDF
- Audit logging per compliance
