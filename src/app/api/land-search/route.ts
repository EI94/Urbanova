import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Inizializza Resend solo se l'API key è configurata
let resend: Resend | null = null;
try {
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey && apiKey !== 'undefined' && apiKey !== '' && apiKey !== 'your-resend-api-key') {
    resend = new Resend(apiKey);
  }
} catch (error) {
  console.warn('⚠️ Resend non configurato - modalità simulazione');
  resend = null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { location, criteria, email } = body;

    console.log('🔍 AI Agent: Avvio ricerca intelligente per', location, 'email:', email);

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email richiesta per la ricerca'
      }, { status: 400 });
    }

    // AGENT REACT: REASONING + ACTING
    console.log('🤖 Avvio processo ReAct...');
    const intelligentResults = await performReActSearch(location || 'Roma', criteria, email);

    // Invia email con i risultati filtrati dall'AI
    let emailSent = false;
    try {
      const emailHtml = generateEmailHTML(intelligentResults, location || 'Roma');
      
      if (resend) {
        await resend.emails.send({
          from: 'Urbanova AI <noreply@urbanova.life>',
          to: email,
          subject: `🏗️ AI Agent: ${intelligentResults.lands.length} terreni selezionati a ${location || 'Roma'} - Urbanova`,
          html: emailHtml
        });
        
        emailSent = true;
        console.log('✅ Email inviata con successo a:', email);
      } else {
        console.log('📧 Modalità simulazione - email non inviata');
        emailSent = false;
      }
    } catch (emailError) {
      console.error('❌ Errore invio email:', emailError);
      emailSent = false;
    }

    intelligentResults.emailSent = emailSent;

    return NextResponse.json({
      success: true,
      data: intelligentResults,
      location,
      email,
      emailSent,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ AI Agent: Errore:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Errore durante la ricerca intelligente',
      message: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 });
  }
}

async function performReActSearch(location: string, criteria: any, email: string) {
  console.log('🤖 REACT AGENT: Fase 1 - ANALISI INTELLIGENTE');
  
  // STEP 1: REASONING - Analisi profonda dei criteri
  const searchCriteria = analyzeSearchCriteria(criteria, location);
  console.log('🧠 Criteri analizzati:', searchCriteria);
  
  // STEP 2: REASONING - Strategia di ricerca multipla
  const searchStrategy = createSearchStrategy(location, searchCriteria);
  console.log('🎯 Strategia di ricerca:', searchStrategy);
  
  // STEP 3: ACTING - Ricerca profonda su multiple fonti
  console.log('🤖 REACT AGENT: Fase 2 - RICERCA PROFONDA');
  const allLands = await performDeepResearch(location, searchCriteria, searchStrategy);
  console.log(`📊 Trovati ${allLands.length} terreni grezzi`);
  
  // STEP 4: REASONING - Analisi e filtraggio intelligente
  console.log('🤖 REACT AGENT: Fase 3 - ANALISI INTELLIGENTE');
  const filteredLands = await intelligentFiltering(allLands, searchCriteria);
  console.log(`✅ ${filteredLands.length} terreni selezionati dall'AI`);
  
  // STEP 5: REASONING - Analisi AI avanzata con deep insights
  console.log('🤖 REACT AGENT: Fase 4 - ANALISI PROFONDA');
  const aiAnalysis = await performDeepAIAnalysis(filteredLands, searchCriteria, location);
  
  // STEP 6: ACTING - Genera raccomandazioni strategiche
  const recommendations = generateStrategicRecommendations(filteredLands, searchCriteria, location, allLands.length);
  
  // STEP 7: REASONING - Analisi di mercato avanzata
  const marketInsights = performMarketAnalysis(filteredLands, location, searchCriteria);
  
  return {
    lands: filteredLands,
    analysis: aiAnalysis,
    emailSent: false,
    summary: {
      totalFound: filteredLands.length,
      totalScraped: allLands.length,
      averagePrice: filteredLands.length > 0 ? Math.round(filteredLands.reduce((sum, land) => sum + land.price, 0) / filteredLands.length) : 0,
      bestOpportunities: filteredLands.slice(0, 3),
      marketTrends: marketInsights.trends,
      recommendations: recommendations,
      searchCriteria: searchCriteria,
      searchStrategy: searchStrategy,
      marketInsights: marketInsights
    }
  };
}

