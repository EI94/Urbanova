/**
 * Importatore Dati OpenStreetMap per Urbanova
 * Importa zone urbane, quartieri e frazioni da OSM
 */

import { db } from '@/lib/database';
import { dataValidator } from '@/lib/validation/dataValidator';
import { systemMonitor } from '@/lib/monitoring/systemMonitor';
import axios from 'axios';
import { z } from 'zod';

// Schema per dati OSM
const OsmElementSchema = z.object({
  type: z.enum(['node', 'way', 'relation']),
  id: z.number(),
  lat: z.number().optional(),
  lon: z.number().optional(),
  tags: z.record(z.string()).optional(),
  members: z.array(z.any()).optional()
});

export type OsmElement = z.infer<typeof OsmElementSchema>;

export interface OsmImportResult {
  success: boolean;
  totalElements: number;
  importedZones: number;
  failedZones: number;
  errors: string[];
  warnings: string[];
  duration: number;
  zoneTypes: Record<string, number>;
}

export interface OsmImportProgress {
  current: number;
  total: number;
  percentage: number;
  currentZone: string;
  status: 'querying' | 'parsing' | 'validating' | 'importing' | 'completed' | 'error';
  message: string;
}

export class OsmImporter {
  private db: typeof db;
  private progressCallback?: (progress: OsmImportProgress) => void;
  private isCancelled = false;

  // Overpass API endpoint
  private readonly OVERPASS_API = 'https://overpass-api.de/api/interpreter';
  
  // Query OSM per zone urbane italiane
  private readonly OSM_QUERIES = {
    // Quartieri e frazioni
    urbanAreas: `
      [out:json][timeout:300];
      (
        relation["admin_level"="9"]["name"~"Italia"]["place"~"suburb|neighbourhood|quarter"];
        relation["admin_level"="10"]["name"~"Italia"]["place"~"hamlet|village"];
        way["place"~"suburb|neighbourhood|quarter"]["name"];
        way["place"~"hamlet|village"]["name"];
        node["place"~"suburb|neighbourhood|quarter"]["name"];
        node["place"~"hamlet|village"]["name"];
      );
      out geom;
    `,
    
    // Zone industriali e commerciali
    industrialAreas: `
      [out:json][timeout:300];
      (
        way["landuse"="industrial"]["name"];
        way["landuse"="commercial"]["name"];
        way["amenity"="industrial"]["name"];
        relation["landuse"="industrial"]["name"];
        relation["landuse"="commercial"]["name"];
      );
      out geom;
    `,
    
    // Zone residenziali
    residentialAreas: `
      [out:json][timeout:300];
      (
        way["landuse"="residential"]["name"];
        way["residential"="yes"]["name"];
        relation["landuse"="residential"]["name"];
      );
      out geom;
    `
  };

  constructor() {
    this.db = db;
  }

