# Guida Utente SAL - Vendor/Subcontractor

## Panoramica

Questa guida spiega come gestire i SAL (Subcontractor Agreement Letter) ricevuti come vendor/subcontractor, inclusi la firma digitale e il monitoraggio dei pagamenti.

## Prerequisiti

- Email valida per ricevere i SAL
- Accesso a un browser web moderno
- Certificazioni aggiornate nel sistema Doc Hunter

## Ricezione SAL

### 1. Notifica Email

Quando un Project Manager crea un SAL per te:

1. **Ricevi un'email** da `noreply@urbanova.com`
2. **Oggetto**: `SAL #[numero] - [Titolo] - Richiesta Firma`
3. **Contenuto**: Dettagli del SAL e link per la firma

### 2. Dettagli Email

L'email contiene:

- **Numero SAL**: Identificativo univoco
- **Progetto**: Nome e descrizione del progetto
- **Importo totale**: Valore del contratto
- **Scadenza**: Data limite per la firma (7 giorni)
- **Link di firma**: Collegamento sicuro per accedere al SAL

## Firma del SAL

### 1. Accesso alla Pagina di Firma

1. **Clicca sul link** nell'email ricevuta
2. **Verifica l'URL**: Deve essere `https://urbanova.vercel.app/sal/sign?token=...`
3. **Accedi alla pagina** di firma del SAL

### 2. Verifica Dettagli

Prima di firmare, controlla:

- **Titolo e descrizione** del lavoro
- **Righe tecniche** e specifiche
- **Importi** per ogni voce
- **Termini** di pagamento
- **Condizioni** speciali
- **Scadenza** del contratto

### 3. Processo di Firma

#### Passo 1: Compila i Campi

- **Nome completo**: Il tuo nome legale
- **Ruolo**: Seleziona "VENDOR"
- **Verifica dati**: Controlla che tutto sia corretto

#### Passo 2: Conferma Firma

- **Leggi attentamente** tutti i termini
- **Accetta le condizioni** cliccando su "Firma SAL"
- **Conferma l'azione** nel popup di sicurezza

#### Passo 3: Completamento

- **Ricevi conferma** della firma completata
- **Il SAL passa** in stato "SIGNED_VENDOR"
- **Ricevi notifica** via email

## Monitoraggio Stato

### 1. Stati del SAL

- **SENT**: SAL inviato, in attesa della tua firma
- **SIGNED_VENDOR**: Hai firmato, in attesa firma PM
- **SIGNED_PM**: PM ha firmato, in attesa pagamento
- **READY_TO_PAY**: Pronto per il pagamento
- **PAID**: Pagamento completato

### 2. Controllo Stato

#### Via Email

- Ricevi notifiche automatiche per ogni cambio di stato
- Controlla la cartella spam se non ricevi email

#### Via Dashboard (se hai accesso)

- Accedi al dashboard Urbanova
- Vai alla sezione "I Miei SAL"
- Visualizza lo stato di tutti i tuoi SAL

## Gestione Certificazioni

### 1. Importanza delle Certificazioni

Le certificazioni sono **obbligatorie** per ricevere i pagamenti:

- **Certificazioni di sicurezza**
- **Abilitazioni tecniche**
- **Assicurazioni professionali**
- **Documenti fiscali**

### 2. Verifica Certificazioni

Il sistema Doc Hunter verifica automaticamente:

- **Validità** delle certificazioni
- **Scadenze** imminenti
- **Completezza** della documentazione
- **Conformità** ai requisiti

### 3. Aggiornamento Certificazioni

Se le certificazioni non sono valide:

1. **Ricevi notifica** via email
2. **Aggiorna i documenti** nel sistema Doc Hunter
3. **Contatta il supporto** se hai problemi
4. **Attendi la verifica** automatica

## Pagamenti

### 1. Processo di Pagamento

1. **PM firma il SAL** → Stato "READY_TO_PAY"
2. **Sistema verifica** le tue certificazioni
3. **Se valide**: Pagamento processato automaticamente
4. **Se non valide**: Pagamento bloccato, notifica inviata

### 2. Ricevute di Pagamento

Quando il pagamento è completato:

- **Ricevi email** di conferma
- **Ricevuta PDF** generata automaticamente
- **Documento salvato** su Google Cloud Storage
- **Link alla ricevuta** disponibile nel sistema

### 3. Tempi di Pagamento

- **Pagamento automatico**: Entro 24 ore dalla firma PM
- **Verifica certificazioni**: Tempo variabile (1-48 ore)
- **Notifiche**: Immediate per ogni cambio di stato

## Gestione Errori

### 1. Problemi Comuni

#### Link di Firma Non Funziona

- **Causa**: Token scaduto o non valido
- **Soluzione**: Contatta il PM per un nuovo link

#### Pagamento Bloccato

- **Causa**: Certificazioni non valide
- **Soluzione**: Aggiorna le certificazioni nel sistema

#### Email Non Ricevute

- **Causa**: Filtri spam o email errata
- **Soluzione**: Controlla spam e verifica indirizzo email

### 2. Contatti Supporto

- **Email**: vendor-support@urbanova.com
- **Telefono**: +39 02 1234 5678
- **Chat**: Disponibile nel dashboard (se hai accesso)
- **Orari**: Lun-Ven 9:00-18:00 CET

## Sicurezza

### 1. Protezione Dati

- **Link di firma** sono univoci e sicuri
- **Token scadono** automaticamente dopo 7 giorni
- **Firma digitale** è legalmente valida
- **Dati crittografati** in transito e a riposo

### 2. Best Practices

- **Non condividere** i link di firma
- **Verifica sempre** l'URL prima di firmare
- **Controlla i dettagli** prima della conferma
- **Mantieni aggiornate** le credenziali di accesso

## FAQ

### Domande Frequenti

#### Q: Posso firmare un SAL da mobile?

**R**: Sì, la pagina di firma è completamente responsive e funziona su tutti i dispositivi.

#### Q: Cosa succede se non firmo entro la scadenza?

**R**: Il link di firma scade e devi richiedere un nuovo link al PM.

#### Q: Posso annullare una firma già effettuata?

**R**: No, la firma è legalmente vincolante. Contatta il PM per modifiche.

#### Q: Come ricevo i pagamenti?

**R**: I pagamenti sono processati automaticamente dal sistema e le ricevute sono inviate via email.

#### Q: Le certificazioni sono obbligatorie?

**R**: Sì, sono obbligatorie per ricevere i pagamenti e garantire la compliance.

## Aggiornamenti

### 1. Notifiche di Sistema

- **Nuove funzionalità** sono comunicate via email
- **Mantenimenti** sono programmati in orari di minor traffico
- **Aggiornamenti** non interrompono i SAL in corso

### 2. Feedback

- **Invia suggerimenti** via email a feedback@urbanova.com
- **Segnala problemi** al supporto tecnico
- **Partecipa ai test** delle nuove funzionalità

---

**Ultimo aggiornamento**: Gennaio 2025  
**Versione**: 1.0  
**Autore**: Team Urbanova  
**Supporto**: vendor-support@urbanova.com
