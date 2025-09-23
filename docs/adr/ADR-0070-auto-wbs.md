# ADR-0070: Auto WBS - Work Breakdown Structure Automatica

## Status

Accepted

## Context

Il progetto necessita di una Work Breakdown Structure (WBS) automatica che si basi sui dati reali del sistema invece che su template predefiniti. La WBS deve essere generata dinamicamente dai fatti reali provenienti da:

- **Doc Hunter**: Stati documenti vendor (DURC, visura, certificazioni)
- **Procurement**: Stati RDO (creazione, offerte, confronto, aggiudicazione)
- **SAL**: Stati autorizzazioni (CDU, SCIA, permessi)
- **Listing**: Stati pubblicazione (preparazione, push, monitoraggio)

## Decision

Implementare un sistema di **Auto WBS** che:

### 1. **Data Sources Integration**

- **Doc Hunter Service**: Monitora stati documenti vendor
- **Procurement Service**: Traccia progresso RDO e offerte
- **SAL Service**: Monitora stati autorizzazioni
- **Listing Service**: Traccia stati pubblicazione

### 2. **WBS Generation Engine**

- **Fact Collection**: Raccoglie fatti reali dai servizi
- **Task Inference**: Infers task da stati e transizioni
- **Dependency Mapping**: Mappa dipendenze tra task
- **Critical Path Calculation**: Calcola percorso critico

### 3. **Real-time Updates**

- **Event-driven**: Aggiorna WBS su eventi reali
- **State Synchronization**: Mantiene sincronizzazione stati
- **Change Detection**: Rileva cambiamenti automaticamente

## Consequences

### Positive

- ✅ **WBS sempre aggiornata** con dati reali
- ✅ **Dipendenza automatica** tra task
- ✅ **Critical path dinamico** basato su stati attuali
- ✅ **Trasparenza completa** del progresso reale
- ✅ **Eliminazione gap** tra piano e realtà

### Negative

- ⚠️ **Complessità** nella gestione di multiple data sources
- ⚠️ **Performance** per calcoli real-time
- ⚠️ **Consistency** tra diversi servizi

### Neutral

- 🔄 **Evoluzione continua** della WBS
- 🔄 **Adattamento automatico** ai cambiamenti

## Implementation

### Phase 1: Data Sources

```typescript
// Doc Hunter Facts
interface DocHunterFact {
  vendorId: string;
  documentType: 'DURC' | 'visura' | 'certification';
  status: 'pending' | 'valid' | 'expired' | 'invalid';
  validUntil: Date;
  lastChecked: Date;
}

// Procurement Facts
interface ProcurementFact {
  rdoId: string;
  status: 'draft' | 'published' | 'offers_received' | 'comparing' | 'awarded';
  deadline: Date;
  offersCount: number;
  awardedVendor?: string;
}

// SAL Facts
interface SALFact {
  authorizationType: 'CDU' | 'SCIA' | 'permits';
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  submissionDate: Date;
  expectedResponseDate: Date;
  actualResponseDate?: Date;
}

// Listing Facts
interface ListingFact {
  portalId: string;
  status: 'preparing' | 'pushed' | 'published' | 'monitoring';
  pushDate: Date;
  viewsCount: number;
  leadsCount: number;
}
```

### Phase 2: WBS Generation

```typescript
class AutoWBSEngine {
  async generateWBS(projectId: string): Promise<WBS> {
    // 1. Collect facts from all services
    const facts = await this.collectFacts(projectId);

    // 2. Infer tasks from facts
    const tasks = await this.inferTasks(facts);

    // 3. Map dependencies
    const dependencies = await this.mapDependencies(tasks);

    // 4. Calculate critical path
    const criticalPath = await this.calculateCriticalPath(tasks, dependencies);

    return { tasks, dependencies, criticalPath };
  }
}
```

### Phase 3: Real-time Updates

```typescript
class TimelineEventBus {
  onFactUpdate(fact: Fact) {
    // Trigger WBS regeneration
    this.regenerateWBS(fact.projectId);
  }
}
```

## References

- [ADR-0069: Procurement System](./ADR-0069-procurement-system.md)
- [ADR-0068: Doc Hunter Integration](./ADR-0068-doc-hunter.md)
- [ADR-0067: SAL Management](./ADR-0067-sal-management.md)
- [ADR-0066: Listing System](./ADR-0066-listing-system.md)
