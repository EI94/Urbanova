'use client';

import React, { useState, useEffect } from 'react';
import { 
  NotificationPreferences, 
  NotificationType, 
  NotificationPriority,
  NotificationChannel 
} from '@/types/notificationPreferences';

interface NotificationPreferencesProps {
  userId: string;
  onClose?: () => void;
}

/**
 * Componente per gestire le preferenze notifiche utente
 */
export const NotificationPreferencesComponent: React.FC<NotificationPreferencesProps> = ({
  userId,
  onClose
}) => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carica le preferenze
  useEffect(() => {
    loadPreferences();
  }, [userId]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications/preferences', {
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Errore caricamento preferenze');
      }

      const data = await response.json();
      setPreferences(data.preferences);
    } catch (error) {
      console.error('Errore caricamento preferenze:', error);
      setError(error instanceof Error ? error.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      setError(null);

      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`
        },
        body: JSON.stringify({ preferences })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore salvataggio preferenze');
      }

      console.log('✅ Preferenze salvate con successo');
    } catch (error) {
      console.error('Errore salvataggio preferenze:', error);
      setError(error instanceof Error ? error.message : 'Errore sconosciuto');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`
        },
        body: JSON.stringify({ action: 'reset' })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore reset preferenze');
      }

      const data = await response.json();
      setPreferences(data.preferences);
      console.log('✅ Preferenze reset ai valori di default');
    } catch (error) {
      console.error('Errore reset preferenze:', error);
      setError(error instanceof Error ? error.message : 'Errore sconosciuto');
    } finally {
      setSaving(false);
    }
  };

  const updateGlobalSetting = (path: string, value: any) => {
    if (!preferences) return;

    const newPreferences = { ...preferences };
    const keys = path.split('.');
    let current = newPreferences as any;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setPreferences(newPreferences);
  };

  const updateTypeSetting = (type: NotificationType, setting: string, value: any) => {
    if (!preferences) return;

    const newPreferences = { ...preferences };
    newPreferences.types[type] = {
      ...newPreferences.types[type],
      [setting]: value
    };
    setPreferences(newPreferences);
  };

  const updateChannelSetting = (channel: NotificationChannel, setting: string, value: any) => {
    if (!preferences) return;

    const newPreferences = { ...preferences };
    newPreferences.channels[channel] = {
      ...newPreferences.channels[channel],
      [setting]: value
    };
    setPreferences(newPreferences);
  };

  const getAuthToken = async () => {
    // Implementa la logica per ottenere il token di autenticazione
    // Questo dipende dal tuo sistema di autenticazione
    return localStorage.getItem('authToken') || '';
  };

  const getTypeLabel = (type: NotificationType): string => {
    const labels: Record<NotificationType, string> = {
      PROJECT: 'Progetti',
      FEASIBILITY: 'Analisi di Fattibilità',
      BUSINESS_PLAN: 'Business Plan',
      DEADLINE: 'Scadenze',
      LEAD: 'Lead',
      SYSTEM: 'Sistema',
      PERFORMANCE: 'Performance',
      ERROR: 'Errori',
      WARNING: 'Warning',
      SUCCESS: 'Successi',
      MESSAGE: 'Messaggi',
      ALERT: 'Allerte'
    };
    return labels[type] || type;
  };

  const getPriorityLabel = (priority: NotificationPriority): string => {
    const labels: Record<NotificationPriority, string> = {
      LOW: 'Bassa',
      MEDIUM: 'Media',
      HIGH: 'Alta',
      URGENT: 'Urgente'
    };
    return labels[priority] || priority;
  };

  const getChannelLabel = (channel: NotificationChannel): string => {
    const labels: Record<NotificationChannel, string> = {
      in_app: 'In App',
      push: 'Push',
      email: 'Email'
    };
    return labels[channel] || channel;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="loading loading-spinner loading-lg"></div>
        <span className="ml-3">Caricamento preferenze...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <svg className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Errore: {error}</span>
        <button 
          className="btn btn-sm btn-outline"
          onClick={loadPreferences}
        >
          Riprova
        </button>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="alert alert-warning">
        <svg className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <span>Nessuna preferenza trovata</span>
      </div>
    );
  }

  return (
    <div className="notification-preferences">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Preferenze Notifiche</h2>
        <div className="flex gap-2">
          <button 
            className="btn btn-outline btn-sm"
            onClick={resetToDefaults}
            disabled={saving}
          >
            Reset Default
          </button>
          <button 
            className="btn btn-primary btn-sm"
            onClick={savePreferences}
            disabled={saving}
          >
            {saving ? 'Salvataggio...' : 'Salva'}
          </button>
          {onClose && (
            <button 
              className="btn btn-ghost btn-sm"
              onClick={onClose}
            >
              Chiudi
            </button>
          )}
        </div>
      </div>

      {/* Preferenze Globali */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h3 className="card-title">Impostazioni Globali</h3>
          
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Abilita notifiche</span>
              <input 
                type="checkbox" 
                className="toggle toggle-primary"
                checked={preferences.global.enabled}
                onChange={(e) => updateGlobalSetting('global.enabled', e.target.checked)}
              />
            </label>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Ore di silenzio</span>
              <input 
                type="checkbox" 
                className="toggle toggle-secondary"
                checked={preferences.global.quiet_hours.enabled}
                onChange={(e) => updateGlobalSetting('global.quiet_hours.enabled', e.target.checked)}
              />
            </label>
          </div>

          {preferences.global.quiet_hours.enabled && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Inizio</span>
                </label>
                <input 
                  type="time" 
                  className="input input-bordered"
                  value={preferences.global.quiet_hours.start_time}
                  onChange={(e) => updateGlobalSetting('global.quiet_hours.start_time', e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Fine</span>
                </label>
                <input 
                  type="time" 
                  className="input input-bordered"
                  value={preferences.global.quiet_hours.end_time}
                  onChange={(e) => updateGlobalSetting('global.quiet_hours.end_time', e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preferenze per Tipo */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h3 className="card-title">Tipi di Notifiche</h3>
          
          <div className="space-y-4">
            {Object.entries(preferences.types).map(([type, typePrefs]) => (
              <div key={type} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold">{getTypeLabel(type as NotificationType)}</h4>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-sm toggle-primary"
                    checked={typePrefs.enabled}
                    onChange={(e) => updateTypeSetting(type as NotificationType, 'enabled', e.target.checked)}
                  />
                </div>

                {typePrefs.enabled && (
                  <div className="space-y-3">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Soglia priorità</span>
                      </label>
                      <select 
                        className="select select-bordered select-sm"
                        value={typePrefs.priority_threshold}
                        onChange={(e) => updateTypeSetting(type as NotificationType, 'priority_threshold', e.target.value)}
                      >
                        {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as NotificationPriority[]).map(priority => (
                          <option key={priority} value={priority}>
                            {getPriorityLabel(priority)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Canali</span>
                      </label>
                      <div className="flex gap-4">
                        {Object.entries(typePrefs.channels).map(([channel, enabled]) => (
                          <label key={channel} className="label cursor-pointer">
                            <span className="label-text text-sm">{getChannelLabel(channel as NotificationChannel)}</span>
                            <input 
                              type="checkbox" 
                              className="checkbox checkbox-sm checkbox-primary"
                              checked={enabled}
                              onChange={(e) => {
                                const newChannels = { ...typePrefs.channels };
                                newChannels[channel as NotificationChannel] = e.target.checked;
                                updateTypeSetting(type as NotificationType, 'channels', newChannels);
                              }}
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preferenze per Canale */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title">Impostazioni Canali</h3>
          
          <div className="space-y-4">
            {Object.entries(preferences.channels).map(([channel, channelPrefs]) => (
              <div key={channel} className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3">{getChannelLabel(channel as NotificationChannel)}</h4>
                
                <div className="space-y-2">
                  <label className="label cursor-pointer">
                    <span className="label-text">Abilitato</span>
                    <input 
                      type="checkbox" 
                      className="toggle toggle-sm toggle-primary"
                      checked={channelPrefs.enabled}
                      onChange={(e) => updateChannelSetting(channel as NotificationChannel, 'enabled', e.target.checked)}
                    />
                  </label>

                  {channelPrefs.enabled && (
                    <>
                      {channel === 'in_app' && (
                        <>
                          <label className="label cursor-pointer">
                            <span className="label-text">Suono</span>
                            <input 
                              type="checkbox" 
                              className="toggle toggle-sm toggle-secondary"
                              checked={channelPrefs.sound}
                              onChange={(e) => updateChannelSetting(channel as NotificationChannel, 'sound', e.target.checked)}
                            />
                          </label>
                          <label className="label cursor-pointer">
                            <span className="label-text">Vibrazione</span>
                            <input 
                              type="checkbox" 
                              className="toggle toggle-sm toggle-secondary"
                              checked={channelPrefs.vibration}
                              onChange={(e) => updateChannelSetting(channel as NotificationChannel, 'vibration', e.target.checked)}
                            />
                          </label>
                        </>
                      )}

                      {channel === 'push' && (
                        <>
                          <label className="label cursor-pointer">
                            <span className="label-text">Suono</span>
                            <input 
                              type="checkbox" 
                              className="toggle toggle-sm toggle-secondary"
                              checked={channelPrefs.sound}
                              onChange={(e) => updateChannelSetting(channel as NotificationChannel, 'sound', e.target.checked)}
                            />
                          </label>
                          <label className="label cursor-pointer">
                            <span className="label-text">Badge</span>
                            <input 
                              type="checkbox" 
                              className="toggle toggle-sm toggle-secondary"
                              checked={channelPrefs.badge}
                              onChange={(e) => updateChannelSetting(channel as NotificationChannel, 'badge', e.target.checked)}
                            />
                          </label>
                          <label className="label cursor-pointer">
                            <span className="label-text">Allerte critiche</span>
                            <input 
                              type="checkbox" 
                              className="toggle toggle-sm toggle-secondary"
                              checked={channelPrefs.critical_alerts}
                              onChange={(e) => updateChannelSetting(channel as NotificationChannel, 'critical_alerts', e.target.checked)}
                            />
                          </label>
                        </>
                      )}

                      {channel === 'email' && (
                        <>
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">Frequenza</span>
                            </label>
                            <select 
                              className="select select-bordered select-sm"
                              value={channelPrefs.frequency}
                              onChange={(e) => updateChannelSetting(channel as NotificationChannel, 'frequency', e.target.value)}
                            >
                              <option value="immediate">Immediata</option>
                              <option value="hourly">Ogni ora</option>
                              <option value="daily">Giornaliera</option>
                            </select>
                          </div>
                          <label className="label cursor-pointer">
                            <span className="label-text">Includi riassunto</span>
                            <input 
                              type="checkbox" 
                              className="toggle toggle-sm toggle-secondary"
                              checked={channelPrefs.include_summary}
                              onChange={(e) => updateChannelSetting(channel as NotificationChannel, 'include_summary', e.target.checked)}
                            />
                          </label>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
