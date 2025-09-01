// Document Request Message Templates for Doc Hunter v1

import type { DocKind } from '@urbanova/types';

export interface MessageTemplate {
  id: string;
  kind: DocKind;
  subject: string;
  body: string;
  requiredFields: string[];
  instructions: string[];
}

export const messageTemplates: Record<DocKind, MessageTemplate> = {
  CDU: {
    id: 'template-cdu',
    kind: 'CDU',
    subject: 'Richiesta Certificato di Destinazione Urbanistica',
    body: `Gentile Fornitore,

Siamo in fase di pianificazione per il progetto {projectName} e abbiamo bisogno del Certificato di Destinazione Urbanistica (CDU) per la particella {particella}.

**Campi richiesti:**
• Particella catastale
• Destinazione d'uso
• Vincoli urbanistici
• Superficie
• Indice urbanistico
• Altezza massima consentita

**Istruzioni:**
• Il documento deve essere in formato PDF
• Deve essere firmato digitalmente o timbrato
• Deve essere valido e non scaduto
• Includere eventuali specifiche aggiuntive

Utilizzi il link sicuro qui sotto per caricare il documento:
{uploadUrl}

Il link scade il {expiryDate}.

Grazie per la collaborazione.

Cordiali saluti,
{companyName}`,
    requiredFields: [
      'particella',
      'destinazioneUso',
      'vincoli',
      'superficie',
      'indiceUrbanistico',
      'altezzaMax',
    ],
    instructions: [
      'Documento in formato PDF',
      'Firmato digitalmente o timbrato',
      'Valido e non scaduto',
      'Includere specifiche aggiuntive',
    ],
  },

  VISURA: {
    id: 'template-visura',
    kind: 'VISURA',
    subject: 'Richiesta Visura Camerale',
    body: `Gentile Fornitore,

Per il progetto {projectName}, abbiamo bisogno della Visura Camerale della sua azienda.

**Campi richiesti:**
• Numero CCIAA
• Oggetto sociale
• Sede legale
• Partita IVA
• Codice fiscale
• Data iscrizione
• Stato azienda

**Istruzioni:**
• La visura deve essere recente (ultimi 30 giorni)
• Deve essere in formato PDF
• Deve essere rilasciata dalla Camera di Commercio
• Verificare che l'oggetto sociale sia pertinente

Utilizzi il link sicuro qui sotto per caricare il documento:
{uploadUrl}

Il link scade il {expiryDate}.

Grazie per la collaborazione.

Cordiali saluti,
{companyName}`,
    requiredFields: [
      'cciaa',
      'oggettoSociale',
      'sedeLegale',
      'partitaIva',
      'codiceFiscale',
      'dataIscrizione',
      'stato',
    ],
    instructions: [
      'Visura recente (ultimi 30 giorni)',
      'Formato PDF',
      'Rilasciata dalla Camera di Commercio',
      'Oggetto sociale pertinente',
    ],
  },

  DURC: {
    id: 'template-durc',
    kind: 'DURC',
    subject: 'Richiesta DURC (Documento Unico di Regolarità Contributiva)',
    body: `Gentile Fornitore,

Per il progetto {projectName}, abbiamo bisogno del DURC (Documento Unico di Regolarità Contributiva).

**Campi richiesti:**
• Nome ditta
• Data di validità
• Numero documento
• Ente rilasciante
• Data rilascio
• Categoria lavori
• Classe di rischio

**Istruzioni:**
• Il DURC deve essere valido
• Deve coprire la categoria di lavori del progetto
• Deve essere in formato PDF
• Verificare la data di scadenza

Utilizzi il link sicuro qui sotto per caricare il documento:
{uploadUrl}

Il link scade il {expiryDate}.

Grazie per la collaborazione.

Cordiali saluti,
{companyName}`,
    requiredFields: [
      'ditta',
      'validita',
      'numero',
      'rilasciatoDa',
      'dataRilascio',
      'categoria',
      'classe',
    ],
    instructions: [
      'DURC valido',
      'Copre categoria lavori del progetto',
      'Formato PDF',
      'Verificare data scadenza',
    ],
  },

  PLANIMETRIA: {
    id: 'template-planimetria',
    kind: 'PLANIMETRIA',
    subject: 'Richiesta Planimetria Tecnica',
    body: `Gentile Fornitore,

Per il progetto {projectName}, abbiamo bisogno della Planimetria Tecnica dell'immobile.

**Campi richiesti:**
• Scala del disegno
• Data di redazione
• Nome del tecnico redattore
• Superficie
• Destinazione d'uso
• Numero livelli
• Numero vani

**Istruzioni:**
• Planimetria in formato PDF o CAD
• Deve essere firmata dal tecnico
• Scala appropriata per il progetto
• Includere quote e dimensioni

Utilizzi il link sicuro qui sotto per caricare il documento:
{uploadUrl}

Il link scade il {expiryDate}.

Grazie per la collaborazione.

Cordiali saluti,
{companyName}`,
    requiredFields: ['scala', 'data', 'tecnico', 'superficie', 'destinazione', 'livelli', 'vani'],
    instructions: [
      'Formato PDF o CAD',
      'Firmata dal tecnico',
      'Scala appropriata',
      'Includere quote e dimensioni',
    ],
  },

  PROGETTO: {
    id: 'template-progetto',
    kind: 'PROGETTO',
    subject: 'Richiesta Progetto Architettonico',
    body: `Gentile Fornitore,

Per il progetto {projectName}, abbiamo bisogno del Progetto Architettonico completo.

**Campi richiesti:**
• Titolo del progetto
• Nome dell'architetto
• Data di redazione
• Versione del progetto
• Stato di approvazione
• Note aggiuntive

**Istruzioni:**
• Progetto completo in formato PDF
• Deve essere firmato dall'architetto
• Includere tutte le tavole necessarie
• Verificare approvazione comunale

Utilizzi il link sicuro qui sotto per caricare il documento:
{uploadUrl}

Il link scade il {expiryDate}.

Grazie per la collaborazione.

Cordiali saluti,
{companyName}`,
    requiredFields: ['titolo', 'architetto', 'data', 'versione', 'approvato'],
    instructions: [
      'Progetto completo in PDF',
      "Firmato dall'architetto",
      'Tutte le tavole necessarie',
      'Verificare approvazione comunale',
    ],
  },
};

export function getMessageTemplate(kind: DocKind): MessageTemplate {
  return messageTemplates[kind];
}

export function formatMessage(
  template: MessageTemplate,
  variables: Record<string, string>
): string {
  let formattedMessage = template.body;

  // Replace variables in the template
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    formattedMessage = formattedMessage.replace(new RegExp(placeholder, 'g'), value);
  });

  return formattedMessage;
}

export function getRequiredFieldsForKind(kind: DocKind): string[] {
  return messageTemplates[kind].requiredFields;
}

export function getInstructionsForKind(kind: DocKind): string[] {
  return messageTemplates[kind].instructions;
}
