const CACHE_NAME = 'uchet-sdelki-v1';
const urlsToCache = [
  '/uchet-sdelki/',
  '/uchet-sdelki/index.html',
  '/uchet-sdelki/manifest.json',
  '/uchet-sdelki/icon-192.png',
  '/uchet-sdelki/icon-512.png'
];

// Установка SW и кэширование основных файлов
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Активация SW и удаление старого кэша
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.filter(k => k !== CACHE_NAME)
            .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Обработка запросов
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request).then(networkResp => {
        if (networkResp && networkResp.status === 200 && networkResp.type === 'basic') {
          const respClone = networkResp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, respClone));
        }
        return networkResp;
      }).catch(() => {
        if (e.request.mode === 'navigate') {
          return caches.match('/uchet-sdelki/index.html');
        }
      });
    })
  );
});
