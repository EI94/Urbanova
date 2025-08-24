import { NextRequest, NextResponse } from 'next/server';
import { workingEmailService } from '@/lib/workingEmailService';

export async function POST(request: NextRequest) {
  try {
    const { to, testType = 'single' } = await request.json();

    if (!to) {
      return NextResponse.json(
        { error: 'Email destinatario richiesta' },
        { status: 400 }
      );
    }

    console.log('🔨 HAMMER TEST EMAIL INIZIATO per:', to);

    if (testType === 'hammer') {
      // HAMMER TEST: Invia 10 email di test
      const results = [];
      
      for (let i = 1; i <= 10; i++) {
        console.log(`🔨 HAMMER TEST #${i}/10...`);
        
        const testData = {
          to,
          subject: `🔨 HAMMER TEST #${i} - Urbanova Email Service`,
          message: `Questo è il test #${i} del servizio email Urbanova. Se ricevi questa email, il servizio funziona perfettamente!`,
          reportTitle: `Hammer Test Report #${i}`,
          reportUrl: `https://urbanova.com/hammer-test-${i}`
        };

        const success = await workingEmailService.sendEmail(testData);
        results.push({
          testNumber: i,
          success,
          timestamp: new Date().toISOString()
        });

        // Pausa tra le email per non sovraccaricare
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      console.log(`🔨 HAMMER TEST COMPLETATO: ${successCount} successi, ${failureCount} fallimenti`);

      return NextResponse.json({
        success: true,
        message: 'Hammer test completato',
        data: {
          totalTests: 10,
          successCount,
          failureCount,
          results,
          note: `Controlla la casella email ${to} per verificare quante email sono arrivate`
        }
      });

    } else {
      // TEST SINGOLO
      const testData = {
        to,
        subject: '🧪 TEST Email Service - Urbanova',
        message: 'Questo è un test del servizio email Urbanova. Se ricevi questa email, il servizio funziona!',
        reportTitle: 'Test Report - Urbanova',
        reportUrl: 'https://urbanova.com/test'
      };

      console.log('🧪 Test email singolo...');
      const success = await workingEmailService.sendEmail(testData);

      if (success) {
        console.log('✅ Test email singolo completato con successo');
        return NextResponse.json({
          success: true,
          message: 'Test email completato',
          data: {
            to,
            timestamp: new Date().toISOString(),
            note: `Controlla la casella email ${to} per verificare se è arrivata`
          }
        });
      } else {
        throw new Error('Test email fallito');
      }
    }

  } catch (error) {
    console.error('❌ Errore hammer test email:', error);
    return NextResponse.json(
      { error: 'Errore nel test email' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const serviceInfo = workingEmailService.getServiceInfo();
    
    return NextResponse.json({
      success: true,
      message: 'Informazioni servizio email per Hammer Test',
      data: {
        serviceInfo,
        timestamp: new Date().toISOString(),
        instructions: {
          singleTest: 'POST con {"to": "email@example.com", "testType": "single"}',
          hammerTest: 'POST con {"to": "email@example.com", "testType": "hammer"}',
          note: 'Hammer test invia 10 email di test per verificare affidabilità'
        }
      }
    });

  } catch (error) {
    console.error('❌ Errore recupero info servizio:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero informazioni' },
      { status: 500 }
    );
  }
}
