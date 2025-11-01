import { useState, useEffect, useCallback, useRef } from 'react';
import { firebaseUserProfileService } from '@/lib/firebaseUserProfileService';
import { UserProfile, ProfileUpdate } from '@/types/userProfile';
import { toast } from 'react-hot-toast';

interface UseUserProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  saving: boolean;
  updateProfile: (updates: ProfileUpdate) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export function useUserProfile(userId: string | undefined): UseUserProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // 🛡️ GUARD: Previene loop infinito
  const isLoadingRef = useRef(false);
  const loadedUserIdRef = useRef<string | null>(null);

  // Carica il profilo iniziale
  const loadProfile = useCallback(async () => {
    if (!userId) return;
    
    // 🛡️ GUARD: Se stiamo già caricando o abbiamo già caricato questo userId, SKIP
    if (isLoadingRef.current || loadedUserIdRef.current === userId) {
      console.log('⏭️ [useUserProfile] Skip - già caricato o in caricamento per:', userId);
      return;
    }

    try {
      isLoadingRef.current = true;
      setLoading(true);
      console.log('🔄 [useUserProfile] Caricamento profilo per:', userId);
      
      let userProfile = await firebaseUserProfileService.getUserProfile(userId);
      
      if (!userProfile) {
        console.log('🆕 [useUserProfile] Creazione nuovo profilo');
        userProfile = await firebaseUserProfileService.createUserProfile(userId, {
          email: '',
          displayName: 'Utente',
          firstName: '',
          lastName: '',
        });
      }

      if (userProfile) {
        setProfile(userProfile);
        loadedUserIdRef.current = userId; // Marca come caricato
        console.log('✅ [useUserProfile] Profilo caricato:', userProfile);
      }
    } catch (error) {
      console.error('❌ [useUserProfile] Errore caricamento profilo:', error);
      // NON mostrare toast su errore - evita spam durante loop
      // toast.error('Errore nel caricamento del profilo');
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [userId]);

  // Aggiorna il profilo
  const updateProfile = useCallback(async (updates: ProfileUpdate) => {
    if (!userId || !profile || saving) return;

    try {
      setSaving(true);
      console.log('💾 [useUserProfile] Aggiornamento profilo:', updates);
      
      // Filtra solo i campi che sono effettivamente cambiati
      const changesToSave: ProfileUpdate = {};
      Object.keys(updates).forEach(key => {
        const value = updates[key as keyof ProfileUpdate];
        const originalValue = profile[key as keyof UserProfile];
        if (value !== undefined && value !== originalValue && value !== '') {
          changesToSave[key as keyof ProfileUpdate] = value;
        }
      });

      if (Object.keys(changesToSave).length === 0) {
        console.log('ℹ️ [useUserProfile] Nessun cambiamento da salvare');
        return;
      }

      const updatedProfile = await firebaseUserProfileService.updateUserProfile(userId, changesToSave);
      
      if (updatedProfile) {
        setProfile(updatedProfile);
        toast.success('Profilo aggiornato con successo');
        console.log('✅ [useUserProfile] Profilo aggiornato:', updatedProfile);
      }
    } catch (error) {
      console.error('❌ [useUserProfile] Errore aggiornamento profilo:', error);
      toast.error('Errore nel salvataggio del profilo');
    } finally {
      setSaving(false);
    }
  }, [userId, profile, saving]);

  // Upload avatar
  const uploadAvatar = useCallback(async (file: File) => {
    if (!userId || !profile || saving) return;

    try {
      setSaving(true);
      console.log('📸 [useUserProfile] Upload avatar:', file.name);

      // Crea un URL temporaneo per l'anteprima immediata
      const tempUrl = URL.createObjectURL(file);
      setProfile(prev => prev ? { ...prev, avatar: tempUrl } : null);

      // Carica l'immagine su Firebase Storage
      const avatarUrl = await firebaseUserProfileService.uploadAvatar(userId, file);
      
      if (avatarUrl) {
        const updatedProfile = await firebaseUserProfileService.updateUserProfile(userId, {
          avatar: avatarUrl
        });

        if (updatedProfile) {
          setProfile(updatedProfile);
          toast.success('Immagine caricata e salvata con successo');
          console.log('✅ [useUserProfile] Avatar salvato:', avatarUrl);
        }
      } else {
        throw new Error('Upload fallito');
      }
    } catch (error) {
      console.error('❌ [useUserProfile] Errore upload avatar:', error);
      toast.error('Errore nel caricamento dell\'immagine');
      
      // Ripristina l'avatar originale in caso di errore
      if (profile) {
        setProfile({ ...profile, avatar: profile.avatar });
      }
    } finally {
      setSaving(false);
    }
  }, [userId, profile, saving]);

  // Refresh profilo
  const refreshProfile = useCallback(async () => {
    await loadProfile();
  }, [loadProfile]);

  // Carica il profilo quando userId cambia
  useEffect(() => {
    if (userId && loadedUserIdRef.current !== userId) {
      loadProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]); // 🛡️ NON includere loadProfile nelle dipendenze per evitare loop

  return {
    profile,
    loading,
    saving,
    updateProfile,
    uploadAvatar,
    refreshProfile,
  };
}
