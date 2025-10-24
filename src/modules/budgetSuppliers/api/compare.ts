/**
 * 📊 COMPARE API
 * 
 * API per confronto offerte e calcolo score
 */

import { NormalizedOffer, NormalizedOfferLine } from '../lib/normalize';

export interface ComparisonItem {
  code?: string;
  description: string;
  category?: string;
  uom: string;
  qty: number;
  offers: {
    [vendorName: string]: {
      unitPrice: number;
      totalPrice: number;
      unitPriceWithVat: number;
      totalPriceWithVat: number;
      vatRate: number;
      notes?: string;
      exclusions?: string;
      leadTime?: string;
      hasOffer: boolean;
      isExcluded: boolean;
    };
  };
  bestOffer?: {
    vendorName: string;
    unitPrice: number;
    savings: number;
    savingsPercentage: number;
  };
}

export interface VendorScore {
  vendorName: string;
  vendorEmail: string;
  totalScore: number;
  breakdown: {
    priceScore: number;
    leadTimeScore: number;
    complianceScore: number;
  };
  totalValue: number;
  totalValueWithVat: number;
  itemsOffered: number;
  itemsExcluded: number;
  missingItems: number;
  averageLeadTime: number;
}

export interface ComparisonResult {
  items: ComparisonItem[];
  vendorScores: VendorScore[];
  summary: {
    totalItems: number;
    totalVendors: number;
    bestOverallVendor: string;
    totalSavings: number;
    averageSavings: number;
  };
  metadata: {
    comparedAt: number;
    comparisonId: string;
    projectId: string;
  };
}

export interface ComparisonWeights {
  price: number;      // Default: 60
  leadTime: number;   // Default: 20
  compliance: number; // Default: 20
}

export class CompareService {
  
  // Confronta multiple offerte
  static async compareOffers(
    offers: NormalizedOffer[],
    weights: ComparisonWeights = { price: 60, leadTime: 20, compliance: 20 }
  ): Promise<ComparisonResult> {
    try {
      console.log('📊 [COMPARE] Confronto offerte:', offers.length);
      
      // Normalizza pesi
      const totalWeight = weights.price + weights.leadTime + weights.compliance;
      const normalizedWeights = {
        price: weights.price / totalWeight,
        leadTime: weights.leadTime / totalWeight,
        compliance: weights.compliance / totalWeight
      };
      
      // Crea matrice confronto
      const comparisonItems = this.createComparisonMatrix(offers);
      
      // Calcola score fornitori
      const vendorScores = this.calculateVendorScores(offers, comparisonItems, normalizedWeights);
      
      // Trova migliori offerte per item
      this.findBestOffersPerItem(comparisonItems);
      
      // Calcola summary
      const summary = this.calculateSummary(comparisonItems, vendorScores);
      
      const result: ComparisonResult = {
        items: comparisonItems,
        vendorScores,
        summary,
        metadata: {
          comparedAt: Date.now(),
          comparisonId: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          projectId: 'test-project' // TODO: Passare projectId
        }
      };
      
      console.log('✅ [COMPARE] Confronto completato:', result.summary);
      return result;
      
    } catch (error: any) {
      console.error('❌ [COMPARE] Errore confronto offerte:', error);
      throw new Error(`Errore confronto offerte: ${error.message}`);
    }
  }

  // Crea matrice confronto
  private static createComparisonMatrix(offers: NormalizedOffer[]): ComparisonItem[] {
    const itemMap = new Map<string, ComparisonItem>();
    
    // Raccogli tutti gli items unici
    offers.forEach(offer => {
      offer.lines.forEach(line => {
        const key = this.getItemKey(line);
        
        if (!itemMap.has(key)) {
          itemMap.set(key, {
            code: line.code,
            description: line.description,
            category: line.category,
            uom: line.uom,
            qty: line.qty,
            offers: {}
          });
        }
      });
    });
    
    // Popola offerte per ogni item
    offers.forEach(offer => {
      const vendorName = offer.vendorName;
      
      // Inizializza tutti gli items per questo fornitore
      itemMap.forEach((item, key) => {
        item.offers[vendorName] = {
          unitPrice: 0,
          totalPrice: 0,
          unitPriceWithVat: 0,
          totalPriceWithVat: 0,
          vatRate: 0,
          hasOffer: false,
          isExcluded: false
        };
      });
      
      // Popola offerte effettive
      offer.lines.forEach(line => {
        const key = this.getItemKey(line);
        const item = itemMap.get(key);
        
        if (item) {
          item.offers[vendorName] = {
            unitPrice: line.unitPrice,
            totalPrice: line.totalPrice,
            unitPriceWithVat: line.unitPriceWithVat,
            totalPriceWithVat: line.totalPriceWithVat,
            vatRate: line.vatRate,
            notes: line.notes,
            exclusions: line.exclusions,
            leadTime: line.leadTime,
            hasOffer: true,
            isExcluded: !!(line.exclusions && line.exclusions.trim())
          };
        }
      });
    });
    
    return Array.from(itemMap.values());
  }

