import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Runtime Node.js per accesso completo a crypto
export const runtime = 'nodejs';

// Verifica firma Twilio
function verifyTwilioSignature(
  rawBody: string,
  signature: string,
  url: string,
  authToken: string
): boolean {
  try {
    // Calcola firma attesa
    const expectedSignature = crypto
      .createHmac('sha1', authToken)
      .update(Buffer.from(url + rawBody, 'utf8'))
      .digest('base64');

    // Confronta firme (timing-safe)
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'base64'),
      Buffer.from(expectedSignature, 'base64')
    );
  } catch (error) {
    console.error('Errore verifica firma Twilio:', error);
    return false;
  }
}

// Parsing form data Twilio
function parseTwilioFormData(rawBody: string): Record<string, string> {
  const params = new URLSearchParams(rawBody);
  const data: Record<string, string> = {};
  
  for (const [key, value] of params.entries()) {
    data[key] = value;
  }
  
  return data;
}

export async function POST(request: NextRequest) {
  try {
    console.log('📱 Webhook Twilio inbound ricevuto');
    
    // Leggi raw body e headers
    const rawBody = await request.text();
    const headers = request.headers;
    
    console.log('📋 Headers ricevuti:', Object.fromEntries(headers.entries()));
    console.log('📦 Raw body ricevuto:', rawBody);
    
    // Verifica firma Twilio
    const signature = headers.get('x-twilio-signature');
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (!signature || !authToken) {
      console.error('❌ Firma Twilio o auth token mancanti');
      return NextResponse.json(
        { error: 'Firma mancante o non valida' },
        { status: 401 }
      );
    }
    
    // Costruisci URL completo per verifica firma
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const host = request.headers.get('host') || request.headers.get('x-forwarded-host');
    const url = `${protocol}://${host}${request.nextUrl.pathname}`;
    
    console.log('🔗 URL per verifica firma:', url);
    
    // Verifica firma
    const isValidSignature = verifyTwilioSignature(
      rawBody,
      signature,
      url,
      authToken
    );
    
    if (!isValidSignature) {
      console.error('❌ Firma Twilio non valida');
      return NextResponse.json(
        { error: 'Firma non valida' },
        { status: 401 }
      );
    }
    
    console.log('✅ Firma Twilio verificata con successo');
    
    // Parsing form data
    const twilioData = parseTwilioFormData(rawBody);
    console.log('📊 Dati Twilio parsati:', twilioData);
    
    // Estrai informazioni principali
    const {
      From: from,
      To: to,
      Body: body,
      MessageSid: messageSid,
      AccountSid: accountSid,
      NumMedia: numMedia,
      MediaUrl0: mediaUrl,
      ...otherData
    } = twilioData;
    
    // Log informazioni messaggio
    console.log('📨 Messaggio da:', from);
    console.log('📨 Messaggio a:', to);
    console.log('📨 Contenuto:', body);
    console.log('📨 MessageSid:', messageSid);
    console.log('📨 Media presenti:', numMedia);
    
    // TODO: Processa messaggio e salva in database
    // TODO: Invia notifica al team
    // TODO: Aggiorna SLA se necessario
    
    // Risposta di successo a Twilio
    return NextResponse.json({
      success: true,
      message: 'Webhook processato con successo',
      timestamp: new Date().toISOString(),
      messageSid,
      from,
      to,
      bodyLength: body?.length || 0
    });
    
  } catch (error) {
    console.error('❌ Errore webhook Twilio:', error);
    
    return NextResponse.json(
      { 
        error: 'Errore interno del server',
        details: error instanceof Error ? error.message : 'Errore sconosciuto'
      },
      { status: 500 }
    );
  }
}

// Gestione metodo non supportato
export async function GET() {
  return NextResponse.json(
    { error: 'Metodo non supportato' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Metodo non supportato' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Metodo non supportato' },
    { status: 405 }
  );
}
