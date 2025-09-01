# SAL API Reference - Urbanova

## Panoramica

Il sistema SAL (Subcontractor Agreement Letter) gestisce il flusso completo di creazione, firma e pagamento delle lettere di accordo con i subcontractor. Il sistema implementa un workflow a stati finiti (FSM) con verifica delle certificazioni e integrazione Stripe per i pagamenti.

## Workflow Stati

```
DRAFT → SENT → SIGNED_VENDOR → SIGNED_PM → READY_TO_PAY → PAID
```

### Descrizione Stati

- **DRAFT**: SAL creato ma non ancora inviato
- **SENT**: SAL inviato al vendor per la firma
- **SIGNED_VENDOR**: Firma del vendor completata
- **SIGNED_PM**: Firma del Project Manager completata
- **READY_TO_PAY**: Pronto per il pagamento
- **PAID**: Pagamento completato

## Endpoints API

### 1. Creazione SAL

**POST** `/api/sal/create`

Crea un nuovo SAL con le specifiche tecniche e i costi.

#### Request Body

```json
{
  "projectId": "string",
  "vendorId": "string",
  "title": "string",
  "description": "string",
  "lines": [
    {
      "description": "string",
      "quantity": "number",
      "unitPrice": "number",
      "totalPrice": "number"
    }
  ],
  "terms": "string",
  "conditions": ["string"],
  "metadata": {}
}
```

#### Response

```json
{
  "success": true,
  "sal": {
    "id": "string",
    "projectId": "string",
    "vendorId": "string",
    "title": "string",
    "status": "DRAFT",
    "totalAmount": 145000,
    "currency": "EUR",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

### 2. Invio SAL

**POST** `/api/sal/send`

Invia il SAL al vendor per la firma.

#### Request Body

```json
{
  "salId": "string",
  "vendorEmail": "string",
  "message": "string (opzionale)"
}
```

#### Response

```json
{
  "success": true,
  "sal": {
    "id": "string",
    "status": "SENT",
    "sentAt": "2024-01-15T10:30:00Z"
  }
}
```

### 3. Firma SAL

**POST** `/api/sal/sign`

Firma il SAL (vendor o PM).

#### Request Body

```json
{
  "salId": "string",
  "signerId": "string",
  "signerName": "string",
  "signerRole": "VENDOR" | "PM",
  "signatureHash": "string"
}
```

#### Response

```json
{
  "success": true,
  "sal": {
    "id": "string",
    "status": "SIGNED_VENDOR" | "SIGNED_PM" | "READY_TO_PAY",
    "signatures": [...]
  }
}
```

### 4. Pagamento SAL

**POST** `/api/sal/pay`

Processa il pagamento del SAL con verifica certificazioni.

#### Request Body

```json
{
  "salId": "string",
  "paymentMethodId": "string (opzionale)"
}
```

#### Response

```json
{
  "success": true,
  "sal": {
    "id": "string",
    "status": "PAID",
    "paidAt": "2024-01-15T11:00:00Z",
    "payment": {
      "stripePaymentIntentId": "string",
      "receiptUrl": "string"
    }
  }
}
```

## Gestione Errori

### Codici di Errore Comuni

- **400**: Dati di input non validi
- **403**: Operazione non consentita (stato SAL non valido)
- **404**: SAL non trovato
- **409**: Conflitto di stato
- **500**: Errore interno del server

### Esempio Response di Errore

```json
{
  "success": false,
  "message": "Operazione non consentita",
  "errors": ["SAL deve essere in stato READY_TO_PAY per il pagamento"]
}
```

## Sicurezza

### Token di Firma

- Ogni SAL genera token di firma univoci
- Token scadono dopo 7 giorni
- Verifica automatica dei permessi di firma

### Verifica Certificazioni

- Pagamento bloccato senza certificazioni valide
- Integrazione con Doc Hunter per verifica automatica
- Controllo compliance prima del pagamento

## Integrazione Stripe

### Modalità Test

- Tutti i pagamenti sono in modalità test
- Nessun addebito reale sui conti
- Ricevute generate automaticamente

### Webhook (Futuro)

- Notifiche automatiche di stato pagamento
- Aggiornamento automatico stato SAL
- Gestione rimborsi e dispute

## Esempi di Utilizzo

### Creazione e Invio SAL

```bash
# 1. Crea SAL
curl -X POST /api/sal/create \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "proj_123",
    "vendorId": "vendor_456",
    "title": "SAL #3 - Progetto A",
    "description": "Lavori di costruzione",
    "lines": [
      {
        "description": "Fondazioni",
        "quantity": 100,
        "unitPrice": 150,
        "totalPrice": 15000
      }
    ],
    "terms": "Pagamento 30 giorni",
    "conditions": ["Certificazioni valide"]
  }'

# 2. Invia SAL
curl -X POST /api/sal/send \
  -H "Content-Type: application/json" \
  -d '{
    "salId": "sal_789",
    "vendorEmail": "vendor@example.com"
  }'
```

### Firma e Pagamento

```bash
# 3. Firma Vendor
curl -X POST /api/sal/sign \
  -H "Content-Type: application/json" \
  -d '{
    "salId": "sal_789",
    "signerId": "vendor_456",
    "signerName": "Mario Rossi",
    "signerRole": "VENDOR",
    "signatureHash": "abc123"
  }'

# 4. Firma PM
curl -X POST /api/sal/sign \
  -H "Content-Type: application/json" \
  -d '{
    "salId": "sal_789",
    "signerId": "pm_001",
    "signerName": "Giuseppe Verdi",
    "signerRole": "PM",
    "signatureHash": "def456"
  }'

# 5. Pagamento
curl -X POST /api/sal/pay \
  -H "Content-Type: application/json" \
  -d '{
    "salId": "sal_789"
  }'
```

## Supporto

Per supporto tecnico o domande:

- Email: tech@urbanova.com
- Documentazione: https://docs.urbanova.com/sal
- GitHub Issues: https://github.com/urbanova/urbanova/issues
