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

    const members = await workspaceService.getWorkspaceMembers(workspaceId);

    console.log('✅ [API] Membri workspace caricati:', workspaceId, members.length);

    return NextResponse.json({
      success: true,
      members,
      count: members.length
    });

  } catch (error) {
    console.error('❌ [API] Errore caricamento membri workspace:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Errore interno del server' 
      },
      { status: 500 }
    );
  }
}
