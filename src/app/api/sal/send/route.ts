// API Route: Invio SAL
import { NextRequest, NextResponse } from 'next/server';
import { salService } from '@/lib/salService';
import { zSALSendRequest } from '@urbanova/types';

export async function POST(request: NextRequest) {
  try {
    console.log('📤 [SAL API] Richiesta invio SAL');

    const body = await request.json();

    // Validazione input con Zod
    const validationResult = zSALSendRequest.safeParse(body);

    if (!validationResult.success) {
      console.error('❌ [SAL API] Validazione invio fallita:', validationResult.error);
      return NextResponse.json(
        {
          success: false,
          message: 'Dati di input non validi',
          errors: validationResult.error.errors.map(e => e.message),
        },
        { status: 400 }
      );
    }

    const sendRequest = validationResult.data;

    // Invio SAL
    const result = await salService.send(sendRequest);

    if (result.success) {
      console.log('✅ [SAL API] SAL inviato con successo:', sendRequest.salId);
      return NextResponse.json(result);
    } else {
      console.error('❌ [SAL API] Errore invio SAL:', result.errors);
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('❌ [SAL API] Errore interno invio:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Errore interno del server',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
