import { NextRequest, NextResponse } from 'next/server';
import { workingEmailService } from '@/lib/workingEmailService';

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
      subject: '🧪 TEST Email Service - Urbanova',
      message: 'Questo è un test del servizio email Urbanova. Se ricevi questa email, il servizio funziona!',
      reportTitle: 'Test Report - Urbanova',
      reportUrl: 'https://urbanova.com/test'
    };

    const success = await workingEmailService.sendEmail(testData);

    if (success) {
      console.log('✅ Test email completato con successo');
      return NextResponse.json({
        success: true,
        message: 'Test email completato',
        data: {
          to,
          timestamp: new Date().toISOString(),
          note: `Controlla la casella email ${to} per verificare se è arrivata`,
          services: workingEmailService.getServiceInfo().services
        }
      });
    } else {
      throw new Error('Test email fallito');
    }

  } catch (error) {
    console.error('❌ Errore test email:', error);
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
      message: 'Test Email Service - Urbanova',
      data: {
        serviceInfo,
        timestamp: new Date().toISOString(),
        instructions: {
          test: 'POST con {"to": "email@example.com"}',
          note: 'Test semplice per verificare il funzionamento del servizio email'
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
