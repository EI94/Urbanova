import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedUser } from '@/lib/authMiddleware';
import { notificationPreferencesService } from '@/lib/notificationPreferencesService';

/**
 * API per gestire le preferenze notifiche utente
 */
export const GET = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const preferences = await notificationPreferencesService.getOrCreatePreferences(user.uid);

    return NextResponse.json({
      success: true,
      preferences
    });

  } catch (error) {
    console.error('❌ [API] Errore recupero preferenze notifiche:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Errore interno del server' 
      },
      { status: 500 }
    );
  }
});

export const PUT = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const body = await request.json();
    const { preferences } = body;

    if (!preferences) {
      return NextResponse.json(
        { success: false, error: 'Preferenze sono obbligatorie' },
        { status: 400 }
      );
    }

    const updatedPreferences = await notificationPreferencesService.updatePreferences(user.uid, preferences);

    if (!updatedPreferences) {
      return NextResponse.json(
        { success: false, error: 'Errore aggiornamento preferenze' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      preferences: updatedPreferences
    });

  } catch (error) {
    console.error('❌ [API] Errore aggiornamento preferenze notifiche:', error);
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
    const { action } = body;

    if (action === 'reset') {
      const success = await notificationPreferencesService.resetToDefaults(user.uid);
      
      if (!success) {
        return NextResponse.json(
          { success: false, error: 'Errore reset preferenze' },
          { status: 500 }
        );
      }

      const preferences = await notificationPreferencesService.getPreferences(user.uid);
      
      return NextResponse.json({
        success: true,
        message: 'Preferenze reset ai valori di default',
        preferences
      });
    }

    return NextResponse.json(
      { success: false, error: 'Azione non valida' },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ [API] Errore azione preferenze notifiche:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Errore interno del server' 
      },
      { status: 500 }
    );
  }
});
