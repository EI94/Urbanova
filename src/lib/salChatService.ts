// SAL Chat Service - Urbanova AI
// Gestione comandi chat per operazioni SAL

import { salService } from './salService';
import { SALCreateRequest, SALResult } from '@urbanova/types';

export interface SALChatCommand {
  type: 'create' | 'send' | 'sign' | 'pay' | 'status';
  projectId?: string;
  vendorId?: string;
  title?: string;
  amount?: number;
  salId?: string;
  message?: string;
}

export interface SALChatResponse {
  success: boolean;
  message: string;
  sal?: any;
  nextAction?: string;
  errors?: string[];
}

export class SALChatService {
  /**
   * Processa comando chat per SAL
   */
  async processChatCommand(text: string): Promise<SALChatResponse> {
    try {
      console.log('💬 [SAL Chat] Processamento comando:', text);

      const command = this.parseChatCommand(text);

      if (!command) {
        return {
          success: false,
          message:
            'Comando SAL non riconosciuto. Formato: "Crea SAL #3 per Progetto A €145k e invia a Rossi."',
        };
      }

      switch (command.type) {
        case 'create':
          return await this.handleCreateCommand(command);
        case 'send':
          return await this.handleSendCommand(command);
        case 'sign':
          return await this.handleSignCommand(command);
        case 'pay':
          return await this.handlePayCommand(command);
        case 'status':
          return await this.handleStatusCommand(command);
        default:
          return {
            success: false,
            message: 'Tipo di comando non supportato',
          };
      }
    } catch (error) {
      console.error('❌ [SAL Chat] Errore processamento comando:', error);
      return {
        success: false,
        message: "Errore durante l'elaborazione del comando",
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Parsing del comando chat
   */
  private parseChatCommand(text: string): SALChatCommand | null {
    const lowerText = text.toLowerCase();

    // Pattern per creazione SAL
    if (lowerText.includes('crea sal') || lowerText.includes('nuovo sal')) {
      return this.parseCreateCommand(text);
    }

    // Pattern per invio SAL
    if (lowerText.includes('invia') || lowerText.includes('manda')) {
      return this.parseSendCommand(text);
    }

    // Pattern per firma
    if (lowerText.includes('firma') || lowerText.includes('sottoscrivi')) {
      return this.parseSignCommand(text);
    }

    // Pattern per pagamento
    if (lowerText.includes('paga') || lowerText.includes('pagamento')) {
      return this.parsePayCommand(text);
    }

    // Pattern per status
    if (lowerText.includes('stato') || lowerText.includes('status')) {
      return this.parseStatusCommand(text);
    }

    return null;
  }

  /**
   * Parsing comando creazione
   */
  private parseCreateCommand(text: string): SALChatCommand | null {
    // Esempio: "Crea SAL #3 per Progetto A €145k e invia a Rossi"
    const createMatch = text.match(/crea\s+sal\s+#?(\d+)\s+per\s+(.+?)\s+€?(\d+(?:\.\d+)?)k?/i);

    if (createMatch) {
      return {
        type: 'create',
        projectId: createMatch[2].trim(),
        amount: parseFloat(createMatch[3]) * 1000, // Converti k in migliaia
        title: `SAL #${createMatch[1]} - ${createMatch[2].trim()}`,
      };
    }

    return null;
  }

  /**
   * Parsing comando invio
   */
  private parseSendCommand(text: string): SALChatCommand | null {
    // Esempio: "Invia SAL #3 a rossi@email.com"
    const sendMatch = text.match(/invia\s+sal\s+#?(\d+)\s+a\s+([^\s]+)/i);

    if (sendMatch) {
      return {
        type: 'send',
        salId: sendMatch[1],
        vendorId: sendMatch[2],
      };
    }

    return null;
  }

  /**
   * Parsing comando firma
   */
  private parseSignCommand(text: string): SALChatCommand | null {
    // Esempio: "Firma SAL #3 come PM"
    const signMatch = text.match(/firma\s+sal\s+#?(\d+)\s+come\s+(pm|vendor)/i);

    if (signMatch) {
      return {
        type: 'sign',
        salId: signMatch[1],
        message: signMatch[2].toUpperCase(),
      };
    }

    return null;
  }

  /**
   * Parsing comando pagamento
   */
  private parsePayCommand(text: string): SALChatCommand | null {
    // Esempio: "Paga SAL #3"
    const payMatch = text.match(/paga\s+sal\s+#?(\d+)/i);

    if (payMatch) {
      return {
        type: 'pay',
        salId: payMatch[1],
      };
    }

    return null;
  }

  /**
   * Parsing comando status
   */
  private parseStatusCommand(text: string): SALChatCommand | null {
    // Esempio: "Stato SAL #3"
    const statusMatch = text.match(/stato\s+sal\s+#?(\d+)/i);

    if (statusMatch) {
      return {
        type: 'status',
        salId: statusMatch[1] || '',
      };
    }

    return null;
  }

  /**
   * Gestisce comando creazione
   */
  private async handleCreateCommand(command: SALChatCommand): Promise<SALChatResponse> {
    if (!command.projectId || !command.amount) {
      return {
        success: false,
        message: 'Dati mancanti per la creazione del SAL',
      };
    }

    // Crea SAL con dati mock per test
    const salRequest: SALCreateRequest = {
      projectId: command.projectId,
      vendorId: 'vendor-mock-001',
      title: command.title || `SAL per ${command.projectId}`,
      description: `SAL generato tramite chat per il progetto ${command.projectId}`,
      lines: [
        {
          description: 'Servizi di consulenza',
          quantity: 1,
          unit: 'lotto',
          unitPrice: command.amount,
          totalPrice: command.amount,
          category: 'SERVICES',
        },
      ],
      terms: 'Termini e condizioni standard del progetto',
      conditions: [
        'Pagamento a 30 giorni',
        'Conformità alle normative vigenti',
        'Assicurazione responsabilità civile',
      ],
    };

    const result = await salService.create(salRequest);

    if (result.success) {
      return {
        success: true,
        message: `SAL creato con successo! ID: ${result.sal?.id}`,
        sal: result.sal,
        nextAction: 'Ora puoi inviarlo al vendor con: "Invia SAL [ID] a [email]"',
      };
    } else {
      return {
        success: false,
        message: 'Errore durante la creazione del SAL',
        errors: result.errors || ['Errore sconosciuto'],
      };
    }
  }

  /**
   * Gestisce comando invio
   */
  private async handleSendCommand(command: SALChatCommand): Promise<SALChatResponse> {
    if (!command.salId || !command.vendorId) {
      return {
        success: false,
        message: 'ID SAL e email vendor richiesti',
      };
    }

    const result = await salService.send({
      salId: command.salId,
      vendorEmail: command.vendorId,
    });

    if (result.success) {
      return {
        success: true,
        message: 'SAL inviato al vendor con successo!',
        nextAction: 'Il vendor riceverà un email per la firma',
      };
    } else {
      return {
        success: false,
        message: "Errore durante l'invio del SAL",
        errors: result.errors || ['Errore sconosciuto'],
      };
    }
  }

  /**
   * Gestisce comando firma
   */
  private async handleSignCommand(command: SALChatCommand): Promise<SALChatResponse> {
    if (!command.salId) {
      return {
        success: false,
        message: 'ID SAL richiesto per la firma',
      };
    }

    return {
      success: true,
      message: `Per firmare il SAL #${command.salId}, visita la pagina di firma`,
      nextAction: `/sal/sign?token=${Buffer.from(`${command.salId}:PM:${Date.now()}`).toString('base64')}`,
    };
  }

  /**
   * Gestisce comando pagamento
   */
  private async handlePayCommand(command: SALChatCommand): Promise<SALChatResponse> {
    if (!command.salId) {
      return {
        success: false,
        message: 'ID SAL richiesto per il pagamento',
      };
    }

    const result = await salService.pay({
      salId: command.salId,
    });

    if (result.success) {
      return {
        success: true,
        message: 'Pagamento SAL completato con successo!',
        sal: result.sal,
        nextAction: 'Il SAL è ora completato e pagato',
      };
    } else {
      return {
        success: false,
        message: 'Errore durante il pagamento del SAL',
        errors: result.errors || ['Errore sconosciuto'],
      };
    }
  }

  /**
   * Gestisce comando status
   */
  private async handleStatusCommand(command: SALChatCommand): Promise<SALChatResponse> {
    if (!command.salId) {
      return {
        success: false,
        message: 'ID SAL richiesto per lo status',
      };
    }

    const sal = await salService.getSAL(command.salId);

    if (sal) {
      return {
        success: true,
        message: `Stato SAL #${command.salId}: ${sal.status}`,
        sal: sal,
        nextAction: this.getNextActionForStatus(sal.status),
      };
    } else {
      return {
        success: false,
        message: 'SAL non trovato',
      };
    }
  }

  /**
   * Determina la prossima azione basata sullo stato
   */
  private getNextActionForStatus(status: string): string {
    switch (status) {
      case 'DRAFT':
        return 'Invia il SAL al vendor';
      case 'SENT':
        return 'Attendi la firma del vendor';
      case 'SIGNED_VENDOR':
        return 'Firma come PM';
      case 'SIGNED_PM':
        return 'Il SAL è pronto per il pagamento';
      case 'READY_TO_PAY':
        return 'Procedi con il pagamento';
      case 'PAID':
        return 'SAL completato!';
      default:
        return 'Verifica lo stato del SAL';
    }
  }
}

export const salChatService = new SALChatService();
