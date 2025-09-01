import { LandSearchCriteria } from './realWebScraper';
export declare class CacheService {
  private static instance;
  private cache;
  private readonly DEFAULT_TTL;
  private readonly MAX_CACHE_SIZE;
  private constructor();
  static getInstance(): CacheService;
  private generateSearchKey;
  private hashString;
  get(criteria: LandSearchCriteria): Promise<any | null>;
  set(criteria: LandSearchCriteria, data: any, ttl?: number): Promise<void>;
  private evictOldest;
  private cleanup;
  invalidateByLocation(location: string): Promise<void>;
  getStats(): {
    size: number;
    hitRate: number;
  };
  clear(): void;
}
export declare const cacheService: CacheService;
//# sourceMappingURL=cacheService.d.ts.map
