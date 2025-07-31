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
    console.log('🔧 Configurazione Resend:', {
      apiKeyPresent: !!process.env.RESEND_API_KEY,
      apiKeyLength: process.env.RESEND_API_KEY?.length || 0,
      apiKeyStart: process.env.RESEND_API_KEY?.substring(0, 10) + '...' || 'N/A'
    });

    const testNotification = {
      to: email,
      subject: '🧪 Test Urbanova AI - Email Service',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🧪 Test Email Service</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Urbanova AI - Sistema di Notifiche</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">✅ Test Completato con Successo!</h2>
            
            <div style="background-color: #e8f5e8; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <h3 style="margin: 0 0 10px 0; color: #2e7d32;">🎉 Sistema Email Operativo</h3>
              <p style="margin: 0; color: #2e7d32;">
                Il sistema di notifiche email di Urbanova AI è configurato correttamente e funzionante.
              </p>
            </div>
            
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <h3 style="margin: 0 0 10px 0; color: #856404;">📋 Dettagli Test</h3>
              <ul style="margin: 0; color: #856404;">
                <li><strong>Timestamp:</strong> ${new Date().toLocaleString('it-IT')}</li>
                <li><strong>Servizio:</strong> Resend</li>
                <li><strong>Stato:</strong> Configurato e Operativo</li>
                <li><strong>Email Destinatario:</strong> ${email}</li>
              </ul>
            </div>
            
            <div style="background-color: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <h3 style="margin: 0 0 10px 0; color: #0c5460;">🚀 Prossimi Passi</h3>
              <p style="margin: 0; color: #0c5460;">
                Ora puoi utilizzare la funzionalità AI Land Scraping. Quando eseguirai una ricerca, 
                riceverai automaticamente i risultati via email con analisi AI dettagliate.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://www.urbanova.life/dashboard/land-scraping" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                🏠 Vai a Urbanova AI
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>Questo è un test automatico del sistema email di Urbanova AI</p>
            <p>Se non hai richiesto questo test, puoi ignorare questa email</p>
          </div>
        </div>
      `,
      lands: [],
      summary: {
        totalFound: 0,
        averagePrice: 0,
        bestOpportunities: []
      }
    };

    console.log('📧 Invio email di test...');
    await realEmailService.sendEmail(testNotification);
    console.log('✅ Email di test inviata con successo');

    return NextResponse.json({
      success: true,
      message: 'Email di test inviata con successo',
      email: email,
      timestamp: new Date().toISOString(),
      details: {
        service: 'Resend',
        status: 'Operativo',
        apiKeyConfigured: !!process.env.RESEND_API_KEY
      }
    });

  } catch (error) {
    console.error('❌ API Test Email: Errore:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'N/A');
    
    return NextResponse.json({
      success: false,
      error: 'Errore durante l\'invio email di test',
      message: error instanceof Error ? error.message : 'Errore sconosciuto',
      details: {
        service: 'Resend',
        status: 'Errore',
        apiKeyConfigured: !!process.env.RESEND_API_KEY,
        apiKeyLength: process.env.RESEND_API_KEY?.length || 0
      }
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test Email API - Utilizza POST per inviare email di test',
    endpoints: {
      POST: '/api/test-email - Invia email di test'
    },
    configuration: {
      resendConfigured: !!process.env.RESEND_API_KEY,
      apiKeyLength: process.env.RESEND_API_KEY?.length || 0
    }
  });
} 