'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.FeedGeneratorService = void 0;
/**
 * Service per la generazione di feed XML per portali immobiliari
 */
class FeedGeneratorService {
  /**
   * Genera feed XML per un portale specifico
   */
  async generateFeed(portal, listingPayload, zipUrl) {
    console.log(`📡 [FeedGeneratorService] Generazione feed XML per portale ${portal}`);
    let xmlContent;
    switch (portal.toLowerCase()) {
      case 'getrix':
        xmlContent = this.generateGetrixFeed(listingPayload, zipUrl);
        break;
      case 'immobiliare':
        xmlContent = this.generateImmobiliareFeed(listingPayload, zipUrl);
        break;
      case 'casa':
        xmlContent = this.generateCasaFeed(listingPayload, zipUrl);
        break;
      case 'idealista':
        xmlContent = this.generateIdealistaFeed(listingPayload, zipUrl);
        break;
      default:
        xmlContent = this.generateGenericFeed(listingPayload, zipUrl);
    }
    // TODO: Salva XML su GCS e restituisci URL
    const feedUrl = await this.saveFeedToGCS(portal, listingPayload.projectId, xmlContent);
    console.log(`✅ [FeedGeneratorService] Feed XML generato: ${feedUrl}`);
    return feedUrl;
  }
  /**
   * Genera feed XML in formato GETRIX
   */
  generateGetrixFeed(listingPayload, zipUrl) {
    const timestamp = new Date().toISOString();
    return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.getrix.com/schema/1.0">
  <header>
    <generator>Urbanova Listing Tool v1.0</generator>
    <timestamp>${timestamp}</timestamp>
    <portal>GETRIX</portal>
  </header>
  
  <property>
    <id>${listingPayload.projectId}</id>
    <type>residential</type>
    <status>for_sale</status>
    
    <title>${this.escapeXml(listingPayload.title)}</title>
    <description>${this.escapeXml(listingPayload.description)}</description>
    
    <price>
      <amount>${listingPayload.price}</amount>
      <currency>EUR</currency>
      <per_sqm>${listingPayload.pricePerSqm}</per_sqm>
    </price>
    
    <details>
      <surface>${listingPayload.surface}</surface>
      <rooms>${listingPayload.rooms}</rooms>
      <bedrooms>${listingPayload.bedrooms}</bedrooms>
      <bathrooms>${listingPayload.bathrooms}</bathrooms>
      <floor>${listingPayload.floor}</floor>
      <total_floors>${listingPayload.totalFloors}</total_floors>
      <year_built>${listingPayload.yearBuilt}</year_built>
      <condition>${listingPayload.condition}</condition>
    </details>
    
    <location>
      <address>${this.escapeXml(listingPayload.location.address)}</address>
      <city>${this.escapeXml(listingPayload.location.city)}</city>
      <province>${listingPayload.location.province}</province>
      <postal_code>${listingPayload.location.postalCode}</postal_code>
      ${
        listingPayload.location.coordinates
          ? `
      <coordinates>
        <lat>${listingPayload.location.coordinates.lat}</lat>
        <lng>${listingPayload.location.coordinates.lng}</lng>
      </coordinates>`
          : ''
      }
    </location>
    
    <features>
      ${listingPayload.features.map(feature => `<feature>${this.escapeXml(feature)}</feature>`).join('\n      ')}
    </features>
    
    <images>
      ${listingPayload.images
        .map(
          img => `
      <image>
        <url>${img.url}</url>
        <alt>${this.escapeXml(img.alt)}</alt>
        <type>${img.type}</type>
        <order>${img.order}</order>
        <width>${img.width}</width>
        <height>${img.height}</height>
      </image>`
        )
        .join('')}
    </images>
    
    <documents>
      ${listingPayload.documents
        .map(
          doc => `
      <document>
        <name>${this.escapeXml(doc.name)}</name>
        <url>${doc.url}</url>
        <type>${doc.type}</type>
        <size>${doc.size}</size>
        <mime_type>${doc.mimeType}</mime_type>
      </document>`
        )
        .join('')}
    </documents>
    
    <assets>
      <zip_package>${zipUrl}</zip_package>
    </assets>
    
    <contact>
      <name>${this.escapeXml(listingPayload.contact.name)}</name>
      <phone>${listingPayload.contact.phone}</phone>
      <email>${listingPayload.contact.email}</email>
      <agency>${this.escapeXml(listingPayload.contact.agency || '')}</agency>
    </contact>
    
    <metadata>
      <created_at>${listingPayload.metadata.createdAt.toISOString()}</created_at>
      <updated_at>${listingPayload.metadata.updatedAt.toISOString()}</updated_at>
      <created_by>${listingPayload.metadata.createdBy}</created_by>
      <version>${listingPayload.metadata.version}</version>
    </metadata>
  </property>
</feed>`;
  }
  /**
   * Genera feed XML in formato Immobiliare.it
   */
  generateImmobiliareFeed(listingPayload, zipUrl) {
    const timestamp = new Date().toISOString();
    return `<?xml version="1.0" encoding="UTF-8"?>
<immobiliare_feed>
  <header>
    <source>Urbanova</source>
    <timestamp>${timestamp}</timestamp>
  </header>
  
  <property>
    <reference>${listingPayload.projectId}</reference>
    <type>appartamento</type>
    <transaction>vendita</transaction>
    
    <title>${this.escapeXml(listingPayload.title)}</title>
    <description>${this.escapeXml(listingPayload.description)}</description>
    
    <price>${listingPayload.price}</price>
    <price_sqm>${listingPayload.pricePerSqm}</price_sqm>
    
    <details>
      <surface>${listingPayload.surface}</surface>
      <rooms>${listingPayload.rooms}</rooms>
      <bedrooms>${listingPayload.bedrooms}</bedrooms>
      <bathrooms>${listingPayload.bathrooms}</bathrooms>
      <floor>${listingPayload.floor}</floor>
      <total_floors>${listingPayload.totalFloors}</total_floors>
      <year>${listingPayload.yearBuilt}</year>
      <state>${listingPayload.condition}</state>
    </details>
    
    <address>
      <street>${this.escapeXml(listingPayload.location.address)}</street>
      <city>${this.escapeXml(listingPayload.location.city)}</city>
      <province>${listingPayload.location.province}</province>
      <postal_code>${listingPayload.location.postalCode}</postal_code>
    </address>
    
    <features>
      ${listingPayload.features.map(feature => `<feature>${this.escapeXml(feature)}</feature>`).join('\n      ')}
    </features>
    
    <images>
      ${listingPayload.images
        .map(
          img => `
      <image>
        <url>${img.url}</url>
        <alt>${this.escapeXml(img.alt)}</alt>
        <type>${img.type}</type>
      </image>`
        )
        .join('')}
    </images>
    
    <assets_package>${zipUrl}</assets_package>
    
    <contact>
      <agency>${this.escapeXml(listingPayload.contact.agency || 'Urbanova')}</agency>
      <phone>${listingPayload.contact.phone}</phone>
      <email>${listingPayload.contact.email}</email>
    </contact>
  </property>
</immobiliare_feed>`;
  }
  /**
   * Genera feed XML generico
   */
  generateGenericFeed(listingPayload, zipUrl) {
    const timestamp = new Date().toISOString();
    return `<?xml version="1.0" encoding="UTF-8"?>
<listing_feed>
  <header>
    <generator>Urbanova Listing Tool</generator>
    <timestamp>${timestamp}</timestamp>
    <portal>generic</portal>
  </header>
  
  <property>
    <id>${listingPayload.projectId}</id>
    <title>${this.escapeXml(listingPayload.title)}</title>
    <description>${this.escapeXml(listingPayload.description)}</description>
    <price>${listingPayload.price}</price>
    <price_per_sqm>${listingPayload.pricePerSqm}</price_per_sqm>
    <surface>${listingPayload.surface}</surface>
    <rooms>${listingPayload.rooms}</rooms>
    <bedrooms>${listingPayload.bedrooms}</bedrooms>
    <bathrooms>${listingPayload.bathrooms}</bathrooms>
    <floor>${listingPayload.floor}</floor>
    <total_floors>${listingPayload.totalFloors}</total_floors>
    <year_built>${listingPayload.yearBuilt}</year_built>
    <condition>${listingPayload.condition}</condition>
    
    <location>
      <address>${this.escapeXml(listingPayload.location.address)}</address>
      <city>${this.escapeXml(listingPayload.location.city)}</city>
      <province>${listingPayload.location.province}</province>
      <postal_code>${listingPayload.location.postalCode}</postal_code>
    </location>
    
    <features>
      ${listingPayload.features.map(feature => `<feature>${this.escapeXml(feature)}</feature>`).join('\n      ')}
    </features>
    
    <images>
      ${listingPayload.images
        .map(
          img => `
      <image>
        <url>${img.url}</url>
        <alt>${this.escapeXml(img.alt)}</alt>
        <type>${img.type}</type>
      </image>`
        )
        .join('')}
    </images>
    
    <assets_package>${zipUrl}</assets_package>
    
    <contact>
      <name>${this.escapeXml(listingPayload.contact.name)}</name>
      <phone>${listingPayload.contact.phone}</phone>
      <email>${listingPayload.contact.email}</email>
    </contact>
  </property>
</listing_feed>`;
  }
  /**
   * Genera feed per altri portali (placeholder)
   */
  generateCasaFeed(listingPayload, zipUrl) {
    return this.generateGenericFeed(listingPayload, zipUrl);
  }
  generateIdealistaFeed(listingPayload, zipUrl) {
    return this.generateGenericFeed(listingPayload, zipUrl);
  }
  /**
   * Salva feed XML su Google Cloud Storage
   */
  async saveFeedToGCS(portal, projectId, xmlContent) {
    // TODO: Implementare upload reale su GCS
    // Per ora simuliamo e restituiamo URL di esempio
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `feed-${portal}-${projectId}-${timestamp}.xml`;
    console.log(`☁️ [FeedGeneratorService] Salvataggio feed su GCS: ${filename}`);
    // Simula upload
    await new Promise(resolve => setTimeout(resolve, 1000));
    const feedUrl = `https://storage.urbanova.com/feeds/${portal}/${projectId}/${filename}`;
    console.log(`✅ [FeedGeneratorService] Feed salvato: ${feedUrl}`);
    return feedUrl;
  }
  /**
   * Escape caratteri XML speciali
   */
  escapeXml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
  /**
   * Valida XML generato
   */
  validateXml(xmlContent) {
    try {
      // TODO: Implementare validazione XML reale
      // Per ora verifichiamo solo la presenza di tag essenziali
      const requiredTags = ['<?xml', '<feed', '<property', '</feed>'];
      return requiredTags.every(tag => xmlContent.includes(tag));
    } catch (error) {
      console.error('❌ [FeedGeneratorService] Errore validazione XML:', error);
      return false;
    }
  }
}
exports.FeedGeneratorService = FeedGeneratorService;
//# sourceMappingURL=feedGeneratorService.js.map
