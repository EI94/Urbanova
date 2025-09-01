# Urbanova Tool OS 🚀

**Sistema Operativo Estensibile per Tool e Integrazioni**

Urbanova Tool OS è un sistema modulare e scalabile per la gestione di tool, automazioni e integrazioni nell'ecosistema Urbanova. Fornisce un'architettura robusta per l'esecuzione di azioni complesse, la gestione dei permessi e l'integrazione con l'interfaccia chat.

## 🏗️ Architettura

### Componenti Principali

- **🔧 Registry**: Gestisce la registrazione e il discovery dei tool
- **⚡ Runner**: Esegue le azioni dei tool con gestione dello stato
- **🔒 Security**: Gestisce permessi e accessi basati su ruoli
- **💬 Chat Integration**: Integrazione nativa con l'interfaccia chat

### Struttura del Sistema

```
packages/toolos/
├── src/
│   ├── registry.ts      # Gestione tool e discovery
│   ├── runner.ts        # Esecuzione azioni e gestione stato
│   ├── security.ts      # Controllo accessi e permessi
│   ├── index.ts         # API pubblica e singleton
│   └── examples/        # Tool di esempio
├── dist/                # Codice compilato
├── __tests__/           # Test unitari e integrazione
└── package.json         # Dipendenze e configurazione
```

## 🚀 Quick Start

### Installazione

```bash
cd packages/toolos
npm install
npm run build
```

### Test

```bash
npm test                    # Test unitari
npm run test:integration    # Test di integrazione
```

### Utilizzo Base

```typescript
import { urbanovaToolOS } from '@urbanova/toolos';

// Registra un tool
urbanovaToolOS.registerTool(manifest, actions);

// Esegui un'azione
const result = await urbanovaToolOS.runAction({
  toolId: 'my-tool',
  action: 'my-action',
  args: { param: 'value' },
  context: {
    /* ... */
  },
});

// Cerca tool per intent
const tools = urbanovaToolOS.getToolsByIntent('sensitivity');
```

## 📋 Definizione Tool

### Manifest

```typescript
interface ToolManifest {
  id: string; // ID univoco del tool
  name: string; // Nome visualizzato
  version: string; // Versione semantica
  description: string; // Descrizione del tool
  category: ToolCategory; // Categoria (financial, research, etc.)
  intents: string[]; // Intent naturali per il discovery
  tags: string[]; // Tag per la ricerca
}
```

### Actions

```typescript
interface ToolActionSpec {
  name: string; // Nome dell'azione
  description: string; // Descrizione dell'azione
  zArgs: Record<string, any>; // Schema argomenti (Zod)
  requiredRole: string; // Ruolo minimo richiesto
  confirm?: boolean; // Richiede conferma utente
  longRunning?: boolean; // Esecuzione asincrona
  timeout?: number; // Timeout in millisecondi
  handler: ToolHandler; // Funzione di esecuzione
}
```

### Esempio Completo

```typescript
const feasibilityTool = {
  manifest: {
    id: 'feasibility-tool',
    name: 'Analisi Fattibilità',
    version: '1.0.0',
    description: 'Tool per analisi finanziarie e ROI',
    category: 'financial',
    intents: ['sensitivity', 'roi', 'fattibilità', 'analisi'],
    tags: ['financial', 'roi', 'sensitivity'],
  },
  actions: [
    {
      name: 'run_sensitivity',
      description: 'Esegue analisi di sensibilità',
      zArgs: { projectId: 'string', deltas: 'array' },
      requiredRole: 'pm',
      confirm: false,
      longRunning: false,
      timeout: 30000,
      handler: async (ctx, args) => {
        // Logica dell'azione
        return {
          success: true,
          data: {
            /* ... */
          },
        };
      },
    },
  ],
};
```

## 🔧 API Reference

### Registry

```typescript
// Registrazione
registerTool(manifest: ToolManifest, actions: ToolActionSpec[]): void

// Discovery
getTool(id: string): Tool | null
listTools(): Tool[]
getToolsByIntent(intent: string): Tool[]
getActionByIntent(toolId: string, intent: string): ToolActionSpec | null

// Ricerca
searchTools(criteria: SearchCriteria): Tool[]
listToolsByCategory(category: string): Tool[]

// Statistiche
getStats(): RegistryStats
```

### Runner

```typescript
// Esecuzione
runAction(request: RunActionRequest, options?: RunOptions): Promise<ToolExecutionResult>

// Gestione stato
getActiveRun(runId: string): ToolRun | null
listActiveRuns(): ToolRun[]
cancelRun(runId: string): boolean

// Statistiche
getRunStats(): RunStats
```

### Security

```typescript
// Controllo permessi
checkPermissions(action: SecurityAction, context: ToolContext): SecurityResult

// Verifica ruoli
checkRole(requiredRole: string, userRole: string): boolean
checkProjectAccess(projectId: string, context: ToolContext): boolean
checkWorkspaceAccess(workspaceId: string, context: ToolContext): boolean
```

## 💬 Chat Integration

### Intent Recognition

Il sistema riconosce automaticamente gli intent dai messaggi chat:

