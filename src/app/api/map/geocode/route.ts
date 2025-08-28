import { NextRequest, NextResponse } from 'next/server';
import { projectMapService } from '@/lib/projectMapService';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [API Map] Richiesta geocodifica indirizzo');
    
    const body = await request.json();
    const { address } = body;
    
    if (!address) {
      return NextResponse.json(
        {
          success: false,
          message: 'Indirizzo è obbligatorio'
        },
        { status: 400 }
      );
    }
    
    console.log('📍 [API Map] Geocodifica indirizzo:', address);
    
    // Esegui geocodifica
    const geocodingResult = await projectMapService.geocodeAddress(address);
    
    console.log('✅ [API Map] Geocodifica completata:', geocodingResult);
    
    return NextResponse.json({
      success: true,
      message: 'Geocodifica completata con successo',
      data: geocodingResult
    });
    
  } catch (error) {
    console.error('❌ [API Map] Errore geocodifica:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Errore durante la geocodifica dell\'indirizzo',
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [API Map] Richiesta geocodifica via GET');
    
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    
    if (!address) {
      return NextResponse.json(
        {
          success: false,
          message: 'Parametro address è obbligatorio'
        },
        { status: 400 }
      );
    }
    
    console.log('📍 [API Map] Geocodifica indirizzo:', address);
    
    // Esegui geocodifica
    const geocodingResult = await projectMapService.geocodeAddress(address);
    
    console.log('✅ [API Map] Geocodifica completata:', geocodingResult);
    
    return NextResponse.json({
      success: true,
      message: 'Geocodifica completata con successo',
      data: geocodingResult
    });
    
  } catch (error) {
    console.error('❌ [API Map] Errore geocodifica:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Errore durante la geocodifica dell\'indirizzo',
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      },
      { status: 500 }
    );
  }
}
