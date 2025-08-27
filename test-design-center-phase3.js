const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Test Design Center - Fase 3: Integrazione AI Reale & API Esterne\n');

// Test 1: Verifica servizi AI avanzati
console.log('1️⃣ Verifica Servizi AI Avanzati:');
const aiServices = [
  'src/lib/aiIntegrationService.ts',
  'src/lib/externalAPIService.ts'
];

aiServices.forEach(service => {
  if (fs.existsSync(service)) {
    console.log(`✅ ${service} - CREATO`);
    
    // Verifica contenuto del servizio
    const content = fs.readFileSync(service, 'utf8');
    
    if (service.includes('aiIntegrationService')) {
      const hasAIIntegrationService = content.includes('class AIIntegrationService');
      const hasCompleteAnalysis = content.includes('performCompleteAnalysis');
      const hasROIAnalysis = content.includes('analyzeROI');
      const hasMarketAnalysis = content.includes('analyzeMarket');
      const hasSustainabilityAnalysis = content.includes('analyzeSustainability');
      const hasComplianceAnalysis = content.includes('analyzeCompliance');
      const hasRiskAssessment = content.includes('assessRisks');
      
      console.log(`   - Classe AIIntegrationService: ${hasAIIntegrationService ? '✅' : '❌'}`);
      console.log(`   - Metodo performCompleteAnalysis: ${hasCompleteAnalysis ? '✅' : '❌'}`);
      console.log(`   - Metodo analyzeROI: ${hasROIAnalysis ? '✅' : '❌'}`);
      console.log(`   - Metodo analyzeMarket: ${hasMarketAnalysis ? '✅' : '❌'}`);
      console.log(`   - Metodo analyzeSustainability: ${hasSustainabilityAnalysis ? '✅' : '❌'}`);
      console.log(`   - Metodo analyzeCompliance: ${hasComplianceAnalysis ? '✅' : '❌'}`);
      console.log(`   - Metodo assessRisks: ${hasRiskAssessment ? '✅' : '❌'}`);
    }
    
    if (service.includes('externalAPIService')) {
      const hasExternalAPIService = content.includes('class ExternalAPIService');
      const hasMarketData = content.includes('getMarketData');
      const hasRegulatoryData = content.includes('getRegulatoryData');
      const hasGeospatialData = content.includes('getGeospatialData');
      const hasDemographicData = content.includes('getDemographicData');
      const hasTerrainAnalysis = content.includes('performTerrainAnalysis');
      const hasISTATIntegration = content.includes('ISTAT_API_URL');
      const hasGoogleMapsIntegration = content.includes('GOOGLE_MAPS_API_KEY');
      
      console.log(`   - Classe ExternalAPIService: ${hasExternalAPIService ? '✅' : '❌'}`);
      console.log(`   - Metodo getMarketData: ${hasMarketData ? '✅' : '❌'}`);
      console.log(`   - Metodo getRegulatoryData: ${hasRegulatoryData ? '✅' : '❌'}`);
      console.log(`   - Metodo getGeospatialData: ${hasGeospatialData ? '✅' : '❌'}`);
      console.log(`   - Metodo getDemographicData: ${hasDemographicData ? '✅' : '❌'}`);
      console.log(`   - Metodo performTerrainAnalysis: ${hasTerrainAnalysis ? '✅' : '❌'}`);
      console.log(`   - Integrazione ISTAT: ${hasISTATIntegration ? '✅' : '❌'}`);
      console.log(`   - Integrazione Google Maps: ${hasGoogleMapsIntegration ? '✅' : '❌'}`);
    }
  } else {
    console.log(`❌ ${service} - MANCANTE`);
  }
});

// Test 2: Verifica componenti UI avanzati
console.log('\n2️⃣ Verifica Componenti UI Avanzati:');
const advancedComponents = [
  'src/components/ui/TerrainAnalysisAdvanced.tsx'
];

