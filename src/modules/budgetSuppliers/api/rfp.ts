/**
 * 📋 RFP API
 * 
 * API per gestione Richieste di Offerta (RFP)
 */

import { BudgetSuppliersRepository } from '../api/repo';
import { CreateRfpInput, Rfp, UpdateRfpInput } from '../lib/types';

export interface Vendor {
  id: string;
  name: string;
  email: string;
  company: string;
  category: string[];
  isActive: boolean;
}

export interface RfpInvite {
  id: string;
  rfpId: string;
  vendorId: string;
  vendorEmail: string;
  token: string;
  status: 'sent' | 'opened' | 'responded' | 'expired';
  sentAt: number;
  openedAt?: number;
  respondedAt?: number;
  expiresAt: number;
}

export interface RfpStats {
  totalInvites: number;
  sentInvites: number;
  openedInvites: number;
  respondedInvites: number;
  expiredInvites: number;
  daysToDeadline: number;
  isExpired: boolean;
}

// Mock vendors database
const mockVendors: Vendor[] = [
  {
    id: 'vendor-1',
    name: 'Mario Rossi',
    email: 'mario.rossi@costruzioni.it',
    company: 'Costruzioni Rossi SRL',
    category: ['OPERE', 'FORNITURE'],
    isActive: true
  },
  {
    id: 'vendor-2',
    name: 'Giulia Bianchi',
    email: 'giulia.bianchi@impianti.it',
    company: 'Impianti Bianchi SPA',
    category: ['FORNITURE', 'SICUREZZA'],
    isActive: true
  },
  {
    id: 'vendor-3',
    name: 'Alessandro Verdi',
    email: 'alessandro.verdi@sicurezza.it',
    company: 'Sicurezza Verdi SRL',
    category: ['SICUREZZA'],
    isActive: true
  },
  {
    id: 'vendor-4',
    name: 'Francesca Neri',
    email: 'francesca.neri@esterni.it',
    company: 'Esterni Neri SRL',
    category: ['ESTERNE_ALTRO', 'CANTIERIZZAZIONE'],
    isActive: true
  }
];

// Mock RFP invites
const mockRfpInvites: RfpInvite[] = [];

export class RfpService {
  
  // Crea nuova RFP
  static async createRfp(input: CreateRfpInput): Promise<Rfp> {
    try {
      console.log('📋 [RFP] Creazione RFP:', input);
      
      const rfp = await BudgetSuppliersRepository.rfps.create(input);
      
      console.log('✅ [RFP] RFP creata con successo:', rfp.id);
      return rfp;
      
    } catch (error: any) {
      console.error('❌ [RFP] Errore creazione RFP:', error);
      throw new Error(`Errore creazione RFP: ${error.message}`);
    }
  }

  // Aggiorna RFP
  static async updateRfp(id: string, input: UpdateRfpInput): Promise<Rfp> {
    try {
      console.log('📋 [RFP] Aggiornamento RFP:', id, input);
      
      const rfp = await BudgetSuppliersRepository.rfps.update(id, input);
      
      console.log('✅ [RFP] RFP aggiornata con successo:', id);
      return rfp;
      
    } catch (error: any) {
      console.error('❌ [RFP] Errore aggiornamento RFP:', error);
      throw new Error(`Errore aggiornamento RFP: ${error.message}`);
    }
  }

  // Lista RFP per progetto
  static async listRfps(projectId: string): Promise<Rfp[]> {
    try {
      console.log('📋 [RFP] Lista RFP per progetto:', projectId);
      
      const rfps = await BudgetSuppliersRepository.rfps.listByProject({ projectId });
      
      console.log('✅ [RFP] Trovate', rfps.length, 'RFP');
      return rfps;
      
    } catch (error: any) {
      console.error('❌ [RFP] Errore lista RFP:', error);
      throw new Error(`Errore lista RFP: ${error.message}`);
    }
  }

  // Ottieni RFP per ID
  static async getRfpById(id: string): Promise<Rfp | null> {
    try {
      console.log('📋 [RFP] Get RFP by ID:', id);
      
      const rfp = await BudgetSuppliersRepository.rfps.getById(id);
      
      return rfp;
      
    } catch (error: any) {
      console.error('❌ [RFP] Errore get RFP:', error);
      throw new Error(`Errore get RFP: ${error.message}`);
    }
  }

  // Elimina RFP
  static async deleteRfp(id: string): Promise<void> {
    try {
      console.log('📋 [RFP] Eliminazione RFP:', id);
      
      await BudgetSuppliersRepository.rfps.delete(id);
      
      console.log('✅ [RFP] RFP eliminata con successo:', id);
      
    } catch (error: any) {
      console.error('❌ [RFP] Errore eliminazione RFP:', error);
      throw new Error(`Errore eliminazione RFP: ${error.message}`);
    }
  }

  // Cerca fornitori
  static async searchVendors(query: string, categories?: string[]): Promise<Vendor[]> {
    try {
      console.log('🔍 [RFP] Ricerca fornitori:', query, categories);
      
      let results = mockVendors.filter(vendor => 
        vendor.isActive && (
          vendor.name.toLowerCase().includes(query.toLowerCase()) ||
          vendor.company.toLowerCase().includes(query.toLowerCase()) ||
          vendor.email.toLowerCase().includes(query.toLowerCase())
        )
      );

      if (categories && categories.length > 0) {
        results = results.filter(vendor =>
          categories.some(cat => vendor.category.includes(cat))
        );
      }

      console.log('✅ [RFP] Trovati', results.length, 'fornitori');
      return results;
      
    } catch (error: any) {
      console.error('❌ [RFP] Errore ricerca fornitori:', error);
      throw new Error(`Errore ricerca fornitori: ${error.message}`);
    }
  }

