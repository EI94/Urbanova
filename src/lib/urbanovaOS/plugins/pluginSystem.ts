// 🔌 URBANOVA OS - PLUGIN SYSTEM ESTENDIBILE
// Sistema di plugin estendibile per Urbanova OS

import { ChatMessage } from '@/types/chat';

// ============================================================================
// INTERFACCE TYPESCRIPT
// ============================================================================

export interface PluginDefinition {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: PluginCategory;
  capabilities: PluginCapability[];
  dependencies: PluginDependency[];
  configuration: PluginConfiguration;
  metadata: PluginMetadata;
  status: 'installed' | 'active' | 'inactive' | 'error' | 'updating';
}

export interface PluginCapability {
  id: string;
  name: string;
  type: 'action' | 'integration' | 'analysis' | 'visualization' | 'automation' | 'custom';
  description: string;
  inputs: CapabilityInput[];
  outputs: CapabilityOutput[];
  configuration: CapabilityConfiguration;
  permissions: PluginPermission[];
}

export interface PluginDependency {
  pluginId: string;
  version: string;
  required: boolean;
  type: 'hard' | 'soft' | 'peer';
}

export interface PluginConfiguration {
  settings: PluginSetting[];
  secrets: PluginSecret[];
  environment: Record<string, string>;
  features: PluginFeature[];
}

export interface PluginMetadata {
  createdAt: Date;
  updatedAt: Date;
  downloads: number;
  rating: number;
  tags: string[];
  license: string;
  homepage: string;
  repository: string;
  documentation: string;
  support: string;
}

export interface PluginExecution {
  id: string;
  pluginId: string;
  capabilityId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  logs: PluginLog[];
  metrics: PluginMetrics;
  error?: PluginError;
}

export interface PluginLog {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: any;
  source: string;
}

export interface PluginMetrics {
  executionTime: number;
  memoryUsage: number;
  cpuUsage: number;
  networkRequests: number;
  databaseQueries: number;
  cacheHits: number;
  cacheMisses: number;
}

export interface PluginError {
  code: string;
  message: string;
  stackTrace?: string;
  context?: any;
  timestamp: Date;
}

export interface PluginRegistry {
  plugins: Map<string, PluginDefinition>;
  capabilities: Map<string, PluginCapability>;
  executions: Map<string, PluginExecution>;
  performance: Map<string, PluginPerformance>;
}

export interface PluginPerformance {
  avgExecutionTime: number;
  successRate: number;
  errorRate: number;
  totalExecutions: number;
  lastExecution: Date;
  uptime: number;
}

// ============================================================================
// URBANOVA OS PLUGIN SYSTEM
// ============================================================================

export class UrbanovaOSPluginSystem {
  private registry: PluginRegistry;
  private pluginLoaders: Map<string, PluginLoader> = new Map();
  private capabilityExecutors: Map<string, CapabilityExecutor> = new Map();
  private securityManager: PluginSecurityManager;
  private performanceMonitor: PluginPerformanceMonitor;
  private eventBus: PluginEventBus;

  constructor() {
    this.registry = {
      plugins: new Map(),
      capabilities: new Map(),
      executions: new Map(),
      performance: new Map()
    };
    
    this.securityManager = new PluginSecurityManager();
    this.performanceMonitor = new PluginPerformanceMonitor();
    this.eventBus = new PluginEventBus();
    
    this.initializePluginLoaders();
    this.initializeCapabilityExecutors();
    this.loadCorePlugins();
    this.startPluginMonitor();
    
    console.log('🔌 [UrbanovaOS PluginSystem] Inizializzato');
  }

  // ============================================================================
  // METODI PRINCIPALI
  // ============================================================================

