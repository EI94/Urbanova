import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: 'Test Resend Simple - Urbanova',
      data: {
        timestamp: new Date().toISOString(),
        status: 'ENDPOINT FUNZIONANTE',
        note: 'Questo endpoint è stato creato per forzare il deploy su Vercel'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Errore nel test' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { to } = await request.json();
    
    if (!to) {
      return NextResponse.json(
        { error: 'Email richiesta' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Test POST completato',
      data: {
        email: to,
        timestamp: new Date().toISOString(),
        status: 'POST FUNZIONANTE'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Errore nel test POST' },
      { status: 500 }
    );
  }
}
