# ADR-0046: Comps & OMI Integration

## Status

Accepted

## Context

Il sistema di feasibility attuale non ha accesso a dati di mercato reali per prezzi e comparabili. È necessario integrare fonti esterne (OMI) e interne (comps normalizzati) per calcoli accurati del Business Plan.

## Decision

Integrare fonti di dati multiple per prezzi e comparabili:

### Fonti Dati

- **OMI (Osservatorio Mercato Immobiliare)**: Range di prezzi per zona e tipologia
- **Internal Comps**: Dati normalizzati da progetti precedenti
- **Outlier Filtering**: Rimozione automatica di valori anomali
- **Provenance Tracking**: Tracciamento completo della fonte per audit

### Architettura

- **Facade Pattern**: `packages/data/src/comps.ts` come interfaccia unificata
- **Data Normalization**: Standardizzazione dei dati da fonti multiple
- **Caching Strategy**: Cache intelligente per ridurre chiamate API
- **Fallback Chain**: OMI → Internal Comps → Default values

### Metodologia

- **Zone Mapping**: Mappatura automatica città → zone OMI
- **Radius Search**: Ricerca comps interni entro raggio configurabile
- **Statistical Filtering**: Calcolo di percentili (p50, p75) con outlier removal
- **Confidence Scoring**: Punteggio di affidabilità per ogni fonte dati

## Consequences

### Positive

- Dati di mercato reali e aggiornati
- Maggiore accuratezza nei calcoli
- Audit trail completo
- Riduzione dell'incertezza

### Negative

- Dipendenza da API esterne
- Maggiore complessità nella gestione errori
- Necessità di fallback robusti
- Costi per API esterne

## Implementation

1. Implementare facade `packages/data/src/comps.ts`
2. Integrare API OMI con rate limiting
3. Implementare outlier filtering algoritmico
4. Aggiungere provenance tracking
5. Implementare caching e fallback
6. Aggiornare FeasibilityTool per utilizzare i nuovi dati
