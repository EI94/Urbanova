"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPTIONAL_ENV_VARS = exports.isTest = exports.isDevelopment = exports.isProduction = exports.env = exports.zEnv = void 0;
exports.hasOptionalEnv = hasOptionalEnv;
exports.getOptionalEnv = getOptionalEnv;
exports.getMissingOptionalEnv = getMissingOptionalEnv;
exports.validateRequiredEnv = validateRequiredEnv;
const zod_1 = require("zod");
/**
 * Schema completo per le variabili d'ambiente Urbanova
 *
 * Questo file è la SINGLE SOURCE OF TRUTH per tutte le variabili d'ambiente.
 * In produzione, se una variabile richiesta è mancante, l'app CRASHERÀ.
 * In sviluppo, verrà mostrato un banner per le variabili opzionali mancanti.
 */
exports.zEnv = zod_1.z.object({
    // ============================================================================
    // ENVIRONMENT & RUNTIME
    // ============================================================================
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']),
    // ============================================================================
    // FIREBASE/FIRESTORE (REQUIRED)
    // ============================================================================
    FIREBASE_PROJECT_ID: zod_1.z.string().min(1, 'FIREBASE_PROJECT_ID è richiesto'),
    FIREBASE_PRIVATE_KEY: zod_1.z.string().min(1, 'FIREBASE_PRIVATE_KEY è richiesto'),
    FIREBASE_CLIENT_EMAIL: zod_1.z.string().email('FIREBASE_CLIENT_EMAIL deve essere una email valida'),
    // ============================================================================
    // GOOGLE CLOUD STORAGE (REQUIRED)
    // ============================================================================
    GCS_BUCKET_MATERIALS: zod_1.z.string().min(1, 'GCS_BUCKET_MATERIALS è richiesto'),
    GOOGLE_CLOUD_PROJECT_ID: zod_1.z.string().min(1, 'GOOGLE_CLOUD_PROJECT_ID è richiesto'),
    GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY: zod_1.z.string().min(1, 'GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY è richiesto'),
    // ============================================================================
    // TWILIO (REQUIRED)
    // ============================================================================
    TWILIO_ACCOUNT_SID: zod_1.z.string().min(1, 'TWILIO_ACCOUNT_SID è richiesto'),
    TWILIO_AUTH_TOKEN: zod_1.z.string().min(1, 'TWILIO_AUTH_TOKEN è richiesto'),
    TWILIO_PHONE_NUMBER: zod_1.z.string().min(1, 'TWILIO_PHONE_NUMBER è richiesto'),
    // ============================================================================
    // STRIPE BILLING (OPTIONAL)
    // ============================================================================
    STRIPE_SECRET_KEY: zod_1.z.string().optional(),
    STRIPE_PUBLISHABLE_KEY: zod_1.z.string().optional(),
    STRIPE_WEBHOOK_SECRET: zod_1.z.string().optional(),
    // ============================================================================
    // SENDGRID (OPTIONAL)
    // ============================================================================
    SENDGRID_API_KEY: zod_1.z.string().optional(),
    SENDGRID_INBOUND_SECRET: zod_1.z.string().optional(),
    LEADS_INBOUND_PUBLIC_HOST: zod_1.z.string().url('LEADS_INBOUND_PUBLIC_HOST deve essere un URL valido').optional(),
    // ============================================================================
    // CRON JOBS (REQUIRED)
    // ============================================================================
    CRON_SECRET: zod_1.z.string().min(32, 'CRON_SECRET deve essere almeno 32 caratteri'),
    // ============================================================================
    // DOCUMENT UPLOAD (REQUIRED)
    // ============================================================================
    DOCUPLOAD_SECRET: zod_1.z.string().min(32, 'DOCUPLOAD_SECRET deve essere almeno 32 caratteri'),
    // ============================================================================
    // LEADS SYSTEM (REQUIRED)
    // ============================================================================
    LEADS_INBOUND_SECRET: zod_1.z.string().min(32, 'LEADS_INBOUND_SECRET deve essere almeno 32 caratteri'),
    // ============================================================================
    // WEBHOOK SECURITY (OPTIONAL)
    // ============================================================================
    ALLOW_UNVERIFIED_WEBHOOKS: zod_1.z.enum(['true', 'false']).default('false'),
    // ============================================================================
    // MARKET DATA (OPTIONAL)
    // ============================================================================
    OMI_CSV_DIR: zod_1.z.string().optional(),
    // ============================================================================
    // GMAIL API (OPTIONAL)
    // ============================================================================
    GMAIL_CLIENT_ID: zod_1.z.string().optional(),
    GMAIL_CLIENT_SECRET: zod_1.z.string().optional(),
    GMAIL_REFRESH_TOKEN: zod_1.z.string().optional(),
    // ============================================================================
    // PORTAL CONNECTORS (OPTIONAL)
    // ============================================================================
    PORTAL_CONNECTORS_ENABLED: zod_1.z.enum(['true', 'false']).default('false'),
    PORTAL_CONNECTORS_HEADLESS: zod_1.z.enum(['true', 'false']).default('true'),
    // ============================================================================
    // APP CONFIGURATION (OPTIONAL)
    // ============================================================================
    NEXT_PUBLIC_APP_URL: zod_1.z.string().url('NEXT_PUBLIC_APP_URL deve essere un URL valido').optional(),
    NEXT_PUBLIC_API_URL: zod_1.z.string().url('NEXT_PUBLIC_API_URL deve essere un URL valido').optional(),
    // ============================================================================
    // SLACK ALERTS (OPTIONAL)
    // ============================================================================
    SLACK_WEBHOOK_URL: zod_1.z.string().url('SLACK_WEBHOOK_URL deve essere un URL valido').optional(),
    // ============================================================================
    // PRODUCTION HARD GUARDS (OPTIONAL)
    // ============================================================================
    PRODUCTION_HARD_CONFIRM: zod_1.z.enum(['true', 'false']).default('false'),
    KILL_SWITCH_SCRAPERS: zod_1.z.enum(['true', 'false']).default('false'),
    KILL_SWITCH_EMAIL: zod_1.z.enum(['true', 'false']).default('false'),
    KILL_SWITCH_WHATSAPP: zod_1.z.enum(['true', 'false']).default('false'),
    KILL_SWITCH_STRIPE: zod_1.z.enum(['true', 'false']).default('false'),
    // ============================================================================
    // RATE LIMITING (OPTIONAL)
    // ============================================================================
    RATE_LIMIT_PER_IP: zod_1.z.string().regex(/^\d+$/, 'RATE_LIMIT_PER_IP deve essere un numero').optional(),
    RATE_LIMIT_PER_SENDER: zod_1.z.string().regex(/^\d+$/, 'RATE_LIMIT_PER_SENDER deve essere un numero').optional(),
    // ============================================================================
    // DEVELOPMENT & TESTING (OPTIONAL)
    // ============================================================================
    DEBUG_MODE: zod_1.z.enum(['true', 'false']).default('false'),
    LOG_LEVEL: zod_1.z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});
