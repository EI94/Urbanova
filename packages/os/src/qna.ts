// QNA Service - Urbanova OS
import { QnaAnswer, QnaExecutionResult, ProjectSemanticIndex } from '@urbanova/types';

export class QnaService {
  /**
   * Risponde a una domanda sui progetti
   */
  async answer(query: string, projectId?: string): Promise<QnaAnswer> {
    // Per ora, implementazione stub
    // In futuro, questo userà un vector store e RAG

    if (!projectId) {
      return {
        answer: 'Per favore, specifica un progetto per la tua domanda.',
        citations: [],
      };
    }

    // Simula ricerca nei documenti del progetto
    const documents = await this.getProjectDocuments(projectId);

    if (documents.length === 0) {
      return {
        answer: `Nessun documento trovato per il progetto ${projectId}.`,
        citations: [],
      };
    }

    // Selezione semplice basata su TF-IDF-like score
    const relevantDocs = this.selectRelevantDocuments(query, documents, 2);

    // Genera risposta basata sui documenti rilevanti
    const answer = this.generateAnswer(query, relevantDocs);

    // Crea citations gestendo correttamente i tipi opzionali
    const citations = relevantDocs.map(doc => {
      const citation: any = {
        docId: doc.docId,
      };

      if (doc.title) {
        citation.title = doc.title;
      }

      if (doc.url) {
        citation.url = doc.url;
      }

      return citation;
    });

    return {
      answer,
      citations,
    };
  }

  /**
   * Ottiene i documenti di un progetto
   */
  private async getProjectDocuments(projectId: string): Promise<ProjectSemanticIndex['documents']> {
    // TODO: Implementare fetch da Firestore
    // Per ora, restituisci dati mock
    return [
      {
        docId: 'doc1',
        title: 'Documentazione Progetto',
        textSnippet:
          'Questo progetto include una documentazione completa con specifiche tecniche, budget e timeline.',
        url: `https://example.com/projects/${projectId}/docs/doc1`,
        type: 'pdf',
        lastModified: new Date(),
      },
      {
        docId: 'doc2',
        title: 'Analisi di Fattibilità',
        textSnippet:
          "L'analisi di fattibilità mostra che il progetto è economicamente sostenibile con un ROI del 15%.",
        url: `https://example.com/projects/${projectId}/docs/doc2`,
        type: 'pdf',
        lastModified: new Date(),
      },
      {
        docId: 'doc3',
        title: 'Piano di Marketing',
        textSnippet:
          'Il piano di marketing prevede strategie per il lancio del progetto e la gestione delle vendite.',
        url: `https://example.com/projects/${projectId}/docs/doc3`,
        type: 'pdf',
        lastModified: new Date(),
      },
    ];
  }

  /**
   * Seleziona i documenti più rilevanti per la query
   */
  private selectRelevantDocuments(
    query: string,
    documents: ProjectSemanticIndex['documents'],
    maxResults: number
  ): ProjectSemanticIndex['documents'] {
    const queryWords = query
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2);

    // Calcola score per ogni documento
    const scoredDocs = documents.map(doc => {
      let score = 0;
      const docText = (doc.title + ' ' + doc.textSnippet).toLowerCase();

      for (const word of queryWords) {
        const wordCount = (docText.match(new RegExp(word, 'g')) || []).length;
        score += wordCount;
      }

      return { doc, score };
    });

    // Ordina per score e prendi i primi maxResults
    return scoredDocs
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(item => item.doc);
  }

  /**
   * Genera una risposta basata sui documenti rilevanti
   */
  private generateAnswer(query: string, documents: ProjectSemanticIndex['documents']): string {
    const queryLower = query.toLowerCase();

    if (queryLower.includes('documentazione') || queryLower.includes('documenti')) {
      return `Il progetto ha ${documents.length} documenti principali. La documentazione include specifiche tecniche, analisi di fattibilità e piano di marketing. Tutti i documenti sono aggiornati e accessibili.`;
    }

    if (queryLower.includes('fattibilità') || queryLower.includes('fattibilita')) {
      return "L'analisi di fattibilità del progetto è positiva. Il progetto mostra un ROI del 15% ed è economicamente sostenibile. Tutti i parametri economici sono stati verificati e approvati.";
    }

    if (queryLower.includes('budget') || queryLower.includes('costi')) {
      return 'Il budget del progetto è stato definito e approvato. I costi sono stati analizzati in dettaglio e sono sotto controllo. Il progetto è finanziariamente sostenibile.';
    }

    if (queryLower.includes('timeline') || queryLower.includes('scadenze')) {
      return 'Il progetto ha una timeline ben definita con scadenze chiare. Tutte le milestone sono state pianificate e i team sono allineati sui tempi di consegna.';
    }

    // Risposta generica
    return `Basandomi sui documenti disponibili, il progetto sembra ben strutturato e documentato. La documentazione include ${documents.length} documenti principali che coprono tutti gli aspetti del progetto.`;
  }

  /**
   * Aggiorna l'indice semantico di un progetto
   */
  async updateProjectIndex(
    projectId: string,
    documents: ProjectSemanticIndex['documents']
  ): Promise<void> {
    // TODO: Implementare aggiornamento su Firestore
    console.log(
      `[QNA] Aggiornamento indice per progetto ${projectId}: ${documents.length} documenti`
    );
  }
}

// Singleton instance
export const qnaService = new QnaService();
