'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { SettingsIcon, UserIcon, ShieldIcon } from '@/components/icons';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ImpostazioniPage() {
  const { t } = useLanguage();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">⚙️ {t('title', 'settings')}</h1>
          <p className="text-gray-600 mt-1">{t('subtitle', 'settings')}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profilo Utente */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <UserIcon className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">{t('profile.title', 'settings')}</h3>
            </div>
            <p className="text-gray-600 mb-4">{t('profile.subtitle', 'settings')}</p>
            <div className="text-sm text-gray-500">
              <div>• {t('profile.personalData', 'settings')}</div>
              <div>• {t('profile.languagePreferences', 'settings')}</div>
              <div>• {t('profile.timezone', 'settings')}</div>
            </div>
          </div>

          {/* Sicurezza */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <ShieldIcon className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">{t('security.title', 'settings')}</h3>
            </div>
            <p className="text-gray-600 mb-4">{t('security.subtitle', 'settings')}</p>
            <div className="text-sm text-gray-500">
              <div>• {t('security.password', 'settings')}</div>
              <div>• {t('security.twoFactorAuth', 'settings')}</div>
              <div>• {t('security.privacy', 'settings')}</div>
            </div>
          </div>

          {/* Sistema */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <SettingsIcon className="h-6 w-6 text-orange-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">{t('system.title', 'settings')}</h3>
            </div>
            <p className="text-gray-600 mb-4">{t('system.subtitle', 'settings')}</p>
            <div className="text-sm text-gray-500">
              <div>• {t('system.apiKeys', 'settings')}</div>
              <div>• {t('system.integrations', 'settings')}</div>
              <div>• {t('system.backup', 'settings')}</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}