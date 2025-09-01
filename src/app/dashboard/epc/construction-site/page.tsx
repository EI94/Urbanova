'use client';

import { BuildingIcon, SafetyIcon, CheckIcon } from '@/components/icons';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function EPCConstructionSitePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🏗️ Cantiere EPC</h1>
          <p className="text-gray-600 mt-1">
            Gestisci documentazione e certificazioni del cantiere
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Documentazione Cantiere */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <BuildingIcon className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Documentazione</h3>
            </div>
            <p className="text-gray-600 mb-4">Gestisci documenti cantiere</p>
            <div className="text-sm text-gray-500">
              <div>• Permessi cantiere</div>
              <div>• Planimetrie</div>
              <div>• Relazioni tecniche</div>
            </div>
          </div>

          {/* Sicurezza */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <SafetyIcon className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Sicurezza</h3>
            </div>
            <p className="text-gray-600 mb-4">Certificazioni sicurezza</p>
            <div className="text-sm text-gray-500">
              <div>• Certificazioni sicurezza</div>
              <div>• Controlli periodici</div>
              <div>• Formazione operatori</div>
            </div>
          </div>

          {/* Controlli Qualità */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <CheckIcon className="h-6 w-6 text-orange-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Controlli</h3>
            </div>
            <p className="text-gray-600 mb-4">Controlli qualità e conformità</p>
            <div className="text-sm text-gray-500">
              <div>• Controlli qualità</div>
              <div>• Conformità norme</div>
              <div>• Certificazioni EPC</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
