class FlashcardApp {
  constructor() {
    this.currentLesson = null;
    this.currentWordIndex = 0;
    this.currentWord = '';
    this.blankPosition = 0;
    this.correctAnswer = '';
    this.sessionCorrect = 0;
    this.sessionIncorrect = 0;
    this.wrongLettersThisWord = new Set(); // Track wrong letters for current word
    
    // Audio settings
    this.audioSettings = {
      enabled: true,
      autoplay: false,
      rate: 0.8,
      voiceIndex: 0,
      volume: 1.0
    };
    this.russianVoices = [];
    this.isPlaying = false;
    
    this.initElements();
    this.attachEventListeners();
    this.initAudio();
    this.loadSettings();
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
      russianKeyboard: document.getElementById('russian-keyboard'),
      settingsToggleBtn: document.getElementById('settings-toggle-btn'),
      settingsPanel: document.getElementById('settings-panel'),
      audioEnabled: document.getElementById('audio-enabled'),
      audioAutoplay: document.getElementById('audio-autoplay'),
      audioRate: document.getElementById('audio-rate'),
      rateValue: document.getElementById('rate-value'),
      audioVoice: document.getElementById('audio-voice'),
      testAudioBtn: document.getElementById('test-audio-btn')
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
    
    // Keyboard shortcut for audio (Space bar)
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
        e.preventDefault();
        if (this.currentWord) {
          this.speakWord(this.currentWord);
        }
      }
    });
    
    // Settings panel
    this.elements.settingsToggleBtn.addEventListener('click', () => {
      const isVisible = this.elements.settingsPanel.style.display !== 'none';
      this.elements.settingsPanel.style.display = isVisible ? 'none' : 'block';
    });
    
    this.elements.audioEnabled.addEventListener('change', (e) => {
      this.audioSettings.enabled = e.target.checked;
      this.saveSettings();
      // Re-render word to show/hide audio button
      if (this.currentWord) {
        this.renderWord();
      }
    });
    
    this.elements.audioAutoplay.addEventListener('change', (e) => {
      this.audioSettings.autoplay = e.target.checked;
      this.saveSettings();
    });
    
    this.elements.audioRate.addEventListener('input', (e) => {
      const rate = parseFloat(e.target.value);
      if (!isNaN(rate) && rate >= 0.5 && rate <= 2.0) {
        this.audioSettings.rate = rate;
        this.elements.rateValue.textContent = rate.toFixed(1);
        this.saveSettings();
      }
    });
    
    this.elements.audioVoice.addEventListener('change', (e) => {
      const voiceIndex = parseInt(e.target.value);
      if (!isNaN(voiceIndex) && voiceIndex >= 0) {
        this.audioSettings.voiceIndex = voiceIndex;
        this.saveSettings();
      }
    });
    
    this.elements.testAudioBtn.addEventListener('click', () => {
      this.speakWord('привет');
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
    // Enable all keys at start, only disable wrong attempts
    const keys = this.elements.russianKeyboard.querySelectorAll('.keyboard-key');
    keys.forEach(key => {
      const letter = key.dataset.letter;
      if (this.wrongLettersThisWord.has(letter)) {
        key.classList.add('disabled');
      } else {
        key.classList.remove('disabled');
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
    
    // Reset wrong letters tracking for new word
    this.wrongLettersThisWord.clear();
    
    this.renderWord();
    this.clearFeedback();
    this.elements.letterInput.value = '';
    this.elements.letterInput.disabled = false;
    this.elements.submitBtn.disabled = false;
    this.elements.hintBtn.disabled = false;
    
    this.updateStats();
    this.updateKeyboard();
    this.showFlashcard();
    
    // Autoplay audio if enabled
    if (this.audioSettings.autoplay && this.audioSettings.enabled) {
      // Small delay to ensure the word is rendered
      setTimeout(() => this.speakWord(this.currentWord), 300);
    }
  }

  renderWord() {
    this.elements.wordContainer.innerHTML = '';
    
    // Create word display wrapper
    const wordWrapper = document.createElement('div');
    wordWrapper.className = 'word-wrapper';
    
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
      
      wordWrapper.appendChild(letterSpan);
    }
    
    this.elements.wordContainer.appendChild(wordWrapper);
    
    // Add audio button
    if (this.audioSettings.enabled && 'speechSynthesis' in window) {
      const audioBtn = document.createElement('button');
      audioBtn.className = 'audio-btn';
      audioBtn.innerHTML = '🔊';
      audioBtn.setAttribute('aria-label', 'Pronounce word');
      audioBtn.setAttribute('title', 'Listen to pronunciation (Space)');
      audioBtn.addEventListener('click', () => this.speakWord(this.currentWord));
      this.elements.wordContainer.appendChild(audioBtn);
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
      
      // Mark this letter as wrong for this word
      this.wrongLettersThisWord.add(userAnswer);
      this.updateKeyboard();
      
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

  // Audio methods
  initAudio() {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech Synthesis API not supported in this browser');
      this.audioSettings.enabled = false;
      return;
    }

    // Load available voices
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      this.russianVoices = voices.filter(voice => voice.lang.startsWith('ru'));
      
      // Fallback to any voice if no Russian voices available
      if (this.russianVoices.length === 0) {
        console.warn('No Russian voices found, using default voice');
        this.russianVoices = voices.length > 0 ? [voices[0]] : [];
      }
      
      // Populate voice selector
      this.populateVoiceSelector();
    };

    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  populateVoiceSelector() {
    if (!this.elements.audioVoice) return;
    
    this.elements.audioVoice.innerHTML = '';
    
    if (this.russianVoices.length === 0) {
      const option = document.createElement('option');
      option.value = '0';
      option.textContent = 'No Russian voices available';
      this.elements.audioVoice.appendChild(option);
      return;
    }
    
    this.russianVoices.forEach((voice, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `${voice.name} (${voice.lang})`;
      this.elements.audioVoice.appendChild(option);
    });
    
    // Set current selection
    this.elements.audioVoice.value = this.audioSettings.voiceIndex;
  }

  speakWord(text) {
    if (!this.audioSettings.enabled || !text) {
      return;
    }

    if (!('speechSynthesis' in window)) {
      console.warn('Speech Synthesis not available');
      return;
    }

    // Stop any currently playing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU';
    
    // Validate and clamp rate
    const rate = Math.max(0.5, Math.min(2.0, this.audioSettings.rate));
    utterance.rate = rate;
    
    // Validate and clamp volume
    const volume = Math.max(0, Math.min(1, this.audioSettings.volume));
    utterance.volume = volume;

    // Use selected Russian voice if available
    if (this.russianVoices.length > 0) {
      const voiceIndex = Math.max(0, Math.min(this.audioSettings.voiceIndex, this.russianVoices.length - 1));
      utterance.voice = this.russianVoices[voiceIndex];
    }

    // Visual feedback
    utterance.onstart = () => {
      this.isPlaying = true;
      this.updateAudioButtonState();
    };

    utterance.onend = () => {
      this.isPlaying = false;
      this.updateAudioButtonState();
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      this.isPlaying = false;
      this.updateAudioButtonState();
    };

    speechSynthesis.speak(utterance);
  }

  updateAudioButtonState() {
    const audioBtn = document.querySelector('.audio-btn');
    if (audioBtn) {
      if (this.isPlaying) {
        audioBtn.classList.add('playing');
      } else {
        audioBtn.classList.remove('playing');
      }
    }
  }

  async loadSettings() {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        if (data.audio) {
          this.audioSettings = { ...this.audioSettings, ...data.audio };
          this.applySettingsToUI();
        }
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  }

  applySettingsToUI() {
    if (this.elements.audioEnabled) {
      this.elements.audioEnabled.checked = this.audioSettings.enabled;
    }
    if (this.elements.audioAutoplay) {
      this.elements.audioAutoplay.checked = this.audioSettings.autoplay;
    }
    if (this.elements.audioRate) {
      this.elements.audioRate.value = this.audioSettings.rate;
      this.elements.rateValue.textContent = this.audioSettings.rate.toFixed(1);
    }
    if (this.elements.audioVoice) {
      this.elements.audioVoice.value = this.audioSettings.voiceIndex;
    }
  }

  async saveSettings() {
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          audio: this.audioSettings
        })
      });
    } catch (err) {
      console.error('Error saving settings:', err);
    }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new FlashcardApp();
});
