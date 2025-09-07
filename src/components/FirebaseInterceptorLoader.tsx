'use client';

import { useEffect } from 'react';

export default function FirebaseInterceptorLoader() {
  useEffect(() => {
    // Carica gli interceptor solo nel browser
    if (typeof window !== 'undefined') {
      console.log('🔥🔥🔥🔥🔥 [ULTRA-NUCLEAR] Caricando polyfill e interceptor Firebase nel browser...');
      
      // Prima carica il polyfill ultra-nucleare
      import('../lib/firebaseCollectionPolyfill.js')
        .then(() => {
          console.log('✅✅✅✅✅ [ULTRA-NUCLEAR] Polyfill Firebase caricato con successo!');
          
          // Poi carica l'interceptor mega-super-nucleare
          return import('../lib/firebaseInterceptor.js');
        })
        .then(() => {
          console.log('✅✅✅✅ [MEGA-SUPER-NUCLEAR] Interceptor Firebase caricato con successo!');
        })
        .catch((error) => {
          console.error('❌❌❌❌❌ [ULTRA-NUCLEAR] Errore nel caricamento polyfill/interceptor:', error);
        });
    }
  }, []);

  return null; // Questo componente non renderizza nulla
}