  /**
   * Importa tutte le zone urbane da OSM
   */
  async importAllZones(progressCallback?: (progress: OsmImportProgress) => void): Promise<OsmImportResult> {
    this.progressCallback = progressCallback;
    this.isCancelled = false;
    const startTime = Date.now();

    try {
      const allZones: any[] = [];
      const zoneTypes: Record<string, number> = {};

      // 1. Importa zone urbane
      this.updateProgress(0, 100, 'querying', 'Recuperando zone urbane...', '');
      const urbanZones = await this.queryOsmData(this.OSM_QUERIES.urbanAreas);
      allZones.push(...this.processOsmElements(urbanZones, 'quartiere'));
      zoneTypes['quartiere'] = urbanZones.elements.length;

      // 2. Importa zone industriali
      this.updateProgress(25, 100, 'querying', 'Recuperando zone industriali...', '');
      const industrialZones = await this.queryOsmData(this.OSM_QUERIES.industrialAreas);
      allZones.push(...this.processOsmElements(industrialZones, 'zona_industriale'));
      zoneTypes['zona_industriale'] = industrialZones.elements.length;

      // 3. Importa zone residenziali
      this.updateProgress(50, 100, 'querying', 'Recuperando zone residenziali...', '');
      const residentialZones = await this.queryOsmData(this.OSM_QUERIES.residentialAreas);
      allZones.push(...this.processOsmElements(residentialZones, 'zona_residenziale'));
      zoneTypes['zona_residenziale'] = residentialZones.elements.length;

      // 4. Validazione dati
      this.updateProgress(75, 100, 'validating', 'Validando zone...', '');
      const validationResult = await this.validateOsmData(allZones);

      // 5. Importazione database
      this.updateProgress(90, 100, 'importing', 'Importando nel database...', '');
      const importResult = await this.importZonesToDatabase(validationResult.cleanedData);

      // 6. Completamento
      this.updateProgress(100, 100, 'completed', 'Importazione completata!', '');

      const duration = Date.now() - startTime;

      return {
        success: true,
        totalElements: allZones.length,
        importedZones: importResult.importedCount,
        failedZones: importResult.failedCount,
        errors: importResult.errors,
        warnings: validationResult.validationResult.warnings.map(w => w.message),
        duration,
        zoneTypes
      };

    } catch (error) {
      this.updateProgress(0, 100, 'error', 'Errore durante importazione', error instanceof Error ? error.message : 'Errore sconosciuto');
      
      return {
        success: false,
        totalElements: 0,
        importedZones: 0,
        failedZones: 0,
        errors: [error instanceof Error ? error.message : 'Errore sconosciuto'],
        warnings: [],
        duration: Date.now() - startTime,
        zoneTypes: {}
      };
    }
  }

