# 🎬 DEMO SCRIPT - Urbanova OS 2.0 Acceptance Test

## ✅ SCRIPT DI ACCETTAZIONE FUNZIONALE

**Obiettivo**: Verificare che tutte le feature OS 2.0 funzionino end-to-end  
**Tempo**: ~5 minuti  
**Prerequisiti**: App running su `localhost:3000`, utente loggato

---

## 📋 CHECKLIST RAPIDA

```
✅ Sidecar apertura/chiusura (⌘J)
✅ LiveTicker real-time updates
✅ Status lines i18n (Johnny Ive)
✅ Message badges (skill + project + status)
✅ KPI pills con delta
✅ Action buttons
✅ Filtri funzionanti
✅ Ask-to-Act mode (conferma)
✅ Ticker collapse on complete
```

---

## 🎭 SCENARIO 1: Business Plan con LiveTicker

### **Step 1: Apri Sidecar**

```
Azione:  Premi ⌘J (Mac) o Ctrl+J (Windows/Linux)
```

**Verifica** ✅:
- [ ] Sidecar si apre da destra (560px desktop)
- [ ] Header mostra "Urbanova OS"
- [ ] Mode toggle mostra "Ask-to-Act" (badge "Default")
- [ ] Composer input visibile in basso

---

### **Step 2: Invia Richiesta Business Plan**

```
Azione:  Digita nel composer:
         "Fai Business Plan progetto Ciliegie"
         
Azione:  Premi Enter (o click send button)
```

**Verifica** ✅:
- [ ] Messaggio utente appare in timeline (blu, allineato destra)
- [ ] LiveTicker appare sotto l'header (sticky mobile)
- [ ] Ticker mostra "Piano in esecuzione…"

---

### **Step 3: Osserva LiveTicker Real-time**

```
Ticker dovrebbe mostrare step sequenziali:
```

**Step 1** (0-2s):
```
┌────────────────────────────────────┐
│ [📊] Calcolare VAN/TIR…      ●●●   │ ← Three dots animated
│ Progress: ████████░░ 80%           │
└────────────────────────────────────┘
```

**Verifica** ✅:
- [ ] Icona skill visibile (📊 Calculator)
- [ ] Label i18n: "Calcolare VAN/TIR…" (infinito!)
- [ ] Three-dot animation (stagger 0s/0.2s/0.4s)
- [ ] Progress bar si aggiorna (se supportato)

**Step completes**:
```
┌────────────────────────────────────┐
│ [📊] Calcolare VAN/TIR…      ✓     │ ← Success checkmark
│ Completato in 1.2s                 │
└────────────────────────────────────┘
```

**Verifica** ✅:
- [ ] Checkmark verde appare (✓)
- [ ] Duration mostrato (es. "1.2s")

---

**Step 2** (2-4s):
```
┌────────────────────────────────────┐
│ [📄] Generare PDF…           ●●●   │
│ Progress: ██████░░░░ 60%           │
└────────────────────────────────────┘
```

**Verifica** ✅:
- [ ] Icona cambia (📄 Document)
- [ ] Label: "Generare PDF…"
- [ ] Dots continuano ad animare

**Step completes**:
```
┌────────────────────────────────────┐
│ [📄] Generare PDF…           ✓     │
│ Completato in 0.8s                 │
└────────────────────────────────────┘
```

---

### **Step 4: Ticker Collapse**

```
Dopo completamento piano (4-5s):
```

**Before collapse**:
```
┌────────────────────────────────────┐
│ Action Plan                        │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ [📊] Calcolare VAN/TIR…      ✓     │
│ [📄] Generare PDF…           ✓     │
└────────────────────────────────────┘
```

**After collapse** (500ms animation):
```
┌────────────────────────────────────┐
│ ✅ Piano completato in 1.7s  [▼]   │ ← Collapsed summary
└────────────────────────────────────┘
```

**Verifica** ✅:
- [ ] Ticker collassa automaticamente (500ms delay)
- [ ] Summary mostra "Piano completato in 1.7s"
- [ ] Chevron down indicator (▼) presente
- [ ] Steps nascosti

**Click to re-expand**:
```
Azione:  Click su ticker summary
```

**Verifica** ✅:
- [ ] Ticker si espande
- [ ] Steps di nuovo visibili
- [ ] Chevron up indicator (▲)

---

### **Step 5: Verifica Messaggio OS**

```
Messaggio OS nella timeline dovrebbe mostrare:
```

