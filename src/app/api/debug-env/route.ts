import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envVars = {
      RESEND_API_KEY: {
        present: !!process.env.RESEND_API_KEY,
        length: process.env.RESEND_API_KEY?.length || 0,
        startsWith: process.env.RESEND_API_KEY?.substring(0, 10) + '...' || 'N/A',
        value: process.env.RESEND_API_KEY || 'NOT_SET',
      },
      NEXT_PUBLIC_RESEND_API_KEY: {
        present: !!process.env.NEXT_PUBLIC_RESEND_API_KEY,
        length: process.env.NEXT_PUBLIC_RESEND_API_KEY?.length || 0,
        startsWith: process.env.NEXT_PUBLIC_RESEND_API_KEY?.substring(0, 10) + '...' || 'N/A',
        value: process.env.NEXT_PUBLIC_RESEND_API_KEY || 'NOT_SET',
      },
      OPENAI_API_KEY: {
        present: !!process.env.OPENAI_API_KEY,
        length: process.env.OPENAI_API_KEY?.length || 0,
        startsWith: process.env.OPENAI_API_KEY?.substring(0, 10) + '...' || 'N/A',
      },
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
    };

    return NextResponse.json({
      success: true,
      message: 'Debug variabili ambiente',
      timestamp: new Date().toISOString(),
      environment: envVars,
      resendConfigured: !!process.env.RESEND_API_KEY || !!process.env.NEXT_PUBLIC_RESEND_API_KEY,
    });
  } catch (error) {
    console.error('❌ Debug env error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Errore debug variabili ambiente',
        message: error instanceof Error ? error.message : 'Errore sconosciuto',
      },
      { status: 500 }
    );
  }
}
