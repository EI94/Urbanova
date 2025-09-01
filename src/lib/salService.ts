// SAL Service - Urbanova AI
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  DocumentData,
  getDoc,
  writeBatch,
  runTransaction,
} from 'firebase/firestore';

import { db } from './firebase';
import {
  SAL,
  SALStatus,
  SALCreateRequest,
  SALSendRequest,
  SALSignRequest,
  SALPayRequest,
  SALResult,
  SALLine,
  SALSignature,
  SALPayment,
} from '@urbanova/types';

import { stripeService } from './stripeService';
import { docHunterService } from './docHunterService';
import { gcsService } from './gcsService';
import { RealEmailService } from './realEmailService';
import { salMonitoringService } from './salMonitoringService';

export class SALService {
  private readonly COLLECTION = 'sals';

  /**
   * Crea un nuovo SAL
   */
  async create(request: SALCreateRequest): Promise<SALResult> {
    const startTime = Date.now();

    try {
      console.log('📝 [SAL] Creazione nuovo SAL:', request);

      // Monitoraggio
      salMonitoringService.logAction('create', 'pending', 'system', 'SYSTEM', {
        projectId: request.projectId,
        vendorId: request.vendorId,
        linesCount: request.lines?.length || 0,
      });

      // Validazione input
      if (!request.lines || request.lines.length === 0) {
        const error = {
          success: false,
          message: 'Il SAL deve contenere almeno una linea',
          errors: ['lines_required'],
        };

        // Monitoraggio errore
        salMonitoringService.monitorErrors(new Error('Validation failed: no lines'), {
          action: 'create',
          request,
          error: error,
        });

        return error;
      }

      // Calcolo importo totale
      const totalAmount = request.lines.reduce((sum, line) => sum + line.totalPrice, 0);

      // Creazione SAL
      const sal: Omit<SAL, 'id'> = {
        projectId: request.projectId,
        vendorId: request.vendorId,
        vendorName: '', // Sarà popolato quando inviato
        vendorEmail: '', // Sarà popolato quando inviato
        title: request.title,
        description: request.description,
        totalAmount,
        currency: 'EUR',
        status: 'DRAFT',
        currentStep: 1,
        totalSteps: 6,
        createdAt: new Date(),
        lines: request.lines.map((line, index) => ({
          ...line,
          id: `line-${Date.now()}-${index}`,
        })),
        terms: request.terms,
        conditions: request.conditions,
        signatures: [],
        metadata: request.metadata || {},
        tags: ['draft', 'pending'],
      };

      const docRef = await addDoc(collection(db, this.COLLECTION), {
        ...sal,
        createdAt: serverTimestamp(),
      });

      const createdSal: SAL = {
        ...sal,
        id: docRef.id,
      };

      console.log('✅ [SAL] SAL creato con successo:', docRef.id);

      return {
        success: true,
        sal: createdSal,
        message: 'SAL creato con successo',
        nextAction: 'send',
      };
    } catch (error) {
      console.error('❌ [SAL] Errore creazione:', error);
      return {
        success: false,
        message: 'Errore durante la creazione del SAL',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Invia il SAL al vendor
   */
  async send(request: SALSendRequest): Promise<SALResult> {
    try {
      console.log('📤 [SAL] Invio SAL:', request.salId);

      const salRef = doc(db, this.COLLECTION, request.salId);
      const salDoc = await getDoc(salRef);

      if (!salDoc.exists()) {
        return {
          success: false,
          message: 'SAL non trovato',
          errors: ['sal_not_found'],
        };
      }

      const sal = salDoc.data() as SAL;

      // Validazione stato
      if (sal.status !== 'DRAFT') {
        return {
          success: false,
          message: 'Solo i SAL in bozza possono essere inviati',
          errors: ['invalid_status'],
        };
      }

      // Aggiornamento stato
      await updateDoc(salRef, {
        status: 'SENT',
        vendorEmail: request.vendorEmail,
        sentAt: serverTimestamp(),
        currentStep: 2,
        tags: ['sent', 'pending_vendor_signature'],
      });

      // Invio email al vendor
      await this.sendVendorEmail(sal, request.vendorEmail, request.message);

      console.log('✅ [SAL] SAL inviato con successo');

      return {
        success: true,
        message: 'SAL inviato al vendor con successo',
        nextAction: 'wait_vendor_signature',
      };
    } catch (error) {
      console.error('❌ [SAL] Errore invio:', error);
      return {
        success: false,
        message: "Errore durante l'invio del SAL",
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Firma del SAL (vendor o PM)
   */
  async sign(request: SALSignRequest): Promise<SALResult> {
    try {
      console.log('✍️ [SAL] Firma SAL:', request.salId, 'da', request.signerRole);

      const salRef = doc(db, this.COLLECTION, request.salId);
      const salDoc = await getDoc(salRef);

      if (!salDoc.exists()) {
        return {
          success: false,
          message: 'SAL non trovato',
          errors: ['sal_not_found'],
        };
      }

      const sal = salDoc.data() as SAL;

      // Validazione stato per firma
      if (!this.canSign(sal, request.signerRole)) {
        return {
          success: false,
          message: 'Firma non consentita in questo stato',
          errors: ['invalid_signature_state'],
        };
      }

      // Creazione firma
      const signature: SALSignature = {
        id: `sig-${Date.now()}`,
        signerId: request.signerId,
        signerName: request.signerName,
        signerRole: request.signerRole,
        signedAt: new Date(),
        signatureHash: request.signatureHash,
      };

      // Aggiornamento SAL
      const updateData: any = {
        signatures: [...sal.signatures, signature],
        currentStep: sal.currentStep + 1,
      };

      if (request.signerRole === 'VENDOR') {
        updateData.status = 'SIGNED_VENDOR';
        updateData.vendorSignedAt = serverTimestamp();
        updateData.vendorName = request.signerName;
        updateData.tags = ['vendor_signed', 'pending_pm_signature'];
      } else if (request.signerRole === 'PM') {
        updateData.status = 'SIGNED_PM';
        updateData.pmSignedAt = serverTimestamp();
        updateData.tags = ['pm_signed', 'ready_for_payment'];
      }

      // Se entrambe le parti hanno firmato, passa a READY_TO_PAY
      if (sal.signatures.some(s => s.signerRole === 'VENDOR') && request.signerRole === 'PM') {
        updateData.status = 'READY_TO_PAY';
        updateData.readyToPayAt = serverTimestamp();
        updateData.currentStep = 5;
        updateData.tags = ['ready_to_pay', 'awaiting_payment'];
      }

      await updateDoc(salRef, updateData);

      console.log('✅ [SAL] Firma completata con successo');

      return {
        success: true,
        message: 'Firma completata con successo',
        nextAction: this.getNextAction(sal.status, request.signerRole),
      };
    } catch (error) {
      console.error('❌ [SAL] Errore firma:', error);
      return {
        success: false,
        message: 'Errore durante la firma del SAL',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Pagamento del SAL
   */
  async pay(request: SALPayRequest): Promise<SALResult> {
    try {
      console.log('💳 [SAL] Pagamento SAL:', request.salId);

      const salRef = doc(db, this.COLLECTION, request.salId);
      const salDoc = await getDoc(salRef);

      if (!salDoc.exists()) {
        return {
          success: false,
          message: 'SAL non trovato',
          errors: ['sal_not_found'],
        };
      }

      const sal = salDoc.data() as SAL;

      // Validazione stato
      if (sal.status !== 'READY_TO_PAY') {
        return {
          success: false,
          message: 'Solo i SAL pronti per il pagamento possono essere pagati',
          errors: ['invalid_status'],
        };
      }

      // Verifica certificazioni vendor tramite Doc Hunter
      const vendorCertifications = await docHunterService.verifyVendorCertifications(sal.vendorId);

      if (!vendorCertifications.isValid) {
        return {
          success: false,
          message: 'Vendor non ha le certificazioni richieste per il pagamento',
          errors: vendorCertifications.missingCertifications,
          nextAction: 'verify_certifications',
        };
      }

      // Creazione PaymentIntent su Stripe
      const paymentIntent = await stripeService.createPaymentIntent({
        amount: sal.totalAmount,
        currency: sal.currency,
        metadata: {
          salId: sal.id,
          projectId: sal.projectId,
          vendorId: sal.vendorId,
        },
      });

      // Creazione record pagamento
      const payment: SALPayment = {
        id: `pay-${Date.now()}`,
        stripePaymentIntentId: paymentIntent.id,
        amount: sal.totalAmount,
        currency: sal.currency,
        status: 'pending',
        metadata: {
          salId: sal.id,
          projectId: sal.projectId,
          vendorId: sal.vendorId,
        },
      };

      // Aggiornamento SAL
      await updateDoc(salRef, {
        status: 'PAID',
        payment,
        paidAt: serverTimestamp(),
        currentStep: 6,
        tags: ['paid', 'completed'],
      });

      // Download e salvataggio ricevuta su GCS
      if (paymentIntent.receipt_url) {
        await this.saveReceiptToGCS(sal.id, paymentIntent.receipt_url);
      }

      console.log('✅ [SAL] Pagamento completato con successo');

      return {
        success: true,
        message: 'Pagamento completato con successo',
        nextAction: 'completed',
      };
    } catch (error) {
      console.error('❌ [SAL] Errore pagamento:', error);
      return {
        success: false,
        message: 'Errore durante il pagamento del SAL',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Verifica se il SAL può essere firmato
   */
  private canSign(sal: SAL, signerRole: 'PM' | 'VENDOR'): boolean {
    if (signerRole === 'VENDOR') {
      return sal.status === 'SENT';
    } else if (signerRole === 'PM') {
      return sal.status === 'SIGNED_VENDOR';
    }
    return false;
  }

  /**
   * Determina la prossima azione
   */
  private getNextAction(currentStatus: SALStatus, signerRole: 'PM' | 'VENDOR'): string {
    if (signerRole === 'VENDOR' && currentStatus === 'SIGNED_VENDOR') {
      return 'wait_pm_signature';
    } else if (signerRole === 'PM' && currentStatus === 'READY_TO_PAY') {
      return 'ready_for_payment';
    }
    return 'continue';
  }

  /**
   * Invio email al vendor
   */
  private async sendVendorEmail(sal: SAL, vendorEmail: string, message?: string): Promise<void> {
    try {
      const emailContent = `
        Nuovo SAL ricevuto: ${sal.title}
        
        Progetto: ${sal.projectId}
        Importo: €${sal.totalAmount}
        
        ${message || ''}
        
        Per firmare il SAL, visita: /sal/sign?token=${this.generateSignatureToken(sal.id, 'VENDOR')}
      `;

      const emailService = new RealEmailService();
      await emailService.sendEmail({
        to: vendorEmail,
        subject: `Nuovo SAL: ${sal.title}`,
        htmlContent: emailContent,
        lands: [],
        summary: {
          totalFound: 0,
          averagePrice: 0,
          bestOpportunities: [],
        },
      });

      console.log('📧 [SAL] Email inviata al vendor:', vendorEmail);
    } catch (error) {
      console.error('❌ [SAL] Errore invio email:', error);
    }
  }

  /**
   * Genera token per la firma
   */
  private generateSignatureToken(salId: string, role: 'PM' | 'VENDOR'): string {
    // In produzione, usare JWT con scadenza
    return Buffer.from(`${salId}:${role}:${Date.now()}`).toString('base64');
  }

  /**
   * Salva ricevuta su Google Cloud Storage
   */
  private async saveReceiptToGCS(salId: string, receiptUrl: string): Promise<void> {
    try {
      const fileName = `receipts/sal-${salId}-${Date.now()}.pdf`;
      await gcsService.uploadFromUrl(receiptUrl, fileName);
      console.log('💾 [SAL] Ricevuta salvata su GCS:', fileName);
    } catch (error) {
      console.error('❌ [SAL] Errore salvataggio ricevuta:', error);
    }
  }

  /**
   * Ottiene tutti i SAL di un progetto
   */
  async getProjectSALs(projectId: string): Promise<SAL[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as SAL[];
    } catch (error) {
      console.error('❌ [SAL] Errore recupero SAL progetto:', error);
      return [];
    }
  }

  /**
   * Ottiene un SAL specifico
   */
  async getSAL(salId: string): Promise<SAL | null> {
    try {
      const salDoc = await getDoc(doc(db, this.COLLECTION, salId));

      if (!salDoc.exists()) {
        return null;
      }

      return {
        id: salDoc.id,
        ...salDoc.data(),
      } as SAL;
    } catch (error) {
      console.error('❌ [SAL] Errore recupero SAL:', error);
      return null;
    }
  }
}

export const salService = new SALService();
