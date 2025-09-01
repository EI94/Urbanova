# 🔒 Firestore Security Rules & Migration - Urbanova

## **📋 Panoramica**

Questo documento descrive le regole di sicurezza Firestore, gli indici e il sistema di migrazione per il progetto Urbanova.

## **🛡️ Regole di Sicurezza (firestore.rules)**

### **Principi di Sicurezza**

1. **Default Deny** - Tutto è negato per default
2. **Principio del minimo privilegio** - Solo i permessi necessari
3. **Autenticazione obbligatoria** - Tutte le operazioni richiedono auth
4. **RBAC (Role-Based Access Control)** - Controllo accessi basato su ruoli
5. **Server-only writes** - Operazioni critiche solo dal server

### **Collezioni e Permessi**

#### **Users Collection**
- **Lettura/Scrittura**: Solo owner del profilo
- **Eccezione**: Admin possono leggere tutti i profili per supporto

#### **Projects Collection**
- **Lettura**: Membri del progetto
- **Scrittura**: Owner o Project Manager
- **Eccezione**: Admin accesso completo

#### **Tool Runs & Audit Events**
- **Lettura**: Owner del progetto o Project Manager
- **Scrittura**: Solo server (App Check o service account)
- **Eccezione**: Admin possono leggere tutto

#### **Documents Collection**
- **Accesso**: Negato per default
- **Sicurezza**: Gestita via JWT-signed URLs + Cloud Storage

#### **Leads, Conversations, Messages**
- **Accesso**: Membri dell'organizzazione
- **Eliminazione**: Solo admin o owner

### **Funzioni Utility**

```javascript
// Verifica autenticazione
function isAuthenticated() {
  return request.auth != null;
}

// Verifica ownership
function isOwner(userId) {
  return isAuthenticated() && request.auth.uid == userId;
}

// Verifica membro progetto
function isProjectMember(projectId) {
  return isAuthenticated() && 
         exists(/databases/$(database)/documents/projects/$(projectId)/members/$(request.auth.uid));
}

// Verifica server request
function isServerRequest() {
  return request.auth != null && 
         (request.auth.token.firebase.sign_in_provider == 'service_account' ||
          request.auth.token.app_check == true);
}
```

## **🔍 Indici Firestore (firestore.indexes.json)**

### **Indici Principali**

#### **Tool Runs**
- `projectId + createdAt DESC` - Query per progetto
- `userId + createdAt DESC` - Query per utente
- `status + createdAt DESC` - Query per stato

#### **Deals**
- `city + createdAt DESC` - Query per città
- `organizationId + status + createdAt DESC` - Query per org e stato

#### **Leads**
- `status + createdAt DESC` - Query per stato
- `organizationId + status + createdAt DESC` - Query per org e stato
- `source + createdAt DESC` - Query per fonte

#### **Conversations & Messages**
- `organizationId + status + updatedAt DESC` - Query per org e stato
- `leadId + createdAt DESC` - Query per lead
- `conversationId + createdAt ASC` - Messaggi ordinati

#### **Projects**
- `organizationId + status + createdAt DESC` - Query per org e stato
- `ownerId + createdAt DESC` - Query per owner

#### **Audit Events**
- `projectId + timestamp DESC` - Query per progetto
- `level + timestamp DESC` - Query per livello
- `userId + timestamp DESC` - Query per utente

## **🚀 Sistema di Migrazione**

### **Comandi Disponibili**

```bash
# Simula migrazione senza applicare modifiche
npm run migrate:dry-run

# Applica migrazione
npm run migrate:apply

# Valida regole e indici
npm run migrate:validate
```

### **Funzionalità**

1. **Dry Run** - Simula tutte le operazioni
2. **Validazione** - Verifica regole e indici
3. **Creazione Collezioni** - Crea strutture iniziali
4. **Versioning Schema** - Traccia versioni schema
5. **Connessione** - Verifica connessione Firestore

### **Configurazione Collezioni**

```typescript
const COLLECTIONS_CONFIG = [
  {
    name: 'users',
    fields: [
      { name: 'email', type: 'string', required: true },
      { name: 'role', type: 'string', required: true, defaultValue: 'user' },
      { name: 'createdAt', type: 'timestamp', required: true }
    ]
  }
  // ... altre collezioni
];
```

## **🔧 Configurazione Firebase**

### **firebase.json**
```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "emulators": {
    "auth": { "port": 9099 },
    "firestore": { "port": 8080 },
    "storage": { "port": 9199 },
    "ui": { "enabled": true, "port": 4000 }
  }
}
```

