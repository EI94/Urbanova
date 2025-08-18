'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from './Badge';
import {
  DocumentMetadata,
  DocumentCategory,
  DocumentTemplate,
  SearchQuery,
  SearchResult,
  DocumentComment,
  KnowledgeBaseStats,
  DocumentType,
  DocumentStatus,
  DocumentFormat,
  AccessLevel,
  ContentLanguage,
  SearchScope,
  SortOrder
} from '@/types/knowledge';
import { knowledgeService } from '@/lib/knowledgeService';
import { TeamRole } from '@/types/team';

interface KnowledgeManagementProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: TeamRole;
  currentUserAvatar: string;
}

export default function KnowledgeManagement({
  isOpen,
  onClose,
  currentUserId,
  currentUserName,
  currentUserRole,
  currentUserAvatar
}: KnowledgeManagementProps) {
  const [activeTab, setActiveTab] = useState<'browse' | 'search' | 'create' | 'templates' | 'stats'>('browse');
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [stats, setStats] = useState<KnowledgeBaseStats | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocumentMetadata | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Stati per la ricerca
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState<SearchScope>('all');
  const [searchFilters, setSearchFilters] = useState({
    types: [] as DocumentType[],
    categories: [] as string[],
    status: [] as DocumentStatus[],
    language: '' as ContentLanguage | ''
  });

  // Stati per la creazione
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);

  // Form states
  const [newDocument, setNewDocument] = useState({
    title: '',
    description: '',
    type: 'article' as DocumentType,
    content: '',
    categoryId: '',
    tags: '',
    accessLevel: 'internal' as AccessLevel,
    language: 'it' as ContentLanguage
  });

  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [templateValues, setTemplateValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = () => {
    setDocuments(knowledgeService.getDocuments());
    setCategories(knowledgeService.getCategories());
    setTemplates(knowledgeService.getTemplates());
    setStats(knowledgeService.generateStats());
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query: SearchQuery = {
      query: searchQuery,
      scope: searchScope,
      filters: {
        types: searchFilters.types.length > 0 ? searchFilters.types : undefined,
        categories: searchFilters.categories.length > 0 ? searchFilters.categories : undefined,
        status: searchFilters.status.length > 0 ? searchFilters.status : undefined,
        language: searchFilters.language || undefined
      },
      sortBy: 'relevance',
      sortDirection: 'desc',
      page: 1,
      pageSize: 20
    };

    const response = knowledgeService.searchDocuments(query);
    setSearchResults(response.results);
  };

  const handleCreateDocument = () => {
    try {
      const document = knowledgeService.createDocument(
        newDocument.title,
        newDocument.description,
        newDocument.type,
        newDocument.content,
        newDocument.categoryId,
        currentUserId,
        currentUserName,
        {
          accessLevel: newDocument.accessLevel,
          language: newDocument.language,
          tags: newDocument.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        }
      );

      setDocuments(prev => [...prev, document]);
      setNewDocument({
        title: '',
        description: '',
        type: 'article',
        content: '',
        categoryId: '',
        tags: '',
        accessLevel: 'internal',
        language: 'it'
      });
      setShowCreateModal(false);

      console.log('Documento creato con successo!');
    } catch (error) {
      console.error('Errore nella creazione del documento:', error);
    }
  };

  const handleCreateFromTemplate = () => {
    if (!selectedTemplate) return;

    try {
      const document = knowledgeService.createDocumentFromTemplate(
        selectedTemplate.id,
        templateValues,
        currentUserId,
        currentUserName
      );

      setDocuments(prev => [...prev, document]);
      setSelectedTemplate(null);
      setTemplateValues({});
      setShowTemplateModal(false);

      console.log('Documento creato da template con successo!');
    } catch (error) {
      console.error('Errore nella creazione da template:', error);
    }
  };

  const handleViewDocument = (document: DocumentMetadata) => {
    setSelectedDocument(document);
    setShowDocumentViewer(true);
    
    // Incrementa il contatore di visualizzazioni
    document.viewCount++;
    document.lastAccessedAt = new Date();
  };

  const getTypeIcon = (type: DocumentType) => {
    const icons = {
      article: '📄',
      tutorial: '📚',
      faq: '❓',
      guide: '📋',
      specification: '📋',
      template: '📝',
      checklist: '✅',
      procedure: '⚙️'
    };
    return icons[type] || '📄';
  };

  const getStatusColor = (status: DocumentStatus) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      review: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-red-100 text-red-800',
      deprecated: 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getAccessLevelColor = (level: AccessLevel) => {
    const colors = {
      public: 'bg-green-100 text-green-800',
      internal: 'bg-blue-100 text-blue-800',
      restricted: 'bg-yellow-100 text-yellow-800',
      confidential: 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Categoria sconosciuta';
  };

  const filteredDocuments = selectedCategory 
    ? documents.filter(doc => doc.categoryId === selectedCategory)
    : documents;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-lg">📚</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Knowledge Management</h2>
              <p className="text-sm text-gray-500">Base di conoscenza e documentazione centralizzata</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="p-6 border-b border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Documenti</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.totalDocuments}</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600">📄</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Categorie</p>
                    <p className="text-2xl font-bold text-green-900">{stats.totalCategories}</p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600">📁</span>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Visualizzazioni</p>
                    <p className="text-2xl font-bold text-purple-900">{stats.totalViews}</p>
                  </div>
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600">👁️</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600 font-medium">Autori</p>
                    <p className="text-2xl font-bold text-yellow-900">{stats.totalAuthors}</p>
                  </div>
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600">👥</span>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 font-medium">Download</p>
                    <p className="text-2xl font-bold text-red-900">{stats.totalDownloads}</p>
                  </div>
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600">📥</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {[
              { id: 'browse', label: 'Esplora', icon: '📁', count: documents.length },
              { id: 'search', label: 'Cerca', icon: '🔍', count: searchResults.length },
              { id: 'create', label: 'Crea', icon: '➕', count: 0 },
              { id: 'templates', label: 'Template', icon: '📝', count: templates.length },
              { id: 'stats', label: 'Statistiche', icon: '📊', count: 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <Badge className="ml-2 bg-blue-100 text-blue-800">
                    {tab.count}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'browse' && (
            <div className="flex h-full">
              {/* Sidebar Categories */}
              <div className="w-1/4 border-r border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Categorie</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedCategory === '' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    📁 Tutte le categorie ({documents.length})
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedCategory === category.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-2">
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                        </span>
                        <span className="text-xs text-gray-500">({category.documentCount})</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Documents List */}
              <div className="flex-1 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedCategory ? getCategoryName(selectedCategory) : 'Tutti i Documenti'}
                  </h3>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    ➕ Nuovo Documento
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDocuments.map((document) => (
                    <div key={document.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                         onClick={() => handleViewDocument(document)}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{getTypeIcon(document.type)}</span>
                          <div>
                            <h4 className="font-medium text-gray-900 line-clamp-1">{document.title}</h4>
                            <p className="text-sm text-gray-500">{getCategoryName(document.categoryId)}</p>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <Badge className={getStatusColor(document.status)}>
                            {document.status}
                          </Badge>
                          <Badge className={getAccessLevelColor(document.accessLevel)}>
                            {document.accessLevel}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{document.description}</p>
                      
                      <div className="space-y-2 text-xs text-gray-500">
                        <div className="flex items-center justify-between">
                          <span>Autore: {document.authorName}</span>
                          <span>{document.language.toUpperCase()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>👁️ {document.viewCount} visualizzazioni</span>
                          <span>v{document.version}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Aggiornato: {formatDate(document.updatedAt)}</span>
                          <span>💬 {document.commentCount}</span>
                        </div>
                      </div>

                      {document.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {document.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} className="bg-gray-100 text-gray-600 text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {document.tags.length > 3 && (
                            <Badge className="bg-gray-100 text-gray-600 text-xs">
                              +{document.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'search' && (
            <div className="p-6">
              <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Cerca documenti, guide, tutorial..."
                      />
                    </div>
                    <button
                      onClick={handleSearch}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      🔍 Cerca
                    </button>
                  </div>

                  <div className="flex items-center space-x-4 text-sm">
                    <select
                      value={searchScope}
                      onChange={(e) => setSearchScope(e.target.value as SearchScope)}
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">Tutti</option>
                      <option value="documents">Documenti</option>
                      <option value="templates">Template</option>
                      <option value="procedures">Procedure</option>
                      <option value="faqs">FAQ</option>
                    </select>

                    <select
                      value={searchFilters.language}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, language: e.target.value as ContentLanguage | '' }))}
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Tutte le lingue</option>
                      <option value="it">Italiano</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  {searchResults.map((result) => (
                    <div key={result.document.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                         onClick={() => handleViewDocument(result.document)}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{getTypeIcon(result.document.type)}</span>
                          <div>
                            <h4 className="font-medium text-gray-900">{result.document.title}</h4>
                            <p className="text-sm text-gray-500">{getCategoryName(result.document.categoryId)} • {result.document.authorName}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-blue-100 text-blue-800">
                            Score: {Math.round(result.score)}
                          </Badge>
                          <Badge className={getStatusColor(result.document.status)}>
                            {result.document.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{result.snippet}</p>
                      
                      {result.highlights.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">Corrispondenze trovate in:</p>
                          <div className="flex flex-wrap gap-2">
                            {result.highlights.map((highlight, index) => (
                              <Badge key={index} className="bg-yellow-100 text-yellow-800 text-xs">
                                {highlight.field}: "{highlight.matchedText}"
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span>👁️ {result.document.viewCount} visualizzazioni</span>
                          <span>💬 {result.document.commentCount} commenti</span>
                          <span>v{result.document.version}</span>
                        </div>
                        <span>Aggiornato: {formatDate(result.document.updatedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {searchResults.length === 0 && searchQuery && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun risultato trovato</h3>
                    <p className="text-gray-500">Prova a modificare i termini di ricerca o i filtri</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'create' && (
            <div className="p-6">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Crea Nuovo Documento</h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Titolo</label>
                      <input
                        type="text"
                        value={newDocument.title}
                        onChange={(e) => setNewDocument(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Titolo del documento"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                      <select
                        value={newDocument.type}
                        onChange={(e) => setNewDocument(prev => ({ ...prev, type: e.target.value as DocumentType }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="article">Articolo</option>
                        <option value="tutorial">Tutorial</option>
                        <option value="faq">FAQ</option>
                        <option value="guide">Guida</option>
                        <option value="specification">Specifica</option>
                        <option value="checklist">Checklist</option>
                        <option value="procedure">Procedura</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
                    <textarea
                      value={newDocument.description}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Descrizione del documento"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                      <select
                        value={newDocument.categoryId}
                        onChange={(e) => setNewDocument(prev => ({ ...prev, categoryId: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Seleziona categoria</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Livello Accesso</label>
                      <select
                        value={newDocument.accessLevel}
                        onChange={(e) => setNewDocument(prev => ({ ...prev, accessLevel: e.target.value as AccessLevel }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="public">Pubblico</option>
                        <option value="internal">Interno</option>
                        <option value="restricted">Ristretto</option>
                        <option value="confidential">Confidenziale</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tag (separati da virgola)</label>
                    <input
                      type="text"
                      value={newDocument.tags}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, tags: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contenuto</label>
                    <textarea
                      value={newDocument.content}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, content: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      rows={12}
                      placeholder="Contenuto del documento (supporta Markdown)"
                    />
                  </div>
                  
                  <div className="flex items-center justify-end space-x-3">
                    <button
                      onClick={() => {
                        setNewDocument({
                          title: '',
                          description: '',
                          type: 'article',
                          content: '',
                          categoryId: '',
                          tags: '',
                          accessLevel: 'internal',
                          language: 'it'
                        });
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      Reset
                    </button>
                    <button
                      onClick={handleCreateDocument}
                      disabled={!newDocument.title || !newDocument.content || !newDocument.categoryId}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                    >
                      Crea Documento
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Template Documenti</h3>
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  📝 Usa Template
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">📝</span>
                        <div>
                          <h4 className="font-medium text-gray-900">{template.name}</h4>
                          <p className="text-sm text-gray-500">{getCategoryName(template.categoryId)}</p>
                        </div>
                      </div>
                      <Badge className={`${getTypeIcon(template.type)} bg-purple-100 text-purple-800`}>
                        {template.type}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                    
                    <div className="space-y-2 text-xs text-gray-500 mb-4">
                      <div className="flex items-center justify-between">
                        <span>Campi: {template.placeholders.length}</span>
                        <span>Utilizzi: {template.usageCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Lingua: {template.language.toUpperCase()}</span>
                        <span>Aggiornato: {formatDate(template.updatedAt)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedTemplate(template);
                        setTemplateValues({});
                        setShowTemplateModal(true);
                      }}
                      className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-4 rounded-md text-sm font-medium transition-colors"
                    >
                      📝 Usa Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'stats' && stats && (
            <div className="p-6">
              <div className="max-w-6xl mx-auto">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Statistiche Knowledge Base</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {/* Documents by Type */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Documenti per Tipo</h4>
                    <div className="space-y-3">
                      {stats.documentsByType.map((item) => (
                        <div key={item.type} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span>{getTypeIcon(item.type)}</span>
                            <span className="text-sm text-gray-700">{item.type}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">{item.count}</span>
                            <span className="text-xs text-gray-500">({item.percentage}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Documents by Status */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Documenti per Stato</h4>
                    <div className="space-y-3">
                      {stats.documentsByStatus.map((item) => (
                        <div key={item.status} className="flex items-center justify-between">
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">{item.count}</span>
                            <span className="text-xs text-gray-500">({item.percentage}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quality Metrics */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Metriche di Qualità</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Freschezza</span>
                        <span className="text-sm font-medium text-gray-900">{stats.qualityMetrics.averageFreshnessScore}/100</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Completezza</span>
                        <span className="text-sm font-medium text-gray-900">{stats.qualityMetrics.averageCompletenessScore}/100</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Accuratezza</span>
                        <span className="text-sm font-medium text-gray-900">{stats.qualityMetrics.averageAccuracyScore}/100</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Utilità</span>
                        <span className="text-sm font-medium text-gray-900">{stats.qualityMetrics.averageUsefulnessScore}/100</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Documents */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                  <h4 className="font-medium text-gray-900 mb-4">Documenti Più Popolari</h4>
                  <div className="space-y-3">
                    {stats.topDocuments.slice(0, 5).map((doc, index) => (
                      <div key={doc.documentId} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                            {index + 1}
                          </div>
                          <span className="text-sm text-gray-900">{doc.title}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>👁️ {doc.views}</span>
                          <span>💬 {doc.engagement}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Authors */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Autori Più Attivi</h4>
                  <div className="space-y-3">
                    {stats.topAuthors.slice(0, 5).map((author, index) => (
                      <div key={author.authorId} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-medium text-green-600">
                            {index + 1}
                          </div>
                          <span className="text-sm text-gray-900">{author.authorName}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>📄 {author.documentCount}</span>
                          <span>👁️ {author.totalViews}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Template Usage */}
        {showTemplateModal && selectedTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Usa Template: {selectedTemplate.name}</h3>
              
              <p className="text-sm text-gray-600 mb-6">{selectedTemplate.description}</p>
              
              <div className="space-y-4">
                {selectedTemplate.placeholders.map((placeholder) => (
                  <div key={placeholder.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {placeholder.label}
                      {placeholder.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    
                    {placeholder.type === 'textarea' ? (
                      <textarea
                        value={templateValues[placeholder.key] || ''}
                        onChange={(e) => setTemplateValues(prev => ({ ...prev, [placeholder.key]: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        rows={4}
                        placeholder={placeholder.defaultValue}
                      />
                    ) : placeholder.type === 'select' ? (
                      <select
                        value={templateValues[placeholder.key] || ''}
                        onChange={(e) => setTemplateValues(prev => ({ ...prev, [placeholder.key]: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Seleziona...</option>
                        {placeholder.options?.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={placeholder.type}
                        value={templateValues[placeholder.key] || ''}
                        onChange={(e) => setTemplateValues(prev => ({ ...prev, [placeholder.key]: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder={placeholder.defaultValue}
                      />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowTemplateModal(false);
                    setSelectedTemplate(null);
                    setTemplateValues({});
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleCreateFromTemplate}
                  disabled={selectedTemplate.placeholders.some(p => p.required && !templateValues[p.key])}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                >
                  Crea da Template
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Document Viewer */}
        {showDocumentViewer && selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getTypeIcon(selectedDocument.type)}</span>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{selectedDocument.title}</h3>
                    <p className="text-sm text-gray-500">{getCategoryName(selectedDocument.categoryId)} • {selectedDocument.authorName}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDocumentViewer(false);
                    setSelectedDocument(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <div className="prose prose-sm max-w-none">
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2"><strong>Descrizione:</strong> {selectedDocument.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>v{selectedDocument.version}</span>
                      <span>👁️ {selectedDocument.viewCount} visualizzazioni</span>
                      <span>💬 {selectedDocument.commentCount} commenti</span>
                      <span>Aggiornato: {formatDate(selectedDocument.updatedAt)}</span>
                    </div>
                  </div>
                  
                  <div className="whitespace-pre-wrap">
                    {selectedDocument.content}
                  </div>
                  
                  {selectedDocument.tags.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">Tag:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedDocument.tags.map((tag) => (
                          <Badge key={tag} className="bg-blue-100 text-blue-800">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
