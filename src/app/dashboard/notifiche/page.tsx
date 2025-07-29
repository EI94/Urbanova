'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { BellIcon, MailIcon, AlertIcon } from '@/components/icons';

export default function NotifichePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🔔 Notifiche</h1>
          <p className="text-gray-600 mt-1">Gestisci notifiche e comunicazioni del sistema</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Notifiche Sistema */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <BellIcon className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Sistema</h3>
            </div>
            <p className="text-gray-600 mb-4">Notifiche tecniche e aggiornamenti sistema</p>
            <div className="text-sm text-gray-500">
              <div>• Aggiornamenti software</div>
              <div>• Manutenzione</div>
              <div>• Errori sistema</div>
            </div>
          </div>

          {/* Email */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <MailIcon className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Email</h3>
            </div>
            <p className="text-gray-600 mb-4">Gestisci notifiche email e preferenze</p>
            <div className="text-sm text-gray-500">
              <div>• Report automatici</div>
              <div>• Aggiornamenti progetti</div>
              <div>• Newsletter</div>
            </div>
          </div>

          {/* Avvisi */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <AlertIcon className="h-6 w-6 text-orange-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Avvisi</h3>
            </div>
            <p className="text-gray-600 mb-4">Avvisi importanti e scadenze</p>
            <div className="text-sm text-gray-500">
              <div>• Scadenze progetti</div>
              <div>• Permessi scaduti</div>
              <div>• Pagamenti</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}