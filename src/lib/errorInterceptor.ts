// Interceptor globale per gestire errori che potrebbero bloccare l'app
export function setupErrorInterceptor() {
  if (typeof window === 'undefined') return;

  // Intercetta errori JavaScript
  window.addEventListener('error', (event) => {
    const error = event.error;
    const message = error?.message || '';
    
    // Ignora errori Firebase 400 che non sono critici
    if (message.includes('firestore') || 
        message.includes('400') || 
        message.includes('Bad Request') ||
        message.includes('collection')) {
      console.warn('⚠️ [ERROR INTERCEPTOR] Firebase error ignorato (non critico):', message);
      event.preventDefault();
      return false;
    }
    
    // Ignora errori CSS che non bloccano l'app
    if (message.includes('@import rules are not allowed')) {
      console.warn('⚠️ [ERROR INTERCEPTOR] CSS import error ignorato (non critico):', message);
      event.preventDefault();
      return false;
    }
  });

  // Intercetta Promise rejection
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message = reason?.message || '';
    
    // Ignora errori Firebase 400
    if (message.includes('firestore') || 
        message.includes('400') || 
        message.includes('Bad Request')) {
      console.warn('⚠️ [ERROR INTERCEPTOR] Firebase promise rejection ignorato (non critico):', message);
      event.preventDefault();
      return false;
    }
  });

  console.log('✅ [ERROR INTERCEPTOR] Interceptor errori configurato');
}

// Funzione per testare la connessione LLM
export async function testLLMConnection(): Promise<boolean> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Test connessione LLM'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ [LLM TEST] Connessione LLM funzionante:', data.success);
      return data.success;
    } else {
      console.error('❌ [LLM TEST] Errore connessione LLM:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ [LLM TEST] Errore test LLM:', error);
    return false;
  }
}
