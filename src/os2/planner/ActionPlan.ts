// 🎯 ACTION PLAN - Types e Interfaces per Planner/Executor
// Sistema di pianificazione ed esecuzione per Urbanova OS 2.0

/**
 * Status di un messaggio/action nel sistema OS
 */
export type OsMessageStatus = 'draft' | 'awaiting_confirm' | 'running' | 'done' | 'error';

/**
 * Step singolo di un ActionPlan
 */
export interface OsActionStep {
  /** ID della skill da eseguire */
  skillId: string;
  
  /** Input per la skill (tipizzato ma flessibile) */
  inputs: unknown;
  
  /** Se true, richiede conferma utente prima dell'esecuzione */
  confirm?: boolean;
  
  /** Se true, lo step è idempotente (può essere rieseguito senza effetti collaterali) */
  idempotent?: boolean;
  
  /** Nome leggibile dello step (per UI) */
  name?: string;
  
  /** Descrizione dello step (per UI) */
  description?: string;
}

/**
 * Piano di azione completo generato dal Planner
 */
export interface ActionPlan {
  /** ID univoco del plan */
  id: string;
  
  /** Goal/obiettivo che il plan intende raggiungere */
  goal: string;
  
  /** Assumptions fatte dal planner */
  assumptions: string[];
  
  /** Steps da eseguire in sequenza */
  steps: OsActionStep[];
  
  /** Rischi potenziali identificati */
  risks?: string[];
  
  /** Lista di skillId che richiedono conferma */
  confirmables?: string[];
  
  /** Timestamp creazione */
  createdAt: Date;
  
  /** Metadata aggiuntivo */
  metadata?: {
    intent?: string;
    entities?: Record<string, unknown>;
    confidence?: number;
    estimatedDurationMs?: number;
  };
}

/**
 * Risultato dell'esecuzione di uno step
 */
export interface StepExecutionResult {
  /** ID dello step (index nel plan) */
  stepIndex: number;
  
  /** ID della skill eseguita */
  skillId: string;
  
  /** Status esecuzione */
  status: 'success' | 'failed' | 'skipped' | 'awaiting_confirm';
  
  /** Output della skill */
  output?: unknown;
  
  /** Errore se fallito */
  error?: {
    message: string;
    code?: string;
    retryable?: boolean;
  };
  
  /** Numero tentativi effettuati */
  attemptCount: number;
  
  /** Tempo di esecuzione in ms */
  executionTimeMs: number;
  
  /** Timestamp */
  timestamp: Date;
}

/**
 * Risultato dell'esecuzione di un intero ActionPlan
 */
export interface PlanExecutionResult {
  /** ID del plan eseguito */
  planId: string;
  
  /** Status complessivo */
  status: OsMessageStatus;
  
  /** Risultati di ogni step */
  stepResults: StepExecutionResult[];
  
  /** Output finale aggregato */
  finalOutput?: unknown;
  
  /** Tempo totale di esecuzione in ms */
  totalExecutionTimeMs: number;
  
  /** Step completati con successo */
  successfulSteps: number;
  
  /** Step falliti */
  failedSteps: number;
  
  /** Step skippati (per OS mode o timeout) */
  skippedSteps?: number;
  
  /** Step in attesa di conferma */
  awaitingConfirmSteps: number;
  
  /** Timestamp inizio */
  startedAt: Date;
  
  /** Timestamp fine */
  completedAt?: Date;
  
  /** Metadata execution (osMode, etc) */
  metadata?: {
    osMode?: OsMode;
    [key: string]: unknown;
  };
  
  /** Errore complessivo se fallito */
  error?: {
    message: string;
    failedStepIndex?: number;
  };
}

/**
 * Context di esecuzione per il plan
 */
export interface ExecutionContext {
  /** User ID */
  userId: string;
  
  /** Session ID */
  sessionId: string;
  
  /** Project ID corrente (se applicabile) */
  projectId?: string;
  
  /** User permissions/roles */
  userRoles?: Array<'viewer' | 'editor' | 'admin'>;
  
  /** Environment */
  environment: 'development' | 'staging' | 'production';
  
  /** Conferme utente ricevute */
  userConfirmations?: Set<string>;
  
  /** Metadata aggiuntivo */
  metadata?: Record<string, unknown>;
}

/**
 * Configurazione retry per execution
 */
export interface RetryConfig {
  /** Numero massimo tentativi */
  maxAttempts: number;
  
  /** Backoff in ms per ogni tentativo [1s, 2s, 4s] */
  backoffMs: number[];
  
  /** Se true, applica jitter al backoff */
  useJitter?: boolean;
}

/**
 * Opzioni per l'executor
 */
export interface ExecutorOptions {
  /** Configurazione retry */
  retry?: RetryConfig;
  
  /** Timeout globale per l'intero plan in ms */
  globalTimeoutMs?: number;
  
  /** Se true, continua esecuzione anche se uno step fallisce */
  continueOnError?: boolean;
  
  /** Se true, salta step che richiedono conferma non ricevuta */
  skipUnconfirmed?: boolean;
  
  /** Callback per progress updates */
  onProgress?: (stepIndex: number, result: StepExecutionResult) => void;
}

/**
 * Input per il Planner
 */
export interface PlannerInput {
  /** Intent riconosciuto */
  intent: string;
  
  /** Entità estratte */
  entities: Record<string, unknown>;
  
  /** Messaggio utente originale */
  userMessage: string;
  
  /** Context conversazione */
  conversationContext?: {
    previousActions?: string[];
    currentProject?: unknown;
    userPreferences?: Record<string, unknown>;
  };
  
  /** User context */
  userContext: ExecutionContext;
}

/**
 * Helper per creare un ActionPlan
 */
export function createActionPlan(
  goal: string,
  steps: OsActionStep[],
  options?: {
    assumptions?: string[];
    risks?: string[];
    metadata?: ActionPlan['metadata'];
  }
): ActionPlan {
  const confirmables = steps
    .filter(step => step.confirm)
    .map(step => step.skillId);

  return {
    id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    goal,
    assumptions: options?.assumptions || [],
    steps,
    risks: options?.risks,
    confirmables: confirmables.length > 0 ? confirmables : undefined,
    createdAt: new Date(),
    metadata: options?.metadata,
  };
}

/**
 * Helper per creare ExecutionContext
 */
export function createExecutionContext(
  userId: string,
  sessionId: string,
  options?: {
    projectId?: string;
    userRoles?: ExecutionContext['userRoles'];
    environment?: ExecutionContext['environment'];
  }
): ExecutionContext {
  return {
    userId,
    sessionId,
    projectId: options?.projectId,
    userRoles: options?.userRoles || ['viewer'],
    environment: options?.environment || 'production',
    userConfirmations: new Set(),
    metadata: {},
  };
}

/**
 * Default retry config
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  backoffMs: [1000, 2000, 4000], // 1s, 2s, 4s
  useJitter: true,
};

