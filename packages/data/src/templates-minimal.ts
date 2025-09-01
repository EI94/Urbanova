import { Template } from '@urbanova/types';

// Minimal template manager for now
export class TemplateManager {
  async getTemplate(id: string): Promise<Template | null> {
    // Mock implementation
    return null;
  }

  async renderTemplate(templateId: string, variables: Record<string, any>): Promise<string> {
    // Mock implementation
    return `Template ${templateId} rendered with variables`;
  }

  getActiveTemplates(): Template[] {
    // Mock implementation
    return [];
  }
}

export const templateManager = new TemplateManager();