  /**
   * Query dati OSM
   */
  private async queryOsmData(query: string): Promise<{ elements: OsmElement[] }> {
    try {
      const response = await axios.post(
        this.OVERPASS_API,
        `data=${encodeURIComponent(query)}`,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 300000 // 5 minuti
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Errore query OSM: ${error}`);
    }
  }

  /**
   * Processa elementi OSM
   */
  private processOsmElements(osmData: { elements: OsmElement[] }, defaultType: string): any[] {
    const processedZones: any[] = [];

    for (const element of osmData.elements) {
      if (this.isCancelled) break;

      try {
        const zone = this.processOsmElement(element, defaultType);
        if (zone) {
          processedZones.push(zone);
        }
      } catch (error) {
        console.warn(`Errore processamento elemento ${element.id}:`, error);
      }
    }

    return processedZones;
  }

  /**
   * Processa singolo elemento OSM
   */
  private processOsmElement(element: OsmElement, defaultType: string): any | null {
    const tags = element.tags || {};
    const name = tags.name || tags['name:it'] || tags['name:en'] || '';

    if (!name) return null;

    // Determina tipo zona
    const zoneType = this.determineZoneType(tags, defaultType);
    
    // Determina comune
    const comune = this.extractComuneFromTags(tags);
    
    // Estrae coordinate
    const coordinates = this.extractCoordinates(element);
    
    // Estrae metadati
    const metadata = this.extractMetadata(tags);

    return {
      nome: name,
      tipo_zona: zoneType,
      comune: comune,
      latitudine: coordinates.lat,
      longitudine: coordinates.lng,
      popolazione: this.extractPopulation(tags),
      superficie: this.extractArea(tags),
      altitudine: this.extractElevation(tags),
      metadata: metadata
    };
  }

  /**
   * Determina tipo zona da tags OSM
   */
  private determineZoneType(tags: Record<string, string>, defaultType: string): string {
    // Quartieri e frazioni
    if (tags.place === 'suburb' || tags.place === 'neighbourhood' || tags.place === 'quarter') {
      return 'quartiere';
    }
    
    if (tags.place === 'hamlet' || tags.place === 'village') {
      return 'frazione';
    }
    
    // Zone industriali
    if (tags.landuse === 'industrial' || tags.amenity === 'industrial') {
      return 'zona_industriale';
    }
    
    // Zone commerciali
    if (tags.landuse === 'commercial') {
      return 'zona_commerciale';
    }
    
    // Zone residenziali
    if (tags.landuse === 'residential' || tags.residential === 'yes') {
      return 'zona_residenziale';
    }
    
    // Zone agricole
    if (tags.landuse === 'farmland' || tags.landuse === 'farm') {
      return 'zona_agricola';
    }
    
    // Centro storico
    if (tags.historic === 'city_centre' || tags.historic === 'old_town') {
      return 'centro_storico';
    }
    
    return defaultType;
  }

  /**
   * Estrae comune dai tags OSM
   */
  private extractComuneFromTags(tags: Record<string, string>): string {
    return tags.city || 
           tags.town || 
           tags.municipality || 
           tags['addr:city'] || 
           tags['addr:town'] || 
           'Comune non specificato';
  }

  /**
   * Estrae coordinate da elemento OSM
   */
  private extractCoordinates(element: OsmElement): { lat: number; lng: number } {
    // Per nodi
    if (element.type === 'node' && element.lat && element.lon) {
      return { lat: element.lat, lng: element.lon };
    }
    
    // Per way e relation, usa centroide (semplificato)
    if (element.type === 'way' && element.lat && element.lon) {
      return { lat: element.lat, lng: element.lon };
    }
    
    return { lat: 0, lng: 0 };
  }

  /**
   * Estrae popolazione dai tags
   */
  private extractPopulation(tags: Record<string, string>): number {
    const population = tags.population || tags['population:residents'];
    return population ? parseInt(population.replace(/\D/g, '')) : 0;
  }

  /**
   * Estrae area dai tags
   */
  private extractArea(tags: Record<string, string>): number {
    const area = tags.area || tags['area:ha'];
    return area ? parseFloat(area) : 0;
  }

  /**
   * Estrae altitudine dai tags
   */
  private extractElevation(tags: Record<string, string>): number {
    const elevation = tags.ele || tags.elevation;
    return elevation ? parseInt(elevation) : 0;
  }

  /**
   * Estrae metadati dai tags
   */
  private extractMetadata(tags: Record<string, string>): Record<string, any> {
    const metadata: Record<string, any> = {};
    
    // Salva tags rilevanti
    const relevantTags = [
      'wikidata', 'wikipedia', 'website', 'phone', 'email',
      'opening_hours', 'amenity', 'shop', 'tourism', 'leisure',
      'historic', 'religion', 'sport', 'healthcare', 'education'
    ];
    
    relevantTags.forEach(tag => {
      if (tags[tag]) {
        metadata[tag] = tags[tag];
      }
    });
    
    return metadata;
  }

  /**
   * Valida dati OSM
   */
  private async validateOsmData(data: any[]): Promise<{
    cleanedData: any[];
    validationResult: any;
  }> {
    // Converte dati OSM al formato interno
    const convertedData = data.map(record => this.convertOsmToInternal(record));
    
    // Valida con sistema esistente
    const validationResult = await dataValidator.validateZoneUrbaneData(convertedData);
    
    // Pulisce dati
    const { cleanedData } = await dataValidator.cleanAndValidateData(convertedData, 'zona');
    
    return { cleanedData, validationResult };
  }

  /**
   * Converte dati OSM al formato interno
   */
  private convertOsmToInternal(osmRecord: any): any {
    return {
      nome: osmRecord.nome,
      tipo_zona: osmRecord.tipo_zona,
      comune: osmRecord.comune,
      popolazione: osmRecord.popolazione,
      superficie: osmRecord.superficie,
      altitudine: osmRecord.altitudine,
      latitudine: osmRecord.latitudine,
      longitudine: osmRecord.longitudine,
      metadata: osmRecord.metadata
    };
  }

  /**
   * Importa zone nel database
   */
  private async importZonesToDatabase(data: any[]): Promise<{
    importedCount: number;
    failedCount: number;
    errors: string[];
  }> {
    let importedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Prepara dati per importazione batch
    const batchSize = 50;
    const batches = this.chunkArray(data, batchSize);

    for (let i = 0; i < batches.length; i++) {
      if (this.isCancelled) break;

      const batch = batches[i];
      this.updateProgress(
        90 + (i / batches.length) * 10,
        100,
        'importing',
        `Importando batch zone ${i + 1}/${batches.length}...`,
        batch[0]?.nome || ''
      );

      try {
        await this.importZoneBatch(batch);
        importedCount += batch.length;
      } catch (error) {
        failedCount += batch.length;
        errors.push(`Batch zone ${i + 1}: ${error}`);
      }
    }

    return { importedCount, failedCount, errors };
  }

  /**
   * Importa batch di zone
   */
  private async importZoneBatch(batch: any[]): Promise<void> {
    for (const zone of batch) {
      try {
        // Trova comune_id
        const comuneResult = await this.db.query(
          'SELECT id FROM comuni WHERE nome = $1 LIMIT 1',
          [zone.comune]
        );
        
        const comuneId = comuneResult.length > 0 ? comuneResult[0].id : null;
        
        if (!comuneId) {
          console.warn(`Comune non trovato per zona: ${zone.nome} (${zone.comune})`);
          continue;
        }

        // Inserisce zona
        await this.db.query(`
          INSERT INTO zone_urbane (
            comune_id, nome, tipo_zona, popolazione, superficie, altitudine,
            latitudine, longitudine, metadata, geometry
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (comune_id, nome) DO UPDATE SET
            tipo_zona = EXCLUDED.tipo_zona,
            popolazione = EXCLUDED.popolazione,
            superficie = EXCLUDED.superficie,
            latitudine = EXCLUDED.latitudine,
            longitudine = EXCLUDED.longitudine,
            metadata = EXCLUDED.metadata,
            updated_at = NOW()
        `, [
          comuneId,
          zone.nome,
          zone.tipo_zona,
          zone.popolazione || 0,
          zone.superficie || 0,
          zone.altitudine || 0,
          zone.latitudine,
          zone.longitudine,
          JSON.stringify(zone.metadata || {}),
          zone.latitudine && zone.longitudine ? `POINT(${zone.longitudine} ${zone.latitudine})` : null
        ]);
      } catch (error) {
        console.warn(`Errore inserimento zona ${zone.nome}:`, error);
      }
    }
  }

  /**
   * Divide array in chunks
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Aggiorna progresso
   */
  private updateProgress(
    current: number,
    total: number,
    status: OsmImportProgress['status'],
    message: string,
    currentZone: string
  ): void {
    if (this.progressCallback) {
      this.progressCallback({
        current,
        total,
        percentage: Math.round((current / total) * 100),
        currentZone,
        status,
        message
      });
    }
  }

  /**
   * Cancella importazione
   */
  cancel(): void {
    this.isCancelled = true;
  }

  /**
   * Genera report importazione OSM
   */
  async generateImportReport(result: OsmImportResult): Promise<string> {
    const report = `
# 🗺️ Report Importazione Dati OpenStreetMap - Urbanova

**Data:** ${new Date().toISOString()}  
**Stato:** ${result.success ? '✅ SUCCESSO' : '❌ FALLITO'}  
**Durata:** ${Math.round(result.duration / 1000)}s

## 📈 Statistiche Importazione

- **Elementi Totali:** ${result.totalElements}
- **Zone Importate:** ${result.importedZones}
- **Zone Fallite:** ${result.failedZones}
- **Tasso Successo:** ${Math.round((result.importedZones / result.totalElements) * 100)}%

## 🏘️ Zone per Tipo

${Object.entries(result.zoneTypes).map(([type, count]) => `- **${type}:** ${count}`).join('\n')}

## 🚨 Errori

${result.errors.length > 0 ? result.errors.map(error => `- ${error}`).join('\n') : 'Nessun errore'}

## ⚠️ Warning

${result.warnings.length > 0 ? result.warnings.map(warning => `- ${warning}`).join('\n') : 'Nessun warning'}

## 🎯 Prossimi Passi

${result.success ? 
  '✅ Importazione zone completata. Procedere con implementazione mappa.' : 
  '❌ Risolvere errori prima di procedere.'}

---
*Report generato automaticamente dal Sistema di Importazione OSM Urbanova*
`;

    return report;
  }
}

// Esporta istanza singleton
export const osmImporter = new OsmImporter();
