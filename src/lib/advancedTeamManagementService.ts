import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { TeamMember, TeamRole, Permission, TeamInvitation, TeamPerformance, TeamActivity } from '@/types/team';
import { UserProfile } from '@/types/userProfile';
import { realEmailService } from './realEmailService';

export interface TeamManagementStats {
  totalMembers: number;
  activeMembers: number;
  pendingInvitations: number;
  averagePerformance: number;
  topPerformers: TeamMember[];
  recentActivity: TeamActivity[];
  roleDistribution: Record<TeamRole, number>;
  permissionUsage: Record<string, number>;
}

export interface TeamInvitationData {
  email: string;
  role: TeamRole;
  invitedBy: string;
  invitedByName: string;
  message?: string;
  expiresAt: Date;
}

export interface TeamMemberUpdate {
  role?: TeamRole;
  permissions?: Permission[];
  isActive?: boolean;
  currentActivity?: string;
  performance?: Partial<TeamPerformance>;
}

export interface TeamAnalytics {
  memberGrowth: { date: string; count: number }[];
  performanceTrends: { date: string; average: number }[];
  roleEfficiency: Record<TeamRole, number>;
  permissionUtilization: Record<string, number>;
  collaborationMetrics: {
    totalSessions: number;
    averageSessionDuration: number;
    topCollaborators: string[];
  };
}

class AdvancedTeamManagementService {
  private readonly TEAM_COLLECTION = 'teams';
  private readonly MEMBERS_COLLECTION = 'team_members';
  private readonly INVITATIONS_COLLECTION = 'team_invitations';
  private readonly ACTIVITIES_COLLECTION = 'team_activities';
  private readonly PERFORMANCE_COLLECTION = 'team_performance';

  /**
   * Ottiene tutti i membri del team con dati reali
   */
  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    try {
      console.log('🔍 [TeamService] Recupero membri team:', teamId);
      
      const membersRef = collection(db, this.MEMBERS_COLLECTION);
      const q = query(
        membersRef,
        where('teamId', '==', teamId),
        where('isActive', '==', true),
        orderBy('joinDate', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const members: TeamMember[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        members.push({
          id: doc.id,
          userId: data.userId,
          name: data.name,
          email: data.email,
          avatar: data.avatar || '👤',
          role: data.role,
          permissions: data.permissions || [],
          isOnline: data.isOnline || false,
          lastSeen: data.lastSeen?.toDate() || new Date(),
          currentActivity: data.currentActivity || 'Non specificato',
          joinDate: data.joinDate?.toDate() || new Date(),
          isActive: data.isActive || true,
          performance: data.performance || {
            commentsCount: 0,
            votesCount: 0,
            favoritesCount: 0,
            sessionsCreated: 0,
            sessionsJoined: 0,
            lastActivity: new Date()
          }
        });
      });
      
      console.log(`✅ [TeamService] Trovati ${members.length} membri team`);
      return members;
    } catch (error) {
      console.error('❌ [TeamService] Errore recupero membri team:', error);
      throw new Error('Impossibile recuperare i membri del team');
    }
  }

  /**
   * Ottiene un membro specifico del team
   */
  async getTeamMember(memberId: string): Promise<TeamMember | null> {
    try {
      const memberRef = doc(db, this.MEMBERS_COLLECTION, memberId);
      const memberDoc = await getDoc(memberRef);
      
      if (memberDoc.exists()) {
        const data = memberDoc.data();
        return {
          id: memberDoc.id,
          userId: data.userId,
          name: data.name,
          email: data.email,
          avatar: data.avatar || '👤',
          role: data.role,
          permissions: data.permissions || [],
          isOnline: data.isOnline || false,
          lastSeen: data.lastSeen?.toDate() || new Date(),
          currentActivity: data.currentActivity || 'Non specificato',
          joinDate: data.joinDate?.toDate() || new Date(),
          isActive: data.isActive || true,
          performance: data.performance || {
            commentsCount: 0,
            votesCount: 0,
            favoritesCount: 0,
            sessionsCreated: 0,
            sessionsJoined: 0,
            lastActivity: new Date()
          }
        };
      }
      
      return null;
    } catch (error) {
      console.error('❌ [TeamService] Errore recupero membro team:', error);
      throw new Error('Impossibile recuperare il membro del team');
    }
  }

