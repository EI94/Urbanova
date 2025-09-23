# ADR-0045: Business Plan Canonico

## Status

Accepted

## Context

Il sistema di feasibility attuale non ha una struttura standardizzata per i Business Plan, rendendo difficile il confronto tra progetti e l'analisi di sensibilità. È necessario definire un formato canonico che includa tutti i campi essenziali e supporti l'analisi di scenario.

## Decision

Standardizzare i campi del Business Plan con una struttura canonica che includa:

### Campi Obbligatori

- **ProjectId**: Identificativo univoco del progetto
- **Land**: Prezzo terreno e tasse
- **Costs**: Costi hard, soft, fees e contingency
- **Prices**: Prezzo base per mq e per tipologia
- **Timing**: Mesi di sviluppo e vendita
- **Sensitivity**: Delta per costi e prezzi (prima classe)

### Caratteristiche

- **Sensitivity First-Class**: I delta di sensibilità sono parte integrante dell'input
- **Snapshot Storage**: Ogni BP viene salvato con timestamp per audit trail
- **Validation Zod**: Validazione runtime completa di tutti i campi
- **Immutable**: Una volta calcolato, il BP non può essere modificato

### Storage

- **Path**: `projects/{id}/bp/{timestamp}`
- **Metadata**: Include input, output, timestamp, version
- **Versioning**: Supporto per versioni multiple dello stesso progetto

## Consequences

### Positive

- Standardizzazione completa dei BP
- Analisi di sensibilità integrata
- Audit trail completo
- Confrontabilità tra progetti

### Negative

- Breaking changes per BP esistenti
- Maggiore complessità nella validazione
- Storage incrementale per snapshot

## Implementation

1. Definire interfacce TypeScript in `packages/types/src/bp.ts`
2. Implementare validazione Zod completa
3. Aggiornare FeasibilityTool per supportare il nuovo formato
4. Migrare BP esistenti al nuovo formato
5. Aggiornare PDF generator per includere tutti i campi
