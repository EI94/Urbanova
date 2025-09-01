// SAL (Subcontractor Agreement Letter) Types - Urbanova AI
import { z } from 'zod';

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Stati del SAL (Finite State Machine)
 */
export type SALStatus =
  | 'DRAFT' // Bozza creata dal PM
  | 'SENT' // SAL inviato al vendor
  | 'SIGNED_VENDOR' // Firma del vendor completata
  | 'SIGNED_PM' // Firma del PM completata
  | 'READY_TO_PAY' // Pronto per il pagamento
  | 'PAID'; // Pagamento completato

/**
 * Linea del SAL - Specifica tecnica e costi
 */
interface SALLine {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  category: 'MATERIALS' | 'LABOR' | 'EQUIPMENT' | 'SERVICES';
  specifications?: string;
  deliveryDate?: Date;
}

/**
 * Firma digitale (pseudo-firma)
 */
interface SALSignature {
  id: string;
  signerId: string;
  signerName: string;
  signerRole: 'PM' | 'VENDOR';
  signedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  signatureHash: string; // Hash della firma per verifica
}

/**
 * Dettagli del pagamento
 */
interface SALPayment {
  id: string;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  receiptUrl?: string;
  paidAt?: Date;
  failureReason?: string;
  metadata: Record<string, string>;
}

/**
 * SAL principale
 */
interface SAL {
  id: string;
  projectId: string;
  vendorId: string;
  vendorName: string;
  vendorEmail: string;

  // Dettagli del contratto
  title: string;
  description: string;
  totalAmount: number;
  currency: string;

  // Stato e workflow
  status: SALStatus;
  currentStep: number;
  totalSteps: number;

  // Date importanti
  createdAt: Date;
  sentAt?: Date;
  vendorSignedAt?: Date;
  pmSignedAt?: Date;
  readyToPayAt?: Date;
  paidAt?: Date;

  // Contenuto
  lines: SALLine[];
  terms: string;
  conditions: string[];

  // Firme
  signatures: SALSignature[];

  // Pagamento
  payment?: SALPayment;

  // Metadati
  metadata: Record<string, any>;
  tags: string[];
}

/**
 * Creazione di un nuovo SAL
 */
interface SALCreateRequest {
  projectId: string;
  vendorId: string;
  title: string;
  description: string;
  lines: Omit<SALLine, 'id'>[];
  terms: string;
  conditions: string[];
  metadata?: Record<string, any>;
}

/**
 * Invio del SAL al vendor
 */
interface SALSendRequest {
  salId: string;
  vendorEmail: string;
  message?: string;
}

/**
 * Firma del SAL
 */
interface SALSignRequest {
  salId: string;
  signerId: string;
  signerName: string;
  signerRole: 'PM' | 'VENDOR';
  signatureHash: string;
}

/**
 * Pagamento del SAL
 */
interface SALPayRequest {
  salId: string;
  paymentMethodId?: string;
}

/**
 * Risultato delle operazioni SAL
 */
interface SALResult {
  success: boolean;
  sal?: SAL;
  message: string;
  errors?: string[];
  nextAction?: string;
}

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

/**
 * Schema Zod per SALLine
 */
const zSALLine = z.object({
  id: z.string(),
  description: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  unitPrice: z.number().positive(),
  totalPrice: z.number().positive(),
  category: z.enum(['MATERIALS', 'LABOR', 'EQUIPMENT', 'SERVICES']),
  specifications: z.string().optional(),
  deliveryDate: z.date().optional(),
});

/**
 * Schema Zod per SALSignature
 */
const zSALSignature = z.object({
  id: z.string(),
  signerId: z.string(),
  signerName: z.string().min(1),
  signerRole: z.enum(['PM', 'VENDOR']),
  signedAt: z.date(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  signatureHash: z.string().min(1),
});

/**
 * Schema Zod per SALPayment
 */
const zSALPayment = z.object({
  id: z.string(),
  stripePaymentIntentId: z.string(),
  amount: z.number().positive(),
  currency: z.string().length(3),
  status: z.enum(['pending', 'succeeded', 'failed', 'canceled']),
  receiptUrl: z.string().url().optional(),
  paidAt: z.date().optional(),
  failureReason: z.string().optional(),
  metadata: z.record(z.string()),
});

/**
 * Schema Zod per SAL
 */
const zSAL = z.object({
  id: z.string(),
  projectId: z.string(),
  vendorId: z.string(),
  vendorName: z.string().min(1),
  vendorEmail: z.string().email(),
  title: z.string().min(1),
  description: z.string().min(1),
  totalAmount: z.number().positive(),
  currency: z.string().length(3),
  status: z.enum(['DRAFT', 'SENT', 'SIGNED_VENDOR', 'SIGNED_PM', 'READY_TO_PAY', 'PAID']),
  currentStep: z.number().min(1),
  totalSteps: z.number().min(1),
  createdAt: z.date(),
  sentAt: z.date().optional(),
  vendorSignedAt: z.date().optional(),
  pmSignedAt: z.date().optional(),
  readyToPayAt: z.date().optional(),
  paidAt: z.date().optional(),
  lines: z.array(zSALLine),
  terms: z.string(),
  conditions: z.array(z.string()),
  signatures: z.array(zSALSignature),
  payment: zSALPayment.optional(),
  metadata: z.record(z.any()),
  tags: z.array(z.string()),
});

/**
 * Schema Zod per SALCreateRequest
 */
const zSALCreateRequest = z.object({
  projectId: z.string(),
  vendorId: z.string(),
  title: z.string().min(1),
  description: z.string().min(1),
  lines: z.array(zSALLine.omit({ id: true })),
  terms: z.string(),
  conditions: z.array(z.string()),
  metadata: z.record(z.any()).optional(),
});

/**
 * Schema Zod per SALSendRequest
 */
const zSALSendRequest = z.object({
  salId: z.string(),
  vendorEmail: z.string().email(),
  message: z.string().optional(),
});

/**
 * Schema Zod per SALSignRequest
 */
const zSALSignRequest = z.object({
  salId: z.string(),
  signerId: z.string(),
  signerName: z.string().min(1),
  signerRole: z.enum(['PM', 'VENDOR']),
  signatureHash: z.string().min(1),
});

/**
 * Schema Zod per SALPayRequest
 */
const zSALPayRequest = z.object({
  salId: z.string(),
  paymentMethodId: z.string().optional(),
});

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  SAL,
  SALLine,
  SALSignature,
  SALPayment,
  SALCreateRequest,
  SALSendRequest,
  SALSignRequest,
  SALPayRequest,
  SALResult,
};

export {
  zSAL,
  zSALLine,
  zSALSignature,
  zSALPayment,
  zSALCreateRequest,
  zSALSendRequest,
  zSALSignRequest,
  zSALPayRequest,
};
