const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  // Parse the requested path
  const url = new URL(req.url || '/', 'http://localhost');
  let pathname = url.pathname;
  
  // DEBUG endpoint
  if (pathname === '/debug') {
    const parentPath = path.join(__dirname, '..');
    const files = fs.readdirSync(parentPath).filter(f => !f.startsWith('.')).slice(0, 20);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      __dirname: __dirname,
      'process.cwd': process.cwd(),
      parentPath: parentPath,
      req_url: req.url,
      pathname: pathname,
      files_in_parent: files
    }, null, 2));
    return;
  }
  
  // Clean up path
  if (pathname !== '/' && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }
  
  // Determine which file to serve
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

