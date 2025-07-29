'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { MapIcon, LocationIcon, BuildingIcon } from '@/components/icons';

export default function MappaPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🗺️ Mappa</h1>
          <p className="text-gray-600 mt-1">Visualizza progetti e opportunità su mappa interattiva</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mappa Interattiva */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <MapIcon className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Mappa Interattiva</h3>
            </div>
            <p className="text-gray-600 mb-4">Visualizza progetti su mappa</p>
            <div className="text-sm text-gray-500">
              <div>• Progetti attivi</div>
              <div>• Opportunità</div>
              <div>• Zone di interesse</div>
            </div>
          </div>

          {/* Analisi Territoriale */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <LocationIcon className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Analisi Territoriale</h3>
            </div>
            <p className="text-gray-600 mb-4">Analizza trend e opportunità</p>
            <div className="text-sm text-gray-500">
              <div>• Trend di mercato</div>
              <div>• Densità progetti</div>
              <div>• Zone emergenti</div>
            </div>
          </div>

          {/* Gestione Progetti */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <BuildingIcon className="h-6 w-6 text-orange-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Gestione Progetti</h3>
            </div>
            <p className="text-gray-600 mb-4">Gestisci progetti su mappa</p>
            <div className="text-sm text-gray-500">
              <div>• Aggiungi progetti</div>
              <div>• Modifica posizioni</div>
              <div>• Filtri avanzati</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}