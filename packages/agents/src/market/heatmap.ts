// import { HeatmapCell, MarketKPIs } from '@urbanova/types';

// Temporary type definitions
interface HeatmapCell {
  lat: number;
  lng: number;
  value: number;
  color: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  kpis?: {
    psqmMedian: number;
    absorptionDays: number;
    inventoryCount: number;
    demandScore: number;
  };
  metadata?: {
    dataQuality: number;
  };
}

interface MarketKPIs {
  psqmMedian: number;
  absorptionDays: number;
  priceVolatility: number;
  demandScore: number;
  supplyScore: number;
}

export class HeatmapGeneratorService {
  /**
   * Genera heatmap SVG da dati GeoJSON
   */
  generateSVGHeatmap(
    geoJSON: any,
    width: number = 800,
    height: number = 600,
    metric: keyof MarketKPIs = 'psqmMedian'
  ): string {
    try {
      // Calcola bounds dal GeoJSON
      const bounds = this.calculateBounds(geoJSON);

      // Genera SVG
      let svg = this.createSVG(width, height, bounds);

      // Aggiungi celle
      const cells = this.generateCells(geoJSON, bounds, width, height, metric);
      cells.forEach(cell => {
        svg += this.createCell(cell);
      });

      // Chiudi SVG
      svg += '</svg>';

      return svg;
    } catch (error) {
      console.error('Error generating SVG heatmap:', error);
      return this.createErrorSVG(width, height);
    }
  }

  /**
   * Genera heatmap PNG da dati GeoJSON
   */
  async generatePNGHeatmap(
    geoJSON: any,
    width: number = 800,
    height: number = 600,
    metric: keyof MarketKPIs = 'psqmMedian'
  ): Promise<Buffer> {
    try {
      const svg = this.generateSVGHeatmap(geoJSON, width, height, metric);

      // Converti SVG a PNG usando libreria esterna
      // Per ora restituiamo un placeholder
      return Buffer.from('PNG placeholder');
    } catch (error) {
      console.error('Error generating PNG heatmap:', error);
      throw new Error('PNG generation failed');
    }
  }

  /**
   * Genera heatmap con colori personalizzati
   */
  generateColoredHeatmap(
    geoJSON: any,
    colorScheme: 'price' | 'demand' | 'supply' | 'volatility' = 'price'
  ): any {
    const features = geoJSON.features.map((feature: any) => {
      const cell = feature.properties;
      const color = this.getColorForCell(cell.kpis, colorScheme);

      return {
        ...feature,
        properties: {
          ...cell,
          color,
          opacity: this.calculateOpacity(cell.kpis, colorScheme),
        },
      };
    });

    return {
      type: 'FeatureCollection',
      features,
    };
  }

