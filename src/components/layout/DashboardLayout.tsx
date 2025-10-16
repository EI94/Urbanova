'use client';

import { MessageSquare, Bell, User, Users, Settings, X, Building2, BarChart3, FileText } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
// Import minimale per debug
import { Bot, Sparkles } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  hideHeader?: boolean;
}

export default function DashboardLayout({ children, title = 'Dashboard' }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar semplificata */}
        <div className="w-64 bg-white shadow-sm border-r min-h-screen">
          <div className="px-6 py-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Urbanova</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header semplificato */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100">
                  <Bell className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100">
                  <User className="w-5 h-5" />
                </button>
              </div>
            </div>
          </header>
          
          {/* Content Area */}
          <div className="flex-1 p-6">
            {children}
          </div>
        </div>
      </div>

      {/* 🆕 OS 2.0 Floating Button - VERSIONE SICURA */}
      <button
        onClick={() => {
          console.log('🎯 [OS2] Floating button clicked!');
          alert('OS 2.0 Floating Button funziona!\n\nProssimo step: implementare Sidecar');
        }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        title="Apri Urbanova OS (⌘J)"
        aria-label="Apri Urbanova OS"
      >
        <Bot className="w-6 h-6 group-hover:scale-110 transition-transform" />
        <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 animate-pulse" />
      </button>
    </div>
  );
}