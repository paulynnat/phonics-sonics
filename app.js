/* Robust audio loading:
   - Primary method: fetch audio as a blob (with timeout), createObjectURL and play.
   - Fallback: previous HEAD/canplaythrough approach if fetch fails (keeps compatibility).
   - Single retry included. Console logs added for easier debugging.
*/

const lettersData = [
  { id: "a", letter: "A", example: "apple", audio: "assets/audio/a" },
  { id: "b", letter: "B", example: "ball", audio: "assets/audio/b" },
  { id: "c", letter: "C", example: "city", audio: "assets/audio/c" },
  { id: "d", letter: "D", example: "dog", audio: "assets/audio/d" },
  { id: "e", letter: "E", example: "egg", audio: "assets/audio/e" },
  { id: "f", letter: "F", example: "fish", audio: "assets/audio/f" },
  { id: "g", letter: "G", example: "goat", audio: "assets/audio/g" },
  { id: "h", letter: "H", example: "hat", audio: "assets/audio/h" },
  { id: "i", letter: "I", example: "igloo", audio: "assets/audio/i" },
  { id: "j", letter: "J", example: "jam", audio: "assets/audio/j" },
  { id: "k", letter: "K", example: "kite", audio: "assets/audio/k" },
  { id: "l", letter: "L", example: "lion", audio: "assets/audio/l" },
  { id: "m", letter: "M", example: "moon", audio: "assets/audio/m" },
  { id: "n", letter: "N", example: "nest", audio: "assets/audio/n" },
  { id: "o", letter: "O", example: "orange", audio: "assets/audio/o" },
  { id: "p", letter: "P", example: "pen", audio: "assets/audio/p" },
  { id: "q", letter: "Q", example: "queen", audio: "assets/audio/q" },
  { id: "r", letter: "R", example: "run", audio: "assets/audio/r" },
  { id: "s", letter: "S", example: "sun", audio: "assets/audio/s" },
  { id: "t", letter: "T", example: "top", audio: "assets/audio/t" },
  { id: "u", letter: "U", example: "umbrella", audio: "assets/audio/u" },
  { id: "v", letter: "V", example: "van", audio: "assets/audio/v" },
  { id: "w", letter: "W", example: "wheel", audio: "assets/audio/w" },
  { id: "x", letter: "X", example: "x-ray", audio: "assets/audio/x" },
  { id: "y", letter: "Y", example: "yarn", audio: "assets/audio/y" },
  { id: "z", letter: "Z", example: "zebra", audio: "assets/audio/z" }
];

const container = document.getElementById('letters');
const audioEl = document.getElementById('shared-audio');
const searchInput = document.getElementById('search');

let imageManifest = {};
let lastBlobUrl = null;

// load optional manifest (non-blocking)
(async function loadManifest() {
  try {
    const res = await fetch(new URL('assets/images/letters/manifest.json', location.href).href);
    if (!res.ok) return;
    const json = await res.json();
    if (!json || typeof json !== 'object' || Array.isArray(json)) return;
    for (const [k, v] of Object.entries(json)) {
      const key = String(k).toLowerCase();
      if (/^[a-z]$/.test(key) && typeof v === 'string' && v.length) imageManifest[key] = v;
    }
    renderCards(); // re-render if manifest arrives after initial render
  } catch (e) { /* ignore */ }
})();

// --- New: fetch+blob audio loader with timeout + one retry
async function fetchAudioAsBlob(url, timeout = 4000) {
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const blob = await res.blob();
    return blob;
  } finally {
    clearTimeout(tid);
  }
}

async function loadAndPlayByFetch(url, btn, label) {
  try {
    const blob = await fetchAudioAsBlob(url);
    if (!blob) throw new Error('no-blob');
    if (lastBlobUrl) { URL.revokeObjectURL(lastBlobUrl); lastBlobUrl = null; }
    lastBlobUrl = URL.createObjectURL(blob);
    audioEl.src = lastBlobUrl;
    await audioEl.play();
    label.textContent = 'Playing';
    btn.classList.add('playing');
    audioEl.onended = () => { btn.disabled = false; label.textContent = ''; btn.classList.remove('playing'); };
    return true;
  } catch (err) {
    console.debug('fetch-based audio failed for', url, err && err.message);
    return false;
  }
}

// Fallback method: try src + canplaythrough (keeps previous behavior)
async function waitForCanPlay(url, timeout = 2500) {
  return new Promise((resolve, reject) => {
    let settled = false;
    function cleanup() {
      audioEl.removeEventListener('canplaythrough', onCan);
      audioEl.removeEventListener('error', onErr);
      clearTimeout(tid);
    }
    function onCan() { if (!settled) { settled = true; cleanup(); resolve(true); } }
    function onErr() { if (!settled) { settled = true; cleanup(); reject(new Error('error')); } }
    audioEl.addEventListener('canplaythrough', onCan);
    audioEl.addEventListener('error', onErr);
    audioEl.src = url;
    const tid = setTimeout(() => { if (!settled) { settled = true; cleanup(); reject(new Error('timeout')); } }, timeout);
  });
}