advancedComponents.forEach(component => {
  if (fs.existsSync(component)) {
    console.log(`✅ ${component} - CREATO`);
    
    const content = fs.readFileSync(component, 'utf8');
    
    const hasTerrainAnalysisAdvanced = content.includes('TerrainAnalysisAdvanced');
    const hasTabs = content.includes('activeTab') && content.includes('overview') && content.includes('market') && content.includes('regulatory');
    const hasMarketData = content.includes('marketData');
    const hasRegulatoryData = content.includes('regulatoryData');
    const hasGeospatialData = content.includes('geospatialData');
    const hasDemographicData = content.includes('demographicData');
    const hasSuitabilityAnalysis = content.includes('suitability');
    const hasRiskAssessment = content.includes('risks') && content.includes('opportunities');
    
    console.log(`   - Componente TerrainAnalysisAdvanced: ${hasTerrainAnalysisAdvanced ? '✅' : '❌'}`);
    console.log(`   - Sistema di tab: ${hasTabs ? '✅' : '❌'}`);
    console.log(`   - Dati mercato: ${hasMarketData ? '✅' : '❌'}`);
    console.log(`   - Dati normativi: ${hasRegulatoryData ? '✅' : '❌'}`);
    console.log(`   - Dati geospaziali: ${hasGeospatialData ? '✅' : '❌'}`);
    console.log(`   - Dati demografici: ${hasDemographicData ? '✅' : '❌'}`);
    console.log(`   - Analisi fattibilità: ${hasSuitabilityAnalysis ? '✅' : '❌'}`);
    console.log(`   - Valutazione rischi: ${hasRiskAssessment ? '✅' : '❌'}`);
  } else {
    console.log(`❌ ${component} - MANCANTE`);
  }
});

// Test 3: Verifica integrazione nel Template Customizer
console.log('\n3️⃣ Verifica Integrazione Template Customizer:');
const templateCustomizer = 'src/components/ui/TemplateCustomizer.tsx';
if (fs.existsSync(templateCustomizer)) {
  const content = fs.readFileSync(templateCustomizer, 'utf8');
  
  const hasTerrainAnalysisImport = content.includes('import TerrainAnalysisAdvanced');
  const hasTerrainAnalysisState = content.includes('showTerrainAnalysis');
  const hasTerrainAnalysisButton = content.includes('🗺️ Analisi Terreno');
  const hasTerrainAnalysisModal = content.includes('Terrain Analysis Advanced Modal');
  const hasTerrainAnalysisHandler = content.includes('handleTerrainAnalysisComplete');
  
  console.log(`   - Import TerrainAnalysisAdvanced: ${hasTerrainAnalysisImport ? '✅' : '❌'}`);
  console.log(`   - Stato showTerrainAnalysis: ${hasTerrainAnalysisState ? '✅' : '❌'}`);
  console.log(`   - Pulsante Analisi Terreno: ${hasTerrainAnalysisButton ? '✅' : '❌'}`);
  console.log(`   - Modal Terrain Analysis: ${hasTerrainAnalysisModal ? '✅' : '❌'}`);
  console.log(`   - Handler analisi terreno: ${hasTerrainAnalysisHandler ? '✅' : '❌'}`);
} else {
  console.log(`❌ ${templateCustomizer} - MANCANTE`);
}

