'use client';

import { CalendarIcon, UsersIcon, VideoIcon } from '@/components/icons';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function ProjectMeetingsPage() {
  return (
    <DashboardLayout title="Riunioni">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📅 Riunioni Progetto</h1>
          <p className="text-gray-600 mt-1">Gestisci riunioni e incontri del progetto</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Calendario Riunioni */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <CalendarIcon className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Calendario</h3>
            </div>
            <p className="text-gray-600 mb-4">Pianifica e gestisci riunioni</p>
            <div className="text-sm text-gray-500">
              <div>• Pianificazione riunioni</div>
              <div>• Promemoria</div>
              <div>• Calendario condiviso</div>
            </div>
          </div>

          {/* Partecipanti */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <UsersIcon className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Partecipanti</h3>
            </div>
            <p className="text-gray-600 mb-4">Gestisci partecipanti riunioni</p>
            <div className="text-sm text-gray-500">
              <div>• Team progetto</div>
              <div>• Stakeholder</div>
              <div>• Inviti automatici</div>
            </div>
          </div>

          {/* Video Conferenza */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <VideoIcon className="h-6 w-6 text-orange-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Video Conferenza</h3>
            </div>
            <p className="text-gray-600 mb-4">Riunioni online e registrazioni</p>
            <div className="text-sm text-gray-500">
              <div>• Link meeting</div>
              <div>• Registrazioni</div>
              <div>• Condivisione schermo</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
