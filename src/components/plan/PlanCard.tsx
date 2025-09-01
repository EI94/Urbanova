'use client';

import React from 'react';
import { Badge } from '../ui/Badge';
import Button from '../ui/Button';
import { Card } from '../ui/Card';
import {
  InteractivePlan,
  InteractiveTaskSession,
  InteractiveRequirement,
  InteractiveAssumption,
  InteractiveRisk,
} from '@urbanova/types/interactive';

interface PlanCardProps {
  plan: InteractivePlan;
  session: InteractiveTaskSession;
  onAction: (action: 'confirm' | 'edit' | 'dryrun' | 'cancel') => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, session, onAction }) => {
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'project':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-purple-100 text-purple-800';
      case 'default':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatCost = (cost: number) => {
    if (cost < 1000) return `${cost} tokens`;
    return `${(cost / 1000).toFixed(1)}k tokens`;
  };

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h3 className="text-xl font-semibold text-gray-900">Piano Proposto</h3>
        <p className="text-gray-600 mt-1">{plan.description}</p>
      </div>

      {/* Assunzioni */}
      {plan.assumptions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Assunzioni
          </h4>
          <div className="flex flex-wrap gap-2">
            {plan.assumptions.map(assumption => (
              <div key={assumption.id} className="flex items-center gap-2">
                <Badge className={getSourceColor(assumption.source || 'default')}>
                  {assumption.source || 'default'}
                </Badge>
                <Badge className={getConfidenceColor(assumption.confidence)}>
                  {assumption.confidence}
                </Badge>
                <span className="text-sm text-gray-700">{assumption.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mancano */}
      {plan.requirements.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            Mancano
          </h4>
          <div className="space-y-2">
            {plan.requirements.map(requirement => (
              <div
                key={requirement.id}
                className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200"
              >
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="font-medium text-orange-800">{requirement.field}</div>
                  <div className="text-sm text-orange-700">{requirement.description}</div>
                </div>
                <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                  {requirement.type}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rischi */}
      {plan.risks.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            Rischi
          </h4>
          <div className="flex flex-wrap gap-2">
            {plan.risks.map(risk => (
              <div key={risk.id} className="flex items-center gap-2">
                <Badge className={getSeverityColor(risk.severity)}>{risk.severity}</Badge>
                <span className="text-sm text-gray-700">{risk.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stima */}
      {(plan.estimatedDuration || plan.totalCost) && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Stima
          </h4>
          <div className="flex gap-4">
            {plan.estimatedDuration && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">⏱️ Tempo:</span>
                <span className="font-medium">{formatDuration(plan.estimatedDuration)}</span>
              </div>
            )}
            {plan.totalCost && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">💰 Costo:</span>
                <span className="font-medium">{formatCost(plan.totalCost)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CTA Buttons */}
      <div className="flex flex-wrap gap-3 pt-4 border-t">
        <Button
          onClick={() => onAction('confirm')}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          ✅ Conferma & Esegui
        </Button>
        <Button
          onClick={() => onAction('edit')}
          variant="outline"
          className="border-blue-300 text-blue-700 hover:bg-blue-50"
        >
          ✏️ Modifica Parametri
        </Button>
        <Button
          onClick={() => onAction('dryrun')}
          variant="outline"
          className="border-purple-300 text-purple-700 hover:bg-purple-50"
        >
          🔍 Dry-run
        </Button>
        <Button
          onClick={() => onAction('cancel')}
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-50"
        >
          ❌ Annulla
        </Button>
      </div>
    </Card>
  );
};
