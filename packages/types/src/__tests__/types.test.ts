// Tests for @urbanova/types package

import {
  createProject,
  createDeal,
  createParcel,
  createFeasibilityInput,
  createFeasibilityResult,
  createDocument,
  createVendor,
  createListing,
  createAuditEvent,
  createUserRole,
  createChatCommand,
  createChatResponse,
  createMockData,
} from '../factories';

describe('Type Factories', () => {
  describe('Project Factory', () => {
    it('should create a valid project with default values', () => {
      const project = createProject();

      expect(project).toHaveProperty('id');
      expect(project).toHaveProperty('name', 'Test Project');
      expect(project).toHaveProperty('status', 'PLANNING');
      expect(project).toHaveProperty('type', 'RESIDENTIAL');
      expect(project).toHaveProperty('location');
      expect(project).toHaveProperty('budget');
      expect(project).toHaveProperty('timeline');
      expect(project).toHaveProperty('ownerId');
      expect(project).toHaveProperty('createdAt');
      expect(project).toHaveProperty('updatedAt');
    });

    it('should allow overriding default values', () => {
      const customProject = createProject({
        name: 'Custom Project',
        status: 'IN_PROGRESS',
        type: 'COMMERCIAL',
      });

      expect(customProject.name).toBe('Custom Project');
      expect(customProject.status).toBe('IN_PROGRESS');
      expect(customProject.type).toBe('COMMERCIAL');
    });

    it('should generate unique IDs for each project', () => {
      const project1 = createProject();
      const project2 = createProject();

      expect(project1.id).not.toBe(project2.id);
    });
  });

  describe('Deal Factory', () => {
    it('should create a valid deal with default values', () => {
      const deal = createDeal();

      expect(deal).toHaveProperty('id');
      expect(deal).toHaveProperty('projectId');
      expect(deal).toHaveProperty('status', 'NEGOTIATION');
      expect(deal).toHaveProperty('type', 'PURCHASE');
      expect(deal).toHaveProperty('value', 500000);
      expect(deal).toHaveProperty('currency', 'EUR');
      expect(deal).toHaveProperty('parties');
      expect(deal).toHaveProperty('documents');
      expect(deal).toHaveProperty('milestones');
    });

    it('should create parties with correct structure', () => {
      const deal = createDeal();

      expect(deal.parties).toHaveLength(1);
      expect(deal.parties[0]).toHaveProperty('type', 'BUYER');
      expect(deal.parties[0].contact).toHaveProperty('email');
      expect(deal.parties[0].contact).toHaveProperty('phone');
    });
  });

  describe('Parcel Factory', () => {
    it('should create a valid parcel with default values', () => {
      const parcel = createParcel();

      expect(parcel).toHaveProperty('id');
      expect(parcel).toHaveProperty('address', 'Via Roma 123, Milano');
      expect(parcel).toHaveProperty('coordinates');
      expect(parcel.coordinates).toHaveProperty('latitude', 45.4642);
      expect(parcel.coordinates).toHaveProperty('longitude', 9.19);
      expect(parcel).toHaveProperty('area', 500);
      expect(parcel).toHaveProperty('zoning');
      expect(parcel).toHaveProperty('ownership');
      expect(parcel).toHaveProperty('marketValue', 500000);
    });

    it('should have valid zoning information', () => {
      const parcel = createParcel();

      expect(parcel.zoning.zone).toBe('RESIDENTIAL');
      expect(parcel.zoning.allowedUses).toContain('RESIDENTIAL');
      expect(parcel.zoning.allowedUses).toContain('COMMERCIAL');
    });
  });

  describe('Feasibility Factory', () => {
    it('should create valid feasibility input', () => {
      const input = createFeasibilityInput();

      expect(input).toHaveProperty('parcelId');
      expect(input).toHaveProperty('projectType', 'RESIDENTIAL');
      expect(input).toHaveProperty('budget');
      expect(input).toHaveProperty('timeline');
      expect(input).toHaveProperty('marketConditions');
      expect(input).toHaveProperty('regulatoryContext');
    });

    it('should create valid feasibility result', () => {
      const result = createFeasibilityResult();

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('input');
      expect(result).toHaveProperty('analysis');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('riskAssessment');
      expect(result).toHaveProperty('roi');
    });

    it('should have valid financial analysis', () => {
      const result = createFeasibilityResult();

      expect(result.analysis.financial.score).toBeGreaterThanOrEqual(0);
      expect(result.analysis.financial.score).toBeLessThanOrEqual(100);
      expect(result.analysis.financial.npv).toBe(150000);
      expect(result.analysis.financial.irr).toBe(12.5);
      expect(result.analysis.financial.paybackPeriod).toBe(84);
    });
  });

  describe('Document Factory', () => {
    it('should create a valid document', () => {
      const document = createDocument();

      expect(document).toHaveProperty('id');
      expect(document).toHaveProperty('name', 'Test Document');
      expect(document).toHaveProperty('type', 'REPORT');
      expect(document).toHaveProperty('url');
      expect(document).toHaveProperty('size', 1024 * 1024);
      expect(document).toHaveProperty('mimeType', 'application/pdf');
      expect(document).toHaveProperty('metadata');
    });
  });

  describe('Vendor Factory', () => {
    it('should create a valid vendor', () => {
      const vendor = createVendor();

      expect(vendor).toHaveProperty('id');
      expect(vendor).toHaveProperty('name', 'Test Vendor');
      expect(vendor).toHaveProperty('type', 'CONTRACTOR');
      expect(vendor).toHaveProperty('contact');
      expect(vendor).toHaveProperty('services');
      expect(vendor).toHaveProperty('rating', 4.5);
      expect(vendor).toHaveProperty('availability');
    });

    it('should have valid services structure', () => {
      const vendor = createVendor();

      expect(vendor.services).toHaveLength(1);
      expect(vendor.services[0]).toHaveProperty('name', 'Construction');
      expect(vendor.services[0]).toHaveProperty('pricing');
      expect(vendor.services[0].pricing.type).toBe('FIXED');
      expect(vendor.services[0].pricing.amount).toBe(100000);
    });
  });

  describe('Listing Factory', () => {
    it('should create a valid listing', () => {
      const listing = createListing();

      expect(listing).toHaveProperty('id');
      expect(listing).toHaveProperty('source', 'IMMOBILIARE_IT');
      expect(listing).toHaveProperty('externalId', '12345');
      expect(listing).toHaveProperty('title', 'Terreno edificabile a Milano');
      expect(listing).toHaveProperty('price', 500000);
      expect(listing).toHaveProperty('currency', 'EUR');
      expect(listing).toHaveProperty('location');
      expect(listing).toHaveProperty('features');
      expect(listing).toHaveProperty('images');
      expect(listing).toHaveProperty('contactInfo');
    });

    it('should have valid location information', () => {
      const listing = createListing();

      expect(listing.location.city).toBe('Milano');
      expect(listing.location.province).toBe('MI');
      expect(listing.location.region).toBe('Lombardia');
      expect(listing.location.country).toBe('Italia');
    });
  });

  describe('AuditEvent Factory', () => {
    it('should create a valid audit event', () => {
      const event = createAuditEvent();

      expect(event).toHaveProperty('id');
      expect(event).toHaveProperty('userId');
      expect(event).toHaveProperty('action', 'CREATE');
      expect(event).toHaveProperty('resourceType', 'PROJECT');
      expect(event).toHaveProperty('resourceId');
      expect(event).toHaveProperty('details');
      expect(event).toHaveProperty('ipAddress', '192.168.1.1');
      expect(event).toHaveProperty('userAgent');
      expect(event).toHaveProperty('timestamp');
    });
  });

  describe('UserRole Factory', () => {
    it('should create a valid user role', () => {
      const role = createUserRole();

      expect(role).toHaveProperty('id');
      expect(role).toHaveProperty('userId');
      expect(role).toHaveProperty('role', 'MEMBER');
      expect(role).toHaveProperty('permissions');
      expect(role).toHaveProperty('scope', 'PROJECT');
    });

    it('should have valid permissions structure', () => {
      const role = createUserRole();

      expect(role.permissions).toHaveLength(1);
      expect(role.permissions[0]).toHaveProperty('resource', 'PROJECT');
      expect(role.permissions[0].actions).toContain('READ');
      expect(role.permissions[0].actions).toContain('UPDATE');
    });
  });

  describe('Chat Factories', () => {
    it('should create valid chat command', () => {
      const command = createChatCommand();

      expect(command).toHaveProperty('id');
      expect(command).toHaveProperty('userId');
      expect(command).toHaveProperty('message', 'Show me project status');
      expect(command).toHaveProperty('timestamp');
      expect(command).toHaveProperty('source', 'WHATSAPP');
      expect(command).toHaveProperty('metadata');
    });

    it('should create valid chat response', () => {
      const response = createChatResponse();

      expect(response).toHaveProperty('id');
      expect(response).toHaveProperty('commandId');
      expect(response).toHaveProperty('message', 'Here is your project status');
      expect(response).toHaveProperty('type', 'TEXT');
      expect(response).toHaveProperty('actions');
      expect(response).toHaveProperty('metadata');
      expect(response).toHaveProperty('timestamp');
    });

    it('should have valid actions structure', () => {
      const response = createChatResponse();

      expect(response.actions).toHaveLength(1);
      expect(response.actions[0]).toHaveProperty('type', 'BUTTON');
      expect(response.actions[0]).toHaveProperty('label', 'View Details');
      expect(response.actions[0]).toHaveProperty('value', 'view_project');
      expect(response.actions[0]).toHaveProperty('primary', true);
    });
  });

  describe('Mock Data Utilities', () => {
    it('should create arrays of mock data', () => {
      const projects = createMockData.projects(3);
      const deals = createMockData.deals(2);
      const parcels = createMockData.parcels(4);

      expect(projects).toHaveLength(3);
      expect(deals).toHaveLength(2);
      expect(parcels).toHaveLength(4);

      expect(projects[0]).toHaveProperty('id');
      expect(deals[0]).toHaveProperty('id');
      expect(parcels[0]).toHaveProperty('id');
    });

    it('should create unique IDs for each item', () => {
      const projects = createMockData.projects(5);
      const ids = projects.map(p => p.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(5);
    });
  });
});
