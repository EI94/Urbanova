'use client';

// 🎨 USE OS SIDECAR - State management per sidecar OS 2.0
// Hook per open/close, filters, pinned views, keyboard shortcuts

import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Stato di un messaggio OS
 */
export type MessageStatus = 'draft' | 'awaiting_confirm' | 'running' | 'done' | 'error' | 'skipped';

/**
 * Modalità OS
 */
export type OsMode = 'ask' | 'ask_to_act' | 'act';

/**
 * Messaggio OS
 */
export interface OsMessage {
  id: string;
  timestamp: Date;
  role: 'user' | 'assistant';
  content: string;
  
  // OS metadata
  skillId?: string;
  skillIcon?: string;
  projectId?: string;
  projectName?: string;
  status?: MessageStatus;
  
  // Execution metadata
  planId?: string;
  kpis?: Array<{ label: string; value: string; delta?: string }>;
  artifacts?: Array<{ type: 'pdf' | 'excel' | 'link'; url: string; label: string }>;
  
  // Actions
  actions?: Array<{ id: string; label: string; variant: 'primary' | 'secondary' | 'danger' }>;
}

/**
 * Filtri sidecar
 */
export interface SidecarFilters {
  projectId?: string;
  skillId?: string;
  status?: MessageStatus;
  dateFrom?: Date;
  dateTo?: Date;
  onlyActions?: boolean; // Mostra solo messaggi con azioni
}

/**
 * Vista salvata
 */
export interface SavedView {
  id: string;
  name: string;
  filters: SidecarFilters;
  pinned: boolean;
}

/**
 * Hook state
 */
interface UseOsSidecarState {
  // Open/Close
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  
  // Mode
  mode: OsMode;
  setMode: (mode: OsMode) => void;
  
  // Messages
  messages: OsMessage[];
  addMessage: (message: Omit<OsMessage, 'id' | 'timestamp'>) => void;
  updateMessage: (id: string, updates: Partial<OsMessage>) => void;
  clearMessages: () => void;
  
  // Filters
  filters: SidecarFilters;
  setFilters: (filters: Partial<SidecarFilters>) => void;
  clearFilters: () => void;
  filteredMessages: OsMessage[];
  
  // Saved Views
  savedViews: SavedView[];
  saveView: (name: string, pinned?: boolean) => void;
  loadView: (viewId: string) => void;
  deleteView: (viewId: string) => void;
  
  // Action Plan Panel
  showActionPlan: boolean;
  setShowActionPlan: (show: boolean) => void;
  currentPlanId?: string;
  setCurrentPlanId: (planId?: string) => void;
  
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: OsMessage[];
}

/**
 * Hook principale
 */
export function useOsSidecar(): UseOsSidecarState {
  // State
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<OsMode>('ask_to_act');
  const [messages, setMessages] = useState<OsMessage[]>([]);
  const [filters, setFiltersState] = useState<SidecarFilters>({});
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [showActionPlan, setShowActionPlan] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Open/Close
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  
  // Messages
  const addMessage = useCallback((message: Omit<OsMessage, 'id' | 'timestamp'>) => {
    const newMessage: OsMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
  }, []);
  
  const updateMessage = useCallback((id: string, updates: Partial<OsMessage>) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, ...updates } : msg
    ));
  }, []);
  
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);
  
  // Filters
  const setFilters = useCallback((newFilters: Partial<SidecarFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);
  
  const clearFilters = useCallback(() => {
    setFiltersState({});
  }, []);
  
  // Filtered messages
  const filteredMessages = useMemo(() => {
    let filtered = [...messages];
    
    // Filter by project
    if (filters.projectId) {
      filtered = filtered.filter(msg => msg.projectId === filters.projectId);
    }
    
    // Filter by skill
    if (filters.skillId) {
      filtered = filtered.filter(msg => msg.skillId === filters.skillId);
    }
    
    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(msg => msg.status === filters.status);
    }
    
    // Filter by date
    if (filters.dateFrom) {
      filtered = filtered.filter(msg => msg.timestamp >= filters.dateFrom!);
    }
    
    if (filters.dateTo) {
      filtered = filtered.filter(msg => msg.timestamp <= filters.dateTo!);
    }
    
    // Filter by actions only
    if (filters.onlyActions) {
      filtered = filtered.filter(msg => msg.actions && msg.actions.length > 0);
    }
    
    return filtered;
  }, [messages, filters]);
  
  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return filteredMessages;
    
    const query = searchQuery.toLowerCase();
    
    return filteredMessages.filter(msg => 
      msg.content.toLowerCase().includes(query) ||
      msg.projectName?.toLowerCase().includes(query) ||
      msg.skillId?.toLowerCase().includes(query)
    );
  }, [filteredMessages, searchQuery]);
  
  // Saved Views
  const saveView = useCallback((name: string, pinned: boolean = false) => {
    const newView: SavedView = {
      id: `view_${Date.now()}`,
      name,
      filters: { ...filters },
      pinned,
    };
    
    setSavedViews(prev => [...prev, newView]);
    
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      const views = [...savedViews, newView];
      localStorage.setItem('os2_saved_views', JSON.stringify(views));
    }
  }, [filters, savedViews]);
  
  const loadView = useCallback((viewId: string) => {
    const view = savedViews.find(v => v.id === viewId);
    if (view) {
      setFiltersState(view.filters);
    }
  }, [savedViews]);
  
  const deleteView = useCallback((viewId: string) => {
    setSavedViews(prev => prev.filter(v => v.id !== viewId));
    
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      const views = savedViews.filter(v => v.id !== viewId);
      localStorage.setItem('os2_saved_views', JSON.stringify(views));
    }
  }, [savedViews]);
  
  // Load saved views from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('os2_saved_views');
      if (saved) {
        try {
          setSavedViews(JSON.parse(saved));
        } catch (error) {
          console.error('Error loading saved views:', error);
        }
      }
    }
  }, []);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘J or Ctrl+J: Toggle sidecar
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        toggle();
      }
      
      // ⌘K or Ctrl+K: Focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Focus search input (will be handled by Sidecar component)
        const searchInput = document.querySelector('[data-os-search]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
      
      // Escape: Close sidecar
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        close();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, toggle, close]);
  
  return {
    // Open/Close
    isOpen,
    open,
    close,
    toggle,
    
    // Mode
    mode,
    setMode,
    
    // Messages
    messages,
    addMessage,
    updateMessage,
    clearMessages,
    
    // Filters
    filters,
    setFilters,
    clearFilters,
    filteredMessages,
    
    // Saved Views
    savedViews,
    saveView,
    loadView,
    deleteView,
    
    // Action Plan Panel
    showActionPlan,
    setShowActionPlan,
    currentPlanId,
    setCurrentPlanId,
    
    // Search
    searchQuery,
    setSearchQuery,
    searchResults,
  };
}

