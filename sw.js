const CACHE_PREFIX = 'language-practice-';
const SHELL_CACHE = `${CACHE_PREFIX}shell-v2`;
const RUNTIME_CACHE = `${CACHE_PREFIX}runtime-v1`;
const APP_ROOT = new URL('./', self.registration.scope);
const APP_SHELL = [
  APP_ROOT.href,
  new URL('index.html', APP_ROOT).href,
  new URL('manifest.webmanifest', APP_ROOT).href,
  new URL('pwa-icon-192.png', APP_ROOT).href,
  new URL('pwa-icon-512.png', APP_ROOT).href,
  new URL('predefined_phrases/index.json', APP_ROOT).href,
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith(CACHE_PREFIX) && key !== SHELL_CACHE && key !== RUNTIME_CACHE)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const requestUrl = new URL(request.url);
  if (request.method !== 'GET' || requestUrl.origin !== self.location.origin) return;

  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response.ok && (response.type === 'basic' || response.type === 'default')) {
        const cache = await caches.open(RUNTIME_CACHE);
        await cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) return cachedResponse;

      if (request.mode === 'navigate') {
        const appShell = await caches.match(new URL('index.html', APP_ROOT).href);
        if (appShell) return appShell;
      }
      throw error;
    }
  })());
});
