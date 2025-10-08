/**
 * Test completo del sistema di preferenze notifiche
 * Verifica API, servizi e integrazione completa
 */

const BASE_URL = 'http://localhost:3112';

// Simula token di autenticazione (sostituisci con un token reale per i test)
const AUTH_TOKEN = 'your-firebase-id-token-here';

/**
 * Test API preferenze notifiche
 */
async function testNotificationPreferencesAPI() {
  console.log('\n🧪 [TEST] Test API Preferenze Notifiche');
  
  try {
    // Test GET - Recupera preferenze
    console.log('📋 Test GET /api/notifications/preferences');
    const getResponse = await fetch(`${BASE_URL}/api/notifications/preferences`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });

    if (!getResponse.ok) {
      throw new Error(`GET failed: ${getResponse.status} ${getResponse.statusText}`);
    }

    const getData = await getResponse.json();
    console.log('✅ GET Success:', {
      success: getData.success,
      hasPreferences: !!getData.preferences,
      userId: getData.preferences?.userId,
      globalEnabled: getData.preferences?.global?.enabled
    });

    // Test PUT - Aggiorna preferenze
    console.log('\n📝 Test PUT /api/notifications/preferences');
    const testPreferences = {
      global: {
        enabled: true,
        quiet_hours: {
          enabled: true,
          start_time: "23:00",
          end_time: "07:00",
          timezone: "Europe/Rome"
        },
        digest_mode: {
          enabled: false,
          frequency: 'daily',
          summary_types: ['SYSTEM']
        }
      },
      types: {
        PROJECT: {
          enabled: true,
          channels: { in_app: true, push: false, email: false },
          priority_threshold: 'HIGH'
        },
        FEASIBILITY: {
          enabled: false,
          channels: { in_app: false, push: false, email: false },
          priority_threshold: 'MEDIUM'
        }
      },
      channels: {
        in_app: {
          enabled: true,
          sound: false,
          vibration: true
        },
        push: {
          enabled: false,
          sound: false,
          badge: false,
          critical_alerts: true
        },
        email: {
          enabled: false,
          frequency: 'daily',
          include_summary: false
        }
      }
    };

    const putResponse = await fetch(`${BASE_URL}/api/notifications/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: JSON.stringify({ preferences: testPreferences })
    });

    if (!putResponse.ok) {
      throw new Error(`PUT failed: ${putResponse.status} ${putResponse.statusText}`);
    }

    const putData = await putResponse.json();
    console.log('✅ PUT Success:', {
      success: putData.success,
      hasUpdatedPreferences: !!putData.preferences
    });

    // Test POST - Reset preferenze
    console.log('\n🔄 Test POST /api/notifications/preferences (reset)');
    const resetResponse = await fetch(`${BASE_URL}/api/notifications/preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: JSON.stringify({ action: 'reset' })
    });

    if (!resetResponse.ok) {
      throw new Error(`POST failed: ${resetResponse.status} ${resetResponse.statusText}`);
    }

    const resetData = await resetResponse.json();
    console.log('✅ POST Success:', {
      success: resetData.success,
      message: resetData.message,
      hasResetPreferences: !!resetData.preferences
    });

    return true;

  } catch (error) {
    console.error('❌ [TEST] Errore API preferenze:', error);
    return false;
  }
}

/**
 * Test integrazione notifiche con preferenze
 */
