import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Restituisce la configurazione email di default
    return NextResponse.json({
      success: true,
      email: 'pierpaolo.laurito@gmail.com',
      config: {
        smtp: {
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: false,
        },
        resend: {
          apiKey: process.env.RESEND_API_KEY ? 'configured' : 'missing',
        },
        sendgrid: {
          apiKey: process.env.SENDGRID_API_KEY ? 'configured' : 'missing',
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Errore nel caricamento configurazione email:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Errore nel caricamento configurazione email',
        email: 'pierpaolo.laurito@gmail.com' // Fallback
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'Metodo non supportato' },
    { status: 405 }
  );
}
