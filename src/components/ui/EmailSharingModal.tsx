'use client';

import { X, Mail, Send, User, Users, Clock, Star } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

import { Badge } from './Badge';
import Button from './Button';
import { Card, CardContent, CardHeader, CardTitle } from './Card';

interface EmailContact {
  email: string;
  name?: string;
  lastUsed: Date;
  usageCount: number;
}

interface EmailSharingModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportTitle: string;
  reportUrl: string;
  onShareSuccess?: () => void;
}

export default function EmailSharingModal({
  isOpen,
  onClose,
  reportTitle,
  reportUrl,
  onShareSuccess,
}: EmailSharingModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedContacts, setSuggestedContacts] = useState<EmailContact[]>([]);
  const [recentContacts, setRecentContacts] = useState<EmailContact[]>([]);

  // Carica contatti suggeriti dal localStorage
  useEffect(() => {
    if (isOpen) {
      loadSuggestedContacts();
      loadRecentContacts();
      setSubject(`Studio di Fattibilità: ${reportTitle}`);
      setMessage(generateDefaultMessage());
    }
  }, [isOpen, reportTitle]);

  const loadSuggestedContacts = () => {
    try {
      const contacts = localStorage.getItem('urbanova_email_contacts');
      if (contacts) {
        const parsedContacts: EmailContact[] = JSON.parse(contacts);
        // Ordina per frequenza di utilizzo e data recente
        const sorted = parsedContacts.sort((a, b) => b.usageCount - a.usageCount).slice(0, 5);
        setSuggestedContacts(sorted);
      }
    } catch (error) {
      console.error('Errore caricamento contatti:', error);
    }
  };

  const loadRecentContacts = () => {
    try {
      const contacts = localStorage.getItem('urbanova_email_contacts');
      if (contacts) {
        const parsedContacts: EmailContact[] = JSON.parse(contacts);
        // Ordina per data recente
        const sorted = parsedContacts
          .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
          .slice(0, 3);
        setRecentContacts(sorted);
      }
    } catch (error) {
      console.error('Errore caricamento contatti recenti:', error);
    }
  };

  const generateDefaultMessage = () => {
    return `Ciao!

Ti condivido lo studio di fattibilità "${reportTitle}" generato su Urbanova.

Il report contiene:
• Analisi finanziaria completa
• Valutazione ROI e rischi
• Analisi AI integrata
• Raccomandazioni strategiche

Puoi visualizzare il report completo direttamente su Urbanova: ${reportUrl}

Cordiali saluti,
Il tuo team Urbanova`;
  };

  const saveContact = (email: string, name?: string) => {
    try {
      const contacts = localStorage.getItem('urbanova_email_contacts');
      const parsedContacts: EmailContact[] = contacts ? JSON.parse(contacts) : [];

      const existingIndex = parsedContacts.findIndex(c => c.email === email);
      if (existingIndex >= 0) {
        // Aggiorna contatto esistente
        parsedContacts[existingIndex].usageCount++;
        parsedContacts[existingIndex].lastUsed = new Date();
        if (name) parsedContacts[existingIndex].name = name;
      } else {
        // Aggiungi nuovo contatto
        parsedContacts.push({
          email,
          name,
          lastUsed: new Date(),
          usageCount: 1,
        });
      }

      localStorage.setItem('urbanova_email_contacts', JSON.stringify(parsedContacts));
    } catch (error) {
      console.error('Errore salvataggio contatto:', error);
    }
  };

  const handleContactSuggestion = (contact: EmailContact) => {
    setEmail(contact.email);
    if (contact.name) setName(contact.name);
    toast.success(`Contatto ${contact.email} selezionato! ✨`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Inserisci un indirizzo email valido');
      return;
    }

    setIsLoading(true);

    try {
      // Salva il contatto
      saveContact(email, name);

      // Invia email (qui chiameremo l'API)
      const response = await fetch('/api/share-report-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          name: name || email,
          subject,
          message,
          reportTitle,
          reportUrl,
        }),
      });

      if (response.ok) {
        toast.success('Report condiviso con successo! 📧✨');
        onShareSuccess?.();
        onClose();

        // Ricarica i contatti suggeriti
        loadSuggestedContacts();
        loadRecentContacts();
      } else {
        const error = await response.json();
        toast.error(`Errore invio email: ${error.message}`);
      }
    } catch (error) {
      console.error('Errore invio email:', error);
      toast.error("Errore nell'invio dell'email");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Condividi Report via Email</h2>
              <p className="text-sm text-gray-600">
                Invia lo studio di fattibilità ai tuoi contatti
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Contatti Suggeriti */}
          {suggestedContacts.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Star className="h-4 w-4 mr-2 text-yellow-500" />
                Contatti Frequenti
              </h3>
              <div className="flex flex-wrap gap-2">
                {suggestedContacts.map((contact, index) => (
                  <button
                    key={index}
                    onClick={() => handleContactSuggestion(contact)}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                  >
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      {contact.name || contact.email}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {contact.usageCount}x
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Contatti Recenti */}
          {recentContacts.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                Contatti Recenti
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentContacts.map((contact, index) => (
                  <button
                    key={index}
                    onClick={() => handleContactSuggestion(contact)}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                  >
                    <Users className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-800">
                      {contact.name || contact.email}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(contact.lastUsed).toLocaleDateString('it-IT')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form Email */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Contatto (opzionale)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Nome del destinatario"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email * <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="email@esempio.com"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Oggetto</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Messaggio</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Anteprima Report */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Anteprima Report</h4>
              <div className="text-sm text-gray-600">
                <p>
                  <strong>Titolo:</strong> {reportTitle}
                </p>
                <p>
                  <strong>Link:</strong> {reportUrl}
                </p>
              </div>
            </div>

            {/* Azioni */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Annulla
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                leftIcon={<Send className="h-4 w-4" />}
              >
                {isLoading ? 'Invio in corso...' : 'Invia Email'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
