// Servizio Analisi di Fattibilità - Urbanova AI
import { db } from './firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy, serverTimestamp, DocumentData, getDoc } from 'firebase/firestore';

export interface FeasibilityProject {
  id?: string;
  name: string;
  address: string;
  status: 'PIANIFICAZIONE' | 'IN_CORSO' | 'COMPLETATO' | 'SOSPESO';
  startDate: Date;
  constructionStartDate: Date;
  duration: number; // mesi
  totalArea?: number; // mq totali del progetto
  
  // Costi
  costs: {
    land: {
      purchasePrice: number;
      purchaseTaxes: number;
      intermediationFees: number;
      subtotal: number;
    };
    construction: {
      excavation: number;
      structures: number;
      systems: number;
      finishes: number;
      subtotal: number;
    };
    externalWorks: number;
    concessionFees: number;
    design: number;
    bankCharges: number;
    exchange: number;
    insurance: number;
    total: number;
  };
  
  // Ricavi
  revenues: {
    units: number;
    averageArea: number; // mq
    pricePerSqm: number;
    revenuePerUnit: number;
    totalSales: number;
    otherRevenues: number;
    total: number;
  };
  
  // Risultati
  results: {
    profit: number;
    margin: number; // %
    roi: number; // %
    paybackPeriod: number; // mesi
  };
  
  // Target e confronti
  targetMargin: number;
  isTargetAchieved: boolean;
  
  // Metadati
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  sourceLandId?: string; // ID del terreno da AI Land Scraping
  notes?: string;
}

export interface FeasibilityComparison {
  id?: string;
  name: string;
  project1Id: string;
  project2Id: string;
  comparisonDate: Date;
  createdBy: string;
  insights: string[];
}

export class FeasibilityService {
  private readonly COLLECTION = 'feasibilityProjects';
  private readonly COMPARISON_COLLECTION = 'feasibilityComparisons';

