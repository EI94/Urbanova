# 🎓 URBANOVA OS 2.0 - ESEMPI PRATICI

## 📋 Come Usare Planner/Executor

### **Esempio 1: Business Plan Completo**

```typescript
import { getOS2, OS2Request } from '@/os2';

// 1. Prepara request
const request: OS2Request = {
  userMessage: "Crea business plan progetto Ciliegie: 4 case, prezzo 390k, costo 200k",
  intent: "business_plan",
  entities: {
    projectName: "Ciliegie",
    units: 4,
    salePrice: 390000,
    constructionCost: 200000,
    landScenarios: [
      { name: "Cash Upfront", cost: 220000 },
      { name: "Permuta", cost: 180000 },
    ],
  },
  userId: "user123",
  userEmail: "user@example.com",
  sessionId: "session456",
  userRoles: ["editor"],
  environment: "production",
};

// 2. Processa con OS2
const os2 = getOS2();
const response = await os2.process(request);

// 3. Verifica risultato
console.log("Plan ID:", response.metadata.planId);
console.log("Status:", response.execution.status);
console.log("Steps Executed:", response.metadata.stepsExecuted);
console.log("Steps Successful:", response.metadata.stepsSuccessful);

// 4. Ottieni risposta per utente
console.log("Response:", response.response);

/* Output esempio:
🎯 **Crea Business Plan per "Ciliegie"**

✅ Completato con successo!

📋 **Step eseguiti**: 2/2

**Dettagli step**:
✅ 1. Calcola Business Plan
✅ 2. Salva Business Plan

📊 **Risultato**:
{
  "projectName": "Ciliegie",
  "scenarios": [...],
  "bestScenario": "s1",
  ...
}

💡 **Assumptions**:
- Salvataggio automatico abilitato

⏱️ Tempo di esecuzione: 2100ms
*/
```

---

### **Esempio 2: Sensitivity Analysis**

```typescript
const request: OS2Request = {
  userMessage: "Fai sensitivity sul progetto Ciliegie: prezzo ±15%",
  intent: "sensitivity_analysis",
  entities: {
    projectId: "proj_ciliegie_123",
    variable: "price",
    range: 15,
  },
  userId: "user123",
  userEmail: "user@example.com",
  sessionId: "session456",
};

const response = await os2.process(request);

console.log("Sensitivity Results:", response.execution.finalOutput);

/* Output:
{
  "variable": "price",
  "range": 15,
  "breakeven": -12.8,
  "scenarios": [
    { "delta": -15, "npv": 124000 },
    { "delta": 0, "npv": 892000 },
    { "delta": 15, "npv": 1642000 }
  ]
}
*/
```

---

### **Esempio 3: RDO con Conferma (2-step flow)**

**Step 1: Request senza conferma**

```typescript
const requestStep1: OS2Request = {
  userMessage: "Invia RDO a 3 fornitori per progetto Villa",
  intent: "rdo_send",
  entities: {
    projectId: "proj_villa_789",
    vendors: [
      "fornit ore1@example.com",
      "fornitore2@example.com",
      "fornitore3@example.com"
    ],
  },
  userId: "user123",
  userEmail: "user@example.com",
  sessionId: "session456",
  userRoles: ["editor"], // RDO richiede editor
  userConfirmations: [], // Nessuna conferma ancora
};

const responseStep1 = await os2.process(requestStep1);

console.log("Status:", responseStep1.execution.status);
// Output: "awaiting_confirm"

console.log("Confirmables:", responseStep1.plan.confirmables);
// Output: ["rdo.send"]

console.log("Response:", responseStep1.response);
/* Output:
🎯 **Invia RDO a 3 fornitori**

⏸️ In attesa di conferma per alcuni step.

📋 **Step eseguiti**: 0/1

**Dettagli step**:
⏸️ 1. Invia RDO

⏸️ **Conferme richieste**:
- rdo.send: Invio RDO a 3 fornitori
*/
```

**Step 2: Request con conferma**

