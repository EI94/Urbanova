'use client';

// 🎨 COMPOSER - Input + suggestions + quick actions
// Johnny Ive inspired: minimal, functional, beautiful

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Plus,
  Sparkles,
  Calculator,
  TrendingUp,
  Mail,
  FileText,
  Mic,
  Paperclip,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoiceAIChatGPT } from './VoiceAIChatGPT';

interface ComposerProps {
  onSend: (message: string) => void;
  onQuickAction?: (actionId: string) => void;
  placeholder?: string;
  disabled?: boolean;
  suggestions?: Array<{ id: string; label: string; icon?: React.ReactNode }>;
  onVoiceTranscription?: (text: string) => void;
}

/**
 * Quick Actions predefinite
 */
const QUICK_ACTIONS = [
  { id: 'business_plan', label: 'Business Plan', icon: <Calculator className="w-4 h-4" /> },
  { id: 'sensitivity', label: 'Sensitivity', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'rdo', label: 'Invia RDO', icon: <Mail className="w-4 h-4" /> },
  { id: 'export', label: 'Esporta', icon: <FileText className="w-4 h-4" /> },
];

/**
 * Composer Component
 */
export function Composer({
  onSend,
  onQuickAction,
  placeholder = 'Scrivi un messaggio... (⌘K per cercare)',
  disabled = false,
  suggestions = [],
  onVoiceTranscription,
}: ComposerProps) {
  const [input, setInput] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);
  
  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [input]);
  
  // Handle send
  const handleSend = () => {
    if (!input.trim() || disabled) return;
    
    onSend(input.trim());
    setInput('');
    setShowSuggestions(false);
    
    // Reset height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };
  
  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  // Show suggestions when typing
  useEffect(() => {
    setShowSuggestions(input.length > 0 && suggestions.length > 0);
  }, [input, suggestions]);
  
  // Click outside quick actions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target as Node)) {
        setShowQuickActions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <div className="relative">
      {/* Suggestions Chips */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-white border border-gray-200 rounded-xl shadow-lg">
          <div className="flex items-center gap-1.5 mb-1.5 px-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-xs font-medium text-gray-500">Suggerimenti</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => {
                  setInput(suggestion.label);
                  inputRef.current?.focus();
                  setShowSuggestions(false);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 text-sm text-gray-700 hover:text-gray-900 transition-all hover:shadow-sm"
              >
                {suggestion.icon}
                {suggestion.label}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Composer Container */}
      <div className={cn(
        'relative flex items-end gap-2 p-3 bg-white border rounded-2xl shadow-lg transition-all',
        disabled ? 'opacity-50 cursor-not-allowed' : 'border-gray-200 hover:border-gray-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100'
      )}>
        {/* Quick Actions Button */}
        <div className="relative" ref={quickActionsRef}>
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            disabled={disabled}
            className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Quick actions"
          >
            <Plus className={cn(
              'w-5 h-5 transition-transform',
              showQuickActions && 'rotate-45'
            )} />
          </button>
          
          {/* Quick Actions Menu */}
          {showQuickActions && (
            <div className="absolute bottom-full left-0 mb-2 p-2 bg-white border border-gray-200 rounded-xl shadow-xl min-w-[200px] z-10">
              <div className="flex items-center gap-1.5 mb-2 px-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs font-medium text-gray-500">Azioni Rapide</span>
              </div>
              <div className="space-y-1">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => {
                      onQuickAction?.(action.id);
                      setShowQuickActions(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 text-left text-sm text-gray-700 hover:text-gray-900 transition-colors group"
                  >
                    <span className="text-gray-400 group-hover:text-gray-600">
                      {action.icon}
                    </span>
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Input Textarea */}
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none min-h-[40px] max-h-[200px]"
          data-os-search
          aria-label="Messaggio"
        />
        
        {/* Secondary Actions */}
        <div className="flex items-center gap-1">
          {/* Attach button (placeholder) */}
          <button
            disabled={disabled}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Allega file"
          >
            <Paperclip className="w-4.5 h-4.5" />
          </button>
          
          {/* Voice button (placeholder) */}
          <button
            disabled={disabled}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Messaggio vocale"
          >
            <Mic className="w-4.5 h-4.5" />
          </button>
        </div>
        
        {/* Voice AI ChatGPT Style */}
        <VoiceAIChatGPT
          onTranscription={(text) => {
            console.log('🎤 [COMPOSER] Trascrizione ricevuta:', text);
            setInput(text);
            onVoiceTranscription?.(text);
          }}
          className="mr-2"
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          className={cn(
            'flex-shrink-0 p-2.5 rounded-xl transition-all',
            input.trim() && !disabled
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          )}
          aria-label="Invia messaggio"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </div>
      
      {/* Helper Text */}
      <div className="flex items-center justify-between mt-2 px-3">
        <span className="text-xs text-gray-400">
          <kbd className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-mono text-xs">Enter</kbd> per inviare, <kbd className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-mono text-xs">Shift+Enter</kbd> per nuova riga
        </span>
        <span className="text-xs text-gray-400">
          {input.length} / 2000
        </span>
      </div>
    </div>
  );
}

