import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  addDoc,
  GeoPoint,
} from 'firebase/firestore';

import { db } from './firebase';

export interface ProjectLocation {
  id: string;
  projectId: string;
  projectName: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
    firestoreGeoPoint: GeoPoint;
  };
  city: string;
  province: string;
  region: string;
  postalCode: string;
  country: string;
  zone: string;
  neighborhood: string;
  urbanArea: 'URBAN' | 'SUBURBAN' | 'RURAL' | 'COASTAL' | 'MOUNTAIN';
  zoning: 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'MIXED' | 'AGRICULTURAL';
  landUse: string;
  buildingType: 'VILLA' | 'APARTMENT' | 'OFFICE' | 'COMMERCIAL' | 'INDUSTRIAL' | 'MIXED';
  projectStatus: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
  budget: {
    estimated: number;
    actual: number;
    currency: string;
  };
  area: {
    landArea: number; // m²
    buildingArea: number; // m²
    floors: number;
  };
  timeline: {
    startDate: Date;
    estimatedEndDate: Date;
    actualEndDate?: Date;
  };
  marketData: {
    estimatedValue: number;
    currentValue?: number;
    roi: number;
    marketTrend: 'RISING' | 'STABLE' | 'DECLINING';
    demandLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  };
  constraints: {
    urbanPlanning: string[];
    environmental: string[];
    historical: string[];
    technical: string[];
  };
  amenities: {
    transport: string[];
    services: string[];
    education: string[];
    healthcare: string[];
    recreation: string[];
  };
  risks: {
    seismic: 'LOW' | 'MEDIUM' | 'HIGH';
    flood: 'LOW' | 'MEDIUM' | 'HIGH';
    landslide: 'LOW' | 'MEDIUM' | 'HIGH';
    environmental: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  documents: {
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedAt: Date;
  }[];
  notes: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
}

export interface MapFilter {
  projectStatus?: string[];
  buildingType?: string[];
  urbanArea?: string[];
  zoning?: string[];
  budgetRange?: {
    min: number;
    max: number;
  };
  areaRange?: {
    min: number;
    max: number;
  };
  roiRange?: {
    min: number;
    max: number;
  };
  city?: string[];
  province?: string[];
  region?: string[];
  tags?: string[];
}

export interface MapViewport {
  north: number;
  south: number;
  east: number;
  west: number;
  zoom: number;
  center: {
    lat: number;
    lng: number;
  };
}

export interface GeocodingResult {
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  city: string;
  province: string;
  region: string;
  postalCode: string;
  country: string;
  formattedAddress: string;
  confidence: number;
}

export interface MapCluster {
  id: string;
  center: {
    latitude: number;
    longitude: number;
  };
  projects: ProjectLocation[];
  count: number;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface CreateProjectLocationData {
  projectId: string;
  projectName: string;
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  city: string;
  province: string;
  region: string;
  postalCode: string;
  country: string;
  zone?: string;
  neighborhood?: string;
  urbanArea: ProjectLocation['urbanArea'];
  zoning: ProjectLocation['zoning'];
  landUse?: string;
  buildingType: ProjectLocation['buildingType'];
  projectStatus: ProjectLocation['projectStatus'];
  budget: {
    estimated: number;
    currency: string;
  };
  area: {
    landArea: number;
    buildingArea: number;
    floors: number;
  };
  timeline: {
    startDate: Date;
    estimatedEndDate: Date;
  };
  marketData: {
    estimatedValue: number;
    roi: number;
    marketTrend: ProjectLocation['marketData']['marketTrend'];
    demandLevel: ProjectLocation['marketData']['demandLevel'];
  };
  constraints?: string[];
  amenities?: string[];
  tags?: string[];
}

export class ProjectMapService {
  private readonly PROJECT_LOCATIONS_COLLECTION = 'projectLocations';
  private readonly MAP_VIEWS_COLLECTION = 'mapViews';
  private readonly GEOCODING_CACHE_COLLECTION = 'geocodingCache';

