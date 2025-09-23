# 🔐 URBANOVA ENVIRONMENT VARIABLES

## 📋 Panoramica

Questo file contiene tutte le variabili d'ambiente necessarie per Urbanova.

**IMPORTANTE:**
- Le variabili **REQUIRED** sono obbligatorie e causeranno crash in produzione
- Le variabili **OPTIONAL** sono consigliate ma non bloccanti
- In sviluppo, le variabili opzionali mancanti mostreranno un banner informativo

## ⚠️ REQUIRED VARIABLES (CRASH IN PRODUZIONE SE MANCANTI)

### Environment & Runtime
```bash
NODE_ENV=development
```

### Firebase/Firestore
```bash
# Progetto Firebase per database e autenticazione
# Vedi: https://console.firebase.google.com/
FIREBASE_PROJECT_ID=your-urbanova-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Firebase Private Key Here\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

### Google Cloud Storage
```bash
# Bucket GCS per materiali e documenti
# Vedi: https://console.cloud.google.com/storage
GCS_BUCKET_MATERIALS=urbanova-materials-bucket
GOOGLE_CLOUD_PROJECT_ID=your-gcp-project-id
GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY="-----BEGIN PRIVATE KEY-----\nYour GCS Service Account Key Here\n-----END PRIVATE KEY-----"
```

### Twilio
```bash
# API Twilio per WhatsApp e SMS
# Vedi: https://console.twilio.com/
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### Cron Jobs
```bash
# Secret per autenticazione cron job Vercel
# Deve essere almeno 32 caratteri
CRON_SECRET=your-super-secret-cron-key-at-least-32-characters-long
```

### Document Upload
```bash
# Secret per upload documenti sicuri
# Deve essere almeno 32 caratteri
DOCUPLOAD_SECRET=your-document-upload-secret-at-least-32-characters
```

### Leads System
```bash
# Secret per webhook leads in entrata
# Deve essere almeno 32 caratteri
LEADS_INBOUND_SECRET=your-leads-inbound-secret-at-least-32-characters
```

## 🔧 OPTIONAL VARIABLES (BANNER IN SVILUPPO SE MANCANTI)

### Stripe Billing
```bash
# API Stripe per fatturazione e pagamenti
# Vedi: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_your_stripe_test_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx
```

### SendGrid
```bash
# API SendGrid per email e webhook inbound
# Vedi: https://app.sendgrid.com/settings/api_keys
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_INBOUND_SECRET=your-sendgrid-inbound-secret
LEADS_INBOUND_PUBLIC_HOST=https://your-domain.com
```

### Webhook Security
```bash
# Permette webhook non verificati (solo per sviluppo)
ALLOW_UNVERIFIED_WEBHOOKS=false
```

### Market Data
```bash
# Directory per file CSV OMI (Osservatorio Mercato Immobiliare)
OMI_CSV_DIR=/path/to/omi/csv/files
```

### Gmail API
```bash
# API Gmail per monitoraggio email e webhook
# Vedi: https://console.cloud.google.com/apis/credentials
GMAIL_CLIENT_ID=your-gmail-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-gmail-client-secret
GMAIL_REFRESH_TOKEN=your-gmail-refresh-token
```

### Portal Connectors
```bash
# Connettori per portali immobiliari esterni
PORTAL_CONNECTORS_ENABLED=false
PORTAL_CONNECTORS_HEADLESS=true
```

### App Configuration
```bash
# URL pubblici dell'applicazione
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Slack Alerts
```bash
# Webhook Slack per alert su errori 5xx
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

### Production Hard Guards
```bash
# Conferma obbligatoria per azioni esterne in produzione
PRODUCTION_HARD_CONFIRM=false

# Kill switch per tool specifici
KILL_SWITCH_SCRAPERS=false
KILL_SWITCH_EMAIL=false
KILL_SWITCH_WHATSAPP=false
KILL_SWITCH_STRIPE=false
```

