'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { DocumentIcon, FolderIcon, UploadIcon } from '@/components/icons';

export default function DocumentiPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📄 Documenti</h1>
          <p className="text-gray-600 mt-1">Gestisci documentazione e archivi digitali</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Archivio */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <FolderIcon className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Archivio</h3>
            </div>
            <p className="text-gray-600 mb-4">Organizza e cataloga documenti</p>
            <div className="text-sm text-gray-500">
              <div>• Categorie documenti</div>
              <div>• Ricerca avanzata</div>
              <div>• Versioning</div>
            </div>
          </div>

          {/* Upload */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <UploadIcon className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Upload</h3>
            </div>
            <p className="text-gray-600 mb-4">Carica nuovi documenti</p>
            <div className="text-sm text-gray-500">
              <div>• Drag & drop</div>
              <div>• Multi-upload</div>
              <div>• Formati supportati</div>
            </div>
          </div>

          {/* Condivisione */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <DocumentIcon className="h-6 w-6 text-orange-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Condivisione</h3>
            </div>
            <p className="text-gray-600 mb-4">Condividi documenti con team</p>
            <div className="text-sm text-gray-500">
              <div>• Permessi accesso</div>
              <div>• Link condivisi</div>
              <div>• Collaborazione</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}