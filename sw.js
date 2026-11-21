const CACHE = 'calendriers-v2';
const AUDIO_CACHE = 'coran-audio-v1';          // même nom que dans coran-audio.html
const AUDIO_HOST = 'cdn.islamic.network';
const AUDIO_MAX = 1500;                         // versets gardés au maximum (les plus anciens sont supprimés)
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png',
               './coran-audio.html', './manifest-coran.json', './menu.js'];

self.addEventListener('install', e => {
  // addAll échoue si un seul fichier manque : on ajoute chaque fichier séparément
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(FILES.map(f => c.add(f).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== AUDIO_CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Le lecteur audio demande des morceaux (Range) : on les découpe depuis le fichier complet en cache
async function rangeResponse(req, res) {
  const range = req.headers.get('range');
  if (!range) return res;
  const m = /bytes=(\d*)-(\d*)/.exec(range);
  if (!m) return res;
  const blob = await res.blob();
  const size = blob.size;
  let start = m[1] === '' ? Math.max(0, size - parseInt(m[2], 10)) : parseInt(m[1], 10);
  let end = m[1] === '' || m[2] === '' ? size - 1 : Math.min(parseInt(m[2], 10), size - 1);
  if (start >= size || start > end) {
    return new Response(null, { status: 416, headers: { 'Content-Range': 'bytes */' + size } });
  }
  return new Response(blob.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': res.headers.get('Content-Type') || 'audio/mpeg',
      'Content-Range': 'bytes ' + start + '-' + end + '/' + size,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes'
    }
  });
}

async function trimAudio(cache) {
  const keys = await cache.keys();
  if (keys.length > AUDIO_MAX) {
    await Promise.all(keys.slice(0, keys.length - AUDIO_MAX).map(k => cache.delete(k)));
  }
}

async function audioFetch(req) {
  const cache = await caches.open(AUDIO_CACHE);
  const key = req.url;
  const hit = await cache.match(key);
  if (hit) return rangeResponse(req, hit);
  try {
    // requête complète (sans Range) en mode CORS pour pouvoir la mettre en cache
    const res = await fetch(key, { mode: 'cors' });
    if (res.ok && res.status === 200) {
      await cache.put(key, res.clone());
      trimAudio(cache);
      return rangeResponse(req, res);
    }
  } catch (err) { /* repli ci-dessous */ }
  return fetch(req); // repli : requête d'origine, sans cache
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Récitation du Coran : cache d'abord, puis réseau
  if (url.hostname === AUDIO_HOST && url.pathname.endsWith('.mp3')) {
    e.respondWith(audioFetch(req));
    return;
  }

  if (url.origin !== location.origin) return; // API Coran : gérée par la page
  e.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});

