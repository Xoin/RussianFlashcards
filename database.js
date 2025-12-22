const fs = require('fs').promises;
const path = require('path');

class Database {
  constructor(dbPath = './flashcards.json') {
    this.dbPath = dbPath;
    this.data = {
      letterMistakes: [],
      userProgress: [],
      settings: {},
      sentences: [],
      wordDefinitions: [],
      srsItems: [],
      nextMistakeId: 1,
      nextProgressId: 1,
      nextSentenceId: 1,
      nextDefinitionId: 1,
      nextSrsItemId: 1
    };
  }

  async init() {
    try {
      const fileExists = await fs.access(this.dbPath).then(() => true).catch(() => false);
      if (fileExists) {
        const content = await fs.readFile(this.dbPath, 'utf-8');
        this.data = JSON.parse(content);
        // Ensure ID counters exist for backwards compatibility
        if (!this.data.nextMistakeId) {
          const idsWithValues = this.data.letterMistakes.filter(m => m.id).map(m => m.id);
          this.data.nextMistakeId = idsWithValues.length > 0
            ? Math.max(...idsWithValues) + 1
            : 1;
        }
        if (!this.data.nextProgressId) {
          const idsWithValues = this.data.userProgress.filter(p => p.id).map(p => p.id);
          this.data.nextProgressId = idsWithValues.length > 0
            ? Math.max(...idsWithValues) + 1
            : 1;
        }
        // Ensure settings exist for backwards compatibility
        if (!this.data.settings) {
          this.data.settings = {};
        }
        // Ensure sentences and definitions arrays exist for backwards compatibility
        if (!this.data.sentences) {
          this.data.sentences = [];
        }
        if (!this.data.wordDefinitions) {
          this.data.wordDefinitions = [];
        }
        // Ensure ID counters exist for sentences and definitions
        if (!this.data.nextSentenceId) {
          const idsWithValues = this.data.sentences.filter(s => s.id).map(s => s.id);
          this.data.nextSentenceId = idsWithValues.length > 0
            ? idsWithValues.reduce((max, id) => id > max ? id : max, 0) + 1
            : 1;
        }
        if (!this.data.nextDefinitionId) {
          const idsWithValues = this.data.wordDefinitions.filter(d => d.id).map(d => d.id);
          this.data.nextDefinitionId = idsWithValues.length > 0
            ? idsWithValues.reduce((max, id) => id > max ? id : max, 0) + 1
            : 1;
        }
        // Ensure SRS items array exists for backwards compatibility
        if (!this.data.srsItems) {
          this.data.srsItems = [];
        }
        // Ensure ID counter exists for SRS items
        if (!this.data.nextSrsItemId) {
          const idsWithValues = this.data.srsItems.filter(s => s.id).map(s => s.id);
          this.data.nextSrsItemId = idsWithValues.length > 0
            ? idsWithValues.reduce((max, id) => id > max ? id : max, 0) + 1
            : 1;
        }
      } else {
        await this.save();
      }
    } catch (err) {
      // If file doesn't exist or is invalid, start fresh
      await this.save();
    }
  }

