/* Book 3: Digraphs - Interactive functionality */

// Configuration
const MAX_EXAMPLES_DISPLAY = 4;

// Digraphs data with common phonics patterns
// Future: Add audio files for each digraph sound
const digraphsData = [
  { 
    id: "ch", 
    digraph: "ch", 
    sound: "/ch/", 
    examples: "chair, cheese, church, chip, chat, lunch",
    description: "The 'ch' sound as in 'cheese'"
  },
  { 
    id: "sh", 
    digraph: "sh", 
    sound: "/sh/", 
    examples: "ship, shell, fish, dish, bush, wash",
    description: "The 'sh' sound as in 'shell'"
  },
  { 
    id: "th", 
    digraph: "th", 
    sound: "/th/", 
    examples: "this, that, teeth, bath, with, moth",
    description: "The 'th' sound as in 'this' and 'that'"
  },
  { 
    id: "wh", 
    digraph: "wh", 
    sound: "/wh/", 
    examples: "what, when, where, wheel, whale, white",
    description: "The 'wh' sound as in 'what'"
  },
  { 
    id: "ph", 
    digraph: "ph", 
    sound: "/f/", 
    examples: "phone, photo, graph, dolphin, elephant, alphabet",
    description: "The 'ph' sound (sounds like 'f') as in 'phone'"
  },
  { 
    id: "ck", 
    digraph: "ck", 
    sound: "/k/", 
    examples: "duck, rock, stick, clock, black, quick",
    description: "The 'ck' sound (sounds like 'k') as in 'duck'"
  },
  { 
    id: "ng", 
    digraph: "ng", 
    sound: "/ŋ/", 
    examples: "ring, song, king, long, sing, strong",
    description: "The 'ng' sound as in 'ring'"
  },
  { 
    id: "qu", 
    digraph: "qu", 
    sound: "/kw/", 
    examples: "queen, quick, quiet, quiz, quilt, square",
    description: "The 'qu' sound (sounds like 'kw') as in 'queen'"
  }
];

// DOM Elements
const digraphsGrid = document.getElementById('digraphs-grid');
const gameModal = document.getElementById('game-modal');
const gameModalTitle = document.getElementById('game-modal-title');
const gameBody = document.getElementById('game-body');
const gameModalClose = gameModal ? gameModal.querySelector('.modal-close') : null;

// Quiz DOM Elements
const quizSection = document.getElementById('quiz-section');
const quizQuestion = document.getElementById('quiz-question');
const quizResults = document.getElementById('quiz-results');
const submitAnswerBtn = document.getElementById('submit-answer');
const nextQuestionBtn = document.getElementById('next-question');
const quizFeedback = document.getElementById('quiz-feedback');
const retryQuizBtn = document.getElementById('retry-quiz');
const backToHomeBtn = document.getElementById('back-to-home');

let currentHighlightedCard = null;
let currentDigraphData = null;

/**
 * Creates a digraph card element
 * @param {Object} item - Digraph data object
 * @returns {HTMLElement} - The created card element
 */
function createDigraphCard(item) {
  const card = document.createElement('article');
  card.className = 'digraph-card';
  card.setAttribute('role', 'listitem');
  card.setAttribute('tabindex', '0');
  card.dataset.digraphId = item.id;
  card.setAttribute('aria-label', `${item.digraph} digraph: ${item.description}`);

  const digraphName = document.createElement('div');
  digraphName.className = 'digraph-name';
  digraphName.textContent = item.digraph;

  const digraphSound = document.createElement('div');
  digraphSound.className = 'digraph-sound';
  digraphSound.textContent = item.sound;

  const digraphExamples = document.createElement('div');
  digraphExamples.className = 'digraph-examples';
  const examplesList = item.examples.split(',').slice(0, MAX_EXAMPLES_DISPLAY);
  digraphExamples.textContent = examplesList.join(', ').trim();

  // Play button placeholder
  // Future: Add actual audio playback functionality
  const playBtn = document.createElement('button');
  playBtn.className = 'digraph-play-btn';
  playBtn.setAttribute('aria-label', `Play ${item.digraph} sound`);
  playBtn.innerHTML = '▶';
  playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    playDigraphSound(item, playBtn);
  });

  const badge = document.createElement('div');
  badge.className = 'digraph-badge';
  badge.textContent = 'NEW';
  badge.setAttribute('aria-hidden', 'true');

  card.appendChild(badge);
  card.appendChild(digraphName);
  card.appendChild(digraphSound);
  card.appendChild(digraphExamples);
  card.appendChild(playBtn);

  // Click event listener for opening game modal
  card.addEventListener('click', () => {
    handleDigraphClick(item, card);
  });

  // Keyboard accessibility
  card.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      handleDigraphClick(item, card);
    }
  });

  return card;
}

