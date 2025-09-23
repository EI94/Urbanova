import { NextRequest, NextResponse } from 'next/server';
import { firebaseNotificationService } from '@/lib/firebaseNotificationService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const type = searchParams.get('type') as any;
    const priority = searchParams.get('priority') as any;

    // Validazione input
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID è obbligatorio' },
        { status: 400 }
      );
    }

    const notifications = await firebaseNotificationService.getNotifications(userId, {
      limit,
      unreadOnly,
      type,
      priority
    });

    console.log('✅ [API] Notifiche recuperate:', notifications.length);

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
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, priority, title, message, data, expiresAt, actions } = body;

    // Validazione input
    if (!userId || !type || !priority || !title || !message) {
      return NextResponse.json(
        { success: false, error: 'Campi obbligatori mancanti' },
        { status: 400 }
      );
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

    console.log('✅ [API] Notifica creata:', notification?.id);

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
}
