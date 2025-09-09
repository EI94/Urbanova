import { NextRequest, NextResponse } from 'next/server';
import { workspaceService } from '@/lib/workspaceService';
import { InviteMemberRequest } from '@/types/workspace';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, email, role, message, invitedBy } = body;

    // Validazione input
    if (!workspaceId || !email || !role || !invitedBy) {
      return NextResponse.json(
        { success: false, error: 'Campi obbligatori mancanti' },
        { status: 400 }
      );
    }

    // Validazione email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Email non valida' },
        { status: 400 }
      );
    }

    // Validazione ruolo
    if (!['admin', 'member', 'viewer'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Ruolo non valido' },
        { status: 400 }
      );
    }

    const inviteRequest: InviteMemberRequest = {
      email,
      role,
      message
    };

    const invitationId = await workspaceService.inviteMember(
      workspaceId,
      inviteRequest,
      invitedBy
    );

    console.log('✅ [API] Invito creato:', invitationId);

    return NextResponse.json({
      success: true,
      invitationId,
      message: 'Invito inviato con successo'
    });

  } catch (error) {
    console.error('❌ [API] Errore invito membro:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Errore interno del server' 
      },
      { status: 500 }
    );
  }
}
