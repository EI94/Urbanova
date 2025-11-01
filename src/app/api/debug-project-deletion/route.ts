import {doc,
  getDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/firebase';


export async function POST(request: NextRequest) {
  try {
    const { projectId, action } = await request.json();

    console.log('🔍 DEBUG PROJECT DELETION - Inizio debug completo...');
    console.log('📋 Parametri ricevuti:', { projectId, action });

    if (!projectId) {
      return NextResponse.json({
        error: 'Project ID richiesto',
        success: false,
      });
    }

    const collectionRef = collection(db!, 'feasibilityProjects');
    const projectRef = doc(collectionRef, projectId);

    // 1. VERIFICA SE IL PROGETTO ESISTE PRIMA
    console.log('🔍 STEP 1: Verifica esistenza progetto...');
    const projectBefore = await getDoc(projectRef);

    if (!projectBefore.exists()) {
      console.log('❌ PROGETTO NON TROVATO PRIMA DELLA CANCELLAZIONE');
      return NextResponse.json({
        success: false,
        error: 'Progetto non trovato',
        debug: {
          step: 'verifica_pre_cancellazione',
          projectId,
          exists: false,
        },
      });
    }

    console.log('✅ Progetto trovato prima della cancellazione:', {
      id: projectBefore.id,
      data: projectBefore.data(),
    });

    // 2. VERIFICA REGOLE FIRESTORE
    console.log('🔍 STEP 2: Verifica regole Firestore...');
    try {
      // Prova a leggere il documento per verificare le regole
      const testRead = await getDoc(projectRef);
      console.log('✅ Lettura documento OK - Regole Firestore permettono read');
    } catch (readError) {
      console.log('❌ ERRORE LETTURA - Regole Firestore bloccano read:', readError);
      return NextResponse.json({
        success: false,
        error: 'Regole Firestore bloccano la lettura',
        debug: {
          step: 'verifica_regole_read',
          projectId,
          readError: readError instanceof Error ? readError.message : 'Errore sconosciuto',
        },
      });
    }

    // 3. PROVA CANCELLAZIONE
    console.log('🔍 STEP 3: Tentativo cancellazione...');
    let deleteSuccess = false;
    let deleteError = null;

    try {
      await deleteDoc(projectRef);
      console.log('✅ CANCELLAZIONE RIUSCITA!');
      deleteSuccess = true;
    } catch (deleteErr) {
      console.log('❌ ERRORE CANCELLAZIONE:', deleteErr);
      deleteError = deleteErr instanceof Error ? deleteErr.message : 'Errore sconosciuto';
    }

    // 4. VERIFICA SE È STATO CANCELLATO
    console.log('🔍 STEP 4: Verifica post-cancellazione...');
    let projectAfter = null;
    try {
      projectAfter = await getDoc(projectRef);
      console.log('📋 Stato progetto dopo cancellazione:', {
        exists: projectAfter.exists(),
        id: projectAfter.id,
        data: projectAfter.data(),
      });
    } catch (afterError) {
      console.log('❌ Errore verifica post-cancellazione:', afterError);
    }

    // 5. VERIFICA COLLEZIONE COMPLETA
    console.log('🔍 STEP 5: Verifica collezione completa...');
    try {
      const allProjects = await getDocs(collectionRef);
      console.log('📊 Totale progetti nella collezione:', allProjects.size);

      const projectIds = allProjects.docs.map(doc => doc.id);
      const projectStillExists = projectIds.includes(projectId);

      console.log('🔍 Progetto ancora presente nella collezione?', projectStillExists);
      if (projectStillExists) {
        console.log('⚠️ PROGETTO ANCORA PRESENTE! ID:', projectId);
      }
    } catch (collectionError) {
      console.log('❌ Errore verifica collezione:', collectionError);
    }

    // 6. RISULTATO FINALE
    const result = {
      success: deleteSuccess && !projectAfter?.exists(),
      projectId,
      debug: {
        step1_esistenza_pre: true,
        step2_regole_ok: true,
        step3_cancellazione: deleteSuccess,
        step4_verifica_post: !projectAfter?.exists(),
        step5_collezione: !projectAfter?.exists(),
        deleteError,
        projectAfter: projectAfter
          ? {
              exists: projectAfter.exists(),
              data: projectAfter.data(),
            }
          : null,
      },
    };

    console.log('🏁 RISULTATO FINALE DEBUG:', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ ERRORE GENERALE DEBUG:', error);
    return NextResponse.json({
      success: false,
      error: 'Errore generale nel debug',
      details: error instanceof Error ? error.message : 'Errore sconosciuto',
    });
  }
}
