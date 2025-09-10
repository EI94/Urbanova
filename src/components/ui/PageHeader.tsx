'use client';

import { ArrowLeftIcon } from '@/components/icons';
import { useRouter } from 'next/navigation';
import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  showBackButton?: boolean;
  backHref?: string;
  actions?: React.ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  icon,
  showBackButton = false,
  backHref,
  actions,
  className = '',
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <div className={`bg-white border-b border-gray-100 ${className}`}>
      <div className="px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="p-2 -ml-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-200"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
            )}
            
            <div className="flex items-center space-x-3">
              {icon && (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                  {icon}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm text-gray-500 font-medium mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {actions && (
            <div className="flex items-center space-x-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
