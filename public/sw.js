// Service Worker per Urbanova AI
// Gestisce notifiche push, cache offline e sincronizzazione in background

const CACHE_NAME = 'urbanova-v1';
const STATIC_CACHE_NAME = 'urbanova-static-v1';
const DYNAMIC_CACHE_NAME = 'urbanova-dynamic-v1';

// File da mettere in cache statica
const STATIC_FILES = ['/', '/dashboard', '/favicon.ico', '/manifest.json', '/offline.html'];

// File da mettere in cache dinamica
const DYNAMIC_FILES = ['/api/', '/dashboard/', '/static/'];

// ========================================
// INSTALLAZIONE E ATTIVAZIONE
// ========================================

self.addEventListener('install', event => {
  console.log('🚀 Service Worker installing...');

  event.waitUntil(
    Promise.all([
      // Cache statica
      caches.open(STATIC_CACHE_NAME).then(cache => {
        console.log('📦 Caching static files...');
        return cache.addAll(STATIC_FILES);
      }),

      // Cache dinamica
      caches.open(DYNAMIC_CACHE_NAME).then(cache => {
        console.log('📦 Dynamic cache ready...');
        return cache;
      }),
    ]).then(() => {
      console.log('✅ Service Worker installed successfully');
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', event => {
  console.log('🔄 Service Worker activating...');

  event.waitUntil(
    Promise.all([
      // Pulisci cache vecchie
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),

      // Prendi il controllo immediatamente
      self.clients.claim(),
    ]).then(() => {
      console.log('✅ Service Worker activated successfully');
    })
  );
});

// ========================================
// INTERCETTAZIONE RICHIESTE
// ========================================

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora richieste non GET
  if (request.method !== 'GET') {
    return;
  }

  // Gestisci richieste API
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Gestisci richieste dashboard
  if (url.pathname.startsWith('/dashboard/')) {
    event.respondWith(handleDashboardRequest(request));
    return;
  }

  // Gestisci richieste statiche
  if (isStaticFile(url.pathname)) {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Strategia di fallback per altre richieste
  event.respondWith(handleFallbackRequest(request));
});

// ========================================
// STRATEGIE DI CACHE
// ========================================

async function handleApiRequest(request) {
  try {
    // Prima prova la rete
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache la risposta per uso offline
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('🌐 Network failed, trying cache...');
  }

  // Fallback alla cache
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Fallback generico per API
  return new Response(
    JSON.stringify({
      error: 'Service unavailable offline',
      message: 'Please check your connection and try again',
    }),
    {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

async function handleDashboardRequest(request) {
  try {
    // Prima prova la rete
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache la risposta
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('🌐 Network failed, trying cache...');
  }

  // Fallback alla cache
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Fallback alla pagina offline
  return caches.match('/offline.html');
}

async function handleStaticRequest(request) {
  // Per file statici, usa sempre la cache prima
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Se non in cache, prova la rete
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Fallback generico per file statici
    return new Response('File not available offline', { status: 404 });
  }
}

async function handleFallbackRequest(request) {
  // Strategia di fallback generica
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    // Prova la cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fallback finale
    return new Response('Content not available offline', { status: 404 });
  }
}

function isStaticFile(pathname) {
  const staticExtensions = [
    '.js',
    '.css',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.ico',
    '.woff',
    '.woff2',
    '.ttf',
  ];
  return staticExtensions.some(ext => pathname.endsWith(ext));
}

// ========================================
// GESTIONE NOTIFICHE PUSH
// ========================================

self.addEventListener('push', event => {
  console.log('📱 Push notification received:', event);

  if (!event.data) {
    console.log('No data in push event');
    return;
  }

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'Nuova notifica da Urbanova AI',
      icon: data.icon || '/favicon.ico',
      badge: data.badge || '/badge.png',
      image: data.image,
      tag: data.tag || 'urbanova-notification',
      data: data.data || {},
      actions: data.actions || [],
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
      timestamp: data.timestamp || Date.now(),
      vibrate: [200, 100, 200],
      sound: data.sound || null,
    };

    event.waitUntil(self.registration.showNotification(data.title || 'Urbanova AI', options));

    // Traccia la ricezione
    trackNotificationReceived(data);
  } catch (error) {
    console.error('Error handling push notification:', error);

    // Notifica di fallback
    const fallbackOptions = {
      body: 'Nuova notifica da Urbanova AI',
      icon: '/favicon.ico',
      tag: 'urbanova-notification',
    };

    event.waitUntil(self.registration.showNotification('Urbanova AI', fallbackOptions));
  }
});