```typescript
const requestStep2: OS2Request = {
  ...requestStep1,
  userConfirmations: ["rdo.send"], // ✅ Conferma fornita
};

const responseStep2 = await os2.process(requestStep2);

console.log("Status:", responseStep2.execution.status);
// Output: "done"

console.log("Response:", responseStep2.response);
/* Output:
🎯 **Invia RDO a 3 fornitori**

✅ Completato con successo!

📋 **Step eseguiti**: 1/1

**Dettagli step**:
✅ 1. Invia RDO

📊 **Risultato**:
{
  "sentCount": 3,
  "rdoIds": ["rdo_123", "rdo_124", "rdo_125"],
  ...
}
*/
```

---

### **Esempio 4: Gestione Errori e Retry**

```typescript
// Simulazione: skill fallisce 2 volte, successo al 3°

const request: OS2Request = {
  userMessage: "Analisi con possibili errori network",
  intent: "feasibility_analysis",
  entities: {
    landArea: 1000,
    constructionCostPerSqm: 2000,
    salePrice: 5000,
  },
  userId: "user123",
  userEmail: "user@example.com",
  sessionId: "session456",
};

const response = await os2.process(request);

// Verifica attempts
response.execution.stepResults.forEach(step => {
  console.log(`Step ${step.stepIndex}: ${step.status}`);
  console.log(`  Attempts: ${step.attemptCount}`);
  console.log(`  Time: ${step.executionTimeMs}ms`);
  
  if (step.error) {
    console.log(`  Error: ${step.error.message}`);
  }
});

/* Output esempio:
Step 0: success
  Attempts: 3  // ← Fallito 2 volte, successo al 3°
  Time: 3500ms // Include backoff: 0 + 1000 + 2000 = 3000ms base
*/
```

---

### **Esempio 5: RBAC Enforcement**

```typescript
// Viewer prova a inviare RDO (richiede editor)

const request: OS2Request = {
  userMessage: "Invia RDO",
  intent: "rdo_send",
  entities: {
    projectId: "proj123",
    vendors: ["vendor@test.com"],
  },
  userId: "user_viewer",
  userEmail: "viewer@example.com",
  sessionId: "session789",
  userRoles: ["viewer"], // ⚠️ Solo viewer
};

const response = await os2.process(request);

console.log("Status:", response.execution.status);
// Output: "error"

console.log("Error:", response.execution.stepResults[0].error);
/* Output:
{
  message: "Permessi insufficienti per rdo.send. Richiede: editor o admin",
  code: "PERMISSION_DENIED",
  retryable: false
}
*/
```

---

### **Esempio 6: Custom ExecutorOptions**

```typescript
import { PlanExecutor } from '@/os2/executor/PlanExecutor';
import { createActionPlan, createExecutionContext } from '@/os2';

const plan = createActionPlan("Custom Execution", [
  { skillId: "business_plan.calculate", inputs: {...} },
  { skillId: "business_plan.sensitivity", inputs: {...} },
  { skillId: "business_plan.export", inputs: {...} },
]);

const context = createExecutionContext("user123", "session456", {
  userRoles: ["editor"],
});

const executor = new PlanExecutor();

// Esegui con opzioni custom
const result = await executor.execute(plan, context, {
  // Retry config custom
  retry: {
    maxAttempts: 5,
    backoffMs: [500, 1000, 2000, 4000, 8000],
    useJitter: true,
  },
  
  // Timeout globale 20s
  globalTimeoutMs: 20000,
  
  // Continua anche se uno step fallisce
  continueOnError: true,
  
  // Skip step non confermati
  skipUnconfirmed: true,
  
  // Callback per progress UI
  onProgress: (stepIndex, result) => {
    console.log(`Progress: Step ${stepIndex + 1} → ${result.status}`);
    
    // Aggiorna UI progress bar
    updateProgressBar((stepIndex + 1) / plan.steps.length * 100);
  },
});

console.log("Execution completata:", result.status);
```

---

### **Esempio 7: Aggiungere Skill Custom**

