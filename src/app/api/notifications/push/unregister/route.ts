import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedUser } from '@/lib/authMiddleware';
import { query, where, getDocs, updateDoc, doc, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * API per rimuovere un token FCM
 */
export const POST = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token FCM è obbligatorio' },
        { status: 400 }
      );
    }

    // Trova il token da rimuovere
    const tokenQuery = query(
      collection(db, 'deviceTokens'),
      where('userId', '==', user.uid),
      where('token', '==', token)
    );
    const tokens = await getDocs(tokenQuery);

    if (tokens.empty) {
      return NextResponse.json(
        { success: false, error: 'Token non trovato' },
        { status: 404 }
      );
    }

    // Marca il token come inattivo invece di eliminarlo
    for (const tokenDoc of tokens.docs) {
      await updateDoc(doc(db, 'deviceTokens', tokenDoc.id), {
        isActive: false,
        updatedAt: serverTimestamp(),
        unregisteredAt: serverTimestamp()
      });
    }

    console.log('✅ [PushUnregister] Token FCM rimosso:', tokens.docs.length);

    return NextResponse.json({
      success: true,
      message: 'Token FCM rimosso con successo'
    });

  } catch (error) {
    console.error('❌ [PushUnregister] Errore rimozione token:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Errore interno del server' 
      },
      { status: 500 }
    );
  }
});
