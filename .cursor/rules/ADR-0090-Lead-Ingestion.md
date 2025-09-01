# ADR-0090: Lead Ingestion Sources

## Status

Accepted

## Context

Urbanova needs to ingest leads from multiple portal sources (Immobiliare.it, Idealista, Casa.it) and email channels with unified processing and real-time response capabilities.

## Decision

Implement a multi-tier lead ingestion system:

### Primary: Email Inbound (SendGrid Inbound Parse)

- **Webhook endpoint**: `/api/leads/inbound/sendgrid`
- **Dedicated email**: `leads@inbound.urbanova.*` (configurable per project)
- **Security**: Path contains random secret (`LEADS_INBOUND_SECRET`) + IP allowlist
- **Processing**: Real-time MIME parsing, attachment storage on GCS

### Secondary: Gmail API Watch (Feature Flag)

- **Condition**: `GMAIL_WATCH_ENABLED=true`
- **Method**: Gmail API watch + Pub/Sub for real-time notifications
- **Use case**: When client prefers Gmail inbox over dedicated email
- **Security**: OAuth 2.0 with service account

### Optional: Portal Connectors (ToS-Aware)

- **Condition**: `PORTAL_CONNECTORS_ENABLED=true` + written client consent
- **Method**: Headless Puppeteer for portal monitoring
- **Portals**: Immobiliare.it, Idealista, Casa.it
- **Compliance**: Terms of Service compliance required

## Consequences

### Positive

- **Centralized Processing**: All leads funnel through unified system
- **Real-time Response**: Immediate lead processing and routing
- **Scalable Architecture**: Can add new sources without system changes
- **Compliance Ready**: Built-in GDPR and ToS considerations

### Negative

- **Complex Security**: Multiple webhook endpoints require careful security
- **Email Dependencies**: Relies on email delivery and parsing
- **Portal Monitoring**: Requires ongoing portal structure monitoring
- **Performance Impact**: Real-time processing may affect system performance

### Neutral

- **Maintenance Overhead**: Requires ongoing monitoring of portal changes
- **Configuration Management**: Multiple environment variables and flags
- **Error Handling**: Complex error scenarios across multiple channels

## Implementation Phases

### Phase 1: Email Inbound (Primary)

- SendGrid Inbound Parse webhook
- MIME parsing and lead extraction
- Basic conversation routing

### Phase 2: Gmail Integration (Secondary)

- Gmail API setup and OAuth
- Pub/Sub integration
- Unified processing pipeline

### Phase 3: Portal Connectors (Optional)

- Puppeteer setup and portal adapters
- ToS compliance framework
- Consent management system

## Technical Requirements

- **Environment Variables**:
  - `SENDGRID_INBOUND_SECRET`
  - `SENDGRID_API_KEY`
  - `GMAIL_WATCH_ENABLED`
  - `GMAIL_CLIENT_ID`
  - `GMAIL_CLIENT_SECRET`
  - `GMAIL_REFRESH_TOKEN`
  - `PORTAL_CONNECTORS_ENABLED`

- **Security Measures**:
  - IP allowlist for webhooks
  - Random secret in webhook paths
  - OAuth 2.0 for Gmail
  - Rate limiting for portal connectors

- **Monitoring**:
  - Webhook delivery status
  - Lead processing metrics
  - Error rate tracking
  - SLA compliance monitoring