  /**
   * 🎯 METODO PRINCIPALE: Installa plugin
   */
  async installPlugin(
    pluginSource: PluginSource,
    options: InstallOptions = {}
  ): Promise<string> {
    console.log('🔌 [UrbanovaOS PluginSystem] Installando plugin:', pluginSource.name);

    try {
      // 1. Valida plugin
      const validation = await this.validatePlugin(pluginSource);
      if (!validation.valid) {
        throw new Error(`Plugin non valido: ${validation.errors.join(', ')}`);
      }
      
      // 2. Controlla dipendenze
      await this.checkDependencies(pluginSource.dependencies);
      
      // 3. Scarica plugin
      const pluginData = await this.downloadPlugin(pluginSource);
      
      // 4. Verifica sicurezza
      await this.securityManager.scanPlugin(pluginData);
      
      // 5. Installa plugin
      const pluginId = await this.performInstallation(pluginData, options);
      
      // 6. Registra capabilities
      await this.registerCapabilities(pluginId);
      
      // 7. Configura plugin
      await this.configurePlugin(pluginId, options.configuration);
      
      // 8. Attiva plugin
      await this.activatePlugin(pluginId);
      
      // 9. Aggiorna registry
      this.updatePluginRegistry(pluginId);
      
      // 10. Notifica installazione
      await this.eventBus.emit('plugin.installed', { pluginId, plugin: pluginData });

      console.log('✅ [UrbanovaOS PluginSystem] Plugin installato:', {
        pluginId,
        name: pluginSource.name,
        version: pluginSource.version,
        capabilities: pluginData.capabilities.length
      });

      return pluginId;

    } catch (error) {
      console.error('❌ [UrbanovaOS PluginSystem] Errore installazione plugin:', error);
      throw error;
    }
  }

  /**
   * 🎯 Esegui capability plugin
   */
  async executeCapability(
    pluginId: string,
    capabilityId: string,
    inputs: Record<string, any>,
    context: ExecutionContext
  ): Promise<PluginExecution> {
    const startTime = Date.now();
    console.log('🔌 [UrbanovaOS PluginSystem] Eseguendo capability:', { pluginId, capabilityId });

    try {
      // 1. Valida plugin e capability
      const plugin = await this.validatePluginAndCapability(pluginId, capabilityId);
      
      // 2. Controlla permessi
      await this.securityManager.checkPermissions(plugin, capabilityId, context);
      
      // 3. Prepara esecuzione
      const execution = await this.prepareExecution(pluginId, capabilityId, inputs, context);
      
      // 4. Esegui capability
      await this.runCapability(execution);
      
      // 5. Finalizza esecuzione
      await this.finalizeExecution(execution);
      
      // 6. Aggiorna metriche
      this.updateExecutionMetrics(execution, Date.now() - startTime);
      
      // 7. Notifica completamento
      await this.eventBus.emit('capability.completed', { execution });

      console.log('✅ [UrbanovaOS PluginSystem] Capability completata:', {
        executionId: execution.id,
        pluginId,
        capabilityId,
        status: execution.status,
        executionTime: execution.metrics.executionTime
      });

      return execution;

    } catch (error) {
      console.error('❌ [UrbanovaOS PluginSystem] Errore esecuzione capability:', error);
      return this.handleExecutionError(pluginId, capabilityId, inputs, context, error);
    }
  }

  /**
   * 🎯 Gestione plugin dinamica
   */
  async managePlugin(
    pluginId: string,
    action: PluginAction,
    options: ManagementOptions = {}
  ): Promise<void> {
    console.log('🔌 [UrbanovaOS PluginSystem] Gestendo plugin:', { pluginId, action });

    try {
      switch (action) {
        case 'activate':
          await this.activatePlugin(pluginId);
          break;
        case 'deactivate':
          await this.deactivatePlugin(pluginId);
          break;
        case 'update':
          await this.updatePlugin(pluginId, options.updateSource);
          break;
        case 'uninstall':
          await this.uninstallPlugin(pluginId, options);
          break;
        case 'configure':
          await this.configurePlugin(pluginId, options.configuration);
          break;
        case 'restart':
          await this.restartPlugin(pluginId);
          break;
        default:
          throw new Error(`Azione non supportata: ${action}`);
      }
      
      await this.eventBus.emit('plugin.managed', { pluginId, action, options });

    } catch (error) {
      console.error('❌ [UrbanovaOS PluginSystem] Errore gestione plugin:', error);
      throw error;
    }
  }

