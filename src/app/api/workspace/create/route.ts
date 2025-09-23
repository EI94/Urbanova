import { NextRequest, NextResponse } from 'next/server';
import { workspaceService } from '@/lib/workspaceService';
import { CreateWorkspaceRequest } from '@/types/workspace';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, companyName, companyDomain, ownerId, ownerEmail } = body;

    // Validazione input
    if (!name || !companyName || !ownerId || !ownerEmail) {
      return NextResponse.json(
        { success: false, error: 'Campi obbligatori mancanti' },
        { status: 400 }
      );
    }

    const createRequest: CreateWorkspaceRequest = {
      name,
      description,
      companyName,
      companyDomain
    };

    const workspaceId = await workspaceService.createWorkspace(
      createRequest,
      ownerId,
      ownerEmail
    );

    console.log('✅ [API] Workspace creato:', workspaceId);

    return NextResponse.json({
      success: true,
      workspaceId,
      message: 'Workspace creato con successo'
    });

  } catch (error) {
    console.error('❌ [API] Errore creazione workspace:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Errore interno del server' 
      },
      { status: 500 }
    );
  }
}
