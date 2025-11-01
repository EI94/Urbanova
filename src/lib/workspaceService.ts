// Servizio per la gestione dei workspace collaborativi
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
  runTransaction,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';

import { db } from './firebase.ts';

// 🛡️ OS PROTECTION - Importa protezione CSS per workspace service
import '@/lib/osProtection';
import {
  Workspace,
  WorkspaceMember,
  WorkspaceInvitation,
  SharedProject,
  ProjectCollaboration,
  CollaborationActivity,
  WorkspaceNotification,
  CreateWorkspaceRequest,
  InviteMemberRequest,
  ShareProjectRequest,
  UpdateProjectPermissionsRequest
} from '@/types/workspace';
import { firebaseNotificationService } from './firebaseNotificationService';

export class WorkspaceService {
  private readonly WORKSPACES_COLLECTION = 'workspaces';
  private readonly MEMBERS_COLLECTION = 'workspaceMembers';
  private readonly INVITATIONS_COLLECTION = 'workspaceInvitations';
  private readonly SHARED_PROJECTS_COLLECTION = 'sharedProjects';
  private readonly COLLABORATIONS_COLLECTION = 'projectCollaborations';
  private readonly ACTIVITIES_COLLECTION = 'collaborationActivities';
  private readonly NOTIFICATIONS_COLLECTION = 'workspaceNotifications';

