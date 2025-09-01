import { NextRequest, NextResponse } from 'next/server';

import { projectMapService } from '@/lib/projectMapService';

export async function POST(request: NextRequest) {
  try {
    console.log('🔗 [API Map] Creazione cluster mappa');

    const body = await request.json();
    const { locations, zoom } = body;

    if (!locations || !Array.isArray(locations)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Array locations è obbligatorio',
        },
        { status: 400 }
      );
    }

    if (typeof zoom !== 'number') {
      return NextResponse.json(
        {
          success: false,
          message: 'Zoom è obbligatorio e deve essere un numero',
        },
        { status: 400 }
      );
    }

    console.log(
      '🗺️ [API Map] Creazione cluster per zoom:',
      zoom,
      'e',
      locations.length,
      'posizioni'
    );

    // Crea cluster per la visualizzazione
    const clusters = await projectMapService.createMapClusters(locations, zoom);

    console.log('✅ [API Map] Cluster creati:', clusters.length);

    return NextResponse.json({
      success: true,
      message: 'Cluster creati con successo',
      data: {
        clustersCount: clusters.length,
        clusters: clusters,
      },
    });
  } catch (error) {
    console.error('❌ [API Map] Errore creazione cluster:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Errore durante la creazione dei cluster',
        error: error instanceof Error ? error.message : 'Errore sconosciuto',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔗 [API Map] Recupero cluster mappa');

    const { searchParams } = new URL(request.url);
    const zoom = searchParams.get('zoom');
    const filters = searchParams.get('filters');

    let locations;

    if (filters) {
      // Applica filtri se specificati
      const filterData = JSON.parse(filters);
      locations = await projectMapService.getProjectLocationsWithFilters(filterData);
    } else {
      // Recupera tutte le posizioni
      locations = await projectMapService.getAllProjectLocations();
    }

    const zoomLevel = zoom ? parseInt(zoom) : 8;

    console.log(
      '🗺️ [API Map] Creazione cluster per zoom:',
      zoomLevel,
      'e',
      locations.length,
      'posizioni'
    );

    // Crea cluster per la visualizzazione
    const clusters = await projectMapService.createMapClusters(locations, zoomLevel);

    console.log('✅ [API Map] Cluster recuperati:', clusters.length);

    return NextResponse.json({
      success: true,
      data: {
        clustersCount: clusters.length,
        clusters: clusters,
        zoom: zoomLevel,
        locationsCount: locations.length,
      },
    });
  } catch (error) {
    console.error('❌ [API Map] Errore recupero cluster:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Errore durante il recupero dei cluster',
        error: error instanceof Error ? error.message : 'Errore sconosciuto',
      },
      { status: 500 }
    );
  }
}
