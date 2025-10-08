import { NextRequest, NextResponse } from 'next/server';
import { firebaseNotificationService } from '@/lib/firebaseNotificationService';
import { withAuth, AuthenticatedUser } from '@/lib/authMiddleware';

export const GET = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const type = searchParams.get('type') as any;
    const priority = searchParams.get('priority') as any;

    // Usa l'userId dall'utente autenticato
    const notifications = await firebaseNotificationService.getNotifications(user.uid, {
      limit,
      unreadOnly,
      type,
      priority
    });

    console.log('✅ [API] Notifiche recuperate:', notifications.length, 'per utente:', user.uid);

    return NextResponse.json({
      success: true,
      notifications,
      count: notifications.length
    });

  } catch (error) {
    console.error('❌ [API] Errore recupero notifiche:', error);
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
    const body = await request.json();
    const { type, priority, title, message, data, expiresAt, actions, targetUserId } = body;

    // Validazione input
    if (!type || !priority || !title || !message) {
      return NextResponse.json(
        { success: false, error: 'Campi obbligatori mancanti' },
        { status: 400 }
      );
    }

    // Determina l'userId target (può essere diverso dall'utente autenticato per admin)
    let userId = user.uid;
    
    // Solo admin possono creare notifiche per altri utenti
    if (targetUserId && targetUserId !== user.uid) {
      if (user.role !== 'ADMIN') {
        return NextResponse.json(
          { success: false, error: 'Non autorizzato a creare notifiche per altri utenti' },
          { status: 403 }
        );
      }
      userId = targetUserId;
    }

    const notification = await firebaseNotificationService.createNotification({
      userId,
      type,
      priority,
      title,
      message,
      data,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      actions
    });

    console.log('✅ [API] Notifica creata:', notification?.id, 'per utente:', userId);

    return NextResponse.json({
      success: true,
      notification,
      message: 'Notifica creata con successo'
    });

  } catch (error) {
    console.error('❌ [API] Errore creazione notifica:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Errore interno del server' 
      },
      { status: 500 }
    );
  }
});
