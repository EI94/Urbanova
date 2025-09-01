'use client';

import React, { ReactNode } from 'react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: ReactNode;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ type, title, children, onClose }) => {
  const getAlertClasses = () => {
    switch (type) {
      case 'success':
        return 'alert alert-success';
      case 'error':
        return 'alert alert-error';
      case 'warning':
        return 'alert alert-warning';
      case 'info':
        return 'alert alert-info';
      default:
        return 'alert alert-info';
    }
  };

  return (
    <div className={getAlertClasses()}>
      <div className="flex-1">
        {title && <h3 className="font-bold">{title}</h3>}
        <div className="text-sm">{children}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className="btn btn-sm btn-ghost" aria-label="Chiudi">
          ✕
        </button>
      )}
    </div>
  );
};

export default Alert;
