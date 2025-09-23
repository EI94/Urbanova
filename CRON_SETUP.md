# 🚀 Configurazione Cron Job e Webhook Urbanova

## 📋 Panoramica

Questo documento descrive la configurazione completa per:
- **Cron Job Vercel** per operazioni automatizzate
- **Webhook Twilio** con verifica firma HMAC
- **Scheduled Functions** per monitoraggio e manutenzione

## ⚙️ Configurazione Vercel

### vercel.json
```json
{
  "functions": {
    "app/api/**/route.js": { 
      "memory": 1024, 
      "maxDuration": 30 
    }
  },
  "crons": [
    { 
      "path": "/api/cron/watchlists-runner", 
      "schedule": "*/30 * * * *" 
    },
    { 
      "path": "/api/cron/docs-reminders", 
      "schedule": "0 * * * *" 
    },
    { 
      "path": "/api/cron/usage-aggregate", 
      "schedule": "5 0 * * *" 
    }
  ],
  "headers": [
    { 
      "source": "/(.*)", 
      "headers": [
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

## ⏰ Cron Job Schedule

### 1. Watchlists Runner - Ogni 30 minuti
- **Path**: `/api/cron/watchlists-runner`
- **Schedule**: `*/30 * * * *`
- **Funzione**: Scansione watchlist e notifiche WhatsApp

### 2. Document Reminders - Ogni ora
- **Path**: `/api/cron/docs-reminders`
- **Schedule**: `0 * * * *`
- **Funzione**: Promemoria documenti REQUESTED > 24h

### 3. Usage Aggregate - Ogni giorno alle 00:05
- **Path**: `/api/cron/usage-aggregate`
- **Schedule**: `5 0 * * *`
- **Funzione**: Riconciliazione usage con Stripe

## 🔐 Variabili d'Ambiente Richieste

```bash
# CRON JOBS
CRON_SECRET=your-super-secret-cron-key-here

# TWILIO CONFIGURATION
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# SENDGRID CONFIGURATION
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_INBOUND_SECRET=your-sendgrid-inbound-secret
LEADS_INBOUND_PUBLIC_HOST=https://your-domain.com

# GOOGLE CLOUD STORAGE
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_STORAGE_BUCKET=your-bucket-name
GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY=your-service-account-key

# FIREBASE/FIRESTORE
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email

# STRIPE BILLING
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

## 📱 Webhook Twilio

### Endpoint: `/api/wa/inbound`
- **Metodo**: POST
- **Runtime**: Node.js (non Edge)
- **Verifica**: Firma HMAC-SHA1
- **Body**: `application/x-www-form-urlencoded`

### Verifica Firma
```typescript
function verifyTwilioSignature(
  rawBody: string,
  signature: string,
  url: string,
  authToken: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha1', authToken)
    .update(Buffer.from(url + rawBody, 'utf8'))
    .digest('base64');
    
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'base64'),
    Buffer.from(expectedSignature, 'base64')
  );
}
```

## 🧪 Testing

### Test Manuale Cron Job
```bash
# Test Watchlists Runner
curl -X POST /api/cron/watchlists-runner \
  -H "Content-Type: application/json" \
  -d '{"secret": "your-cron-secret"}'

# Test Document Reminders
curl -X POST /api/cron/docs-reminders \
  -H "Content-Type: application/json" \
  -d '{"secret": "your-cron-secret"}'

# Test Usage Aggregate
curl -X POST /api/cron/usage-aggregate \
  -H "Content-Type: application/json" \
  -d '{"secret": "your-cron-secret"}'
```

### Test Webhook Twilio
```bash
# Simula webhook Twilio
curl -X POST /api/wa/inbound \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "x-twilio-signature: your-signature" \
  -d "From=+1234567890&To=+0987654321&Body=Test message"
```

## 🚀 Deployment

### 1. Configura Environment Variables
```bash
vercel env add CRON_SECRET
vercel env add TWILIO_AUTH_TOKEN
vercel env add SENDGRID_API_KEY
# ... altre variabili
```

### 2. Deploy
```bash
vercel --prod
```

### 3. Verifica Cron Job
```bash
vercel cron ls
```

## 📊 Monitoraggio

### Log Cron Job
- I cron job loggano tutti i risultati
- Durata esecuzione e statistiche
- Errori e fallimenti

### Log Webhook
- Verifica firma Twilio
- Parsing dati ricevuti
- Statistiche messaggi

## 🔒 Sicurezza

### Headers di Sicurezza
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### Autenticazione
- **Cron Job**: Bearer token con `CRON_SECRET`
- **Webhook Twilio**: Verifica firma HMAC-SHA1
- **Rate Limiting**: Configurato per Vercel

## 📝 Note Importanti

1. **Runtime Node.js**: Tutti i cron job usano `runtime: 'nodejs'`
2. **Memory**: 1024MB per tutte le API routes
3. **Timeout**: 30 secondi massimo per funzione
4. **Logging**: Tutte le operazioni sono loggate
5. **Error Handling**: Gestione robusta degli errori

## 🆘 Troubleshooting

### Cron Job non eseguiti
- Verifica `CRON_SECRET` in Vercel
- Controlla log in dashboard Vercel
- Verifica schedule cron

### Webhook Twilio fallisce
- Controlla `TWILIO_AUTH_TOKEN`
- Verifica URL webhook
- Controlla formato body

### Build fallisce
- Verifica sintassi `vercel.json`
- Controlla path cron job
- Verifica variabili d'ambiente
