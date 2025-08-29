import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🧪 [Feedback Test] Endpoint di test chiamato');
    
    return NextResponse.json({
      success: true,
      message: 'API Feedback funziona correttamente',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
    
  } catch (error) {
    console.error('❌ [Feedback Test] Errore:', error);
    return NextResponse.json(
      { error: 'Errore nel test' },
      { status: 500 }
    );
  }
}
