'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { MarketingIcon, CampaignIcon, DocumentIcon } from '@/components/icons';

export default function MarketingPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📢 Marketing & Vendite</h1>
          <p className="text-gray-600 mt-1">
            Gestisci campagne marketing e materiali promozionali
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <MarketingIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Marketing</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Strategie e campagne marketing
            </p>
            <button className="btn btn-primary w-full">
              Gestisci Marketing
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <CampaignIcon className="h-8 w-8 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Campagne</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Crea e gestisci campagne promozionali
            </p>
            <button className="btn btn-primary w-full">
              Gestisci Campagne
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <DocumentIcon className="h-8 w-8 text-purple-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Materiali</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Gestisci materiali promozionali
            </p>
            <button className="btn btn-primary w-full">
              Gestisci Materiali
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}