```typescript
import { SkillCatalog, Skill, SkillMeta, SkillExecutionContext } from '@/os2';

// 1. Definisci la tua skill
class CustomMarketAnalysisSkill implements Skill<MarketInput, MarketOutput> {
  public meta: SkillMeta = {
    id: "market.custom_analysis",
    summary: "Analisi mercato custom con AI",
    visibility: "global",
    inputsSchema: {
      type: "object",
      required: ["location", "propertyType"],
      properties: {
        location: { type: "string" },
        propertyType: { type: "string" },
      },
    },
    latencyBudgetMs: 8000,
    idempotent: true,
    requiresConfirm: false,
    sideEffects: [],
    telemetryKey: "market.custom",
    rbac: ["viewer", "editor", "admin"],
    category: "market",
    tags: ["market", "ai", "custom"],
  };
  
  public async execute(
    inputs: MarketInput,
    context: SkillExecutionContext
  ): Promise<MarketOutput> {
    console.log(`🎯 Custom Market Analysis per ${inputs.location}`);
    
    // La tua logica custom
    const aiAnalysis = await callOpenAIForMarketAnalysis(inputs);
    
    return {
      location: inputs.location,
      avgPrice: aiAnalysis.avgPrice,
      trend: aiAnalysis.trend,
      recommendations: aiAnalysis.recommendations,
    };
  }
}

// 2. Registra la skill
const catalog = SkillCatalog.getInstance();
catalog.register(new CustomMarketAnalysisSkill());

// 3. Ora puoi usarla nel Planner
// Il Planner deve essere esteso per gestire il nuovo intent
```

---

### **Esempio 8: Health Check**

```typescript
import { getOS2 } from '@/os2';

const os2 = getOS2();
const health = await os2.healthCheck();

console.log("OS2 Health:", health);

/* Output:
{
  status: "healthy",
  components: {
    planner: true,
    executor: true,
    skillCatalog: true
  },
  skillCount: 9
}
*/

// Usa per monitoring
if (health.status !== "healthy") {
  alert("⚠️ OS2 degraded!");
  // Fallback a OS 1.x o retry
}
```

---

### **Esempio 9: Validazione Plan Prima dell'Esecuzione**

```typescript
import { PlanExecutor } from '@/os2/executor/PlanExecutor';
import { createActionPlan } from '@/os2';

const plan = createActionPlan("Validation Test", [
  { skillId: "skill.inesistente", inputs: {} }, // Skill non esiste
  { skillId: "business_plan.calculate", inputs: {} },
]);

const executor = new PlanExecutor();
const validation = executor.validatePlan(plan);

if (!validation.valid) {
  console.error("❌ Plan invalido:");
  validation.errors.forEach(err => console.error(`  - ${err}`));
  
  // Non eseguire plan invalido
  return;
}

// Esegui solo se valido
const context = createExecutionContext("user123", "session456");
const result = await executor.execute(plan, context);
```

---

### **Esempio 10: Integration con UI (React)**

```tsx
import { getOS2, OS2Request } from '@/os2';
import { useState } from 'react';

export function BusinessPlanChat() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<OS2Response | null>(null);
  
  const handleSubmit = async (message: string) => {
    setLoading(true);
    
    try {
      // 1. Classifica intent (da fare via API /api/chat)
      const classificationResult = await fetch('/api/classify', {
        method: 'POST',
        body: JSON.stringify({ message }),
      }).then(r => r.json());
      
      // 2. Processa con OS2
      const os2 = getOS2();
      const request: OS2Request = {
        userMessage: message,
        intent: classificationResult.intent,
        entities: classificationResult.entities,
        userId: getCurrentUserId(),
        userEmail: getCurrentUserEmail(),
        sessionId: getSessionId(),
        userRoles: getCurrentUserRoles(),
      };
      
      const result = await os2.process(request);
      
      // 3. Gestisci conferme
      if (result.execution.status === "awaiting_confirm") {
        // Mostra UI conferma
        const confirmed = await showConfirmDialog(
          result.plan.confirmables!,
          result.response
        );
        
        if (confirmed) {
          // Re-processa con conferme
          request.userConfirmations = result.plan.confirmables;
          const confirmedResult = await os2.process(request);
          setResponse(confirmedResult);
        }
      } else {
        setResponse(result);
      }
      
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <input onSubmit={handleSubmit} />
      
      {loading && <div>🔄 Processing...</div>}
      
      {response && (
        <div>
          <h3>Plan: {response.metadata.planId}</h3>
          <p>Status: {response.execution.status}</p>
          <p>Steps: {response.metadata.stepsSuccessful}/{response.metadata.stepsExecuted}</p>
          <pre>{response.response}</pre>
          
          {/* Mostra step execution details */}
          {response.execution.stepResults.map((step, idx) => (
            <div key={idx}>
              {step.status === "success" ? "✅" : 
               step.status === "failed" ? "❌" : "⏸️"}
              {" "}
              Step {idx + 1}: {step.skillId}
              {" "}
              ({step.executionTimeMs}ms, {step.attemptCount} attempts)
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### **Esempio 11: Monitoring & Telemetry**

```typescript
import { getOS2 } from '@/os2';

