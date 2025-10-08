#!/usr/bin/env node

/**
 * 🧹 Script per pulire notifiche benvenuto duplicate
 * Per l'utente pierpaolo.laurito@gmail.com
 */

const BASE_URL = 'http://localhost:3112';

async function cleanupWelcomeNotifications() {
  console.log('🧹 Pulizia notifiche benvenuto duplicate...');
  
  try {
    // Prima testa l'endpoint pubblico
    const response = await fetch(`${BASE_URL}/api/notifications/cleanup-welcome`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token-for-testing'
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Pulizia completata:', data.message);
    } else {
      console.log('⚠️ Errore pulizia:', data.error);
      console.log('💡 Per pulire le notifiche duplicate:');
      console.log('   1. Vai al dashboard');
      console.log('   2. Apri il pannello notifiche');
      console.log('   3. Elimina manualmente le notifiche duplicate');
    }
    
  } catch (error) {
    console.error('❌ Errore:', error.message);
  }
}

if (require.main === module) {
  cleanupWelcomeNotifications();
}

module.exports = { cleanupWelcomeNotifications };
