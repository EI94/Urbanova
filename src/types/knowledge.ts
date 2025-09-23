// Tipi per il sistema di Knowledge Management & Documentation

export type DocumentType =
  | 'article'
  | 'tutorial'
  | 'faq'
  | 'guide'
  | 'specification'
  | 'template'
  | 'checklist'
  | 'procedure';

export type DocumentStatus =
  | 'draft'
  | 'review'
  | 'approved'
  | 'published'
  | 'archived'
  | 'deprecated';

export type DocumentFormat = 'markdown' | 'html' | 'pdf' | 'docx' | 'txt' | 'json';

export type AccessLevel = 'public' | 'internal' | 'restricted' | 'confidential';

export type ContentLanguage = 'it' | 'en' | 'es' | 'fr' | 'de';

export type SearchScope = 'all' | 'documents' | 'templates' | 'procedures' | 'faqs' | 'archived';

export type SortOrder =
  | 'relevance'
  | 'date_created'
  | 'date_updated'
  | 'title'
  | 'author'
  | 'popularity';

export interface DocumentMetadata {
  id: string;
  title: string;
  description: string;
  type: DocumentType;
  status: DocumentStatus;
  format: DocumentFormat;

  // Contenuto
  content: string;
  summary: string;
  keywords: string[];
  tags: string[];

  // Accesso e sicurezza
  accessLevel: AccessLevel;
  allowedRoles: string[];
  allowedUsers: string[];

  // Localizzazione
  language: ContentLanguage;
  translations: Record<ContentLanguage, string>; // ID delle traduzioni

  // Organizzazione
  categoryId: string;
  categoryPath: string[];
  parentId?: string;
  childrenIds: string[];
  relatedDocuments: string[];

  // Versioning
  version: string;
  versionHistory: DocumentVersion[];
  isLatestVersion: boolean;

  // Autore e collaboratori
  authorId: string;
  authorName: string;
  collaborators: Array<{
    userId: string;
    userName: string;
    role: 'editor' | 'reviewer' | 'contributor';
    permissions: DocumentPermission[];
  }>;

  // Workflow
  reviewers: Array<{
    userId: string;
    userName: string;
    status: 'pending' | 'approved' | 'rejected';
    feedback?: string;
    reviewDate?: Date;
  }>;

  // Metriche
  viewCount: number;
  downloadCount: number;
  shareCount: number;
  likeCount: number;
  commentCount: number;

  // Timeline
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  archivedAt?: Date;
  lastAccessedAt: Date;

  // SEO e ricerca
  slug: string;
  searchableContent: string;
  searchKeywords: string[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: string;
  content: string;
  summary: string;
  changeLog: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  isActive: boolean;
}

export interface DocumentCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
  parentId?: string;
  childrenIds: string[];
  path: string[];

  // Configurazione
  allowedTypes: DocumentType[];
  defaultAccessLevel: AccessLevel;
  requiredTags: string[];

  // Icona e colori
  icon: string;
  color: string;

  // Metriche
  documentCount: number;

  // Timeline
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  type: DocumentType;

  // Template content
  content: string;
  placeholders: Array<{
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'date' | 'number';
    required: boolean;
    defaultValue?: string;
    options?: string[]; // per select
  }>;

  // Configurazione
  categoryId: string;
  accessLevel: AccessLevel;
  language: ContentLanguage;

  // Utilizzo
  usageCount: number;

  // Timeline
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;

  // Configurazione
  isPublic: boolean;
  allowedRoles: string[];
  defaultLanguage: ContentLanguage;
  supportedLanguages: ContentLanguage[];

  // Struttura
  categories: DocumentCategory[];
  documents: DocumentMetadata[];
  templates: DocumentTemplate[];

  // Impostazioni ricerca
  searchSettings: {
    enableFullTextSearch: boolean;
    enableAutoComplete: boolean;
    enableSuggestions: boolean;
    enableFacetedSearch: boolean;
  };

  // Workflow
  requiresReview: boolean;
  autoPublish: boolean;
  versioningEnabled: boolean;

