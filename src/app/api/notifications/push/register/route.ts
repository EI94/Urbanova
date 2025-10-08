import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedUser } from '@/lib/authMiddleware';
import { addDoc, collection, doc, updateDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * API per registrare un token FCM per le notifiche push
 */
export const POST = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const body = await request.json();
    const { token, deviceType = 'web', deviceInfo } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token FCM è obbligatorio' },
        { status: 400 }
      );
    }

    // Verifica se il token esiste già
    const existingTokenQuery = query(
      collection(db, 'deviceTokens'),
      where('userId', '==', user.uid),
      where('token', '==', token)
    );
    const existingTokens = await getDocs(existingTokenQuery);

    if (!existingTokens.empty) {
      // Aggiorna il token esistente
      const existingToken = existingTokens.docs[0];
      await updateDoc(doc(db, 'deviceTokens', existingToken.id), {
        isActive: true,
        lastUsed: serverTimestamp(),
        deviceInfo: deviceInfo || existingToken.data().deviceInfo,
        updatedAt: serverTimestamp()
      });

      console.log('✅ [PushRegister] Token FCM aggiornato:', existingToken.id);
    } else {
      // Crea nuovo token
      const tokenData = {
        userId: user.uid,
        token,
        deviceType,
        deviceInfo: deviceInfo || {},
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastUsed: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'deviceTokens'), tokenData);
      console.log('✅ [PushRegister] Nuovo token FCM registrato:', docRef.id);
    }

    return NextResponse.json({
      success: true,
      message: 'Token FCM registrato con successo'
    });

  } catch (error) {
    console.error('❌ [PushRegister] Errore registrazione token:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Errore interno del server' 
      },
      { status: 500 }
    );
  }
});
