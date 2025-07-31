import { NextRequest, NextResponse } from 'next/server';
import { realEmailService } from '@/lib/realEmailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email richiesta per il test' 
      }, { status: 400 });
    }

    console.log('🧪 API Test Email: Avvio test per', email);

    // Test invio email
    const testNotification = {
      to: email,
      subject: '🧪 Test Urbanova AI - Email Service',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Test Email - Urbanova AI</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; text-align: center; font-size: 28px;">🧪 Urbanova AI</h1>
            <p style="color: white; text-align: center; margin: 10px 0 0 0; font-size: 16px;">
              Test Email Service
            </p>
          </div>
          
          <div style="background: #f9fafb; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
            <h2 style="margin: 0 0 16px 0; color: #1f2937;">✅ Test Completato</h2>
            <p style="margin: 0; color: #6b7280;">
              Questo è un test del servizio email di Urbanova AI. Se ricevi questa email, 
              significa che il sistema di invio email è configurato correttamente.
            </p>
          </div>
          
          <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px;">
            <h3 style="margin: 0 0 8px 0; color: #0c4a6e;">📧 Dettagli Test</h3>
            <ul style="margin: 0; padding-left: 20px; color: #0c4a6e;">
              <li>Servizio: Resend</li>
              <li>Mittente: onboarding@resend.dev</li>
              <li>Destinatario: ${email}</li>
              <li>Timestamp: ${new Date().toLocaleString('it-IT')}</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Test generato automaticamente da Urbanova AI<br>
              <a href="https://urbanova.life/dashboard" style="color: #3b82f6;">Accedi al Dashboard</a>
            </p>
          </div>
        </body>
        </html>
      `,
      lands: [],
      summary: {
        totalFound: 0,
        averagePrice: 0,
        bestOpportunities: []
      }
    };

    await realEmailService.sendEmail(testNotification);

    return NextResponse.json({ 
      success: true, 
      message: 'Email di test inviata con successo',
      email: email,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API Test Email: Errore:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Errore durante l\'invio email di test',
      message: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Test Email API - Utilizza POST per inviare email di test',
    endpoints: { 
      POST: '/api/test-email - Invia email di test' 
    }
  });
} 