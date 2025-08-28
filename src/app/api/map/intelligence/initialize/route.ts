import { NextRequest, NextResponse } from 'next/server';
import { territorialIntelligenceService } from '@/lib/territorialIntelligenceService';

export async function POST(request: NextRequest) {
  try {
    console.log('🏗️ [API Map] Inizializzazione intelligence territoriale');
    
    // Inizializza dati di esempio per l'intelligence territoriale
    await territorialIntelligenceService.initializeSampleData();
    
    console.log('✅ [API Map] Intelligence territoriale inizializzata con successo');
    
    return NextResponse.json({
      success: true,
      message: 'Intelligence territoriale inizializzata con successo',
      data: {
        message: 'Dati di esempio creati per trend di mercato, analisi zona e opportunità'
      }
    });
    
  } catch (error) {
    console.error('❌ [API Map] Errore inizializzazione intelligence:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Errore durante l\'inizializzazione dell\'intelligence territoriale',
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📋 [API Map] Stato intelligence territoriale');
    
    return NextResponse.json({
      success: true,
      message: 'Intelligence territoriale attiva',
      data: {
        status: 'active',
        services: [
          'Market Trends Analysis',
          'Zone Analysis',
          'Investment Opportunities',
          'Demographic Insights',
          'Infrastructure Analysis'
        ],
        lastUpdated: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ [API Map] Errore stato intelligence:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Errore durante il recupero dello stato dell\'intelligence territoriale',
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      },
      { status: 500 }
    );
  }
}
