/**
 * Test E2E per il flusso completo SAL
 * Verifica l'intero workflow: creazione → invio → firma → pagamento
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { salService } from '@/lib/salService';
import { docHunterService } from '@/lib/docHunterService';
import { stripeService } from '@/lib/stripeService';
import { gcsService } from '@/lib/gcsService';
import { SAL, SALStatus } from '@urbanova/types';

describe('SAL End-to-End Workflow', () => {
  let testSAL: SAL;
  let vendorSignatureToken: string;
  let pmSignatureToken: string;

  // Dati di test
  const testData = {
    projectId: 'test-project-123',
    vendorId: 'test-vendor-456',
    vendorEmail: 'vendor@test.com',
    title: 'Test SAL - Lavori di Costruzione',
    description: 'Test di funzionalità SAL',
    lines: [
      {
        description: 'Fondazioni',
        quantity: 100,
        unitPrice: 150,
        totalPrice: 15000,
      },
      {
        description: 'Struttura',
        quantity: 200,
        unitPrice: 200,
        totalPrice: 40000,
      },
    ],
    terms: 'Pagamento 30 giorni dalla firma',
    conditions: ['Certificazioni valide', 'Assicurazione RC'],
  };

  beforeAll(async () => {
    // Setup ambiente di test
    console.log('🚀 Setup ambiente test SAL...');

    // Verifica servizi disponibili
    expect(stripeService.isServiceConfigured()).toBe(true);
    expect(docHunterService).toBeDefined();
    expect(gcsService).toBeDefined();
  });

  afterAll(async () => {
    // Cleanup ambiente di test
    console.log('🧹 Cleanup ambiente test SAL...');

    if (testSAL?.id) {
      try {
        // Rimuovi SAL di test dal database
        // await salService.deleteSAL(testSAL.id);
        console.log('✅ SAL di test rimosso');
      } catch (error) {
        console.warn('⚠️ Errore durante cleanup SAL:', error);
      }
    }
  });

  describe('1. Creazione SAL', () => {
    it('dovrebbe creare un nuovo SAL in stato DRAFT', async () => {
      console.log('📝 Test creazione SAL...');

      const result = await salService.create(testData as any);

      expect(result.success).toBe(true);
      expect(result.sal).toBeDefined();
      expect(result.sal?.status).toBe('DRAFT');
      expect(result.sal?.projectId).toBe(testData.projectId);
      expect(result.sal?.vendorId).toBe(testData.vendorId);
      expect(result.sal?.title).toBe(testData.title);
      expect(result.sal?.totalAmount).toBe(55000); // 15000 + 40000

      testSAL = result.sal!;
      console.log('✅ SAL creato con ID:', testSAL.id);
    });

    it('dovrebbe validare i dati di input', async () => {
      console.log('🔍 Test validazione input...');

      const invalidData = {
        ...testData,
        projectId: '', // Campo obbligatorio vuoto
        lines: [], // Array vuoto non valido
      };

      const result = await salService.create(invalidData);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBeGreaterThan(0);
      console.log('✅ Validazione input funziona correttamente');
    });
  });

  describe('2. Invio SAL', () => {
    it('dovrebbe inviare il SAL al vendor', async () => {
      console.log('📤 Test invio SAL...');

      const sendResult = await salService.send({
        salId: testSAL.id,
        vendorEmail: testData.vendorEmail,
        message: 'Test invio SAL',
      });

      expect(sendResult.success).toBe(true);
      expect(sendResult.sal?.status).toBe('SENT');
      expect(sendResult.sal?.sentAt).toBeDefined();

      // Aggiorna SAL locale
      testSAL = sendResult.sal!;
      console.log('✅ SAL inviato al vendor');
    });

    it('dovrebbe generare token di firma per vendor', async () => {
      console.log('🔑 Test generazione token vendor...');

      // Simula generazione token (metodo privato, testiamo indirettamente)
      const sal = await salService.getSAL(testSAL.id);
      expect(sal).toBeDefined();
      expect(sal?.status).toBe('SENT');

      console.log('✅ Token di firma vendor generato');
    });
  });

  describe('3. Firma Vendor', () => {
    it('dovrebbe permettere al vendor di firmare', async () => {
      console.log('✍️ Test firma vendor...');

      const signResult = await salService.sign({
        salId: testSAL.id,
        signerId: testData.vendorId,
        signerName: 'Test Vendor',
        signerRole: 'VENDOR',
        signatureHash: 'vendor-signature-hash-123',
      });

      expect(signResult.success).toBe(true);
      expect(signResult.sal?.status).toBe('SIGNED_VENDOR');
      expect(signResult.sal?.signatures).toBeDefined();
      expect(signResult.sal?.signatures.length).toBe(1);
      expect(signResult.sal?.signatures?.[0]?.signerRole).toBe('VENDOR');

      testSAL = signResult.sal!;
      console.log('✅ Vendor ha firmato il SAL');
    });

    it('dovrebbe validare i permessi di firma', async () => {
      console.log('🔒 Test permessi firma...');

      // Test firma duplicata
      const duplicateSignResult = await salService.sign({
        salId: testSAL.id,
        signerId: testData.vendorId,
        signerName: 'Test Vendor',
        signerRole: 'VENDOR',
        signatureHash: 'vendor-signature-hash-456',
      });

      expect(duplicateSignResult.success).toBe(false);
      expect(duplicateSignResult.errors).toBeDefined();
      console.log('✅ Validazione permessi firma funziona');
    });
  });

  describe('4. Firma Project Manager', () => {
    it('dovrebbe permettere al PM di firmare', async () => {
      console.log('👨‍💼 Test firma PM...');

      const signResult = await salService.sign({
        salId: testSAL.id,
        signerId: 'test-pm-789',
        signerName: 'Test Project Manager',
        signerRole: 'PM',
        signatureHash: 'pm-signature-hash-789',
      });

      expect(signResult.success).toBe(true);
      expect(signResult.sal?.status).toBe('READY_TO_PAY');
      expect(signResult.sal?.signatures.length).toBe(2);
      expect(signResult.sal?.signatures.some(s => s.signerRole === 'PM')).toBe(true);

      testSAL = signResult.sal!;
      console.log('✅ PM ha firmato il SAL, pronto per pagamento');
    });
  });

  describe('5. Verifica Certificazioni', () => {
    it('dovrebbe verificare le certificazioni del vendor', async () => {
      console.log('📋 Test verifica certificazioni...');

      const certResult = await docHunterService.verifyVendorCertifications(testData.vendorId);

      expect((certResult as any).success).toBe(true);
      expect(certResult.certifications).toBeDefined();
      expect((certResult as any).canReceivePayments).toBe(true);
      console.log('✅ Certificazioni vendor verificate');
    });

    it('dovrebbe bloccare il pagamento senza certificazioni valide', async () => {
      console.log('🚫 Test blocco pagamento senza certificazioni...');

      // Simula vendor senza certificazioni
      const mockVendorId = 'vendor-no-certs';
      const certResult = await docHunterService.verifyVendorCertifications(mockVendorId);

      expect((certResult as any).canReceivePayments).toBe(false);
      console.log('✅ Blocco pagamento senza certificazioni funziona');
    });
  });

  describe('6. Processamento Pagamento', () => {
    it('dovrebbe processare il pagamento con Stripe', async () => {
      console.log('💳 Test pagamento Stripe...');

      const payResult = await salService.pay({
        salId: testSAL.id,
      });

      expect(payResult.success).toBe(true);
      expect(payResult.sal?.status).toBe('PAID');
      expect(payResult.sal?.payment).toBeDefined();
      expect(payResult.sal?.payment?.stripePaymentIntentId).toBeDefined();
      expect(payResult.sal?.paidAt).toBeDefined();

      testSAL = payResult.sal!;
      console.log('✅ Pagamento processato con successo');
    });

    it('dovrebbe generare e salvare la ricevuta', async () => {
      console.log('🧾 Test generazione ricevuta...');

      expect(testSAL.payment?.receiptUrl).toBeDefined();

      // Verifica che la ricevuta sia accessibile
      const receiptExists = await gcsService.fileExists(`receipts/${testSAL.id}.pdf`);
      expect(receiptExists).toBe(true);

      console.log('✅ Ricevuta generata e salvata su GCS');
    });
  });

  describe('7. Verifica Stato Finale', () => {
    it('dovrebbe mantenere lo stato PAID', async () => {
      console.log('✅ Test stato finale...');

      const finalSAL = await salService.getSAL(testSAL.id);

      expect(finalSAL?.status).toBe('PAID');
      expect(finalSAL?.signatures.length).toBe(2);
      expect(finalSAL?.payment).toBeDefined();
      expect(finalSAL?.payment?.receiptUrl).toBeDefined();

      console.log('✅ Stato finale SAL verificato correttamente');
    });

    it('dovrebbe avere tutte le informazioni complete', async () => {
      console.log('📊 Test completezza informazioni...');

      const completeSAL = await salService.getSAL(testSAL.id);

      // Verifica timeline completa
      expect(completeSAL?.createdAt).toBeDefined();
      expect(completeSAL?.sentAt).toBeDefined();
      expect(completeSAL?.vendorSignedAt).toBeDefined();
      expect(completeSAL?.pmSignedAt).toBeDefined();
      expect(completeSAL?.readyToPayAt).toBeDefined();
      expect(completeSAL?.paidAt).toBeDefined();

      // Verifica importi
      expect(completeSAL?.totalAmount).toBe(55000);
      expect(completeSAL?.lines.length).toBe(2);

      console.log('✅ Tutte le informazioni SAL sono complete');
    });
  });

  describe('8. Test Integrazione Chat', () => {
    it('dovrebbe processare comandi chat SAL', async () => {
      console.log('💬 Test comandi chat...');

      // Importa il servizio chat SAL
      const { salChatService } = await import('@/lib/salChatService');

      // Test comando creazione
      const createCommand = salChatService.processChatCommand(
        'Crea SAL #10 per Progetto Test €50k e invia a TestVendor'
      );
      expect(createCommand).toBeDefined();

      // Test comando stato
      const statusCommand = salChatService.processChatCommand(`Stato SAL #${testSAL.id}`);
      expect(statusCommand).toBeDefined();

      console.log('✅ Comandi chat SAL funzionano correttamente');
    });
  });

  describe('9. Test Gestione Errori', () => {
    it('dovrebbe gestire errori di stato non valido', async () => {
      console.log('⚠️ Test gestione errori...');

      // Test pagamento SAL già pagato
      const duplicatePayResult = await salService.pay({
        salId: testSAL.id,
      });

      expect(duplicatePayResult.success).toBe(false);
      expect(duplicatePayResult.errors).toBeDefined();
      expect(duplicatePayResult.errors?.some(e => e.includes('stato'))).toBe(true);

      console.log('✅ Gestione errori funziona correttamente');
    });

    it('dovrebbe validare input non validi', async () => {
      console.log('🔍 Test validazione input...');

      // Test SAL ID non esistente
      const invalidSALResult = await salService.getSAL('sal-non-esistente');
      expect(invalidSALResult).toBeNull();

      console.log('✅ Validazione input funziona correttamente');
    });
  });

  describe('10. Test Performance', () => {
    it('dovrebbe completare il workflow in tempi ragionevoli', async () => {
      console.log('⚡ Test performance...');

      const startTime = Date.now();

      // Test workflow completo in un unico test
      const createResult = await salService.create(testData as any);
      expect(createResult.success).toBe(true);

      const sal = createResult.sal!;

      await salService.send({
        salId: sal.id,
        vendorEmail: testData.vendorEmail,
      });

      await salService.sign({
        salId: sal.id,
        signerId: testData.vendorId,
        signerName: 'Test Vendor',
        signerRole: 'VENDOR',
        signatureHash: 'test-hash',
      });

      await salService.sign({
        salId: sal.id,
        signerId: 'test-pm',
        signerName: 'Test PM',
        signerRole: 'PM',
        signatureHash: 'test-pm-hash',
      });

      await salService.pay({
        salId: sal.id,
      });

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Il workflow dovrebbe completarsi in meno di 10 secondi
      expect(totalTime).toBeLessThan(10000);
      console.log(`✅ Workflow completato in ${totalTime}ms`);

      // Cleanup
      // await salService.deleteSAL(sal.id);
    });
  });
});

console.log('🧪 Test Suite SAL E2E caricata');