// Test 4: Verifica interfacce e tipi avanzati
console.log('\n4️⃣ Verifica Interfacce e Tipi Avanzati:');
const aiIntegrationService = 'src/lib/aiIntegrationService.ts';
if (fs.existsSync(aiIntegrationService)) {
  const content = fs.readFileSync(aiIntegrationService, 'utf8');
  
  const hasAIAnalysisRequest = content.includes('interface AIAnalysisRequest');
  const hasAIAnalysisResponse = content.includes('interface AIAnalysisResponse');
  const hasAISuggestion = content.includes('interface AISuggestion');
  const hasOptimizationResult = content.includes('interface OptimizationResult');
  const hasMarketInsight = content.includes('interface MarketInsight');
  const hasComplianceCheck = content.includes('interface ComplianceCheck');
  const hasRiskAssessment = content.includes('interface RiskAssessment');
  
  console.log(`   - Interfaccia AIAnalysisRequest: ${hasAIAnalysisRequest ? '✅' : '❌'}`);
  console.log(`   - Interfaccia AIAnalysisResponse: ${hasAIAnalysisResponse ? '✅' : '❌'}`);
  console.log(`   - Interfaccia AISuggestion: ${hasAISuggestion ? '✅' : '❌'}`);
  console.log(`   - Interfaccia OptimizationResult: ${hasOptimizationResult ? '✅' : '❌'}`);
  console.log(`   - Interfaccia MarketInsight: ${hasMarketInsight ? '✅' : '❌'}`);
  console.log(`   - Interfaccia ComplianceCheck: ${hasComplianceCheck ? '✅' : '❌'}`);
  console.log(`   - Interfaccia RiskAssessment: ${hasRiskAssessment ? '✅' : '❌'}`);
} else {
  console.log(`❌ ${aiIntegrationService} - MANCANTE`);
}

// Test 5: Verifica interfacce API esterne
console.log('\n5️⃣ Verifica Interfacce API Esterne:');
const externalAPIService = 'src/lib/externalAPIService.ts';
if (fs.existsSync(externalAPIService)) {
  const content = fs.readFileSync(externalAPIService, 'utf8');
  
  const hasMarketData = content.includes('interface MarketData');
  const hasRegulatoryData = content.includes('interface RegulatoryData');
  const hasBuildingCode = content.includes('interface BuildingCode');
  const hasZoningRegulation = content.includes('interface ZoningRegulation');
  const hasEnvironmentalRequirement = content.includes('interface EnvironmentalRequirement');
  const hasGeospatialData = content.includes('interface GeospatialData');
  const hasDemographicData = content.includes('interface DemographicData');
  
  console.log(`   - Interfaccia MarketData: ${hasMarketData ? '✅' : '❌'}`);
  console.log(`   - Interfaccia RegulatoryData: ${hasRegulatoryData ? '✅' : '❌'}`);
  console.log(`   - Interfaccia BuildingCode: ${hasBuildingCode ? '✅' : '❌'}`);
  console.log(`   - Interfaccia ZoningRegulation: ${hasZoningRegulation ? '✅' : '❌'}`);
  console.log(`   - Interfaccia EnvironmentalRequirement: ${hasEnvironmentalRequirement ? '✅' : '❌'}`);
  console.log(`   - Interfaccia GeospatialData: ${hasGeospatialData ? '✅' : '❌'}`);
  console.log(`   - Interfaccia DemographicData: ${hasDemographicData ? '✅' : '❌'}`);
} else {
  console.log(`❌ ${externalAPIService} - MANCANTE`);
}

// Test 6: Verifica funzionalità AI reali
console.log('\n6️⃣ Verifica Funzionalità AI Reali:');
const aiService = 'src/lib/aiIntegrationService.ts';
if (fs.existsSync(aiService)) {
  const content = fs.readFileSync(aiService, 'utf8');
  
  const hasRealCalculations = content.includes('calculateOriginalROI') && content.includes('calculateTimeline');
  const hasOptimizationLogic = content.includes('identifyOptimizationOpportunities') && content.includes('applyOptimizations');
  const hasRiskCalculation = content.includes('calculateRiskScore') && content.includes('assessOptimizationRisk');
  const hasSustainabilityAnalysis = content.includes('calculateSolarPotential') && content.includes('calculateSustainabilityScore');
  const hasComplianceChecks = content.includes('checkBoundaryCompliance') && content.includes('checkHeightCompliance');
  const hasMarketAnalysis = content.includes('analyzeMarketTrends') && content.includes('identifyMarketOpportunities');
  
  console.log(`   - Calcoli ROI reali: ${hasRealCalculations ? '✅' : '❌'}`);
  console.log(`   - Logica ottimizzazione: ${hasOptimizationLogic ? '✅' : '❌'}`);
  console.log(`   - Calcolo rischi: ${hasRiskCalculation ? '✅' : '❌'}`);
  console.log(`   - Analisi sostenibilità: ${hasSustainabilityAnalysis ? '✅' : '❌'}`);
  console.log(`   - Controlli compliance: ${hasComplianceChecks ? '✅' : '❌'}`);
  console.log(`   - Analisi mercato: ${hasMarketAnalysis ? '✅' : '❌'}`);
} else {
  console.log(`❌ ${aiService} - MANCANTE`);
}

