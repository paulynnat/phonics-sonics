/* Kid-friendly phonics UI (JPG images + WAV/MP3 audio).
   - Optional manifest at assets/images/letters/manifest.json (keys a..z -> filename.jpg).
   - Fallback: assets/images/letters/{id}.jpg
   - Audio: assets/audio/{id}.wav then .mp3
   - Updated: small audio retry (1 retry with short backoff).
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
    console.info('Image manifest loaded:', Object.keys(imageManifest).length, 'entries');
    renderCards(); // re-render if manifest arrives after initial render
  } catch (e) {
    // ignore manifest problems; fallback is id.jpg
  }
})();

// Try audio candidates: base.wav then base.mp3.
// Implements one retry attempt with short backoff to avoid transient timeouts.
// Returns absolute URL or null.
async function tryAudio(base) {
  const attempts = 2; // initial attempt + one retry
  const backoffMs = 200;
  const makeCandidates = (b) => {
    const list = [];
    if (/\.(wav|mp3)$/i.test(b)) list.push(new URL(b, location.href).href);
    else { list.push(new URL(b + '.wav', location.href).href); list.push(new URL(b + '.mp3', location.href).href); }
    return list;
  };

  const candidates = makeCandidates(base);

  for (let attempt = 0; attempt < attempts; attempt++) {
    for (const url of candidates) {
      try {
        audioEl.src = url;
        // wait briefly for canplaythrough or error
        await new Promise((resolve, reject) => {
          function onCan() { cleanup(); resolve(true); }
          function onErr() { cleanup(); reject(new Error('error')); }
          function cleanup() {
            audioEl.removeEventListener('canplaythrough', onCan);
            audioEl.removeEventListener('error', onErr);
          }
          audioEl.addEventListener('canplaythrough', onCan);
          audioEl.addEventListener('error', onErr);
          setTimeout(() => { cleanup(); reject(new Error('timeout')); }, 1200);
        });
        return url;
      } catch (e) {
        console.debug('Audio candidate failed:', url, e && e.message);
        // try next candidate
      }
    }
    // if not found and we'll retry, wait before next attempt
    if (attempt < attempts - 1) {
      await new Promise(r => setTimeout(r, backoffMs));
    }
  }
  return null; // no audio found after retries
}

function createCard(item) {
  const id = String(item.id).toLowerCase();

  const card = document.createElement('article');
  card.className = 'letter-card';
  card.setAttribute('role','listitem');
  card.setAttribute('tabindex','0');
  card.dataset.letter = item.letter;

  const inner = document.createElement('div');
  inner.className = 'card-inner';

  const top = document.createElement('div');
  top.className = 'card-top';

  // LEFT: letter + word (side-by-side) and play underneath
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

  // events
  btn.addEventListener('click', () => handlePlay(item, btn, label));
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
  const src = await tryAudio(item.audio);
  if (!src) {
    label.textContent = 'No audio';
    btn.disabled = false;
    setTimeout(() => { if (!btn.classList.contains('playing')) label.textContent = ''; }, 1200);
    return;
  }

  try {
    await audioEl.play();
    label.textContent = 'Playing';
    btn.classList.add('playing');
    audioEl.onended = () => { btn.disabled = false; label.textContent = ''; btn.classList.remove('playing'); };
  } catch (playErr) {
    console.warn('Play failed', playErr);
    label.textContent = 'Play failed';
    btn.disabled = false;
    setTimeout(() => label.textContent = '', 1200);
  }
}

if (searchInput) searchInput.addEventListener('input', (e) => renderCards(e.target.value));

renderCards();
