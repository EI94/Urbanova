'use client';

import React, { useState } from 'react';
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
  Users,
  Eye,
  Download,
  Share,
  Edit,
  Trash2,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import FeedbackWidget from '@/components/ui/FeedbackWidget';

// ============================================================================
// TYPES
// ============================================================================

interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'social' | 'print' | 'digital';
  status: 'draft' | 'active' | 'paused' | 'completed';
  budget: number;
  spent: number;
  reach: number;
  engagement: number;
  startDate: string;
  endDate: string;
  targetAudience: string;
  description: string;
}

interface Material {
  id: string;
  name: string;
  type: 'brochure' | 'flyer' | 'poster' | 'video' | 'presentation';
  status: 'draft' | 'review' | 'approved' | 'published';
  createdAt: string;
  updatedAt: string;
  size: string;
  format: string;
  description: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'materials' | 'analytics'>('campaigns');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  // Mock data
  React.useEffect(() => {
    const mockCampaigns: Campaign[] = [
      {
        id: '1',
        name: 'Campagna Residenziale Q1 2024',
        type: 'digital',
        status: 'active',
        budget: 50000,
        spent: 32000,
        reach: 125000,
        engagement: 8.5,
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        targetAudience: 'Famiglie 25-45 anni',
        description: 'Campagna digitale per promuovere nuovi progetti residenziali',
      },
      {
        id: '2',
        name: 'Marketing Commerciale Roma',
        type: 'social',
        status: 'paused',
        budget: 25000,
        spent: 15000,
        reach: 85000,
        engagement: 6.2,
        startDate: '2024-02-01',
        endDate: '2024-04-30',
        targetAudience: 'Imprenditori e PMI',
        description: 'Campagna social media per progetti commerciali',
      },
      {
        id: '3',
        name: 'Evento Immobiliare Milano',
        type: 'print',
        status: 'completed',
        budget: 15000,
        spent: 15000,
        reach: 5000,
        engagement: 12.8,
        startDate: '2024-01-15',
        endDate: '2024-01-20',
        targetAudience: 'Investitori immobiliari',
        description: 'Materiale promozionale per evento esclusivo',
      },
    ];

    const mockMaterials: Material[] = [
      {
        id: '1',
        name: 'Brochure Progetto Aurora',
        type: 'brochure',
        status: 'approved',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-15',
        size: 'A4',
        format: 'PDF',
        description: 'Brochure completa del progetto residenziale Aurora',
      },
      {
        id: '2',
        name: 'Video Presentazione Skyline',
        type: 'video',
        status: 'review',
        createdAt: '2024-01-20',
        updatedAt: '2024-01-25',
        size: '1920x1080',
        format: 'MP4',
        description: 'Video promozionale del progetto Skyline Tower',
      },
      {
        id: '3',
        name: 'Flyer Evento Milano',
        type: 'flyer',
        status: 'published',
        createdAt: '2024-01-05',
        updatedAt: '2024-01-08',
        size: 'A5',
        format: 'PDF',
        description: 'Flyer per evento immobiliare a Milano',
      },
    ];

    setCampaigns(mockCampaigns);
    setMaterials(mockMaterials);
  }, []);

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'text-gray-600 bg-gray-100',
      active: 'text-green-600 bg-green-100',
      paused: 'text-yellow-600 bg-yellow-100',
      completed: 'text-blue-600 bg-blue-100',
      review: 'text-orange-600 bg-orange-100',
      approved: 'text-green-600 bg-green-100',
      published: 'text-blue-600 bg-blue-100',
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      draft: 'Bozza',
      active: 'Attiva',
      paused: 'In Pausa',
      completed: 'Completata',
      review: 'In Revisione',
      approved: 'Approvato',
      published: 'Pubblicato',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      email: 'Email',
      social: 'Social Media',
      print: 'Stampa',
      digital: 'Digitale',
      brochure: 'Brochure',
      flyer: 'Volantino',
      poster: 'Poster',
      video: 'Video',
      presentation: 'Presentazione',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('it-IT').format(num);
  };

  return (
    <DashboardLayout title="Marketing & Vendite">
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-600" />
                Marketing & Vendite
              </h1>
              <p className="text-gray-600 mt-2">
                Gestisci campagne marketing e materiali promozionali
              </p>
            </div>
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Nuova Campagna
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'campaigns'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Campagne
            </button>
            <button
              onClick={() => setActiveTab('materials')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'materials'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Materiali
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Analytics
            </button>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'campaigns' && (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <BarChart3 className="w-5 h-5 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                        <span className="text-sm text-gray-500">{getTypeLabel(campaign.type)}</span>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{campaign.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Budget</p>
                          <p className="font-medium">{formatCurrency(campaign.budget)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Speso</p>
                          <p className="font-medium">{formatCurrency(campaign.spent)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Copertura</p>
                          <p className="font-medium">{formatNumber(campaign.reach)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Engagement</p>
                          <p className="font-medium">{campaign.engagement}%</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Inizio</p>
                          <p className="font-medium">{formatDate(campaign.startDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Fine</p>
                          <p className="font-medium">{formatDate(campaign.endDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Target</p>
                          <p className="font-medium">{campaign.targetAudience}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                          {getStatusLabel(campaign.status)}
                        </span>
                      </div>

                      {/* Progress bar for budget */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-500 mb-1">
                          <span>Budget Utilizzato</span>
                          <span>{Math.round((campaign.spent / campaign.budget) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                        Gestisci
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="space-y-4">
              {materials.map((material) => (
                <div key={material.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900">{material.name}</h3>
                        <span className="text-sm text-gray-500">{getTypeLabel(material.type)}</span>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{material.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Formato</p>
                          <p className="font-medium">{material.format}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Dimensione</p>
                          <p className="font-medium">{material.size}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Creato</p>
                          <p className="font-medium">{formatDate(material.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Aggiornato</p>
                          <p className="font-medium">{formatDate(material.updatedAt)}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(material.status)}`}>
                          {getStatusLabel(material.status)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Share className="w-4 h-4" />
                      </button>
                      <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                        Gestisci
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Totale Contatti</p>
                    <p className="text-2xl font-bold text-gray-900">12,543</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Conversion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">8.5%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">ROI Medio</p>
                    <p className="text-2xl font-bold text-gray-900">245%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Eye className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Impressions</p>
                    <p className="text-2xl font-bold text-gray-900">2.1M</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <FeedbackWidget />
    </DashboardLayout>
  );
}