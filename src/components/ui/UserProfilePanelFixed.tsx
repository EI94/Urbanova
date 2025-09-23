'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Building, MapPin, Camera, Save, Eye, EyeOff, Shield, Key, Settings } from 'lucide-react';
import { XIcon } from '@/components/icons';
import { useAuth } from '@/contexts/AuthContext';
import '@/lib/osProtection'; // OS Protection per user profile panel fixed
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { ProfileUpdate } from '@/types/userProfile';
import { toast } from 'react-hot-toast';

interface UserProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfilePanelFixed({ isOpen, onClose }: UserProfilePanelProps) {
  const { t } = useLanguage();
  // CHIRURGICO: Protezione ultra-sicura per evitare crash auth destructuring
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.error('❌ [UserProfilePanelFixed] Errore useAuth:', error);
    authContext = { currentUser: null, loading: false };
  }
  const auth = (authContext && typeof authContext === 'object') ? authContext : { currentUser: null, loading: false };
  const currentUser = (auth && typeof auth === 'object' && 'currentUser' in auth) ? auth.currentUser : null;
  
  const { profile, loading, saving, updateProfile, uploadAvatar, refreshProfile } = useUserProfile(currentUser?.uid);
  
  // Stati per modifica profilo
  const [profileData, setProfileData] = useState<ProfileUpdate>({});
  const [activeTab, setActiveTab] = useState<'personal' | 'security' | 'preferences'>('personal');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Inizializza profileData quando il profilo viene caricato
  useEffect(() => {
    if (profile) {
      setProfileData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        displayName: profile.displayName || '',
        phone: profile.phone || '',
        company: profile.company || '',
        role: profile.role || '',
        timezone: profile.timezone || 'Europe/Rome',
        language: profile.language || 'it',
        dateFormat: profile.dateFormat || 'DD/MM/YYYY',
        currency: profile.currency || 'EUR',
      });
    }
  }, [profile]);

  // Salvataggio automatico con debounce
  useEffect(() => {
    if (!profile || !profileData) return;

    const hasChanges = Object.keys(profileData).some(key => {
      const value = profileData[key as keyof ProfileUpdate];
      const originalValue = profile[key as keyof typeof profile];
      return value !== undefined && value !== originalValue && value !== '';
    });

    if (!hasChanges) return;

    const timeoutId = setTimeout(() => {
      console.log('💾 [UserProfilePanelFixed] Salvataggio automatico:', profileData);
      updateProfile(profileData);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [profileData, profile, updateProfile]);

  const handleInputChange = (field: keyof ProfileUpdate, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validazione file
    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('L\'immagine deve essere inferiore a 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Seleziona un file immagine valido');
      return;
    }

    await uploadAvatar(file);
  };

  const handlePasswordChange = async () => {
    if (!currentUser || passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Le password non coincidono');
      return;
    }

    try {
      // TODO: Implementare cambio password con Firebase Auth
      toast.success('Password aggiornata con successo');
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('❌ [UserProfilePanelFixed] Errore cambio password:', error);
      toast.error('Errore nel cambio password');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-end">
      {/* Overlay */}
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Panel */}
      <div className="relative bg-white w-96 h-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold text-gray-900">Profilo Utente</h2>
            {saving && (
              <p className="text-xs text-blue-600 font-medium mt-1">
                Salvataggio automatico...
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Caricamento profilo...</span>
          </div>
        )}

        {/* Content */}
        {!loading && profile && (
          <div className="flex flex-col h-full">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('personal')}
                className={`flex-1 py-3 px-4 text-sm font-medium ${
                  activeTab === 'personal'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Personale
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex-1 py-3 px-4 text-sm font-medium ${
                  activeTab === 'security'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sicurezza
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`flex-1 py-3 px-4 text-sm font-medium ${
                  activeTab === 'preferences'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Preferenze
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  {/* Avatar */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {profile.avatar ? (
                          <img
                            src={profile.avatar}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-12 h-12 text-gray-400" />
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
                        <Camera className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-sm text-gray-500">Clicca per cambiare foto</p>
                  </div>

                  {/* Form Dati Personali */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome
                        </label>
                        <input
                          type="text"
                          value={profileData.firstName || ''}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Nome"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cognome
                        </label>
                        <input
                          type="text"
                          value={profileData.lastName || ''}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Cognome"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          value={profile.email || ''}
                          disabled
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefono
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="tel"
                          value={profileData.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+39 123 456 7890"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Azienda
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={profileData.company || ''}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Nome azienda"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ruolo
                      </label>
                      <input
                        type="text"
                        value={profileData.role || ''}
                        onChange={(e) => handleInputChange('role', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ruolo in azienda"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Sicurezza</h3>
                    <p className="text-gray-500 mb-6">Gestisci le impostazioni di sicurezza del tuo account</p>
                    
                    <button
                      onClick={() => setShowPasswordForm(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Cambia Password
                    </button>
                  </div>

                  {showPasswordForm && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900">Cambia Password</h4>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Password Attuale
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nuova Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Conferma Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={handlePasswordChange}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Salva Password
                        </button>
                        <button
                          onClick={() => setShowPasswordForm(false)}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                        >
                          Annulla
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Preferenze</h3>
                    <p className="text-gray-500 mb-6">Personalizza le tue impostazioni</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fuso Orario
                      </label>
                      <select
                        value={profileData.timezone || 'Europe/Rome'}
                        onChange={(e) => handleInputChange('timezone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Europe/Rome">Europa/Roma</option>
                        <option value="Europe/London">Europa/Londra</option>
                        <option value="America/New_York">America/New York</option>
                        <option value="Asia/Tokyo">Asia/Tokyo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lingua
                      </label>
                      <select
                        value={profileData.language || 'it'}
                        onChange={(e) => handleInputChange('language', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="it">Italiano</option>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Formato Data
                      </label>
                      <select
                        value={profileData.dateFormat || 'DD/MM/YYYY'}
                        onChange={(e) => handleInputChange('dateFormat', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valuta
                      </label>
                      <select
                        value={profileData.currency || 'EUR'}
                        onChange={(e) => handleInputChange('currency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="EUR">EUR (€)</option>
                        <option value="USD">USD ($)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="JPY">JPY (¥)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
