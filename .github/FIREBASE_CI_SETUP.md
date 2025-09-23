# 🔥 FIREBASE CI/CD SETUP - GitHub Actions

## 🚨 PROBLEMA RISOLTO

Il workflow GitHub Actions `firestore-ci.yml` ora include l'autenticazione Firebase per validare le regole Firestore.

## 🔧 CONFIGURAZIONE RICHIESTA

### 1. Creare Service Account Firebase

1. **Vai su Firebase Console**: https://console.firebase.google.com/project/urbanova-b623e
2. **Vai su Project Settings** → **Service Accounts**
3. **Clicca "Generate new private key"**
4. **Scarica il file JSON** (es. `firebase-service-account.json`)

### 2. Configurare GitHub Secret

1. **Vai su GitHub Repository** → **Settings** → **Secrets and variables** → **Actions**
2. **Clicca "New repository secret"**
3. **Nome**: `FIREBASE_SERVICE_ACCOUNT_KEY`
4. **Valore**: Copia tutto il contenuto del file JSON scaricato

### 3. Verifica Configurazione

Il workflow ora include:

```yaml
- name: Authenticate to Firebase
  uses: google-github-actions/auth@v2
  with:
    credentials_json: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_KEY }}

- name: Set up Cloud SDK
  uses: google-github-actions/setup-gcloud@v2
```

## 🧪 TEST WORKFLOW

Dopo aver configurato il secret, il workflow:

1. ✅ **Installa Firebase CLI**
2. ✅ **Autentica con service account**
3. ✅ **Valida regole Firestore** (`firestore.rules`)
4. ✅ **Valida indici Firestore** (`firestore.indexes.json`)

## 🔒 SICUREZZA

- Il service account ha **solo permessi di lettura** per validazione
- Le credenziali sono **cifrate** nei GitHub Secrets
- **Nessun deploy automatico** - solo validazione dry-run

## 📋 PERMESSI SERVICE ACCOUNT RICHIESTI

Il service account deve avere questi ruoli:
- `Firebase Rules Admin` (per validare regole)
- `Cloud Firestore User` (per validare indici)

## 🚀 RISULTATO

Una volta configurato il secret, il workflow GitHub Actions:
- ✅ Non fallirà più per autenticazione
- ✅ Validerà automaticamente le regole Firestore
- ✅ Bloccherà PR con regole invalide
- ✅ Garantirà qualità del codice Firebase