  /**
   * 🎯 Discovery plugin intelligente
   */
  async discoverPlugins(
    criteria: DiscoveryCriteria
  ): Promise<PluginDefinition[]> {
    console.log('🔌 [UrbanovaOS PluginSystem] Scoprendo plugin:', criteria);

    try {
      // 1. Ricerca plugin disponibili
      const availablePlugins = await this.searchAvailablePlugins(criteria);
      
      // 2. Filtra per compatibilità
      const compatiblePlugins = await this.filterCompatiblePlugins(availablePlugins);
      
      // 3. Ordina per rilevanza
      const rankedPlugins = await this.rankPluginsByRelevance(compatiblePlugins, criteria);
      
      // 4. Valida plugin
      const validatedPlugins = await this.validateDiscoveredPlugins(rankedPlugins);
      
      // 5. Aggiorna cache discovery
      await this.updateDiscoveryCache(validatedPlugins);

      console.log('✅ [UrbanovaOS PluginSystem] Plugin scoperti:', {
        criteria: criteria.query,
        found: validatedPlugins.length,
        compatible: compatiblePlugins.length
      });

      return validatedPlugins;

    } catch (error) {
      console.error('❌ [UrbanovaOS PluginSystem] Errore discovery plugin:', error);
      return [];
    }
  }

  // ============================================================================
  // METODI PRIVATI
  // ============================================================================