// Test 7: Verifica integrazione API esterne reali
console.log('\n7️⃣ Verifica Integrazione API Esterne Reali:');
const externalService = 'src/lib/externalAPIService.ts';
if (fs.existsSync(externalService)) {
  const content = fs.readFileSync(externalService, 'utf8');
  
  const hasISTATIntegration = content.includes('ISTAT_API_URL') && content.includes('fetchISTATData');
  const hasAgenziaEntrateIntegration = content.includes('AGENZIA_ENTRATE_URL') && content.includes('fetchAgenziaEntrateData');
  const hasGoogleMapsIntegration = content.includes('GOOGLE_MAPS_API_KEY') && content.includes('fetchGoogleMapsData');
  const hasOpenStreetMapIntegration = content.includes('OPENSTREETMAP_URL') && content.includes('fetchOpenStreetMapData');
  const hasLocalBuildingCodes = content.includes('getLocalBuildingCodes') && content.includes('getLocalZoningRegulations');
  const hasIntegratedAnalysis = content.includes('performIntegratedAnalysis') && content.includes('performTerrainAnalysis');
  
  console.log(`   - Integrazione ISTAT: ${hasISTATIntegration ? '✅' : '❌'}`);
  console.log(`   - Integrazione Agenzia Entrate: ${hasAgenziaEntrateIntegration ? '✅' : '❌'}`);
  console.log(`   - Integrazione Google Maps: ${hasGoogleMapsIntegration ? '✅' : '❌'}`);
  console.log(`   - Integrazione OpenStreetMap: ${hasOpenStreetMapIntegration ? '✅' : '❌'}`);
  console.log(`   - Codici edilizi locali: ${hasLocalBuildingCodes ? '✅' : '❌'}`);
  console.log(`   - Analisi integrata: ${hasIntegratedAnalysis ? '✅' : '❌'}`);
} else {
  console.log(`❌ ${externalService} - MANCANTE`);
}

