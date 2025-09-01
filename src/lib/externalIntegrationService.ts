import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  getDoc,
  getDocs,
  limit,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';

// ===== INTERFACES =====
export interface ExternalTool {
  id: string;
  name: string;
  type: 'cad' | 'bim' | '3d' | 'rendering' | 'analysis';
  version: string;
  vendor: string;
  description: string;
  supportedFormats: string[];
  apiEndpoint?: string;
  apiKey?: string;
  isActive: boolean;
  lastSync: Timestamp;
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
  errorMessage?: string;
}

export interface DesignFile {
  id: string;
  designId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  sourceTool: string;
  sourceToolVersion: string;
  importDate: Timestamp;
  lastModified: Timestamp;
  fileUrl: string;
  thumbnailUrl?: string;
  metadata: {
    dimensions?: {
      width: number;
      height: number;
      depth?: number;
    };
    layers?: number;
    components?: number;
    materials?: number;
    textures?: number;
    animations?: number;
    customProperties?: Record<string, any>;
  };
  tags: string[];
  status: 'imported' | 'processing' | 'processed' | 'error';
  processingErrors?: string[];
}

export interface FileConversion {
  id: string;
  sourceFileId: string;
  targetFormat: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  startedAt: Timestamp;
  completedAt?: Timestamp;
  outputFileUrl?: string;
  errorMessage?: string;
  conversionSettings: {
    quality: 'low' | 'medium' | 'high' | 'ultra';
    resolution?: number;
    compression?: number;
    includeMetadata: boolean;
    includeTextures: boolean;
  };
}

export interface ToolSync {
  id: string;
  toolId: string;
  designId: string;
  syncType: 'import' | 'export' | 'bidirectional';
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  lastSync: Timestamp;
  nextSync?: Timestamp;
  syncInterval: number; // in minutes
  filesProcessed: number;
  filesFailed: number;
  errorLog: string[];
  syncSettings: {
    autoSync: boolean;
    syncOnChange: boolean;
    preserveHistory: boolean;
    conflictResolution: 'source' | 'target' | 'manual';
  };
}

export interface BIMData {
  id: string;
  designId: string;
  bimLevel: 'LOD100' | 'LOD200' | 'LOD300' | 'LOD400' | 'LOD500';
  elements: BIMElement[];
  systems: BIMSystem[];
  materials: BIMMaterial[];
  properties: BIMProperty[];
  lastUpdated: Timestamp;
  version: string;
}

export interface BIMElement {
  id: string;
  name: string;
  type: string;
  category: string;
  geometry: {
    vertices: number[][];
    faces: number[][];
    boundingBox: {
      min: number[];
      max: number[];
    };
  };
  properties: Record<string, any>;
  materials: string[];
  systems: string[];
}

export interface BIMSystem {
  id: string;
  name: string;
  type: 'structural' | 'mep' | 'architectural' | 'landscape';
  elements: string[];
  properties: Record<string, any>;
}

export interface BIMMaterial {
  id: string;
  name: string;
  type: string;
  properties: {
    density?: number;
    thermalConductivity?: number;
    strength?: number;
    color?: string;
    texture?: string;
  };
}

export interface BIMProperty {
  id: string;
  name: string;
  value: any;
  unit?: string;
  category: string;
  isRequired: boolean;
}

// ===== EXTERNAL INTEGRATION SERVICE =====
export class ExternalIntegrationService {
  private static instance: ExternalIntegrationService;

  static getInstance(): ExternalIntegrationService {
    if (!ExternalIntegrationService.instance) {
      ExternalIntegrationService.instance = new ExternalIntegrationService();
    }
    return ExternalIntegrationService.instance;
  }

  // ===== EXTERNAL TOOLS MANAGEMENT =====
  async registerTool(tool: Omit<ExternalTool, 'id' | 'lastSync' | 'syncStatus'>): Promise<string> {
    try {
      const toolData = {
        ...tool,
        lastSync: serverTimestamp(),
        syncStatus: 'idle',
      };

      const docRef = await addDoc(collection(db, 'externalTools'), toolData);
      return docRef.id;
    } catch (error) {
      console.error('Error registering tool:', error);
      throw new Error('Failed to register external tool');
    }
  }

  async updateTool(toolId: string, updates: Partial<ExternalTool>): Promise<void> {
    try {
      const toolRef = doc(db, 'externalTools', toolId);
      await updateDoc(toolRef, updates);
    } catch (error) {
      console.error('Error updating tool:', error);
      throw new Error('Failed to update external tool');
    }
  }

