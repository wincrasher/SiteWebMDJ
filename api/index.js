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
    console.log(`\n📥 GET /api/${section}`);
    
    const result = await pool.query(
      'SELECT value FROM site_data WHERE key = $1',
      [`squat_${section}`]
    );
    
    if (result.rows.length > 0) {
      // PostgreSQL JSONB is automatically parsed as object
      const value = result.rows[0].value;
      console.log(`   ✅ Retrieved from database, type: ${typeof value}`);
      res.json(value);
    } else {
      // Return appropriate empty default based on section type
      if (section === 'programmation') {
        console.log(`   No data found, returning empty programmation object`);
        res.json({ facebookLink: '', calendarImage: '' });
      } else if (section === 'theme') {
        console.log(`   No data found, returning default theme`);
        res.json('aucun');
      } else if (section === 'heroBannerDuration') {
        console.log(`   No data found, returning default duration`);
        res.json(5);
      } else {
        // Most sections are arrays
        console.log(`   No data found, returning empty array`);
        res.json([]);
      }
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
    let data = req.body;
    
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📥 POST /api/${section}`);
    console.log(`📦 Raw request body type: ${typeof data}`);
    console.log(`📦 Is array: ${Array.isArray(data)}`);
    console.log(`📦 Keys: ${Object.keys(data).join(', ')}`);
    
    // Log all fields for team requests
    if (section === 'team') {
      console.log(`\n📋 Request fields:`);
      console.log(`  - name: "${data.name}" (type: ${typeof data.name})`);
      console.log(`  - id: ${data.id} (type: ${typeof data.id})`);
      console.log(`  - role: "${data.role}" (type: ${typeof data.role})`);
      console.log(`  - gender: "${data.gender}" (type: ${typeof data.gender})`);
      console.log(`  - section: "${data.section}" (type: ${typeof data.section})`);
      console.log(`  - photo: ${data.photo ? `present (${data.photo.length} bytes)` : 'MISSING'}`);
      console.log(`  - facts: ${data.facts ? JSON.stringify(data.facts) : 'MISSING'}`);
    }
    
    // Special handling for team: if single object, upsert into array
    if (section === 'team' && data && !Array.isArray(data)) {
      try {
        console.log('\n👤 Processing single team member:', data.name);
        
        // Validate required fields for single member
        if (!data.name || !data.name.trim()) {
          console.warn('❌ VALIDATION FAILED: name is empty or missing');
          return res.status(400).json({ error: 'Le nom est obligatoire' });
        }
        if (!data.role || !data.role.trim()) {
          console.warn('❌ VALIDATION FAILED: role is empty or missing');
          return res.status(400).json({ error: 'Le rôle est obligatoire' });
        }
        
        // Fetch current team array FIRST to detect if new or existing
        console.log('\n🔍 Fetching current team array from database...');
        const result = await pool.query('SELECT value FROM site_data WHERE key = $1', [`squat_${section}`]);
        let arr = [];
        
        if (result.rows.length > 0) {
          try {
            const stored = result.rows[0].value;
            console.log(`   Stored data type: ${typeof stored}`);
            
            // Handle both cases: if already an object (parsed) or if it's a string (needs parsing)
            if (typeof stored === 'object' && stored !== null) {
              console.log(`   📦 Data is already an object (parsed)`);
              arr = Array.isArray(stored) ? stored : [];
            } else if (typeof stored === 'string') {
              console.log(`   📝 Data is a string, parsing...`);
              console.log(`   First 100 chars: ${stored.substring(0, 100)}`);
              arr = JSON.parse(stored);
            } else {
              console.warn(`   ⚠️ Unknown data type: ${typeof stored}`);
              arr = [];
            }
            
            console.log(`   ✅ Successfully loaded stored data`);
          } catch (parseErr) {
            console.warn(`   ⚠️ Data corruption detected: ${parseErr.message}`);
            console.warn(`   📝 Attempting minimal recovery: keeping empty array`);
            console.warn(`   ⚠️ Note: Existing members may be lost if DB has corrupted format`);
            // **CRITICAL FIX:** Don't completely lose data on corruption
            // Keep arr = [] but log the issue clearly so user can recover from backup
            arr = [];
            // TODO: User should restore from backup JSON if data loss occurred
          }
        } else {
          console.log(`   No existing team data found`);
        }
        
        console.log(`   Array has ${arr.length} members after loading`);
        
        // Validate array
        if (!Array.isArray(arr)) {
          console.warn('   ⚠️ Data is not an array, resetting...');
          arr = [];
        }
        
        // Check if member already exists
        const ix = arr.findIndex(m => m && m.id === data.id);
        // If array was empty due to corruption, we can't know if it's new
        // But if id is small (< 1000), it's likely an existing member from initial data
        const isNewMember = ix < 0 && (!data.id || data.id > 1000);
        
        console.log(`\n🔎 Member lookup:`);
        console.log(`   Looking for id: ${data.id}`);
        console.log(`   Found at index: ${ix}`);
        console.log(`   Array size: ${arr.length}`);
        console.log(`   Is new member: ${isNewMember ? 'YES' : 'NO'} (id is ${data.id < 1000 ? 'small' : 'large'})`);
        
        // Photo is required ONLY for truly new members
        // If id < 1000, it's likely an existing member from initial data, photo optional
        if (isNewMember && !data.photo) {
          console.warn('❌ VALIDATION FAILED: new member without photo');
          return res.status(400).json({ error: 'Une photo est obligatoire pour un nouveau membre' });
        }
        
        // Validate photo is a string if present
        if (data.photo && typeof data.photo !== 'string') {
          console.warn('❌ VALIDATION FAILED: photo is not a string');
          return res.status(400).json({ error: 'Photo must be a base64 string' });
        }
        
        if (data.photo) {
          console.log(`\n📷 Photo provided: ${data.photo.length} bytes`);
        } else {
          console.log(`\n📷 No photo in payload`);
        }
        
        // Upsert: update existing or add new
        if (ix >= 0) {
          console.log(`\n✏️ UPDATING existing member at index ${ix}: ${data.name}`);
          const existingMember = arr[ix];
          
          console.log(`   Existing photo size: ${existingMember.photo ? existingMember.photo.length : 0} bytes`);
          
          // If photo is not in payload, preserve the existing one
          if (!data.photo && existingMember && existingMember.photo) {
            data.photo = existingMember.photo;
            console.log(`   ✅ Preserved existing photo (${existingMember.photo.length} bytes)`);
          } else if (!data.photo) {
            console.log(`   ℹ️ No photo to preserve`);
          }
          
          // Merge with existing data to preserve fields
          const merged = { ...existingMember, ...data };
          console.log(`   ✏️ Merged with existing member data`);
          
          arr[ix] = merged;
        } else {
          console.log(`\n➕ ADDING member: ${data.name}`);
          
          // Ensure all fields are properly typed
          data.name = String(data.name || '');
          data.role = String(data.role || '');
          data.gender = String(data.gender || 'Homme');
          data.section = String(data.section || 'Équipe');
          data.photo = String(data.photo || '');
          data.facts = Array.isArray(data.facts) ? data.facts : [];
          
          arr.push(data);
          console.log(`   Array now has ${arr.length} members`);
        }
        
        data = arr; // Set data to updated array for saving
      } catch (processErr) {
        console.error('❌ Error processing team member:', processErr.message);
        console.error('Stack:', processErr.stack);
        return res.status(400).json({ error: 'Error processing team member: ' + processErr.message });
      }
    }
    
    // Verify data is serializable before saving
    let serialized = '';
    try {
      serialized = JSON.stringify(data);
      console.log(`\n💾 Data to save: ${serialized.length} bytes`);
      console.log(`✅ Data is valid JSON`);
      
      // Extra logging for testimonials
      if (section === 'temoignages') {
        console.log(`\n📋 Testimonials data details:`);
        console.log(`   Is array: ${Array.isArray(data)}`);
        console.log(`   Length: ${Array.isArray(data) ? data.length : 'N/A'}`);
        if (Array.isArray(data) && data.length > 0) {
          console.log(`   First item keys: ${Object.keys(data[0]).join(', ')}`);
          console.log(`   First item: ${JSON.stringify(data[0])}`);
          // Check for problematic values
          for (const [key, val] of Object.entries(data[0])) {
            console.log(`     - ${key}: ${typeof val} = ${JSON.stringify(val)}`);
          }
        }
      }
      
      // Validate and sanitize data for testimonials specifically
      if (section === 'temoignages' && Array.isArray(data)) {
        console.log(`\n🧹 Sanitizing testimonials data...`);
        data = data.map((item, idx) => {
          if (!item || typeof item !== 'object') {
            console.warn(`   Item ${idx}: Invalid type, skipping`);
            return null;
          }
          
          // Ensure required fields exist and are strings
          const cleaned = {
            id: item.id || Date.now() + idx,
            message: String(item.message || '').trim(),
            author: String(item.author || '').trim()
          };
          
          // Remove any non-serializable values
          for (const [key, val] of Object.entries(cleaned)) {
            if (val === null || val === undefined) {
              cleaned[key] = '';
            } else if (typeof val !== 'string' && typeof val !== 'number' && typeof val !== 'boolean') {
              console.log(`   Item ${idx}: Field '${key}' has type ${typeof val}, converting to string`);
              cleaned[key] = String(val);
            }
          }
          
          // Log any changes
          if (JSON.stringify(cleaned) !== JSON.stringify(item)) {
            console.log(`   Item ${idx}: Sanitized - message: "${cleaned.message.slice(0, 40)}...", author: "${cleaned.author}"`);
          }
          
          return cleaned;
        }).filter(item => item !== null);
        
        console.log(`   ✅ Sanitized ${data.length} testimonials`);
        serialized = JSON.stringify(data);
      }
    } catch (serializeErr) {
      console.error('❌ Data serialization failed:', serializeErr.message);
      console.error('Data type:', typeof data, 'Is array:', Array.isArray(data));
      if (Array.isArray(data) && data.length > 0) {
        console.error('First item:', JSON.stringify(data[0]));
      }
      return res.status(400).json({ error: 'Data format is invalid: ' + serializeErr.message });
    }
    
    // Save the data
    // For JSONB columns, we need to send the data in a way PostgreSQL can parse
    console.log(`\n💾 Saving to database...`);
    console.log(`   Section: ${section}`);
    console.log(`   Data type: ${typeof data}, Is array: ${Array.isArray(data)}`);
    if (Array.isArray(data)) {
      console.log(`   Array length: ${data.length}`);
    }
    
    try {
      // For reliability with JSONB, stringify the data before sending to pg
      // The pg driver will handle proper JSON conversion
      const dataToSave = typeof data === 'string' ? data : JSON.stringify(data);
      
      const queryResult = await pool.query(
        'INSERT INTO site_data (key, value) VALUES ($1, $2::jsonb) ON CONFLICT (key) DO UPDATE SET value = $2::jsonb, updated_at = CURRENT_TIMESTAMP',
        [`squat_${section}`, dataToSave]  // Send as stringified JSON for explicit JSONB parsing
      );
      console.log(`✅ Database save successful. Rows affected: ${queryResult.rowCount}`);
    } catch (dbErr) {
      console.error(`\n❌ Database save failed for ${section}`);
      console.error('PostgreSQL Error Code:', dbErr.code || 'unknown');
      console.error('Error Type:', dbErr.name || 'unknown');
      console.error('Error message:', dbErr.message);
      if (dbErr.detail) console.error('Detail:', dbErr.detail);
      if (dbErr.hint) console.error('Hint:', dbErr.hint);
      if (dbErr.position) console.error('Position:', dbErr.position);
      
      // Log the data that was being saved for diagnosis
      if (section === 'temoignages') {
        console.error('Data being saved:', JSON.stringify(data, null, 2));
      }
      
      throw dbErr;
    }
    
    console.log(`✅ POST /api/${section} saved successfully`);
    console.log(`${'='.repeat(80)}\n`);
    
    res.json({ success: true, message: `${section} saved`, count: Array.isArray(data) ? data.length : 1 });
  } catch (err) {
    console.error(`\n❌ POST /api/${req.params.section} FAILED: ${err.message}`);
    console.error('Stack:', err.stack);
    console.log(`${'='.repeat(80)}\n`);
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

// RECOVERY - Check database health and fix corrupted JSON strings
app.get('/api/recovery-check', async (req, res) => {
  try {
    console.log('\n🔍 DATABASE RECOVERY CHECK...');
    const result = await pool.query('SELECT key, value FROM site_data WHERE key LIKE $1 ORDER BY key', ['squat_%']);
    
    const issues = [];
    const fixes = [];
    
    for (const row of result.rows) {
      console.log(`\n📋 Checking "${row.key}"...`);
      console.log(`   Type: ${typeof row.value}`);
      
      if (typeof row.value === 'object') {
        const msg = `⚠️ "${row.key}" stored as OBJECT not JSON STRING - indicates corruption`;
        console.warn(msg);
        issues.push({
          key: row.key,
          type: 'corrupted_format',
          message: msg,
          stored_type: typeof row.value,
          can_fix: false
        });
      } else if (typeof row.value === 'string') {
        try {
          const parsed = JSON.parse(row.value);
          console.log(`   ✅ Valid JSON string`);
          if (Array.isArray(parsed)) {
            console.log(`   📦 Array with ${parsed.length} items`);
          }
        } catch (e) {
          const msg = `❌ "${row.key}" contains invalid JSON: ${e.message}`;
          console.warn(msg);
          issues.push({
            key: row.key,
            type: 'invalid_json',
            message: msg,
            error: e.message
          });
        }
      }
    }
    
    console.log(`\n📊 SUMMARY: ${issues.length} issues found`);
    
    res.json({
      status: issues.length === 0 ? 'healthy' : 'corrupted',
      rows_checked: result.rows.length,
      issues_found: issues.length,
      issues: issues,
      recommendations: [
        issues.length > 0 ? '⚠️ Database has corruption issues' : '✅ Database is clean',
        'If team data was lost, manually reenter team members or contact support',
        'All future saves will use proper JSON string format'
      ]
    });
  } catch (err) {
    console.error('❌ Recovery check error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// BULK IMPORT - Restore multiple team members at once (admin recovery tool)
app.post('/api/team/bulk-import', async (req, res) => {
  try {
    const { members } = req.body;
    
    if (!Array.isArray(members)) {
      return res.status(400).json({ error: 'Expected array of team members' });
    }
    
    console.log(`\n📥 BULK IMPORT: Processing ${members.length} team members...`);
    
    // Fetch current team
    const result = await pool.query('SELECT value FROM site_data WHERE key = $1', ['squat_team']);
    let arr = [];
    
    if (result.rows.length > 0) {
      try {
        const stored = result.rows[0].value;
        if (typeof stored === 'string') {
          arr = JSON.parse(stored);
        }
      } catch (e) {
        console.log('⚠️ Could not parse existing team, starting fresh');
        arr = [];
      }
    }
    
    // Merge imported members with existing
    let imported = 0;
    let updated = 0;
    
    for (const member of members) {
      // Validate required fields
      if (!member.name || !member.role) {
        console.warn(`⚠️ Skipping member missing name or role: ${JSON.stringify(member)}`);
        continue;
      }
      
      // Find if exists
      const ix = arr.findIndex(m => m && m.id === member.id);
      
      if (ix >= 0) {
        // Merge with existing
        arr[ix] = { ...arr[ix], ...member };
        console.log(`✏️ Updated: ${member.name} (id: ${member.id})`);
        updated++;
      } else {
        // Add new
        arr.push({
          id: member.id || Date.now(),
          name: member.name,
          role: member.role,
          gender: member.gender || 'Autre',
          section: member.section || 'Équipe',
          photo: member.photo || '',
          facts: member.facts || []
        });
        console.log(`➕ Added: ${member.name} (id: ${member.id})`);
        imported++;
      }
    }
    
    // Save updated array
    const serialized = JSON.stringify(arr);
    await pool.query(
      'INSERT INTO site_data (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP',
      ['squat_team', serialized]
    );
    
    console.log(`✅ Bulk import complete: ${imported} added, ${updated} updated`);
    
    res.json({
      success: true,
      imported: imported,
      updated: updated,
      total: arr.length,
      message: `Successfully imported ${imported} new members and updated ${updated}`
    });
  } catch (err) {
    console.error('❌ Bulk import error:', err.message);
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

// Database stats - real size usage
app.get('/api/db-stats', async (req, res) => {
  try {
    console.log('📊 /db-stats endpoint called');
    
    // Get all data from site_data table
    const result = await pool.query('SELECT key, value FROM site_data WHERE key LIKE $1', ['squat_%']);
    
    console.log('📊 Query result type:', typeof result);
    console.log('📊 Query result keys:', result ? Object.keys(result) : 'null');
    
    if (!result || !result.rows || !Array.isArray(result.rows)) {
      console.error('❌ Invalid query result structure:', {
        resultExists: !!result,
        hasRows: result ? result.hasOwnProperty('rows') : false,
        rowsType: result && result.rows ? typeof result.rows : 'N/A',
        isArray: result && result.rows ? Array.isArray(result.rows) : false
      });
      return res.status(500).json({ error: 'Invalid database response', details: 'Query did not return valid rows' });
    }
    
    console.log(`📊 DB Stats - Found ${result.rows.length} squat_* keys`);
    
    // Calculate total size
    let totalBytes = 0;
    const rowDetails = [];
    
    result.rows.forEach(row => {
      try {
        const strValue = JSON.stringify(row.value);
        const size = strValue ? strValue.length : 0;
        totalBytes += size;
        rowDetails.push({ key: row.key, bytes: size });
        console.log(`  📝 ${row.key}: ${size} bytes`);
      } catch (e) {
        console.error(`  ⚠️ Could not stringify ${row.key}:`, e.message);
      }
    });
    
    console.log(`📊 Total size: ${totalBytes} bytes = ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
    
    // Supabase free plan = 500MB
    const limitBytes = 500 * 1024 * 1024; // 500 MB
    const usedMB = (totalBytes / 1024 / 1024).toFixed(2);
    const percentageUsed = (totalBytes / limitBytes * 100).toFixed(2);
    
    console.log(`📊 Calculations - usedMB: "${usedMB}", percentage: "${percentageUsed}"`);
    
    // Validate calculations
    if (!usedMB || usedMB === 'NaN' || isNaN(parseFloat(usedMB))) {
      console.error('❌ Invalid MB calculation:', { totalBytes, usedMB, type: typeof usedMB });
      return res.status(500).json({ error: 'Invalid statistics calculation', field: 'used_mb' });
    }
    
    if (!percentageUsed || percentageUsed === 'NaN' || isNaN(parseFloat(percentageUsed))) {
      console.error('❌ Invalid percentage calculation:', { totalBytes, percentageUsed, type: typeof percentageUsed });
      return res.status(500).json({ error: 'Invalid percentage calculation', field: 'percentage_used' });
    }
    
    // Build response object
    const responseRows = result.rows.map(r => ({
      key: r.key,
      size_kb: (JSON.stringify(r.value) ? JSON.stringify(r.value).length / 1024 : 0).toFixed(2)
    }));
    
    const response = {
      used_bytes: parseInt(totalBytes),
      used_mb: String(usedMB),
      limit_mb: 500,
      percentage_used: String(percentageUsed),
      row_count: parseInt(result.rows.length),
      rows: responseRows
    };
    
    console.log('📊 Response object built:', {
      type: typeof response,
      keys: Object.keys(response),
      isArray: Array.isArray(response),
      stringified: JSON.stringify(response).substring(0, 100) + '...'
    });
    
    console.log('✅ Sending response:', JSON.stringify(response));
    
    // CRITICAL: Make absolutely sure we're sending the object, not an array
    if (Array.isArray(response)) {
      console.error('❌ CRITICAL: Response became an array somehow!');
      return res.status(500).json({ error: 'Internal error: response structure corrupted' });
    }
    
    res.json(response);
  } catch (err) {
    console.error('❌ DB stats error:', err.message, err.stack);
    console.error('❌ Full error object:', err);
    return res.status(500).json({ error: err.message, type: 'exception' });
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