```typescript
// "Fai una sensitivity sul Progetto A ±5%"
const tools = urbanovaToolOS.getToolsByIntent('sensitivity');
// → Restituisce feasibility-tool

// "Calcola ROI del Progetto B"
const tools = urbanovaToolOS.getToolsByIntent('roi');
// → Restituisce feasibility-tool
```

### Esecuzione Automatica

```typescript
// Il sistema estrae automaticamente:
// - Tool ID: dal manifest
// - Action: dal nome dell'azione
// - Args: dal messaggio (projectId, deltas, etc.)
// - Context: dall'utente e sessione

const result = await urbanovaToolOS.runAction({
  toolId: 'feasibility-tool',
  action: 'run_sensitivity',
  args: { projectId: 'Progetto A', deltas: [-0.05, 0.05] },
  context: {
    /* ... */
  },
});
```

## 🔒 Sistema di Sicurezza

### Gerarchia Ruoli

```
vendor < sales < pm < owner < admin
```

### Controlli di Accesso

- **Ruolo**: Verifica che l'utente abbia il ruolo richiesto
- **Progetto**: Verifica accesso al progetto specifico
- **Workspace**: Verifica accesso al workspace
- **Conferma**: Richiede conferma per azioni critiche

### Esempio

```typescript
const securityCheck = urbanovaToolOS.checkPermissions({
  toolId: 'feasibility-tool',
  action: 'run_sensitivity',
  context: {
    userId: 'user-123',
    userRole: 'pm',
    workspaceId: 'workspace-1',
    projectId: 'proj-a',
  },
});

if (securityCheck.allowed) {
  // Esegui azione
} else {
  // Mostra errore di permessi
}
```

## 📊 Monitoring e Logging

### Statistiche Registry

```typescript
const stats = urbanovaToolOS.getRegistryStats();
// {
//   total: 5,
//   byCategory: { financial: 3, research: 2 },
//   enabled: 4,
//   disabled: 1
// }
```

### Statistiche Esecuzioni

```typescript
const runStats = urbanovaToolOS.getRunStats();
// {
//   active: 2,
//   total: 150,
//   completed: 145,
//   failed: 3,
//   averageExecutionTime: 1250
// }
```

### Logging

```typescript
const context = {
  logger: {
    info: msg => console.log(`[ToolOS] ${msg}`),
    warn: msg => console.log(`[ToolOS] WARN: ${msg}`),
    error: msg => console.log(`[ToolOS] ERROR: ${msg}`),
    debug: msg => console.log(`[ToolOS] DEBUG: ${msg}`),
  },
};
```

## 🧪 Testing

### Test Unitari

```bash
npm test
```

### Test di Integrazione

```bash
npm run test:integration
```

### Test Manuali

```bash
# Test completo
node test-urbanova-toolos-complete.js

# Test semplificato
node test-urbanova-toolos-simple.js
```

## 🚀 Deployment

### Build

```bash
npm run build
```

### Type Check

```bash
npm run typecheck
```

### Clean

```bash
npm run clean
```

## 🔗 Integrazione con Urbanova

### ChatOps

```typescript
// In packages/agents/src/chatOps.ts
import { urbanovaToolOS } from '@urbanova/toolos';

// Gestione automatica delle richieste chat
const toolResult = await this.handleToolOSRequest(command);
if (toolResult) {
  return toolResult; // Tool OS ha gestito la richiesta
}
```

### Dashboard

```typescript
// In src/app/dashboard/design-center/page.tsx
// Chatbar integrata con Urbanova Tool OS
// Riconoscimento automatico intent e esecuzione tool
```

## 📈 Roadmap

### Fase 1: Core (✅ Completato)

- [x] Registry per tool
- [x] Runner per azioni
- [x] Sistema di sicurezza base
- [x] Integrazione chat

### Fase 2: Avanzato (🔄 In Sviluppo)

- [ ] Persistenza Firestore
- [ ] Cloud Tasks per azioni lunghe
- [ ] Webhook e notifiche
- [ ] Dashboard admin

### Fase 3: Enterprise (📋 Pianificato)

- [ ] Marketplace tool
- [ ] Analytics avanzate
- [ ] Integrazione SSO
- [ ] API pubblica

## 🤝 Contribuire

### Sviluppo Locale

1. Fork del repository
2. Clone e installa dipendenze
3. Crea branch per feature
4. Implementa e testa
5. Crea Pull Request

### Struttura Tool

```bash
packages/tools/
├── my-tool/
│   ├── src/
│   │   ├── manifest.ts
│   │   ├── actions.ts
│   │   └── index.ts
│   ├── tests/
│   └── package.json
```

### Guidelines

- Segui le convenzioni TypeScript
- Aggiungi test per nuove funzionalità
- Documenta API e esempi
- Mantieni retrocompatibilità

## 📄 Licenza

MIT License - vedi [LICENSE](../../LICENSE) per dettagli.

## 🆘 Supporto

- **Documentazione**: Questo README
- **Issues**: GitHub Issues
- **Chat**: Integrato in Urbanova Dashboard
- **Email**: support@urbanova.com

---

**Urbanova Tool OS** - Potenzia il tuo ecosistema immobiliare con tool intelligenti e automazioni avanzate! 🏗️✨
