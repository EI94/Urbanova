'use client';

import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import Button from '../ui/Button';
import { Card } from '../ui/Card';
import FormInput from '../ui/FormInput';
import { Badge } from '../ui/Badge';
import { InteractiveRequirement, InteractivePlan } from '@urbanova/types/interactive';
import { ToolActionSpec } from '@urbanova/types/tools';

interface RequirementEditorProps {
  requirements: InteractiveRequirement[];
  plan: InteractivePlan;
  toolActions: ToolActionSpec[];
  onSave: (fills: Record<string, any>) => void;
  onCancel: () => void;
}

export const RequirementEditor: React.FC<RequirementEditorProps> = ({
  requirements,
  plan,
  toolActions,
  onSave,
  onCancel,
}) => {
  const [fills, setFills] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize fills with current values
  useEffect(() => {
    const initialFills: Record<string, any> = {};
    requirements.forEach(req => {
      if (req.currentValue !== undefined) {
        initialFills[req.field] = req.currentValue;
      }
    });
    setFills(initialFills);
  }, [requirements]);

  const validateField = (field: string, value: any): string | null => {
    const requirement = requirements.find(r => r.field === field);
    if (!requirement) return null;

    // Basic validation based on type
    switch (requirement.type) {
      case 'text':
        if (requirement.required && (!value || value.trim() === '')) {
          return 'Campo obbligatorio';
        }
        break;
      case 'number':
        if (requirement.required && (value === null || value === undefined || value === '')) {
          return 'Campo obbligatorio';
        }
        if (value !== null && value !== undefined && value !== '' && isNaN(Number(value))) {
          return 'Deve essere un numero';
        }
        break;
      case 'select':
        if (requirement.required && (!value || value === '')) {
          return 'Campo obbligatorio';
        }
        if (requirement.options && value && !requirement.options.includes(value)) {
          return 'Valore non valido';
        }
        break;
      case 'date':
        if (requirement.required && (!value || value === '')) {
          return 'Campo obbligatorio';
        }
        if (value && isNaN(Date.parse(value))) {
          return 'Data non valida';
        }
        break;
      case 'boolean':
        // Boolean fields are always valid
        break;
    }

    return null;
  };

  const handleFieldChange = (field: string, value: any) => {
    const newFills = { ...fills, [field]: value };
    setFills(newFills);

    // Validate field
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error || '',
    }));
  };

  const handleSave = () => {
    // Validate all fields
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    requirements.forEach(req => {
      const error = validateField(req.field, fills[req.field]);
      if (error) {
        newErrors[req.field] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);

    if (!hasErrors) {
      onSave(fills);
    }
  };

  const renderField = (requirement: InteractiveRequirement) => {
    const value = fills[requirement.field];
    const error = errors[requirement.field];

    switch (requirement.type) {
      case 'text':
        return (
          <FormInput
            type="text"
            value={value || ''}
            onChange={e => handleFieldChange(requirement.field, e.target.value)}
            placeholder={requirement.description}
            error={error}
            required={requirement.required}
          />
        );

      case 'number':
        return (
          <FormInput
            type="number"
            value={value || ''}
            onChange={e => handleFieldChange(requirement.field, e.target.value)}
            placeholder={requirement.description}
            error={error}
            required={requirement.required}
          />
        );

      case 'select':
        return (
          <div className="space-y-2">
            <select
              value={value || ''}
              onChange={e => handleFieldChange(requirement.field, e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              required={requirement.required}
            >
              <option value="">Seleziona...</option>
              {requirement.options?.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        );

      case 'date':
        return (
          <FormInput
            type="date"
            value={value || ''}
            onChange={e => handleFieldChange(requirement.field, e.target.value)}
            error={error}
            required={requirement.required}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id={requirement.field}
              checked={value || false}
              onChange={e => handleFieldChange(requirement.field, e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor={requirement.field} className="text-sm text-gray-700">
              {requirement.description}
            </label>
          </div>
        );

      default:
        return (
          <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
            <p className="text-sm text-gray-600">
              Tipo di campo non supportato: {requirement.type}
            </p>
          </div>
        );
    }
  };

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h3 className="text-xl font-semibold text-gray-900">Modifica Parametri</h3>
        <p className="text-gray-600 mt-1">Completa i campi mancanti per procedere con il piano</p>
      </div>

      {/* Requirements List */}
      <div className="space-y-6">
        {requirements.map(requirement => (
          <div key={requirement.id} className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                {requirement.type}
              </Badge>
              <h4 className="font-medium text-gray-900">{requirement.field}</h4>
              {requirement.required && <span className="text-red-500 text-sm">*</span>}
            </div>
            <p className="text-sm text-gray-600">{requirement.description}</p>
            {renderField(requirement)}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
          💾 Salva Parametri
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          ❌ Annulla
        </Button>
      </div>
    </Card>
  );
};
