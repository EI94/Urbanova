import { NextRequest, NextResponse } from 'next/server';
import { firebaseNotificationService } from '@/lib/firebaseNotificationService';
import { notificationTriggerService } from '@/lib/notificationTriggerService';
import { withAuth, AuthenticatedUser } from '@/lib/authMiddleware';

/**
 * API per operazioni bulk sulle notifiche
 * Endpoints:
 * - PUT /api/notifications/bulk/read-all - Marca tutte le notifiche come lette
 * - POST /api/notifications/bulk/test - Genera notifiche di test
 * - DELETE /api/notifications/bulk/cleanup - Pulisce notifiche scadute
 */

export const PUT = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'read-all') {
      await firebaseNotificationService.markAllAsRead(user.uid);
      return NextResponse.json({
        success: true,
        message: 'Tutte le notifiche sono state marcate come lette'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Azione non valida' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('❌ [API] Errore operazione bulk notifiche:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Errore interno del server' 
      },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'test') {
      // Solo admin possono generare notifiche di test
      if (user.role !== 'ADMIN') {
        return NextResponse.json(
          { success: false, error: 'Solo admin possono generare notifiche di test' },
          { status: 403 }
        );
      }

      await notificationTriggerService.generateTestNotifications(user.uid);
      return NextResponse.json({
        success: true,
        message: 'Notifiche di test generate con successo'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Azione non valida' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('❌ [API] Errore generazione notifiche test:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Errore interno del server' 
      },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'cleanup') {
      // Solo admin possono pulire le notifiche scadute
      if (user.role !== 'ADMIN') {
        return NextResponse.json(
          { success: false, error: 'Solo admin possono pulire le notifiche scadute' },
          { status: 403 }
        );
      }

      await notificationTriggerService.cleanupExpiredNotifications();
      return NextResponse.json({
        success: true,
        message: 'Pulizia notifiche scadute completata'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Azione non valida' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('❌ [API] Errore pulizia notifiche:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Errore interno del server' 
      },
      { status: 500 }
    );
  }
});