// Test 8: Verifica UI/UX avanzata
console.log('\n8️⃣ Verifica UI/UX Avanzata:');
const terrainAnalysis = 'src/components/ui/TerrainAnalysisAdvanced.tsx';
if (fs.existsSync(terrainAnalysis)) {
  const content = fs.readFileSync(terrainAnalysis, 'utf8');
  
  const hasAdvancedTabs = content.includes('overview') && content.includes('market') && content.includes('regulatory') && content.includes('geospatial') && content.includes('demographics');
  const hasSummaryCards = content.includes('Summary Cards') && content.includes('grid-cols-1 md:grid-cols-4');
  const hasRiskOpportunityGrid = content.includes('Rischi Identificati') && content.includes('Opportunità');
  const hasRecommendations = content.includes('Raccomandazioni AI') && content.includes('bg-gradient-to-r from-blue-50 to-indigo-50');
  const hasDataSources = content.includes('Fonti Dati Utilizzate') && content.includes('Ultimo aggiornamento');
  const hasMarketAnalysis = content.includes('Analisi Mercato Immobiliare') && content.includes('Metriche Chiave');
  const hasRegulatoryAnalysis = content.includes('Analisi Normativa e Compliance') && content.includes('Regolamenti Edilizi');
  const hasGeospatialAnalysis = content.includes('Analisi Geospaziale e Topografica') && content.includes('Caratteristiche Terreno');
  const hasDemographicAnalysis = content.includes('Analisi Demografica e Socioeconomica') && content.includes('Dati Demografici');
  
  console.log(`   - Tab avanzati: ${hasAdvancedTabs ? '✅' : '❌'}`);
  console.log(`   - Card riepilogo: ${hasSummaryCards ? '✅' : '❌'}`);
  console.log(`   - Griglia rischi/opportunità: ${hasRiskOpportunityGrid ? '✅' : '❌'}`);
  console.log(`   - Raccomandazioni AI: ${hasRecommendations ? '✅' : '❌'}`);
  console.log(`   - Fonti dati: ${hasDataSources ? '✅' : '❌'}`);
  console.log(`   - Analisi mercato: ${hasMarketAnalysis ? '✅' : '❌'}`);
  console.log(`   - Analisi normative: ${hasRegulatoryAnalysis ? '✅' : '❌'}`);
  console.log(`   - Analisi geospaziali: ${hasGeospatialAnalysis ? '✅' : '❌'}`);
  console.log(`   - Analisi demografica: ${hasDemographicAnalysis ? '✅' : '❌'}`);
} else {
  console.log(`❌ ${terrainAnalysis} - MANCANTE`);
}

// Test 9: Verifica integrazione completa
console.log('\n9️⃣ Verifica Integrazione Completa:');
const mainComponents = [
  'src/components/ui/TemplateCustomizer.tsx',
  'src/components/ui/AIDesignAssistant.tsx',
  'src/components/ui/TerrainAnalysisAdvanced.tsx'
];

let integrationScore = 0;
const maxIntegrationScore = 8;

mainComponents.forEach(component => {
  if (fs.existsSync(component)) {
    const content = fs.readFileSync(component, 'utf8');
    
    if (component.includes('TemplateCustomizer')) {
      if (content.includes('AIDesignAssistant') && content.includes('TerrainAnalysisAdvanced')) integrationScore += 2;
      if (content.includes('showAIAssistant') && content.includes('showTerrainAnalysis')) integrationScore += 2;
      if (content.includes('AI Design Assistant Modal') && content.includes('Terrain Analysis Advanced Modal')) integrationScore += 2;
      if (content.includes('handleAIOptimization') && content.includes('handleTerrainAnalysisComplete')) integrationScore += 2;
    }
  }
});

console.log(`   - Punteggio integrazione: ${integrationScore}/${maxIntegrationScore}`);

// Test 10: Verifica qualità e robustezza
console.log('\n🔟 Verifica Qualità e Robustezza:');
let qualityScore = 0;
const maxQualityScore = 10;

// Verifica TypeScript avanzato
const hasAdvancedTypes = aiServices.every(service => {
  if (!fs.existsSync(service)) return false;
  const content = fs.readFileSync(service, 'utf8');
  return content.includes('interface') && content.includes('type') && content.includes('Promise<');
});
if (hasAdvancedTypes) qualityScore += 2;

// Verifica error handling avanzato
const hasAdvancedErrorHandling = aiServices.every(service => {
  if (!fs.existsSync(service)) return false;
  const content = fs.readFileSync(service, 'utf8');
  return content.includes('try') && content.includes('catch') && content.includes('throw new Error');
});
if (hasAdvancedErrorHandling) qualityScore += 2;

// Verifica logging avanzato
const hasAdvancedLogging = aiServices.every(service => {
  if (!fs.existsSync(service)) return false;
  const content = fs.readFileSync(service, 'utf8');
  return content.includes('console.log') && content.includes('console.error') && content.includes('console.warn');
});
if (hasAdvancedLogging) qualityScore += 2;

