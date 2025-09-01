'use client';

import React, { useState } from 'react';

import {
  StarIcon,
  UsersIcon,
  FilterIcon,
  SortAscIcon,
  SortDescIcon,
  EyeIcon,
  MessageCircleIcon,
  ShareIcon,
  TrashIcon,
  PlusIcon,
} from '@/components/icons';

import { Badge } from './Badge';
import Button from './Button';

interface SharedFavorite {
  id: string;
  landId: string;
  landTitle: string;
  landLocation: string;
  landPrice: number;
  landArea: number;
  addedBy: string;
  addedAt: Date;
  teamVotes: {
    memberId: string;
    memberName: string;
    vote: 'like' | 'dislike' | 'neutral';
    comment?: string;
  }[];
  tags: string[];
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'analyzing' | 'rejected' | 'approved';
}

interface SharedFavoritesProps {
  isOpen: boolean;
  onClose: () => void;
  onViewLand: (landId: string) => void;
  onAddComment: (landId: string, comment: string) => void;
  onVote: (landId: string, vote: 'like' | 'dislike' | 'neutral') => void;
  onUpdatePriority: (landId: string, priority: 'high' | 'medium' | 'low') => void;
  onUpdateStatus: (
    landId: string,
    status: 'active' | 'analyzing' | 'rejected' | 'approved'
  ) => void;
  onRemove: (landId: string) => void;
}