  /**
   * Invita un nuovo membro al team
   */
  async inviteTeamMember(invitationData: TeamInvitationData): Promise<string> {
    try {
      console.log('📧 [TeamService] Invito nuovo membro:', invitationData.email);
      
      // Verifica se l'email è già nel team
      const existingMember = await this.getMemberByEmail(invitationData.email);
      if (existingMember) {
        throw new Error('Utente già presente nel team');
      }
      
      // Crea l'invito
      const invitationRef = collection(db, this.INVITATIONS_COLLECTION);
      const invitationDoc = await setDoc(doc(invitationRef), {
        ...invitationData,
        status: 'pending',
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(invitationData.expiresAt)
      });
      
      // Invia email di invito
      await this.sendInvitationEmail(invitationData);
      
      // Registra l'attività
      await this.logTeamActivity({
        type: 'member_invited',
        userId: invitationData.invitedBy,
        userName: invitationData.invitedByName,
        details: `Ha invitato ${invitationData.email} con ruolo ${invitationData.role}`,
        timestamp: new Date()
      });
      
      console.log('✅ [TeamService] Invito inviato con successo');
      return invitationDoc.id;
    } catch (error) {
      console.error('❌ [TeamService] Errore invito membro:', error);
      throw error;
    }
  }

  /**
   * Aggiorna i dati di un membro del team
   */
  async updateTeamMember(memberId: string, updates: TeamMemberUpdate): Promise<void> {
    try {
      console.log('🔄 [TeamService] Aggiornamento membro team:', memberId);
      
      const memberRef = doc(db, this.MEMBERS_COLLECTION, memberId);
      const updateData: any = {
        ...updates,
        updatedAt: serverTimestamp()
      };
      
      // Se si aggiorna il ruolo, aggiorna anche i permessi
      if (updates.role) {
        const rolePermissions = this.getRolePermissions(updates.role);
        updateData.permissions = rolePermissions;
      }
      
      await updateDoc(memberRef, updateData);
      
      // Registra l'attività
      await this.logTeamActivity({
        type: 'member_updated',
        userId: memberId,
        userName: 'Sistema',
        details: `Membro aggiornato: ${Object.keys(updates).join(', ')}`,
        timestamp: new Date()
      });
      
      console.log('✅ [TeamService] Membro team aggiornato');
    } catch (error) {
      console.error('❌ [TeamService] Errore aggiornamento membro:', error);
      throw new Error('Impossibile aggiornare il membro del team');
    }
  }

  /**
   * Rimuove un membro dal team
   */
  async removeTeamMember(memberId: string, removedBy: string): Promise<void> {
    try {
      console.log('👋 [TeamService] Rimozione membro team:', memberId);
      
      const memberRef = doc(db, this.MEMBERS_COLLECTION, memberId);
      const memberDoc = await getDoc(memberRef);
      
      if (!memberDoc.exists()) {
        throw new Error('Membro non trovato');
      }
      
      const memberData = memberDoc.data();
      
      // Soft delete - marca come inattivo invece di eliminare
      await updateDoc(memberRef, {
        isActive: false,
        removedAt: serverTimestamp(),
        removedBy: removedBy
      });
      
      // Registra l'attività
      await this.logTeamActivity({
        type: 'member_removed',
        userId: removedBy,
        userName: 'Sistema',
        details: `Membro rimosso: ${memberData.name} (${memberData.email})`,
        timestamp: new Date()
      });
      
      console.log('✅ [TeamService] Membro team rimosso');
    } catch (error) {
      console.error('❌ [TeamService] Errore rimozione membro:', error);
      throw new Error('Impossibile rimuovere il membro del team');
    }
  }

