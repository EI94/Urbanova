import { NextRequest, NextResponse } from 'next/server';
import { projectMapService } from '@/lib/projectMapService';

export async function POST(request: NextRequest) {
  try {
    console.log('🗺️ [API Map] Inizializzazione posizioni progetto');
    
    // Inizializza posizioni progetto di esempio
    await projectMapService.initializeSampleProjectLocations();
    
    // Recupera tutte le posizioni
    const locations = await projectMapService.getAllProjectLocations();
    
    console.log('✅ [API Map] Posizioni progetto inizializzate:', locations.length);
    
    return NextResponse.json({
      success: true,
      message: 'Posizioni progetto inizializzate con successo',
      data: {
        locationsCount: locations.length,
        locations: locations.slice(0, 5) // Restituisce solo i primi 5 per preview
      }
    });
    
  } catch (error) {
    console.error('❌ [API Map] Errore inizializzazione:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Errore durante l\'inizializzazione delle posizioni progetto',
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📋 [API Map] Recupero posizioni progetto');
    
    // Recupera tutte le posizioni
    const locations = await projectMapService.getAllProjectLocations();
    
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