**Anatomia completa**:
```
┌─────────────────────────────────────────────────┐
│ 10:42 [📊 Business Plan] [🟢 Done]              │ ← Header
├─────────────────────────────────────────────────┤
│ [🏢 Progetto Ciliegie]                          │ ← Project pill
│                                                 │
│ Ecco il Business Plan per Progetto Ciliegie:   │ ← Content
│                                                 │
│ ┌─────────┐ ┌─────────┐                        │
│ │ VAN     │ │ TIR     │                        │ ← KPI pills
│ │ €245k   │ │ 18.5%   │                        │
│ │ +12%    │ │ +2.1%   │                        │
│ └─────────┘ └─────────┘                        │
│                                                 │
│ [📄 Business_Plan.pdf] [⬇️]                     │ ← Artifact
│                                                 │
│ [Apri sensitivity] [Genera term sheet]          │ ← Actions
└─────────────────────────────────────────────────┘
```

**Verifica Header** ✅:
- [ ] Timestamp (es. "10:42")
- [ ] Skill badge: "[📊 Business Plan]" (cliccabile)
- [ ] Status badge: "[🟢 Done]" (verde)

**Verifica Project Pill** ✅:
- [ ] Pill gradient: "[🏢 Progetto Ciliegie]"
- [ ] Cliccabile → deep-link a progetto

**Verifica KPI Pills** ✅:
- [ ] 2 KPI cards (grid 2x2)
- [ ] Label: "VAN", "TIR"
- [ ] Value: "€245k", "18.5%"
- [ ] Delta: "+12%", "+2.1%" (verde se positivo)

**Verifica Artifacts** ✅:
- [ ] Download link: "Business_Plan.pdf"
- [ ] Download icon (⬇️)
- [ ] Click → download file

**Verifica Actions** ✅:
- [ ] 2 bottoni: "Apri sensitivity", "Genera term sheet"
- [ ] Primary button style (blu)
- [ ] Click → esegue azione

---

## 🎭 SCENARIO 2: Filtri Timeline

### **Step 6: Applica Filtri**

```
Azione:  Click su "Filtri" button (top-right header)
```

**Verifica drawer apre** ✅:
- [ ] Drawer si apre da destra
- [ ] Mostra 4 filtri: Progetto, Skill, Stato, Periodo
- [ ] Badge "Attivi: 0" in header

```
Azione:  Seleziona filtro Progetto = "Ciliegie"
Azione:  Seleziona filtro Skill = "Business Plan"
```

**Verifica** ✅:
- [ ] Badge aggiorna: "Attivi: 2"
- [ ] Timeline si filtra in real-time
- [ ] Solo messaggi con Progetto=Ciliegie e Skill=Business Plan visibili
- [ ] Altri messaggi nascosti (non eliminati!)
- [ ] Conversazione rimane intatta

```
Azione:  Click "Pulisci"
```

**Verifica** ✅:
- [ ] Filtri si resettano
- [ ] Badge: "Attivi: 0"
- [ ] Timeline mostra tutti i messaggi di nuovo

---

## 🎭 SCENARIO 3: RDO con Conferma (Ask-to-Act)

### **Step 7: Richiesta RDO**

```
Azione:  Digita nel composer:
         "Apri RDO serramenti"
         
Azione:  Premi Enter
```

**Verifica mode Ask-to-Act** ✅:
- [ ] Mode toggle header mostra "Ask-to-Act" (default)
- [ ] Badge "Default" visibile

---

### **Step 8: LiveTicker con Awaiting Confirm**

```
Ticker mostra step RDO:
```

**Step awaiting confirm**:
```
┌────────────────────────────────────┐
│ [📧] Inviare RDO ai fornitori… ⚠️  │ ← Warning icon
│ Status: Awaiting confirm           │
└────────────────────────────────────┘
```

**Verifica** ✅:
- [ ] Icona skill: 📧 (Mail)
- [ ] Label: "Inviare RDO ai fornitori…"
- [ ] Warning icon (⚠️) per conferma richiesta
- [ ] Status badge: "Awaiting confirm" (giallo)

---

### **Step 9: Messaggio con Preview + Conferma**

```
Messaggio OS mostra preview:
```

**Preview RDO**:
```
┌─────────────────────────────────────────────────┐
│ 10:45 [📧 RDO] [🟡 Awaiting Confirm]            │
├─────────────────────────────────────────────────┤
│ [🏢 Progetto Ciliegie]                          │
│                                                 │
│ Pronto a inviare RDO a 3 fornitori:            │
│ • Fornitore A - Serramenti PVC                 │
│ • Fornitore B - Serramenti Alluminio           │
│ • Fornitore C - Serramenti Legno               │
│                                                 │
│ Importo stimato: €45.000                       │
│ Scadenza offerta: 15 giorni                    │
│                                                 │
│ [✅ Conferma] [✏️ Modifica] [❌ Annulla]        │ ← Confirm buttons
└─────────────────────────────────────────────────┘
```

