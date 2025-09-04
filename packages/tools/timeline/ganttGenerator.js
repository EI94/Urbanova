"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GanttGenerator = void 0;
/**
 * Gantt Generator - Genera Gantt SVG con critical path
 *
 * Funzionalità:
 * - Gantt SVG generation
 * - Critical path highlighting
 * - Progress visualization
 * - Dependency arrows
 * - Re-plan preview
 */
class GanttGenerator {
    constructor() {
        console.log('📊 [GanttGenerator] Gantt Generator inizializzato');
    }
    /**
     * Genera Gantt SVG
     */
    async generateGanttSVG(wbs, options) {
        console.log(`📊 [GanttGenerator] Generazione Gantt SVG per WBS ${wbs.id}`);
        try {
            const width = options?.width || 1200;
            const height = options?.height || 600;
            const showCriticalPath = options?.showCriticalPath ?? true;
            const showProgress = options?.showProgress ?? true;
            const showDependencies = options?.showDependencies ?? true;
            // Calcola dimensioni
            const taskHeight = 30;
            const taskSpacing = 10;
            const headerHeight = 60;
            const timelineHeight = height - headerHeight;
            const maxTasks = Math.floor(timelineHeight / (taskHeight + taskSpacing));
            // Filtra task per visualizzazione
            const visibleTasks = wbs.tasks.slice(0, maxTasks);
            // Genera SVG
            const svg = this.generateSVGContent(wbs, visibleTasks, {
                width,
                height,
                taskHeight,
                taskSpacing,
                headerHeight,
                showCriticalPath,
                showProgress,
                showDependencies,
            });
            console.log(`✅ [GanttGenerator] Gantt SVG generato: ${width}x${height}`);
            return svg;
        }
        catch (error) {
            console.error(`❌ [GanttGenerator] Errore generazione Gantt:`, error);
            return this.generateErrorSVG();
        }
    }
    /**
     * Genera preview per re-plan
     */
    async generateRePlanPreview(proposal) {
        console.log(`👁️ [GanttGenerator] Generazione preview per re-plan ${proposal.id}`);
        try {
            // Genera Gantt "prima"
            const beforeSVG = await this.generateGanttSVG(proposal.currentTimeline, {
                showCriticalPath: true,
                showProgress: true,
                showDependencies: true,
                width: 800,
                height: 400,
            });
            // Genera Gantt "dopo"
            const afterSVG = await this.generateGanttSVG(proposal.proposedTimeline, {
                showCriticalPath: true,
                showProgress: true,
                showDependencies: true,
                width: 800,
                height: 400,
            });
            // Genera summary dei cambiamenti
            const changes = this.generateChangesSummary(proposal);
            // Genera summary dell'impatto
            const impact = this.generateImpactSummary(proposal);
            const preview = {
                id: `preview-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                proposalId: proposal.id,
                beforeAfter: {
                    before: beforeSVG,
                    after: afterSVG,
                },
                changes,
                impact,
                actions: {
                    approve: true,
                    reject: true,
                    modify: true,
                    autoApply: proposal.confirmation.autoApply,
                },
                createdAt: new Date(),
            };
            console.log(`✅ [GanttGenerator] Preview generata`);
            return preview;
        }
        catch (error) {
            console.error(`❌ [GanttGenerator] Errore generazione preview:`, error);
            throw error;
        }
    }
    /**
     * Genera contenuto SVG
     */
    generateSVGContent(wbs, tasks, options) {
        const { width, height, taskHeight, taskSpacing, headerHeight, showCriticalPath, showProgress, showDependencies, } = options;
        // Calcola timeline
        const timelineStart = new Date(wbs.startDate);
        const timelineEnd = new Date(wbs.endDate);
        const timelineDuration = timelineEnd.getTime() - timelineStart.getTime();
        const timelineWidth = width - 200; // 200px per labels
        // Genera header con date
        const header = this.generateHeader(timelineStart, timelineEnd, timelineWidth, headerHeight);
        // Genera task bars
        const taskBars = this.generateTaskBars(tasks, timelineStart, timelineDuration, timelineWidth, taskHeight, taskSpacing, showCriticalPath, showProgress);
        // Genera dipendenze
        const dependencies = showDependencies
            ? this.generateDependencies(wbs.dependencies, tasks, timelineStart, timelineDuration, timelineWidth, taskHeight, taskSpacing)
            : '';
        // Genera labels
        const labels = this.generateLabels(tasks, taskHeight, taskSpacing);
        // Combina tutto in SVG
        return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="taskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
          </linearGradient>
          <linearGradient id="criticalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#ef4444;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#dc2626;stop-opacity:1" />
          </linearGradient>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect width="${width}" height="${height}" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
        
        <!-- Header -->
        ${header}
        
        <!-- Labels -->
        ${labels}
        
        <!-- Dependencies -->
        ${dependencies}
        
        <!-- Task Bars -->
        ${taskBars}
        
        <!-- Legend -->
        ${this.generateLegend(width, height, showCriticalPath, showProgress)}
      </svg>
    `;
    }
    /**
     * Genera header con date
     */
    generateHeader(timelineStart, timelineEnd, timelineWidth, headerHeight) {
        const months = [
            'Gen',
            'Feb',
            'Mar',
            'Apr',
            'Mag',
            'Giu',
            'Lug',
            'Ago',
            'Set',
            'Ott',
            'Nov',
            'Dic',
        ];
        // Calcola step per mesi
        const totalMonths = (timelineEnd.getFullYear() - timelineStart.getFullYear()) * 12 +
            (timelineEnd.getMonth() - timelineStart.getMonth());
        const stepWidth = timelineWidth / Math.max(1, totalMonths);
        let headerContent = `<g transform="translate(200, 0)">`;
        // Linea di separazione
        headerContent += `<line x1="0" y1="${headerHeight}" x2="${timelineWidth}" y2="${headerHeight}" stroke="#e2e8f0" stroke-width="2"/>`;
        // Label mesi
        for (let i = 0; i <= totalMonths; i++) {
            const currentDate = new Date(timelineStart);
            currentDate.setMonth(timelineStart.getMonth() + i);
            const x = i * stepWidth;
            const monthName = months[currentDate.getMonth()];
            const year = currentDate.getFullYear();
            headerContent += `
        <text x="${x + 10}" y="25" font-family="Arial" font-size="12" fill="#64748b" text-anchor="start">
          ${monthName} ${year}
        </text>
        <line x1="${x}" y1="30" x2="${x}" y2="${headerHeight}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="2,2"/>
      `;
        }
        headerContent += `</g>`;
        return headerContent;
    }
    /**
     * Genera barre dei task
     */
    generateTaskBars(tasks, timelineStart, timelineDuration, timelineWidth, taskHeight, taskSpacing, showCriticalPath, showProgress) {
        let taskBars = `<g transform="translate(200, 60)">`;
        tasks.forEach((task, index) => {
            const y = index * (taskHeight + taskSpacing);
            // Calcola posizione e larghezza
            const taskStart = new Date(task.startDate);
            const taskEnd = new Date(task.endDate);
            const startOffset = (taskStart.getTime() - timelineStart.getTime()) / timelineDuration;
            const taskDuration = (taskEnd.getTime() - taskStart.getTime()) / timelineDuration;
            const x = startOffset * timelineWidth;
            const width = taskDuration * timelineWidth;
            // Determina colore
            const isCritical = showCriticalPath && task.isCritical;
            const gradientId = isCritical ? 'criticalGradient' : 'taskGradient';
            // Barra principale
            taskBars += `
        <rect x="${x}" y="${y}" width="${width}" height="${taskHeight}" 
              fill="url(#${gradientId})" stroke="#1e293b" stroke-width="1" rx="3"/>
      `;
            // Barra progresso
            if (showProgress && task.progress > 0) {
                const progressWidth = (task.progress / 100) * width;
                taskBars += `
          <rect x="${x}" y="${y}" width="${progressWidth}" height="${taskHeight}" 
                fill="url(#progressGradient)" stroke="none" rx="3"/>
        `;
            }
            // Testo del task
            const textX = x + 5;
            const textY = y + taskHeight / 2 + 4;
            const displayName = task.name.length > 20 ? task.name.substring(0, 17) + '...' : task.name;
            taskBars += `
        <text x="${textX}" y="${textY}" font-family="Arial" font-size="10" fill="white" text-anchor="start">
          ${displayName}
        </text>
      `;
            // Badge critical path
            if (isCritical) {
                taskBars += `
          <circle cx="${x + width - 8}" cy="${y + 8}" r="4" fill="#ef4444" stroke="white" stroke-width="1"/>
        `;
            }
        });
        taskBars += `</g>`;
        return taskBars;
    }
    /**
     * Genera labels dei task
     */
    generateLabels(tasks, taskHeight, taskSpacing) {
        let labels = `<g transform="translate(10, 60)">`;
        tasks.forEach((task, index) => {
            const y = index * (taskHeight + taskSpacing) + taskHeight / 2;
            const displayName = task.name.length > 25 ? task.name.substring(0, 22) + '...' : task.name;
            labels += `
        <text x="0" y="${y + 4}" font-family="Arial" font-size="11" fill="#374151" text-anchor="start">
          ${displayName}
        </text>
      `;
        });
        labels += `</g>`;
        return labels;
    }
    /**
     * Genera dipendenze
     */
    generateDependencies(dependencies, tasks, timelineStart, timelineDuration, timelineWidth, taskHeight, taskSpacing) {
        let dependencyArrows = `<g transform="translate(200, 60)">`;
        dependencies.forEach(dep => {
            const fromTask = tasks.find(t => t.id === dep.fromTaskId);
            const toTask = tasks.find(t => t.id === dep.toTaskId);
            if (fromTask && toTask) {
                const fromIndex = tasks.findIndex(t => t.id === dep.fromTaskId);
                const toIndex = tasks.findIndex(t => t.id === dep.toTaskId);
                const fromY = fromIndex * (taskHeight + taskSpacing) + taskHeight / 2;
                const toY = toIndex * (taskHeight + taskSpacing) + taskHeight / 2;
                const fromTaskEnd = new Date(fromTask.endDate);
                const toTaskStart = new Date(toTask.startDate);
                const fromX = ((fromTaskEnd.getTime() - timelineStart.getTime()) / timelineDuration) * timelineWidth;
                const toX = ((toTaskStart.getTime() - timelineStart.getTime()) / timelineDuration) * timelineWidth;
                // Disegna freccia
                dependencyArrows += `
          <line x1="${fromX}" y1="${fromY}" x2="${toX}" y2="${toY}" 
                stroke="#64748b" stroke-width="2" stroke-dasharray="5,3"/>
          <polygon points="${toX - 5},${toY - 3} ${toX},${toY} ${toX - 5},${toY + 3}" 
                   fill="#64748b"/>
        `;
            }
        });
        dependencyArrows += `</g>`;
        return dependencyArrows;
    }
    /**
     * Genera legenda
     */
    generateLegend(width, height, showCriticalPath, showProgress) {
        let legend = `<g transform="translate(${width - 200}, ${height - 80})">`;
        legend += `
      <rect x="0" y="0" width="180" height="70" fill="white" stroke="#e2e8f0" stroke-width="1" rx="5"/>
      <text x="10" y="20" font-family="Arial" font-size="12" font-weight="bold" fill="#374151">Legenda</text>
    `;
        let yOffset = 35;
        // Task normale
        legend += `
      <rect x="10" y="${yOffset}" width="15" height="8" fill="url(#taskGradient)" stroke="#1e293b" stroke-width="1"/>
      <text x="30" y="${yOffset + 6}" font-family="Arial" font-size="10" fill="#374151">Task</text>
    `;
        if (showCriticalPath) {
            yOffset += 15;
            legend += `
        <rect x="10" y="${yOffset}" width="15" height="8" fill="url(#criticalGradient)" stroke="#1e293b" stroke-width="1"/>
        <text x="30" y="${yOffset + 6}" font-family="Arial" font-size="10" fill="#374151">Critical Path</text>
      `;
        }
        if (showProgress) {
            yOffset += 15;
            legend += `
        <rect x="10" y="${yOffset}" width="15" height="8" fill="url(#progressGradient)" stroke="none"/>
        <text x="30" y="${yOffset + 6}" font-family="Arial" font-size="10" fill="#374151">Progresso</text>
      `;
        }
        legend += `</g>`;
        return legend;
    }
    /**
     * Genera summary dei cambiamenti
     */
    generateChangesSummary(proposal) {
        const shiftedTasks = proposal.changes.shiftedTasks.length;
        const totalDelay = proposal.impact.totalDelay;
        const costImpact = proposal.changes.costImpact.difference;
        return {
            summary: `Ripianificazione proposta con ${shiftedTasks} task modificati`,
            details: [
                `Task spostati: ${shiftedTasks}`,
                `Ritardo totale: ${totalDelay} giorni`,
                `Impatto costi: ${costImpact}€`,
                `Dipendenze modificate: ${proposal.changes.newDependencies.length}`,
                `Risorse riallocate: ${proposal.changes.resourceChanges.length}`,
            ],
            affectedTasks: shiftedTasks,
            totalDelay,
            costImpact,
        };
    }
    /**
     * Genera summary dell'impatto
     */
    generateImpactSummary(proposal) {
        return {
            summary: `Impatto ${proposal.impact.riskAssessment.overallRisk} con ${proposal.impact.totalDelay} giorni di ritardo`,
            risks: proposal.impact.riskAssessment.risks.map(r => r.description),
            benefits: ['Miglior gestione delle risorse', 'Riduzione conflitti', 'Maggiore trasparenza'],
            recommendations: proposal.impact.recommendations,
        };
    }
    /**
     * Genera SVG di errore
     */
    generateErrorSVG() {
        return `
      <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="200" fill="#fef2f2" stroke="#fecaca" stroke-width="2"/>
        <text x="200" y="80" font-family="Arial" font-size="16" fill="#dc2626" text-anchor="middle">
          Errore generazione Gantt
        </text>
        <text x="200" y="110" font-family="Arial" font-size="12" fill="#7f1d1d" text-anchor="middle">
          Impossibile generare il grafico
        </text>
        <text x="200" y="130" font-family="Arial" font-size="10" fill="#7f1d1d" text-anchor="middle">
          Verificare i dati del progetto
        </text>
      </svg>
    `;
    }
}
exports.GanttGenerator = GanttGenerator;
//# sourceMappingURL=ganttGenerator.js.map