const http = require('http');

class LMStudioClient {
  constructor(host = 'localhost', port = 1234, model = null) {
    this.host = host;
    this.port = port;
    this.model = model;
    this.baseUrl = `http://${host}:${port}`;
  }

  updateConfig(host, port, model = null) {
    this.host = host;
    this.port = port;
    this.model = model;
    this.baseUrl = `http://${host}:${port}`;
  }

  generateCompletion(prompt, maxTokens = 100) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({
        model: this.model,
        prompt: prompt,
        max_tokens: maxTokens,
        temperature: 0.7,
        stop: ["\n\n", "###"]
      });

      const options = {
        hostname: this.host,
        port: this.port,
        path: '/v1/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 30000
      };

      const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            if (res.statusCode === 200) {
              const response = JSON.parse(data);
              if (response.choices && response.choices.length > 0 && response.choices[0].text) {
                resolve(response.choices[0].text.trim());
              } else {
                reject(new Error('Invalid response structure from LM Studio'));
              }
            } else {
              reject(new Error(`LM Studio returned status ${res.statusCode}`));
            }
          } catch (err) {
            reject(err);
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('LM Studio request timeout'));
      });

      req.write(postData);
      req.end();
    });
  }

  async generateWords(count, focusLetters = [], errorRate = 0) {
    // Generate simple Russian words focusing on specific letters if provided
    // If LM Studio is unavailable, fall back to predefined words
    const prompt = focusLetters.length > 0
      ? `Generate ${count} simple Russian words (3-5 letters) that contain these letters: ${focusLetters.join(', ')}. List only the words, one per line.`
      : `Generate ${count} simple Russian words (3-5 letters) for beginners. List only the words, one per line.`;

    try {
      const response = await this.generateCompletion(prompt, 150);
      const words = response.split('\n')
        .map(w => w.trim())
        .filter(w => w.length > 0 && w.length <= 10)
        .slice(0, count);
      
      if (words.length > 0) {
        return words;
      }
    } catch (err) {
      console.log('LM Studio unavailable, using fallback words:', err.message);
    }

    // Fallback to predefined Russian words if LM Studio is unavailable
    return this.getFallbackWords(count, focusLetters);
  }

  getFallbackWords(count, focusLetters = []) {
    const russianWords = [
      'дом', 'кот', 'сок', 'мир', 'лес', 'нос', 'рот', 'день', 'ночь', 'хлеб',
      'вода', 'небо', 'море', 'поле', 'окно', 'стол', 'стул', 'рука', 'нога', 'глаз',
      'ухо', 'нож', 'вилка', 'ложка', 'чашка', 'тарелка', 'книга', 'ручка', 'карандаш',
      'мама', 'папа', 'сын', 'дочь', 'брат', 'друг', 'враг', 'путь', 'лист', 'цвет',
      'свет', 'мост', 'гора', 'река', 'озеро', 'город', 'село', 'зима', 'весна', 'лето',
      'осень', 'утро', 'вечер', 'время', 'место', 'слово', 'число', 'буква', 'звук'
    ];

    let words = [...russianWords];
    
    if (focusLetters.length > 0) {
      // Filter words containing focus letters
      const filtered = words.filter(word => 
        focusLetters.some(letter => word.includes(letter))
      );
      if (filtered.length >= count) {
        words = filtered;
      }
    }

    // Shuffle and return requested count
    const shuffled = words.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  async generateLesson(errorRate, problematicLetters = []) {
    // Determine lesson length based on error rate
    const lessonLength = this.calculateLessonLength(errorRate);
    
    // Generate words focusing on problematic letters if any
    const focusLetters = problematicLetters.slice(0, 3).map(l => l.letter);
    const words = await this.generateWords(lessonLength, focusLetters, errorRate);

    return {
      words: words,
      length: lessonLength,
      focusLetters: focusLetters
    };
  }

  calculateLessonLength(errorRate) {
    // Shorter lessons when error rate is high, longer when doing well
    if (errorRate > 0.5) {
      return 5; // High error rate: 5 words
    } else if (errorRate > 0.3) {
      return 7; // Medium error rate: 7 words
    } else if (errorRate > 0.15) {
      return 10; // Low error rate: 10 words
    } else {
      return 12; // Very low error rate: 12 words
    }
  }

  async generateContextualSentence(word, difficulty = 'beginner') {
    const levelMap = {
      'beginner': 'A1-A2',
      'intermediate': 'B1-B2',
      'advanced': 'C1-C2'
    };
    const level = levelMap[difficulty] || 'A1-A2';

    const prompt = `Create a simple Russian sentence using the word "${word}".
The sentence should be appropriate for ${level} level learners.
Format your response exactly as:
Russian: [sentence]
English: [translation]`;

    try {
      const response = await this.generateCompletion(prompt, 150);
      return this.parseGeneratedSentence(response, word);
    } catch (err) {
      console.log('LM Studio unavailable for sentence generation:', err.message);
      return null;
    }
  }

  parseGeneratedSentence(response, word) {
    try {
      const lines = response.split('\n').filter(l => l.trim());
      
      let russian = '';
      let english = '';
      
      for (const line of lines) {
        if (line.toLowerCase().includes('russian:')) {
          russian = line.split(':').slice(1).join(':').trim();
        } else if (line.toLowerCase().includes('english:')) {
          english = line.split(':').slice(1).join(':').trim();
        }
      }
      
      if (!russian || !english) {
        return null;
      }
      
      // Find target word position in sentence - look for exact word match
      const words = russian.split(' ');
      const targetWord = word.toLowerCase();
      const targetPosition = words.findIndex(w => {
        // Remove punctuation and compare
        const cleanWord = w.toLowerCase().replace(/[.,!?;:]/g, '');
        return cleanWord === targetWord;
      });
      
      if (targetPosition === -1) {
        return null;
      }
      
      return {
        sentence: russian,
        translation: english,
        targetPosition
      };
    } catch (err) {
      console.error('Error parsing generated sentence:', err);
      return null;
    }
  }

  async testConnection() {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.host,
        port: this.port,
        path: '/v1/models',
        method: 'GET',
        timeout: 5000
      };

      const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve({ connected: true, message: 'Successfully connected to LM Studio' });
          } else {
            reject(new Error(`LM Studio returned status ${res.statusCode}`));
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Connection timeout'));
      });

      req.end();
    });
  }

  async getAvailableModels() {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.host,
        port: this.port,
        path: '/v1/models',
        method: 'GET',
        timeout: 10000
      };

      const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            if (res.statusCode === 200) {
              const response = JSON.parse(data);
              if (response.data && Array.isArray(response.data)) {
                const models = response.data.map(model => ({
                  id: model.id,
                  name: model.id,
                  created: model.created,
                  owned_by: model.owned_by
                }));
                resolve(models);
              } else {
                reject(new Error('Invalid response structure from LM Studio'));
              }
            } else {
              reject(new Error(`LM Studio returned status ${res.statusCode}`));
            }
          } catch (err) {
            reject(err);
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }
}

module.exports = LMStudioClient;
