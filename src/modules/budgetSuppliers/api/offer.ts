/**
 * 💰 OFFER API
 * 
 * API per gestione offerte fornitori
 */

import { BudgetSuppliersRepository } from '../api/repo';
import { CreateOfferInput, Offer, UpdateOfferInput, OfferLine } from '../lib/types';
import { RfpService } from './rfp';

export interface OfferValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface TokenValidation {
  isValid: boolean;
  rfpId: string;
  vendorEmail: string;
  expiresAt: number;
  isExpired: boolean;
  error?: string;
}

// Mock offers database
const mockOffers: Offer[] = [];

// Mock token validation (in produzione useresti JWT o database)
const mockTokens: Record<string, {
  rfpId: string;
  vendorEmail: string;
  expiresAt: number;
  used: boolean;
}> = {};

export class OfferService {
  
  // Valida token RFP
  static async validateToken(token: string): Promise<TokenValidation> {
    try {
      console.log('🔐 [OFFER] Validazione token:', token);
      
      const tokenData = mockTokens[token];
      
      if (!tokenData) {
        return {
          isValid: false,
          rfpId: '',
          vendorEmail: '',
          expiresAt: 0,
          isExpired: true,
          error: 'Token non valido'
        };
      }
      
      if (tokenData.used) {
        return {
          isValid: false,
          rfpId: tokenData.rfpId,
          vendorEmail: tokenData.vendorEmail,
          expiresAt: tokenData.expiresAt,
          isExpired: false,
          error: 'Token già utilizzato'
        };
      }
      
      const now = Date.now();
      const isExpired = now > tokenData.expiresAt;
      
      if (isExpired) {
        return {
          isValid: false,
          rfpId: tokenData.rfpId,
          vendorEmail: tokenData.vendorEmail,
          expiresAt: tokenData.expiresAt,
          isExpired: true,
          error: 'Token scaduto'
        };
      }
      
      // Verifica che la RFP esista e sia ancora attiva
      const rfp = await RfpService.getRfpById(tokenData.rfpId);
      if (!rfp) {
        return {
          isValid: false,
          rfpId: tokenData.rfpId,
          vendorEmail: tokenData.vendorEmail,
          expiresAt: tokenData.expiresAt,
          isExpired: false,
          error: 'RFP non trovata'
        };
      }
      
      if (rfp.status === 'closed') {
        return {
          isValid: false,
          rfpId: tokenData.rfpId,
          vendorEmail: tokenData.vendorEmail,
          expiresAt: tokenData.expiresAt,
          isExpired: false,
          error: 'RFP chiusa'
        };
      }
      
      console.log('✅ [OFFER] Token valido per:', tokenData.vendorEmail);
      
      return {
        isValid: true,
        rfpId: tokenData.rfpId,
        vendorEmail: tokenData.vendorEmail,
        expiresAt: tokenData.expiresAt,
        isExpired: false
      };
      
    } catch (error: any) {
      console.error('❌ [OFFER] Errore validazione token:', error);
      return {
        isValid: false,
        rfpId: '',
        vendorEmail: '',
        expiresAt: 0,
        isExpired: true,
        error: 'Errore validazione token'
      };
    }
  }

