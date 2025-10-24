/**
 * 🗄️ BUDGET SUPPLIERS REPOSITORY
 * 
 * CRUD operations e query helper per Budget & Fornitori
 */

import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import {
  Typology,
  BoqItem,
  Rfp,
  Offer,
  ContractBundle,
  Sal,
  CreateTypologyInput,
  UpdateTypologyInput,
  CreateBoqItemInput,
  UpdateBoqItemInput,
  CreateRfpInput,
  UpdateRfpInput,
  CreateOfferInput,
  UpdateOfferInput,
  CreateContractInput,
  UpdateContractInput,
  CreateSalInput,
  UpdateSalInput,
  TypologyFilters,
  BoqItemFilters,
  RfpFilters,
  OfferFilters,
  ContractFilters,
  SalFilters,
} from './types';

// Collection names
const COLLECTIONS = {
  TYPOLOGIES: 'typologies',
  BOQ_ITEMS: 'boqItems',
  RFPS: 'rfps',
  OFFERS: 'offers',
  CONTRACTS: 'contracts',
  SALS: 'sals',
} as const;

// Error handling
class RepositoryError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'RepositoryError';
  }
}

// Utility functions
const timestampToNumber = (timestamp: Timestamp | number): number => {
  if (typeof timestamp === 'number') return timestamp;
  return timestamp.toMillis();
};

const numberToTimestamp = (timestamp: number): Timestamp => {
  return Timestamp.fromMillis(timestamp);
};

// TYPOLOGIES CRUD
export class TypologyRepository {
  static async create(input: CreateTypologyInput): Promise<Typology> {
    try {
      const now = Date.now();
      const typologyData = {
        ...input,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.TYPOLOGIES), typologyData);
      
      return {
        id: docRef.id,
        ...typologyData,
      };
    } catch (error: any) {
      throw new RepositoryError(`Failed to create typology: ${error.message}`, error.code);
    }
  }

  static async getById(id: string): Promise<Typology | null> {
    try {
      const docRef = doc(db, COLLECTIONS.TYPOLOGIES, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: timestampToNumber(data.createdAt),
        updatedAt: timestampToNumber(data.updatedAt),
      } as Typology;
    } catch (error: any) {
      throw new RepositoryError(`Failed to get typology: ${error.message}`, error.code);
    }
  }

  static async listByProject(filters: TypologyFilters): Promise<Typology[]> {
    try {
      let q = query(
        collection(db, COLLECTIONS.TYPOLOGIES),
        where('projectId', '==', filters.projectId),
        orderBy('createdAt', 'desc')
      );

      if (filters.finishLevel) {
        q = query(q, where('finishLevel', '==', filters.finishLevel));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: timestampToNumber(doc.data().createdAt),
        updatedAt: timestampToNumber(doc.data().updatedAt),
      })) as Typology[];
    } catch (error: any) {
      throw new RepositoryError(`Failed to list typologies: ${error.message}`, error.code);
    }
  }

  static async update(id: string, input: UpdateTypologyInput): Promise<Typology> {
    try {
      const docRef = doc(db, COLLECTIONS.TYPOLOGIES, id);
      const updateData = {
        ...input,
        updatedAt: Date.now(),
      };

      await updateDoc(docRef, updateData);
      
      const updated = await this.getById(id);
      if (!updated) {
        throw new RepositoryError('Typology not found after update');
      }
      
      return updated;
    } catch (error: any) {
      throw new RepositoryError(`Failed to update typology: ${error.message}`, error.code);
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.TYPOLOGIES, id);
      await deleteDoc(docRef);
    } catch (error: any) {
      throw new RepositoryError(`Failed to delete typology: ${error.message}`, error.code);
    }
  }
}