/**
 * Parsing delle variabili d'ambiente con validazione Zod
 *
 * In produzione, se una variabile richiesta è mancante, l'app CRASHERÀ.
 * In sviluppo, verrà mostrato un banner per le variabili opzionali mancanti.
 */
exports.env = exports.zEnv.parse(process.env);
/**
 * Utility per verificare se siamo in produzione
 */
exports.isProduction = exports.env.NODE_ENV === 'production';
/**
 * Utility per verificare se siamo in sviluppo
 */
exports.isDevelopment = exports.env.NODE_ENV === 'development';
/**
 * Utility per verificare se siamo in test
 */
exports.isTest = exports.env.NODE_ENV === 'test';
/**
 * Utility per verificare se una variabile opzionale è presente
 */
function hasOptionalEnv(key) {
    return exports.env[key] !== undefined && exports.env[key] !== '';
}
/**
 * Utility per ottenere una variabile opzionale con fallback
 */
function getOptionalEnv(key, fallback) {
    return hasOptionalEnv(key) ? exports.env[key] : fallback;
}
/**
 * Lista delle variabili opzionali per il banner di sviluppo
 */
exports.OPTIONAL_ENV_VARS = [
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
];
/**
 * Verifica quali variabili opzionali sono mancanti
 */
function getMissingOptionalEnv() {
    return exports.OPTIONAL_ENV_VARS.filter(key => !hasOptionalEnv(key));
}
/**
 * Verifica se tutte le variabili richieste sono presenti
 */
function validateRequiredEnv() {
    try {
        exports.zEnv.parse(process.env);
        return true;
    }
    catch (error) {
        if (exports.isProduction) {
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
if (exports.isProduction) {
    // In produzione, valida immediatamente e crasha se necessario
    validateRequiredEnv();
    console.log('✅ Variabili d\'ambiente validate con successo');
}
else {
    // In sviluppo, valida ma non crashare
    const isValid = validateRequiredEnv();
    if (!isValid) {
        console.warn('⚠️  Alcune variabili d\'ambiente richieste sono mancanti');
    }
}
//# sourceMappingURL=env.js.map