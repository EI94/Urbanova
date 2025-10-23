// 💬 CONVERSATION LIST - Lista conversazioni con design ChatGPT
// UX ottimizzata con hover effects, animazioni e feedback visivi

import React from 'react';
import { MessageSquare, Trash2, Clock } from 'lucide-react';

interface ChatSession {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  messages: any[];
}

interface ConversationListProps {
  chatHistory: ChatSession[];
  onSelectConversation: (session: ChatSession) => void;
  onDeleteConversation: (sessionId: string, title: string) => void;
  selectedSessionId?: string;
}

export function ConversationList({ 
  chatHistory, 
  onSelectConversation, 
  onDeleteConversation,
  selectedSessionId 
}: ConversationListProps) {

  const handleDeleteClick = (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    onDeleteConversation(session.id, session.title || 'Conversazione senza titolo');
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return timestamp.toLocaleTimeString('it-IT', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (days === 1) {
      return 'Ieri';
    } else if (days < 7) {
      return `${days} giorni fa`;
    } else {
      return timestamp.toLocaleDateString('it-IT', { 
        day: '2-digit', 
        month: 'short' 
      });
    }
  };

  return (
    <div className="space-y-1">
      {chatHistory.map((chat) => (
        <div
          key={chat.id}
          onClick={() => onSelectConversation(chat)}
          className={`
            group relative p-3 rounded-lg cursor-pointer transition-all duration-200
            ${selectedSessionId === chat.id 
              ? 'bg-blue-50 border border-blue-200' 
              : 'hover:bg-gray-50 border border-transparent'
            }
          `}
        >
          {/* Content */}
          <div className="flex items-start space-x-3">
            <div className={`
              w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
              ${selectedSessionId === chat.id 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
              }
            `}>
              <MessageSquare className="w-4 h-4" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className={`
                text-sm font-medium truncate
                ${selectedSessionId === chat.id ? 'text-blue-900' : 'text-gray-900'}
              `}>
                {chat.title || 'Nuova conversazione'}
              </h4>
              
              <p className="text-xs text-gray-500 truncate mt-1">
                {chat.preview || 'Nessun messaggio'}
              </p>
              
              <div className="flex items-center space-x-2 mt-2">
                <div className="flex items-center space-x-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(chat.timestamp)}</span>
                </div>
                
                {chat.messages && (
                  <div className="text-xs text-gray-400">
                    {chat.messages.length} messaggi
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Delete Button */}
          <button
            onClick={(e) => handleDeleteClick(e, chat)}
            className={`
              absolute top-2 right-2 p-1.5 rounded-md transition-all duration-200
              ${selectedSessionId === chat.id 
                ? 'opacity-100 hover:bg-red-100 text-red-500' 
                : 'opacity-0 group-hover:opacity-100 hover:bg-red-100 text-gray-400 hover:text-red-500'
              }
            `}
            title="Elimina conversazione"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      
      {chatHistory.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">Nessuna conversazione</p>
          <p className="text-xs mt-1">Inizia una nuova chat per vedere le conversazioni qui</p>
        </div>
      )}
    </div>
  );
}
