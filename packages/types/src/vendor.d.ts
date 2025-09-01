import { z } from 'zod';
export interface VendorContact {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  role?: string;
}
export interface VendorQuestionnaire {
  id: string;
  projectId: string;
  vendorContact: VendorContact;
  token: string;
  status: 'pending' | 'completed' | 'expired';
  createdAt: Date;
  expiresAt: Date;
  completedAt?: Date;
  answers?: VendorAnswers;
  metadata: {
    sentBy: string;
    sentAt: Date;
    reminderCount: number;
    lastReminderAt?: Date;
  };
}
export interface VendorAnswers {
  cdu: {
    hasCDU: boolean;
    cduDate?: string;
    cduValidity?: string;
    cduNotes?: string;
  };
  project: {
    hasSubmittedProject: boolean;
    projectSubmissionDate?: string;
    projectApprovalStatus?: 'pending' | 'approved' | 'rejected';
    projectNotes?: string;
  };
  sale: {
    saleType: 'asset' | 'spa';
    saleMotivation?: string;
    saleUrgency: 'low' | 'medium' | 'high';
  };
  constraints: {
    urbanConstraints: string[];
    easements: string[];
    accessLimitations: string[];
    constraintNotes?: string;
  };
  documents: {
    availableDocuments: string[];
    documentNotes?: string;
  };
  additional: {
    notes?: string;
    contactPreference?: 'email' | 'phone' | 'meeting';
    bestTimeToContact?: string;
  };
}
export interface ProjectFactsUpdate {
  projectId: string;
  source: 'vendor_questionnaire';
  timestamp: Date;
  updatedBy: string;
  changes: {
    field: string;
    oldValue?: any;
    newValue: any;
    confidence: number;
  }[];
  metadata: {
    questionnaireId: string;
    vendorContact: VendorContact;
  };
}
export declare const zVendorContact: z.ZodObject<
  {
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    company: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodString>;
  },
  'strip',
  z.ZodTypeAny,
  {
    name: string;
    email: string;
    phone?: string | undefined;
    company?: string | undefined;
    role?: string | undefined;
  },
  {
    name: string;
    email: string;
    phone?: string | undefined;
    company?: string | undefined;
    role?: string | undefined;
  }
