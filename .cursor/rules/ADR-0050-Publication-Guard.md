# ADR-0050: Publication Guard

## Status

Accepted

## Context

Quando si pubblicano annunci immobiliari sui portali, è necessario proteggere da:

- Pubblicazioni accidentali con prezzi troppo bassi
- Violazioni delle policy aziendali sui discount
- Pubblicazioni non autorizzate

## Decision

Implementare un sistema di Publication Guard che:

- Richiede conferma obbligatoria su azioni `push`
- Implementa price guard contro BP target (maxDiscountPct)
- Blocca pubblicazioni che violano le policy
- Richiede conferma esplicita per override

## Consequences

### Positive

- Protezione da errori costosi
- Compliance con policy aziendali
- Tracciabilità delle decisioni
- Controllo centralizzato sui prezzi

### Negative

- Aggiunge un step di conferma
- Richiede configurazione delle policy
- Potrebbe rallentare il processo per utenti esperti

## Implementation

- Price guard confronta price/unit con BP snapshot più recente
- Se violato → aggiunge "violations" e richiede conferma esplicita
- Log di tutte le decisioni e override
- Integrazione con sistema di permessi utente