export default function SharedFavorites({
  isOpen,
  onClose,
  onViewLand,
  onAddComment,
  onVote,
  onUpdatePriority,
  onUpdateStatus,
  onRemove,
}: SharedFavoritesProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'area' | 'votes'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data per preferiti condivisi
  const [favorites] = useState<SharedFavorite[]>([
    {
      id: '1',
      landId: 'land-1',
      landTitle: 'Terreno Roma Centro - Zona Espansione',
      landLocation: 'Roma, Centro Storico',
      landPrice: 2500000,
      landArea: 1500,
      addedBy: 'Marco Rossi',
      addedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      teamVotes: [
        { memberId: '1', memberName: 'Marco Rossi', vote: 'like', comment: 'Ottima posizione!' },
        { memberId: '2', memberName: 'Laura Bianchi', vote: 'like', comment: 'ROI interessante' },
        { memberId: '3', memberName: 'Giuseppe Verdi', vote: 'neutral' },
      ],
      tags: ['Centro Storico', 'Alto Potenziale', 'ROI'],
      priority: 'high',
      status: 'analyzing',
    },
    {
      id: '2',
      landId: 'land-2',
      landTitle: 'Area Milano Lambrate - Riconversione',
      landLocation: 'Milano, Lambrate',
      landPrice: 1800000,
      landArea: 2000,
      addedBy: 'Laura Bianchi',
      addedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      teamVotes: [
        { memberId: '1', memberName: 'Marco Rossi', vote: 'like' },
        { memberId: '2', memberName: 'Laura Bianchi', vote: 'like', comment: 'Zona in sviluppo' },
        {
          memberId: '3',
          memberName: 'Giuseppe Verdi',
          vote: 'dislike',
          comment: 'Prezzo troppo alto',
        },
      ],
      tags: ['Riconversione', 'Zona Sviluppo', 'Milano'],
      priority: 'medium',
      status: 'active',
    },
    {
      id: '3',
      landId: 'land-3',
      landTitle: 'Terreno Napoli Vomero - Residenziale',
      landLocation: 'Napoli, Vomero',
      landPrice: 1200000,
      landArea: 800,
      addedBy: 'Giuseppe Verdi',
      addedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      teamVotes: [
        { memberId: '1', memberName: 'Marco Rossi', vote: 'neutral' },
        {
          memberId: '2',
          memberName: 'Laura Bianchi',
          vote: 'like',
          comment: 'Buon rapporto qualità-prezzo',
        },
        { memberId: '3', memberName: 'Giuseppe Verdi', vote: 'like' },
      ],
      tags: ['Residenziale', 'Vomero', 'Buon Prezzo'],
      priority: 'low',
      status: 'active',
    },
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'analyzing':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'approved':
        return 'info';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return '🟢';
      case 'analyzing':
        return '🟡';
      case 'rejected':
        return '🔴';
      case 'approved':
        return '🔵';
      default:
        return '⚪';
    }
  };

  const getVoteIcon = (vote: string) => {
    switch (vote) {
      case 'like':
        return '👍';
      case 'dislike':
        return '👎';
      case 'neutral':
        return '🤔';
      default:
        return '⚪';
    }
  };

  const getVoteColor = (vote: string) => {
    switch (vote) {
      case 'like':
        return 'success';
      case 'dislike':
        return 'error';
      case 'neutral':
        return 'warning';
      default:
        return 'outline';
    }
  };

  const filteredFavorites = favorites.filter(favorite => {
    const matchesTab = activeTab === 'all' || favorite.priority === activeTab;
    const matchesStatus = filterStatus === 'all' || favorite.status === filterStatus;
    const matchesSearch =
      favorite.landTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      favorite.landLocation.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesStatus && matchesSearch;
  });

  const sortedFavorites = [...filteredFavorites].sort((a, b) => {
    let aValue: any, bValue: any;

    switch (sortBy) {
      case 'date':
        aValue = a.addedAt.getTime();
        bValue = b.addedAt.getTime();
        break;
      case 'price':
        aValue = a.landPrice;
        bValue = b.landPrice;
        break;
      case 'area':
        aValue = a.landArea;
        bValue = b.landArea;
        break;
      case 'votes':
        aValue = a.teamVotes.filter(v => v.vote === 'like').length;
        bValue = b.teamVotes.filter(v => v.vote === 'like').length;
        break;
      default:
        aValue = a.addedAt.getTime();
        bValue = b.addedAt.getTime();
    }

    if (sortOrder === 'asc') {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-yellow-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <StarIcon className="h-6 w-6" />
                Preferiti Condivisi del Team
              </h2>
              <p className="text-yellow-100 mt-1">
                Lista collaborativa delle migliori opportunità immobiliari
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-yellow-200 transition-colors"
            >
              <span className="sr-only">Chiudi</span>
              <div className="w-8 h-8 flex items-center justify-center text-2xl">×</div>
            </button>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Tab Navigation */}
            <div className="flex space-x-1">
              {[
                { id: 'all', name: 'Tutti', count: favorites.length },
                {
                  id: 'high',
                  name: 'Alta Priorità',
                  count: favorites.filter(f => f.priority === 'high').length,
                },
                {
                  id: 'medium',
                  name: 'Media Priorità',
                  count: favorites.filter(f => f.priority === 'medium').length,
                },
                {
                  id: 'low',
                  name: 'Bassa Priorità',
                  count: favorites.filter(f => f.priority === 'low').length,
                },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{tab.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {tab.count}
                    </Badge>
                  </span>
                </button>
              ))}
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Cerca per titolo o location..."
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />

              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="all">Tutti gli stati</option>
                <option value="active">Attivo</option>
                <option value="analyzing">In Analisi</option>
                <option value="rejected">Rifiutato</option>
                <option value="approved">Approvato</option>
              </select>

              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                >
                  <option value="date">Data</option>
                  <option value="price">Prezzo</option>
                  <option value="area">Area</option>
                  <option value="votes">Voti</option>
                </select>

                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {sortOrder === 'asc' ? (
                    <SortAscIcon className="h-4 w-4" />
                  ) : (
                    <SortDescIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-6">
            {sortedFavorites.map(favorite => (
              <div
                key={favorite.id}
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{favorite.landTitle}</h3>
                      <Badge variant={getPriorityColor(favorite.priority)}>
                        Priorità {favorite.priority}
                      </Badge>
                      <Badge variant={getStatusColor(favorite.status)}>
                        {getStatusIcon(favorite.status)} {favorite.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium text-gray-900">{favorite.landLocation}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Prezzo</p>
                        <p className="font-medium text-gray-900">
                          {formatCurrency(favorite.landPrice)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Area</p>
                        <p className="font-medium text-gray-900">{favorite.landArea}m²</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Aggiunto da</p>
                        <p className="font-medium text-gray-900">{favorite.addedBy}</p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {favorite.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Team Votes */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <UsersIcon className="h-4 w-4" />
                    Voti del Team ({favorite.teamVotes.length} membri)
                  </h4>

                  <div className="grid gap-3">
                    {favorite.teamVotes.map((vote, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-white p-3 rounded border"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant={getVoteColor(vote.vote)}>{getVoteIcon(vote.vote)}</Badge>
                          <span className="font-medium text-gray-900">{vote.memberName}</span>
                          {vote.comment && (
                            <span className="text-sm text-gray-600">"{vote.comment}"</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary" size="sm" onClick={() => onViewLand(favorite.landId)}>
                    <EyeIcon className="h-4 w-4 mr-1" />
                    Visualizza Terreno
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onVote(favorite.landId, 'like')}
                  >
                    👍 Vota Positivo
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onVote(favorite.landId, 'dislike')}
                  >
                    👎 Vota Negativo
                  </Button>

                  <select
                    value={favorite.priority}
                    onChange={e => onUpdatePriority(favorite.landId, e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="low">Bassa Priorità</option>
                    <option value="medium">Media Priorità</option>
                    <option value="high">Alta Priorità</option>
                  </select>

                  <select
                    value={favorite.status}
                    onChange={e => onUpdateStatus(favorite.landId, e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="active">Attivo</option>
                    <option value="analyzing">In Analisi</option>
                    <option value="rejected">Rifiutato</option>
                    <option value="approved">Approvato</option>
                  </select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRemove(favorite.landId)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Rimuovi
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {sortedFavorites.length === 0 && (
            <div className="text-center py-12">
              <StarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Nessun preferito trovato</h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus !== 'all' || activeTab !== 'all'
                  ? 'Prova a modificare i filtri di ricerca'
                  : 'Inizia ad aggiungere terreni ai preferiti condivisi del team'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
