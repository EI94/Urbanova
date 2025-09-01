# ADR-0055: RDO & Scoring

## Status

Accepted

## Context

Per le gare d'appalto (RDO - Richieste di Offerta) è necessario:

- Valutare le offerte in modo oggettivo e trasparente
- Applicare criteri di scoring standardizzati
- Identificare outlier e anomalie
- Supportare decisioni basate su dati

## Decision

Implementare un sistema di scoring RDO con:

- **Scoring default**: price 0.7 / time 0.2 / quality 0.1
- **Rilevamento outlier**: offerte che deviano significativamente dalla media
- **Ranking automatico**: ordinamento basato su punteggio ponderato
- **Trasparenza**: criteri di valutazione visibili ai vendor

## Consequences

### Positive

- Valutazione oggettiva e ripetibile
- Riduzione bias umani
- Supporto decisionale basato su dati
- Trasparenza per compliance

### Negative

- Rigidità nei criteri di scoring
- Possibile gaming del sistema
- Complessità nella configurazione

## Implementation

- Scoring algorithm con pesi configurabili
- Outlier detection (deviazione standard > 2σ)
- Ranking automatico con PDF di confronto
- Integrazione con Doc Hunter per pre-check
- Portale vendor sicuro con JWT
