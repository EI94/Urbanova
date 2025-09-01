export interface ChatCommand {
  id: string;
  userId: string;
  message: string;
  timestamp: Date;
  source: 'WHATSAPP' | 'TELEGRAM' | 'WEB' | 'API';
  metadata: {
    phoneNumber?: string;
    chatId?: string;
    sessionId?: string;
    language?: string;
  };
}
export interface ChatResponse {
  id: string;
  commandId: string;
  message: string;
  type: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'QUICK_REPLY';
  actions?: ChatAction[];
  metadata: {
    processingTime: number;
    confidence: number;
    nextSteps?: string[];
  };
  timestamp: Date;
}
export interface ChatAction {
  type: 'BUTTON' | 'LINK' | 'COMMAND' | 'NAVIGATION';
  label: string;
  value: string;
  primary?: boolean;
}
export interface ApiRequest<T = unknown> {
  id: string;
  timestamp: Date;
  userId: string;
  data: T;
  metadata: {
    userAgent: string;
    ipAddress: string;
    sessionId?: string;
    requestId: string;
  };
}
export interface ApiResponse<T = unknown> {
  id: string;
  requestId: string;
  timestamp: Date;
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata: {
    processingTime: number;
    version: string;
  };
}
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  helpUrl?: string;
}
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
export interface SearchParams {
  query: string;
  filters: Record<string, unknown>;
  pagination: PaginationParams;
}
export interface SearchResponse<T> {
  results: T[];
  total: number;
  facets: Record<string, FacetValue[]>;
  suggestions: string[];
  pagination: PaginationParams;
}
export interface FacetValue {
  value: string;
  count: number;
  selected: boolean;
}
export interface FileUpload {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  metadata: {
    uploadedBy: string;
    uploadedAt: Date;
    category?: string;
    tags?: string[];
  };
}
export interface NotificationRequest {
  id: string;
  userId: string;
  type: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH';
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  scheduledFor?: Date;
  metadata: {
    template?: string;
    variables?: Record<string, unknown>;
    channel?: string;
  };
}
export interface NotificationResponse {
  id: string;
  requestId: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
  sentAt?: Date;
  deliveredAt?: Date;
  error?: string;
  metadata: {
    provider: string;
    providerId?: string;
    retryCount: number;
  };
}
export interface WebhookPayload<T = unknown> {
  id: string;
  event: string;
  timestamp: Date;
  data: T;
  signature: string;
  metadata: {
    source: string;
    version: string;
    retryCount: number;
  };
}
export interface WebhookResponse {
  id: string;
  payloadId: string;
  status: 'RECEIVED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  processedAt: Date;
  result?: Record<string, unknown>;
  error?: string;
}
export interface ExportRequest {
  id: string;
  userId: string;
  type: 'PDF' | 'EXCEL' | 'CSV' | 'JSON';
  format: ExportFormat;
  data: Record<string, unknown>;
  filters?: Record<string, unknown>;
  scheduledFor?: Date;
  metadata: {
    template?: string;
    filename?: string;
    compression?: boolean;
  };
}
export interface ExportFormat {
  orientation: 'PORTRAIT' | 'LANDSCAPE';
  pageSize: 'A4' | 'A3' | 'LETTER' | 'LEGAL';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  header?: string;
  footer?: string;
}
export interface ExportResponse {
  id: string;
  requestId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  url?: string;
  expiresAt?: Date;
  completedAt?: Date;
  error?: string;
  metadata: {
    fileSize: number;
    pageCount?: number;
    processingTime: number;
  };
}
export interface SyncRequest {
  id: string;
  userId: string;
  source: string;
  target: string;
  data: Record<string, unknown>;
  direction: 'IMPORT' | 'EXPORT' | 'BIDIRECTIONAL';
  conflictResolution: 'SOURCE_WINS' | 'TARGET_WINS' | 'MANUAL' | 'MERGE';
  metadata: {
    lastSync?: Date;
    syncInterval?: number;
    filters?: Record<string, unknown>;
  };
}
export interface SyncResponse {
  id: string;
  requestId: string;
  status: 'PENDING' | 'SYNCING' | 'COMPLETED' | 'FAILED';
  progress: number;
  syncedAt?: Date;
  conflicts?: SyncConflict[];
  error?: string;
  metadata: {
    recordsProcessed: number;
    recordsCreated: number;
    recordsUpdated: number;
    recordsDeleted: number;
  };
}
export interface SyncConflict {
  field: string;
  sourceValue: unknown;
  targetValue: unknown;
  resolution: 'RESOLVED' | 'PENDING' | 'IGNORED';
  resolvedValue?: unknown;
  resolvedBy?: string;
  resolvedAt?: Date;
}
