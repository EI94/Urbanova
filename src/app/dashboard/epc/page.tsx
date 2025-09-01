'use client';

import { BuildingIcon, DocumentIcon, SettingsIcon } from '@/components/icons';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function EPCPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            🏗️ EPC - Energy Performance Certificate
          </h1>
          <p className="text-gray-600 mt-1">
            Gestisci certificazioni energetiche e documentazione tecnica
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cantiere */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <BuildingIcon className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Cantiere</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Gestisci documentazione del cantiere e certificazioni
            </p>
            <div className="text-sm text-gray-500">
              <div>• Certificazioni energetiche</div>
              <div>• Documentazione cantiere</div>
              <div>• Controlli qualità</div>
            </div>
          </div>

          {/* Documenti Tecnici */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <DocumentIcon className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Documenti Tecnici</h3>
            </div>
            <p className="text-gray-600 mb-4">Archivia e gestisci documentazione tecnica</p>
            <div className="text-sm text-gray-500">
              <div>• Progetti esecutivi</div>
              <div>• Relazioni tecniche</div>
              <div>• Certificazioni</div>
            </div>
          </div>

          {/* Permessi */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <SettingsIcon className="h-6 w-6 text-orange-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Permessi</h3>
            </div>
            <p className="text-gray-600 mb-4">Gestisci autorizzazioni e permessi edilizi</p>
            <div className="text-sm text-gray-500">
              <div>• Permessi di costruire</div>
              <div>• Autorizzazioni paesaggistiche</div>
              <div>• Conformità urbanistica</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
