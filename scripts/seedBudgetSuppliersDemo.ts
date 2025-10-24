#!/usr/bin/env tsx

/**
 * 🌱 BUDGET SUPPLIERS DEMO SEED - VERSIONE SEMPLIFICATA
 * 
 * Script per popolare dati demo per presentazione Budget & Suppliers
 * Progetto "Ciliegie" con tipologie, items, RFP, offerte e contratti
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Configurazione Firebase
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

// Funzione principale per popolare i dati
async function seedBudgetSuppliersDemo() {
  console.log('🌱 [SEED] Inizio popolamento dati demo Budget & Suppliers...');
  
  try {
    // 1. Crea progetto demo
    console.log('📁 [SEED] Creazione progetto demo...');
    const projectRef = await addDoc(collection(db, 'projects'), {
      name: 'Ciliegie',
      description: 'Residenziale di lusso con ville unifamiliari',
      location: 'Roma, Via delle Ciliegie 123',
      type: 'RESIDENTIAL',
      status: 'ACTIVE',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    const projectId = projectRef.id;
    console.log(`✅ [SEED] Progetto creato con ID: ${projectId}`);
    
    // 2. Crea tipologie
    console.log('🏠 [SEED] Creazione tipologie...');
    const typologyRefs = [];
    
    // Villetta A
    const typologyARef = await addDoc(collection(db, 'typologies'), {
      projectId: projectId,
      name: 'Villetta A',
      description: 'Villetta unifamiliare di lusso',
      units: 10,
      averageSize: 100,
      totalArea: 1000,
      characteristics: {
        floors: 2,
        bedrooms: 3,
        bathrooms: 2,
        garage: true,
        garden: true
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    typologyRefs.push(typologyARef.id);
    
    // Villetta B
    const typologyBRef = await addDoc(collection(db, 'typologies'), {
      projectId: projectId,
      name: 'Villetta B',
      description: 'Villetta unifamiliare premium',
      units: 20,
      averageSize: 85,
      totalArea: 1700,
      characteristics: {
        floors: 2,
        bedrooms: 2,
        bathrooms: 2,
        garage: true,
        garden: true
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    typologyRefs.push(typologyBRef.id);
    
    console.log(`✅ [SEED] Tipologie create: ${typologyRefs.length}`);
    
    // 3. Crea items (10 items semplificati)
    console.log('📋 [SEED] Creazione items...');
    const itemRefs = [];
    
    const items = [
      {
        projectId: projectId,
        typologyId: typologyARef.id,
        code: 'STR-001',
        description: 'Scavi per fondazioni continue',
        category: 'STRUTTURE',
        uom: 'mc',
        qty: 150,
        budgetPrice: 45,
        budgetTotal: 6750
      },
      {
        projectId: projectId,
        typologyId: typologyARef.id,
        code: 'STR-002',
        description: 'Fondazioni in c.a. armato',
        category: 'STRUTTURE',
        uom: 'mc',
        qty: 120,
        budgetPrice: 380,
        budgetTotal: 45600
      },
      {
        projectId: projectId,
        typologyId: typologyARef.id,
        code: 'IMP-001',
        description: 'Impermeabilizzazione terrazzi',
        category: 'IMPERMEABILIZZAZIONI',
        uom: 'mq',
        qty: 300,
        budgetPrice: 85,
        budgetTotal: 25500
      },
      {
        projectId: projectId,
        typologyId: typologyARef.id,
        code: 'IMP-002',
        description: 'Impermeabilizzazione bagni',
        category: 'IMPERMEABILIZZAZIONI',
        uom: 'mq',
        qty: 150,
        budgetPrice: 95,
        budgetTotal: 14250
      },
      {
        projectId: projectId,
        typologyId: typologyARef.id,
        code: 'IMP-003',
        description: 'Impermeabilizzazione cantina',
        category: 'IMPERMEABILIZZAZIONI',
        uom: 'mq',
        qty: 200,
        budgetPrice: 75,
        budgetTotal: 15000
      },
      {
        projectId: projectId,
        typologyId: typologyBRef.id,
        code: 'IMP-004',
        description: 'Impermeabilizzazione terrazzi B',
        category: 'IMPERMEABILIZZAZIONI',
        uom: 'mq',
        qty: 510,
        budgetPrice: 85,
        budgetTotal: 43350
      },
      {
        projectId: projectId,
        typologyId: typologyARef.id,
        code: 'FIN-001',
        description: 'Pavimenti in gres porcellanato',
        category: 'FINITURE',
        uom: 'mq',
        qty: 800,
        budgetPrice: 65,
        budgetTotal: 52000
      },
      {
        projectId: projectId,
        typologyId: typologyARef.id,
        code: 'EST-001',
        description: 'Marciapiedi in pietra',
        category: 'ESTERNI',
        uom: 'mq',
        qty: 500,
        budgetPrice: 120,
        budgetTotal: 60000
      },
      {
        projectId: projectId,
        typologyId: typologyARef.id,
        code: 'SIC-001',
        description: 'Sistema videocamere',
        category: 'SICUREZZA',
        uom: 'pz',
        qty: 20,
        budgetPrice: 1200,
        budgetTotal: 24000
      },
      {
        projectId: projectId,
        typologyId: typologyARef.id,
        code: 'IMP-005',
        description: 'Impermeabilizzazione coperture',
        category: 'IMPERMEABILIZZAZIONI',
        uom: 'mq',
        qty: 400,
        budgetPrice: 90,
        budgetTotal: 36000
      }
    ];
    
    for (const item of items) {
      const itemRef = await addDoc(collection(db, 'items'), {
        ...item,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      itemRefs.push(itemRef.id);
    }
    
    console.log(`✅ [SEED] Items creati: ${itemRefs.length}`);
    
    // 4. Crea fornitori
    console.log('🏢 [SEED] Creazione fornitori...');
    const vendorRefs = [];
    
    const vendors = [
      {
        name: 'Impermeabilizzazioni SRL',
        email: 'info@impermeabilizzazioni-srl.it',
        phone: '+39 06 1234567',
        address: 'Via Roma 123, Roma',
        category: 'IMPERMEABILIZZAZIONI',
        rating: 4.5
      },
      {
        name: 'Waterproof Roma',
        email: 'offerte@waterproof-roma.it',
        phone: '+39 06 7654321',
        address: 'Via Milano 456, Roma',
        category: 'IMPERMEABILIZZAZIONI',
        rating: 4.2
      },
      {
        name: 'Tecnico Impermeabilizzazioni',
        email: 'commerciale@tecnico-impermeabilizzazioni.it',
        phone: '+39 06 9876543',
        address: 'Via Firenze 789, Roma',
        category: 'IMPERMEABILIZZAZIONI',
        rating: 4.8
      }
    ];
    
    for (const vendor of vendors) {
      const vendorRef = await addDoc(collection(db, 'vendors'), {
        ...vendor,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      vendorRefs.push(vendorRef.id);
    }
    
    console.log(`✅ [SEED] Fornitori creati: ${vendorRefs.length}`);
    
    // 5. Crea RFP
    console.log('📝 [SEED] Creazione RFP...');
    const rfpRef = await addDoc(collection(db, 'rfps'), {
      projectId: projectId,
      name: 'RFP Impermeabilizzazioni - Progetto Ciliegie',
      description: 'Richiesta offerte per lavori di impermeabilizzazione',
      itemIds: itemRefs.filter((_, index) => [2, 3, 4, 5, 9].includes(index)), // Items impermeabilizzazioni
      inviteVendorIds: vendorRefs,
      dueAt: 1707955200000, // 2024-02-15 timestamp
      hideBudget: true,
      rules: {
        requireUnitPrices: true,
        requireLeadTime: true,
        paymentTerms: '30 giorni dalla consegna'
      },
      status: 'CLOSED',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log(`✅ [SEED] RFP creato con ID: ${rfpRef.id}`);
    
    // 6. Crea offerte
    console.log('💰 [SEED] Creazione offerte...');
    
    // Offerta 1: Completa
    const offer1Ref = await addDoc(collection(db, 'offers'), {
      rfpId: rfpRef.id,
      vendorId: vendorRefs[0],
      vendorName: 'Impermeabilizzazioni SRL',
      lines: [
        { itemId: itemRefs[2], qty: 300, unitPrice: 82, totalPrice: 24600, hasOffer: true, exclusions: [] },
        { itemId: itemRefs[3], qty: 150, unitPrice: 92, totalPrice: 13800, hasOffer: true, exclusions: [] },
        { itemId: itemRefs[4], qty: 200, unitPrice: 78, totalPrice: 15600, hasOffer: true, exclusions: [] },
        { itemId: itemRefs[5], qty: 510, unitPrice: 82, totalPrice: 41820, hasOffer: true, exclusions: [] },
        { itemId: itemRefs[9], qty: 400, unitPrice: 88, totalPrice: 35200, hasOffer: true, exclusions: [] }
      ],
      metadata: {
        totalValue: 131020,
        totalValueWithVat: 159844.4,
        leadTime: 45
      },
      status: 'RECEIVED',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Offerta 2: Con esclusioni
    const offer2Ref = await addDoc(collection(db, 'offers'), {
      rfpId: rfpRef.id,
      vendorId: vendorRefs[1],
      vendorName: 'Waterproof Roma',
      lines: [
        { itemId: itemRefs[2], qty: 300, unitPrice: 88, totalPrice: 26400, hasOffer: true, exclusions: [] },
        { itemId: itemRefs[3], qty: 150, unitPrice: 98, totalPrice: 14700, hasOffer: true, exclusions: ['Escluso materiale di finitura'] },
        { itemId: itemRefs[4], qty: 200, unitPrice: 0, totalPrice: 0, hasOffer: false, exclusions: ['Non disponibile'] },
        { itemId: itemRefs[5], qty: 510, unitPrice: 88, totalPrice: 44880, hasOffer: true, exclusions: [] },
        { itemId: itemRefs[9], qty: 400, unitPrice: 92, totalPrice: 36800, hasOffer: true, exclusions: [] }
      ],
      metadata: {
        totalValue: 122780,
        totalValueWithVat: 149791.6,
        leadTime: 60
      },
      status: 'RECEIVED',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log(`✅ [SEED] Offerte create: 2`);
    
    // 7. Crea contratto
    console.log('📋 [SEED] Creazione contratto...');
    const contractRef = await addDoc(collection(db, 'contracts'), {
      projectId: projectId,
      vendorId: vendorRefs[0],
      vendorName: 'Impermeabilizzazioni SRL',
      name: 'Contratto Impermeabilizzazioni - Bundle A',
      bundles: [
        {
          itemIds: [itemRefs[2], itemRefs[3], itemRefs[4]],
          totalAmount: 54000,
          milestones: [
            { name: 'Anticipo', percentage: 30, amount: 16200 },
            { name: '50% lavori', percentage: 40, amount: 21600 },
            { name: 'Collaudo', percentage: 20, amount: 10800 },
            { name: 'Saldo', percentage: 10, amount: 5400 }
          ]
        },
        {
          itemIds: [itemRefs[5], itemRefs[9]],
          totalAmount: 77020,
          milestones: [
            { name: 'Anticipo', percentage: 30, amount: 23106 },
            { name: '50% lavori', percentage: 40, amount: 30808 },
            { name: 'Collaudo', percentage: 20, amount: 15404 },
            { name: 'Saldo', percentage: 10, amount: 7702 }
          ]
        }
      ],
      totalAmount: 131020,
      totalAmountWithVat: 159844.4,
      status: 'SIGNED',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log(`✅ [SEED] Contratto creato con ID: ${contractRef.id}`);
    
    // 8. Crea SAL
    console.log('📊 [SEED] Creazione SAL...');
    const salRef = await addDoc(collection(db, 'sals'), {
      contractId: contractRef.id,
      itemId: itemRefs[2],
      description: 'Completamento impermeabilizzazione terrazzi Villetta A',
      amount: 24600,
      percentage: 100,
      status: 'APPROVED',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log(`✅ [SEED] SAL creato con ID: ${salRef.id}`);
    
    console.log('✅ [SEED] Popolamento dati demo completato con successo!');
    console.log('');
    console.log('📊 [SEED] Riepilogo dati creati:');
    console.log(`   • 1 Progetto: Ciliegie (ID: ${projectId})`);
    console.log(`   • 2 Tipologie: Villetta A, Villetta B`);
    console.log(`   • ${itemRefs.length} Items (mix categorie)`);
    console.log(`   • ${vendorRefs.length} Fornitori`);
    console.log(`   • 1 RFP: Impermeabilizzazioni`);
    console.log(`   • 2 Offerte (una con esclusioni)`);
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