# 🚨 Sistema di Monitoraggio e Hard-Guards Urbanova

## 📋 Panoramica

Questo documento descrive il sistema completo di monitoraggio, logging strutturato, alert Slack e hard-guards per produzione implementato in Urbanova.

## 🏗️ Architettura del Sistema

### **Componenti Principali**
1. **Structured Logger** (`packages/infra/src/log.ts`)
2. **Slack Alerts** (`src/app/api/internal/alerts/route.ts`)
3. **Hard Guards** (`packages/infra/src/guards.ts`)
4. **Audit System** (`packages/infra/src/audit.ts`)
5. **Middleware** (`src/middleware.ts`)

## 📊 TASK A: Structured Logger

### **Funzionalità**
- **Logging strutturato** con Zod validation
- **Supporto contestuale** per userId, projectId, sessionId, toolRunId
- **Integrazione Slack** per alert critici
- **Audit trail** per compliance
- **Performance metrics** e memory usage

### **Utilizzo**
```typescript
import { logger, createContextLogger } from '@urbanova/infra';

// Logging base
logger.info('Operazione completata', {
  userId: 'user-123',
  projectId: 'project-456',
  duration: 1500,
});

// Logger con contesto
const apiLogger = createContextLogger({
  route: '/api/tools/run',
  method: 'POST',
  requestId: 'req-123',
});

apiLogger.info('Tool eseguito con successo', {
  toolRunId: 'run-789',
  statusCode: 200,
});
```

### **Livelli di Log**
- `debug`: Informazioni dettagliate per debugging
- `info`: Informazioni generali
- `warn`: Avvisi e situazioni anomale
- `error`: Errori che non bloccano l'applicazione
- `fatal`: Errori critici che bloccano l'applicazione

## 🚨 TASK B: Slack Alerts

### **Funzionalità**
- **Aggregazione errori 5xx** in batch
- **Rate limiting** per evitare spam
- **Alert intelligenti** con contesto dettagliato
- **Statistiche** su errori e performance

### **Configurazione**
```bash
# Variabile d'ambiente richiesta
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

### **Endpoint**
- **POST** `/api/internal/alerts` - Registra errore 5xx
- **GET** `/api/internal/alerts` - Statistiche alert

### **Esempio Alert Slack**
```json
{
  "text": "⚠️ Urbanova ERROR Alert",
  "attachments": [
    {
      "color": "#ff6600",
      "fields": [
        {
          "title": "Message",
          "value": "Database connection failed",
          "short": false
        },
        {
          "title": "Environment",
          "value": "production",
          "short": true
        },
        {
          "title": "Route",
          "value": "/api/tools/run",
          "short": true
        }
      ]
    }
  ]
}
```

## 🛡️ TASK C: Hard-Guards per Produzione

### **Funzionalità**
- **Conferma obbligatoria** per azioni con side-effect esterni
- **Kill switch** per tool specifici
- **Rate limiting** per IP e sender
- **Validazione ambiente** produzione

### **Configurazione**
```bash
# Hard confirmation per azioni esterne
PRODUCTION_HARD_CONFIRM=true

# Kill switch per tool
KILL_SWITCH_SCRAPERS=false
KILL_SWITCH_EMAIL=false
KILL_SWITCH_WHATSAPP=false
KILL_SWITCH_STRIPE=false

# Rate limiting
RATE_LIMIT_PER_IP=100
RATE_LIMIT_PER_SENDER=50
```

### **Utilizzo**
```typescript
import { guards, withGuards } from '@urbanova/infra';

// Validazione azione
const validation = guards.validateAction({
  actionType: 'scraper',
  userId: 'user-123',
  projectId: 'project-456',
  ipAddress: '192.168.1.1',
});

if (!validation.allowed) {
  throw new Error(validation.reason);
}

// Wrapper per azioni
await withGuards('scraper', context, async () => {
  // Azione con side-effect esterno
  return await executeScraper();
});
```

### **Tipi di Azioni**
- `scraper`: Tool di scraping
- `email`: Invio email
- `whatsapp`: Invio WhatsApp
- `stripe`: Pagamenti
- `database`: Operazioni database
- `file_upload`: Upload file
- `external_api`: Chiamate API esterne
- `webhook`: Webhook outbound

## 📊 TASK D: Audit System

### **Funzionalità**
- **Tracciamento eventi critici** con Zod validation
- **Audit trail** per compliance
- **Salvataggio su database** per errori 5xx
- **Integrazione logging** strutturato

### **Utilizzo**
```typescript
import { audit } from '@urbanova/infra';

// Audit errore 5xx
await audit.auditError5xx(
  '/api/tools/run',
  'POST',
  500,
  error,
  {
    userId: 'user-123',
    projectId: 'project-456',
    requestId: 'req-789',
    ipAddress: '192.168.1.1',
  }
);

// Audit azione utente
await audit.auditUserAction('tool_execution', {
  userId: 'user-123',
  projectId: 'project-456',
  details: { toolName: 'scraper', success: true },
});

