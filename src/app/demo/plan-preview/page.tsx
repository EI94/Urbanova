'use client';

import React, { useState } from 'react';
import { MessagePlanPreview } from '../../../components/chat/MessagePlanPreview';
import { ProjectPlannerPanel } from '../../../components/project/ProjectPlannerPanel';
import { InteractivePlan, InteractiveTaskSession } from '@urbanova/types/interactive';
import { ToolActionSpec } from '@urbanova/types/tools';

// Mock data for demonstration
const mockPlan: InteractivePlan = {
  id: 'plan-123',
  title: 'Analisi di Fattibilità',
  description: "Esegue un'analisi completa di fattibilità del progetto con scenario di sensibilità",
  steps: [
    {
      id: 'step-1',
      toolId: 'feasibility',
      action: 'run_sensitivity',
      description: 'Esegui analisi di fattibilità con scenario di sensibilità',
      zArgs: { projectId: 'project-123', deltas: [0.1, 0.2, 0.3] },
      requiredRole: 'pm',
      order: 1,
    },
  ],
  requirements: [
    {
      id: 'req-1',
      field: 'projectId',
      description: "ID del progetto è richiesto per l'analisi di sensibilità",
      type: 'text',
      required: true,
      currentValue: 'project-123',
    },
    {
      id: 'req-2',
      field: 'deltas',
      description: "Array di delta per l'analisi di sensibilità",
      type: 'number',
      required: true,
      currentValue: [0.1, 0.2, 0.3],
    },
  ],
  assumptions: [
    {
      id: 'assump-1',
      source: 'project',
      confidence: 'high',
      description: 'Analisi per il progetto: project-123',
    },
  ],
  risks: [
    {
      id: 'risk-1',
      type: 'irreversible',
      severity: 'medium',
      description: '1 azione richiede conferma utente',
    },
  ],
  estimatedDuration: 300,
  totalCost: 100,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockSession: InteractiveTaskSession = {
  id: 'session-123',
  projectId: 'project-123',
  userId: 'user-123',
  status: 'awaiting_confirm',
  plan: mockPlan,
  replies: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockToolActions: ToolActionSpec[] = [
  {
    name: 'run_sensitivity',
    description: 'Esegui analisi di fattibilità con scenario di sensibilità',
    zArgs: {} as any,
    requiredRole: 'pm',
    confirm: true,
    longRunning: true,
  },
];

export default function PlanPreviewDemo() {
  const [messages, setMessages] = useState<string[]>([]);

  const handleSendMessage = (message: string) => {
    setMessages(prev => [...prev, message]);
    console.log('Message sent:', message);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Plan Preview Demo</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Chat Interface</h2>

              {/* Chat Messages */}
              <div className="space-y-4 mb-6">
                <MessagePlanPreview
                  plan={mockPlan}
                  session={mockSession}
                  toolActions={mockToolActions}
                  onSendMessage={handleSendMessage}
                />
              </div>

              {/* Message Log */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Message Log:</h3>
                <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                  {messages.length === 0 ? (
                    <p className="text-gray-500 text-sm">No messages sent yet</p>
                  ) : (
                    <div className="space-y-1">
                      {messages.map((message, index) => (
                        <div key={index} className="text-sm text-gray-700">
                          <span className="font-mono text-blue-600">{message}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Project Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <ProjectPlannerPanel projectId="project-123" onSendMessage={handleSendMessage} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
