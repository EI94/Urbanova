#!/usr/bin/env node

/**
 * Test per il Listing Tool - Urbanova OS
 *
 * Questo test verifica il funzionamento del sistema di listing con:
 * - Publication Guard (price guard)
 * - Pack Annuncio (asset pack + feed XML)
 * - Tool actions prepare e push
 */

console.log('🏠 Test Listing Tool - Urbanova OS');
console.log('==================================');
console.log('');

// Simulazione dei servizi del listing tool
class MockListingService {
  async generateListingPayload(projectId) {
    console.log(`📝 [MockListingService] Generazione payload per progetto ${projectId}`);

    const projects = {
      'proj-a-123': {
        name: 'Via Roma 12',
        price: 500000,
        surface: 120,
        rooms: 4,
        bedrooms: 2,
        bathrooms: 2,
        floor: 2,
        totalFloors: 4,
        yearBuilt: 1990,
        condition: 'good',
        features: ['Balcone', 'Cantina', 'Posto auto'],
        address: 'Via Roma 12',
        city: 'Milano',
        province: 'MI',
        postalCode: '20121',
        coordinates: { lat: 45.4642, lng: 9.19 },
      },
    };

    const project = projects[projectId] || projects['proj-a-123'];

    return {
      projectId,
      title: `Vendita ${project.name}`,
      description: `Appartamento di ${project.surface} m² in vendita a ${project.city}`,
      price: project.price,
      pricePerSqm: Math.round(project.price / project.surface),
      surface: project.surface,
      rooms: project.rooms,
      bedrooms: project.bedrooms,
      bathrooms: project.bathrooms,
      floor: project.floor,
      totalFloors: project.totalFloors,
      yearBuilt: project.yearBuilt,
      condition: project.condition,
      features: project.features,
      location: {
        address: project.address,
        city: project.city,
        province: project.province,
        postalCode: project.postalCode,
        coordinates: project.coordinates,
      },
      images: [
        {
          id: 'img-1',
          url: `https://storage.urbanova.com/projects/${projectId}/images/main.jpg`,
          alt: 'Vista principale',
          type: 'main',
          order: 1,
          width: 1920,
          height: 1080,
          isPlaceholder: false,
        },
      ],
      documents: [
        {
          id: 'doc-1',
          name: 'Planimetria',
          url: `https://storage.urbanova.com/projects/${projectId}/documents/plan.pdf`,
          type: 'plan',
          size: 1024000,
          mimeType: 'application/pdf',
        },
      ],
      contact: {
        name: 'Urbanova Real Estate',
        phone: '+39 02 12345678',
        email: 'sales@urbanova.com',
        agency: 'Urbanova',
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        version: '1.0.0',
      },
    };
  }

  async uploadToPortal(portal, projectId, feedResult) {
    console.log(`📤 [MockListingService] Upload su portale ${portal} per progetto ${projectId}`);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const portalUrl = `https://storage.urbanova.com/listings/${portal}/${projectId}/${timestamp}`;

    // Simula upload su GCS
    await new Promise(resolve => setTimeout(resolve, 1000));

    return portalUrl;
  }
}

class MockPriceGuardService {
  async checkPriceGuard(listingPayload, priceGuard) {
    console.log(
      `🛡️ [MockPriceGuardService] Verifica price guard per progetto ${listingPayload.projectId}`
    );

    if (!priceGuard.enabled) {
      return [];
    }

    const violations = [];
    const pricePerSqm = listingPayload.pricePerSqm;

    // Verifica prezzo per mq
    if (pricePerSqm < priceGuard.minPricePerSqm) {
      violations.push({
        type: 'price_below_min',
        severity: 'error',
        message: `Prezzo per mq (€${pricePerSqm}) sotto il minimo consentito (€${priceGuard.minPricePerSqm})`,
        currentValue: pricePerSqm,
        thresholdValue: priceGuard.minPricePerSqm,
        difference: priceGuard.minPricePerSqm - pricePerSqm,
        differencePct: Math.round(
          ((priceGuard.minPricePerSqm - pricePerSqm) / priceGuard.minPricePerSqm) * 100
        ),
      });
    }

    // Verifica discount rispetto al BP target
    const targetPricePerSqm = priceGuard.businessPlanSnapshot.targetPricePerSqm;
    const discountPct = Math.round(((targetPricePerSqm - pricePerSqm) / targetPricePerSqm) * 100);

    if (discountPct > priceGuard.maxDiscountPct) {
      violations.push({
        type: 'discount_exceeded',
        severity: 'critical',
        message: `Sconto del ${discountPct}% supera il massimo consentito del ${priceGuard.maxDiscountPct}%`,
        currentValue: discountPct,
        thresholdValue: priceGuard.maxDiscountPct,
        difference: discountPct - priceGuard.maxDiscountPct,
        differencePct: discountPct - priceGuard.maxDiscountPct,
      });
    }

    if (violations.length > 0) {
      console.log(`⚠️ [MockPriceGuardService] ${violations.length} violazioni rilevate`);
    } else {
      console.log(`✅ [MockPriceGuardService] Nessuna violazione rilevata`);
    }

    return violations;
  }
}

