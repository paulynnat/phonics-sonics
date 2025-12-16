/* Book 3: Digraph Sound Chart and Quiz */

// Configuration
const MAX_EXAMPLES_DISPLAY = 4; // Always limit examples to 4 words per card

// Digraphs data with common phonics patterns and audio paths
const digraphsData = [
  {
    id: "ch",
    digraph: "ch",
    sound: "/ch/",
    examples: "chair, cheese, church, chip, chat, lunch",
    description: "The 'ch' sound as in 'cheese'",
    audio: "assets/audio/book3/ch"
  },
  {
    id: "sh",
    digraph: "sh",
    sound: "/sh/",
    examples: "ship, shell, fish, dish, bush, wash",
    description: "The 'sh' sound as in 'shell'",
    audio: "assets/audio/book3/sh"
  },
  {
    id: "th",
    digraph: "th",
    sound: "/th/",
    examples: "this, that, teeth, bath, with, moth",
    description: "The 'th' sound as in 'this' and 'that'",
    audio: "assets/audio/book3/th"
  },
  {
    id: "wh",
    digraph: "wh",
    sound: "/wh/",
    examples: "what, when, where, wheel, whale, white",
    description: "The 'wh' sound as in 'what'",
    audio: "assets/audio/book3/wh"
  },
  {
    id: "ph",
    digraph: "ph",
    sound: "/f/",
    examples: "phone, photo, graph, dolphin, elephant, alphabet",
    description: "The 'ph' sound (sounds like 'f') as in 'phone'",
    audio: "assets/audio/book3/ph"
  },
  {
    id: "ck",
    digraph: "ck",
    sound: "/k/",
    examples: "duck, rock, stick, clock, black, quick",
    description: "The 'ck' sound (sounds like 'k') as in 'duck'",
    audio: "assets/audio/book3/ck"
  },
  {
    id: "ng",
    digraph: "ng",
    sound: "/ŋ/",
    examples: "ring, song, king, long, sing, strong",
    description: "The 'ng' sound as in 'ring'",
    audio: "assets/audio/book3/ng"
  },
  {
    id: "qu",
    digraph: "qu",
    sound: "/kw/",
    examples: "queen, quick, quiet, quilt, square, query",
    description: "The 'qu' sound (sounds like 'kw') as in 'queen'",
    audio: "assets/audio/book3/qu"
  }
];

// Quiz Questions
const quizQuestions = [
  { question: "Which word contains the 'ch' sound?", options: ["chair", "table", "window", "book"], correctAnswer: "a" },
  { question: "Find the 'sh' sound in these words.", options: ["cat", "shell", "dog", "ball"], correctAnswer: "b" },
  { question: "Which one has the 'ph' sound?", options: ["graph", "table", "road", "grass"], correctAnswer: "a" },
  { question: "Which has the 'ng' sound?", options: ["king", "cart", "jump", "block"], correctAnswer: "a" },
  { question: "Which word contains the 'wh' sound?", options: ["wheel", "pen", "fork", "shelf"], correctAnswer: "a" },
  { question: "What has the 'ck' sound?", options: ["duck", "door", "ball", "chair"], correctAnswer: "a" },
  { question: "Select the word with the 'qu' sound.", options: ["quick", "cab", "sun", "bike"], correctAnswer: "a" },
  { question: "Choose the word with the 'th' sound.", options: ["cloth", "table", "wood", "chair"], correctAnswer: "a" },
  { question: "Find the correct word with the 'ch' sound.", options: ["church", "pan", "run", "tree"], correctAnswer: "a" },
  { question: "Which word has the 'sh' sound?", options: ["fish", "car", "door", "grass"], correctAnswer: "a" }
];

// DOM Elements
const digraphsGrid = document.getElementById('digraphs-grid');
const quizSection = document.getElementById('quiz-section');
const quizQuestion = document.getElementById('quiz-question');
const submitAnswerBtn = document.getElementById('submit-answer');
const nextQuestionBtn = document.getElementById('next-question');
const quizResults = document.getElementById('quiz-results');
const quizFeedback = document.getElementById('quiz-feedback');
const retryQuizBtn = document.getElementById('retry-quiz');
const audioEl = document.getElementById('shared-audio');

// State variables
let currentQuestionIndex = 0;
let score = 0;
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
 * Creates a digraph card element
 * @param {Object} item - Digraph data object
 * @returns {HTMLElement}
 */
