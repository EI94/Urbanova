import { NextRequest, NextResponse } from 'next/server';
import { complianceService } from '@/lib/complianceService';
import { zComplianceIngestRequest } from '@urbanova/types';

export async function POST(request: NextRequest) {
  try {
    console.log('📥 [Compliance API] Richiesta ingestione documenti');

    const body = await request.json();

    // Pre-process dates from strings to Date objects
    if (body.documents) {
      body.documents = body.documents.map((doc: any) => ({
        ...doc,
        effectiveDate: doc.effectiveDate ? new Date(doc.effectiveDate) : undefined,
      }));
    }

    const validationResult = zComplianceIngestRequest.safeParse(body);

    if (!validationResult.success) {
      console.error('❌ [Compliance API] Validazione richiesta fallita:', validationResult.error);
      return NextResponse.json(
        {
          success: false,
          message: 'Dati di input non validi',
          errors: validationResult.error.errors.map(e => e.message),
        },
        { status: 400 }
      );
    }

    const ingestRequest = validationResult.data;
    const result = await complianceService.ingestDocuments(ingestRequest as any);

    if (result.success) {
      console.log('✅ [Compliance API] Documenti ingeriti con successo');
      return NextResponse.json(result);
    } else {
      console.error('❌ [Compliance API] Errore ingestione documenti:', result.errors);
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('❌ [Compliance API] Errore interno ingestione:', error);
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
