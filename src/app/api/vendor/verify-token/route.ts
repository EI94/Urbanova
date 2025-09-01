import { NextRequest, NextResponse } from 'next/server';
import { VendorQuestionnaireService } from '@urbanova/agents/src/vendor/questionnaire';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token richiesto' }, { status: 400 });
    }

    const questionnaireService = new VendorQuestionnaireService();
    const questionnaire = await questionnaireService.getQuestionnaireByToken(token);

    if (!questionnaire) {
      return NextResponse.json({ error: 'Token non valido o scaduto' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      questionnaire: {
        id: questionnaire.id,
        projectId: questionnaire.projectId,
        vendorContact: questionnaire.vendorContact,
        status: questionnaire.status,
        expiresAt: questionnaire.expiresAt,
        createdAt: questionnaire.createdAt,
      },
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
