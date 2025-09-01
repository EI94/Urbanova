# ADR-0081: Project Facts Ingestion

## Status

Accepted

## Context

Le risposte del questionario venditore devono essere automaticamente mappate ai Project Facts per aggiornare i Requirements del Planner e completare l'analisi di fattibilità.

## Decision

Implementare un sistema di ingestione automatica che mappi le risposte del questionario ai Project Facts:

### Mapping Strategy

1. **CDU → Project Facts**
   - `hasCDU: boolean`
   - `cduDate: Date`
   - `cduValidity: string`
   - `cduNotes: string`

2. **Progetto Depositato → Project Facts**
   - `hasSubmittedProject: boolean`
   - `projectSubmissionDate: Date`
   - `projectApprovalStatus: 'pending' | 'approved' | 'rejected'`
   - `projectNotes: string`

3. **Tipo Vendita → Project Facts**
   - `saleType: 'asset' | 'spa'`
   - `saleMotivation: string`
   - `saleUrgency: 'low' | 'medium' | 'high'`

4. **Vincoli → Project Facts**
   - `urbanConstraints: string[]`
   - `easements: string[]`
   - `accessLimitations: string[]`
   - `constraintNotes: string`

5. **Documenti → Project Facts**
   - `availableDocuments: string[]`
   - `documentNotes: string`

### Aggiornamento Requirements

- **Completamento automatico**: Campi mancanti nel Planner
- **Validazione**: Verifica coerenza con dati esistenti
- **Notifiche**: Alert per inconsistenze o dati critici

### Struttura Tecnica

- **Service**: `ProjectFactsIngestionService`
- **Mapping**: Configurabile e estendibile
- **Validation**: Cross-reference con dati esistenti
- **Audit**: Log delle modifiche ai Project Facts

## Consequences

- **Positivi**: Automazione del processo, riduzione errori manuali, dati sempre aggiornati
- **Negativi**: Complessità del mapping, rischio di sovrascrittura dati esistenti
- **Rischi**: Mapping errato, perdita di dati esistenti

## Implementation Notes

- Implementare merge strategy per dati esistenti
- Aggiungere flag `source: 'vendor_questionnaire'` per tracciabilità
- Creare sistema di approvazione per modifiche critiche
