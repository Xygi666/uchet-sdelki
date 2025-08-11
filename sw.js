const CACHE_NAME = 'uchet-sdelki-cache-v1';
const urlsToCache = [
  '/',
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
];

// При установке Service Worker кэшируем необходимые файлы
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()) // Активировать SW сразу после установки
  );
});

// При активации — удаляем старые кэши, если они есть
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// Перехватываем запросы и пытаемся отдавать из кэша, иначе — из сети
self.addEventListener('fetch', event => {
  // Обрабатываем только GET-запросы
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        // Если нашли в кэше — отдаем кэш
        return response;
      }
      // Иначе — делаем сетевой запрос, и кэшируем ответ для будущего
      return fetch(event.request).then(networkResponse => {
        // Проверяем, что правильный ответ и типа basic (чтоб не кэшировать чужие вещи)
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // Клонируем ответ, т.к. поток можно прочитать только один раз
        let responseToCache = networkResponse.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    }).catch(() => {
      // В оффлайн-режиме попробуем вернуть index.html для навигации (копия из кэша)
      if (event.request.mode === 'navigate') {
        return caches.match('index.html');
      }
    })
  );
});
