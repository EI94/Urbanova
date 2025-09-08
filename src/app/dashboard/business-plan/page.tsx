'use client';

import React, { useState } from 'react';
import Link from 'next/link';

import { BuildingIcon, FileTextIcon } from '@/components/icons';
import {
  BarChart3,
  FileText,
  Shield,
  Calendar,
  Plus,
  Target,
  Bot,
  Sparkles,
  MessageCircle,
  Search,
  TrendingUp,
  Settings,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import FeedbackWidget from '@/components/ui/FeedbackWidget';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function BusinessPlanPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              Business Plan Generator AI
            </h1>
            <p className="text-gray-600 mt-2">
              Genera piani d'affari professionali con proiezioni finanziarie intelligenti
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Plan Generator</h2>
          <p className="text-gray-600">Funzionalità in sviluppo...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