  async save() {
    await fs.writeFile(this.dbPath, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  async recordMistake(letter, word, position) {
    this.data.letterMistakes.push({
      id: this.data.nextMistakeId++,
      letter,
      word,
      position,
      lastMistake: new Date().toISOString()
    });
    await this.save();
  }

  async getLetterMistakes() {
    const letterCounts = {};
    
    this.data.letterMistakes.forEach(mistake => {
      if (!letterCounts[mistake.letter]) {
        letterCounts[mistake.letter] = {
          letter: mistake.letter,
          count: 0,
          lastMistake: mistake.lastMistake
        };
      }
      letterCounts[mistake.letter].count++;
      if (mistake.lastMistake > letterCounts[mistake.letter].lastMistake) {
        letterCounts[mistake.letter].lastMistake = mistake.lastMistake;
      }
    });

    return Object.values(letterCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  async getProblematicLetters(limit = 5) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const recentMistakes = this.data.letterMistakes.filter(m => m.lastMistake > sevenDaysAgo);
    
    const letterCounts = {};
    recentMistakes.forEach(mistake => {
      if (!letterCounts[mistake.letter]) {
        letterCounts[mistake.letter] = { letter: mistake.letter, count: 0 };
      }
      letterCounts[mistake.letter].count++;
    });

    return Object.values(letterCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  async updateProgress(correct, incorrect) {
    this.data.userProgress.push({
      id: this.data.nextProgressId++,
      sessionDate: new Date().toISOString(),
      totalQuestions: correct + incorrect,
      correctAnswers: correct,
      incorrectAnswers: incorrect
    });
    await this.save();
  }

  async getRecentProgress(days = 7) {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const recentProgress = this.data.userProgress.filter(p => p.sessionDate > cutoffDate);
    
    return recentProgress.reduce((acc, session) => {
      acc.total += session.totalQuestions;
      acc.correct += session.correctAnswers;
      acc.incorrect += session.incorrectAnswers;
      return acc;
    }, { total: 0, correct: 0, incorrect: 0 });
  }

  async getSettings() {
    return this.data.settings || {};
  }

  async saveSettings(settings) {
    this.data.settings = settings;
    await this.save();
  }

  // Sentence management methods
  async addSentence(word, sentence, translation, targetPosition, difficulty = 'beginner') {
    this.data.sentences.push({
      id: this.data.nextSentenceId++,
      word,
      sentence,
      translation,
      targetPosition,
      difficulty,
      createdAt: new Date().toISOString()
    });
    await this.save();
  }

  async getSentencesByWord(word, limit = 3) {
    return this.data.sentences
      .filter(s => s.word.toLowerCase() === word.toLowerCase())
      .slice(0, limit);
  }

  async getRandomSentence(difficulty = null) {
    let sentences = this.data.sentences;
    if (difficulty) {
      sentences = sentences.filter(s => s.difficulty === difficulty);
    }
    if (sentences.length === 0) return null;
    return sentences[Math.floor(Math.random() * sentences.length)];
  }

  async getAllSentences() {
    return this.data.sentences;
  }

  // Word definition management methods
  async addWordDefinition(word, translation, partOfSpeech, gender = null, definition = null) {
    this.data.wordDefinitions.push({
      id: this.data.nextDefinitionId++,
      word,
      translation,
      partOfSpeech,
      gender,
      definition
    });
    await this.save();
  }

  async getWordDefinition(word) {
    return this.data.wordDefinitions.find(
      d => d.word.toLowerCase() === word.toLowerCase()
    );
  }

  async getAllDefinitions() {
    return this.data.wordDefinitions;
  }

  // Migrate/import initial data
  async importSentences(sentences) {
    for (const sentence of sentences) {
      await this.addSentence(
        sentence.word,
        sentence.sentence,
        sentence.translation,
        sentence.targetPosition,
        sentence.difficulty || 'beginner'
      );
    }
  }

  async importDefinitions(definitions) {
    for (const definition of definitions) {
      await this.addWordDefinition(
        definition.word,
        definition.translation,
        definition.partOfSpeech,
        definition.gender,
        definition.definition
      );
    }
  }

  // ========================================
  // SM-2 Spaced Repetition System Methods
  // ========================================

  // SM-2 Algorithm Constants
  static SM2_MINIMUM_EASE_FACTOR = 1.3;
  static SM2_INITIAL_EASE_FACTOR = 2.5;
  static SM2_FAILURE_QUALITY_THRESHOLD = 3;
  static SM2_EASE_FACTOR_DECREASE = 0.2;
  static SM2_INTERVAL_FIRST_REVIEW = 1;
  static SM2_INTERVAL_SECOND_REVIEW = 6;
  static MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
  
  // SRS Stage Thresholds (in days)
  static SRS_LEARNING_THRESHOLD = 21;
  static SRS_YOUNG_THRESHOLD = 60;

  /**
   * Calculate next review using SM-2 algorithm
   * @param {number} quality - Quality rating (1-5): 1=Again, 3=Hard, 4=Good, 5=Easy
   * @param {object} item - Current SRS item with easeFactor, interval, repetitions
   * @returns {object} Updated values: easeFactor, interval, repetitions, nextReviewDate
   */
  calculateSM2(quality, item) {
    // quality: 1-5 (1=Again/forgot, 3=Hard, 4=Good, 5=Easy/perfect)
    
    if (quality < Database.SM2_FAILURE_QUALITY_THRESHOLD) {
      // Reset on failure (Again or rating below Hard)
      return {
        repetitions: 0,
        interval: Database.SM2_INTERVAL_FIRST_REVIEW,
        easeFactor: Math.max(Database.SM2_MINIMUM_EASE_FACTOR, item.easeFactor - Database.SM2_EASE_FACTOR_DECREASE),
        nextReviewDate: new Date(Date.now() + Database.SM2_INTERVAL_FIRST_REVIEW * Database.MILLISECONDS_PER_DAY).toISOString()
      };
    }
    
    // Calculate new ease factor
    const newEF = Math.max(Database.SM2_MINIMUM_EASE_FACTOR, 
      item.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );
    
    // Calculate new interval
    let newInterval;
    if (item.repetitions === 0) {
      newInterval = Database.SM2_INTERVAL_FIRST_REVIEW;
    } else if (item.repetitions === 1) {
      newInterval = Database.SM2_INTERVAL_SECOND_REVIEW;
    } else {
      newInterval = Math.round(item.interval * newEF);
    }
    
    return {
      repetitions: item.repetitions + 1,
      interval: newInterval,
      easeFactor: newEF,
      nextReviewDate: new Date(Date.now() + newInterval * Database.MILLISECONDS_PER_DAY).toISOString()
    };
  }

  /**
   * Get or create an SRS item for a letter-word-position combination
   */
  async getOrCreateSrsItem(letter, word, position) {
    // Find existing item
    const existing = this.data.srsItems.find(
      item => item.letter === letter && 
              item.word === word && 
              item.position === position
    );
    
    if (existing) {
      return existing;
    }
    
    // Create new item with initial values
    const newItem = {
      id: this.data.nextSrsItemId++,
      letter,
      word,
      position,
      easeFactor: Database.SM2_INITIAL_EASE_FACTOR,
      interval: 0,
      repetitions: 0,
      nextReviewDate: new Date().toISOString(),
      lastReviewDate: null,
      createdAt: new Date().toISOString()
    };
    
    this.data.srsItems.push(newItem);
    await this.save();
    
    return newItem;
  }

  /**
   * Update SRS item after review
   */
  async updateSrsItem(itemId, quality, responseTime = null) {
    const item = this.data.srsItems.find(i => i.id === itemId);
    if (!item) {
      throw new Error(`SRS item ${itemId} not found`);
    }
    
    // Calculate new values using SM-2
    const updates = this.calculateSM2(quality, item);
    
    // Update the item
    Object.assign(item, updates);
    item.lastReviewDate = new Date().toISOString();
    if (responseTime !== null) {
      item.lastResponseTime = responseTime;
    }
    
    await this.save();
    return item;
  }

  /**
   * Get all items due for review
   */
  async getDueItems() {
    const now = new Date().toISOString();
    return this.data.srsItems.filter(item => item.nextReviewDate <= now);
  }

  /**
   * Get count of items due for review
   */
  async getDueCount() {
    const dueItems = await this.getDueItems();
    return dueItems.length;
  }

  /**
   * Get new items (never reviewed)
   */
  async getNewItems(limit = 5) {
    return this.data.srsItems
      .filter(item => item.repetitions === 0 && item.lastReviewDate === null)
      .slice(0, limit);
  }

  /**
   * Get SRS statistics distribution
   */
  async getSrsStats() {
    const stats = {
      new: 0,        // 0 reviews
      learning: 0,   // < 21 day interval
      young: 0,      // 21-60 day interval
      mature: 0,     // > 60 day interval
      total: this.data.srsItems.length
    };
    
    this.data.srsItems.forEach(item => {
      if (item.repetitions === 0) {
        stats.new++;
      } else if (item.interval < Database.SRS_LEARNING_THRESHOLD) {
        stats.learning++;
      } else if (item.interval <= Database.SRS_YOUNG_THRESHOLD) {
        stats.young++;
      } else {
        stats.mature++;
      }
    });
    
    return stats;
  }

  /**
   * Migrate existing letter mistakes to SRS items
   * Creates SRS items based on historical mistake data
   */
  async migrateLetterMistakesToSrs() {
    // Check if migration has already been done
    if (this.data.srsItems.length > 0) {
      console.log('SRS items already exist, skipping migration');
      return;
    }
    
    // Group mistakes by letter-word-position
    const mistakeGroups = {};
    
    this.data.letterMistakes.forEach(mistake => {
      const key = `${mistake.letter}:${mistake.word}:${mistake.position}`;
      if (!mistakeGroups[key]) {
        mistakeGroups[key] = {
          letter: mistake.letter,
          word: mistake.word,
          position: mistake.position,
          count: 0,
          lastMistake: mistake.lastMistake
        };
      }
      mistakeGroups[key].count++;
      if (mistake.lastMistake > mistakeGroups[key].lastMistake) {
        mistakeGroups[key].lastMistake = mistake.lastMistake;
      }
    });
    
    // Create SRS items from mistake groups
    for (const key in mistakeGroups) {
      const group = mistakeGroups[key];
      
      // Calculate initial ease factor based on historical accuracy
      // More mistakes = lower ease factor
      const errorRate = Math.min(group.count / 10, 1); // Normalize to 0-1
      const basedOnErrors = 2.5 - (errorRate * 0.8); // Range: 1.7 - 2.5
      const easeFactor = Math.max(1.3, basedOnErrors);
      
      // Calculate initial interval based on time since last mistake
      const daysSinceLastMistake = (Date.now() - new Date(group.lastMistake).getTime()) / (24 * 60 * 60 * 1000);
      let interval = 1;
      let repetitions = 0;
      
      if (daysSinceLastMistake > 7) {
        interval = 6;
        repetitions = 1;
      }
      
      const srsItem = {
        id: this.data.nextSrsItemId++,
        letter: group.letter,
        word: group.word,
        position: group.position,
        easeFactor,
        interval,
        repetitions,
        nextReviewDate: new Date().toISOString(), // Due now for review
        lastReviewDate: group.lastMistake,
        createdAt: new Date().toISOString()
      };
      
      this.data.srsItems.push(srsItem);
    }
    
    await this.save();
    console.log(`Migrated ${this.data.srsItems.length} items to SRS system`);
  }

  async close() {
    // Save any pending changes
    await this.save();
  }
}

module.exports = Database;
