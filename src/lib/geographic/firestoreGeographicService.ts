/**
 * Servizio Geografico Production Level con Firestore
 * Gestisce comuni e zone italiane per utenti paganti
 */

import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  writeBatch
} from 'firebase/firestore';

// Interfaccia per Comune italiano
export interface ComuneItaliano {
  id: string;
  nome: string;
  provincia: string;
  regione: string;
  codiceIstat: string;
  codiceCatastale: string;
  popolazione: number;
  superficie: number; // in km²
  latitudine: number;
  longitudine: number;
  altitudine: number; // in metri
  zonaClimatica: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  cap: string[];
  prefisso: string;
  sitoWeb?: string;
  email?: string;
  telefono?: string;
  sindaco?: string;
  partito?: string;
  dataCreazione: Date;
  dataAggiornamento: Date;
  attivo: boolean;
}

// Interfaccia per Zona italiana
export interface ZonaItaliana {
  id: string;
  nome: string;
  tipo: 'quartiere' | 'frazione' | 'località' | 'zona_industriale' | 'centro_storico' | 'periferia';
  comune: string;
  provincia: string;
  regione: string;
  codiceIstat?: string;
  popolazione?: number;
  superficie?: number;
  latitudine: number;
  longitudine: number;
  altitudine?: number;
  descrizione?: string;
  caratteristiche: string[];
  servizi: string[];
  trasporti: string[];
  dataCreazione: Date;
  dataAggiornamento: Date;
  attivo: boolean;
}

// Interfaccia per risultato di ricerca
export interface GeographicSearchResult {
  id: string;
  nome: string;
  tipo: 'comune' | 'zona';
  provincia: string;
  regione: string;
  popolazione?: number;
  superficie?: number;
  latitudine: number;
  longitudine: number;
  score: number;
  distance?: number;
  metadata?: Record<string, any>;
}

// Interfaccia per risultato autocomplete
export interface GeographicAutocompleteResult {
  id: string;
  nome: string;
  tipo: 'comune' | 'zona';
  provincia: string;
  regione: string;
  popolazione?: number;
  latitudine?: number;
  longitudine?: number;
  score: number;
  highlight: string;
  text: string;
}

export class FirestoreGeographicService {
  private comuniCollection = 'comuni_italiani';
  private zoneCollection = 'zone_italiane';

