'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { BuildingIcon, LocationIcon, PlusIcon } from '@/components/icons';
import Link from 'next/link';
import { getProjects, RealEstateProject } from '@/lib/firestoreService';
import { useLanguage } from '@/contexts/LanguageContext';

// Componente Card Progetto
interface ProjectCardProps {
  project: RealEstateProject;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const { t, formatCurrency: fmtCurrency } = useLanguage();
  
  const getStatusColor = () => {
    switch (project.status) {
      case 'COMPLETATO':
        return 'bg-success text-white';
      case 'IN_CORSO':
        return 'bg-info text-white';
      case 'PIANIFICAZIONE':
        return 'bg-warning text-white';
      case 'IN_ATTESA':
        return 'bg-neutral text-white';
      default:
        return 'bg-base-300 text-neutral-800';
    }
  };

  // Calcolo del progresso per la barra
  const getProgress = () => {
    if (project.status === 'COMPLETATO') return 100;
    if (project.status === 'PIANIFICAZIONE') return 10;
    if (project.status === 'IN_ATTESA') return 30;
    if (project.status === 'IN_CORSO') return 65;
    return 0;
  };

  const formatBudget = (budget?: number) => {
    if (!budget) return 'N/D';
    return fmtCurrency(budget);
  };

  const progress = getProgress();

  return (
    <div className="card bg-base-100 shadow-smooth-md hover:shadow-smooth-lg transition-shadow duration-300">
      <div className="card-body p-5">
        <div className="flex justify-between items-start">
          <h3 className="card-title text-lg font-semibold text-neutral-900">{project.name}</h3>
          <div className={`badge ${getStatusColor()} py-1 px-2`}>
            {project.status.replace('_', ' ')}
          </div>
        </div>
        <p className="mt-2 text-neutral-600 line-clamp-2">{project.description}</p>
        
        {project.propertyType && (
          <div className="mt-3 flex items-center">
            <BuildingIcon className="h-4 w-4 text-blue-500 mr-1" />
            <span className="text-sm text-neutral-700">{project.propertyType}</span>
            {project.units && (
              <span className="ml-2 text-sm text-neutral-500">{project.units} {t('units', 'projects')}</span>
            )}
          </div>
        )}
        
        {progress > 0 && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-neutral-700">{t('progress', 'projects')}</span>
              <span className="text-xs font-medium text-neutral-700">{progress}%</span>
            </div>
            <div className="w-full bg-base-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <div className="flex items-center mt-4 text-sm text-neutral-500">
          <LocationIcon className="h-4 w-4 mr-1" />
          <span>{project.location}</span>
        </div>
        
        {project.budget && (
          <div className="mt-1 text-sm text-neutral-700">
            <span className="font-medium">{t('budget', 'projects')}: </span>
            <span>{formatBudget(project.budget)}</span>
          </div>
        )}
        
        <div className="card-actions justify-end mt-4">
          <Link href={`/dashboard/progetti/${project.id}`} className="btn btn-sm btn-outline">
            {t('details', 'projects')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function ProgettiPage() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState<RealEstateProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectsData = await getProjects();
        setProjects(projectsData);
      } catch (err) {
        console.error('Errore nel caricamento dei progetti:', err);
        setError(t('errorLoadingProjects', 'projects'));
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [t]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
          <span className="ml-4 text-lg">{t('loadingProjects', 'projects')}</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('errorTitle', 'projects')}</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🏗️ {t('title', 'projects')}</h1>
            <p className="text-gray-600 mt-1">{t('subtitle', 'projects')}</p>
          </div>
          <Link href="/dashboard/progetti/nuovo">
            <button className="btn btn-primary">
              <PlusIcon className="h-4 w-4 mr-2" />
              {t('newProject', 'projects')}
            </button>
          </Link>
        </div>

        {/* Statistiche */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-2xl font-bold text-blue-600">{projects.length}</div>
            <div className="text-sm text-gray-600">{t('totalProjects', 'projects')}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-2xl font-bold text-green-600">
              {projects.filter(p => p.status === 'COMPLETATO').length}
            </div>
            <div className="text-sm text-gray-600">{t('completedProjects', 'projects')}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {projects.filter(p => p.status === 'IN_CORSO').length}
            </div>
            <div className="text-sm text-gray-600">{t('inProgressProjects', 'projects')}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-2xl font-bold text-purple-600">
              {projects.filter(p => p.status === 'PIANIFICAZIONE').length}
            </div>
            <div className="text-sm text-gray-600">{t('planningProjects', 'projects')}</div>
          </div>
        </div>

        {/* Lista Progetti */}
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <BuildingIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">{t('noProjects', 'projects')}</h3>
            <p className="text-gray-500 mb-4">{t('createFirstProject', 'projects')}</p>
            <Link href="/dashboard/progetti/nuovo">
              <button className="btn btn-primary">
                <PlusIcon className="h-4 w-4 mr-2" />
                {t('newProject', 'projects')}
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 