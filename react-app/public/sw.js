const CACHE_NAME = 'pizzaria-atlas-v4';
const urlsToCache = [
  '/',
  '/manifest.json'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  // Garante que a nova versão assuma imediatamente
  self.skipWaiting();
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
  const req = event.request;
  const url = new URL(req.url);

  // Não interceptar chamadas da API nem páginas de erro do InfinityFree
  const isApi = url.pathname.startsWith('/api/');
  const isInfinityError = url.hostname.includes('errors.infinityfree.net');
  if (isApi || isInfinityError) {
    event.respondWith(fetch(req));
    return;
  }

  // Estratégia cache-first para conteúdo estático
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req);
    })
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
  // Assume controle imediatamente das páginas abertas
  self.clients.claim();
});