'use client';

import React, { useState } from 'react';
import { PlanCard } from '../plan/PlanCard';
import { RequirementEditor } from '../plan/RequirementEditor';
import { InteractivePlan, InteractiveTaskSession } from '@urbanova/types/interactive';
import { ToolActionSpec } from '@urbanova/types/tools';

interface MessagePlanPreviewProps {
  plan: InteractivePlan;
  session: InteractiveTaskSession;
  toolActions: ToolActionSpec[];
  onSendMessage: (message: string) => void;
}

export const MessagePlanPreview: React.FC<MessagePlanPreviewProps> = ({
  plan,
  session,
  toolActions,
  onSendMessage,
}) => {
  const [showEditor, setShowEditor] = useState(false);

  const serializeFillsToSlashCommand = (fills: Record<string, any>): string => {
    const commands = Object.entries(fills).map(([key, value]) => {
      const jsonValue = JSON.stringify(value);
      return `key:${key} value:${jsonValue}`;
    });
    return `/plan edit ${commands.join(' ')}`;
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

  const handleSaveFills = (fills: Record<string, any>) => {
    const slashCommand = serializeFillsToSlashCommand(fills);
    console.log('Sending slash command:', slashCommand);
    onSendMessage(slashCommand);
    setShowEditor(false);
  };

  const handleCancelEdit = () => {
    setShowEditor(false);
  };

  return (
    <div className="flex justify-end mb-4">
      <div className="max-w-2xl w-full">
        {/* Chat Bubble */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">AI</span>
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600 mb-2">
                Ho preparato un piano per te. Controlla i dettagli e conferma per procedere:
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
          </div>
        </div>
      </div>
    </div>
  );
};
