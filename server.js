const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const Database = require('./database');
const LMStudioClient = require('./lmstudio');

const PORT = 3000;
const db = new Database();
const lmStudio = new LMStudioClient();

// Initialize database and start server
async function startServer() {
  try {
    await db.init();
    console.log('Database initialized successfully');
    
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
      
      const problematicLetters = await db.getProblematicLetters(5);
      const lesson = await lmStudio.generateLesson(errorRate, problematicLetters);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(lesson));
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
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ mistakes, progress }));
    } catch (err) {
      console.error('Error fetching statistics:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to fetch statistics' }));
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