  // Genera chiave univoca per item
  private static getItemKey(line: NormalizedOfferLine): string {
    // Usa codice se disponibile, altrimenti descrizione normalizzata
    const identifier = line.code || line.description.toLowerCase().trim();
    return `${identifier}_${line.uom}`;
  }

  // Calcola score fornitori
  private static calculateVendorScores(
    offers: NormalizedOffer[],
    comparisonItems: ComparisonItem[],
    weights: ComparisonWeights
  ): VendorScore[] {
    
    return offers.map(offer => {
      const vendorName = offer.vendorName;
      
      // Calcola metriche base
      const itemsOffered = comparisonItems.filter(item => 
        item.offers[vendorName]?.hasOffer
      ).length;
      
      const itemsExcluded = comparisonItems.filter(item => 
        item.offers[vendorName]?.isExcluded
      ).length;
      
      const missingItems = comparisonItems.length - itemsOffered;
      
      const totalValue = offer.metadata.totalValue;
      const totalValueWithVat = offer.metadata.totalValueWithVat;
      
      // Calcola score prezzo (inverso del prezzo medio)
      const priceScore = this.calculatePriceScore(offer, comparisonItems, vendorName);
      
      // Calcola score lead time
      const leadTimeScore = this.calculateLeadTimeScore(offer, comparisonItems, vendorName);
      
      // Calcola score compliance
      const complianceScore = this.calculateComplianceScore(offer, comparisonItems, vendorName);
      
      // Score totale ponderato
      const totalScore = (
        priceScore * weights.price +
        leadTimeScore * weights.leadTime +
        complianceScore * weights.compliance
      );
      
      // Calcola lead time medio
      const averageLeadTime = this.calculateAverageLeadTime(offer);
      
      return {
        vendorName,
        vendorEmail: offer.vendorEmail,
        totalScore,
        breakdown: {
          priceScore,
          leadTimeScore,
          complianceScore
        },
        totalValue,
        totalValueWithVat,
        itemsOffered,
        itemsExcluded,
        missingItems,
        averageLeadTime
      };
    });
  }

  // Calcola score prezzo
  private static calculatePriceScore(
    offer: NormalizedOffer,
    comparisonItems: ComparisonItem[],
    vendorName: string
  ): number {
    const vendorOffers = comparisonItems
      .filter(item => item.offers[vendorName]?.hasOffer)
      .map(item => item.offers[vendorName]);
    
    if (vendorOffers.length === 0) return 0;
    
    // Score basato su posizione nel ranking prezzi
    const allPrices = comparisonItems
      .map(item => Object.values(item.offers)
        .filter(offer => offer.hasOffer)
        .map(offer => offer.unitPriceWithVat)
      )
      .flat()
      .filter(price => price > 0);
    
    if (allPrices.length === 0) return 0;
    
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    
    if (maxPrice === minPrice) return 1;
    
    const vendorAvgPrice = vendorOffers.reduce((sum, offer) => sum + offer.unitPriceWithVat, 0) / vendorOffers.length;
    
    // Score inverso: prezzo più basso = score più alto
    return 1 - ((vendorAvgPrice - minPrice) / (maxPrice - minPrice));
  }

  // Calcola score lead time
  private static calculateLeadTimeScore(
    offer: NormalizedOffer,
    comparisonItems: ComparisonItem[],
    vendorName: string
  ): number {
    const leadTimes = offer.lines
      .filter(line => line.leadTime)
      .map(line => this.parseLeadTime(line.leadTime!));
    
    if (leadTimes.length === 0) return 0.5; // Score neutro se non specificato
    
    const avgLeadTime = leadTimes.reduce((sum, days) => sum + days, 0) / leadTimes.length;
    
    // Score basato su lead time (più veloce = score più alto)
    // Assumiamo che 30 giorni sia il benchmark
    const benchmarkDays = 30;
    return Math.max(0, Math.min(1, 1 - (avgLeadTime - benchmarkDays) / benchmarkDays));
  }

  // Calcola score compliance
  private static calculateComplianceScore(
    offer: NormalizedOffer,
    comparisonItems: ComparisonItem[],
    vendorName: string
  ): number {
    const totalItems = comparisonItems.length;
    const itemsOffered = comparisonItems.filter(item => 
      item.offers[vendorName]?.hasOffer
    ).length;
    
    const itemsExcluded = comparisonItems.filter(item => 
      item.offers[vendorName]?.isExcluded
    ).length;
    
    // Score basato su completezza offerta
    const completenessScore = itemsOffered / totalItems;
    
    // Penalità per esclusioni
    const exclusionPenalty = itemsExcluded / totalItems * 0.5;
    
    return Math.max(0, completenessScore - exclusionPenalty);
  }

