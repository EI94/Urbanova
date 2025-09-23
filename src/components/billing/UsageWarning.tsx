'use client';

import React from 'react';
import { AlertTriangle, TrendingUp, X } from 'lucide-react';

interface UsageWarningProps {
  toolAction: string;
  currentUsage: number;
  limit: number;
  type: 'soft' | 'hard';
  onDismiss?: () => void;
  onUpgrade?: () => void;
}

export default function UsageWarning({
  toolAction,
  currentUsage,
  limit,
  type,
  onDismiss,
  onUpgrade,
}: UsageWarningProps) {
  const percentage = Math.round((currentUsage / limit) * 100);

  const getActionLabel = (action: string): string => {
    const labels: Record<string, string> = {
      'ocr.process': 'OCR Processing',
      'feasibility.run_bp': 'Business Plans',
      'land-scraper.scan_market': 'Market Scans',
      'market-intelligence.scan_city': 'Market Intelligence',
      'deal-caller.send_questionnaire': 'Questionnaires',
    };
    return labels[action] || action;
  };

  const getWarningConfig = () => {
    if (type === 'hard') {
      return {
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        iconColor: 'text-red-600',
        buttonColor: 'bg-red-600 hover:bg-red-700',
        title: 'Usage Limit Reached',
        message: `You've reached your ${getActionLabel(toolAction)} limit. Upgrade your plan to continue using this feature.`,
      };
    } else {
      return {
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800',
        iconColor: 'text-yellow-600',
        buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
        title: 'Approaching Usage Limit',
        message: `You've used ${percentage}% of your ${getActionLabel(toolAction)} limit. Consider upgrading to avoid interruptions.`,
      };
    }
  };

  const config = getWarningConfig();

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 mb-4`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <AlertTriangle className={`h-5 w-5 ${config.iconColor} mt-0.5 flex-shrink-0`} />

          <div className="flex-1">
            <h4 className={`font-medium ${config.textColor} mb-1`}>{config.title}</h4>

            <p className={`text-sm ${config.textColor} mb-3`}>{config.message}</p>

            {/* Usage Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className={config.textColor}>
                  {currentUsage.toLocaleString()} / {limit.toLocaleString()} used
                </span>
                <span className={`font-medium ${config.textColor}`}>{percentage}%</span>
              </div>

              <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${type === 'hard' ? 'bg-red-500' : 'bg-yellow-500'}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {onUpgrade && (
                <button
                  onClick={onUpgrade}
                  className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${config.buttonColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50`}
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Upgrade Plan
                </button>
              )}

              {type === 'soft' && onDismiss && (
                <button
                  onClick={onDismiss}
                  className={`text-sm ${config.textColor} hover:underline`}
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Close Button */}
        {onDismiss && (
          <button onClick={onDismiss} className={`${config.iconColor} hover:opacity-75 ml-2`}>
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
