// 💬 SYSTEM PROMPT - Prompt operativo per OS 2.0
// Conciso, orientato all'azione, memory-aware

/**
 * System prompt principale per OS 2.0
 */
export const OS2_SYSTEM_PROMPT = `Sei l'assistente operativo di Urbanova. Obiettivo: far avanzare il progetto con numeri difendibili e azioni concrete.

1) Capisci il goal; se mancano dati chiedi solo l'essenziale.
2) Proponi un Action Plan (max 5 step) con assunzioni chiare.
3) Modalità default Ask-to-Act: mostra anteprima e chiedi conferma prima di azioni con effetti.
4) Usa skill del catalogo; non inventare dati.
5) Tono: conciso, professionale, orientato alle prossime mosse.
6) Memoria: ricordati progetto attivo, tasso e margine target; proponi di salvarli.
7) Sicurezza: niente email/ordini/pagamenti senza conferma.
8) Output: breve riepilogo + max 3 bottoni azione.
9) Se ambigua, offri 2 interpretazioni e chiedi scelta.
10) A ogni esecuzione, fornisci anche brevi 'status lines' (max 6 parole) per i passaggi chiave. Esempi:
   - 'Costruisco analisi di fattibilità…'
   - 'Cerco comparabili di mercato…'
   - 'Calcolo VAN/TIR…'
   - 'Genero PDF…'
   - 'Invio RDO a 3 fornitori…'
   - 'Registro SAL #3…'
   Usa verbi all'infinito + oggetto. Evita dettagli lunghi.
11) Rispondi sempre in italiano.
12) Se l'utente è viewer, non proporre azioni che richiedono editor/admin.`;

/**
 * Status lines per skill (micro-stati durante esecuzione)
 */
export const SKILL_STATUS_LINES: Record<string, string> = {
  // Business Plan
  'business_plan.run': 'Calcolo VAN/TIR…',
  'sensitivity.run': 'Eseguo sensitivity analysis…',
  'term_sheet.create': 'Genero term sheet PDF…',
  
  // Communication
  'rdo.create': 'Invio RDO ai fornitori…',
  'email.send': 'Invio email…',
  
  // Project Management
  'sal.record': 'Registro stato avanzamento…',
  'sales.proposal': 'Preparo proposta commerciale…',
  
  // Analysis
  'feasibility.analyze': 'Costruisco analisi di fattibilità…',
  'market.research': 'Cerco comparabili di mercato…',
  
  // Query
  'project.query': 'Cerco nei progetti…',
  'project.list': 'Recupero lista progetti…',
  
  // Generic
  'default': 'Elaboro richiesta…',
};

/**
 * Get status line per skill
 */
export function getSkillStatusLine(skillId: string): string {
  return SKILL_STATUS_LINES[skillId] || SKILL_STATUS_LINES['default'];
}

/**
 * Status lines per fase generica
 */
export const GENERIC_STATUS_LINES = {
  idle: 'In attesa…',
  thinking: 'Sto pensando…',
  planning: 'Creo piano d\'azione…',
  executing: 'Eseguo…',
  done: 'Completato',
  failed: 'Errore',
  awaiting_confirm: 'In attesa di conferma…',
};

/**
 * Prompt per chiarimenti (confidence media)
 */
export const CLARIFICATION_PROMPT_TEMPLATE = `Non sono sicuro di aver capito tutto. 

{question}

{missingFields}

Puoi fornire questi dettagli?`;

/**
 * Prompt per disambiguazione (confidence bassa)
 */
export const DISAMBIGUATION_PROMPT_TEMPLATE = `Non sono sicuro di aver capito. Intendi:

{interpretations}

Scegli l'opzione che preferisci!`;

/**
 * Prompt per conferma azione (Ask-to-Act)
 */
export const CONFIRMATION_PROMPT_TEMPLATE = `Sto per {actionDescription}.

**Dettagli:**
{details}

{sideEffects}

Vuoi procedere?`;

/**
 * Prompt per RBAC denial
 */
export const RBAC_DENIAL_TEMPLATE = `Non hai i permessi necessari per questa azione.

**Azione richiesta:** {action}
**Ruolo richiesto:** {requiredRole}
**Il tuo ruolo:** {yourRole}

Contatta un amministratore se pensi sia un errore.`;

/**
 * Get system prompt completo con contesto
 */
export function getSystemPromptWithContext(context: {
  userRole?: string;
  projectName?: string;
  projectDefaults?: {
    discountRate?: number;
    marginTarget?: number;
  };
}): string {
  let prompt = OS2_SYSTEM_PROMPT;
  
  // Add role context
  if (context.userRole) {
    prompt += `\n\n**Ruolo utente**: ${context.userRole}`;
    
    if (context.userRole === 'viewer') {
      prompt += ' (solo lettura - non può inviare email, RDO, registrare SAL)';
    }
  }
  
  // Add project context
  if (context.projectName) {
    prompt += `\n\n**Progetto attivo**: ${context.projectName}`;
    
    if (context.projectDefaults) {
      prompt += `\n**Parametri salvati**:`;
      if (context.projectDefaults.discountRate) {
        prompt += `\n  - Tasso sconto: ${(context.projectDefaults.discountRate * 100).toFixed(1)}%`;
      }
      if (context.projectDefaults.marginTarget) {
        prompt += `\n  - Margine target: ${(context.projectDefaults.marginTarget * 100).toFixed(1)}%`;
      }
      prompt += `\nUsa questi valori se non specificato diversamente.`;
    }
  }
  
  return prompt;
}

