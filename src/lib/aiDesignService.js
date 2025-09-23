'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.aiDesignService = void 0;
class AIDesignService {
  /**
   * Genera suggerimenti AI personalizzati per un progetto
   */
  async generateDesignSuggestions(template, customization, location, budget) {
    try {
      console.log('🤖 [AI Design] Generazione suggerimenti per:', template.name);
      const suggestions = [];
      // Analisi ROI e ottimizzazioni
      const roiSuggestions = this.analyzeROIOpportunities(customization, budget);
      suggestions.push(...roiSuggestions);
      // Analisi sostenibilità
      const sustainabilitySuggestions = this.analyzeSustainability(customization, location);
      suggestions.push(...sustainabilitySuggestions);
      // Analisi efficienza energetica
      const efficiencySuggestions = this.analyzeEnergyEfficiency(customization, location);
      suggestions.push(...efficiencySuggestions);
      // Analisi funzionalità e layout
      const functionalitySuggestions = this.analyzeFunctionality(customization, template);
      suggestions.push(...functionalitySuggestions);
      // Analisi estetica e mercato
      const aestheticSuggestions = this.analyzeAesthetics(customization, location);
      suggestions.push(...aestheticSuggestions);
      // Ordina per priorità e impatto ROI
      suggestions.sort((a, b) => {
        const priorityScore = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        const aScore = priorityScore[a.priority] * a.estimatedImpact.roi;
        const bScore = priorityScore[b.priority] * b.estimatedImpact.roi;
        return bScore - aScore;
      });
      console.log(`✅ [AI Design] Generati ${suggestions.length} suggerimenti intelligenti`);
      return suggestions.slice(0, 8); // Top 8 suggerimenti
    } catch (error) {
      console.error('❌ [AI Design] Errore generazione suggerimenti:', error);
      return [];
    }
  }
  /**
   * Analizza opportunità di miglioramento ROI
   */
  analyzeROIOpportunities(customization, budget) {
    const suggestions = [];
    // Analisi area edificabile vs area verde
    const totalArea = customization.area + customization.gardenArea + customization.balconyArea;
    const coverageRatio = customization.area / totalArea;
    if (coverageRatio < 0.4) {
      suggestions.push({
        id: 'roi-001',
        title: 'Ottimizzazione Area Edificabile',
        reasoning: `L'area edificabile (${customization.area}m²) è solo il ${(coverageRatio * 100).toFixed(1)}% del totale. Aumentare l'area edificabile può migliorare significativamente il ROI.`,
        benefits: [
          'Maggiore superficie vendibile',
          'ROI potenziale +15-25%',
          'Migliore utilizzo del terreno',
        ],
        implementation:
          'Ridurre area giardino da 300m² a 200m², aumentare area edificabile da 250m² a 350m²',
        priority: 'HIGH',
        category: 'ROI',
        estimatedImpact: {
          roi: 20,
          cost: 50000,
          time: 2,
          marketValue: 15,
        },
        confidence: 85,
      });
    }
    // Analisi posti auto
    const requiredParking = Math.ceil(customization.bedrooms * 1.5) + 1;
    if (customization.parkingSpaces < requiredParking) {
      suggestions.push({
        id: 'roi-002',
        title: 'Aumento Posti Auto',
        reasoning: `I posti auto (${customization.parkingSpaces}) sono insufficienti per ${customization.bedrooms} camere. Posti auto aggiuntivi aumentano il valore di mercato.`,
        benefits: ['Valore di mercato +8-12%', 'Appeal per famiglie', 'ROI potenziale +10-15%'],
        implementation: 'Aggiungere 2-3 posti auto coperti o garage',
        priority: 'MEDIUM',
        category: 'FUNCTIONALITY',
        estimatedImpact: {
          roi: 12,
          cost: 25000,
          time: 3,
          marketValue: 10,
        },
        confidence: 78,
      });
    }
    // Analisi classe energetica
    if (customization.energyClass === 'C' || customization.energyClass === 'D') {
      suggestions.push({
        id: 'roi-003',
        title: 'Upgrade Classe Energetica',
        reasoning: `La classe energetica ${customization.energyClass} può limitare il valore di mercato. Un upgrade a classe A/B può aumentare significativamente il ROI.`,
        benefits: [
          'Valore di mercato +12-18%',
          'Risparmio energetico 30-40%',
          'Incentivi fiscali disponibili',
          'ROI potenziale +15-20%',
        ],
        implementation:
          'Isolamento termico avanzato, infissi ad alta efficienza, impianti rinnovabili',
        priority: 'HIGH',
        category: 'EFFICIENCY',
        estimatedImpact: {
          roi: 18,
          cost: 80000,
          time: 4,
          marketValue: 15,
        },
        confidence: 92,
      });
    }
    return suggestions;
  }
  /**
   * Analizza opportunità di sostenibilità
   */
  analyzeSustainability(customization, location) {
    const suggestions = [];
    // Analisi tetto verde
    if (customization.roofType !== 'GREEN' && location.zoning.density !== 'HIGH') {
      suggestions.push({
        id: 'sustainability-001',
        title: 'Tetto Verde Sostenibile',
        reasoning:
          "Un tetto verde può migliorare l'isolamento termico, ridurre i costi energetici e aumentare il valore estetico della proprietà.",
        benefits: [
          'Isolamento termico +15-20%',
          'Riduzione costi riscaldamento/raffreddamento',
          'Valore estetico +8-12%',
          'Sostenibilità ambientale',
        ],
        implementation:
          'Installazione sistema tetto verde con irrigazione automatica e piante autoctone',
        priority: 'MEDIUM',
        category: 'SUSTAINABILITY',
        estimatedImpact: {
          roi: 8,
          cost: 35000,
          time: 3,
          marketValue: 8,
        },
        confidence: 75,
      });
    }
    // Analisi pannelli solari
    if (customization.roofType !== 'SOLAR' && location.zoning.category === 'residenziale') {
      suggestions.push({
        id: 'sustainability-002',
        title: 'Sistema Fotovoltaico',
        reasoning:
          'I pannelli solari possono ridurre significativamente i costi energetici e aumentare il valore della proprietà, specialmente in zone soleggiate.',
        benefits: [
          'Riduzione bolletta elettrica 60-80%',
          'Valore di mercato +10-15%',
          'Incentivi fiscali disponibili',
          'ROI potenziale +12-18%',
        ],
        implementation: 'Installazione sistema fotovoltaico 6-8kW con accumulo batterie',
        priority: 'HIGH',
        category: 'SUSTAINABILITY',
        estimatedImpact: {
          roi: 15,
          cost: 45000,
          time: 4,
          marketValue: 12,
        },
        confidence: 88,
      });
    }
    return suggestions;
  }
  /**
   * Analizza efficienza energetica
   */
  analyzeEnergyEfficiency(customization, location) {
    const suggestions = [];
    // Analisi materiali isolanti
    if (customization.facadeMaterial === 'GLASS' && location.zoning.category === 'residenziale') {
      suggestions.push({
        id: 'efficiency-001',
        title: 'Isolamento Termico Avanzato',
        reasoning:
          "Con una facciata in vetro, è essenziale un isolamento termico avanzato per mantenere l'efficienza energetica e il comfort abitativo.",
        benefits: [
          'Riduzione dispersioni termiche 40-50%',
          'Comfort abitativo migliorato',
          'Riduzione costi energetici 25-35%',
          'Valore di mercato +8-12%',
        ],
        implementation:
          'Isolamento termico con pannelli in fibra di legno o lana minerale, doppi vetri basso-emissivi',
        priority: 'MEDIUM',
        category: 'EFFICIENCY',
        estimatedImpact: {
          roi: 10,
          cost: 30000,
          time: 3,
          marketValue: 8,
        },
        confidence: 82,
      });
    }
    // Analisi domotica
    if (customization.interiorStyle === 'MODERN' || customization.interiorStyle === 'LUXURY') {
      suggestions.push({
        id: 'efficiency-002',
        title: 'Sistema Domotico Intelligente',
        reasoning:
          'Un sistema domotico può ottimizzare i consumi energetici, migliorare la sicurezza e aumentare significativamente il valore della proprietà.',
        benefits: [
          'Ottimizzazione consumi energetici 20-30%',
          'Sicurezza e comfort migliorati',
          'Valore di mercato +15-25%',
          'Appeal per clienti premium',
          'ROI potenziale +18-25%',
        ],
        implementation:
          'Sistema domotico integrato con controllo illuminazione, climatizzazione, sicurezza e monitoraggio consumi',
        priority: 'HIGH',
        category: 'EFFICIENCY',
        estimatedImpact: {
          roi: 22,
          cost: 55000,
          time: 5,
          marketValue: 20,
        },
        confidence: 85,
      });
    }
    return suggestions;
  }
  /**
   * Analizza funzionalità e layout
   */
  analyzeFunctionality(customization, template) {
    const suggestions = [];
    // Analisi spazio cucina
    if (customization.area > 200 && customization.bedrooms >= 3) {
      suggestions.push({
        id: 'functionality-001',
        title: 'Cucina Open Space Premium',
        reasoning:
          'Per una famiglia di 3+ persone, una cucina open space di qualità può diventare il cuore della casa e aumentare significativamente il valore.',
        benefits: [
          'Migliore socialità familiare',
          'Valore di mercato +10-15%',
          'Appeal per famiglie moderne',
          'ROI potenziale +12-18%',
        ],
        implementation:
          'Cucina open space con isola centrale, elettrodomestici integrati, illuminazione LED e materiali premium',
        priority: 'MEDIUM',
        category: 'FUNCTIONALITY',
        estimatedImpact: {
          roi: 15,
          cost: 40000,
          time: 4,
          marketValue: 12,
        },
        confidence: 80,
      });
    }
    // Analisi bagno principale
    if (customization.bedrooms >= 2 && customization.bathrooms === 1) {
      suggestions.push({
        id: 'functionality-002',
        title: 'Bagno Principale Suite',
        reasoning:
          'Un bagno principale di lusso può trasformare la camera principale in una vera suite e aumentare significativamente il valore della proprietà.',
        benefits: [
          'Trasformazione in suite di lusso',
          'Valore di mercato +12-18%',
          'Appeal per coppie e professionisti',
          'ROI potenziale +15-22%',
        ],
        implementation:
          'Bagno principale con doccia walk-in, vasca freestanding, doppio lavabo e finiture premium',
        priority: 'HIGH',
        category: 'FUNCTIONALITY',
        estimatedImpact: {
          roi: 18,
          cost: 35000,
          time: 3,
          marketValue: 15,
        },
        confidence: 85,
      });
    }
    return suggestions;
  }
  /**
   * Analizza estetica e mercato
   */
  analyzeAesthetics(customization, location) {
    const suggestions = [];
    // Analisi facciata premium
    if (customization.facadeMaterial === 'BRICK' && location.zoning.category === 'residenziale') {
      suggestions.push({
        id: 'aesthetics-001',
        title: 'Facciata Premium Mista',
        reasoning:
          'Una facciata mista con materiali premium può distinguere la proprietà nel mercato e aumentare significativamente il valore percepito.',
        benefits: [
          'Distinzione nel mercato',
          'Valore di mercato +15-25%',
          'Appeal estetico superiore',
          'ROI potenziale +18-28%',
        ],
        implementation:
          'Facciata mista con pietra naturale, legno termotrattato e acciaio, illuminazione architetturale',
        priority: 'HIGH',
        category: 'AESTHETICS',
        estimatedImpact: {
          roi: 23,
          cost: 65000,
          time: 6,
          marketValue: 20,
        },
        confidence: 88,
      });
    }
    // Analisi giardino paesaggistico
    if (customization.gardenArea > 200 && location.zoning.density === 'LOW') {
      suggestions.push({
        id: 'aesthetics-002',
        title: 'Giardino Paesaggistico Professionale',
        reasoning:
          "Un giardino paesaggistico professionale può trasformare completamente l'aspetto della proprietà e aumentare significativamente il valore di mercato.",
        benefits: [
          'Trasformazione estetica completa',
          'Valore di mercato +20-30%',
          'Appeal per clienti premium',
          'ROI potenziale +25-35%',
        ],
        implementation:
          'Progettazione giardino con piante autoctone, sistema irrigazione automatico, illuminazione paesaggistica e arredi esterni',
        priority: 'MEDIUM',
        category: 'AESTHETICS',
        estimatedImpact: {
          roi: 30,
          cost: 45000,
          time: 4,
          marketValue: 25,
        },
        confidence: 82,
      });
    }
    return suggestions;
  }
  /**
   * Ottimizza il design per massimizzare il ROI
   */
  async optimizeDesignForROI(
    template,
    customization,
    location,
    budget,
    maxBudgetIncrease = 200000
  ) {
    try {
      console.log('🎯 [AI Design] Ottimizzazione design per ROI massimo...');
      // Genera tutti i suggerimenti
      const allSuggestions = await this.generateDesignSuggestions(
        template,
        customization,
        location,
        budget
      );
      // Filtra per budget disponibile
      const affordableSuggestions = allSuggestions.filter(
        s => s.estimatedImpact.cost <= maxBudgetIncrease
      );
      // Calcola ROI originale
      const originalROI = this.calculateOriginalROI(customization, budget);
      // Simula diverse combinazioni di miglioramenti
      const combinations = this.generateOptimizationCombinations(
        affordableSuggestions,
        maxBudgetIncrease
      );
      // Trova la combinazione ottimale
      let bestCombination = combinations[0];
      let bestROI = originalROI;
      combinations.forEach(combination => {
        const totalCost = combination.reduce((sum, s) => sum + s.estimatedImpact.cost, 0);
        const totalROIImprovement = combination.reduce((sum, s) => sum + s.estimatedImpact.roi, 0);
        const newROI = originalROI + totalROIImprovement;
        if (newROI > bestROI && totalCost <= maxBudgetIncrease) {
          bestROI = newROI;
          bestCombination = combination;
        }
      });
      // Calcola metriche finali
      const totalCostIncrease = bestCombination.reduce((sum, s) => sum + s.estimatedImpact.cost, 0);
      const totalTimeIncrease = bestCombination.reduce((sum, s) => sum + s.estimatedImpact.time, 0);
      const paybackPeriod = this.calculatePaybackPeriod(totalCostIncrease, bestROI - originalROI);
      const riskLevel = this.assessRiskLevel(bestCombination);
      const optimization = {
        originalROI,
        optimizedROI: bestROI,
        improvements: bestCombination,
        totalCostIncrease,
        totalTimeIncrease,
        paybackPeriod,
        riskLevel,
      };
      console.log(
        `✅ [AI Design] Ottimizzazione completata: ROI ${originalROI.toFixed(1)}% → ${bestROI.toFixed(1)}%`
      );
      return optimization;
    } catch (error) {
      console.error('❌ [AI Design] Errore ottimizzazione design:', error);
      throw new Error('Impossibile ottimizzare il design per il ROI');
    }
  }
  /**
   * Calcola il ROI originale del progetto
   */
  calculateOriginalROI(customization, budget) {
    // ROI base per tipo di progetto
    let baseROI = 15; // 15% ROI base
    // Aggiusta per area
    if (customization.area > 300) baseROI += 5;
    else if (customization.area < 150) baseROI -= 3;
    // Aggiusta per classe energetica
    if (customization.energyClass === 'A' || customization.energyClass === 'A+') baseROI += 8;
    else if (customization.energyClass === 'B') baseROI += 4;
    else if (customization.energyClass === 'D' || customization.energyClass === 'E') baseROI -= 5;
    // Aggiusta per materiali
    if (customization.facadeMaterial === 'MIXED') baseROI += 3;
    if (customization.roofType === 'SOLAR') baseROI += 5;
    return Math.max(5, Math.min(35, baseROI)); // Limita tra 5% e 35%
  }
  /**
   * Genera combinazioni di ottimizzazioni
   */
  generateOptimizationCombinations(suggestions, maxBudget) {
    const combinations = [];
    // Genera tutte le combinazioni possibili (max 4 suggerimenti per combinazione)
    for (let i = 1; i <= Math.min(4, suggestions.length); i++) {
      const combinationsOfSize = this.getCombinations(suggestions, i);
      combinations.push(...combinationsOfSize);
    }
    // Filtra per budget
    return combinations.filter(combination => {
      const totalCost = combination.reduce((sum, s) => sum + s.estimatedImpact.cost, 0);
      return totalCost <= maxBudget;
    });
  }
  /**
   * Ottiene tutte le combinazioni di n elementi da un array
   */
  getCombinations(arr, n) {
    if (n === 1) return arr.map(item => [item]);
    const combinations = [];
    for (let i = 0; i <= arr.length - n; i++) {
      const head = arr[i];
      const tailCombinations = this.getCombinations(arr.slice(i + 1), n - 1);
      tailCombinations.forEach(tail => {
        combinations.push([head, ...tail]);
      });
    }
    return combinations;
  }
  /**
   * Calcola il periodo di payback
   */
  calculatePaybackPeriod(investment, annualReturn) {
    if (annualReturn <= 0) return Infinity;
    return (investment / annualReturn) * 12; // mesi
  }
  /**
   * Valuta il livello di rischio
   */
  assessRiskLevel(suggestions) {
    const highRiskCount = suggestions.filter(s => s.estimatedImpact.cost > 50000).length;
    const mediumRiskCount = suggestions.filter(
      s => s.estimatedImpact.cost > 25000 && s.estimatedImpact.cost <= 50000
    ).length;
    if (highRiskCount >= 2) return 'HIGH';
    if (highRiskCount >= 1 || mediumRiskCount >= 2) return 'MEDIUM';
    return 'LOW';
  }
  /**
   * Analizza il mercato per un progetto specifico
   */
  async analyzeMarketForProject(template, location, customization) {
    try {
      console.log('📊 [AI Design] Analisi mercato per progetto:', template.name);
      const trends = this.identifyMarketTrends(location, template.category);
      const opportunities = this.identifyMarketOpportunities(location, customization);
      const risks = this.identifyMarketRisks(location, template.category);
      const recommendations = this.generateMarketRecommendations(trends, opportunities, risks);
      const marketScore = this.calculateMarketScore(trends, opportunities, risks);
      const competitorAnalysis = this.analyzeCompetitors(location, template.category);
      const marketAnalysis = {
        trends,
        opportunities,
        risks,
        recommendations,
        marketScore,
        competitorAnalysis,
      };
      console.log(`✅ [AI Design] Analisi mercato completata: Score ${marketScore}/100`);
      return marketAnalysis;
    } catch (error) {
      console.error('❌ [AI Design] Errore analisi mercato:', error);
      throw new Error('Impossibile analizzare il mercato per il progetto');
    }
  }
  /**
   * Identifica trend di mercato
   */
  identifyMarketTrends(location, category) {
    const trends = [];
    // Trend generali per zona
    if (location.address.includes('Milano') || location.address.includes('Roma')) {
      trends.push('Mercato premium in forte crescita (+15-20% annuo)');
      trends.push('Richiesta crescente per progetti sostenibili');
      trends.push('Valorizzazione progetti con certificazioni green');
    } else if (location.address.includes('Torino') || location.address.includes('Napoli')) {
      trends.push('Mercato in ripresa post-pandemia (+8-12% annuo)');
      trends.push('Interesse crescente per progetti residenziali di qualità');
      trends.push('Domanda per uffici moderni e flessibili');
    }
    // Trend per categoria
    if (category === 'RESIDENTIAL') {
      trends.push('Preferenza per spazi aperti e flessibili');
      trends.push('Richiesta crescente per domotica integrata');
      trends.push('Valorizzazione progetti con certificazioni energetiche');
    } else if (category === 'COMMERCIAL') {
      trends.push('Trasformazione spazi commerciali in mixed-use');
      trends.push('Preferenza per edifici sostenibili e certificati');
      trends.push('Domanda per spazi coworking e uffici flessibili');
    }
    return trends;
  }
  /**
   * Identifica opportunità di mercato
   */
  identifyMarketOpportunities(location, customization) {
    const opportunities = [];
    // Opportunità basate su caratteristiche
    if (customization.energyClass === 'A' || customization.energyClass === 'A+') {
      opportunities.push('Certificazione energetica premium per mercato high-end');
      opportunities.push('Eligibilità per incentivi fiscali e green financing');
    }
    if (customization.gardenArea > 200) {
      opportunities.push('Giardino privato per famiglie premium');
      opportunities.push('Spazio esterno per eventi e intrattenimento');
    }
    if (customization.parkingSpaces >= 3) {
      opportunities.push('Parcheggio multiplo per famiglie grandi');
      opportunities.push('Possibilità di affitto posti auto extra');
    }
    // Opportunità basate su zona
    if (location.zoning.density === 'LOW') {
      opportunities.push('Progetto esclusivo in zona a bassa densità');
      opportunities.push('Possibilità di espansione futura');
    }
    return opportunities;
  }
  /**
   * Identifica rischi di mercato
   */
  identifyMarketRisks(location, category) {
    const risks = [];
    // Rischi generali
    risks.push('Possibili variazioni normative urbanistiche');
    risks.push('Flessibilità dei tassi di interesse');
    risks.push('Cambiamenti nelle preferenze di mercato');
    // Rischi specifici per zona
    if (location.address.includes('Milano') || location.address.includes('Roma')) {
      risks.push('Saturazione mercato premium in alcune zone');
      risks.push('Competizione con progetti di lusso esistenti');
    }
    // Rischi per categoria
    if (category === 'COMMERCIAL') {
      risks.push('Cambiamenti nel comportamento lavorativo post-pandemia');
      risks.push('Evoluzione tecnologica che rende obsoleti alcuni spazi');
    }
    return risks;
  }
  /**
   * Genera raccomandazioni di mercato
   */
  generateMarketRecommendations(trends, opportunities, risks) {
    const recommendations = [];
    // Raccomandazioni basate su trend
    if (trends.some(t => t.includes('sostenibile'))) {
      recommendations.push('Priorizzare certificazioni green e materiali sostenibili');
    }
    if (trends.some(t => t.includes('domotica'))) {
      recommendations.push('Integrare sistemi domotici avanzati per appeal premium');
    }
    // Raccomandazioni basate su opportunità
    if (opportunities.some(o => o.includes('incentivi'))) {
      recommendations.push('Sfruttare incentivi fiscali per migliorare la redditività');
    }
    // Raccomandazioni per mitigare rischi
    if (risks.some(r => r.includes('normative'))) {
      recommendations.push("Verificare regolamenti urbanistici prima dell'avvio");
    }
    return recommendations;
  }
  /**
   * Calcola il punteggio di mercato
   */
  calculateMarketScore(trends, opportunities, risks) {
    let score = 50; // Punteggio base
    // Aggiungi punti per trend positivi
    score += trends.length * 5;
    // Aggiungi punti per opportunità
    score += opportunities.length * 8;
    // Sottrai punti per rischi
    score -= risks.length * 3;
    // Limita il punteggio tra 0 e 100
    return Math.max(0, Math.min(100, score));
  }
  /**
   * Analizza i competitor
   */
  analyzeCompetitors(location, category) {
    const strengths = [
      'Progetti esistenti con caratteristiche consolidate',
      'Brand recognition nel mercato locale',
      'Relazioni con fornitori e contractor',
    ];
    const weaknesses = [
      'Progetti spesso non aggiornati alle nuove tendenze',
      'Mancanza di certificazioni green e sostenibilità',
      'Tecnologie obsolete e mancanza di domotica',
    ];
    const opportunities = [
      'Differenziazione con progetti innovativi e sostenibili',
      'Sfruttamento di tecnologie moderne per appeal premium',
      'Certificazioni green per accesso a mercati premium',
    ];
    return { strengths, weaknesses, opportunities };
  }
}
exports.aiDesignService = new AIDesignService();
//# sourceMappingURL=aiDesignService.js.map
