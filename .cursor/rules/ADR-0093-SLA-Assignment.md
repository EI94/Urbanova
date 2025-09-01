# ADR-0093: SLA & Assignment

## Status

Accepted

## Context

Urbanova needs to ensure timely response to leads while managing team workload and providing clear ownership. We need a Service Level Agreement (SLA) system with intelligent assignment and escalation capabilities.

## Decision

Implement comprehensive SLA and assignment system:

### SLA Framework

- **First Response Target**: < 15 minutes during business hours (9:00-18:00 CET)
- **Business Hours**: Configurable per project and timezone
- **Escalation Levels**: Automated escalation for SLA breaches
- **Performance Tracking**: Real-time SLA compliance monitoring

### Assignment System

- **Automatic Assignment**: Intelligent assignment based on workload and expertise
- **Manual Override**: Users can manually assign leads
- **Load Balancing**: Distribute leads evenly across team members
- **Expertise Matching**: Match leads to team members with relevant expertise

### Escalation Framework

- **Level 1**: Automated reminder to assigned user
- **Level 2**: Escalation to team lead/supervisor
- **Level 3**: Escalation to project manager
- **Level 4**: Executive escalation for critical leads

## Consequences

### Positive

- **Improved Response Times**: Faster response times improve conversion rates
- **Clear Ownership**: Every lead has clear ownership and accountability
- **Workload Balance**: Even distribution prevents team overload
- **Performance Visibility**: Clear metrics for team performance

### Negative

- **Team Pressure**: SLA targets may create pressure on team members
- **Complex Routing**: Sophisticated assignment logic increases complexity
- **Escalation Fatigue**: Too many escalations may reduce effectiveness
- **False Positives**: SLA breaches may not always indicate real issues

### Neutral

- **Monitoring Overhead**: Additional monitoring and alerting required
- **Configuration Management**: Complex SLA configuration per project
- **Training Requirements**: Team training on SLA expectations and tools

## Implementation Details

### SLA Configuration

```typescript
interface SLAConfig {
  projectId: string;
  firstResponseMinutes: number; // Default: 15
  businessHours: {
    start: string; // "09:00"
    end: string; // "18:00"
    timezone: string; // "Europe/Rome"
    daysOfWeek: number[]; // [1,2,3,4,5] for Mon-Fri
  };
  escalationLevels: {
    level1Minutes: number; // 10 minutes
    level2Minutes: number; // 20 minutes
    level3Minutes: number; // 30 minutes
    level4Minutes: number; // 60 minutes
  };
}
```

### Assignment Rules

```typescript
interface AssignmentRule {
  id: string;
  projectId: string;
  priority: number;
  conditions: {
    leadSource?: string[];
    leadType?: string[];
    projectPhase?: string[];
    teamMemberSkills?: string[];
  };
  assignment: {
    type: 'auto' | 'manual' | 'round_robin' | 'least_busy';
    userIds?: string[];
    fallbackUserId?: string;
  };
}
```

### SLA Tracking

```typescript
interface SLATracker {
  leadId: string;
  conversationId: string;
  assignedUserId: string;
  createdAt: Date;
  firstResponseDeadline: Date;
  firstResponseAt?: Date;
  slaStatus: 'on_track' | 'at_risk' | 'breached';
  escalationLevel: number;
  escalationHistory: Array<{
    level: number;
    timestamp: Date;
    userId: string;
    action: string;
  }>;
}
```

## Technical Implementation

### Real-time Monitoring

- **SLA Dashboard**: Real-time view of all leads and SLA status
- **Escalation Alerts**: Immediate notifications for SLA breaches
- **Performance Metrics**: Team and individual performance tracking
- **Trend Analysis**: Historical SLA performance analysis

### Assignment Engine

- **Load Balancing**: Distribute leads based on current workload
- **Skill Matching**: Match leads to team members with relevant skills
- **Availability Tracking**: Consider team member availability and capacity
- **Priority Handling**: Handle high-priority leads with special routing

### Escalation System

- **Automated Escalation**: Automatic escalation based on SLA breaches
- **Manual Escalation**: Manual escalation for special cases
- **Escalation History**: Complete audit trail of all escalations
- **Resolution Tracking**: Track escalation resolution and outcomes

### Integration Points

- **Calendar Integration**: Consider team member calendar availability
- **CRM Integration**: Sync with existing CRM systems
- **Notification System**: Integrate with existing notification systems
- **Reporting System**: Integrate with business intelligence systems

## Business Rules

### SLA Calculation

- **Business Hours Only**: SLA only applies during business hours
- **Holiday Exclusion**: Exclude holidays and weekends from SLA calculation
- **Lead Priority**: Different SLA targets for different lead priorities
- **Channel Consideration**: Different SLA targets for different channels

### Assignment Logic

- **Workload Balance**: Distribute leads evenly across available team members
- **Expertise Matching**: Match leads to team members with relevant expertise
- **Geographic Consideration**: Consider team member location and timezone
- **Availability Status**: Consider team member availability status

### Escalation Triggers

- **SLA Breach**: Automatic escalation when SLA is breached
- **No Response**: Escalation if no response within SLA window
- **High Priority**: Immediate escalation for high-priority leads
- **Customer Complaints**: Escalation for customer complaints

## Performance Metrics

### SLA Metrics

- **First Response Time**: Average time to first response
- **SLA Compliance Rate**: Percentage of leads meeting SLA
- **Escalation Rate**: Percentage of leads requiring escalation
- **Resolution Time**: Average time to lead resolution

### Team Metrics

- **Individual Performance**: SLA compliance per team member
- **Workload Distribution**: Evenness of lead distribution
- **Response Quality**: Quality metrics for responses
- **Customer Satisfaction**: Customer satisfaction scores

### System Metrics

- **System Uptime**: System availability and reliability
- **Processing Time**: Time to process and assign leads
- **Error Rate**: Rate of assignment and escalation errors
- **Scalability**: System performance under load

## Reporting & Analytics

### Real-time Dashboards

- **SLA Dashboard**: Real-time SLA status and metrics
- **Team Dashboard**: Team performance and workload
- **Escalation Dashboard**: Escalation status and history
- **Project Dashboard**: Project-specific SLA performance

### Regular Reports

- **Daily Reports**: Daily SLA performance summary
- **Weekly Reports**: Weekly trends and analysis
- **Monthly Reports**: Monthly performance and improvement recommendations
- **Quarterly Reviews**: Quarterly SLA effectiveness review

### Alerting System

- **SLA Alerts**: Immediate alerts for SLA breaches
- **Escalation Alerts**: Alerts for escalations and resolutions
- **Performance Alerts**: Alerts for performance issues
- **System Alerts**: Alerts for system issues and outages
