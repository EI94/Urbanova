'use client';

import { DocumentIcon, VideoIcon } from '@/components/icons';

// Mock ImageIcon
const ImageIcon = DocumentIcon;
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function MarketingMaterialsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📋 Materiali Marketing</h1>
          <p className="text-gray-600 mt-1">Gestisci materiali promozionali e contenuti</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Brochure e Cataloghi */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <DocumentIcon className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Brochure</h3>
            </div>
            <p className="text-gray-600 mb-4">Gestisci materiali cartacei</p>
            <div className="text-sm text-gray-500">
              <div>• Brochure progetto</div>
              <div>• Cataloghi</div>
              <div>• Flyer promozionali</div>
            </div>
          </div>

          {/* Immagini e Video */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <ImageIcon className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Multimedia</h3>
            </div>
            <p className="text-gray-600 mb-4">Gestisci contenuti multimediali</p>
            <div className="text-sm text-gray-500">
              <div>• Foto progetto</div>
              <div>• Video promozionali</div>
              <div>• Rendering 3D</div>
            </div>
          </div>

          {/* Contenuti Digitali */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <VideoIcon className="h-6 w-6 text-orange-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Digital</h3>
            </div>
            <p className="text-gray-600 mb-4">Contenuti per web e social</p>
            <div className="text-sm text-gray-500">
              <div>• Post social media</div>
              <div>• Banner web</div>
              <div>• Email marketing</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
