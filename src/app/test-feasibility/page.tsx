'use client';

import { useState, useEffect } from 'react';
import { feasibilityService, FeasibilityProject } from '@/lib/feasibilityService';

export default function TestFeasibilityPage() {
  const [projects, setProjects] = useState<FeasibilityProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 [TEST] Caricamento tutti i progetti...');
      
      const allProjects = await feasibilityService.getAllProjects();
      console.log('✅ [TEST] Progetti totali:', allProjects.length);
      
      // Filtra progetti per pierpaolo.laurito@gmail.com
      const userProjects = allProjects.filter(project => 
        project.createdBy === 'pierpaolo.laurito@gmail.com'
      );
      
      console.log('👤 [TEST] Progetti per pierpaolo.laurito@gmail.com:', userProjects.length);
      
      // Cerca specificamente "Ciliegie"
      const ciliegieProject = allProjects.find(project => 
        project.name && project.name.toLowerCase().includes('ciliegie')
      );
      
      if (ciliegieProject) {
        console.log('🍒 [TEST] TROVATO PROGETTO CILIEGIE!', ciliegieProject);
      } else {
        console.log('❌ [TEST] Progetto Ciliegie non trovato');
      }
      
      setProjects(userProjects);
    } catch (err) {
      console.error('❌ [TEST] Errore caricamento dati:', err);
      setError('Errore nel caricamento dei dati di test');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento dati di test...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌ Errore</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={loadData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Test Recupero Dati Fattibilità
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">📊 Statistiche</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{projects.length}</div>
              <div className="text-sm text-gray-600">Progetti per pierpaolo.laurito@gmail.com</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {projects.filter(p => p.name && p.name.toLowerCase().includes('ciliegie')).length}
              </div>
              <div className="text-sm text-gray-600">Progetti "Ciliegie"</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(projects.map(p => p.status)).size}
              </div>
              <div className="text-sm text-gray-600">Status diversi</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">📋 Progetti Trovati</h2>
          </div>
          
          {projects.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-4">📭</div>
              <p>Nessun progetto trovato per pierpaolo.laurito@gmail.com</p>
            </div>
          ) : (
            <div className="divide-y">
              {projects.map((project, index) => (
                <div key={project.id || index} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {project.name || 'Senza nome'}
                        {project.name && project.name.toLowerCase().includes('ciliegie') && (
                          <span className="ml-2 text-green-600">🍒</span>
                        )}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <strong>ID:</strong> {project.id || 'N/A'}
                        </div>
                        <div>
                          <strong>Indirizzo:</strong> {project.address || 'N/A'}
                        </div>
                        <div>
                          <strong>Status:</strong> {project.status || 'N/A'}
                        </div>
                        <div>
                          <strong>Creato:</strong> {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.status === 'completed' ? 'bg-green-100 text-green-800' :
                        project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {project.status || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
