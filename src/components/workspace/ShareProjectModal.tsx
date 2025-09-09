'use client';

import React, { useState, useEffect } from 'react';
import { X, Users, Mail, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Workspace, WorkspaceMember } from '@/types/workspace';

interface ShareProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectType: 'feasibility' | 'business-plan' | 'market-intelligence' | 'design';
  projectName: string;
  workspaces: Workspace[];
  onShare: (workspaceId: string, permissions: any) => void;
}

export default function ShareProjectModal({
  isOpen,
  onClose,
  projectId,
  projectType,
  projectName,
  workspaces,
  onShare
}: ShareProjectModalProps) {
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [permissions, setPermissions] = useState({
    canView: [] as string[],
    canEdit: [] as string[],
    canDelete: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Carica membri quando cambia workspace
  useEffect(() => {
    if (selectedWorkspace) {
      loadWorkspaceMembers(selectedWorkspace);
    }
  }, [selectedWorkspace]);

  const loadWorkspaceMembers = async (workspaceId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/workspace/${workspaceId}/members?userId=${localStorage.getItem('userId')}`);
      const data = await response.json();
      
      if (data.success) {
        setMembers(data.members);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Errore nel caricamento dei membri');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (userId: string, permissionType: 'canView' | 'canEdit' | 'canDelete', checked: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [permissionType]: checked 
        ? [...prev[permissionType], userId]
        : prev[permissionType].filter(id => id !== userId)
    }));
  };

  const handleShare = async () => {
    if (!selectedWorkspace) {
      setError('Seleziona un workspace');
      return;
    }

    const hasAnyPermissions = permissions.canView.length > 0 || permissions.canEdit.length > 0 || permissions.canDelete.length > 0;
    if (!hasAnyPermissions) {
      setError('Seleziona almeno un permesso per un membro');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await onShare(selectedWorkspace, permissions);
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setSelectedWorkspace('');
        setPermissions({ canView: [], canEdit: [], canDelete: [] });
      }, 2000);

    } catch (err) {
      setError('Errore nella condivisione del progetto');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Condividi Progetto</h2>
              <p className="text-sm text-gray-500">{projectName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Workspace Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleziona Workspace
            </label>
            <select
              value={selectedWorkspace}
              onChange={(e) => setSelectedWorkspace(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Scegli un workspace...</option>
              {workspaces.map(workspace => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name} - {workspace.companyName}
                </option>
              ))}
            </select>
          </div>

          {/* Members and Permissions */}
          {selectedWorkspace && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Seleziona Membri e Permessi
              </label>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Caricamento membri...</span>
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Nessun membro trovato in questo workspace</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {members.map(member => (
                    <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {member.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{member.email}</p>
                            <p className="text-sm text-gray-500 capitalize">{member.role}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={permissions.canView.includes(member.userId)}
                            onChange={(e) => handlePermissionChange(member.userId, 'canView', e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Visualizza</span>
                        </label>
                        
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={permissions.canEdit.includes(member.userId)}
                            onChange={(e) => handlePermissionChange(member.userId, 'canEdit', e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Modifica</span>
                        </label>
                        
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={permissions.canDelete.includes(member.userId)}
                            onChange={(e) => handlePermissionChange(member.userId, 'canDelete', e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Elimina</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-700">Progetto condiviso con successo!</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={handleShare}
            disabled={loading || !selectedWorkspace || success}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{loading ? 'Condividendo...' : 'Condividi'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
