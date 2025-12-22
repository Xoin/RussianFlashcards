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
      nextMistakeId: 1,
      nextProgressId: 1,
      nextSentenceId: 1,
      nextDefinitionId: 1
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
            ? Math.max(...idsWithValues) + 1
            : 1;
        }
        if (!this.data.nextDefinitionId) {
          const idsWithValues = this.data.wordDefinitions.filter(d => d.id).map(d => d.id);
          this.data.nextDefinitionId = idsWithValues.length > 0
            ? Math.max(...idsWithValues) + 1
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

  async close() {
    // Save any pending changes
    await this.save();
  }
}

module.exports = Database;
