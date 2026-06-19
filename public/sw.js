/*
 * Outbreak Survivors — minimal, hand-rolled service worker.
 *
 * Strategy: cache-first for same-origin GET navigations/assets, with a
 * network fallback. No precache manifest — the cache fills lazily as the
 * shell loads, so there is nothing to keep in sync with the build output.
 *
 * Safety:
 *  - Only same-origin GET requests are touched; everything else passes through.
 *  - Vite dev/HMR endpoints are never intercepted (defense in depth — the app
 *    only registers this SW in production anyway).
 *  - Only successful, basic (same-origin) responses are cached. Opaque/error
 *    responses are returned but never stored.
 *  - Old caches are pruned on activate so a version bump fully self-heals.
 */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `outbreak-survivors-${CACHE_VERSION}`;

// Request paths that must always hit the network (Vite dev server + HMR).
const BYPASS_PREFIXES = ['/@vite', '/@id', '/@fs', '/@react-refresh', '/node_modules/', '/src/'];

function shouldBypass(url) {
  if (BYPASS_PREFIXES.some((p) => url.pathname.startsWith(p))) return true;
  // Vite appends ?t=<timestamp> / ?import / ?v=<hash> for HMR + dep requests.
  if (url.searchParams.has('t') || url.searchParams.has('import')) return true;
  return false;
}

self.addEventListener('install', (event) => {
  // Activate this worker as soon as it finishes installing.
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith('outbreak-survivors-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GETs we can safely cache.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Same-origin only; never touch cross-origin (CDNs, analytics, etc.).
  if (url.origin !== self.location.origin) return;

  if (shouldBypass(url)) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      const cached = await cache.match(request);
      if (cached) {
        // Refresh in the background so the next load is up to date.
        event.waitUntil(updateCache(cache, request));
        return cached;
      }

      try {
        const response = await fetch(request);
        if (isCacheable(response)) {
          cache.put(request, response.clone());
        }
        return response;
      } catch (err) {
        // Offline and nothing cached. Fall back to the shell for navigations.
        if (request.mode === 'navigate') {
          const shell = await cache.match('./index.html');
          if (shell) return shell;
        }
        throw err;
      }
    })(),
  );
});

async function updateCache(cache, request) {
  try {
    const response = await fetch(request);
    if (isCacheable(response)) {
      await cache.put(request, response.clone());
    }
  } catch {
    // Stay on the cached copy when the network is unavailable.
  }
}

function isCacheable(response) {
  return Boolean(response) && response.ok && response.type === 'basic';
}
