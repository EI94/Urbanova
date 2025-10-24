/**
 * 🔧 NORMALIZE
 * 
 * Normalizzazione UM e IVA per confronto offerte
 */

export interface NormalizedOfferLine {
  code?: string;
  description: string;
  category?: string;
  uom: string;
  qty: number;
  unitPrice: number;
  totalPrice: number;
  unitPriceWithVat: number;
  totalPriceWithVat: number;
  vatRate: number;
  notes?: string;
  exclusions?: string;
  leadTime?: string;
  originalUom?: string; // UM originale per tracciabilità
  originalPrice?: number; // Prezzo originale per tracciabilità
}

export interface NormalizedOffer {
  vendorName: string;
  vendorEmail: string;
  lines: NormalizedOfferLine[];
  metadata: {
    fileName: string;
    fileType: string;
    normalizedAt: number;
    defaultVatRate: number;
    totalValue: number;
    totalValueWithVat: number;
  };
}

export interface UoMMapping {
  from: string;
  to: string;
  factor: number;
  category: string;
}

export class Normalizer {
  
  // Mappature UM comuni
  private static readonly UOM_MAPPINGS: UoMMapping[] = [
    // Lunghezze
    { from: 'ml', to: 'm', factor: 0.001, category: 'length' },
    { from: 'cm', to: 'm', factor: 0.01, category: 'length' },
    { from: 'dm', to: 'm', factor: 0.1, category: 'length' },
    { from: 'km', to: 'm', factor: 1000, category: 'length' },
    { from: 'mm', to: 'm', factor: 0.001, category: 'length' },
    
    // Superfici
    { from: 'cmq', to: 'mq', factor: 0.0001, category: 'area' },
    { from: 'dmq', to: 'mq', factor: 0.01, category: 'area' },
    { from: 'ha', to: 'mq', factor: 10000, category: 'area' },
    { from: 'are', to: 'mq', factor: 100, category: 'area' },
    
    // Volumi
    { from: 'cmc', to: 'mc', factor: 0.000001, category: 'volume' },
    { from: 'dmc', to: 'mc', factor: 0.001, category: 'volume' },
    { from: 'litri', to: 'mc', factor: 0.001, category: 'volume' },
    { from: 'l', to: 'mc', factor: 0.001, category: 'volume' },
    
    // Pesi
    { from: 'q.le', to: 'kg', factor: 100, category: 'weight' },
    { from: 'quintali', to: 'kg', factor: 100, category: 'weight' },
    { from: 't', to: 'kg', factor: 1000, category: 'weight' },
    { from: 'tonnellate', to: 'kg', factor: 1000, category: 'weight' },
    { from: 'g', to: 'kg', factor: 0.001, category: 'weight' },
    { from: 'hg', to: 'kg', factor: 0.1, category: 'weight' },
    
    // Quantità
    { from: 'pz', to: 'nr', factor: 1, category: 'quantity' },
    { from: 'pezzi', to: 'nr', factor: 1, category: 'quantity' },
    { from: 'unità', to: 'nr', factor: 1, category: 'quantity' },
    { from: 'un', to: 'nr', factor: 1, category: 'quantity' },
    { from: 'colli', to: 'nr', factor: 1, category: 'quantity' },
    
    // Tempo
    { from: 'ore', to: 'h', factor: 1, category: 'time' },
    { from: 'giorni', to: 'gg', factor: 1, category: 'time' },
    { from: 'settimane', to: 'sett', factor: 1, category: 'time' },
    { from: 'mesi', to: 'mesi', factor: 1, category: 'time' },
    
    // Altre unità comuni
    { from: 'm2', to: 'mq', factor: 1, category: 'area' },
    { from: 'm3', to: 'mc', factor: 1, category: 'volume' },
    { from: 'm²', to: 'mq', factor: 1, category: 'area' },
    { from: 'm³', to: 'mc', factor: 1, category: 'volume' },
    { from: 'mq', to: 'mq', factor: 1, category: 'area' },
    { from: 'mc', to: 'mc', factor: 1, category: 'volume' },
    { from: 'kg', to: 'kg', factor: 1, category: 'weight' },
    { from: 'm', to: 'm', factor: 1, category: 'length' },
    { from: 'nr', to: 'nr', factor: 1, category: 'quantity' }
  ];

