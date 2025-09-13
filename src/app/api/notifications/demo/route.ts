import { NextRequest, NextResponse } from 'next/server';
import { notificationDemoService } from '@/lib/notificationDemoService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type } = body;

    // Validazione input
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID è obbligatorio' },
        { status: 400 }
      );
    }

    if (type) {
      // Crea notifica specifica
      await notificationDemoService.createSpecificDemoNotifications(userId, type);
    } else {
      // Crea tutte le notifiche demo
      await notificationDemoService.createDemoNotifications(userId);
    }

    console.log('✅ [API] Notifiche demo create per:', userId);

    return NextResponse.json({
      success: true,
      message: 'Notifiche demo create con successo'
    });

  } catch (error) {
    console.error('❌ [API] Errore creazione notifiche demo:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Errore interno del server' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    // Validazione input
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID è obbligatorio' },
        { status: 400 }
      );
    }

    await notificationDemoService.clearDemoNotifications(userId);

    console.log('✅ [API] Notifiche demo pulite per:', userId);

    return NextResponse.json({
      success: true,
      message: 'Notifiche demo pulite con successo'
    });

  } catch (error) {
    console.error('❌ [API] Errore pulizia notifiche demo:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Errore interno del server' 
      },
      { status: 500 }
    );
  }
}
