import { z } from 'zod';
export type DocKind = 'CDU' | 'VISURA' | 'DURC' | 'PLANIMETRIA' | 'PROGETTO';
export type DocumentStatus = 'REQUESTED' | 'UPLOADED' | 'EXTRACTED' | 'VALIDATED' | 'EXPIRED';
export interface DocumentMeta {
  kind: DocKind;
  projectId: string;
  vendorId?: string;
  required: boolean;
  expiresAt?: Date;
  requestedAt: Date;
  requestedBy: string;
}
export interface CDUExtractedFields {
  particella: string;
  destinazioneUso: string;
  vincoli: string[];
  superficie: number;
  indiceUrbanistico: number;
  altezzaMax: number;
  destinazioneSpecifica?: string;
}
export interface VisuraExtractedFields {
  cciaa: string;
  oggettoSociale: string;
  sedeLegale: string;
  partitaIva: string;
  codiceFiscale: string;
  dataIscrizione: Date;
  stato: 'ATTIVA' | 'SOSPESA' | 'CANCELLATA';
}
export interface DURCExtractedFields {
  ditta: string;
  validita: Date;
  numero: string;
  rilasciatoDa: string;
  dataRilascio: Date;
  categoria: string;
  classe: string;
}
export interface PlanimetriaExtractedFields {
  scala: string;
  data: Date;
  tecnico: string;
  superficie: number;
  destinazione: string;
  livelli: number;
  vani: number;
}
export interface ProgettoExtractedFields {
  titolo: string;
  architetto: string;
  data: Date;
  versione: string;
  approvato: boolean;
  note?: string;
}
export type ExtractedFields =
  | CDUExtractedFields
  | VisuraExtractedFields
  | DURCExtractedFields
  | PlanimetriaExtractedFields
  | ProgettoExtractedFields;
