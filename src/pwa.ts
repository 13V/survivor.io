/**
 * PWA + mobile polish helpers.
 *
 * Kept dependency-free and side-effect-free on import — call the exported
 * functions explicitly from the app entry point.
 */

// Vite replaces `import.meta.env.*` at build time. Typed loosely so this file
// compiles without relying on `vite/client` ambient types being present.
const ENV = (import.meta as unknown as { env?: { PROD?: boolean; DEV?: boolean } }).env;

function isProduction(): boolean {
  if (ENV && typeof ENV.PROD === 'boolean') return ENV.PROD;
  // Fallback heuristic when build-time env is unavailable: treat the usual
  // local dev hosts as non-production so we never register during `vite dev`.
  if (typeof location === 'undefined') return false;
  const host = location.hostname;
  return host !== 'localhost' && host !== '127.0.0.1' && host !== '[::1]' && host !== '';
}

/**
 * Register the service worker. No-op during development, when service workers
 * are unsupported, or on insecure origins. Never throws.
 */
export function registerSW(): void {
  try {
    if (!('serviceWorker' in navigator)) return;
    if (!isProduction()) return;
    // Service workers require a secure context (https or localhost).
    if (typeof isSecureContext !== 'undefined' && !isSecureContext) return;

    const register = (): void => {
      // Resolve relative to the document so it works under any deploy base.
      const swUrl = new URL('sw.js', document.baseURI).href;
      void navigator.serviceWorker.register(swUrl).catch(() => {
        /* best-effort: ignore registration failures */
      });
    };

    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register, { once: true });
    }
  } catch {
    /* never let PWA setup break the app */
  }
}

/**
 * Request fullscreen on the user's first interaction (tap / click / key).
 * Fullscreen can only be entered from a user gesture, so we defer to one.
 * Entirely best-effort: any failure (unsupported, denied, iOS Safari) is
 * swallowed. Safe to call multiple times — it self-removes after firing.
 */
export function enableTapFullscreen(target: HTMLElement | Document = document): void {
  try {
    const root = document.documentElement;
    // `requestFullscreen` is absent on iOS Safari; bail quietly there.
    if (typeof root.requestFullscreen !== 'function') return;

    const handler = (): void => {
      cleanup();
      if (document.fullscreenElement) return;
      try {
        const result = root.requestFullscreen({ navigationUI: 'hide' });
        if (result && typeof result.catch === 'function') {
          result.catch(() => {
            /* denied or unavailable — ignore */
          });
        }
      } catch {
        /* ignore synchronous failures */
      }
    };

    const events: Array<keyof DocumentEventMap> = ['pointerdown', 'touchend', 'keydown'];
    const cleanup = (): void => {
      for (const evt of events) target.removeEventListener(evt, handler as EventListener);
    };

    for (const evt of events) {
      target.addEventListener(evt, handler as EventListener, { once: false, passive: true });
    }
  } catch {
    /* best-effort only */
  }
}
