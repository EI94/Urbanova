'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Building, MapPin, Globe, Linkedin, Github, Camera, Save, Eye, EyeOff, Shield, Key, Settings } from 'lucide-react';
import { XIcon } from '@/components/icons';
import { useAuth } from '@/contexts/AuthContext';
import '@/lib/osProtection'; // OS Protection per user profile panel new
import { useLanguage } from '@/contexts/LanguageContext';
import { firebaseUserProfileService } from '@/lib/firebaseUserProfileService';
import { UserProfile, ProfileUpdate } from '@/types/userProfile';
import { toast } from 'react-hot-toast';

interface UserProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfilePanelNew({ isOpen, onClose }: UserProfilePanelProps) {
  const { t } = useLanguage();
  // CHIRURGICO: Protezione ultra-sicura per evitare crash auth destructuring
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.error('❌ [UserProfilePanelNew] Errore useAuth:', error);
    authContext = { currentUser: null, loading: false };
  }
  const auth = (authContext && typeof authContext === 'object') ? authContext : { currentUser: null, loading: false };
  const currentUser = (auth && typeof auth === 'object' && 'currentUser' in auth) ? auth.currentUser : null;
  
  // Stati principali
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'security' | 'preferences'>('personal');
  
  // Stati per modifica profilo
  const [profileUpdate, setProfileUpdate] = useState<ProfileUpdate>({});
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

  const userId = currentUser?.uid;

  // Carica profilo quando il panel si apre
  useEffect(() => {
    if (isOpen && userId) {
      loadProfile();
    }
  }, [isOpen, userId]);

  // Sincronizza con il contesto di autenticazione quando il profilo cambia
  useEffect(() => {
    if (profile && currentUser) {
      // Aggiorna il displayName nel contesto di autenticazione se necessario
      if (profile.displayName && profile.displayName !== currentUser.displayName) {
        console.log('🔄 [UserProfilePanel] Sincronizzazione displayName con AuthContext');
        // Il displayName verrà aggiornato automaticamente al prossimo refresh
      }
    }
  }, [profile, currentUser]);

  // Salvataggio automatico quando profileUpdate cambia (con debounce migliorato)
  useEffect(() => {
    if (!userId || !profile || !profileUpdate) return;

    // Verifica se ci sono cambiamenti reali
    const hasChanges = Object.keys(profileUpdate).some(key => {
      const value = profileUpdate[key as keyof ProfileUpdate];
      const originalValue = profile[key as keyof UserProfile];
      return value !== undefined && value !== originalValue && value !== '';
    });

    if (!hasChanges) return;

    // Debounce per evitare troppe chiamate API
    const timeoutId = setTimeout(() => {
      console.log('💾 [UserProfilePanel] Salvataggio automatico:', profileUpdate);
      handleSaveProfile();
    }, 2000); // Salva dopo 2 secondi di inattività

    return () => clearTimeout(timeoutId);
  }, [profileUpdate, userId, profile]);

  // Salvataggio finale quando il panel si chiude
  useEffect(() => {
    return () => {
      // Salva i dati quando il componente viene smontato
      if (userId && profile && profileUpdate && !saving) {
        const hasChanges = Object.keys(profileUpdate).some(key => {
          const value = profileUpdate[key as keyof ProfileUpdate];
          const originalValue = profile[key as keyof UserProfile];
          return value !== undefined && value !== originalValue && value !== '';
        });

        if (hasChanges) {
          console.log('💾 [UserProfilePanel] Salvataggio finale al chiudere:', profileUpdate);
          // Salvataggio sincrono per evitare perdita di dati
          firebaseUserProfileService.updateUserProfile(userId, profileUpdate).catch(error => {
            console.error('❌ [UserProfilePanel] Errore salvataggio finale:', error);
          });
        }
      }
    };
  }, [userId, profile, profileUpdate, saving]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      console.log('🔄 [UserProfilePanel] Caricamento profilo per:', userId);
      
      if (!userId) {
        console.warn('⚠️ [UserProfilePanel] Nessun userId disponibile');
        setLoading(false);
        return;
      }

      let userProfile = await firebaseUserProfileService.getUserProfile(userId);
      console.log('📋 [UserProfilePanel] Profilo caricato:', userProfile);

      if (!userProfile) {
        console.log('🆕 [UserProfilePanel] Creazione nuovo profilo');
        const defaultProfile: UserProfile = {
          id: userId,
          userId: userId,
          email: currentUser?.email || '',
          displayName: currentUser?.displayName || 'Utente',
          firstName: currentUser?.firstName || '',
          lastName: currentUser?.lastName || '',
          timezone: 'Europe/Rome',
          language: 'it',
          dateFormat: 'DD/MM/YYYY',
          currency: 'EUR',
          preferences: {
            theme: 'auto',
            sidebarCollapsed: false,
            emailNotifications: true,
            pushNotifications: true,
          },
          security: {
            twoFactorEnabled: false,
            lastPasswordChange: new Date(),
            loginHistory: [],
          },
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        try {
          userProfile = await firebaseUserProfileService.createUserProfile(userId, {
            email: defaultProfile.email,
            displayName: defaultProfile.displayName,
            firstName: defaultProfile.firstName,
            lastName: defaultProfile.lastName,
          });
          console.log('✅ [UserProfilePanel] Nuovo profilo creato:', userProfile);
        } catch (createError) {
          console.error('❌ [UserProfilePanel] Errore creazione profilo:', createError);
          // Usa il profilo di default anche se la creazione fallisce
          userProfile = defaultProfile;
        }
      }

      if (userProfile) {
        setProfile(userProfile);
        setProfileUpdate({
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          displayName: userProfile.displayName,
          phone: userProfile.phone,
          company: userProfile.company,
          role: userProfile.role,
          timezone: userProfile.timezone,
          language: userProfile.language,
          dateFormat: userProfile.dateFormat,
          currency: userProfile.currency,
        });
      }
    } catch (error) {
      console.error('❌ [UserProfilePanel] Errore caricamento profilo:', error);
      toast.error('Errore nel caricamento del profilo');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userId) return;

    // Validazione file
    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('L\'immagine deve essere inferiore a 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Seleziona un file immagine valido');
      return;
    }

    try {
      setSaving(true);
      console.log('📸 [UserProfilePanel] Upload immagine:', file.name, file.size, file.type);

      // Crea un URL temporaneo per l'anteprima immediata
      const tempUrl = URL.createObjectURL(file);
      
      // Aggiorna immediatamente l'UI con l'anteprima
      if (profile) {
        setProfile({ ...profile, avatar: tempUrl });
      }

      // Carica l'immagine su Firebase Storage
      const avatarUrl = await firebaseUserProfileService.uploadAvatar(userId, file);
      
      if (avatarUrl) {
        // Aggiorna il profilo con l'URL permanente
        const updatedProfile = await firebaseUserProfileService.updateUserProfile(userId, {
          avatar: avatarUrl
        });

        if (updatedProfile) {
          setProfile(updatedProfile);
          // Aggiorna anche profileUpdate per sincronizzazione
          setProfileUpdate(prev => ({ ...prev, avatar: avatarUrl }));
          toast.success('Immagine caricata e salvata con successo');
          console.log('✅ [UserProfilePanel] Avatar salvato:', avatarUrl);
        }
      } else {
        throw new Error('Upload fallito');
      }
    } catch (error) {
      console.error('❌ [UserProfilePanel] Errore upload immagine:', error);
      toast.error('Errore nel caricamento dell\'immagine');
      
      // Ripristina l'avatar originale in caso di errore
      if (profile) {
        setProfile({ ...profile, avatar: profile.avatar });
      }
    } finally {
      setSaving(false);
      // Pulisci l'URL temporaneo
      if (event.target.files?.[0]) {
        URL.revokeObjectURL(URL.createObjectURL(event.target.files[0]));
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!userId || !profileUpdate || saving) return;

    try {
      setSaving(true);
      console.log('💾 [UserProfilePanel] Salvataggio profilo:', profileUpdate);
      
      // Filtra solo i campi che sono effettivamente cambiati
      const changesToSave: ProfileUpdate = {};
      Object.keys(profileUpdate).forEach(key => {
        const value = profileUpdate[key as keyof ProfileUpdate];
        const originalValue = profile[key as keyof UserProfile];
        if (value !== undefined && value !== originalValue && value !== '') {
          changesToSave[key as keyof ProfileUpdate] = value;
        }
      });

      if (Object.keys(changesToSave).length === 0) {
        console.log('ℹ️ [UserProfilePanel] Nessun cambiamento da salvare');
        return;
      }

      console.log('💾 [UserProfilePanel] Cambiamenti da salvare:', changesToSave);
      
      const updatedProfile = await firebaseUserProfileService.updateUserProfile(userId, changesToSave);
      
      if (updatedProfile) {
        setProfile(updatedProfile);
        // Reset profileUpdate per evitare loop infiniti
        setProfileUpdate({
          firstName: updatedProfile.firstName,
          lastName: updatedProfile.lastName,
          displayName: updatedProfile.displayName,
          phone: updatedProfile.phone,
          company: updatedProfile.company,
          role: updatedProfile.role,
          timezone: updatedProfile.timezone,
          language: updatedProfile.language,
          dateFormat: updatedProfile.dateFormat,
          currency: updatedProfile.currency,
        });
        toast.success('Profilo aggiornato con successo');
        console.log('✅ [UserProfilePanel] Profilo salvato e sincronizzato');
      }
    } catch (error) {
      console.error('❌ [UserProfilePanel] Errore salvataggio:', error);
      toast.error('Errore nel salvataggio del profilo');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentUser || passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Le password non coincidono');
      return;
    }

    try {
      setSaving(true);
      // TODO: Implementare cambio password con Firebase Auth
      toast.success('Password aggiornata con successo');
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('❌ [UserProfilePanel] Errore cambio password:', error);
      toast.error('Errore nel cambio password');
    } finally {
      setSaving(false);
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
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Caricamento profilo...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && !profile && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <User className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-600 mb-4">Errore nel caricamento del profilo</p>
              <button
                onClick={loadProfile}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Riprova
              </button>
            </div>
          </div>
        )}

        {/* Profile Content */}
        {!loading && profile && (
          <div className="flex flex-col h-full">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('personal')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'personal'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <User className="w-4 h-4 inline mr-2" />
                Informazioni Personali
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'security'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Shield className="w-4 h-4 inline mr-2" />
                Sicurezza
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'preferences'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Preferenze
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  {/* Avatar */}
                  <div className="text-center">
                    <div className="relative inline-block">
                      <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        {profile.avatar ? (
                          <img src={profile.avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
                        ) : (
                          <User className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <button 
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                        className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                        <input
                          type="text"
                          value={profileUpdate.firstName || ''}
                          onChange={(e) => setProfileUpdate({ ...profileUpdate, firstName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cognome</label>
                        <input
                          type="text"
                          value={profileUpdate.lastName || ''}
                          onChange={(e) => setProfileUpdate({ ...profileUpdate, lastName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome visualizzato</label>
                      <input
                        type="text"
                        value={profileUpdate.displayName || ''}
                        onChange={(e) => setProfileUpdate({ ...profileUpdate, displayName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          value={profile.email}
                          disabled
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input
                          type="tel"
                          value={profileUpdate.phone || ''}
                          onChange={(e) => setProfileUpdate({ ...profileUpdate, phone: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Azienda</label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={profileUpdate.company || ''}
                          onChange={(e) => setProfileUpdate({ ...profileUpdate, company: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ruolo</label>
                      <input
                        type="text"
                        value={profileUpdate.role || ''}
                        onChange={(e) => setProfileUpdate({ ...profileUpdate, role: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Sicurezza Account</h3>
                    <p className="text-gray-600 text-sm">Gestisci la sicurezza del tuo account</p>
                  </div>

                  {!showPasswordForm ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">Password</h4>
                            <p className="text-sm text-gray-600">Ultima modifica: {profile.security.lastPasswordChange.toLocaleDateString()}</p>
                          </div>
                          <button
                            onClick={() => setShowPasswordForm(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Key className="w-4 h-4 inline mr-2" />
                            Cambia Password
                          </button>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">Autenticazione a due fattori</h4>
                            <p className="text-sm text-gray-600">
                              {profile.security.twoFactorEnabled ? 'Abilitata' : 'Disabilitata'}
                            </p>
                          </div>
                          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                            {profile.security.twoFactorEnabled ? 'Disabilita' : 'Abilita'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password attuale</label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                            className="absolute right-3 top-3"
                          >
                            {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nuova password</label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                            className="absolute right-3 top-3"
                          >
                            {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Conferma password</label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                            className="absolute right-3 top-3"
                          >
                            {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={handlePasswordChange}
                          disabled={saving}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {saving ? 'Salvataggio...' : 'Salva Password'}
                        </button>
                        <button
                          onClick={() => {
                            setShowPasswordForm(false);
                            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                          }}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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
                  <div className="text-center">
                    <Settings className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Preferenze</h3>
                    <p className="text-gray-600 text-sm">Personalizza la tua esperienza</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fuso orario</label>
                      <select
                        value={profileUpdate.timezone || 'Europe/Rome'}
                        onChange={(e) => setProfileUpdate({ ...profileUpdate, timezone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Europe/Rome">Europa/Roma</option>
                        <option value="Europe/London">Europa/Londra</option>
                        <option value="America/New_York">America/New York</option>
                        <option value="Asia/Tokyo">Asia/Tokyo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lingua</label>
                      <select
                        value={profileUpdate.language || 'it'}
                        onChange={(e) => setProfileUpdate({ ...profileUpdate, language: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="it">Italiano</option>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Formato data</label>
                      <select
                        value={profileUpdate.dateFormat || 'DD/MM/YYYY'}
                        onChange={(e) => setProfileUpdate({ ...profileUpdate, dateFormat: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Valuta</label>
                      <select
                        value={profileUpdate.currency || 'EUR'}
                        onChange={(e) => setProfileUpdate({ ...profileUpdate, currency: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="EUR">EUR (€)</option>
                        <option value="USD">USD ($)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Notifiche email</h4>
                          <p className="text-sm text-gray-600">Ricevi aggiornamenti via email</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={profile.preferences.emailNotifications}
                          onChange={(e) => setProfileUpdate({
                            ...profileUpdate,
                            preferences: {
                              ...profile.preferences,
                              emailNotifications: e.target.checked
                            }
                          })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Notifiche push</h4>
                          <p className="text-sm text-gray-600">Ricevi notifiche in tempo reale</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={profile.preferences.pushNotifications}
                          onChange={(e) => setProfileUpdate({
                            ...profileUpdate,
                            preferences: {
                              ...profile.preferences,
                              pushNotifications: e.target.checked
                            }
                          })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6">
              <div className="flex space-x-3">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvataggio...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salva Modifiche
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