// Audit evento sicurezza
await audit.auditSecurityEvent('rate_limit_exceeded', {
  ipAddress: '192.168.1.1',
  route: '/api/tools/run',
  details: { attempts: 150, limit: 100 },
});
```

## 🔧 Middleware

### **Funzionalità**
- **Intercetta tutte le richieste API**
- **Cattura errori 5xx** e invia alert
- **Rate limiting** per IP
- **Logging strutturato** delle richieste

### **Configurazione**
```typescript
// src/middleware.ts
export const config = {
  matcher: [
    '/api/:path*',
    '/((?!api/health|api/internal/alerts).*)',
  ],
};
```

## 🧪 Testing

### **Endpoint di Test**
```bash
# Test completo del sistema
GET /api/test/system?type=all

# Test specifici
GET /api/test/system?type=logging
GET /api/test/system?type=guards
GET /api/test/system?type=audit
GET /api/test/system?type=rate-limit

# Test errore 5xx (simula alert Slack)
GET /api/test/system?type=error
```

### **Esempio Risposta**
```json
{
  "success": true,
  "message": "Test sistema completato",
  "results": {
    "logging": {
      "success": true,
      "message": "Logging test completato"
    },
    "guards": {
      "success": true,
      "allowed": true,
      "requiresConfirmation": false,
      "isProduction": false
    },
    "audit": {
      "success": true,
      "message": "Audit test completato"
    }
  }
}
```

## 📈 Monitoraggio

### **Health Check**
```bash
# Verifica variabili d'ambiente
GET /api/health/env

# Statistiche alert
GET /api/internal/alerts
```

### **Metriche Disponibili**
- **Errori 5xx** per route e IP
- **Rate limiting** per IP e sender
- **Performance** delle API
- **Utilizzo memoria** e CPU
- **Audit events** per compliance

## 🚀 Deployment

### **Variabili d'Ambiente**
```bash
# Logging
LOG_LEVEL=info

# Slack Alerts
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Hard Guards
PRODUCTION_HARD_CONFIRM=true
KILL_SWITCH_SCRAPERS=false

# Rate Limiting
RATE_LIMIT_PER_IP=100
RATE_LIMIT_PER_SENDER=50
```

### **Vercel Configuration**
```json
{
  "functions": {
    "app/api/**/route.js": { 
      "memory": 1024, 
      "maxDuration": 30 
    }
  }
}
```

## 🔒 Sicurezza

### **Best Practices**
1. **Mai loggare** dati sensibili (password, token)
2. **Rate limiting** aggressivo per IP sospetti
3. **Kill switch** per tool critici
4. **Audit trail** completo per compliance
5. **Alert immediati** per errori critici

### **Compliance**
- **GDPR**: Audit trail per accesso dati
- **SOC2**: Logging e monitoring
- **ISO27001**: Gestione incidenti

## 🆘 Troubleshooting

### **Problemi Comuni**

#### 1. Alert Slack non funzionano
```bash
# Verifica webhook URL
curl -X POST $SLACK_WEBHOOK_URL -d '{"text":"Test"}'

# Controlla rate limiting
GET /api/internal/alerts
```

#### 2. Hard-guards bloccano azioni
```bash
# Verifica configurazione
PRODUCTION_HARD_CONFIRM=false

# Controlla kill switch
KILL_SWITCH_SCRAPERS=false
```

#### 3. Rate limiting troppo aggressivo
```bash
# Aumenta limiti
RATE_LIMIT_PER_IP=200
RATE_LIMIT_PER_SENDER=100
```

### **Debug**
```bash
# Test sistema completo
GET /api/test/system?type=all

# Verifica health check
GET /api/health/env

# Controlla log
tail -f logs/application.log
```

## 📚 Riferimenti

- **[ENV_EXAMPLE.md](./ENV_EXAMPLE.md)**: Configurazione variabili d'ambiente
- **[CRON_SETUP.md](./CRON_SETUP.md)**: Configurazione cron job e webhook
- **[packages/infra/src/](./packages/infra/src/)**: Codice sorgente del sistema
- **[src/middleware.ts](./src/middleware.ts)**: Middleware per intercettazione richieste

## 🎯 Acceptance Criteria

### ✅ Completati
- **Structured Logger**: Logging con Zod validation e contesto
- **Slack Alerts**: Aggregazione errori 5xx con rate limiting
- **Hard-Guards**: Conferma obbligatoria per azioni esterne
- **Audit System**: Tracciamento eventi critici
- **Middleware**: Intercettazione e logging richieste
- **Testing**: Endpoint di test per verifica sistema

### 🚀 Pronto per Produzione
Il sistema è completamente configurato e testato per:
- **Fail-fast** in produzione se variabili richieste mancanti
- **Alert Slack** per errori 5xx con aggregazione intelligente
- **Hard-guards** per azioni con side-effect esterni
- **Audit trail** completo per compliance
- **Rate limiting** per protezione da abusi
- **Monitoring** completo con health check
