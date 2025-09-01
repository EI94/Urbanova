export interface LocationZone {
  id: string;
  name: string;
  type: 'quartiere' | 'zona' | 'comune' | 'provincia';
  parent?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  searchTerms: string[];
}
export interface LocationSearchResult {
  zone: LocationZone;
  relevance: number;
  searchUrl: string;
}
export declare class AdvancedLocationService {
  private romeZones;
  private milanZones;
  private naplesZones;
  searchLocations(query: string): LocationSearchResult[];
  generateSearchUrl(zone: LocationZone): string;
  getCityZones(city: string): LocationZone[];
  getZonesByType(city: string, type: 'quartiere' | 'comune'): LocationZone[];
  getSuggestions(query: string): string[];
}
export declare const advancedLocationService: AdvancedLocationService;
//# sourceMappingURL=advancedLocationService.d.ts.map
