/**
 * Loads the Puter.js SDK once and resolves when puter.ai.txt2img is available.
 * @returns {Promise<typeof window.puter>}
 */
let loadPromise = null;

export function loadPuter() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Puter.js requires a browser environment'));
  }
  if (window.puter?.ai?.txt2img) {
    return Promise.resolve(window.puter);
  }
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    const onReady = () => {
      if (window.puter?.ai?.txt2img) {
        resolve(window.puter);
      } else {
        reject(new Error('Puter.js loaded but AI image API is unavailable'));
      }
    };

    const existing = document.querySelector('script[data-puter-sdk]');
    if (existing) {
      if (window.puter?.ai?.txt2img || existing.getAttribute('data-loaded') === 'true') {
        queueMicrotask(onReady);
        return;
      }
      existing.addEventListener('load', () => {
        existing.setAttribute('data-loaded', 'true');
        onReady();
      });
      existing.addEventListener('error', () => reject(new Error('Failed to load Puter.js')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.puter.com/v2/';
    script.async = true;
    script.dataset.puterSdk = 'true';
    script.onload = () => {
      script.setAttribute('data-loaded', 'true');
      onReady();
    };
    script.onerror = () => reject(new Error('Failed to load Puter.js'));
    document.body.appendChild(script);
  });

  return loadPromise;
}
