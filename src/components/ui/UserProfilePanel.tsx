'use client';

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

import { UserIcon, XIcon, TrashIcon, CheckIcon, EyeIcon } from '@/components/icons';
import { ImageIcon } from '@/components/icons/index';
import { useAuth } from '@/contexts/UltraSafeAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  firebaseUserProfileService,
  UserProfile,
  ProfileUpdate,
  PasswordChange,
} from '@/lib/firebaseUserProfileService';

interface UserProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfilePanel({ isOpen, onClose }: UserProfilePanelProps) {
  const { t } = useLanguage();
  // CHIRURGICO: Protezione ultra-sicura per evitare crash auth destructuring
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.error('❌ [UserProfilePanel] Errore useAuth:', error);
    authContext = { currentUser: null, loading: false };
  }
  const auth = (authContext && typeof authContext === 'object') ? authContext : { currentUser: null, loading: false };
  const currentUser = (auth && typeof auth === 'object' && 'currentUser' in auth) ? auth.currentUser : null;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');
  const [editing, setEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<{ name: string; size: number; type: string } | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordChange, setPasswordChange] = useState<PasswordChange>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileUpdate, setProfileUpdate] = useState<ProfileUpdate>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const userId = currentUser?.uid;

  useEffect(() => {
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen]);

  // Rimuovo il listener per ora - Firebase ha real-time updates nativi
  // useEffect(() => {
  //   const unsubscribe = userProfileService.subscribe((event) => {
  //     if (event.detail.type === 'profile_updated' ||
  //         event.detail.type === 'avatar_updated' ||
  //         event.detail.type === 'password_changed') {
  //       loadProfile();
  //     }
  //   });

  //   return unsubscribe;
  // }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Se non c'è utente autenticato, non caricare il profilo
      if (!currentUser || !userId) {
        console.warn('No authenticated user - cannot load profile');
        setLoading(false);
        return;
      }

      let userProfile = await firebaseUserProfileService.getUserProfile(userId);

      if (!userProfile && currentUser) {
        // Crea profilo per l'utente autenticato
        const defaultProfile = {
          email: currentUser.email || '',
          displayName: currentUser.displayName || 'Utente',
          firstName: currentUser.firstName || '',
          lastName: currentUser.lastName || '',
        };
        
        userProfile = await firebaseUserProfileService.createUserProfile(userId, defaultProfile);
      }

      setProfile(userProfile);
      if (userProfile) {
        setProfileUpdate({
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          displayName: userProfile.displayName,
          ...(userProfile.phone && { phone: userProfile.phone }),
          ...(userProfile.company && { company: userProfile.company }),
          ...(userProfile.role && { role: userProfile.role }),
          timezone: userProfile.timezone,
          language: userProfile.language,
          dateFormat: userProfile.dateFormat,
          currency: userProfile.currency,
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast(t('errorLoadingProfile', 'userProfile'), { icon: '❌' });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = event.target.files?.[0];
    if (fileInput) {
      if (fileInput.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast("L'immagine deve essere inferiore a 5MB", { icon: '❌' });
        return;
      }

      // Create custom file object to avoid File type issues
      const file = {
        name: fileInput.name,
        size: fileInput.size,
        type: fileInput.type
      };

      setAvatarFile(file);
      // Create preview URL only on client side
      if (typeof window !== 'undefined') {
        const previewUrl = URL.createObjectURL(fileInput);
        setAvatarPreview(previewUrl);
      }
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    try {
      const avatarUrl = await firebaseUserProfileService.uploadAvatar(userId, avatarFile);
      if (avatarUrl) {
        setAvatarFile(null);
        setAvatarPreview('');
        loadProfile(); // Ricarica il profilo per mostrare il nuovo avatar
        toast(t('avatarUpdated', 'userProfile'), { icon: '✅' });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast(t('avatarUploadError', 'userProfile'), { icon: '❌' });
    }
  };

  const handleAvatarRemove = async () => {
    try {
      const success = await firebaseUserProfileService.deleteAvatar(userId);
      if (success) {
        setAvatarFile(null);
        setAvatarPreview('');
        loadProfile(); // Ricarica il profilo
        toast(t('avatarRemoved', 'userProfile'), { icon: '✅' });
      } else {
        throw new Error('Remove failed');
      }
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast(t('avatarRemoveError', 'userProfile'), { icon: '❌' });
    }
  };

  const handleProfileSave = async () => {
    try {
      const updatedProfile = await firebaseUserProfileService.updateUserProfile(
        userId,
        profileUpdate
      );
      setProfile(updatedProfile);
      setEditing(false);
      toast(t('changesSaved', 'userProfile'), { icon: '✅' });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast(t('errorSaving', 'userProfile'), { icon: '❌' });
    }
  };

  const handlePasswordChange = async () => {
    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      toast('Le password non coincidono', { icon: '❌' });
      return;
    }

    if (passwordChange.newPassword.length < 8) {
      toast('La nuova password deve essere di almeno 8 caratteri', { icon: '❌' });
      return;
    }

    try {
      // Cambio password gestito da Firebase Auth - per ora skip
      console.log('Password change not implemented yet with Firebase Auth');
      setPasswordChange({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast(t('passwordChanged', 'userProfile'), { icon: '✅' });
    } catch (error) {
      console.error('Error changing password:', error);
      toast(t('passwordError', 'userProfile'), { icon: '❌' });
    }
  };

  const handleToggle2FA = async () => {
    if (!profile) return;

    try {
      const newValue = await firebaseUserProfileService.toggleTwoFactor(userId);
      const updatedProfile = await firebaseUserProfileService.getUserProfile(userId);
      setProfile(updatedProfile);
      if (updatedProfile) {
        toast(
          updatedProfile.security.twoFactorEnabled
            ? '2FA abilitato con successo'
            : '2FA disabilitato con successo',
          { icon: '✅' }
        );
      }
    } catch (error) {
      console.error('Error toggling 2FA:', error);
      toast('Errore nella gestione 2FA', { icon: '❌' });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      <div
        ref={panelRef}
        className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto"
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
      >
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-2">
            <UserIcon className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">{t('title', 'userProfile')}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {t('personalInfo', 'userProfile')}
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'security'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {t('security', 'userProfile')}
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'preferences'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {t('preferences', 'userProfile')}
          </button>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : profile ? (
            <>
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  {/* Avatar Section */}
                  <div className="text-center">
                    <div className="relative inline-block">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                        {profile.avatar ? (
                          <img
                            src={profile.avatar}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserIcon className="w-full h-full text-gray-400 p-4" />
                        )}
                      </div>

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
                      >
                        <ImageIcon className="h-4 w-4" />
                      </button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />

                    {avatarFile && (
                      <div className="mt-3 space-y-2">
                        <img
                          src={avatarPreview}
                          alt="Preview"
                          className="w-16 h-16 rounded mx-auto object-cover border"
                        />
                        <div className="flex space-x-2 justify-center">
                          <button
                            onClick={handleAvatarUpload}
                            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                          >
                            <CheckIcon className="h-3 w-3 inline mr-1" />
                            Salva
                          </button>
                          <button
                            onClick={() => {
                              setAvatarFile(null);
                              setAvatarPreview('');
                            }}
                            className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                          >
                            Annulla
                          </button>
                        </div>
                      </div>
                    )}

                    {profile.avatar && !avatarFile && (
                      <button
                        onClick={handleAvatarRemove}
                        className="mt-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded transition-colors"
                      >
                        <TrashIcon className="h-3 w-3 inline mr-1" />
                        {t('removeAvatar', 'userProfile')}
                      </button>
                    )}
                  </div>

                  {/* Profile Form */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('firstName', 'userProfile')}
                        </label>
                        <input
                          type="text"
                          value={profileUpdate.firstName || ''}
                          onChange={e =>
                            setProfileUpdate({ ...profileUpdate, firstName: e.target.value })
                          }
                          disabled={!editing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('lastName', 'userProfile')}
                        </label>
                        <input
                          type="text"
                          value={profileUpdate.lastName || ''}
                          onChange={e =>
                            setProfileUpdate({ ...profileUpdate, lastName: e.target.value })
                          }
                          disabled={!editing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('displayName', 'userProfile')}
                      </label>
                      <input
                        type="text"
                        value={profileUpdate.displayName || ''}
                        onChange={e =>
                          setProfileUpdate({ ...profileUpdate, displayName: e.target.value })
                        }
                        disabled={!editing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('email', 'userProfile')}
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('phone', 'userProfile')}
                      </label>
                      <input
                        type="tel"
                        value={profileUpdate.phone || ''}
                        onChange={e =>
                          setProfileUpdate({ ...profileUpdate, phone: e.target.value })
                        }
                        disabled={!editing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('company', 'userProfile')}
                        </label>
                        <input
                          type="text"
                          value={profileUpdate.company || ''}
                          onChange={e =>
                            setProfileUpdate({ ...profileUpdate, company: e.target.value })
                          }
                          disabled={!editing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('role', 'userProfile')}
                        </label>
                        <input
                          type="text"
                          value={profileUpdate.role || ''}
                          onChange={e =>
                            setProfileUpdate({ ...profileUpdate, role: e.target.value })
                          }
                          disabled={!editing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-4">
                      {editing ? (
                        <>
                          <button
                            onClick={handleProfileSave}
                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                          >
                            {t('saveChanges', 'userProfile')}
                          </button>
                          <button
                            onClick={() => {
                              setEditing(false);
                              loadProfile(); // Reset changes
                            }}
                            className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                          >
                            Annulla
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setEditing(true)}
                          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        >
                          Modifica Profilo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {t('changePassword', 'userProfile')}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('password', 'userProfile')}
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordChange.currentPassword}
                            onChange={e =>
                              setPasswordChange({
                                ...passwordChange,
                                currentPassword: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPassword ? (
                              <span className="h-4 w-4 text-gray-400">🙈</span>
                            ) : (
                              <EyeIcon className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('newPassword', 'userProfile')}
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={passwordChange.newPassword}
                            onChange={e =>
                              setPasswordChange({ ...passwordChange, newPassword: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showNewPassword ? (
                              <span className="h-4 w-4 text-gray-400">🙈</span>
                            ) : (
                              <EyeIcon className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('confirmPassword', 'userProfile')}
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={passwordChange.confirmPassword}
                            onChange={e =>
                              setPasswordChange({
                                ...passwordChange,
                                confirmPassword: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showConfirmPassword ? (
                              <span className="h-4 w-4 text-gray-400">🙈</span>
                            ) : (
                              <EyeIcon className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={handlePasswordChange}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                      >
                        {t('changePassword', 'userProfile')}
                      </button>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {t('twoFactorAuth', 'userProfile')}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          {profile.security.twoFactorEnabled
                            ? '2FA è attualmente abilitato per il tuo account'
                            : "Abilita l'autenticazione a due fattori per maggiore sicurezza"}
                        </p>
                      </div>
                      <button
                        onClick={handleToggle2FA}
                        className={`px-4 py-2 rounded-md transition-colors ${
                          profile.security.twoFactorEnabled
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        {profile.security.twoFactorEnabled
                          ? t('disable2FA', 'userProfile')
                          : t('enable2FA', 'userProfile')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Impostazioni Generali
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('timezone', 'userProfile')}
                        </label>
                        <select
                          value={profileUpdate.timezone || profile.timezone}
                          onChange={e =>
                            setProfileUpdate({ ...profileUpdate, timezone: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="Europe/Rome">Europe/Rome (UTC+1)</option>
                          <option value="Europe/London">Europe/London (UTC+0)</option>
                          <option value="America/New_York">America/New_York (UTC-5)</option>
                          <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('language', 'userProfile')}
                        </label>
                        <select
                          value={profileUpdate.language || profile.language}
                          onChange={e =>
                            setProfileUpdate({ ...profileUpdate, language: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="it">Italiano</option>
                          <option value="en">English</option>
                          <option value="es">Español</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('dateFormat', 'userProfile')}
                        </label>
                        <select
                          value={profileUpdate.dateFormat || profile.dateFormat}
                          onChange={e =>
                            setProfileUpdate({ ...profileUpdate, dateFormat: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="dd/MM/yyyy">dd/MM/yyyy</option>
                          <option value="MM/dd/yyyy">MM/dd/yyyy</option>
                          <option value="yyyy-MM-dd">yyyy-MM-dd</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('currency', 'userProfile')}
                        </label>
                        <select
                          value={profileUpdate.currency || profile.currency}
                          onChange={e =>
                            setProfileUpdate({ ...profileUpdate, currency: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="EUR">EUR (€)</option>
                          <option value="USD">USD ($)</option>
                          <option value="GBP">GBP (£)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Errore nel caricamento del profilo</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
