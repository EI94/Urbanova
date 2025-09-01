# ADR-0096: Entitlements & Enforcement

**Status**: Accepted  
**Date**: 2024-12-31  
**Context**: Implementare sistema di entitlements per limitare l'uso basato sul piano.

## Decision

### Entitlements per workspace

- `projectsMax`: numero massimo progetti
- `usersMax`: numero massimo utenti
- `actionsLimits`: Record<toolAction, {soft:number, hard:number}>

### Enforcement levels

- **Soft-limit**: Warning con consumo attuale, azione procede
- **Hard-limit**: Blocco azione con CTA "Upgrade"

### Check point

- `checkEntitlement(workspaceId, toolId, action)` nel Tool Runner
- UI feedback: Toast warning per soft-limit, modale upgrade per hard-limit

## Consequences

### Positive

- Controllo granulare dell'uso
- UX chiara per upgrade path
- Prevenzione abuso risorse
- Revenue protection

### Negative

- Complessità nel monitoring
- Potenziale friction per utenti
- Necessità di fallback graceful

## Implementation Notes

### Check flow

```typescript
async function checkEntitlement(workspaceId: string, toolId: string, action: string) {
  const billingState = await getBillingState(workspaceId);
  const currentUsage = billingState.usageMonth[`${toolId}.${action}`] || 0;
  const limit = billingState.entitlements.actionsLimits[`${toolId}.${action}`];

  if (currentUsage >= limit.hard) {
    return { allowed: false, reason: 'hard_limit', currentUsage, limit: limit.hard };
  }

  if (currentUsage >= limit.soft) {
    return { allowed: true, warning: true, currentUsage, limit: limit.soft };
  }

  return { allowed: true };
}
```

### UI Integration

- **Soft warning**: Toast con "Usage: 850/1000 actions"
- **Hard block**: Modale con "Upgrade to Pro" + usage breakdown
- **Progress indicator**: Barra di progresso nel dashboard

### Tool Runner Integration

```typescript
// Prima di eseguire tool
const entitlement = await checkEntitlement(workspaceId, toolId, action);
if (!entitlement.allowed) {
  throw new Error(`Usage limit exceeded: ${entitlement.currentUsage}/${entitlement.limit}`);
}
```
