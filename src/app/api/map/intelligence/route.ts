import { NextRequest, NextResponse } from 'next/server';

import { territorialIntelligenceService } from '@/lib/territorialIntelligenceService';

export async function POST(request: NextRequest) {
  try {
    console.log('🧠 [API Map] Richiesta analisi intelligence territoriale');

    const body = await request.json();
    const { zone, city, analysisType } = body;

    if (!zone || !city) {
      return NextResponse.json(
        {
          success: false,
          message: 'Zona e città sono obbligatori',
        },
        { status: 400 }
      );
    }

    let result;

    switch (analysisType) {
      case 'market_trends':
        console.log('📈 [API Map] Analisi trend di mercato per:', zone);
        result = await territorialIntelligenceService.getMarketTrendsByZone(zone, city);
        break;

      case 'zone_analysis':
        console.log('🗺️ [API Map] Analisi zona per:', zone);
        result = await territorialIntelligenceService.getZoneAnalysis(zone, city);
        break;

      case 'investment_opportunities':
        console.log('💡 [API Map] Analisi opportunità investimento per:', zone);
        result = await territorialIntelligenceService.analyzeInvestmentOpportunities(zone, city);
        break;

      case 'demographic_insights':
        console.log('👥 [API Map] Generazione insights demografici per:', zone);
        result = await territorialIntelligenceService.generateDemographicInsights(zone, city);
        break;

      case 'infrastructure_analysis':
        console.log('🏗️ [API Map] Analisi infrastrutture per:', zone);
        result = await territorialIntelligenceService.analyzeInfrastructure(zone, city);
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            message: 'Tipo di analisi non supportato',
          },
          { status: 400 }
        );
    }

    console.log('✅ [API Map] Analisi completata:', analysisType);

    return NextResponse.json({
      success: true,
      message: 'Analisi completata con successo',
      data: result,
    });
  } catch (error) {
    console.error('❌ [API Map] Errore analisi intelligence:', error);

    return NextResponse.json(
      {
        success: false,
        message: "Errore durante l'analisi intelligence territoriale",
        error: error instanceof Error ? error.message : 'Errore sconosciuto',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📊 [API Map] Recupero dati intelligence territoriale');

    const { searchParams } = new URL(request.url);
    const zone = searchParams.get('zone');
    const city = searchParams.get('city');

    if (!zone || !city) {
      return NextResponse.json(
        {
          success: false,
          message: 'Parametri zona e città sono obbligatori',
        },
        { status: 400 }
      );
    }

    // Esegui analisi completa
    const [marketTrends, zoneAnalysis, opportunities, demographics, infrastructure] =
      await Promise.all([
        territorialIntelligenceService.getMarketTrendsByZone(zone, city),
        territorialIntelligenceService.getZoneAnalysis(zone, city),
        territorialIntelligenceService.analyzeInvestmentOpportunities(zone, city),
        territorialIntelligenceService.generateDemographicInsights(zone, city),
        territorialIntelligenceService.analyzeInfrastructure(zone, city),
      ]);

    console.log('✅ [API Map] Analisi completa recuperata per:', zone);

    return NextResponse.json({
      success: true,
      data: {
        zone,
        city,
        marketTrends,
        zoneAnalysis,
        opportunities,
        demographics,
        infrastructure,
        summary: {
          totalInsights: marketTrends.length + zoneAnalysis.length + opportunities.length + 2, // +2 per demographics e infrastructure
          marketTrend: marketTrends.length > 0 ? marketTrends[0].trend : 'UNKNOWN',
          opportunitiesCount: opportunities.length,
          riskLevel: opportunities.length > 2 ? 'LOW' : 'MEDIUM',
        },
      },
    });
  } catch (error) {
    console.error('❌ [API Map] Errore recupero intelligence:', error);

    return NextResponse.json(
      {
        success: false,
        message: "Errore durante il recupero dell'intelligence territoriale",
        error: error instanceof Error ? error.message : 'Errore sconosciuto',
      },
      { status: 500 }
    );
  }
}
