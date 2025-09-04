// API Route: Pagamento SAL
import { NextRequest, NextResponse } from 'next/server';
import { salService } from '@/lib/salService';
import { zSALPayRequest } from '@urbanova/types';

export async function POST(request: NextRequest) {
  try {
    console.log('💳 [SAL API] Richiesta pagamento SAL');

    const body = await request.json();

    // Validazione input con Zod
    const validationResult = zSALPayRequest.safeParse(body);

    if (!validationResult.success) {
      console.error('❌ [SAL API] Validazione pagamento fallita:', validationResult.error);
      return NextResponse.json(
        {
          success: false,
          message: 'Dati di input non validi',
          errors: validationResult.error.errors.map(e => e.message),
        },
        { status: 400 }
      );
    }

    const payRequest = validationResult.data;

    // Pagamento SAL
    const result = await salService.pay(payRequest as any);

    if (result.success) {
      console.log('✅ [SAL API] SAL pagato con successo:', payRequest.salId);
      return NextResponse.json(result);
    } else {
      console.error('❌ [SAL API] Errore pagamento SAL:', result.errors);
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('❌ [SAL API] Errore interno pagamento:', error);
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