self.addEventListener('notificationclick', event => {
  console.log('👆 Notification clicked:', event);

  event.notification.close();

  if (event.action) {
    // Gestisci azioni personalizzate
    handleNotificationAction(event.action, event.notification.data);
  } else {
    // Apri l'app quando si clicca sulla notifica
    event.waitUntil(clients.openWindow('/dashboard'));
  }

  // Traccia il click
  trackNotificationClick(event);
});

self.addEventListener('notificationclose', event => {
  console.log('❌ Notification closed:', event);

  // Traccia la chiusura
  trackNotificationClose(event);
});

// ========================================
// SINCRONIZZAZIONE IN BACKGROUND
// ========================================

self.addEventListener('sync', event => {
  console.log('🔄 Background sync triggered:', event.tag);

  if (event.tag === 'background-sync') {
    event.waitUntil(performBackgroundSync());
  } else if (event.tag === 'notification-sync') {
    event.waitUntil(syncNotifications());
  }
});

async function performBackgroundSync() {
  try {
    console.log('🔄 Performing background sync...');

    // Sincronizza dati offline
    await syncOfflineData();

    // Sincronizza notifiche
    await syncNotifications();

    // Sincronizza preferenze utente
    await syncUserPreferences();

    console.log('✅ Background sync completed');
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

async function syncOfflineData() {
  // Implementa la sincronizzazione dei dati offline
  // Per ora è un placeholder
  console.log('📊 Syncing offline data...');
}

async function syncNotifications() {
  // Implementa la sincronizzazione delle notifiche
  // Per ora è un placeholder
  console.log('🔔 Syncing notifications...');
}

async function syncUserPreferences() {
  // Implementa la sincronizzazione delle preferenze utente
  // Per ora è un placeholder
  console.log('⚙️ Syncing user preferences...');
}

// ========================================
// TRACKING E ANALYTICS
// ========================================

function trackNotificationReceived(data) {
  // Invia metriche per notifiche ricevute
  sendAnalytics('notification_received', {
    title: data.title,
    type: data.type || 'unknown',
    timestamp: Date.now(),
  });
}

function trackNotificationClick(event) {
  // Invia metriche per click su notifiche
  sendAnalytics('notification_clicked', {
    action: event.action || 'default',
    data: event.notification.data,
    timestamp: Date.now(),
  });
}

function trackNotificationClose(event) {
  // Invia metriche per chiusura notifiche
  sendAnalytics('notification_closed', {
    data: event.notification.data,
    timestamp: Date.now(),
  });
}

async function sendAnalytics(event, data) {
  try {
    // Invia analytics al server
    await fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event,
        data,
        source: 'service_worker',
        timestamp: Date.now(),
      }),
    });
  } catch (error) {
    console.log('Analytics not sent (offline):', error);
  }
}

// ========================================
// GESTIONE AZIONI NOTIFICHE
// ========================================

function handleNotificationAction(action, data) {
  console.log('🎯 Handling notification action:', action, data);

  switch (action) {
    case 'view':
      // Apri la notifica specifica
      if (data.url) {
        clients.openWindow(data.url);
      }
      break;

    case 'dismiss':
      // Rimuovi la notifica
      console.log('Dismissing notification');
      break;

    case 'snooze':
      // Rimanda la notifica
      console.log('Snoozing notification');
      break;

    default:
      // Azione sconosciuta
      console.log('Unknown action:', action);
  }
}

// ========================================
// UTILITY E HELPERS
// ========================================

function log(message, data = null) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;

  if (data) {
    console.log(logMessage, data);
  } else {
    console.log(logMessage);
  }
}

// ========================================
// MESSAGGI DAL CLIENT
// ========================================

self.addEventListener('message', event => {
  console.log('📨 Message received from client:', event.data);

  const { type, data } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;

    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;

    default:
      console.log('Unknown message type:', type);
  }
});

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  console.log('🗑️ All caches cleared');
}

// ========================================
// INIZIALIZZAZIONE
// ========================================

console.log('🚀 Urbanova AI Service Worker loaded');
console.log('📱 Push notifications enabled');
console.log('💾 Offline caching enabled');
console.log('🔄 Background sync enabled');
