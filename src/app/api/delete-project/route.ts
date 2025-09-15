import { NextRequest, NextResponse } from 'next/server';

// CHIRURGICO: Protezione ultra-sicura per evitare crash auth import
let auth;
try {
  const firebaseModule = require('@/lib/firebase');
  auth = firebaseModule.auth;
} catch (error) {
  console.error('❌ [delete-project] Errore import auth:', error);
  auth = null;
}
import { projectManagerService } from '@/lib/projectManagerService';

export async function DELETE(request: NextRequest) {
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

    // Ottieni l'ID del progetto dall'URL
    const url = new URL(request.url);
    const projectId = url.searchParams.get('id');

    if (!projectId) {
      return NextResponse.json({ error: 'ID progetto richiesto' }, { status: 400 });
    }

    console.log('🗑️ Richiesta cancellazione progetto:', { projectId, userId });

    // Verifica se il progetto può essere cancellato
    const canDelete = await projectManagerService.canDeleteProject(projectId, userId);

    if (!canDelete.canDelete) {
      return NextResponse.json(
        {
          error: 'Progetto non può essere cancellato',
          reason: canDelete.reason,
        },
        { status: 400 }
      );
    }

    // Esegui la cancellazione sicura
    const result = await projectManagerService.safeDeleteProject(projectId, userId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Progetto cancellato con successo',
        projectId: result.projectId,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        {
          error: 'Errore durante la cancellazione',
          details: result.message,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Errore cancellazione progetto:', error);
    return NextResponse.json(
      {
        error: 'Errore interno del server',
        details: error instanceof Error ? error.message : 'Errore sconosciuto',
      },
      { status: 500 }
    );
  }
}

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

    // Ottieni i dati dalla richiesta
    const { projectIds } = await request.json();

    if (!projectIds || !Array.isArray(projectIds) || projectIds.length === 0) {
      return NextResponse.json({ error: 'Lista ID progetti richiesta' }, { status: 400 });
    }

    console.log('🗑️ Richiesta cancellazione multipla progetti:', {
      count: projectIds.length,
      userId,
    });

    // Esegui la cancellazione multipla
    const result = await projectManagerService.deleteMultipleProjects(projectIds, userId);

    return NextResponse.json({
      success: result.success,
      message: `Cancellazione completata: ${result.deleted.length}/${result.total} progetti eliminati`,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Errore cancellazione multipla progetti:', error);
    return NextResponse.json(
      {
        error: 'Errore interno del server',
        details: error instanceof Error ? error.message : 'Errore sconosciuto',
      },
      { status: 500 }
    );
  }
}
