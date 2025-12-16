/* Book 2: Word Families - Interactive functionality with audio playback */

// Configuration
const MAX_EXAMPLES_DISPLAY = 3;

// Word families data with common phonics patterns and audio paths
const wordFamiliesData = [
  { id: "at", family: "-at", examples: "cat, hat, mat, bat, rat, sat", audio: "assets/audio/book2/at" },
  { id: "an", family: "-an", examples: "can, man, pan, fan, ran, van", audio: "assets/audio/book2/an" },
  { id: "ap", family: "-ap", examples: "cap, map, tap, nap, gap, lap", audio: "assets/audio/book2/ap" },
  { id: "ag", family: "-ag", examples: "bag, tag, rag, wag, sag, lag", audio: "assets/audio/book2/ag" },
  { id: "ad", family: "-ad", examples: "bad, dad, had, mad, sad, pad", audio: "assets/audio/book2/ad" },
  { id: "am", family: "-am", examples: "ham, jam, ram, dam, yam, cam", audio: "assets/audio/book2/am" },
  { id: "ig", family: "-ig", examples: "big, dig, fig, pig, wig, jig", audio: "assets/audio/book2/ig" },
  { id: "in", family: "-in", examples: "bin, fin, pin, tin, win, sin", audio: "assets/audio/book2/in" },
  { id: "ip", family: "-ip", examples: "dip, hip, lip, rip, tip, zip", audio: "assets/audio/book2/ip" },
  { id: "it", family: "-it", examples: "bit, fit, hit, kit, pit, sit", audio: "assets/audio/book2/it" },
  { id: "id", family: "-id", examples: "bid, did, hid, kid, lid, rid", audio: "assets/audio/book2/id" },
  { id: "og", family: "-og", examples: "dog, fog, hog, log, jog, cog", audio: "assets/audio/book2/og" },
  { id: "op", family: "-op", examples: "hop, mop, pop, top, cop, shop", audio: "assets/audio/book2/op" },
  { id: "ot", family: "-ot", examples: "cot, dot, got, hot, lot, pot", audio: "assets/audio/book2/ot" },
  { id: "ob", family: "-ob", examples: "bob, job, mob, rob, sob, knob", audio: "assets/audio/book2/ob" },
  { id: "ug", family: "-ug", examples: "bug, dug, hug, jug, mug, rug", audio: "assets/audio/book2/ug" },
  { id: "un", family: "-un", examples: "bun, fun, gun, run, sun, nun", audio: "assets/audio/book2/un" },
  { id: "ut", family: "-ut", examples: "but, cut, hut, nut, rut, shut", audio: "assets/audio/book2/ut" },
  { id: "ub", family: "-ub", examples: "cub, hub, rub, sub, tub, club", audio: "assets/audio/book2/ub" },
  { id: "ed", family: "-ed", examples: "bed, fed, led, red, wed, shed", audio: "assets/audio/book2/ed" },
  { id: "en", family: "-en", examples: "den, hen, men, pen, ten, then", audio: "assets/audio/book2/en" },
  { id: "et", family: "-et", examples: "bet, get, jet, let, met, net", audio: "assets/audio/book2/et" },
  { id: "ell", family: "-ell", examples: "bell, fell, sell, tell, well, yell", audio: "assets/audio/book2/ell" },
  { id: "est", family: "-est", examples: "best, nest, rest, test, vest, west", audio: "assets/audio/book2/est" }
];

const container = document.getElementById('word-families');
const modal = document.getElementById('family-modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalClose = document.querySelector('.modal-close');
const audioEl = document.getElementById('shared-audio');

let currentHighlightedCard = null;
let lastBlobUrl = null;

// --- Audio loading functions (from Book 1) ---
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

/**
 * Creates a family card element
 * @param {Object} item - Word family data object
 * @returns {HTMLElement} - The created card element
 */
function createFamilyCard(item) {
  const card = document.createElement('article');
  card.className = 'family-card';
  card.setAttribute('role', 'listitem');
  card.setAttribute('tabindex', '0');
  card.dataset.familyId = item.id;
  card.setAttribute('aria-label', `${item.family} word family: ${item.examples}`);

  const familyName = document.createElement('div');
  familyName.className = 'family-name';
  familyName.textContent = item.family;

  const familyExample = document.createElement('div');
  familyExample.className = 'family-example';
  familyExample.textContent = item.examples.split(',').slice(0, MAX_EXAMPLES_DISPLAY).join(', ').trim();

  // Play button wrapper
  const playWrap = document.createElement('div');
  playWrap.className = 'play-wrap';

  const btn = document.createElement('button');
  btn.className = 'play-btn';
  btn.type = 'button';
  btn.setAttribute('aria-label', `Play ${item.family}`);
  btn.dataset.id = item.id;
  btn.textContent = '▶';

  const label = document.createElement('div');
  label.className = 'btn-label';
  label.setAttribute('aria-hidden', 'true');
  label.textContent = '';

  playWrap.appendChild(btn);
  playWrap.appendChild(label);

  card.appendChild(familyName);
  card.appendChild(familyExample);
  card.appendChild(playWrap);

  // Play button click handler
  btn.addEventListener('click', async (e) => {
    e.stopPropagation(); // Prevent card click event
    await handlePlay(item, btn, label);
  });

  // Click event listener for highlighting and future modal
  card.addEventListener('click', () => {
    handleFamilyClick(item, card);
  });

  // Keyboard accessibility
  card.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      btn.click();
    }
  });

  return card;
}

/**
 * Handles click/tap on a word family card
 * @param {Object} item - Word family data object
 * @param {HTMLElement} card - The clicked card element
 */
function handleFamilyClick(item, card) {
  // Toggle highlight on the clicked card
  if (currentHighlightedCard === card) {
    // If already highlighted, remove highlight
    card.classList.remove('highlighted');
    currentHighlightedCard = null;
  } else {
    // Remove highlight from previous card if any
    if (currentHighlightedCard) {
      currentHighlightedCard.classList.remove('highlighted');
    }
    // Highlight the new card
    card.classList.add('highlighted');
    currentHighlightedCard = card;
  }

  // Placeholder for future modal functionality
  // Uncomment the following line when ready to implement modals:
  // openModal(item);
}

/**
 * Opens the modal with word family details (placeholder for future implementation)
 * @param {Object} item - Word family data object
 */
function openModal(item) {
  if (!modal || !modalTitle || !modalBody) return;

  modalTitle.textContent = `${item.family} Word Family`;
  
  // Placeholder content - will be replaced with interactive exercises
  modalBody.innerHTML = `
    <div class="modal-placeholder">
      <p><strong>Words:</strong> ${item.examples}</p>
      <p style="margin-top: 16px; font-style: italic;">Interactive exercises and activities coming soon!</p>
    </div>
  `;

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  
  // Trap focus in modal
  modalClose.focus();
}

/**
 * Closes the modal
 */
function closeModal() {
  if (!modal) return;
  
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  
  // Return focus to the highlighted card if any
  if (currentHighlightedCard) {
    currentHighlightedCard.focus();
  }
}

/**
 * Renders all word family cards
 */
function renderFamilyCards() {
  if (!container) return;
  
  container.innerHTML = '';
  
  wordFamiliesData.forEach(item => {
    const card = createFamilyCard(item);
    container.appendChild(card);
  });
}

// Event listeners for modal close
if (modalClose) {
  modalClose.addEventListener('click', closeModal);
}

if (modal) {
  // Close modal on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

// Initialize the page
renderFamilyCards();
