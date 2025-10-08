import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedUser } from '@/lib/authMiddleware';
import { firebaseNotificationService } from '@/lib/firebaseNotificationService';

/**
 * API per pulire notifiche benvenuto duplicate per l'utente corrente
 */
export const POST = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    console.log('🧹 [API] Pulizia notifiche benvenuto duplicate per utente:', user.uid);
    
    await firebaseNotificationService.cleanupDuplicateWelcomeNotifications(user.uid);
    
    return NextResponse.json({
      success: true,
      message: 'Notifiche benvenuto duplicate pulite con successo'
    });

  } catch (error) {
    console.error('❌ [API] Errore pulizia notifiche benvenuto:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Errore interno del server' 
      },
      { status: 500 }
    );
  }
});

