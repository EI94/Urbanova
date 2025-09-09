import { NextRequest, NextResponse } from 'next/server';
import { workspaceService } from '@/lib/workspaceService';
import { ShareProjectRequest } from '@/types/workspace';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      workspaceId, 
      projectId, 
      projectType, 
      permissions, 
      sharedBy 
    } = body;

    // Validazione input
    if (!workspaceId || !projectId || !projectType || !permissions || !sharedBy) {
      return NextResponse.json(
        { success: false, error: 'Campi obbligatori mancanti' },
        { status: 400 }
      );
    }

    // Validazione tipo progetto
    if (!['feasibility', 'business-plan', 'market-intelligence', 'design'].includes(projectType)) {
      return NextResponse.json(
        { success: false, error: 'Tipo progetto non valido' },
        { status: 400 }
      );
    }

    // Validazione permessi
    if (!Array.isArray(permissions.canView) || 
        !Array.isArray(permissions.canEdit) || 
        !Array.isArray(permissions.canDelete)) {
      return NextResponse.json(
        { success: false, error: 'Formato permessi non valido' },
        { status: 400 }
      );
    }

    const shareRequest: ShareProjectRequest = {
      projectId,
      projectType,
      permissions
    };

    const sharedProjectId = await workspaceService.shareProject(
      workspaceId,
      shareRequest,
      sharedBy
    );

    console.log('✅ [API] Progetto condiviso:', sharedProjectId);

    return NextResponse.json({
      success: true,
      sharedProjectId,
      message: 'Progetto condiviso con successo'
    });

  } catch (error) {
    console.error('❌ [API] Errore condivisione progetto:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Errore interno del server' 
      },
      { status: 500 }
    );
  }
}
