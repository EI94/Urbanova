# ADR-0056: Pre-check

## Status

Accepted

## Context

Prima di aggiudicare un RDO è necessario verificare:

- Validità documenti del vendor (DURC, visura)
- Compliance con requisiti legali
- Stato aggiornato delle certificazioni
- Integrità dei documenti

## Decision

Implementare un sistema di pre-check che:

- **Integra con Doc Hunter**: verifica automatica DURC/visura
- **Blocca aggiudicazione**: se documenti invalidi o scaduti
- **Verifica compliance**: requisiti legali e normativi
- **Audit trail**: log completo delle verifiche

## Consequences

### Positive

- Compliance automatica
- Riduzione rischi legali
- Verifica documenti in tempo reale
- Audit trail completo

### Negative

- Possibili blocchi per documenti validi ma non aggiornati
- Dipendenza da servizi esterni
- Complessità nella gestione eccezioni

## Implementation

- Integrazione con Doc Hunter API
- Verifica automatica DURC e visura
- Blocco aggiudicazione se pre-check fallisce
- Notifiche ai vendor per documenti scaduti
- Dashboard compliance per project manager