/**
 * Handles click/tap on a digraph card
 * @param {Object} item - Digraph data object
 * @param {HTMLElement} card - The clicked card element
 */
function handleDigraphClick(item, card) {
  // Highlight the clicked card
  if (currentHighlightedCard === card) {
    // If already highlighted, open the game modal
    openGameModal(item);
  } else {
    // Remove highlight from previous card if any
    if (currentHighlightedCard) {
      currentHighlightedCard.classList.remove('highlighted');
    }
    // Highlight the new card
    card.classList.add('highlighted');
    currentHighlightedCard = card;
    currentDigraphData = item;
    
    // Open game modal after highlighting
    openGameModal(item);
  }
}

/**
 * Placeholder function for playing digraph sound
 * Future: Implement actual audio playback
 * @param {Object} item - Digraph data object
 * @param {HTMLElement} btn - The button element that was clicked
 */
function playDigraphSound(item, btn) {
  console.log(`Playing sound for digraph: ${item.digraph}`);
  // Future implementation:
  // const audio = new Audio(`assets/audio/digraphs/${item.id}.mp3`);
  // audio.play();
  
  // Visual feedback
  btn.classList.add('playing');
  setTimeout(() => {
    btn.classList.remove('playing');
  }, 500);
}

/**
 * Opens the Digraph Detective game modal
 * @param {Object} item - Digraph data object
 */
function openGameModal(item) {
  if (!gameModal || !gameModalTitle || !gameBody) return;

  gameModalTitle.textContent = `Digraph Detective: ${item.digraph}`;
  
  // Create game interface
  // This is a placeholder UI structure for the game
  gameBody.innerHTML = `
    <div class="game-content">
      <p class="game-instruction">Find all the words that contain the <strong>${item.digraph}</strong> sound!</p>
      
      <!-- Placeholder for game images - Future: Replace with actual interactive game -->
      <div class="game-images-grid">
        ${createGameImagePlaceholders(item)}
      </div>
      
      <div class="game-score">
        <span>Score: <strong id="game-score">0</strong></span>
        <span>Found: <strong id="game-found">0</strong> / <strong id="game-total">4</strong></span>
      </div>
      
      <div class="game-controls">
        <button class="game-btn" id="game-check-btn">Check Answers</button>
        <button class="game-btn game-btn-secondary" id="game-hint-btn">Hint</button>
      </div>
      
      <div class="game-feedback" id="game-feedback" style="display: none;">
        <p class="feedback-message"></p>
      </div>
      
      <!-- Placeholder comment for future features -->
      <!-- Future: Add timer, difficulty levels, sound effects -->
    </div>
  `;

  gameModal.classList.add('active');
  gameModal.setAttribute('aria-hidden', 'false');
  
  // Add event listeners for game buttons
  setupGameControls();
  
  // Focus on close button for accessibility
  if (gameModalClose) {
    gameModalClose.focus();
  }
}

/**
 * Creates placeholder game images for the Digraph Detective game
 * Future: Replace with actual clickable images
 * @param {Object} item - Digraph data object
 * @returns {string} HTML string for game images
 */
