import { ICSFile } from '@urbanova/types';
/**
 * ICS Service
 *
 * Generazione file ICS RFC 5545:
 * - Eventi singoli e ricorrenti
 * - Partecipanti e organizzatori
 * - Allegati e descrizioni
 * - Timezone support
 * - Download sicuri
 */
export declare class ICSService {
    private icsFiles;
    private appointmentService;
    constructor();
    /**
     * Genera file ICS per appuntamento
     */
    generateICS(request: {
        appointmentId: string;
        includeAttachments?: boolean;
        includeRecurrence?: boolean;
        timezone?: string;
    }): Promise<ICSFile>;
    /**
     * Genera contenuto ICS RFC 5545
     */
    private generateICSContent;
    /**
     * Formatta data per ICS
     */
    private formatICSDate;
    /**
     * Escape valori ICS
     */
    private escapeICSValue;
    /**
     * Ottieni file ICS
     */
    getICSFile(icsFileId: string): Promise<ICSFile | null>;
    /**
     * Ottieni file ICS per appuntamento
     */
    getICSFileByAppointment(appointmentId: string): Promise<ICSFile | null>;
    /**
     * Aggiorna file ICS
     */
    updateICSFile(icsFileId: string, updates: {
        content?: string;
        downloadUrl?: string;
        expiresAt?: Date;
        metadata?: any;
    }): Promise<ICSFile>;
    /**
     * Rigenera file ICS
     */
    regenerateICS(appointmentId: string, options?: {
        includeAttachments?: boolean;
        includeRecurrence?: boolean;
        timezone?: string;
    }): Promise<ICSFile>;
    /**
     * Valida file ICS
     */
    validateICS(icsContent: string): Promise<{
        valid: boolean;
        errors: string[];
        warnings: string[];
    }>;
    /**
     * Elimina file ICS
     */
    deleteICSFile(icsFileId: string): Promise<boolean>;
    /**
     * Lista file ICS
     */
    listICSFiles(filters?: {
        appointmentId?: string;
        fromDate?: Date;
        toDate?: Date;
    }): Promise<ICSFile[]>;
    /**
     * Pulisci file ICS scaduti
     */
    cleanupExpiredICS(): Promise<number>;
}
//# sourceMappingURL=icsService.d.ts.map