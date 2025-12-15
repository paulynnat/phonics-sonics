/* Book 2: Word Families - Interactive functionality */

// Word families data with common phonics patterns
const wordFamiliesData = [
  { id: "at", family: "-at", examples: "cat, hat, mat, bat, rat, sat" },
  { id: "an", family: "-an", examples: "can, man, pan, fan, ran, van" },
  { id: "ap", family: "-ap", examples: "cap, map, tap, nap, gap, lap" },
  { id: "ag", family: "-ag", examples: "bag, tag, rag, wag, sag, lag" },
  { id: "ad", family: "-ad", examples: "bad, dad, had, mad, sad, pad" },
  { id: "am", family: "-am", examples: "ham, jam, ram, dam, yam, cam" },
  { id: "ig", family: "-ig", examples: "big, dig, fig, pig, wig, jig" },
  { id: "in", family: "-in", examples: "bin, fin, pin, tin, win, sin" },
  { id: "ip", family: "-ip", examples: "dip, hip, lip, rip, tip, zip" },
  { id: "it", family: "-it", examples: "bit, fit, hit, kit, pit, sit" },
  { id: "id", family: "-id", examples: "bid, did, hid, kid, lid, rid" },
  { id: "og", family: "-og", examples: "dog, fog, hog, log, jog, cog" },
  { id: "op", family: "-op", examples: "hop, mop, pop, top, cop, shop" },
  { id: "ot", family: "-ot", examples: "cot, dot, got, hot, lot, pot" },
  { id: "ob", family: "-ob", examples: "bob, job, mob, rob, sob, knob" },
  { id: "ug", family: "-ug", examples: "bug, dug, hug, jug, mug, rug" },
  { id: "un", family: "-un", examples: "bun, fun, gun, run, sun, nun" },
  { id: "ut", family: "-ut", examples: "but, cut, hut, nut, rut, shut" },
  { id: "ub", family: "-ub", examples: "cub, hub, rub, sub, tub, club" },
  { id: "ed", family: "-ed", examples: "bed, fed, led, red, wed, shed" },
  { id: "en", family: "-en", examples: "den, hen, men, pen, ten, then" },
  { id: "et", family: "-et", examples: "bet, get, jet, let, met, net" },
  { id: "ell", family: "-ell", examples: "bell, fell, sell, tell, well, yell" },
  { id: "est", family: "-est", examples: "best, nest, rest, test, vest, west" }
];

const container = document.getElementById('word-families');
const modal = document.getElementById('family-modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalClose = document.querySelector('.modal-close');

let currentHighlightedCard = null;

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
  familyExample.textContent = item.examples.split(',').slice(0, 3).join(', ').trim();

  const badge = document.createElement('div');
  badge.className = 'family-badge';
  badge.textContent = 'NEW';
  badge.setAttribute('aria-hidden', 'true');

  card.appendChild(badge);
  card.appendChild(familyName);
  card.appendChild(familyExample);

  // Click event listener for highlighting and future modal
  card.addEventListener('click', () => {
    handleFamilyClick(item, card);
  });

  // Keyboard accessibility
  card.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      handleFamilyClick(item, card);
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
  
  console.log(`Word family clicked: ${item.family}`, item);
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