  // Normalizza offerta completa
  static normalizeOffer(
    offer: any, 
    defaultVatRate: number = 22,
    projectUomPreferences?: Record<string, string>
  ): NormalizedOffer {
    try {
      console.log('🔧 [NORMALIZE] Normalizzazione offerta:', offer.vendorName);
      
      const normalizedLines = offer.lines.map((line: any) => 
        this.normalizeOfferLine(line, defaultVatRate, projectUomPreferences)
      );
      
      const totalValue = normalizedLines.reduce((sum, line) => sum + line.totalPrice, 0);
      const totalValueWithVat = normalizedLines.reduce((sum, line) => sum + line.totalPriceWithVat, 0);
      
      const normalizedOffer: NormalizedOffer = {
        vendorName: offer.vendorName,
        vendorEmail: offer.vendorEmail,
        lines: normalizedLines,
        metadata: {
          fileName: offer.metadata?.fileName || 'unknown',
          fileType: offer.metadata?.fileType || 'unknown',
          normalizedAt: Date.now(),
          defaultVatRate,
          totalValue,
          totalValueWithVat
        }
      };
      
      console.log('✅ [NORMALIZE] Offerta normalizzata:', normalizedOffer.metadata);
      return normalizedOffer;
      
    } catch (error: any) {
      console.error('❌ [NORMALIZE] Errore normalizzazione offerta:', error);
      throw new Error(`Errore normalizzazione offerta: ${error.message}`);
    }
  }

  // Normalizza singola linea offerta
  private static normalizeOfferLine(
    line: any, 
    defaultVatRate: number,
    projectUomPreferences?: Record<string, string>
  ): NormalizedOfferLine {
    
    // Normalizza UM
    const normalizedUom = this.normalizeUom(line.uom || '', projectUomPreferences);
    const uomFactor = this.getUomFactor(line.uom || '', normalizedUom);
    
    // Normalizza quantità e prezzi
    const normalizedQty = (line.qty || 0) * uomFactor;
    const normalizedUnitPrice = (line.unitPrice || 0) / uomFactor;
    const normalizedTotalPrice = normalizedQty * normalizedUnitPrice;
    
    // Gestisci IVA
    const vatRate = this.extractVatRate(line, defaultVatRate);
    const unitPriceWithVat = normalizedUnitPrice * (1 + vatRate / 100);
    const totalPriceWithVat = normalizedTotalPrice * (1 + vatRate / 100);
    
    return {
      code: line.code,
      description: line.description || '',
      category: line.category,
      uom: normalizedUom,
      qty: normalizedQty,
      unitPrice: normalizedUnitPrice,
      totalPrice: normalizedTotalPrice,
      unitPriceWithVat,
      totalPriceWithVat,
      vatRate,
      notes: line.notes,
      exclusions: line.exclusions,
      leadTime: line.leadTime,
      originalUom: line.uom,
      originalPrice: line.unitPrice
    };
  }

  // Normalizza UM
  private static normalizeUom(uom: string, projectPreferences?: Record<string, string>): string {
    if (!uom) return 'nr';
    
    const uomLower = uom.toLowerCase().trim();
    
    // Controlla preferenze progetto
    if (projectPreferences && projectPreferences[uomLower]) {
      return projectPreferences[uomLower];
    }
    
    // Trova mapping
    const mapping = this.UOM_MAPPINGS.find(m => m.from === uomLower);
    if (mapping) {
      return mapping.to;
    }
    
    // Fallback: usa UM originale se già standard
    const standardUoms = ['m', 'mq', 'mc', 'kg', 'nr', 'h', 'gg', 'sett', 'mesi'];
    if (standardUoms.includes(uomLower)) {
      return uomLower;
    }
    
    // Fallback: usa UM originale
    return uom;
  }

  // Ottieni fattore di conversione UM
  private static getUomFactor(fromUom: string, toUom: string): number {
    if (fromUom === toUom) return 1;
    
    const mapping = this.UOM_MAPPINGS.find(m => m.from === fromUom && m.to === toUom);
    return mapping ? mapping.factor : 1;
  }

