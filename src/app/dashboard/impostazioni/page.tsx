'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { SettingsIcon, UserIcon, ShieldIcon } from '@/components/icons';

export default function ImpostazioniPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">⚙️ Impostazioni</h1>
          <p className="text-gray-600 mt-1">Configura le impostazioni del tuo account e del sistema</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profilo Utente */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <UserIcon className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Profilo</h3>
            </div>
            <p className="text-gray-600 mb-4">Gestisci dati personali e preferenze</p>
            <div className="text-sm text-gray-500">
              <div>• Dati personali</div>
              <div>• Preferenze lingua</div>
              <div>• Fuso orario</div>
            </div>
          </div>

          {/* Sicurezza */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <ShieldIcon className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Sicurezza</h3>
            </div>
            <p className="text-gray-600 mb-4">Configura sicurezza e privacy</p>
            <div className="text-sm text-gray-500">
              <div>• Password</div>
              <div>• Autenticazione 2FA</div>
              <div>• Privacy</div>
            </div>
          </div>

          {/* Sistema */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <SettingsIcon className="h-6 w-6 text-orange-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Sistema</h3>
            </div>
            <p className="text-gray-600 mb-4">Configurazione sistema e API</p>
            <div className="text-sm text-gray-500">
              <div>• API Keys</div>
              <div>• Integrazioni</div>
              <div>• Backup</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}