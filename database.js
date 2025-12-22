const fs = require('fs').promises;
const path = require('path');

class Database {
  constructor(dbPath = './flashcards.json') {
    this.dbPath = dbPath;
    this.data = {
      letterMistakes: [],
      userProgress: [],
      nextMistakeId: 1,
      nextProgressId: 1
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
          this.data.nextMistakeId = this.data.letterMistakes.length > 0
            ? Math.max(...this.data.letterMistakes.filter(m => m.id).map(m => m.id), 0) + 1
            : 1;
        }
        if (!this.data.nextProgressId) {
          this.data.nextProgressId = this.data.userProgress.length > 0
            ? Math.max(...this.data.userProgress.filter(p => p.id).map(p => p.id), 0) + 1
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

  async close() {
    // Save any pending changes
    await this.save();
  }
}

module.exports = Database;