  // Timeline
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface SearchQuery {
  query: string;
  scope: SearchScope;
  filters: {
    types?: DocumentType[];
    categories?: string[];
    authors?: string[];
    tags?: string[];
    status?: DocumentStatus[];
    accessLevel?: AccessLevel[];
    language?: ContentLanguage;
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
  sortBy: SortOrder;
  sortDirection: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export interface SearchResult {
  document: DocumentMetadata;
  score: number;
  highlights: Array<{
    field: string;
    text: string;
    matchedText: string;
  }>;
  snippet: string;
}

export interface SearchResponse {
  query: SearchQuery;
  results: SearchResult[];
  totalCount: number;
  totalPages: number;
  facets: {
    types: Array<{ value: DocumentType; count: number }>;
    categories: Array<{ value: string; count: number }>;
    authors: Array<{ value: string; count: number }>;
    tags: Array<{ value: string; count: number }>;
    languages: Array<{ value: ContentLanguage; count: number }>;
  };
  suggestions: string[];
  executionTime: number;
}

export interface DocumentComment {
  id: string;
  documentId: string;
  parentId?: string; // per reply

  // Contenuto
  content: string;
  isResolved: boolean;

  // Posizione nel documento (per commenti inline)
  position?: {
    line: number;
    column: number;
    selection?: {
      start: number;
      end: number;
    };
  };

  // Autore
  authorId: string;
  authorName: string;
  authorAvatar: string;

  // Reazioni
  reactions: Array<{
    type: 'like' | 'helpful' | 'outdated' | 'unclear';
    userId: string;
    userName: string;
  }>;

  // Timeline
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface DocumentPermission {
  action: 'read' | 'write' | 'delete' | 'publish' | 'review' | 'comment' | 'share';
  granted: boolean;
}

export interface DocumentActivity {
  id: string;
  documentId: string;
  type:
    | 'created'
    | 'updated'
    | 'published'
    | 'archived'
    | 'commented'
    | 'shared'
    | 'viewed'
    | 'downloaded';

  // Dettagli
  description: string;
  metadata: Record<string, any>;

  // Utente
  userId: string;
  userName: string;
  userAvatar: string;

  // Timeline
  timestamp: Date;

  // IP e location (per sicurezza)
  ipAddress?: string;
  location?: string;
  userAgent?: string;
}

export interface DocumentAnalytics {
  documentId: string;

  // Metriche di visualizzazione
  viewMetrics: {
    totalViews: number;
    uniqueViews: number;
    averageTimeOnPage: number; // in secondi
    bounceRate: number; // percentuale

    // Breakdown temporale
    viewsByDay: Array<{
      date: Date;
      views: number;
      uniqueViews: number;
    }>;

    // Breakdown per utente
    topViewers: Array<{
      userId: string;
      userName: string;
      viewCount: number;
      lastViewed: Date;
    }>;
  };

  // Metriche di engagement
  engagementMetrics: {
    commentCount: number;
    shareCount: number;
    downloadCount: number;
    likeCount: number;

    // Tasso di engagement
    engagementRate: number; // percentuale

    // Commenti nel tempo
    commentsByDay: Array<{
      date: Date;
      count: number;
    }>;
  };

  // Metriche di ricerca
  searchMetrics: {
    searchImpressions: number; // quante volte appare nei risultati
    searchClicks: number; // quante volte viene cliccato dai risultati
    clickThroughRate: number; // percentuale
    averagePosition: number; // posizione media nei risultati

    // Query che portano al documento
    topSearchQueries: Array<{
      query: string;
      impressions: number;
      clicks: number;
      position: number;
    }>;
  };

  // Metriche di qualità
  qualityMetrics: {
    freshnessScore: number; // 0-100 basato su quanto è aggiornato
    completenessScore: number; // 0-100 basato su completezza contenuto
    accuracyScore: number; // 0-100 basato su feedback utenti
    usefulnessScore: number; // 0-100 basato su reactions positive

    // Feedback degli utenti
    userFeedback: Array<{
      type: 'helpful' | 'outdated' | 'unclear' | 'incorrect';
      count: number;
      percentage: number;
    }>;
  };

  // Timeline
  periodStart: Date;
  periodEnd: Date;
  lastUpdated: Date;
}

export interface KnowledgeBaseStats {
  // Statistiche generali
  totalDocuments: number;
  totalCategories: number;
  totalAuthors: number;
  totalViews: number;
  totalDownloads: number;

  // Breakdown per tipo
  documentsByType: Array<{
    type: DocumentType;
    count: number;
    percentage: number;
  }>;

  // Breakdown per stato
  documentsByStatus: Array<{
    status: DocumentStatus;
    count: number;
    percentage: number;
  }>;

  // Breakdown per lingua
  documentsByLanguage: Array<{
    language: ContentLanguage;
    count: number;
    percentage: number;
  }>;

  // Documenti più popolari
  topDocuments: Array<{
    documentId: string;
    title: string;
    views: number;
    engagement: number;
  }>;

  // Autori più attivi
  topAuthors: Array<{
    authorId: string;
    authorName: string;
    documentCount: number;
    totalViews: number;
  }>;

  // Categorie più utilizzate
  topCategories: Array<{
    categoryId: string;
    categoryName: string;
    documentCount: number;
    totalViews: number;
  }>;

  // Trend temporali
  activityTrend: Array<{
    date: Date;
    documentsCreated: number;
    documentsUpdated: number;
    totalViews: number;
    totalEngagement: number;
  }>;

  // Metriche di qualità
  qualityMetrics: {
    averageFreshnessScore: number;
    averageCompletenessScore: number;
    averageAccuracyScore: number;
    averageUsefulnessScore: number;

    // Distribuzione qualità
    qualityDistribution: {
      excellent: number; // 90-100
      good: number; // 70-89
      average: number; // 50-69
      poor: number; // 0-49
    };
  };

  // Timeline
  generatedAt: Date;
  periodStart: Date;
  periodEnd: Date;
}

export interface DocumentExport {
  id: string;
  documentIds: string[];
  format: DocumentFormat;

  // Configurazione export
  options: {
    includeMetadata: boolean;
    includeComments: boolean;
    includeVersionHistory: boolean;
    includeAnalytics: boolean;

    // Per PDF
    includeToc?: boolean;
    includePageNumbers?: boolean;
    includeWatermark?: boolean;

    // Per archivi
    compression?: boolean;
    password?: string;
  };

  // Stato export
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  errorMessage?: string;

  // File generato
  fileSize?: number;
  downloadUrl?: string;
  expiresAt?: Date;

  // Timeline
  requestedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  requestedBy: string;
}

export interface DocumentImport {
  id: string;
  sourceType: 'file' | 'url' | 'confluence' | 'notion' | 'sharepoint' | 'google_docs';

  // Configurazione import
  source: {
    files?: Array<{
      name: string;
      size: number;
      type: string;
      lastModified: number;
    }>;
    urls?: string[];
    credentials?: Record<string, string>;
  };

  options: {
    categoryId: string;
    defaultStatus: DocumentStatus;
    defaultAccessLevel: AccessLevel;
    preserveStructure: boolean;
    autoDetectLanguage: boolean;
    convertFormat: boolean;
    targetFormat?: DocumentFormat;
  };

  // Risultati import
  results: Array<{
    sourceFile: string;
    documentId?: string;
    status: 'success' | 'failed' | 'skipped';
    errorMessage?: string;
  }>;

  // Stato import
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100

  // Statistiche
  totalFiles: number;
  processedFiles: number;
  successfulImports: number;
  failedImports: number;
  skippedFiles: number;

  // Timeline
  requestedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  requestedBy: string;
}

export interface KnowledgeBaseBackup {
  id: string;
  name: string;
  description: string;

  // Configurazione backup
  includeDocuments: boolean;
  includeCategories: boolean;
  includeTemplates: boolean;
  includeComments: boolean;
  includeAnalytics: boolean;
  includeUsers: boolean;

  // Filtri
  documentFilters?: {
    categories?: string[];
    types?: DocumentType[];
    dateRange?: {
      start: Date;
      end: Date;
    };
  };

  // Stato backup
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100

  // File generato
  fileSize?: number;
  downloadUrl?: string;
  expiresAt?: Date;

  // Statistiche
  totalDocuments: number;
  totalCategories: number;
  totalTemplates: number;
  totalComments: number;

  // Timeline
  createdAt: Date;
  completedAt?: Date;
  createdBy: string;
}

export interface DocumentNotification {
  id: string;
  type:
    | 'document_created'
    | 'document_updated'
    | 'document_published'
    | 'comment_added'
    | 'review_requested'
    | 'review_completed';

  // Contenuto notifica
  title: string;
  message: string;
  documentId: string;
  documentTitle: string;

  // Destinatario
  recipientId: string;
  recipientName: string;

  // Mittente
  senderId?: string;
  senderName?: string;

  // Stato
  isRead: boolean;
  isDelivered: boolean;

  // Azioni
  actions?: Array<{
    label: string;
    action: string;
    url?: string;
  }>;

  // Timeline
  createdAt: Date;
  readAt?: Date;
  deliveredAt?: Date;
}

export interface KnowledgeBaseIntegration {
  id: string;
  name: string;
  type: 'slack' | 'teams' | 'discord' | 'email' | 'webhook' | 'zapier';

  // Configurazione
  config: {
    endpoint?: string;
    apiKey?: string;
    channels?: string[];
    templates?: Record<string, string>;
    filters?: {
      documentTypes?: DocumentType[];
      categories?: string[];
      events?: string[];
    };
  };

  // Stato
  isActive: boolean;
  lastSync?: Date;
  syncCount: number;
  errorCount: number;
  lastError?: string;

  // Timeline
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
