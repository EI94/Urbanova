'use client';

import React, { useState, useEffect } from 'react';
import { PlanCard } from '../plan/PlanCard';
import { RequirementEditor } from '../plan/RequirementEditor';
// import { InteractivePlan, InteractiveTaskSession } from '@urbanova/types/interactive';
// import { ToolActionSpec } from '@urbanova/types/tools';

// Mock types
type InteractivePlan = any;
type InteractiveTaskSession = any;
type ToolActionSpec = any;

interface ProjectPlannerPanelProps {
  projectId: string;
  onSendMessage: (message: string) => void;
}

export const ProjectPlannerPanel: React.FC<ProjectPlannerPanelProps> = ({
  projectId,
  onSendMessage,
}) => {
  const [session, setSession] = useState<InteractiveTaskSession | null>(null);
  const [plan, setPlan] = useState<InteractivePlan | null>(null);
  const [toolActions, setToolActions] = useState<ToolActionSpec[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveSession();
  }, [projectId]);

  const fetchActiveSession = async () => {
    try {
      setLoading(true);
      // In production, this would fetch the active session for the project
      const response = await fetch(`/api/plan/preview?sessionId=session-123`);

      if (!response.ok) {
        throw new Error('Failed to fetch session');
      }

      const data = await response.json();
      setSession(data.session);
      setPlan(data.plan);

      // Mock tool actions for demonstration
      setToolActions([
        {
          name: 'run_sensitivity',
          description: 'Esegui analisi di fattibilità con scenario di sensibilità',
          zArgs: {} as any,
          requiredRole: 'pm',
          confirm: true,
          longRunning: true,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action: 'confirm' | 'edit' | 'dryrun' | 'cancel') => {
    switch (action) {
      case 'confirm':
        onSendMessage('/plan confirm');
        break;
      case 'edit':
        setShowEditor(true);
        break;
      case 'dryrun':
        onSendMessage('/plan dryrun');
        break;
      case 'cancel':
        onSendMessage('/plan cancel');
        break;
    }
  };

  const handleSaveFills = async (fills: Record<string, any>) => {
    try {
      const response = await fetch('/api/plan/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: session?.id,
          fills,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update plan');
      }

      const data = await response.json();
      setSession(data.session);
      setPlan(data.plan);
      setShowEditor(false);

      // Send the slash command
      const slashCommand = `/plan edit ${Object.entries(fills)
        .map(([key, value]) => `key:${key} value:${JSON.stringify(value)}`)
        .join(' ')}`;

      console.log('Sending slash command:', slashCommand);
      onSendMessage(slashCommand);
    } catch (err) {
      console.error('Error updating plan:', err);
      setError(err instanceof Error ? err.message : 'Failed to update plan');
    }
  };

  const handleCancelEdit = () => {
    setShowEditor(false);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!session || !plan) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          <p>Nessun piano attivo per questo progetto</p>
          <p className="text-sm mt-2">Usa la chat per creare un nuovo piano</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Planner</h3>
        <p className="text-sm text-gray-600">Piano attivo per il progetto</p>
      </div>

      {showEditor ? (
        <RequirementEditor
          requirements={plan.requirements}
          plan={plan}
          toolActions={toolActions}
          onSave={handleSaveFills}
          onCancel={handleCancelEdit}
        />
      ) : (
        <PlanCard plan={plan} session={session} onAction={handleAction} />
      )}
    </div>
  );
};