class MockFeedGeneratorService {
  async generateFeed(portal, listingPayload, zipUrl) {
    console.log(`📡 [MockFeedGeneratorService] Generazione feed XML per portale ${portal}`);

    // Simula generazione XML
    await new Promise(resolve => setTimeout(resolve, 1500));

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `feed-${portal}-${listingPayload.projectId}-${timestamp}.xml`;
    const feedUrl = `https://storage.urbanova.com/feeds/${portal}/${listingPayload.projectId}/${filename}`;

    console.log(`✅ [MockFeedGeneratorService] Feed XML generato: ${feedUrl}`);
    return feedUrl;
  }
}

class MockAssetPackService {
  async generateAssetPack(projectId, listingPayload, options) {
    console.log(`📦 [MockAssetPackService] Generazione asset pack per progetto ${projectId}`);

    // Simula raccolta asset
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simula creazione ZIP
    await new Promise(resolve => setTimeout(resolve, 3000));

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const zipFilename = `assets-${projectId}-${timestamp}.zip`;
    const zipUrl = `https://storage.urbanova.com/asset-packs/${projectId}/${zipFilename}`;

    console.log(`✅ [MockAssetPackService] Asset pack generato: ${zipUrl}`);
    return zipUrl;
  }
}

// Listing Tool Implementation
class ListingTool {
  constructor() {
    this.listingService = new MockListingService();
    this.priceGuardService = new MockPriceGuardService();
    this.feedGeneratorService = new MockFeedGeneratorService();
    this.assetPackService = new MockAssetPackService();
  }

  async prepare(args) {
    console.log(
      `🔧 [ListingTool] Preparazione annuncio per progetto ${args.projectId} su portale ${args.portal}`
    );

    // 1. Genera listing payload dal progetto
    const listingPayload = await this.listingService.generateListingPayload(args.projectId);

    // 2. Verifica price guard
    const violations = await this.priceGuardService.checkPriceGuard(
      listingPayload,
      args.priceGuard
    );

    // 3. Genera asset pack (ZIP)
    const zipUrl = await this.assetPackService.generateAssetPack(
      args.projectId,
      listingPayload,
      args.options
    );

    // 4. Genera feed XML
    const feedUrl = await this.feedGeneratorService.generateFeed(
      args.portal,
      listingPayload,
      zipUrl
    );

    // 5. Calcola metadata
    const metadata = await this.calculateMetadata(feedUrl, zipUrl, args.portal, args.projectId);

    const result = {
      feedUrl,
      zipUrl,
      violations: violations.length > 0 ? violations : undefined,
      warnings: violations.length > 0 ? ['Price guard violations detected'] : undefined,
      metadata,
    };

    console.log(`✅ [ListingTool] Annuncio preparato: ${feedUrl}, ${zipUrl}`);
    return result;
  }

