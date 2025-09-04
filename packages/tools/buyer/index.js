"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuyerTool = exports.buyerActions = exports.buyerManifest = void 0;
const buyerTool_1 = require("./buyerTool");
Object.defineProperty(exports, "BuyerTool", { enumerable: true, get: function () { return buyerTool_1.BuyerTool; } });
/**
 * Buyer Tool Manifest
 *
 * Sistema Buyer Concierge completo:
 * - KYC con upload reali
 * - Appuntamenti con ICS
 * - Reminder automatici
 * - Privacy by design
 */
exports.buyerManifest = {
    id: 'buyer',
    name: 'Buyer Concierge',
    description: 'Sistema completo per gestione acquirente con KYC, appuntamenti ICS e reminder automatici',
    version: '1.0.0',
    category: 'automation',
    capabilities: [
        'kyc_collection',
        'document_upload',
        'appointment_scheduling',
        'ics_generation',
        'google_calendar_integration',
        'reminder_system',
        'whatsapp_integration',
        'email_integration',
        'privacy_management',
        'jwt_links',
        'retention_policies',
    ],
    features: [
        {
            name: 'KYC Collection',
            description: 'Raccolta documenti KYC con upload sicuri',
            enabled: true,
        },
        {
            name: 'Appointment Scheduling',
            description: 'Schedulazione appuntamenti con ICS',
            enabled: true,
        },
        {
            name: 'ICS Generation',
            description: 'Generazione file ICS RFC 5545',
            enabled: true,
        },
        {
            name: 'Google Calendar',
            description: 'Integrazione Google Calendar opzionale',
            enabled: true,
        },
        {
            name: 'Reminder System',
            description: 'Reminder automatici WhatsApp/Email',
            enabled: true,
        },
        {
            name: 'Privacy Management',
            description: 'Gestione privacy GDPR compliant',
            enabled: true,
        },
        {
            name: 'JWT Links',
            description: 'Link sicuri temporanei',
            enabled: true,
        },
    ],
    integrations: [
        {
            service: 'doc_hunter',
            description: 'Upload documenti KYC',
            status: 'integrated',
        },
        {
            service: 'google_calendar',
            description: 'Sincronizzazione calendario',
            status: 'integrated',
        },
        {
            service: 'twilio',
            description: 'WhatsApp e SMS',
            status: 'integrated',
        },
        {
            service: 'sendgrid',
            description: 'Email template',
            status: 'integrated',
        },
        {
            service: 'firestore',
            description: 'Persistenza dati',
            status: 'integrated',
        },
    ],
    security: {
        authentication: 'required',
        authorization: 'project_based',
        dataEncryption: 'enabled',
        auditLogging: 'enabled',
        privacyCompliance: 'gdpr',
    },
    compliance: {
        gdpr: 'compliant',
        dataRetention: 'configurable',
        accessControl: 'enabled',
        consentManagement: 'enabled',
    },
    performance: {
        responseTime: '< 1s',
        throughput: '1000 req/min',
        scalability: 'horizontal',
    },
    documentation: {
        api: 'https://docs.urbanova.com/buyer',
        examples: 'https://docs.urbanova.com/buyer/examples',
        tutorials: 'https://docs.urbanova.com/buyer/tutorials',
    },
    support: {
        email: 'buyer@urbanova.com',
        slack: '#buyer-support',
        documentation: 'https://docs.urbanova.com/buyer',
    },
};
/**
 * Buyer Actions
 */
