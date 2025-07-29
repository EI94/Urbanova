'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { DocumentIcon, ApprovalIcon, CalendarIcon } from '@/components/icons';

export default function EPCPermitsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📜 Permessi EPC</h1>
          <p className="text-gray-600 mt-1">Gestisci autorizzazioni e permessi edilizi</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Permessi di Costruire */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <DocumentIcon className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Permessi</h3>
            </div>
            <p className="text-gray-600 mb-4">Gestisci permessi di costruire</p>
            <div className="text-sm text-gray-500">
              <div>• Permesso di costruire</div>
              <div>• SCIA</div>
              <div>• CILA</div>
            </div>
          </div>

          {/* Autorizzazioni */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <ApprovalIcon className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Autorizzazioni</h3>
            </div>
            <p className="text-gray-600 mb-4">Autorizzazioni paesaggistiche</p>
            <div className="text-sm text-gray-500">
              <div>• Autorizzazioni paesaggistiche</div>
              <div>• Vincoli ambientali</div>
              <div>• Conformità urbanistica</div>
            </div>
          </div>

          {/* Scadenze */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <CalendarIcon className="h-6 w-6 text-orange-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Scadenze</h3>
            </div>
            <p className="text-gray-600 mb-4">Gestisci scadenze permessi</p>
            <div className="text-sm text-gray-500">
              <div>• Scadenze permessi</div>
              <div>• Rinnovi</div>
              <div>• Promemoria</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}