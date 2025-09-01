# ADR-0095: Pricing Model

**Status**: Accepted  
**Date**: 2024-12-31  
**Context**: Definire il modello di pricing per Urbanova con piani mensili e componenti a consumo.

## Decision

### Piani mensili seat-based

- **Starter**: €29/mese (1 seat) - 5 progetti, 1000 actions/mese
- **Pro**: €99/mese (5 seats) - 25 progetti, 10000 actions/mese
- **Business**: €299/mese (20 seats) - 100 progetti, 50000 actions/mese

### Componenti a consumo

- **OCR pagine**: €0.01/pagina
- **Feasibility runs**: €0.50/run
- **Scraper scans**: €0.10/scan
- **Doc requests**: €0.25/request
- **Messages WA**: €0.05/message

### Caratteristiche

- **Periodo prova**: 14 giorni gratuiti
- **Gestione abbonamenti**: Upgrade/downgrade pro-rata via Stripe
- **Valuta**: EUR
- **Tassazione**: Stripe Tax per IVA UE

## Consequences

### Positive

- Revenue prevedibile con componenti a consumo per scalabilità
- Trial period per conversione
- Pro-rata billing per flessibilità cliente
- Pricing trasparente e prevedibile

### Negative

- Complessità nella gestione dei limiti
- Necessità di monitoring usage real-time
- Overhead per metered billing

## Implementation Notes

### Stripe Price IDs

- `price_starter_monthly`: €29/mese
- `price_pro_monthly`: €99/mese
- `price_business_monthly`: €299/mese
- `price_metered_ocr`: €0.01/pagina
- `price_metered_feasibility`: €0.50/run
- `price_metered_scraper`: €0.10/scan
- `price_metered_doc_request`: €0.25/request
- `price_metered_wa_message`: €0.05/message

### Entitlements per piano

```typescript
const entitlements = {
  starter: {
    projectsMax: 5,
    usersMax: 1,
    actionsLimits: {
      'ocr.process': { soft: 500, hard: 1000 },
      'feasibility.run_bp': { soft: 50, hard: 100 },
      'land-scraper.scan_market': { soft: 200, hard: 500 },
      'doc-hunter.request': { soft: 100, hard: 200 },
      'messaging.send_wa': { soft: 500, hard: 1000 },
    },
  },
  pro: {
    projectsMax: 25,
    usersMax: 5,
    actionsLimits: {
      'ocr.process': { soft: 5000, hard: 10000 },
      'feasibility.run_bp': { soft: 500, hard: 1000 },
      'land-scraper.scan_market': { soft: 2000, hard: 5000 },
      'doc-hunter.request': { soft: 1000, hard: 2000 },
      'messaging.send_wa': { soft: 5000, hard: 10000 },
    },
  },
  business: {
    projectsMax: 100,
    usersMax: 20,
    actionsLimits: {
      'ocr.process': { soft: 25000, hard: 50000 },
      'feasibility.run_bp': { soft: 2500, hard: 5000 },
      'land-scraper.scan_market': { soft: 10000, hard: 25000 },
      'doc-hunter.request': { soft: 5000, hard: 10000 },
      'messaging.send_wa': { soft: 25000, hard: 50000 },
    },
  },
};
```
