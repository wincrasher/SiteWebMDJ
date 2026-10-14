const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Database connection
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL
});

// Initialize database schema
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_data (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS admin_logs (
        id SERIAL PRIMARY KEY,
        action VARCHAR(255),
        target VARCHAR(255),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Database initialized');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

// GET - Retrieve data for a section
app.get('/api/:section', async (req, res) => {
  try {
    const { section } = req.params;
    const result = await pool.query(
      'SELECT value FROM site_data WHERE key = $1',
      [`squat_${section}`]
    );
    
    if (result.rows.length > 0) {
      res.json(result.rows[0].value);
    } else {
      res.json([]);
    }
  } catch (err) {
    console.error('GET error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST - Save data for a section
app.post('/api/:section', async (req, res) => {
  try {
    const { section } = req.params;
    const data = req.body;
    
    await pool.query(
      'INSERT INTO site_data (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP',
      [`squat_${section}`, JSON.stringify(data)]
    );
    
    res.json({ success: true, message: `${section} saved` });
  } catch (err) {
    console.error('POST error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Clear all data (admin only)
app.post('/api/reset', async (req, res) => {
  try {
    await pool.query('DELETE FROM site_data WHERE key LIKE $1', ['squat_%']);
    res.json({ success: true, message: 'All data reset' });
  } catch (err) {
    console.error('Reset error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Initialize on startup
initDatabase();

// Export for Vercel
module.exports = app;

// Local development
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}
  let filePath;
  let isSPARoute = false; // Track if this should fallback to index.html
  
  if (pathname === '/') {
    filePath = path.join(__dirname, '..', 'index.html');
  } else if (pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|json|woff|woff2|ttf|eot)$/i)) {
    // Serve static file directly (with extension)
    filePath = path.join(__dirname, '..', pathname.slice(1));
  } else if (pathname === '/admin') {
    filePath = path.join(__dirname, '..', 'admin.html');
  } else if (pathname.startsWith('/api/')) {
    // API routes - don't fallback to index.html
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found', path: pathname }));
    return;
  } else {
    // Try as HTML file (route without extension) - with SPA fallback
    filePath = path.join(__dirname, '..', pathname.slice(1) + '.html');
    isSPARoute = true;
  }
  
  // Security: prevent path traversal
  const rootPath = path.resolve(path.join(__dirname, '..'));
  const resolvedPath = path.resolve(filePath);
  if (!resolvedPath.startsWith(rootPath)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }
  
  // Determine MIME type
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
  };
  
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  
  // Read and serve the file
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // If it's a request for a file (with extension), return 404
      if (ext) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 - File not found: ' + pathname);
        return;
      }
      
      // For SPA routes without extension, fallback to index.html
      if (isSPARoute) {
        fs.readFile(path.join(__dirname, '..', 'index.html'), (err2, indexData) => {
          if (err2) {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<h1>404 - Page non trouvée</h1>');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(indexData);
          }
        });
        return;
      }
      
      // Unknown route
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 - Not found: ' + pathname);
    } else {
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, immutable'
      });
      res.end(data);
    }
  });
};