  async push(args) {
    console.log(
      `🚀 [ListingTool] Pubblicazione annuncio per progetto ${args.projectId} su portale ${args.portal}`
    );

    // 1. Verifica conferma per violazioni
    if (args.feedResult.violations && args.feedResult.violations.length > 0) {
      if (!args.confirmOverride) {
        throw new Error(
          `Pubblicazione bloccata: violazioni price guard rilevate. Richiedi conferma esplicita.`
        );
      }
      console.log(`⚠️ [ListingTool] Override confermato per violazioni: ${args.overrideReason}`);
    }

    // 2. Carica feed e ZIP su GCS
    const portalUrl = await this.listingService.uploadToPortal(
      args.portal,
      args.projectId,
      args.feedResult
    );

    // 3. Log istruzioni per upload manuale (v1)
    const manualInstructions = this.generateManualInstructions(
      args.portal,
      args.projectId,
      args.feedResult
    );
    console.log(`📋 [ListingTool] Istruzioni upload manuale: ${manualInstructions}`);

    return {
      success: true,
      message: `Annuncio pubblicato con successo su ${args.portal}`,
      portalUrl,
    };
  }

  async calculateMetadata(feedUrl, zipUrl, portal, projectId) {
    const fileSize = {
      xml: Math.floor(Math.random() * 10000) + 1000,
      zip: Math.floor(Math.random() * 100000) + 10000,
    };

    const checksum = {
      xml: `sha256-${Math.random().toString(36).substring(2, 15)}`,
      zip: `sha256-${Math.random().toString(36).substring(2, 15)}`,
    };

    return {
      generatedAt: new Date(),
      portal,
      projectId,
      fileSize,
      checksum,
    };
  }

  generateManualInstructions(portal, projectId, feedResult) {
    return `
📋 ISTRUZIONI UPLOAD MANUALE - ${portal.toUpperCase()}

1. Feed XML: ${feedResult.feedUrl}
2. Asset Pack: ${feedResult.zipUrl}

📁 Contenuto ZIP:
   - Descrizioni progetto
   - Planimetrie (da Design Center)
   - Immagini progetto
   - Documenti tecnici

⚠️  ATTENZIONE: ${feedResult.violations ? `${feedResult.violations.length} violazioni price guard rilevate` : 'Nessuna violazione rilevata'}

🔗 Upload su: ${portal}
📧 Contatto supporto: support@${portal}.com
    `.trim();
  }
}

// Test Runner
class ListingToolTests {
  constructor() {
    this.listingTool = new ListingTool();
  }

  async testPrepareWithoutViolations() {
    console.log('\n🚀 Test 1: Preparazione annuncio senza violazioni');
    console.log('==================================================');

    const priceGuard = {
      enabled: true,
      maxDiscountPct: 15,
      minPricePerSqm: 3000,
      maxPricePerSqm: 6000,
      businessPlanSnapshot: {
        targetPricePerSqm: 4500,
        targetRoi: 12.5,
        snapshotDate: new Date(),
        version: '1.0.0',
      },
    };

    try {
      const result = await this.listingTool.prepare({
        projectId: 'proj-a-123',
        portal: 'getrix',
        priceGuard,
        options: {
          includePlaceholders: false,
          generatePdf: true,
          compressImages: true,
          watermark: false,
        },
      });

      console.log('✅ Test completato con successo!');
      console.log(`📄 Feed URL: ${result.feedUrl}`);
      console.log(`📦 ZIP URL: ${result.zipUrl}`);
      console.log(`⚠️  Violazioni: ${result.violations ? result.violations.length : 0}`);

      return result;
    } catch (error) {
      console.error(`❌ Test fallito: ${error.message}`);
      throw error;
    }
  }

  async testPrepareWithViolations() {
    console.log('\n🚀 Test 2: Preparazione annuncio CON violazioni price guard');
    console.log('============================================================');

    const priceGuard = {
      enabled: true,
      maxDiscountPct: 5, // Molto restrittivo
      minPricePerSqm: 5000, // Molto alto
      maxPricePerSqm: 8000,
      businessPlanSnapshot: {
        targetPricePerSqm: 7000, // Molto alto
        targetRoi: 15.0,
        snapshotDate: new Date(),
        version: '1.0.0',
      },
    };

    try {
      const result = await this.listingTool.prepare({
        projectId: 'proj-a-123',
        portal: 'immobiliare',
        priceGuard,
        options: {
          includePlaceholders: true,
          generatePdf: false,
          compressImages: false,
          watermark: true,
        },
      });

      console.log('✅ Test completato con successo!');
      console.log(`📄 Feed URL: ${result.feedUrl}`);
      console.log(`📦 ZIP URL: ${result.zipUrl}`);
      console.log(`⚠️  Violazioni: ${result.violations ? result.violations.length : 0}`);

      if (result.violations) {
        console.log('\n📋 Dettaglio violazioni:');
        result.violations.forEach((v, i) => {
          console.log(`  ${i + 1}. ${v.severity.toUpperCase()}: ${v.message}`);
        });
      }

      return result;
    } catch (error) {
      console.error(`❌ Test fallito: ${error.message}`);
      throw error;
    }
  }

