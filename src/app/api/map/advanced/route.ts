import { NextRequest, NextResponse } from 'next/server';
import { advancedMapService } from '@/lib/advancedMapService';

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 [API Map] Richiesta mappa avanzata con AI');
    
    const body = await request.json();
    const { zone, city, action } = body;
    
    if (!zone || !city) {
      return NextResponse.json(
        {
          success: false,
          message: 'Zona e città sono obbligatori'
        },
        { status: 400 }
      );
    }
    
    let result;
    
    switch (action) {
      case 'generate_predictions':
        console.log('🧠 [API Map] Generazione predizioni AI per:', zone);
        result = await advancedMapService.generateAdvancedPredictions(zone, city);
        break;
        
      case 'create_heatmaps':
        console.log('🔥 [API Map] Creazione heatmap intelligenti per:', zone);
        result = await advancedMapService.createIntelligentHeatmaps(zone, city);
        break;
        
      case 'create_map_data':
        console.log('🗺️ [API Map] Creazione dati mappa reali per:', zone);
        const mapData = {
          zone,
          city,
          coordinates: {
            center: { latitude: 41.8700, longitude: 12.5000 },
            bounds: {
              north: 41.8800,
              south: 41.8600,
              east: 12.5100,
              west: 12.4900
            },
            zoom: 15
          },
          mapLayers: {
            satellite: false,
            terrain: true,
            traffic: true,
            transit: true,
            bicycle: true,
            building: true
          }
        };
        result = await advancedMapService.createRealMapData(mapData);
        break;
        
      default:
        return NextResponse.json(
          {
            success: false,
            message: 'Azione non supportata'
          },
          { status: 400 }
        );
    }
    
    console.log('✅ [API Map] Azione completata:', action);
    
    return NextResponse.json({
      success: true,
      message: 'Azione completata con successo',
      data: result
    });
    
  } catch (error) {
    console.error('❌ [API Map] Errore mappa avanzata:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Errore durante l\'esecuzione dell\'azione',
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📊 [API Map] Recupero dati mappa avanzata');
    
    const { searchParams } = new URL(request.url);
    const zone = searchParams.get('zone');
    const city = searchParams.get('city');
    
    if (!zone || !city) {
      return NextResponse.json(
        {
          success: false,
          message: 'Parametri zona e città sono obbligatori'
        },
        { status: 400 }
      );
    }
    
    // Recupera tutti i dati avanzati per la zona
    const [predictions, heatmaps] = await Promise.all([
      advancedMapService.getAIPredictionsByZone(zone, city),
      advancedMapService.createIntelligentHeatmaps(zone, city)
    ]);
    
    console.log('✅ [API Map] Dati avanzati recuperati per:', zone);
    
    return NextResponse.json({
      success: true,
      data: {
        zone,
        city,
        predictions,
        heatmaps,
        summary: {
          predictionsCount: predictions.length,
          heatmapsCount: heatmaps.length,
          aiConfidence: predictions.length > 0 ? 
            predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length : 0,
          lastUpdate: new Date().toISOString()
        }
      }
    });
    
  } catch (error) {
    console.error('❌ [API Map] Errore recupero mappa avanzata:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Errore durante il recupero dei dati avanzati',
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      },
      { status: 500 }
    );
  }
}
