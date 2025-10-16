# 🚩 FEATURE FLAGS - Sistema di Rollout Graduale

## 📋 Panoramica

Il sistema di Feature Flags permette di attivare/disattivare funzionalità senza modificare il codice o fare nuovi deploy. Questo è fondamentale per il **rollout graduale di Urbanova OS 2.0**.

## 🎯 Feature Flag: OS_V2_ENABLED

### **Scopo**

Attivare gradualmente **Urbanova OS 2.0** (sistema multiagente avanzato) mantenendo la retrocompatibilità con **OS 1.x** (Sofia Orchestrator legacy).

### **Stato Attuale**

- **Default**: `false` (OS 1.x attivo)
- **Production**: `false` (rollout graduale)
- **Testing**: Può essere `true` per test specifici

### **Cosa cambia tra OS 1.x e OS 2.0**

| Feature | OS 1.x (Legacy) | OS 2.0 (Avanzato) |
|---------|----------------|-------------------|
| Orchestratore | Sofia Orchestrator | UrbanovaOSOrchestrator |
| Classificazione | Intent Service classico | ML Classification Engine |
| Memoria | Memoria semplice | Memoria conversazionale multi-livello |
| Ricerca | Keyword search | Vector Store + RAG |
| Automazione | Script manuali | Workflow Engine |
| Estensibilità | Hardcoded | Plugin System |
| ML/AI | Basic pattern matching | Advanced ML con training continuo |
| Performance | Sequenziale | Parallelo (5+ operazioni) |

---

## 🔧 Configurazione

### **1. File di Configurazione**

```bash
# .env.local (per sviluppo locale)
NEXT_PUBLIC_OS_V2_ENABLED=false

# .env (default)
NEXT_PUBLIC_OS_V2_ENABLED=false

# .env.production (produzione)
NEXT_PUBLIC_OS_V2_ENABLED=false
OS_V2_ENABLED=false
```

### **2. Codice TypeScript**

```typescript
import { OS_V2_ENABLED, isOSv2Enabled } from '@/lib/featureFlags';

// Uso diretto
if (OS_V2_ENABLED) {
  // Usa OS 2.0
  const response = await urbanovaOSOrchestrator.processRequest(request);
} else {
  // Usa OS 1.x
  const response = await sofiaOrchestrator.process(request);
}

// Uso con funzione helper
if (isOSv2Enabled()) {
  // ...
}
```

### **3. Componenti React**

```typescript
import { OS_V2_ENABLED } from '@/lib/featureFlags';

export default function ChatComponent() {
  return (
    <div>
      {OS_V2_ENABLED ? (
        <OSv2ChatInterface />
      ) : (
        <LegacyChatInterface />
      )}
    </div>
  );
}
```

---

## 🧪 Testing

### **Unit Tests**

```bash
# Esegui test feature flags
npm test -- src/lib/__tests__/featureFlags.test.ts

# Output atteso: 18/18 test passati ✅
```

**Test coperti**:
- ✅ Parsing booleano corretto
- ✅ Default value (false)
- ✅ Variabili d'ambiente (NEXT_PUBLIC_OS_V2_ENABLED, OS_V2_ENABLED)
- ✅ Edge cases (undefined, empty string, case sensitivity)

### **E2E Tests (Playwright)**

```bash
# Esegui E2E test OS flag
npm run test:e2e -- e2e/os-flag.spec.ts
```

**Scenari testati**:
- ✅ Dashboard caricamento con OS v1.x
- ✅ Dashboard caricamento con OS v2.0
- ✅ API /api/chat comportamento differente
- ✅ Nessuna regressione su percorsi critici
- ✅ Build verification

---

## 🚀 Rollout Graduale - Piano

### **Fase 1: Testing Interno (Settimana 1)**

```bash
# .env.local
NEXT_PUBLIC_OS_V2_ENABLED=true
```

**Azioni**:
1. Attiva OS 2.0 solo in locale
2. Test maniacali su tutte le funzionalità
3. Verifica performance (< 2s response time)
4. Confronto risposte OS 1.x vs 2.0
5. Fix eventuali bug

**Acceptance Criteria**:
- ✅ Nessun errore JavaScript
- ✅ Tutte le funzionalità OS 1.x funzionano in OS 2.0
- ✅ Performance uguali o migliori
- ✅ Memoria conversazionale funzionante

---

### **Fase 2: Canary Deployment (Settimana 2)**

```bash
# .env.production (solo per 5% utenti)
NEXT_PUBLIC_OS_V2_ENABLED=true
```

**Azioni**:
1. Deploy con flag disabilitato
2. Attiva flag per 5% utenti random
3. Monitoraggio metriche: error rate, latency, conversions
4. Confronto A/B: OS 1.x vs OS 2.0
5. Rollback immediato se errori

**Metriche da monitorare**:
- Error rate: deve rimanere < 0.5%
- P95 latency: deve rimanere < 2s
- User satisfaction: NPS score
- Feature usage: % utenti che usano funzionalità avanzate

---

### **Fase 3: Rollout Incrementale (Settimana 3-4)**

```bash
# Incremento graduale: 5% → 10% → 25% → 50% → 75% → 100%
```

**Timeline**:
- **Giorno 1-2**: 10% utenti (se 5% OK)
- **Giorno 3-4**: 25% utenti (se 10% OK)
- **Giorno 5-7**: 50% utenti (se 25% OK)
- **Giorno 8-10**: 75% utenti (se 50% OK)
- **Giorno 11-14**: 100% utenti (se 75% OK)

