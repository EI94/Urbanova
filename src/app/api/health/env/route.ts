import { NextRequest, NextResponse } from 'next/server';

/**
 * Health check endpoint per le variabili d'ambiente
 * 
 * Questo endpoint:
 * - Verifica le variabili richieste
 * - Mostra le variabili opzionali mancanti
 * - Non crasha mai (solo per monitoring)
 */

export async function GET(request: NextRequest) {
  try {
    const env = process.env;
    const nodeEnv = env.NODE_ENV || 'unknown';
    
    // Variabili richieste (causano crash in produzione se mancanti)
    const requiredVars = [
      'FIREBASE_PROJECT_ID',
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_CLIENT_EMAIL',
      'GCS_BUCKET_MATERIALS',
      'GOOGLE_CLOUD_PROJECT_ID',
      'GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY',
      'TWILIO_ACCOUNT_SID',
      'TWILIO_AUTH_TOKEN',
      'TWILIO_PHONE_NUMBER',
      'CRON_SECRET',
      'DOCUPLOAD_SECRET',
      'LEADS_INBOUND_SECRET',
    ];
    
    // Variabili opzionali (mostrano banner in sviluppo se mancanti)
    const optionalVars = [
      'STRIPE_SECRET_KEY',
      'STRIPE_PUBLISHABLE_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'SENDGRID_API_KEY',
      'SENDGRID_INBOUND_SECRET',
      'LEADS_INBOUND_PUBLIC_HOST',
      'OMI_CSV_DIR',
      'GMAIL_CLIENT_ID',
      'GMAIL_CLIENT_SECRET',
      'GMAIL_REFRESH_TOKEN',
      'NEXT_PUBLIC_APP_URL',
      'NEXT_PUBLIC_API_URL',
    ];
    
    // Verifica variabili richieste
    const missingRequired = requiredVars.filter(key => !env[key] || env[key] === '');
    const presentRequired = requiredVars.filter(key => env[key] && env[key] !== '');
    
    // Verifica variabili opzionali
    const missingOptional = optionalVars.filter(key => !env[key] || env[key] === '');
    const presentOptional = optionalVars.filter(key => env[key] && env[key] !== '');
    
    // Calcola health score
    const requiredScore = (presentRequired.length / requiredVars.length) * 100;
    const optionalScore = (presentOptional.length / optionalVars.length) * 100;
    const overallScore = (requiredScore + optionalScore) / 2;
    
    // Determina status
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (missingRequired.length > 0) {
      status = 'critical';
    } else if (missingOptional.length > 0) {
      status = 'warning';
    }
    
    const response = {
      status,
      timestamp: new Date().toISOString(),
      environment: nodeEnv,
      scores: {
        required: Math.round(requiredScore),
        optional: Math.round(optionalScore),
        overall: Math.round(overallScore)
      },
      required: {
        total: requiredVars.length,
        present: presentRequired.length,
        missing: missingRequired.length,
        variables: {
          present: presentRequired,
          missing: missingRequired
        }
      },
      optional: {
        total: optionalVars.length,
        present: presentOptional.length,
        missing: missingOptional.length,
        variables: {
          present: presentOptional,
          missing: missingOptional
        }
      },
      recommendations: {
        critical: missingRequired.length > 0 ? [
          'Configura tutte le variabili REQUIRED per evitare crash in produzione',
          'Verifica FIREBASE_*, GCS_*, TWILIO_*, CRON_SECRET, DOCUPLOAD_SECRET, LEADS_INBOUND_SECRET'
        ] : [],
        warning: missingOptional.length > 0 ? [
          'Configura le variabili OPTIONAL per funzionalità complete',
          'In produzione non causeranno crash, ma alcune funzionalità potrebbero non funzionare'
        ] : [],
        info: [
          'Usa il banner di sviluppo per identificare variabili opzionali mancanti',
          'Verifica la documentazione in ENV_EXAMPLE.md per dettagli completi'
        ]
      }
    };
    
    // Log per debugging
    console.log(`🔍 Health check environment - Status: ${status}, Required: ${requiredScore}%, Optional: ${optionalScore}%`);
    
    if (missingRequired.length > 0) {
      console.error(`❌ Variabili REQUIRED mancanti: ${missingRequired.join(', ')}`);
    }
    
    if (missingOptional.length > 0) {
      console.warn(`⚠️  Variabili OPTIONAL mancanti: ${missingOptional.join(', ')}`);
    }
    
    // Ritorna status HTTP appropriato
    const statusCode = status === 'critical' ? 503 : status === 'warning' ? 200 : 200;
    
    return NextResponse.json(response, { status: statusCode });
    
  } catch (error) {
    console.error('❌ Errore health check environment:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Errore interno del server durante health check',
        details: error instanceof Error ? error.message : 'Errore sconosciuto'
      },
      { status: 500 }
    );
  }
}

// Endpoint per verificare solo le variabili opzionali
export async function POST(request: NextRequest) {
  try {
    const { checkType } = await request.json();
    
    if (checkType === 'optional') {
      const env = process.env;
      
      const optionalVars = [
        'STRIPE_SECRET_KEY',
        'SENDGRID_API_KEY',
        'GMAIL_CLIENT_ID',
      ];
      
      const missingOptional = optionalVars.filter(key => !env[key] || env[key] === '');
      
      return NextResponse.json({
        type: 'optional',
        missing: missingOptional,
        hasMissing: missingOptional.length > 0,
        timestamp: new Date().toISOString()
      });
    }
    
    return NextResponse.json(
      { error: 'Tipo di check non supportato' },
      { status: 400 }
    );
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Errore parsing request' },
      { status: 400 }
    );
  }
}
