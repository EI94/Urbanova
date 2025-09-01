'use client';

import { BuildingIcon, DocumentIcon, MeetingIcon } from '@/components/icons';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function ProjectManagementPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📋 Gestione Progetti</h1>
          <p className="text-gray-600 mt-1">
            Gestisci documenti, riunioni e timeline dei tuoi progetti
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <DocumentIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Documenti</h2>
            </div>
            <p className="text-gray-600 mb-4">Gestisci tutti i documenti dei tuoi progetti</p>
            <button className="btn btn-primary w-full">Gestisci Documenti</button>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <MeetingIcon className="h-8 w-8 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Riunioni</h2>
            </div>
            <p className="text-gray-600 mb-4">Pianifica e gestisci le riunioni di progetto</p>
            <button className="btn btn-primary w-full">Gestisci Riunioni</button>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <BuildingIcon className="h-8 w-8 text-purple-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Timeline</h2>
            </div>
            <p className="text-gray-600 mb-4">Visualizza e gestisci le timeline dei progetti</p>
            <button className="btn btn-primary w-full">Gestisci Timeline</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
