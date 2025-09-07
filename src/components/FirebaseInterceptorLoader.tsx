'use client';

import { useEffect } from 'react';

export default function FirebaseInterceptorLoader() {
  useEffect(() => {
    // Carica l'interceptor solo nel browser
    if (typeof window !== 'undefined') {
      console.log('🔥🔥🔥🔥 [MEGA-SUPER-NUCLEAR] Caricando interceptor Firebase nel browser...');
      
      // Import dinamico dell'interceptor
      import('../lib/firebaseInterceptor.js')
        .then(() => {
          console.log('✅✅✅✅ [MEGA-SUPER-NUCLEAR] Interceptor Firebase caricato con successo!');
        })
        .catch((error) => {
          console.error('❌❌❌❌ [MEGA-SUPER-NUCLEAR] Errore nel caricamento interceptor:', error);
        });
    }
  }, []);

  return null; // Questo componente non renderizza nulla
}
