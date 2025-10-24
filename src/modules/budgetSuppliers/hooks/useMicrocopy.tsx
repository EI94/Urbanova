/**
 * 🌐 BUDGET SUPPLIERS I18N HOOK
 * 
 * Hook per utilizzare microcopy e policy Budget & Suppliers
 */

import { useState, useEffect } from 'react';

// Import delle microcopy
import { budgetSuppliersMicrocopy } from '../lib/microcopy';

export interface BudgetSuppliersMicrocopy {
  microcopy: {
    budgetPrivacy: {
      title: string;
      message: string;
      description: string;
    };
    benchmarkDisclaimer: {
      title: string;
      message: string;
      description: string;
    };
    offerValidation: {
      title: string;
      message: string;
      description: string;
    };
    rfpGuidelines: {
      title: string;
      message: string;
      description: string;
    };
    contractMilestones: {
      title: string;
      message: string;
      description: string;
    };
    driftAlerts: {
      title: string;
      message: string;
      description: string;
    };
    vendorPortal: {
      title: string;
      message: string;
      description: string;
    };
    dataSecurity: {
      title: string;
      message: string;
      description: string;
    };
  };
  policy: {
    budgetConfidentiality: {
      title: string;
      content: string;
      enforcement: string;
    };
    benchmarkUsage: {
      title: string;
      content: string;
      enforcement: string;
    };
    offerTransparency: {
      title: string;
      content: string;
      enforcement: string;
    };
    vendorSelection: {
      title: string;
      content: string;
      enforcement: string;
    };
    contractManagement: {
      title: string;
      content: string;
      enforcement: string;
    };
    dataRetention: {
      title: string;
      content: string;
      enforcement: string;
    };
  };
  notifications: {
    rfpCreated: {
      title: string;
      message: string;
      action: string;
    };
    offersReceived: {
      title: string;
      message: string;
      action: string;
    };
    contractAwarded: {
      title: string;
      message: string;
      action: string;
    };
    driftDetected: {
      title: string;
      message: string;
      action: string;
    };
    milestoneReached: {
      title: string;
      message: string;
      action: string;
    };
  };
  tooltips: {
    budgetColumn: string;
    offerColumn: string;
    contractColumn: string;
    consuntivoColumn: string;
    deltaColumn: string;
    rfpStatus: string;
    offerCount: string;
    vendorCount: string;
    dueDate: string;
    bundleIndicator: string;
    driftIndicator: string;
  };
  placeholders: {
    searchItems: string;
    searchVendors: string;
    searchRfps: string;
    searchContracts: string;
    itemDescription: string;
    vendorNotes: string;
    contractNotes: string;
    salDescription: string;
    variationReason: string;
  };
  errors: {
    rfpCreation: {
      noItemsSelected: string;
      noVendorsSelected: string;
      invalidDueDate: string;
      duplicateRfpName: string;
    };
    offerSubmission: {
      incompleteOffer: string;
      invalidPrice: string;
      missingAttachments: string;
      expiredRfp: string;
    };
    contractCreation: {
      noItemsAwarded: string;
      invalidMilestones: string;
      missingVendorInfo: string;
    };
    salRecording: {
      invalidAmount: string;
      exceedsContract: string;
      duplicateSal: string;
    };
  };
  success: {
    rfpCreated: string;
    offersSubmitted: string;
    contractAwarded: string;
    salRecorded: string;
    variationCreated: string;
    dataExported: string;
    syncCompleted: string;
  };
  warnings: {
    budgetExceeded: string;
    scheduleDelay: string;
    qualityIssues: string;
    vendorPerformance: string;
    driftThreshold: string;
    expiringContracts: string;
  };
  confirmations: {
    deleteRfp: {
      title: string;
      message: string;
      confirm: string;
      cancel: string;
    };
    deleteOffer: {
      title: string;
      message: string;
      confirm: string;
      cancel: string;
    };
    deleteContract: {
      title: string;
      message: string;
      confirm: string;
      cancel: string;
    };
    closeRfp: {
      title: string;
      message: string;
      confirm: string;
      cancel: string;
    };
    syncBusinessPlan: {
      title: string;
      message: string;
      confirm: string;
      cancel: string;
    };
  };
  help: {
    gettingStarted: {
      title: string;
      steps: string[];
    };
    bestPractices: {
      title: string;
      tips: string[];
    };
    troubleshooting: {
      title: string;
      common: string[];
    };
  };
}