  /**
   * Ricerca comuni e zone con filtri avanzati
   */
  async searchGeographicData(params: {
    query?: string;
    type?: 'comune' | 'zona' | 'all';
    region?: string | undefined;
    province?: string | undefined;
    lat?: number | undefined;
    lng?: number | undefined;
    radius?: number; // in km
    limit?: number;
    offset?: number;
    includeCoordinates?: boolean;
    includeMetadata?: boolean;
    sortBy?: 'relevance' | 'distance' | 'name' | 'population';
  }): Promise<{
    results: GeographicSearchResult[];
    total: number;
    hasMore: boolean;
    executionTime: number;
  }> {
    const startTime = Date.now();
    
    try {
      const {
        query = '',
        type = 'all',
        region,
        province,
        lat,
        lng,
        radius = 50,
        limit: limitParam = 20,
        offset = 0,
        includeCoordinates = true,
        includeMetadata = true,
        sortBy = 'relevance'
      } = params;

      // Inizializza i dati se necessario
      await this.initializeGeographicData();

      let allResults: GeographicSearchResult[] = [];

      // Ricerca comuni
      if (type === 'all' || type === 'comune') {
        const comuniResults = await this.searchComuni({
          query,
          region,
          province,
          lat,
          lng,
          radius,
          limit: limitParam * 2, // Prendi più risultati per avere abbastanza dopo il merge
          includeCoordinates,
          includeMetadata
        });
        allResults.push(...comuniResults);
      }

      // Ricerca zone
      if (type === 'all' || type === 'zona') {
        const zoneResults = await this.searchZone({
          query,
          region,
          province,
          lat,
          lng,
          radius,
          limit: limitParam * 2,
          includeCoordinates,
          includeMetadata
        });
        allResults.push(...zoneResults);
      }

      // Ordina risultati
      allResults = this.sortResults(allResults, sortBy, lat, lng);

      // Applica paginazione
      const total = allResults.length;
      const paginatedResults = allResults.slice(offset, offset + limitParam);
      const hasMore = offset + limitParam < total;

      return {
        results: paginatedResults,
        total,
        hasMore,
        executionTime: Date.now() - startTime
      };

    } catch (error: any) {
      console.error('❌ Errore ricerca geografica:', error);
      
      // Se è un errore di permessi, ritorna risultati vuoti
      if (error.code === 'permission-denied') {
        console.log('⚠️ Permessi Firebase insufficienti per ricerca geografica');
        return {
          results: [],
          total: 0,
          hasMore: false,
          executionTime: Date.now() - startTime
        };
      }
      
      // Ritorna risultati vuoti invece di lanciare errore
      return {
        results: [],
        total: 0,
        hasMore: false,
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * Autocomplete per comuni e zone
   */
  async autocompleteGeographicData(params: {
    query: string;
    type?: 'comune' | 'zona' | 'all';
    region?: string | undefined;
    province?: string | undefined;
    limit?: number;
    includeCoordinates?: boolean;
    fuzzy?: boolean;
  }): Promise<GeographicAutocompleteResult[]> {
    try {
      const {
        query,
        type = 'all',
        region,
        province,
        limit: limitParam = 10,
        includeCoordinates = false,
        fuzzy = true
      } = params;

      // Inizializza i dati se necessario
      await this.initializeGeographicData();

      let allResults: GeographicAutocompleteResult[] = [];

      // Autocomplete comuni
      if (type === 'all' || type === 'comune') {
        const comuniResults = await this.autocompleteComuni({
          query,
          region,
          province,
          limit: limitParam,
          includeCoordinates,
          fuzzy
        });
        allResults.push(...comuniResults);
      }

      // Autocomplete zone
      if (type === 'all' || type === 'zona') {
        const zoneResults = await this.autocompleteZone({
          query,
          region,
          province,
          limit: limitParam,
          includeCoordinates,
          fuzzy
        });
        allResults.push(...zoneResults);
      }

      // Ordina per score e popolazione
      allResults.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (b.popolazione || 0) - (a.popolazione || 0);
      });

      return allResults.slice(0, limitParam);

    } catch (error: any) {
      console.error('❌ Errore autocomplete geografico:', error);
      
      // Se è un errore di permessi, ritorna risultati vuoti
      if (error.code === 'permission-denied') {
        console.log('⚠️ Permessi Firebase insufficienti per autocomplete geografico');
        return [];
      }
      
      // Ritorna risultati vuoti invece di lanciare errore
      return [];
    }
  }

  /**
   * Ricerca comuni specifica
   */
  private async searchComuni(params: {
    query: string;
    region?: string;
    province?: string;
    lat?: number;
    lng?: number;
    radius?: number;
    limit: number;
    includeCoordinates: boolean;
    includeMetadata: boolean;
  }): Promise<GeographicSearchResult[]> {
    try {
      const {
        query: searchQuery,
        region,
        province,
        lat,
        lng,
        radius = 50,
        limit: limitParam,
        includeCoordinates,
        includeMetadata
      } = params;

      console.log(`🔍 Ricerca comuni: "${searchQuery}", regione: ${region}, provincia: ${province}, limit: ${limitParam}`);

      let q = query(collection(db, this.comuniCollection));

    // Filtri base
    const filters: any[] = [];
    
    if (region) {
      filters.push(where('regione', '==', region));
    }
    
    if (province) {
      filters.push(where('provincia', '==', province));
    }

    // Temporaneamente rimosso per debugging
    // filters.push(where('attivo', '==', true));

    // Applica filtri
    filters.forEach(filter => {
      q = query(q, filter);
    });

    // Ordina per popolazione (default)
    q = query(q, orderBy('popolazione', 'desc'));

    // Limita risultati
    q = query(q, limit(limitParam));

    const snapshot = await getDocs(q);
    console.log(`📊 Trovati ${snapshot.size} documenti in Firestore per comuni`);
    
    const results: GeographicSearchResult[] = [];

    snapshot.forEach(doc => {
      const data = doc.data() as ComuneItaliano;
      
      // Filtro per query se specificata
      if (searchQuery && !this.matchesQuery(data, searchQuery)) {
        return;
      }

      // Calcola distanza se coordinate specificate
      let distance: number | undefined;
      if (lat && lng) {
        distance = this.calculateDistance(lat, lng, data.latitudine, data.longitudine);
        if (distance > radius) {
          return; // Filtra per raggio
        }
      }

      // Calcola score di rilevanza
      const score = this.calculateRelevanceScore(data, searchQuery, lat, lng);

      results.push({
        id: doc.id,
        nome: data.nome,
        tipo: 'comune',
        provincia: data.provincia,
        regione: data.regione,
        popolazione: data.popolazione,
        superficie: data.superficie,
        latitudine: includeCoordinates ? data.latitudine : 0,
        longitudine: includeCoordinates ? data.longitudine : 0,
        score,
        distance,
        metadata: includeMetadata ? {
          codiceIstat: data.codiceIstat,
          codiceCatastale: data.codiceCatastale,
          altitudine: data.altitudine,
          zonaClimatica: data.zonaClimatica,
          cap: data.cap,
          prefisso: data.prefisso
        } : undefined
      });
    });

    console.log(`✅ Ricerca comuni completata: ${results.length} risultati per "${searchQuery}"`);
    return results;
    
    } catch (error: any) {
      console.error('❌ Errore ricerca comuni:', error);
      
      // Se è un errore di permessi Firebase, ritorna risultati vuoti
      if (error.code === 'permission-denied') {
        console.log('⚠️ Permessi Firebase insufficienti per ricerca comuni');
        return [];
      }
      
      // Per altri errori, ritorna comunque risultati vuoti
      return [];
    }
  }

  /**
   * Ricerca zone specifica
   */
  private async searchZone(params: {
    query: string;
    region?: string;
    province?: string;
    lat?: number;
    lng?: number;
    radius?: number;
    limit: number;
    includeCoordinates: boolean;
    includeMetadata: boolean;
  }): Promise<GeographicSearchResult[]> {
    try {
      const {
        query: searchQuery,
        region,
        province,
        lat,
        lng,
        radius = 50,
        limit: limitParam,
        includeCoordinates,
        includeMetadata
      } = params;

      let q = query(collection(db, this.zoneCollection));

    // Filtri base
    const filters: any[] = [];
    
    if (region) {
      filters.push(where('regione', '==', region));
    }
    
    if (province) {
      filters.push(where('provincia', '==', province));
    }

    filters.push(where('attivo', '==', true));

    // Applica filtri
    filters.forEach(filter => {
      q = query(q, filter);
    });

    // Ordina per popolazione (se disponibile) o nome
    q = query(q, orderBy('popolazione', 'desc'));

    // Limita risultati
    q = query(q, limit(limitParam));

    const snapshot = await getDocs(q);
    const results: GeographicSearchResult[] = [];

    snapshot.forEach(doc => {
      const data = doc.data() as ZonaItaliana;
      
      // Filtro per query se specificata
      if (searchQuery && !this.matchesQuery(data, searchQuery)) {
        return;
      }

      // Calcola distanza se coordinate specificate
      let distance: number | undefined;
      if (lat && lng) {
        distance = this.calculateDistance(lat, lng, data.latitudine, data.longitudine);
        if (distance > radius) {
          return; // Filtra per raggio
        }
      }

      // Calcola score di rilevanza
      const score = this.calculateRelevanceScore(data, searchQuery, lat, lng);

      results.push({
        id: doc.id,
        nome: data.nome,
        tipo: 'zona',
        provincia: data.provincia,
        regione: data.regione,
        popolazione: data.popolazione,
        superficie: data.superficie,
        latitudine: includeCoordinates ? data.latitudine : 0,
        longitudine: includeCoordinates ? data.longitudine : 0,
        score,
        distance,
        metadata: includeMetadata ? {
          tipo: data.tipo,
          comune: data.comune,
          caratteristiche: data.caratteristiche,
          servizi: data.servizi,
          trasporti: data.trasporti
        } : undefined
      });
    });

    return results;
    
    } catch (error: any) {
      console.error('❌ Errore ricerca zone:', error);
      
      // Se è un errore di permessi Firebase, ritorna risultati vuoti
      if (error.code === 'permission-denied') {
        console.log('⚠️ Permessi Firebase insufficienti per ricerca zone');
        return [];
      }
      
      // Per altri errori, ritorna comunque risultati vuoti
      return [];
    }
  }

  /**
   * Autocomplete comuni
   */
  private async autocompleteComuni(params: {
    query: string;
    region?: string;
    province?: string;
    limit: number;
    includeCoordinates: boolean;
    fuzzy: boolean;
  }): Promise<GeographicAutocompleteResult[]> {
    try {
      const { query: searchQuery, region, province, limit: limitParam, includeCoordinates, fuzzy } = params;

      let q = query(collection(db, this.comuniCollection));

    // Filtri base
    const filters: any[] = [];
    
    if (region) {
      filters.push(where('regione', '==', region));
    }
    
    if (province) {
      filters.push(where('provincia', '==', province));
    }

    filters.push(where('attivo', '==', true));

    // Applica filtri
    filters.forEach(filter => {
      q = query(q, filter);
    });

    // Ordina per popolazione
    q = query(q, orderBy('popolazione', 'desc'));

    // Limita risultati
    q = query(q, limit(limitParam * 3)); // Prendi più risultati per il filtro locale

    const snapshot = await getDocs(q);
    const results: GeographicAutocompleteResult[] = [];

    snapshot.forEach(doc => {
      const data = doc.data() as ComuneItaliano;
      
      // Calcola score di rilevanza per autocomplete
      const score = this.calculateAutocompleteScore(data, searchQuery, fuzzy);
      
      if (score > 0) {
        const text = `${data.nome}, ${data.provincia}, ${data.regione}`;
        const highlight = this.highlightText(text, searchQuery);

        results.push({
          id: doc.id,
          nome: data.nome,
          tipo: 'comune',
          provincia: data.provincia,
          regione: data.regione,
          popolazione: data.popolazione,
          latitudine: includeCoordinates ? data.latitudine : undefined,
          longitudine: includeCoordinates ? data.longitudine : undefined,
          score,
          highlight,
          text
        });
      }
    });

    return results;
    
    } catch (error: any) {
      console.error('❌ Errore autocomplete comuni:', error);
      
      // Se è un errore di permessi Firebase, ritorna risultati vuoti
      if (error.code === 'permission-denied') {
        console.log('⚠️ Permessi Firebase insufficienti per autocomplete comuni');
        return [];
      }
      
      // Per altri errori, ritorna comunque risultati vuoti
      return [];
    }
  }

  /**
   * Autocomplete zone
   */
  private async autocompleteZone(params: {
    query: string;
    region?: string;
    province?: string;
    limit: number;
    includeCoordinates: boolean;
    fuzzy: boolean;
  }): Promise<GeographicAutocompleteResult[]> {
    try {
      const { query: searchQuery, region, province, limit: limitParam, includeCoordinates, fuzzy } = params;

    let q = query(collection(db, this.zoneCollection));

    // Filtri base
    const filters: any[] = [];
    
    if (region) {
      filters.push(where('regione', '==', region));
    }
    
    if (province) {
      filters.push(where('provincia', '==', province));
    }

    filters.push(where('attivo', '==', true));

    // Applica filtri
    filters.forEach(filter => {
      q = query(q, filter);
    });

    // Ordina per popolazione (se disponibile) o nome
    q = query(q, orderBy('popolazione', 'desc'));

    // Limita risultati
    q = query(q, limit(limitParam * 3));

    const snapshot = await getDocs(q);
    const results: GeographicAutocompleteResult[] = [];

    snapshot.forEach(doc => {
      const data = doc.data() as ZonaItaliana;
      
      // Calcola score di rilevanza per autocomplete
      const score = this.calculateAutocompleteScore(data, searchQuery, fuzzy);
      
      if (score > 0) {
        const text = `${data.nome}, ${data.comune}, ${data.provincia}`;
        const highlight = this.highlightText(text, searchQuery);

        results.push({
          id: doc.id,
          nome: data.nome,
          tipo: 'zona',
          provincia: data.provincia,
          regione: data.regione,
          popolazione: data.popolazione,
          latitudine: includeCoordinates ? data.latitudine : undefined,
          longitudine: includeCoordinates ? data.longitudine : undefined,
          score,
          highlight,
          text
        });
      }
    });

    return results;
    
    } catch (error: any) {
      console.error('❌ Errore autocomplete zone:', error);
      
      // Se è un errore di permessi Firebase, ritorna risultati vuoti
      if (error.code === 'permission-denied') {
        console.log('⚠️ Permessi Firebase insufficienti per autocomplete zone');
        return [];
      }
      
      // Per altri errori, ritorna comunque risultati vuoti
      return [];
    }
  }

  /**
   * Verifica se un elemento corrisponde alla query
   */
  private matchesQuery(data: ComuneItaliano | ZonaItaliana, query: string): boolean {
    const queryLower = query.toLowerCase();
    
    return (
      data.nome.toLowerCase().includes(queryLower) ||
      data.provincia.toLowerCase().includes(queryLower) ||
      data.regione.toLowerCase().includes(queryLower) ||
      (data.codiceIstat && data.codiceIstat.includes(queryLower)) ||
      (data.codiceCatastale && data.codiceCatastale.includes(queryLower))
    );
  }

  /**
   * Calcola score di rilevanza per ricerca
   */
  private calculateRelevanceScore(
    data: ComuneItaliano | ZonaItaliana, 
    searchQuery: string, 
    lat?: number, 
    lng?: number
  ): number {
    let score = 0;
    const queryLower = searchQuery.toLowerCase();

    // Score per corrispondenza nome
    if (data.nome.toLowerCase().includes(queryLower)) {
      score += 100;
      if (data.nome.toLowerCase().startsWith(queryLower)) {
        score += 50;
      }
    }

    // Score per corrispondenza provincia
    if (data.provincia.toLowerCase().includes(queryLower)) {
      score += 30;
    }

    // Score per corrispondenza regione
    if (data.regione.toLowerCase().includes(queryLower)) {
      score += 20;
    }

    // Score per popolazione (più popoloso = più rilevante)
    const popolazione = 'popolazione' in data ? data.popolazione : 0;
    if (popolazione > 0) {
      score += Math.min(popolazione / 10000, 50); // Max 50 punti per popolazione
    }

    // Score per distanza (se coordinate specificate)
    if (lat && lng) {
      const distance = this.calculateDistance(lat, lng, data.latitudine, data.longitudine);
      if (distance < 10) score += 30;
      else if (distance < 25) score += 20;
      else if (distance < 50) score += 10;
    }

    return Math.round(score);
  }

  /**
   * Calcola score per autocomplete
   */
  private calculateAutocompleteScore(
    data: ComuneItaliano | ZonaItaliana, 
    searchQuery: string, 
    fuzzy: boolean
  ): number {
    const queryLower = searchQuery.toLowerCase();
    let score = 0;

    // Score per corrispondenza esatta
    if (data.nome.toLowerCase().startsWith(queryLower)) {
      score += 100;
    } else if (data.nome.toLowerCase().includes(queryLower)) {
      score += 80;
    } else if (data.provincia.toLowerCase().includes(queryLower)) {
      score += 60;
    } else if (data.regione.toLowerCase().includes(queryLower)) {
      score += 40;
    } else if (fuzzy) {
      // Score fuzzy per corrispondenze parziali
      const similarity = this.calculateSimilarity(data.nome.toLowerCase(), queryLower);
      if (similarity > 0.3) {
        score += similarity * 50;
      }
    }

    // Score per popolazione
    const popolazione = 'popolazione' in data ? data.popolazione : 0;
    if (popolazione > 0) {
      score += Math.min(popolazione / 20000, 30);
    }

    return Math.round(score);
  }

  /**
   * Calcola distanza tra due punti geografici (formula di Haversine)
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Raggio della Terra in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Converte gradi in radianti
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Calcola similarità tra due stringhe (algoritmo di Levenshtein semplificato)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calcola distanza di Levenshtein
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Evidenzia il testo di ricerca nei risultati
   */
  private highlightText(text: string, searchQuery: string): string {
    const queryLower = searchQuery.toLowerCase();
    const textLower = text.toLowerCase();
    
    if (!textLower.includes(queryLower)) {
      return text;
    }
    
    const startIndex = textLower.indexOf(queryLower);
    const endIndex = startIndex + searchQuery.length;
    
    return text.substring(0, startIndex) + 
           `<mark>${text.substring(startIndex, endIndex)}</mark>` + 
           text.substring(endIndex);
  }

  /**
   * Ordina risultati in base ai parametri
   */
  private sortResults(
    results: GeographicSearchResult[], 
    sortBy: string, 
    lat?: number, 
    lng?: number
  ): GeographicSearchResult[] {
    return results.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          if (lat && lng && a.distance && b.distance) {
            return a.distance - b.distance;
          }
          return b.score - a.score;
        
        case 'name':
          return a.nome.localeCompare(b.nome);
        
        case 'population':
          return (b.popolazione || 0) - (a.popolazione || 0);
        
        case 'relevance':
        default:
          return b.score - a.score;
      }
    });
  }

  /**
   * Inizializza dati geografici di base (da chiamare una volta)
   */
  async initializeGeographicData(): Promise<void> {
    try {
      console.log('🔄 Inizializzazione dati geografici italiani...');
      
      // Verifica se i dati esistono già
      const comuniSnapshot = await getDocs(collection(db, this.comuniCollection));
      console.log(`📊 Comuni esistenti in Firestore: ${comuniSnapshot.size}`);
      
      if (comuniSnapshot.size > 5) {
        console.log('✅ Dati geografici già presenti (più di 5 comuni)');
        return;
      }
      
      if (comuniSnapshot.size > 0) {
        console.log(`⚠️ Trovati ${comuniSnapshot.size} comuni esistenti, ma probabilmente incompleti. Procedendo con inizializzazione...`);
      }
      
      console.log('🔄 Inizializzazione necessaria - procedendo con inserimento dati...');

      // Inserisci comuni principali italiani
      const comuniPrincipali = this.getComuniPrincipali();
      console.log(`📝 Inserendo ${comuniPrincipali.length} comuni principali...`);
      
      const batch = writeBatch(db);

      comuniPrincipali.forEach((comune, index) => {
        const docRef = doc(collection(db, this.comuniCollection));
        batch.set(docRef, {
          ...comune,
          dataCreazione: new Date(),
          dataAggiornamento: new Date(),
          attivo: true
        });
        console.log(`📝 Preparato comune ${index + 1}: ${comune.nome}`);
      });

      console.log('💾 Committando batch a Firestore...');
      await batch.commit();
      console.log('✅ Dati geografici inizializzati con successo');

    } catch (error: any) {
      console.error('❌ Errore inizializzazione dati geografici:', error);
      console.error('❌ Codice errore:', error.code);
      console.error('❌ Messaggio errore:', error.message);
      
      // Se è un errore di permessi, continua senza inizializzazione
      if (error.code === 'permission-denied') {
        console.log('⚠️ Permessi Firebase insufficienti - continuando senza inizializzazione dati geografici');
        return;
      }
      
      // Per altri errori, rilancia sempre per debugging
      console.log('⚠️ Errore durante inizializzazione dati geografici');
      throw error; // Rilancia l'errore per debugging
    }
  }

  /**
   * Ottiene conteggio comuni in Firestore
   */
  async getComuniCount(): Promise<number> {
    try {
      const snapshot = await getDocs(collection(db, this.comuniCollection));
      return snapshot.size;
    } catch (error: any) {
      console.error('❌ Errore conteggio comuni:', error);
      return 0;
    }
  }

  /**
   * Ottiene conteggio zone in Firestore
   */
  async getZoneCount(): Promise<number> {
    try {
      const snapshot = await getDocs(collection(db, this.zoneCollection));
      return snapshot.size;
    } catch (error: any) {
      console.error('❌ Errore conteggio zone:', error);
      return 0;
    }
  }

  /**
   * Ottiene lista comuni principali italiani
   */
  private getComuniPrincipali(): Omit<ComuneItaliano, 'id' | 'dataCreazione' | 'dataAggiornamento' | 'attivo'>[] {
    return [
      {
        nome: 'Roma',
        provincia: 'Roma',
        regione: 'Lazio',
        codiceIstat: '058091',
        codiceCatastale: 'H501',
        popolazione: 2873000,
        superficie: 1285.31,
        latitudine: 41.9028,
        longitudine: 12.4964,
        altitudine: 21,
        zonaClimatica: 'D',
        cap: ['00100', '00118', '00119', '00120', '00121', '00122', '00123', '00124', '00125', '00126', '00127', '00128', '00131', '00132', '00133', '00134', '00135', '00136', '00137', '00138', '00139', '00141', '00142', '00143', '00144', '00145', '00146', '00147', '00148', '00149', '00151', '00152', '00153', '00154', '00155', '00156', '00157', '00158', '00159', '00161', '00162', '00163', '00164', '00165', '00166', '00167', '00168', '00169', '00171', '00172', '00173', '00174', '00175', '00176', '00177', '00178', '00179', '00181', '00182', '00183', '00184', '00185', '00186', '00187', '00188', '00189', '00191', '00192', '00193', '00194', '00195', '00196', '00197', '00198', '00199'],
        prefisso: '06',
        sitoWeb: 'https://www.comune.roma.it',
        email: 'protocollo@comune.roma.it',
        telefono: '06 0606',
        sindaco: 'Roberto Gualtieri',
        partito: 'Partito Democratico'
      },
      {
        nome: 'Milano',
        provincia: 'Milano',
        regione: 'Lombardia',
        codiceIstat: '015146',
        codiceCatastale: 'F205',
        popolazione: 1396000,
        superficie: 181.76,
        latitudine: 45.4642,
        longitudine: 9.1900,
        altitudine: 122,
        zonaClimatica: 'E',
        cap: ['20100', '20121', '20122', '20123', '20124', '20125', '20126', '20127', '20128', '20129', '20131', '20132', '20133', '20134', '20135', '20136', '20137', '20138', '20139', '20141', '20142', '20143', '20144', '20145', '20146', '20147', '20148', '20149', '20151', '20152', '20153', '20154', '20155', '20156', '20157', '20158', '20159', '20161', '20162', '20163', '20164', '20165', '20166', '20167', '20168', '20169', '20171', '20172', '20173', '20174', '20175', '20176', '20177', '20178', '20179', '20181', '20182', '20183', '20184', '20185', '20186', '20187', '20188', '20189', '20191', '20192', '20193', '20194', '20195', '20196', '20197', '20198', '20199'],
        prefisso: '02',
        sitoWeb: 'https://www.comune.milano.it',
        email: 'protocollo@comune.milano.it',
        telefono: '02 0202',
        sindaco: 'Giuseppe Sala',
        partito: 'Partito Democratico'
      },
      {
        nome: 'Napoli',
        provincia: 'Napoli',
        regione: 'Campania',
        codiceIstat: '063049',
        codiceCatastale: 'F839',
        popolazione: 914758,
        superficie: 117.27,
        latitudine: 40.8518,
        longitudine: 14.2681,
        altitudine: 17,
        zonaClimatica: 'C',
        cap: ['80100', '80121', '80122', '80123', '80124', '80125', '80126', '80127', '80128', '80129', '80131', '80132', '80133', '80134', '80135', '80136', '80137', '80138', '80139', '80141', '80142', '80143', '80144', '80145', '80146', '80147', '80148', '80149'],
        prefisso: '081',
        sitoWeb: 'https://www.comune.napoli.it',
        email: 'protocollo@comune.napoli.it',
        telefono: '081 081081',
        sindaco: 'Gaetano Manfredi',
        partito: 'Indipendente'
      },
      {
        nome: 'Torino',
        provincia: 'Torino',
        regione: 'Piemonte',
        codiceIstat: '001272',
        codiceCatastale: 'L219',
        popolazione: 848196,
        superficie: 130.17,
        latitudine: 45.0703,
        longitudine: 7.6869,
        altitudine: 239,
        zonaClimatica: 'E',
        cap: ['10100', '10121', '10122', '10123', '10124', '10125', '10126', '10127', '10128', '10129', '10131', '10132', '10133', '10134', '10135', '10136', '10137', '10138', '10139', '10141', '10142', '10143', '10144', '10145', '10146', '10147', '10148', '10149', '10151', '10152', '10153', '10154', '10155', '10156', '10157', '10158', '10159', '10161', '10162', '10163', '10164', '10165', '10166', '10167', '10168', '10169', '10171', '10172', '10173', '10174', '10175', '10176', '10177', '10178', '10179', '10181', '10182', '10183', '10184', '10185', '10186', '10187', '10188', '10189', '10191', '10192', '10193', '10194', '10195', '10196', '10197', '10198', '10199'],
        prefisso: '011',
        sitoWeb: 'https://www.comune.torino.it',
        email: 'protocollo@comune.torino.it',
        telefono: '011 011011',
        sindaco: 'Stefano Lo Russo',
        partito: 'Lega Nord'
      },
      {
        nome: 'Palermo',
        provincia: 'Palermo',
        regione: 'Sicilia',
        codiceIstat: '082053',
        codiceCatastale: 'G273',
        popolazione: 630828,
        superficie: 160.59,
        latitudine: 38.1157,
        longitudine: 13.3615,
        altitudine: 14,
        zonaClimatica: 'B',
        cap: ['90100', '90121', '90122', '90123', '90124', '90125', '90126', '90127', '90128', '90129', '90131', '90132', '90133', '90134', '90135', '90136', '90137', '90138', '90139', '90141', '90142', '90143', '90144', '90145', '90146', '90147', '90148', '90149', '90151', '90152', '90153', '90154', '90155', '90156', '90157', '90158', '90159', '90161', '90162', '90163', '90164', '90165', '90166', '90167', '90168', '90169', '90171', '90172', '90173', '90174', '90175', '90176', '90177', '90178', '90179', '90181', '90182', '90183', '90184', '90185', '90186', '90187', '90188', '90189', '90191', '90192', '90193', '90194', '90195', '90196', '90197', '90198', '90199'],
        prefisso: '091',
        sitoWeb: 'https://www.comune.palermo.it',
        email: 'protocollo@comune.palermo.it',
        telefono: '091 091091',
        sindaco: 'Roberto Lagalla',
        partito: 'Forza Italia'
      }
    ];
  }
}

// Esporta istanza singleton
export const firestoreGeographicService = new FirestoreGeographicService();
