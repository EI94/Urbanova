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

    // Test del servizio email
    const testData = {
      to,
      subject: '🧪 TEST Email Service - Urbanova',
      message: 'Questo è un test del servizio email Urbanova. Se ricevi questa email, il servizio funziona!',
      reportTitle: 'Test Report - Urbanova',
      reportUrl: 'https://urbanova.com/test'
    };

    console.log('🧪 Test email service con dati:', testData);

    const success = await workingEmailService.sendEmail(testData);
    const serviceInfo = workingEmailService.getServiceInfo();

    if (success) {
      console.log('✅ Test email completato con successo');
      return NextResponse.json({
        success: true,
        message: 'Test email completato',
        data: {
          to,
          timestamp: new Date().toISOString(),
          serviceInfo,
          note: 'Controlla la casella email per verificare se è arrivata'
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
      message: 'Informazioni servizio email',
      data: {
        serviceInfo,
        timestamp: new Date().toISOString(),
        note: 'Usa POST per testare l\'invio email'
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
