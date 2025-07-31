import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Eastern ERP - Test Server</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #333; }
            .status { color: green; font-weight: bold; }
            .info { background: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .error { background: #ffe8e8; padding: 15px; border-radius: 5px; margin: 20px 0; color: #d00; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Eastern ERP - Test Server</h1>
            <p class="status">✅ Server is running successfully on port 5000!</p>
            
            <div class="info">
              <h2>Next Steps:</h2>
              <p>The server is running, but dependencies need to be installed for the full application.</p>
              <p>To fix this:</p>
              <ol>
                <li>Stop this server (Ctrl+C)</li>
                <li>Run: <code>rm -rf node_modules package-lock.json</code></li>
                <li>Run: <code>npm install --legacy-peer-deps</code></li>
                <li>Then run: <code>npm run dev</code></li>
              </ol>
            </div>
            
            <div class="info">
              <h3>Current Status:</h3>
              <ul>
                <li>Test server: Running ✅</li>
                <li>Port 5000: Available ✅</li>
                <li>Dependencies: Not installed ❌</li>
              </ul>
            </div>
          </div>
        </body>
      </html>
    `);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`\n✅ Test server is running!`);
  console.log(`🌐 Visit: http://localhost:${PORT}`);
  console.log(`\nPress Ctrl+C to stop the server\n`);
});