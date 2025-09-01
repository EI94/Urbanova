import { ToolManifest } from '@urbanova/types';
export declare const leadsManifest: ToolManifest;
export declare const leadsActions: {
  'leads.list': {
    description: string;
    parameters: {
      projectId: {
        type: string;
        optional: boolean;
        description: string;
      };
      source: {
        type: string;
        optional: boolean;
        description: string;
      };
      status: {
        type: string;
        optional: boolean;
        description: string;
      };
      limit: {
        type: string;
        optional: boolean;
        description: string;
      };
    };
    handler: string;
  };
  'leads.get': {
    description: string;
    parameters: {
      leadId: {
        type: string;
        required: boolean;
        description: string;
      };
    };
    handler: string;
  };
  'leads.create': {
    description: string;
    parameters: {
      projectId: {
        type: string;
        required: boolean;
        description: string;
      };
      source: {
        type: string;
        required: boolean;
        description: string;
      };
      name: {
        type: string;
        required: boolean;
        description: string;
      };
      email: {
        type: string;
        optional: boolean;
        description: string;
      };
      phone: {
        type: string;
        optional: boolean;
        description: string;
      };
      message: {
        type: string;
        optional: boolean;
        description: string;
      };
      listingId: {
        type: string;
        optional: boolean;
        description: string;
      };
    };
    handler: string;
  };
  'leads.update': {
    description: string;
    parameters: {
      leadId: {
        type: string;
        required: boolean;
        description: string;
      };
      status: {
        type: string;
        optional: boolean;
        description: string;
      };
      assignedUserId: {
        type: string;
        optional: boolean;
        description: string;
      };
      priority: {
        type: string;
        optional: boolean;
        description: string;
      };
    };
    handler: string;
  };
  'leads.assign': {
    description: string;
    parameters: {
      leadId: {
        type: string;
        required: boolean;
        description: string;
      };
      userId: {
        type: string;
        required: boolean;
        description: string;
      };
    };
    handler: string;
  };
  'conversations.list': {
    description: string;
    parameters: {
      leadId: {
        type: string;
        optional: boolean;
        description: string;
      };
      projectId: {
        type: string;
        optional: boolean;
        description: string;
      };
      channel: {
        type: string;
        optional: boolean;
        description: string;
      };
      slaStatus: {
        type: string;
        optional: boolean;
        description: string;
      };
    };
    handler: string;
  };
  'conversations.get': {
    description: string;
    parameters: {
      convId: {
        type: string;
        required: boolean;
        description: string;
      };
    };
    handler: string;
  };
  'conversations.messages': {
    description: string;
    parameters: {
      convId: {
        type: string;
        required: boolean;
        description: string;
      };
      limit: {
        type: string;
        optional: boolean;
        description: string;
      };
    };
    handler: string;
  };
  'messages.send': {
    description: string;
    parameters: {
      convId: {
        type: string;
        required: boolean;
        description: string;
      };
      text: {
        type: string;
        required: boolean;
        description: string;
      };
      channel: {
        type: string;
        optional: boolean;
        description: string;
      };
      templateId: {
        type: string;
        optional: boolean;
        description: string;
      };
      variables: {
        type: string;
        optional: boolean;
        description: string;
      };
    };
    handler: string;
  };
  'templates.list': {
    description: string;
    parameters: {
      category: {
        type: string;
        optional: boolean;
        description: string;
      };
      active: {
        type: string;
        optional: boolean;
        description: string;
      };
    };
    handler: string;
  };
  'templates.get': {
    description: string;
    parameters: {
      templateId: {
        type: string;
        required: boolean;
        description: string;
      };
    };
    handler: string;
  };
  'templates.render': {
    description: string;
    parameters: {
      templateId: {
        type: string;
        required: boolean;
        description: string;
      };
      variables: {
        type: string;
        required: boolean;
        description: string;
      };
    };
    handler: string;
  };
  'sla.check': {
    description: string;
    parameters: {
      convId: {
        type: string;
        required: boolean;
        description: string;
      };
    };
    handler: string;
  };
  'sla.list': {
    description: string;
    parameters: {
      status: {
        type: string;
        optional: boolean;
        description: string;
      };
    };
    handler: string;
  };
  'stats.overview': {
    description: string;
    parameters: {
      projectId: {
        type: string;
        optional: boolean;
        description: string;
      };
      period: {
        type: string;
        optional: boolean;
        description: string;
      };
    };
    handler: string;
  };
  'stats.sla': {
    description: string;
    parameters: {
      projectId: {
        type: string;
        optional: boolean;
        description: string;
      };
      period: {
        type: string;
        optional: boolean;
        description: string;
      };
    };
    handler: string;
  };
};
//# sourceMappingURL=manifest.d.ts.map
