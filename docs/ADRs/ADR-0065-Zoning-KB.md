# ADR-0065: Zoning Knowledge Base

## Status

**APPROVED** - Implementato

## Context

Il sistema Urbanova necessita di verificare la conformità urbanistica dei progetti immobiliari. Per farlo in modo accurato, è necessario avere accesso ai regolamenti comunali reali e poterli consultare durante i controlli di compliance.

## Decision

Implementare un sistema di Knowledge Base per lo zoning che:

1. **Ingerisce documenti reali** (PDF/HTML) dai comuni
2. **Indicizza i contenuti** in un vector store per ricerca semantica
3. **Mantiene mappature di citazione** per riferimenti precisi
4. **Fornisce fallback** a storage locale se i servizi esterni non sono disponibili

## Consequences

### Positive

- **Accuratezza**: Verifiche basate su documenti ufficiali reali
- **Tracciabilità**: Citazioni precise con riferimenti a documenti e pagine
- **Scalabilità**: Supporto per multiple municipalità
- **Flessibilità**: Fallback a storage locale se necessario

### Negative

- **Complessità**: Gestione di diversi formati di documento
- **Storage**: Richiede spazio per documenti e indici
- **Manutenzione**: Aggiornamenti regolari dei regolamenti
- **Dipendenze**: Rischio di downtime dei servizi esterni

## Implementation Details

### Vector Store Priority

1. **Weaviate** (preferito per performance e features)
2. **Pinecone** (alternativa cloud)
3. **Fallback locale** (array + similarity search)

### Document Processing

- **PDF**: OCR + estrazione testo strutturato
- **HTML**: Parsing diretto + cleaning
- **Metadata**: Comune, data aggiornamento, versione

### Citation Mapping

- **Document ID**: Identificativo univoco documento
- **Page Number**: Numero pagina per PDF
- **Section**: Sezione/articolo del regolamento
- **URL**: Link diretto al documento originale

## Alternatives Considered

- **Database relazionale**: Non adatto per ricerca semantica
- **Elasticsearch**: Overkill per questo use case
- **Soluzioni proprietarie**: Costi elevati e lock-in

## References

- [Weaviate Documentation](https://weaviate.io/developers/weaviate)
- [Pinecone Documentation](https://docs.pinecone.io/)
- [Vector Similarity Search](https://en.wikipedia.org/wiki/Vector_similarity_search)