// Setup monitoring
const os2 = getOS2();

// Process request con telemetry
const request: OS2Request = { /* ... */ };
const startTime = Date.now();

try {
  const response = await os2.process(request);
  
  // Log success metrics
  logMetric("os2.execution.success", {
    planId: response.metadata.planId,
    intent: request.intent,
    executionTimeMs: response.metadata.executionTimeMs,
    stepsExecuted: response.metadata.stepsExecuted,
    stepsSuccessful: response.metadata.stepsSuccessful,
  });
  
  // Per ogni step, log telemetry
  response.execution.stepResults.forEach(step => {
    const skill = SkillCatalog.getInstance().get(step.skillId);
    
    if (skill) {
      logMetric(skill.meta.telemetryKey, {
        status: step.status,
        executionTimeMs: step.executionTimeMs,
        attemptCount: step.attemptCount,
        userId: request.userId,
      });
    }
  });
  
} catch (error) {
  // Log error metrics
  logMetric("os2.execution.error", {
    intent: request.intent,
    error: error.message,
    duration: Date.now() - startTime,
  });
}
```

---

### **Esempio 12: Feature Flag Integration**

```typescript
import { OS_V2_ENABLED, isOSv2Enabled } from '@/lib/featureFlags';
import { getOS2 } from '@/os2';
import { legacyProcessRequest } from '@/lib/legacy';

async function processUserRequest(userMessage: string) {
  if (isOSv2Enabled()) {
    // 🚀 Usa OS 2.0 Planner/Executor
    console.log("Using OS 2.0");
    
    const os2 = getOS2();
    const response = await os2.process({
      userMessage,
      intent: "auto_detect", // Auto-detect da classificazione
      entities: {},
      userId: getCurrentUserId(),
      userEmail: getCurrentUserEmail(),
      sessionId: getSessionId(),
    });
    
    return response.response;
    
  } else {
    // 📟 Usa OS 1.x Legacy
    console.log("Using OS 1.x");
    
    const response = await legacyProcessRequest(userMessage);
    return response;
  }
}
```

---

### **Esempio 13: Plan Validation UI**

```tsx
import { PlanExecutor } from '@/os2/executor/PlanExecutor';
import { ActionPlan } from '@/os2';