**Verifica Preview** ✅:
- [ ] Status: "[🟡 Awaiting Confirm]" (giallo)
- [ ] Preview dettagli RDO visibili
- [ ] 3 bottoni: Conferma, Modifica, Annulla
- [ ] Ticker in stato "awaiting_confirm"

---

### **Step 10: Conferma Azione**

```
Azione:  Click "Conferma"
```

**Ticker updates**:
```
Prima:
┌────────────────────────────────────┐
│ [📧] Inviare RDO ai fornitori… ⚠️  │
│ Status: Awaiting confirm           │
└────────────────────────────────────┘

Dopo conferma (1-2s):
┌────────────────────────────────────┐
│ [📧] Inviare RDO ai fornitori… ●●● │ ← Executing
│ Progress: ████████░░ 80%           │
└────────────────────────────────────┘

Completato (3-4s):
┌────────────────────────────────────┐
│ [📧] Inviare RDO ai fornitori… ✓   │ ← Success
│ Completato in 2.3s                 │
└────────────────────────────────────┘
```

**Verifica** ✅:
- [ ] Status cambia: awaiting → running → success
- [ ] Three-dots animation durante execution
- [ ] Success checkmark alla fine
- [ ] Ticker collassa con "Piano completato in 2.3s"

**Messaggio aggiornato**:
```
┌─────────────────────────────────────────────────┐
│ 10:45 [📧 RDO] [🟢 Done]                        │ ← Status verde
├─────────────────────────────────────────────────┤
│ [🏢 Progetto Ciliegie]                          │
│                                                 │
│ ✅ RDO inviato a 3 fornitori con successo!      │
│                                                 │
│ [📄 RDO_Serramenti.pdf] [⬇️]                    │ ← Artifact
│                                                 │
│ [Vedi risposte] [Confronta offerte]             │ ← New actions
└─────────────────────────────────────────────────┘
```

**Verifica** ✅:
- [ ] Status badge: "[🟢 Done]" (verde)
- [ ] Messaggio conferma successo
- [ ] Artifact PDF disponibile
- [ ] Nuove azioni disponibili

---

## 🎭 SCENARIO 4: Keyboard Shortcuts

### **Step 11: Test Shortcuts**

```
Azione:  Premi ⌘J (o Ctrl+J)
```

**Verifica** ✅:
- [ ] Sidecar si chiude

```
Azione:  Premi ⌘J di nuovo
```

**Verifica** ✅:
- [ ] Sidecar si riapre
- [ ] Stato timeline preserved (non resetta)

```
Azione:  Premi ⌘K (o Ctrl+K)
```

**Verifica** ✅:
- [ ] Focus va a search/command bar
- [ ] Input search evidenziato

```
Azione:  Premi Escape
```

**Verifica** ✅:
- [ ] Focus esce da search
- [ ] (Opzionale) Sidecar si chiude

---

## 🎭 SCENARIO 5: Mobile Responsive

### **Step 12: Test Mobile Viewport**

```
Azione:  Resize browser a 375x667 (iPhone size)
         O apri DevTools e seleziona mobile device
```

**Verifica Mobile Layout** ✅:
- [ ] Sidecar diventa full-width overlay
- [ ] Header sticky (sempre visibile durante scroll)
- [ ] LiveTicker sticky sotto header
- [ ] Composer sticky in basso
- [ ] Messages scrollable in mezzo
- [ ] Action buttons stack verticalmente
- [ ] KPI grid 1 colonna invece di 2

```
Azione:  Scroll timeline verso l'alto
```

**Verifica Sticky** ✅:
- [ ] Header rimane in alto
- [ ] LiveTicker rimane sotto header
- [ ] Composer rimane in basso
- [ ] Solo messages scrollano

---

## 🎭 SCENARIO 6: Error Handling

### **Step 13: Simula Errore Skill**

```
Azione:  Digita richiesta che fallirà:
         "Genera report per progetto inesistente XYZ"
         
Azione:  Premi Enter
```

**LiveTicker error state**:
```
┌────────────────────────────────────┐
│ [📊] Calcolare VAN/TIR…      ❌    │ ← Error icon
│ Errore: Progetto non trovato       │
│ Duration: 0.5s                     │
└────────────────────────────────────┘
```

