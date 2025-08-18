// Service per la gestione del Knowledge Management & Documentation
import {
  DocumentMetadata,
  DocumentVersion,
  DocumentCategory,
  DocumentTemplate,
  KnowledgeBase,
  SearchQuery,
  SearchResult,
  SearchResponse,
  DocumentComment,
  DocumentActivity,
  DocumentAnalytics,
  KnowledgeBaseStats,
  DocumentExport,
  DocumentImport,
  KnowledgeBaseBackup,
  DocumentNotification,
  KnowledgeBaseIntegration,
  DocumentType,
  DocumentStatus,
  DocumentFormat,
  AccessLevel,
  ContentLanguage,
  SearchScope,
  SortOrder
} from '@/types/knowledge';
import { TeamRole } from '@/types/team';

export class KnowledgeService {
  private knowledgeBase: KnowledgeBase;
  private documents: Map<string, DocumentMetadata> = new Map();
  private categories: Map<string, DocumentCategory> = new Map();
  private templates: Map<string, DocumentTemplate> = new Map();
  private comments: Map<string, DocumentComment[]> = new Map();
  private activities: Map<string, DocumentActivity[]> = new Map();
  private analytics: Map<string, DocumentAnalytics> = new Map();
  private exports: Map<string, DocumentExport> = new Map();
  private imports: Map<string, DocumentImport> = new Map();
  private backups: Map<string, KnowledgeBaseBackup> = new Map();
  private notifications: Map<string, DocumentNotification[]> = new Map();
  private integrations: Map<string, KnowledgeBaseIntegration> = new Map();

  constructor() {
    this.initializeKnowledgeBase();
    this.initializeDefaultCategories();
    this.initializeDefaultTemplates();
    this.initializeDefaultDocuments();
  }

  // Inizializza la knowledge base
  private initializeKnowledgeBase() {
    this.knowledgeBase = {
      id: 'urbanova-kb-v1',
      name: 'Urbanova Knowledge Base',
      description: 'Base di conoscenza completa per Urbanova e sviluppo immobiliare',
      isPublic: false,
      allowedRoles: ['PROJECT_MANAGER', 'FINANCIAL_ANALYST', 'ARCHITECT', 'DEVELOPER', 'TEAM_MEMBER'],
      defaultLanguage: 'it',
      supportedLanguages: ['it', 'en', 'es'],
      categories: [],
      documents: [],
      templates: [],
      searchSettings: {
        enableFullTextSearch: true,
        enableAutoComplete: true,
        enableSuggestions: true,
        enableFacetedSearch: true
      },
      requiresReview: true,
      autoPublish: false,
      versioningEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system'
    };
  }

