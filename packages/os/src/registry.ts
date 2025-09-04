// Capability Registry - Urbanova OS
// import { Capability, CapabilitySpec } from '@urbanova/types';

// Mock types
type Capability = any;
type CapabilitySpec = any;

export class CapabilityRegistry {
  private capabilities: Map<string, Capability> = new Map();

  /**
   * Registra una nuova capability
   */
  register(capability: Capability): void {
    if (this.capabilities.has(capability.spec.name)) {
      throw new Error(`Capability ${capability.spec.name} already registered`);
    }

    this.capabilities.set(capability.spec.name, capability);
    console.log(`✅ [Registry] Capability registrata: ${capability.spec.name}`);
  }

  /**
   * Ottiene una capability per nome
   */
  get(name: string): Capability | undefined {
    return this.capabilities.get(name);
  }

  /**
   * Lista tutte le capability registrate
   */
  list(): Capability[] {
    return Array.from(this.capabilities.values());
  }

  /**
   * Lista capability per ruolo richiesto
   */
  listByRole(role: string): Capability[] {
    return this.list().filter(cap => cap.spec.requiredRole === role);
  }

  /**
   * Verifica se una capability esiste
   */
  has(name: string): boolean {
    return this.capabilities.has(name);
  }

  /**
   * Rimuove una capability
   */
  unregister(name: string): boolean {
    return this.capabilities.delete(name);
  }

  /**
   * Pulisce tutte le capability
   */
  clear(): void {
    this.capabilities.clear();
    console.log('🧹 [Registry] Tutte le capability rimosse');
  }

  /**
   * Ottiene statistiche del registry
   */
  getStats(): { total: number; byRole: Record<string, number> } {
    const byRole: Record<string, number> = {};

    // Usa Array.from per evitare problemi di iterazione
    const capabilitiesArray = Array.from(this.capabilities.values());
    for (const capability of capabilitiesArray) {
      const role = capability.spec.requiredRole;
      byRole[role] = (byRole[role] || 0) + 1;
    }

    return {
      total: this.capabilities.size,
      byRole,
    };
  }
}

// Singleton instance
export const capabilityRegistry = new CapabilityRegistry();