async function tryAudioWithFallback(base, btn, label) {
  const candidates = [];
  if (/\.(wav|mp3)$/i.test(base)) candidates.push(new URL(base, location.href).href);
  else {
    candidates.push(new URL(base + '.wav', location.href).href);
    candidates.push(new URL(base + '.mp3', location.href).href);
  }

  // Try fetch-first with one retry
  for (let attempt = 0; attempt < 2; attempt++) {
    for (const url of candidates) {
      const ok = await loadAndPlayByFetch(url, btn, label);
      if (ok) return url;
    }
    // small backoff
    await new Promise(r => setTimeout(r, 200));
  }

  // If fetch didn't work, fallback to canplaythrough detection
  for (const url of candidates) {
    try {
      const can = await waitForCanPlay(url, 3000);
      if (can) return url;
    } catch (e) { /* try next */ }
  }

  return null;
}

// --- UI render helpers (unchanged layout)
function createCard(item) {
  const id = String(item.id).toLowerCase();

  const card = document.createElement('article');
  card.className = 'letter-card';
  card.setAttribute('role','listitem');
  card.tabIndex = 0;
  card.dataset.letter = item.letter;

  const inner = document.createElement('div');
  inner.className = 'card-inner';

  const top = document.createElement('div');
  top.className = 'card-top';

  // LEFT
  const left = document.createElement('div');
  left.className = 'left-col';

  const leftTop = document.createElement('div');
  leftTop.className = 'left-top';

  const letterEl = document.createElement('div');
  letterEl.className = 'letter-char';
  letterEl.textContent = item.letter;

  const example = document.createElement('div');
  example.className = 'example';
  example.textContent = item.example;

  leftTop.appendChild(letterEl);
  leftTop.appendChild(example);

  const playWrap = document.createElement('div');
  playWrap.className = 'play-wrap';

  const btn = document.createElement('button');
  btn.className = 'play-btn';
  btn.type = 'button';
  btn.setAttribute('aria-label', `Play ${item.letter}`);
  btn.dataset.id = id;
  btn.textContent = '▶';

  const label = document.createElement('div');
  label.className = 'btn-label';
  label.setAttribute('aria-hidden','true');
  label.textContent = '';

  playWrap.appendChild(btn);
  playWrap.appendChild(label);

  left.appendChild(leftTop);
  left.appendChild(playWrap);

  // RIGHT: image
  const imageCol = document.createElement('div');
  imageCol.className = 'image-col';

  const imgFile = imageManifest[id] || `${id}.jpg`;
  if (imgFile) {
    const img = document.createElement('img');
    img.className = 'letter-image';
    img.src = new URL('assets/images/letters/' + imgFile, location.href).href;
    img.alt = item.example || item.letter;
    img.loading = 'lazy';
    img.onerror = () => { img.remove(); };
    imageCol.appendChild(img);
  }

  top.appendChild(left);
  top.appendChild(imageCol);

  inner.appendChild(top);
  card.appendChild(inner);

  btn.addEventListener('click', async () => {
    await handlePlay(item, btn, label);
  });
  card.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); btn.click(); }
  });

  return card;
}

function renderCards(filter = '') {
  if (!container) return;
  container.innerHTML = '';
  const q = String(filter || '').trim().toLowerCase();
  const list = lettersData.filter(l => {
    if (!q) return true;
    return l.letter.toLowerCase().includes(q) || l.example.toLowerCase().includes(q) || l.id.toLowerCase().includes(q);
  });
  if (!list.length) {
    const no = document.createElement('div'); no.className='letter-card'; no.style.textAlign='center'; no.textContent='No results'; container.appendChild(no); return;
  }
  for (const item of list) container.appendChild(createCard(item));
}

async function handlePlay(item, btn, label) {
  if (!btn || btn.disabled) return;
  btn.disabled = true;
  label.textContent = 'Loading…';

  const src = await tryAudioWithFallback(item.audio, btn, label);
  if (!src) {
    label.textContent = 'No audio';
    btn.disabled = false;
    setTimeout(() => { if (!btn.classList.contains('playing')) label.textContent = ''; }, 1200);
    return;
  }

  // If fetch method already started playback, the handlers above manage state.
  // Otherwise, ensure audio plays (some browsers require play call)
  try {
    await audioEl.play();
    label.textContent = 'Playing';
    btn.classList.add('playing');
    audioEl.onended = () => { btn.disabled = false; label.textContent = ''; btn.classList.remove('playing'); };
  } catch (playErr) {
    console.warn('Playback failed', playErr && playErr.message);
    label.textContent = 'Play failed';
    btn.disabled = false;
    setTimeout(() => label.textContent = '', 1200);
  }
}

if (searchInput) searchInput.addEventListener('input', (e) => renderCards(e.target.value));

renderCards();