  // Genera token univoco per RFP
  static generateRfpToken(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `rfp_${timestamp}_${random}`;
  }

  // Invia inviti RFP
  static async sendRfpInvites(rfpId: string, vendorEmails: string[]): Promise<RfpInvite[]> {
    try {
      console.log('📧 [RFP] Invio inviti RFP:', rfpId, vendorEmails);
      
      const invites: RfpInvite[] = [];
      
      for (const email of vendorEmails) {
        const token = this.generateRfpToken();
        const invite: RfpInvite = {
          id: `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          rfpId,
          vendorId: '', // Will be set when vendor responds
          vendorEmail: email,
          token,
          status: 'sent',
          sentAt: Date.now(),
          expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 giorni
        };
        
        invites.push(invite);
        mockRfpInvites.push(invite);
        
        // Registra token per validazione (per OfferService)
        const { OfferService } = await import('./offer');
        OfferService.generateTestToken(rfpId, email, invite.expiresAt);
        
        // Simula invio email
        await this.sendRfpEmail(email, rfpId, token);
      }
      
      console.log('✅ [RFP] Inviati', invites.length, 'inviti');
      return invites;
      
    } catch (error: any) {
      console.error('❌ [RFP] Errore invio inviti:', error);
      throw new Error(`Errore invio inviti: ${error.message}`);
    }
  }

  // Invia email RFP
  static async sendRfpEmail(email: string, rfpId: string, token: string): Promise<void> {
    try {
      console.log('📧 [RFP] Invio email RFP a:', email);
      
      // Simula invio email (in produzione useresti il provider email esistente)
      const rfpUrl = `${window.location.origin}/vendor/rfp/${token}`;
      
      const emailData = {
        to: email,
        subject: `Richiesta di Offerta - Urbanova`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Richiesta di Offerta</h2>
            <p>Ciao,</p>
            <p>Ti invitiamo a partecipare alla nostra richiesta di offerta.</p>
            <p><strong>ID RFP:</strong> ${rfpId}</p>
            <p><strong>Scadenza:</strong> [Data scadenza]</p>
            <div style="margin: 20px 0;">
              <a href="${rfpUrl}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Visualizza RFP
              </a>
            </div>
            <p style="color: #666; font-size: 12px;">
              Questo link è valido per 30 giorni e contiene informazioni riservate.
            </p>
          </div>
        `
      };
      
      console.log('📧 [RFP] Email preparata:', emailData);
      
      // In produzione qui chiameresti il servizio email esistente
      // await emailService.send(emailData);
      
    } catch (error: any) {
      console.error('❌ [RFP] Errore invio email:', error);
      throw new Error(`Errore invio email: ${error.message}`);
    }
  }

  // Ottieni statistiche RFP
  static async getRfpStats(rfpId: string): Promise<RfpStats> {
    try {
      console.log('📊 [RFP] Statistiche RFP:', rfpId);
      
      const invites = mockRfpInvites.filter(invite => invite.rfpId === rfpId);
      const rfp = await this.getRfpById(rfpId);
      
      if (!rfp) {
        throw new Error('RFP non trovata');
      }
      
      const now = Date.now();
      const daysToDeadline = Math.ceil((rfp.dueAt - now) / (24 * 60 * 60 * 1000));
      
      const stats: RfpStats = {
        totalInvites: invites.length,
        sentInvites: invites.filter(i => i.status === 'sent').length,
        openedInvites: invites.filter(i => i.status === 'opened').length,
        respondedInvites: invites.filter(i => i.status === 'responded').length,
        expiredInvites: invites.filter(i => i.status === 'expired').length,
        daysToDeadline: Math.max(0, daysToDeadline),
        isExpired: now > rfp.dueAt
      };
      
      console.log('✅ [RFP] Statistiche calcolate:', stats);
      return stats;
      
    } catch (error: any) {
      console.error('❌ [RFP] Errore statistiche RFP:', error);
      throw new Error(`Errore statistiche RFP: ${error.message}`);
    }
  }

  // Ottieni inviti RFP
  static async getRfpInvites(rfpId: string): Promise<RfpInvite[]> {
    try {
      console.log('📋 [RFP] Inviti RFP:', rfpId);
      
      const invites = mockRfpInvites.filter(invite => invite.rfpId === rfpId);
      
      console.log('✅ [RFP] Trovati', invites.length, 'inviti');
      return invites;
      
    } catch (error: any) {
      console.error('❌ [RFP] Errore inviti RFP:', error);
      throw new Error(`Errore inviti RFP: ${error.message}`);
    }
  }

  // Chiudi RFP
  static async closeRfp(rfpId: string): Promise<Rfp> {
    try {
      console.log('📋 [RFP] Chiusura RFP:', rfpId);
      
      const rfp = await this.updateRfp(rfpId, { status: 'closed' });
      
      console.log('✅ [RFP] RFP chiusa con successo:', rfpId);
      return rfp;
      
    } catch (error: any) {
      console.error('❌ [RFP] Errore chiusura RFP:', error);
      throw new Error(`Errore chiusura RFP: ${error.message}`);
    }
  }

  // Riapri RFP
  static async reopenRfp(rfpId: string): Promise<Rfp> {
    try {
      console.log('📋 [RFP] Riapertura RFP:', rfpId);
      
      const rfp = await this.updateRfp(rfpId, { status: 'collecting' });
      
      console.log('✅ [RFP] RFP riaperta con successo:', rfpId);
      return rfp;
      
    } catch (error: any) {
      console.error('❌ [RFP] Errore riapertura RFP:', error);
      throw new Error(`Errore riapertura RFP: ${error.message}`);
    }
  }
}
