# ADR-0060: SAL Finite State Machine

## Status

DRAFT

## Context

Il sistema SAL (Subcontractor Agreement Letter) richiede una gestione rigorosa degli stati per garantire il flusso corretto di approvazione, firma e pagamento.

## Decision

Implementare una Finite State Machine (FSM) per gestire il ciclo di vita completo del SAL.

## Consequences

### Stati del SAL

1. **DRAFT** - Bozza creata dal PM
2. **SENT** - SAL inviato al vendor
3. **SIGNED_VENDOR** - Firma del vendor completata
4. **SIGNED_PM** - Firma del PM completata
5. **READY_TO_PAY** - Pronto per il pagamento
6. **PAID** - Pagamento completato

### Transizioni Permesse

- DRAFT → SENT (quando il PM invia)
- SENT → SIGNED_VENDOR (quando il vendor firma)
- SIGNED_VENDOR → SIGNED_PM (quando il PM firma)
- SIGNED_PM → READY_TO_PAY (quando entrambe le parti hanno firmato)
- READY_TO_PAY → PAID (quando il pagamento è completato)

### Validazioni

- Solo il PM può creare e inviare SAL
- Il vendor deve firmare prima del PM
- Il pagamento richiede entrambe le firme
- Transizioni non valide generano errori

## Implementation

- FSM implementata nel service `salService.ts`
- Stati persistiti in Firestore
- Transizioni validate con business rules
- Audit trail per ogni cambio di stato