// BOQ ITEMS CRUD
export class BoqItemRepository {
  static async create(input: CreateBoqItemInput): Promise<BoqItem> {
    try {
      const now = Date.now();
      const itemData = {
        ...input,
        status: 'draft' as const,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.BOQ_ITEMS), itemData);
      
      return {
        id: docRef.id,
        ...itemData,
      };
    } catch (error: any) {
      throw new RepositoryError(`Failed to create BOQ item: ${error.message}`, error.code);
    }
  }

  static async getById(id: string): Promise<BoqItem | null> {
    try {
      const docRef = doc(db, COLLECTIONS.BOQ_ITEMS, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: timestampToNumber(data.createdAt),
        updatedAt: timestampToNumber(data.updatedAt),
      } as BoqItem;
    } catch (error: any) {
      throw new RepositoryError(`Failed to get BOQ item: ${error.message}`, error.code);
    }
  }

  static async listByProject(filters: BoqItemFilters): Promise<BoqItem[]> {
    try {
      let q = query(
        collection(db, COLLECTIONS.BOQ_ITEMS),
        where('projectId', '==', filters.projectId),
        orderBy('createdAt', 'desc')
      );

      if (filters.typologyId) {
        q = query(q, where('typologyId', '==', filters.typologyId));
      }
      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters.level) {
        q = query(q, where('level', '==', filters.level));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: timestampToNumber(doc.data().createdAt),
        updatedAt: timestampToNumber(doc.data().updatedAt),
      })) as BoqItem[];
    } catch (error: any) {
      throw new RepositoryError(`Failed to list BOQ items: ${error.message}`, error.code);
    }
  }

  static async update(id: string, input: UpdateBoqItemInput): Promise<BoqItem> {
    try {
      const docRef = doc(db, COLLECTIONS.BOQ_ITEMS, id);
      const updateData = {
        ...input,
        updatedAt: Date.now(),
      };

      await updateDoc(docRef, updateData);
      
      const updated = await this.getById(id);
      if (!updated) {
        throw new RepositoryError('BOQ item not found after update');
      }
      
      return updated;
    } catch (error: any) {
      throw new RepositoryError(`Failed to update BOQ item: ${error.message}`, error.code);
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.BOQ_ITEMS, id);
      await deleteDoc(docRef);
    } catch (error: any) {
      throw new RepositoryError(`Failed to delete BOQ item: ${error.message}`, error.code);
    }
  }
}

// RFPS CRUD
export class RfpRepository {
  static async create(input: CreateRfpInput): Promise<Rfp> {
    try {
      const now = Date.now();
      const rfpData = {
        ...input,
        status: 'draft' as const,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.RFPS), rfpData);
      
      return {
        id: docRef.id,
        ...rfpData,
      };
    } catch (error: any) {
      throw new RepositoryError(`Failed to create RFP: ${error.message}`, error.code);
    }
  }

  static async getById(id: string): Promise<Rfp | null> {
    try {
      const docRef = doc(db, COLLECTIONS.RFPS, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: timestampToNumber(data.createdAt),
        updatedAt: timestampToNumber(data.updatedAt),
      } as Rfp;
    } catch (error: any) {
      throw new RepositoryError(`Failed to get RFP: ${error.message}`, error.code);
    }
  }

  static async listByProject(filters: RfpFilters): Promise<Rfp[]> {
    try {
      let q = query(
        collection(db, COLLECTIONS.RFPS),
        where('projectId', '==', filters.projectId),
        orderBy('createdAt', 'desc')
      );

      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: timestampToNumber(doc.data().createdAt),
        updatedAt: timestampToNumber(doc.data().updatedAt),
      })) as Rfp[];
    } catch (error: any) {
      throw new RepositoryError(`Failed to list RFPs: ${error.message}`, error.code);
    }
  }

  static async update(id: string, input: UpdateRfpInput): Promise<Rfp> {
    try {
      const docRef = doc(db, COLLECTIONS.RFPS, id);
      const updateData = {
        ...input,
        updatedAt: Date.now(),
      };

      await updateDoc(docRef, updateData);
      
      const updated = await this.getById(id);
      if (!updated) {
        throw new RepositoryError('RFP not found after update');
      }
      
      return updated;
    } catch (error: any) {
      throw new RepositoryError(`Failed to update RFP: ${error.message}`, error.code);
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.RFPS, id);
      await deleteDoc(docRef);
    } catch (error: any) {
      throw new RepositoryError(`Failed to delete RFP: ${error.message}`, error.code);
    }
  }
}

