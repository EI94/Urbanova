import type {
  Project,
  Deal,
  Parcel,
  FeasibilityInput,
  FeasibilityResult,
  Document,
  Vendor,
  Listing,
  AuditEvent,
  UserRole,
  ChatCommand,
  ChatResponse,
  ProjectDocument,
  DealDocument,
  ParcelDocument,
  FeasibilityDocument,
} from './index';
export declare const createProject: (overrides?: Partial<Project>) => Project;
export declare const createProjectDocument: (
  overrides?: Partial<ProjectDocument>
) => ProjectDocument;
export declare const createDeal: (overrides?: Partial<Deal>) => Deal;
export declare const createDealDocument: (overrides?: Partial<DealDocument>) => DealDocument;
export declare const createParcel: (overrides?: Partial<Parcel>) => Parcel;
export declare const createParcelDocument: (overrides?: Partial<ParcelDocument>) => ParcelDocument;
export declare const createFeasibilityInput: (
  overrides?: Partial<FeasibilityInput>
) => FeasibilityInput;
export declare const createFeasibilityResult: (
  overrides?: Partial<FeasibilityResult>
) => FeasibilityResult;
export declare const createFeasibilityDocument: (
  overrides?: Partial<FeasibilityDocument>
) => FeasibilityDocument;
export declare const createDocument: (overrides?: Partial<Document>) => Document;
export declare const createVendor: (overrides?: Partial<Vendor>) => Vendor;
export declare const createListing: (overrides?: Partial<Listing>) => Listing;
export declare const createAuditEvent: (overrides?: Partial<AuditEvent>) => AuditEvent;
export declare const createUserRole: (overrides?: Partial<UserRole>) => UserRole;
export declare const createChatCommand: (overrides?: Partial<ChatCommand>) => ChatCommand;
export declare const createChatResponse: (overrides?: Partial<ChatResponse>) => ChatResponse;
export declare const createMockData: {
  projects: (count?: number) => Project[];
  deals: (count?: number) => Deal[];
  parcels: (count?: number) => Parcel[];
  feasibilityResults: (count?: number) => FeasibilityResult[];
  documents: (count?: number) => Document[];
  vendors: (count?: number) => Vendor[];
  listings: (count?: number) => Listing[];
  auditEvents: (count?: number) => AuditEvent[];
  userRoles: (count?: number) => UserRole[];
  chatCommands: (count?: number) => ChatCommand[];
  chatResponses: (count?: number) => ChatResponse[];
};
//# sourceMappingURL=factories.d.ts.map