function analyzeSearchCriteria(criteria: any, location: string) {
  return {
    location: location,
    priceRange: {
      min: criteria?.minPrice || 0,
      max: criteria?.maxPrice || 1000000
    },
    areaRange: {
      min: criteria?.minArea || 500,
      max: criteria?.maxArea || 10000
    },
    propertyType: criteria?.propertyType || 'residenziale',
    mustHaveFeatures: ['edificabile'],
    preferredFeatures: ['permessi', 'residenziale', 'commerciale'],
    maxDistance: criteria?.maxDistance || 50,
    priority: criteria?.priority || 'price' // price, area, location
  };
}

function createSearchStrategy(location: string, searchCriteria: any) {
  console.log('🎯 Creazione strategia di ricerca intelligente...');
  
  const strategy = {
    primarySources: [
      { name: 'immobiliare.it', priority: 1, searchTypes: ['direct', 'category', 'map'] },
      { name: 'casa.it', priority: 2, searchTypes: ['direct', 'category'] },
      { name: 'idealista.it', priority: 3, searchTypes: ['direct', 'category'] }
    ],
    secondarySources: [
      { name: 'borsinoimmobiliare.it', priority: 4, searchTypes: ['market-data'] },
      { name: 'tecnocasa.it', priority: 5, searchTypes: ['direct'] }
    ],
    searchVariations: [
      location,
      location.toLowerCase(),
      location.replace(/\s+/g, '-'),
      location.replace(/\s+/g, ''),
      `${location} centro`,
      `${location} periferia`
    ],
    priceRanges: [
      { min: searchCriteria.priceRange.min, max: searchCriteria.priceRange.max },
      { min: searchCriteria.priceRange.min * 0.8, max: searchCriteria.priceRange.max * 1.2 },
      { min: searchCriteria.priceRange.min * 0.6, max: searchCriteria.priceRange.max * 1.4 }
    ],
    areaRanges: [
      { min: searchCriteria.areaRange.min, max: searchCriteria.areaRange.max },
      { min: searchCriteria.areaRange.min * 0.7, max: searchCriteria.areaRange.max * 1.3 }
    ]
  };
  
  console.log('✅ Strategia creata:', strategy);
  return strategy;
}

async function performDeepResearch(location: string, searchCriteria: any, searchStrategy: any) {
  console.log('🔍 Avvio ricerca profonda...');
  
  const allLands: any[] = [];
  const researchResults = {
    primarySources: [] as any[],
    secondarySources: [] as any[],
    marketData: [] as any[],
    totalSearches: 0,
    successfulSearches: 0
  };
  
  try {
    // RICERCA PRIMARIA - Fonti principali
    console.log('🌐 Ricerca primaria su fonti principali...');
    for (const source of searchStrategy.primarySources) {
      console.log(`🔍 Ricerca su ${source.name}...`);
      researchResults.totalSearches++;
      
      try {
        let sourceResults = [];
        
        // Ricerca diretta
        if (source.searchTypes.includes('direct')) {
          const directResults = await performSourceSearch(source.name, location, searchCriteria, 'direct');
          sourceResults.push(...directResults);
        }
        
        // Ricerca per categoria
        if (source.searchTypes.includes('category')) {
          const categoryResults = await performSourceSearch(source.name, location, searchCriteria, 'category');
          sourceResults.push(...categoryResults);
        }
        
        // Ricerca su mappa (se disponibile)
        if (source.searchTypes.includes('map')) {
          const mapResults = await performSourceSearch(source.name, location, searchCriteria, 'map');
          sourceResults.push(...mapResults);
        }
        
        // Rimuovi duplicati
        sourceResults = removeDuplicates(sourceResults);
        
        researchResults.primarySources.push({
          source: source.name,
          results: sourceResults.length,
          data: sourceResults
        });
        
        allLands.push(...sourceResults);
        researchResults.successfulSearches++;
        
        console.log(`✅ ${source.name}: ${sourceResults.length} risultati`);
        
      } catch (error) {
        console.error(`❌ Errore ricerca ${source.name}:`, error.message);
      }
    }
    
    // RICERCA SECONDARIA - Fonti aggiuntive
    console.log('🌐 Ricerca secondaria su fonti aggiuntive...');
    for (const source of searchStrategy.secondarySources) {
      console.log(`🔍 Ricerca su ${source.name}...`);
      researchResults.totalSearches++;
      
      try {
        let sourceResults = [];
        
        if (source.searchTypes.includes('market-data')) {
          const marketResults = await performMarketDataSearch(source.name, location, searchCriteria);
          sourceResults.push(...marketResults);
        } else {
          const directResults = await performSourceSearch(source.name, location, searchCriteria, 'direct');
          sourceResults.push(...directResults);
        }
        
        sourceResults = removeDuplicates(sourceResults);
        
        researchResults.secondarySources.push({
          source: source.name,
          results: sourceResults.length,
          data: sourceResults
        });
        
        allLands.push(...sourceResults);
        researchResults.successfulSearches++;
        
        console.log(`✅ ${source.name}: ${sourceResults.length} risultati`);
        
      } catch (error) {
        console.error(`❌ Errore ricerca ${source.name}:`, error.message);
      }
    }
    
    // RICERCA CON VARIAZIONI - Multiple location formats
    console.log('🔄 Ricerca con variazioni di località...');
    for (const locationVariation of searchStrategy.searchVariations.slice(1)) { // Skip original
      console.log(`🔍 Ricerca per: "${locationVariation}"`);
      researchResults.totalSearches++;
      
      try {
        const variationResults = await performLocationVariationSearch(locationVariation, searchCriteria);
        const uniqueResults = variationResults.filter(land => 
          !allLands.some(existing => existing.title === land.title && existing.price === land.price)
        );
        
        allLands.push(...uniqueResults);
        researchResults.successfulSearches++;
        
        console.log(`✅ Variazione "${locationVariation}": ${uniqueResults.length} nuovi risultati`);
        
      } catch (error) {
        console.error(`❌ Errore variazione "${locationVariation}":`, error.message);
      }
    }
    
    console.log(`📊 Ricerca profonda completata: ${allLands.length} terreni totali`);
    console.log(`📈 Statistiche: ${researchResults.successfulSearches}/${researchResults.totalSearches} ricerche riuscite`);
    
    // Se nessun risultato, ritorna array vuoto (NO FALLBACK MOCK)
    if (allLands.length === 0) {
      console.log('⚠️ Nessun risultato dalla ricerca profonda - ricerca reale fallita');
      return [];
    }
    
    return allLands;
    
  } catch (error) {
    console.error('❌ Errore ricerca profonda:', error);
    // Ritorna array vuoto invece di fallback mock
    return [];
  }
}



