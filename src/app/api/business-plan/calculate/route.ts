/**
 * 🏦 API BUSINESS PLAN - CALCULATE
 * 
 * Endpoint per calcolo Business Plan completo con:
 * - Scenari multipli (Cash, Permuta, Pagamento Differito)
 * - Metriche finanziarie (VAN, TIR, Payback, DSCR, LTV, LTC)
 * - Cash Flow per periodi
 * - Leve di negoziazione
 * - Sensitivity Analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  businessPlanService, 
  BusinessPlanInput, 
  BusinessPlanOutput,
  SensitivityInput,
  ScenarioComparison
} from '@/lib/businessPlanService';

export async function POST(request: NextRequest) {
  try {
    console.log('📊 [API BusinessPlan] Richiesta calcolo Business Plan...');
    
    const body = await request.json();
    const { input, userId, includeSensitivity, compareScenarios } = body as {
      input: BusinessPlanInput;
      userId: string;
      includeSensitivity?: boolean;
      compareScenarios?: boolean;
    };
    
    // Validazione input dettagliata
    if (!input || !input.projectName) {
      return NextResponse.json(
        { 
          error: 'Dati progetto mancanti',
          details: 'Il nome del progetto è obbligatorio per calcolare il Business Plan',
          requiredFields: ['projectName']
        },
        { status: 400 }
      );
    }
    
    if (!input.totalUnits || input.totalUnits <= 0) {
      return NextResponse.json(
        { 
          error: 'Numero unità non valido',
          details: 'Il numero totale di unità deve essere maggiore di zero',
          requiredFields: ['totalUnits']
        },
        { status: 400 }
      );
    }
    
    if (!input.averagePrice || input.averagePrice <= 0) {
      return NextResponse.json(
        { 
          error: 'Prezzo medio non valido',
          details: 'Il prezzo medio per unità deve essere maggiore di zero',
          requiredFields: ['averagePrice']
        },
        { status: 400 }
      );
    }
    
    if (!input.landScenarios || input.landScenarios.length === 0) {
      return NextResponse.json(
        { 
          error: 'Scenari terreno mancanti',
          details: 'È necessario definire almeno uno scenario terreno (Cash, Permuta o Pagamento Differito)',
          requiredFields: ['landScenarios'],
          suggestion: 'Aggiungi uno scenario terreno nella sezione "Scenari Terreno" del form'
        },
        { status: 400 }
      );
    }
    
    if (!input.salesCalendar || input.salesCalendar.length === 0) {
      return NextResponse.json(
        { 
          error: 'Calendario vendite mancante',
          details: 'È necessario definire quando e quante unità vendere nel tempo',
          requiredFields: ['salesCalendar'],
          suggestion: 'Configura il calendario vendite nella sezione "Tempi" del form'
        },
        { status: 400 }
      );
    }
    
    const startTime = Date.now();
    
    // 1. Calcola Business Plan per tutti gli scenari
    console.log(`📊 [API BusinessPlan] Calcolo ${input.landScenarios.length} scenari...`);
    const outputs: BusinessPlanOutput[] = await businessPlanService.calculateBusinessPlan(input);
    
    // 2. Confronto scenari se richiesto
    let comparison: ScenarioComparison | undefined;
    if (compareScenarios && outputs.length > 1) {
      console.log('📊 [API BusinessPlan] Confronto scenari...');
      comparison = await businessPlanService.compareScenarios(outputs);
    }
    
    // 3. Sensitivity Analysis se richiesta
    let sensitivity = undefined;
    if (includeSensitivity && input.landScenarios.length > 0) {
      console.log('📊 [API BusinessPlan] Analisi sensitivity...');
      
      const sensitivityInput: SensitivityInput = {
        baseScenarioId: input.landScenarios[0].id,
        variables: {
          prices: [-15, -10, -5, 0, 5, 10, 15],
          costs: [-10, -5, 0, 5, 10, 15],
          interestRate: input.debt ? [
            input.debt.interestRate - 4,
            input.debt.interestRate - 2,
            input.debt.interestRate,
            input.debt.interestRate + 2,
            input.debt.interestRate + 4,
            input.debt.interestRate + 6
          ] : undefined,
          cashContribution: input.landScenarios[0].type === 'PERMUTA' 
            ? [0, 50000, 100000, 150000, 200000] 
            : undefined,
          deferredPayment: input.landScenarios[0].type === 'DEFERRED_PAYMENT'
            ? [200000, 250000, 300000, 350000, 400000]
            : undefined
        }
      };
      
      sensitivity = await businessPlanService.performSensitivityAnalysis(input, sensitivityInput);
    }
    
    // 4. Salvataggio rimosso - ora avviene dal frontend
    // Il salvataggio automatico è stato rimosso per evitare problemi di permessi Firebase
    // I Business Plan vengono salvati dal frontend dopo aver ricevuto i risultati
    
    const executionTime = Date.now() - startTime;
    
    console.log(`✅ [API BusinessPlan] Calcolo completato in ${executionTime}ms`);
    
    // Risposta completa (senza businessPlanId - salvataggio dal frontend)
    return NextResponse.json({
      success: true,
      outputs,
      comparison,
      sensitivity,
      metadata: {
        executionTime,
        scenariosCalculated: outputs.length,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ [API BusinessPlan] Errore:', error);
    
    return NextResponse.json(
      { 
        error: 'Errore calcolo Business Plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * 📖 GET: Carica Business Plan esistente
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessPlanId = searchParams.get('id');
    const projectId = searchParams.get('projectId');
    
    if (businessPlanId) {
      // Carica BP specifico
      console.log(`📖 [API BusinessPlan] Caricamento BP: ${businessPlanId}`);
      const data = await businessPlanService.loadBusinessPlan(businessPlanId);
      
      return NextResponse.json({
        success: true,
        ...data
      });
    }
    
    if (projectId) {
      // Lista BP per progetto
      console.log(`📖 [API BusinessPlan] Lista BP per progetto: ${projectId}`);
      const businessPlans = await businessPlanService.getBusinessPlansByProject(projectId);
      
      return NextResponse.json({
        success: true,
        businessPlans
      });
    }
    
    return NextResponse.json(
      { error: 'Parametro id o projectId richiesto' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('❌ [API BusinessPlan] Errore GET:', error);
    
    return NextResponse.json(
      { 
        error: 'Errore caricamento Business Plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

