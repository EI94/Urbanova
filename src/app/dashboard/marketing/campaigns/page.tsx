'use client';

import { TrendingUpIcon, TargetIcon } from '@/components/icons';

// Mock AnalyticsIcon
const AnalyticsIcon = TrendingUpIcon;
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function MarketingCampaignsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📈 Campagne Marketing</h1>
          <p className="text-gray-600 mt-1">Gestisci campagne marketing e pubblicitarie</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Campagne Attive */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <TrendingUpIcon className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Campagne Attive</h3>
            </div>
            <p className="text-gray-600 mb-4">Gestisci campagne in corso</p>
            <div className="text-sm text-gray-500">
              <div>• Campagne digitali</div>
              <div>• Social media</div>
              <div>• Pubblicità online</div>
            </div>
          </div>

          {/* Target Audience */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <TargetIcon className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Target Audience</h3>
            </div>
            <p className="text-gray-600 mb-4">Definisci e gestisci target</p>
            <div className="text-sm text-gray-500">
              <div>• Segmentazione</div>
              <div>• Profili cliente</div>
              <div>• Comportamenti</div>
            </div>
          </div>

          {/* Analytics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <AnalyticsIcon className="h-6 w-6 text-orange-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
            </div>
            <p className="text-gray-600 mb-4">Monitora performance campagne</p>
            <div className="text-sm text-gray-500">
              <div>• Metriche ROI</div>
              <div>• Conversioni</div>
              <div>• Report dettagliati</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