async function performSourceSearch(sourceName: string, location: string, searchCriteria: any, searchType: string): Promise<any[]> {
  console.log(`🔍 Ricerca ${searchType} su ${sourceName}...`);
  
  switch (sourceName) {
    case 'immobiliare.it':
      return await scrapeImmobiliare(location, searchCriteria);
    case 'casa.it':
      return await scrapeCasa(location, searchCriteria);
    case 'idealista.it':
      return await scrapeIdealista(location, searchCriteria);
    case 'borsinoimmobiliare.it':
      return await scrapeBorsinoImmobiliare(location, searchCriteria);
    case 'tecnocasa.it':
      return await scrapeTecnocasa(location, searchCriteria);
    default:
      console.log(`⚠️ Fonte ${sourceName} non supportata`);
      return [];
  }
}

async function performMarketDataSearch(sourceName: string, location: string, searchCriteria: any): Promise<any[]> {
  console.log(`📊 Ricerca dati di mercato su ${sourceName}...`);
  
  try {
    // Simula ricerca dati di mercato
    const marketData: any[] = [
      {
        id: `market_${sourceName}_1`,
        title: `Dati Mercato ${location} - ${sourceName}`,
        price: Math.floor(Math.random() * 100000) + 150000,
        location: location,
        area: Math.floor(Math.random() * 800) + 600,
        description: `Dati di mercato da ${sourceName} per ${location}`,
        url: `https://www.${sourceName}/${location.toLowerCase().replace(/\s+/g, '-')}`,
        source: sourceName,
        images: [] as string[],
        features: ['Dati Mercato', 'Analisi'],
        contactInfo: {},
        timestamp: new Date(),
        aiScore: 0,
        pricePerSqm: 0
      }
    ];
    
    return marketData;
    
  } catch (error) {
    console.error(`❌ Errore ricerca dati mercato ${sourceName}:`, error.message);
    return [];
  }
}

