import { TeamRole, Permission, RolePermissions, TeamMember } from '@/types/team';

// Configurazione ruoli e permessi
export const ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: 'PROJECT_MANAGER',
    permissions: [
      // Gestione Sessioni
      'CREATE_SESSIONS',
      'JOIN_SESSIONS',
      'MANAGE_SESSIONS',
      'DELETE_SESSIONS',
      // Gestione Commenti
      'ADD_COMMENTS',
      'EDIT_COMMENTS',
      'DELETE_COMMENTS',
      'MODERATE_COMMENTS',
      // Gestione Preferiti
      'ADD_TO_FAVORITES',
      'REMOVE_FROM_FAVORITES',
      'UPDATE_PRIORITY',
      'UPDATE_STATUS',
      // Gestione Team
      'INVITE_MEMBERS',
      'REMOVE_MEMBERS',
      'ASSIGN_ROLES',
      'MANAGE_PERMISSIONS',
      // Analytics e Reporting
      'VIEW_ANALYTICS',
      'EXPORT_REPORTS',
      'VIEW_TEAM_PERFORMANCE',
      // Approvazioni
      'APPROVE_DECISIONS',
      'REJECT_DECISIONS',
      'OVERRIDE_DECISIONS',
    ],
    description: 'Gestisce progetti, team e workflow. Ha accesso completo a tutte le funzionalità.',
    capabilities: [
      'Creare e gestire sessioni collaborative',
      'Assegnare ruoli e permessi ai membri',
      'Approvare decisioni critiche del team',
      'Monitorare performance e analytics',
      'Gestire workflow e approvazioni',
      'Moderare contenuti e commenti',
    ],
  },
  {
    role: 'FINANCIAL_ANALYST',
    permissions: [
      // Gestione Sessioni
      'CREATE_SESSIONS',
      'JOIN_SESSIONS',
      // Gestione Commenti
      'ADD_COMMENTS',
      'EDIT_COMMENTS',
      // Gestione Preferiti
      'ADD_TO_FAVORITES',
      'UPDATE_PRIORITY',
      'UPDATE_STATUS',
      // Analytics
      'VIEW_ANALYTICS',
      'VIEW_TEAM_PERFORMANCE',
    ],
    description: 'Specializzato in analisi finanziarie, ROI e valutazioni economiche.',
    capabilities: [
      'Analisi ROI dettagliate per terreni',
      'Valutazioni finanziarie collaborative',
      'Risk assessment e proiezioni',
      'Commenti specializzati su aspetti economici',
      'Prioritizzazione basata su criteri finanziari',
      'Analisi di mercato e trend economici',
    ],
  },
  {
    role: 'ARCHITECT',
    permissions: [
      // Gestione Sessioni
      'CREATE_SESSIONS',
      'JOIN_SESSIONS',
      // Gestione Commenti
      'ADD_COMMENTS',
      'EDIT_COMMENTS',
      // Gestione Preferiti
      'ADD_TO_FAVORITES',
      'UPDATE_PRIORITY',
      // Analytics
      'VIEW_ANALYTICS',
    ],
    description: 'Specializzato in valutazioni tecniche, design e compliance edilizia.',
    capabilities: [
      'Valutazioni tecniche dei terreni',
      'Analisi fattibilità architettonica',
      'Review compliance e building codes',
      'Suggerimenti ottimizzazione design',
      'Commenti su aspetti tecnici',
      'Valutazioni sostenibilità e innovazione',
    ],
  },
  {
    role: 'DEVELOPER',
    permissions: [
      // Gestione Sessioni
      'JOIN_SESSIONS',
      // Gestione Commenti
      'ADD_COMMENTS',
      'EDIT_COMMENTS',
      // Gestione Preferiti
      'ADD_TO_FAVORITES',
      // Analytics
      'VIEW_ANALYTICS',
    ],
    description: 'Gestisce aspetti tecnici, integrazioni e performance del sistema.',
    capabilities: [
      'Gestione tecnica del sistema',
      'Ottimizzazione performance',
      'Integrazioni API e servizi',
      'Debugging e troubleshooting',
      'Documentazione tecnica',
      'Supporto tecnico al team',
    ],
  },
  {
    role: 'TEAM_MEMBER',
    permissions: [
      // Gestione Sessioni
      'JOIN_SESSIONS',
      // Gestione Commenti
      'ADD_COMMENTS',
      // Gestione Preferiti
      'ADD_TO_FAVORITES',
    ],
    description: 'Membro base del team con accesso limitato alle funzionalità collaborative.',
    capabilities: [
      'Partecipare a sessioni collaborative',
      'Aggiungere commenti e feedback',
      'Votare e valutare terreni',
      'Aggiungere ai preferiti condivisi',
      'Collaborare con il team',
    ],
  },
];

export class TeamRoleManager {
  private static instance: TeamRoleManager;
  private currentUser: TeamMember | null = null;

  private constructor() {}

  static getInstance(): TeamRoleManager {
    if (!TeamRoleManager.instance) {
      TeamRoleManager.instance = new TeamRoleManager();
    }
    return TeamRoleManager.instance;
  }

  // Imposta l'utente corrente
  setCurrentUser(user: TeamMember) {
    this.currentUser = user;
  }

  // Ottiene l'utente corrente
  getCurrentUser(): TeamMember | null {
    return this.currentUser;
  }

