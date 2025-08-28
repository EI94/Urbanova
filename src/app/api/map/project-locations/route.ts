import { NextRequest, NextResponse } from 'next/server';
import { projectMapService, CreateProjectLocationData } from '@/lib/projectMapService';

export async function POST(request: NextRequest) {
  try {
    console.log('🗺️ [API Map] Creazione nuova posizione progetto');
    
    const body = await request.json();
    const locationData: CreateProjectLocationData = body;
    
    // Validazione base
    if (!locationData.projectName || !locationData.address) {
      return NextResponse.json(
        {
          success: false,
          message: 'Nome progetto e indirizzo sono obbligatori'
        },
        { status: 400 }
      );
    }
    
    // Crea la posizione progetto
    const locationId = await projectMapService.createProjectLocation(locationData);
    
    console.log('✅ [API Map] Posizione progetto creata:', locationId);
    
    return NextResponse.json({
      success: true,
      message: 'Posizione progetto creata con successo',
      data: {
        locationId,
        location: locationData
      }
    });
    
  } catch (error) {
    console.error('❌ [API Map] Errore creazione posizione:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Errore durante la creazione della posizione progetto',
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📋 [API Map] Recupero posizioni progetto');
    
    const { searchParams } = new URL(request.url);
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
    
    console.log('✅ [API Map] Posizioni progetto recuperate:', locations.length);
    
    return NextResponse.json({
      success: true,
      data: {
        locationsCount: locations.length,
        locations: locations
      }
    });
    
  } catch (error) {
    console.error('❌ [API Map] Errore recupero posizioni:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Errore durante il recupero delle posizioni progetto',
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('✏️ [API Map] Aggiornamento posizione progetto');
    
    const body = await request.json();
    const { locationId, updates } = body;
    
    if (!locationId) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID posizione progetto è obbligatorio'
        },
        { status: 400 }
      );
    }
    
    // Aggiorna la posizione progetto
    await projectMapService.updateProjectLocation(locationId, updates);
    
    console.log('✅ [API Map] Posizione progetto aggiornata:', locationId);
    
    return NextResponse.json({
      success: true,
      message: 'Posizione progetto aggiornata con successo',
      data: {
        locationId,
        updates
      }
    });
    
  } catch (error) {
    console.error('❌ [API Map] Errore aggiornamento posizione:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Errore durante l\'aggiornamento della posizione progetto',
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ [API Map] Eliminazione posizione progetto');
    
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('id');
    
    if (!locationId) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID posizione progetto è obbligatorio'
        },
        { status: 400 }
      );
    }
    
    // Elimina la posizione progetto
    await projectMapService.deleteProjectLocation(locationId);
    
    console.log('✅ [API Map] Posizione progetto eliminata:', locationId);
    
    return NextResponse.json({
      success: true,
      message: 'Posizione progetto eliminata con successo',
      data: {
        locationId
      }
    });
    
  } catch (error) {
    console.error('❌ [API Map] Errore eliminazione posizione:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Errore durante l\'eliminazione della posizione progetto',
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      },
      { status: 500 }
    );
  }
}