function createGameImagePlaceholders(item) {
  const examples = item.examples.split(',').map(ex => ex.trim());
  let html = '';
  
  // Create 4 placeholder image slots
  for (let i = 0; i < 4; i++) {
    const word = examples[i] || 'word';
    html += `
      <div class="game-image-card" data-word="${word}" data-has-digraph="true">
        <div class="game-image-placeholder">
          <!-- Future: Replace with actual image -->
          <span class="placeholder-icon">🖼️</span>
        </div>
        <div class="game-word-label">${word}</div>
        <button class="game-select-btn" aria-label="Select ${word}">
          <span class="select-icon">○</span>
        </button>
      </div>
    `;
  }
  
  return html;
}

/**
 * Sets up event listeners for game controls
 * Placeholder implementation for future game logic
 */
function setupGameControls() {
  const checkBtn = document.getElementById('game-check-btn');
  const hintBtn = document.getElementById('game-hint-btn');
  const selectBtns = document.querySelectorAll('.game-select-btn');
  
  if (checkBtn) {
    checkBtn.addEventListener('click', () => {
      // Future: Implement answer checking logic
      const feedback = document.getElementById('game-feedback');
      if (feedback) {
        feedback.style.display = 'block';
        feedback.querySelector('.feedback-message').textContent = 
          'Great job! Game logic coming soon with actual images and audio.';
      }
    });
  }
  
  if (hintBtn) {
    hintBtn.addEventListener('click', () => {
      // Future: Implement hint system
      console.log('Hint requested for:', currentDigraphData.digraph);
    });
  }
  
  // Add click handlers for image selection
  selectBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const icon = this.querySelector('.select-icon');
      if (icon.textContent === '○') {
        icon.textContent = '●';
        this.parentElement.classList.add('selected');
      } else {
        icon.textContent = '○';
        this.parentElement.classList.remove('selected');
      }
    });
  });
}

/**
 * Closes the game modal
 */
function closeGameModal() {
  if (!gameModal) return;
  
  gameModal.classList.remove('active');
  gameModal.setAttribute('aria-hidden', 'true');
  
  // Return focus to the highlighted card if any
  if (currentHighlightedCard) {
    currentHighlightedCard.focus();
  }
}

/**
 * Renders all digraph cards
 */
function renderDigraphCards() {
  if (!digraphsGrid) return;
  
  digraphsGrid.innerHTML = '';
  
  digraphsData.forEach(item => {
    const card = createDigraphCard(item);
    digraphsGrid.appendChild(card);
  });
}

/**
 * Quiz functionality - Placeholder implementation
 * Future: Add actual quiz questions and logic
 */