  /**
   * Calcola bounds dal GeoJSON
   */
  private calculateBounds(geoJSON: any): { x: number; y: number; width: number; height: number } {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    geoJSON.features.forEach((feature: any) => {
      const coords = feature.geometry.coordinates[0];
      coords.forEach((coord: number[]) => {
        minX = Math.min(minX, coord[0]);
        minY = Math.min(minY, coord[1]);
        maxX = Math.max(maxX, coord[0]);
        maxY = Math.max(maxY, coord[1]);
      });
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  /**
   * Crea SVG base
   */
  private createSVG(width: number, height: number, bounds: any): string {
    return `<svg width="${width}" height="${height}" viewBox="${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="heatmapGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#0000ff;stop-opacity:0.3" />
          <stop offset="50%" style="stop-color:#ffff00;stop-opacity:0.6" />
          <stop offset="100%" style="stop-color:#ff0000;stop-opacity:0.9" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="#f8f9fa" />
      <g class="heatmap-cells">`;
  }

  /**
   * Genera celle dalla griglia
   */
  private generateCells(
    geoJSON: any,
    bounds: any,
    width: number,
    height: number,
    metric: keyof MarketKPIs
  ): any[] {
    const cells: any[] = [];
    const values = this.extractValues(geoJSON, metric);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    geoJSON.features.forEach((feature: any) => {
      const cell = feature.properties;
      const normalizedValue = this.normalizeValue(cell.kpis[metric], minValue, maxValue);

      cells.push({
        coords: feature.geometry.coordinates[0],
        value: cell.kpis[metric],
        normalizedValue,
        color: this.getColorForValue(normalizedValue),
        opacity: 0.3 + normalizedValue * 0.6,
      });
    });

    return cells;
  }

  /**
   * Crea cella SVG
   */
  private createCell(cell: any): string {
    const points = cell.coords.map((coord: number[]) => `${coord[0]},${coord[1]}`).join(' ');

    return `<polygon 
      points="${points}" 
      fill="${cell.color}" 
      opacity="${cell.opacity}"
      stroke="#ffffff" 
      stroke-width="0.5"
      class="heatmap-cell"
      data-value="${cell.value}"
    />`;
  }

  /**
   * Estrae valori per metrica
   */
  private extractValues(geoJSON: any, metric: keyof MarketKPIs): number[] {
    return geoJSON.features.map((feature: any) => feature.properties.kpis[metric]);
  }

  /**
   * Normalizza valore tra 0 e 1
   */
  private normalizeValue(value: number, min: number, max: number): number {
    if (max === min) return 0.5;
    return (value - min) / (max - min);
  }

  /**
   * Ottiene colore per valore normalizzato
   */
  private getColorForValue(normalizedValue: number): string {
    if (normalizedValue <= 0.33) {
      return '#0000ff'; // Blu per valori bassi
    } else if (normalizedValue <= 0.66) {
      return '#ffff00'; // Giallo per valori medi
    } else {
      return '#ff0000'; // Rosso per valori alti
    }
  }

  /**
   * Ottiene colore per cella basato su metrica
   */
  private getColorForCell(kpis: MarketKPIs, scheme: string): string {
    switch (scheme) {
      case 'price':
        return this.getColorForPrice(kpis.psqmMedian);
      case 'demand':
        return this.getColorForDemand(kpis.demandScore);
      case 'supply':
        return this.getColorForSupply(kpis.supplyScore);
      case 'volatility':
        return this.getColorForVolatility(kpis.priceVolatility);
      default:
        return this.getColorForPrice(kpis.psqmMedian);
    }
  }

  /**
   * Colori per prezzo
   */
  private getColorForPrice(price: number): string {
    if (price < 2000) return '#0000ff'; // Blu per prezzi bassi
    if (price < 4000) return '#00ff00'; // Verde per prezzi medi
    if (price < 6000) return '#ffff00'; // Giallo per prezzi alti
    return '#ff0000'; // Rosso per prezzi molto alti
  }

  /**
   * Colori per domanda
   */
  private getColorForDemand(score: number): string {
    if (score < 30) return '#ff0000'; // Rosso per domanda bassa
    if (score < 60) return '#ffff00'; // Giallo per domanda media
    return '#00ff00'; // Verde per domanda alta
  }

  /**
   * Colori per offerta
   */
  private getColorForSupply(score: number): string {
    if (score < 30) return '#00ff00'; // Verde per offerta bassa
    if (score < 60) return '#ffff00'; // Giallo per offerta media
    return '#ff0000'; // Rosso per offerta alta
  }

  /**
   * Colori per volatilità
   */
  private getColorForVolatility(volatility: number): string {
    if (volatility < 0.2) return '#00ff00'; // Verde per volatilità bassa
    if (volatility < 0.4) return '#ffff00'; // Giallo per volatilità media
    return '#ff0000'; // Rosso per volatilità alta
  }

  /**
   * Calcola opacità per cella
   */
  private calculateOpacity(kpis: MarketKPIs, scheme: string): number {
    switch (scheme) {
      case 'price':
        return 0.3 + (kpis.psqmMedian / 10000) * 0.7;
      case 'demand':
        return 0.3 + (kpis.demandScore / 100) * 0.7;
      case 'supply':
        return 0.3 + (kpis.supplyScore / 100) * 0.7;
      case 'volatility':
        return 0.3 + kpis.priceVolatility * 0.7;
      default:
        return 0.6;
    }
  }

  /**
   * Crea SVG di errore
   */
  private createErrorSVG(width: number, height: number): string {
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f8f9fa" />
      <text x="50%" y="50%" text-anchor="middle" fill="#6c757d" font-family="Arial, sans-serif" font-size="16">
        Errore nella generazione heatmap
      </text>
    </svg>`;
  }

  /**
   * Genera legenda per heatmap
   */
  generateLegend(metric: keyof MarketKPIs, minValue: number, maxValue: number): string {
    const step = (maxValue - minValue) / 5;
    const colors = ['#0000ff', '#00ffff', '#00ff00', '#ffff00', '#ff0000'];

    let legend = `<div class="heatmap-legend">
      <h4>${this.getMetricLabel(metric)}</h4>
      <div class="legend-items">`;

    colors.forEach((color, index) => {
      const value = minValue + step * index;
      legend += `<div class="legend-item">
        <div class="legend-color" style="background-color: ${color}"></div>
        <span class="legend-value">${value.toFixed(0)}</span>
      </div>`;
    });

    legend += `</div></div>`;
    return legend;
  }

  /**
   * Ottiene label per metrica
   */
  private getMetricLabel(metric: keyof MarketKPIs): string {
    const labels = {
      psqmMedian: 'Prezzo al m² (€)',
      psqmMean: 'Prezzo medio al m² (€)',
      psqmStdDev: 'Deviazione standard prezzi',
      absorptionDays: 'Giorni di vendita',
      inventoryCount: 'Numero immobili',
      inventoryDensity: 'Densità inventario',
      priceVolatility: 'Volatilità prezzi',
      demandScore: 'Punteggio domanda',
      supplyScore: 'Punteggio offerta',
      marketBalance: 'Bilanciamento mercato',
      trendDirection: 'Direzione trend',
      trendStrength: 'Forza trend',
    };

    return labels[metric] || metric;
  }

  /**
   * Genera tooltip per cella
   */
  generateTooltip(cell: HeatmapCell): string {
    return `<div class="heatmap-tooltip">
      <h4>Zona ${cell.coordinates.lat.toFixed(4)}, ${cell.coordinates.lng.toFixed(4)}</h4>
      <div class="tooltip-content">
        <div class="tooltip-item">
          <span class="label">Prezzo mediano:</span>
          <span class="value">${cell.kpis.psqmMedian.toFixed(0)} €/m²</span>
        </div>
        <div class="tooltip-item">
          <span class="label">Tempo vendita:</span>
          <span class="value">${cell.kpis.absorptionDays} giorni</span>
        </div>
        <div class="tooltip-item">
          <span class="label">Inventario:</span>
          <span class="value">${cell.kpis.inventoryCount} immobili</span>
        </div>
        <div class="tooltip-item">
          <span class="label">Domanda:</span>
          <span class="value">${cell.kpis.demandScore.toFixed(0)}/100</span>
        </div>
        <div class="tooltip-item">
          <span class="label">Qualità dati:</span>
          <span class="value">${(cell.metadata.dataQuality * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>`;
  }
}
