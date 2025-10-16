// 🚩 FEATURE FLAGS - Sistema di feature flags per rollout graduale
// Permette di attivare/disattivare funzionalità senza deploy

/**
 * OS_V2_ENABLED - Attiva Urbanova OS 2.0
 * 
 * @default false (OS 1.x)
 * @production false inizialmente, true dopo testing
 * 
 * Quando true:
 * - Usa UrbanovaOSOrchestrator (orchestrator.ts)
 * - Classification Engine avanzato
 * - Vector Store RAG
 * - Workflow Engine
 * - Plugin System
 * - Conversational Engine avanzato
 * 
 * Quando false:
 * - Usa Sofia Orchestrator (legacy)
 * - Intent Service classico
 * - Response system tradizionale
 */
export const OS_V2_ENABLED = 
  process.env.NEXT_PUBLIC_OS_V2_ENABLED === 'true' ||
  process.env.OS_V2_ENABLED === 'true';

/**
 * Verifica se OS 2.0 è abilitato
 * Funzione helper per controlli espliciti
 */
export function isOSv2Enabled(): boolean {
  return OS_V2_ENABLED;
}

/**
 * BUSINESS_PLAN_V2_ENABLED - Attiva Business Plan avanzato con scenari multipli
 * @default true (feature stabile)
 */
export const BUSINESS_PLAN_V2_ENABLED = 
  process.env.NEXT_PUBLIC_BUSINESS_PLAN_V2_ENABLED !== 'false';

/**
 * MARKET_INTELLIGENCE_ENABLED - Attiva Market Intelligence
 * @default true (feature stabile)
 */
export const MARKET_INTELLIGENCE_ENABLED = 
  process.env.NEXT_PUBLIC_MARKET_INTELLIGENCE_ENABLED !== 'false';

/**
 * DEBUG_MODE - Attiva logging dettagliato
 * @default false
 */
export const DEBUG_MODE = 
  process.env.NEXT_PUBLIC_DEBUG_MODE === 'true' ||
  process.env.NODE_ENV === 'development';

/**
 * Feature Flags Object - Export singolo per import facile
 */
export const featureFlags = {
  OS_V2_ENABLED,
  BUSINESS_PLAN_V2_ENABLED,
  MARKET_INTELLIGENCE_ENABLED,
  DEBUG_MODE,
} as const;

/**
 * Type-safe feature flag keys
 */
export type FeatureFlagKey = keyof typeof featureFlags;

/**
 * Log feature flags status (solo in development)
 */
if (typeof window !== 'undefined' && DEBUG_MODE) {
  console.log('🚩 [Feature Flags] Status:', featureFlags);
}