### **.firebaserc**
```json
{
  "projects": {
    "default": "urbanova-dev",
    "staging": "urbanova-staging",
    "production": "urbanova-production"
  }
}
```

## **⚡ CI/CD Pipeline**

### **Workflow GitHub Actions**

Il workflow `firestore-ci.yml` si attiva su:
- Push su `main` o `develop`
- Pull Request su `main` o `develop`
- Modifiche a file Firestore

### **Step di Validazione**

1. **Checkout** del codice
2. **Setup** Node.js e dipendenze
3. **Installazione** Firebase CLI
4. **Validazione** regole Firestore
5. **Validazione** indici Firestore
6. **Verifica** sincronizzazione rules/indexes
7. **Dry Run** migrazione
8. **Validazione** migrazione
9. **Test Build** dell'applicazione

### **Comandi CI**

```bash
# Validazione regole
firebase firestore:rules:validate

# Validazione indici
firebase firestore:indexes:validate

# Verifica sincronizzazione
npm run migrate:validate

# Dry run migrazione
npm run migrate:dry-run
```

## **🧪 Testing e Validazione**

### **Emulatore Locale**

```bash
# Avvia emulatori
firebase emulators:start

# UI emulatore
http://localhost:4000
```

### **Validazione Regole**

```bash
# Validazione sintassi
firebase firestore:rules:validate

# Test con emulatore
firebase emulators:exec --only firestore "npm run migrate:dry-run"
```

### **Validazione Indici**

```bash
# Validazione sintassi
firebase firestore:indexes:validate

# Deploy indici
firebase deploy --only firestore:indexes
```

## **📊 Monitoraggio e Debug**

### **Log di Migrazione**

```bash
# Log dettagliato
DEBUG=* npm run migrate:dry-run

# Solo errori
npm run migrate:dry-run 2>&1 | grep -i error
```

### **Verifica Schema**

```bash
# Controlla versione schema
firebase firestore:get _schema/version

# Lista collezioni
firebase firestore:collections
```

## **🔒 Best Practices di Sicurezza**

### **Regole Generali**

1. **Sempre specificare `rules_version = '2'`**
2. **Usare funzioni per logica riutilizzabile**
3. **Validare input con `request.resource.data`**
4. **Limitare accesso con `exists()` e `get()`**
5. **Usare `resource.data` per dati esistenti**

### **Pattern Sicuri**

```javascript
// ✅ Buono: Verifica esistenza prima di get()
function isProjectMember(projectId) {
  return isAuthenticated() && 
         exists(/databases/$(database)/documents/projects/$(projectId)/members/$(request.auth.uid));
}

// ❌ Cattivo: Get diretto senza verifica
function isProjectMember(projectId) {
  return isAuthenticated() && 
         get(/databases/$(database)/documents/projects/$(projectId)/members/$(request.auth.uid)).data.role == 'member';
}
```

### **Gestione Errori**

```javascript
// Gestione errori nelle regole
match /documents/{documentId} {
  allow read: if isAuthenticated() && 
               (isOwner(resource.data.ownerId) || 
                isProjectMember(resource.data.projectId) ||
                hasAdminRole());
}
```

## **🚨 Troubleshooting**

### **Errori Comuni**

#### **"Missing or insufficient permissions"**
- Verifica autenticazione utente
- Controlla regole per la collezione
- Verifica ruoli e permessi

#### **"Index not found"**
- Controlla `firestore.indexes.json`
- Verifica sintassi JSON
- Deploy indici con `firebase deploy --only firestore:indexes`

#### **"Rules validation failed"**
- Controlla sintassi `firestore.rules`
- Verifica `rules_version = '2'`
- Controlla funzioni e match patterns

### **Debug Regole**

```bash
# Log dettagliato emulatore
firebase emulators:start --only firestore --inspect-functions

# Test regole specifiche
firebase firestore:rules:validate --project=urbanova-dev
```

## **📚 Risorse Aggiuntive**

- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore Indexes Documentation](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Firestore Emulator](https://firebase.google.com/docs/emulator-suite/install_and_configure)

## **🎯 Prossimi Passi**

1. **Test emulatore** - Verifica regole localmente
2. **Deploy staging** - Test in ambiente staging
3. **Validazione CI** - Verifica pipeline CI/CD
4. **Monitoraggio** - Controlla log e performance
5. **Ottimizzazione** - Affina regole e indici

---

**⚠️ IMPORTANTE**: Le regole di sicurezza sono critiche per la protezione dei dati. Testa sempre in emulatore prima del deploy in produzione.
