// Service Worker pour Vibecode PWA
const CACHE_NAME = 'vibecode-v1';
const STATIC_CACHE = 'vibecode-static-v1';
const DYNAMIC_CACHE = 'vibecode-dynamic-v1';

// Ressources à mettre en cache immédiatement
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/playgrounds',
  '/manifest.json',
  '/logo.svg',
  '/globals.css'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installation');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Service Worker: Mise en cache des ressources statiques');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Activation');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Service Worker: Suppression ancien cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Stratégie de mise en cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorer les requêtes non-HTTP
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Ignorer les WebSockets et les requêtes API en temps réel
  if (url.pathname.includes('/api/chat/stream') || 
      url.pathname.includes('/api/ws') ||
      request.headers.get('upgrade') === 'websocket') {
    return;
  }
  
  // Stratégie Cache First pour les ressources statiques
  if (request.destination === 'style' || 
      request.destination === 'script' || 
      request.destination === 'image' ||
      url.pathname.includes('/logo.svg') ||
      url.pathname.includes('.svg') ||
      url.pathname.includes('.css')) {
    
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          
          return fetch(request)
            .then((fetchResponse) => {
              const responseClone = fetchResponse.clone();
              
              caches.open(STATIC_CACHE)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
              
              return fetchResponse;
            });
        })
        .catch(() => {
          // Fallback pour les images
          if (request.destination === 'image') {
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f3f4f6"/><text x="100" y="100" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="14" fill="#6b7280">Image non disponible</text></svg>',
              { headers: { 'Content-Type': 'image/svg+xml' } }
            );
          }
        })
    );
    return;
  }
  
  // Stratégie Network First pour les pages et API
  if (request.mode === 'navigate' || 
      url.pathname.startsWith('/api/') ||
      url.pathname.startsWith('/dashboard') ||
      url.pathname.startsWith('/playground')) {
    
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Mettre en cache les pages réussies
          if (response.status === 200 && request.mode === 'navigate') {
            const responseClone = response.clone();
            
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          
          return response;
        })
        .catch(() => {
          // Fallback vers le cache pour les pages
          if (request.mode === 'navigate') {
            return caches.match(request)
              .then((response) => {
                if (response) {
                  return response;
                }
                
                // Page offline par défaut
                return caches.match('/')
                  .then((homeResponse) => {
                    if (homeResponse) {
                      return homeResponse;
                    }
                    
                    // Réponse offline minimale
                    return new Response(
                      `<!DOCTYPE html>
                      <html>
                      <head>
                        <title>Vibecode - Hors ligne</title>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1">
                        <style>
                          body { font-family: system-ui, sans-serif; text-align: center; padding: 2rem; background: #0a0a0a; color: #fff; }
                          .offline { max-width: 400px; margin: 0 auto; }
                          .logo { width: 64px; height: 64px; margin: 0 auto 1rem; }
                        </style>
                      </head>
                      <body>
                        <div class="offline">
                          <div class="logo">🌐</div>
                          <h1>Vous êtes hors ligne</h1>
                          <p>Vibecode nécessite une connexion internet pour fonctionner correctement.</p>
                          <p>Veuillez vérifier votre connexion et réessayer.</p>
                          <button onclick="window.location.reload()">Réessayer</button>
                        </div>
                      </body>
                      </html>`,
                      {
                        headers: {
                          'Content-Type': 'text/html',
                          'Cache-Control': 'no-cache'
                        }
                      }
                    );
                  });
              });
          }
          
          // Pour les API, retourner une erreur JSON
          if (url.pathname.startsWith('/api/')) {
            return new Response(
              JSON.stringify({
                error: 'Service non disponible hors ligne',
                offline: true
              }),
              {
                status: 503,
                headers: {
                  'Content-Type': 'application/json'
                }
              }
            );
          }
        })
    );
    return;
  }
  
  // Pour toutes les autres requêtes, laisser passer
  event.respondWith(fetch(request));
});

// Gestion des messages du client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});

// Synchronisation en arrière-plan
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Service Worker: Synchronisation en arrière-plan');
    // Ici on pourrait synchroniser les données offline
  }
});

// Notifications push (pour les futures fonctionnalités)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Nouvelle notification de Vibecode',
      icon: '/logo.svg',
      badge: '/logo.svg',
      tag: 'vibecode-notification',
      requireInteraction: false,
      actions: [
        {
          action: 'open',
          title: 'Ouvrir Vibecode'
        },
        {
          action: 'close',
          title: 'Fermer'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Vibecode', options)
    );
  }
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});