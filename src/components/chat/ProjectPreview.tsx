'use client';

import React from 'react';
import { ProjectPreview as ProjectPreviewType } from '@/lib/intentService';
import Link from 'next/link';

interface ProjectPreviewProps {
  project: ProjectPreviewType;
  onViewProject?: (projectId: string) => void;
}

export default function ProjectPreview({ project, onViewProject }: ProjectPreviewProps) {
  const handleClick = () => {
    if (onViewProject) {
      onViewProject(project.id);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer max-w-sm">
      <div className="flex items-start space-x-3">
        {/* Icona del progetto */}
        <div className="flex-shrink-0">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            project.type === 'market-intelligence' 
              ? 'bg-green-100' 
              : project.type === 'design'
              ? 'bg-purple-100'
              : project.type === 'business-plan'
              ? 'bg-orange-100'
              : 'bg-blue-100'
          }`}>
            {project.type === 'market-intelligence' ? (
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            ) : project.type === 'design' ? (
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
            ) : project.type === 'business-plan' ? (
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
              </svg>
            )}
          </div>
        </div>

        {/* Contenuto del progetto */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {project.preview?.title || 'Progetto senza titolo'}
            </h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              Creato
            </span>
          </div>
          
          <p className="text-xs text-gray-500 mb-2">
            {project.preview?.description || 'Nessuna descrizione disponibile'}
          </p>
          
          {/* Informazioni chiave */}
          <div className="space-y-1">
            {(project.preview?.keyInfo || []).slice(0, 2).map((info, index) => (
              <div key={index} className="text-xs text-gray-600">
                {info}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Azione */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <Link 
          href={project.url} 
          className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-500"
          onClick={handleClick}
        >
          <span>
            {project.type === 'market-intelligence' 
              ? 'Visualizza ricerca' 
              : project.type === 'design'
              ? 'Visualizza design'
              : project.type === 'business-plan'
              ? 'Visualizza business plan'
              : 'Visualizza progetto'
            }
          </span>
          <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}