  // Crea un nuovo workspace
  async createWorkspace(
    request: CreateWorkspaceRequest,
    ownerId: string,
    ownerEmail: string
  ): Promise<string> {
    try {

      // Usa addDoc invece di runTransaction per evitare problemi di tipo
      const workspaceData: Omit<Workspace, 'id'> = {
        name: request.name,
        description: request.description,
        companyName: request.companyName,
        companyDomain: request.companyDomain,
        ownerId,
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {
          allowGuestAccess: false,
          requireApprovalForJoins: true,
          maxMembers: 10 // Free plan
        },
        subscription: {
          plan: 'free',
          seats: 10,
          usedSeats: 1,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 giorni
        }
      };

      // Crea il workspace
      const workspaceRef = await addDoc(collection(db, this.WORKSPACES_COLLECTION), workspaceData);

      // Aggiungi il proprietario come membro
      const memberData: Omit<WorkspaceMember, 'id'> = {
        workspaceId: workspaceRef.id,
        userId: ownerId,
        email: ownerEmail,
        role: 'owner',
        status: 'active',
        joinedAt: new Date(),
        invitedBy: ownerId,
        permissions: {
          canCreateProjects: true,
          canEditProjects: true,
          canDeleteProjects: true,
          canInviteMembers: true,
          canManageSettings: true
        }
      };

      await addDoc(collection(db!, this.MEMBERS_COLLECTION), memberData);

      return workspaceRef.id;
    } catch (error) {
      console.error('❌ [Workspace] Errore creazione workspace:', error);
      throw new Error(`Impossibile creare il workspace: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
    }
  }

  // Ottieni workspace per utente
  async getWorkspacesByUser(userId: string): Promise<Workspace[]> {
    try {

      // Trova tutti i workspace dove l'utente è membro
      const membersQuery = query(
        collection(db!, this.MEMBERS_COLLECTION),
        where('userId', '==', userId),
        where('status', '==', 'active')
      );
      const membersSnapshot = await getDocs(membersQuery);
      
      const workspaceIds = membersSnapshot.docs.map(doc => doc.data().workspaceId);
      
      if (workspaceIds.length === 0) {
        return [];
      }

      // Carica i workspace
      const workspacesQuery = query(
        collection(db, this.WORKSPACES_COLLECTION),
        where('__name__', 'in', workspaceIds)
      );
      const workspacesSnapshot = await getDocs(workspacesQuery);
      
      const workspaces = workspacesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Workspace[];

      return workspaces;
    } catch (error) {
      console.error('❌ [Workspace] Errore caricamento workspace:', error);
      return [];
    }
  }

  // Ottieni workspace per ID
  async getWorkspaceById(workspaceId: string): Promise<Workspace | null> {
    try {
      const workspaceRef = doc(db, this.WORKSPACES_COLLECTION, workspaceId);
      const workspaceSnap = await getDoc(workspaceRef);
      
      if (workspaceSnap.exists()) {
        return {
          id: workspaceSnap.id,
          ...workspaceSnap.data()
        } as Workspace;
      }
      
      return null;
    } catch (error) {
      console.error('❌ [Workspace] Errore caricamento workspace:', error);
      return null;
    }
  }

  // Invita un membro al workspace
  async inviteMember(
    workspaceId: string,
    request: InviteMemberRequest,
    invitedBy: string
  ): Promise<string> {
    try {

      return await runTransaction(db, async (transaction) => {
        // Verifica che il workspace esista
        const workspaceRef = doc(db, this.WORKSPACES_COLLECTION, workspaceId);
        const workspaceSnap = await getDoc(workspaceRef);
        
        if (!workspaceSnap.exists()) {
          throw new Error('Workspace non trovato');
        }

        const workspace = workspaceSnap.data() as Workspace;

        // Verifica che non sia già membro
        const existingMemberQuery = query(
          collection(db!, this.MEMBERS_COLLECTION),
          where('workspaceId', '==', workspaceId),
          where('email', '==', request.email)
        );
        const existingMemberSnapshot = await getDocs(existingMemberQuery);
        
        if (!existingMemberSnapshot.empty) {
          throw new Error('Utente già membro del workspace');
        }

        // Crea invito
        const invitationData: Omit<WorkspaceInvitation, 'id'> = {
          workspaceId,
          email: request.email,
          role: request.role,
          invitedBy,
          status: 'pending',
          token: this.generateInvitationToken(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 giorni
          createdAt: new Date()
        };

        const invitationRef = doc(collection(db, this.INVITATIONS_COLLECTION));
        transaction.set(invitationRef, invitationData);

        // Crea notifica per chi ha invitato
        await this.createNotification(transaction, {
          workspaceId,
          userId: invitedBy, // Notifica per chi ha invitato
          type: 'invitation',
          title: 'Invito inviato',
          message: `Invito inviato a ${request.email}`,
          data: { email: request.email, role: request.role }
        });

        // Crea notifica reale per l'utente invitato (se ha un account)
        try {
          // Cerca l'utente per email nel database
          const usersQuery = query(
            collection(db, 'userProfiles'),
            where('email', '==', request.email)
          );
          const usersSnapshot = await getDocs(usersQuery);
          
          if (!usersSnapshot.empty) {
            const userDoc = usersSnapshot.docs[0];
            const invitedUserId = userDoc.id;
            
            await firebaseNotificationService.createWorkspaceInviteNotification(
              invitedUserId,
              workspace.name,
              'Collega Urbanova' // TODO: Ottenere il nome reale dell'utente che invita
            );
            
          } else {
          }
        } catch (notificationError) {
          console.warn('⚠️ [Workspace] Errore creazione notifica invito (non critico):', notificationError);
          // Non bloccare il processo per errori di notifica
        }

        return invitationRef.id;
      });
    } catch (error) {
      console.error('❌ [Workspace] Errore invito membro:', error);
      throw new Error(`Impossibile invitare il membro: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
    }
  }

  // Accetta invito
  async acceptInvitation(
    invitationId: string,
    userId: string
  ): Promise<string> {
    try {

      return await runTransaction(db, async (transaction) => {
        // Carica invito
        const invitationRef = doc(db, this.INVITATIONS_COLLECTION, invitationId);
        const invitationSnap = await getDoc(invitationRef);
        
        if (!invitationSnap.exists()) {
          throw new Error('Invito non trovato');
        }

        const invitation = invitationSnap.data() as WorkspaceInvitation;

        // Verifica che non sia scaduto
        if (invitation.expiresAt < new Date()) {
          throw new Error('Invito scaduto');
        }

        // Aggiorna invito
        transaction.update(invitationRef, {
          status: 'accepted',
          updatedAt: serverTimestamp()
        });

        // Crea membro
        const memberData: Omit<WorkspaceMember, 'id'> = {
          workspaceId: invitation.workspaceId,
          userId,
          email: invitation.email,
          role: invitation.role,
          status: 'active',
          joinedAt: new Date(),
          invitedBy: invitation.invitedBy,
          permissions: this.getDefaultPermissions(invitation.role)
        };

        const memberRef = doc(collection(db!, this.MEMBERS_COLLECTION));
        transaction.set(memberRef, memberData);

        // Aggiorna contatore posti utilizzati
        const workspaceRef = doc(db, this.WORKSPACES_COLLECTION, invitation.workspaceId);
        transaction.update(workspaceRef, {
          'subscription.usedSeats': workspaceSnap.data()?.subscription?.usedSeats + 1,
          updatedAt: serverTimestamp()
        });

        return invitation.workspaceId;
      });
    } catch (error) {
      console.error('❌ [Workspace] Errore accettazione invito:', error);
      throw new Error(`Impossibile accettare l'invito: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
    }
  }

  // Condividi progetto
  async shareProject(
    workspaceId: string,
    request: ShareProjectRequest,
    sharedBy: string
  ): Promise<string> {
    try {

      return await runTransaction(db, async (transaction) => {
        // Verifica che l'utente sia membro del workspace
        const memberQuery = query(
          collection(db!, this.MEMBERS_COLLECTION),
          where('workspaceId', '==', workspaceId),
          where('userId', '==', sharedBy),
          where('status', '==', 'active')
        );
        const memberSnapshot = await getDocs(memberQuery);
        
        if (memberSnapshot.empty) {
          throw new Error('Non sei membro di questo workspace');
        }

        // Crea condivisione progetto
        const sharedProjectData: Omit<SharedProject, 'id'> = {
          projectId: request.projectId,
          projectType: request.projectType,
          workspaceId,
          sharedBy,
          sharedAt: new Date(),
          permissions: request.permissions,
          lastModifiedBy: sharedBy,
          lastModifiedAt: new Date()
        };

        const sharedProjectRef = doc(collection(db, this.SHARED_PROJECTS_COLLECTION));
        transaction.set(sharedProjectRef, sharedProjectData);

        // Crea collaborazioni per ogni utente con permessi
        const allUserIds = [
          ...request.permissions.canView,
          ...request.permissions.canEdit,
          ...request.permissions.canDelete
        ].filter((id, index, arr) => arr.indexOf(id) === index); // Rimuovi duplicati

        for (const userId of allUserIds) {
          const collaborationData: Omit<ProjectCollaboration, 'id'> = {
            projectId: request.projectId,
            workspaceId,
            collaboratorId: userId,
            permissions: {
              canView: request.permissions.canView.includes(userId),
              canEdit: request.permissions.canEdit.includes(userId),
              canDelete: request.permissions.canDelete.includes(userId),
              canComment: true // Sempre true per i collaboratori
            },
            joinedAt: new Date(),
            lastActiveAt: new Date()
          };

          const collaborationRef = doc(collection(db, this.COLLABORATIONS_COLLECTION));
          transaction.set(collaborationRef, collaborationData);
        }

        // Crea attività
        await this.createActivity(transaction, {
          projectId: request.projectId,
          workspaceId,
          userId: sharedBy,
          action: 'shared',
          description: `Progetto condiviso con ${allUserIds.length} collaboratori`,
          metadata: { collaboratorCount: allUserIds.length }
        });

        return sharedProjectRef.id;
      });
    } catch (error) {
      console.error('❌ [Workspace] Errore condivisione progetto:', error);
      throw new Error(`Impossibile condividere il progetto: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
    }
  }

  // Ottieni progetti condivisi per workspace
  async getSharedProjects(workspaceId: string, userId: string): Promise<SharedProject[]> {
    try {

      // Verifica che l'utente sia membro del workspace
      const memberQuery = query(
        collection(db!, this.MEMBERS_COLLECTION),
        where('workspaceId', '==', workspaceId),
        where('userId', '==', userId),
        where('status', '==', 'active')
      );
      const memberSnapshot = await getDocs(memberQuery);
      
      if (memberSnapshot.empty) {
        throw new Error('Non sei membro di questo workspace');
      }

      // Carica progetti condivisi
      const sharedProjectsQuery = query(
        collection(db, this.SHARED_PROJECTS_COLLECTION),
        where('workspaceId', '==', workspaceId),
        orderBy('lastModifiedAt', 'desc')
      );
      const sharedProjectsSnapshot = await getDocs(sharedProjectsQuery);
      
      const sharedProjects = sharedProjectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SharedProject[];

      return sharedProjects;
    } catch (error) {
      console.error('❌ [Workspace] Errore caricamento progetti condivisi:', error);
      return [];
    }
  }

  // Ottieni membri del workspace
  async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    try {
      const membersQuery = query(
        collection(db!, this.MEMBERS_COLLECTION),
        where('workspaceId', '==', workspaceId),
        where('status', '==', 'active'),
        orderBy('joinedAt', 'asc')
      );
      const membersSnapshot = await getDocs(membersQuery);
      
      return membersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WorkspaceMember[];
    } catch (error) {
      console.error('❌ [Workspace] Errore caricamento membri:', error);
      return [];
    }
  }

  // Sottoscrivi a notifiche workspace
  subscribeToWorkspaceNotifications(
    workspaceId: string,
    userId: string,
    callback: (notifications: WorkspaceNotification[]) => void
  ): Unsubscribe {
    const notificationsQuery = query(
      collection(db, this.NOTIFICATIONS_COLLECTION),
      where('workspaceId', '==', workspaceId),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    // CHIRURGICO: Disabilitato onSnapshot temporaneamente per evitare 400 error
    // return onSnapshot(notificationsQuery, (snapshot) => {
    //   const notifications = snapshot.docs.map(doc => ({
    //     id: doc.id,
    //     ...doc.data()
    //   })) as WorkspaceNotification[];
    //   
    //   callback(notifications);
    // });
    
    // CHIRURGICO: Callback vuoto per evitare 400 error
    return () => {};
  }

  // Metodi privati
  private generateInvitationToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private getDefaultPermissions(role: string) {
    switch (role) {
      case 'admin':
        return {
          canCreateProjects: true,
          canEditProjects: true,
          canDeleteProjects: true,
          canInviteMembers: true,
          canManageSettings: true
        };
      case 'member':
        return {
          canCreateProjects: true,
          canEditProjects: true,
          canDeleteProjects: false,
          canInviteMembers: false,
          canManageSettings: false
        };
      case 'viewer':
        return {
          canCreateProjects: false,
          canEditProjects: false,
          canDeleteProjects: false,
          canInviteMembers: false,
          canManageSettings: false
        };
      default:
        return {
          canCreateProjects: false,
          canEditProjects: false,
          canDeleteProjects: false,
          canInviteMembers: false,
          canManageSettings: false
        };
    }
  }

  private async createNotification(
    transaction: any,
    notification: Omit<WorkspaceNotification, 'id'>
  ): Promise<void> {
    const notificationRef = doc(collection(db, this.NOTIFICATIONS_COLLECTION));
    transaction.set(notificationRef, {
      ...notification,
      read: false,
      createdAt: new Date()
    });
  }

  private async createActivity(
    transaction: any,
    activity: Omit<CollaborationActivity, 'id'>
  ): Promise<void> {
    const activityRef = doc(collection(db, this.ACTIVITIES_COLLECTION));
    transaction.set(activityRef, {
      ...activity,
      timestamp: new Date()
    });
  }
}

export const workspaceService = new WorkspaceService();