export function PlanPreview({ plan }: { plan: ActionPlan }) {
  const executor = new PlanExecutor();
  const validation = executor.validatePlan(plan);
  
  return (
    <div className="plan-preview">
      <h3>📋 Plan: {plan.goal}</h3>
      
      {/* Validation status */}
      {!validation.valid && (
        <div className="alert alert-error">
          ❌ Plan invalido:
          <ul>
            {validation.errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Steps */}
      <div className="steps">
        {plan.steps.map((step, idx) => (
          <div key={idx} className="step-card">
            <h4>Step {idx + 1}: {step.name || step.skillId}</h4>
            <p>{step.description}</p>
            
            <div className="badges">
              {step.idempotent && <span className="badge">Idempotent</span>}
              {step.confirm && <span className="badge badge-warning">Richiede Conferma</span>}
            </div>
          </div>
        ))}
      </div>
      
      {/* Assumptions */}
      {plan.assumptions.length > 0 && (
        <div className="assumptions">
          <h4>💡 Assumptions</h4>
          <ul>
            {plan.assumptions.map((a, idx) => (
              <li key={idx}>{a}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Risks */}
      {plan.risks && plan.risks.length > 0 && (
        <div className="risks">
          <h4>⚠️ Risks</h4>
          <ul>
            {plan.risks.map((r, idx) => (
              <li key={idx}>{r}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Metadata */}
      <div className="metadata">
        <p>Confidence: {(plan.metadata?.confidence || 0) * 100}%</p>
        <p>Durata stimata: {plan.metadata?.estimatedDurationMs}ms</p>
      </div>
    </div>
  );
}
```

---

### **Esempio 14: Progress UI Real-time**

```tsx
export function ExecutionProgress() {
  const [progress, setProgress] = useState<StepExecutionResult[]>([]);
  
  const executeWithProgress = async (plan: ActionPlan) => {
    const executor = new PlanExecutor();
    const context = createExecutionContext(...);
    
    const result = await executor.execute(plan, context, {
      onProgress: (stepIndex, stepResult) => {
        // Aggiorna UI in real-time
        setProgress(prev => [...prev, stepResult]);
      },
    });
    
    return result;
  };
  
  return (
    <div>
      {progress.map((step, idx) => (
        <div key={idx} className={`step-progress step-${step.status}`}>
          <span className="step-icon">
            {step.status === "success" && "✅"}
            {step.status === "failed" && "❌"}
            {step.status === "awaiting_confirm" && "⏸️"}
          </span>
          <span className="step-name">Step {idx + 1}</span>
          <span className="step-time">{step.executionTimeMs}ms</span>
          {step.attemptCount > 1 && (
            <span className="step-retries">
              ({step.attemptCount} attempts)
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

### **Esempio 15: A/B Testing OS 1.x vs OS 2.0**

```typescript
async function processWithABTest(userMessage: string, userId: string) {
  // Assign user to variant (50/50)
  const useOS2 = userId.charCodeAt(0) % 2 === 0;
  
  const startTime = Date.now();
  let response;
  
  if (useOS2) {
    // Variant A: OS 2.0
    const os2 = getOS2();
    const result = await os2.process({
      userMessage,
      intent: "auto",
      entities: {},
      userId,
      userEmail: `${userId}@test.com`,
      sessionId: `session_${userId}`,
    });
    
    response = result.response;
    
    logABTestMetric("os2", {
      userId,
      latency: Date.now() - startTime,
      success: result.success,
    });
    
  } else {
    // Variant B: OS 1.x
    response = await legacyProcess(userMessage);
    
    logABTestMetric("os1", {
      userId,
      latency: Date.now() - startTime,
      success: true,
    });
  }
  
  return response;
}
```

---

## 🧪 Test Manuale Checklist

### **Pre-deployment**

- [ ] Run unit tests: `npm test -- src/os2/__tests__/`
- [ ] Run integration tests: `npm test -- src/os2/__tests__/integration.test.ts`
- [ ] Build OK: `npm run build`
- [ ] Test API: `curl http://localhost:3112/api/os2/test`
- [ ] Test con flag=false (OS 1.x)
- [ ] Test con flag=true (OS 2.0)
- [ ] Verifica log corretto (ENABLED/DISABLED)
- [ ] Test ogni intent: business_plan, sensitivity, rdo_send
- [ ] Test conferme UI
- [ ] Test RBAC (viewer, editor, admin)
- [ ] Performance test (< 5s)

---

## 📞 Supporto

**File di riferimento**:
- `OS2_PLANNER_EXECUTOR_README.md` - Architettura completa
- `OS2_IMPLEMENTATION_SUMMARY.md` - Summary tecnico
- `FEATURE_FLAGS_README.md` - Feature flags
- `OS2_EXAMPLES.md` - Questo file (esempi)

**Test location**:
- Unit: `src/os2/__tests__/`
- Integration: `src/os2/__tests__/integration.test.ts`
- E2E: `e2e/os-flag.spec.ts`

**API test**:
- Health: `GET /api/os2/test`
- Execute: `POST /api/os2/test`

---

*Esempi aggiornati al 16 Gennaio 2025*  
*Versione OS2: 2.0.0*

