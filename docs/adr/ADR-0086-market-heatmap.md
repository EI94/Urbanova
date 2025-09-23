# ADR-0086: Market Intelligence Heatmap Generation

## Status

Accepted

## Context

Per visualizzare efficacemente i dati di mercato e identificare pattern geografici, è necessario implementare un sistema di heatmap che:

- Rappresenti KPIs su griglia geografica
- Permetta identificazione di zone hot/cold
- Supporti analisi comparative tra aree
- Generi output visualizzabili e esportabili

## Decision

Implementare un sistema di heatmap generation con le seguenti caratteristiche:

### Grid Strategy

1. **Griglia 500m x 500m**
   - Risoluzione ottimale per analisi urbana
   - Copertura completa del territorio cittadino
   - Bilanciamento tra dettaglio e performance
   - Supporto per zoom levels multipli

2. **KPI per Cella**
   - **psqm median**: Prezzo al metro quadro mediano
   - **absorption proxy**: Tempo di vendita stimato
   - **inventory density**: Densità di immobili disponibili
   - **price volatility**: Variabilità prezzi nell'area
   - **demand score**: Punteggio domanda (0-100)

### Heatmap Generation

```typescript
interface HeatmapCell {
  id: string;
  coordinates: {
    lat: number;
    lng: number;
    bounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
  };
  kpis: {
    psqmMedian: number;
    absorptionProxy: number; // giorni
    inventoryDensity: number; // immobili/km²
    priceVolatility: number; // coefficiente variazione
    demandScore: number; // 0-100
  };
  metadata: {
    compsCount: number;
    dataQuality: number; // 0-1
    lastUpdated: Date;
  };
}
```

### Color Mapping

- **psqm median**: Blu (basso) → Rosso (alto)
- **absorption proxy**: Verde (veloce) → Giallo (lento)
- **demand score**: Grigio (bassa) → Verde (alta)
- **inventory density**: Trasparente (bassa) → Opaco (alta)

### Output Formats

1. **GeoJSON**: Per integrazione mappe web
2. **SVG**: Per visualizzazione diretta
3. **PNG**: Per export e report
4. **PDF**: Per report professionali

### Performance Optimization

- **Pre-computation**: Heatmap generate offline
- **Caching**: Cache per griglie frequenti
- **Lazy loading**: Caricamento on-demand
- **Compression**: Ottimizzazione file size

## Consequences

- **Positivi**: Visualizzazione efficace, identificazione pattern, analisi comparativa, export multiplo
- **Negativi**: Complessità computazionale, storage requirements, necessità di aggiornamento frequente
- **Rischi**: Performance degradation, data staleness, visual bias

## Implementation Notes

- Usare D3.js per generazione SVG
- Implementare color scales configurabili
- Aggiungere tooltip interattivi
- Supportare export in formati multipli
- Ottimizzare per mobile devices
