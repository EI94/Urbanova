# 🔥 FIREBASE SETUP - URBANOVA

## 🚨 PROBLEMI RISOLTI

### ❌ Errori Precedenti:
- `calculateCosts is not a function` - Metodi mancanti nel servizio
- Errori 400/403 Firestore - Problemi di permessi e connessione
- Regole di sicurezza non configurate

### ✅ Soluzioni Implementate:
- Aggiunti metodi `calculateCosts`, `calculateRevenues`, `calculateResults`
- Creato servizio di test per verificare connessione Firebase
- Aggiornate regole di sicurezza Firestore
- Sistema di fallback multiplo per salvataggio

## 🔧 CONFIGURAZIONE FIREBASE

### 1. Regole Firestore
Le regole sono nel file `firestore.rules`. **IMPORTANTE**: Devi deployarle su Firebase Console.

```bash
# Installa Firebase CLI se non l'hai già
npm install -g firebase-tools

# Login a Firebase
firebase login

# Inizializza progetto (se non già fatto)
firebase init firestore

# Deploy delle regole
firebase deploy --only firestore:rules
```

### 2. Regole Storage
Le regole sono nel file `storage.rules`. Deployale con:

```bash
firebase deploy --only storage
```

### 3. Configurazione Console Firebase

#### A. Abilita Servizi:
- ✅ **Authentication** - Email/Password
- ✅ **Firestore Database** - Modalità produzione
- ✅ **Storage** - Modalità produzione

#### B. Regole Firestore (Console):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // PERMESSI COMPLETI PER DEBUG - CAMBIA IN PRODUZIONE
    match /feasibilityProjects/{projectId} {
      allow read, write: if true;
    }
    
    // Altri permessi
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### C. Regole Storage (Console):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🧪 TEST CONNESSIONE

### Pulsante Test Firebase:
1. Vai su **Analisi di Fattibilità → Nuovo**
2. Clicca **🧪 Test Firebase**
3. Controlla la console per risultati dettagliati

### Test Manuale Console:
```javascript
// Apri console browser e esegui:
import { feasibilityTestService } from '@/lib/feasibilityTestService';
const results = await feasibilityTestService.runAllTests();
console.log('Risultati test:', results);
```

## 🚀 DEPLOY PRODUZIONE

### 1. Build e Deploy:
```bash
npm run build
npm start
```

### 2. Verifica Regole:
- Controlla che le regole Firestore siano attive
- Controlla che le regole Storage siano attive
- Verifica che Auth sia configurato

### 3. Test Finale:
- Crea un nuovo progetto di fattibilità
- Verifica che si salvi senza errori
- Controlla che appaia in Firestore Console

## 🔍 DEBUG PROBLEMI

### Se Continui ad Avere Errori:

#### A. Controlla Console Browser:
- Errori 400/403 = Problemi regole
- Errori di connessione = Problemi rete/Firebase
- Errori di autenticazione = Problemi Auth

#### B. Controlla Firebase Console:
- Stato servizi (verde = OK, rosso = KO)
- Regole attive
- Quota e limiti

#### C. Controlla Variabili Ambiente:
```bash
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
```

## 📋 CHECKLIST COMPLETAMENTO

- [ ] Firebase CLI installato
- [ ] Login Firebase effettuato
- [ ] Regole Firestore deployate
- [ ] Regole Storage deployate
- [ ] Servizi Firebase abilitati
- [ ] Test Firebase completato con successo
- [ ] Progetto fattibilità salvato correttamente
- [ ] Nessun errore 400/403 in console

## 🆘 SUPPORTO

Se continui ad avere problemi:

1. **Controlla la console browser** per errori dettagliati
2. **Esegui il test Firebase** e condividi i risultati
3. **Verifica le regole** su Firebase Console
4. **Controlla lo stato servizi** Firebase

## 🎯 RISULTATO FINALE

Dopo questa configurazione, dovresti vedere:
- ✅ Progetti salvati correttamente in Firestore
- ✅ Nessun errore 400/403
- ✅ Metodi di calcolo funzionanti
- ✅ Sistema di fallback attivo
- ✅ Logging completo per debug
