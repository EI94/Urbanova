# Guida Utente SAL - Project Manager

## Panoramica

Questa guida spiega come utilizzare il sistema SAL (Subcontractor Agreement Letter) per gestire gli accordi con i subcontractor e i relativi pagamenti.

## Prerequisiti

- Accesso al dashboard Urbanova
- Ruolo di Project Manager assegnato
- Progetto attivo nel sistema

## Flusso di Lavoro SAL

### 1. Creazione SAL

#### Passo 1: Accedi al Dashboard

1. Vai su `https://urbanova.vercel.app/dashboard`
2. Effettua il login con le tue credenziali
3. Seleziona il progetto per cui vuoi creare il SAL

#### Passo 2: Crea il SAL

1. **Via Chat**: Scrivi nel chat:
   ```
   Crea SAL #3 per Progetto A €145k e invia a Rossi
   ```
2. **Via API**: Utilizza l'endpoint `/api/sal/create`

#### Passo 3: Compila i Dettagli

- **Titolo**: Nome descrittivo del SAL
- **Descrizione**: Dettagli tecnici del lavoro
- **Righe**: Specifiche tecniche e costi
- **Termini**: Condizioni di pagamento
- **Condizioni**: Requisiti speciali

### 2. Invio SAL al Vendor

#### Passo 1: Verifica Dati

- Controlla che tutti i campi siano compilati correttamente
- Verifica che l'importo totale sia corretto
- Assicurati che i termini siano chiari

#### Passo 2: Invia SAL

1. **Via Chat**:
   ```
   Invia SAL #3 a Rossi
   ```
2. **Via API**: Utilizza l'endpoint `/api/sal/send`

#### Passo 3: Conferma Invio

- Il sistema invierà automaticamente un'email al vendor
- Il SAL passerà in stato "SENT"
- Il vendor riceverà un link per la firma

### 3. Monitoraggio Stato

#### Stati del SAL

- **DRAFT**: Creato ma non inviato
- **SENT**: Inviato al vendor
- **SIGNED_VENDOR**: Firma vendor completata
- **SIGNED_PM**: Firma PM completata
- **READY_TO_PAY**: Pronto per pagamento
- **PAID**: Pagamento completato

#### Controllo Stato

1. **Via Chat**:
   ```
   Stato SAL #3
   ```
2. **Via Dashboard**: Vai alla sezione SAL del progetto

### 4. Firma del SAL

#### Passo 1: Ricevi Notifica

- Quando il vendor firma, ricevi una notifica
- Il SAL passa in stato "SIGNED_VENDOR"

#### Passo 2: Firma PM

1. **Via Chat**:
   ```
   Firma SAL #3 come PM
   ```
2. **Via API**: Utilizza l'endpoint `/api/sal/sign`

#### Passo 3: Verifica Firma

- Il SAL passerà in stato "READY_TO_PAY"
- Ora è possibile procedere al pagamento

### 5. Gestione Pagamento

#### Passo 1: Verifica Certificazioni

- Il sistema verifica automaticamente le certificazioni del vendor
- Se mancano certificazioni, il pagamento è bloccato
- Contatta il vendor per aggiornare le certificazioni

#### Passo 2: Processa Pagamento

1. **Via Chat**:
   ```
   Paga SAL #3
   ```
2. **Via API**: Utilizza l'endpoint `/api/sal/pay`

#### Passo 3: Conferma Pagamento

- Il sistema crea un PaymentIntent Stripe
- Il SAL passa in stato "PAID"
- La ricevuta è salvata automaticamente su GCS

## Comandi Chat Disponibili

### Creazione e Gestione

- `Crea SAL #[numero] per [progetto] €[importo]k e invia a [vendor]`
- `Invia SAL #[numero] a [vendor]`
- `Stato SAL #[numero]`

### Firma e Pagamento

- `Firma SAL #[numero] come [PM|VENDOR]`
- `Paga SAL #[numero]`

### Esempi Pratici

```
Crea SAL #5 per Progetto Torre €200k e invia a Bianchi
Invia SAL #5 a Bianchi
Stato SAL #5
Firma SAL #5 come PM
Paga SAL #5
```

## Gestione Errori

### Problemi Comuni

#### SAL non può essere inviato

- **Causa**: SAL in stato non valido
- **Soluzione**: Verifica lo stato corrente e le transizioni consentite

#### Pagamento bloccato

- **Causa**: Certificazioni vendor non valide
- **Soluzione**: Contatta il vendor per aggiornare le certificazioni

#### Firma non valida

- **Causa**: Token di firma scaduto o non valido
- **Soluzione**: Genera un nuovo link di firma

### Contatti Supporto

- **Email**: support@urbanova.com
- **Chat**: Utilizza il comando "Aiuto SAL"
- **Documentazione**: https://docs.urbanova.com/sal

## Best Practices

### Creazione SAL

- Usa titoli descrittivi e chiari
- Specifica sempre i termini di pagamento
- Includi tutte le condizioni necessarie
- Verifica i calcoli degli importi

### Gestione Workflow

- Monitora regolarmente lo stato dei SAL
- Rispondi tempestivamente alle firme
- Verifica le certificazioni prima del pagamento
- Mantieni traccia di tutte le comunicazioni

### Sicurezza

- Non condividere i link di firma
- Verifica sempre l'identità del firmatario
- Controlla i dettagli prima della firma
- Mantieni aggiornate le credenziali di accesso

## Metriche e Report

### Dashboard SAL

- Numero totale di SAL per progetto
- Stato di avanzamento del workflow
- Tempi medi di firma e pagamento
- Importi totali gestiti

### Report Periodici

- SAL creati nel periodo
- SAL completati vs. in corso
- Performance dei vendor
- Analisi dei costi per progetto

## Aggiornamenti e Novità

### Versioni del Sistema

- Il sistema SAL viene aggiornato regolarmente
- Le nuove funzionalità sono comunicate via email
- La documentazione è sempre aggiornata

### Feedback e Miglioramenti

- Invia feedback via chat: "Feedback SAL"
- Partecipa ai test delle nuove funzionalità
- Suggerisci miglioramenti al workflow

---

**Ultimo aggiornamento**: Gennaio 2025  
**Versione**: 1.0  
**Autore**: Team Urbanova
