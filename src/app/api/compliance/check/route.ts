import { NextRequest, NextResponse } from 'next/server';
import { complianceService } from '@/lib/complianceService';
import { z } from 'zod';

// Schema di validazione per le richieste di compliance
const zComplianceCheckRequest = z.object({
  projectId: z.string().min(1, 'Project ID è richiesto'),
  checkType: z.enum(['building', 'environmental', 'safety', 'accessibility']),
  parameters: z.record(z.any()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [Compliance API] Richiesta controllo compliance');

    const body = await request.json();
    const validationResult = zComplianceCheckRequest.safeParse(body);

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

    const checkRequest = validationResult.data;
    const result = await complianceService.checkCompliance(checkRequest as any);

    if (result.success) {
      console.log('✅ [Compliance API] Controllo compliance completato');
      return NextResponse.json(result);
    } else {
      console.error('❌ [Compliance API] Errore controllo compliance:', result.message);
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('❌ [Compliance API] Errore interno controllo:', error);
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
