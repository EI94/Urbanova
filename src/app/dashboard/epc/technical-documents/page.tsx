'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { DocumentIcon, EngineeringIcon, CertificateIcon } from '@/components/icons';

export default function EPCTechnicalDocumentsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📋 Documenti Tecnici EPC</h1>
          <p className="text-gray-600 mt-1">Gestisci documentazione tecnica e certificazioni</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Progetti Esecutivi */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <DocumentIcon className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Progetti</h3>
            </div>
            <p className="text-gray-600 mb-4">Progetti esecutivi e tecnici</p>
            <div className="text-sm text-gray-500">
              <div>• Progetti esecutivi</div>
              <div>• Dettagli costruttivi</div>
              <div>• Specifiche tecniche</div>
            </div>
          </div>

          {/* Ingegneria */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <EngineeringIcon className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Ingegneria</h3>
            </div>
            <p className="text-gray-600 mb-4">Documenti ingegneristici</p>
            <div className="text-sm text-gray-500">
              <div>• Calcoli strutturali</div>
              <div>• Relazioni tecniche</div>
              <div>• Verifiche normative</div>
            </div>
          </div>

          {/* Certificazioni */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <CertificateIcon className="h-6 w-6 text-orange-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Certificazioni</h3>
            </div>
            <p className="text-gray-600 mb-4">Certificazioni e attestazioni</p>
            <div className="text-sm text-gray-500">
              <div>• Certificazioni EPC</div>
              <div>• Attestazioni conformità</div>
              <div>• Documenti autorizzativi</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}