export interface DocumentEntity {
  id: string;
  meta: DocumentMeta;
  status: DocumentStatus;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  uploadedAt?: Date;
  uploadedBy?: string;
  extracted?: ExtractedFields;
  issues?: string[];
  validatedAt?: Date;
  validatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface DocRequest {
  projectId: string;
  kind: DocKind;
  to: 'vendor' | 'internal';
  messageTemplateId: string;
  uploadUrl: string;
  expiresAt: Date;
  requestedBy: string;
}
export interface ChecklistItem {
  kind: DocKind;
  status: DocumentStatus;
  documentId?: string;
  missingFields?: string[];
  issues?: string[];
  lastUpdate: Date;
}
export interface Checklist {
  projectId: string;
  items: ChecklistItem[];
  overallStatus: 'INCOMPLETE' | 'COMPLETE' | 'VALIDATION_REQUIRED';
  completionPercentage: number;
  lastUpdated: Date;
  updatedBy: string;
}
export declare const zDocKind: z.ZodEnum<['CDU', 'VISURA', 'DURC', 'PLANIMETRIA', 'PROGETTO']>;
export declare const zDocumentStatus: z.ZodEnum<
  ['REQUESTED', 'UPLOADED', 'EXTRACTED', 'VALIDATED', 'EXPIRED']
>;
export declare const zCDUExtractedFields: z.ZodObject<
  {
    particella: z.ZodString;
    destinazioneUso: z.ZodString;
    vincoli: z.ZodArray<z.ZodString, 'many'>;
    superficie: z.ZodNumber;
    indiceUrbanistico: z.ZodNumber;
    altezzaMax: z.ZodNumber;
    destinazioneSpecifica: z.ZodOptional<z.ZodString>;
  },
  'strip',
  z.ZodTypeAny,
  {
    particella: string;
    destinazioneUso: string;
    vincoli: string[];
    superficie: number;
    indiceUrbanistico: number;
    altezzaMax: number;
    destinazioneSpecifica?: string | undefined;
  },
  {
    particella: string;
    destinazioneUso: string;
    vincoli: string[];
    superficie: number;
    indiceUrbanistico: number;
    altezzaMax: number;
    destinazioneSpecifica?: string | undefined;
  }
>;
export declare const zVisuraExtractedFields: z.ZodObject<
  {
    cciaa: z.ZodString;
    oggettoSociale: z.ZodString;
    sedeLegale: z.ZodString;
    partitaIva: z.ZodString;
    codiceFiscale: z.ZodString;
    dataIscrizione: z.ZodDate;
    stato: z.ZodEnum<['ATTIVA', 'SOSPESA', 'CANCELLATA']>;
  },
  'strip',
  z.ZodTypeAny,
  {
    cciaa: string;
    oggettoSociale: string;
    sedeLegale: string;
    partitaIva: string;
    codiceFiscale: string;
    dataIscrizione: Date;
    stato: 'ATTIVA' | 'SOSPESA' | 'CANCELLATA';
  },
  {
    cciaa: string;
    oggettoSociale: string;
    sedeLegale: string;
    partitaIva: string;
    codiceFiscale: string;
    dataIscrizione: Date;
    stato: 'ATTIVA' | 'SOSPESA' | 'CANCELLATA';
  }
>;
export declare const zDURCExtractedFields: z.ZodObject<
  {
    ditta: z.ZodString;
    validita: z.ZodDate;
    numero: z.ZodString;
    rilasciatoDa: z.ZodString;
    dataRilascio: z.ZodDate;
    categoria: z.ZodString;
    classe: z.ZodString;
  },
  'strip',
  z.ZodTypeAny,
  {
    ditta: string;
    validita: Date;
    numero: string;
    rilasciatoDa: string;
    dataRilascio: Date;
    categoria: string;
    classe: string;
  },
  {
    ditta: string;
    validita: Date;
    numero: string;
    rilasciatoDa: string;
    dataRilascio: Date;
    categoria: string;
    classe: string;
  }
>;
export declare const zPlanimetriaExtractedFields: z.ZodObject<
  {
    scala: z.ZodString;
    data: z.ZodDate;
    tecnico: z.ZodString;
    superficie: z.ZodNumber;
    destinazione: z.ZodString;
    livelli: z.ZodNumber;
    vani: z.ZodNumber;
  },
  'strip',
  z.ZodTypeAny,
  {
    data: Date;
    superficie: number;
    scala: string;
    tecnico: string;
    destinazione: string;
    livelli: number;
    vani: number;
  },
  {
    data: Date;
    superficie: number;
    scala: string;
    tecnico: string;
    destinazione: string;
    livelli: number;
    vani: number;
  }
>;
export declare const zProgettoExtractedFields: z.ZodObject<
  {
    titolo: z.ZodString;
    architetto: z.ZodString;
    data: z.ZodDate;
    versione: z.ZodString;
    approvato: z.ZodBoolean;
    note: z.ZodOptional<z.ZodString>;
  },
  'strip',
  z.ZodTypeAny,
  {
    data: Date;
    titolo: string;
    architetto: string;
    versione: string;
    approvato: boolean;
    note?: string | undefined;
  },
  {
    data: Date;
    titolo: string;
    architetto: string;
    versione: string;
    approvato: boolean;
    note?: string | undefined;
  }
>;
export declare const zExtractedFields: z.ZodUnion<
  [
    z.ZodObject<
      {
        particella: z.ZodString;
        destinazioneUso: z.ZodString;
        vincoli: z.ZodArray<z.ZodString, 'many'>;
        superficie: z.ZodNumber;
        indiceUrbanistico: z.ZodNumber;
        altezzaMax: z.ZodNumber;
        destinazioneSpecifica: z.ZodOptional<z.ZodString>;
      },
      'strip',
      z.ZodTypeAny,
      {
        particella: string;
        destinazioneUso: string;
        vincoli: string[];
        superficie: number;
        indiceUrbanistico: number;
        altezzaMax: number;
        destinazioneSpecifica?: string | undefined;
      },
      {
        particella: string;
        destinazioneUso: string;
        vincoli: string[];
        superficie: number;
        indiceUrbanistico: number;
        altezzaMax: number;
        destinazioneSpecifica?: string | undefined;
      }
    >,
    z.ZodObject<
      {
        cciaa: z.ZodString;
        oggettoSociale: z.ZodString;
        sedeLegale: z.ZodString;
        partitaIva: z.ZodString;
        codiceFiscale: z.ZodString;
        dataIscrizione: z.ZodDate;
        stato: z.ZodEnum<['ATTIVA', 'SOSPESA', 'CANCELLATA']>;
      },
      'strip',
      z.ZodTypeAny,
      {
        cciaa: string;
        oggettoSociale: string;
        sedeLegale: string;
        partitaIva: string;
        codiceFiscale: string;
        dataIscrizione: Date;
        stato: 'ATTIVA' | 'SOSPESA' | 'CANCELLATA';
      },
      {
        cciaa: string;
        oggettoSociale: string;
        sedeLegale: string;
        partitaIva: string;
        codiceFiscale: string;
        dataIscrizione: Date;
        stato: 'ATTIVA' | 'SOSPESA' | 'CANCELLATA';
      }
    >,
    z.ZodObject<
      {
        ditta: z.ZodString;
        validita: z.ZodDate;
        numero: z.ZodString;
        rilasciatoDa: z.ZodString;
        dataRilascio: z.ZodDate;
        categoria: z.ZodString;
        classe: z.ZodString;
      },
      'strip',
      z.ZodTypeAny,
      {
        ditta: string;
        validita: Date;
        numero: string;
        rilasciatoDa: string;
        dataRilascio: Date;
        categoria: string;
        classe: string;
      },
      {
        ditta: string;
        validita: Date;
        numero: string;
        rilasciatoDa: string;
        dataRilascio: Date;
        categoria: string;
        classe: string;
      }
    >,
    z.ZodObject<
      {
        scala: z.ZodString;
        data: z.ZodDate;
        tecnico: z.ZodString;
        superficie: z.ZodNumber;
        destinazione: z.ZodString;
        livelli: z.ZodNumber;
        vani: z.ZodNumber;
      },
      'strip',
      z.ZodTypeAny,
      {
        data: Date;
        superficie: number;
        scala: string;
        tecnico: string;
        destinazione: string;
        livelli: number;
        vani: number;
      },
      {
        data: Date;
        superficie: number;
        scala: string;
        tecnico: string;
        destinazione: string;
        livelli: number;
        vani: number;
      }
    >,
    z.ZodObject<
      {
        titolo: z.ZodString;
        architetto: z.ZodString;
        data: z.ZodDate;
        versione: z.ZodString;
        approvato: z.ZodBoolean;
        note: z.ZodOptional<z.ZodString>;
      },
      'strip',
      z.ZodTypeAny,
      {
        data: Date;
        titolo: string;
        architetto: string;
        versione: string;
        approvato: boolean;
        note?: string | undefined;
      },
      {
        data: Date;
        titolo: string;
        architetto: string;
        versione: string;
        approvato: boolean;
        note?: string | undefined;
      }
    >,
  ]
>;
export declare const zDocumentMeta: z.ZodObject<
  {
    kind: z.ZodEnum<['CDU', 'VISURA', 'DURC', 'PLANIMETRIA', 'PROGETTO']>;
    projectId: z.ZodString;
    vendorId: z.ZodOptional<z.ZodString>;
    required: z.ZodBoolean;
    expiresAt: z.ZodOptional<z.ZodDate>;
    requestedAt: z.ZodDate;
    requestedBy: z.ZodString;
  },
  'strip',
  z.ZodTypeAny,
  {
    projectId: string;
    required: boolean;
    kind: 'DURC' | 'CDU' | 'VISURA' | 'PLANIMETRIA' | 'PROGETTO';
    requestedAt: Date;
    requestedBy: string;
    vendorId?: string | undefined;
    expiresAt?: Date | undefined;
  },
  {
    projectId: string;
    required: boolean;
    kind: 'DURC' | 'CDU' | 'VISURA' | 'PLANIMETRIA' | 'PROGETTO';
    requestedAt: Date;
    requestedBy: string;
    vendorId?: string | undefined;
    expiresAt?: Date | undefined;
  }
>;
export declare const zDocumentEntity: z.ZodObject<
  {
    id: z.ZodString;
    meta: z.ZodObject<
      {
        kind: z.ZodEnum<['CDU', 'VISURA', 'DURC', 'PLANIMETRIA', 'PROGETTO']>;
        projectId: z.ZodString;
        vendorId: z.ZodOptional<z.ZodString>;
        required: z.ZodBoolean;
        expiresAt: z.ZodOptional<z.ZodDate>;
        requestedAt: z.ZodDate;
        requestedBy: z.ZodString;
      },
      'strip',
      z.ZodTypeAny,
      {
        projectId: string;
        required: boolean;
        kind: 'DURC' | 'CDU' | 'VISURA' | 'PLANIMETRIA' | 'PROGETTO';
        requestedAt: Date;
        requestedBy: string;
        vendorId?: string | undefined;
        expiresAt?: Date | undefined;
      },
      {
        projectId: string;
        required: boolean;
        kind: 'DURC' | 'CDU' | 'VISURA' | 'PLANIMETRIA' | 'PROGETTO';
        requestedAt: Date;
        requestedBy: string;
        vendorId?: string | undefined;
        expiresAt?: Date | undefined;
      }
    >;
    status: z.ZodEnum<['REQUESTED', 'UPLOADED', 'EXTRACTED', 'VALIDATED', 'EXPIRED']>;
    fileUrl: z.ZodOptional<z.ZodString>;
    fileName: z.ZodOptional<z.ZodString>;
    fileSize: z.ZodOptional<z.ZodNumber>;
    uploadedAt: z.ZodOptional<z.ZodDate>;
    uploadedBy: z.ZodOptional<z.ZodString>;
    extracted: z.ZodOptional<
      z.ZodUnion<
        [
          z.ZodObject<
            {
              particella: z.ZodString;
              destinazioneUso: z.ZodString;
              vincoli: z.ZodArray<z.ZodString, 'many'>;
              superficie: z.ZodNumber;
              indiceUrbanistico: z.ZodNumber;
              altezzaMax: z.ZodNumber;
              destinazioneSpecifica: z.ZodOptional<z.ZodString>;
            },
            'strip',
            z.ZodTypeAny,
            {
              particella: string;
              destinazioneUso: string;
              vincoli: string[];
              superficie: number;
              indiceUrbanistico: number;
              altezzaMax: number;
              destinazioneSpecifica?: string | undefined;
            },
            {
              particella: string;
              destinazioneUso: string;
              vincoli: string[];
              superficie: number;
              indiceUrbanistico: number;
              altezzaMax: number;
              destinazioneSpecifica?: string | undefined;
            }
          >,
          z.ZodObject<
            {
              cciaa: z.ZodString;
              oggettoSociale: z.ZodString;
              sedeLegale: z.ZodString;
              partitaIva: z.ZodString;
              codiceFiscale: z.ZodString;
              dataIscrizione: z.ZodDate;
              stato: z.ZodEnum<['ATTIVA', 'SOSPESA', 'CANCELLATA']>;
            },
            'strip',
            z.ZodTypeAny,
            {
              cciaa: string;
              oggettoSociale: string;
              sedeLegale: string;
              partitaIva: string;
              codiceFiscale: string;
              dataIscrizione: Date;
              stato: 'ATTIVA' | 'SOSPESA' | 'CANCELLATA';
            },
            {
              cciaa: string;
              oggettoSociale: string;
              sedeLegale: string;
              partitaIva: string;
              codiceFiscale: string;
              dataIscrizione: Date;
              stato: 'ATTIVA' | 'SOSPESA' | 'CANCELLATA';
            }
          >,
          z.ZodObject<
            {
              ditta: z.ZodString;
              validita: z.ZodDate;
              numero: z.ZodString;
              rilasciatoDa: z.ZodString;
              dataRilascio: z.ZodDate;
              categoria: z.ZodString;
              classe: z.ZodString;
            },
            'strip',
            z.ZodTypeAny,
            {
              ditta: string;
              validita: Date;
              numero: string;
              rilasciatoDa: string;
              dataRilascio: Date;
              categoria: string;
              classe: string;
            },
            {
              ditta: string;
              validita: Date;
              numero: string;
              rilasciatoDa: string;
              dataRilascio: Date;
              categoria: string;
              classe: string;
            }
          >,
          z.ZodObject<
            {
              scala: z.ZodString;
              data: z.ZodDate;
              tecnico: z.ZodString;
              superficie: z.ZodNumber;
              destinazione: z.ZodString;
              livelli: z.ZodNumber;
              vani: z.ZodNumber;
            },
            'strip',
            z.ZodTypeAny,
            {
              data: Date;
              superficie: number;
              scala: string;
              tecnico: string;
              destinazione: string;
              livelli: number;
              vani: number;
            },
            {
              data: Date;
              superficie: number;
              scala: string;
              tecnico: string;
              destinazione: string;
              livelli: number;
              vani: number;
            }
          >,
          z.ZodObject<
            {
              titolo: z.ZodString;
              architetto: z.ZodString;
              data: z.ZodDate;
              versione: z.ZodString;
              approvato: z.ZodBoolean;
              note: z.ZodOptional<z.ZodString>;
            },
            'strip',
            z.ZodTypeAny,
            {
              data: Date;
              titolo: string;
              architetto: string;
              versione: string;
              approvato: boolean;
              note?: string | undefined;
            },
            {
              data: Date;
              titolo: string;
              architetto: string;
              versione: string;
              approvato: boolean;
              note?: string | undefined;
            }
          >,
        ]
      >
    >;
    issues: z.ZodOptional<z.ZodArray<z.ZodString, 'many'>>;
    validatedAt: z.ZodOptional<z.ZodDate>;
    validatedBy: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
  },
  'strip',
  z.ZodTypeAny,
  {
    id: string;
    status: 'EXPIRED' | 'REQUESTED' | 'UPLOADED' | 'EXTRACTED' | 'VALIDATED';
    createdAt: Date;
    updatedAt: Date;
    meta: {
      projectId: string;
      required: boolean;
      kind: 'DURC' | 'CDU' | 'VISURA' | 'PLANIMETRIA' | 'PROGETTO';
      requestedAt: Date;
      requestedBy: string;
      vendorId?: string | undefined;
      expiresAt?: Date | undefined;
    };
    issues?: string[] | undefined;
    fileSize?: number | undefined;
    uploadedAt?: Date | undefined;
    validatedAt?: Date | undefined;
    fileUrl?: string | undefined;
    fileName?: string | undefined;
    uploadedBy?: string | undefined;
    extracted?:
      | {
          particella: string;
          destinazioneUso: string;
          vincoli: string[];
          superficie: number;
          indiceUrbanistico: number;
          altezzaMax: number;
          destinazioneSpecifica?: string | undefined;
        }
      | {
          cciaa: string;
          oggettoSociale: string;
          sedeLegale: string;
          partitaIva: string;
          codiceFiscale: string;
          dataIscrizione: Date;
          stato: 'ATTIVA' | 'SOSPESA' | 'CANCELLATA';
        }
      | {
          ditta: string;
          validita: Date;
          numero: string;
          rilasciatoDa: string;
          dataRilascio: Date;
          categoria: string;
          classe: string;
        }
      | {
          data: Date;
          superficie: number;
          scala: string;
          tecnico: string;
          destinazione: string;
          livelli: number;
          vani: number;
        }
      | {
          data: Date;
          titolo: string;
          architetto: string;
          versione: string;
          approvato: boolean;
          note?: string | undefined;
        }
      | undefined;
    validatedBy?: string | undefined;
  },
  {
    id: string;
    status: 'EXPIRED' | 'REQUESTED' | 'UPLOADED' | 'EXTRACTED' | 'VALIDATED';
    createdAt: Date;
    updatedAt: Date;
    meta: {
      projectId: string;
      required: boolean;
      kind: 'DURC' | 'CDU' | 'VISURA' | 'PLANIMETRIA' | 'PROGETTO';
      requestedAt: Date;
      requestedBy: string;
      vendorId?: string | undefined;
      expiresAt?: Date | undefined;
    };
    issues?: string[] | undefined;
    fileSize?: number | undefined;
    uploadedAt?: Date | undefined;
    validatedAt?: Date | undefined;
    fileUrl?: string | undefined;
    fileName?: string | undefined;
    uploadedBy?: string | undefined;
    extracted?:
      | {
          particella: string;
          destinazioneUso: string;
          vincoli: string[];
          superficie: number;
          indiceUrbanistico: number;
          altezzaMax: number;
          destinazioneSpecifica?: string | undefined;
        }
      | {
          cciaa: string;
          oggettoSociale: string;
          sedeLegale: string;
          partitaIva: string;
          codiceFiscale: string;
          dataIscrizione: Date;
          stato: 'ATTIVA' | 'SOSPESA' | 'CANCELLATA';
        }
      | {
          ditta: string;
          validita: Date;
          numero: string;
          rilasciatoDa: string;
          dataRilascio: Date;
          categoria: string;
          classe: string;
        }
      | {
          data: Date;
          superficie: number;
          scala: string;
          tecnico: string;
          destinazione: string;
          livelli: number;
          vani: number;
        }
      | {
          data: Date;
          titolo: string;
          architetto: string;
          versione: string;
          approvato: boolean;
          note?: string | undefined;
        }
      | undefined;
    validatedBy?: string | undefined;
  }
>;
export declare const zDocRequest: z.ZodObject<
  {
    projectId: z.ZodString;
    kind: z.ZodEnum<['CDU', 'VISURA', 'DURC', 'PLANIMETRIA', 'PROGETTO']>;
    to: z.ZodEnum<['vendor', 'internal']>;
    messageTemplateId: z.ZodString;
    uploadUrl: z.ZodString;
    expiresAt: z.ZodDate;
    requestedBy: z.ZodString;
  },
  'strip',
  z.ZodTypeAny,
  {
    projectId: string;
    expiresAt: Date;
    to: 'vendor' | 'internal';
    kind: 'DURC' | 'CDU' | 'VISURA' | 'PLANIMETRIA' | 'PROGETTO';
    requestedBy: string;
    messageTemplateId: string;
    uploadUrl: string;
  },
  {
    projectId: string;
    expiresAt: Date;
    to: 'vendor' | 'internal';
    kind: 'DURC' | 'CDU' | 'VISURA' | 'PLANIMETRIA' | 'PROGETTO';
    requestedBy: string;
    messageTemplateId: string;
    uploadUrl: string;
  }
>;
export declare const zChecklistItem: z.ZodObject<
  {
    kind: z.ZodEnum<['CDU', 'VISURA', 'DURC', 'PLANIMETRIA', 'PROGETTO']>;
    status: z.ZodEnum<['REQUESTED', 'UPLOADED', 'EXTRACTED', 'VALIDATED', 'EXPIRED']>;
    documentId: z.ZodOptional<z.ZodString>;
    missingFields: z.ZodOptional<z.ZodArray<z.ZodString, 'many'>>;
    issues: z.ZodOptional<z.ZodArray<z.ZodString, 'many'>>;
    lastUpdate: z.ZodDate;
  },
  'strip',
  z.ZodTypeAny,
  {
    status: 'EXPIRED' | 'REQUESTED' | 'UPLOADED' | 'EXTRACTED' | 'VALIDATED';
    lastUpdate: Date;
    kind: 'DURC' | 'CDU' | 'VISURA' | 'PLANIMETRIA' | 'PROGETTO';
    issues?: string[] | undefined;
    documentId?: string | undefined;
    missingFields?: string[] | undefined;
  },
  {
    status: 'EXPIRED' | 'REQUESTED' | 'UPLOADED' | 'EXTRACTED' | 'VALIDATED';
    lastUpdate: Date;
    kind: 'DURC' | 'CDU' | 'VISURA' | 'PLANIMETRIA' | 'PROGETTO';
    issues?: string[] | undefined;
    documentId?: string | undefined;
    missingFields?: string[] | undefined;
  }
>;
export declare const zChecklist: z.ZodObject<
  {
    projectId: z.ZodString;
    items: z.ZodArray<
      z.ZodObject<
        {
          kind: z.ZodEnum<['CDU', 'VISURA', 'DURC', 'PLANIMETRIA', 'PROGETTO']>;
          status: z.ZodEnum<['REQUESTED', 'UPLOADED', 'EXTRACTED', 'VALIDATED', 'EXPIRED']>;
          documentId: z.ZodOptional<z.ZodString>;
          missingFields: z.ZodOptional<z.ZodArray<z.ZodString, 'many'>>;
          issues: z.ZodOptional<z.ZodArray<z.ZodString, 'many'>>;
          lastUpdate: z.ZodDate;
        },
        'strip',
        z.ZodTypeAny,
        {
          status: 'EXPIRED' | 'REQUESTED' | 'UPLOADED' | 'EXTRACTED' | 'VALIDATED';
          lastUpdate: Date;
          kind: 'DURC' | 'CDU' | 'VISURA' | 'PLANIMETRIA' | 'PROGETTO';
          issues?: string[] | undefined;
          documentId?: string | undefined;
          missingFields?: string[] | undefined;
        },
        {
          status: 'EXPIRED' | 'REQUESTED' | 'UPLOADED' | 'EXTRACTED' | 'VALIDATED';
          lastUpdate: Date;
          kind: 'DURC' | 'CDU' | 'VISURA' | 'PLANIMETRIA' | 'PROGETTO';
          issues?: string[] | undefined;
          documentId?: string | undefined;
          missingFields?: string[] | undefined;
        }
      >,
      'many'
    >;
    overallStatus: z.ZodEnum<['INCOMPLETE', 'COMPLETE', 'VALIDATION_REQUIRED']>;
    completionPercentage: z.ZodNumber;
    lastUpdated: z.ZodDate;
    updatedBy: z.ZodString;
  },
  'strip',
  z.ZodTypeAny,
  {
    projectId: string;
    overallStatus: 'INCOMPLETE' | 'COMPLETE' | 'VALIDATION_REQUIRED';
    updatedBy: string;
    lastUpdated: Date;
    items: {
      status: 'EXPIRED' | 'REQUESTED' | 'UPLOADED' | 'EXTRACTED' | 'VALIDATED';
      lastUpdate: Date;
      kind: 'DURC' | 'CDU' | 'VISURA' | 'PLANIMETRIA' | 'PROGETTO';
      issues?: string[] | undefined;
      documentId?: string | undefined;
      missingFields?: string[] | undefined;
    }[];
    completionPercentage: number;
  },
  {
    projectId: string;
    overallStatus: 'INCOMPLETE' | 'COMPLETE' | 'VALIDATION_REQUIRED';
    updatedBy: string;
    lastUpdated: Date;
    items: {
      status: 'EXPIRED' | 'REQUESTED' | 'UPLOADED' | 'EXTRACTED' | 'VALIDATED';
      lastUpdate: Date;
      kind: 'DURC' | 'CDU' | 'VISURA' | 'PLANIMETRIA' | 'PROGETTO';
      issues?: string[] | undefined;
      documentId?: string | undefined;
      missingFields?: string[] | undefined;
    }[];
    completionPercentage: number;
  }
>;
//# sourceMappingURL=docs.d.ts.map
