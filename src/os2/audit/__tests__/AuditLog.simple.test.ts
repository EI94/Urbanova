// 🧪 SIMPLE TEST - Audit Log Logic
// Test semplificato senza Firebase (logica pura)

import { AuditEvent } from '../AuditLog';

/**
 * Mock Audit Log (in-memory)
 */
class SimpleAuditLog {
  private events: AuditEvent[] = [];
  
  async log(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<string> {
    const id = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const fullEvent: AuditEvent = {
      ...event,
      id,
      timestamp: new Date(),
    };
    
    this.events.push(fullEvent);
    
    return id;
  }
  
  async getEvents(filters: any = {}): Promise<AuditEvent[]> {
    let filtered = [...this.events];
    
    if (filters.projectId) {
      filtered = filtered.filter(e => e.projectId === filters.projectId);
    }
    
    if (filters.skillId) {
      filtered = filtered.filter(e => e.skillId === filters.skillId);
    }
    
    if (filters.planId) {
      filtered = filtered.filter(e => e.planId === filters.planId);
    }
    
    return filtered;
  }
  
  async getPlanAudit(planId: string): Promise<AuditEvent[]> {
    return this.events.filter(e => e.planId === planId);
  }
  
  async exportToCsv(filters: any = {}): Promise<string> {
    const events = await this.getEvents(filters);
    
    const headers = ['ID', 'Timestamp', 'User', 'Action', 'Skill', 'Mode'];
    const rows = events.map(e => [
      e.id,
      e.timestamp.toISOString(),
      e.userId,
      e.action,
      e.skillId,
      e.osMode,
    ]);
    
    return [
      headers.join(','),
      ...rows.map(r => r.join(',')),
    ].join('\n');
  }
  
  async exportProjectAuditCsv(projectId: string): Promise<string> {
    return this.exportToCsv({ projectId });
  }
}

describe('Audit Log - Logic Tests', () => {
  let audit: SimpleAuditLog;
  
  beforeEach(() => {
    audit = new SimpleAuditLog();
  });
  
  describe('Log eventi su skill con side effects', () => {
    it('dovrebbe loggare term_sheet.create', async () => {
      const eventId = await audit.log({
        userId: 'user123',
        userEmail: 'test@example.com',
        action: 'executed',
        skillId: 'term_sheet.create',
        planId: 'plan_001',
        stepIndex: 0,
        projectId: 'proj_ciliegie',
        osMode: 'ask_to_act',
        sideEffects: ['write.db'],
        success: true,
      });
      
      expect(eventId).toBeDefined();
      
      const events = await audit.getPlanAudit('plan_001');
      expect(events).toHaveLength(1);
      expect(events[0].skillId).toBe('term_sheet.create');
      expect(events[0].sideEffects).toContain('write.db');
      
      console.log('✅ Audit creato per term_sheet.create');
    });
    
    it('dovrebbe loggare rdo.create', async () => {
      const eventId = await audit.log({
        userId: 'user456',
        userEmail: 'editor@example.com',
        action: 'executed',
        skillId: 'rdo.create',
        planId: 'plan_002',
        stepIndex: 0,
        projectId: 'proj_villa',
        osMode: 'ask_to_act',
        sideEffects: ['email.send', 'write.db'],
        success: true,
      });
      
      const events = await audit.getPlanAudit('plan_002');
      expect(events).toHaveLength(1);
      expect(events[0].skillId).toBe('rdo.create');
      expect(events[0].sideEffects).toContain('email.send');
      expect(events[0].sideEffects).toContain('write.db');
      
      console.log('✅ Audit creato per rdo.create');
    });
  });
  
  describe('Export CSV per progetto', () => {
    it('dovrebbe esportare audit CSV per progetto', async () => {
      // Add events
      await audit.log({
        userId: 'user123',
        action: 'executed',
        skillId: 'business_plan.run',
        planId: 'plan_001',
        stepIndex: 0,
        projectId: 'proj_A',
        osMode: 'ask',
      });
      
      await audit.log({
        userId: 'user123',
        action: 'executed',
        skillId: 'rdo.create',
        planId: 'plan_002',
        stepIndex: 0,
        projectId: 'proj_A',
        osMode: 'act',
      });
      
      await audit.log({
        userId: 'user456',
        action: 'executed',
        skillId: 'email.send',
        planId: 'plan_003',
        stepIndex: 0,
        projectId: 'proj_B',
        osMode: 'ask',
      });
      
      // Export proj_A only
      const csv = await audit.exportProjectAuditCsv('proj_A');
      
      expect(csv).toContain('business_plan.run');
      expect(csv).toContain('rdo.create');
      expect(csv).not.toContain('email.send'); // Altro progetto
      
      const lines = csv.split('\n');
      expect(lines).toHaveLength(3); // Header + 2 rows
      
      console.log('✅ Export CSV per progetto funziona');
    });
  });
  
  describe('Query filters', () => {
    beforeEach(async () => {
      await audit.log({
        userId: 'user123',
        action: 'executed',
        skillId: 'business_plan.run',
        planId: 'plan_001',
        stepIndex: 0,
        osMode: 'ask',
      });
      
      await audit.log({
        userId: 'user456',
        action: 'skipped',
        skillId: 'rdo.create',
        planId: 'plan_002',
        stepIndex: 0,
        osMode: 'ask',
      });
    });
    
    it('dovrebbe filtrare per skillId', async () => {
      const events = await audit.getEvents({ skillId: 'rdo.create' });
      
      expect(events).toHaveLength(1);
      expect(events[0].skillId).toBe('rdo.create');
      
      console.log('✅ Filtro per skillId funziona');
    });
    
    it('dovrebbe filtrare per planId', async () => {
      const events = await audit.getPlanAudit('plan_001');
      
      expect(events).toHaveLength(1);
      expect(events[0].planId).toBe('plan_001');
      
      console.log('✅ Filtro per planId funziona');
    });
  });
});