exports.buyerActions = [
    {
        id: 'buyer.collect_kyc',
        name: 'Collect KYC',
        description: 'Raccoglie documenti KYC con link upload Doc Hunter',
        parameters: {
            projectId: {
                type: 'string',
                description: 'ID del progetto',
                required: true,
            },
            buyerId: {
                type: 'string',
                description: 'ID acquirente (opzionale, crea nuovo se non fornito)',
                required: false,
            },
            documentTypes: {
                type: 'array',
                description: 'Tipi di documento richiesti',
                required: true,
                items: {
                    type: 'string',
                },
            },
            options: {
                type: 'object',
                description: 'Opzioni KYC',
                required: false,
                properties: {
                    sendEmail: {
                        type: 'boolean',
                        description: 'Invia email con link upload',
                        default: true,
                    },
                    sendWhatsApp: {
                        type: 'boolean',
                        description: 'Invia WhatsApp con link upload',
                        default: true,
                    },
                    retentionDays: {
                        type: 'number',
                        description: 'Giorni retention link',
                        default: 7,
                    },
                },
            },
        },
        handler: async (params, context) => {
            const tool = new buyerTool_1.BuyerTool();
            return await tool.collectKYC(params.projectId, params.buyerId, params.documentTypes, params.options);
        },
    },
    {
        id: 'buyer.schedule_fittings',
        name: 'Schedule Fittings',
        description: 'Schedula appuntamenti finiture con ICS e Google Calendar',
        parameters: {
            buyerId: {
                type: 'string',
                description: 'ID acquirente',
                required: true,
            },
            when: {
                type: 'string',
                description: 'Data e ora appuntamento (ISO 8601)',
                required: true,
            },
            location: {
                type: 'object',
                description: 'Località appuntamento',
                required: true,
                properties: {
                    type: {
                        type: 'string',
                        description: 'Tipo località (physical, virtual, hybrid)',
                        enum: ['physical', 'virtual', 'hybrid'],
                    },
                    address: {
                        type: 'string',
                        description: 'Indirizzo fisico',
                    },
                    virtualUrl: {
                        type: 'string',
                        description: 'URL meeting virtuale',
                    },
                    instructions: {
                        type: 'string',
                        description: 'Istruzioni aggiuntive',
                    },
                },
            },
            type: {
                type: 'string',
                description: 'Tipo appuntamento',
                required: true,
                enum: ['fitting', 'visit', 'consultation'],
            },
            participants: {
                type: 'array',
                description: 'Partecipanti aggiuntivi',
                required: false,
                items: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            description: 'Nome partecipante',
                        },
                        email: {
                            type: 'string',
                            description: 'Email partecipante',
                        },
                        phone: {
                            type: 'string',
                            description: 'Telefono partecipante',
                        },
                        role: {
                            type: 'string',
                            description: 'Ruolo partecipante',
                        },
                    },
                },
            },
            reminders: {
                type: 'object',
                description: 'Configurazione reminder',
                required: false,
                properties: {
                    whatsapp: {
                        type: 'boolean',
                        description: 'Reminder WhatsApp',
                        default: true,
                    },
                    email: {
                        type: 'boolean',
                        description: 'Reminder email',
                        default: true,
                    },
                    sms: {
                        type: 'boolean',
                        description: 'Reminder SMS',
                        default: false,
                    },
                },
            },
            options: {
                type: 'object',
                description: 'Opzioni aggiuntive',
                required: false,
                properties: {
                    generateICS: {
                        type: 'boolean',
                        description: 'Genera file ICS',
                        default: true,
                    },
                    syncGoogleCalendar: {
                        type: 'boolean',
                        description: 'Sincronizza Google Calendar',
                        default: false,
                    },
                    sendConfirmation: {
                        type: 'boolean',
                        description: 'Invia conferma',
                        default: true,
                    },
                },
            },
        },
        handler: async (params, context) => {
            const tool = new buyerTool_1.BuyerTool();
            return await tool.scheduleFittings(params.buyerId, new Date(params.when), params.location, params.type, params.participants, params.reminders, params.options);
        },
    },
    {
        id: 'buyer.remind_payment',
        name: 'Remind Payment',
        description: 'Invia reminder pagamento con conferma',
        parameters: {
            buyerId: {
                type: 'string',
                description: 'ID acquirente',
                required: true,
            },
            milestone: {
                type: 'string',
                description: 'Milestone pagamento',
                required: true,
            },
            amount: {
                type: 'number',
                description: 'Importo da pagare',
                required: true,
            },
            dueDate: {
                type: 'string',
                description: 'Data scadenza (ISO 8601)',
                required: true,
            },
            options: {
                type: 'object',
                description: 'Opzioni reminder',
                required: false,
                properties: {
                    sendWhatsApp: {
                        type: 'boolean',
                        description: 'Invia WhatsApp',
                        default: true,
                    },
                    sendEmail: {
                        type: 'boolean',
                        description: 'Invia email',
                        default: true,
                    },
                    sendSMS: {
                        type: 'boolean',
                        description: 'Invia SMS',
                        default: false,
                    },
                    requireConfirmation: {
                        type: 'boolean',
                        description: 'Richiede conferma',
                        default: true,
                    },
                },
            },
        },
        handler: async (params, context) => {
            const tool = new buyerTool_1.BuyerTool();
            return await tool.remindPayment(params.buyerId, params.milestone, params.amount, new Date(params.dueDate), params.options);
        },
    },
    {
        id: 'buyer.get_buyer_info',
        name: 'Get Buyer Info',
        description: 'Ottieni informazioni acquirente',
        parameters: {
            buyerId: {
                type: 'string',
                description: 'ID acquirente',
                required: true,
            },
        },
        handler: async (params, context) => {
            const tool = new buyerTool_1.BuyerTool();
            return await tool.getBuyerInfo(params.buyerId);
        },
    },
    {
        id: 'buyer.list_appointments',
        name: 'List Appointments',
        description: 'Lista appuntamenti acquirente',
        parameters: {
            buyerId: {
                type: 'string',
                description: 'ID acquirente',
                required: true,
            },
            status: {
                type: 'string',
                description: 'Filtro status appuntamenti',
                required: false,
                enum: ['scheduled', 'confirmed', 'completed', 'cancelled'],
            },
            fromDate: {
                type: 'string',
                description: 'Data inizio filtro (ISO 8601)',
                required: false,
            },
            toDate: {
                type: 'string',
                description: 'Data fine filtro (ISO 8601)',
                required: false,
            },
        },
        handler: async (params, context) => {
            const tool = new buyerTool_1.BuyerTool();
            return await tool.listAppointments(params.buyerId, params.status, params.fromDate ? new Date(params.fromDate) : undefined, params.toDate ? new Date(params.toDate) : undefined);
        },
    },
    {
        id: 'buyer.generate_ics',
        name: 'Generate ICS',
        description: 'Genera file ICS per appuntamento',
        parameters: {
            appointmentId: {
                type: 'string',
                description: 'ID appuntamento',
                required: true,
            },
            options: {
                type: 'object',
                description: 'Opzioni ICS',
                required: false,
                properties: {
                    includeAttachments: {
                        type: 'boolean',
                        description: 'Includi allegati',
                        default: true,
                    },
                    includeRecurrence: {
                        type: 'boolean',
                        description: 'Includi ricorrenza',
                        default: false,
                    },
                    timezone: {
                        type: 'string',
                        description: 'Timezone',
                        default: 'Europe/Rome',
                    },
                },
            },
        },
        handler: async (params, context) => {
            const tool = new buyerTool_1.BuyerTool();
            return await tool.generateICS(params.appointmentId, params.options);
        },
    },
    {
        id: 'buyer.send_reminder',
        name: 'Send Reminder',
        description: 'Invia reminder manuale',
        parameters: {
            reminderId: {
                type: 'string',
                description: 'ID reminder',
                required: true,
            },
            channels: {
                type: 'array',
                description: 'Canali di invio',
                required: false,
                items: {
                    type: 'string',
                    enum: ['whatsapp', 'email', 'sms'],
                },
                default: ['whatsapp', 'email'],
            },
        },
        handler: async (params, context) => {
            const tool = new buyerTool_1.BuyerTool();
            return await tool.sendReminder(params.reminderId, params.channels);
        },
    },
    {
        id: 'buyer.update_privacy',
        name: 'Update Privacy',
        description: 'Aggiorna impostazioni privacy',
        parameters: {
            buyerId: {
                type: 'string',
                description: 'ID acquirente',
                required: true,
            },
            retentionPolicy: {
                type: 'object',
                description: 'Policy retention',
                required: false,
                properties: {
                    retentionPeriod: {
                        type: 'number',
                        description: 'Periodo retention (giorni)',
                    },
                    autoDelete: {
                        type: 'boolean',
                        description: 'Cancellazione automatica',
                    },
                    projectBased: {
                        type: 'boolean',
                        description: 'Retention basata su progetto',
                    },
                },
            },
            dataSubjectRights: {
                type: 'object',
                description: 'Diritti soggetto dati',
                required: false,
                properties: {
                    rightToAccess: {
                        type: 'boolean',
                        description: 'Diritto di accesso',
                    },
                    rightToRectification: {
                        type: 'boolean',
                        description: 'Diritto di rettifica',
                    },
                    rightToErasure: {
                        type: 'boolean',
                        description: "Diritto all'oblio",
                    },
                    rightToPortability: {
                        type: 'boolean',
                        description: 'Diritto alla portabilità',
                    },
                },
            },
        },
        handler: async (params, context) => {
            const tool = new buyerTool_1.BuyerTool();
            return await tool.updatePrivacy(params.buyerId, params.retentionPolicy, params.dataSubjectRights);
        },
    },
];
//# sourceMappingURL=index.js.map