  async deleteTool(toolId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'externalTools', toolId));
    } catch (error) {
      console.error('Error deleting tool:', error);
      throw new Error('Failed to delete external tool');
    }
  }

  async getTools(): Promise<ExternalTool[]> {
    try {
      const snapshot = await getDocs(collection(db, 'externalTools'));
      const tools: ExternalTool[] = [];
      snapshot.forEach(doc => {
        tools.push({ id: doc.id, ...doc.data() } as ExternalTool);
      });
      return tools;
    } catch (error) {
      console.error('Error getting tools:', error);
      return [];
    }
  }

  getToolsRealtime(callback: (tools: ExternalTool[]) => void): () => void {
    const q = query(collection(db, 'externalTools'), orderBy('name'));

    const unsubscribe = onSnapshot(q, snapshot => {
      const tools: ExternalTool[] = [];
      snapshot.forEach(doc => {
        tools.push({ id: doc.id, ...doc.data() } as ExternalTool);
      });
      callback(tools);
    });

    return unsubscribe;
  }

  // ===== DESIGN FILES MANAGEMENT =====
  async importFile(
    file: Omit<DesignFile, 'id' | 'importDate' | 'lastModified' | 'status'>
  ): Promise<string> {
    try {
      const fileData = {
        ...file,
        importDate: serverTimestamp(),
        lastModified: serverTimestamp(),
        status: 'imported',
      };

      const docRef = await addDoc(collection(db, 'designFiles'), fileData);
      return docRef.id;
    } catch (error) {
      console.error('Error importing file:', error);
      throw new Error('Failed to import design file');
    }
  }

  async updateFile(fileId: string, updates: Partial<DesignFile>): Promise<void> {
    try {
      const fileRef = doc(db, 'designFiles', fileId);
      await updateDoc(fileRef, {
        ...updates,
        lastModified: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating file:', error);
      throw new Error('Failed to update design file');
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'designFiles', fileId));
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete design file');
    }
  }

  async getDesignFiles(designId: string): Promise<DesignFile[]> {
    try {
      const q = query(
        collection(db, 'designFiles'),
        where('designId', '==', designId),
        orderBy('importDate', 'desc')
      );

      const snapshot = await getDocs(q);
      const files: DesignFile[] = [];
      snapshot.forEach(doc => {
        files.push({ id: doc.id, ...doc.data() } as DesignFile);
      });
      return files;
    } catch (error) {
      console.error('Error getting design files:', error);
      return [];
    }
  }

  getDesignFilesRealtime(designId: string, callback: (files: DesignFile[]) => void): () => void {
    const q = query(
      collection(db, 'designFiles'),
      where('designId', '==', designId),
      orderBy('importDate', 'desc')
    );

    const unsubscribe = onSnapshot(q, snapshot => {
      const files: DesignFile[] = [];
      snapshot.forEach(doc => {
        files.push({ id: doc.id, ...doc.data() } as DesignFile);
      });
      callback(files);
    });

    return unsubscribe;
  }

  // ===== FILE CONVERSION =====
  async startConversion(
    conversion: Omit<FileConversion, 'id' | 'startedAt' | 'status' | 'progress'>
  ): Promise<string> {
    try {
      const conversionData = {
        ...conversion,
        startedAt: serverTimestamp(),
        status: 'pending',
        progress: 0,
      };

      const docRef = await addDoc(collection(db, 'fileConversions'), conversionData);
      return docRef.id;
    } catch (error) {
      console.error('Error starting conversion:', error);
      throw new Error('Failed to start file conversion');
    }
  }

  async updateConversionProgress(
    conversionId: string,
    progress: number,
    status?: FileConversion['status']
  ): Promise<void> {
    try {
      const conversionRef = doc(db, 'fileConversions', conversionId);
      const updates: Partial<FileConversion> = { progress };

      if (status) {
        updates.status = status;
        if (status === 'completed' || status === 'failed') {
          updates.completedAt = serverTimestamp();
        }
      }

      await updateDoc(conversionRef, updates);
    } catch (error) {
      console.error('Error updating conversion progress:', error);
      throw new Error('Failed to update conversion progress');
    }
  }

  async getConversions(fileId: string): Promise<FileConversion[]> {
    try {
      const q = query(
        collection(db, 'fileConversions'),
        where('sourceFileId', '==', fileId),
        orderBy('startedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const conversions: FileConversion[] = [];
      snapshot.forEach(doc => {
        conversions.push({ id: doc.id, ...doc.data() } as FileConversion);
      });
      return conversions;
    } catch (error) {
      console.error('Error getting conversions:', error);
      return [];
    }
  }

  // ===== TOOL SYNCHRONIZATION =====
  async createSync(
    sync: Omit<
      ToolSync,
      'id' | 'lastSync' | 'status' | 'filesProcessed' | 'filesFailed' | 'errorLog'
    >
  ): Promise<string> {
    try {
      const syncData = {
        ...sync,
        lastSync: serverTimestamp(),
        status: 'pending',
        filesProcessed: 0,
        filesFailed: 0,
        errorLog: [],
      };

      const docRef = await addDoc(collection(db, 'toolSyncs'), syncData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating sync:', error);
      throw new Error('Failed to create tool sync');
    }
  }

  async updateSync(syncId: string, updates: Partial<ToolSync>): Promise<void> {
    try {
      const syncRef = doc(db, 'toolSyncs', syncId);
      await updateDoc(syncRef, updates);
    } catch (error) {
      console.error('Error updating sync:', error);
      throw new Error('Failed to update tool sync');
    }
  }

  async getActiveSyncs(designId: string): Promise<ToolSync[]> {
    try {
      const q = query(
        collection(db, 'toolSyncs'),
        where('designId', '==', designId),
        where('status', 'in', ['pending', 'syncing'])
      );

      const snapshot = await getDocs(q);
      const syncs: ToolSync[] = [];
      snapshot.forEach(doc => {
        syncs.push({ id: doc.id, ...doc.data() } as ToolSync);
      });
      return syncs;
    } catch (error) {
      console.error('Error getting active syncs:', error);
      return [];
    }
  }

  // ===== BIM DATA MANAGEMENT =====
  async createBIMData(bimData: Omit<BIMData, 'id' | 'lastUpdated'>): Promise<string> {
    try {
      const bimDataDoc = {
        ...bimData,
        lastUpdated: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'bimData'), bimDataDoc);
      return docRef.id;
    } catch (error) {
      console.error('Error creating BIM data:', error);
      throw new Error('Failed to create BIM data');
    }
  }

  async updateBIMData(bimDataId: string, updates: Partial<BIMData>): Promise<void> {
    try {
      const bimDataRef = doc(db, 'bimData', bimDataId);
      await updateDoc(bimDataRef, {
        ...updates,
        lastUpdated: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating BIM data:', error);
      throw new Error('Failed to update BIM data');
    }
  }

  async getBIMData(designId: string): Promise<BIMData | null> {
    try {
      const q = query(
        collection(db, 'bIMData'),
        where('designId', '==', designId),
        orderBy('lastUpdated', 'desc'),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as BIMData;
    } catch (error) {
      console.error('Error getting BIM data:', error);
      return null;
    }
  }

  // ===== UTILITY METHODS =====
  async getSupportedFormats(): Promise<string[]> {
    try {
      const tools = await this.getTools();
      const formats = new Set<string>();

      tools.forEach(tool => {
        tool.supportedFormats.forEach(format => formats.add(format));
      });

      return Array.from(formats).sort();
    } catch (error) {
      console.error('Error getting supported formats:', error);
      return [];
    }
  }

  async getToolByName(name: string): Promise<ExternalTool | null> {
    try {
      const q = query(collection(db, 'externalTools'), where('name', '==', name), limit(1));

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as ExternalTool;
    } catch (error) {
      console.error('Error getting tool by name:', error);
      return null;
    }
  }

  async validateFileFormat(fileType: string, toolName: string): Promise<boolean> {
    try {
      const tool = await this.getToolByName(toolName);
      if (!tool) {
        return false;
      }

      return tool.supportedFormats.includes(fileType.toLowerCase());
    } catch (error) {
      console.error('Error validating file format:', error);
      return false;
    }
  }

  async getDesignFileStats(designId: string): Promise<{
    totalFiles: number;
    totalSize: number;
    filesByType: Record<string, number>;
    filesByStatus: Record<string, number>;
    lastImport: Timestamp | null;
  }> {
    try {
      const files = await this.getDesignFiles(designId);

      const totalSize = files.reduce((sum, file) => sum + file.fileSize, 0);
      const filesByType: Record<string, number> = {};
      const filesByStatus: Record<string, number> = {};
      let lastImport: Timestamp | null = null;

      files.forEach(file => {
        // Count by type
        filesByType[file.fileType] = (filesByType[file.fileType] || 0) + 1;

        // Count by status
        filesByStatus[file.status] = (filesByStatus[file.status] || 0) + 1;

        // Track last import
        if (!lastImport || file.importDate.toMillis() > lastImport.toMillis()) {
          lastImport = file.importDate;
        }
      });

      return {
        totalFiles: files.length,
        totalSize,
        filesByType,
        filesByStatus,
        lastImport,
      };
    } catch (error) {
      console.error('Error getting design file stats:', error);
      return {
        totalFiles: 0,
        totalSize: 0,
        filesByType: {},
        filesByStatus: {},
        lastImport: null,
      };
    }
  }
}

export default ExternalIntegrationService.getInstance();
