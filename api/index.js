const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../public')));

console.log('🔧 Startup - Checking environment...');
console.log('POSTGRES_URL present:', !!process.env.POSTGRES_URL);
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');

// Parse connection string to handle SSL properly
let pgConfig = {
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
};

if (process.env.POSTGRES_URL) {
  // Remove sslmode from URL and let our ssl config handle it
  const urlWithoutSSL = process.env.POSTGRES_URL.replace(/[?&]sslmode=[^&]*/g, '').replace(/[?&]$/, '');
  pgConfig.connectionString = urlWithoutSSL;
  console.log('📝 Connection string parsed (SSL will be handled by config)');
}

// Database connection
const pool = new Pool(pgConfig);

pool.on('error', (err) => {
  console.error('❌ Unexpected pool error:', err.message);
});

pool.on('connect', () => {
  console.log('✅ New pool connection created');
});

// Initialize database schema
async function initDatabase() {
  try {
    console.log('🔌 Attempting database connection...');
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
    
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
    console.log('✅ Database schema initialized');
  } catch (err) {
    console.error('❌ Database error:', {
      message: err.message,
      code: err.code,
      env_set: !!process.env.POSTGRES_URL
    });
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
      res.json({});
    }
  } catch (err) {
    console.error(`❌ GET /api/${req.params.section} error:`, err.message);
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
    
    console.log(`✅ POST /api/${section} saved successfully`);
    res.json({ success: true, message: `${section} saved` });
  } catch (err) {
    console.error(`❌ POST /api/${req.params.section} error:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Clear all data (admin only)
app.post('/api/reset', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM site_data WHERE key LIKE $1', ['squat_%']);
    console.log(`✅ Reset: deleted ${result.rowCount} rows`);
    res.json({ success: true, message: 'All data reset' });
  } catch (err) {
    console.error('❌ Reset error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    const urlSet = process.env.POSTGRES_URL ? 'SET ✅' : 'NOT SET ❌';
    res.json({ 
      status: 'ok',
      database: 'connected',
      timestamp: result.rows[0].now,
      postgres_url: urlSet
    });
  } catch (err) {
    const urlSet = process.env.POSTGRES_URL ? 'SET' : 'NOT SET';
    console.error(`❌ Health check failed (POSTGRES_URL ${urlSet}):`, err.message, err.code);
    res.status(500).json({ 
      status: 'error',
      database: 'disconnected',
      error: err.message,
      code: err.code,
      postgres_url: urlSet
    });
  }
});

// Fallback - serve index.html for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
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

