import { NextRequest, NextResponse } from 'next/server';
import { simpleWorkingEmailService } from '@/lib/simpleWorkingEmailService';

export async function POST(request: NextRequest) {
  try {
    const { to } = await request.json();

    if (!to) {
      return NextResponse.json(
        { error: 'Email destinatario richiesta' },
        { status: 400 }
      );
    }

    console.log('🧪 TEST EMAIL SEMPLICE per:', to);

    const testData = {
      to,
      subject: '🧪 TEST Email Service Semplice - Urbanova',
      message: 'Questo è un test del servizio email semplice Urbanova. Se ricevi questa email, il servizio funziona!',
      reportTitle: 'Test Report - Urbanova',
      reportUrl: 'https://urbanova.com/test'
    };

    const success = await simpleWorkingEmailService.sendEmail(testData);

    if (success) {
      console.log('✅ Test email semplice completato con successo');
      return NextResponse.json({
        success: true,
        message: 'Test email semplice completato',
        data: {
          to,
          timestamp: new Date().toISOString(),
          note: `Controlla la casella email ${to} per verificare se è arrivata`,
          services: simpleWorkingEmailService.getServiceInfo().services
        }
      });
    } else {
      throw new Error('Test email semplice fallito');
    }

  } catch (error) {
    console.error('❌ Errore test email semplice:', error);
    return NextResponse.json(
      { error: 'Errore nel test email semplice' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const serviceInfo = simpleWorkingEmailService.getServiceInfo();
    
    return NextResponse.json({
      success: true,
      message: 'Test Email Service Semplice - Urbanova',
      data: {
        serviceInfo,
        timestamp: new Date().toISOString(),
        instructions: {
          test: 'POST con {"to": "email@example.com"}',
          note: 'Test semplice per verificare il funzionamento del servizio email semplice'
        }
      }
    });

  } catch (error) {
    console.error('❌ Errore recupero info servizio semplice:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero informazioni' },
      { status: 500 }
    );
  }
}
