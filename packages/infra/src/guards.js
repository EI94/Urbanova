"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guards = exports.ActionContextSchema = exports.ActionTypeSchema = exports.GuardConfigSchema = void 0;
exports.withGuards = withGuards;
exports.createGuardMiddleware = createGuardMiddleware;
const zod_1 = require("zod");
/**
 * Sistema di Hard-Guards per Produzione Urbanova
 *
 * Questo sistema fornisce:
 * - Conferma obbligatoria per azioni con side-effect esterni
 * - Kill switch per tool specifici
 * - Rate limiting per IP e sender
 * - Validazione ambiente produzione
 */
// ============================================================================
// SCHEMA ZOD PER GUARDS
// ============================================================================
exports.GuardConfigSchema = zod_1.z.object({
    // Hard confirmation per azioni esterne
    productionHardConfirm: zod_1.z.boolean().default(false),
    // Kill switch per tool
    killSwitchScrapers: zod_1.z.boolean().default(false),
    killSwitchEmail: zod_1.z.boolean().default(false),
    killSwitchWhatsApp: zod_1.z.boolean().default(false),
    killSwitchStripe: zod_1.z.boolean().default(false),
    // Rate limiting
    rateLimitPerIP: zod_1.z.number().default(100), // richieste per minuto
    rateLimitPerSender: zod_1.z.number().default(50), // messaggi per minuto
    // Ambiente
    environment: zod_1.z.enum(['development', 'test', 'production']),
});
// ============================================================================
// TIPI PER AZIONI
// ============================================================================
exports.ActionTypeSchema = zod_1.z.enum([
    'scraper',
    'email',
    'whatsapp',
    'stripe',
    'database',
    'file_upload',
    'external_api',
    'webhook',
]);
exports.ActionContextSchema = zod_1.z.object({
    actionType: exports.ActionTypeSchema,
    userId: zod_1.z.string().optional(),
    projectId: zod_1.z.string().optional(),
    sessionId: zod_1.z.string().optional(),
    toolRunId: zod_1.z.string().optional(),
    ipAddress: zod_1.z.string().optional(),
    senderId: zod_1.z.string().optional(), // Per rate limiting chat
    requiresConfirmation: zod_1.z.boolean().default(false),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
// ============================================================================
// CONFIGURAZIONE GUARDS
// ============================================================================
class ProductionGuards {
    constructor() {
        this.rateLimitStore = new Map();
        this.confirmationStore = new Map();
        this.config = exports.GuardConfigSchema.parse({
            productionHardConfirm: process.env.PRODUCTION_HARD_CONFIRM === 'true',
            killSwitchScrapers: process.env.KILL_SWITCH_SCRAPERS === 'true',
            killSwitchEmail: process.env.KILL_SWITCH_EMAIL === 'true',
            killSwitchWhatsApp: process.env.KILL_SWITCH_WHATSAPP === 'true',
            killSwitchStripe: process.env.KILL_SWITCH_STRIPE === 'true',
            rateLimitPerIP: parseInt(process.env.RATE_LIMIT_PER_IP || '100'),
            rateLimitPerSender: parseInt(process.env.RATE_LIMIT_PER_SENDER || '50'),
            environment: process.env.NODE_ENV || 'development',
        });
    }
    // ============================================================================
    // KILL SWITCH CHECKS
    // ============================================================================
    checkKillSwitch(actionType) {
        switch (actionType) {
            case 'scraper':
                if (this.config.killSwitchScrapers) {
                    return {
                        allowed: false,
                        reason: 'Tool di scraping temporaneamente disabilitati per manutenzione. Riprova più tardi.',
                    };
                }
                break;
            case 'email':
                if (this.config.killSwitchEmail) {
                    return {
                        allowed: false,
                        reason: 'Invio email temporaneamente disabilitato per manutenzione. Riprova più tardi.',
                    };
                }
                break;
            case 'whatsapp':
                if (this.config.killSwitchWhatsApp) {
                    return {
                        allowed: false,
                        reason: 'Invio WhatsApp temporaneamente disabilitato per manutenzione. Riprova più tardi.',
                    };
                }
                break;
            case 'stripe':
                if (this.config.killSwitchStripe) {
                    return {
                        allowed: false,
                        reason: 'Pagamenti temporaneamente disabilitati per manutenzione. Riprova più tardi.',
                    };
                }
                break;
        }
        return { allowed: true };
    }
    // ============================================================================
    // RATE LIMITING
    // ============================================================================
    checkRateLimit(identifier, limit, windowMs = 60 * 1000) {
        const now = Date.now();
        const key = identifier;
        const current = this.rateLimitStore.get(key);
        if (!current || now > current.resetTime) {
            // Reset o nuovo identificatore
            this.rateLimitStore.set(key, {
                count: 1,
                resetTime: now + windowMs,
            });
            return {
                allowed: true,
                remaining: limit - 1,
                resetTime: now + windowMs,
            };
        }
        // Incrementa contatore
        current.count++;
        if (current.count > limit) {
            return {
                allowed: false,
                remaining: 0,
                resetTime: current.resetTime,
            };
        }
        return {
            allowed: true,
            remaining: limit - current.count,
            resetTime: current.resetTime,
        };
    }
    checkIPRateLimit(ipAddress) {
        return this.checkRateLimit(`ip:${ipAddress}`, this.config.rateLimitPerIP);
    }
    checkSenderRateLimit(senderId) {
        return this.checkRateLimit(`sender:${senderId}`, this.config.rateLimitPerSender);
    }
    // ============================================================================
    // HARD CONFIRMATION
    // ============================================================================
    requiresConfirmation(actionType) {
        if (!this.config.productionHardConfirm) {
            return false;
        }
        // In produzione, richiedi conferma per azioni con side-effect esterni
        const externalActions = [
            'scraper',
            'email',
            'whatsapp',
            'stripe',
            'external_api',
            'webhook',
        ];
        return externalActions.includes(actionType);
    }
    requestConfirmation(actionId, actionType, context) {
        if (!this.requiresConfirmation(actionType)) {
            return {
                confirmationId: actionId,
                requiresConfirmation: false,
            };
        }
        const confirmationId = `confirm_${actionId}_${Date.now()}`;
        this.confirmationStore.set(confirmationId, {
            confirmed: false,
            timestamp: Date.now(),
        });
        return {
            confirmationId,
            requiresConfirmation: true,
        };
    }
    confirmAction(confirmationId) {
        const confirmation = this.confirmationStore.get(confirmationId);
        if (!confirmation) {
            return {
                confirmed: false,
                reason: 'Conferma non trovata o scaduta',
            };
        }
        // Controlla se la conferma è scaduta (5 minuti)
        const now = Date.now();
        const maxAge = 5 * 60 * 1000; // 5 minuti
        if (now - confirmation.timestamp > maxAge) {
            this.confirmationStore.delete(confirmationId);
            return {
                confirmed: false,
                reason: 'Conferma scaduta',
            };
        }
        confirmation.confirmed = true;
        return { confirmed: true };
    }
    // ============================================================================
    // VALIDAZIONE COMPLETA
    // ============================================================================
    validateAction(context) {
        // 1. Controlla kill switch
        const killSwitchCheck = this.checkKillSwitch(context.actionType);
        if (!killSwitchCheck.allowed) {
            return {
                allowed: false,
                reason: killSwitchCheck.reason,
                requiresConfirmation: false,
            };
        }
        // 2. Controlla rate limiting IP
        if (context.ipAddress) {
            const ipRateLimit = this.checkIPRateLimit(context.ipAddress);
            if (!ipRateLimit.allowed) {
                return {
                    allowed: false,
                    reason: 'Rate limit IP superato. Riprova più tardi.',
                    requiresConfirmation: false,
                };
            }
        }
        // 3. Controlla rate limiting sender (per chat)
        let senderRateLimit;
        if (context.senderId) {
            senderRateLimit = this.checkSenderRateLimit(context.senderId);
            if (!senderRateLimit.allowed) {
                return {
                    allowed: false,
                    reason: 'Rate limit sender superato. Riprova più tardi.',
                    requiresConfirmation: false,
                };
            }
        }
        // 4. Controlla se richiede conferma
        const requiresConfirmation = this.requiresConfirmation(context.actionType);
        let confirmationId;
        if (requiresConfirmation) {
            const actionId = `${context.actionType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const confirmation = this.requestConfirmation(actionId, context.actionType, context);
            confirmationId = confirmation.confirmationId;
        }
        return {
            allowed: true,
            requiresConfirmation,
            confirmationId,
            rateLimitInfo: {
                ipRemaining: context.ipAddress ? this.checkIPRateLimit(context.ipAddress).remaining : 0,
                senderRemaining: context.senderId ? this.checkSenderRateLimit(context.senderId).remaining : undefined,
                resetTime: context.ipAddress ? this.checkIPRateLimit(context.ipAddress).resetTime : 0,
            },
        };
    }
    // ============================================================================
    // UTILITY METHODS
    // ============================================================================
    isProduction() {
        return this.config.environment === 'production';
    }
    getConfig() {
        return { ...this.config };
    }
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
    }
    // ============================================================================
    // CLEANUP
    // ============================================================================
    cleanup() {
        const now = Date.now();
        const maxAge = 5 * 60 * 1000; // 5 minuti
        // Pulisci conferme scadute
        for (const [key, value] of this.confirmationStore.entries()) {
            if (now - value.timestamp > maxAge) {
                this.confirmationStore.delete(key);
            }
        }
        // Pulisci rate limit scaduti
        for (const [key, value] of this.rateLimitStore.entries()) {
            if (now > value.resetTime) {
                this.rateLimitStore.delete(key);
            }
        }
    }
}
// ============================================================================
// INSTANCE GLOBALE
// ============================================================================
exports.guards = new ProductionGuards();
// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
/**
 * Wrapper per azioni che richiedono validazione
 */
async function withGuards(actionType, context, action) {
    const validation = exports.guards.validateAction(context);
    if (!validation.allowed) {
        throw new Error(validation.reason || 'Azione non consentita');
    }
    if (validation.requiresConfirmation && !validation.confirmationId) {
        throw new Error('Conferma richiesta ma non fornita');
    }
    if (validation.requiresConfirmation && validation.confirmationId) {
        const confirmation = exports.guards.confirmAction(validation.confirmationId);
        if (!confirmation.confirmed) {
            throw new Error(confirmation.reason || 'Conferma non valida');
        }
    }
    return await action();
}
/**
 * Middleware per API routes
 */
function createGuardMiddleware() {
    return (request, response, next) => {
        const ipAddress = request.ip || request.connection.remoteAddress;
        const rateLimit = exports.guards.checkIPRateLimit(ipAddress);
        if (!rateLimit.allowed) {
            return response.status(429).json({
                error: 'Rate limit exceeded',
                remaining: rateLimit.remaining,
                resetTime: rateLimit.resetTime,
            });
        }
        next();
    };
}
//# sourceMappingURL=guards.js.map