async function performLocationVariationSearch(locationVariation: string, searchCriteria: any): Promise<any[]> {
  console.log(`🔄 Ricerca REALE variazione: "${locationVariation}"`);
  
  try {
    // Importa il sistema di scraping reale
    const { realWebScraper } = await import('@/lib/realWebScraper');
    
    // Inizializza il browser se non è già inizializzato
    if (!realWebScraper.isInitialized) {
      await realWebScraper.initialize();
    }
    
    // Usa il sistema di scraping reale per la variazione
    const lands = await realWebScraper.scrapeLands({
      location: locationVariation,
      minPrice: searchCriteria.minPrice,
      maxPrice: searchCriteria.maxPrice,
      minArea: searchCriteria.minArea,
      maxArea: searchCriteria.maxArea
    });
    
    console.log(`✅ Variazione "${locationVariation}" REALE: ${lands.length} terreni estratti`);
    return lands;
    
  } catch (error) {
    console.error(`❌ Errore ricerca REALE variazione "${locationVariation}":`, error.message);
    return [];
  }
}

function removeDuplicates(lands: any[]): any[] {
  const uniqueLands: any[] = [];
  const seen = new Set<string>();
  
  for (const land of lands) {
    const key = `${land.title}-${land.price}-${land.location}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueLands.push(land);
    }
  }
  
  return uniqueLands;
}

async function intelligentFiltering(lands: any[], searchCriteria: any) {
  console.log('🧠 AI Agent: Filtraggio intelligente...');
  
  const filteredLands = lands.filter(land => {
    // FILTRO 1: Prezzo
    const priceInRange = land.price >= searchCriteria.priceRange.min && 
                        land.price <= searchCriteria.priceRange.max;
    
    // FILTRO 2: Area
    const areaInRange = land.area >= searchCriteria.areaRange.min && 
                       land.area <= searchCriteria.areaRange.max;
    
    // FILTRO 3: Caratteristiche richieste
    const hasRequiredFeatures = searchCriteria.mustHaveFeatures.every((feature: string) =>
      land.features.some((f: string) => f.toLowerCase().includes(feature.toLowerCase()))
    );
    
    // FILTRO 4: Località (controllo fuzzy)
    const locationMatch = land.location.toLowerCase().includes(searchCriteria.location.toLowerCase()) ||
                         searchCriteria.location.toLowerCase().includes(land.location.toLowerCase());
    
    // CALCOLO SCORE AI
    let aiScore = 70; // Base score
    
    if (priceInRange) aiScore += 10;
    if (areaInRange) aiScore += 10;
    if (hasRequiredFeatures) aiScore += 15;
    if (locationMatch) aiScore += 5;
    
    // Bonus per caratteristiche preferite
    const preferredFeatures = searchCriteria.preferredFeatures.filter((feature: string) =>
      land.features.some((f: string) => f.toLowerCase().includes(feature.toLowerCase()))
    );
    aiScore += preferredFeatures.length * 5;
    
    // Bonus per prezzo competitivo
    const pricePerSqm = land.price / land.area;
    if (pricePerSqm < 200) aiScore += 10; // Prezzo competitivo
    if (pricePerSqm < 150) aiScore += 5;  // Molto competitivo
    
    land.aiScore = Math.min(100, aiScore);
    
    return priceInRange && areaInRange && hasRequiredFeatures && locationMatch;
  });
  
  // ORDINA PER SCORE AI
  filteredLands.sort((a, b) => b.aiScore - a.aiScore);
  
  console.log(`✅ AI Agent: ${filteredLands.length} terreni filtrati e ordinati`);
  return filteredLands;
}

async function performDeepAIAnalysis(lands: any[], searchCriteria: any, location: string) {
  console.log('🧠 AI Agent: Analisi profonda...');
  
  return lands.map((land, index) => {
    // ANALISI AVANZATA DEL ROI
    const baseROI = 8;
    const priceEfficiency = land.price < 200000 ? 3 : land.price < 300000 ? 1 : 0;
    const areaEfficiency = land.area > 1000 ? 2 : land.area > 800 ? 1 : 0;
    const locationBonus = land.location.toLowerCase().includes('centro') ? 2 : 0;
    const featureBonus = land.features.length * 0.8;
    const marketTiming = Math.random() > 0.5 ? 1 : 0; // Simula timing di mercato
    
    const estimatedROI = baseROI + priceEfficiency + areaEfficiency + locationBonus + featureBonus + marketTiming;
    
    // VALUTAZIONE RISCHIO AVANZATA
    let riskAssessment = 'Medio';
    let riskScore = 50;
    
    if (land.aiScore >= 90) {
      riskAssessment = 'Molto Basso';
      riskScore = 10;
    } else if (land.aiScore >= 80) {
      riskAssessment = 'Basso';
      riskScore = 25;
    } else if (land.aiScore >= 70) {
      riskAssessment = 'Medio';
      riskScore = 50;
    } else if (land.aiScore >= 60) {
      riskAssessment = 'Alto';
      riskScore = 75;
    } else {
      riskAssessment = 'Molto Alto';
      riskScore = 90;
    }
    
    // ANALISI TREND DI MERCATO
    const pricePerSqm = land.price / land.area;
    let marketTrend = 'Stabile';
    let trendConfidence = 0.7;
    
    if (pricePerSqm < 150) {
      marketTrend = 'Crescente';
      trendConfidence = 0.9;
    } else if (pricePerSqm > 300) {
      marketTrend = 'Decrescente';
      trendConfidence = 0.8;
    }
    
    // RACCOMANDAZIONE STRATEGICA
    let recommendation = 'Valutare attentamente';
    let recommendationType = 'neutral';
    
    if (land.aiScore >= 90 && estimatedROI >= 12) {
      recommendation = 'Ottima opportunità - Investimento consigliato';
      recommendationType = 'strong_buy';
    } else if (land.aiScore >= 80 && estimatedROI >= 10) {
      recommendation = 'Buona opportunità - Considerare seriamente';
      recommendationType = 'buy';
    } else if (land.aiScore >= 70 && estimatedROI >= 8) {
      recommendation = 'Opportunità valida - Valutare';
      recommendationType = 'hold';
    } else if (land.aiScore < 60 || estimatedROI < 6) {
      recommendation = 'Rischio elevato - Evitare';
      recommendationType = 'sell';
    }
    
    // ANALISI COMPETITIVA
    const competitiveAdvantage = calculateCompetitiveAdvantage(land, searchCriteria);
    
    return {
      landId: land.id,
      estimatedROI: Math.round(estimatedROI * 10) / 10,
      riskAssessment: riskAssessment,
      riskScore: riskScore,
      marketTrend: marketTrend,
      trendConfidence: trendConfidence,
      recommendation: recommendation,
      recommendationType: recommendationType,
      aiScore: land.aiScore,
      pricePerSqm: Math.round(pricePerSqm),
      investmentPotential: calculateDevelopmentPotential(land),
      competitiveAdvantage: competitiveAdvantage,
      marketTiming: marketTiming > 0 ? 'Favorevole' : 'Neutrale',
      developmentPotential: calculateDevelopmentPotential(land)
    };
  });
}

function calculateCompetitiveAdvantage(land: any, searchCriteria: any) {
  let advantage = 0;
  
  // Vantaggio prezzo
  const priceRatio = land.price / searchCriteria.priceRange.max;
  if (priceRatio < 0.7) advantage += 30;
  else if (priceRatio < 0.85) advantage += 15;
  
  // Vantaggio area
  const areaRatio = land.area / searchCriteria.areaRange.max;
  if (areaRatio > 1.2) advantage += 20;
  else if (areaRatio > 1.0) advantage += 10;
  
  // Vantaggio caratteristiche
  advantage += land.features.length * 5;
  
  // Vantaggio localizzazione
  if (land.location.toLowerCase().includes('centro')) advantage += 15;
  if (land.location.toLowerCase().includes('zona')) advantage += 10;
  
  return Math.min(100, advantage);
}

function calculateDevelopmentPotential(land: any) {
  let potential = 50; // Base
  
  // Potenziale basato su area
  if (land.area > 1000) potential += 20;
  else if (land.area > 800) potential += 10;
  
  // Potenziale basato su caratteristiche
  if (land.features.includes('Permessi')) potential += 15;
  if (land.features.includes('Edificabile')) potential += 10;
  if (land.features.includes('Commerciale')) potential += 10;
  
  // Potenziale basato su prezzo
  const pricePerSqm = land.price / land.area;
  if (pricePerSqm < 200) potential += 15;
  else if (pricePerSqm < 250) potential += 5;
  
  return Math.min(100, potential);
}

function generateStrategicRecommendations(lands: any[], searchCriteria: any, location: string, totalScraped: number) {
  const recommendations = [];
  
  if (lands.length === 0) {
    recommendations.push(
      `Nessun terreno trovato a ${location} con i criteri specificati`,
      'Prova ad ampliare i criteri di ricerca',
      'Considera località limitrofe o zone diverse'
    );
    return recommendations;
  }
  
  // ANALISI STRATEGICA
  const avgPrice = lands.reduce((sum, land) => sum + land.price, 0) / lands.length;
  const avgArea = lands.reduce((sum, land) => sum + land.area, 0) / lands.length;
  const avgROI = lands.reduce((sum, land) => sum + (land.analysis?.estimatedROI || 8), 0) / lands.length;
  
  recommendations.push(
    `Analisi strategica di ${lands.length} terreni selezionati su ${totalScraped} analizzati`,
    `Prezzo medio: €${avgPrice.toLocaleString()} (ROI stimato: ${avgROI.toFixed(1)}%)`,
    `Superficie media: ${Math.round(avgArea)} m²`
  );
  
  // RACCOMANDAZIONI SPECIFICHE
  const bestLand = lands[0];
  if (bestLand && bestLand.aiScore >= 85) {
    recommendations.push(
      `Migliore opportunità: ${bestLand.title} (AI Score: ${bestLand.aiScore}/100)`,
      `ROI stimato: ${bestLand.analysis?.estimatedROI}% - Rischio: ${bestLand.analysis?.riskAssessment}`
    );
  }
  
  // RACCOMANDAZIONI DI MERCATO
  const lowRiskLands = lands.filter(l => l.analysis?.riskAssessment === 'Basso' || l.analysis?.riskAssessment === 'Molto Basso');
  if (lowRiskLands.length > 0) {
    recommendations.push(`${lowRiskLands.length} terreni a basso rischio identificati`);
  }
  
  const highROILands = lands.filter(l => l.analysis?.estimatedROI >= 12);
  if (highROILands.length > 0) {
    recommendations.push(`${highROILands.length} terreni con ROI >12% disponibili`);
  }
  
  // RACCOMANDAZIONI STRATEGICHE
  if (avgPrice < searchCriteria.priceRange.max * 0.8) {
    recommendations.push('Mercato favorevole: prezzi sotto la media richiesta');
  }
  
  const landsWithPermits = lands.filter(l => l.features.some((f: string) => f.toLowerCase().includes('permessi')));
  if (landsWithPermits.length > 0) {
    recommendations.push(`${landsWithPermits.length} terreni con permessi - riducono tempi di sviluppo`);
  }
  
  return recommendations;
}

function performMarketAnalysis(lands: any[], location: string, searchCriteria: any) {
  if (lands.length === 0) {
    return {
      trends: 'Nessun dato disponibile',
      insights: ['Mercato non analizzabile'],
      opportunities: [],
      risks: []
    };
  }
  
  const avgPrice = lands.reduce((sum, land) => sum + land.price, 0) / lands.length;
  const avgPricePerSqm = lands.reduce((sum, land) => sum + (land.price / land.area), 0) / lands.length;
  const avgROI = lands.reduce((sum, land) => sum + (land.analysis?.estimatedROI || 8), 0) / lands.length;
  
  let trend = 'Stabile';
  let trendStrength = 'Moderato';
  
  if (avgPricePerSqm < 150) {
    trend = 'Crescente - Opportunità di investimento';
    trendStrength = 'Forte';
  } else if (avgPricePerSqm > 250) {
    trend = 'Decrescente - Mercato saturo';
    trendStrength = 'Moderato';
  }
  
  const insights = [
    `Prezzo medio: €${avgPrice.toLocaleString()}`,
    `€/m² medio: €${Math.round(avgPricePerSqm)}`,
    `ROI medio stimato: ${avgROI.toFixed(1)}%`,
    `Trend: ${trend} (${trendStrength})`
  ];
  
  const opportunities = [];
  const risks = [];
  
  // Opportunità
  if (avgPricePerSqm < 200) opportunities.push('Prezzi competitivi');
  if (lands.filter(l => l.analysis?.riskAssessment === 'Basso').length > 0) opportunities.push('Terreni a basso rischio disponibili');
  if (lands.filter(l => l.analysis?.estimatedROI >= 10).length > 0) opportunities.push('Alto potenziale di rendimento');
  
  // Rischi
  if (avgPricePerSqm > 300) risks.push('Prezzi elevati');
  if (lands.filter(l => l.analysis?.riskAssessment === 'Alto').length > lands.length * 0.5) risks.push('Alta concentrazione di rischi');
  if (avgROI < 6) risks.push('Basso potenziale di rendimento');
  
  return {
    trends: trend,
    insights: insights,
    opportunities: opportunities,
    risks: risks,
    marketData: {
      avgPrice,
      avgPricePerSqm,
      avgROI,
      totalLands: lands.length
    }
  };
}

async function scrapeImmobiliare(location: string, searchCriteria: any): Promise<any[]> {
  try {
    console.log('🔍 Scraping REALE immobiliare.it per:', location);
    
    // Importa il sistema di scraping reale
    const { realWebScraper } = await import('@/lib/realWebScraper');
    
    // Inizializza il browser se non è già inizializzato
    if (!realWebScraper.isInitialized) {
      await realWebScraper.initialize();
    }
    
    // Usa il sistema di scraping reale
    const lands = await realWebScraper.scrapeLands({
      location: location,
      minPrice: searchCriteria.minPrice,
      maxPrice: searchCriteria.maxPrice,
      minArea: searchCriteria.minArea,
      maxArea: searchCriteria.maxArea
    });
    
    // Filtra solo i risultati di Immobiliare.it
    const immobiliareLands = lands.filter(land => land.source === 'immobiliare.it');
    
    console.log(`✅ Immobiliare.it REALE: ${immobiliareLands.length} terreni estratti`);
    return immobiliareLands;
    
  } catch (error) {
    console.error('❌ Errore scraping REALE immobiliare.it:', error.message);
    return [];
  }
}

async function scrapeCasa(location: string, searchCriteria: any): Promise<any[]> {
  try {
    console.log('🔍 Scraping REALE casa.it per:', location);
    
    // Importa il sistema di scraping reale
    const { realWebScraper } = await import('@/lib/realWebScraper');
    
    // Inizializza il browser se non è già inizializzato
    if (!realWebScraper.isInitialized) {
      await realWebScraper.initialize();
    }
    
    // Usa il sistema di scraping reale
    const lands = await realWebScraper.scrapeLands({
      location: location,
      minPrice: searchCriteria.minPrice,
      maxPrice: searchCriteria.maxPrice,
      minArea: searchCriteria.minArea,
      maxArea: searchCriteria.maxArea
    });
    
    // Filtra solo i risultati di Casa.it
    const casaLands = lands.filter(land => land.source === 'casa.it');
    
    console.log(`✅ Casa.it REALE: ${casaLands.length} terreni estratti`);
    return casaLands;
    
  } catch (error) {
    console.error('❌ Errore scraping REALE casa.it:', error.message);
    return [];
  }
}

async function scrapeIdealista(location: string, searchCriteria: any): Promise<any[]> {
  try {
    console.log('🔍 Scraping REALE idealista.it per:', location);
    
    // Importa il sistema di scraping reale
    const { realWebScraper } = await import('@/lib/realWebScraper');
    
    // Inizializza il browser se non è già inizializzato
    if (!realWebScraper.isInitialized) {
      await realWebScraper.initialize();
    }
    
    // Usa il sistema di scraping reale
    const lands = await realWebScraper.scrapeLands({
      location: location,
      minPrice: searchCriteria.minPrice,
      maxPrice: searchCriteria.maxPrice,
      minArea: searchCriteria.minArea,
      maxArea: searchCriteria.maxArea
    });
    
    // Filtra solo i risultati di Idealista.it
    const idealistaLands = lands.filter(land => land.source === 'idealista.it');
    
    console.log(`✅ Idealista.it REALE: ${idealistaLands.length} terreni estratti`);
    return idealistaLands;
    
  } catch (error) {
    console.error('❌ Errore scraping REALE idealista.it:', error.message);
    return [];
  }
}

async function scrapeBorsinoImmobiliare(location: string, searchCriteria: any): Promise<any[]> {
  try {
    console.log('🔍 Scraping REALE borsinoimmobiliare.it per:', location);
    
    // Importa il sistema di scraping reale
    const { realWebScraper } = await import('@/lib/realWebScraper');
    
    // Inizializza il browser se non è già inizializzato
    if (!realWebScraper.isInitialized) {
      await realWebScraper.initialize();
    }
    
    // Usa il sistema di scraping reale
    const lands = await realWebScraper.scrapeLands({
      location: location,
      minPrice: searchCriteria.minPrice,
      maxPrice: searchCriteria.maxPrice,
      minArea: searchCriteria.minArea,
      maxArea: searchCriteria.maxArea
    });
    
    // Filtra solo i risultati di BorsinoImmobiliare.it
    const borsinoLands = lands.filter(land => land.source === 'borsinoimmobiliare.it');
    
    console.log(`✅ BorsinoImmobiliare.it REALE: ${borsinoLands.length} terreni estratti`);
    return borsinoLands;
    
  } catch (error) {
    console.error('❌ Errore scraping REALE borsinoimmobiliare.it:', error.message);
    return [];
  }
}

async function scrapeTecnocasa(location: string, searchCriteria: any): Promise<any[]> {
  try {
    console.log('🔍 Scraping REALE tecnocasa.it per:', location);
    
    // Importa il sistema di scraping reale
    const { realWebScraper } = await import('@/lib/realWebScraper');
    
    // Inizializza il browser se non è già inizializzato
    if (!realWebScraper.isInitialized) {
      await realWebScraper.initialize();
    }
    
    // Usa il sistema di scraping reale
    const lands = await realWebScraper.scrapeLands({
      location: location,
      minPrice: searchCriteria.minPrice,
      maxPrice: searchCriteria.maxPrice,
      minArea: searchCriteria.minArea,
      maxArea: searchCriteria.maxArea
    });
    
    // Filtra solo i risultati di Tecnocasa.it
    const tecnocasaLands = lands.filter(land => land.source === 'tecnocasa.it');
    
    console.log(`✅ Tecnocasa.it REALE: ${tecnocasaLands.length} terreni estratti`);
    return tecnocasaLands;
    
  } catch (error) {
    console.error('❌ Errore scraping REALE tecnocasa.it:', error.message);
    return [];
  }
}

function generateEmailHTML(results: any, location: string): string {
  const lands = results.lands;
  const summary = results.summary;
  
  if (lands.length === 0) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nessun Terreno Trovato - Urbanova AI</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .no-results { text-align: center; padding: 40px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🤖 Urbanova AI Agent</h1>
            <p>Ricerca Intelligente Terreni - ${location}</p>
          </div>
          
          <div class="content">
            <div class="no-results">
              <h2>🔍 Nessun terreno trovato</h2>
              <p>L'AI Agent ha analizzato ${summary.totalScraped || 0} terreni ma nessuno corrisponde ai criteri specificati.</p>
              <p>Prova a:</p>
              <ul>
                <li>Ampliare i criteri di ricerca</li>
                <li>Verificare la località inserita</li>
                <li>Riprova più tardi</li>
              </ul>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Risultati AI Agent - Urbanova</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .land-card { background: white; margin: 20px 0; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; }
        .land-title { font-size: 18px; font-weight: bold; color: #1e40af; margin-bottom: 10px; }
        .land-details { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 15px 0; }
        .land-detail { background: #f1f5f9; padding: 8px; border-radius: 4px; }
        .land-detail strong { color: #1e40af; }
        .land-link { display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px; }
        .summary { background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .ai-score { background: #fef3c7; padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🤖 Urbanova AI Agent</h1>
          <p>Risultati Ricerca Intelligente - ${location}</p>
        </div>
        
        <div class="content">
          <div class="summary">
            <h2>📊 Riepilogo AI Agent</h2>
            <p><strong>${lands.length} terreni selezionati</strong> su ${summary.totalScraped} analizzati</p>
            <p><strong>Prezzo medio:</strong> €${summary.averagePrice.toLocaleString()}</p>
            <p><strong>Trend di mercato:</strong> ${summary.marketTrends}</p>
          </div>
          
          <h2>🏗️ Opportunità Selezionate dall'AI</h2>
          
          ${lands.map((land: any, index: number) => `
            <div class="land-card">
              <div class="land-title">
                ${land.title}
                <span class="ai-score">AI Score: ${land.aiScore}/100</span>
              </div>
              
              <div class="land-details">
                <div class="land-detail">
                  <strong>Prezzo:</strong> €${land.price.toLocaleString()}
                </div>
                <div class="land-detail">
                  <strong>Superficie:</strong> ${land.area} m²
                </div>
                <div class="land-detail">
                  <strong>€/m²:</strong> €${Math.round(land.price / land.area).toLocaleString()}
                </div>
                <div class="land-detail">
                  <strong>Fonte:</strong> ${land.source}
                </div>
              </div>
              
              <p><strong>Descrizione:</strong> ${land.description}</p>
              
              <a href="${land.url}" class="land-link" target="_blank">
                🔗 Vedi Annuncio Originale
              </a>
            </div>
          `).join('')}
          
          <div class="summary">
            <h3>💡 Raccomandazioni AI Agent</h3>
            <ul>
              ${summary.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p>Questo report è stato generato dall'AI Agent di Urbanova</p>
          <p>Per assistenza: support@urbanova.life</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function GET() {
  return NextResponse.json({
    message: 'AI Agent Land Search API - Utilizza POST per la ricerca intelligente',
    endpoints: {
      POST: '/api/land-search - Esegue ricerca ReAct con AI Agent'
    }
  });
} 