/**
 * Hook per utilizzare le microcopy Budget Suppliers
 */
export function useBudgetSuppliersMicrocopy(): BudgetSuppliersMicrocopy {
  const [microcopy, setMicrocopy] = useState<BudgetSuppliersMicrocopy | null>(null);
  
  useEffect(() => {
    // Carica microcopy
    setMicrocopy(budgetSuppliersMicrocopy as BudgetSuppliersMicrocopy);
  }, []);
  
  return microcopy || ({} as BudgetSuppliersMicrocopy);
}

/**
 * Utility per interpolare messaggi con variabili
 */
export function interpolateMessage(
  message: string, 
  variables: Record<string, string | number>
): string {
  let interpolated = message;
  
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    interpolated = interpolated.replace(new RegExp(placeholder, 'g'), String(value));
  });
  
  return interpolated;
}

/**
 * Utility per ottenere messaggi di notifica
 */
export function getNotificationMessage(
  type: keyof BudgetSuppliersMicrocopy['notifications'],
  variables?: Record<string, string | number>
): string {
  const notification = budgetSuppliersMicrocopy.notifications[type];
  
  if (variables) {
    return interpolateMessage(notification.message, variables);
  }
  
  return notification.message;
}

/**
 * Utility per ottenere messaggi di errore
 */
export function getErrorMessage(
  category: keyof BudgetSuppliersMicrocopy['errors'],
  error: string
): string {
  const errorCategory = budgetSuppliersMicrocopy.errors[category];
  
  return (errorCategory as any)[error] || 'Errore sconosciuto';
}

/**
 * Utility per ottenere tooltip
 */
export function getTooltip(
  key: keyof BudgetSuppliersMicrocopy['tooltips']
): string {
  return budgetSuppliersMicrocopy.tooltips[key];
}

/**
 * Utility per ottenere placeholder
 */
export function getPlaceholder(
  key: keyof BudgetSuppliersMicrocopy['placeholders']
): string {
  return budgetSuppliersMicrocopy.placeholders[key];
}

/**
 * Componente per mostrare microcopy chiave
 */
export function MicrocopyDisplay({ 
  type, 
  showDescription = false 
}: { 
  type: keyof BudgetSuppliersMicrocopy['microcopy'];
  showDescription?: boolean;
}) {
  const microcopy = useBudgetSuppliersMicrocopy();
  
  if (!microcopy.microcopy) return null;
  
  const item = microcopy.microcopy[type];
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-blue-900 mb-1">
            {item.title}
          </h4>
          <p className="text-sm text-blue-800 mb-2">
            {item.message}
          </p>
          {showDescription && (
            <p className="text-xs text-blue-700">
              {item.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Componente per mostrare policy
 */
export function PolicyDisplay({ 
  type 
}: { 
  type: keyof BudgetSuppliersMicrocopy['policy'];
}) {
  const microcopy = useBudgetSuppliersMicrocopy();
  
  if (!microcopy.policy) return null;
  
  const policy = microcopy.policy[type];
  
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-amber-900 mb-2">
            {policy.title}
          </h4>
          <p className="text-sm text-amber-800 mb-2">
            {policy.content}
          </p>
          <p className="text-xs text-amber-700 font-medium">
            {policy.enforcement}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente per mostrare help
 */
export function HelpDisplay({ 
  type 
}: { 
  type: keyof BudgetSuppliersMicrocopy['help'];
}) {
  const microcopy = useBudgetSuppliersMicrocopy();
  
  if (!microcopy.help) return null;
  
  const help = microcopy.help[type];
  
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-green-900 mb-2">
            {help.title}
          </h4>
          <ul className="text-sm text-green-800 space-y-1">
            {help.steps?.map((step, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-green-600 font-medium">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
            {help.tips?.map((tip, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-green-600 font-medium">•</span>
                <span>{tip}</span>
              </li>
            ))}
            {help.common?.map((item, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-green-600 font-medium">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