function createDigraphCard(item) {
  const card = document.createElement('article');
  card.className = 'digraph-card';
  card.setAttribute('role', 'listitem');
  card.setAttribute('tabindex', '0');
  card.dataset.digraphId = item.id;

  // Add digraph name
  const digraphName = document.createElement('div');
  digraphName.className = 'digraph-name';
  digraphName.textContent = item.digraph;

  // Add digraph sound
  const digraphSound = document.createElement('div');
  digraphSound.className = 'digraph-sound';
  digraphSound.textContent = item.sound;

  // Add examples (limit to first 4)
  const digraphExamples = document.createElement('div');
  digraphExamples.className = 'digraph-examples';
  const examplesList = item.examples.split(',').slice(0, MAX_EXAMPLES_DISPLAY).join(', ').trim();
  digraphExamples.textContent = examplesList;

  // Play button wrapper
  const playWrap = document.createElement('div');
  playWrap.className = 'play-wrap';

  const btn = document.createElement('button');
  btn.className = 'play-btn';
  btn.type = 'button';
  btn.setAttribute('aria-label', `Play ${item.digraph} sound`);
  btn.dataset.id = item.id;
  btn.textContent = '▶';

  const label = document.createElement('div');
  label.className = 'btn-label';
  label.setAttribute('aria-hidden', 'true');
  label.textContent = '';

  playWrap.appendChild(btn);
  playWrap.appendChild(label);

  // Append elements
  card.appendChild(digraphName);
  card.appendChild(digraphSound);
  card.appendChild(digraphExamples);
  card.appendChild(playWrap);

  // Play button click handler
  btn.addEventListener('click', async (e) => {
    e.stopPropagation(); // Prevent any card click events
    await handlePlay(item, btn, label);
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
 * Renders all digraph cards into the grid
 */
function renderDigraphCards() {
  if (!digraphsGrid) return;
  digraphsGrid.innerHTML = ''; // Clear existing content

  digraphsData.forEach(item => {
    const card = createDigraphCard(item);
    digraphsGrid.appendChild(card);
  });
}

/**
 * Loads the current quiz question and displays the question number
 */
function loadQuizQuestion() {
  const questionData = quizQuestions[currentQuestionIndex];
  quizQuestion.querySelector('.question-text').textContent = questionData.question;

  const optionsContainer = quizQuestion.querySelector('.quiz-options');
  optionsContainer.innerHTML = ''; // Clear previous options

  questionData.options.forEach((option, index) => {
    const letter = String.fromCharCode(97 + index); // "a", "b", "c", "d"
    const button = document.createElement('button');
    button.className = 'quiz-option';
    button.dataset.option = letter;
    button.innerHTML = `
      <span class="option-letter">${letter.toUpperCase()}</span>
      <span class="option-text">${option}</span>
    `;
    button.addEventListener('click', () => {
      document.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
      button.classList.add('selected');
    });
    optionsContainer.appendChild(button);
  });

  // Display question number dynamically
  document.getElementById('current-question').textContent = currentQuestionIndex + 1;
  document.getElementById('total-questions').textContent = quizQuestions.length;
}

/**
 * Submits the selected answer and displays feedback
 */
submitAnswerBtn.addEventListener('click', () => {
  const selectedOption = document.querySelector('.quiz-option.selected');
  if (!selectedOption) {
    showFeedback(false, "Please select an answer first!");
    return;
  }

  const selectedAnswer = selectedOption.dataset.option;
  const correctAnswer = quizQuestions[currentQuestionIndex].correctAnswer;

  if (selectedAnswer === correctAnswer) {
    showFeedback(true, "Correct! Well done!");
    score++;
  } else {
    const correctOption = document.querySelector(`[data-option="${correctAnswer}"]`);
    if (correctOption) correctOption.classList.add('correct');
    showFeedback(false, "Not quite. The correct answer was highlighted!");
  }

  submitAnswerBtn.style.display = 'none';
  nextQuestionBtn.style.display = 'block';
});

/**
 * Handles navigation to the next question or displays results
 */
nextQuestionBtn.addEventListener('click', () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < quizQuestions.length) {
    loadQuizQuestion();
    submitAnswerBtn.style.display = 'block';
    nextQuestionBtn.style.display = 'none';
    quizFeedback.style.display = 'none';
  } else {
    showQuizResults();
  }
});

/**
 * Displays the quiz results, including the final score
 */
function showQuizResults() {
  quizSection.style.display = 'none';
  quizResults.style.display = 'block';

  // Display score prominently
  document.getElementById('score').textContent = score;
  document.getElementById('total').textContent = quizQuestions.length;
  document.getElementById('percentage').textContent = `${Math.round((score / quizQuestions.length) * 100)}%`;
}

/**
 * Resets the quiz for retry
 */
retryQuizBtn.addEventListener('click', () => {
  currentQuestionIndex = 0;
  score = 0;
  quizResults.style.display = 'none';
  quizSection.style.display = 'block';
  loadQuizQuestion();
  submitAnswerBtn.style.display = 'block';
  nextQuestionBtn.style.display = 'none';
  quizFeedback.style.display = 'none';
});

/**
 * Displays feedback for correct/incorrect answers
 * @param {boolean} isCorrect - Whether the answer was correct or not
 * @param {string} message - The feedback message to display
 */
function showFeedback(isCorrect, message) {
  quizFeedback.style.display = 'block';
  quizFeedback.textContent = message;
  quizFeedback.className = isCorrect ? 'quiz-feedback correct' : 'quiz-feedback incorrect';
}

// Initialize both the Digraph Sound Chart and Quiz
renderDigraphCards();
loadQuizQuestion();