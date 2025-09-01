# Urbanova OS

Sistema operativo basato su capability tipizzate per Urbanova.

## 🎯 Panoramica

Urbanova OS è un sistema operativo che permette di eseguire azioni tipizzate (capability) attraverso comandi naturali o slash commands. Il sistema classifica automaticamente le richieste in:

- **ACTION**: Esecuzione di capability specifiche
- **QNA**: Risposte a domande sui progetti

## 🏗️ Architettura

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Planner   │───▶│   Router    │───▶│ Capability  │
│             │    │             │    │  Registry   │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   QNA       │    │  Capability │    │  QNA        │
│  Service    │    │  Execution  │    │  Service    │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 🚀 Come Aggiungere una Capability

### 1. Crea la Capability

```typescript
// src/capabilities/myCapability.ts
import { z } from 'zod';
import { Capability, CapabilityContext } from '@urbanova/types';

// Schema argomenti con Zod
const zMyCapabilityArgs = z.object({
  projectId: z.string().min(1),
  action: z.enum(['start', 'stop', 'restart']),
  force: z.boolean().optional().default(false),
});

// Definizione capability
export const myCapability: Capability = {
  spec: {
    name: 'project.control',
    description: 'Controlla lo stato di un progetto',
    zArgs: zMyCapabilityArgs,
    requiredRole: 'pm',
    confirm: true, // Richiede conferma
    dryRun: true, // Supporta dry-run
  },

  handler: async (
    ctx: CapabilityContext,
    args: z.infer<typeof zMyCapabilityArgs>
  ): Promise<any> => {
    const { projectId, action, force } = args;

    ctx.logger.info(`[ProjectControl] Esecuzione ${action} per progetto ${projectId}`);

    // Logica della capability
    const result = await executeProjectAction(projectId, action, force);

    return {
      success: true,
      projectId,
      action,
      result,
      timestamp: new Date(),
    };
  },
};

// Export types
export type MyCapabilityArgs = z.infer<typeof zMyCapabilityArgs>;
```

### 2. Registra la Capability

```typescript
// src/capabilities/index.ts
export { myCapability } from './myCapability';

// src/index.ts
import { myCapability } from './capabilities';
import { capabilityRegistry } from './registry';

// Registra automaticamente
capabilityRegistry.register(myCapability);
```

### 3. Usa la Capability

```typescript
// Comando slash
'/project.control projectId:ABC123 action:start force:true';

// Linguaggio naturale
"Avvia il progetto ABC123 forzando l'operazione";
```

## 🔧 Configurazione

### Ruoli Supportati

- `owner`: Proprietario del progetto
- `pm`: Project Manager
- `sales`: Venditore
- `vendor`: Fornitore

### Opzioni Capability

- `confirm`: Richiede conferma utente
- `dryRun`: Supporta modalità test
- `requiredRole`: Ruolo minimo richiesto

## 📝 Esempi di Utilizzo

### Echo Capability (Esempio)

```typescript
// Registra
capabilityRegistry.register(echoCapability);

// Usa
('/echo text:ciao repeat:3');
// Output: "ciao ciao ciao"
```

### QNA

```typescript
// Domanda
"Com'è messo il Progetto A sulla documentazione?"

// Risposta automatica con citazioni
{
  answer: "Il progetto ha 3 documenti principali...",
  citations: [
    { title: "Documentazione Progetto", docId: "doc1" }
  ]
}
```

## 🧪 Testing

```bash
# Test unitari
npm test

# Test specifici
npm test -- --testNamePattern="CapabilityRegistry"

# Build
npm run build

# Type check
npm run typecheck
```

## 🔗 Integrazione

### Con ChatOps

```typescript
import { urbanovaOS } from '@urbanova/os';

// Nel webhook WhatsApp
const result = await urbanovaOS.execute(message, {
  userId: 'user123',
  sender: 'whatsapp:+1234567890',
  projectId: 'project456',
  now: new Date(),
  logger: console,
  db: firestore,
});
```

### Con API

```typescript
// POST /api/os/execute
{
  "text": "/echo text:ciao",
  "context": {
    "userId": "user123",
    "projectId": "project456"
  }
}
```

## 📚 Struttura File

```
packages/os/
├── src/
│   ├── capabilities/     # Capability implementations
│   ├── __tests__/        # Test files
│   ├── registry.ts       # Capability registry
│   ├── planner.ts        # Text classification
│   ├── router.ts         # Execution routing
│   ├── qna.ts           # QNA service
│   └── index.ts         # Main exports
├── package.json
├── tsconfig.json
└── README.md
```

## 🎯 Roadmap

- [ ] Vector store per RAG avanzato
- [ ] Machine learning per classificazione
- [ ] Workflow automation
- [ ] Plugin system
- [ ] Audit trail completo
- [ ] Performance monitoring

## 🤝 Contribuire

1. Crea una nuova capability seguendo il pattern esistente
2. Aggiungi test completi
3. Aggiorna la documentazione
4. Verifica che tutti i test passino
5. Submit PR con descrizione chiara

## 📄 Licenza

Parte del progetto Urbanova - Tutti i diritti riservati.
