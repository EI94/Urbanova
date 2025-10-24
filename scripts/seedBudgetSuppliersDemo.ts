#!/usr/bin/env tsx

/**
 * 🌱 BUDGET SUPPLIERS DEMO SEED
 * 
 * Script per popolare dati demo per presentazione Budget & Suppliers
 * Progetto "Ciliegie" con tipologie, items, RFP, offerte e contratti
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Configurazione Firebase (usa le stesse variabili d'ambiente)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Dati demo per il progetto "Ciliegie"
const DEMO_PROJECT = {
  id: 'demo-ciliegie',
  name: 'Ciliegie',
  description: 'Residenziale di lusso con ville unifamiliari',
  location: 'Roma, Via delle Ciliegie 123',
  type: 'RESIDENTIAL',
  status: 'ACTIVE',
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date()
};

// Tipologie demo
const DEMO_TYPOLOGIES = [
  {
    id: 'typology-villetta-a',
    projectId: DEMO_PROJECT.id,
    name: 'Villetta A',
    description: 'Villetta unifamiliare di lusso',
    units: 10,
    averageSize: 100, // mq
    totalArea: 1000, // mq
    characteristics: {
      floors: 2,
      bedrooms: 3,
      bathrooms: 2,
      garage: true,
      garden: true
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: 'typology-villetta-b',
    projectId: DEMO_PROJECT.id,
    name: 'Villetta B',
    description: 'Villetta unifamiliare premium',
    units: 20,
    averageSize: 85, // mq
    totalArea: 1700, // mq
    characteristics: {
      floors: 2,
      bedrooms: 2,
      bathrooms: 2,
      garage: true,
      garden: true
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  }
];

// Items demo (30 items mix categorie)
const DEMO_ITEMS = [
  // STRUTTURE
  {
    id: 'item-scavi-fondazioni',
    projectId: DEMO_PROJECT.id,
    typologyId: 'typology-villetta-a',
    code: 'STR-001',
    description: 'Scavi per fondazioni continue',
    category: 'STRUTTURE',
    uom: 'mc',
    qty: 150,
    budgetPrice: 45,
    budgetTotal: 6750,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: 'item-fondazioni-armate',
    projectId: DEMO_PROJECT.id,
    typologyId: 'typology-villetta-a',
    code: 'STR-002',
    description: 'Fondazioni in c.a. armato',
    category: 'STRUTTURE',
    uom: 'mc',
    qty: 120,
    budgetPrice: 380,
    budgetTotal: 45600,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: 'item-pilastri-struttura',
    projectId: DEMO_PROJECT.id,
    typologyId: 'typology-villetta-a',
    code: 'STR-003',
    description: 'Pilastri in c.a. armato',
    category: 'STRUTTURE',
    uom: 'mc',
    qty: 80,
    budgetPrice: 420,
    budgetTotal: 33600,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: 'item-travi-struttura',
    projectId: DEMO_PROJECT.id,
    typologyId: 'typology-villetta-a',
    code: 'STR-004',
    description: 'Travi in c.a. armato',
    category: 'STRUTTURE',
    uom: 'mc',
    qty: 60,
    budgetPrice: 450,
    budgetTotal: 27000,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: 'item-solaio-interpiano',
    projectId: DEMO_PROJECT.id,
    typologyId: 'typology-villetta-a',
    code: 'STR-005',
    description: 'Solaio interpiano in c.a.',
    category: 'STRUTTURE',
    uom: 'mq',
    qty: 1000,
    budgetPrice: 85,
    budgetTotal: 85000,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },

  // IMPIANTI
  {
    id: 'item-impianto-elettrico',
    projectId: DEMO_PROJECT.id,
    typologyId: 'typology-villetta-a',
    code: 'IMP-001',
    description: 'Impianto elettrico civile',
    category: 'IMPIANTI',
    uom: 'mq',
    qty: 1000,
    budgetPrice: 45,
    budgetTotal: 45000,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: 'item-impianto-idrico',
    projectId: DEMO_PROJECT.id,
    typologyId: 'typology-villetta-a',
    code: 'IMP-002',
    description: 'Impianto idrico-sanitario',
    category: 'IMPIANTI',
    uom: 'mq',
    qty: 1000,
    budgetPrice: 35,
    budgetTotal: 35000,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: 'item-impianto-riscaldamento',
    projectId: DEMO_PROJECT.id,
    typologyId: 'typology-villetta-a',
    code: 'IMP-003',
    description: 'Impianto di riscaldamento',
    category: 'IMPIANTI',
    uom: 'mq',
    qty: 1000,
    budgetPrice: 55,
    budgetTotal: 55000,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: 'item-impianto-climatizzazione',
    projectId: DEMO_PROJECT.id,
    typologyId: 'typology-villetta-a',
    code: 'IMP-004',
    description: 'Impianto di climatizzazione',
    category: 'IMPIANTI',
    uom: 'mq',
    qty: 1000,
    budgetPrice: 40,
    budgetTotal: 40000,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: 'item-impianto-gas',
    projectId: DEMO_PROJECT.id,
    typologyId: 'typology-villetta-a',
    code: 'IMP-005',
    description: 'Impianto gas metano',
    category: 'IMPIANTI',
    uom: 'mq',
    qty: 1000,
    budgetPrice: 25,
    budgetTotal: 25000,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },

  // FINITURE
  {
    id: 'item-pavimenti-gres',
    projectId: DEMO_PROJECT.id,
    typologyId: 'typology-villetta-a',
    code: 'FIN-001',
    description: 'Pavimenti in gres porcellanato',
    category: 'FINITURE',
    uom: 'mq',
    qty: 800,
    budgetPrice: 65,
    budgetTotal: 52000,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: 'item-pavimenti-parquet',
    projectId: DEMO_PROJECT.id,
    typologyId: 'typology-villetta-a',
    code: 'FIN-002',
    description: 'Pavimenti in parquet',
    category: 'FINITURE',
    uom: 'mq',
    qty: 200,
    budgetPrice: 120,
    budgetTotal: 24000,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: 'item-rivestimenti-bagno',
    projectId: DEMO_PROJECT.id,
    typologyId: 'typology-villetta-a',
    code: 'FIN-003',
    description: 'Rivestimenti bagni',
    category: 'FINITURE',
    uom: 'mq',
    qty: 150,
    budgetPrice: 85,
    budgetTotal: 12750,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: 'item-intonaci-interni',
    projectId: DEMO_PROJECT.id,
    typologyId: 'typology-villetta-a',
    code: 'FIN-004',
    description: 'Intonaci interni',
    category: 'FINITURE',
    uom: 'mq',
    qty: 2000,
    budgetPrice: 25,
    budgetTotal: 50000,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: 'item-tinteggiature',
    projectId: DEMO_PROJECT.id,
    typologyId: 'typology-villetta-a',
    code: 'FIN-005',
    description: 'Tinteggiature interne',
    category: 'FINITURE',
    uom: 'mq',
    qty: 2000,
    budgetPrice: 15,
    budgetTotal: 30000,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },

  // IMPERMEABILIZZAZIONI (per RFP demo)
  {
    id: 'item-impermeabilizzazione-terrazzi',
    projectId: DEMO_PROJECT.id,
    typologyId: 'typology-villetta-a',
    code: 'IMP-006',
    description: 'Impermeabilizzazione terrazzi',
    category: 'IMPERMEABILIZZAZIONI',
    uom: 'mq',
    qty: 300,
    budgetPrice: 85,
    budgetTotal: 25500,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: 'item-impermeabilizzazione-bagni',
    projectId: DEMO_PROJECT.id,
    typologyId: 'typology-villetta-a',
    code: 'IMP-007',
    description: 'Impermeabilizzazione bagni',
    category: 'IMPERMEABILIZZAZIONI',
    uom: 'mq',
    qty: 150,
    budgetPrice: 95,
    budgetTotal: 14250,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: 'item-impermeabilizzazione-cantina',
    projectId: DEMO_PROJECT.id,
    typologyId: 'typology-villetta-a',
    code: 'IMP-008',
    description: 'Impermeabilizzazione cantina',
    category: 'IMPERMEABILIZZAZIONI',
    uom: 'mq',
    qty: 200,
    budgetPrice: 75,
    budgetTotal: 15000,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },

  // ESTERNI
  {
    id: 'item-marciapiedi',
    projectId: DEMO_PROJECT.id,
    typologyId: 'typology-villetta-a',
    code: 'EST-001',
    description: 'Marciapiedi in pietra',
    category: 'ESTERNI',
    uom: 'mq',
    qty: 500,
    budgetPrice: 120,
    budgetTotal: 60000,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: 'item-strade-intern',
    projectId: DEMO_PROJECT.id,
    typologyId: 'typology-villetta-a',
    code: 'EST-002',
    description: 'Strade interne',
    category: 'ESTERNI',
    uom: 'mq',
    qty: 800,
    budgetPrice: 85,
    budgetTotal: 68000,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: 'item-verde-pubblico',
    projectId: DEMO_PROJECT.id,
    typologyId: 'typology-villetta-a',
    code: 'EST-003',
    description: 'Verde pubblico',
    category: 'ESTERNI',
    uom: 'mq',
    qty: 2000,
    budgetPrice: 25,
    budgetTotal: 50000,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: 'item-illuminazione',
    projectId: DEMO_PROJECT.id,
    typologyId: 'typology-villetta-a',
    code: 'EST-004',
    description: 'Illuminazione pubblica',
    category: 'ESTERNI',
    uom: 'pz',
    qty: 30,
    budgetPrice: 800,
    budgetTotal: 24000,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },

  // SICUREZZA
  {
    id: 'item-videocamere',
    projectId: DEMO_PROJECT.id,
    typologyId: 'typology-villetta-a',
    code: 'SIC-001',
    description: 'Sistema videocamere',
    category: 'SICUREZZA',
    uom: 'pz',
    qty: 20,
    budgetPrice: 1200,
    budgetTotal: 24000,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: 'item-cancello-automatico',
    projectId: DEMO_PROJECT.id,
    typologyId: 'typology-villetta-a',
    code: 'SIC-002',
    description: 'Cancello automatico',
    category: 'SICUREZZA',
    uom: 'pz',
    qty: 2,
    budgetPrice: 5000,
    budgetTotal: 10000,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: 'item-sistema-antifurto',
    projectId: DEMO_PROJECT.id,
    typologyId: 'typology-villetta-a',
    code: 'SIC-003',
    description: 'Sistema antifurto',
    category: 'SICUREZZA',
    uom: 'pz',
    qty: 30,
    budgetPrice: 800,
    budgetTotal: 24000,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },

  // Items per Villetta B (simili ma con quantità diverse)
  {
    id: 'item-scavi-fondazioni-b',
    projectId: DEMO_PROJECT.id,
    typologyId: 'typology-villetta-b',
    code: 'STR-001-B',
    description: 'Scavi per fondazioni continue',
    category: 'STRUTTURE',
    uom: 'mc',
    qty: 255, // 20 unità × 85mq
    budgetPrice: 45,
    budgetTotal: 11475,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: 'item-fondazioni-armate-b',
    projectId: DEMO_PROJECT.id,
    typologyId: 'typology-villetta-b',
    code: 'STR-002-B',
    description: 'Fondazioni in c.a. armato',
    category: 'STRUTTURE',
    uom: 'mc',
    qty: 204,
    budgetPrice: 380,
    budgetTotal: 77520,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: 'item-impianto-elettrico-b',
    projectId: DEMO_PROJECT.id,
    typologyId: 'typology-villetta-b',
    code: 'IMP-001-B',
    description: 'Impianto elettrico civile',
    category: 'IMPIANTI',
    uom: 'mq',
    qty: 1700,
    budgetPrice: 45,
    budgetTotal: 76500,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: 'item-pavimenti-gres-b',
    projectId: DEMO_PROJECT.id,
    typologyId: 'typology-villetta-b',
    code: 'FIN-001-B',
    description: 'Pavimenti in gres porcellanato',
    category: 'FINITURE',
    uom: 'mq',
    qty: 1360,
    budgetPrice: 65,
    budgetTotal: 88400,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: 'item-impermeabilizzazione-terrazzi-b',
    projectId: DEMO_PROJECT.id,
    typologyId: 'typology-villetta-b',
    code: 'IMP-006-B',
    description: 'Impermeabilizzazione terrazzi',
    category: 'IMPERMEABILIZZAZIONI',
    uom: 'mq',
    qty: 510,
    budgetPrice: 85,
    budgetTotal: 43350,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  }
];

// Fornitori demo
const DEMO_VENDORS = [
  {
    id: 'vendor-impermeabilizzazioni-srl',
    name: 'Impermeabilizzazioni SRL',
    email: 'info@impermeabilizzazioni-srl.it',
    phone: '+39 06 1234567',
    address: 'Via Roma 123, Roma',
    category: 'IMPERMEABILIZZAZIONI',
    rating: 4.5,
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: 'vendor-waterproof-roma',
    name: 'Waterproof Roma',
    email: 'offerte@waterproof-roma.it',
    phone: '+39 06 7654321',
    address: 'Via Milano 456, Roma',
    category: 'IMPERMEABILIZZAZIONI',
    rating: 4.2,
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: 'vendor-tecnico-impermeabilizzazioni',
    name: 'Tecnico Impermeabilizzazioni',
    email: 'commerciale@tecnico-impermeabilizzazioni.it',
    phone: '+39 06 9876543',
    address: 'Via Firenze 789, Roma',
    category: 'IMPERMEABILIZZAZIONI',
    rating: 4.8,
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  }
];

// RFP demo (impermeabilizzazioni)
const DEMO_RFP = {
  id: 'rfp-impermeabilizzazioni-ciliegie',
  projectId: DEMO_PROJECT.id,
  name: 'RFP Impermeabilizzazioni - Progetto Ciliegie',
  description: 'Richiesta offerte per lavori di impermeabilizzazione',
  itemIds: [
    'item-impermeabilizzazione-terrazzi',
    'item-impermeabilizzazione-bagni',
    'item-impermeabilizzazione-cantina',
    'item-impermeabilizzazione-terrazzi-b'
  ],
  inviteVendorIds: [
    'vendor-impermeabilizzazioni-srl',
    'vendor-waterproof-roma',
    'vendor-tecnico-impermeabilizzazioni'
  ],
  dueAt: new Date('2024-02-15').getTime(),
  hideBudget: true,
  rules: {
    requireUnitPrices: true,
    requireLeadTime: true,
    paymentTerms: '30 giorni dalla consegna'
  },
  status: 'CLOSED',
  createdAt: new Date('2024-01-20'),
  updatedAt: new Date('2024-02-15')
};

// Offerte demo
const DEMO_OFFERS = [
  {
    id: 'offer-impermeabilizzazioni-srl',
    rfpId: DEMO_RFP.id,
    vendorId: 'vendor-impermeabilizzazioni-srl',
    vendorName: 'Impermeabilizzazioni SRL',
    lines: [
      {
        itemId: 'item-impermeabilizzazione-terrazzi',
        description: 'Impermeabilizzazione terrazzi',
        uom: 'mq',
        qty: 300,
        unitPrice: 82,
        totalPrice: 24600,
        hasOffer: true,
        exclusions: []
      },
      {
        itemId: 'item-impermeabilizzazione-bagni',
        description: 'Impermeabilizzazione bagni',
        uom: 'mq',
        qty: 150,
        unitPrice: 92,
        totalPrice: 13800,
        hasOffer: true,
        exclusions: []
      },
      {
        itemId: 'item-impermeabilizzazione-cantina',
        description: 'Impermeabilizzazione cantina',
        uom: 'mq',
        qty: 200,
        unitPrice: 78,
        totalPrice: 15600,
        hasOffer: true,
        exclusions: []
      },
      {
        itemId: 'item-impermeabilizzazione-terrazzi-b',
        description: 'Impermeabilizzazione terrazzi',
        uom: 'mq',
        qty: 510,
        unitPrice: 82,
        totalPrice: 41820,
        hasOffer: true,
        exclusions: []
      }
    ],
    metadata: {
      totalValue: 95820,
      totalValueWithVat: 116900.4,
      vatRate: 22,
      leadTime: 45, // giorni
      fileType: 'Excel',
      submittedAt: new Date('2024-02-10')
    },
    status: 'RECEIVED',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10')
  },
  {
    id: 'offer-waterproof-roma',
    rfpId: DEMO_RFP.id,
    vendorId: 'vendor-waterproof-roma',
    vendorName: 'Waterproof Roma',
    lines: [
      {
        itemId: 'item-impermeabilizzazione-terrazzi',
        description: 'Impermeabilizzazione terrazzi',
        uom: 'mq',
        qty: 300,
        unitPrice: 88,
        totalPrice: 26400,
        hasOffer: true,
        exclusions: []
      },
      {
        itemId: 'item-impermeabilizzazione-bagni',
        description: 'Impermeabilizzazione bagni',
        uom: 'mq',
        qty: 150,
        unitPrice: 98,
        totalPrice: 14700,
        hasOffer: true,
        exclusions: ['Escluso materiale di finitura']
      },
      {
        itemId: 'item-impermeabilizzazione-cantina',
        description: 'Impermeabilizzazione cantina',
        uom: 'mq',
        qty: 200,
        unitPrice: 0,
        totalPrice: 0,
        hasOffer: false,
        exclusions: ['Non disponibile']
      },
      {
        itemId: 'item-impermeabilizzazione-terrazzi-b',
        description: 'Impermeabilizzazione terrazzi',
        uom: 'mq',
        qty: 510,
        unitPrice: 88,
        totalPrice: 44880,
        hasOffer: true,
        exclusions: []
      }
    ],
    metadata: {
      totalValue: 85980,
      totalValueWithVat: 104895.6,
      vatRate: 22,
      leadTime: 60, // giorni
      fileType: 'PDF',
      submittedAt: new Date('2024-02-12')
    },
    status: 'RECEIVED',
    createdAt: new Date('2024-02-12'),
    updatedAt: new Date('2024-02-12')
  }
];

// Bundle/Contratto demo
const DEMO_CONTRACT = {
  id: 'contract-impermeabilizzazioni-bundle',
  projectId: DEMO_PROJECT.id,
  rfpId: DEMO_RFP.id,
  vendorId: 'vendor-impermeabilizzazioni-srl',
  vendorName: 'Impermeabilizzazioni SRL',
  name: 'Contratto Impermeabilizzazioni - Bundle A',
  description: 'Contratto per lavori di impermeabilizzazione',
  bundles: [
    {
      id: 'bundle-impermeabilizzazioni-a',
      itemIds: [
        'item-impermeabilizzazione-terrazzi',
        'item-impermeabilizzazione-bagni',
        'item-impermeabilizzazione-cantina'
      ],
      totalAmount: 54000,
      milestones: [
        { name: 'Anticipo', percentage: 30, amount: 16200 },
        { name: '50% lavori', percentage: 40, amount: 21600 },
        { name: 'Collaudo', percentage: 20, amount: 10800 },
        { name: 'Saldo', percentage: 10, amount: 5400 }
      ]
    },
    {
      id: 'bundle-impermeabilizzazioni-b',
      itemIds: ['item-impermeabilizzazione-terrazzi-b'],
      totalAmount: 41820,
      milestones: [
        { name: 'Anticipo', percentage: 30, amount: 12546 },
        { name: '50% lavori', percentage: 40, amount: 16728 },
        { name: 'Collaudo', percentage: 20, amount: 8364 },
        { name: 'Saldo', percentage: 10, amount: 4182 }
      ]
    }
  ],
  totalAmount: 95820,
  totalAmountWithVat: 116900.4,
  status: 'SIGNED',
  signedAt: new Date('2024-02-20'),
  createdAt: new Date('2024-02-20'),
  updatedAt: new Date('2024-02-20')
};

// SAL demo
const DEMO_SAL = {
  id: 'sal-impermeabilizzazioni-terrazzi',
  contractId: DEMO_CONTRACT.id,
  bundleId: 'bundle-impermeabilizzazioni-a',
  itemId: 'item-impermeabilizzazione-terrazzi',
  description: 'Completamento impermeabilizzazione terrazzi Villetta A',
  amount: 24600,
  percentage: 100,
  status: 'APPROVED',
  approvedAt: new Date('2024-03-15'),
  createdAt: new Date('2024-03-15'),
  updatedAt: new Date('2024-03-15')
};

// Funzione principale per popolare i dati
async function seedBudgetSuppliersDemo() {
  console.log('🌱 [SEED] Inizio popolamento dati demo Budget & Suppliers...');
  
  try {
    // 1. Crea progetto demo
    console.log('📁 [SEED] Creazione progetto demo...');
    await addDoc(collection(db, 'projects'), {
      ...DEMO_PROJECT,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // 2. Crea tipologie
    console.log('🏠 [SEED] Creazione tipologie...');
    for (const typology of DEMO_TYPOLOGIES) {
      await addDoc(collection(db, 'typologies'), {
        ...typology,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    
    // 3. Crea items
    console.log('📋 [SEED] Creazione items...');
    for (const item of DEMO_ITEMS) {
      await addDoc(collection(db, 'items'), {
        ...item,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    
    // 4. Crea fornitori
    console.log('🏢 [SEED] Creazione fornitori...');
    for (const vendor of DEMO_VENDORS) {
      await addDoc(collection(db, 'vendors'), {
        ...vendor,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    
    // 5. Crea RFP
    console.log('📝 [SEED] Creazione RFP...');
    await addDoc(collection(db, 'rfps'), {
      ...DEMO_RFP,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // 6. Crea offerte
    console.log('💰 [SEED] Creazione offerte...');
    for (const offer of DEMO_OFFERS) {
      await addDoc(collection(db, 'offers'), {
        ...offer,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    
    // 7. Crea contratto
    console.log('📋 [SEED] Creazione contratto...');
    await addDoc(collection(db, 'contracts'), {
      ...DEMO_CONTRACT,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // 8. Crea SAL
    console.log('📊 [SEED] Creazione SAL...');
    await addDoc(collection(db, 'sals'), {
      ...DEMO_SAL,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ [SEED] Popolamento dati demo completato con successo!');
    console.log('');
    console.log('📊 [SEED] Riepilogo dati creati:');
    console.log(`   • 1 Progetto: ${DEMO_PROJECT.name}`);
    console.log(`   • ${DEMO_TYPOLOGIES.length} Tipologie: ${DEMO_TYPOLOGIES.map(t => t.name).join(', ')}`);
    console.log(`   • ${DEMO_ITEMS.length} Items (mix categorie)`);
    console.log(`   • ${DEMO_VENDORS.length} Fornitori`);
    console.log(`   • 1 RFP: ${DEMO_RFP.name}`);
    console.log(`   • ${DEMO_OFFERS.length} Offerte (una con esclusioni)`);
    console.log(`   • 1 Contratto firmato`);
    console.log(`   • 1 SAL registrato`);
    console.log('');
    console.log('🎯 [SEED] La pagina Budget & Suppliers è ora navigabile con dati demo!');
    
  } catch (error) {
    console.error('❌ [SEED] Errore durante il popolamento:', error);
    process.exit(1);
  }
}

// Esegui lo script se chiamato direttamente
if (require.main === module) {
  seedBudgetSuppliersDemo()
    .then(() => {
      console.log('🎉 [SEED] Script completato con successo!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 [SEED] Errore fatale:', error);
      process.exit(1);
    });
}

export { seedBudgetSuppliersDemo };

