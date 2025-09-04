import { Planner } from '../planner';
// import { Plan, PlanMode } from '@urbanova/types';

// Mock types
type Plan = any;
type PlanMode = any;

describe('Planner', () => {
  let planner: Planner;

  beforeEach(() => {
    planner = new Planner();
  });

  describe('classify', () => {
    describe('slash commands', () => {
      it('should classify slash commands as ACTION', () => {
        const plan = planner.classify('/echo text:ciao');

        expect(plan.mode).toBe('ACTION');
        expect(plan.intent).toBe('echo');
        expect(plan.confidence).toBe(0.95);
        expect(plan.args).toEqual({ text: 'ciao' });
      });

      it('should parse multiple args in slash command', () => {
        const plan = planner.classify('/echo text:ciao repeat:3');

        expect(plan.mode).toBe('ACTION');
        expect(plan.intent).toBe('echo');
        expect(plan.args).toEqual({ text: 'ciao', repeat: '3' });
      });

      it('should handle slash command without args', () => {
        const plan = planner.classify('/help');

        expect(plan.mode).toBe('ACTION');
        expect(plan.intent).toBe('help');
        expect(plan.args).toEqual({});
      });
    });

    describe('action keywords', () => {
      it('should classify action keywords as ACTION', () => {
        const plan = planner.classify('crea un nuovo progetto');

        expect(plan.mode).toBe('ACTION');
        expect(plan.intent).toBe('create');
        expect(plan.confidence).toBe(0.8);
      });

      it('should classify modify keywords as ACTION', () => {
        const plan = planner.classify('modifica il progetto esistente');

        expect(plan.mode).toBe('ACTION');
        expect(plan.intent).toBe('update');
        expect(plan.confidence).toBe(0.8);
      });

      it('should classify delete keywords as ACTION', () => {
        const plan = planner.classify('elimina il progetto');

        expect(plan.mode).toBe('ACTION');
        expect(plan.intent).toBe('delete');
        expect(plan.confidence).toBe(0.8);
      });

      it('should classify send keywords as ACTION', () => {
        const plan = planner.classify('invia la documentazione');

        expect(plan.mode).toBe('ACTION');
        expect(plan.intent).toBe('send');
        expect(plan.confidence).toBe(0.8);
      });
    });

    describe('QNA classification', () => {
      it('should classify questions as QNA', () => {
        const plan = planner.classify("Com'è messo il Progetto A sulla documentazione?");

        expect(plan.mode).toBe('QNA');
        expect(plan.confidence).toBe(0.6);
        expect(plan.projectId).toBe('A');
      });

      it('should classify general queries as QNA', () => {
        const plan = planner.classify('Qual è lo stato del progetto?');

        expect(plan.mode).toBe('QNA');
        expect(plan.confidence).toBe(0.6);
      });

      it('should classify project-specific questions as QNA', () => {
        const plan = planner.classify('Nel Progetto B, qual è il budget?');

        expect(plan.mode).toBe('QNA');
        expect(plan.confidence).toBe(0.6);
        expect(plan.projectId).toBe('B');
      });
    });

    describe('dryrun override', () => {
      it('should override classification for dryrun', () => {
        const plan = planner.classify('/dryrun crea progetto');

        expect(plan.mode).toBe('ACTION');
        expect(plan.intent).toBe('dryrun');
        expect(plan.confidence).toBe(1.0);
        expect(plan.args.originalText).toBe('/dryrun crea progetto');
      });

      it('should override classification for dryrun in natural language', () => {
        const plan = planner.classify('crea progetto /dryrun');

        expect(plan.mode).toBe('ACTION');
        expect(plan.intent).toBe('dryrun');
        expect(plan.confidence).toBe(1.0);
      });
    });

    describe('project alias extraction', () => {
      it('should extract project alias from "Progetto X" pattern', () => {
        const plan = planner.classify('Stato del Progetto A');

        expect(plan.projectId).toBe('A');
      });

      it('should extract project alias from "sul Progetto X" pattern', () => {
        const plan = planner.classify('Documentazione sul Progetto B');

        expect(plan.projectId).toBe('B');
      });

      it('should extract project alias from "nel Progetto X" pattern', () => {
        const plan = planner.classify('Timeline nel Progetto C');

        expect(plan.projectId).toBe('C');
      });

      it('should handle case insensitive project extraction', () => {
        const plan = planner.classify('Stato del progetto a');

        expect(plan.projectId).toBe('a');
      });

      it('should return undefined when no project alias found', () => {
        const plan = planner.classify('Qual è il tempo oggi?');

        expect(plan.projectId).toBeUndefined();
      });
    });

    describe('args extraction', () => {
      it('should extract numbers from text', () => {
        const plan = planner.classify('Crea progetto con budget 100000');

        expect(plan.args.numbers).toEqual([100000]);
      });

      it('should extract emails from text', () => {
        const plan = planner.classify('Invia a user@example.com');

        expect(plan.args.emails).toEqual(['user@example.com']);
      });

      it('should extract URLs from text', () => {
        const plan = planner.classify('Scarica da https://example.com/file.pdf');

        expect(plan.args.urls).toEqual(['https://example.com/file.pdf']);
      });

      it('should extract dates from text', () => {
        const plan = planner.classify('Scadenza 15/12/2024');

        expect(plan.args.dates).toEqual(['15/12/2024']);
      });

      it('should extract multiple types of args', () => {
        const plan = planner.classify(
          'Crea progetto budget 50000 email user@test.com scadenza 20/12/2024'
        );

        expect(plan.args.numbers).toEqual([50000]);
        expect(plan.args.emails).toEqual(['user@test.com']);
        expect(plan.args.dates).toEqual(['20/12/2024']);
      });
    });
  });
});