// OFFERS CRUD
export class OfferRepository {
  static async create(input: CreateOfferInput): Promise<Offer> {
    try {
      const now = Date.now();
      const offerData = {
        ...input,
        status: 'received' as const,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.OFFERS), offerData);
      
      return {
        id: docRef.id,
        ...offerData,
      };
    } catch (error: any) {
      throw new RepositoryError(`Failed to create offer: ${error.message}`, error.code);
    }
  }

  static async getById(id: string): Promise<Offer | null> {
    try {
      const docRef = doc(db, COLLECTIONS.OFFERS, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: timestampToNumber(data.createdAt),
        updatedAt: timestampToNumber(data.updatedAt),
      } as Offer;
    } catch (error: any) {
      throw new RepositoryError(`Failed to get offer: ${error.message}`, error.code);
    }
  }

  static async listByProject(filters: OfferFilters): Promise<Offer[]> {
    try {
      let q = query(
        collection(db, COLLECTIONS.OFFERS),
        where('projectId', '==', filters.projectId),
        orderBy('createdAt', 'desc')
      );

      if (filters.rfpId) {
        q = query(q, where('rfpId', '==', filters.rfpId));
      }
      if (filters.vendorId) {
        q = query(q, where('vendorId', '==', filters.vendorId));
      }
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: timestampToNumber(doc.data().createdAt),
        updatedAt: timestampToNumber(doc.data().updatedAt),
      })) as Offer[];
    } catch (error: any) {
      throw new RepositoryError(`Failed to list offers: ${error.message}`, error.code);
    }
  }

  static async listByRfp(rfpId: string): Promise<Offer[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.OFFERS),
        where('rfpId', '==', rfpId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: timestampToNumber(doc.data().createdAt),
        updatedAt: timestampToNumber(doc.data().updatedAt),
      })) as Offer[];
    } catch (error: any) {
      throw new RepositoryError(`Failed to list offers by RFP: ${error.message}`, error.code);
    }
  }

  static async update(id: string, input: UpdateOfferInput): Promise<Offer> {
    try {
      const docRef = doc(db, COLLECTIONS.OFFERS, id);
      const updateData = {
        ...input,
        updatedAt: Date.now(),
      };

      await updateDoc(docRef, updateData);
      
      const updated = await this.getById(id);
      if (!updated) {
        throw new RepositoryError('Offer not found after update');
      }
      
      return updated;
    } catch (error: any) {
      throw new RepositoryError(`Failed to update offer: ${error.message}`, error.code);
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.OFFERS, id);
      await deleteDoc(docRef);
    } catch (error: any) {
      throw new RepositoryError(`Failed to delete offer: ${error.message}`, error.code);
    }
  }
}

// CONTRACTS CRUD
export class ContractRepository {
  static async create(input: CreateContractInput): Promise<ContractBundle> {
    try {
      const now = Date.now();
      const contractData = {
        ...input,
        status: 'draft' as const,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.CONTRACTS), contractData);
      
      return {
        id: docRef.id,
        ...contractData,
      };
    } catch (error: any) {
      throw new RepositoryError(`Failed to create contract: ${error.message}`, error.code);
    }
  }

  static async getById(id: string): Promise<ContractBundle | null> {
    try {
      const docRef = doc(db, COLLECTIONS.CONTRACTS, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: timestampToNumber(data.createdAt),
        updatedAt: timestampToNumber(data.updatedAt),
      } as ContractBundle;
    } catch (error: any) {
      throw new RepositoryError(`Failed to get contract: ${error.message}`, error.code);
    }
  }

  static async listByProject(filters: ContractFilters): Promise<ContractBundle[]> {
    try {
      let q = query(
        collection(db, COLLECTIONS.CONTRACTS),
        where('projectId', '==', filters.projectId),
        orderBy('createdAt', 'desc')
      );

      if (filters.vendorId) {
        q = query(q, where('vendorId', '==', filters.vendorId));
      }
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: timestampToNumber(doc.data().createdAt),
        updatedAt: timestampToNumber(doc.data().updatedAt),
      })) as ContractBundle[];
    } catch (error: any) {
      throw new RepositoryError(`Failed to list contracts: ${error.message}`, error.code);
    }
  }

  static async update(id: string, input: UpdateContractInput): Promise<ContractBundle> {
    try {
      const docRef = doc(db, COLLECTIONS.CONTRACTS, id);
      const updateData = {
        ...input,
        updatedAt: Date.now(),
      };

      await updateDoc(docRef, updateData);
      
      const updated = await this.getById(id);
      if (!updated) {
        throw new RepositoryError('Contract not found after update');
      }
      
      return updated;
    } catch (error: any) {
      throw new RepositoryError(`Failed to update contract: ${error.message}`, error.code);
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.CONTRACTS, id);
      await deleteDoc(docRef);
    } catch (error: any) {
      throw new RepositoryError(`Failed to delete contract: ${error.message}`, error.code);
    }
  }
}

