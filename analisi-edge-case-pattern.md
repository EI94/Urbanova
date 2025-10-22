# 🧠 ANALISI EDGE CASE - PATTERN STRUTTURALE

## 7 MESSAGGI MISSED

### 1. "Quale ha il miglior ROI?"
- **Pattern**: Domanda COMPARATIVA senza oggetti espliciti
- **Context**: Richiede progetti/analisi precedenti
- **Azione Implicita**: Confronta progetti nella memoria
- **Tool Corretto**: `project_query` O usa memoria conversazione

### 2. "Salva questi dati per dopo"
- **Pattern**: Riferimento PRONOMINALE vago ("questi dati")
- **Context**: Riferimento a dati discussi precedentemente
- **Azione Implicita**: Salva progetto/analisi corrente
- **Tool Corretto**: `project_save` O `feasibility_save`

### 3. "No torna indietro, fai Napoli"
- **Pattern**: Context SWITCH + azione implicita
- **Context**: "torna indietro" = annulla, "fai Napoli" = riprendi precedente
- **Azione Implicita**: Riprendi analisi Napoli menzionata prima
- **Tool Corretto**: `feasibility_analyze` per Napoli

### 4. "Quale conviene?"
- **Pattern**: Domanda COMPARATIVA senza soggetto
- **Context**: Richiede confronto tra opzioni discusse
- **Azione Implicita**: Confronta progetti/scenari precedenti
- **Tool Corretto**: `project_query` con comparison

### 5. "Crea business plan dettagliato"
- **Pattern**: Azione ESPLICITA ma probabilmente fallita
- **Context**: Parametri mancanti
- **Motivo Failure**: Non usa defaults
- **Tool Corretto**: `business_plan_calculate` CON DEFAULTS

### 6. "Fai BP completo"
- **Pattern**: Azione ESPLICITA ma fallita
- **Context**: Parametri mancanti
- **Motivo Failure**: Non usa defaults
- **Tool Corretto**: `business_plan_calculate` CON DEFAULTS

### 7. "Analizza pro e contro"
- **Pattern**: Richiesta ANALITICA comparativa
- **Context**: Pro/contro per opzioni discusse
- **Azione Implicita**: Analisi comparativa
- **Tool Corretto**: `feasibility_analyze` multi O conversational

---

## 🎯 PATTERN COMUNI IDENTIFICATI

### **PATTERN A: Riferimenti PRONOMINALI** (2 casi)
- "questi dati", "quello", "questo"
- **Soluzione**: Traccia "last operation result" nel context

### **PATTERN B: Domande COMPARATIVE** (3 casi)  
- "quale ha miglior X?", "quale conviene?", "pro e contro"
- **Soluzione**: Riconosci intent comparativo + usa memoria

### **PATTERN C: Context SWITCH** (1 caso)
- "torna indietro", "dimenticalo", "no"
- **Soluzione**: Mantieni stack operazioni + recover

### **PATTERN D: Defaults NON usati** (2 casi)
- Azione esplicita ma fallita per params
- **Soluzione**: Enforcement defaults più aggressivo

---

## 💡 SOLUZIONE STRUTTURALE (NO keyword matching!)

### 1. **Context Tracking Intelligente**
```typescript
interface ConversationContext {
  lastOperation: {
    type: 'feasibility' | 'businessPlan' | 'save',
    result: any,
    timestamp: Date
  },
  mentionedProjects: string[],
  operationStack: Operation[]
}
```

### 2. **Intent Recognition Avanzato**
```typescript
recognizeIntent(message, conversationHistory):
  - Comparative? → usa memoria + comparison
  - Pronominale? → risolvi riferimento da context
  - ContextSwitch? → pop operation stack
  - Missing params? → FORCE defaults
```

### 3. **Prompt Enhancement Context-Aware**
```
Nel prompt, include:
- Last operation result summary
- Progetti/analisi menzionati
- Stack operazioni per "torna indietro"
```

### 4. **LLM-Driven Resolution (NO hard-coded!)**
```
Invece di keyword matching:
→ Arricchisci il prompt con CONTESTO
→ LLM decide autonomamente azione corretta
→ Usa memoria conversazione + RAG
```

---

## 🎯 APPROCCIO IMPLEMENTATIVO

### FASE 1: Enhanced Conversation Context
- Traccia last operation + result
- Mantieni lista progetti/località menzionati
- Stack operazioni per undo/redo

### FASE 2: Prompt Arricchito Dinamicamente
```
🎯 CONTESTO CONVERSAZIONE:
Ultima operazione: feasibility_analyze su "Napoli"
Risultato: ROI 28.5%, Margine 2M
Progetti menzionati: ["Milano", "Roma", "Napoli"]

Quando user dice "quale conviene?":
→ Riferimento a progetti menzionati
→ CHIAMA project_query O usa memoria per confronto
```

### FASE 3: Reference Resolution
```
Pronomi/Riferimenti vaghi:
- "questo/quello" → last operation result
- "questi dati" → current session data
- "torna indietro" → previous operation
```

Questo approccio è **LLM-DRIVEN**, non keyword matching! 🧠
