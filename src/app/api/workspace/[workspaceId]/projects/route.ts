import { NextRequest, NextResponse } from 'next/server';
import { workspaceService } from '@/lib/workspaceService';

export async function GET(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { workspaceId } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID richiesto' },
        { status: 400 }
      );
    }

    const sharedProjects = await workspaceService.getSharedProjects(workspaceId, userId);

    console.log('✅ [API] Progetti condivisi caricati:', sharedProjects.length);

    return NextResponse.json({
      success: true,
      projects: sharedProjects,
      count: sharedProjects.length
    });

  } catch (error) {
    console.error('❌ [API] Errore caricamento progetti condivisi:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Errore interno del server' 
      },
      { status: 500 }
    );
  }
}
