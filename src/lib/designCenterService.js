'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.designCenterService = void 0;
const firestore_1 = require('firebase/firestore');
const firebase_1 = require('./firebase');
// Fallback data per quando Firebase non è disponibile
const FALLBACK_TEMPLATES = [
  {
    id: 'fallback-1',
    name: 'Villa Moderna Standard',
    category: 'RESIDENTIAL',
    zone: 'SUBURBAN',
    budget: 'MEDIUM',
    density: 'MEDIUM',
    minArea: 200,
    maxArea: 400,
    minBudget: 300000,
    maxBudget: 600000,
    floors: 2,
    bedrooms: 3,
    bathrooms: 2,
    parkingSpaces: 2,
    gardenArea: 150,
    balconyArea: 20,
    roofType: 'PITCHED',
    facadeMaterial: 'BRICK',
    energyClass: 'B',
    previewImage: '/images/templates/villa-moderna.jpg',
    floorPlanImage: '/images/templates/villa-moderna-plan.jpg',
    sectionImage: '/images/templates/villa-moderna-section.jpg',
    description: 'Villa moderna con design contemporaneo, perfetta per famiglie',
    features: ['Design moderno', 'Efficienza energetica', 'Giardino privato'],
    estimatedROI: 12,
    constructionTime: 18,
    popularity: 85,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
class DesignCenterService {
  constructor() {
    this.TEMPLATES_COLLECTION = 'design_templates';
    this.PROJECTS_COLLECTION = 'project_designs';
    this.CONSTRAINTS_COLLECTION = 'design_constraints';
  }
  /**
   * Ottiene tutti i template disponibili con filtri
   */
  async getTemplates(filters) {
    try {
      console.log('🎨 [DesignCenter] Recupero template con filtri:', filters);
      const templatesRef = (0, firestore_1.collection)(firebase_1.db, this.TEMPLATES_COLLECTION);
      let q = (0, firestore_1.query)(templatesRef, (0, firestore_1.orderBy)('popularity', 'desc'));
      // Applica filtri se specificati
      if (filters?.category) {
        q = (0, firestore_1.query)(q, (0, firestore_1.where)('category', '==', filters.category));
      }
      if (filters?.zone) {
        q = (0, firestore_1.query)(q, (0, firestore_1.where)('zone', '==', filters.zone));
      }
      if (filters?.budget) {
        q = (0, firestore_1.query)(q, (0, firestore_1.where)('budget', '==', filters.budget));
      }
      if (filters?.density) {
        q = (0, firestore_1.query)(q, (0, firestore_1.where)('density', '==', filters.density));
      }
      const snapshot = await (0, firestore_1.getDocs)(q);
      let templates = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        templates.push({
          id: doc.id,
          name: data.name,
          category: data.category,
          zone: data.zone,
          budget: data.budget,
          density: data.density,
          minArea: data.minArea || 0,
          maxArea: data.maxArea || 0,
          minBudget: data.minBudget || 0,
          maxBudget: data.maxBudget || 0,
          floors: data.floors || 1,
          bedrooms: data.bedrooms || 0,
          bathrooms: data.bathrooms || 0,
          parkingSpaces: data.parkingSpaces || 0,
          gardenArea: data.gardenArea || 0,
          balconyArea: data.balconyArea || 0,
          roofType: data.roofType || 'PITCHED',
          facadeMaterial: data.facadeMaterial || 'BRICK',
          energyClass: data.energyClass || 'C',
          previewImage: data.previewImage || '',
          floorPlanImage: data.floorPlanImage || '',
          sectionImage: data.sectionImage || '',
          description: data.description || '',
          features: data.features || [],
          estimatedROI: data.estimatedROI || 0,
          constructionTime: data.constructionTime || 0,
          popularity: data.popularity || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });
      // Filtra per area e budget se specificati
      if (filters?.minArea) {
        templates = templates.filter(t => t.maxArea >= filters.minArea);
      }
      if (filters?.maxArea) {
        templates = templates.filter(t => t.minArea <= filters.maxArea);
      }
      if (filters?.minBudget) {
        templates = templates.filter(t => t.maxBudget >= filters.minBudget);
      }
      if (filters?.maxBudget) {
        templates = templates.filter(t => t.minBudget <= filters.maxBudget);
      }
      console.log(`✅ [DesignCenter] Trovati ${templates.length} template`);
      return templates;
    } catch (error) {
      console.warn('⚠️ [DesignCenter] Firebase non disponibile, uso fallback:', error);
      return FALLBACK_TEMPLATES;
    }
  }
  /**
   * Ottiene un template specifico
   */
  async getTemplate(templateId) {
    try {
      const templateRef = (0, firestore_1.doc)(
        firebase_1.db,
        this.TEMPLATES_COLLECTION,
        templateId
      );
      const snapshot = await (0, firestore_1.getDoc)(templateRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        return {
          id: snapshot.id,
          name: data.name,
          category: data.category,
          zone: data.zone,
          budget: data.budget,
          density: data.density,
          minArea: data.minArea || 0,
          maxArea: data.maxArea || 0,
          minBudget: data.minBudget || 0,
          maxBudget: data.maxBudget || 0,
          floors: data.floors || 1,
          bedrooms: data.bedrooms || 0,
          bathrooms: data.bathrooms || 0,
          parkingSpaces: data.parkingSpaces || 0,
          gardenArea: data.gardenArea || 0,
          balconyArea: data.balconyArea || 0,
          roofType: data.roofType || 'PITCHED',
          facadeMaterial: data.facadeMaterial || 'BRICK',
          energyClass: data.energyClass || 'C',
          previewImage: data.previewImage || '',
          floorPlanImage: data.floorPlanImage || '',
          sectionImage: data.sectionImage || '',
          description: data.description || '',
          features: data.features || [],
          estimatedROI: data.estimatedROI || 0,
          constructionTime: data.constructionTime || 0,
          popularity: data.popularity || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      }
      return null;
    } catch (error) {
      console.error('❌ [DesignCenter] Errore recupero template:', error);
      return null;
    }
  }
  /**
   * Crea un nuovo progetto di design
   */
  async createProjectDesign(projectData) {
    try {
      console.log('🎨 [DesignCenter] Creazione progetto design:', projectData.projectId);
      const projectRef = (0, firestore_1.doc)(
        (0, firestore_1.collection)(firebase_1.db, this.PROJECTS_COLLECTION)
      );
      await (0, firestore_1.setDoc)(projectRef, {
        ...projectData,
        createdAt: (0, firestore_1.serverTimestamp)(),
        updatedAt: (0, firestore_1.serverTimestamp)(),
      });
      console.log('✅ [DesignCenter] Progetto design creato:', projectRef.id);
      return projectRef.id;
    } catch (error) {
      console.error('❌ [DesignCenter] Errore creazione progetto design:', error);
      throw new Error('Impossibile creare il progetto design');
    }
  }
  /**
   * Aggiorna un progetto di design esistente
   */
  async updateProjectDesign(projectId, updates) {
    try {
      const projectRef = (0, firestore_1.doc)(firebase_1.db, this.PROJECTS_COLLECTION, projectId);
      await (0, firestore_1.updateDoc)(projectRef, {
        ...updates,
        updatedAt: (0, firestore_1.serverTimestamp)(),
      });
      console.log('✅ [DesignCenter] Progetto design aggiornato:', projectId);
    } catch (error) {
      console.error('❌ [DesignCenter] Errore aggiornamento progetto design:', error);
      throw new Error('Impossibile aggiornare il progetto design');
    }
  }
  /**
   * Ottiene i progetti di design per un progetto specifico
   */
  async getProjectDesigns(projectId) {
    try {
      const projectsRef = (0, firestore_1.collection)(firebase_1.db, this.PROJECTS_COLLECTION);
      const q = (0, firestore_1.query)(
        projectsRef,
        (0, firestore_1.where)('projectId', '==', projectId),
        (0, firestore_1.orderBy)('updatedAt', 'desc')
      );
      const snapshot = await (0, firestore_1.getDocs)(q);
      const projects = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        projects.push({
          id: doc.id,
          projectId: data.projectId,
          templateId: data.templateId,
          customizations: data.customizations,
          constraints: data.constraints,
          location: data.location,
          budget: data.budget,
          timeline: data.timeline,
          approvals: data.approvals || [],
          status: data.status,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });
      return projects;
    } catch (error) {
      console.error('❌ [DesignCenter] Errore recupero progetti design:', error);
      return [];
    }
  }
  /**
   * Ottiene tutti i progetti di design
   */
  async getAllProjectDesigns() {
    try {
      const projectsRef = (0, firestore_1.collection)(firebase_1.db, this.PROJECTS_COLLECTION);
      const q = (0, firestore_1.query)(projectsRef, (0, firestore_1.orderBy)('updatedAt', 'desc'));
      const snapshot = await (0, firestore_1.getDocs)(q);
      const projects = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        projects.push({
          id: doc.id,
          projectId: data.projectId || doc.id,
          templateId: data.templateId,
          customizations: data.customizations,
          constraints: data.constraints,
          location: data.location,
          budget: data.budget,
          timeline: data.timeline,
          approvals: data.approvals || [],
          status: data.status || 'PLANNING',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });
      return projects;
    } catch (error) {
      console.error('❌ [DesignCenter] Errore recupero tutti i progetti design:', error);
      return [];
    }
  }
  /**
   * Valida i vincoli di design per un terreno specifico
   */
  async validateDesignConstraints(template, location, customizations) {
    try {
      console.log('🔍 [DesignCenter] Validazione vincoli design per:', location.address);
      const violations = [];
      const recommendations = [];
      // Calcola vincoli basati su zona e regolamenti
      const constraints = this.calculateConstraints(location, customizations);
      // Valida area copertura
      const coverage =
        (customizations.area / (customizations.area + constraints.greenAreaMin)) * 100;
      if (coverage > constraints.maxCoverage) {
        violations.push(
          `Copertura terreno ${coverage.toFixed(1)}% supera il limite ${constraints.maxCoverage}%`
        );
        recommendations.push('Ridurre area edificabile o aumentare area verde');
      }
      // Valida distanza confini
      if (customizations.area > 0) {
        const minSide = Math.sqrt(customizations.area);
        if (minSide / 2 < constraints.boundaryDistance) {
          violations.push(
            `Distanza minima dal confine (${constraints.boundaryDistance}m) non rispettata`
          );
          recommendations.push('Ridurre area edificabile o verificare dimensioni terreno');
        }
      }
      // Valida altezza massima
      const maxHeight = customizations.floors * 3; // 3m per piano
      if (maxHeight > constraints.maxHeight) {
        violations.push(`Altezza massima ${maxHeight}m supera il limite ${constraints.maxHeight}m`);
        recommendations.push('Ridurre numero piani o verificare regolamenti zona');
      }
      // Valida posti auto
      const requiredParking = Math.ceil(customizations.bedrooms * 1.5) + 1; // 1.5 per camera + 1 ospiti
      if (customizations.parkingSpaces < requiredParking) {
        violations.push(
          `Posti auto ${customizations.parkingSpaces} insufficienti (richiesti: ${requiredParking})`
        );
        recommendations.push('Aumentare posti auto o ridurre camere');
      }
      // Valida area verde
      const greenArea = customizations.gardenArea + customizations.balconyArea;
      const minGreenArea = (customizations.area + greenArea) * (constraints.greenAreaMin / 100);
      if (greenArea < minGreenArea) {
        violations.push(
          `Area verde ${greenArea}m² insufficiente (minima: ${minGreenArea.toFixed(0)}m²)`
        );
        recommendations.push('Aumentare area giardino o balconi');
      }
      const isValid = violations.length === 0;
      if (isValid) {
        recommendations.push('✅ Design conforme a tutti i vincoli');
      }
      return {
        isValid,
        violations,
        recommendations,
        adjustedConstraints: constraints,
      };
    } catch (error) {
      console.error('❌ [DesignCenter] Errore validazione vincoli:', error);
      throw new Error('Impossibile validare i vincoli di design');
    }
  }
  /**
   * Calcola i vincoli basati su zona e regolamenti
   */
  calculateConstraints(location, customizations) {
    // Vincoli base per zona residenziale
    const baseConstraints = {
      boundaryDistance: 10, // 10m dal confine (standard italiano)
      setbackFront: 5, // 5m dal fronte strada
      setbackSide: 3, // 3m dai lati
      setbackRear: 5, // 5m dal retro
      maxHeight: 12, // 12m massimi (4 piani)
      maxCoverage: 50, // 50% massima copertura
      parkingRequirements: 1, // 1 posto auto minimo
      greenAreaMin: 30, // 30% area verde minima
      accessibility: true,
      fireSafety: true,
      seismic: 'Zona 2', // Default zona sismica
      environmental: [],
    };
    // Aggiusta per zona specifica
    if (location.zoning.density === 'ALTA') {
      baseConstraints.maxHeight = 15; // 15m per zone ad alta densità
      baseConstraints.maxCoverage = 60; // 60% per zone ad alta densità
      baseConstraints.greenAreaMin = 25; // 25% per zone ad alta densità
    } else if (location.zoning.density === 'BASSA') {
      baseConstraints.maxHeight = 9; // 9m per zone a bassa densità
      baseConstraints.maxCoverage = 40; // 40% per zone a bassa densità
      baseConstraints.greenAreaMin = 40; // 40% per zone a bassa densità
    }
    // Aggiusta per tipo di progetto
    if (customizations.area > 500) {
      // Progetti grandi
      baseConstraints.boundaryDistance = 15; // 15m per progetti grandi
      baseConstraints.setbackFront = 8; // 8m per progetti grandi
    }
    return baseConstraints;
  }
  /**
   * Calcola il budget dettagliato per un progetto
   */
  async calculateProjectBudget(template, customizations, location) {
    try {
      console.log('💰 [DesignCenter] Calcolo budget per progetto:', template.name);
      // Costi base per m² (variano per zona e qualità)
      const baseCostPerSqm = this.getBaseCostPerSqm(location, template.budget);
      // Calcola costi per categoria
      const foundationCost = customizations.area * baseCostPerSqm.foundation;
      const structureCost = customizations.area * baseCostPerSqm.structure;
      const envelopeCost = customizations.area * baseCostPerSqm.envelope;
      const interiorCost = customizations.area * baseCostPerSqm.interior;
      const mechanicalCost = customizations.area * baseCostPerSqm.mechanical;
      const electricalCost = customizations.area * baseCostPerSqm.electrical;
      const finishesCost = customizations.area * baseCostPerSqm.finishes;
      // Costi materiali e manodopera
      const materialsCost = (foundationCost + structureCost + envelopeCost) * 0.6;
      const laborCost = (foundationCost + structureCost + envelopeCost) * 0.4;
      // Costi aggiuntivi
      const designCost = customizations.area * 50; // €50/m² per design
      const permitsCost = customizations.area * 30; // €30/m² per permessi
      const utilitiesCost = customizations.area * 80; // €80/m² per impianti
      const landscapingCost = customizations.gardenArea * 100; // €100/m² per giardino
      // Costi totali
      const constructionCost =
        foundationCost +
        structureCost +
        envelopeCost +
        interiorCost +
        mechanicalCost +
        electricalCost +
        finishesCost;
      const total = constructionCost + designCost + permitsCost + utilitiesCost + landscapingCost;
      // Contingency (10-15%)
      const contingency = total * 0.12;
      return {
        total: total + contingency,
        land: 0, // Non incluso nel calcolo
        design: designCost,
        permits: permitsCost,
        construction: constructionCost,
        materials: materialsCost,
        labor: laborCost,
        equipment: constructionCost * 0.1,
        utilities: utilitiesCost,
        landscaping: landscapingCost,
        contingency,
        breakdown: {
          foundation: foundationCost,
          structure: structureCost,
          envelope: envelopeCost,
          interior: interiorCost,
          mechanical: mechanicalCost,
          electrical: electricalCost,
          finishes: finishesCost,
        },
      };
    } catch (error) {
      console.error('❌ [DesignCenter] Errore calcolo budget:', error);
      throw new Error('Impossibile calcolare il budget del progetto');
    }
  }
  /**
   * Ottiene i costi base per m² basati su zona e qualità
   */
  getBaseCostPerSqm(location, budget) {
    // Costi base per zona (€/m²)
    const zoneMultiplier = this.getZoneMultiplier(location);
    const qualityMultiplier = this.getQualityMultiplier(budget);
    const baseCosts = {
      foundation: 120,
      structure: 180,
      envelope: 150,
      interior: 200,
      mechanical: 120,
      electrical: 80,
      finishes: 250,
    };
    // Applica moltiplicatori
    Object.keys(baseCosts).forEach(key => {
      baseCosts[key] *= zoneMultiplier * qualityMultiplier;
    });
    return baseCosts;
  }
  /**
   * Moltiplicatore per zona geografica
   */
  getZoneMultiplier(location) {
    if (location.address.includes('Milano') || location.address.includes('Roma')) {
      return 1.4; // Zone premium
    } else if (location.address.includes('Torino') || location.address.includes('Napoli')) {
      return 1.2; // Zone principali
    } else if (location.address.includes('Firenze') || location.address.includes('Bologna')) {
      return 1.1; // Zone intermedie
    } else {
      return 1.0; // Zone standard
    }
  }
  /**
   * Moltiplicatore per qualità del progetto
   */
  getQualityMultiplier(budget) {
    switch (budget) {
      case 'ECONOMIC':
        return 0.8;
      case 'MEDIUM':
        return 1.0;
      case 'PREMIUM':
        return 1.3;
      case 'LUXURY':
        return 1.8;
      default:
        return 1.0;
    }
  }
  /**
   * Calcola la timeline del progetto
   */
  async calculateProjectTimeline(template, customizations, complexity) {
    try {
      console.log('⏱️ [DesignCenter] Calcolo timeline per progetto:', template.name);
      // Timeline base per progetto standard
      const baseTimeline = {
        design: 4, // 4 settimane per design
        permits: 8, // 8 settimane per permessi
        sitePrep: 2, // 2 settimane preparazione sito
        foundation: 3, // 3 settimane fondazioni
        structure: 6, // 6 settimane struttura
        envelope: 4, // 4 settimane involucro
        interior: 5, // 5 settimane interni
        finishes: 4, // 4 settimane finiture
        testing: 2, // 2 settimane test
        handover: 1, // 1 settimana consegna
      };
      // Aggiusta per complessità
      const complexityMultiplier = complexity === 'LOW' ? 0.8 : complexity === 'HIGH' ? 1.3 : 1.0;
      // Aggiusta per dimensioni
      const sizeMultiplier =
        customizations.area > 300 ? 1.2 : customizations.area > 150 ? 1.0 : 0.9;
      // Calcola timeline finale
      const finalTimeline = { ...baseTimeline };
      Object.keys(finalTimeline).forEach(key => {
        finalTimeline[key] = Math.ceil(finalTimeline[key] * complexityMultiplier * sizeMultiplier);
      });
      // Calcola totale mesi
      const totalWeeks = Object.values(finalTimeline).reduce((sum, weeks) => sum + weeks, 0);
      const totalMonths = Math.ceil(totalWeeks / 4.33); // 4.33 settimane per mese
      // Calcola milestone dates (inizia da oggi)
      const startDate = new Date();
      const milestones = {
        designComplete: new Date(
          startDate.getTime() + finalTimeline.design * 7 * 24 * 60 * 60 * 1000
        ),
        permitsObtained: new Date(
          startDate.getTime() +
            (finalTimeline.design + finalTimeline.permits) * 7 * 24 * 60 * 60 * 1000
        ),
        constructionStart: new Date(
          startDate.getTime() +
            (finalTimeline.design + finalTimeline.permits + finalTimeline.sitePrep) *
              7 *
              24 *
              60 *
              60 *
              1000
        ),
        structureComplete: new Date(
          startDate.getTime() +
            (finalTimeline.design +
              finalTimeline.permits +
              finalTimeline.sitePrep +
              finalTimeline.foundation +
              finalTimeline.structure) *
              7 *
              24 *
              60 *
              60 *
              1000
        ),
        envelopeComplete: new Date(
          startDate.getTime() +
            (finalTimeline.design +
              finalTimeline.permits +
              finalTimeline.sitePrep +
              finalTimeline.foundation +
              finalTimeline.structure +
              finalTimeline.envelope) *
              7 *
              24 *
              60 *
              60 *
              1000
        ),
        interiorComplete: new Date(
          startDate.getTime() +
            (finalTimeline.design +
              finalTimeline.permits +
              finalTimeline.sitePrep +
              finalTimeline.foundation +
              finalTimeline.structure +
              finalTimeline.envelope +
              finalTimeline.interior) *
              7 *
              24 *
              60 *
              60 *
              1000
        ),
        finalInspection: new Date(
          startDate.getTime() + (totalWeeks - finalTimeline.handover) * 7 * 24 * 60 * 60 * 1000
        ),
        handover: new Date(startDate.getTime() + totalWeeks * 7 * 24 * 60 * 60 * 1000),
      };
      return {
        totalMonths,
        phases: finalTimeline,
        milestones,
      };
    } catch (error) {
      console.error('❌ [DesignCenter] Errore calcolo timeline:', error);
      throw new Error('Impossibile calcolare la timeline del progetto');
    }
  }
  /**
   * Inizializza i template di esempio se non esistono
   */
  async initializeSampleTemplates() {
    try {
      console.log('🚀 [DesignCenter] Inizializzazione template di esempio...');
      const existingTemplates = await this.getTemplates();
      if (existingTemplates.length > 0) {
        console.log('✅ [DesignCenter] Template già esistenti, skip inizializzazione');
        return;
      }
      const sampleTemplates = [
        {
          name: 'Villa Moderna Roma',
          category: 'RESIDENTIAL',
          zone: 'SUBURBAN',
          budget: 'PREMIUM',
          density: 'LOW',
          minArea: 200,
          maxArea: 400,
          minBudget: 800000,
          maxBudget: 1500000,
          floors: 2,
          bedrooms: 4,
          bathrooms: 3,
          parkingSpaces: 3,
          gardenArea: 300,
          balconyArea: 50,
          roofType: 'FLAT',
          facadeMaterial: 'MIXED',
          energyClass: 'A',
          previewImage: '/images/templates/villa-moderna-roma.jpg',
          floorPlanImage: '/images/templates/villa-moderna-roma-plan.jpg',
          sectionImage: '/images/templates/villa-moderna-roma-section.jpg',
          description:
            'Villa moderna con design contemporaneo, perfetta per famiglie che cercano eleganza e comfort',
          features: [
            'Giardino privato',
            'Terrazza panoramica',
            'Cantina',
            'Sala fitness',
            'Domotica',
          ],
          estimatedROI: 25.5,
          constructionTime: 14,
          popularity: 95,
        },
        {
          name: 'Appartamento Centro Milano',
          category: 'RESIDENTIAL',
          zone: 'URBAN',
          budget: 'LUXURY',
          density: 'HIGH',
          minArea: 80,
          maxArea: 150,
          minBudget: 1200000,
          maxBudget: 2500000,
          floors: 1,
          bedrooms: 2,
          bathrooms: 2,
          parkingSpaces: 1,
          gardenArea: 0,
          balconyArea: 20,
          roofType: 'FLAT',
          facadeMaterial: 'GLASS',
          energyClass: 'A',
          previewImage: '/images/templates/appartamento-milano.jpg',
          floorPlanImage: '/images/templates/appartamento-milano-plan.jpg',
          sectionImage: '/images/templates/appartamento-milano-section.jpg',
          description:
            'Appartamento di lusso nel cuore di Milano, design minimalista e finiture di pregio',
          features: [
            'Vista città',
            'Balcone panoramico',
            'Cucina open space',
            'Bagno spa',
            'Closet',
          ],
          estimatedROI: 18.2,
          constructionTime: 8,
          popularity: 88,
        },
        {
          name: 'Uffici Commerciali Torino',
          category: 'COMMERCIAL',
          zone: 'URBAN',
          budget: 'MEDIUM',
          density: 'MEDIUM',
          minArea: 300,
          maxArea: 800,
          minBudget: 600000,
          maxBudget: 1200000,
          floors: 3,
          bedrooms: 0,
          bathrooms: 4,
          parkingSpaces: 8,
          gardenArea: 100,
          balconyArea: 0,
          roofType: 'FLAT',
          facadeMaterial: 'MIXED',
          energyClass: 'B',
          previewImage: '/images/templates/uffici-torino.jpg',
          floorPlanImage: '/images/templates/uffici-torino-plan.jpg',
          sectionImage: '/images/templates/uffici-torino-section.jpg',
          description:
            'Edificio commerciale moderno per uffici, negozi e servizi, perfetto per investimenti',
          features: [
            'Reception',
            'Sale riunioni',
            'Spazi coworking',
            'Caffetteria',
            'Parcheggio sotterraneo',
          ],
          estimatedROI: 22.8,
          constructionTime: 12,
          popularity: 76,
        },
      ];
      // Salva i template
      for (const template of sampleTemplates) {
        const templateRef = (0, firestore_1.doc)(
          (0, firestore_1.collection)(firebase_1.db, this.TEMPLATES_COLLECTION)
        );
        await (0, firestore_1.setDoc)(templateRef, {
          ...template,
          createdAt: (0, firestore_1.serverTimestamp)(),
          updatedAt: (0, firestore_1.serverTimestamp)(),
        });
      }
      console.log('✅ [DesignCenter] Template di esempio inizializzati:', sampleTemplates.length);
    } catch (error) {
      console.warn('⚠️ [DesignCenter] Firebase non disponibile, skip inizializzazione:', error);
      // Non bloccare l'app se Firebase non è disponibile
    }
  }
}
exports.designCenterService = new DesignCenterService();
//# sourceMappingURL=designCenterService.js.map
