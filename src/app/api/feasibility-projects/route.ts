import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 [FEASIBILITY PROJECTS API] Richiesta recupero progetti...');
    
    // Import dinamico per evitare errori di build
    const { db } = await import('@/lib/firebase');
    const { getDocs, collection, query, orderBy, limit } = await import('firebase/firestore');
    
    // Query per ottenere tutti i progetti di fattibilità
    const projectsRef = collection(db, 'feasibilityProjects');
    const q = query(projectsRef, orderBy('createdAt', 'desc'), limit(100));
    
    console.log('🔄 [FEASIBILITY PROJECTS API] Eseguendo query progetti...');
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('⚠️ [FEASIBILITY PROJECTS API] Nessun progetto trovato');
      return NextResponse.json({
        success: true,
        projects: [],
        count: 0,
        message: 'Nessun progetto trovato'
      });
    }
    
    const projects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Converti i timestamp Firebase in date ISO
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
      startDate: doc.data().startDate?.toDate?.()?.toISOString() || null,
      constructionStartDate: doc.data().constructionStartDate?.toDate?.()?.toISOString() || null,
    }));
    
    console.log(`✅ [FEASIBILITY PROJECTS API] Progetti recuperati: ${projects.length}`, {
      projects: projects.map(p => ({ id: p.id, name: p.name, createdBy: p.createdBy }))
    });
    
    return NextResponse.json({
      success: true,
      projects,
      count: projects.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ [FEASIBILITY PROJECTS API] Errore recupero progetti:', error);
    return NextResponse.json({
      success: false,
      error: 'Errore nel recupero dei progetti',
      details: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    console.log('🔄 [FEASIBILITY PROJECTS API] Richiesta creazione progetto...');
    
    const { name, address, status, startDate, constructionStartDate, duration, totalArea, targetMargin, createdBy, notes, costs, revenues, results } = requestData;
    
    if (!name || !address) {
      return NextResponse.json({
        success: false,
        error: 'Campi obbligatori mancanti: name e address sono richiesti'
      }, { status: 400 });
    }
    
    // Import dinamico per evitare errori di build
    const { db } = await import('@/lib/firebase');
    const { addDoc, serverTimestamp, collection } = await import('firebase/firestore');
    
    const projectData = {
      name,
      address,
      status: status || 'PIANIFICAZIONE',
      startDate: startDate ? new Date(startDate) : new Date(),
      constructionStartDate: constructionStartDate ? new Date(constructionStartDate) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      duration: duration || 18,
      totalArea: totalArea || 0,
      targetMargin: targetMargin || 30,
      createdBy: createdBy || 'anonymous',
      notes: notes || `Progetto creato - ${new Date().toISOString()}`,
      costs: costs || {},
      revenues: revenues || {},
      results: results || {},
      isTargetAchieved: results?.margin >= (targetMargin || 30),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    console.log('💾 [FEASIBILITY PROJECTS API] Salvataggio progetto...');
    const projectRef = await addDoc(collection(db, 'feasibilityProjects'), projectData);
    console.log('✅ [FEASIBILITY PROJECTS API] Progetto creato con ID:', projectRef.id);
    
    return NextResponse.json({
      success: true,
      projectId: projectRef.id,
      message: 'Progetto creato con successo',
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ [FEASIBILITY PROJECTS API] Errore creazione progetto:', error);
    return NextResponse.json({
      success: false,
      error: 'Errore nella creazione del progetto',
      details: error.message
    }, { status: 500 });
  }
}

