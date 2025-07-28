'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { BuildingIcon, LocationIcon } from '@/components/icons';
import Link from 'next/link';
import { getProjects, RealEstateProject } from '@/lib/firestoreService';

// Componente Card Progetto
interface ProjectCardProps {
  project: RealEstateProject;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
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
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(budget);
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
              <span className="ml-2 text-sm text-neutral-500">{project.units} unità</span>
            )}
          </div>
        )}
        
        {progress > 0 && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-neutral-700">Progresso</span>
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
            <span className="font-medium">Budget: </span>
            <span>{formatBudget(project.budget)}</span>
          </div>
        )}
        
        <div className="card-actions justify-end mt-4">
          <Link href={`/dashboard/progetti/${project.id}`} className="btn btn-sm btn-outline">
            Dettagli
          </Link>
        </div>
      </div>
    </div>
  );
};

// Filtri stato
interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const FilterButton = ({ active, onClick, children }: FilterButtonProps) => (
  <button
    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      active 
        ? 'bg-blue-700 text-white' 
        : 'bg-white text-neutral-700 hover:bg-blue-50'
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

export default function ProgettiPage() {
  const [projects, setProjects] = useState<RealEstateProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (error) {
        console.error('Errore nel caricamento dei progetti:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProjects();
  }, []);
  
  // Filtraggio dei progetti in base allo stato selezionato
  const filteredProjects = filter
    ? projects.filter(project => project.status === filter)
    : projects;
  
  // Conteggio per tipologia
  const projectCounts = {
    total: projects.length,
    residenziali: projects.filter(p => p.propertyType === 'RESIDENZIALE').length,
    commerciali: projects.filter(p => p.propertyType === 'COMMERCIALE').length,
    misti: projects.filter(p => p.propertyType === 'MISTO').length,
    industriali: projects.filter(p => p.propertyType === 'INDUSTRIALE').length,
  };

  return (
    <DashboardLayout title="Progetti">
      {/* Statistiche */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="stat bg-white shadow-sm rounded-lg p-4">
          <div className="stat-title text-neutral-500">Totale</div>
          <div className="stat-value text-2xl">{projectCounts.total}</div>
        </div>
        <div className="stat bg-white shadow-sm rounded-lg p-4">
          <div className="stat-title text-neutral-500">Residenziali</div>
          <div className="stat-value text-2xl">{projectCounts.residenziali}</div>
        </div>
        <div className="stat bg-white shadow-sm rounded-lg p-4">
          <div className="stat-title text-neutral-500">Commerciali</div>
          <div className="stat-value text-2xl">{projectCounts.commerciali}</div>
        </div>
        <div className="stat bg-white shadow-sm rounded-lg p-4">
          <div className="stat-title text-neutral-500">Misti</div>
          <div className="stat-value text-2xl">{projectCounts.misti}</div>
        </div>
        <div className="stat bg-white shadow-sm rounded-lg p-4">
          <div className="stat-title text-neutral-500">Industriali</div>
          <div className="stat-value text-2xl">{projectCounts.industriali}</div>
        </div>
      </div>
      
      {/* Header con filtri e azioni */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0">
          <FilterButton 
            active={filter === null} 
            onClick={() => setFilter(null)}
          >
            Tutti
          </FilterButton>
          <FilterButton 
            active={filter === 'IN_CORSO'} 
            onClick={() => setFilter('IN_CORSO')}
          >
            In Corso
          </FilterButton>
          <FilterButton 
            active={filter === 'PIANIFICAZIONE'} 
            onClick={() => setFilter('PIANIFICAZIONE')}
          >
            Pianificazione
          </FilterButton>
          <FilterButton 
            active={filter === 'COMPLETATO'} 
            onClick={() => setFilter('COMPLETATO')}
          >
            Completati
          </FilterButton>
          <FilterButton 
            active={filter === 'IN_ATTESA'} 
            onClick={() => setFilter('IN_ATTESA')}
          >
            In Attesa
          </FilterButton>
        </div>
        
        <Link href="/dashboard/progetti/nuovo" className="btn btn-primary">
          Nuovo Progetto
        </Link>
      </div>
      
      {/* Lista Progetti */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <BuildingIcon className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-700">Nessun progetto trovato</h3>
          <p className="mt-1 text-neutral-500">
            {filter 
              ? `Non ci sono progetti con lo stato selezionato.` 
              : `Non hai ancora creato alcun progetto.`}
          </p>
          <Link href="/dashboard/progetti/nuovo" className="btn btn-primary mt-4">
            Crea Nuovo Progetto
          </Link>
        </div>
      )}
    </DashboardLayout>
  );
} 