# ADR-0080: Vendor Questionnaire Standard

## Status

Accepted

## Context

Per completare l'analisi di fattibilità e ridurre i campi mancanti nel Planner, è necessario raccogliere informazioni strutturate dal venditore attraverso un questionario standardizzato.

## Decision

Implementare un sistema di questionario venditore con checklist standardizzata che copra:

### Checklist Standard

1. **CDU (Certificato di Destinazione Urbanistica)**
   - Ha CDU? (Sì/No)
   - Data rilascio CDU
   - Validità CDU
   - Note CDU

2. **Progetto Depositato**
   - Progetto depositato in Comune? (Sì/No)
   - Data deposito
   - Stato approvazione
   - Note progetto

3. **Tipo Vendita**
   - Vendita asset vs SPA (Società per Azioni)
   - Motivazione vendita
   - Urgenza vendita

4. **Vincoli e Limitazioni**
   - Vincoli urbanistici
   - Servitù
   - Limitazioni accesso
   - Note vincoli

5. **Documenti Disponibili**
   - Planimetrie
   - Relazioni tecniche
   - Certificazioni energetiche
   - Altri documenti

### Struttura Tecnica

- **JWT Token**: Link sicuro con scadenza 7 giorni
- **Form Web**: Interfaccia responsive e user-friendly
- **Validazione**: Client-side e server-side
- **Persistenza**: Firestore collection `vendor_questionnaires`
- **Mapping**: Risposte → Project Facts automatico

## Consequences

- **Positivi**: Riduzione campi mancanti nel Planner, dati strutturati, processo standardizzato
- **Negativi**: Complessità aggiuntiva, necessità di follow-up per questionari non completati
- **Rischi**: Venditori che non completano il questionario, dati non accurati

## Implementation Notes

- Usare Zod per validazione schema questionario
- Implementare retry logic per questionari non completati
- Integrare con sistema di notifiche per follow-up
