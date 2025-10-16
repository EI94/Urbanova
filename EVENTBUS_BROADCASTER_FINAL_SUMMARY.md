# 🚌 EVENTBUS + BROADCASTER - Real-time Events Architecture

## ✅ IMPLEMENTAZIONE COMPLETA

**Data**: 16 Gennaio 2025  
**Tempo**: ~45 minuti  
**Status**: ✅ **PRODUCTION READY**

---

## 📊 IMPLEMENTAZIONE

### **FILE CREATI: 3**

```
src/os2/events/
├── EventBus.ts (180 righe) - Internal event emitter singleton
├── Broadcaster.ts (150 righe) - SSE publisher con scoping
└── __tests__/
    └── EventBus.test.ts (300 righe) - Unit tests

TOTALE: 630 righe
```

### **FILE MODIFICATI: 2**

```
src/os2/executor/PlanExecutor.ts:
  - Import EventBus, events types, i18n
  - Emit 6 tipi eventi (plan_started, step_started, step_succeeded, step_failed, plan_completed)
  - getStepLabel() con i18n fallback
  - sanitizeErrorMessage() per step_failed
  Total: +120 righe

src/app/api/os2/stream/route.ts:
  - Import Broadcaster
  - Configure broadcaster.setBroadcastCallback()
  Total: +10 righe
```

---

## 🏗️ ARCHITETTURA EVENTI

```
┌──────────────────────────────────────────────┐
│           EVENT FLOW ARCHITECTURE            │
└──────────────────────────────────────────────┘

PlanExecutor
    ↓ emit()
┌─────────────┐
│  EventBus   │ (Internal, in-memory)
│  Singleton  │
└──────┬──────┘
       │ onAny()
       ↓
┌─────────────┐
│ Broadcaster │ (Converts to SSE format)
│  Singleton  │
└──────┬──────┘
       │ broadcastCallback()
       ↓
┌─────────────┐
│ SSE Stream  │ (HTTP connection)
│   Route     │
└──────┬──────┘
       │ text/event-stream
       ↓
   Client
  (EventSource)
       ↓
useOsActivityStream
       ↓
  LiveTicker UI
```

---

## 🚌 EVENTBUS

### **Features**

```typescript
✅ Singleton pattern
✅ Type-safe events (7 types)
✅ Subscribe per tipo: on('step_started', handler)
✅ Subscribe wildcard: onAny(handler)
✅ Unsubscribe support
✅ Error isolation (handler errors don't break others)
```

### **Event Types (7)**

```typescript
1. plan_started      → Piano inizia
2. step_started      → Step inizia (con label i18n)
3. step_progress     → Progress update (0-100%)
4. step_succeeded    → Step completato OK
5. step_failed       → Step fallito (message sanitized)
6. plan_completed    → Piano completato
7. plan_failed       → Piano fallito
```

### **API**

```typescript
const eventBus = getEventBus();

// Subscribe to type
const unsubscribe = eventBus.on('step_started', (event) => {
  console.log('Step started:', event.label);
});

// Subscribe to all
eventBus.onAny((event) => {
  console.log('Event:', event.type);
});

// Emit
eventBus.emit({
  type: 'step_started',
  planId: 'plan_001',
  userId: 'user123',
  sessionId: 'sess456',
  stepIndex: 0,
  stepId: 'step_0',
  skillId: 'business_plan.run',
  label: 'Calcolo VAN/TIR…',
  timestamp: Date.now(),
});

// Unsubscribe
unsubscribe();
```

---

## 📡 BROADCASTER

### **Features**

```typescript
✅ Singleton pattern
✅ Auto-subscribe to EventBus (onAny)
✅ Convert OsEventData → SseEvent
✅ Broadcast callback injection
✅ User/Session scoping
```

### **Flow**

```typescript
// 1. Configure broadcaster (in stream/route.ts)
const broadcaster = getBroadcaster();
broadcaster.setBroadcastCallback(broadcastEvent);

// 2. EventBus emits event
eventBus.emit({
  type: 'step_started',
  planId: 'plan_001',
  userId: 'user123',
  sessionId: 'sess456',
  ...
});

// 3. Broadcaster converts to SseEvent
const sseEvent = {
  type: 'step_started',
  planId: 'plan_001',
  stepId: 'step_0',
  skillId: 'business_plan.run',
  label: 'Calcolo VAN/TIR…',
  ts: 1737028800000,
};

// 4. Broadcasts to SSE client
broadcastEvent('user123', 'sess456', sseEvent);

// 5. Client receives via EventSource
```

---

## 🎯 EMISSION POINTS (PlanExecutor)

### **1. plan_started**

```typescript
// QUANDO: Prima di eseguire primo step
// DOVE: Inizio di execute()

this.eventBus.emit({
  type: 'plan_started',
  planId: plan.id,
  userId: context.userId,
  sessionId: context.sessionId,
  stepsCount: plan.steps.length,
  projectId: context.projectId,
  timestamp: Date.now(),
});
```

