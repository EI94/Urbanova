import { z } from 'zod';

/**
 * Schema completo per le variabili d'ambiente Urbanova
 * 
 * Questo file è la SINGLE SOURCE OF TRUTH per tutte le variabili d'ambiente.
 * In produzione, se una variabile richiesta è mancante, l'app CRASHERÀ.
 * In sviluppo, verrà mostrato un banner per le variabili opzionali mancanti.
 */

export const zEnv = z.object({
  // ============================================================================
  // ENVIRONMENT & RUNTIME
  // ============================================================================
  NODE_ENV: z.enum(['development', 'test', 'production']),
  
  // ============================================================================
  // FIREBASE/FIRESTORE (REQUIRED)
  // ============================================================================
  FIREBASE_PROJECT_ID: z.string().min(1, 'FIREBASE_PROJECT_ID è richiesto'),
  FIREBASE_PRIVATE_KEY: z.string().min(1, 'FIREBASE_PRIVATE_KEY è richiesto'),
  FIREBASE_CLIENT_EMAIL: z.string().email('FIREBASE_CLIENT_EMAIL deve essere una email valida'),
  
  // ============================================================================
  // GOOGLE CLOUD STORAGE (REQUIRED)
  // ============================================================================
  GCS_BUCKET_MATERIALS: z.string().min(1, 'GCS_BUCKET_MATERIALS è richiesto'),
  GOOGLE_CLOUD_PROJECT_ID: z.string().min(1, 'GOOGLE_CLOUD_PROJECT_ID è richiesto'),
  GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY: z.string().min(1, 'GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY è richiesto'),
  
  // ============================================================================
  // TWILIO (REQUIRED)
  // ============================================================================
  TWILIO_ACCOUNT_SID: z.string().min(1, 'TWILIO_ACCOUNT_SID è richiesto'),
  TWILIO_AUTH_TOKEN: z.string().min(1, 'TWILIO_AUTH_TOKEN è richiesto'),
  TWILIO_PHONE_NUMBER: z.string().min(1, 'TWILIO_PHONE_NUMBER è richiesto'),
  
  // ============================================================================
  // STRIPE BILLING (OPTIONAL)
  // ============================================================================
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // ============================================================================
  // SENDGRID (OPTIONAL)
  // ============================================================================
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_INBOUND_SECRET: z.string().optional(),
  LEADS_INBOUND_PUBLIC_HOST: z.string().url('LEADS_INBOUND_PUBLIC_HOST deve essere un URL valido').optional(),
  
  // ============================================================================
  // CRON JOBS (REQUIRED)
  // ============================================================================
  CRON_SECRET: z.string().min(32, 'CRON_SECRET deve essere almeno 32 caratteri'),
  
  // ============================================================================
  // DOCUMENT UPLOAD (REQUIRED)
  // ============================================================================
  DOCUPLOAD_SECRET: z.string().min(32, 'DOCUPLOAD_SECRET deve essere almeno 32 caratteri'),
  
  // ============================================================================
  // LEADS SYSTEM (REQUIRED)
  // ============================================================================
  LEADS_INBOUND_SECRET: z.string().min(32, 'LEADS_INBOUND_SECRET deve essere almeno 32 caratteri'),
  
  // ============================================================================
  // WEBHOOK SECURITY (OPTIONAL)
  // ============================================================================
  ALLOW_UNVERIFIED_WEBHOOKS: z.enum(['true', 'false']).default('false'),
  
  // ============================================================================
  // MARKET DATA (OPTIONAL)
  // ============================================================================
  OMI_CSV_DIR: z.string().optional(),
  
  // ============================================================================
  // GMAIL API (OPTIONAL)
  // ============================================================================
  GMAIL_CLIENT_ID: z.string().optional(),
  GMAIL_CLIENT_SECRET: z.string().optional(),
  GMAIL_REFRESH_TOKEN: z.string().optional(),
  
  // ============================================================================
  // PORTAL CONNECTORS (OPTIONAL)
  // ============================================================================
  PORTAL_CONNECTORS_ENABLED: z.enum(['true', 'false']).default('false'),
  PORTAL_CONNECTORS_HEADLESS: z.enum(['true', 'false']).default('true'),
  
  // ============================================================================
  // APP CONFIGURATION (OPTIONAL)
  // ============================================================================
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL deve essere un URL valido').optional(),
  NEXT_PUBLIC_API_URL: z.string().url('NEXT_PUBLIC_API_URL deve essere un URL valido').optional(),
  
  // ============================================================================
  // SLACK ALERTS (OPTIONAL)
  // ============================================================================
  SLACK_WEBHOOK_URL: z.string().url('SLACK_WEBHOOK_URL deve essere un URL valido').optional(),
  
  // ============================================================================
  // PRODUCTION HARD GUARDS (OPTIONAL)
  // ============================================================================
  PRODUCTION_HARD_CONFIRM: z.enum(['true', 'false']).default('false'),
  KILL_SWITCH_SCRAPERS: z.enum(['true', 'false']).default('false'),
  KILL_SWITCH_EMAIL: z.enum(['true', 'false']).default('false'),
  KILL_SWITCH_WHATSAPP: z.enum(['true', 'false']).default('false'),
  KILL_SWITCH_STRIPE: z.enum(['true', 'false']).default('false'),
  
  // ============================================================================
  // RATE LIMITING (OPTIONAL)
  // ============================================================================
  RATE_LIMIT_PER_IP: z.string().regex(/^\d+$/, 'RATE_LIMIT_PER_IP deve essere un numero').optional(),
  RATE_LIMIT_PER_SENDER: z.string().regex(/^\d+$/, 'RATE_LIMIT_PER_SENDER deve essere un numero').optional(),
  
  // ============================================================================
  // DEVELOPMENT & TESTING (OPTIONAL)
  // ============================================================================
  DEBUG_MODE: z.enum(['true', 'false']).default('false'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

/**
 * Tipo TypeScript derivato dallo schema Zod
 */
export type Env = z.infer<typeof zEnv>;

/**
 * Parsing delle variabili d'ambiente con validazione Zod
 * 
 * In produzione, se una variabile richiesta è mancante, l'app CRASHERÀ.
 * In sviluppo, verrà mostrato un banner per le variabili opzionali mancanti.
 */
export const env = zEnv.parse(process.env);

/**
 * Utility per verificare se siamo in produzione
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Utility per verificare se siamo in sviluppo
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Utility per verificare se siamo in test
 */
export const isTest = env.NODE_ENV === 'test';

/**
 * Utility per verificare se una variabile opzionale è presente
 */
export function hasOptionalEnv(key: keyof Env): boolean {
  return env[key] !== undefined && env[key] !== '';
}

/**
 * Utility per ottenere una variabile opzionale con fallback
 */
export function getOptionalEnv<T extends keyof Env>(
  key: T, 
  fallback: Env[T]
): Env[T] {
  return hasOptionalEnv(key) ? env[key] : fallback;
}

/**
 * Lista delle variabili opzionali per il banner di sviluppo
 */
export const OPTIONAL_ENV_VARS = [
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
  'SLACK_WEBHOOK_URL',
  'PRODUCTION_HARD_CONFIRM',
  'KILL_SWITCH_SCRAPERS',
  'KILL_SWITCH_EMAIL',
  'KILL_SWITCH_WHATSAPP',
  'KILL_SWITCH_STRIPE',
  'RATE_LIMIT_PER_IP',
  'RATE_LIMIT_PER_SENDER',
] as const;

/**
 * Verifica quali variabili opzionali sono mancanti
 */
export function getMissingOptionalEnv(): string[] {
  return OPTIONAL_ENV_VARS.filter(key => !hasOptionalEnv(key));
}

/**
 * Verifica se tutte le variabili richieste sono presenti
 */
export function validateRequiredEnv(): boolean {
  try {
    zEnv.parse(process.env);
    return true;
  } catch (error) {
    if (isProduction) {
      console.error('❌ VARIABILI D\'AMBIENTE RICHIESTE MANCANTI IN PRODUZIONE:');
      console.error(error);
      process.exit(1); // CRASH IMMEDIATO IN PRODUZIONE
    }
    return false;
  }
}

// ============================================================================
// VALIDAZIONE IMMEDIATA ALL'IMPORT
// ============================================================================

if (isProduction) {
  // In produzione, valida immediatamente e crasha se necessario
  validateRequiredEnv();
  console.log('✅ Variabili d\'ambiente validate con successo');
} else {
  // In sviluppo, valida ma non crashare
  const isValid = validateRequiredEnv();
  if (!isValid) {
    console.warn('⚠️  Alcune variabili d\'ambiente richieste sono mancanti');
  }
}