  /**
   * Crea una nuova posizione progetto
   */
  async createProjectLocation(locationData: CreateProjectLocationData): Promise<string> {
    try {
      console.log('🗺️ [ProjectMapService] Creazione posizione progetto:', locationData.projectName);

      // Se non sono fornite coordinate, geocodifica l'indirizzo
      let coordinates = locationData.coordinates;
      if (!coordinates) {
        const geocodingResult = await this.geocodeAddress(locationData.address);
        coordinates = geocodingResult.coordinates;
      }

      const locationId = `location-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newLocation: ProjectLocation = {
        id: locationId,
        projectId: locationData.projectId || 'unknown',
        projectName: locationData.projectName || 'Unknown Project',
        address: locationData.address || '',
        zone: locationData.zone || 'Non specificata',
        neighborhood: locationData.neighborhood || 'Non specificato',
        urbanArea: locationData.urbanArea || 'URBAN',
        zoning: locationData.zoning || 'RESIDENTIAL',
        landUse: locationData.landUse || 'Residenziale',
        buildingType: locationData.buildingType || 'VILLA',
        projectStatus: locationData.projectStatus || 'PLANNING',
        budget: {
          estimated: locationData.budget?.estimated || 0,
          actual: 0, // Will be updated when actual costs are known
          currency: locationData.budget?.currency || 'EUR',
        },
        area: {
          landArea: locationData.area?.landArea || 0,
          buildingArea: locationData.area?.buildingArea || 0,
          floors: locationData.area?.floors || 1,
        },
        timeline: {
          startDate: locationData.timeline?.startDate || new Date(),
          estimatedEndDate: locationData.timeline?.estimatedEndDate || new Date(),
        },
        marketData: {
          estimatedValue: locationData.marketData?.estimatedValue || 0,
          roi: locationData.marketData?.roi || 0,
          marketTrend: locationData.marketData?.marketTrend || 'STABLE',
          demandLevel: locationData.marketData?.demandLevel || 'MEDIUM',
        },
        coordinates: {
          ...coordinates!,
          firestoreGeoPoint: new GeoPoint(coordinates!.latitude, coordinates!.longitude),
        },
        city: locationData.city || '',
        province: locationData.province || '',
        region: locationData.region || '',
        postalCode: locationData.postalCode || '',
        country: locationData.country || 'Italia',
        constraints: {
          urbanPlanning: locationData.constraints || [],
          environmental: [],
          historical: [],
          technical: [],
        },
        amenities: {
          transport: locationData.amenities || [],
          services: [],
          education: [],
          healthcare: [],
          recreation: [],
        },
        risks: {
          seismic: 'LOW',
          flood: 'LOW',
          landslide: 'LOW',
          environmental: 'LOW',
        },
        documents: [],
        notes: [],
        tags: locationData.tags || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'current-user', // TODO: Integrare con AuthContext
        lastModifiedBy: 'current-user',
      };

      const locationRef = doc(db, this.PROJECT_LOCATIONS_COLLECTION, locationId);
      await setDoc(locationRef, {
        ...newLocation,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log('✅ [ProjectMapService] Posizione progetto creata con successo:', locationId);
      return locationId;
    } catch (error) {
      console.error('❌ [ProjectMapService] Errore creazione posizione progetto:', error);
      throw new Error(`Impossibile creare la posizione progetto: ${error}`);
    }
  }

  /**
   * Geocodifica un indirizzo usando OpenStreetMap Nominatim
   */
  async geocodeAddress(address: string): Promise<GeocodingResult> {
    try {
      console.log('🔍 [ProjectMapService] Geocodifica indirizzo:', address);

      // Prima controlla la cache
      const cachedResult = await this.getCachedGeocoding(address);
      if (cachedResult) {
        console.log('✅ [ProjectMapService] Risultato geocodifica dalla cache');
        return cachedResult;
      }

      // Geocodifica usando OpenStreetMap Nominatim
      const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=it&limit=1`;

      const response = await fetch(searchUrl);
      if (!response.ok) {
        throw new Error(`Errore geocodifica: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        throw new Error('Indirizzo non trovato');
      }

      const result = data[0];

      // Estrai informazioni dall'indirizzo
      const addressParts = this.parseAddressComponents(result.address);

      const geocodingResult: GeocodingResult = {
        address: address,
        coordinates: {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
        },
        city: addressParts.city || '',
        province: addressParts.province || '',
        region: addressParts.region || '',
        postalCode: addressParts.postalCode || '',
        country: addressParts.country || 'Italia',
        formattedAddress: result.display_name,
        confidence: 0.8,
      };

      // Salva in cache
      await this.cacheGeocodingResult(address, geocodingResult);

      console.log('✅ [ProjectMapService] Geocodifica completata:', geocodingResult);
      return geocodingResult;
    } catch (error) {
      console.error('❌ [ProjectMapService] Errore geocodifica:', error);
      throw new Error(`Impossibile geocodificare l'indirizzo: ${error}`);
    }
  }

  /**
   * Parsing dei componenti dell'indirizzo da Nominatim
   */
  private parseAddressComponents(address: any): {
    city: string;
    province: string;
    region: string;
    postalCode: string;
    country: string;
  } {
    return {
      city: address.city || address.town || address.village || address.municipality || '',
      province: address.state || address.province || '',
      region: address.region || '',
      postalCode: address.postcode || '',
      country: address.country || 'Italia',
    };
  }

  /**
   * Salva risultato geocodifica in cache
   */
  private async cacheGeocodingResult(address: string, result: GeocodingResult): Promise<void> {
    try {
      const cacheId = `cache-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const cacheRef = doc(db, this.GEOCODING_CACHE_COLLECTION, cacheId);

      await setDoc(cacheRef, {
        address: address.toLowerCase(),
        result,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 giorni
      });
    } catch (error) {
      console.warn('⚠️ [ProjectMapService] Errore salvataggio cache geocodifica:', error);
    }
  }

  /**
   * Recupera risultato geocodifica dalla cache
   */
  private async getCachedGeocoding(address: string): Promise<GeocodingResult | null> {
    try {
      const cacheRef = collection(db, this.GEOCODING_CACHE_COLLECTION);
      const q = query(
        cacheRef,
        where('address', '==', address.toLowerCase()),
        where('expiresAt', '>', new Date())
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        if (doc) {
          const cached = doc.data();
          return cached.result as GeocodingResult;
        }
      }

      return null;
    } catch (error) {
      console.warn('⚠️ [ProjectMapService] Errore recupero cache geocodifica:', error);
      return null;
    }
  }

  /**
   * Recupera tutte le posizioni progetto
   */
  async getAllProjectLocations(): Promise<ProjectLocation[]> {
    try {
      console.log('📋 [ProjectMapService] Recupero tutte le posizioni progetto');

      const locationsRef = collection(db, this.PROJECT_LOCATIONS_COLLECTION);
      const q = query(locationsRef, orderBy('createdAt', 'desc'));

      const querySnapshot = await getDocs(q);
      const locations: ProjectLocation[] = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        locations.push({
          ...data,
          coordinates: {
            latitude: data.coordinates.firestoreGeoPoint.latitude,
            longitude: data.coordinates.firestoreGeoPoint.longitude,
            firestoreGeoPoint: data.coordinates.firestoreGeoPoint,
          },
          timeline: {
            startDate: data.timeline.startDate?.toDate() || new Date(),
            estimatedEndDate: data.timeline.estimatedEndDate?.toDate() || new Date(),
            actualEndDate: data.timeline.actualEndDate?.toDate(),
          },
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as ProjectLocation);
      });

      console.log('✅ [ProjectMapService] Posizioni progetto recuperate:', locations.length);
      return locations;
    } catch (error) {
      console.error('❌ [ProjectMapService] Errore recupero posizioni progetto:', error);
      throw new Error(`Impossibile recuperare le posizioni progetto: ${error}`);
    }
  }

  /**
   * Recupera posizioni progetto con filtri
   */
  async getProjectLocationsWithFilters(filters: MapFilter): Promise<ProjectLocation[]> {
    try {
      console.log('🔍 [ProjectMapService] Recupero posizioni progetto con filtri:', filters);

      let locations = await this.getAllProjectLocations();

      // Applica filtri
      if (filters.projectStatus && filters.projectStatus.length > 0) {
        locations = locations.filter(l => filters.projectStatus!.includes(l.projectStatus));
      }

      if (filters.buildingType && filters.buildingType.length > 0) {
        locations = locations.filter(l => filters.buildingType!.includes(l.buildingType));
      }

      if (filters.urbanArea && filters.urbanArea.length > 0) {
        locations = locations.filter(l => filters.urbanArea!.includes(l.urbanArea));
      }

      if (filters.zoning && filters.zoning.length > 0) {
        locations = locations.filter(l => filters.zoning!.includes(l.zoning));
      }

      if (filters.budgetRange) {
        locations = locations.filter(
          l =>
            l.budget.estimated >= filters.budgetRange!.min &&
            l.budget.estimated <= filters.budgetRange!.max
        );
      }

      if (filters.areaRange) {
        locations = locations.filter(
          l =>
            l.area.landArea >= filters.areaRange!.min && l.area.landArea <= filters.areaRange!.max
        );
      }

      if (filters.roiRange) {
        locations = locations.filter(
          l =>
            l.marketData.roi >= filters.roiRange!.min && l.marketData.roi >= filters.roiRange!.max
        );
      }

      if (filters.city && filters.city.length > 0) {
        locations = locations.filter(l => filters.city!.includes(l.city));
      }

      if (filters.province && filters.province.length > 0) {
        locations = locations.filter(l => filters.province!.includes(l.province));
      }

      if (filters.region && filters.region.length > 0) {
        locations = locations.filter(l => filters.region!.includes(l.region));
      }

      if (filters.tags && filters.tags.length > 0) {
        locations = locations.filter(l => filters.tags!.some(tag => l.tags.includes(tag)));
      }

      console.log('✅ [ProjectMapService] Posizioni filtrate recuperate:', locations.length);
      return locations;
    } catch (error) {
      console.error('❌ [ProjectMapService] Errore filtri posizioni progetto:', error);
      throw new Error(`Impossibile filtrare le posizioni progetto: ${error}`);
    }
  }

  /**
   * Recupera posizioni progetto per viewport
   */
  async getProjectLocationsInViewport(viewport: MapViewport): Promise<ProjectLocation[]> {
    try {
      console.log('🗺️ [ProjectMapService] Recupero posizioni in viewport:', viewport);

      const locations = await this.getAllProjectLocations();

      // Filtra per viewport
      const locationsInViewport = locations.filter(
        location =>
          location.coordinates.latitude >= viewport.south &&
          location.coordinates.latitude <= viewport.north &&
          location.coordinates.longitude >= viewport.west &&
          location.coordinates.longitude <= viewport.east
      );

      console.log('✅ [ProjectMapService] Posizioni in viewport:', locationsInViewport.length);
      return locationsInViewport;
    } catch (error) {
      console.error('❌ [ProjectMapService] Errore recupero viewport:', error);
      throw new Error(`Impossibile recuperare le posizioni in viewport: ${error}`);
    }
  }

  /**
   * Crea cluster per visualizzazione mappa
   */
  async createMapClusters(locations: ProjectLocation[], zoom: number): Promise<MapCluster[]> {
    try {
      console.log('🔗 [ProjectMapService] Creazione cluster per zoom:', zoom);

      if (zoom >= 12) {
        // Zoom alto: mostra tutti i progetti individualmente
        return locations.map(location => ({
          id: `cluster-${location.id}`,
          center: location.coordinates,
          projects: [location],
          count: 1,
          bounds: {
            north: location.coordinates.latitude + 0.001,
            south: location.coordinates.latitude - 0.001,
            east: location.coordinates.longitude + 0.001,
            west: location.coordinates.longitude - 0.001,
          },
        }));
      }

      // Zoom basso: crea cluster
      const clusters: MapCluster[] = [];
      const clusterRadius = zoom < 8 ? 2 : zoom < 10 ? 1 : 0.5; // gradi

      locations.forEach(location => {
        let addedToCluster = false;

        for (const cluster of clusters) {
          const distance = this.calculateDistance(location.coordinates, cluster.center);

          if (distance <= clusterRadius) {
            cluster.projects.push(location);
            cluster.count++;

            // Aggiorna centro cluster
            cluster.center.latitude =
              cluster.projects.reduce((sum, p) => sum + p.coordinates.latitude, 0) /
              cluster.projects.length;
            cluster.center.longitude =
              cluster.projects.reduce((sum, p) => sum + p.coordinates.longitude, 0) /
              cluster.projects.length;

            // Aggiorna bounds
            cluster.bounds.north = Math.max(
              cluster.bounds.north,
              location.coordinates.latitude + 0.001
            );
            cluster.bounds.south = Math.min(
              cluster.bounds.south,
              location.coordinates.latitude - 0.001
            );
            cluster.bounds.east = Math.max(
              cluster.bounds.east,
              location.coordinates.longitude + 0.001
            );
            cluster.bounds.west = Math.min(
              cluster.bounds.west,
              location.coordinates.longitude - 0.001
            );

            addedToCluster = true;
            break;
          }
        }

        if (!addedToCluster) {
          clusters.push({
            id: `cluster-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            center: location.coordinates,
            projects: [location],
            count: 1,
            bounds: {
              north: location.coordinates.latitude + 0.001,
              south: location.coordinates.latitude - 0.001,
              east: location.coordinates.longitude + 0.001,
              west: location.coordinates.longitude - 0.001,
            },
          });
        }
      });

