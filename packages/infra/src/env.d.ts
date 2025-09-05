import { z } from 'zod';
/**
 * Schema completo per le variabili d'ambiente Urbanova
 *
 * Questo file è la SINGLE SOURCE OF TRUTH per tutte le variabili d'ambiente.
 * In produzione, se una variabile richiesta è mancante, l'app CRASHERÀ.
 * In sviluppo, verrà mostrato un banner per le variabili opzionali mancanti.
 */
export declare const zEnv: z.ZodObject<{
    NODE_ENV: z.ZodEnum<["development", "test", "production"]>;
    FIREBASE_PROJECT_ID: z.ZodString;
    FIREBASE_PRIVATE_KEY: z.ZodString;
    FIREBASE_CLIENT_EMAIL: z.ZodString;
    GCS_BUCKET_MATERIALS: z.ZodString;
    GOOGLE_CLOUD_PROJECT_ID: z.ZodString;
    GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY: z.ZodString;
    TWILIO_ACCOUNT_SID: z.ZodString;
    TWILIO_AUTH_TOKEN: z.ZodString;
    TWILIO_PHONE_NUMBER: z.ZodString;
    STRIPE_SECRET_KEY: z.ZodOptional<z.ZodString>;
    STRIPE_PUBLISHABLE_KEY: z.ZodOptional<z.ZodString>;
    STRIPE_WEBHOOK_SECRET: z.ZodOptional<z.ZodString>;
    SENDGRID_API_KEY: z.ZodOptional<z.ZodString>;
    SENDGRID_INBOUND_SECRET: z.ZodOptional<z.ZodString>;
    LEADS_INBOUND_PUBLIC_HOST: z.ZodOptional<z.ZodString>;
    CRON_SECRET: z.ZodString;
    DOCUPLOAD_SECRET: z.ZodString;
    LEADS_INBOUND_SECRET: z.ZodString;
    ALLOW_UNVERIFIED_WEBHOOKS: z.ZodDefault<z.ZodEnum<["true", "false"]>>;
    OMI_CSV_DIR: z.ZodOptional<z.ZodString>;
    GMAIL_CLIENT_ID: z.ZodOptional<z.ZodString>;
    GMAIL_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
    GMAIL_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
    PORTAL_CONNECTORS_ENABLED: z.ZodDefault<z.ZodEnum<["true", "false"]>>;
    PORTAL_CONNECTORS_HEADLESS: z.ZodDefault<z.ZodEnum<["true", "false"]>>;
    NEXT_PUBLIC_APP_URL: z.ZodOptional<z.ZodString>;
    NEXT_PUBLIC_API_URL: z.ZodOptional<z.ZodString>;
    SLACK_WEBHOOK_URL: z.ZodOptional<z.ZodString>;
    PRODUCTION_HARD_CONFIRM: z.ZodDefault<z.ZodEnum<["true", "false"]>>;
    KILL_SWITCH_SCRAPERS: z.ZodDefault<z.ZodEnum<["true", "false"]>>;
    KILL_SWITCH_EMAIL: z.ZodDefault<z.ZodEnum<["true", "false"]>>;
    KILL_SWITCH_WHATSAPP: z.ZodDefault<z.ZodEnum<["true", "false"]>>;
    KILL_SWITCH_STRIPE: z.ZodDefault<z.ZodEnum<["true", "false"]>>;
    RATE_LIMIT_PER_IP: z.ZodOptional<z.ZodString>;
    RATE_LIMIT_PER_SENDER: z.ZodOptional<z.ZodString>;
    DEBUG_MODE: z.ZodDefault<z.ZodEnum<["true", "false"]>>;
    LOG_LEVEL: z.ZodDefault<z.ZodEnum<["error", "warn", "info", "debug"]>>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "test" | "production";
    FIREBASE_PROJECT_ID: string;
    FIREBASE_PRIVATE_KEY: string;
    FIREBASE_CLIENT_EMAIL: string;
    GCS_BUCKET_MATERIALS: string;
    GOOGLE_CLOUD_PROJECT_ID: string;
    GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY: string;
    TWILIO_ACCOUNT_SID: string;
    TWILIO_AUTH_TOKEN: string;
    TWILIO_PHONE_NUMBER: string;
    CRON_SECRET: string;
    DOCUPLOAD_SECRET: string;
    LEADS_INBOUND_SECRET: string;
    ALLOW_UNVERIFIED_WEBHOOKS: "true" | "false";
    PORTAL_CONNECTORS_ENABLED: "true" | "false";
    PORTAL_CONNECTORS_HEADLESS: "true" | "false";
    PRODUCTION_HARD_CONFIRM: "true" | "false";
    KILL_SWITCH_SCRAPERS: "true" | "false";
    KILL_SWITCH_EMAIL: "true" | "false";
    KILL_SWITCH_WHATSAPP: "true" | "false";
    KILL_SWITCH_STRIPE: "true" | "false";
    DEBUG_MODE: "true" | "false";
    LOG_LEVEL: "error" | "info" | "warn" | "debug";
    STRIPE_SECRET_KEY?: string | undefined;
    STRIPE_PUBLISHABLE_KEY?: string | undefined;
    STRIPE_WEBHOOK_SECRET?: string | undefined;
    SENDGRID_API_KEY?: string | undefined;
    SENDGRID_INBOUND_SECRET?: string | undefined;
    LEADS_INBOUND_PUBLIC_HOST?: string | undefined;
    OMI_CSV_DIR?: string | undefined;
    GMAIL_CLIENT_ID?: string | undefined;
    GMAIL_CLIENT_SECRET?: string | undefined;
    GMAIL_REFRESH_TOKEN?: string | undefined;
    NEXT_PUBLIC_APP_URL?: string | undefined;
    NEXT_PUBLIC_API_URL?: string | undefined;
    SLACK_WEBHOOK_URL?: string | undefined;
    RATE_LIMIT_PER_IP?: string | undefined;
    RATE_LIMIT_PER_SENDER?: string | undefined;
}, {
    NODE_ENV: "development" | "test" | "production";
    FIREBASE_PROJECT_ID: string;
    FIREBASE_PRIVATE_KEY: string;
    FIREBASE_CLIENT_EMAIL: string;
    GCS_BUCKET_MATERIALS: string;
    GOOGLE_CLOUD_PROJECT_ID: string;
    GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY: string;
    TWILIO_ACCOUNT_SID: string;
    TWILIO_AUTH_TOKEN: string;
    TWILIO_PHONE_NUMBER: string;
    CRON_SECRET: string;
    DOCUPLOAD_SECRET: string;
    LEADS_INBOUND_SECRET: string;
    STRIPE_SECRET_KEY?: string | undefined;
    STRIPE_PUBLISHABLE_KEY?: string | undefined;
    STRIPE_WEBHOOK_SECRET?: string | undefined;
    SENDGRID_API_KEY?: string | undefined;
    SENDGRID_INBOUND_SECRET?: string | undefined;
    LEADS_INBOUND_PUBLIC_HOST?: string | undefined;
    ALLOW_UNVERIFIED_WEBHOOKS?: "true" | "false" | undefined;
    OMI_CSV_DIR?: string | undefined;
    GMAIL_CLIENT_ID?: string | undefined;
    GMAIL_CLIENT_SECRET?: string | undefined;
    GMAIL_REFRESH_TOKEN?: string | undefined;
    PORTAL_CONNECTORS_ENABLED?: "true" | "false" | undefined;
    PORTAL_CONNECTORS_HEADLESS?: "true" | "false" | undefined;
    NEXT_PUBLIC_APP_URL?: string | undefined;
    NEXT_PUBLIC_API_URL?: string | undefined;
    SLACK_WEBHOOK_URL?: string | undefined;
    PRODUCTION_HARD_CONFIRM?: "true" | "false" | undefined;
    KILL_SWITCH_SCRAPERS?: "true" | "false" | undefined;
    KILL_SWITCH_EMAIL?: "true" | "false" | undefined;
    KILL_SWITCH_WHATSAPP?: "true" | "false" | undefined;
    KILL_SWITCH_STRIPE?: "true" | "false" | undefined;
    RATE_LIMIT_PER_IP?: string | undefined;
    RATE_LIMIT_PER_SENDER?: string | undefined;
    DEBUG_MODE?: "true" | "false" | undefined;
    LOG_LEVEL?: "error" | "info" | "warn" | "debug" | undefined;
}>;
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
export declare const env: {
    NODE_ENV: "development" | "test" | "production";
    FIREBASE_PROJECT_ID: string;
    FIREBASE_PRIVATE_KEY: string;
    FIREBASE_CLIENT_EMAIL: string;
    GCS_BUCKET_MATERIALS: string;
    GOOGLE_CLOUD_PROJECT_ID: string;
    GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY: string;
    TWILIO_ACCOUNT_SID: string;
    TWILIO_AUTH_TOKEN: string;
    TWILIO_PHONE_NUMBER: string;
    CRON_SECRET: string;
    DOCUPLOAD_SECRET: string;
    LEADS_INBOUND_SECRET: string;
    ALLOW_UNVERIFIED_WEBHOOKS: "true" | "false";
    PORTAL_CONNECTORS_ENABLED: "true" | "false";
    PORTAL_CONNECTORS_HEADLESS: "true" | "false";
    PRODUCTION_HARD_CONFIRM: "true" | "false";
    KILL_SWITCH_SCRAPERS: "true" | "false";
    KILL_SWITCH_EMAIL: "true" | "false";
    KILL_SWITCH_WHATSAPP: "true" | "false";
    KILL_SWITCH_STRIPE: "true" | "false";
    DEBUG_MODE: "true" | "false";
    LOG_LEVEL: "error" | "info" | "warn" | "debug";
    STRIPE_SECRET_KEY?: string | undefined;
    STRIPE_PUBLISHABLE_KEY?: string | undefined;
    STRIPE_WEBHOOK_SECRET?: string | undefined;
    SENDGRID_API_KEY?: string | undefined;
    SENDGRID_INBOUND_SECRET?: string | undefined;
    LEADS_INBOUND_PUBLIC_HOST?: string | undefined;
    OMI_CSV_DIR?: string | undefined;
    GMAIL_CLIENT_ID?: string | undefined;
    GMAIL_CLIENT_SECRET?: string | undefined;
    GMAIL_REFRESH_TOKEN?: string | undefined;
    NEXT_PUBLIC_APP_URL?: string | undefined;
    NEXT_PUBLIC_API_URL?: string | undefined;
    SLACK_WEBHOOK_URL?: string | undefined;
    RATE_LIMIT_PER_IP?: string | undefined;
    RATE_LIMIT_PER_SENDER?: string | undefined;
};
/**
 * Utility per verificare se siamo in produzione
 */