**Verifica** ✅:
- [ ] Error icon (❌) rosso
- [ ] Error message mostrato
- [ ] Ticker collassa con "Piano fallito"

**Messaggio error**:
```
┌─────────────────────────────────────────────────┐
│ 10:50 [📊 Business Plan] [🔴 Error]             │
├─────────────────────────────────────────────────┤
│ [🏢 Progetto XYZ]                               │
│                                                 │
│ ❌ Impossibile completare: Progetto non trovato │
│                                                 │
│ [🔄 Riprova] [✏️ Modifica richiesta]            │ ← Retry actions
└─────────────────────────────────────────────────┘
```

**Verifica** ✅:
- [ ] Status badge: "[🔴 Error]" (rosso)
- [ ] Error message chiaro
- [ ] Actions di recovery: "Riprova", "Modifica"

---

## 📊 ACCEPTANCE CHECKLIST FINALE

### **Feature Completeness**

```
✅ Sidecar UI
   ✓ Apertura/chiusura ⌘J
   ✓ Mode toggle (Ask/Ask-to-Act/Act)
   ✓ Responsive (desktop 560px, mobile full-width)
   ✓ Sticky header/ticker/composer

✅ LiveTicker
   ✓ Real-time step updates
   ✓ Skill icons + i18n labels
   ✓ Three-dot animation
   ✓ Progress tracking
   ✓ Success/Error states
   ✓ Auto-collapse on complete

✅ Messages
   ✓ Skill badge (cliccabile)
   ✓ Project pill (deep-link)
   ✓ Status badge (colored)
   ✓ KPI pills con delta
   ✓ Artifacts download
   ✓ Action buttons

✅ Filters
   ✓ Progetto, Skill, Stato, Periodo
   ✓ Real-time filtering
   ✓ Badge "Attivi: X"
   ✓ Clear all
   ✓ Timeline preserved

✅ Ask-to-Act Mode
   ✓ Preview dangerous actions
   ✓ Confirm/Modify/Cancel buttons
   ✓ Awaiting confirm state
   ✓ Execute after confirm

✅ i18n Status Lines
   ✓ Johnny Ive style (infinito)
   ✓ Brevi e chiari
   ✓ Consistenti

✅ Keyboard Shortcuts
   ✓ ⌘J toggle sidecar
   ✓ ⌘K focus search
   ✓ Escape close/unfocus

✅ Mobile
   ✓ Full-width overlay
   ✓ Sticky header/ticker/composer
   ✓ Responsive buttons
   ✓ Touch-friendly

✅ Error Handling
   ✓ Error icon + message
   ✓ Retry actions
   ✓ Clear feedback
```

### **Quality Gates**

```
✅ Performance
   ✓ Time to first status < 400ms
   ✓ Smooth animations (200-400ms)
   ✓ No janky scrolling

✅ Accessibility
   ✓ Keyboard navigation
   ✓ Focus indicators
   ✓ aria-label presente
   ✓ Screen reader friendly

✅ UX (Johnny Ive)
   ✓ Minimal, clean design
   ✓ Every pixel has purpose
   ✓ Clear visual hierarchy
   ✓ Semantic colors
```

---

## 🎉 RISULTATO ATTESO

Se tutti gli step passano, dovresti vedere:

```
✅ 13 Step completati
✅ 0 Errori critici
✅ 0 Regressioni UI
✅ 100% Feature funzionanti

Status: 🚀 READY FOR PRODUCTION
```

---

## 📝 NOTE PER IL TESTER

### **Cosa guardare con attenzione**

1. **Timing**: LiveTicker deve aggiornarsi in real-time (< 200ms delay)
2. **Animazioni**: Smooth, no jank (60fps)
3. **i18n**: Tutti i label in italiano, stile Johnny Ive (infinito)
4. **Consistency**: Icons, colors, spacing uniformi
5. **Feedback**: User sempre sa cosa sta succedendo
6. **Errors**: Messaggi chiari, recovery actions presenti

### **Common Issues**

❌ **LiveTicker non appare**
→ Check: SSE connection attiva, EventBus emitting events

❌ **Status badge wrong color**
→ Check: Status mapping in MessageItem

❌ **Filtri non funzionano**
→ Check: useOsSidecar state updates

❌ **Ticker non collassa**
→ Check: plan_completed event ricevuto, 500ms timeout

❌ **Mobile layout broken**
→ Check: viewport meta tag, CSS breakpoints

---

**Script Version**: 1.0  
**Last Updated**: 16 Gennaio 2025  
**Estimated Time**: 5 minuti  
**Success Rate Target**: 100% ✅