function initializeQuiz() {
  if (!quizSection) return;
  
  // Placeholder quiz state
  let currentQuestion = 0;
  let score = 0;
  let totalQuestions = 10;
  
  // Update progress
  if (document.getElementById('current-question')) {
    document.getElementById('current-question').textContent = currentQuestion;
  }
  if (document.getElementById('total-questions')) {
    document.getElementById('total-questions').textContent = totalQuestions;
  }
  
  // Quiz option click handlers
  const quizOptions = document.querySelectorAll('.quiz-option');
  quizOptions.forEach(option => {
    option.addEventListener('click', function() {
      // Remove previous selection
      quizOptions.forEach(opt => opt.classList.remove('selected'));
      // Mark this option as selected
      this.classList.add('selected');
    });
  });
  
  // Submit answer handler
  if (submitAnswerBtn) {
    submitAnswerBtn.addEventListener('click', () => {
      const selectedOption = document.querySelector('.quiz-option.selected');
      if (!selectedOption) {
        // Show inline error message instead of alert
        if (quizFeedback) {
          quizFeedback.style.display = 'block';
          quizFeedback.className = 'quiz-feedback incorrect-feedback';
          quizFeedback.querySelector('.feedback-text').textContent = 
            'Please select an answer first!';
        }
        return;
      }
      
      // Placeholder logic - mark correct answer
      const correctAnswer = 'a'; // chair has 'ch'
      const selected = selectedOption.dataset.option;
      
      if (selected === correctAnswer) {
        selectedOption.classList.add('correct');
        if (quizFeedback) {
          quizFeedback.style.display = 'block';
          quizFeedback.querySelector('.feedback-text').textContent = 
            '✓ Correct! "chair" has the ch sound.';
          quizFeedback.classList.add('correct-feedback');
        }
        score++;
      } else {
        selectedOption.classList.add('incorrect');
        // Highlight correct answer
        const correctBtn = document.querySelector(`[data-option="${correctAnswer}"]`);
        if (correctBtn) correctBtn.classList.add('correct');
        
        if (quizFeedback) {
          quizFeedback.style.display = 'block';
          quizFeedback.querySelector('.feedback-text').textContent = 
            '✗ Not quite. The correct answer is "chair".';
          quizFeedback.classList.add('incorrect-feedback');
        }
      }
      
      submitAnswerBtn.style.display = 'none';
      if (nextQuestionBtn) nextQuestionBtn.style.display = 'block';
    });
  }
  
  // Next question handler
  if (nextQuestionBtn) {
    nextQuestionBtn.addEventListener('click', () => {
      // Future: Load next question
      // For now, just show the results
      showQuizResults(score, totalQuestions);
    });
  }
  
  // Retry quiz handler
  if (retryQuizBtn) {
    retryQuizBtn.addEventListener('click', () => {
      // Reset quiz state without full page reload
      if (quizResults) quizResults.style.display = 'none';
      if (quizQuestion) quizQuestion.style.display = 'block';
      
      // Reset quiz options
      const quizOptions = document.querySelectorAll('.quiz-option');
      quizOptions.forEach(opt => {
        opt.classList.remove('selected', 'correct', 'incorrect');
      });
      
      // Reset feedback
      if (quizFeedback) {
        quizFeedback.style.display = 'none';
        quizFeedback.className = 'quiz-feedback';
      }
      
      // Show submit button, hide next button
      if (submitAnswerBtn) submitAnswerBtn.style.display = 'block';
      if (nextQuestionBtn) nextQuestionBtn.style.display = 'none';
      
      // Reset progress
      score = 0;
      currentQuestion = 0;
      if (document.getElementById('current-question')) {
        document.getElementById('current-question').textContent = currentQuestion;
      }
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  
  // Back to home handler
  if (backToHomeBtn) {
    backToHomeBtn.addEventListener('click', () => {
      if (quizResults) quizResults.style.display = 'none';
      if (quizQuestion) quizQuestion.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

/**
 * Shows quiz results
 * @param {number} score - Number of correct answers
 * @param {number} total - Total number of questions
 */
function showQuizResults(score, total) {
  if (!quizResults || !quizQuestion) return;
  
  quizQuestion.style.display = 'none';
  quizResults.style.display = 'block';
  
  const scoreElement = document.getElementById('score');
  const totalElement = document.getElementById('total');
  const percentageElement = document.getElementById('percentage');
  
  if (scoreElement) scoreElement.textContent = score;
  if (totalElement) totalElement.textContent = total;
  if (percentageElement) {
    const percentage = Math.round((score / total) * 100);
    percentageElement.textContent = `${percentage}%`;
  }
  
  // Scroll to results
  quizResults.scrollIntoView({ behavior: 'smooth' });
}

// Event listeners for modal close
if (gameModalClose) {
  gameModalClose.addEventListener('click', closeGameModal);
}

if (gameModal) {
  // Close modal on background click
  gameModal.addEventListener('click', (e) => {
    if (e.target === gameModal) {
      closeGameModal();
    }
  });
  
  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && gameModal.classList.contains('active')) {
      closeGameModal();
    }
  });
}

// Initialize the page
renderDigraphCards();
initializeQuiz();

// Future features to implement:
// - Audio playback for each digraph
// - Full Digraph Detective game with scoring
// - Complete quiz question bank
// - Progress tracking across sessions
// - Difficulty levels
// - Sound effects and animations
