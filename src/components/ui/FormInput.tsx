'use client';

import React, { InputHTMLAttributes, ReactNode } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
  icon?: ReactNode;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  error,
  icon,
  className = '',
  ...props
}) => {
  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text font-medium text-gray-700">{label}</span>
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{icon}</span>
          </div>
        )}
        <input
          name={name}
          className={`
            input input-bordered w-full
            ${icon ? 'pl-10' : ''}
            ${error ? 'input-error' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
};

export default FormInput; 