  // Calcola lead time medio in giorni
  private static calculateAverageLeadTime(offer: NormalizedOffer): number {
    const leadTimes = offer.lines
      .filter(line => line.leadTime)
      .map(line => this.parseLeadTime(line.leadTime!));
    
    if (leadTimes.length === 0) return 0;
    
    return leadTimes.reduce((sum, days) => sum + days, 0) / leadTimes.length;
  }

  // Parse lead time in giorni
  private static parseLeadTime(leadTime: string): number {
    const text = leadTime.toLowerCase().trim();
    
    // Pattern comuni
    const patterns = [
      { pattern: /(\d+)\s*giorni?/i, factor: 1 },
      { pattern: /(\d+)\s*gg/i, factor: 1 },
      { pattern: /(\d+)\s*settimane?/i, factor: 7 },
      { pattern: /(\d+)\s*sett/i, factor: 7 },
      { pattern: /(\d+)\s*mesi?/i, factor: 30 },
      { pattern: /(\d+)\s*ore?/i, factor: 1/24 }
    ];
    
    for (const { pattern, factor } of patterns) {
      const match = text.match(pattern);
      if (match) {
        return parseInt(match[1]) * factor;
      }
    }
    
    // Fallback: cerca solo numeri
    const numbers = text.match(/\d+/);
    if (numbers) {
      return parseInt(numbers[0]);
    }
    
    return 0;
  }

  // Trova migliori offerte per item
  private static findBestOffersPerItem(comparisonItems: ComparisonItem[]): void {
    comparisonItems.forEach(item => {
      const validOffers = Object.entries(item.offers)
        .filter(([, offer]) => offer.hasOffer && !offer.isExcluded)
        .map(([vendorName, offer]) => ({
          vendorName,
          unitPrice: offer.unitPriceWithVat
        }));
      
      if (validOffers.length > 0) {
        const bestOffer = validOffers.reduce((best, current) => 
          current.unitPrice < best.unitPrice ? current : best
        );
        
        const allPrices = validOffers.map(o => o.unitPrice);
        const maxPrice = Math.max(...allPrices);
        const savings = maxPrice - bestOffer.unitPrice;
        const savingsPercentage = (savings / maxPrice) * 100;
        
        item.bestOffer = {
          vendorName: bestOffer.vendorName,
          unitPrice: bestOffer.unitPrice,
          savings,
          savingsPercentage
        };
      }
    });
  }

  // Calcola summary
  private static calculateSummary(
    comparisonItems: ComparisonItem[],
    vendorScores: VendorScore[]
  ): ComparisonResult['summary'] {
    
    const bestOverallVendor = vendorScores.reduce((best, current) => 
      current.totalScore > best.totalScore ? current : best
    );
    
    const totalSavings = comparisonItems.reduce((sum, item) => {
      if (item.bestOffer) {
        return sum + item.bestOffer.savings * item.qty;
      }
      return sum;
    }, 0);
    
    const averageSavings = comparisonItems.length > 0 
      ? totalSavings / comparisonItems.length 
      : 0;
    
    return {
      totalItems: comparisonItems.length,
      totalVendors: vendorScores.length,
      bestOverallVendor: bestOverallVendor.vendorName,
      totalSavings,
      averageSavings
    };
  }

  // Esporta confronto in Excel
  static async exportComparisonToExcel(comparison: ComparisonResult): Promise<Blob> {
    try {
      console.log('📊 [COMPARE] Esportazione Excel confronto');
      
      // Simula creazione Excel (in produzione useresti xlsx)
      const data = JSON.stringify(comparison, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      
      console.log('✅ [COMPARE] Excel esportato');
      return blob;
      
    } catch (error: any) {
      console.error('❌ [COMPARE] Errore esportazione Excel:', error);
      throw new Error(`Errore esportazione Excel: ${error.message}`);
    }
  }

  // Valida confronto
  static validateComparison(comparison: ComparisonResult): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = [];
    
    if (comparison.items.length === 0) {
      warnings.push('Nessun item da confrontare');
    }
    
    if (comparison.vendorScores.length < 2) {
      warnings.push('Confronto richiede almeno 2 fornitori');
    }
    
    const itemsWithoutOffers = comparison.items.filter(item => 
      Object.values(item.offers).every(offer => !offer.hasOffer)
    );
    
    if (itemsWithoutOffers.length > 0) {
      warnings.push(`${itemsWithoutOffers.length} items senza offerte`);
    }
    
    return {
      isValid: warnings.length === 0,
      warnings
    };
  }
}