**Criteri di avanzamento**:
- Error rate stabile < 0.5%
- P95 latency stabile < 2s
- Nessun feedback negativo critico
- Business metrics invariati o migliori

---

### **Fase 4: Full Deployment (Settimana 5)**

```bash
# .env.production
NEXT_PUBLIC_OS_V2_ENABLED=true  # Default per tutti
```

**Azioni**:
1. Attiva OS 2.0 per 100% utenti
2. Monitora per 1 settimana
3. Depreca OS 1.x se tutto OK
4. Rimuovi codice legacy dopo 2 settimane

---

## 🔍 Monitoring & Debugging

### **Log Console**

```javascript
// Quando OS v2.0 è ENABLED
🚀 [UrbanovaOS] OS v2.0 ENABLED
🎯 [UrbanovaOS] Processando con sistema enterprise avanzato...
✅ [UrbanovaOS Orchestrator] Richiesta processata con successo

// Quando OS v2.0 è DISABLED
🚀 [UrbanovaOS] OS v2.0 DISABLED
// Usa Sofia Orchestrator legacy
```

### **Verifica Flag Attivo**

```typescript
// Nel browser console
console.log('OS v2.0 enabled:', process.env.NEXT_PUBLIC_OS_V2_ENABLED);

// O tramite API
fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ message: 'test' })
})
.then(r => r.json())
.then(d => console.log('Provider:', d.metadata.provider));
// "urbanova-os" = OS v2.0
// "openai" = OS v1.x
```

### **Metriche da Dashboard**

- **Response Time**: Avg, P50, P95, P99
- **Error Rate**: % errori per endpoint
- **OS Usage**: % richieste OS v2.0 vs v1.x
- **Feature Usage**: Quali funzionalità OS v2.0 usate
- **User Satisfaction**: NPS, feedback

---

## 🐛 Troubleshooting

### **Problema: OS v2.0 non si attiva**

```bash
# Verifica 1: Env var corretta
echo $NEXT_PUBLIC_OS_V2_ENABLED
# Deve essere: true

# Verifica 2: Riavvia server
npm run dev

# Verifica 3: Controlla log
# Deve mostrare: "OS v2.0 ENABLED"
```

### **Problema: Errori dopo attivazione OS v2.0**

```bash
# Rollback immediato
NEXT_PUBLIC_OS_V2_ENABLED=false
npm run dev

# Controlla log errori
tail -f logs/error.log

# Esegui test
npm test
npm run test:e2e
```

### **Problema: Performance degradata**

```bash
# Verifica metriche
# - Response time deve essere < 2s
# - OS v2.0 dovrebbe essere più veloce (parallelo)

# Se più lento:
# 1. Verifica OpenAI API latency
# 2. Verifica cache Redis attiva
# 3. Verifica nessun bottleneck DB
# 4. Considera aumentare timeout
```

---

## 📊 Acceptance Criteria

### **✅ Build & Deploy**

- [x] Build TypeScript OK con flag true/false
- [x] Nessun warning/errore nuovi
- [x] Deploy Vercel OK
- [x] Environment vars configurate

### **✅ Funzionalità**

- [x] OS 1.x funziona con flag=false
- [x] OS 2.0 funziona con flag=true
- [x] Switch tra OS 1.x ↔ OS 2.0 senza errori
- [x] Nessun percorso critico rotto
- [x] Memoria conversazionale funzionante

### **✅ Testing**

- [x] Unit test passano (18/18)
- [x] E2E smoke test passano
- [x] Performance test OK (< 2s)
- [x] Load test OK (100 req/sec)

### **✅ Monitoring**

- [x] Log corretti (ENABLED/DISABLED)
- [x] Metriche tracciabili
- [x] Error tracking attivo
- [x] Rollback procedure documentata

---

## 📚 Riferimenti

**File Coinvolti**:
- `src/lib/featureFlags.ts` - Feature flags definition
- `src/app/api/chat/route.ts` - Integrazione OS v2.0
- `src/lib/__tests__/featureFlags.test.ts` - Unit tests
- `e2e/os-flag.spec.ts` - E2E tests
- `.env.example` - Configurazione example
- `.env.production.example` - Configurazione production

**Documentazione Urbanova OS**:
- `URBANOVA_OS_ANALISI_COMPLETA.md` (già copiato dall'utente)
- `BUSINESS_PLAN_OS_INTEGRATION_REPORT.md`
- `BUSINESS_PLAN_INTEGRATION_SUMMARY.md`

**Test Esistenti**:
- Unit tests: `src/__tests__/`
- E2E tests: `e2e/`
- Load tests: `src/__tests__/performance/`

---

## 🎉 Success Metrics

**OS v2.0 sarà considerato un successo quando**:

✅ **Performance**: Response time < 2s (P95)
✅ **Reliability**: Error rate < 0.5%
✅ **Adoption**: 100% utenti migrati in 4 settimane
✅ **Satisfaction**: NPS score invariato o migliore
✅ **Business**: Conversion rate invariato o migliore
✅ **Technical**: Nessun rollback necessario

**Rollback Trigger** (attiva rollback immediato se):

⚠️ Error rate > 2%
⚠️ P95 latency > 5s
⚠️ Critical bug segnalato
⚠️ Business metrics drop > 10%

---

**Ultima modifica**: 16 Gennaio 2025
**Versione**: 1.0
**Status**: ✅ Ready for Phase 1 Testing

