"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetPackService = void 0;
/**
 * Service per la generazione di asset pack (ZIP) per i listing
 */
class AssetPackService {
    /**
     * Genera asset pack ZIP per un progetto
     */
    async generateAssetPack(projectId, listingPayload, options) {
        console.log(`📦 [AssetPackService] Generazione asset pack per progetto ${projectId}`);
        // 1. Raccogli tutti gli asset
        const assets = await this.collectProjectAssets(projectId, listingPayload, options);
        // 2. Genera ZIP
        const zipUrl = await this.createZipPackage(projectId, assets);
        // 3. Valida contenuto
        await this.validateAssetPack(zipUrl, assets);
        console.log(`✅ [AssetPackService] Asset pack generato: ${zipUrl}`);
        return zipUrl;
    }
    /**
     * Raccoglie tutti gli asset del progetto
     */
    async collectProjectAssets(projectId, listingPayload, options) {
        const assets = {
            descriptions: await this.getDescriptions(listingPayload),
            images: await this.getImages(listingPayload, options),
            documents: await this.getDocuments(listingPayload),
            planimetrie: await this.getPlanimetrie(projectId),
            marketing: await this.getMarketingMaterials(projectId),
            metadata: this.generateMetadata(listingPayload),
        };
        console.log(`📁 [AssetPackService] Asset raccolti:`);
        console.log(`  - Descrizioni: ${assets.descriptions.length}`);
        console.log(`  - Immagini: ${assets.images.length}`);
        console.log(`  - Documenti: ${assets.documents.length}`);
        console.log(`  - Planimetrie: ${assets.planimetrie.length}`);
        console.log(`  - Marketing: ${assets.marketing.length}`);
        return assets;
    }
    /**
     * Ottiene descrizioni del progetto
     */
    async getDescriptions(listingPayload) {
        return [
            {
                filename: 'description.txt',
                content: listingPayload.description,
                type: 'text',
            },
            {
                filename: 'features.txt',
                content: listingPayload.features.join('\n'),
                type: 'text',
            },
            {
                filename: 'details.txt',
                content: `Superficie: ${listingPayload.surface} m²
Locali: ${listingPayload.rooms}
Camere: ${listingPayload.bedrooms}
Bagni: ${listingPayload.bathrooms}
Piano: ${listingPayload.floor}/${listingPayload.totalFloors}
Anno: ${listingPayload.yearBuilt}
Condizioni: ${listingPayload.condition}`,
                type: 'text',
            },
        ];
    }
    /**
     * Ottiene immagini del progetto
     */
    async getImages(listingPayload, options) {
        const images = [];
        for (const img of listingPayload.images) {
            if (img.isPlaceholder && !options?.includePlaceholders) {
                continue; // Salta placeholder se non richiesti
            }
            // TODO: Integrare con ImageService per download e processing reale
            const processedImage = await this.processImage(img, options);
            images.push(processedImage);
        }
        return images;
    }
    /**
     * Processa immagine (compressione, watermark, etc.)
     */
    async processImage(img, options) {
        let imageUrl = img.url;
        if (options?.compressImages) {
            // TODO: Implementare compressione reale
            imageUrl = imageUrl.replace('.jpg', '_compressed.jpg');
            console.log(`  🖼️ [AssetPackService] Immagine compressa: ${img.alt}`);
        }
        if (options?.watermark) {
            // TODO: Implementare watermark reale
            imageUrl = imageUrl.replace('.jpg', '_watermarked.jpg');
            console.log(`  🏷️ [AssetPackService] Watermark applicato: ${img.alt}`);
        }
        return {
            filename: `images/${img.type}_${img.order}.jpg`,
            url: imageUrl,
            alt: img.alt,
            type: img.type,
            width: img.width,
            height: img.height,
        };
    }
    /**
     * Ottiene documenti del progetto
     */
    async getDocuments(listingPayload) {
        const documents = [];
        for (const doc of listingPayload.documents) {
            // TODO: Integrare con DocumentService per download reale
            documents.push({
                filename: `documents/${doc.name}`,
                url: doc.url,
                type: doc.type,
                size: doc.size,
            });
        }
        return documents;
    }
    /**
     * Ottiene planimetrie dal Design Center
     */
    async getPlanimetrie(projectId) {
        console.log(`🏗️ [AssetPackService] Recupero planimetrie da Design Center per progetto ${projectId}`);
        // TODO: Integrare con DesignCenterService per planimetrie reali
        // Per ora simuliamo il recupero
        const planimetrie = [
            {
                filename: 'planimetrie/pianta_generale.pdf',
                url: `https://storage.urbanova.com/projects/${projectId}/design/pianta_generale.pdf`,
                type: 'plan',
                description: "Pianta generale dell'immobile",
            },
            {
                filename: 'planimetrie/sezioni.pdf',
                url: `https://storage.urbanova.com/projects/${projectId}/design/sezioni.pdf`,
                type: 'plan',
                description: 'Sezioni verticali',
            },
            {
                filename: 'planimetrie/prospetti.pdf',
                url: `https://storage.urbanova.com/projects/${projectId}/design/prospetti.pdf`,
                type: 'plan',
                description: 'Prospetti esterni',
            },
        ];
        // Simula delay di generazione
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log(`✅ [AssetPackService] ${planimetrie.length} planimetrie recuperate`);
        return planimetrie;
    }
    /**
     * Ottiene materiali di marketing
     */
    async getMarketingMaterials(projectId) {
        console.log(`📢 [AssetPackService] Generazione materiali marketing per progetto ${projectId}`);
        // TODO: Integrare con MarketingService per materiali reali
        const materials = [
            {
                filename: 'marketing/brochure.pdf',
                content: `Brochure progetto ${projectId}`,
                type: 'pdf',
            },
            {
                filename: 'marketing/presentazione.pptx',
                content: `Presentazione progetto ${projectId}`,
                type: 'presentation',
            },
            {
                filename: 'marketing/social_media.txt',
                content: `Testi per social media:
        
🏠 NUOVO APPARTAMENTO IN VENDITA!
📍 ${projectId}
💰 Prezzo competitivo
📱 Contattaci per maggiori informazioni

#immobili #vendita #${projectId}`,
                type: 'text',
            },
        ];
        return materials;
    }
    /**
     * Genera metadata dell'asset pack
     */
    generateMetadata(listingPayload) {
        return {
            filename: 'metadata.json',
            content: JSON.stringify({
                projectId: listingPayload.projectId,
                generatedAt: new Date().toISOString(),
                version: '1.0.0',
                totalAssets: 0, // Sarà calcolato dopo
                checksum: '',
                portal: 'generic',
            }, null, 2),
            type: 'json',
        };
    }
    /**
     * Crea pacchetto ZIP
     */
    async createZipPackage(projectId, assets) {
        console.log(`🗜️ [AssetPackService] Creazione pacchetto ZIP per progetto ${projectId}`);
        // TODO: Implementare creazione ZIP reale
        // Per ora simuliamo il processo
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const zipFilename = `assets-${projectId}-${timestamp}.zip`;
        // Simula creazione ZIP
        await new Promise(resolve => setTimeout(resolve, 3000));
        const zipUrl = `https://storage.urbanova.com/asset-packs/${projectId}/${zipFilename}`;
        console.log(`✅ [AssetPackService] ZIP creato: ${zipUrl}`);
        return zipUrl;
    }
    /**
     * Valida asset pack generato
     */
    async validateAssetPack(zipUrl, assets) {
        console.log(`🔍 [AssetPackService] Validazione asset pack: ${zipUrl}`);
        // Calcola numero totale di asset
        const totalAssets = Object.values(assets).flat().length;
        // Verifica che tutti i tipi di asset siano presenti
        const requiredAssetTypes = ['descriptions', 'images', 'planimetrie'];
        const missingTypes = requiredAssetTypes.filter(type => !assets[type] || assets[type].length === 0);
        if (missingTypes.length > 0) {
            console.warn(`⚠️ [AssetPackService] Asset types mancanti: ${missingTypes.join(', ')}`);
        }
        // Aggiorna metadata
        assets.metadata.content = JSON.stringify({
            ...JSON.parse(assets.metadata.content),
            totalAssets,
            missingTypes: missingTypes.length > 0 ? missingTypes : undefined,
        }, null, 2);
        console.log(`✅ [AssetPackService] Asset pack validato: ${totalAssets} asset totali`);
    }
    /**
     * Genera report dell'asset pack
     */
    generateAssetPackReport(assets) {
        const totalAssets = Object.values(assets).flat().length;
        let report = `📦 REPORT ASSET PACK\n`;
        report += `==================\n\n`;
        Object.entries(assets).forEach(([type, items]) => {
            report += `${type.toUpperCase()}:\n`;
            if (Array.isArray(items)) {
                items.forEach((item, index) => {
                    report += `  ${index + 1}. ${item.filename || item.name || `Item ${index + 1}`}\n`;
                });
            }
            report += `  Totale: ${Array.isArray(items) ? items.length : 0}\n\n`;
        });
        report += `📊 STATISTICHE:\n`;
        report += `• Asset totali: ${totalAssets}\n`;
        report += `• Tipi supportati: ${Object.keys(assets).length}\n`;
        report += `• Generato il: ${new Date().toLocaleString('it-IT')}\n`;
        return report;
    }
}
exports.AssetPackService = AssetPackService;
//# sourceMappingURL=assetPackService.js.map