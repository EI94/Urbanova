import { NextRequest, NextResponse } from 'next/server';
import { firebaseNotificationService } from '@/lib/firebaseNotificationService';
import { withAuth, AuthenticatedUser } from '@/lib/authMiddleware';

/**
 * API per gestire le notifiche
 * Endpoints:
 * - PUT /api/notifications/[id]/read - Marca notifica come letta
 * - PUT /api/notifications/[id]/unread - Marca notifica come non letta
 * - DELETE /api/notifications/[id] - Elimina notifica
 * - PUT /api/notifications/read-all - Marca tutte le notifiche come lette
 * - POST /api/notifications/test - Genera notifiche di test
 */

export const PUT = withAuth(async (
  request: NextRequest,
  user: AuthenticatedUser,
  { params }: { params: { id: string } }
) => {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const notificationId = params.id;

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: 'ID notifica è obbligatorio' },
        { status: 400 }
      );
    }

    // Verifica che la notifica appartenga all'utente autenticato
    const notification = await firebaseNotificationService.getNotificationById(notificationId);
    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Notifica non trovata' },
        { status: 404 }
      );
    }

    if (notification.userId !== user.uid && user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Non autorizzato ad accedere a questa notifica' },
        { status: 403 }
      );
    }

    if (action === 'read') {
      await firebaseNotificationService.markAsRead(notificationId);
      return NextResponse.json({
        success: true,
        message: 'Notifica marcata come letta'
      });
    } else if (action === 'unread') {
      await firebaseNotificationService.markAsUnread(notificationId);
      return NextResponse.json({
        success: true,
        message: 'Notifica marcata come non letta'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Azione non valida' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('❌ [API] Errore aggiornamento notifica:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Errore interno del server' 
      },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (
  request: NextRequest,
  user: AuthenticatedUser,
  { params }: { params: { id: string } }
) => {
  try {
    const notificationId = params.id;

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: 'ID notifica è obbligatorio' },
        { status: 400 }
      );
    }

    // Verifica che la notifica appartenga all'utente autenticato
    const notification = await firebaseNotificationService.getNotificationById(notificationId);
    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Notifica non trovata' },
        { status: 404 }
      );
    }

    if (notification.userId !== user.uid && user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Non autorizzato ad eliminare questa notifica' },
        { status: 403 }
      );
    }

    await firebaseNotificationService.deleteNotification(notificationId);

    return NextResponse.json({
      success: true,
      message: 'Notifica eliminata con successo'
    });

  } catch (error) {
    console.error('❌ [API] Errore eliminazione notifica:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Errore interno del server' 
      },
      { status: 500 }
    );
  }
});
