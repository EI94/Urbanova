import { useState, useEffect } from 'react';
import { FeasibilityService } from '../lib/feasibilityService';

export interface FeasibilityProjectData {
  id: string;
  name: string;
  location: string;
  type: string;
  status: string;
  investment: number;
  revenue: number;
  roi: number;
  margin: number;
  createdAt: string;
  description?: string;
}

export function useFeasibilityProjects() {
  const [projects, setProjects] = useState<FeasibilityProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        // Carica progetti dal dashboard service (dati esistenti)
        const dashboardProjects = [
          {
            id: 'ciliegie-project',
            name: 'Ciliegie',
            location: 'Via delle Ciliegie, 157 Roma',
            type: 'residential',
            status: 'planning',
            investment: 200000,
            revenue: 622000,
            roi: 211, // (622000 - 200000) / 200000 * 100
            margin: 68, // (622000 - 200000) / 622000 * 100
            createdAt: '2024-01-01T00:00:00Z',
            description: 'Progetto residenziale Via delle Ciliegie, 157 Roma'
          },
          {
            id: 'morena-editoriale-project',
            name: 'Morena Editoriale',
            location: 'Via Campo Romano, 66 Roma',
            type: 'commercial',
            status: 'planning',
            investment: 1000000,
            revenue: 1608000,
            roi: 60.8, // (1608000 - 1000000) / 1000000 * 100
            margin: 37.8, // (1608000 - 1000000) / 1608000 * 100
            createdAt: '2024-02-01T00:00:00Z',
            description: 'Progetto commerciale Via Campo Romano, 66 Roma'
          }
        ];

        // Prova a caricare anche da Firebase se disponibile
        try {
          const feasibilityService = new FeasibilityService();
          const firebaseProjects = await feasibilityService.getAllProjects();
          
          // Converte i progetti Firebase nel formato richiesto
          const convertedProjects = firebaseProjects.map(project => ({
            id: project.id || `firebase-${Date.now()}`,
            name: project.name,
            location: project.address,
            type: project.status === 'PIANIFICAZIONE' ? 'planning' : 
                  project.status === 'IN_CORSO' ? 'in_progress' : 
                  project.status === 'COMPLETATO' ? 'completed' : 'suspended',
            status: project.status.toLowerCase(),
            investment: project.costs.total,
            revenue: project.revenues.total,
            roi: project.results.roi,
            margin: project.results.margin,
            createdAt: project.createdAt.toISOString(),
            description: project.notes || `${project.name} - ${project.address}`
          }));

          setProjects([...dashboardProjects, ...convertedProjects]);
        } catch (firebaseError) {
          console.warn('Errore nel caricamento da Firebase, uso solo dati dashboard:', firebaseError);
          setProjects(dashboardProjects);
        }

      } catch (err) {
        console.error('Errore nel caricamento progetti:', err);
        setError('Errore nel caricamento dei progetti');
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const addProject = (project: Omit<FeasibilityProjectData, 'id' | 'createdAt'>) => {
    const newProject: FeasibilityProjectData = {
      ...project,
      id: `local-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setProjects(prev => [...prev, newProject]);
  };

  const updateProject = (id: string, updates: Partial<FeasibilityProjectData>) => {
    setProjects(prev => prev.map(project => 
      project.id === id ? { ...project, ...updates } : project
    ));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
  };

  return {
    projects,
    loading,
    error,
    addProject,
    updateProject,
    deleteProject
  };
}
