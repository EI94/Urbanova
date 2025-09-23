'use client';

import React, { useState } from 'react';
import { X, Moon, Bell, Shield, Download, Key, Trash2 } from 'lucide-react';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { darkMode, setDarkMode } = useDarkMode();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    projectUpdates: true,
  });
  const [privacy, setPrivacy] = useState({
    publicProfile: false,
    dataSharing: true,
  });

  const handleNotificationChange = (type: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handlePrivacyChange = (type: keyof typeof privacy) => {
    setPrivacy(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleExportData = () => {
    // Implementare esportazione dati
    console.log('Esportazione dati...');
  };

  const handleChangePassword = () => {
    // Implementare cambio password
    console.log('Cambio password...');
  };

  const handleDeleteAccount = () => {
    // Implementare eliminazione account
    if (confirm('Sei sicuro di voler eliminare il tuo account? Questa azione è irreversibile.')) {
      console.log('Eliminazione account...');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto settings-panel">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 settings-title">Impostazioni</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Aspetto */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Aspetto</h4>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg settings-section">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                  <Moon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Modalità Scura</p>
                  <p className="text-sm text-gray-500">Attiva il tema scuro per tutte le pagine</p>
                </div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  darkMode ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Notifiche */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Notifiche</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg settings-section">
                  <span className="text-sm text-gray-700 settings-text">Notifiche Email</span>
                <input 
                  type="checkbox" 
                  checked={notifications.email}
                  onChange={() => handleNotificationChange('email')}
                  className="rounded" 
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg settings-section">
                  <span className="text-sm text-gray-700 settings-text">Notifiche Push</span>
                <input 
                  type="checkbox" 
                  checked={notifications.push}
                  onChange={() => handleNotificationChange('push')}
                  className="rounded" 
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg settings-section">
                  <span className="text-sm text-gray-700 settings-text">Aggiornamenti Progetti</span>
                <input 
                  type="checkbox" 
                  checked={notifications.projectUpdates}
                  onChange={() => handleNotificationChange('projectUpdates')}
                  className="rounded" 
                />
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Privacy</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg settings-section">
                  <span className="text-sm text-gray-700 settings-text">Profilo Pubblico</span>
                <input 
                  type="checkbox" 
                  checked={privacy.publicProfile}
                  onChange={() => handlePrivacyChange('publicProfile')}
                  className="rounded" 
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg settings-section">
                  <span className="text-sm text-gray-700 settings-text">Condivisione Dati</span>
                <input 
                  type="checkbox" 
                  checked={privacy.dataSharing}
                  onChange={() => handlePrivacyChange('dataSharing')}
                  className="rounded" 
                />
              </div>
            </div>
          </div>

          {/* Azioni */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Azioni</h4>
            <div className="space-y-2">
              <button 
                onClick={handleExportData}
                className="w-full flex items-center space-x-3 p-3 text-left text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Esporta Dati</span>
              </button>
              <button 
                onClick={handleChangePassword}
                className="w-full flex items-center space-x-3 p-3 text-left text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              >
                <Key className="w-4 h-4" />
                <span>Cambia Password</span>
              </button>
              <button 
                onClick={handleDeleteAccount}
                className="w-full flex items-center space-x-3 p-3 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Elimina Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