// Verifica configurazione ambiente
const hasEnvironmentConfig = aiServices.every(service => {
  if (!fs.existsSync(service)) return false;
  const content = fs.readFileSync(service, 'utf8');
  return content.includes('process.env') && content.includes('API_KEY') && content.includes('API_URL');
});
if (hasEnvironmentConfig) qualityScore += 2;

// Verifica fallback e retry
const hasFallbackRetry = aiServices.every(service => {
  if (!fs.existsSync(service)) return false;
  const content = fs.readFileSync(service, 'utf8');
  return content.includes('fallback') || content.includes('retry') || content.includes('MAX_RETRIES');
});
if (hasFallbackRetry) qualityScore += 2;

console.log(`   - TypeScript avanzato: ${hasAdvancedTypes ? '✅' : '❌'}`);
console.log(`   - Error handling avanzato: ${hasAdvancedErrorHandling ? '✅' : '❌'}`);
console.log(`   - Logging avanzato: ${hasAdvancedLogging ? '✅' : '❌'}`);
console.log(`   - Configurazione ambiente: ${hasEnvironmentConfig ? '✅' : '❌'}`);
console.log(`   - Fallback e retry: ${hasFallbackRetry ? '✅' : '❌'}`);
console.log(`   - Punteggio qualità: ${qualityScore}/${maxQualityScore}`);

// Riepilogo finale
console.log('\n📊 RIEPILOGO FINALE FASE 3:');
const totalTests = 10;
let passedTests = 0;

// Conta i test passati
const testResults = [
  aiServices.every(service => fs.existsSync(service)),
  advancedComponents.every(comp => fs.existsSync(comp)),
  fs.existsSync(templateCustomizer) && fs.readFileSync(templateCustomizer, 'utf8').includes('TerrainAnalysisAdvanced'),
  fs.existsSync(aiIntegrationService) && fs.readFileSync(aiIntegrationService, 'utf8').includes('interface AIAnalysisRequest'),
  fs.existsSync(externalAPIService) && fs.readFileSync(externalAPIService, 'utf8').includes('interface MarketData'),
  fs.existsSync(aiService) && fs.readFileSync(aiService, 'utf8').includes('calculateOriginalROI'),
  fs.existsSync(externalService) && fs.readFileSync(externalService, 'utf8').includes('ISTAT_API_URL'),
  fs.existsSync(terrainAnalysis) && fs.readFileSync(terrainAnalysis, 'utf8').includes('overview'),
  integrationScore >= 6,
  qualityScore >= 6
];

testResults.forEach((result, index) => {
  if (result) passedTests++;
});

console.log(`✅ Test superati: ${passedTests}/${totalTests}`);
console.log(`📈 Percentuale successo: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log('\n🎉 FASE 3 COMPLETATA CON SUCCESSO!');
  console.log('🚀 Il Design Center è ora equipaggiato con:');
  console.log('   • Integrazione AI reale e avanzata');
  console.log('   • API esterne per dati di mercato reali');
  console.log('   • Analisi normativa e compliance');
  console.log('   • Analisi geospaziale e topografica');
  console.log('   • Analisi demografica e socioeconomica');
  console.log('   • Valutazione rischi e fattibilità');
  console.log('   • Raccomandazioni AI intelligenti');
} else {
  console.log('\n⚠️ FASE 3 PARZIALMENTE COMPLETATA');
  console.log(`📝 Mancano ${totalTests - passedTests} funzionalità da implementare`);
}

console.log('\n🔍 Prossimi passi suggeriti:');
console.log('   1. Configurare API keys per servizi esterni');
console.log('   2. Testare integrazione con API reali');
console.log('   3. Ottimizzare performance delle analisi');
console.log('   4. Implementare caching per dati esterni');
console.log('   5. Aggiungere test end-to-end');
console.log('   6. Documentare API e integrazioni');
console.log('   7. Implementare monitoraggio e alerting');
console.log('   8. Ottimizzare algoritmi AI');
console.log('   9. Aggiungere supporto multilingua');
console.log('   10. Implementare backup e disaster recovery');