  // Inizializza categorie predefinite
  private initializeDefaultCategories() {
    const categories: DocumentCategory[] = [
      {
        id: 'land-analysis',
        name: 'Analisi Terreni',
        description: 'Documenti relativi all\'analisi e valutazione dei terreni',
        slug: 'analisi-terreni',
        childrenIds: ['land-analysis-methods', 'land-analysis-tools'],
        path: ['land-analysis'],
        allowedTypes: ['guide', 'tutorial', 'procedure', 'checklist'],
        defaultAccessLevel: 'internal',
        requiredTags: ['terreni', 'analisi'],
        icon: '🏞️',
        color: '#10B981',
        documentCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'land-analysis-methods',
        name: 'Metodologie di Analisi',
        description: 'Metodologie e procedure per l\'analisi dei terreni',
        slug: 'metodologie-analisi',
        parentId: 'land-analysis',
        childrenIds: [],
        path: ['land-analysis', 'land-analysis-methods'],
        allowedTypes: ['procedure', 'guide', 'checklist'],
        defaultAccessLevel: 'internal',
        requiredTags: ['metodologie', 'procedure'],
        icon: '📊',
        color: '#3B82F6',
        documentCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'land-analysis-tools',
        name: 'Strumenti di Analisi',
        description: 'Guide e tutorial per gli strumenti di analisi',
        slug: 'strumenti-analisi',
        parentId: 'land-analysis',
        childrenIds: [],
        path: ['land-analysis', 'land-analysis-tools'],
        allowedTypes: ['tutorial', 'guide', 'faq'],
        defaultAccessLevel: 'internal',
        requiredTags: ['strumenti', 'tutorial'],
        icon: '🛠️',
        color: '#8B5CF6',
        documentCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'collaboration',
        name: 'Collaborazione',
        description: 'Guide e procedure per la collaborazione in team',
        slug: 'collaborazione',
        childrenIds: ['collaboration-tools', 'collaboration-workflows'],
        path: ['collaboration'],
        allowedTypes: ['guide', 'tutorial', 'procedure'],
        defaultAccessLevel: 'internal',
        requiredTags: ['collaborazione', 'team'],
        icon: '🤝',
        color: '#F59E0B',
        documentCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'collaboration-tools',
        name: 'Strumenti di Collaborazione',
        description: 'Guide per utilizzare gli strumenti di collaborazione',
        slug: 'strumenti-collaborazione',
        parentId: 'collaboration',
        childrenIds: [],
        path: ['collaboration', 'collaboration-tools'],
        allowedTypes: ['tutorial', 'guide', 'faq'],
        defaultAccessLevel: 'internal',
        requiredTags: ['strumenti', 'collaborazione'],
        icon: '⚡',
        color: '#EF4444',
        documentCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'api-documentation',
        name: 'Documentazione API',
        description: 'Documentazione tecnica delle API di Urbanova',
        slug: 'documentazione-api',
        childrenIds: [],
        path: ['api-documentation'],
        allowedTypes: ['specification', 'guide', 'tutorial'],
        defaultAccessLevel: 'restricted',
        requiredTags: ['api', 'documentazione'],
        icon: '⚙️',
        color: '#6B7280',
        documentCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'best-practices',
        name: 'Best Practices',
        description: 'Best practices e linee guida per lo sviluppo',
        slug: 'best-practices',
        childrenIds: [],
        path: ['best-practices'],
        allowedTypes: ['guide', 'checklist', 'article'],
        defaultAccessLevel: 'internal',
        requiredTags: ['best-practices', 'linee-guida'],
        icon: '⭐',
        color: '#10B981',
        documentCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    categories.forEach(category => {
      this.categories.set(category.id, category);
    });

    this.knowledgeBase.categories = categories;
  }

  // Inizializza template predefiniti
  private initializeDefaultTemplates() {
    const templates: DocumentTemplate[] = [
      {
        id: 'land-analysis-report',
        name: 'Report Analisi Terreno',
        description: 'Template per creare report di analisi dei terreni',
        type: 'guide',
        content: `# Analisi Terreno: {{title}}

## Informazioni Generali
- **Localizzazione**: {{location}}
- **Superficie**: {{area}} mq
- **Data Analisi**: {{analysis_date}}
- **Analista**: {{analyst_name}}

## Caratteristiche del Terreno
### Morfologia
{{morphology_description}}

### Esposizione
{{exposure_details}}

### Accessibilità
{{accessibility_notes}}

## Analisi di Mercato
### Prezzo di Mercato
- **Prezzo al mq**: €{{price_per_sqm}}
- **Prezzo Totale**: €{{total_price}}
- **Variazione Mercato**: {{market_variation}}%

### Comparables
{{comparables_analysis}}

## Potenzialità di Sviluppo
### Destinazione Urbanistica
{{urban_planning_notes}}

### Vincoli
{{constraints_list}}

### Opportunità
{{opportunities_list}}

## Conclusioni
{{conclusions}}

## Raccomandazioni
{{recommendations}}

---
*Report generato il {{generation_date}}*`,
        placeholders: [
          { key: 'title', label: 'Titolo del Report', type: 'text', required: true },
          { key: 'location', label: 'Localizzazione', type: 'text', required: true },
          { key: 'area', label: 'Superficie (mq)', type: 'number', required: true },
          { key: 'analysis_date', label: 'Data Analisi', type: 'date', required: true },
          { key: 'analyst_name', label: 'Nome Analista', type: 'text', required: true },
          { key: 'morphology_description', label: 'Descrizione Morfologia', type: 'textarea', required: true },
          { key: 'exposure_details', label: 'Dettagli Esposizione', type: 'textarea', required: true },
          { key: 'accessibility_notes', label: 'Note Accessibilità', type: 'textarea', required: true },
          { key: 'price_per_sqm', label: 'Prezzo al mq (€)', type: 'number', required: true },
          { key: 'total_price', label: 'Prezzo Totale (€)', type: 'number', required: true },
          { key: 'market_variation', label: 'Variazione Mercato (%)', type: 'number', required: false },
          { key: 'comparables_analysis', label: 'Analisi Comparables', type: 'textarea', required: true },
          { key: 'urban_planning_notes', label: 'Note Destinazione Urbanistica', type: 'textarea', required: true },
          { key: 'constraints_list', label: 'Lista Vincoli', type: 'textarea', required: false },
          { key: 'opportunities_list', label: 'Lista Opportunità', type: 'textarea', required: true },
          { key: 'conclusions', label: 'Conclusioni', type: 'textarea', required: true },
          { key: 'recommendations', label: 'Raccomandazioni', type: 'textarea', required: true }
        ],
        categoryId: 'land-analysis',
        accessLevel: 'internal',
        language: 'it',
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      },
      {
        id: 'collaboration-guide',
        name: 'Guida Collaborazione',
        description: 'Template per creare guide sulla collaborazione',
        type: 'guide',
        content: `# Guida: {{title}}

## Panoramica
{{overview}}

## Obiettivi
{{objectives}}

## Strumenti Necessari
{{required_tools}}

## Procedura Passo-Passo
{{step_by_step_procedure}}

## Best Practices
{{best_practices}}

## Troubleshooting
{{troubleshooting_tips}}

## Risorse Aggiuntive
{{additional_resources}}

---
*Guida creata il {{creation_date}} da {{author}}*`,
        placeholders: [
          { key: 'title', label: 'Titolo della Guida', type: 'text', required: true },
          { key: 'overview', label: 'Panoramica', type: 'textarea', required: true },
          { key: 'objectives', label: 'Obiettivi', type: 'textarea', required: true },
          { key: 'required_tools', label: 'Strumenti Necessari', type: 'textarea', required: false },
          { key: 'step_by_step_procedure', label: 'Procedura Passo-Passo', type: 'textarea', required: true },
          { key: 'best_practices', label: 'Best Practices', type: 'textarea', required: true },
          { key: 'troubleshooting_tips', label: 'Suggerimenti Troubleshooting', type: 'textarea', required: false },
          { key: 'additional_resources', label: 'Risorse Aggiuntive', type: 'textarea', required: false },
          { key: 'author', label: 'Autore', type: 'text', required: true }
        ],
        categoryId: 'collaboration',
        accessLevel: 'internal',
        language: 'it',
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      },
      {
        id: 'api-documentation',
        name: 'Documentazione API',
        description: 'Template per documentare API endpoints',
        type: 'specification',
        content: `# API: {{api_name}}

## Endpoint
\`{{method}} {{endpoint_url}}\`

## Descrizione
{{description}}

## Autenticazione
{{authentication_details}}

## Parametri
### Path Parameters
{{path_parameters}}

### Query Parameters
{{query_parameters}}

### Request Body
\`\`\`json
{{request_body_example}}
\`\`\`

## Risposte
### Successo ({{success_code}})
\`\`\`json
{{success_response_example}}
\`\`\`

### Errori
{{error_responses}}

## Esempi di Utilizzo
### cURL
\`\`\`bash
{{curl_example}}
\`\`\`

### JavaScript
\`\`\`javascript
{{javascript_example}}
\`\`\`

## Note
{{additional_notes}}

---
*Documentazione aggiornata il {{last_updated}}*`,
        placeholders: [
          { key: 'api_name', label: 'Nome API', type: 'text', required: true },
          { key: 'method', label: 'Metodo HTTP', type: 'select', required: true, options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
          { key: 'endpoint_url', label: 'URL Endpoint', type: 'text', required: true },
          { key: 'description', label: 'Descrizione', type: 'textarea', required: true },
          { key: 'authentication_details', label: 'Dettagli Autenticazione', type: 'textarea', required: true },
          { key: 'path_parameters', label: 'Parametri Path', type: 'textarea', required: false },
          { key: 'query_parameters', label: 'Parametri Query', type: 'textarea', required: false },
          { key: 'request_body_example', label: 'Esempio Request Body', type: 'textarea', required: false },
          { key: 'success_code', label: 'Codice Successo', type: 'text', required: true, defaultValue: '200' },
          { key: 'success_response_example', label: 'Esempio Risposta Successo', type: 'textarea', required: true },
          { key: 'error_responses', label: 'Risposte di Errore', type: 'textarea', required: true },
          { key: 'curl_example', label: 'Esempio cURL', type: 'textarea', required: true },
          { key: 'javascript_example', label: 'Esempio JavaScript', type: 'textarea', required: true },
          { key: 'additional_notes', label: 'Note Aggiuntive', type: 'textarea', required: false }
        ],
        categoryId: 'api-documentation',
        accessLevel: 'restricted',
        language: 'it',
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      }
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });

    this.knowledgeBase.templates = templates;
  }

  // Inizializza documenti predefiniti
  private initializeDefaultDocuments() {
    const documents: DocumentMetadata[] = [
      {
        id: 'getting-started-urbanova',
        title: 'Guida Introduttiva a Urbanova',
        description: 'Guida completa per iniziare a utilizzare Urbanova',
        type: 'guide',
        status: 'published',
        format: 'markdown',
        content: `# Benvenuto in Urbanova

Urbanova è la piattaforma completa per l'analisi e lo sviluppo immobiliare che ti aiuta a prendere decisioni informate sui terreni.

## Funzionalità Principali

### 🏞️ AI Web Scraping
- Ricerca automatica di terreni da multiple fonti
- Analisi intelligente dei dati immobiliari
- Filtri avanzati per trovare le opportunità migliori

### 📊 Advanced Analytics
- Dashboard personalizzabili
- Report automatici con AI insights
- Metriche di performance e collaborazione

### 🤝 Collaborazione Avanzata
- Sessioni collaborative in tempo reale
- Gestione team e ruoli
- Workflow di approvazione

### 📚 Knowledge Management
- Base di conoscenza centralizzata
- Template personalizzabili
- Documentazione API completa

## Come Iniziare

1. **Configura il tuo profilo**: Accedi alle impostazioni per personalizzare il tuo account
2. **Esplora le funzionalità**: Inizia con una ricerca di terreni nella sezione AI Web Scraping
3. **Collabora con il team**: Invita i tuoi colleghi e inizia a lavorare insieme
4. **Analizza i dati**: Utilizza gli analytics per monitorare le performance

## Risorse Utili

- [Documentazione API](./api-documentation)
- [Best Practices](./best-practices)
- [Guide Collaborazione](./collaboration-guides)
- [Supporto Tecnico](mailto:support@urbanova.com)

Buon lavoro con Urbanova! 🚀`,
        summary: 'Guida introduttiva completa per nuovi utenti di Urbanova',
        keywords: ['urbanova', 'guida', 'introduzione', 'getting-started'],
        tags: ['introduzione', 'guida', 'primi-passi'],
        accessLevel: 'internal',
        allowedRoles: ['PROJECT_MANAGER', 'FINANCIAL_ANALYST', 'ARCHITECT', 'DEVELOPER', 'TEAM_MEMBER'],
        allowedUsers: [],
        language: 'it',
        translations: {},
        categoryId: 'best-practices',
        categoryPath: ['best-practices'],
        childrenIds: [],
        relatedDocuments: ['collaboration-best-practices', 'api-quick-start'],
        version: '1.0.0',
        versionHistory: [],
        isLatestVersion: true,
        authorId: 'system',
        authorName: 'Sistema Urbanova',
        collaborators: [],
        reviewers: [],
        viewCount: 0,
        downloadCount: 0,
        shareCount: 0,
        likeCount: 0,
        commentCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: new Date(),
        lastAccessedAt: new Date(),
        slug: 'guida-introduttiva-urbanova',
        searchableContent: 'benvenuto urbanova piattaforma completa analisi sviluppo immobiliare decisioni informate terreni',
        searchKeywords: ['urbanova', 'guida', 'introduzione', 'immobiliare', 'terreni', 'analytics', 'collaborazione'],
        seoTitle: 'Guida Introduttiva a Urbanova - Come Iniziare',
        seoDescription: 'Scopri come utilizzare Urbanova per l\'analisi immobiliare, la collaborazione in team e la gestione della conoscenza.'
      },
      {
        id: 'collaboration-best-practices',
        title: 'Best Practices per la Collaborazione',
        description: 'Linee guida per una collaborazione efficace in team',
        type: 'guide',
        status: 'published',
        format: 'markdown',
        content: `# Best Practices per la Collaborazione

## Principi Fondamentali

### 🎯 Comunicazione Chiara
- Utilizza titoli descrittivi per documenti e progetti
- Aggiungi sempre un riassunto esecutivo
- Usa tag consistenti per facilitare la ricerca

### ⚡ Tempo Reale vs Asincrono
- **Tempo reale**: Per brainstorming e decisioni urgenti
- **Asincrono**: Per review e feedback dettagliati

### 📝 Documentazione
- Documenta sempre le decisioni importanti
- Mantieni aggiornati i template
- Usa il versioning per tracciare i cambiamenti

## Workflow Consigliati

### 1. Analisi Terreni
1. **Ricerca iniziale**: Utilizza AI Web Scraping
2. **Condivisione**: Aggiungi terreni ai preferiti condivisi
3. **Analisi collaborativa**: Crea sessione collaborativa
4. **Documentazione**: Genera report usando i template

### 2. Review e Approvazioni
1. **Bozza**: Crea documento in stato draft
2. **Review**: Assegna reviewer specifici
3. **Feedback**: Usa commenti inline per feedback dettagliati
4. **Approvazione**: Workflow di approvazione strutturato

### 3. Knowledge Sharing
1. **Creazione**: Usa template appropriati
2. **Categorizzazione**: Assegna categorie corrette
3. **Tagging**: Aggiungi tag rilevanti
4. **Condivisione**: Imposta livelli di accesso appropriati

## Strumenti e Funzionalità

### 🤝 Sessioni Collaborative
- Perfette per analisi in tempo reale
- Supportano fino a 10 partecipanti simultanei
- Includono chat integrata e condivisione schermo

### 💬 Commenti e Feedback
- Usa commenti inline per feedback specifici
- Risolvi i commenti quando implementati
- Usa reazioni per feedback rapido

### 📊 Analytics e Metriche
- Monitora l'engagement del team
- Traccia le performance collaborative
- Identifica aree di miglioramento

## Suggerimenti Pratici

### ✅ Da Fare
- Imposta notifiche appropriate
- Usa template standardizzati
- Mantieni la knowledge base aggiornata
- Celebra i successi del team

### ❌ Da Evitare
- Troppe notifiche che distraggono
- Documenti senza categorizzazione
- Feedback generici e non costruttivi
- Ignorare i workflow stabiliti

---

*Documento aggiornato il ${new Date().toLocaleDateString('it-IT')}*`,
        summary: 'Linee guida complete per ottimizzare la collaborazione in team su Urbanova',
        keywords: ['collaborazione', 'best-practices', 'team', 'workflow'],
        tags: ['best-practices', 'collaborazione', 'team', 'workflow'],
        accessLevel: 'internal',
        allowedRoles: ['PROJECT_MANAGER', 'FINANCIAL_ANALYST', 'ARCHITECT', 'DEVELOPER', 'TEAM_MEMBER'],
        allowedUsers: [],
        language: 'it',
        translations: {},
        categoryId: 'collaboration',
        categoryPath: ['collaboration'],
        childrenIds: [],
        relatedDocuments: ['getting-started-urbanova', 'team-management-guide'],
        version: '2.1.0',
        versionHistory: [],
        isLatestVersion: true,
        authorId: 'system',
        authorName: 'Sistema Urbanova',
        collaborators: [],
        reviewers: [],
        viewCount: 0,
        downloadCount: 0,
        shareCount: 0,
        likeCount: 0,
        commentCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: new Date(),
        lastAccessedAt: new Date(),
        slug: 'collaboration-best-practices',
        searchableContent: 'best practices collaborazione team workflow comunicazione tempo reale asincrono documentazione',
        searchKeywords: ['collaborazione', 'team', 'workflow', 'comunicazione', 'best-practices'],
        seoTitle: 'Best Practices per la Collaborazione in Team - Urbanova',
        seoDescription: 'Scopri le migliori pratiche per collaborare efficacemente con il tuo team su Urbanova.'
      }
    ];

    documents.forEach(document => {
      this.documents.set(document.id, document);
    });

    this.knowledgeBase.documents = documents;
  }

  // Crea un nuovo documento
  createDocument(
    title: string,
    description: string,
    type: DocumentType,
    content: string,
    categoryId: string,
    authorId: string,
    authorName: string,
    options: {
      status?: DocumentStatus;
      accessLevel?: AccessLevel;
      language?: ContentLanguage;
      tags?: string[];
      allowedRoles?: string[];
    } = {}
  ): DocumentMetadata {
    const document: DocumentMetadata = {
      id: `doc-${Date.now()}`,
      title,
      description,
      type,
      status: options.status || 'draft',
      format: 'markdown',
      content,
      summary: this.generateSummary(content),
      keywords: this.extractKeywords(content),
      tags: options.tags || [],
      accessLevel: options.accessLevel || 'internal',
      allowedRoles: options.allowedRoles || ['PROJECT_MANAGER', 'TEAM_MEMBER'],
      allowedUsers: [],
      language: options.language || 'it',
      translations: {},
      categoryId,
      categoryPath: this.getCategoryPath(categoryId),
      childrenIds: [],
      relatedDocuments: [],
      version: '1.0.0',
      versionHistory: [],
      isLatestVersion: true,
      authorId,
      authorName,
      collaborators: [],
      reviewers: [],
      viewCount: 0,
      downloadCount: 0,
      shareCount: 0,
      likeCount: 0,
      commentCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastAccessedAt: new Date(),
      slug: this.generateSlug(title),
      searchableContent: this.generateSearchableContent(title, description, content),
      searchKeywords: this.extractKeywords(title + ' ' + description + ' ' + content)
    };

    this.documents.set(document.id, document);
    this.updateCategoryDocumentCount(categoryId, 1);
    this.logActivity(document.id, 'created', `Documento "${title}" creato`, authorId, authorName);

    return document;
  }

  // Aggiorna un documento
  updateDocument(
    documentId: string,
    updates: Partial<DocumentMetadata>,
    authorId: string,
    authorName: string
  ): DocumentMetadata {
    const document = this.documents.get(documentId);
    if (!document) {
      throw new Error(`Documento ${documentId} non trovato`);
    }

    // Crea una nuova versione se il contenuto è cambiato
    if (updates.content && updates.content !== document.content) {
      const newVersion: DocumentVersion = {
        id: `version-${Date.now()}`,
        documentId,
        version: this.incrementVersion(document.version),
        content: document.content,
        summary: document.summary,
        changeLog: `Aggiornamento del ${new Date().toLocaleDateString('it-IT')}`,
        authorId,
        authorName,
        createdAt: new Date(),
        isActive: false
      };
      
      document.versionHistory.push(newVersion);
      document.version = newVersion.version;
    }

    // Applica gli aggiornamenti
    Object.assign(document, updates, {
      updatedAt: new Date(),
      searchableContent: updates.content ? 
        this.generateSearchableContent(updates.title || document.title, updates.description || document.description, updates.content) :
        document.searchableContent,
      searchKeywords: updates.content ?
        this.extractKeywords((updates.title || document.title) + ' ' + (updates.description || document.description) + ' ' + updates.content) :
        document.searchKeywords
    });

    this.logActivity(documentId, 'updated', `Documento "${document.title}" aggiornato`, authorId, authorName);
    
    return document;
  }

  // Elimina un documento
  deleteDocument(documentId: string, authorId: string, authorName: string): boolean {
    const document = this.documents.get(documentId);
    if (!document) {
      return false;
    }

    this.documents.delete(documentId);
    this.updateCategoryDocumentCount(document.categoryId, -1);
    this.logActivity(documentId, 'archived', `Documento "${document.title}" eliminato`, authorId, authorName);

    return true;
  }

  // Cerca documenti
  searchDocuments(query: SearchQuery): SearchResponse {
    const startTime = Date.now();
    let results: SearchResult[] = [];
    const allDocuments = Array.from(this.documents.values());

    // Filtra documenti in base ai filtri
    let filteredDocuments = allDocuments.filter(doc => {
      if (query.filters.types && !query.filters.types.includes(doc.type)) return false;
      if (query.filters.categories && !query.filters.categories.includes(doc.categoryId)) return false;
      if (query.filters.authors && !query.filters.authors.includes(doc.authorId)) return false;
      if (query.filters.status && !query.filters.status.includes(doc.status)) return false;
      if (query.filters.accessLevel && !query.filters.accessLevel.includes(doc.accessLevel)) return false;
      if (query.filters.language && doc.language !== query.filters.language) return false;
      if (query.filters.dateRange) {
        const docDate = new Date(doc.createdAt);
        if (docDate < query.filters.dateRange.start || docDate > query.filters.dateRange.end) return false;
      }
      return true;
    });

    // Ricerca full-text
    if (query.query.trim()) {
      const searchTerms = query.query.toLowerCase().split(' ').filter(term => term.length > 2);
      
      results = filteredDocuments.map(doc => {
        let score = 0;
        const highlights: Array<{ field: string; text: string; matchedText: string }> = [];
        
        // Cerca nel titolo (peso maggiore)
        searchTerms.forEach(term => {
          if (doc.title.toLowerCase().includes(term)) {
            score += 10;
            highlights.push({
              field: 'title',
              text: doc.title,
              matchedText: term
            });
          }
        });

        // Cerca nella descrizione
        searchTerms.forEach(term => {
          if (doc.description.toLowerCase().includes(term)) {
            score += 5;
            highlights.push({
              field: 'description',
              text: doc.description,
              matchedText: term
            });
          }
        });

        // Cerca nel contenuto
        searchTerms.forEach(term => {
          if (doc.searchableContent.toLowerCase().includes(term)) {
            score += 2;
            highlights.push({
              field: 'content',
              text: doc.searchableContent.substring(0, 200) + '...',
              matchedText: term
            });
          }
        });

        // Cerca nei tag
        searchTerms.forEach(term => {
          doc.tags.forEach(tag => {
            if (tag.toLowerCase().includes(term)) {
              score += 3;
              highlights.push({
                field: 'tags',
                text: tag,
                matchedText: term
              });
            }
          });
        });

        return {
          document: doc,
          score,
          highlights,
          snippet: this.generateSnippet(doc.content, searchTerms)
        };
      }).filter(result => result.score > 0);
    } else {
      results = filteredDocuments.map(doc => ({
        document: doc,
        score: 1,
        highlights: [],
        snippet: doc.summary || doc.description
      }));
    }

    // Ordina i risultati
    results.sort((a, b) => {
      switch (query.sortBy) {
        case 'relevance':
          return query.sortDirection === 'asc' ? a.score - b.score : b.score - a.score;
        case 'date_created':
          return query.sortDirection === 'asc' ? 
            a.document.createdAt.getTime() - b.document.createdAt.getTime() :
            b.document.createdAt.getTime() - a.document.createdAt.getTime();
        case 'date_updated':
          return query.sortDirection === 'asc' ?
            a.document.updatedAt.getTime() - b.document.updatedAt.getTime() :
            b.document.updatedAt.getTime() - a.document.updatedAt.getTime();
        case 'title':
          return query.sortDirection === 'asc' ?
            a.document.title.localeCompare(b.document.title) :
            b.document.title.localeCompare(a.document.title);
        case 'popularity':
          return query.sortDirection === 'asc' ?
            a.document.viewCount - b.document.viewCount :
            b.document.viewCount - a.document.viewCount;
        default:
          return b.score - a.score;
      }
    });

    // Paginazione
    const totalCount = results.length;
    const totalPages = Math.ceil(totalCount / query.pageSize);
    const startIndex = (query.page - 1) * query.pageSize;
    const endIndex = startIndex + query.pageSize;
    const paginatedResults = results.slice(startIndex, endIndex);

    // Genera facets
    const facets = this.generateFacets(filteredDocuments);

    // Genera suggerimenti
    const suggestions = this.generateSuggestions(query.query, allDocuments);

    const executionTime = Date.now() - startTime;

    return {
      query,
      results: paginatedResults,
      totalCount,
      totalPages,
      facets,
      suggestions,
      executionTime
    };
  }

  // Crea un template
  createTemplate(
    name: string,
    description: string,
    type: DocumentType,
    content: string,
    placeholders: Array<{
      key: string;
      label: string;
      type: 'text' | 'textarea' | 'select' | 'date' | 'number';
      required: boolean;
      defaultValue?: string;
      options?: string[];
    }>,
    categoryId: string,
    createdBy: string
  ): DocumentTemplate {
    const template: DocumentTemplate = {
      id: `template-${Date.now()}`,
      name,
      description,
      type,
      content,
      placeholders,
      categoryId,
      accessLevel: 'internal',
      language: 'it',
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy
    };

    this.templates.set(template.id, template);
    return template;
  }

  // Crea documento da template
  createDocumentFromTemplate(
    templateId: string,
    values: Record<string, string>,
    authorId: string,
    authorName: string
  ): DocumentMetadata {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} non trovato`);
    }

    // Sostituisce i placeholder nel contenuto
    let content = template.content;
    template.placeholders.forEach(placeholder => {
      const value = values[placeholder.key] || placeholder.defaultValue || '';
      const regex = new RegExp(`{{${placeholder.key}}}`, 'g');
      content = content.replace(regex, value);
    });

    // Aggiunge valori di sistema
    content = content.replace(/{{generation_date}}/g, new Date().toLocaleDateString('it-IT'));
    content = content.replace(/{{creation_date}}/g, new Date().toLocaleDateString('it-IT'));
    content = content.replace(/{{last_updated}}/g, new Date().toLocaleDateString('it-IT'));

    // Crea il documento
    const document = this.createDocument(
      values.title || template.name,
      values.description || template.description,
      template.type,
      content,
      template.categoryId,
      authorId,
      authorName,
      {
        accessLevel: template.accessLevel,
        language: template.language
      }
    );

    // Incrementa il contatore di utilizzo del template
    template.usageCount++;
    template.updatedAt = new Date();

    return document;
  }

  // Aggiungi commento a documento
  addComment(
    documentId: string,
    content: string,
    authorId: string,
    authorName: string,
    authorAvatar: string,
    parentId?: string,
    position?: {
      line: number;
      column: number;
      selection?: { start: number; end: number };
    }
  ): DocumentComment {
    const comment: DocumentComment = {
      id: `comment-${Date.now()}`,
      documentId,
      parentId,
      content,
      isResolved: false,
      position,
      authorId,
      authorName,
      authorAvatar,
      reactions: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (!this.comments.has(documentId)) {
      this.comments.set(documentId, []);
    }
    this.comments.get(documentId)!.push(comment);

    // Aggiorna il contatore di commenti del documento
    const document = this.documents.get(documentId);
    if (document) {
      document.commentCount++;
      document.updatedAt = new Date();
    }

    this.logActivity(documentId, 'commented', `Nuovo commento aggiunto`, authorId, authorName);

    return comment;
  }

  // Ottieni commenti per documento
  getDocumentComments(documentId: string): DocumentComment[] {
    return this.comments.get(documentId) || [];
  }

  // Genera statistiche knowledge base
  generateStats(): KnowledgeBaseStats {
    const documents = Array.from(this.documents.values());
    const categories = Array.from(this.categories.values());
    const authors = new Set(documents.map(doc => doc.authorId));

    // Statistiche generali
    const totalDocuments = documents.length;
    const totalCategories = categories.length;
    const totalAuthors = authors.size;
    const totalViews = documents.reduce((sum, doc) => sum + doc.viewCount, 0);
    const totalDownloads = documents.reduce((sum, doc) => sum + doc.downloadCount, 0);

    // Breakdown per tipo
    const documentsByType = Object.values(DocumentType).map(type => {
      const count = documents.filter(doc => doc.type === type).length;
      return {
        type,
        count,
        percentage: totalDocuments > 0 ? Math.round((count / totalDocuments) * 100) : 0
      };
    });

    // Breakdown per stato
    const documentsByStatus = Object.values(DocumentStatus).map(status => {
      const count = documents.filter(doc => doc.status === status).length;
      return {
        status,
        count,
        percentage: totalDocuments > 0 ? Math.round((count / totalDocuments) * 100) : 0
      };
    });

    // Breakdown per lingua
    const documentsByLanguage = Object.values(ContentLanguage).map(language => {
      const count = documents.filter(doc => doc.language === language).length;
      return {
        language,
        count,
        percentage: totalDocuments > 0 ? Math.round((count / totalDocuments) * 100) : 0
      };
    });

    // Top documents
    const topDocuments = documents
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 10)
      .map(doc => ({
        documentId: doc.id,
        title: doc.title,
        views: doc.viewCount,
        engagement: doc.likeCount + doc.commentCount + doc.shareCount
      }));

    // Top authors
    const authorStats = Array.from(authors).map(authorId => {
      const authorDocs = documents.filter(doc => doc.authorId === authorId);
      return {
        authorId,
        authorName: authorDocs[0]?.authorName || 'Unknown',
        documentCount: authorDocs.length,
        totalViews: authorDocs.reduce((sum, doc) => sum + doc.viewCount, 0)
      };
    }).sort((a, b) => b.documentCount - a.documentCount).slice(0, 10);

    // Top categories
    const topCategories = categories
      .sort((a, b) => b.documentCount - a.documentCount)
      .slice(0, 10)
      .map(cat => ({
        categoryId: cat.id,
        categoryName: cat.name,
        documentCount: cat.documentCount,
        totalViews: documents
          .filter(doc => doc.categoryId === cat.id)
          .reduce((sum, doc) => sum + doc.viewCount, 0)
      }));

    // Activity trend (ultimi 30 giorni)
    const activityTrend = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const documentsCreated = documents.filter(doc => 
        doc.createdAt >= dayStart && doc.createdAt < dayEnd
      ).length;

      const documentsUpdated = documents.filter(doc => 
        doc.updatedAt >= dayStart && doc.updatedAt < dayEnd && doc.createdAt < dayStart
      ).length;

      return {
        date: dayStart,
        documentsCreated,
        documentsUpdated,
        totalViews: 0, // Simulato
        totalEngagement: 0 // Simulato
      };
    }).reverse();

    // Quality metrics
    const qualityMetrics = {
      averageFreshnessScore: 85,
      averageCompletenessScore: 78,
      averageAccuracyScore: 92,
      averageUsefulnessScore: 88,
      qualityDistribution: {
        excellent: Math.round(totalDocuments * 0.3),
        good: Math.round(totalDocuments * 0.45),
        average: Math.round(totalDocuments * 0.2),
        poor: Math.round(totalDocuments * 0.05)
      }
    };

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      totalDocuments,
      totalCategories,
      totalAuthors,
      totalViews,
      totalDownloads,
      documentsByType,
      documentsByStatus,
      documentsByLanguage,
      topDocuments,
      topAuthors,
      topCategories,
      activityTrend,
      qualityMetrics,
      generatedAt: now,
      periodStart: thirtyDaysAgo,
      periodEnd: now
    };
  }

  // Export documenti
  exportDocuments(
    documentIds: string[],
    format: DocumentFormat,
    options: {
      includeMetadata: boolean;
      includeComments: boolean;
      includeVersionHistory: boolean;
      includeAnalytics: boolean;
      compression?: boolean;
      password?: string;
    }
  ): DocumentExport {
    const exportData: DocumentExport = {
      id: `export-${Date.now()}`,
      documentIds,
      format,
      options,
      status: 'processing',
      progress: 0,
      requestedAt: new Date(),
      startedAt: new Date(),
      requestedBy: 'system'
    };

    this.exports.set(exportData.id, exportData);

    // Simula processo di export
    const progressInterval = setInterval(() => {
      exportData.progress += Math.random() * 20;
      if (exportData.progress >= 100) {
        exportData.progress = 100;
        exportData.status = 'completed';
        exportData.completedAt = new Date();
        exportData.fileSize = Math.floor(Math.random() * 50000) + 10000;
        exportData.downloadUrl = `/exports/${exportData.id}.${format}`;
        exportData.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        clearInterval(progressInterval);
      }
    }, 500);

    return exportData;
  }

  // Metodi di utilità
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[ñ]/g, 'n')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private generateSummary(content: string): string {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    return sentences.slice(0, 2).join('. ').trim() + (sentences.length > 2 ? '...' : '');
  }

  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const wordCount = new Map<string, number>();
    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });

    return Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  private generateSearchableContent(title: string, description: string, content: string): string {
    return [title, description, content]
      .join(' ')
      .replace(/[#*_`]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private getCategoryPath(categoryId: string): string[] {
    const category = this.categories.get(categoryId);
    if (!category) return [];
    
    const path = [...category.path];
    return path;
  }

  private updateCategoryDocumentCount(categoryId: string, delta: number): void {
    const category = this.categories.get(categoryId);
    if (category) {
      category.documentCount += delta;
      category.updatedAt = new Date();
    }
  }

  private incrementVersion(currentVersion: string): string {
    const parts = currentVersion.split('.');
    const patch = parseInt(parts[2] || '0') + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }

  private logActivity(
    documentId: string,
    type: 'created' | 'updated' | 'published' | 'archived' | 'commented' | 'shared' | 'viewed' | 'downloaded',
    description: string,
    userId: string,
    userName: string
  ): void {
    const activity: DocumentActivity = {
      id: `activity-${Date.now()}`,
      documentId,
      type,
      description,
      metadata: {},
      userId,
      userName,
      userAvatar: '👤',
      timestamp: new Date()
    };

    if (!this.activities.has(documentId)) {
      this.activities.set(documentId, []);
    }
    this.activities.get(documentId)!.push(activity);
  }

  private generateSnippet(content: string, searchTerms: string[]): string {
    let snippet = content.substring(0, 300);
    
    // Cerca il primo termine di ricerca nel contenuto
    for (const term of searchTerms) {
      const index = content.toLowerCase().indexOf(term.toLowerCase());
      if (index !== -1) {
        const start = Math.max(0, index - 100);
        const end = Math.min(content.length, index + 200);
        snippet = content.substring(start, end);
        if (start > 0) snippet = '...' + snippet;
        if (end < content.length) snippet = snippet + '...';
        break;
      }
    }
    
    return snippet;
  }

  private generateFacets(documents: DocumentMetadata[]) {
    const types = new Map<DocumentType, number>();
    const categories = new Map<string, number>();
    const authors = new Map<string, number>();
    const tags = new Map<string, number>();
    const languages = new Map<ContentLanguage, number>();

    documents.forEach(doc => {
      types.set(doc.type, (types.get(doc.type) || 0) + 1);
      categories.set(doc.categoryId, (categories.get(doc.categoryId) || 0) + 1);
      authors.set(doc.authorName, (authors.get(doc.authorName) || 0) + 1);
      languages.set(doc.language, (languages.get(doc.language) || 0) + 1);
      
      doc.tags.forEach(tag => {
        tags.set(tag, (tags.get(tag) || 0) + 1);
      });
    });

    return {
      types: Array.from(types.entries()).map(([value, count]) => ({ value, count })),
      categories: Array.from(categories.entries()).map(([value, count]) => ({ value, count })),
      authors: Array.from(authors.entries()).map(([value, count]) => ({ value, count })),
      tags: Array.from(tags.entries()).map(([value, count]) => ({ value, count })).slice(0, 20),
      languages: Array.from(languages.entries()).map(([value, count]) => ({ value, count }))
    };
  }

  private generateSuggestions(query: string, documents: DocumentMetadata[]): string[] {
    if (!query || query.length < 3) return [];

    const suggestions = new Set<string>();
    const queryLower = query.toLowerCase();

    documents.forEach(doc => {
      // Suggerimenti dai titoli
      if (doc.title.toLowerCase().includes(queryLower)) {
        suggestions.add(doc.title);
      }

      // Suggerimenti dai tag
      doc.tags.forEach(tag => {
        if (tag.toLowerCase().includes(queryLower)) {
          suggestions.add(tag);
        }
      });

      // Suggerimenti dalle keywords
      doc.keywords.forEach(keyword => {
        if (keyword.toLowerCase().includes(queryLower)) {
          suggestions.add(keyword);
        }
      });
    });

    return Array.from(suggestions).slice(0, 5);
  }

  // Getter pubblici
  getDocuments(): DocumentMetadata[] {
    return Array.from(this.documents.values());
  }

  getDocument(id: string): DocumentMetadata | undefined {
    return this.documents.get(id);
  }

  getCategories(): DocumentCategory[] {
    return Array.from(this.categories.values());
  }

  getTemplates(): DocumentTemplate[] {
    return Array.from(this.templates.values());
  }

  getKnowledgeBase(): KnowledgeBase {
    return this.knowledgeBase;
  }

  getDocumentActivities(documentId: string): DocumentActivity[] {
    return this.activities.get(documentId) || [];
  }

  getExports(): DocumentExport[] {
    return Array.from(this.exports.values());
  }
}

// Istanza singleton del service
export const knowledgeService = new KnowledgeService();