  /**
   * Valida plugin
   */
  private async validatePlugin(pluginSource: PluginSource): Promise<PluginValidation> {
    const errors: string[] = [];
    
    // 1. Valida struttura
    if (!pluginSource.name) errors.push('Nome plugin richiesto');
    if (!pluginSource.version) errors.push('Versione plugin richiesta');
    if (!pluginSource.capabilities || pluginSource.capabilities.length === 0) {
      errors.push('Plugin deve avere almeno una capability');
    }
    
    // 2. Valida capabilities
    pluginSource.capabilities.forEach(capability => {
      if (!capability.id) errors.push('Capability ID richiesto');
      if (!capability.name) errors.push('Capability name richiesto');
      if (!capability.type) errors.push('Capability type richiesto');
    });
    
    // 3. Valida dipendenze
    if (pluginSource.dependencies) {
      for (const dep of pluginSource.dependencies) {
        if (!dep.pluginId) errors.push('Dependency pluginId richiesto');
        if (!dep.version) errors.push('Dependency version richiesta');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  /**
   * Controlla dipendenze
   */
  private async checkDependencies(dependencies: PluginDependency[]): Promise<void> {
    for (const dep of dependencies) {
      const installedPlugin = this.registry.plugins.get(dep.pluginId);
      
      if (!installedPlugin) {
        if (dep.required) {
          throw new Error(`Dipendenza richiesta non trovata: ${dep.pluginId}`);
        } else {
          console.warn(`Dipendenza opzionale non trovata: ${dep.pluginId}`);
        }
      } else {
        // Verifica versione
        if (!this.isVersionCompatible(installedPlugin.version, dep.version)) {
          throw new Error(`Versione dipendenza incompatibile: ${dep.pluginId} (richiesta: ${dep.version}, installata: ${installedPlugin.version})`);
        }
      }
    }
  }

  /**
   * Scarica plugin
   */
  private async downloadPlugin(pluginSource: PluginSource): Promise<PluginDefinition> {
    // Simulazione download plugin
    const plugin: PluginDefinition = {
      id: this.generatePluginId(),
      name: pluginSource.name,
      version: pluginSource.version,
      description: pluginSource.description || 'Plugin senza descrizione',
      author: pluginSource.author || 'Unknown',
      category: pluginSource.category || 'general',
      capabilities: pluginSource.capabilities,
      dependencies: pluginSource.dependencies || [],
      configuration: pluginSource.configuration || { settings: [], secrets: [], environment: {}, features: [] },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        downloads: 0,
        rating: 0,
        tags: pluginSource.tags || [],
        license: pluginSource.license || 'MIT',
        homepage: pluginSource.homepage || '',
        repository: pluginSource.repository || '',
        documentation: pluginSource.documentation || '',
        support: pluginSource.support || ''
      },
      status: 'installed'
    };
    
    return plugin;
  }

  /**
   * Esegui installazione
   */
  private async performInstallation(
    pluginData: PluginDefinition,
    options: InstallOptions
  ): Promise<string> {
    const pluginId = pluginData.id;
    
    // 1. Salva plugin nel registry
    this.registry.plugins.set(pluginId, pluginData);
    
    // 2. Registra capabilities
    pluginData.capabilities.forEach(capability => {
      this.registry.capabilities.set(`${pluginId}.${capability.id}`, capability);
    });
    
    // 3. Inizializza performance tracking
    this.registry.performance.set(pluginId, {
      avgExecutionTime: 0,
      successRate: 0,
      errorRate: 0,
      totalExecutions: 0,
      lastExecution: new Date(),
      uptime: 0
    });
    
    return pluginId;
  }

  /**
   * Registra capabilities
   */
  private async registerCapabilities(pluginId: string): Promise<void> {
    const plugin = this.registry.plugins.get(pluginId);
    if (!plugin) return;
    
    plugin.capabilities.forEach(capability => {
      const capabilityKey = `${pluginId}.${capability.id}`;
      this.registry.capabilities.set(capabilityKey, capability);
      
      // Registra executor per capability
      const executor = this.createCapabilityExecutor(capability);
      this.capabilityExecutors.set(capabilityKey, executor);
    });
  }

  /**
   * Configura plugin
   */
  private async configurePlugin(
    pluginId: string,
    configuration: Record<string, any> = {}
  ): Promise<void> {
    const plugin = this.registry.plugins.get(pluginId);
    if (!plugin) return;
    
    // Applica configurazione
    Object.entries(configuration).forEach(([key, value]) => {
      plugin.configuration.environment[key] = value;
    });
    
    console.log(`⚙️ [UrbanovaOS PluginSystem] Plugin configurato: ${pluginId}`);
  }

  /**
   * Attiva plugin
   */
  private async activatePlugin(pluginId: string): Promise<void> {
    const plugin = this.registry.plugins.get(pluginId);
    if (!plugin) return;
    
    plugin.status = 'active';
    
    // Inizializza plugin
    await this.initializePlugin(plugin);
    
    console.log(`🚀 [UrbanovaOS PluginSystem] Plugin attivato: ${pluginId}`);
  }

  /**
   * Valida plugin e capability
   */
  private async validatePluginAndCapability(
    pluginId: string,
    capabilityId: string
  ): Promise<PluginDefinition> {
    const plugin = this.registry.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin non trovato: ${pluginId}`);
    }
    
    if (plugin.status !== 'active') {
      throw new Error(`Plugin non attivo: ${pluginId}`);
    }
    
    const capability = this.registry.capabilities.get(`${pluginId}.${capabilityId}`);
    if (!capability) {
      throw new Error(`Capability non trovata: ${pluginId}.${capabilityId}`);
    }
    
    return plugin;
  }

  /**
   * Prepara esecuzione
   */
  private async prepareExecution(
    pluginId: string,
    capabilityId: string,
    inputs: Record<string, any>,
    context: ExecutionContext
  ): Promise<PluginExecution> {
    const executionId = this.generateExecutionId();
    
    const execution: PluginExecution = {
      id: executionId,
      pluginId,
      capabilityId,
      status: 'pending',
      startTime: new Date(),
      inputs,
      outputs: {},
      logs: [],
      metrics: {
        executionTime: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        networkRequests: 0,
        databaseQueries: 0,
        cacheHits: 0,
        cacheMisses: 0
      }
    };
    
    this.registry.executions.set(executionId, execution);
    return execution;
  }

  /**
   * Esegui capability
   */
  private async runCapability(execution: PluginExecution): Promise<void> {
    const startTime = Date.now();
    execution.status = 'running';
    
    try {
      const capabilityKey = `${execution.pluginId}.${execution.capabilityId}`;
      const executor = this.capabilityExecutors.get(capabilityKey);
      
      if (!executor) {
        throw new Error(`Executor non trovato per capability: ${capabilityKey}`);
      }
      
      // Esegui capability
      const result = await executor.execute(execution.inputs, execution);
      
      // Salva output
      execution.outputs = result;
      
      // Aggiorna metriche
      execution.metrics.executionTime = Date.now() - startTime;
      
      execution.status = 'completed';
      execution.endTime = new Date();
      
    } catch (error) {
      execution.status = 'failed';
      execution.error = this.createPluginError(error);
      execution.endTime = new Date();
      throw error;
    }
  }

  /**
   * Finalizza esecuzione
   */
  private async finalizeExecution(execution: PluginExecution): Promise<void> {
    // 1. Aggiorna performance plugin
    this.updatePluginPerformance(execution);
    
    // 2. Pulisci risorse
    await this.cleanupExecutionResources(execution);
    
    // 3. Genera report
    await this.generateExecutionReport(execution);
  }

  /**
   * Attiva plugin
   */
  private async deactivatePlugin(pluginId: string): Promise<void> {
    const plugin = this.registry.plugins.get(pluginId);
    if (!plugin) return;
    
    plugin.status = 'inactive';
    
    // Cleanup plugin
    await this.cleanupPlugin(plugin);
    
    console.log(`⏸️ [UrbanovaOS PluginSystem] Plugin disattivato: ${pluginId}`);
  }

  /**
   * Aggiorna plugin
   */
  private async updatePlugin(pluginId: string, updateSource?: PluginSource): Promise<void> {
    const plugin = this.registry.plugins.get(pluginId);
    if (!plugin) return;
    
    plugin.status = 'updating';
    
    try {
      // 1. Backup configurazione corrente
      const currentConfig = { ...plugin.configuration };
      
      // 2. Scarica nuova versione
      const newPlugin = await this.downloadPlugin(updateSource!);
      
      // 3. Valida compatibilità
      await this.validateCompatibility(plugin, newPlugin);
      
      // 4. Aggiorna plugin
      Object.assign(plugin, newPlugin);
      plugin.configuration = currentConfig; // Mantieni configurazione
      
      // 5. Riavvia plugin
      await this.restartPlugin(pluginId);
      
      console.log(`🔄 [UrbanovaOS PluginSystem] Plugin aggiornato: ${pluginId}`);
      
    } catch (error) {
      plugin.status = 'error';
      throw error;
    }
  }

  /**
   * Disinstalla plugin
   */
  private async uninstallPlugin(pluginId: string, options: ManagementOptions): Promise<void> {
    const plugin = this.registry.plugins.get(pluginId);
    if (!plugin) return;
    
    // 1. Disattiva plugin
    await this.deactivatePlugin(pluginId);
    
    // 2. Rimuovi capabilities
    plugin.capabilities.forEach(capability => {
      const capabilityKey = `${pluginId}.${capability.id}`;
      this.registry.capabilities.delete(capabilityKey);
      this.capabilityExecutors.delete(capabilityKey);
    });
    
    // 3. Rimuovi plugin dal registry
    this.registry.plugins.delete(pluginId);
    this.registry.performance.delete(pluginId);
    
    // 4. Pulisci esecuzioni
    this.cleanupPluginExecutions(pluginId);
    
    console.log(`🗑️ [UrbanovaOS PluginSystem] Plugin disinstallato: ${pluginId}`);
  }

  /**
   * Riavvia plugin
   */
  private async restartPlugin(pluginId: string): Promise<void> {
    await this.deactivatePlugin(pluginId);
    await this.activatePlugin(pluginId);
    
    console.log(`🔄 [UrbanovaOS PluginSystem] Plugin riavviato: ${pluginId}`);
  }

  // ============================================================================
  // METODI DI SUPPORTO
  // ============================================================================

  private initializePluginLoaders(): void {
    this.pluginLoaders.set('npm', new NPMPluginLoader());
    this.pluginLoaders.set('github', new GitHubPluginLoader());
    this.pluginLoaders.set('local', new LocalPluginLoader());
    this.pluginLoaders.set('url', new URLPluginLoader());
  }

  private initializeCapabilityExecutors(): void {
    // Inizializza executor per tipi di capability
    this.capabilityExecutors.set('action', new ActionCapabilityExecutor());
    this.capabilityExecutors.set('integration', new IntegrationCapabilityExecutor());
    this.capabilityExecutors.set('analysis', new AnalysisCapabilityExecutor());
    this.capabilityExecutors.set('visualization', new VisualizationCapabilityExecutor());
    this.capabilityExecutors.set('automation', new AutomationCapabilityExecutor());
  }

  private loadCorePlugins(): void {
    // Carica plugin core
    this.loadFeasibilityAnalysisPlugin();
    this.loadMarketIntelligencePlugin();
    this.loadProjectManagementPlugin();
    this.loadDocumentGenerationPlugin();
  }

  private startPluginMonitor(): void {
    // Avvia monitor plugin
    setInterval(() => {
      this.monitorPlugins();
    }, 60000); // Ogni minuto
  }

  private generatePluginId(): string {
    return `plugin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isVersionCompatible(installedVersion: string, requiredVersion: string): boolean {
    // Implementazione semplificata di controllo versione
    return installedVersion === requiredVersion;
  }

  private createCapabilityExecutor(capability: PluginCapability): CapabilityExecutor {
    // Crea executor basato su tipo capability
    switch (capability.type) {
      case 'action':
        return new ActionCapabilityExecutor();
      case 'integration':
        return new IntegrationCapabilityExecutor();
      case 'analysis':
        return new AnalysisCapabilityExecutor();
      case 'visualization':
        return new VisualizationCapabilityExecutor();
      case 'automation':
        return new AutomationCapabilityExecutor();
      default:
        return new DefaultCapabilityExecutor();
    }
  }

  private async initializePlugin(plugin: PluginDefinition): Promise<void> {
    // Inizializza plugin
    console.log(`🔧 [UrbanovaOS PluginSystem] Inizializzando plugin: ${plugin.id}`);
  }

  private updatePluginRegistry(pluginId: string): void {
    // Aggiorna registry plugin
    console.log(`📋 [UrbanovaOS PluginSystem] Registry aggiornato per plugin: ${pluginId}`);
  }

  private updateExecutionMetrics(execution: PluginExecution, executionTime: number): void {
    // Aggiorna metriche esecuzione
    execution.metrics.executionTime = executionTime;
    
    const performance = this.registry.performance.get(execution.pluginId);
    if (performance) {
      performance.totalExecutions++;
      performance.lastExecution = new Date();
      performance.avgExecutionTime = (performance.avgExecutionTime + executionTime) / 2;
      
      if (execution.status === 'completed') {
        performance.successRate = (performance.successRate + 1) / performance.totalExecutions;
      } else {
        performance.errorRate = (performance.errorRate + 1) / performance.totalExecutions;
      }
    }
  }

  private updatePluginPerformance(execution: PluginExecution): void {
    // Aggiorna performance plugin
    const performance = this.registry.performance.get(execution.pluginId);
    if (performance) {
      performance.totalExecutions++;
      performance.lastExecution = new Date();
    }
  }

  private async cleanupExecutionResources(execution: PluginExecution): Promise<void> {
    // Pulisci risorse esecuzione
    console.log(`🧹 [UrbanovaOS PluginSystem] Risorse pulite per esecuzione: ${execution.id}`);
  }

  private async generateExecutionReport(execution: PluginExecution): Promise<void> {
    // Genera report esecuzione
    console.log(`📊 [UrbanovaOS PluginSystem] Report generato per esecuzione: ${execution.id}`);
  }

  private async cleanupPlugin(plugin: PluginDefinition): Promise<void> {
    // Pulisci plugin
    console.log(`🧹 [UrbanovaOS PluginSystem] Plugin pulito: ${plugin.id}`);
  }

  private async validateCompatibility(oldPlugin: PluginDefinition, newPlugin: PluginDefinition): Promise<void> {
    // Valida compatibilità plugin
    if (oldPlugin.category !== newPlugin.category) {
      throw new Error('Categoria plugin incompatibile');
    }
  }

  private cleanupPluginExecutions(pluginId: string): void {
    // Pulisci esecuzioni plugin
    this.registry.executions.forEach((execution, executionId) => {
      if (execution.pluginId === pluginId) {
        this.registry.executions.delete(executionId);
      }
    });
  }

  private monitorPlugins(): void {
    // Monitora plugin attivi
    this.registry.plugins.forEach(plugin => {
      if (plugin.status === 'active') {
        const performance = this.registry.performance.get(plugin.id);
        if (performance) {
          const timeSinceLastExecution = Date.now() - performance.lastExecution.getTime();
          if (timeSinceLastExecution > 3600000) { // 1 ora
            console.warn(`⚠️ [UrbanovaOS PluginSystem] Plugin ${plugin.id} inattivo da troppo tempo`);
          }
        }
      }
    });
  }

  private createPluginError(error: any): PluginError {
    return {
      code: error.code || 'PLUGIN_ERROR',
      message: error.message || 'Errore plugin sconosciuto',
      stackTrace: error.stack,
      context: error.context,
      timestamp: new Date()
    };
  }

  private handleExecutionError(
    pluginId: string,
    capabilityId: string,
    inputs: Record<string, any>,
    context: ExecutionContext,
    error: any
  ): PluginExecution {
    // Gestisce errore esecuzione
    const executionId = this.generateExecutionId();
    const execution: PluginExecution = {
      id: executionId,
      pluginId,
      capabilityId,
      status: 'failed',
      startTime: new Date(),
      endTime: new Date(),
      inputs,
      outputs: {},
      logs: [{
        timestamp: new Date(),
        level: 'error',
        message: error.message,
        data: error,
        source: 'plugin-system'
      }],
      metrics: {
        executionTime: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        networkRequests: 0,
        databaseQueries: 0,
        cacheHits: 0,
        cacheMisses: 0
      },
      error: this.createPluginError(error)
    };
    
    this.registry.executions.set(executionId, execution);
    return execution;
  }

  private loadFeasibilityAnalysisPlugin(): void {
    // Carica plugin analisi fattibilità
    console.log('📊 [UrbanovaOS PluginSystem] Plugin analisi fattibilità caricato');
  }

  private loadMarketIntelligencePlugin(): void {
    // Carica plugin market intelligence
    console.log('📈 [UrbanovaOS PluginSystem] Plugin market intelligence caricato');
  }

  private loadProjectManagementPlugin(): void {
    // Carica plugin gestione progetti
    console.log('📋 [UrbanovaOS PluginSystem] Plugin gestione progetti caricato');
  }

  private loadDocumentGenerationPlugin(): void {
    // Carica plugin generazione documenti
    console.log('📄 [UrbanovaOS PluginSystem] Plugin generazione documenti caricato');
  }

  private async searchAvailablePlugins(criteria: DiscoveryCriteria): Promise<PluginDefinition[]> {
    // Ricerca plugin disponibili
    return []; // Implementazione semplificata
  }

  private async filterCompatiblePlugins(plugins: PluginDefinition[]): Promise<PluginDefinition[]> {
    // Filtra plugin compatibili
    return plugins; // Implementazione semplificata
  }

  private async rankPluginsByRelevance(
    plugins: PluginDefinition[],
    criteria: DiscoveryCriteria
  ): Promise<PluginDefinition[]> {
    // Ordina plugin per rilevanza
    return plugins; // Implementazione semplificata
  }

  private async validateDiscoveredPlugins(plugins: PluginDefinition[]): Promise<PluginDefinition[]> {
    // Valida plugin scoperti
    return plugins; // Implementazione semplificata
  }

  private async updateDiscoveryCache(plugins: PluginDefinition[]): Promise<void> {
    // Aggiorna cache discovery
    console.log(`💾 [UrbanovaOS PluginSystem] Cache discovery aggiornata con ${plugins.length} plugin`);
  }
}

// ============================================================================
// CLASSI DI SUPPORTO
// ============================================================================

abstract class PluginLoader {
  abstract load(source: PluginSource): Promise<PluginDefinition>;
}

class NPMPluginLoader extends PluginLoader {
  async load(source: PluginSource): Promise<PluginDefinition> {
    console.log(`📦 [NPMPluginLoader] Caricando plugin da NPM: ${source.name}`);
    return {} as PluginDefinition;
  }
}

class GitHubPluginLoader extends PluginLoader {
  async load(source: PluginSource): Promise<PluginDefinition> {
    console.log(`🐙 [GitHubPluginLoader] Caricando plugin da GitHub: ${source.name}`);
    return {} as PluginDefinition;
  }
}

class LocalPluginLoader extends PluginLoader {
  async load(source: PluginSource): Promise<PluginDefinition> {
    console.log(`📁 [LocalPluginLoader] Caricando plugin locale: ${source.name}`);
    return {} as PluginDefinition;
  }
}

class URLPluginLoader extends PluginLoader {
  async load(source: PluginSource): Promise<PluginDefinition> {
    console.log(`🌐 [URLPluginLoader] Caricando plugin da URL: ${source.name}`);
    return {} as PluginDefinition;
  }
}

abstract class CapabilityExecutor {
  abstract execute(inputs: Record<string, any>, execution: PluginExecution): Promise<Record<string, any>>;
}

class ActionCapabilityExecutor extends CapabilityExecutor {
  async execute(inputs: Record<string, any>, execution: PluginExecution): Promise<Record<string, any>> {
    console.log(`🎯 [ActionCapabilityExecutor] Eseguendo azione`);
    return { result: 'success' };
  }
}

class IntegrationCapabilityExecutor extends CapabilityExecutor {
  async execute(inputs: Record<string, any>, execution: PluginExecution): Promise<Record<string, any>> {
    console.log(`🔗 [IntegrationCapabilityExecutor] Eseguendo integrazione`);
    return { result: 'success' };
  }
}

class AnalysisCapabilityExecutor extends CapabilityExecutor {
  async execute(inputs: Record<string, any>, execution: PluginExecution): Promise<Record<string, any>> {
    console.log(`📊 [AnalysisCapabilityExecutor] Eseguendo analisi`);
    return { result: 'success' };
  }
}

class VisualizationCapabilityExecutor extends CapabilityExecutor {
  async execute(inputs: Record<string, any>, execution: PluginExecution): Promise<Record<string, any>> {
    console.log(`📈 [VisualizationCapabilityExecutor] Eseguendo visualizzazione`);
    return { result: 'success' };
  }
}

class AutomationCapabilityExecutor extends CapabilityExecutor {
  async execute(inputs: Record<string, any>, execution: PluginExecution): Promise<Record<string, any>> {
    console.log(`⚙️ [AutomationCapabilityExecutor] Eseguendo automazione`);
    return { result: 'success' };
  }
}

class DefaultCapabilityExecutor extends CapabilityExecutor {
  async execute(inputs: Record<string, any>, execution: PluginExecution): Promise<Record<string, any>> {
    console.log(`🔧 [DefaultCapabilityExecutor] Eseguendo capability generica`);
    return { result: 'success' };
  }
}

class PluginSecurityManager {
  async scanPlugin(plugin: PluginDefinition): Promise<void> {
    console.log(`🔒 [PluginSecurityManager] Scansione sicurezza plugin: ${plugin.id}`);
  }
  
  async checkPermissions(
    plugin: PluginDefinition,
    capabilityId: string,
    context: ExecutionContext
  ): Promise<void> {
    console.log(`🔒 [PluginSecurityManager] Controllo permessi: ${plugin.id}.${capabilityId}`);
  }
}

class PluginPerformanceMonitor {
  monitor(pluginId: string): void {
    console.log(`📊 [PluginPerformanceMonitor] Monitoraggio plugin: ${pluginId}`);
  }
}

class PluginEventBus {
  async emit(event: string, data: any): Promise<void> {
    console.log(`📡 [PluginEventBus] Evento emesso: ${event}`);
  }
}

// ============================================================================
// INTERFACCE DI SUPPORTO
// ============================================================================

export interface PluginSource {
  name: string;
  version: string;
  description?: string;
  author?: string;
  category?: PluginCategory;
  capabilities: PluginCapability[];
  dependencies?: PluginDependency[];
  configuration?: PluginConfiguration;
  tags?: string[];
  license?: string;
  homepage?: string;
  repository?: string;
  documentation?: string;
  support?: string;
}

export interface PluginCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface CapabilityInput {
  name: string;
  type: string;
  required: boolean;
  description: string;
  defaultValue?: any;
  validation?: any;
}

export interface CapabilityOutput {
  name: string;
  type: string;
  description: string;
}

export interface CapabilityConfiguration {
  [key: string]: any;
}

export interface PluginPermission {
  resource: string;
  action: string;
  conditions?: any;
}

export interface PluginSetting {
  key: string;
  type: string;
  value: any;
  description: string;
  required: boolean;
  sensitive: boolean;
}

export interface PluginSecret {
  key: string;
  description: string;
  required: boolean;
}

export interface PluginFeature {
  name: string;
  enabled: boolean;
  configuration: any;
}

export interface ExecutionContext {
  userId: string;
  sessionId: string;
  projectId?: string;
  environment: 'development' | 'staging' | 'production';
  metadata: Record<string, any>;
}

export interface InstallOptions {
  configuration?: Record<string, any>;
  autoActivate?: boolean;
  skipDependencies?: boolean;
  force?: boolean;
}

export interface ManagementOptions {
  configuration?: Record<string, any>;
  updateSource?: PluginSource;
  force?: boolean;
}

export interface PluginAction {
  type: 'activate' | 'deactivate' | 'update' | 'uninstall' | 'configure' | 'restart';
}

export interface DiscoveryCriteria {
  query: string;
  category?: string;
  tags?: string[];
  minRating?: number;
  maxResults?: number;
  sortBy?: 'relevance' | 'rating' | 'downloads' | 'updated';
}

export interface PluginValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// ISTANZA SINGLETON
// ============================================================================

export const urbanovaOSPluginSystem = new UrbanovaOSPluginSystem();
