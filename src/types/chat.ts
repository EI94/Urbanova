// Tipi per il sistema di chat intelligente

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  intelligentData?: IntelligentData;
}

export interface IntelligentData {
  type: 'answer' | 'suggestion' | 'insight' | 'alert' | 'question';
  confidence: number;
  relatedData: any;
  followUpQuestions: string[];
  actions: ResponseAction[];
  visualizations: Visualization[];
}

export interface ResponseAction {
  type: 'navigate' | 'create' | 'update' | 'delete' | 'share';
  label: string;
  url?: string;
  data?: any;
  icon?: string;
}

export interface Visualization {
  type: 'chart' | 'table' | 'card' | 'map' | 'timeline';
  data: any;
  title: string;
  description?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  messages: ChatMessage[];
}
