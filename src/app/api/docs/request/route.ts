// API Route: Document Request - Generate secure upload links

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { jwtService } from '@urbanova/agents/src/docHunter/jwt';
import { getMessageTemplate, formatMessage } from '@urbanova/agents/src/docHunter/templates';
// Define DocKind inline since zDocKind doesn't exist
const zDocKind = z.enum(['permit', 'license', 'certificate', 'approval']);

// Request schema
const zDocumentRequest = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  kind: zDocKind,
  recipientPhone: z.string().optional(),
  recipientEmail: z.string().optional(),
  vendorId: z.string().optional(),
  customExpiryHours: z.number().min(1).max(168).optional(), // Max 7 days
  projectName: z.string().optional(),
  companyName: z.string().optional(),
  particella: z.string().optional(), // For CDU
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = zDocumentRequest.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const {
      projectId,
      kind,
      recipientPhone,
      recipientEmail,
      vendorId,
      customExpiryHours,
      projectName = 'Progetto',
      companyName = 'Urbanova',
      particella = 'N/A',
    } = validation.data;

    // Generate unique document ID
    const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Generate secure upload token
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.urbanova.life';
    const uploadUrl = jwtService.generateUploadUrl(
      baseUrl,
      docId as string,
      projectId,
      kind as any,
      vendorId,
      customExpiryHours
    );

    // Get message template for this document kind
    const template = getMessageTemplate(kind as any);

    // Prepare template variables
    const templateVariables: Record<string, string> = {
      projectName: projectName as string,
      companyName: companyName as string,
      uploadUrl: uploadUrl as string,
      expiryDate: new Date(
        Date.now() + ((customExpiryHours as number) || 48) * 60 * 60 * 1000
      ).toLocaleDateString('it-IT'),
      particella: particella as string,
    };

    // Format message with template variables
    const formattedMessage = formatMessage(template, templateVariables);

    // Create response
    const response = {
      success: true,
      data: {
        docId,
        projectId,
        kind,
        uploadUrl,
        expiresAt: new Date(Date.now() + ((customExpiryHours as number) || 48) * 60 * 60 * 1000),
        message: {
          subject: template.subject,
          body: formattedMessage,
          requiredFields: template.requiredFields,
          instructions: template.instructions,
        },
        recipient: {
          phone: recipientPhone,
          email: recipientEmail,
        },
      },
    };

    // TODO: Create DocumentEntity in Firestore with status 'REQUESTED'
    // TODO: Send WhatsApp message if recipientPhone is provided
    // TODO: Send email if recipientEmail is provided

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error in document request:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to process document request',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const kind = searchParams.get('kind');

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // TODO: Fetch existing document requests for this project
    // TODO: Return list of requested documents with their status

    const response = {
      success: true,
      data: {
        projectId,
        requestedDocuments: [],
        message: 'Document requests retrieved successfully',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching document requests:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to fetch document requests',
      },
      { status: 500 }
    );
  }
}