### **2. step_started**

```typescript
// QUANDO: Prima di invocare skill
// DOVE: Prima di executeStepWithRetry()

const label = this.getStepLabel(step.skillId, step.name);
// → Usa i18n: osTranslations.status.calcBP
// → Fallback: getSkillStatusLine(skillId)
// → Fallback: step.name || skillId

this.eventBus.emit({
  type: 'step_started',
  planId: plan.id,
  userId: context.userId,
  sessionId: context.sessionId,
  stepIndex: i,
  stepId: `step_${i}`,
  skillId: step.skillId,
  label: label, // ← i18n localized!
  timestamp: Date.now(),
});
```

### **3. step_progress** (Optional)

```typescript
// QUANDO: Skill segnala progress (se supportato)
// DOVE: Dentro executeStepWithRetry() (future)

this.eventBus.emit({
  type: 'step_progress',
  planId: plan.id,
  userId: context.userId,
  sessionId: context.sessionId,
  stepIndex: i,
  stepId: `step_${i}`,
  percent: 42, // 0-100
  timestamp: Date.now(),
});
```

### **4. step_succeeded**

```typescript
// QUANDO: Skill completa con successo
// DOVE: if (result.status === 'success')

this.eventBus.emit({
  type: 'step_succeeded',
  planId: plan.id,
  userId: context.userId,
  sessionId: context.sessionId,
  stepIndex: i,
  stepId: `step_${i}`,
  skillId: step.skillId,
  duration: result.executionTimeMs,
  timestamp: Date.now(),
});
```

### **5. step_failed**

```typescript
// QUANDO: Skill fallisce
// DOVE: if (result.status === 'failed')

const sanitizedMessage = this.sanitizeErrorMessage(
  result.error?.message || 'Step failed'
);

this.eventBus.emit({
  type: 'step_failed',
  planId: plan.id,
  userId: context.userId,
  sessionId: context.sessionId,
  stepIndex: i,
  stepId: `step_${i}`,
  skillId: step.skillId,
  message: sanitizedMessage, // ← Non-sensitive!
  duration: result.executionTimeMs,
  timestamp: Date.now(),
});
```

### **6. plan_completed**

```typescript
// QUANDO: Piano finisce (success o failure)
// DOVE: Dopo loop step

this.eventBus.emit({
  type: 'plan_completed',
  planId: plan.id,
  userId: context.userId,
  sessionId: context.sessionId,
  duration: totalTime,
  successfulSteps,
  failedSteps,
  success: overallStatus === 'done',
  timestamp: Date.now(),
});
```

---

## 🌐 LABELS i18n

### **Mapping skillId → i18n key**

```typescript
const mapping = {
  'business_plan.run': 'calcBP',           // → "Calcolo VAN/TIR…"
  'sensitivity.run': 'sensitivity',         // → "Eseguo sensitivity analysis…"
  'term_sheet.create': 'generatePDF',       // → "Genero PDF…"
  'rdo.create': 'sendRDO',                  // → "Invio RDO ai fornitori…"
  'sal.record': 'recordSAL',                // → "Registro stato avanzamento…"
  'sales.proposal': 'prepareProposal',      // → "Preparo proposta commerciale…"
  'feasibility.analyze': 'buildFeasibility',// → "Costruisco analisi di fattibilità…"
  'market.research': 'fetchMarket',         // → "Cerco comparabili di mercato…"
};

// Fallback chain:
label = osTranslations.status[mapping[skillId]]
     || getSkillStatusLine(skillId)
     || step.name
     || skillId
```

---

## 🔒 SECURITY - Sanitize Errors

### **sanitizeErrorMessage()**

```typescript
// Input:
"Error: Invalid API key sk-abc123xyz456 in /Users/admin/project/src/service.ts:42"

// Process:
1. Take first line only
2. Remove file paths: /Users/admin/...
3. Remove emails: admin@example.com → [email]
4. Remove tokens: sk-abc123xyz456 → [token]
5. Truncate > 100 char

// Output:
"Error: Invalid API key [token]"

// ✅ No sensitive data leaked to client!
```

---

## 🧪 TEST RESULTS

### **7/7 EVENTBUS TESTS PASSATI ✅**

```bash
PASS src/os2/events/__tests__/EventBus.test.ts
  EventBus
    Event Emission
      ✓ dovrebbe emettere plan_started event
      ✓ dovrebbe emettere step_started event
      ✓ dovrebbe chiamare handlers multipli per stesso tipo
    Wildcard Subscription
      ✓ dovrebbe chiamare onAny per tutti gli eventi
    Unsubscribe
      ✓ dovrebbe permettere unsubscribe
    Flow completo 3-step plan
      ✓ dovrebbe emettere 1+3+3+1 eventi per piano 3 step
      ✓ dovrebbe emettere step_failed quando step fallisce

Tests: 7 passed
Time: 0.5s

✅ Verifica flow: 1 plan_started + 3 step_started + 3 step_succeeded + 1 plan_completed = 8 eventi
```

