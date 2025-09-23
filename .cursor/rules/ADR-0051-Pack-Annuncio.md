# ADR-0051: Pack Annuncio

## Status

Accepted

## Context

Per pubblicare annunci immobiliari sui portali è necessario:

- Generare asset pack completi (descrizioni, planimetrie, immagini)
- Creare feed XML standardizzati per integrazione
- Gestire upload e distribuzione dei materiali
- Supportare diversi formati portale

## Decision

Implementare un sistema di Pack Annuncio che:

- Genera ZIP reale con tutti gli asset del progetto
- Include descrizioni, planimetrie (da Design Center), immagini
- Crea feed XML GETRIX-like per integrazione portali
- Supporta placeholder solo se asset assenti
- Upload su GCS in path strutturato

## Consequences

### Positive

- Asset pack completi e professionali
- Integrazione standardizzata con portali
- Gestione centralizzata dei materiali
- Scalabilità per progetti multipli

### Negative

- Richiede asset completi per qualità
- Aggiunge complessità al processo
- Dipendenza da Design Center per planimetrie

## Implementation

- Tool action `listing.prepare()` genera payload+ZIP+XML
- Tool action `listing.push()` carica su GCS
- Path: /listings/{portal}/{projectId}/{ts}
- Supporto per placeholder intelligenti
- Validazione XML e ZIP