// SALS CRUD
export class SalRepository {
  static async create(input: CreateSalInput): Promise<Sal> {
    try {
      const now = Date.now();
      const salData = {
        ...input,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.SALS), salData);
      
      return {
        id: docRef.id,
        ...salData,
      };
    } catch (error: any) {
      throw new RepositoryError(`Failed to create SAL: ${error.message}`, error.code);
    }
  }

  static async getById(id: string): Promise<Sal | null> {
    try {
      const docRef = doc(db, COLLECTIONS.SALS, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: timestampToNumber(data.createdAt),
        updatedAt: timestampToNumber(data.updatedAt),
      } as Sal;
    } catch (error: any) {
      throw new RepositoryError(`Failed to get SAL: ${error.message}`, error.code);
    }
  }

  static async listByProject(filters: SalFilters): Promise<Sal[]> {
    try {
      let q = query(
        collection(db, COLLECTIONS.SALS),
        where('projectId', '==', filters.projectId),
        orderBy('createdAt', 'desc')
      );

      if (filters.contractId) {
        q = query(q, where('contractId', '==', filters.contractId));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: timestampToNumber(doc.data().createdAt),
        updatedAt: timestampToNumber(doc.data().updatedAt),
      })) as Sal[];
    } catch (error: any) {
      throw new RepositoryError(`Failed to list SALs: ${error.message}`, error.code);
    }
  }

  static async listByContract(contractId: string): Promise<Sal[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.SALS),
        where('contractId', '==', contractId),
        orderBy('number', 'asc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: timestampToNumber(doc.data().createdAt),
        updatedAt: timestampToNumber(doc.data().updatedAt),
      })) as Sal[];
    } catch (error: any) {
      throw new RepositoryError(`Failed to list SALs by contract: ${error.message}`, error.code);
    }
  }

  static async update(id: string, input: UpdateSalInput): Promise<Sal> {
    try {
      const docRef = doc(db, COLLECTIONS.SALS, id);
      const updateData = {
        ...input,
        updatedAt: Date.now(),
      };

      await updateDoc(docRef, updateData);
      
      const updated = await this.getById(id);
      if (!updated) {
        throw new RepositoryError('SAL not found after update');
      }
      
      return updated;
    } catch (error: any) {
      throw new RepositoryError(`Failed to update SAL: ${error.message}`, error.code);
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.SALS, id);
      await deleteDoc(docRef);
    } catch (error: any) {
      throw new RepositoryError(`Failed to delete SAL: ${error.message}`, error.code);
    }
  }
}

// Main repository export
export const BudgetSuppliersRepository = {
  typologies: TypologyRepository,
  boqItems: BoqItemRepository,
  rfps: RfpRepository,
  offers: OfferRepository,
  contracts: ContractRepository,
  sals: SalRepository,
};

// Query helpers
export const QueryHelpers = {
  // Get all items for a project
  async listItemsByProject(projectId: string): Promise<BoqItem[]> {
    return BoqItemRepository.listByProject({ projectId });
  },

  // Get all offers for an RFP
  async listOffersByRfp(rfpId: string): Promise<Offer[]> {
    return OfferRepository.listByRfp(rfpId);
  },

  // Get all SALs for a contract
  async listSalsByContract(contractId: string): Promise<Sal[]> {
    return SalRepository.listByContract(contractId);
  },

  // Get project summary
  async getProjectSummary(projectId: string) {
    try {
      const [typologies, items, rfps, offers, contracts, sals] = await Promise.all([
        TypologyRepository.listByProject({ projectId }),
        BoqItemRepository.listByProject({ projectId }),
        RfpRepository.listByProject({ projectId }),
        OfferRepository.listByProject({ projectId }),
        ContractRepository.listByProject({ projectId }),
        SalRepository.listByProject({ projectId }),
      ]);

      return {
        projectId,
        typologies: typologies.length,
        items: items.length,
        rfps: rfps.length,
        offers: offers.length,
        contracts: contracts.length,
        sals: sals.length,
        totalBudget: items.reduce((sum, item) => sum + (item.budget || 0), 0),
        totalContracted: contracts.reduce((sum, contract) => sum + contract.amount, 0),
        totalPaid: sals.reduce((sum, sal) => sum + sal.amount, 0),
      };
    } catch (error: any) {
      throw new RepositoryError(`Failed to get project summary: ${error.message}`, error.code);
    }
  },
};