      console.log('✅ [ProjectMapService] Cluster creati:', clusters.length);
      return clusters;
    } catch (error) {
      console.error('❌ [ProjectMapService] Errore creazione cluster:', error);
      throw new Error(`Impossibile creare i cluster: ${error}`);
    }
  }

  /**
   * Calcola distanza tra due coordinate
   */
  private calculateDistance(
    coord1: { latitude: number; longitude: number },
    coord2: { latitude: number; longitude: number }
  ): number {
    const R = 6371; // Raggio Terra in km
    const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((coord1.latitude * Math.PI) / 180) *
        Math.cos((coord2.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Inizializza posizioni progetto di esempio
   */
  async initializeSampleProjectLocations(): Promise<void> {
    try {
      console.log('🏗️ [ProjectMapService] Inizializzazione posizioni progetto esempio');

      const sampleLocations: CreateProjectLocationData[] = [
        {
          projectId: 'project-1',
          projectName: 'Villa Moderna Roma',
          address: 'Via Appia Antica 123, Roma, RM, Italia',
          city: 'Roma',
          province: 'RM',
          region: 'Lazio',
          postalCode: '00179',
          country: 'Italia',
          zone: 'Appio',
          neighborhood: 'Appio Antico',
          urbanArea: 'URBAN',
          zoning: 'RESIDENTIAL',
          landUse: 'Residenziale',
          buildingType: 'VILLA',
          projectStatus: 'IN_PROGRESS',
          budget: { estimated: 850000, currency: 'EUR' },
          area: { landArea: 450, buildingArea: 280, floors: 2 },
          timeline: {
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            estimatedEndDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
          },
          marketData: {
            estimatedValue: 1200000,
            roi: 15.2,
            marketTrend: 'RISING',
            demandLevel: 'HIGH',
          },
          constraints: ['Vincolo paesaggistico', 'Distanza minima 10m'],
          amenities: ['Metro A', 'Centro commerciale', 'Scuola'],
          tags: ['villa', 'moderna', 'roma', 'appio'],
        },
        {
          projectId: 'project-2',
          projectName: 'Appartamento Centro Milano',
          address: 'Via Montenapoleone 45, Milano, MI, Italia',
          city: 'Milano',
          province: 'MI',
          region: 'Lombardia',
          postalCode: '20121',
          country: 'Italia',
          zone: 'Centro',
          neighborhood: 'Quadrilatero della Moda',
          urbanArea: 'URBAN',
          zoning: 'RESIDENTIAL',
          landUse: 'Residenziale di lusso',
          buildingType: 'APARTMENT',
          projectStatus: 'PLANNING',
          budget: { estimated: 1200000, currency: 'EUR' },
          area: { landArea: 120, buildingArea: 95, floors: 1 },
          timeline: {
            startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            estimatedEndDate: new Date(Date.now() + 240 * 24 * 60 * 60 * 1000),
          },
          marketData: {
            estimatedValue: 1800000,
            roi: 18.5,
            marketTrend: 'RISING',
            demandLevel: 'HIGH',
          },
          constraints: ['Vincolo storico', 'Ristrutturazione conservativa'],
          amenities: ['Metro M1', 'Shopping di lusso', 'Ristoranti'],
          tags: ['appartamento', 'lusso', 'milano', 'centro'],
        },
        {
          projectId: 'project-3',
          projectName: 'Uffici Commerciali Torino',
          address: 'Corso Vittorio Emanuele II 78, Torino, TO, Italia',
          city: 'Torino',
          province: 'TO',
          region: 'Piemonte',
          postalCode: '10121',
          country: 'Italia',
          zone: 'Centro',
          neighborhood: 'Quadrilatero Romano',
          urbanArea: 'URBAN',
          zoning: 'COMMERCIAL',
          landUse: 'Uffici e commercio',
          buildingType: 'OFFICE',
          projectStatus: 'COMPLETED',
          budget: { estimated: 2500000, currency: 'EUR' },
          area: { landArea: 800, buildingArea: 1200, floors: 4 },
          timeline: {
            startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
            estimatedEndDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
          marketData: {
            estimatedValue: 3200000,
            roi: 12.8,
            marketTrend: 'STABLE',
            demandLevel: 'MEDIUM',
          },
          constraints: ['Vincolo architettonico', 'Parcheggio obbligatorio'],
          amenities: ['Metro', 'Stazione Porta Nuova', 'Università'],
          tags: ['uffici', 'commerciale', 'torino', 'centro'],
        },
      ];

      // Crea le posizioni progetto
      for (const locationData of sampleLocations) {
        await this.createProjectLocation(locationData);
      }

      console.log(
        '✅ [ProjectMapService] Posizioni progetto esempio inizializzate:',
        sampleLocations.length
      );
    } catch (error) {
      console.error('❌ [ProjectMapService] Errore inizializzazione posizioni esempio:', error);
      throw new Error(`Impossibile inizializzare le posizioni progetto esempio: ${error}`);
    }
  }

  /**
   * Aggiorna una posizione progetto
   */
  async updateProjectLocation(
    locationId: string,
    updates: Partial<ProjectLocation>
  ): Promise<void> {
    try {
      console.log('✏️ [ProjectMapService] Aggiornamento posizione progetto:', locationId);

      const locationRef = doc(db, this.PROJECT_LOCATIONS_COLLECTION, locationId);
      await updateDoc(locationRef, {
        ...updates,
        updatedAt: serverTimestamp(),
        lastModifiedBy: 'current-user', // TODO: Integrare con AuthContext
      });

      console.log('✅ [ProjectMapService] Posizione progetto aggiornata con successo');
    } catch (error) {
      console.error('❌ [ProjectMapService] Errore aggiornamento posizione progetto:', error);
      throw new Error(`Impossibile aggiornare la posizione progetto: ${error}`);
    }
  }

  /**
   * Elimina una posizione progetto
   */
  async deleteProjectLocation(locationId: string): Promise<void> {
    try {
      console.log('🗑️ [ProjectMapService] Eliminazione posizione progetto:', locationId);

      const locationRef = doc(db, this.PROJECT_LOCATIONS_COLLECTION, locationId);
      await deleteDoc(locationRef);

      console.log('✅ [ProjectMapService] Posizione progetto eliminata con successo');
    } catch (error) {
      console.error('❌ [ProjectMapService] Errore eliminazione posizione progetto:', error);
      throw new Error(`Impossibile eliminare la posizione progetto: ${error}`);
    }
  }
}

// Esporta un'istanza singleton
export const projectMapService = new ProjectMapService();
