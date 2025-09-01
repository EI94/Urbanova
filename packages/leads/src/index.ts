// Lead management types and services
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface Conversation {
  id: string;
  leadId: string;
  messages: Message[];
  status: 'active' | 'closed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  sender: 'lead' | 'agent' | 'system';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface Template {
  id: string;
  name: string;
  content: string;
  type: 'email' | 'sms' | 'whatsapp';
  variables: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Lead service
export class LeadService {
  async createLead(leadData: Partial<Lead>): Promise<Lead> {
    // Mock implementation
    return {
      id: `lead_${Date.now()}`,
      name: leadData.name || '',
      email: leadData.email || '',
      phone: leadData.phone,
      source: leadData.source || 'unknown',
      status: 'new',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: leadData.metadata
    };
  }

  async getLead(id: string): Promise<Lead | null> {
    // Mock implementation
    return null;
  }

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
    // Mock implementation
    return null;
  }
}

// Conversation service
export class ConversationService {
  async createConversation(leadId: string): Promise<Conversation> {
    // Mock implementation
    return {
      id: `conv_${Date.now()}`,
      leadId,
      messages: [],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async addMessage(conversationId: string, message: Partial<Message>): Promise<Message> {
    // Mock implementation
    return {
      id: `msg_${Date.now()}`,
      conversationId,
      content: message.content || '',
      sender: message.sender || 'agent',
      timestamp: new Date(),
      metadata: message.metadata
    };
  }
}

// Template service
export class TemplateService {
  async getTemplate(id: string): Promise<Template | null> {
    // Mock implementation
    return null;
  }

  async renderTemplate(templateId: string, variables: Record<string, any>): Promise<string> {
    // Mock implementation
    return `Template ${templateId} rendered with variables`;
  }
}