>;
export declare const zVendorAnswers: z.ZodObject<
  {
    cdu: z.ZodObject<
      {
        hasCDU: z.ZodBoolean;
        cduDate: z.ZodOptional<z.ZodString>;
        cduValidity: z.ZodOptional<z.ZodString>;
        cduNotes: z.ZodOptional<z.ZodString>;
      },
      'strip',
      z.ZodTypeAny,
      {
        hasCDU: boolean;
        cduDate?: string | undefined;
        cduValidity?: string | undefined;
        cduNotes?: string | undefined;
      },
      {
        hasCDU: boolean;
        cduDate?: string | undefined;
        cduValidity?: string | undefined;
        cduNotes?: string | undefined;
      }
    >;
    project: z.ZodObject<
      {
        hasSubmittedProject: z.ZodBoolean;
        projectSubmissionDate: z.ZodOptional<z.ZodString>;
        projectApprovalStatus: z.ZodOptional<z.ZodEnum<['pending', 'approved', 'rejected']>>;
        projectNotes: z.ZodOptional<z.ZodString>;
      },
      'strip',
      z.ZodTypeAny,
      {
        hasSubmittedProject: boolean;
        projectSubmissionDate?: string | undefined;
        projectApprovalStatus?: 'pending' | 'approved' | 'rejected' | undefined;
        projectNotes?: string | undefined;
      },
      {
        hasSubmittedProject: boolean;
        projectSubmissionDate?: string | undefined;
        projectApprovalStatus?: 'pending' | 'approved' | 'rejected' | undefined;
        projectNotes?: string | undefined;
      }
    >;
    sale: z.ZodObject<
      {
        saleType: z.ZodEnum<['asset', 'spa']>;
        saleMotivation: z.ZodOptional<z.ZodString>;
        saleUrgency: z.ZodEnum<['low', 'medium', 'high']>;
      },
      'strip',
      z.ZodTypeAny,
      {
        saleType: 'asset' | 'spa';
        saleUrgency: 'low' | 'medium' | 'high';
        saleMotivation?: string | undefined;
      },
      {
        saleType: 'asset' | 'spa';
        saleUrgency: 'low' | 'medium' | 'high';
        saleMotivation?: string | undefined;
      }
    >;
    constraints: z.ZodObject<
      {
        urbanConstraints: z.ZodArray<z.ZodString, 'many'>;
        easements: z.ZodArray<z.ZodString, 'many'>;
        accessLimitations: z.ZodArray<z.ZodString, 'many'>;
        constraintNotes: z.ZodOptional<z.ZodString>;
      },
      'strip',
      z.ZodTypeAny,
      {
        urbanConstraints: string[];
        easements: string[];
        accessLimitations: string[];
        constraintNotes?: string | undefined;
      },
      {
        urbanConstraints: string[];
        easements: string[];
        accessLimitations: string[];
        constraintNotes?: string | undefined;
      }
    >;
    documents: z.ZodObject<
      {
        availableDocuments: z.ZodArray<z.ZodString, 'many'>;
        documentNotes: z.ZodOptional<z.ZodString>;
      },
      'strip',
      z.ZodTypeAny,
      {
        availableDocuments: string[];
        documentNotes?: string | undefined;
      },
      {
        availableDocuments: string[];
        documentNotes?: string | undefined;
      }
    >;
    additional: z.ZodObject<
      {
        notes: z.ZodOptional<z.ZodString>;
        contactPreference: z.ZodOptional<z.ZodEnum<['email', 'phone', 'meeting']>>;
        bestTimeToContact: z.ZodOptional<z.ZodString>;
      },
      'strip',
      z.ZodTypeAny,
      {
        notes?: string | undefined;
        contactPreference?: 'email' | 'phone' | 'meeting' | undefined;
        bestTimeToContact?: string | undefined;
      },
      {
        notes?: string | undefined;
        contactPreference?: 'email' | 'phone' | 'meeting' | undefined;
        bestTimeToContact?: string | undefined;
      }
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    documents: {
      availableDocuments: string[];
      documentNotes?: string | undefined;
    };
    cdu: {
      hasCDU: boolean;
      cduDate?: string | undefined;
      cduValidity?: string | undefined;
      cduNotes?: string | undefined;
    };
    project: {
      hasSubmittedProject: boolean;
      projectSubmissionDate?: string | undefined;
      projectApprovalStatus?: 'pending' | 'approved' | 'rejected' | undefined;
      projectNotes?: string | undefined;
    };
    sale: {
      saleType: 'asset' | 'spa';
      saleUrgency: 'low' | 'medium' | 'high';
      saleMotivation?: string | undefined;
    };
    constraints: {
      urbanConstraints: string[];
      easements: string[];
      accessLimitations: string[];
      constraintNotes?: string | undefined;
    };
    additional: {
      notes?: string | undefined;
      contactPreference?: 'email' | 'phone' | 'meeting' | undefined;
      bestTimeToContact?: string | undefined;
    };
  },
  {
    documents: {
      availableDocuments: string[];
      documentNotes?: string | undefined;
    };
    cdu: {
      hasCDU: boolean;
      cduDate?: string | undefined;
      cduValidity?: string | undefined;
      cduNotes?: string | undefined;
    };
    project: {
      hasSubmittedProject: boolean;
      projectSubmissionDate?: string | undefined;
      projectApprovalStatus?: 'pending' | 'approved' | 'rejected' | undefined;
      projectNotes?: string | undefined;
    };
    sale: {
      saleType: 'asset' | 'spa';
      saleUrgency: 'low' | 'medium' | 'high';
      saleMotivation?: string | undefined;
    };
    constraints: {
      urbanConstraints: string[];
      easements: string[];
      accessLimitations: string[];
      constraintNotes?: string | undefined;
    };
    additional: {
      notes?: string | undefined;
      contactPreference?: 'email' | 'phone' | 'meeting' | undefined;
      bestTimeToContact?: string | undefined;
    };
  }
