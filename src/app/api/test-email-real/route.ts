import { NextRequest, NextResponse } from 'next/server';
import { robustEmailService } from '@/lib/robustEmailService';

export async function POST(request: NextRequest) {
  try {
    const { to, name, subject, message } = await request.json();
    
    console.log('🧪 TEST EMAIL REALE - Dati ricevuti:', { to, subject });
    
    // Validazione input
    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: 'Campi email, oggetto e messaggio sono obbligatori' },
        { status: 400 }
      );
    }
    
    // TEST INVIO EMAIL REALE CON VERIFICA DETTAGLIATA
    console.log('🔄 Test invio email reale con verifica dettagliata...');
    
    const emailResult = await robustEmailService.sendEmail({
      to,
      name,
      subject,
      message,
      reportTitle: 'Test Report Urbanova',
      reportUrl: 'https://urbanova.life'
    });
    
    console.log('📊 RISULTATO TEST EMAIL:', emailResult);
    
    if (emailResult.success) {
      console.log('✅ Test email riuscito tramite:', emailResult.provider);
      
      return NextResponse.json({
        success: true,
        message: `Test email riuscito! Provider utilizzato: ${emailResult.provider}`,
        data: {
          to,
          subject,
          provider: emailResult.provider,
          timestamp: new Date().toISOString(),
          details: emailResult.details,
          warning: 'VERIFICA CHE L\'EMAIL SIA ARRIVATA REALMENTE!'
        }
      });
    } else {
      console.error('❌ Test email fallito:', emailResult.error);
      
      return NextResponse.json({
        success: false,
        error: emailResult.message,
        details: emailResult.details,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Errore test invio email:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Errore durante il test di invio email',
        details: error instanceof Error ? error.message : 'Errore sconosciuto',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 TEST EMAIL REALE - Verifica servizi...');
    
    // TESTA TUTTI I SERVIZI EMAIL
    const testResults = await robustEmailService.testAllServices();
    
    console.log('📊 RISULTATI TEST COMPLETI:', testResults);
    
    // CALCOLA STATISTICHE
    const totalServices = Object.keys(testResults).length;
    const workingServices = Object.values(testResults).filter(Boolean).length;
    const successRate = ((workingServices / totalServices) * 100).toFixed(1);
    
    return NextResponse.json({
      success: true,
      message: `Test completato. ${workingServices}/${totalServices} servizi funzionanti (${successRate}%)`,
      data: {
        testResults,
        statistics: {
          totalServices,
          workingServices,
          successRate: `${successRate}%`,
          timestamp: new Date().toISOString()
        },
        workingServicesList: Object.entries(testResults)
          .filter(([_, working]) => working)
          .map(([service, _]) => service),
        failedServicesList: Object.entries(testResults)
          .filter(([_, working]) => !working)
          .map(([service, _]) => service),
        instructions: [
          '1. Usa POST per testare invio email reale',
          '2. Usa GET per testare tutti i servizi',
          '3. VERIFICA CHE LE EMAIL ARRIVINO REALMENTE!'
        ]
      }
    });
    
  } catch (error) {
    console.error('❌ Errore test servizi email:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Errore durante il test dei servizi email',
        details: error instanceof Error ? error.message : 'Errore sconosciuto',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
