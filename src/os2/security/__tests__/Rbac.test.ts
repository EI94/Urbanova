// 🧪 UNIT TEST - RBAC
// Test policy viewer/editor/admin su 3 skill

import { RbacEnforcer, UserRole } from '../Rbac';
import { SkillMeta } from '../../skills/SkillCatalog';

describe('RBAC Enforcer', () => {
  let rbac: RbacEnforcer;
  
  beforeEach(() => {
    rbac = new RbacEnforcer();
  });
  
  describe('VIEWER Role', () => {
    it('dovrebbe permettere business_plan.run (read-only skill)', () => {
      const result = rbac.canExecuteSkill(['viewer'], 'business_plan.run');
      
      expect(result.allowed).toBe(true);
      
      console.log('✅ Viewer può eseguire business_plan.run');
    });
    
    it('dovrebbe permettere sensitivity.run (read-only skill)', () => {
      const result = rbac.canExecuteSkill(['viewer'], 'sensitivity.run');
      
      expect(result.allowed).toBe(true);
      
      console.log('✅ Viewer può eseguire sensitivity.run');
    });
    
    it('dovrebbe BLOCCARE rdo.create (write skill)', () => {
      const result = rbac.canExecuteSkill(['viewer'], 'rdo.create');
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('non ha permessi');
      expect(result.requiredRole).toBe('editor'); // RDO richiede editor
      
      console.log('✅ Viewer NON può eseguire rdo.create');
    });
    
    it('dovrebbe BLOCCARE sal.record (write skill)', () => {
      const result = rbac.canExecuteSkill(['viewer'], 'sal.record');
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('non ha permessi');
      
      console.log('✅ Viewer NON può eseguire sal.record');
    });
    
    it('dovrebbe BLOCCARE email.send', () => {
      const result = rbac.canExecuteSkill(['viewer'], 'email.send');
      
      expect(result.allowed).toBe(false);
      
      console.log('✅ Viewer NON può eseguire email.send');
    });
    
    it('dovrebbe BLOCCARE term_sheet.create', () => {
      const result = rbac.canExecuteSkill(['viewer'], 'term_sheet.create');
      
      expect(result.allowed).toBe(false);
      
      console.log('✅ Viewer NON può eseguire term_sheet.create');
    });
  });
  
  describe('EDITOR Role', () => {
    it('dovrebbe permettere business_plan.run', () => {
      const result = rbac.canExecuteSkill(['editor'], 'business_plan.run');
      
      expect(result.allowed).toBe(true);
      
      console.log('✅ Editor può eseguire business_plan.run');
    });
    
    it('dovrebbe permettere rdo.create', () => {
      const result = rbac.canExecuteSkill(['editor'], 'rdo.create');
      
      expect(result.allowed).toBe(true);
      
      console.log('✅ Editor può eseguire rdo.create');
    });
    
    it('dovrebbe permettere sal.record', () => {
      const result = rbac.canExecuteSkill(['editor'], 'sal.record');
      
      expect(result.allowed).toBe(true);
      
      console.log('✅ Editor può eseguire sal.record');
    });
    
    it('dovrebbe permettere email.send', () => {
      const result = rbac.canExecuteSkill(['editor'], 'email.send');
      
      expect(result.allowed).toBe(true);
      
      console.log('✅ Editor può eseguire email.send');
    });
    
    it('dovrebbe permettere term_sheet.create', () => {
      const result = rbac.canExecuteSkill(['editor'], 'term_sheet.create');
      
      expect(result.allowed).toBe(true);
      
      console.log('✅ Editor può eseguire term_sheet.create');
    });
    
    it('dovrebbe BLOCCARE payment.process (solo admin)', () => {
      const result = rbac.canExecuteSkill(['editor'], 'payment.process');
      
      expect(result.allowed).toBe(false);
      expect(result.requiredRole).toBe('admin');
      
      console.log('✅ Editor NON può eseguire payment.process');
    });
    
    it('dovrebbe BLOCCARE data.delete (solo admin)', () => {
      const result = rbac.canExecuteSkill(['editor'], 'data.delete');
      
      expect(result.allowed).toBe(false);
      
      console.log('✅ Editor NON può eseguire data.delete');
    });
  });
  
  describe('ADMIN Role', () => {
    it('dovrebbe permettere TUTTE le skill', () => {
      const skills = [
        'business_plan.run',
        'rdo.create',
        'sal.record',
        'email.send',
        'payment.process',
        'data.delete',
        'user.manage',
      ];
      
      skills.forEach(skillId => {
        const result = rbac.canExecuteSkill(['admin'], skillId);
        expect(result.allowed).toBe(true);
      });
      
      console.log('✅ Admin può eseguire TUTTE le skill');
    });
  });
  
  describe('Skill Meta RBAC', () => {
    it('dovrebbe rispettare skill.meta.rbac se definito', () => {
      const skillMeta: SkillMeta = {
        id: 'custom.skill',
        summary: 'Custom skill',
        visibility: 'global',
        inputsSchema: {},
        telemetryKey: 'custom.skill',
        rbac: ['editor', 'admin'], // ← Solo editor e admin
      };
      
      // Viewer: denied
      const viewerResult = rbac.canExecuteSkill(['viewer'], 'custom.skill', skillMeta);
      expect(viewerResult.allowed).toBe(false);
      
      // Editor: allowed
      const editorResult = rbac.canExecuteSkill(['editor'], 'custom.skill', skillMeta);
      expect(editorResult.allowed).toBe(true);
      
      // Admin: allowed
      const adminResult = rbac.canExecuteSkill(['admin'], 'custom.skill', skillMeta);
      expect(adminResult.allowed).toBe(true);
      
      console.log('✅ Skill meta RBAC rispettato');
    });
  });
  
  describe('Helper Methods', () => {
    it('hasPermission dovrebbe controllare permessi ruolo', () => {
      expect(rbac.hasPermission(['viewer'], 'read')).toBe(true);
      expect(rbac.hasPermission(['viewer'], 'write')).toBe(false);
      expect(rbac.hasPermission(['viewer'], 'delete')).toBe(false);
      
      expect(rbac.hasPermission(['editor'], 'read')).toBe(true);
      expect(rbac.hasPermission(['editor'], 'write')).toBe(true);
      expect(rbac.hasPermission(['editor'], 'delete')).toBe(false);
      
      expect(rbac.hasPermission(['admin'], 'delete')).toBe(true);
      expect(rbac.hasPermission(['admin'], 'admin')).toBe(true);
      
      console.log('✅ hasPermission funziona correttamente');
    });
    
    it('filterExecutableSkills dovrebbe filtrare skill per ruolo', () => {
      const allSkills = ['business_plan.run', 'rdo.create', 'payment.process'];
      
      const viewerSkills = rbac.filterExecutableSkills(['viewer'], allSkills);
      expect(viewerSkills).toContain('business_plan.run');
      expect(viewerSkills).not.toContain('rdo.create');
      expect(viewerSkills).not.toContain('payment.process');
      
      const editorSkills = rbac.filterExecutableSkills(['editor'], allSkills);
      expect(editorSkills).toContain('business_plan.run');
      expect(editorSkills).toContain('rdo.create');
      expect(editorSkills).not.toContain('payment.process');
      
      const adminSkills = rbac.filterExecutableSkills(['admin'], allSkills);
      expect(adminSkills).toHaveLength(3); // All allowed
      
      console.log('✅ filterExecutableSkills filtra correttamente');
    });
  });
});

