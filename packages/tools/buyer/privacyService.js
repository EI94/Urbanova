'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.PrivacyService = void 0;
/**
 * Privacy Service
 *
 * Gestione privacy GDPR compliant:
 * - PII minimale
 * - Retention configurabile
 * - Diritti soggetto dati
 * - Pseudonimizzazione
 * - Audit logging
 */
class PrivacyService {
  constructor() {
    this.buyers = new Map();
    this.privacySettings = new Map();
    this.auditLog = [];
  }
  /**
   * Crea buyer con privacy by design
   */
  async createBuyer(projectId, data) {
    const buyerId = `buyer_${Date.now()}`;
    const buyer = {
      id: buyerId,
      projectId,
      name: data?.name || 'Acquirente',
      email: data?.email || '',
      phone: data?.phone || '',
      preferences: data?.preferences || {
        communicationChannels: ['email', 'whatsapp'],
        language: 'it',
        timezone: 'Europe/Rome',
        notifications: {
          appointments: true,
          payments: true,
          documents: true,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active',
      metadata: {},
    };
    // Crea impostazioni privacy di default
    const privacySettings = {
      buyerId,
      retentionPolicy: {
        retentionPeriod: 730, // 2 anni
        autoDelete: true,
        projectBased: true,
        dataCategories: {
          personal: 730,
          financial: 1095, // 3 anni
          documents: 1825, // 5 anni
          communications: 365, // 1 anno
        },
      },
      dataSubjectRights: {
        rightToAccess: true,
        rightToRectification: true,
        rightToErasure: true,
        rightToPortability: true,
        rightToRestriction: true,
        rightToObject: true,
      },
      consent: {
        marketing: false,
        thirdParty: false,
        analytics: true,
        necessary: true,
      },
      pseudonymization: {
        enabled: true,
        method: 'hash',
        salt: `salt_${Date.now()}`,
      },
      auditLogging: {
        enabled: true,
        retention: 2555, // 7 anni
      },
    };
    this.buyers.set(buyerId, buyer);
    this.privacySettings.set(buyerId, privacySettings);
    this.logAuditEvent('buyer_created', {
      buyerId,
      projectId,
      dataProvided: Object.keys(data || {}).length,
    });
    console.log(`👤 Buyer Created - ID: ${buyerId}, Project: ${projectId}`);
    return buyer;
  }
  /**
   * Ottieni buyer
   */
  async getBuyer(buyerId) {
    return this.buyers.get(buyerId) || null;
  }
  /**
   * Aggiorna buyer
   */
  async updateBuyer(buyerId, updates) {
    const buyer = this.buyers.get(buyerId);
    if (!buyer) {
      throw new Error(`Buyer ${buyerId} not found`);
    }
    const originalData = { ...buyer };
    // Aggiorna campi
    if (updates.name) buyer.name = updates.name;
    if (updates.email) buyer.email = updates.email;
    if (updates.phone) buyer.phone = updates.phone;
    if (updates.preferences) buyer.preferences = { ...buyer.preferences, ...updates.preferences };
    if (updates.status) buyer.status = updates.status;
    buyer.updatedAt = new Date();
    this.logAuditEvent('buyer_updated', {
      buyerId,
      changes: Object.keys(updates),
      originalData,
      newData: buyer,
    });
    console.log(`🔄 Buyer Updated - ID: ${buyerId}`);
    return buyer;
  }
  /**
   * Ottieni impostazioni privacy
   */
  async getPrivacySettings(buyerId) {
    return this.privacySettings.get(buyerId) || null;
  }
  /**
   * Aggiorna impostazioni privacy
   */
  async updatePrivacySettings(buyerId, retentionPolicy, dataSubjectRights) {
    const settings = this.privacySettings.get(buyerId);
    if (!settings) {
      throw new Error(`Privacy settings for buyer ${buyerId} not found`);
    }
    const originalSettings = { ...settings };
    // Aggiorna retention policy
    if (retentionPolicy) {
      settings.retentionPolicy = {
        ...settings.retentionPolicy,
        ...retentionPolicy,
      };
    }
    // Aggiorna diritti soggetto dati
    if (dataSubjectRights) {
      settings.dataSubjectRights = {
        ...settings.dataSubjectRights,
        ...dataSubjectRights,
      };
    }
    this.logAuditEvent('privacy_settings_updated', {
      buyerId,
      retentionPolicy: retentionPolicy ? Object.keys(retentionPolicy) : [],
      dataSubjectRights: dataSubjectRights ? Object.keys(dataSubjectRights) : [],
      originalSettings,
      newSettings: settings,
    });
    console.log(`🔒 Privacy Settings Updated - Buyer: ${buyerId}`);
    return settings;
  }
  /**
   * Esporta dati buyer (GDPR right to access)
   */
  async exportBuyerData(buyerId) {
    const buyer = this.buyers.get(buyerId);
    if (!buyer) {
      throw new Error(`Buyer ${buyerId} not found`);
    }
    const privacySettings = this.privacySettings.get(buyerId);
    const buyerAuditLog = this.auditLog.filter(log => log.buyerId === buyerId);
    this.logAuditEvent('data_exported', {
      buyerId,
      exportDate: new Date(),
      dataIncluded: ['buyer', 'privacy_settings', 'audit_log'],
    });
    console.log(`📤 Data Exported - Buyer: ${buyerId}`);
    return {
      buyer,
      privacySettings: privacySettings || {},
      auditLog: buyerAuditLog,
      metadata: {
        exportedAt: new Date(),
        buyerId,
        format: 'json',
        version: '1.0',
      },
    };
  }
  /**
   * Cancella dati buyer (GDPR right to erasure)
   */
  async deleteBuyerData(buyerId, reason) {
    const buyer = this.buyers.get(buyerId);
    if (!buyer) {
      return false;
    }
    // Log prima della cancellazione
    this.logAuditEvent('data_deletion_requested', {
      buyerId,
      reason,
      deletionDate: new Date(),
    });
    // Cancella buyer
    this.buyers.delete(buyerId);
    // Cancella impostazioni privacy
    this.privacySettings.delete(buyerId);
    // Pulisci audit log (mantieni solo eventi di cancellazione)
    this.auditLog = this.auditLog.filter(
      log => log.buyerId !== buyerId || log.event === 'data_deletion_requested'
    );
    this.logAuditEvent('data_deleted', {
      buyerId,
      deletionDate: new Date(),
      reason,
    });
    console.log(
      `🗑️ Buyer Data Deleted - ID: ${buyerId}, Reason: ${reason || 'No reason provided'}`
    );
    return true;
  }
  /**
   * Pseudonimizza dati buyer
   */
  async pseudonymizeBuyer(buyerId) {
    const buyer = this.buyers.get(buyerId);
    if (!buyer) {
      throw new Error(`Buyer ${buyerId} not found`);
    }
    const settings = this.privacySettings.get(buyerId);
    if (!settings?.pseudonymization.enabled) {
      throw new Error(`Pseudonymization not enabled for buyer ${buyerId}`);
    }
    // Pseudonimizza dati sensibili
    const pseudonymizedBuyer = {
      ...buyer,
      name: this.hashValue(buyer.name, settings.pseudonymization.salt),
      email: this.hashValue(buyer.email, settings.pseudonymization.salt),
      phone: this.hashValue(buyer.phone, settings.pseudonymization.salt),
      metadata: {
        ...buyer.metadata,
        pseudonymized: true,
        pseudonymizedAt: new Date(),
        originalId: buyer.id,
      },
    };
    this.buyers.set(buyerId, pseudonymizedBuyer);
    this.logAuditEvent('data_pseudonymized', {
      buyerId,
      pseudonymizationDate: new Date(),
      method: settings.pseudonymization.method,
    });
    console.log(`🔐 Buyer Pseudonymized - ID: ${buyerId}`);
    return pseudonymizedBuyer;
  }
  /**
   * Controlla retention policy
   */
  async checkRetentionPolicy(buyerId) {
    const buyer = this.buyers.get(buyerId);
    const settings = this.privacySettings.get(buyerId);
    if (!buyer || !settings) {
      return { shouldDelete: false, dataToDelete: [] };
    }
    const now = new Date();
    const retentionPeriod = settings.retentionPolicy.retentionPeriod;
    const createdDate = buyer.createdAt;
    const daysSinceCreation = Math.floor(
      (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const shouldDelete = daysSinceCreation > retentionPeriod;
    return {
      shouldDelete,
      reason: shouldDelete ? `Data retention period (${retentionPeriod} days) exceeded` : undefined,
      dataToDelete: shouldDelete ? ['buyer', 'privacy_settings', 'audit_log'] : [],
    };
  }
  /**
   * Applica retention policy automatica
   */
  async applyRetentionPolicy() {
    const buyers = Array.from(this.buyers.values());
    let processed = 0;
    let deleted = 0;
    const errors = [];
    for (const buyer of buyers) {
      try {
        const retentionCheck = await this.checkRetentionPolicy(buyer.id);
        if (retentionCheck.shouldDelete) {
          const deletedSuccessfully = await this.deleteBuyerData(
            buyer.id,
            'Automatic retention policy'
          );
          if (deletedSuccessfully) {
            deleted++;
          } else {
            errors.push(`Failed to delete buyer ${buyer.id}`);
          }
        }
        processed++;
      } catch (error) {
        errors.push(
          `Error processing buyer ${buyer.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
    console.log(
      `🧹 Retention Policy Applied - Processed: ${processed}, Deleted: ${deleted}, Errors: ${errors.length}`
    );
    return { processed, deleted, errors };
  }
  /**
   * Log audit event
   */
  logAuditEvent(event, data) {
    const auditEntry = {
      id: `audit_${Date.now()}`,
      event,
      timestamp: new Date(),
      buyerId: data.buyerId,
      data,
      ipAddress: '127.0.0.1', // Simulato
      userAgent: 'Urbanova-Buyer-Service/1.0',
      sessionId: `session_${Date.now()}`,
    };
    this.auditLog.push(auditEntry);
    // Mantieni solo gli ultimi 1000 eventi per performance
    if (this.auditLog.length > 1000) {
      this.auditLog = this.auditLog.slice(-1000);
    }
  }
  /**
   * Hash value per pseudonimizzazione
   */
  hashValue(value, salt) {
    // Simulazione hash sicuro
    const combined = value + salt;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `hash_${Math.abs(hash).toString(16)}`;
  }
  /**
   * Ottieni audit log
   */
  async getAuditLog(buyerId, fromDate, toDate) {
    let log = this.auditLog;
    if (buyerId) {
      log = log.filter(entry => entry.buyerId === buyerId);
    }
    if (fromDate) {
      log = log.filter(entry => entry.timestamp >= fromDate);
    }
    if (toDate) {
      log = log.filter(entry => entry.timestamp <= toDate);
    }
    return log.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  /**
   * Lista buyer
   */
  async listBuyers(filters = {}) {
    let buyers = Array.from(this.buyers.values());
    if (filters.projectId) {
      buyers = buyers.filter(buyer => buyer.projectId === filters.projectId);
    }
    if (filters.status) {
      buyers = buyers.filter(buyer => buyer.status === filters.status);
    }
    return buyers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  /**
   * Statistiche privacy
   */
  async getPrivacyStats() {
    const buyers = Array.from(this.buyers.values());
    const settings = Array.from(this.privacySettings.values());
    return {
      totalBuyers: buyers.length,
      activeBuyers: buyers.filter(b => b.status === 'active').length,
      pseudonymizedBuyers: buyers.filter(b => b.metadata?.pseudonymized).length,
      retentionPolicyEnabled: settings.filter(s => s.retentionPolicy.autoDelete).length,
      auditLogEntries: this.auditLog.length,
    };
  }
}
exports.PrivacyService = PrivacyService;
//# sourceMappingURL=privacyService.js.map
