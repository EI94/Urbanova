import { getDocs, deleteDoc, doc, writeBatch , collection } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/firebase';


export async function POST(request: NextRequest) {
  try {
    console.log('🧹 PULIZIA COMPLETA DATABASE - INIZIO...');

    const { force } = await request.json();

    if (!force) {
      return NextResponse.json({
        error: 'Richiesto parametro force=true per confermare la pulizia',
        success: false,
      });
    }

    const collectionRef = collection(db!, 'feasibilityProjects');

    // 1. Ottieni tutti i progetti
    console.log('🔍 Recupero tutti i progetti...');
    const snapshot = await getDocs(collectionRef);
    const projects = snapshot.docs;

    console.log(`📊 Progetti trovati: ${projects.length}`);

    if (projects.length === 0) {
      console.log('✅ Database già pulito - Nessun progetto trovato');
      return NextResponse.json({
        success: true,
        message: 'Database già pulito',
        projectsDeleted: 0,
      });
    }

    // 2. Mostra dettagli dei progetti che verranno eliminati
    console.log('📋 Progetti che verranno eliminati:');
    projects.forEach((doc, index) => {
      const data = doc.data();
      console.log(
        `  ${index + 1}. ID: ${doc.id}, Nome: ${data.name || 'N/A'}, Indirizzo: ${data.address || 'N/A'}`
      );
    });

    // 3. Elimina tutti i progetti con batch
    console.log('🗑️ Eliminazione progetti con batch...');
    const batch = writeBatch(db);

    projects.forEach(projectDoc => {
      batch.delete(projectDoc.ref);
    });

    // 4. Commit del batch
    await batch.commit();

    console.log(`✅ ELIMINAZIONE COMPLETATA - ${projects.length} progetti eliminati`);

    // 5. Verifica che siano stati eliminati
    console.log('🔍 Verifica post-eliminazione...');
    const verifySnapshot = await getDocs(collectionRef);
    const remainingProjects = verifySnapshot.docs.length;

    if (remainingProjects === 0) {
      console.log('✅ VERIFICA OK - Database completamente pulito');
    } else {
      console.log(`⚠️ VERIFICA FALLITA - Rimangono ${remainingProjects} progetti`);
    }

    return NextResponse.json({
      success: true,
      message: `Database pulito con successo`,
      projectsDeleted: projects.length,
      remainingProjects,
      details: projects.map(doc => ({
        id: doc.id,
        name: doc.data().name || 'N/A',
        address: doc.data().address || 'N/A',
      })),
    });
  } catch (error) {
    console.error('❌ ERRORE PULIZIA DATABASE:', error);
    return NextResponse.json({
      success: false,
      error: 'Errore durante la pulizia del database',
      details: error instanceof Error ? error.message : 'Errore sconosciuto',
    });
  }
}
