import { NextRequest, NextResponse } from 'next/server';
import { doc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Endpoint DELETE per eliminazione progetti di fattibilità
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    
    if (!projectId) {
      return NextResponse.json({
        success: false,
        error: 'ID progetto richiesto'
      }, { status: 400 });
    }

    console.log('🗑️ [FEASIBILITY DELETE API] Eliminazione progetto:', projectId);

    // 1. Verifica esistenza progetto
    const projectRef = doc(db, 'feasibilityProjects', projectId);
    const projectSnap = await getDoc(projectRef);

    if (!projectSnap.exists()) {
      console.log('⚠️ [FEASIBILITY DELETE API] Progetto non trovato:', projectId);
      return NextResponse.json({
        success: false,
        error: 'Progetto non trovato'
      }, { status: 404 });
    }

    console.log('✅ [FEASIBILITY DELETE API] Progetto trovato, procedo con eliminazione...');

    // 2. Elimina progetto
    await deleteDoc(projectRef);
    console.log('✅ [FEASIBILITY DELETE API] Progetto eliminato con successo:', projectId);

    // 3. Verifica eliminazione
    const verifySnap = await getDoc(projectRef);
    if (verifySnap.exists()) {
      console.log('❌ [FEASIBILITY DELETE API] Verifica fallita - progetto ancora presente');
      return NextResponse.json({
        success: false,
        error: 'Eliminazione fallita - progetto ancora presente'
      }, { status: 500 });
    }

    console.log('🎯 [FEASIBILITY DELETE API] Eliminazione verificata con successo');

    return NextResponse.json({
      success: true,
      message: 'Progetto eliminato con successo',
      projectId,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ [FEASIBILITY DELETE API] Errore eliminazione:', error);
    return NextResponse.json({
      success: false,
      error: 'Errore interno del server',
      details: error.message
    }, { status: 500 });
  }
}

// Endpoint GET per recuperare singolo progetto
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    
    if (!projectId) {
      return NextResponse.json({
        success: false,
        error: 'ID progetto richiesto'
      }, { status: 400 });
    }

    console.log('🔍 [FEASIBILITY GET API] Recupero progetto:', projectId);

    const projectRef = doc(db, 'feasibilityProjects', projectId);
    const projectSnap = await getDoc(projectRef);

    if (!projectSnap.exists()) {
      return NextResponse.json({
        success: false,
        error: 'Progetto non trovato'
      }, { status: 404 });
    }

    const projectData = {
      id: projectSnap.id,
      ...projectSnap.data(),
      // Converti timestamp Firebase in date ISO
      createdAt: projectSnap.data().createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: projectSnap.data().updatedAt?.toDate?.()?.toISOString() || null,
      startDate: projectSnap.data().startDate?.toDate?.()?.toISOString() || null,
      constructionStartDate: projectSnap.data().constructionStartDate?.toDate?.()?.toISOString() || null,
    };

    return NextResponse.json({
      success: true,
      project: projectData,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ [FEASIBILITY GET API] Errore recupero progetto:', error);
    return NextResponse.json({
      success: false,
      error: 'Errore interno del server',
      details: error.message
    }, { status: 500 });
  }
}
