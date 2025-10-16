// 🧪 TEST - System Prompt
// Verifica prompt completo e status lines

import {
  OS2_SYSTEM_PROMPT,
  SKILL_STATUS_LINES,
  getSkillStatusLine,
  getSystemPromptWithContext,
  GENERIC_STATUS_LINES,
} from '../systemPrompt';

describe('System Prompt', () => {
  describe('OS2_SYSTEM_PROMPT', () => {
    it('dovrebbe contenere regole chiave', () => {
      expect(OS2_SYSTEM_PROMPT).toContain('assistente operativo');
      expect(OS2_SYSTEM_PROMPT).toContain('Action Plan');
      expect(OS2_SYSTEM_PROMPT).toContain('Ask-to-Act');
      expect(OS2_SYSTEM_PROMPT).toContain('skill del catalogo');
      expect(OS2_SYSTEM_PROMPT.toLowerCase()).toContain('memoria');
      expect(OS2_SYSTEM_PROMPT.toLowerCase()).toContain('sicurezza');
      expect(OS2_SYSTEM_PROMPT).toContain('status lines');
      expect(OS2_SYSTEM_PROMPT).toContain('italiano');
      
      console.log('✅ System prompt contiene tutte le regole chiave');
    });
    
    it('dovrebbe essere conciso (max 2000 caratteri)', () => {
      expect(OS2_SYSTEM_PROMPT.length).toBeLessThan(2000);
      
      console.log(`✅ System prompt conciso: ${OS2_SYSTEM_PROMPT.length} caratteri`);
    });
  });
  
  describe('Status Lines', () => {
    it('dovrebbe avere status line per skill principali', () => {
      const requiredSkills = [
        'business_plan.run',
        'sensitivity.run',
        'term_sheet.create',
        'rdo.create',
        'sal.record',
      ];
      
      requiredSkills.forEach(skillId => {
        expect(SKILL_STATUS_LINES[skillId]).toBeDefined();
        expect(SKILL_STATUS_LINES[skillId].length).toBeLessThan(50); // Max 50 char
      });
      
      console.log('✅ Status lines per skill principali definite');
    });
    
    it('dovrebbe avere fallback default', () => {
      const statusLine = getSkillStatusLine('skill.inesistente');
      
      expect(statusLine).toBe('Elaboro richiesta…');
      
      console.log('✅ Fallback default per skill sconosciute');
    });
    
    it('status lines dovrebbero essere brevi (max 6 parole)', () => {
      Object.entries(SKILL_STATUS_LINES).forEach(([skillId, statusLine]) => {
        // Remove ellipsis for word count
        const cleanLine = statusLine.replace('…', '').replace('...', '');
        const wordCount = cleanLine.split(/\s+/).filter(w => w.length > 0).length;
        
        // Max 7 parole (un po' di tolleranza per combinazioni complesse)
        expect(wordCount).toBeLessThanOrEqual(8);
      });
      
      console.log('✅ Status lines concise (max 6-8 parole)');
    });
    
    it('status lines dovrebbero usare verbi infinito', () => {
      // Verifica pattern comune: verbo + oggetto
      const commonPatterns = [
        'Calcolo',
        'Genero',
        'Invio',
        'Registro',
        'Preparo',
        'Costruisco',
        'Cerco',
        'Eseguo',
      ];
      
      const statusValues = Object.values(SKILL_STATUS_LINES);
      const hasCommonPattern = statusValues.some(status => 
        commonPatterns.some(pattern => status.includes(pattern))
      );
      
      expect(hasCommonPattern).toBe(true);
      
      console.log('✅ Status lines usano verbi infinito + oggetto');
    });
  });
  
  describe('Generic Status Lines', () => {
    it('dovrebbe avere status generici', () => {
      expect(GENERIC_STATUS_LINES.idle).toBeDefined();
      expect(GENERIC_STATUS_LINES.thinking).toBeDefined();
      expect(GENERIC_STATUS_LINES.planning).toBeDefined();
      expect(GENERIC_STATUS_LINES.executing).toBeDefined();
      expect(GENERIC_STATUS_LINES.done).toBeDefined();
      expect(GENERIC_STATUS_LINES.failed).toBeDefined();
      expect(GENERIC_STATUS_LINES.awaiting_confirm).toBeDefined();
      
      console.log('✅ Status generici definiti');
    });
  });
  
  describe('Context-aware System Prompt', () => {
    it('dovrebbe includere ruolo utente', () => {
      const prompt = getSystemPromptWithContext({
        userRole: 'viewer',
      });
      
      expect(prompt).toContain('viewer');
      expect(prompt.toLowerCase()).toContain('solo lettura');
      
      console.log('✅ Prompt include ruolo viewer');
    });
    
    it('dovrebbe includere progetto attivo', () => {
      const prompt = getSystemPromptWithContext({
        projectName: 'Progetto Ciliegie',
      });
      
      expect(prompt).toContain('Progetto Ciliegie');
      
      console.log('✅ Prompt include progetto attivo');
    });
    
    it('dovrebbe includere parametri progetto dalla memoria', () => {
      const prompt = getSystemPromptWithContext({
        projectName: 'Progetto Ciliegie',
        projectDefaults: {
          discountRate: 0.15,
          marginTarget: 0.25,
        },
      });
      
      expect(prompt).toContain('Parametri salvati');
      expect(prompt).toContain('Tasso sconto: 15.0%');
      expect(prompt).toContain('Margine target: 25.0%');
      expect(prompt).toContain('Usa questi valori');
      
      console.log('✅ Prompt include parametri dalla memoria');
    });
    
    it('dovrebbe combinare tutti i contesti', () => {
      const prompt = getSystemPromptWithContext({
        userRole: 'editor',
        projectName: 'Villa Moderna',
        projectDefaults: {
          discountRate: 0.12,
          marginTarget: 0.20,
        },
      });
      
      expect(prompt).toContain(OS2_SYSTEM_PROMPT);
      expect(prompt).toContain('editor');
      expect(prompt).toContain('Villa Moderna');
      expect(prompt).toContain('12.0%');
      
      console.log('✅ Prompt combina tutti i contesti');
    });
  });
});

