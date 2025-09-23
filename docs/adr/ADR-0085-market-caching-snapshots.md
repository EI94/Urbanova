# ADR-0085: Market Intelligence Caching & Snapshots

## Status

Accepted

## Context

Per fornire analisi di mercato accurate e performanti, è necessario implementare un sistema di caching e snapshots che permetta di:

- Ridurre le chiamate API esterne (OMI)
- Mantenere storico delle analisi per trend analysis
- Ottimizzare performance per query frequenti
- Garantire consistenza dei dati nel tempo

## Decision

Implementare un sistema di caching e snapshots per Market Intelligence con le seguenti caratteristiche:

### Snapshot Strategy

1. **Snapshot per City/Asset/Horizon**
   - Chiave: `{city}_{asset}_{horizonMonths}_{timestamp}`
   - Dati: KPIs completi, GeoJSON heatmap, insights
   - Storage: Firestore collection `market_snapshots`
   - TTL: 30 giorni per snapshot automatici

2. **Caching Layer**
   - **OMI Data**: Cache TTL 24h con fallback a dati storici
   - **Comps Data**: Cache TTL 6h con outlier filtering
   - **Heatmap Generation**: Cache TTL 12h per griglia 500m
   - **Trend Analysis**: Cache TTL 7 giorni per analisi storiche

3. **Data Sources Priority**
   - **Primary**: OMI API (real-time)
   - **Secondary**: Internal Comps (aggregated)
   - **Fallback**: Historical snapshots (last 30 days)
   - **Emergency**: Default market data (static)

### Snapshot Structure

```typescript
interface MarketSnapshot {
  id: string;
  city: string;
  asset: string;
  horizonMonths: number;
  timestamp: Date;
  data: {
    kpis: MarketKPIs;
    heatmap: GeoJSON;
    insights: MarketInsight[];
    comps: CompsData;
    omi: OMIData;
  };
  metadata: {
    dataSources: string[];
    cacheHit: boolean;
    generationTime: number;
    dataQuality: number; // 0-1
  };
}
```

### Storage Strategy

- **Firestore**: Snapshot storage e query
- **Redis**: Cache layer per performance
- **GCS**: PDF reports e GeoJSON files
- **BigQuery**: Analytics e trend analysis (future)

## Consequences

- **Positivi**: Performance migliorata, riduzione API calls, storico completo, consistenza dati
- **Negativi**: Complessità storage, necessità di cleanup automatico, sincronizzazione cache
- **Rischi**: Cache inconsistency, storage costs, data staleness

## Implementation Notes

- Implementare cache invalidation strategy
- Aggiungere data quality scoring
- Creare cleanup job per snapshot obsoleti
- Monitorare cache hit rates e performance
