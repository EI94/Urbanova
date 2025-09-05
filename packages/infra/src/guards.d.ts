import { z } from 'zod';
/**
 * Sistema di Hard-Guards per Produzione Urbanova
 *
 * Questo sistema fornisce:
 * - Conferma obbligatoria per azioni con side-effect esterni
 * - Kill switch per tool specifici
 * - Rate limiting per IP e sender
 * - Validazione ambiente produzione
 */
export declare const GuardConfigSchema: z.ZodObject<{
    productionHardConfirm: z.ZodDefault<z.ZodBoolean>;
    killSwitchScrapers: z.ZodDefault<z.ZodBoolean>;
    killSwitchEmail: z.ZodDefault<z.ZodBoolean>;
    killSwitchWhatsApp: z.ZodDefault<z.ZodBoolean>;
    killSwitchStripe: z.ZodDefault<z.ZodBoolean>;
    rateLimitPerIP: z.ZodDefault<z.ZodNumber>;
    rateLimitPerSender: z.ZodDefault<z.ZodNumber>;
    environment: z.ZodEnum<["development", "test", "production"]>;
}, "strip", z.ZodTypeAny, {
    environment: "development" | "test" | "production";
    productionHardConfirm: boolean;
    killSwitchScrapers: boolean;
    killSwitchEmail: boolean;
    killSwitchWhatsApp: boolean;
    killSwitchStripe: boolean;
    rateLimitPerIP: number;
    rateLimitPerSender: number;
}, {
    environment: "development" | "test" | "production";
    productionHardConfirm?: boolean | undefined;
    killSwitchScrapers?: boolean | undefined;
    killSwitchEmail?: boolean | undefined;
    killSwitchWhatsApp?: boolean | undefined;
    killSwitchStripe?: boolean | undefined;
    rateLimitPerIP?: number | undefined;
    rateLimitPerSender?: number | undefined;
}>;
export type GuardConfig = z.infer<typeof GuardConfigSchema>;
export declare const ActionTypeSchema: z.ZodEnum<["scraper", "email", "whatsapp", "stripe", "database", "file_upload", "external_api", "webhook"]>;
export type ActionType = z.infer<typeof ActionTypeSchema>;
export declare const ActionContextSchema: z.ZodObject<{
    actionType: z.ZodEnum<["scraper", "email", "whatsapp", "stripe", "database", "file_upload", "external_api", "webhook"]>;
    userId: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodString>;
    sessionId: z.ZodOptional<z.ZodString>;
    toolRunId: z.ZodOptional<z.ZodString>;
    ipAddress: z.ZodOptional<z.ZodString>;
    senderId: z.ZodOptional<z.ZodString>;
    requiresConfirmation: z.ZodDefault<z.ZodBoolean>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    actionType: "email" | "whatsapp" | "scraper" | "stripe" | "database" | "file_upload" | "external_api" | "webhook";
    requiresConfirmation: boolean;
    ipAddress?: string | undefined;
    metadata?: Record<string, any> | undefined;
    projectId?: string | undefined;
    userId?: string | undefined;
    sessionId?: string | undefined;
    toolRunId?: string | undefined;
    senderId?: string | undefined;
}, {
    actionType: "email" | "whatsapp" | "scraper" | "stripe" | "database" | "file_upload" | "external_api" | "webhook";
    ipAddress?: string | undefined;
    metadata?: Record<string, any> | undefined;
    projectId?: string | undefined;
    userId?: string | undefined;
    sessionId?: string | undefined;
    toolRunId?: string | undefined;
    senderId?: string | undefined;
    requiresConfirmation?: boolean | undefined;
}>;
export type ActionContext = z.infer<typeof ActionContextSchema>;
declare class ProductionGuards {
    private config;
    private rateLimitStore;
    private confirmationStore;
    constructor();
    checkKillSwitch(actionType: ActionType): {
        allowed: boolean;
        reason?: string;
    };
    checkRateLimit(identifier: string, limit: number, windowMs?: number): {
        allowed: boolean;
        remaining: number;
        resetTime: number;
    };
    checkIPRateLimit(ipAddress: string): {
        allowed: boolean;
        remaining: number;
        resetTime: number;
    };
    checkSenderRateLimit(senderId: string): {
        allowed: boolean;
        remaining: number;
        resetTime: number;
    };
    requiresConfirmation(actionType: ActionType): boolean;
    requestConfirmation(actionId: string, actionType: ActionType, context: ActionContext): {
        confirmationId: string;
        requiresConfirmation: boolean;
    };
    confirmAction(confirmationId: string): {
        confirmed: boolean;
        reason?: string;
    };
    validateAction(context: ActionContext): {
        allowed: boolean;
        reason?: string;
        requiresConfirmation: boolean;
        confirmationId?: string;
        rateLimitInfo?: {
            ipRemaining: number;
            senderRemaining?: number;
            resetTime: number;
        };
    };
    isProduction(): boolean;
    getConfig(): GuardConfig;
    updateConfig(updates: Partial<GuardConfig>): void;
    cleanup(): void;
}
export declare const guards: ProductionGuards;
/**
 * Wrapper per azioni che richiedono validazione
 */
export declare function withGuards<T>(actionType: ActionType, context: ActionContext, action: () => Promise<T>): Promise<T>;
/**
 * Middleware per API routes
 */
export declare function createGuardMiddleware(): (request: any, response: any, next: any) => any;
export {};
//# sourceMappingURL=guards.d.ts.map