>;
export declare const zVendorQuestionnaire: z.ZodObject<
  {
    id: z.ZodString;
    projectId: z.ZodString;
    vendorContact: z.ZodObject<
      {
        name: z.ZodString;
        email: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
        company: z.ZodOptional<z.ZodString>;
        role: z.ZodOptional<z.ZodString>;
      },
      'strip',
      z.ZodTypeAny,
      {
        name: string;
        email: string;
        phone?: string | undefined;
        company?: string | undefined;
        role?: string | undefined;
      },
      {
        name: string;
        email: string;
        phone?: string | undefined;
        company?: string | undefined;
        role?: string | undefined;
      }
    >;
    token: z.ZodString;
    status: z.ZodEnum<['pending', 'completed', 'expired']>;
    createdAt: z.ZodDate;
    expiresAt: z.ZodDate;
    completedAt: z.ZodOptional<z.ZodDate>;
    answers: z.ZodOptional<
      z.ZodObject<
        {
          cdu: z.ZodObject<
            {
              hasCDU: z.ZodBoolean;
              cduDate: z.ZodOptional<z.ZodString>;
              cduValidity: z.ZodOptional<z.ZodString>;
              cduNotes: z.ZodOptional<z.ZodString>;
            },
            'strip',
            z.ZodTypeAny,
            {
              hasCDU: boolean;
              cduDate?: string | undefined;
              cduValidity?: string | undefined;
              cduNotes?: string | undefined;
            },
            {
              hasCDU: boolean;
              cduDate?: string | undefined;
              cduValidity?: string | undefined;
              cduNotes?: string | undefined;
            }
          >;
          project: z.ZodObject<
            {
              hasSubmittedProject: z.ZodBoolean;
              projectSubmissionDate: z.ZodOptional<z.ZodString>;
              projectApprovalStatus: z.ZodOptional<z.ZodEnum<['pending', 'approved', 'rejected']>>;
              projectNotes: z.ZodOptional<z.ZodString>;
            },
            'strip',
            z.ZodTypeAny,
            {
              hasSubmittedProject: boolean;
              projectSubmissionDate?: string | undefined;
              projectApprovalStatus?: 'pending' | 'approved' | 'rejected' | undefined;
              projectNotes?: string | undefined;
            },
            {
              hasSubmittedProject: boolean;
              projectSubmissionDate?: string | undefined;
              projectApprovalStatus?: 'pending' | 'approved' | 'rejected' | undefined;
              projectNotes?: string | undefined;
            }
          >;
          sale: z.ZodObject<
            {
              saleType: z.ZodEnum<['asset', 'spa']>;
              saleMotivation: z.ZodOptional<z.ZodString>;
              saleUrgency: z.ZodEnum<['low', 'medium', 'high']>;
            },
            'strip',
            z.ZodTypeAny,
            {
              saleType: 'asset' | 'spa';
              saleUrgency: 'low' | 'medium' | 'high';
              saleMotivation?: string | undefined;
            },
            {
              saleType: 'asset' | 'spa';
              saleUrgency: 'low' | 'medium' | 'high';
              saleMotivation?: string | undefined;
            }
          >;
          constraints: z.ZodObject<
            {
              urbanConstraints: z.ZodArray<z.ZodString, 'many'>;
              easements: z.ZodArray<z.ZodString, 'many'>;
              accessLimitations: z.ZodArray<z.ZodString, 'many'>;
              constraintNotes: z.ZodOptional<z.ZodString>;
            },
            'strip',
            z.ZodTypeAny,
            {
              urbanConstraints: string[];
              easements: string[];
              accessLimitations: string[];
              constraintNotes?: string | undefined;
            },
            {
              urbanConstraints: string[];
              easements: string[];
              accessLimitations: string[];
              constraintNotes?: string | undefined;
            }
          >;
          documents: z.ZodObject<
            {
              availableDocuments: z.ZodArray<z.ZodString, 'many'>;
              documentNotes: z.ZodOptional<z.ZodString>;
            },
            'strip',
            z.ZodTypeAny,
            {
              availableDocuments: string[];
              documentNotes?: string | undefined;
            },
            {
              availableDocuments: string[];
              documentNotes?: string | undefined;
            }
          >;
          additional: z.ZodObject<
            {
              notes: z.ZodOptional<z.ZodString>;
              contactPreference: z.ZodOptional<z.ZodEnum<['email', 'phone', 'meeting']>>;
              bestTimeToContact: z.ZodOptional<z.ZodString>;
            },
            'strip',
            z.ZodTypeAny,
            {
              notes?: string | undefined;
              contactPreference?: 'email' | 'phone' | 'meeting' | undefined;
              bestTimeToContact?: string | undefined;
            },
            {
              notes?: string | undefined;
              contactPreference?: 'email' | 'phone' | 'meeting' | undefined;
              bestTimeToContact?: string | undefined;
            }
          >;
        },
        'strip',
        z.ZodTypeAny,
        {
          documents: {
            availableDocuments: string[];
            documentNotes?: string | undefined;
          };
          cdu: {
            hasCDU: boolean;
            cduDate?: string | undefined;
            cduValidity?: string | undefined;
            cduNotes?: string | undefined;
          };
          project: {
            hasSubmittedProject: boolean;
            projectSubmissionDate?: string | undefined;
            projectApprovalStatus?: 'pending' | 'approved' | 'rejected' | undefined;
            projectNotes?: string | undefined;
          };
          sale: {
            saleType: 'asset' | 'spa';
            saleUrgency: 'low' | 'medium' | 'high';
            saleMotivation?: string | undefined;
          };
          constraints: {
            urbanConstraints: string[];
            easements: string[];
            accessLimitations: string[];
            constraintNotes?: string | undefined;
          };
          additional: {
            notes?: string | undefined;
            contactPreference?: 'email' | 'phone' | 'meeting' | undefined;
            bestTimeToContact?: string | undefined;
          };
        },
        {
          documents: {
            availableDocuments: string[];
            documentNotes?: string | undefined;
          };
          cdu: {
            hasCDU: boolean;
            cduDate?: string | undefined;
            cduValidity?: string | undefined;
            cduNotes?: string | undefined;
          };
          project: {
            hasSubmittedProject: boolean;
            projectSubmissionDate?: string | undefined;
            projectApprovalStatus?: 'pending' | 'approved' | 'rejected' | undefined;
            projectNotes?: string | undefined;
          };
          sale: {
            saleType: 'asset' | 'spa';
            saleUrgency: 'low' | 'medium' | 'high';
            saleMotivation?: string | undefined;
          };
          constraints: {
            urbanConstraints: string[];
            easements: string[];
            accessLimitations: string[];
            constraintNotes?: string | undefined;
          };
          additional: {
            notes?: string | undefined;
            contactPreference?: 'email' | 'phone' | 'meeting' | undefined;
            bestTimeToContact?: string | undefined;
          };
        }
      >
    >;
    metadata: z.ZodObject<
      {
        sentBy: z.ZodString;
        sentAt: z.ZodDate;
        reminderCount: z.ZodNumber;
        lastReminderAt: z.ZodOptional<z.ZodDate>;
      },
      'strip',
      z.ZodTypeAny,
      {
        sentAt: Date;
        sentBy: string;
        reminderCount: number;
        lastReminderAt?: Date | undefined;
      },
      {
        sentAt: Date;
        sentBy: string;
        reminderCount: number;
        lastReminderAt?: Date | undefined;
      }
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    id: string;
    status: 'pending' | 'completed' | 'expired';
    metadata: {
      sentAt: Date;
      sentBy: string;
      reminderCount: number;
      lastReminderAt?: Date | undefined;
    };
    projectId: string;
    createdAt: Date;
    expiresAt: Date;
    vendorContact: {
      name: string;
      email: string;
      phone?: string | undefined;
      company?: string | undefined;
      role?: string | undefined;
    };
    token: string;
    completedAt?: Date | undefined;
    answers?:
      | {
          documents: {
            availableDocuments: string[];
            documentNotes?: string | undefined;
          };
          cdu: {
            hasCDU: boolean;
            cduDate?: string | undefined;
            cduValidity?: string | undefined;
            cduNotes?: string | undefined;
          };
          project: {
            hasSubmittedProject: boolean;
            projectSubmissionDate?: string | undefined;
            projectApprovalStatus?: 'pending' | 'approved' | 'rejected' | undefined;
            projectNotes?: string | undefined;
          };
          sale: {
            saleType: 'asset' | 'spa';
            saleUrgency: 'low' | 'medium' | 'high';
            saleMotivation?: string | undefined;
          };
          constraints: {
            urbanConstraints: string[];
            easements: string[];
            accessLimitations: string[];
            constraintNotes?: string | undefined;
          };
          additional: {
            notes?: string | undefined;
            contactPreference?: 'email' | 'phone' | 'meeting' | undefined;
            bestTimeToContact?: string | undefined;
          };
        }
      | undefined;
  },
  {
    id: string;
    status: 'pending' | 'completed' | 'expired';
    metadata: {
      sentAt: Date;
      sentBy: string;
      reminderCount: number;
      lastReminderAt?: Date | undefined;
    };
    projectId: string;
    createdAt: Date;
    expiresAt: Date;
    vendorContact: {
      name: string;
      email: string;
      phone?: string | undefined;
      company?: string | undefined;
      role?: string | undefined;
    };
    token: string;
    completedAt?: Date | undefined;
    answers?:
      | {
          documents: {
            availableDocuments: string[];
            documentNotes?: string | undefined;
          };
          cdu: {
            hasCDU: boolean;
            cduDate?: string | undefined;
            cduValidity?: string | undefined;
            cduNotes?: string | undefined;
          };
          project: {
            hasSubmittedProject: boolean;
            projectSubmissionDate?: string | undefined;
            projectApprovalStatus?: 'pending' | 'approved' | 'rejected' | undefined;
            projectNotes?: string | undefined;
          };
          sale: {
            saleType: 'asset' | 'spa';
            saleUrgency: 'low' | 'medium' | 'high';
            saleMotivation?: string | undefined;
          };
          constraints: {
            urbanConstraints: string[];
            easements: string[];
            accessLimitations: string[];
            constraintNotes?: string | undefined;
          };
          additional: {
            notes?: string | undefined;
            contactPreference?: 'email' | 'phone' | 'meeting' | undefined;
            bestTimeToContact?: string | undefined;
          };
        }
      | undefined;
  }
