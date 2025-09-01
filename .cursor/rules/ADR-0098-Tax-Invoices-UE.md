# ADR-0098: Tax & Invoices (UE)

**Status**: Accepted  
**Date**: 2024-12-31  
**Context**: Gestione tassazione UE e fatturazione automatica.

## Decision

### Stripe Tax

- Abilitato per calcolo automatico IVA
- VAT ID raccolta obbligatoria per business customers
- Fatture Stripe hosted scaricabili
- Valuta EUR per tutti i piani
- Indirizzo legale richiesto per compliance

### Tax settings

- **IT**: 22% IVA standard
- **EU**: Reverse charge per B2B
- **Resto mondo**: No IVA

## Consequences

### Positive

- Compliance fiscale automatica
- Fatture professionali
- Supporto internazionale
- Riduzione errori manuali

### Negative

- Complessità configurazione
- Necessità di validazione VAT ID
- Overhead per compliance

## Implementation Notes

### Stripe Configuration

```typescript
// Stripe Tax settings
const taxSettings = {
  enabled: true,
  automatic_tax: {
    enabled: true,
  },
  tax_behavior: 'exclusive',
  currency: 'eur',
};
```

### VAT ID Validation

```typescript
async function validateVATID(vatId: string, country: string) {
  // EU VAT ID format validation
  const vatRegex = /^[A-Z]{2}[0-9A-Z]+$/;
  if (!vatRegex.test(vatId)) {
    throw new Error('Invalid VAT ID format');
  }

  // Stripe Tax validation
  const taxId = await stripe.taxIds.create({
    customer: customerId,
    type: 'eu_vat',
    value: vatId,
  });

  return taxId.verification.status === 'verified';
}
```

### Invoice Generation

```typescript
async function createInvoice(subscriptionId: string) {
  const invoice = await stripe.invoices.create({
    customer: customerId,
    subscription: subscriptionId,
    collection_method: 'charge_automatically',
    days_until_due: 30,
    automatic_tax: {
      enabled: true,
    },
  });

  return invoice;
}
```

### Tax Rates per Paese

```typescript
const taxRates = {
  IT: 0.22, // Italia 22%
  DE: 0.19, // Germania 19%
  FR: 0.2, // Francia 20%
  ES: 0.21, // Spagna 21%
  NL: 0.21, // Olanda 21%
  // ... altri paesi UE
};
```

### Compliance Requirements

- **B2B**: Reverse charge se VAT ID valido
- **B2C**: IVA applicata normalmente
- **Extra-UE**: No IVA
- **Documentazione**: Fatture con breakdown IVA
