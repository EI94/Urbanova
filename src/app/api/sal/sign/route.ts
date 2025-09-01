// API Route: Firma SAL
import { NextRequest, NextResponse } from 'next/server';
import { salService } from '@/lib/salService';
import { zSALSignRequest } from '@urbanova/types';

export async function POST(request: NextRequest) {
  try {
    console.log('✍️ [SAL API] Richiesta firma SAL');

    const body = await request.json();

    // Validazione input con Zod
    const validationResult = zSALSignRequest.safeParse(body);

    if (!validationResult.success) {
      console.error('❌ [SAL API] Validazione firma fallita:', validationResult.error);
      return NextResponse.json(
        {
          success: false,
          message: 'Dati di input non validi',
          errors: validationResult.error.errors.map(e => e.message),
        },
        { status: 400 }
      );
    }

    const signRequest = validationResult.data;

    // Firma SAL
    const result = await salService.sign(signRequest);

    if (result.success) {
      console.log('✅ [SAL API] SAL firmato con successo:', signRequest.salId);
      return NextResponse.json(result);
    } else {
      console.error('❌ [SAL API] Errore firma SAL:', result.errors);
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('❌ [SAL API] Errore interno firma:', error);
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
