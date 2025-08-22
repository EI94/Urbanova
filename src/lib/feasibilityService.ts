// Servizio Analisi di Fattibilità - Urbanova AI
import { db } from './firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy, serverTimestamp, DocumentData, getDoc, writeBatch, runTransaction } from 'firebase/firestore';

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
      console.log('🔄 Creazione progetto fattibilità:', projectData);
      
      // Verifica che i dati siano validi
      if (!projectData.name || !projectData.address) {
        throw new Error('Nome e indirizzo sono obbligatori');
      }
      
      // Verifica che l'utente sia autenticato
      if (!projectData.createdBy) {
        throw new Error('Utente non autenticato');
      }
      
      const project: Omit<FeasibilityProject, 'id'> = {
        ...projectData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, this.COLLECTION), project);
      console.log(`✅ Progetto fattibilità creato: ${project.name} con ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error('❌ Errore creazione progetto:', error);
      throw new Error(`Impossibile creare il progetto: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
    }
  }

  // Crea progetto con transazione per maggiore sicurezza
  async createProjectWithTransaction(projectData: Omit<FeasibilityProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      console.log('🔄 Creazione progetto fattibilità con transazione:', projectData);
      
      // Verifica che i dati siano validi
      if (!projectData.name || !projectData.address) {
        throw new Error('Nome e indirizzo sono obbligatori');
      }
      
      // Verifica che l'utente sia autenticato
      if (!projectData.createdBy) {
        throw new Error('Utente non autenticato');
      }
      
      return await runTransaction(db, async (transaction) => {
        const project: Omit<FeasibilityProject, 'id'> = {
          ...projectData,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const docRef = doc(collection(db, this.COLLECTION));
        transaction.set(docRef, project);
        
        console.log(`✅ Progetto fattibilità creato con transazione: ${project.name} con ID: ${docRef.id}`);
        return docRef.id;
      });
    } catch (error) {
      console.error('❌ Errore creazione progetto con transazione:', error);
      throw new Error(`Impossibile creare il progetto: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
    }
  }

  // Crea progetto con batch per operazioni multiple
  async createProjectWithBatch(projectData: Omit<FeasibilityProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      console.log('🔄 Creazione progetto fattibilità con batch:', projectData);
      
      // Verifica che i dati siano validi
      if (!projectData.name || !projectData.address) {
        throw new Error('Nome e indirizzo sono obbligatori');
      }
      
      // Verifica che l'utente sia autenticato
      if (!projectData.createdBy) {
        throw new Error('Utente non autenticato');
      }
      
      const batch = writeBatch(db);
      
      const project: Omit<FeasibilityProject, 'id'> = {
        ...projectData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = doc(collection(db, this.COLLECTION));
      batch.set(docRef, project);
      
      // Commit del batch
      await batch.commit();
      
      console.log(`✅ Progetto fattibilità creato con batch: ${project.name} con ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error('❌ Errore creazione progetto con batch:', error);
      throw new Error(`Impossibile creare il progetto: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
    }
  }

  // Ottieni tutti i progetti di fattibilità
  async getAllProjects(): Promise<FeasibilityProject[]> {
    try {
      console.log('🔄 Caricamento tutti i progetti fattibilità...');
      
      const projectsRef = collection(db, this.COLLECTION);
      const q = query(projectsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FeasibilityProject[];
      
      console.log(`✅ Progetti fattibilità caricati: ${projects.length}`);
      return projects;
    } catch (error) {
      console.error('❌ Errore caricamento progetti:', error);
      return [];
    }
  }

  // Ottieni progetti per utente
  async getProjectsByUser(userId: string): Promise<FeasibilityProject[]> {
    try {
      console.log(`🔄 Caricamento progetti fattibilità per utente: ${userId}`);
      
      if (!userId) {
        console.warn('⚠️ UserId non fornito');
        return [];
      }
      
      const projectsRef = collection(db, this.COLLECTION);
      const q = query(
        projectsRef, 
        where('createdBy', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FeasibilityProject[];
      
      console.log(`✅ Progetti fattibilità utente caricati: ${projects.length}`);
      return projects;
    } catch (error) {
      console.error(`❌ Errore caricamento progetti utente ${userId}:`, error);
      return [];
    }
  }

  // Ottieni progetto per ID
  async getProjectById(id: string): Promise<FeasibilityProject | null> {
    try {
      console.log(`🔄 Caricamento progetto fattibilità: ${id}`);
      
      if (!id) {
        console.warn('⚠️ ID progetto non fornito');
        return null;
      }
      
      const docRef = doc(db, this.COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const project = {
          id: docSnap.id,
          ...docSnap.data()
        } as FeasibilityProject;
        
        console.log(`✅ Progetto fattibilità caricato: ${project.name}`);
        return project;
      } else {
        console.log(`⚠️ Progetto fattibilità non trovato: ${id}`);
        return null;
      }
    } catch (error) {
      console.error(`❌ Errore caricamento progetto ${id}:`, error);
      return null;
    }
  }

  // Aggiorna progetto esistente
  async updateProject(id: string, updates: Partial<FeasibilityProject>): Promise<void> {
    try {
      console.log(`🔄 Aggiornamento progetto fattibilità: ${id}`, updates);
      
      if (!id) {
        throw new Error('ID progetto non fornito');
      }
      
      const projectRef = doc(db, this.COLLECTION, id);
      await updateDoc(projectRef, {
        ...updates,
        updatedAt: new Date()
      });
      
      console.log(`✅ Progetto fattibilità ${id} aggiornato`);
    } catch (error) {
      console.error(`❌ Errore aggiornamento progetto ${id}:`, error);
      throw new Error(`Impossibile aggiornare il progetto: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
    }
  }

  // Elimina progetto
  async deleteProject(id: string): Promise<void> {
    try {
      console.log(`🔄 Eliminazione progetto fattibilità: ${id}`);
      
      if (!id) {
        throw new Error('ID progetto non fornito');
      }
      
      const projectRef = doc(db, this.COLLECTION, id);
      await deleteDoc(projectRef);
      
      console.log(`✅ Progetto fattibilità ${id} eliminato`);
    } catch (error) {
      console.error(`❌ Errore eliminazione progetto ${id}:`, error);
      throw new Error(`Impossibile eliminare il progetto: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
    }
  }

  // Test connessione Firestore
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔄 Test connessione Firestore per fattibilità...');
      
      // Prova a leggere un documento di test
      const testRef = doc(db, 'test', 'feasibility');
      await getDoc(testRef);
      
      console.log('✅ Connessione Firestore fattibilità OK');
      return true;
    } catch (error) {
      console.error('❌ Errore connessione Firestore fattibilità:', error);
      return false;
    }
  }

  // Calcola i costi del progetto
  calculateCosts(project: Partial<FeasibilityProject>): {
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
  } {
    try {
      console.log('🔄 Calcolo costi progetto...');
      
      const costs = {
        land: {
          purchasePrice: project.costs?.land?.purchasePrice || 0,
          purchaseTaxes: project.costs?.land?.purchaseTaxes || 0,
          intermediationFees: project.costs?.land?.intermediationFees || 0,
          subtotal: 0
        },
        construction: {
          excavation: project.costs?.construction?.excavation || 0,
          structures: project.costs?.construction?.structures || 0,
          systems: project.costs?.construction?.systems || 0,
          finishes: project.costs?.construction?.finishes || 0,
          subtotal: 0
        },
        externalWorks: project.costs?.externalWorks || 0,
        concessionFees: project.costs?.concessionFees || 0,
        design: project.costs?.design || 0,
        bankCharges: project.costs?.bankCharges || 0,
        exchange: project.costs?.exchange || 0,
        insurance: project.costs?.insurance || 0,
        total: 0
      };
      
      // Calcola subtotali
      costs.land.subtotal = costs.land.purchasePrice + costs.land.purchaseTaxes + costs.land.intermediationFees;
      costs.construction.subtotal = costs.construction.excavation + costs.construction.structures + costs.construction.systems + costs.construction.finishes;
      
      // Calcola totale
      costs.total = costs.land.subtotal + costs.construction.subtotal + costs.externalWorks + costs.concessionFees + costs.design + costs.bankCharges + costs.exchange + costs.insurance;
      
      console.log('✅ Costi calcolati:', costs);
      return costs;
    } catch (error) {
      console.error('❌ Errore calcolo costi:', error);
      return {
        land: { purchasePrice: 0, purchaseTaxes: 0, intermediationFees: 0, subtotal: 0 },
        construction: { excavation: 0, structures: 0, systems: 0, finishes: 0, subtotal: 0 },
        externalWorks: 0,
        concessionFees: 0,
        design: 0,
        bankCharges: 0,
        exchange: 0,
        insurance: 0,
        total: 0
      };
    }
  }

  // Calcola i ricavi del progetto
  calculateRevenues(project: Partial<FeasibilityProject>): {
    units: number;
    averageArea: number;
    pricePerSqm: number;
    revenuePerUnit: number;
    totalSales: number;
    otherRevenues: number;
    total: number;
  } {
    try {
      console.log('🔄 Calcolo ricavi progetto...');
      
      const revenues = {
        units: project.revenues?.units || 0,
        averageArea: project.revenues?.averageArea || 0,
        pricePerSqm: project.revenues?.pricePerSqm || 0,
        revenuePerUnit: 0,
        totalSales: 0,
        otherRevenues: project.revenues?.otherRevenues || 0,
        total: 0
      };
      
      // Calcola ricavi per unità e totali
      revenues.revenuePerUnit = revenues.averageArea * revenues.pricePerSqm;
      revenues.totalSales = revenues.units * revenues.revenuePerUnit;
      revenues.total = revenues.totalSales + revenues.otherRevenues;
      
      console.log('✅ Ricavi calcolati:', revenues);
      return revenues;
    } catch (error) {
      console.error('❌ Errore calcolo ricavi:', error);
      return {
        units: 0,
        averageArea: 0,
        pricePerSqm: 0,
        revenuePerUnit: 0,
        totalSales: 0,
        otherRevenues: 0,
        total: 0
      };
    }
  }

  // Calcola i risultati del progetto
  calculateResults(costs: any, revenues: any, targetMargin: number): {
    profit: number;
    margin: number;
    roi: number;
    paybackPeriod: number;
  } {
    try {
      console.log('🔄 Calcolo risultati progetto...');
      
      const totalCosts = costs.total || 0;
      const totalRevenues = revenues.total || 0;
      
      const profit = totalRevenues - totalCosts;
      const margin = totalRevenues > 0 ? (profit / totalRevenues) * 100 : 0;
      const roi = totalCosts > 0 ? (profit / totalCosts) * 100 : 0;
      
      // Calcola payback period (semplificato)
      let paybackPeriod = 0;
      if (profit > 0 && totalCosts > 0) {
        paybackPeriod = (totalCosts / profit) * 12; // in mesi
      }
      
      const results = {
        profit: Math.round(profit),
        margin: Math.round(margin * 100) / 100, // 2 decimali
        roi: Math.round(roi * 100) / 100,
        paybackPeriod: Math.round(paybackPeriod * 10) / 10 // 1 decimale
      };
      
      console.log('✅ Risultati calcolati:', results);
      return results;
    } catch (error) {
      console.error('❌ Errore calcolo risultati:', error);
      return {
        profit: 0,
        margin: 0,
        roi: 0,
        paybackPeriod: 0
      };
    }
  }

  // Calcola fattibilità del progetto
  calculateFeasibility(project: FeasibilityProject): {
    isFeasible: boolean;
    score: number;
    risks: string[];
    recommendations: string[];
  } {
    try {
      console.log('🔄 Calcolo fattibilità progetto:', project.name);
      
      let score = 0;
      const risks: string[] = [];
      const recommendations: string[] = [];
      
      // Analisi costi
      const totalCosts = project.costs.total;
      const totalRevenues = project.revenues.total;
      
      if (totalCosts > 0 && totalRevenues > 0) {
        const margin = ((totalRevenues - totalCosts) / totalRevenues) * 100;
        score += Math.min(margin * 2, 40); // Max 40 punti per margine
        
        if (margin < project.targetMargin) {
          risks.push(`Margine inferiore al target (${margin.toFixed(1)}% vs ${project.targetMargin}%)`);
          recommendations.push('Ridurre i costi o aumentare i ricavi');
        }
      }
      
      // Analisi durata
      if (project.duration <= 24) {
        score += 20; // Progetti brevi sono preferibili
      } else if (project.duration <= 36) {
        score += 15;
      } else {
        score += 10;
        risks.push('Durata progetto elevata');
        recommendations.push('Valutare possibilità di accelerazione');
      }
      
      // Analisi area
      if (project.totalArea && project.totalArea > 0) {
        if (project.totalArea <= 500) {
          score += 15;
        } else if (project.totalArea <= 1000) {
          score += 10;
        } else {
          score += 5;
          risks.push('Area progetto molto estesa');
        }
      }
      
      // Analisi ROI
      if (project.results.roi > 0) {
        if (project.results.roi >= 20) {
          score += 25;
        } else if (project.results.roi >= 15) {
          score += 20;
        } else if (project.results.roi >= 10) {
          score += 15;
        } else {
          score += 10;
          risks.push('ROI basso');
          recommendations.push('Valutare strategie per migliorare la redditività');
        }
      }
      
      const isFeasible = score >= 60;
      
      if (isFeasible) {
        recommendations.push('Progetto fattibile - procedere con cautela');
      } else {
        recommendations.push('Progetto non fattibile - richiede revisione');
      }
      
      console.log(`✅ Fattibilità calcolata: ${score}/100 - Fattibile: ${isFeasible}`);
      
      return {
        isFeasible,
        score: Math.round(score),
        risks,
        recommendations
      };
    } catch (error) {
      console.error('❌ Errore calcolo fattibilità:', error);
      return {
        isFeasible: false,
        score: 0,
        risks: ['Errore nel calcolo'],
        recommendations: ['Contattare supporto tecnico']
      };
    }
  }
}

export const feasibilityService = new FeasibilityService(); 