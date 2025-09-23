'use client';

import React, { useState, useEffect } from 'react';
import { Conversation, Lead, Message, Template } from '@urbanova/types';
import { templateManager } from '@urbanova/data';

interface InboxPageProps {}

export default function InboxPage({}: InboxPageProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    project: '',
    source: '',
    status: '',
    sla: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carica conversazioni
      const conversationsData = await fetch('/api/leads/conversations').then(r => r.json());
      setConversations(conversationsData.conversations);

      // Carica leads
      const leadsData = await fetch('/api/leads').then(r => r.json());
      setLeads(leadsData.leads);

      // Carica template
      setTemplates(templateManager.getActiveTemplates());
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversationMessages = async (convId: string) => {
    try {
      const response = await fetch(`/api/leads/conversations/${convId}/messages`);
      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    loadConversationMessages(conversation.id);
  };

  const sendReply = async (channel: 'whatsapp' | 'email', text: string, templateId?: string) => {
    if (!selectedConversation) return;

    try {
      const endpoint =
        channel === 'whatsapp' ? '/api/leads/reply/whatsapp' : '/api/leads/reply/email';
      const payload = {
        convId: selectedConversation.id,
        text,
        templateId,
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Ricarica messaggi
        await loadConversationMessages(selectedConversation.id);
        // Ricarica conversazioni per aggiornare lastMsgAt
        await loadData();
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  const assignLead = async (leadId: string, userId: string) => {
    try {
      await fetch(`/api/leads/${leadId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      await loadData();
    } catch (error) {
      console.error('Error assigning lead:', error);
    }
  };

  const updateLeadStatus = async (leadId: string, status: string) => {
    try {
      await fetch(`/api/leads/${leadId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      await loadData();
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  };

  const getLeadByConversation = (convId: string) => {
    const conversation = conversations.find(c => c.id === convId);
    return leads.find(l => l.id === conversation?.leadId);
  };

  const getSLAStatus = (conversation: Conversation) => {
    if (!conversation.slaDeadline) return 'no_sla';

    const now = new Date();
    const deadline = new Date(conversation.slaDeadline);

    if (now > deadline) return 'breached';
    if (now > new Date(deadline.getTime() - 5 * 60 * 1000)) return 'at_risk';
    return 'on_track';
  };

  const getSLAStatusColor = (status: string) => {
    switch (status) {
      case 'on_track':
        return 'text-green-600 bg-green-100';
      case 'at_risk':
        return 'text-yellow-600 bg-yellow-100';
      case 'breached':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'immobiliare':
        return '🏠';
      case 'idealista':
        return '🏢';
      case 'casa':
        return '🏘️';
      case 'whatsapp':
        return '📱';
      case 'email':
        return '📧';
      default:
        return '📋';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Lista conversazioni */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Inbox Lead</h1>
          <p className="text-sm text-gray-500 mt-1">{conversations.length} conversazioni attive</p>
        </div>

        {/* Filtri */}
        <div className="p-4 border-b border-gray-200 space-y-3">
          <select
            value={filters.project}
            onChange={e => setFilters({ ...filters, project: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Tutti i progetti</option>
            <option value="milano">Milano</option>
            <option value="roma">Roma</option>
            <option value="napoli">Napoli</option>
          </select>

          <select
            value={filters.source}
            onChange={e => setFilters({ ...filters, source: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Tutte le fonti</option>
            <option value="immobiliare">Immobiliare.it</option>
            <option value="idealista">Idealista</option>
            <option value="casa">Casa.it</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
          </select>

          <select
            value={filters.status}
            onChange={e => setFilters({ ...filters, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Tutti gli stati</option>
            <option value="new">Nuovo</option>
            <option value="contacted">Contattato</option>
            <option value="qualified">Qualificato</option>
            <option value="lost">Perso</option>
            <option value="won">Vinto</option>
          </select>
        </div>

        {/* Lista conversazioni */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map(conversation => {
            const lead = getLeadByConversation(conversation.id);
            const slaStatus = getSLAStatus(conversation);

            return (
              <div
                key={conversation.id}
                onClick={() => handleConversationSelect(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getSourceIcon(conversation.channel)}</span>
                      <span className="font-medium text-gray-900">{lead?.name || 'Cliente'}</span>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mt-1">
                      {lead?.subject || 'Richiesta informazioni'}
                    </p>

                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-gray-500">
                        {new Date(conversation.lastMsgAt).toLocaleString('it-IT')}
                      </span>

                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getSLAStatusColor(slaStatus)}`}
                      >
                        SLA {slaStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main content - Dettaglio conversazione */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header conversazione */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {getLeadByConversation(selectedConversation.id)?.name || 'Cliente'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {getLeadByConversation(selectedConversation.id)?.email}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    onChange={e => {
                      const lead = getLeadByConversation(selectedConversation.id);
                      if (lead) updateLeadStatus(lead.id, e.target.value);
                    }}
                    value={getLeadByConversation(selectedConversation.id)?.status || 'new'}
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="new">Nuovo</option>
                    <option value="contacted">Contattato</option>
                    <option value="qualified">Qualificato</option>
                    <option value="lost">Perso</option>
                    <option value="won">Vinto</option>
                  </select>

                  <select
                    onChange={e => {
                      const lead = getLeadByConversation(selectedConversation.id);
                      if (lead) assignLead(lead.id, e.target.value);
                    }}
                    value={selectedConversation.assigneeUserId || ''}
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="">Assegna a...</option>
                    <option value="user_1">Mario Rossi</option>
                    <option value="user_2">Giulia Bianchi</option>
                    <option value="user_3">Antonio Verdi</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Messaggi */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.direction === 'inbound' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.direction === 'inbound'
                        ? 'bg-white border border-gray-200'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(message.createdAt).toLocaleString('it-IT')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input risposta */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <textarea
                    placeholder="Scrivi un messaggio..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                    rows={3}
                    id="reply-text"
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <select
                    id="template-select"
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Template...</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      const text = (document.getElementById('reply-text') as HTMLTextAreaElement)
                        .value;
                      const templateId = (
                        document.getElementById('template-select') as HTMLSelectElement
                      ).value;

                      if (text.trim()) {
                        const lead = getLeadByConversation(selectedConversation.id);
                        const channel = lead?.phone ? 'whatsapp' : 'email';
                        sendReply(channel, text, templateId || undefined);

                        // Clear input
                        (document.getElementById('reply-text') as HTMLTextAreaElement).value = '';
                        (document.getElementById('template-select') as HTMLSelectElement).value =
                          '';
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Invia
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Seleziona una conversazione
              </h3>
              <p className="text-gray-500">
                Scegli una conversazione dalla lista per iniziare a rispondere
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
