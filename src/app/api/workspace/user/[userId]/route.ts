import { NextRequest, NextResponse } from 'next/server';
import { workspaceService } from '@/lib/workspaceService';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID richiesto' },
        { status: 400 }
      );
    }

    const workspaces = await workspaceService.getWorkspacesByUser(userId);

    console.log('✅ [API] Workspace caricati per utente:', userId, workspaces.length);

    return NextResponse.json({
      success: true,
      workspaces,
      count: workspaces.length
    });

  } catch (error) {
    console.error('❌ [API] Errore caricamento workspace utente:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Errore interno del server' 
      },
      { status: 500 }
    );
  }
}