  /**
   * Ottiene le statistiche del team
   */
  async getTeamStats(teamId: string): Promise<TeamManagementStats> {
    try {
      console.log('📊 [TeamService] Recupero statistiche team:', teamId);
      
      const [members, invitations, activities, performance] = await Promise.all([
        this.getTeamMembers(teamId),
        this.getPendingInvitations(teamId),
        this.getRecentActivities(teamId, 10),
        this.getTeamPerformance(teamId)
      ]);
      
      const activeMembers = members.filter(m => m.isActive);
      const roleDistribution = this.calculateRoleDistribution(members);
      const permissionUsage = this.calculatePermissionUsage(members);
      
      const stats: TeamManagementStats = {
        totalMembers: members.length,
        activeMembers: activeMembers.length,
        pendingInvitations: invitations.length,
        averagePerformance: this.calculateAveragePerformance(performance),
        topPerformers: this.getTopPerformers(members, 5),
        recentActivity: activities,
        roleDistribution,
        permissionUsage
      };
      
      console.log('✅ [TeamService] Statistiche team recuperate');
      return stats;
    } catch (error) {
      console.error('❌ [TeamService] Errore recupero statistiche:', error);
      throw new Error('Impossibile recuperare le statistiche del team');
    }
  }

  /**
   * Ottiene le analitiche avanzate del team
   */
  async getTeamAnalytics(teamId: string, days: number = 30): Promise<TeamAnalytics> {
    try {
      console.log('📈 [TeamService] Recupero analitiche team:', teamId);
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const [activities, performance] = await Promise.all([
        this.getActivitiesInRange(teamId, startDate, new Date()),
        this.getPerformanceInRange(teamId, startDate, new Date())
      ]);
      
      const analytics: TeamAnalytics = {
        memberGrowth: this.calculateMemberGrowth(activities, days),
        performanceTrends: this.calculatePerformanceTrends(performance, days),
        roleEfficiency: this.calculateRoleEfficiency(activities),
        permissionUtilization: this.calculatePermissionUtilization(activities),
        collaborationMetrics: this.calculateCollaborationMetrics(activities)
      };
      
      console.log('✅ [TeamService] Analitiche team recuperate');
      return analytics;
    } catch (error) {
      console.error('❌ [TeamService] Errore recupero analitiche:', error);
      throw new Error('Impossibile recuperare le analitiche del team');
    }
  }

