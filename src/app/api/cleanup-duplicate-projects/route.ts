import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/firebase';
import { projectManagerService } from '@/lib/projectManagerService';

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticazione
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token di autenticazione richiesto' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];

    // Verifica il token Firebase
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch (error) {
      console.error('❌ Token Firebase non valido:', error);
      return NextResponse.json({ error: 'Token non valido' }, { status: 401 });
    }

    const userId = decodedToken.uid;
    console.log('🧹 Pulizia progetti duplicati per utente:', userId);

    // Esegui la pulizia
    const result = await projectManagerService.cleanupDuplicateProjects(userId);

    // Verifica integrità dopo la pulizia
    const integrity = await projectManagerService.verifyProjectIntegrity(userId);

    return NextResponse.json({
      success: true,
      message: 'Pulizia progetti duplicati completata',
      cleanup: result,
      integrity,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Errore pulizia progetti duplicati:', error);
    return NextResponse.json(
      {
        error: 'Errore interno del server',
        details: error instanceof Error ? error.message : 'Errore sconosciuto',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verifica autenticazione
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token di autenticazione richiesto' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];

    // Verifica il token Firebase
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch (error) {
      console.error('❌ Token Firebase non valido:', error);
      return NextResponse.json({ error: 'Token non valido' }, { status: 401 });
    }

    const userId = decodedToken.uid;
    console.log('🔍 Verifica integrità progetti per utente:', userId);

    // Verifica solo l'integrità
    const integrity = await projectManagerService.verifyProjectIntegrity(userId);

    return NextResponse.json({
      success: true,
      message: 'Verifica integrità progetti completata',
      integrity,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Errore verifica integrità progetti:', error);
    return NextResponse.json(
      {
        error: 'Errore interno del server',
        details: error instanceof Error ? error.message : 'Errore sconosciuto',
      },
      { status: 500 }
    );
  }
}
