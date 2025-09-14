'use client';

import { useEffect, useState } from 'react';

/**
 * Componente per gestire il recupero automatico da errori auth
 * Ascolta l'evento 'auth-recovery' e forza un re-render
 */
export default function AuthRecoveryHandler() {
  const [recoveryCount, setRecoveryCount] = useState(0);

  useEffect(() => {
    const handleAuthRecovery = () => {
      console.log('🔄 [AuthRecoveryHandler] Evento di recupero ricevuto, forzando re-render...');
      setRecoveryCount(prev => prev + 1);
      
      // Forza un re-render del componente principale
      setTimeout(() => {
        // Trigger un re-render globale
        window.dispatchEvent(new Event('resize'));
        console.log('✅ [AuthRecoveryHandler] Re-render forzato completato');
      }, 50);
    };

    // Ascolta l'evento di recupero
    window.addEventListener('auth-recovery', handleAuthRecovery);

    return () => {
      window.removeEventListener('auth-recovery', handleAuthRecovery);
    };
  }, []);

  // Questo componente non renderizza nulla visibile
  return null;
}