  /**
   * Sottoscrive ai cambiamenti del team in tempo reale
   */
  subscribeToTeamChanges(teamId: string, callback: (members: TeamMember[]) => void): () => void {
    const membersRef = collection(db, this.MEMBERS_COLLECTION);
    const q = query(
      membersRef,
      where('teamId', '==', teamId),
      where('isActive', '==', true)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const members: TeamMember[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        members.push({
          id: doc.id,
          userId: data.userId,
          name: data.name,
          email: data.email,
          avatar: data.avatar || '👤',
          role: data.role,
          permissions: data.permissions || [],
          isOnline: data.isOnline || false,
          lastSeen: data.lastSeen?.toDate() || new Date(),
          currentActivity: data.currentActivity || 'Non specificato',
          joinDate: data.joinDate?.toDate() || new Date(),
          isActive: data.isActive || true,
          performance: data.performance || {
            commentsCount: 0,
            votesCount: 0,
            favoritesCount: 0,
            sessionsCreated: 0,
            sessionsJoined: 0,
            lastActivity: new Date()
          }
        });
      });
      
      callback(members);
    });
    
    return unsubscribe;
  }

  // Metodi privati di supporto
  
  private async getMemberByEmail(email: string): Promise<TeamMember | null> {
    const membersRef = collection(db, this.MEMBERS_COLLECTION);
    const q = query(membersRef, where('email', '==', email), where('isActive', '==', true));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        name: data.name,
        email: data.email,
        avatar: data.avatar || '👤',
        role: data.role,
        permissions: data.permissions || [],
        isOnline: data.isOnline || false,
        lastSeen: data.lastSeen?.toDate() || new Date(),
        currentActivity: data.currentActivity || 'Non specificato',
        joinDate: data.joinDate?.toDate() || new Date(),
        isActive: data.isActive || true,
        performance: data.performance || {
          commentsCount: 0,
          votesCount: 0,
          favoritesCount: 0,
          sessionsCreated: 0,
          sessionsJoined: 0,
          lastActivity: new Date()
        }
      };
    }
    
    return null;
  }

  private async getPendingInvitations(teamId: string): Promise<TeamInvitation[]> {
    const invitationsRef = collection(db, this.INVITATIONS_COLLECTION);
    const q = query(
      invitationsRef,
      where('teamId', '==', teamId),
      where('status', '==', 'pending'),
      where('expiresAt', '>', Timestamp.now())
    );
    
    const snapshot = await getDocs(q);
    const invitations: TeamInvitation[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      invitations.push({
        id: doc.id,
        email: data.email,
        role: data.role,
        invitedBy: data.invitedBy,
        invitedByName: data.invitedByName,
        message: data.message,
        status: data.status,
        createdAt: data.createdAt?.toDate() || new Date(),
        expiresAt: data.expiresAt?.toDate() || new Date()
      });
    });
    
    return invitations;
  }

  private async getRecentActivities(teamId: string, limit: number): Promise<TeamActivity[]> {
    const activitiesRef = collection(db, this.ACTIVITIES_COLLECTION);
    const q = query(
      activitiesRef,
      where('teamId', '==', teamId),
      orderBy('timestamp', 'desc'),
      limit(limit)
    );
    
    const snapshot = await getDocs(q);
    const activities: TeamActivity[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      activities.push({
        id: doc.id,
        type: data.type,
        userId: data.userId,
        userName: data.userName,
        details: data.details,
        timestamp: data.timestamp?.toDate() || new Date()
      });
    });
    
    return activities;
  }

  private async getTeamPerformance(teamId: string): Promise<TeamPerformance[]> {
    const performanceRef = collection(db, this.PERFORMANCE_COLLECTION);
    const q = query(
      performanceRef,
      where('teamId', '==', teamId),
      orderBy('lastActivity', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const performance: TeamPerformance[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      performance.push({
        userId: data.userId,
        commentsCount: data.commentsCount || 0,
        votesCount: data.votesCount || 0,
        favoritesCount: data.favoritesCount || 0,
        sessionsCreated: data.sessionsCreated || 0,
        sessionsJoined: data.sessionsJoined || 0,
        lastActivity: data.lastActivity?.toDate() || new Date()
      });
    });
    
    return performance;
  }

  private async sendInvitationEmail(invitationData: TeamInvitationData): Promise<void> {
    try {
      const subject = `🏗️ Urbanova AI - Invito Team`;
      const message = `
        <h2>Sei stato invitato a unirti al team Urbanova AI!</h2>
        <p><strong>Ruolo:</strong> ${invitationData.role}</p>
        <p><strong>Invitato da:</strong> ${invitationData.invitedByName}</p>
        ${invitationData.message ? `<p><strong>Messaggio:</strong> ${invitationData.message}</p>` : ''}
        <p><strong>Scadenza invito:</strong> ${invitationData.expiresAt.toLocaleDateString('it-IT')}</p>
        <p>Clicca sul link per accettare l'invito e unirti al team.</p>
      `;
      
      await realEmailService.sendEmail({
        to: invitationData.email,
        subject,
        message,
        isHTML: true
      });
      
      console.log('✅ [TeamService] Email invito inviata');
    } catch (error) {
      console.error('❌ [TeamService] Errore invio email invito:', error);
      // Non bloccare il processo se l'email fallisce
    }
  }

  private async logTeamActivity(activity: Omit<TeamActivity, 'id'>): Promise<void> {
    try {
      const activitiesRef = collection(db, this.ACTIVITIES_COLLECTION);
      await setDoc(doc(activitiesRef), {
        ...activity,
        timestamp: Timestamp.fromDate(activity.timestamp)
      });
    } catch (error) {
      console.error('❌ [TeamService] Errore logging attività:', error);
      // Non bloccare il processo se il logging fallisce
    }
  }

  private getRolePermissions(role: TeamRole): Permission[] {
    const rolePermissions: Record<TeamRole, Permission[]> = {
      'OWNER': ['*'],
      'ADMIN': ['CREATE_SESSIONS', 'JOIN_SESSIONS', 'MANAGE_SESSIONS', 'DELETE_SESSIONS', 'ADD_COMMENTS', 'MANAGE_TEAM', 'MANAGE_PERMISSIONS'],
      'PROJECT_MANAGER': ['CREATE_SESSIONS', 'JOIN_SESSIONS', 'MANAGE_SESSIONS', 'ADD_COMMENTS', 'MANAGE_PROJECTS'],
      'FINANCIAL_ANALYST': ['JOIN_SESSIONS', 'ADD_COMMENTS', 'VIEW_FINANCIAL_DATA'],
      'ARCHITECT': ['JOIN_SESSIONS', 'ADD_COMMENTS', 'MANAGE_DESIGNS'],
      'DEVELOPER': ['JOIN_SESSIONS', 'ADD_COMMENTS', 'MANAGE_CODE'],
      'TEAM_MEMBER': ['JOIN_SESSIONS', 'ADD_COMMENTS']
    };
    
    return rolePermissions[role] || [];
  }

  private calculateRoleDistribution(members: TeamMember[]): Record<TeamRole, number> {
    const distribution: Record<TeamRole, number> = {
      'OWNER': 0,
      'ADMIN': 0,
      'PROJECT_MANAGER': 0,
      'FINANCIAL_ANALYST': 0,
      'ARCHITECT': 0,
      'DEVELOPER': 0,
      'TEAM_MEMBER': 0
    };
    
    members.forEach(member => {
      if (distribution[member.role] !== undefined) {
        distribution[member.role]++;
      }
    });
    
    return distribution;
  }

  private calculatePermissionUsage(members: TeamMember[]): Record<string, number> {
    const usage: Record<string, number> = {};
    
    members.forEach(member => {
      member.permissions.forEach(permission => {
        usage[permission] = (usage[permission] || 0) + 1;
      });
    });
    
    return usage;
  }

  private calculateAveragePerformance(performance: TeamPerformance[]): number {
    if (performance.length === 0) return 0;
    
    const totalScore = performance.reduce((sum, perf) => {
      return sum + (perf.commentsCount + perf.votesCount + perf.favoritesCount + perf.sessionsCreated + perf.sessionsJoined);
    }, 0);
    
    return Math.round(totalScore / performance.length);
  }

  private getTopPerformers(members: TeamMember[], limit: number): TeamMember[] {
    return members
      .sort((a, b) => {
        const scoreA = (a.performance?.commentsCount || 0) + (a.performance?.votesCount || 0) + (a.performance?.favoritesCount || 0);
        const scoreB = (b.performance?.commentsCount || 0) + (b.performance?.votesCount || 0) + (b.performance?.favoritesCount || 0);
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }

  private async getActivitiesInRange(teamId: string, startDate: Date, endDate: Date): Promise<TeamActivity[]> {
    const activitiesRef = collection(db, this.ACTIVITIES_COLLECTION);
    const q = query(
      activitiesRef,
      where('teamId', '==', teamId),
      where('timestamp', '>=', Timestamp.fromDate(startDate)),
      where('timestamp', '<=', Timestamp.fromDate(endDate))
    );
    
    const snapshot = await getDocs(q);
    const activities: TeamActivity[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      activities.push({
        id: doc.id,
        type: data.type,
        userId: data.userId,
        userName: data.userName,
        details: data.details,
        timestamp: data.timestamp?.toDate() || new Date()
      });
    });
    
    return activities;
  }

  private async getPerformanceInRange(teamId: string, startDate: Date, endDate: Date): Promise<TeamPerformance[]> {
    const performanceRef = collection(db, this.PERFORMANCE_COLLECTION);
    const q = query(
      performanceRef,
      where('teamId', '==', teamId),
      where('lastActivity', '>=', Timestamp.fromDate(startDate)),
      where('lastActivity', '<=', Timestamp.fromDate(endDate))
    );
    
    const snapshot = await getDocs(q);
    const performance: TeamPerformance[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      performance.push({
        userId: data.userId,
        commentsCount: data.commentsCount || 0,
        votesCount: data.votesCount || 0,
        favoritesCount: data.favoritesCount || 0,
        sessionsCreated: data.sessionsCreated || 0,
        sessionsJoined: data.sessionsJoined || 0,
        lastActivity: data.lastActivity?.toDate() || new Date()
      });
    });
    
    return performance;
  }

  private calculateMemberGrowth(activities: TeamActivity[], days: number): { date: string; count: number }[] {
    const growth: { date: string; count: number }[] = [];
    const memberCounts: Record<string, number> = {};
    
    // Inizializza tutti i giorni
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      growth.push({ date: dateStr, count: 0 });
    }
    
    // Calcola la crescita basata sulle attività
    activities.forEach(activity => {
      if (activity.type === 'member_joined') {
        const dateStr = activity.timestamp.toISOString().split('T')[0];
        const growthEntry = growth.find(g => g.date === dateStr);
        if (growthEntry) {
          growthEntry.count++;
        }
      }
    });
    
    // Calcola il conteggio cumulativo
    let cumulative = 0;
    growth.forEach(entry => {
      cumulative += entry.count;
      entry.count = cumulative;
    });
    
    return growth;
  }

  private calculatePerformanceTrends(performance: TeamPerformance[], days: number): { date: string; average: number }[] {
    const trends: { date: string; average: number }[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Calcola la media per questo giorno
      const dayPerformance = performance.filter(p => {
        const perfDate = p.lastActivity.toISOString().split('T')[0];
        return perfDate === dateStr;
      });
      
      if (dayPerformance.length > 0) {
        const average = dayPerformance.reduce((sum, p) => {
          return sum + (p.commentsCount + p.votesCount + p.favoritesCount);
        }, 0) / dayPerformance.length;
        trends.push({ date: dateStr, average: Math.round(average) });
      } else {
        trends.push({ date: dateStr, average: 0 });
      }
    }
    
    return trends;
  }

  private calculateRoleEfficiency(activities: TeamActivity[]): Record<TeamRole, number> {
    const roleActivity: Record<TeamRole, number> = {
      'OWNER': 0,
      'ADMIN': 0,
      'PROJECT_MANAGER': 0,
      'FINANCIAL_ANALYST': 0,
      'ARCHITECT': 0,
      'DEVELOPER': 0,
      'TEAM_MEMBER': 0
    };
    
    activities.forEach(activity => {
      // Logica per calcolare l'efficienza per ruolo
      // Questo è un esempio semplificato
      roleActivity['TEAM_MEMBER']++;
    });
    
    return roleActivity;
  }

  private calculatePermissionUtilization(activities: TeamActivity[]): Record<string, number> {
    const utilization: Record<string, number> = {};
    
    activities.forEach(activity => {
      // Logica per calcolare l'utilizzo dei permessi
      // Questo è un esempio semplificato
      if (activity.type.includes('permission')) {
        const permission = activity.type.replace('permission_', '');
        utilization[permission] = (utilization[permission] || 0) + 1;
      }
    });
    
    return utilization;
  }

  private calculateCollaborationMetrics(activities: TeamActivity[]): {
    totalSessions: number;
    averageSessionDuration: number;
    topCollaborators: string[];
  } {
    const sessionActivities = activities.filter(a => a.type.includes('session'));
    const collaborators: Record<string, number> = {};
    
    sessionActivities.forEach(activity => {
      collaborators[activity.userId] = (collaborators[activity.userId] || 0) + 1;
    });
    
    const topCollaborators = Object.entries(collaborators)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([userId]) => userId);
    
    return {
      totalSessions: sessionActivities.length,
      averageSessionDuration: 45, // Minuti - esempio
      topCollaborators
    };
  }
}

export const advancedTeamManagementService = new AdvancedTeamManagementService();
