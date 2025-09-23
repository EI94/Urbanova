#!/usr/bin/env tsx

/**
 * Script di Migrazione Firestore - Urbanova
 * 
 * Comandi disponibili:
 * - migrate:dry-run  - Stampa cosa farà senza applicare modifiche
 * - migrate:apply    - Crea strutture iniziali e scrive flag versione schema
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

// Schema per la configurazione
const MigrationConfig = z.object({
  projectId: z.string(),
  serviceAccountKey: z.string().optional(),
  dryRun: z.boolean().default(false),
  collections: z.array(z.object({
    name: z.string(),
    fields: z.array(z.object({
      name: z.string(),
      type: z.string(),
      required: z.boolean().default(false),
      defaultValue: z.any().optional()
    }))
  }))
});

type MigrationConfig = z.infer<typeof MigrationConfig>;

// Configurazione delle collezioni da creare
const COLLECTIONS_CONFIG = [
  {
    name: 'users',
    fields: [
      { name: 'email', type: 'string', required: true },
      { name: 'displayName', type: 'string', required: false },
      { name: 'role', type: 'string', required: true, defaultValue: 'user' },
      { name: 'organizationId', type: 'string', required: false },
      { name: 'createdAt', type: 'timestamp', required: true },
      { name: 'updatedAt', type: 'timestamp', required: true },
      { name: 'lastLoginAt', type: 'timestamp', required: false },
      { name: 'status', type: 'string', required: true, defaultValue: 'active' }
    ]
  },
  {
    name: 'organizations',
    fields: [
      { name: 'name', type: 'string', required: true },
      { name: 'slug', type: 'string', required: true },
      { name: 'status', type: 'string', required: true, defaultValue: 'active' },
      { name: 'createdAt', type: 'timestamp', required: true },
      { name: 'updatedAt', type: 'timestamp', required: true },
      { name: 'settings', type: 'map', required: false }
    ]
  },
  {
    name: 'projects',
    fields: [
      { name: 'name', type: 'string', required: true },
      { name: 'description', type: 'string', required: false },
      { name: 'ownerId', type: 'string', required: true },
      { name: 'organizationId', type: 'string', required: true },
      { name: 'status', type: 'string', required: true, defaultValue: 'draft' },
      { name: 'createdAt', type: 'timestamp', required: true },
      { name: 'updatedAt', type: 'timestamp', required: true },
      { name: 'metadata', type: 'map', required: false }
    ]
  },
  {
    name: 'toolRuns',
    fields: [
      { name: 'projectId', type: 'string', required: true },
      { name: 'userId', type: 'string', required: true },
      { name: 'toolName', type: 'string', required: true },
      { name: 'status', type: 'string', required: true, defaultValue: 'pending' },
      { name: 'input', type: 'map', required: false },
      { name: 'output', type: 'map', required: false },
      { name: 'error', type: 'string', required: false },
      { name: 'startedAt', type: 'timestamp', required: false },
      { name: 'completedAt', type: 'timestamp', required: false },
      { name: 'createdAt', type: 'timestamp', required: true },
      { name: 'updatedAt', type: 'timestamp', required: true }
    ]
  },
  {
    name: 'auditEvents',
    fields: [
      { name: 'userId', type: 'string', required: false },
      { name: 'projectId', type: 'string', required: false },
      { name: 'level', type: 'string', required: true },
      { name: 'event', type: 'string', required: true },
      { name: 'message', type: 'string', required: false },
      { name: 'metadata', type: 'map', required: false },
      { name: 'traceId', type: 'string', required: false },
      { name: 'route', type: 'string', required: false },
      { name: 'payloadHash', type: 'string', required: false },
      { name: 'timestamp', type: 'timestamp', required: true }
    ]
  },
  {
    name: 'leads',
    fields: [
      { name: 'email', type: 'string', required: false },
      { name: 'phone', type: 'string', required: false },
      { name: 'name', type: 'string', required: true },
      { name: 'source', type: 'string', required: true },
      { name: 'status', type: 'string', required: true, defaultValue: 'new' },
      { name: 'organizationId', type: 'string', required: true },
      { name: 'createdBy', type: 'string', required: true },
      { name: 'metadata', type: 'map', required: false },
      { name: 'createdAt', type: 'timestamp', required: true },
      { name: 'updatedAt', type: 'timestamp', required: true }
    ]
  },
  {
    name: 'conversations',
    fields: [
      { name: 'leadId', type: 'string', required: true },
      { name: 'organizationId', type: 'string', required: true },
      { name: 'status', type: 'string', required: true, defaultValue: 'active' },
      { name: 'channel', type: 'string', required: true },
      { name: 'createdBy', type: 'string', required: true },
      { name: 'metadata', type: 'map', required: false },
      { name: 'createdAt', type: 'timestamp', required: true },
      { name: 'updatedAt', type: 'timestamp', required: true }
    ]
  },
  {
    name: 'messages',
    fields: [
      { name: 'conversationId', type: 'string', required: true },
      { name: 'organizationId', type: 'string', required: true },
      { name: 'senderId', type: 'string', required: true },
      { name: 'senderType', type: 'string', required: true },
      { name: 'content', type: 'string', required: true },
      { name: 'contentType', type: 'string', required: true, defaultValue: 'text' },
      { name: 'metadata', type: 'map', required: false },
      { name: 'createdAt', type: 'timestamp', required: true }
    ]
  },
  {
    name: 'deals',
    fields: [
      { name: 'name', type: 'string', required: true },
      { name: 'description', type: 'string', required: false },
      { name: 'city', type: 'string', required: false },
      { name: 'status', type: 'string', required: true, defaultValue: 'prospecting' },
      { name: 'value', type: 'number', required: false },
      { name: 'organizationId', type: 'string', required: true },
      { name: 'createdBy', type: 'string', required: true },
      { name: 'metadata', type: 'map', required: false },
      { name: 'createdAt', type: 'timestamp', required: true },
      { name: 'updatedAt', type: 'timestamp', required: true }
    ]
  },
  {
    name: 'feasibilityAnalysis',
    fields: [
      { name: 'projectId', type: 'string', required: true },
      { name: 'status', type: 'string', required: true, defaultValue: 'pending' },
      { name: 'input', type: 'map', required: false },
      { name: 'output', type: 'map', required: false },
      { name: 'reportUrl', type: 'string', required: false },
      { name: 'createdBy', type: 'string', required: true },
      { name: 'createdAt', type: 'timestamp', required: true },
      { name: 'updatedAt', type: 'timestamp', required: true }
    ]
  }
];

class FirestoreMigrator {
  private db: FirebaseFirestore.Firestore;
  private auth: any; // FirebaseAuth.Auth;
  private storage: any; // FirebaseStorage.Storage;
  private dryRun: boolean;

  constructor(projectId: string, serviceAccountKey?: string, dryRun: boolean = false) {
    this.dryRun = dryRun;
    
    try {
      if (serviceAccountKey) {
        const serviceAccount = JSON.parse(serviceAccountKey);
        initializeApp({
          credential: cert(serviceAccount),
          projectId,
          storageBucket: `${projectId}.appspot.com`
        });
      } else {
        // Usa le credenziali di default (emulatore o service account)
        initializeApp({
          projectId,
          storageBucket: `${projectId}.appspot.com`
        });
      }

      this.db = getFirestore();
      this.auth = getAuth();
      this.storage = getStorage();
    } catch (error) {
      // Se Firebase è già inizializzato, usa l'istanza esistente
      if (error instanceof Error && error.message.includes('already been initialized')) {
        this.db = getFirestore();
        this.auth = getAuth();
        this.storage = getStorage();
      } else {
        throw error;
      }
    }
  }

  private safeCollection(collectionName: string) {
    if (!this.db) {
      throw new Error('Firebase non inizializzato');
    }
    return this.db.collection(collectionName);
  }

  async migrate(): Promise<void> {
    console.log(`🚀 Avvio migrazione Firestore${this.dryRun ? ' (DRY RUN)' : ''}`);
    console.log(`📁 Progetto: ${process.env.FIREBASE_PROJECT_ID || 'urbanova-dev'}`);
    console.log(`🔒 Modalità: ${this.dryRun ? 'Simulazione' : 'Applicazione'}`);
    console.log('');

    try {
      // 1. Verifica connessione
      await this.checkConnection();
      
      // 2. Crea collezioni e documenti di esempio
      await this.createCollections();
      
      // 3. Crea indici se necessario
      await this.createIndexes();
      
      // 4. Aggiorna versione schema
      await this.updateSchemaVersion();
      
      console.log('');
      console.log(`✅ Migrazione completata con successo${this.dryRun ? ' (DRY RUN)' : ''}`);
      
    } catch (error) {
      console.error('❌ Errore durante la migrazione:', error);
      process.exit(1);
    }
  }

  private async checkConnection(): Promise<void> {
    console.log('🔍 Verifica connessione Firestore...');
    
    if (this.dryRun) {
      console.log('  📋 DRY RUN: Simula verifica connessione');
      return;
    }

    try {
      // Prova a leggere un documento per verificare la connessione
      const testDoc = await this.safeCollection('_migration_test').doc('connection').get();
      console.log('  ✅ Connessione Firestore verificata');
    } catch (error) {
      console.error('  ❌ Errore connessione Firestore:', error);
      throw error;
    }
  }

  private async createCollections(): Promise<void> {
    console.log('📚 Creazione collezioni e documenti di esempio...');
    
    for (const collectionConfig of COLLECTIONS_CONFIG) {
      console.log(`  📁 Collezione: ${collectionConfig.name}`);
      
      if (this.dryRun) {
        console.log(`    📋 DRY RUN: Simula creazione collezione ${collectionConfig.name}`);
        console.log(`    📋 DRY RUN: Campi: ${collectionConfig.fields.map(f => f.name).join(', ')}`);
        continue;
      }

      try {
        // Crea un documento di esempio per la collezione
        const exampleDoc = this.createExampleDocument(collectionConfig);
        const docRef = this.safeCollection(collectionConfig.name).doc('_example');
        
        await docRef.set(exampleDoc);
        console.log(`    ✅ Collezione ${collectionConfig.name} creata con documento di esempio`);
        
        // Rimuovi il documento di esempio
        await docRef.delete();
        console.log(`    🧹 Documento di esempio rimosso`);
        
      } catch (error) {
        console.error(`    ❌ Errore creazione collezione ${collectionConfig.name}:`, error);
        throw error;
      }
    }
  }

  private createExampleDocument(collectionConfig: any): any {
    const now = new Date();
    const doc: any = {};

    for (const field of collectionConfig.fields) {
      switch (field.type) {
        case 'string':
          doc[field.name] = field.defaultValue || `example_${field.name}`;
          break;
        case 'number':
          doc[field.name] = field.defaultValue || 0;
          break;
        case 'boolean':
          doc[field.name] = field.defaultValue || false;
          break;
        case 'timestamp':
          doc[field.name] = field.defaultValue || now;
          break;
        case 'map':
          doc[field.name] = field.defaultValue || { example: true };
          break;
        default:
          doc[field.name] = field.defaultValue || null;
      }
    }

    return doc;
  }

  private async createIndexes(): Promise<void> {
    console.log('🔍 Creazione indici...');
    
    if (this.dryRun) {
      console.log('  📋 DRY RUN: Simula creazione indici');
      console.log('  📋 DRY RUN: Gli indici sono definiti in firestore.indexes.json');
      return;
    }

    try {
      // Gli indici sono definiti in firestore.indexes.json
      // Firebase li creerà automaticamente quando necessario
      console.log('  ✅ Indici configurati in firestore.indexes.json');
      console.log('  ℹ️  Firebase creerà automaticamente gli indici quando necessario');
    } catch (error) {
      console.error('  ❌ Errore creazione indici:', error);
      throw error;
    }
  }

  private async updateSchemaVersion(): Promise<void> {
    console.log('📝 Aggiornamento versione schema...');
    
    if (this.dryRun) {
      console.log('  📋 DRY RUN: Simula aggiornamento versione schema');
      console.log('  📋 DRY RUN: Versione: 1.0.0');
      return;
    }

    try {
      const schemaVersion = {
        version: '1.0.0',
        migratedAt: new Date(),
        collections: COLLECTIONS_CONFIG.map(c => c.name),
        dryRun: false
      };

      await this.safeCollection('_schema').doc('version').set(schemaVersion);
      console.log('  ✅ Versione schema aggiornata: 1.0.0');
      
    } catch (error) {
      console.error('  ❌ Errore aggiornamento versione schema:', error);
      throw error;
    }
  }

  async validateRules(): Promise<void> {
    console.log('🔒 Validazione regole di sicurezza...');
    
    try {
      const rulesPath = path.join(process.cwd(), 'firestore.rules');
      if (!fs.existsSync(rulesPath)) {
        throw new Error('File firestore.rules non trovato');
      }

      const rules = fs.readFileSync(rulesPath, 'utf8');
      
      // Validazione base delle regole
      if (!rules.includes('rules_version = \'2\'')) {
        throw new Error('Regole devono usare rules_version = \'2\'');
      }

      if (!rules.includes('service cloud.firestore')) {
        throw new Error('Regole devono includere service cloud.firestore');
      }

      console.log('  ✅ Regole di sicurezza validate');
      
    } catch (error) {
      console.error('  ❌ Errore validazione regole:', error);
      throw error;
    }
  }

  async validateIndexes(): Promise<void> {
    console.log('🔍 Validazione indici...');
    
    try {
      const indexesPath = path.join(process.cwd(), 'firestore.indexes.json');
      if (!fs.existsSync(indexesPath)) {
        throw new Error('File firestore.indexes.json non trovato');
      }

      const indexes = JSON.parse(fs.readFileSync(indexesPath, 'utf8'));
      
      if (!indexes.indexes || !Array.isArray(indexes.indexes)) {
        throw new Error('Indici devono essere un array');
      }

      console.log(`  ✅ ${indexes.indexes.length} indici configurati`);
      
    } catch (error) {
      console.error('  ❌ Errore validazione indici:', error);
      throw error;
    }
  }
}

// Funzione principale
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log('❌ Comando richiesto');
    console.log('');
    console.log('Comandi disponibili:');
    console.log('  migrate:dry-run  - Simula la migrazione senza applicare modifiche');
    console.log('  migrate:apply    - Applica la migrazione');
    console.log('  migrate:validate - Valida regole e indici');
    console.log('');
    console.log('Esempio:');
    console.log('  npm run migrate:dry-run');
    console.log('  npm run migrate:apply');
    process.exit(1);
  }

  // Configurazione
  const projectId = process.env.FIREBASE_PROJECT_ID || 'urbanova-dev';
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const dryRun = command === 'migrate:dry-run';

  try {
    const migrator = new FirestoreMigrator(projectId, serviceAccountKey, dryRun);

    switch (command) {
      case 'migrate:dry-run':
      case 'migrate:apply':
        await migrator.migrate();
        break;
        
      case 'migrate:validate':
        await migrator.validateRules();
        await migrator.validateIndexes();
        console.log('✅ Validazione completata con successo');
        break;
        
      default:
        console.log(`❌ Comando sconosciuto: ${command}`);
        process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Errore:', error);
    process.exit(1);
  }
}

// Esegui se chiamato direttamente
if (require.main === module) {
  main();
}

export { FirestoreMigrator };
