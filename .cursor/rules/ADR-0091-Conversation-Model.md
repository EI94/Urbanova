# ADR-0091: Conversation Model & Routing

## Status

Accepted

## Context

Urbanova needs a unified conversation model that can handle leads from multiple channels (email, WhatsApp, portal forms) while maintaining context and enabling intelligent routing for responses.

## Decision

Implement a unified conversation model with intelligent routing:

### Conversation Model

- **Single Conversation per Lead**: One conversation entity per unique lead, regardless of channel
- **Channel Tracking**: Each message tagged with source channel: 'email'|'whatsapp'|'portal:immobiliare'|'portal:idealista'|'portal:casa'
- **Unified Thread**: All messages from all channels appear in chronological order

### Routing Policy

- **Primary**: WhatsApp if phone number present and valid
- **Fallback**: Email reply from inbound mailbox
- **Channel Preference**: User can override default routing per conversation
- **Multi-channel**: Support for simultaneous responses on multiple channels

### Message Flow

1. **Inbound**: Lead arrives → Create/Update Lead → Add Message to Conversation
2. **Routing**: System determines best response channel
3. **Outbound**: Send response → Add Message to Conversation → Update SLA

## Consequences

### Positive

- **Unified View**: All lead interactions in one place
- **Intelligent Routing**: Automatic channel selection based on availability
- **Context Preservation**: Full conversation history regardless of channel
- **Scalable**: Easy to add new channels without model changes

### Negative

- **Complex Routing Logic**: Need sophisticated channel selection algorithms
- **Message Synchronization**: Potential for duplicate messages across channels
- **Channel Limitations**: Some channels have message length/format restrictions
- **User Confusion**: Multiple channels might confuse users

### Neutral

- **Data Volume**: More complex data model for conversation tracking
- **Performance**: Additional processing for routing decisions
- **Monitoring**: Need to track routing decisions and success rates

## Implementation Details

### Conversation Entity

```typescript
interface Conversation {
  id: string;
  leadId: string;
  projectId?: string;
  channel: 'email' | 'whatsapp' | 'portal:immobiliare' | 'portal:idealista' | 'portal:casa';
  assigneeUserId?: string;
  lastMsgAt: Date;
  unreadCount: number;
  status: 'active' | 'closed' | 'archived';
  slaStatus: 'on_track' | 'at_risk' | 'breached';
}
```

### Message Entity

```typescript
interface Message {
  id: string;
  convId: string;
  direction: 'inbound' | 'outbound';
  channel: string;
  text: string;
  html?: string;
  attachments?: Array<{ url: string; filename: string; contentType: string }>;
  meta?: Record<string, unknown>;
  createdAt: Date;
  sender?: { name?: string; email?: string; phone?: string };
  status: 'sent' | 'delivered' | 'failed';
}
```

### Routing Algorithm

1. **Check Lead Contact Info**: Phone number available?
2. **Check Channel History**: Previous successful WhatsApp messages?
3. **Check Business Hours**: Is it within SLA response window?
4. **Check User Preference**: Has user set channel preference?
5. **Default Fallback**: Email if no other option

## Technical Requirements

### Database Schema

- **Conversations Collection**: Firestore collection for conversation metadata
- **Messages Subcollection**: Nested collection for conversation messages
- **Indexes**: On leadId, projectId, assigneeUserId, lastMsgAt

### API Endpoints

- `POST /api/conversations/{id}/messages` - Add message to conversation
- `POST /api/conversations/{id}/reply` - Send reply with auto-routing
- `GET /api/conversations` - List conversations with filters
- `GET /api/conversations/{id}/messages` - Get conversation thread

### Real-time Updates

- **WebSocket**: Real-time conversation updates
- **Push Notifications**: New message notifications
- **SLA Alerts**: Automated alerts for SLA breaches

## SLA Integration

- **First Response**: Track time from lead creation to first response
- **Channel Performance**: Monitor response success rates by channel
- **Escalation**: Automatic escalation for SLA breaches
- **Reporting**: SLA compliance reporting and analytics
