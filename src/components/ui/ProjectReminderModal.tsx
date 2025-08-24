'use client';

import React, { useState, useEffect } from 'react';
import { reminderService, ProjectReminder } from '@/lib/reminderService';
import { useAuth } from '@/contexts/AuthContext';
import { format, addDays, startOfDay } from 'date-fns';
import { it } from 'date-fns/locale';

interface ProjectReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
}

export default function ProjectReminderModal({
  isOpen,
  onClose,
  projectId,
  projectName
}: ProjectReminderModalProps) {
  const { currentUser: user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [reminderDate, setReminderDate] = useState<Date>(addDays(startOfDay(new Date()), 1));
  const [reminderTime, setReminderTime] = useState<string>('09:00');
  const [note, setNote] = useState<string>('');

  // Available options
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Carica le opzioni disponibili
      setAvailableDates(reminderService.getAvailableDates());
      setAvailableTimes(reminderService.getAvailableTimes());
      
      // Reset form
      setReminderDate(addDays(startOfDay(new Date()), 1));
      setReminderTime('09:00');
      setNote('');
      setSuccess(false);
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.email) {
      setError('Utente non autenticato');
      return;
    }

    if (!note.trim()) {
      setError('Inserisci una nota per il reminder');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const reminder = await reminderService.createReminder({
        projectId,
        projectName,
        userId: user.uid,
        userEmail: user.email,
        reminderDate,
        reminderTime,
        note: note.trim()
      });

      console.log('✅ Reminder creato:', reminder);
      setSuccess(true);
      
      // Chiudi il modale dopo 2 secondi
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('❌ Errore creazione reminder:', error);
      setError('Impossibile creare il reminder. Riprova più tardi.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date): string => {
    return format(date, 'EEEE d MMMM yyyy', { locale: it });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">⏰ Crea Reminder</h2>
              <p className="text-blue-100 mt-1">Programma un promemoria per il progetto</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-green-600 mb-2">
                Reminder Creato!
              </h3>
              <p className="text-gray-600">
                Riceverai una mail il {formatDate(reminderDate)} alle {reminderTime}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">📋 Progetto</h3>
                <p className="text-blue-700">{projectName}</p>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📅 Data del Reminder
                </label>
                <select
                  value={reminderDate.toISOString().split('T')[0]}
                  onChange={(e) => setReminderDate(new Date(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {availableDates.map((date) => (
                    <option key={date.toISOString()} value={date.toISOString().split('T')[0]}>
                      {formatDate(date)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🕐 Ora del Reminder
                </label>
                <select
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {availableTimes.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              {/* Note Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📝 Nota del Reminder
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Es: Chiamare il venditore per discutere i prezzi, Rivedere l'analisi con il team, Contattare il consulente..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Descrivi cosa vuoi ricordarti di fare
                </p>
              </div>

              {/* Preview */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">👀 Anteprima</h4>
                <p className="text-yellow-700 text-sm">
                  <strong>Quando:</strong> {formatDate(reminderDate)} alle {reminderTime}
                </p>
                <p className="text-yellow-700 text-sm">
                  <strong>Cosa:</strong> {note || 'Nota non inserita'}
                </p>
                <p className="text-yellow-700 text-sm">
                  <strong>Riceverai:</strong> Una mail con il reminder, il report del progetto e il link diretto
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={isLoading}
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !note.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creazione...
                    </>
                  ) : (
                    'Crea Reminder'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
