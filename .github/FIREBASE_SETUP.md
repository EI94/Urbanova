# Configurazione Firebase per GitHub Actions

## Problema Risolto

Il deploy Firebase falliva con l'errore:
```
Error: Failed to authenticate, have you run firebase login?
```

## Soluzione Implementata

### 1. Corretto Progetto Firebase
- **Prima**: `urbanova-staging` (inesistente)
- **Dopo**: `urbanova-b623e` (progetto corretto)

### 2. Migliorata Gestione Service Account
- Validazione completa del secret `FIREBASE_SERVICE_ACCOUNT_KEY`
- Verifica esistenza e validità JSON del file service account
- Controlli di autenticazione Firebase prima del deploy

### 3. Validazione File Configurazione
- Verifica esistenza `firestore.rules`
- Verifica esistenza `firestore.indexes.json`
- Verifica esistenza `firebase.json`

## Configurazione Richiesta

### Secret GitHub Actions
Devi configurare il secret `FIREBASE_SERVICE_ACCOUNT_KEY` nel repository GitHub:

1. Vai su GitHub → Settings → Secrets and variables → Actions
2. Clicca "New repository secret"
3. Nome: `FIREBASE_SERVICE_ACCOUNT_KEY`
4. Valore: Il contenuto completo del file JSON del service account Firebase

### Come Ottenere il Service Account Key

1. Vai su [Firebase Console](https://console.firebase.google.com/)
2. Seleziona il progetto `urbanova-b623e`
3. Vai su Project Settings → Service Accounts
4. Clicca "Generate new private key"
5. Scarica il file JSON
6. Copia tutto il contenuto del file JSON nel secret GitHub

### Esempio Service Account Key
```json
{
  "type": "service_account",
  "project_id": "urbanova-b623e",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-...@urbanova-b623e.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

## Workflow Aggiornato

Il workflow `.github/workflows/firestore-ci.yml` ora include:

- ✅ Validazione service account
- ✅ Verifica autenticazione Firebase
- ✅ Controllo accessibilità progetto
- ✅ Validazione file configurazione
- ✅ Deploy con gestione errori robusta

## Test

Dopo aver configurato il secret, il workflow dovrebbe funzionare correttamente e deployare le regole Firestore senza errori.
