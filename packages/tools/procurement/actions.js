"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.procurementActions = void 0;
/**
 * Azioni Procurement per Urbanova OS
 *
 * Integra completamente con:
 * - Doc Hunter per pre-check
 * - GCS per storage
 * - PDF generator per report
 * - Scoring engine con outlier detection
 */
exports.procurementActions = [
    {
        name: 'procurement.create_rdo',
        description: 'Crea Richiesta di Offerta (RDO) con inviti vendor sicuri e link JWT',
        parameters: {
            type: 'object',
            properties: {
                projectId: {
                    type: 'string',
                    description: "ID del progetto associato all'RDO",
                },
                title: {
                    type: 'string',
                    description: 'Titolo dell\'RDO (es: "Cappotto termico 1.500 mq")',
                },
                deadlineDays: {
                    type: 'number',
                    description: "Giorni per la scadenza dell'RDO",
                },
                invitedVendors: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Lista degli ID vendor da invitare',
                },
                lines: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            description: { type: 'string' },
                            quantity: { type: 'number' },
                            unit: { type: 'string' },
                            specifications: { type: 'string' },
                            requirements: {
                                type: 'array',
                                items: { type: 'string' },
                            },
                        },
                    },
                    description: "Linee dell'RDO con specifiche tecniche",
                },
                category: {
                    type: 'string',
                    description: 'Categoria dell\'RDO (es: "costruzioni", "servizi")',
                },
                estimatedValue: {
                    type: 'number',
                    description: "Valore stimato dell'appalto in EUR",
                },
                location: {
                    type: 'string',
                    description: "Località dell'appalto",
                },
                requirements: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Requisiti generali per i vendor',
                },
            },
            required: ['projectId', 'title', 'deadlineDays', 'invitedVendors', 'lines'],
        },
        handler: async (args, context) => {
            const procurementService = context.services.procurement;
            try {
                const result = await procurementService.createRDO(args);
                return {
                    success: true,
                    data: {
                        rdoId: result.rdoId,
                        status: result.status,
                        invitedVendors: result.invitedVendors.length,
                        deadline: result.deadline.toISOString(),
                        accessInstructions: result.accessInstructions,
                        message: `RDO "${args.title}" creato con successo. ${result.invitedVendors.length} vendor invitati.`,
                    },
                };
            }
            catch (error) {
                return {
                    success: false,
                    error: `Errore nella creazione RDO: ${error instanceof Error ? error.message : 'Unknown error'}`,
                };
            }
        },
    },
    {
        name: 'procurement.compare',
        description: 'Confronta automaticamente le offerte ricevute con scoring ponderato e outlier detection',
        parameters: {
            type: 'object',
            properties: {
                rdoId: {
                    type: 'string',
                    description: "ID dell'RDO da confrontare",
                },
                weights: {
                    type: 'object',
                    properties: {
                        price: { type: 'number', minimum: 0, maximum: 1 },
                        time: { type: 'number', minimum: 0, maximum: 1 },
                        quality: { type: 'number', minimum: 0, maximum: 1 },
                    },
                    description: 'Pesi personalizzati per il scoring (opzionale, default: price 0.7, time 0.2, quality 0.1)',
                },
            },
            required: ['rdoId'],
        },
        handler: async (args, context) => {
            const procurementService = context.services.procurement;
            try {
                const comparison = await procurementService.compareOffers(args.rdoId, args.weights);
                // Prepara risultati per il planner
                const topOffers = comparison.offers.slice(0, 3).map((ranked, index) => ({
                    rank: ranked.rank,
                    vendor: ranked.offer.vendorName,
                    score: Math.round(ranked.score),
                    price: `€${ranked.offer.totalPrice}`,
                    time: `${ranked.offer.totalTime} giorni`,
                    quality: `${ranked.offer.qualityScore}/10`,
                    recommendation: ranked.recommendation,
                }));
                const outliers = comparison.outliers.map(outlier => ({
                    vendor: outlier.vendorName,
                    issue: outlier.description,
                    recommendation: outlier.recommendation,
                }));
                return {
                    success: true,
                    data: {
                        rdoId: comparison.rdoId,
                        totalOffers: comparison.statistics.totalOffers,
                        topOffers,
                        outliers: outliers.length > 0 ? outliers : 'Nessun outlier rilevato',
                        statistics: {
                            averagePrice: `€${Math.round(comparison.statistics.averagePrice)}`,
                            averageTime: `${Math.round(comparison.statistics.averageTime)} giorni`,
                            averageQuality: comparison.statistics.averageQuality.toFixed(1),
                        },
                        pdfUrl: comparison.pdfUrl,
                        message: `Confronto completato: ${comparison.offers.length} offerte analizzate, ${outliers.length} outliers rilevati. PDF disponibile.`,
                    },
                };
            }
            catch (error) {
                return {
                    success: false,
                    error: `Errore nel confronto offerte: ${error instanceof Error ? error.message : 'Unknown error'}`,
                };
            }
        },
    },
    {
        name: 'procurement.award',
        description: "Aggiudica l'RDO al vendor selezionato con pre-check Doc Hunter obbligatorio",
        parameters: {
            type: 'object',
            properties: {
                rdoId: {
                    type: 'string',
                    description: "ID dell'RDO da aggiudicare",
                },
                vendorId: {
                    type: 'string',
                    description: 'ID del vendor da aggiudicare',
                },
                overridePreCheck: {
                    type: 'boolean',
                    description: 'Override del pre-check per casi eccezionali (default: false)',
                },
            },
            required: ['rdoId', 'vendorId'],
        },
        handler: async (args, context) => {
            const procurementService = context.services.procurement;
            try {
                const result = await procurementService.awardRDO(args.rdoId, args.vendorId, args.overridePreCheck || false);
                return {
                    success: true,
                    data: {
                        rdoId: result.rdoId,
                        awardedTo: result.awardedTo,
                        awardedAt: result.awardedAt.toISOString(),
                        preCheckPassed: result.preCheckPassed,
                        overrideUsed: result.overrideUsed,
                        message: result.message,
                        status: 'awarded',
                    },
                };
            }
            catch (error) {
                return {
                    success: false,
                    error: `Errore nell'aggiudicazione: ${error instanceof Error ? error.message : 'Unknown error'}`,
                };
            }
        },
    },
    {
        name: 'procurement.get_status',
        description: 'Ottieni lo stato corrente di un RDO con dettagli offerte e confronti',
        parameters: {
            type: 'object',
            properties: {
                rdoId: {
                    type: 'string',
                    description: "ID dell'RDO da consultare",
                },
            },
            required: ['rdoId'],
        },
        handler: async (args, context) => {
            const procurementService = context.services.procurement;
            try {
                // Simula accesso ai dati dell'RDO
                const rdo = procurementService.rdos.get(args.rdoId);
                if (!rdo) {
                    throw new Error(`RDO ${args.rdoId} non trovato`);
                }
                const offers = Array.from(procurementService.offers.values()).filter((offer) => offer.rdoId === args.rdoId);
                const comparisons = Array.from(procurementService.comparisons.values()).filter((comp) => comp.rdoId === args.rdoId);
                return {
                    success: true,
                    data: {
                        rdoId: rdo.id,
                        title: rdo.title,
                        status: rdo.status,
                        deadline: rdo.deadline.toISOString(),
                        invitedVendors: rdo.invitedVendors.length,
                        respondedVendors: rdo.invitedVendors.filter((v) => v.status === 'responded')
                            .length,
                        offers: offers.length,
                        comparisons: comparisons.length,
                        awardedTo: rdo.awardedTo || 'Non ancora aggiudicato',
                        createdAt: rdo.createdAt.toISOString(),
                        message: `RDO "${rdo.title}" in stato "${rdo.status}" con ${offers.length} offerte ricevute.`,
                    },
                };
            }
            catch (error) {
                return {
                    success: false,
                    error: `Errore nel recupero stato RDO: ${error instanceof Error ? error.message : 'Unknown error'}`,
                };
            }
        },
    },
    {
        name: 'procurement.list_vendors',
        description: 'Lista tutti i vendor disponibili con stato documenti e rating',
        parameters: {
            type: 'object',
            properties: {
                category: {
                    type: 'string',
                    description: 'Filtra per categoria (opzionale)',
                },
                activeOnly: {
                    type: 'boolean',
                    description: 'Mostra solo vendor attivi (default: true)',
                },
            },
        },
        handler: async (args, context) => {
            const procurementService = context.services.procurement;
            try {
                const vendors = Array.from(procurementService.vendors.values());
                let filteredVendors = vendors;
                if (args.category) {
                    filteredVendors = vendors.filter((v) => v.category.includes(args.category));
                }
                if (args.activeOnly !== false) {
                    filteredVendors = filteredVendors.filter((v) => v.documents.every((d) => d.status === 'valid'));
                }
                const vendorList = filteredVendors.map((vendor) => ({
                    id: vendor.id,
                    name: vendor.name,
                    email: vendor.email,
                    category: vendor.category,
                    rating: vendor.rating,
                    documents: vendor.documents.map((d) => ({
                        type: d.type,
                        status: d.status,
                        expiresAt: d.expiresAt?.toISOString(),
                    })),
                    status: vendor.documents.every((d) => d.status === 'valid') ? 'active' : 'inactive',
                }));
                return {
                    success: true,
                    data: {
                        totalVendors: vendorList.length,
                        activeVendors: vendorList.filter(v => v.status === 'active').length,
                        vendors: vendorList,
                        message: `Trovati ${vendorList.length} vendor${args.category ? ` per categoria "${args.category}"` : ''}.`,
                    },
                };
            }
            catch (error) {
                return {
                    success: false,
                    error: `Errore nel recupero vendor: ${error instanceof Error ? error.message : 'Unknown error'}`,
                };
            }
        },
    },
];
//# sourceMappingURL=actions.js.map