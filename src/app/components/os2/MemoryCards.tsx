'use client';

// 🎨 MEMORY CARDS - UI per visualizzare e modificare memoria OS 2.0
// Badge editabile nel sidecar per ProjectMemory

import React, { useState, useEffect } from 'react';
import { ProjectMemory, ProjectMemoryDefaults } from '@/os2/memory/types';
import { getMemoryStore } from '@/os2/memory/MemoryStore';
import { Pencil, Save, X, TrendingUp, DollarSign, Calendar, Target } from 'lucide-react';

interface MemoryCardsProps {
  projectId?: string;
  userId: string;
  onUpdate?: (memory: ProjectMemory) => void;
}

export function MemoryCards({ projectId, userId, onUpdate }: MemoryCardsProps) {
  const [projectMemory, setProjectMemory] = useState<ProjectMemory | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDefaults, setEditedDefaults] = useState<Partial<ProjectMemoryDefaults>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load project memory
  useEffect(() => {
    if (!projectId) return;
    
    const loadMemory = async () => {
      try {
        setLoading(true);
        const memoryStore = getMemoryStore();
        const memory = await memoryStore.getProjectMemory(projectId);
        
        if (memory) {
          setProjectMemory(memory);
          setEditedDefaults(memory.defaults);
        } else {
          // Crea default memory se non esiste
          const defaultMemory: ProjectMemory = {
            projectId,
            defaults: {
              discountRate: 0.12,
              marginTarget: 0.20,
              currency: 'EUR',
              contingency: 0.10,
              salesCommission: 0.03,
            },
            history: [],
            lastAccessed: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          await memoryStore.setProjectMemory(defaultMemory);
          setProjectMemory(defaultMemory);
          setEditedDefaults(defaultMemory.defaults);
        }
      } catch (err) {
        console.error('Errore caricamento memoria:', err);
        setError('Impossibile caricare i parametri del progetto');
      } finally {
        setLoading(false);
      }
    };
    
    loadMemory();
  }, [projectId]);
  
  const handleSave = async () => {
    if (!projectMemory || !projectId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const memoryStore = getMemoryStore();
      
      // Update project memory
      await memoryStore.updateProjectMemory({
        projectId,
        defaults: editedDefaults,
      });
      
      // Reload
      const updated = await memoryStore.getProjectMemory(projectId);
      if (updated) {
        setProjectMemory(updated);
        onUpdate?.(updated);
      }
      
      setIsEditing(false);
    } catch (err) {
      console.error('Errore salvataggio:', err);
      setError('Impossibile salvare le modifiche');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    setEditedDefaults(projectMemory?.defaults || {});
    setIsEditing(false);
    setError(null);
  };
  
  if (!projectId) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-500">Seleziona un progetto per vedere i parametri</p>
      </div>
    );
  }
  
  if (loading && !projectMemory) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Parametri Progetto
        </h3>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            title="Modifica parametri"
          >
            <Pencil className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex gap-1">
            <button
              onClick={handleSave}
              disabled={loading}
              className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors disabled:opacity-50"
              title="Salva"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              title="Annulla"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      
      {/* Error */}
      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
          {error}
        </div>
      )}
      
      {/* Badges */}
      <div className="grid grid-cols-2 gap-2">
        {/* Discount Rate */}
        <Badge
          icon={<TrendingUp className="w-3.5 h-3.5" />}
          label="Tasso Sconto"
          value={isEditing ? undefined : `${((projectMemory?.defaults.discountRate || 0) * 100).toFixed(1)}%`}
          isEditing={isEditing}
          editValue={editedDefaults.discountRate}
          onEditChange={(val) => setEditedDefaults(prev => ({ ...prev, discountRate: val }))}
          editType="percentage"
        />
        
        {/* Margin Target */}
        <Badge
          icon={<Target className="w-3.5 h-3.5" />}
          label="Margine Target"
          value={isEditing ? undefined : `${((projectMemory?.defaults.marginTarget || 0) * 100).toFixed(1)}%`}
          isEditing={isEditing}
          editValue={editedDefaults.marginTarget}
          onEditChange={(val) => setEditedDefaults(prev => ({ ...prev, marginTarget: val }))}
          editType="percentage"
        />
        
        {/* Sales Commission */}
        <Badge
          icon={<DollarSign className="w-3.5 h-3.5" />}
          label="Commissioni"
          value={isEditing ? undefined : `${((projectMemory?.defaults.salesCommission || 0) * 100).toFixed(1)}%`}
          isEditing={isEditing}
          editValue={editedDefaults.salesCommission}
          onEditChange={(val) => setEditedDefaults(prev => ({ ...prev, salesCommission: val }))}
          editType="percentage"
        />
        
        {/* Contingency */}
        <Badge
          icon={<Calendar className="w-3.5 h-3.5" />}
          label="Contingency"
          value={isEditing ? undefined : `${((projectMemory?.defaults.contingency || 0) * 100).toFixed(1)}%`}
          isEditing={isEditing}
          editValue={editedDefaults.contingency}
          onEditChange={(val) => setEditedDefaults(prev => ({ ...prev, contingency: val }))}
          editType="percentage"
        />
      </div>
      
      {/* Project Name */}
      {projectMemory?.projectName && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Progetto: <span className="font-medium text-gray-700">{projectMemory.projectName}</span>
          </p>
        </div>
      )}
    </div>
  );
}

interface BadgeProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  isEditing: boolean;
  editValue?: number;
  onEditChange?: (value: number) => void;
  editType?: 'percentage' | 'number';
}

function Badge({ icon, label, value, isEditing, editValue, onEditChange, editType = 'number' }: BadgeProps) {
  const [localValue, setLocalValue] = useState('');
  
  useEffect(() => {
    if (isEditing && editValue !== undefined) {
      // Convert to display format (percentage as 0-100)
      const displayValue = editType === 'percentage' ? editValue * 100 : editValue;
      setLocalValue(displayValue.toFixed(1));
    }
  }, [isEditing, editValue, editType]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);
    
    const numVal = parseFloat(val);
    if (!isNaN(numVal) && onEditChange) {
      // Convert back to storage format (percentage as 0-1)
      const storageValue = editType === 'percentage' ? numVal / 100 : numVal;
      onEditChange(storageValue);
    }
  };
  
  return (
    <div className="p-2.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow transition-shadow">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-gray-400">{icon}</span>
        <span className="text-xs font-medium text-gray-600">{label}</span>
      </div>
      
      {!isEditing ? (
        <p className="text-sm font-semibold text-gray-900">{value || '-'}</p>
      ) : (
        <div className="relative">
          <input
            type="number"
            value={localValue}
            onChange={handleChange}
            step="0.1"
            min="0"
            max={editType === 'percentage' ? '100' : undefined}
            className="w-full text-sm font-semibold text-gray-900 border-b border-blue-300 focus:border-blue-500 outline-none bg-transparent pb-0.5"
          />
          {editType === 'percentage' && (
            <span className="absolute right-0 top-0 text-xs text-gray-400">%</span>
          )}
        </div>
      )}
    </div>
  );
}