async function testNotificationWithPreferences() {
  console.log('\n🧪 [TEST] Test Integrazione Notifiche con Preferenze');
  
  try {
    // Prima crea una notifica che dovrebbe essere bloccata
    console.log('🚫 Test notifica bloccata (tipo FEASIBILITY disabilitato)');
    const blockedNotificationResponse = await fetch(`${BASE_URL}/api/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: JSON.stringify({
        type: 'FEASIBILITY',
        priority: 'MEDIUM',
        title: 'Test Notifica Bloccata',
        message: 'Questa notifica dovrebbe essere bloccata dalle preferenze'
      })
    });

    const blockedData = await blockedNotificationResponse.json();
    console.log('📊 Risultato notifica bloccata:', {
      success: blockedData.success,
      notificationId: blockedData.notification?.id || 'Nessuna notifica creata (bloccata dalle preferenze)'
    });

    // Poi crea una notifica che dovrebbe passare
    console.log('\n✅ Test notifica permessa (tipo PROJECT abilitato)');
    const allowedNotificationResponse = await fetch(`${BASE_URL}/api/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: JSON.stringify({
        type: 'PROJECT',
        priority: 'HIGH',
        title: 'Test Notifica Permessa',
        message: 'Questa notifica dovrebbe passare le preferenze'
      })
    });

    const allowedData = await allowedNotificationResponse.json();
    console.log('📊 Risultato notifica permessa:', {
      success: allowedData.success,
      notificationId: allowedData.notification?.id || 'Nessuna notifica creata'
    });

    return true;

  } catch (error) {
    console.error('❌ [TEST] Errore integrazione notifiche:', error);
    return false;
  }
}

/**
 * Test API push notifications
 */
async function testPushNotificationAPI() {
  console.log('\n🧪 [TEST] Test API Push Notifications');
  
  try {
    const testToken = 'test-fcm-token-12345';
    
    // Test registrazione token
    console.log('📱 Test registrazione token FCM');
    const registerResponse = await fetch(`${BASE_URL}/api/notifications/push/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: JSON.stringify({
        token: testToken,
        deviceType: 'web',
        deviceInfo: {
          userAgent: 'Test Browser',
          platform: 'Test Platform',
          language: 'it-IT'
        }
      })
    });

    if (!registerResponse.ok) {
      throw new Error(`Register failed: ${registerResponse.status} ${registerResponse.statusText}`);
    }

    const registerData = await registerResponse.json();
    console.log('✅ Token registrato:', {
      success: registerData.success,
      message: registerData.message
    });

    // Test rimozione token
    console.log('\n🗑️ Test rimozione token FCM');
    const unregisterResponse = await fetch(`${BASE_URL}/api/notifications/push/unregister`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: JSON.stringify({
        token: testToken
      })
    });

    if (!unregisterResponse.ok) {
      throw new Error(`Unregister failed: ${unregisterResponse.status} ${unregisterResponse.statusText}`);
    }

    const unregisterData = await unregisterResponse.json();
    console.log('✅ Token rimosso:', {
      success: unregisterData.success,
      message: unregisterData.message
    });

    return true;

  } catch (error) {
    console.error('❌ [TEST] Errore API push notifications:', error);
    return false;
  }
}

/**
 * Test completo del sistema
 */
async function runCompleteTest() {
  console.log('🚀 [TEST] Avvio test completo sistema preferenze notifiche');
  console.log('=' .repeat(80));

  const results = {
    preferencesAPI: false,
    notificationIntegration: false,
    pushAPI: false
  };

  // Test API preferenze
  results.preferencesAPI = await testNotificationPreferencesAPI();
  
  // Test integrazione notifiche
  results.notificationIntegration = await testNotificationWithPreferences();
  
  // Test API push
  results.pushAPI = await testPushNotificationAPI();

  // Risultati finali
  console.log('\n' + '=' .repeat(80));
  console.log('📊 [RISULTATI FINALI]');
  console.log('=' .repeat(80));
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASS' : 'FAIL'}`);
  });

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  
  console.log(`\n📈 Totale: ${passedTests}/${totalTests} test passati`);
  
  if (passedTests === totalTests) {
    console.log('🎉 Tutti i test sono passati! Sistema preferenze notifiche funzionante.');
  } else {
    console.log('⚠️ Alcuni test sono falliti. Controlla i log per i dettagli.');
  }

  return results;
}

// Esegui i test se il file viene eseguito direttamente
if (require.main === module) {
  runCompleteTest().catch(console.error);
}

module.exports = {
  testNotificationPreferencesAPI,
  testNotificationWithPreferences,
  testPushNotificationAPI,
  runCompleteTest
};
