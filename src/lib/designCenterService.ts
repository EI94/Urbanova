import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface DesignTemplate {
  id: string;
  name: string;
  category: 'RESIDENTIAL' | 'COMMERCIAL' | 'MIXED' | 'INDUSTRIAL';
  zone: 'URBAN' | 'SUBURBAN' | 'RURAL' | 'COASTAL';
  budget: 'ECONOMIC' | 'MEDIUM' | 'PREMIUM' | 'LUXURY';
  density: 'LOW' | 'MEDIUM' | 'HIGH';
  minArea: number; // m²
  maxArea: number; // m²
  minBudget: number; // €
  maxBudget: number; // €
  floors: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  gardenArea: number; // m²
  balconyArea: number; // m²
  roofType: 'FLAT' | 'PITCHED' | 'GREEN' | 'SOLAR';
  facadeMaterial: 'BRICK' | 'STONE' | 'GLASS' | 'MIXED';
  energyClass: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  previewImage: string;
  floorPlanImage: string;
  sectionImage: string;
  description: string;
  features: string[];
  estimatedROI: number; // %
  constructionTime: number; // mesi
  popularity: number; // 1-100
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectDesign {
  id: string;
  projectId: string;
  templateId: string;
  customizations: DesignCustomization;
  constraints: DesignConstraints;
  location: GeoLocation;
  budget: BudgetBreakdown;
  timeline: ProjectTimeline;
  approvals: ApprovalStatus[];
  status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
  createdAt: Date;
  updatedAt: Date;
  name?: string;
  category?: string;
  estimatedROI?: number;
}

export interface DesignCustomization {
  // Modifiche al template base
  area: number; // m²
  floors: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  gardenArea: number;
  balconyArea: number;
  roofType: string;
  facadeMaterial: string;
  energyClass: string;
  customFeatures: string[];
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  interiorStyle: 'MODERN' | 'CLASSIC' | 'MINIMALIST' | 'LUXURY' | 'ECO_FRIENDLY';
}

export interface DesignConstraints {
  // Vincoli reali del terreno
  boundaryDistance: number; // metri dal confine (default 10m)
  setbackFront: number; // metri dal fronte strada
  setbackSide: number; // metri dai lati
  setbackRear: number; // metri dal retro
  maxHeight: number; // metri massimi
  maxCoverage: number; // % massima copertura terreno
  parkingRequirements: number; // posti auto minimi richiesti
  greenAreaMin: number; // % area verde minima
  accessibility: boolean; // requisiti accessibilità
  fireSafety: boolean; // requisiti antincendio
  seismic: string; // zona sismica
  environmental: string[]; // vincoli ambientali
}

export interface GeoLocation {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  cadastral: {
    sheet: string;
    parcel: string;
    subParcel: string;
  };
  zoning: {
    category: string; // residenziale, commerciale, misto
    density: string; // bassa, media, alta
    heightLimit: number;
    coverageLimit: number;
  };
  topography: {
    slope: number; // % pendenza
    orientation: string; // N, S, E, W, NE, NW, SE, SW
    soilType: string; // argilloso, sabbioso, roccioso
    waterTable: number; // metri profondità falda
  };
  infrastructure: {
    water: boolean;
    electricity: boolean;
    gas: boolean;
    sewage: boolean;
    internet: boolean;
    publicTransport: boolean;
  };
  surroundings: {
    schools: number; // km
    hospitals: number; // km
    shopping: number; // km
    parks: number; // km
    noise: 'LOW' | 'MEDIUM' | 'HIGH';
    pollution: 'LOW' | 'MEDIUM' | 'HIGH';
  };
}

export interface BudgetBreakdown {
  total: number;
  land: number;
  design: number;
  permits: number;
  construction: number;
  materials: number;
  labor: number;
  equipment: number;
  utilities: number;
  landscaping: number;
  contingency: number; // 10-15% del totale
  breakdown: {
    foundation: number;
    structure: number;
    envelope: number;
    interior: number;
    mechanical: number;
    electrical: number;
    finishes: number;
  };
}

export interface ProjectTimeline {
  totalMonths: number;
  phases: {
    design: number; // settimane
    permits: number; // settimane
    sitePrep: number; // settimane
    foundation: number; // settimane
    structure: number; // settimane
    envelope: number; // settimane
    interior: number; // settimane
    finishes: number; // settimane
    testing: number; // settimane
    handover: number; // settimane
  };
  milestones: {
    designComplete: Date;
    permitsObtained: Date;
    constructionStart: Date;
    structureComplete: Date;
    envelopeComplete: Date;
    interiorComplete: Date;
    finalInspection: Date;
    handover: Date;
  };
}

export interface ApprovalStatus {
  id: string;
  type: 'DESIGN' | 'STRUCTURAL' | 'FIRE_SAFETY' | 'ENVIRONMENTAL' | 'BUILDING_PERMIT';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  authority: string;
  requirements: string[];
  submittedAt: Date;
  reviewedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  comments: string;
  documents: string[];
}

class DesignCenterService {
  private readonly TEMPLATES_COLLECTION = 'design_templates';
  private readonly PROJECTS_COLLECTION = 'project_designs';
  private readonly CONSTRAINTS_COLLECTION = 'design_constraints';

  /**
   * Ottiene tutti i template disponibili con filtri
   */
  async getTemplates(filters?: {
    category?: string;
    zone?: string;
    budget?: string;
    density?: string;
    minArea?: number;
    maxArea?: number;
    minBudget?: number;
    maxBudget?: number;
  }): Promise<DesignTemplate[]> {
    try {
      console.log('🎨 [DesignCenter] Recupero template con filtri:', filters);
      
      const templatesRef = collection(db, this.TEMPLATES_COLLECTION);
      let q = query(templatesRef, orderBy('popularity', 'desc'));
      
      // Applica filtri se specificati
      if (filters?.category) {
        q = query(q, where('category', '==', filters.category));
      }
      if (filters?.zone) {
        q = query(q, where('zone', '==', filters.zone));
      }
      if (filters?.budget) {
        q = query(q, where('budget', '==', filters.budget));
      }
      if (filters?.density) {
        q = query(q, where('density', '==', filters.density));
      }
      
      const snapshot = await getDocs(q);
      let templates: DesignTemplate[] = [];
      
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
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      });
      
      // Filtra per area e budget se specificati
      if (filters?.minArea) {
        templates = templates.filter(t => t.maxArea >= filters.minArea!);
      }
      if (filters?.maxArea) {
        templates = templates.filter(t => t.minArea <= filters.maxArea!);
      }
      if (filters?.minBudget) {
        templates = templates.filter(t => t.maxBudget >= filters.minBudget!);
      }
      if (filters?.maxBudget) {
        templates = templates.filter(t => t.minBudget <= filters.maxBudget!);
      }
      
      console.log(`✅ [DesignCenter] Trovati ${templates.length} template`);
      return templates;
    } catch (error) {
      console.error('❌ [DesignCenter] Errore recupero template:', error);
      return [];
    }
  }

  /**
   * Ottiene un template specifico
   */
  async getTemplate(templateId: string): Promise<DesignTemplate | null> {
    try {
      const templateRef = doc(db, this.TEMPLATES_COLLECTION, templateId);
      const snapshot = await getDoc(templateRef);
      
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
          updatedAt: data.updatedAt?.toDate() || new Date()
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
  async createProjectDesign(projectData: Omit<ProjectDesign, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      console.log('🎨 [DesignCenter] Creazione progetto design:', projectData.projectId);
      
      const projectRef = doc(collection(db, this.PROJECTS_COLLECTION));
      await projectRef.set({
        ...projectData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
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
  async updateProjectDesign(projectId: string, updates: Partial<ProjectDesign>): Promise<void> {
    try {
      const projectRef = doc(db, this.PROJECTS_COLLECTION, projectId);
      await updateDoc(projectRef, {
        ...updates,
        updatedAt: serverTimestamp()
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
  async getProjectDesigns(projectId: string): Promise<ProjectDesign[]> {
    try {
      const projectsRef = collection(db, this.PROJECTS_COLLECTION);
      const q = query(
        projectsRef,
        where('projectId', '==', projectId),
        orderBy('updatedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const projects: ProjectDesign[] = [];
      
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
          updatedAt: data.updatedAt?.toDate() || new Date()
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
  async getAllProjectDesigns(): Promise<ProjectDesign[]> {
    try {
      const projectsRef = collection(db, this.PROJECTS_COLLECTION);
      const q = query(projectsRef, orderBy('updatedAt', 'desc'));
      
      const snapshot = await getDocs(q);
      const projects: ProjectDesign[] = [];
      
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
          updatedAt: data.updatedAt?.toDate() || new Date()
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
  async validateDesignConstraints(
    template: DesignTemplate,
    location: GeoLocation,
    customizations: DesignCustomization
  ): Promise<{
    isValid: boolean;
    violations: string[];
    recommendations: string[];
    adjustedConstraints: DesignConstraints;
  }> {
    try {
      console.log('🔍 [DesignCenter] Validazione vincoli design per:', location.address);
      
      const violations: string[] = [];
      const recommendations: string[] = [];
      
      // Calcola vincoli basati su zona e regolamenti
      const constraints = this.calculateConstraints(location, customizations);
      
      // Valida area copertura
      const coverage = (customizations.area / (customizations.area + constraints.greenAreaMin)) * 100;
      if (coverage > constraints.maxCoverage) {
        violations.push(`Copertura terreno ${coverage.toFixed(1)}% supera il limite ${constraints.maxCoverage}%`);
        recommendations.push('Ridurre area edificabile o aumentare area verde');
      }
      
      // Valida distanza confini
      if (customizations.area > 0) {
        const minSide = Math.sqrt(customizations.area);
        if (minSide / 2 < constraints.boundaryDistance) {
          violations.push(`Distanza minima dal confine (${constraints.boundaryDistance}m) non rispettata`);
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
        violations.push(`Posti auto ${customizations.parkingSpaces} insufficienti (richiesti: ${requiredParking})`);
        recommendations.push('Aumentare posti auto o ridurre camere');
      }
      
      // Valida area verde
      const greenArea = customizations.gardenArea + customizations.balconyArea;
      const minGreenArea = (customizations.area + greenArea) * (constraints.greenAreaMin / 100);
      if (greenArea < minGreenArea) {
        violations.push(`Area verde ${greenArea}m² insufficiente (minima: ${minGreenArea.toFixed(0)}m²)`);
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
        adjustedConstraints: constraints
      };
      
    } catch (error) {
      console.error('❌ [DesignCenter] Errore validazione vincoli:', error);
      throw new Error('Impossibile validare i vincoli di design');
    }
  }

  /**
   * Calcola i vincoli basati su zona e regolamenti
   */
  private calculateConstraints(location: GeoLocation, customizations: DesignCustomization): DesignConstraints {
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
      environmental: []
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
    if (customizations.area > 500) { // Progetti grandi
      baseConstraints.boundaryDistance = 15; // 15m per progetti grandi
      baseConstraints.setbackFront = 8; // 8m per progetti grandi
    }
    
    return baseConstraints;
  }

  /**
   * Calcola il budget dettagliato per un progetto
   */
  async calculateProjectBudget(
    template: DesignTemplate,
    customizations: DesignCustomization,
    location: GeoLocation
  ): Promise<BudgetBreakdown> {
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
      const constructionCost = foundationCost + structureCost + envelopeCost + interiorCost + mechanicalCost + electricalCost + finishesCost;
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
          finishes: finishesCost
        }
      };
      
    } catch (error) {
      console.error('❌ [DesignCenter] Errore calcolo budget:', error);
      throw new Error('Impossibile calcolare il budget del progetto');
    }
  }

  /**
   * Ottiene i costi base per m² basati su zona e qualità
   */
  private getBaseCostPerSqm(location: GeoLocation, budget: string): {
    foundation: number;
    structure: number;
    envelope: number;
    interior: number;
    mechanical: number;
    electrical: number;
    finishes: number;
  } {
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
      finishes: 250
    };
    
    // Applica moltiplicatori
    Object.keys(baseCosts).forEach(key => {
      baseCosts[key as keyof typeof baseCosts] *= zoneMultiplier * qualityMultiplier;
    });
    
    return baseCosts;
  }

  /**
   * Moltiplicatore per zona geografica
   */
  private getZoneMultiplier(location: GeoLocation): number {
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
  private getQualityMultiplier(budget: string): number {
    switch (budget) {
      case 'ECONOMIC': return 0.8;
      case 'MEDIUM': return 1.0;
      case 'PREMIUM': return 1.3;
      case 'LUXURY': return 1.8;
      default: return 1.0;
    }
  }

  /**
   * Calcola la timeline del progetto
   */
  async calculateProjectTimeline(
    template: DesignTemplate,
    customizations: DesignCustomization,
    complexity: 'LOW' | 'MEDIUM' | 'HIGH'
  ): Promise<ProjectTimeline> {
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
        handover: 1 // 1 settimana consegna
      };
      
      // Aggiusta per complessità
      const complexityMultiplier = complexity === 'LOW' ? 0.8 : complexity === 'HIGH' ? 1.3 : 1.0;
      
      // Aggiusta per dimensioni
      const sizeMultiplier = customizations.area > 300 ? 1.2 : customizations.area > 150 ? 1.0 : 0.9;
      
      // Calcola timeline finale
      const finalTimeline = { ...baseTimeline };
      Object.keys(finalTimeline).forEach(key => {
        finalTimeline[key as keyof typeof finalTimeline] = Math.ceil(
          finalTimeline[key as keyof typeof finalTimeline] * complexityMultiplier * sizeMultiplier
        );
      });
      
      // Calcola totale mesi
      const totalWeeks = Object.values(finalTimeline).reduce((sum, weeks) => sum + weeks, 0);
      const totalMonths = Math.ceil(totalWeeks / 4.33); // 4.33 settimane per mese
      
      // Calcola milestone dates (inizia da oggi)
      const startDate = new Date();
      const milestones = {
        designComplete: new Date(startDate.getTime() + finalTimeline.design * 7 * 24 * 60 * 60 * 1000),
        permitsObtained: new Date(startDate.getTime() + (finalTimeline.design + finalTimeline.permits) * 7 * 24 * 60 * 60 * 1000),
        constructionStart: new Date(startDate.getTime() + (finalTimeline.design + finalTimeline.permits + finalTimeline.sitePrep) * 7 * 24 * 60 * 60 * 1000),
        structureComplete: new Date(startDate.getTime() + (finalTimeline.design + finalTimeline.permits + finalTimeline.sitePrep + finalTimeline.foundation + finalTimeline.structure) * 7 * 24 * 60 * 60 * 1000),
        envelopeComplete: new Date(startDate.getTime() + (finalTimeline.design + finalTimeline.permits + finalTimeline.sitePrep + finalTimeline.foundation + finalTimeline.structure + finalTimeline.envelope) * 7 * 24 * 60 * 60 * 1000),
        interiorComplete: new Date(startDate.getTime() + (finalTimeline.design + finalTimeline.permits + finalTimeline.sitePrep + finalTimeline.foundation + finalTimeline.structure + finalTimeline.envelope + finalTimeline.interior) * 7 * 24 * 60 * 60 * 1000),
        finalInspection: new Date(startDate.getTime() + (totalWeeks - finalTimeline.handover) * 7 * 24 * 60 * 60 * 1000),
        handover: new Date(startDate.getTime() + totalWeeks * 7 * 24 * 60 * 60 * 1000)
      };
      
      return {
        totalMonths,
        phases: finalTimeline,
        milestones
      };
      
    } catch (error) {
      console.error('❌ [DesignCenter] Errore calcolo timeline:', error);
      throw new Error('Impossibile calcolare la timeline del progetto');
    }
  }

  /**
   * Inizializza i template di esempio se non esistono
   */
  async initializeSampleTemplates(): Promise<void> {
    try {
      console.log('🚀 [DesignCenter] Inizializzazione template di esempio...');
      
      const existingTemplates = await this.getTemplates();
      if (existingTemplates.length > 0) {
        console.log('✅ [DesignCenter] Template già esistenti, skip inizializzazione');
        return;
      }
      
      const sampleTemplates: Omit<DesignTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
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
          description: 'Villa moderna con design contemporaneo, perfetta per famiglie che cercano eleganza e comfort',
          features: ['Giardino privato', 'Terrazza panoramica', 'Cantina', 'Sala fitness', 'Domotica'],
          estimatedROI: 25.5,
          constructionTime: 14,
          popularity: 95
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
          energyClass: 'A+',
          previewImage: '/images/templates/appartamento-milano.jpg',
          floorPlanImage: '/images/templates/appartamento-milano-plan.jpg',
          sectionImage: '/images/templates/appartamento-milano-section.jpg',
          description: 'Appartamento di lusso nel cuore di Milano, design minimalista e finiture di pregio',
          features: ['Vista città', 'Balcone panoramico', 'Cucina open space', 'Bagno spa', 'Closet'],
          estimatedROI: 18.2,
          constructionTime: 8,
          popularity: 88
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
          description: 'Edificio commerciale moderno per uffici, negozi e servizi, perfetto per investimenti',
          features: ['Reception', 'Sale riunioni', 'Spazi coworking', 'Caffetteria', 'Parcheggio sotterraneo'],
          estimatedROI: 22.8,
          constructionTime: 12,
          popularity: 76
        }
      ];
      
      // Salva i template
      for (const template of sampleTemplates) {
        const templateRef = doc(collection(db, this.TEMPLATES_COLLECTION));
        await templateRef.set({
          ...template,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      console.log('✅ [DesignCenter] Template di esempio inizializzati:', sampleTemplates.length);
      
    } catch (error) {
      console.error('❌ [DesignCenter] Errore inizializzazione template:', error);
    }
  }
}

export const designCenterService = new DesignCenterService();