  // Verifica se l'utente ha un permesso specifico
  hasPermission(permission: Permission): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.permissions.includes(permission);
  }

  // Verifica se l'utente ha uno dei permessi specificati
  hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  // Verifica se l'utente ha tutti i permessi specificati
  hasAllPermissions(permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  // Verifica se l'utente ha un ruolo specifico
  hasRole(role: TeamRole): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.role === role;
  }

  // Verifica se l'utente ha uno dei ruoli specificati
  hasAnyRole(roles: TeamRole[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  // Ottiene i permessi per un ruolo specifico
  getPermissionsForRole(role: TeamRole): Permission[] {
    const roleConfig = ROLE_PERMISSIONS.find(r => r.role === role);
    return roleConfig ? roleConfig.permissions : [];
  }

  // Ottiene la configurazione completa per un ruolo
  getRoleConfig(role: TeamRole): RolePermissions | null {
    return ROLE_PERMISSIONS.find(r => r.role === role) || null;
  }

  // Ottiene tutti i ruoli disponibili
  getAllRoles(): TeamRole[] {
    return ROLE_PERMISSIONS.map(r => r.role);
  }

  // Ottiene tutti i permessi disponibili
  getAllPermissions(): Permission[] {
    const allPermissions = new Set<Permission>();
    ROLE_PERMISSIONS.forEach(role => {
      role.permissions.forEach(permission => allPermissions.add(permission));
    });
    return Array.from(allPermissions);
  }

  // Calcola il peso del voto basato sul ruolo
  getVoteWeight(role: TeamRole): number {
    switch (role) {
      case 'PROJECT_MANAGER':
        return 3.0;
      case 'FINANCIAL_ANALYST':
        return 2.5;
      case 'ARCHITECT':
        return 2.0;
      case 'DEVELOPER':
        return 1.5;
      case 'TEAM_MEMBER':
        return 1.0;
      default:
        return 1.0;
    }
  }

  // Verifica se l'utente può gestire un altro membro
  canManageMember(targetRole: TeamRole): boolean {
    if (!this.currentUser) return false;

    const currentUserRole = this.currentUser.role;
    const roleHierarchy: { [key in TeamRole]: number } = {
      PROJECT_MANAGER: 5,
      FINANCIAL_ANALYST: 4,
      ARCHITECT: 3,
      DEVELOPER: 2,
      TEAM_MEMBER: 1,
    };

    return roleHierarchy[currentUserRole] > roleHierarchy[targetRole];
  }

  // Verifica se l'utente può approvare decisioni
  canApproveDecisions(): boolean {
    return this.hasPermission('APPROVE_DECISIONS');
  }

  // Verifica se l'utente può moderare contenuti
  canModerateContent(): boolean {
    return this.hasPermission('MODERATE_COMMENTS');
  }

  // Verifica se l'utente può gestire sessioni
  canManageSessions(): boolean {
    return this.hasPermission('MANAGE_SESSIONS');
  }

  // Verifica se l'utente può invitare nuovi membri
  canInviteMembers(): boolean {
    return this.hasPermission('INVITE_MEMBERS');
  }

  // Ottiene le funzionalità disponibili per l'utente corrente
  getAvailableCapabilities(): string[] {
    if (!this.currentUser) return [];

    const roleConfig = this.getRoleConfig(this.currentUser.role);
    return roleConfig ? roleConfig.capabilities : [];
  }

  // Ottiene le funzionalità per un ruolo specifico
  getCapabilitiesForRole(role: TeamRole): string[] {
    const roleConfig = this.getRoleConfig(role);
    return roleConfig ? roleConfig.capabilities : [];
  }

  // Verifica se l'utente può eseguire un'azione specifica
  canPerformAction(action: string): boolean {
    const actionPermissions: { [key: string]: Permission[] } = {
      create_session: ['CREATE_SESSIONS'],
      join_session: ['JOIN_SESSIONS'],
      manage_session: ['MANAGE_SESSIONS'],
      delete_session: ['DELETE_SESSIONS'],
      add_comment: ['ADD_COMMENTS'],
      edit_comment: ['EDIT_COMMENTS'],
      delete_comment: ['DELETE_COMMENTS'],
      moderate_comment: ['MODERATE_COMMENTS'],
      add_favorite: ['ADD_TO_FAVORITES'],
      remove_favorite: ['REMOVE_FROM_FAVORITES'],
      update_priority: ['UPDATE_PRIORITY'],
      update_status: ['UPDATE_STATUS'],
      invite_member: ['INVITE_MEMBERS'],
      remove_member: ['REMOVE_MEMBERS'],
      assign_role: ['ASSIGN_ROLES'],
      manage_permissions: ['MANAGE_PERMISSIONS'],
      view_analytics: ['VIEW_ANALYTICS'],
      export_reports: ['EXPORT_REPORTS'],
      view_team_performance: ['VIEW_TEAM_PERFORMANCE'],
      approve_decision: ['APPROVE_DECISIONS'],
      reject_decision: ['REJECT_DECISIONS'],
      override_decision: ['OVERRIDE_DECISIONS'],
    };

    const requiredPermissions = actionPermissions[action];
    if (!requiredPermissions) return false;

    return this.hasAllPermissions(requiredPermissions);
  }

  // Ottiene un riepilogo delle capacità dell'utente corrente
  getUserCapabilitiesSummary(): {
    role: TeamRole;
    permissions: Permission[];
    capabilities: string[];
    canManage: boolean;
    canApprove: boolean;
    canModerate: boolean;
    voteWeight: number;
  } {
    if (!this.currentUser) {
      throw new Error('Nessun utente corrente impostato');
    }

    return {
      role: this.currentUser.role,
      permissions: this.currentUser.permissions,
      capabilities: this.getAvailableCapabilities(),
      canManage: this.canManageMember('TEAM_MEMBER'),
      canApprove: this.canApproveDecisions(),
      canModerate: this.canModerateContent(),
      voteWeight: this.getVoteWeight(this.currentUser.role),
    };
  }
}

// Esporta un'istanza singleton
export const teamRoleManager = TeamRoleManager.getInstance();
