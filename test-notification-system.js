/**
 * Test completo del sistema di notifiche Urbanova
 * Verifica creazione, lettura, aggiornamento e eliminazione notifiche
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3112';

// Test user ID (usa un ID reale per test completi)
const TEST_USER_ID = 'test-user-123';

console.log('🧪 [NOTIFICATION TEST] Inizio test sistema notifiche...');

// ========================================
// TEST 1: Creazione Notifiche
// ========================================

async function testCreateNotifications() {
  console.log('\n📝 Test 1: Creazione Notifiche');
  
  const notifications = [
    {
      userId: TEST_USER_ID,
      type: 'PROJECT',
      priority: 'MEDIUM',
      title: '🎉 Nuovo Progetto Creato',
      message: 'Il progetto "Test Milano" è stato creato con successo.',
      data: {
        projectId: 'test-project-1',
        projectName: 'Test Milano',
        projectType: 'Residenziale',
        action: 'project_created'
      },
      actions: [
        {
          type: 'view_project',
          label: 'Visualizza Progetto',
          url: '/dashboard/projects/test-project-1'
        }
      ]
    },
    {
      userId: TEST_USER_ID,
      type: 'SUCCESS',
      priority: 'HIGH',
      title: '📊 Analisi di Fattibilità Completata',
      message: 'L\'analisi per "Test Milano" mostra ROI 12.5% e margine 18.3%.',
      data: {
        projectId: 'test-project-1',
        projectName: 'Test Milano',
        roi: 12.5,
        margin: 18.3,
        action: 'feasibility_completed'
      },
      actions: [
        {
          type: 'view_analysis',
          label: 'Visualizza Analisi',
          url: '/dashboard/feasibility-analysis?projectId=test-project-1'
        }
      ]
    },
    {
      userId: TEST_USER_ID,
      type: 'ALERT',
      priority: 'URGENT',
      title: '⏰ Scadenza Progetto',
      message: 'Il progetto "Test Milano" scade tra 3 giorni.',
      data: {
        projectId: 'test-project-1',
        projectName: 'Test Milano',
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        daysRemaining: 3,
        action: 'project_deadline'
      },
      actions: [
        {
          type: 'view_project',
          label: 'Visualizza Progetto',
          url: '/dashboard/projects/test-project-1'
        }
      ]
    }
  ];

  const createdNotifications = [];
  
  for (const notification of notifications) {
    try {
      const response = await fetch(`${BASE_URL}/api/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notification),
      });

      if (response.ok) {
        const result = await response.json();
        createdNotifications.push(result.notification);
        console.log(`✅ Notifica creata: ${notification.title}`);
      } else {
        console.error(`❌ Errore creazione notifica: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Errore creazione notifica:`, error);
    }
  }

  return createdNotifications;
}

// ========================================
// TEST 2: Recupero Notifiche
// ========================================

async function testGetNotifications() {
  console.log('\n📖 Test 2: Recupero Notifiche');
  
  try {
    const response = await fetch(`${BASE_URL}/api/notifications?userId=${TEST_USER_ID}&limit=10`);
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Notifiche recuperate: ${result.count}`);
      console.log(`📊 Dettagli:`, result.notifications.map(n => ({
        id: n.id,
        title: n.title,
        isRead: n.isRead,
        priority: n.priority
      })));
      return result.notifications;
    } else {
      console.error(`❌ Errore recupero notifiche: ${response.status}`);
      return [];
    }
  } catch (error) {
    console.error(`❌ Errore recupero notifiche:`, error);
    return [];
  }
}

// ========================================
// TEST 3: Statistiche Notifiche
// ========================================

async function testNotificationStats() {
  console.log('\n📊 Test 3: Statistiche Notifiche');
  
  try {
    // Simula chiamata alle statistiche (dovrebbe essere implementata nell'API)
    const response = await fetch(`${BASE_URL}/api/notifications?userId=${TEST_USER_ID}&limit=50`);
    
    if (response.ok) {
      const result = await response.json();
      const notifications = result.notifications;
      
      const stats = {
        total: notifications.length,
        unread: notifications.filter(n => !n.isRead).length,
        read: notifications.filter(n => n.isRead).length,
        byType: {},
        byPriority: {}
      };
      
      // Calcola statistiche per tipo
      notifications.forEach(n => {
        stats.byType[n.type] = (stats.byType[n.type] || 0) + 1;
        stats.byPriority[n.priority] = (stats.byPriority[n.priority] || 0) + 1;
      });
      
      console.log(`✅ Statistiche calcolate:`, stats);
      return stats;
    } else {
      console.error(`❌ Errore recupero statistiche: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Errore recupero statistiche:`, error);
    return null;
  }
}

// ========================================
// TEST 4: Marcare come Letti
// ========================================

async function testMarkAsRead(notifications) {
  console.log('\n✅ Test 4: Marcare come Letti');
  
  if (notifications.length === 0) {
    console.log('⚠️ Nessuna notifica da marcare come letta');
    return;
  }

  const notificationToMark = notifications[0];
  
  try {
    const response = await fetch(`${BASE_URL}/api/notifications/${notificationToMark.id}?action=read`, {
      method: 'PUT',
    });

    if (response.ok) {
      console.log(`✅ Notifica marcata come letta: ${notificationToMark.title}`);
    } else {
      console.error(`❌ Errore marcatura come letta: ${response.status}`);
    }
  } catch (error) {
    console.error(`❌ Errore marcatura come letta:`, error);
  }
}

// ========================================
// TEST 5: Eliminazione Notifiche
// ========================================

async function testDeleteNotification(notifications) {
  console.log('\n🗑️ Test 5: Eliminazione Notifiche');
  
  if (notifications.length === 0) {
    console.log('⚠️ Nessuna notifica da eliminare');
    return;
  }

  const notificationToDelete = notifications[notifications.length - 1];
  
  try {
    const response = await fetch(`${BASE_URL}/api/notifications/${notificationToDelete.id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      console.log(`✅ Notifica eliminata: ${notificationToDelete.title}`);
    } else {
      console.error(`❌ Errore eliminazione: ${response.status}`);
    }
  } catch (error) {
    console.error(`❌ Errore eliminazione:`, error);
  }
}

// ========================================
// TEST 6: Notifiche Bulk
// ========================================

async function testBulkOperations() {
  console.log('\n🔄 Test 6: Operazioni Bulk');
  
  try {
    // Test marca tutte come lette
    const response = await fetch(`${BASE_URL}/api/notifications/bulk?action=read-all&userId=${TEST_USER_ID}`, {
      method: 'PUT',
    });

    if (response.ok) {
      console.log(`✅ Tutte le notifiche marcate come lette`);
    } else {
      console.error(`❌ Errore operazione bulk: ${response.status}`);
    }
  } catch (error) {
    console.error(`❌ Errore operazione bulk:`, error);
  }
}

// ========================================
// TEST 7: Generazione Notifiche di Test
// ========================================

async function testGenerateTestNotifications() {
  console.log('\n🧪 Test 7: Generazione Notifiche di Test');
  
  try {
    const response = await fetch(`${BASE_URL}/api/notifications/bulk?action=test&userId=${TEST_USER_ID}`, {
      method: 'POST',
    });

    if (response.ok) {
      console.log(`✅ Notifiche di test generate`);
    } else {
      console.error(`❌ Errore generazione test: ${response.status}`);
    }
  } catch (error) {
    console.error(`❌ Errore generazione test:`, error);
  }
}

// ========================================
// ESECUZIONE TEST COMPLETI
// ========================================

async function runAllTests() {
  console.log('🚀 [NOTIFICATION TEST] Inizio test completi...\n');
  
  try {
    // Test 1: Creazione
    const createdNotifications = await testCreateNotifications();
    
    // Test 2: Recupero
    const notifications = await testGetNotifications();
    
    // Test 3: Statistiche
    const stats = await testNotificationStats();
    
    // Test 4: Marcare come letti
    await testMarkAsRead(notifications);
    
    // Test 5: Eliminazione
    await testDeleteNotification(notifications);
    
    // Test 6: Operazioni bulk
    await testBulkOperations();
    
    // Test 7: Generazione test
    await testGenerateTestNotifications();
    
    console.log('\n🎉 [NOTIFICATION TEST] Tutti i test completati!');
    
    // Riepilogo finale
    console.log('\n📋 Riepilogo Test:');
    console.log(`✅ Notifiche create: ${createdNotifications.length}`);
    console.log(`✅ Notifiche recuperate: ${notifications.length}`);
    console.log(`✅ Statistiche: ${stats ? 'OK' : 'ERRORE'}`);
    
  } catch (error) {
    console.error('❌ [NOTIFICATION TEST] Errore durante i test:', error);
  }
}

// Esegui i test
runAllTests();