### Rate Limiting
```bash
# Limiti per IP e sender
RATE_LIMIT_PER_IP=100
RATE_LIMIT_PER_SENDER=50
```

### Development & Testing
```bash
# Modalità debug e logging
DEBUG_MODE=false
LOG_LEVEL=info
```

## 🚀 DEPLOYMENT INSTRUCTIONS

### 1. Setup Locale
```bash
# Copia questo file come .env.local
cp .env.example .env.local

# Compila tutte le variabili REQUIRED
# - FIREBASE_*
# - GCS_*
# - TWILIO_*
# - CRON_SECRET
# - DOCUPLOAD_SECRET
# - LEADS_INBOUND_SECRET
```

### 2. Setup Vercel
```bash
# Aggiungi variabili d'ambiente a Vercel
vercel env add CRON_SECRET
vercel env add FIREBASE_PROJECT_ID
vercel env add FIREBASE_PRIVATE_KEY
vercel env add FIREBASE_CLIENT_EMAIL
vercel env add GCS_BUCKET_MATERIALS
vercel env add GOOGLE_CLOUD_PROJECT_ID
vercel env add GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY
vercel env add TWILIO_ACCOUNT_SID
vercel env add TWILIO_AUTH_TOKEN
vercel env add TWILIO_PHONE_NUMBER
vercel env add DOCUPLOAD_SECRET
vercel env add LEADS_INBOUND_SECRET

# Variabili opzionali
vercel env add STRIPE_SECRET_KEY
vercel env add SENDGRID_API_KEY
vercel env add GMAIL_CLIENT_ID
# ... altre variabili opzionali
```

### 3. Verifica e Deploy
```bash
# Verifica configurazione locale
npm run build

# Deploy su Vercel
vercel --prod
```

## 📚 DOCUMENTAZIONE

- **[CRON_SETUP.md](./CRON_SETUP.md)**: Configurazione cron job e webhook
- **[packages/infra/src/env.ts](./packages/infra/src/env.ts)**: Schema Zod per validazione
- **[src/components/ui/EnvironmentBanner.tsx](./src/components/ui/EnvironmentBanner.tsx)**: Banner per variabili mancanti

## 🆘 SUPPORTO

### Problemi Comuni

#### 1. Variabili REQUIRED mancanti
```bash
❌ Error: FIREBASE_PROJECT_ID è richiesto
✅ Soluzione: Aggiungi FIREBASE_PROJECT_ID al .env
```

#### 2. Formato chiavi private Firebase
```bash
❌ Errore: Chiave privata Firebase non valida
✅ Soluzione: Usa il formato corretto con \n per newline
```

#### 3. Cron job non funzionano
```bash
❌ Errore: Autenticazione cron fallita
✅ Soluzione: Verifica CRON_SECRET in Vercel
```

### Debug

#### Banner di Sviluppo
Il banner giallo in sviluppo mostra:
- Variabili opzionali mancanti
- Link alla documentazione
- Opzione per chiudere il banner

#### Log di Validazione
```bash
# In produzione
✅ Variabili d'ambiente validate con successo

# In sviluppo
⚠️  Alcune variabili d'ambiente richieste sono mancanti
```

## 🔒 SICUREZZA

### Best Practices
1. **Mai committare** file `.env` nel repository
2. **Usa segreti** per chiavi private in produzione
3. **Rotazione regolare** di token e chiavi
4. **Accesso limitato** alle variabili d'ambiente

### Validazione Zod
Tutte le variabili sono validate con Zod:
- **Tipo corretto** (string, enum, etc.)
- **Formato valido** (email, URL, etc.)
- **Lunghezza minima** per segreti
- **Valori di default** per opzionali

## 📊 MONITORAGGIO

### Health Check
```bash
# Verifica variabili richieste
curl /api/health/env

# Verifica variabili opzionali
curl /api/health/env/optional
```

### Dashboard Vercel
- **Environment Variables**: Gestione centralizzata
- **Function Logs**: Log di validazione
- **Cron Jobs**: Stato esecuzione
- **Deployments**: Configurazione per ambiente
