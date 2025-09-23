# ADR-0066: Pattern Rules per Compliance

## Status

**APPROVED** - Implementato

## Context

Per automatizzare i controlli di compliance urbanistica, è necessario definire regole parametrizzabili che possano essere applicate a diversi comuni. Queste regole devono essere flessibili e configurabili per gestire le diverse normative locali.

## Decision

Implementare un sistema di Pattern Rules che:

1. **Definisce regole standard** per distacchi, altezze, parcheggi, etc.
2. **Parametrizza i valori** per comune specifico
3. **Esegue controlli automatici** sui progetti
4. **Genera report dettagliati** con violazioni e conformità

## Consequences

### Positive

- **Automazione**: Controlli automatici senza intervento manuale
- **Consistenza**: Applicazione uniforme delle regole
- **Flessibilità**: Adattamento a normative locali diverse
- **Tracciabilità**: Audit trail completo dei controlli

### Negative

- **Configurazione**: Richiede setup iniziale per ogni comune
- **Manutenzione**: Aggiornamenti quando cambiano le normative
- **Complessità**: Gestione di eccezioni e casi particolari
- **Validazione**: Necessità di verificare l'accuratezza delle regole

## Implementation Details

### Rule Categories

- **Distacchi**: Distanze minime da confini, strade, edifici
- **Altezze**: Altezze massime consentite
- **Parcheggi**: Numero e dimensioni posti auto
- **Superfici**: Coefficienti di copertura e inedificabilità
- **Volumi**: Coefficienti di volume edificabile

### Rule Structure

```typescript
interface PatternRule {
  id: string;
  category: RuleCategory;
  name: string;
  description: string;
  parameters: RuleParameter[];
  validation: RuleValidation;
  municipality: string;
  version: string;
  effectiveDate: Date;
}
```

### Parameterization

- **Valori numerici**: Distanze, altezze, coefficienti
- **Condizioni**: Se/Allora per logica complessa
- **Eccezioni**: Casi particolari e deroghe
- **Aggiornamenti**: Versioning delle regole

## Alternatives Considered

- **Hardcoding**: Troppo rigido e difficile da mantenere
- **Database di regole**: Complessità eccessiva per questo livello
- **Machine Learning**: Non sufficientemente interpretabile per compliance

## References

- [Urban Planning Standards](https://en.wikipedia.org/wiki/Urban_planning)
- [Building Codes](https://en.wikipedia.org/wiki/Building_code)
- [Zoning Regulations](https://en.wikipedia.org/wiki/Zoning)