>;
export declare const zProjectFactsUpdate: z.ZodObject<
  {
    projectId: z.ZodString;
    source: z.ZodLiteral<'vendor_questionnaire'>;
    timestamp: z.ZodDate;
    updatedBy: z.ZodString;
    changes: z.ZodArray<
      z.ZodObject<
        {
          field: z.ZodString;
          oldValue: z.ZodOptional<z.ZodAny>;
          newValue: z.ZodAny;
          confidence: z.ZodNumber;
        },
        'strip',
        z.ZodTypeAny,
        {
          field: string;
          confidence: number;
          oldValue?: any;
          newValue?: any;
        },
        {
          field: string;
          confidence: number;
          oldValue?: any;
          newValue?: any;
        }
      >,
      'many'
    >;
    metadata: z.ZodObject<
      {
        questionnaireId: z.ZodString;
        vendorContact: z.ZodObject<
          {
            name: z.ZodString;
            email: z.ZodString;
            phone: z.ZodOptional<z.ZodString>;
            company: z.ZodOptional<z.ZodString>;
            role: z.ZodOptional<z.ZodString>;
          },
          'strip',
          z.ZodTypeAny,
          {
            name: string;
            email: string;
            phone?: string | undefined;
            company?: string | undefined;
            role?: string | undefined;
          },
          {
            name: string;
            email: string;
            phone?: string | undefined;
            company?: string | undefined;
            role?: string | undefined;
          }
        >;
      },
      'strip',
      z.ZodTypeAny,
      {
        vendorContact: {
          name: string;
          email: string;
          phone?: string | undefined;
          company?: string | undefined;
          role?: string | undefined;
        };
        questionnaireId: string;
      },
      {
        vendorContact: {
          name: string;
          email: string;
          phone?: string | undefined;
          company?: string | undefined;
          role?: string | undefined;
        };
        questionnaireId: string;
      }
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    metadata: {
      vendorContact: {
        name: string;
        email: string;
        phone?: string | undefined;
        company?: string | undefined;
        role?: string | undefined;
      };
      questionnaireId: string;
    };
    projectId: string;
    timestamp: Date;
    source: 'vendor_questionnaire';
    updatedBy: string;
    changes: {
      field: string;
      confidence: number;
      oldValue?: any;
      newValue?: any;
    }[];
  },
  {
    metadata: {
      vendorContact: {
        name: string;
        email: string;
        phone?: string | undefined;
        company?: string | undefined;
        role?: string | undefined;
      };
      questionnaireId: string;
    };
    projectId: string;
    timestamp: Date;
    source: 'vendor_questionnaire';
    updatedBy: string;
    changes: {
      field: string;
      confidence: number;
      oldValue?: any;
      newValue?: any;
    }[];
  }
