// API Route: Creazione SAL
import { NextRequest, NextResponse } from 'next/server';
import { salService } from '@/lib/salService';
import { zSALCreateRequest } from '@urbanova/types';

export async function POST(request: NextRequest) {
  try {
    console.log('📝 [SAL API] Richiesta creazione SAL');

    const body = await request.json();

    // Validazione input con Zod
    const validationResult = zSALCreateRequest.safeParse(body);

    if (!validationResult.success) {
      console.error('❌ [SAL API] Validazione fallita:', validationResult.error);
      return NextResponse.json(
        {
          success: false,
          message: 'Dati di input non validi',
          errors: validationResult.error.errors.map(e => e.message),
        },
        { status: 400 }
      );
    }

    const salRequest = validationResult.data;

    // Creazione SAL
    const result = await salService.create(salRequest);

    if (result.success) {
      console.log('✅ [SAL API] SAL creato con successo:', result.sal?.id);
      return NextResponse.json(result);
    } else {
      console.error('❌ [SAL API] Errore creazione SAL:', result.errors);
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('❌ [SAL API] Errore interno:', error);
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
