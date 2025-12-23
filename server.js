const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const Database = require('./database');
const LMStudioClient = require('./lmstudio');

const PORT = 3000;
const db = new Database();
const lmStudio = new LMStudioClient();

// Validation helper functions
function validateLMStudioHostPort(host, port) {
  if (!host || typeof host !== 'string') {
    return { valid: false, error: 'Invalid host parameter' };
  }
  
  const portNum = parseInt(port);
  if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
    return { valid: false, error: 'Invalid port parameter (must be 1-65535)' };
  }
  
  return { valid: true, host, port: portNum };
}

// Initialize database and start server
async function startServer() {
  try {
    await db.init();
    console.log('Database initialized successfully');
    
    // Check migration status and display warnings
    const migrationStatus = db.checkMigrationStatus();
    if (migrationStatus.needsMigration) {
      console.log('\n⚠️  WARNING: Initial data not loaded');
      console.log('═══════════════════════════════════════════════════════');
      migrationStatus.warnings.forEach(warning => console.log(warning));
      console.log('═══════════════════════════════════════════════════════');
      console.log('The application will work, but vocabulary tracking and');
      console.log('contextual learning features will be limited.\n');
    }
    
    // Load LM Studio settings from database
    const settings = await db.getSettings();
    if (settings.lmstudio) {
      const host = settings.lmstudio.host || 'localhost';
      const port = settings.lmstudio.port || 1234;
      const model = settings.lmstudio.model || null;
      lmStudio.updateConfig(host, port, model);
      console.log(`LM Studio configured: ${host}:${port}${model ? ` with model ${model}` : ''}`);
    }
    
    server.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}/`);
    });
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API Routes
  if (pathname === '/api/lesson' && req.method === 'GET') {
    try {
      const progress = await db.getRecentProgress(7);
      const errorRate = progress.total > 0 
        ? progress.incorrect / progress.total 
        : 0;
      
      // Get user level
      const userLevel = await db.getUserLevel();
      
      // Get due items for review (prioritized)
      const dueItems = await db.getDueItems();
      
      // Get new items to introduce (5 per lesson)
      const newItems = await db.getNewItems(5);
      
      // Combine due and new items for the lesson
      const srsItems = [...dueItems, ...newItems];
      
      // Extract unique words from SRS items
      const srsWords = [...new Set(srsItems.map(item => item.word))];
      
      // If we don't have enough SRS words, generate additional ones
      let lessonWords = [...srsWords];
      
      if (lessonWords.length === 0) {
        // No SRS items yet, use frequency-based word selection if available
        if (db.data.frequencyWords && db.data.frequencyWords.length > 0) {
          const frequencyWords = await db.selectWordsByLevel(
            userLevel.current_level, 
            10, 
            true // prioritize problematic letters
          );
          lessonWords = frequencyWords;
        } else {
          // Fall back to traditional lesson generation
          const problematicLetters = await db.getProblematicLetters(5);
          const lesson = await lmStudio.generateLesson(errorRate, problematicLetters);
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(lesson));
          return;
        }
      }
      
      // Determine lesson length based on error rate
      const lessonLength = lmStudio.calculateLessonLength(errorRate);
      
      // If we need more words, use frequency-based selection or generate
      if (lessonWords.length < lessonLength) {
        if (db.data.frequencyWords && db.data.frequencyWords.length > 0) {
          const additionalWords = await db.selectWordsByLevel(
            userLevel.current_level,
            lessonLength - lessonWords.length,
            true
          );
          // Filter out words already in lesson (use Set for O(n) performance)
          const lessonWordsSet = new Set(lessonWords);
          const newWords = additionalWords.filter(w => !lessonWordsSet.has(w));
          lessonWords = [...lessonWords, ...newWords];
        } else {
          const problematicLetters = await db.getProblematicLetters(5);
          const focusLetters = problematicLetters.slice(0, 3).map(l => l.letter);
          const additionalWords = await lmStudio.generateWords(
            lessonLength - lessonWords.length, 
            focusLetters, 
            errorRate
          );
          lessonWords = [...lessonWords, ...additionalWords];
        }
      }
      
      // Limit to lesson length
      lessonWords = lessonWords.slice(0, lessonLength);
      
      // Check for level progression
      await db.checkLevelProgression();
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        words: lessonWords,
        length: lessonWords.length,
        dueCount: dueItems.length,
        newCount: newItems.length,
        srsItems: srsItems,
        userLevel: userLevel
      }));
    } catch (err) {
      console.error('Error generating lesson:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to generate lesson' }));
    }
    return;
  }

  if (pathname === '/api/mistake' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        
        // Validate required fields
        if (!data.letter || typeof data.letter !== 'string' ||
            !data.word || typeof data.word !== 'string' ||
            typeof data.position !== 'number' || data.position < 0) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid request data' }));
          return;
        }
        
        await db.recordMistake(data.letter, data.word, data.position);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        console.error('Error recording mistake:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to record mistake' }));
      }
    });
    return;
  }

  if (pathname === '/api/progress' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        
        // Validate progress data
        if (typeof data.correct !== 'number' || data.correct < 0 ||
            typeof data.incorrect !== 'number' || data.incorrect < 0) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid progress data' }));
          return;
        }
        
        await db.updateProgress(data.correct, data.incorrect);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        console.error('Error updating progress:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to update progress' }));
      }
    });
    return;
  }

  if (pathname === '/api/statistics' && req.method === 'GET') {
    try {
      const mistakes = await db.getLetterMistakes();
      const progress = await db.getRecentProgress(7);
      const srsStats = await db.getSrsStats();
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ mistakes, progress, srsStats }));
    } catch (err) {
      console.error('Error fetching statistics:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to fetch statistics' }));
    }
    return;
  }

  // SRS-specific endpoints
  if (pathname === '/api/review' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        
        // Check if this is a request to get or create an item
        if (data.itemId === 0 || !data.itemId) {
          // Get or create SRS item
          if (!data.letter || !data.word || typeof data.position !== 'number') {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing required fields: letter, word, position' }));
            return;
          }
          
          const item = await db.getOrCreateSrsItem(data.letter, data.word, data.position);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, item }));
          return;
        }
        
        // Validate required fields for update
        if (typeof data.itemId !== 'number' || data.itemId < 1) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid itemId' }));
          return;
        }
        
        // Validate quality: Standard SM-2 uses 0-5, but we use 1-5 for clarity
        // Current UI uses: 1 (Again), 3 (Hard), 4 (Good), 5 (Easy)
        // API allows 1-5 for flexibility (quality 2 could be added in future)
        if (typeof data.quality !== 'number' || data.quality < 1 || data.quality > 5) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid quality (must be 1-5)' }));
          return;
        }
        
        const responseTime = data.responseTime || null;
        const updatedItem = await db.updateSrsItem(data.itemId, data.quality, responseTime);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, item: updatedItem }));
      } catch (err) {
        console.error('Error processing review:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to process review' }));
      }
    });
    return;
  }

  if (pathname === '/api/due-count' && req.method === 'GET') {
    try {
      const dueCount = await db.getDueCount();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ dueCount }));
    } catch (err) {
      console.error('Error fetching due count:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to fetch due count' }));
    }
    return;
  }

  if (pathname === '/api/srs-stats' && req.method === 'GET') {
    try {
      const stats = await db.getSrsStats();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(stats));
    } catch (err) {
      console.error('Error fetching SRS stats:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to fetch SRS stats' }));
    }
    return;
  }

  if (pathname === '/api/settings' && req.method === 'GET') {
    try {
      const settings = await db.getSettings();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(settings));
    } catch (err) {
      console.error('Error fetching settings:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to fetch settings' }));
    }
    return;
  }

  if (pathname === '/api/settings' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        
        // Validate settings structure
        if (data.audio && typeof data.audio === 'object') {
          // Validate audio settings
          if (data.audio.enabled !== undefined && typeof data.audio.enabled !== 'boolean') {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid enabled value' }));
            return;
          }
          if (data.audio.autoplay !== undefined && typeof data.audio.autoplay !== 'boolean') {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid autoplay value' }));
            return;
          }
          if (data.audio.rate !== undefined) {
            const rate = parseFloat(data.audio.rate);
            if (isNaN(rate) || rate < 0.5 || rate > 2.0) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Invalid rate value (must be 0.5-2.0)' }));
              return;
            }
          }
          if (data.audio.voiceIndex !== undefined) {
            const voiceIndex = parseInt(data.audio.voiceIndex);
            if (isNaN(voiceIndex) || voiceIndex < 0) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Invalid voiceIndex value' }));
              return;
            }
          }
          if (data.audio.volume !== undefined) {
            const volume = parseFloat(data.audio.volume);
            if (isNaN(volume) || volume < 0 || volume > 1) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Invalid volume value (must be 0-1)' }));
              return;
            }
          }
        }
        
        await db.saveSettings(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        console.error('Error saving settings:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to save settings' }));
      }
    });
    return;
  }

  // LM Studio configuration endpoints
  if (pathname === '/api/lmstudio/test-connection' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        
        // Validate host and port
        const validation = validateLMStudioHostPort(data.host, data.port);
        if (!validation.valid) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: validation.error }));
          return;
        }
        
        // Create a temporary client to test the connection
        const testClient = new LMStudioClient(validation.host, validation.port);
        const result = await testClient.testConnection();
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, ...result }));
      } catch (err) {
        console.error('Error testing LM Studio connection:', err);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: false, 
          connected: false,
          message: err.message || 'Failed to connect to LM Studio'
        }));
      }
    });
    return;
  }

  if (pathname === '/api/lmstudio/models' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        
        // Validate host and port
        const validation = validateLMStudioHostPort(data.host, data.port);
        if (!validation.valid) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: validation.error }));
          return;
        }
        
        // Create a temporary client to fetch models
        const testClient = new LMStudioClient(validation.host, validation.port);
        const models = await testClient.getAvailableModels();
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, models }));
      } catch (err) {
        console.error('Error fetching LM Studio models:', err);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: false, 
          error: err.message || 'Failed to fetch models from LM Studio',
          models: []
        }));
      }
    });
    return;
  }

  if (pathname === '/api/lmstudio/config' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        
        // Use defaults if not provided
        const host = data.host || 'localhost';
        const port = data.port || 1234;
        const model = data.model || null;
        
        // Always validate the final values (even if using defaults)
        const validation = validateLMStudioHostPort(host, port);
        if (!validation.valid) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: validation.error }));
          return;
        }
        
        // Update LM Studio client configuration
        lmStudio.updateConfig(validation.host, validation.port, model);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'LM Studio configuration updated' }));
      } catch (err) {
        console.error('Error updating LM Studio configuration:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to update LM Studio configuration' }));
      }
    });
    return;
  }

  // Get sentences for a specific word
  if (pathname.startsWith('/api/word/') && pathname.includes('/sentences') && req.method === 'GET') {
    try {
      const word = decodeURIComponent(pathname.split('/')[3]);
      
      // Validate word parameter - only allow Cyrillic letters
      if (!/^[а-яА-ЯёЁ]+$/.test(word)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid word parameter' }));
        return;
      }
      
      const sentences = await db.getSentencesByWord(word);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ word, sentences }));
    } catch (err) {
      console.error('Error fetching sentences:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to fetch sentences' }));
    }
    return;
  }

  // Get definition for a specific word
  if (pathname.startsWith('/api/word/') && pathname.includes('/definition') && req.method === 'GET') {
    try {
      const word = decodeURIComponent(pathname.split('/')[3]);
      
      // Validate word parameter - only allow Cyrillic letters
      if (!/^[а-яА-ЯёЁ]+$/.test(word)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid word parameter' }));
        return;
      }
      
      const definition = await db.getWordDefinition(word);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ word, definition }));
    } catch (err) {
      console.error('Error fetching definition:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to fetch definition' }));
    }
    return;
  }

  // Generate a contextual sentence using LM Studio
  if (pathname === '/api/generate-sentence' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        
        // Validate word parameter - must be string with only Cyrillic letters
        if (!data.word || typeof data.word !== 'string' || !/^[а-яА-ЯёЁ]+$/.test(data.word)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid word parameter' }));
          return;
        }
        
        const difficulty = data.difficulty || 'beginner';
        const result = await lmStudio.generateContextualSentence(data.word, difficulty);
        
        if (!result) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Failed to generate sentence' }));
          return;
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          word: data.word,
          sentence: result.sentence,
          translation: result.translation,
          targetPosition: result.targetPosition
        }));
      } catch (err) {
        console.error('Error generating sentence:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to generate sentence' }));
      }
    });
    return;
  }

  // Get user level information
  if (pathname === '/api/user/level' && req.method === 'GET') {
    try {
      const userLevel = await db.getUserLevel();
      const distribution = await db.getVocabularyDistribution();
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ userLevel, distribution }));
    } catch (err) {
      console.error('Error fetching user level:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to fetch user level' }));
    }
    return;
  }

  // Update user level
  if (pathname === '/api/user/level' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        
        // Validate level parameter
        const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        if (data.level && !validLevels.includes(data.level)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid level' }));
          return;
        }
        
        let userLevel;
        if (data.level) {
          userLevel = await db.updateUserLevel(data.level);
        } else {
          userLevel = await db.updateUserLevelSettings(data);
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, userLevel }));
      } catch (err) {
        console.error('Error updating user level:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to update user level' }));
      }
    });
    return;
  }

  // Get words by level
  if (pathname.startsWith('/api/words/level/') && req.method === 'GET') {
    try {
      const level = pathname.split('/')[4];
      
      // Validate level parameter
      const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      if (!validLevels.includes(level)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid level' }));
        return;
      }
      
      const words = await db.getWordsByLevel(level);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ level, words }));
    } catch (err) {
      console.error('Error fetching words by level:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to fetch words by level' }));
    }
    return;
  }

  // Get vocabulary distribution statistics
  if (pathname === '/api/statistics/vocabulary-distribution' && req.method === 'GET') {
    try {
      const distribution = await db.getVocabularyDistribution();
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ distribution }));
    } catch (err) {
      console.error('Error fetching vocabulary distribution:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to fetch vocabulary distribution' }));
    }
    return;
  }

  // Static file serving
  let filePath = pathname === '/' 
    ? './public/index.html' 
    : './public' + pathname;

  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
  };

  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - File Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end('Server Error: ' + error.code + ' ..\n');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Start the server
startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await db.close();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
