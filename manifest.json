const CACHE_NAME = 'uchet-sdelki-v1';
const urlsToCache = [
  '/uchet-sdelki/',
  '/uchet-sdelki/index.html',
  '/uchet-sdelki/manifest.json',
  '/uchet-sdelki/icon-192.png',
  '/uchet-sdelki/icon-512.png'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(urlsToCache)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))) .then(()=>self.clients.claim()));
});

self.addEventListener('fetch', e=>{
  if(e.request.method!=='GET') return;
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{
    if(resp && resp.status===200 && resp.type==='basic'){
      let clone=resp.clone();
      caches.open(CACHE_NAME).then(c=>c.put(e.request,clone));
    }
    return resp;
  }).catch(()=>{
    if(e.request.mode==='navigate') return caches.match('/uchet-sdelki/index.html');
  })));
});
