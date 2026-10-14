const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

console.log('🔧 Startup - Checking environment...');
console.log('POSTGRES_URL present:', !!process.env.POSTGRES_URL);
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');

// Parse connection string and rebuild without problematic params
let pgConfig = {
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
};

if (process.env.POSTGRES_URL) {
  try {
    const url = new URL(process.env.POSTGRES_URL);
    pgConfig.user = url.username;
    pgConfig.password = url.password;
    pgConfig.host = url.hostname;
    pgConfig.port = url.port || 5432;
    pgConfig.database = url.pathname.slice(1); // Remove leading /
    console.log('✅ Connection string parsed successfully');
    console.log(`   Host: ${pgConfig.host}:${pgConfig.port}, DB: ${pgConfig.database}`);
  } catch (err) {
    console.error('❌ Failed to parse POSTGRES_URL:', err.message);
    pgConfig.connectionString = process.env.POSTGRES_URL;
  }
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

// Health check - simple version first
app.get('/api/health', (req, res) => {
  const urlSet = process.env.POSTGRES_URL ? 'SET ✅' : 'NOT SET ❌';
  res.json({ 
    status: 'server_ok',
    postgres_url: urlSet,
    time: new Date().toISOString()
  });
});

// Database health check
app.get('/api/db-health', async (req, res) => {
  try {
    console.log('Testing database connection...');
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'ok',
      database: 'connected',
      timestamp: result.rows[0].now
    });
  } catch (err) {
    const urlSet = process.env.POSTGRES_URL ? 'SET' : 'NOT SET';
    console.error(`❌ DB health check failed (POSTGRES_URL ${urlSet}):`, err.message, err.code);
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