  // Ottieni RFP per token
  static async getRfpByToken(token: string): Promise<any> {
    try {
      console.log('📋 [OFFER] Get RFP by token:', token);
      
      const validation = await this.validateToken(token);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Token non valido');
      }
      
      const rfp = await RfpService.getRfpById(validation.rfpId);
      if (!rfp) {
        throw new Error('RFP non trovata');
      }
      
      // Ottieni items della RFP (senza budget)
      const items = await BudgetSuppliersRepository.boqItems.listByProject({
        projectId: rfp.projectId
      });
      
      const rfpItems = items.filter(item => rfp.itemIds.includes(item.id));
      
      // Rimuovi budget dagli items
      const sanitizedItems = rfpItems.map(item => ({
        id: item.id,
        code: item.code,
        description: item.description,
        category: item.category,
        uom: item.uom,
        qty: item.qty,
        notes: item.notes,
        level: item.level
        // Budget rimosso intenzionalmente
      }));
      
      console.log('✅ [OFFER] RFP caricata con', sanitizedItems.length, 'items');
      
      return {
        ...rfp,
        items: sanitizedItems
      };
      
    } catch (error: any) {
      console.error('❌ [OFFER] Errore get RFP by token:', error);
      throw new Error(`Errore caricamento RFP: ${error.message}`);
    }
  }

  // Ottieni offerta esistente per token
  static async getOfferByToken(token: string): Promise<Offer | null> {
    try {
      console.log('📋 [OFFER] Get offer by token:', token);
      
      const validation = await this.validateToken(token);
      if (!validation.isValid) {
        return null;
      }
      
      const existingOffer = mockOffers.find(offer => 
        offer.rfpId === validation.rfpId && 
        offer.vendorId === validation.vendorEmail
      );
      
      console.log('✅ [OFFER] Offer trovata:', !!existingOffer);
      return existingOffer || null;
      
    } catch (error: any) {
      console.error('❌ [OFFER] Errore get offer by token:', error);
      return null;
    }
  }

  // Valida offerta
  static validateOffer(offerLines: OfferLine[], rfpItems: any[]): OfferValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Verifica che ci siano almeno alcune offerte
    if (offerLines.length === 0) {
      errors.push('Inserisci almeno un prezzo per procedere');
    }
    
    // Verifica che tutti i prezzi siano positivi
    const negativePrices = offerLines.filter(line => line.unitPrice <= 0);
    if (negativePrices.length > 0) {
      errors.push('Tutti i prezzi devono essere maggiori di zero');
    }
    
    // Verifica che le quantità siano coerenti con la RFP
    offerLines.forEach(line => {
      const rfpItem = rfpItems.find(item => item.id === line.itemId);
      if (rfpItem && line.qty !== rfpItem.qty) {
        warnings.push(`Quantità per "${rfpItem.description}" diversa dalla RFP`);
      }
    });
    
    // Verifica che le unità di misura siano coerenti
    offerLines.forEach(line => {
      const rfpItem = rfpItems.find(item => item.id === line.itemId);
      if (rfpItem && line.uom !== rfpItem.uom) {
        errors.push(`Unità di misura per "${rfpItem.description}" non corretta`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Salva offerta (parziale o completa)
  static async saveOffer(token: string, offerLines: OfferLine[], files?: File[]): Promise<Offer> {
    try {
      console.log('💰 [OFFER] Salvataggio offerta per token:', token);
      
      const validation = await this.validateToken(token);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Token non valido');
      }
      
      // Ottieni RFP per validazione
      const rfp = await this.getRfpByToken(token);
      
      // Valida offerta
      const validationResult = this.validateOffer(offerLines, rfp.items);
      if (!validationResult.isValid) {
        throw new Error(`Errore validazione: ${validationResult.errors.join(', ')}`);
      }
      
      // Controlla se esiste già un'offerta
      const existingOffer = await this.getOfferByToken(token);
      
      if (existingOffer) {
        // Aggiorna offerta esistente
        const updatedOffer = await BudgetSuppliersRepository.offers.update(existingOffer.id, {
          lines: offerLines,
          status: 'received'
        });
        
        console.log('✅ [OFFER] Offerta aggiornata:', updatedOffer.id);
        return updatedOffer;
      } else {
        // Crea nuova offerta
        const offerData: CreateOfferInput = {
          projectId: rfp.projectId,
          rfpId: rfp.id,
          vendorId: validation.vendorEmail,
          lines: offerLines,
          status: 'received'
        };
        
        const newOffer = await BudgetSuppliersRepository.offers.create(offerData);
        
        // Marca token come utilizzato
        mockTokens[token].used = true;
        
        console.log('✅ [OFFER] Nuova offerta creata:', newOffer.id);
        return newOffer;
      }
      
    } catch (error: any) {
      console.error('❌ [OFFER] Errore salvataggio offerta:', error);
      throw new Error(`Errore salvataggio offerta: ${error.message}`);
    }
  }

  // Invia offerta finale
  static async submitOffer(token: string, offerLines: OfferLine[], files?: File[]): Promise<Offer> {
    try {
      console.log('📤 [OFFER] Invio offerta finale per token:', token);
      
      const offer = await this.saveOffer(token, offerLines, files);
      
      // Aggiorna stato a "received" se non lo è già
      if (offer.status !== 'received') {
        await BudgetSuppliersRepository.offers.update(offer.id, {
          status: 'received'
        });
      }
      
      console.log('✅ [OFFER] Offerta inviata con successo:', offer.id);
      return offer;
      
    } catch (error: any) {
      console.error('❌ [OFFER] Errore invio offerta:', error);
      throw new Error(`Errore invio offerta: ${error.message}`);
    }
  }

  // Simula caricamento file
  static async uploadFile(file: File): Promise<string> {
    try {
      console.log('📎 [OFFER] Upload file:', file.name);
      
      // Simula upload (in produzione useresti un servizio di storage)
      const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Simula delay upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ [OFFER] File caricato:', fileId);
      return fileId;
      
    } catch (error: any) {
      console.error('❌ [OFFER] Errore upload file:', error);
      throw new Error(`Errore upload file: ${error.message}`);
    }
  }

  // Genera token per testing
  static generateTestToken(rfpId: string, vendorEmail: string, expiresAt?: number): string {
    const token = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiration = expiresAt || (Date.now() + (30 * 24 * 60 * 60 * 1000)); // 30 giorni
    
    mockTokens[token] = {
      rfpId,
      vendorEmail,
      expiresAt: expiration,
      used: false
    };
    
    console.log('🔑 [OFFER] Token di test generato:', token);
    return token;
  }

  // Rate limiting (semplificato)
  static async checkRateLimit(vendorEmail: string): Promise<boolean> {
    // In produzione implementeresti un sistema di rate limiting più sofisticato
    return true;
  }
}