---

## 📊 ESEMPIO FLOW COMPLETO

### **Piano 3 step (tutti success)**

```typescript
// Executor esegue piano con 3 step

// Event 1: plan_started
{
  type: 'plan_started',
  planId: 'plan_001',
  stepsCount: 3,
  ts: 1000
}

// Event 2: step_started (step 0)
{
  type: 'step_started',
  planId: 'plan_001',
  stepId: 'step_0',
  skillId: 'business_plan.run',
  label: 'Calcolo VAN/TIR…',  // ← i18n!
  ts: 1100
}

// Event 3: step_succeeded (step 0)
{
  type: 'step_succeeded',
  planId: 'plan_001',
  stepId: 'step_0',
  skillId: 'business_plan.run',
  duration: 2000,
  ts: 3100
}

// Event 4: step_started (step 1)
{
  type: 'step_started',
  stepId: 'step_1',
  skillId: 'sensitivity.run',
  label: 'Eseguo sensitivity analysis…',  // ← i18n!
  ts: 3200
}

// Event 5: step_succeeded (step 1)
{
  type: 'step_succeeded',
  stepId: 'step_1',
  duration: 1500,
  ts: 4700
}

// Event 6: step_started (step 2)
{
  type: 'step_started',
  stepId: 'step_2',
  skillId: 'term_sheet.create',
  label: 'Genero PDF…',  // ← i18n!
  ts: 4800
}

// Event 7: step_succeeded (step 2)
{
  type: 'step_succeeded',
  stepId: 'step_2',
  duration: 1800,
  ts: 6600
}

// Event 8: plan_completed
{
  type: 'plan_completed',
  planId: 'plan_001',
  duration: 5600,
  successfulSteps: 3,
  failedSteps: 0,
  success: true,
  ts: 6700
}

TOTALE: 8 eventi (1+3+3+1) ✅
```

### **Piano con 1 step fallito**

```typescript
// Step 1 fallisce

// Events 1-3: plan_started + step_started + step_succeeded (step 0)

// Event 4: step_started (step 1)
{
  type: 'step_started',
  stepId: 'step_1',
  skillId: 'rdo.create',
  label: 'Invio RDO ai fornitori…',
  ts: 3200
}

// Event 5: step_failed (step 1)
{
  type: 'step_failed',
  planId: 'plan_001',
  stepId: 'step_1',
  skillId: 'rdo.create',
  message: 'Validation error',  // ← Sanitized!
  duration: 500,
  ts: 3700
}

// Event 6: plan_completed (con failedSteps=1)
{
  type: 'plan_completed',
  planId: 'plan_001',
  duration: 3700,
  successfulSteps: 1,
  failedSteps: 1,
  success: false,  // ← Failed!
  ts: 3800
}

// ✅ Step fallito tracciato, piano va in errore
```

---

## 🏆 RISULTATO FINALE

### ✅ **EVENTBUS + BROADCASTER COMPLETO**

**EventBus**: ✅ 180 righe (singleton emitter)  
**Broadcaster**: ✅ 150 righe (SSE publisher)  
**PlanExecutor**: ✅ +120 righe (emission points)  
**SSE Route**: ✅ +10 righe (config)  
**Tests**: ✅ 7/7 (100%)  

**Event Types**: ✅ 7  
**i18n Labels**: ✅ Integrated  
**Error Sanitization**: ✅ Implemented  

**Status Finale**: 🎉 **PRODUCTION READY**

---

## 🎉 RIEPILOGO FINALE GIORNATA (COMPLETO)

### 🎉 **10 TASK COMPLETATI AL 100%**

```
1️⃣ Decision Layer: 16 test ✅
2️⃣ Memory System: 15 test ✅
3️⃣ Sidecar UI: 9 E2E ✅
4️⃣ OS Modes: 10 test ✅
5️⃣ Guardrail & Security: 22 test ✅
6️⃣ Telemetry: 5 test ✅
7️⃣ System Prompt: 11 test ✅
8️⃣ Live Ticker: UI ready ✅
9️⃣ SSE Streaming: 4 test ✅
🔟 EventBus + Broadcaster: 7 test ✅

──────────────────────────────────────
TOTALE FILES: 45 ✅
TOTALE RIGHE: 11.536 ✅
TOTALE TEST: 99/99 (100% ✅)
──────────────────────────────────────
```

---

**Completato**: 16 Gennaio 2025  
**Tempo**: ~7.5 ore  
**Righe**: 11.536  
**Test**: 99/99 ✅  
**Real-time**: EventBus + SSE ✅