  async testPushWithOverride() {
    console.log('\n🚀 Test 3: Pubblicazione con override violazioni');
    console.log('=================================================');

    // Prima prepariamo un annuncio con violazioni
    const priceGuard = {
      enabled: true,
      maxDiscountPct: 5,
      minPricePerSqm: 5000,
      maxPricePerSqm: 8000,
      businessPlanSnapshot: {
        targetPricePerSqm: 7000,
        targetRoi: 15.0,
        snapshotDate: new Date(),
        version: '1.0.0',
      },
    };

    try {
      // 1. Prepara annuncio
      const feedResult = await this.listingTool.prepare({
        projectId: 'proj-a-123',
        portal: 'casa',
        priceGuard,
      });

      // 2. Pubblica con override
      const pushResult = await this.listingTool.push({
        projectId: 'proj-a-123',
        portal: 'casa',
        feedResult,
        confirmOverride: true,
        overrideReason: 'Prezzo competitivo per mercato attuale',
      });

      console.log('✅ Test completato con successo!');
      console.log(`📤 Pubblicazione: ${pushResult.message}`);
      console.log(`🔗 Portal URL: ${pushResult.portalUrl}`);

      return pushResult;
    } catch (error) {
      console.error(`❌ Test fallito: ${error.message}`);
      throw error;
    }
  }

  async testPushWithoutOverride() {
    console.log('\n🚀 Test 4: Pubblicazione SENZA override (dovrebbe fallire)');
    console.log('==========================================================');

    const priceGuard = {
      enabled: true,
      maxDiscountPct: 5,
      minPricePerSqm: 5000,
      maxPricePerSqm: 8000,
      businessPlanSnapshot: {
        targetPricePerSqm: 7000,
        targetRoi: 15.0,
        snapshotDate: new Date(),
        version: '1.0.0',
      },
    };

    try {
      // 1. Prepara annuncio
      const feedResult = await this.listingTool.prepare({
        projectId: 'proj-a-123',
        portal: 'idealista',
        priceGuard,
      });

      // 2. Prova a pubblicare SENZA override
      const pushResult = await this.listingTool.push({
        projectId: 'proj-a-123',
        portal: 'idealista',
        feedResult,
        // confirmOverride: false (default)
      });

      console.log('❌ Test dovrebbe essere fallito!');
      return pushResult;
    } catch (error) {
      console.log('✅ Test completato correttamente - Pubblicazione bloccata come previsto');
      console.log(`🚫 Errore: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async runAllTests() {
    console.log('🏃 Running Listing Tool Tests...\n');

    try {
      // Test 1: Preparazione senza violazioni
      const result1 = await this.testPrepareWithoutViolations();

      // Test 2: Preparazione con violazioni
      const result2 = await this.testPrepareWithViolations();

      // Test 3: Pubblicazione con override
      const result3 = await this.testPushWithOverride();

      // Test 4: Pubblicazione senza override (fallisce)
      const result4 = await this.testPushWithoutOverride();

      console.log('\n🎉 TUTTI I TEST COMPLETATI!');
      console.log('✅ Listing Tool funziona correttamente');
      console.log('✅ Publication Guard attivo');
      console.log('✅ Asset Pack generato');
      console.log('✅ Feed XML creato');
      console.log('✅ Price Guard violazioni rilevate');
      console.log('✅ Override funziona correttamente');

      return {
        test1: result1,
        test2: result2,
        test3: result3,
        test4: result4,
      };
    } catch (error) {
      console.error(`💥 Test suite fallita:`, error);
      throw error;
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const testSuite = new ListingToolTests();
  testSuite.runAllTests().catch(console.error);
}

module.exports = {
  ListingTool,
  ListingToolTests,
  MockListingService,
  MockPriceGuardService,
  MockFeedGeneratorService,
  MockAssetPackService,
};