>;
export type VendorQuestionnaireStatus = 'pending' | 'completed' | 'expired';
export type SaleType = 'asset' | 'spa';
export type SaleUrgency = 'low' | 'medium' | 'high';
export type ProjectApprovalStatus = 'pending' | 'approved' | 'rejected';
export type ContactPreference = 'email' | 'phone' | 'meeting';
export declare const VENDOR_QUESTIONNAIRE_EXPIRY_DAYS = 7;
export declare const VENDOR_QUESTIONNAIRE_REMINDER_DAYS: number[];
export declare const AVAILABLE_DOCUMENTS_OPTIONS: readonly [
  'planimetrie',
  'relazioni_tecniche',
  'certificazioni_energetiche',
  'perizie_tecniche',
  'visure_catastali',
  'certificati_agibilita',
  'documenti_urbanistici',
  'contratti_locazione',
  'altri_documenti',
];
export declare const URBAN_CONSTRAINTS_OPTIONS: readonly [
  'vincoli_paesaggistici',
  'vincoli_archeologici',
  'vincoli_idrogeologici',
  'vincoli_acustici',
  'vincoli_ambientali',
  'vincoli_viabilita',
  'nessun_vincolo',
];
export declare const EASEMENTS_OPTIONS: readonly [
  'passaggio_servitu',
  'elettrodotto',
  'gasdotto',
  'acquedotto',
  'fognatura',
  'telecomunicazioni',
  'nessuna_servitu',
];
export declare const ACCESS_LIMITATIONS_OPTIONS: readonly [
  'strada_privata',
  'accesso_limitato',
  'orari_accesso',
  'restrizioni_veicolari',
  'nessuna_limitazione',
];
//# sourceMappingURL=vendor.d.ts.map
