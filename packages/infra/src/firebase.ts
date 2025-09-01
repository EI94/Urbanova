import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore, Firestore, FieldValue } from 'firebase-admin/firestore';

let app: App | undefined;
let firestore: Firestore | undefined;

/**
 * Initialize Firebase Admin SDK
 */
export function initializeFirebase(): App {
  if (app) {
    return app;
  }

  // Check if Firebase is already initialized
  const existingApps = getApps();
  if (existingApps.length > 0) {
    app = existingApps[0];
    return app!;
  }

  // Initialize Firebase Admin
  const projectId = process.env.GCP_PROJECT_ID;
  const clientEmail = process.env.GCP_CLIENT_EMAIL;
  const privateKey = process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('⚠️ Firebase Admin credentials not configured, using mock mode');
    // In development, we can use a mock configuration
    app = initializeApp({
      projectId: 'urbanova-b623e',
    });
    return app!;
  }

  app = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    projectId,
  });

  return app!;
}

/**
 * Get Firestore instance
 */
export function getFirestoreInstance(): Firestore {
  if (!firestore) {
    initializeFirebase();
    firestore = getFirestore();
  }
  return firestore;
}

/**
 * Get server timestamp
 */
export function serverTimestamp(): FieldValue {
  return FieldValue.serverTimestamp();
}
