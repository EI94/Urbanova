'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { UserIcon, BuildingIcon, EuroIcon } from '@/components/icons';

export default function ClientiPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">👥 Gestione Clienti</h1>
          <p className="text-gray-600 mt-1">Gestisci la tua base clienti e le relazioni commerciali</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Anagrafica Clienti */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <UserIcon className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Anagrafica</h3>
            </div>
            <p className="text-gray-600 mb-4">Gestisci dati anagrafici e contatti clienti</p>
            <div className="text-sm text-gray-500">
              <div>• Dati personali</div>
              <div>• Contatti</div>
              <div>• Preferenze</div>
            </div>
          </div>

          {/* Portfolio */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <BuildingIcon className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Portfolio</h3>
            </div>
            <p className="text-gray-600 mb-4">Gestisci portfolio e preferenze investimento</p>
            <div className="text-sm text-gray-500">
              <div>• Preferenze immobili</div>
              <div>• Budget disponibile</div>
              <div>• Zone di interesse</div>
            </div>
          </div>

          {/* Transazioni */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <EuroIcon className="h-6 w-6 text-orange-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Transazioni</h3>
            </div>
            <p className="text-gray-600 mb-4">Traccia transazioni e storico acquisti</p>
            <div className="text-sm text-gray-500">
              <div>• Storico acquisti</div>
              <div>• Preferenze pagamento</div>
              <div>• Documentazione</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}