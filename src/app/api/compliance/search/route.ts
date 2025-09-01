import { NextRequest, NextResponse } from 'next/server';
import { complianceService } from '@/lib/complianceService';
import { zComplianceSearchRequest } from '@urbanova/types';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [Compliance API] Richiesta ricerca documenti');

    const body = await request.json();
    const validationResult = zComplianceSearchRequest.safeParse(body);

    if (!validationResult.success) {
      console.error('❌ [Compliance API] Validazione richiesta fallita:', validationResult.error);
      return NextResponse.json(
        {
          success: false,
          message: 'Dati di input non validi',
          errors: validationResult.error.errors.map((e: any) => e.message),
        },
        { status: 400 }
      );
    }

    const searchRequest = validationResult.data;
    const result = await complianceService.searchDocuments(searchRequest);

    if (result.success) {
      console.log('✅ [Compliance API] Ricerca completata');
      return NextResponse.json(result);
    } else {
      console.error('❌ [Compliance API] Errore ricerca:', result.message);
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('❌ [Compliance API] Errore interno ricerca:', error);
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
