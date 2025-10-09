const CACHE_NAME = 'pizzaria-atlas-v3';
const urlsToCache = [
  '/',
  '/manifest.json'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache).catch((error) => {
          console.error('Erro ao adicionar URLs ao cache:', error);
          // Tenta adicionar URLs individualmente
          return Promise.allSettled(
            urlsToCache.map(url => 
              cache.add(url).catch(err => console.warn(`Falha ao cachear ${url}:`, err))
            )
          );
        });
      })
  );
});

// Buscar recursos
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - retorna a resposta
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});