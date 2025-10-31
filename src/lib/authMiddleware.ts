import { NextRequest } from 'next/server';

// Lazy loader per firebase - evita TDZ
let firebaseModulePromise: Promise<typeof import('./firebase')> | null = null;
const getFirebaseAuth = async () => {
  if (!firebaseModulePromise) {
    firebaseModulePromise = import('./firebase');
  }
  const module = await firebaseModulePromise;
  return module.auth;
};

/**
 * Middleware di autenticazione per API routes
 * Verifica token Firebase e restituisce informazioni utente
 */
export interface AuthenticatedUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role?: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
}

/**
 * Verifica autenticazione da header Authorization
 */
export async function verifyAuthFromHeader(request: NextRequest): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        error: 'Token di autenticazione richiesto'
      };
    }

    const token = authHeader.split('Bearer ')[1];
    
    if (!token) {
      return {
        success: false,
        error: 'Token non valido'
      };
    }

    // Verifica il token Firebase
    let decodedToken;
    try {
      const auth = await getFirebaseAuth();
      decodedToken = await auth.verifyIdToken(token);
    } catch (error) {
      console.error('❌ [AuthMiddleware] Token Firebase non valido:', error);
      return {
        success: false,
        error: 'Token non valido o scaduto'
      };
    }

    // Verifica che il token sia valido e non scaduto
    if (!decodedToken || !decodedToken.uid) {
      return {
        success: false,
        error: 'Token non valido'
      };
    }

    // Verifica che l'utente sia abilitato
    if (decodedToken.disabled) {
      return {
        success: false,
        error: 'Account disabilitato'
      };
    }

    return {
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name,
        role: decodedToken.role || 'USER'
      }
    };

  } catch (error) {
    console.error('❌ [AuthMiddleware] Errore verifica autenticazione:', error);
    return {
      success: false,
      error: 'Errore interno del server'
    };
  }
}

/**
 * Verifica autenticazione da cookie di sessione
 */
export async function verifyAuthFromCookie(request: NextRequest): Promise<AuthResult> {
  try {
    // Per ora, implementazione semplificata
    // In futuro si può implementare con cookie di sessione Firebase
    return {
      success: false,
      error: 'Autenticazione da cookie non implementata'
    };
  } catch (error) {
    console.error('❌ [AuthMiddleware] Errore verifica cookie:', error);
    return {
      success: false,
      error: 'Errore verifica cookie'
    };
  }
}

/**
 * Verifica autenticazione da query parameter (solo per testing)
 */
export async function verifyAuthFromQuery(request: NextRequest): Promise<AuthResult> {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const testMode = searchParams.get('testMode');

    // Solo in modalità test
    if (testMode === 'true' && userId) {
      return {
        success: true,
        user: {
          uid: userId,
          email: `${userId}@test.com`,
          displayName: 'Test User',
          role: 'USER'
        }
      };
    }

    return {
      success: false,
      error: 'Modalità test non abilitata'
    };
  } catch (error) {
    console.error('❌ [AuthMiddleware] Errore verifica query:', error);
    return {
      success: false,
      error: 'Errore verifica query'
    };
  }
}

/**
 * Verifica autenticazione con fallback multipli
 */
export async function verifyAuthentication(request: NextRequest): Promise<AuthResult> {
  // 1. Prova con header Authorization (metodo principale)
  const headerAuth = await verifyAuthFromHeader(request);
  if (headerAuth.success) {
    return headerAuth;
  }

  // 2. Prova con cookie di sessione
  const cookieAuth = await verifyAuthFromCookie(request);
  if (cookieAuth.success) {
    return cookieAuth;
  }

  // 3. Prova con query parameter (solo per testing)
  const queryAuth = await verifyAuthFromQuery(request);
  if (queryAuth.success) {
    return queryAuth;
  }

  // Se tutti i metodi falliscono, restituisci il primo errore
  return headerAuth;
}

/**
 * Middleware per proteggere API routes
 */
export function withAuth(handler: (request: NextRequest, user: AuthenticatedUser) => Promise<Response>) {
  return async (request: NextRequest): Promise<Response> => {
    try {
      // Verifica autenticazione
      const authResult = await verifyAuthentication(request);
      
      if (!authResult.success || !authResult.user) {
        return new Response(
          JSON.stringify({
            success: false,
            error: authResult.error || 'Non autorizzato'
          }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }

      // Chiama l'handler con l'utente autenticato
      return await handler(request, authResult.user);

    } catch (error) {
      console.error('❌ [AuthMiddleware] Errore middleware:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Errore interno del server'
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  };
}

/**
 * Verifica se l'utente ha un ruolo specifico
 */
export function hasRole(user: AuthenticatedUser, requiredRole: string): boolean {
  const roleHierarchy = {
    'ADMIN': 4,
    'PM': 3,
    'USER': 2,
    'GUEST': 1
  };

  const userRoleLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 1;
  const requiredRoleLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 1;

  return userRoleLevel >= requiredRoleLevel;
}

/**
 * Verifica se l'utente è admin
 */
export function isAdmin(user: AuthenticatedUser): boolean {
  return hasRole(user, 'ADMIN');
}

/**
 * Verifica se l'utente è project manager o admin
 */
export function isProjectManager(user: AuthenticatedUser): boolean {
  return hasRole(user, 'PM');
}
