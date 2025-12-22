class FlashcardApp {
  constructor() {
    this.currentLesson = null;
    this.currentWordIndex = 0;
    this.currentWord = '';
    this.blankPosition = 0;
    this.correctAnswer = '';
    this.sessionCorrect = 0;
    this.sessionIncorrect = 0;
    
    this.initElements();
    this.attachEventListeners();
    this.loadLesson();
    this.loadStatistics();
  }

  initElements() {
    this.elements = {
      loading: document.getElementById('loading'),
      flashcard: document.getElementById('flashcard'),
      lessonComplete: document.getElementById('lesson-complete'),
      wordContainer: document.getElementById('word-container'),
      letterInput: document.getElementById('letter-input'),
      submitBtn: document.getElementById('submit-btn'),
      hintBtn: document.getElementById('hint-btn'),
      feedback: document.getElementById('feedback'),
      progressText: document.getElementById('progress-text'),
      correctCount: document.getElementById('correct-count'),
      errorCount: document.getElementById('error-count'),
      newLessonBtn: document.getElementById('new-lesson-btn'),
      totalQuestions: document.getElementById('total-questions'),
      correctAnswers: document.getElementById('correct-answers'),
      incorrectAnswers: document.getElementById('incorrect-answers'),
      accuracy: document.getElementById('accuracy'),
      mistakeList: document.getElementById('mistake-list'),
      russianKeyboard: document.getElementById('russian-keyboard')
    };
    
    this.russianLetters = [
      'а', 'б', 'в', 'г', 'д', 'е', 'ё', 'ж', 'з', 'и', 'й',
      'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у',
      'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ы', 'ь', 'э', 'ю', 'я'
    ];
  }

  attachEventListeners() {
    this.elements.submitBtn.addEventListener('click', () => this.checkAnswer());
    this.elements.hintBtn.addEventListener('click', () => this.showHint());
    this.elements.newLessonBtn.addEventListener('click', () => this.startNewLesson());
    
    this.elements.letterInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.checkAnswer();
      }
    });

    // Auto-focus input when typing
    this.elements.letterInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.toLowerCase();
    });
    
    // Initialize keyboard
    this.initKeyboard();
  }

  initKeyboard() {
    this.elements.russianKeyboard.innerHTML = '';
    
    this.russianLetters.forEach(letter => {
      const key = document.createElement('button');
      key.className = 'keyboard-key';
      key.textContent = letter;
      key.dataset.letter = letter;
      key.addEventListener('click', () => this.handleKeyboardClick(letter));
      this.elements.russianKeyboard.appendChild(key);
    });
  }

  handleKeyboardClick(letter) {
    const key = this.elements.russianKeyboard.querySelector(`[data-letter="${letter}"]`);
    if (!this.elements.letterInput.disabled && !key.classList.contains('disabled')) {
      this.elements.letterInput.value = letter;
      this.elements.letterInput.focus();
    }
  }

  updateKeyboard() {
    // Get all unique letters in the current word
    const wordLetters = new Set(this.currentWord.toLowerCase().split(''));
    
    // Update each keyboard key
    const keys = this.elements.russianKeyboard.querySelectorAll('.keyboard-key');
    keys.forEach(key => {
      const letter = key.dataset.letter;
      if (wordLetters.has(letter)) {
        key.classList.remove('disabled');
      } else {
        key.classList.add('disabled');
      }
    });
  }

  async loadLesson() {
    try {
      this.showLoading();
      const response = await fetch('/api/lesson');
      const lesson = await response.json();
      
      this.currentLesson = lesson;
      this.currentWordIndex = 0;
      this.sessionCorrect = 0;
      this.sessionIncorrect = 0;
      
      this.updateStats();
      this.showNextWord();
    } catch (err) {
      console.error('Error loading lesson:', err);
      this.elements.feedback.textContent = 'Error loading lesson. Please refresh the page.';
      this.elements.feedback.className = 'feedback error';
    }
  }

  showLoading() {
    this.elements.loading.style.display = 'block';
    this.elements.flashcard.style.display = 'none';
    this.elements.lessonComplete.style.display = 'none';
  }

  showFlashcard() {
    this.elements.loading.style.display = 'none';
    this.elements.flashcard.style.display = 'block';
    this.elements.lessonComplete.style.display = 'none';
    this.elements.letterInput.focus();
  }

  showLessonComplete() {
    this.elements.loading.style.display = 'none';
    this.elements.flashcard.style.display = 'none';
    this.elements.lessonComplete.style.display = 'block';

    const total = this.sessionCorrect + this.sessionIncorrect;
    const accuracy = total > 0 ? Math.round((this.sessionCorrect / total) * 100) : 0;

    this.elements.totalQuestions.textContent = total;
    this.elements.correctAnswers.textContent = this.sessionCorrect;
    this.elements.incorrectAnswers.textContent = this.sessionIncorrect;
    this.elements.accuracy.textContent = accuracy + '%';

    // Save progress
    this.saveProgress();
  }

  showNextWord() {
    if (!this.currentLesson || this.currentWordIndex >= this.currentLesson.words.length) {
      this.showLessonComplete();
      return;
    }

    this.currentWord = this.currentLesson.words[this.currentWordIndex];
    
    // Choose a random position to blank out
    const wordLength = this.currentWord.length;
    if (wordLength === 1) {
      // Only one option for single letter words
      this.blankPosition = 0;
    } else if (wordLength === 2) {
      // For 2-letter words, pick either position
      this.blankPosition = Math.floor(Math.random() * 2);
    } else if (wordLength === 3) {
      // For 3-letter words, pick middle position more often, but allow edges
      const rand = Math.random();
      if (rand < 0.6) {
        this.blankPosition = 1; // Middle position 60% of the time
      } else if (rand < 0.8) {
        this.blankPosition = 0; // First position 20% of the time
      } else {
        this.blankPosition = 2; // Last position 20% of the time
      }
    } else {
      // For longer words (4+), avoid first and last positions
      const minPos = 1;
      const maxPos = wordLength - 1;
      this.blankPosition = Math.floor(Math.random() * (maxPos - minPos)) + minPos;
    }
    
    this.correctAnswer = this.currentWord[this.blankPosition];
    
    this.renderWord();
    this.clearFeedback();
    this.elements.letterInput.value = '';
    this.elements.letterInput.disabled = false;
    this.elements.submitBtn.disabled = false;
    this.elements.hintBtn.disabled = false;
    
    this.updateStats();
    this.updateKeyboard();
    this.showFlashcard();
  }

  renderWord() {
    this.elements.wordContainer.innerHTML = '';
    
    for (let i = 0; i < this.currentWord.length; i++) {
      const letterSpan = document.createElement('span');
      letterSpan.className = 'letter';
      
      if (i === this.blankPosition) {
        letterSpan.className += ' blank';
        letterSpan.textContent = this.correctAnswer;
        letterSpan.dataset.blank = 'true';
      } else {
        letterSpan.textContent = this.currentWord[i];
      }
      
      this.elements.wordContainer.appendChild(letterSpan);
    }
    
    // Add transliteration below the word
    const transliteration = this.transliterate(this.currentWord);
    const translitDiv = document.createElement('div');
    translitDiv.className = 'transliteration';
    translitDiv.textContent = `(${transliteration})`;
    this.elements.wordContainer.appendChild(translitDiv);
  }

  transliterate(word) {
    // Russian to Latin transliteration map
    const map = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
      'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i',
      'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
      'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
      'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch',
      'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '',
      'э': 'e', 'ю': 'yu', 'я': 'ya'
    };
    
    return word.toLowerCase().split('').map(char => map[char] || char).join('');
  }

  async checkAnswer() {
    const userAnswer = this.elements.letterInput.value.toLowerCase().trim();
    
    if (!userAnswer) {
      this.showFeedback('Please enter a letter', false);
      return;
    }

    this.elements.letterInput.disabled = true;
    this.elements.submitBtn.disabled = true;
    this.elements.hintBtn.disabled = true;

    if (userAnswer === this.correctAnswer.toLowerCase()) {
      this.sessionCorrect++;
      this.showFeedback('Correct! ✓', true);
      this.revealLetter(true);
      
      setTimeout(() => {
        this.currentWordIndex++;
        this.showNextWord();
      }, 1500);
    } else {
      this.sessionIncorrect++;
      this.showFeedback(`Wrong. The correct letter is: ${this.correctAnswer}`, false);
      this.revealLetter(false);
      
      // Record the mistake
      await this.recordMistake(this.correctAnswer, this.currentWord, this.blankPosition);
      
      setTimeout(() => {
        this.currentWordIndex++;
        this.showNextWord();
      }, 2500);
    }

    this.updateStats();
  }

  revealLetter(correct) {
    const blanks = this.elements.wordContainer.querySelectorAll('.blank');
    blanks.forEach(blank => {
      blank.classList.remove('blank');
      blank.classList.add(correct ? 'revealed' : 'wrong');
    });
  }

  showHint() {
    // Show surrounding context as a hint
    const before = this.currentWord.substring(Math.max(0, this.blankPosition - 1), this.blankPosition);
    const after = this.currentWord.substring(this.blankPosition + 1, Math.min(this.currentWord.length, this.blankPosition + 2));
    
    this.showFeedback(`Hint: The letter comes ${before ? 'after "' + before + '"' : 'at the start'} ${after ? 'and before "' + after + '"' : 'at the end'}`, null);
  }

  showFeedback(message, isCorrect) {
    this.elements.feedback.textContent = message;
    if (isCorrect === true) {
      this.elements.feedback.className = 'feedback success';
    } else if (isCorrect === false) {
      this.elements.feedback.className = 'feedback error';
    } else {
      this.elements.feedback.className = 'feedback';
    }
  }

  clearFeedback() {
    this.elements.feedback.textContent = '';
    this.elements.feedback.className = 'feedback';
  }

  updateStats() {
    const total = this.currentLesson ? this.currentLesson.words.length : 0;
    this.elements.progressText.textContent = `${this.currentWordIndex}/${total}`;
    this.elements.correctCount.textContent = this.sessionCorrect;
    this.elements.errorCount.textContent = this.sessionIncorrect;
  }

  async recordMistake(letter, word, position) {
    try {
      await fetch('/api/mistake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ letter, word, position })
      });
      
      // Reload statistics after recording mistake
      this.loadStatistics();
    } catch (err) {
      console.error('Error recording mistake:', err);
    }
  }

  async saveProgress() {
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          correct: this.sessionCorrect,
          incorrect: this.sessionIncorrect
        })
      });
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  }

  async loadStatistics() {
    try {
      const response = await fetch('/api/statistics');
      const data = await response.json();
      
      this.renderStatistics(data.mistakes);
    } catch (err) {
      console.error('Error loading statistics:', err);
    }
  }

  renderStatistics(mistakes) {
    this.elements.mistakeList.innerHTML = '';
    
    if (mistakes.length === 0) {
      this.elements.mistakeList.innerHTML = '<p style="color: #666;">No mistakes yet. Keep practicing!</p>';
      return;
    }

    mistakes.forEach(mistake => {
      const div = document.createElement('div');
      div.className = 'mistake-item';
      div.innerHTML = `
        <span class="letter">${mistake.letter}</span>
        <span class="count">${mistake.count} mistake${mistake.count > 1 ? 's' : ''}</span>
      `;
      this.elements.mistakeList.appendChild(div);
    });
  }

  startNewLesson() {
    this.loadLesson();
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new FlashcardApp();
});