  // Estrai tasso IVA
  private static extractVatRate(line: any, defaultVatRate: number): number {
    // Cerca IVA nelle note o descrizione
    const text = `${line.notes || ''} ${line.description || ''}`.toLowerCase();
    
    // Pattern comuni per IVA
    const vatPatterns = [
      /iva\s*(\d+(?:[.,]\d+)?)/i,
      /vat\s*(\d+(?:[.,]\d+)?)/i,
      /imposta\s*(\d+(?:[.,]\d+)?)/i,
      /(\d+(?:[.,]\d+)?)\s*%?\s*iva/i,
      /(\d+(?:[.,]\d+)?)\s*%?\s*vat/i
    ];
    
    for (const pattern of vatPatterns) {
      const match = text.match(pattern);
      if (match) {
        const rate = parseFloat(match[1].replace(',', '.'));
        if (rate >= 0 && rate <= 100) {
          return rate;
        }
      }
    }
    
    // Cerca prezzi con IVA inclusa
    if (text.includes('iva inclusa') || text.includes('vat included')) {
      return defaultVatRate;
    }
    
    // Cerca prezzi senza IVA
    if (text.includes('iva esclusa') || text.includes('vat excluded')) {
      return 0;
    }
    
    // Default: usa tasso progetto
    return defaultVatRate;
  }

  // Confronta due UM per compatibilità
  static areUomsCompatible(uom1: string, uom2: string): boolean {
    const category1 = this.getUomCategory(uom1);
    const category2 = this.getUomCategory(uom2);
    
    return category1 === category2;
  }

  // Ottieni categoria UM
  private static getUomCategory(uom: string): string {
    const mapping = this.UOM_MAPPINGS.find(m => m.from === uom || m.to === uom);
    return mapping ? mapping.category : 'unknown';
  }

  // Valida normalizzazione
  static validateNormalization(normalizedOffer: NormalizedOffer): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = [];
    
    // Controlla conversioni UM
    normalizedOffer.lines.forEach((line, index) => {
      if (line.originalUom && line.originalUom !== line.uom) {
        warnings.push(`Linea ${index + 1}: UM convertita da ${line.originalUom} a ${line.uom}`);
      }
      
      if (line.originalPrice && Math.abs(line.originalPrice - line.unitPrice) > 0.01) {
        warnings.push(`Linea ${index + 1}: Prezzo modificato per conversione UM`);
      }
    });
    
    // Controlla IVA
    const linesWithVat = normalizedOffer.lines.filter(line => line.vatRate > 0);
    const linesWithoutVat = normalizedOffer.lines.filter(line => line.vatRate === 0);
    
    if (linesWithVat.length > 0 && linesWithoutVat.length > 0) {
      warnings.push('Offerta mista: alcune linee con IVA, altre senza');
    }
    
    return {
      isValid: warnings.length === 0,
      warnings
    };
  }

  // Ottieni statistiche normalizzazione
  static getNormalizationStats(normalizedOffer: NormalizedOffer): {
    totalLines: number;
    convertedUoms: number;
    vatIncluded: number;
    vatExcluded: number;
    totalValue: number;
    totalValueWithVat: number;
  } {
    const convertedUoms = normalizedOffer.lines.filter(line => 
      line.originalUom && line.originalUom !== line.uom
    ).length;
    
    const vatIncluded = normalizedOffer.lines.filter(line => line.vatRate > 0).length;
    const vatExcluded = normalizedOffer.lines.filter(line => line.vatRate === 0).length;
    
    return {
      totalLines: normalizedOffer.lines.length,
      convertedUoms,
      vatIncluded,
      vatExcluded,
      totalValue: normalizedOffer.metadata.totalValue,
      totalValueWithVat: normalizedOffer.metadata.totalValueWithVat
    };
  }

  // Suggerisci UM standard per progetto
  static suggestProjectUomPreferences(offers: any[]): Record<string, string> {
    const uomCounts: Record<string, number> = {};
    
    offers.forEach(offer => {
      offer.lines.forEach((line: any) => {
        if (line.uom) {
          const normalizedUom = this.normalizeUom(line.uom);
          uomCounts[normalizedUom] = (uomCounts[normalizedUom] || 0) + 1;
        }
      });
    });
    
    const preferences: Record<string, string> = {};
    
    // Per ogni categoria, scegli l'UM più comune
    const categories = ['length', 'area', 'volume', 'weight', 'quantity', 'time'];
    
    categories.forEach(category => {
      const categoryUoms = Object.entries(uomCounts)
        .filter(([uom]) => this.getUomCategory(uom) === category)
        .sort(([, a], [, b]) => b - a);
      
      if (categoryUoms.length > 0) {
        const [preferredUom] = categoryUoms[0];
        preferences[category] = preferredUom;
      }
    });
    
    return preferences;
  }
}