  // Crea nuovo progetto di fattibilità
  async createProject(projectData: Omit<FeasibilityProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const project: Omit<FeasibilityProject, 'id'> = {
        ...projectData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, this.COLLECTION), project);
      console.log(`✅ Progetto fattibilità creato: ${project.name}`);
      return docRef.id;
    } catch (error) {
      console.error('❌ Errore creazione progetto:', error);
      throw error;
    }
  }

  // Ottieni tutti i progetti
  async getAllProjects(): Promise<FeasibilityProject[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FeasibilityProject[];
    } catch (error) {
      console.error('❌ Errore recupero progetti:', error);
      return [];
    }
  }

  // Ottieni progetto per ID
  async getProjectById(id: string): Promise<FeasibilityProject | null> {
    try {
      const docRef = doc(db, this.COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as FeasibilityProject;
      }
      return null;
    } catch (error) {
      console.error('❌ Errore recupero progetto:', error);
      return null;
    }
  }

  // Aggiorna progetto
  async updateProject(id: string, updates: Partial<FeasibilityProject>): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
      console.log(`✅ Progetto aggiornato: ${id}`);
    } catch (error) {
      console.error('❌ Errore aggiornamento progetto:', error);
      throw error;
    }
  }

  // Elimina progetto
  async deleteProject(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, id);
      await deleteDoc(docRef);
      console.log(`✅ Progetto eliminato: ${id}`);
    } catch (error) {
      console.error('❌ Errore eliminazione progetto:', error);
      throw error;
    }
  }

  // Calcola automaticamente i costi
  calculateCosts(project: Partial<FeasibilityProject>): FeasibilityProject['costs'] {
    const land = project.costs?.land || {
      purchasePrice: 0,
      purchaseTaxes: 0,
      intermediationFees: 0,
      subtotal: 0
    };

    const construction = project.costs?.construction || {
      excavation: 0,
      structures: 0,
      systems: 0,
      finishes: 0,
      subtotal: 0
    };

    // Calcoli automatici
    const landSubtotal = land.purchasePrice + land.purchaseTaxes + land.intermediationFees;
    const constructionSubtotal = construction.excavation + construction.structures + construction.systems + construction.finishes;
    
    const externalWorks = project.costs?.externalWorks || 0;
    const concessionFees = project.costs?.concessionFees || 0;
    const design = project.costs?.design || (constructionSubtotal * 0.07); // 7% del costo costruzione
    const bankCharges = project.costs?.bankCharges || 0;
    const exchange = project.costs?.exchange || 0;
    const insurance = project.costs?.insurance || (constructionSubtotal * 0.025); // 2.5% del costo costruzione

    const total = landSubtotal + constructionSubtotal + externalWorks + concessionFees + design + bankCharges + exchange + insurance;

    return {
      land: { ...land, subtotal: landSubtotal },
      construction: { ...construction, subtotal: constructionSubtotal },
      externalWorks,
      concessionFees,
      design,
      bankCharges,
      exchange,
      insurance,
      total
    };
  }

  // Calcola automaticamente i ricavi
  calculateRevenues(project: Partial<FeasibilityProject>): FeasibilityProject['revenues'] {
    const units = project.revenues?.units || 0;
    const averageArea = project.revenues?.averageArea || 0;
    const pricePerSqm = project.revenues?.pricePerSqm || 0;
    const otherRevenues = project.revenues?.otherRevenues || 0;

    const revenuePerUnit = averageArea * pricePerSqm;
    const totalSales = units * revenuePerUnit;
    const total = totalSales + otherRevenues;

    return {
      units,
      averageArea,
      pricePerSqm,
      revenuePerUnit,
      totalSales,
      otherRevenues,
      total
    };
  }

  // Calcola risultati finanziari
  calculateResults(costs: FeasibilityProject['costs'], revenues: FeasibilityProject['revenues'], targetMargin: number): FeasibilityProject['results'] {
    const profit = revenues.total - costs.total;
    const margin = costs.total > 0 ? (profit / costs.total) * 100 : 0;
    const roi = costs.total > 0 ? (profit / costs.total) * 100 : 0;
    const paybackPeriod = profit > 0 ? (costs.total / profit) * 12 : 0; // mesi

    return {
      profit,
      margin,
      roi,
      paybackPeriod
    };
  }

  // Crea progetto da terreno AI Land Scraping
  async createFromLand(landData: any, userId: string): Promise<string> {
    const projectName = `Progetto ${landData.location} - ${landData.area}m²`;
    
    const project: Omit<FeasibilityProject, 'id' | 'createdAt' | 'updatedAt'> = {
      name: projectName,
      address: landData.location,
      status: 'PIANIFICAZIONE',
      startDate: new Date(),
      constructionStartDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // +90 giorni
      duration: 18,
      costs: {
        land: {
          purchasePrice: landData.price,
          purchaseTaxes: landData.price * 0.09, // 9% imposte
          intermediationFees: landData.price * 0.03, // 3% commissioni
          subtotal: 0
        },
        construction: {
          excavation: 0,
          structures: 0,
          systems: 0,
          finishes: 0,
          subtotal: 0
        },
        externalWorks: 0,
        concessionFees: 0,
        design: 0,
        bankCharges: 0,
        exchange: 0,
        insurance: 0,
        total: 0
      },
      revenues: {
        units: 2,
        averageArea: landData.area / 2,
        pricePerSqm: 1700,
        revenuePerUnit: 0,
        totalSales: 0,
        otherRevenues: 0,
        total: 0
      },
      results: {
        profit: 0,
        margin: 0,
        roi: 0,
        paybackPeriod: 0
      },
      targetMargin: 30,
      isTargetAchieved: false,
      createdBy: userId,
      sourceLandId: landData.id,
      notes: `Creato automaticamente da terreno: ${landData.title}`
    };

    // Calcola automaticamente tutti i valori
    project.costs = this.calculateCosts(project);
    project.revenues = this.calculateRevenues(project);
    project.results = this.calculateResults(project.costs, project.revenues, project.targetMargin);
    project.isTargetAchieved = project.results.margin >= project.targetMargin;

    return await this.createProject(project);
  }

  // Ottieni classifica progetti per marginalità
  async getProjectsRanking(): Promise<FeasibilityProject[]> {
    const projects = await this.getAllProjects();
    return projects.sort((a, b) => b.results.margin - a.results.margin);
  }

  // Confronta due progetti
  async compareProjects(project1Id: string, project2Id: string, userId: string): Promise<FeasibilityComparison> {
    const project1 = await this.getProjectById(project1Id);
    const project2 = await this.getProjectById(project2Id);

    if (!project1 || !project2) {
      throw new Error('Progetti non trovati');
    }

    const insights = this.generateComparisonInsights(project1, project2);

    const comparison: Omit<FeasibilityComparison, 'id'> = {
      name: `Confronto: ${project1.name} vs ${project2.name}`,
      project1Id,
      project2Id,
      comparisonDate: new Date(),
      createdBy: userId,
      insights
    };

    const docRef = await addDoc(collection(db, this.COMPARISON_COLLECTION), comparison);
    return { id: docRef.id, ...comparison };
  }

  // Genera insights per confronto
  private generateComparisonInsights(project1: FeasibilityProject, project2: FeasibilityProject): string[] {
    const insights: string[] = [];

    // Confronto marginalità
    if (project1.results.margin > project2.results.margin) {
      insights.push(`${project1.name} ha una marginalità superiore del ${(project1.results.margin - project2.results.margin).toFixed(1)}%`);
    } else {
      insights.push(`${project2.name} ha una marginalità superiore del ${(project2.results.margin - project1.results.margin).toFixed(1)}%`);
    }

    // Confronto ROI
    if (project1.results.roi > project2.results.roi) {
      insights.push(`${project1.name} offre un ROI migliore (${project1.results.roi.toFixed(1)}% vs ${project2.results.roi.toFixed(1)}%)`);
    } else {
      insights.push(`${project2.name} offre un ROI migliore (${project2.results.roi.toFixed(1)}% vs ${project1.results.roi.toFixed(1)}%)`);
    }

    // Confronto payback
    if (project1.results.paybackPeriod < project2.results.paybackPeriod) {
      insights.push(`${project1.name} ha un tempo di ritorno più breve (${project1.results.paybackPeriod.toFixed(1)} mesi vs ${project2.results.paybackPeriod.toFixed(1)} mesi)`);
    } else {
      insights.push(`${project2.name} ha un tempo di ritorno più breve (${project2.results.paybackPeriod.toFixed(1)} mesi vs ${project1.results.paybackPeriod.toFixed(1)} mesi)`);
    }

    // Confronto costi
    const costDiff = ((project1.costs.total - project2.costs.total) / project2.costs.total) * 100;
    if (costDiff > 0) {
      insights.push(`${project1.name} ha costi totali superiori del ${costDiff.toFixed(1)}%`);
    } else {
      insights.push(`${project2.name} ha costi totali superiori del ${Math.abs(costDiff).toFixed(1)}%`);
    }

    return insights;
  }

  // Ottieni statistiche generali
  async getStatistics(): Promise<{
    totalProjects: number;
    averageMargin: number;
    totalInvestment: number;
    totalProfit: number;
    projectsOnTarget: number;
    bestProject: FeasibilityProject | null;
  }> {
    const projects = await this.getAllProjects();
    
    if (projects.length === 0) {
      return {
        totalProjects: 0,
        averageMargin: 0,
        totalInvestment: 0,
        totalProfit: 0,
        projectsOnTarget: 0,
        bestProject: null
      };
    }

    const totalProjects = projects.length;
    const averageMargin = projects.reduce((sum, p) => sum + p.results.margin, 0) / totalProjects;
    const totalInvestment = projects.reduce((sum, p) => sum + p.costs.total, 0);
    const totalProfit = projects.reduce((sum, p) => sum + p.results.profit, 0);
    const projectsOnTarget = projects.filter(p => p.isTargetAchieved).length;
    const bestProject = projects.sort((a, b) => b.results.margin - a.results.margin)[0];

    return {
      totalProjects,
      averageMargin,
      totalInvestment,
      totalProfit,
      projectsOnTarget,
      bestProject
    };
  }
}

// Istanza singleton
export const feasibilityService = new FeasibilityService(); 