export declare const isProduction: boolean;
/**
 * Utility per verificare se siamo in sviluppo
 */
export declare const isDevelopment: boolean;
/**
 * Utility per verificare se siamo in test
 */
export declare const isTest: boolean;
/**
 * Utility per verificare se una variabile opzionale è presente
 */
export declare function hasOptionalEnv(key: keyof Env): boolean;
/**
 * Utility per ottenere una variabile opzionale con fallback
 */
export declare function getOptionalEnv<T extends keyof Env>(key: T, fallback: Env[T]): Env[T];
/**
 * Lista delle variabili opzionali per il banner di sviluppo
 */
export declare const OPTIONAL_ENV_VARS: readonly ["STRIPE_SECRET_KEY", "STRIPE_PUBLISHABLE_KEY", "STRIPE_WEBHOOK_SECRET", "SENDGRID_API_KEY", "SENDGRID_INBOUND_SECRET", "LEADS_INBOUND_PUBLIC_HOST", "OMI_CSV_DIR", "GMAIL_CLIENT_ID", "GMAIL_CLIENT_SECRET", "GMAIL_REFRESH_TOKEN", "NEXT_PUBLIC_APP_URL", "NEXT_PUBLIC_API_URL", "SLACK_WEBHOOK_URL", "PRODUCTION_HARD_CONFIRM", "KILL_SWITCH_SCRAPERS", "KILL_SWITCH_EMAIL", "KILL_SWITCH_WHATSAPP", "KILL_SWITCH_STRIPE", "RATE_LIMIT_PER_IP", "RATE_LIMIT_PER_SENDER"];
/**
 * Verifica quali variabili opzionali sono mancanti
 */
export declare function getMissingOptionalEnv(): string[];
/**
 * Verifica se tutte le variabili richieste sono presenti
 */
export declare function validateRequiredEnv(): boolean;
//# sourceMappingURL=env.d.ts.map