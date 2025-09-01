import { NextRequest, NextResponse } from 'next/server';
import { VendorQuestionnaireService } from '@urbanova/agents/src/vendor/questionnaire';
import { ProjectFactsIngestionService } from '@urbanova/agents/src/vendor/ingestion';

export async function POST(request: NextRequest) {
  try {
    const { token, answers } = await request.json();

    if (!token || !answers) {
      return NextResponse.json({ error: 'Token e risposte richiesti' }, { status: 400 });
    }

    const questionnaireService = new VendorQuestionnaireService();
    const ingestionService = new ProjectFactsIngestionService();

    // Salva risposte
    const saveResult = await questionnaireService.saveAnswers(token, answers);

    if (!saveResult.success || !saveResult.questionnaire) {
      return NextResponse.json({ error: 'Errore nel salvataggio delle risposte' }, { status: 400 });
    }

    // Ingerisce risposte nei Project Facts
    const ingestionResult = await ingestionService.ingestQuestionnaireAnswers(
      saveResult.questionnaire,
      'vendor_questionnaire'
    );

    return NextResponse.json({
      success: true,
      message: 'Questionario completato con successo',
      questionnaireId: saveResult.questionnaire.id,
      projectId: saveResult.questionnaire.projectId,
      changesApplied: ingestionResult.changes.length,
      requirementsCompletion: await ingestionService.calculateRequirementsCompletion(
        saveResult.questionnaire.projectId
      ),
    });
  } catch (error) {
    console.error('Error submitting answers:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
