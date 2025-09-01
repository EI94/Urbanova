/**
 * Compliance Chat Service - Urbanova AI
 * Gestisce i comandi chat per la compliance urbanistica
 */

import { complianceService } from './complianceService';
import { ComplianceCheckRequest, ComplianceSearchRequest } from '@urbanova/types';

export interface ComplianceChatCommand {
  type: 'check' | 'search' | 'upload' | 'stats' | 'help';
  projectId?: string;
  municipalityId?: string;
  query?: string;
  ruleCategories?: string[];
}

export interface ComplianceChatResponse {
  success: boolean;
  message: string;
  data?: any;
  suggestions?: string[];
}

export class ComplianceChatService {
  /**
   * Processa un comando chat di compliance
   */
  async processChatCommand(text: string): Promise<ComplianceChatResponse> {
    try {
      console.log('💬 [Compliance Chat] Processamento comando:', text);

      const command = this.parseChatCommand(text);
      if (!command) {
        return {
          success: false,
          message:
            'Comando non riconosciuto. Usa "aiuto compliance" per vedere i comandi disponibili.',
          suggestions: [
            'aiuto compliance',
            'controlla conformità Progetto A',
            'cerca regole distacchi',
          ],
        };
      }

      switch (command.type) {
        case 'check':
          return await this.handleCheckCommand(command);
        case 'search':
          return await this.handleSearchCommand(command);
        case 'upload':
          return await this.handleUploadCommand(command);
        case 'stats':
          return await this.handleStatsCommand(command);
        case 'help':
          return this.handleHelpCommand();
        default:
          return {
            success: false,
            message: 'Tipo di comando non supportato',
          };
      }
    } catch (error) {
      console.error('❌ [Compliance Chat] Errore processamento comando:', error);
      return {
        success: false,
        message: "Errore durante l'elaborazione del comando",
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  /**
   * Parsing del comando chat
   */
  private parseChatCommand(text: string): ComplianceChatCommand | null {
    const lowerText = text.toLowerCase();

    // Controlla conformità
    if (lowerText.includes('controlla conformità') || lowerText.includes('verifica compliance')) {
      return this.parseCheckCommand(text);
    }

    // Cerca regole
    if (
      lowerText.includes('cerca') &&
      (lowerText.includes('regole') || lowerText.includes('norme'))
    ) {
      return this.parseSearchCommand(text);
    }

    // Upload documenti
    if (
      lowerText.includes('carica') ||
      lowerText.includes('upload') ||
      lowerText.includes('aggiungi')
    ) {
      return this.parseUploadCommand(text);
    }

    // Statistiche
    if (
      lowerText.includes('statistiche') ||
      lowerText.includes('stats') ||
      lowerText.includes('stato')
    ) {
      return { type: 'stats' };
    }

    // Aiuto
    if (lowerText.includes('aiuto') || lowerText.includes('help')) {
      return { type: 'help' };
    }

    return null;
  }

  /**
   * Parsing comando controllo
   */
  private parseCheckCommand(text: string): ComplianceChatCommand | null {
    // Pattern: "controlla conformità [Progetto] [Comune]"
    const checkRegex = /controlla conformità (?:di )?([^,\s]+)(?: a ([^,\s]+))?/i;
    const match = text.match(checkRegex);

    if (match) {
      return {
        type: 'check',
        projectId: match[1]?.trim() || '',
        municipalityId: match[2]?.trim() || undefined,
      };
    }

    // Pattern alternativo: "verifica compliance [Progetto]"
    const verifyRegex = /verifica compliance (?:di )?([^,\s]+)/i;
    const verifyMatch = text.match(verifyRegex);

    if (verifyMatch) {
      return {
        type: 'check',
        projectId: verifyMatch[1]?.trim() || '',
      };
    }

    return null;
  }

  /**
   * Parsing comando ricerca
   */
  private parseSearchCommand(text: string): ComplianceChatCommand | null {
    // Pattern: "cerca regole [categoria] [comune]"
    const searchRegex = /cerca (?:regole|norme) (?:di )?([^,\s]+)(?: a ([^,\s]+))?/i;
    const match = text.match(searchRegex);

    if (match) {
      const category = match[1]?.trim() || '';
      const municipality = match[2]?.trim() || undefined;

      // Mappa categorie comuni
      const categoryMap: Record<string, string> = {
        distacchi: 'DISTACCHI',
        altezze: 'ALTEZZE',
        parcheggi: 'PARCHEGGI',
        superfici: 'SUPERFICI',
        volumi: 'VOLUMI',
        accessibilità: 'ACCESSIBILITA',
        ambientale: 'AMBIENTALE',
        storico: 'STORICO',
      };

      return {
        type: 'search',
        query: category,
        ruleCategories: categoryMap[category.toLowerCase()]
          ? [categoryMap[category.toLowerCase()]]
          : undefined,
        municipalityId: municipality,
      };
    }

    return null;
  }

  /**
   * Parsing comando upload
   */
  private parseUploadCommand(text: string): ComplianceChatCommand | null {
    // Pattern: "carica documenti [comune]"
    const uploadRegex =
      /(?:carica|upload|aggiungi) (?:documenti|regolamenti) (?:a |per )?([^,\s]+)/i;
    const match = text.match(uploadRegex);

    if (match) {
      return {
        type: 'upload',
        municipalityId: match[1]?.trim() || '',
      };
    }

    return null;
  }

  /**
   * Gestisce comando controllo
   */
  private async handleCheckCommand(
    command: ComplianceChatCommand
  ): Promise<ComplianceChatResponse> {
    if (!command.projectId) {
      return {
        success: false,
        message: "Specifica l'ID del progetto da controllare",
        suggestions: ['controlla conformità Progetto A', 'verifica compliance Torre B'],
      };
    }

    try {
      const checkRequest: ComplianceCheckRequest = {
        projectId: command.projectId,
        municipalityId: command.municipalityId,
        includeCitations: true,
        includeRecommendations: true,
      };

      const result = await complianceService.checkCompliance(checkRequest);

      if (result.success) {
        const report = result.report;
        const status = this.getStatusEmoji(report.overallStatus);

        return {
          success: true,
          message:
            `${status} Controllo compliance completato per progetto ${command.projectId}!\n\n` +
            `📊 **Score Complessivo**: ${report.overallScore}/100\n` +
            `✅ **Stato**: ${this.getStatusText(report.overallStatus)}\n` +
            `🔍 **Controlli Eseguiti**: ${report.summary.totalChecks}\n` +
            `❌ **Violazioni**: ${report.summary.nonCompliantChecks}\n\n` +
            `📋 **Raccomandazioni**:\n${report.recommendations.map(r => `• ${r}`).join('\n')}`,
          data: { report },
        };
      } else {
        return {
          success: false,
          message: `Errore durante il controllo: ${result.message}`,
        };
      }
    } catch (error) {
      console.error('❌ [Compliance Chat] Errore controllo:', error);
      return {
        success: false,
        message: 'Errore durante il controllo di compliance',
      };
    }
  }

  /**
   * Gestisce comando ricerca
   */
  private async handleSearchCommand(
    command: ComplianceChatCommand
  ): Promise<ComplianceChatResponse> {
    if (!command.query) {
      return {
        success: false,
        message: 'Specifica cosa vuoi cercare',
        suggestions: ['cerca regole distacchi', 'cerca norme altezze Milano'],
      };
    }

    try {
      // Determina comune se non specificato
      let municipalityId = command.municipalityId;
      if (!municipalityId) {
        municipalityId = 'milano'; // Comune di default per ora
      }

      const searchRequest: ComplianceSearchRequest = {
        municipalityId,
        query: command.query,
        categories: command.ruleCategories,
        limit: 5,
        threshold: 0.7,
      };

      const result = await complianceService.searchDocuments(searchRequest);

      if (result.success && result.results.length > 0) {
        const results = result.results.slice(0, 3); // Mostra solo i primi 3 risultati

        let message = `🔍 **Risultati ricerca per "${command.query}"**:\n\n`;

        results.forEach((result, index) => {
          message += `${index + 1}. **${result.section.title}**\n`;
          message += `   📄 Rilevanza: ${Math.round(result.relevance * 100)}%\n`;
          message += `   📝 ${result.section.content.substring(0, 100)}...\n\n`;
        });

        if (result.totalResults > 3) {
          message += `... e altri ${result.totalResults - 3} risultati`;
        }

        return {
          success: true,
          message,
          data: { results: result.results },
        };
      } else {
        return {
          success: true,
          message: `🔍 Nessun risultato trovato per "${command.query}"`,
          data: { results: [] },
        };
      }
    } catch (error) {
      console.error('❌ [Compliance Chat] Errore ricerca:', error);
      return {
        success: false,
        message: 'Errore durante la ricerca',
      };
    }
  }

  /**
   * Gestisce comando upload
   */
  private async handleUploadCommand(
    command: ComplianceChatCommand
  ): Promise<ComplianceChatResponse> {
    if (!command.municipalityId) {
      return {
        success: false,
        message: 'Specifica il comune per cui caricare i documenti',
        suggestions: ['carica documenti Milano', 'upload regolamenti Roma'],
      };
    }

    return {
      success: true,
      message:
        `📤 Per caricare documenti per il comune ${command.municipalityId}, vai alla tab "Compliance" nel dashboard e usa il pulsante "Aggiungi Documenti".\n\n` +
        `Formati supportati: PDF, HTML, TXT\n` +
        `Tipi di documento: Regolamenti urbanistici, Piani regolatori, Norme tecniche`,
      data: { municipalityId: command.municipalityId },
    };
  }

  /**
   * Gestisce comando statistiche
   */
  private async handleStatsCommand(
    command: ComplianceChatCommand
  ): Promise<ComplianceChatResponse> {
    try {
      const stats = await complianceService.getStats();

      return {
        success: true,
        message:
          `📊 **Statistiche Compliance**:\n\n` +
          `📄 **Documenti**: ${stats.totalDocuments}\n` +
          `🔍 **Sezioni Indicizzate**: ${stats.totalSections}\n` +
          `📋 **Regole Attive**: ${stats.totalRules}\n` +
          `📈 **Report Generati**: ${stats.totalReports}\n\n` +
          `🗄️ **Vector Store**: ${stats.vectorStoreStats.type} (${stats.vectorStoreStats.totalSections} sezioni)`,
        data: { stats },
      };
    } catch (error) {
      console.error('❌ [Compliance Chat] Errore statistiche:', error);
      return {
        success: false,
        message: 'Errore durante il recupero delle statistiche',
      };
    }
  }

  /**
   * Gestisce comando aiuto
   */
  private handleHelpCommand(): ComplianceChatResponse {
    return {
      success: true,
      message:
        `🏛️ **Comandi Compliance Disponibili**:\n\n` +
        `🔍 **Controllo Conformità**:\n` +
        `• "controlla conformità Progetto A"\n` +
        `• "verifica compliance Torre B a Milano"\n\n` +
        `📚 **Ricerca Regole**:\n` +
        `• "cerca regole distacchi"\n` +
        `• "cerca norme altezze Roma"\n\n` +
        `📤 **Caricamento Documenti**:\n` +
        `• "carica documenti Milano"\n` +
        `• "upload regolamenti Roma"\n\n` +
        `📊 **Statistiche**:\n` +
        `• "statistiche compliance"\n` +
        `• "stato sistema"\n\n` +
        `❓ **Aiuto**:\n` +
        `• "aiuto compliance"`,
      suggestions: [
        'controlla conformità Progetto A',
        'cerca regole distacchi',
        'carica documenti Milano',
        'statistiche compliance',
      ],
    };
  }

  /**
   * Ottiene emoji per lo status
   */
  private getStatusEmoji(status: string): string {
    switch (status) {
      case 'COMPLIANT':
        return '✅';
      case 'PARTIALLY_COMPLIANT':
        return '⚠️';
      case 'NON_COMPLIANT':
        return '❌';
      case 'REQUIRES_REVIEW':
        return '🔍';
      case 'NOT_APPLICABLE':
        return '➖';
      default:
        return '❓';
    }
  }

  /**
   * Ottiene testo per lo status
   */
  private getStatusText(status: string): string {
    switch (status) {
      case 'COMPLIANT':
        return 'Conforme';
      case 'PARTIALLY_COMPLIANT':
        return 'Parzialmente Conforme';
      case 'NON_COMPLIANT':
        return 'Non Conforme';
      case 'REQUIRES_REVIEW':
        return 'Richiede Revisione';
      case 'NOT_APPLICABLE':
        return 'Non Applicabile';
      default:
        return 'Sconosciuto';
    }
  }
}

// Istanza singleton
export const complianceChatService = new ComplianceChatService();

// Export per compatibilità
export default complianceChatService;
