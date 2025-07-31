#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Eastern ERP Development Server...\n');

// Start the Express server directly with Node.js
const serverPath = path.join(__dirname, 'server', 'index.js');
const env = { ...process.env, NODE_ENV: 'development' };

const server = spawn('node', [serverPath], {
  env,
  stdio: 'inherit',
  cwd: __dirname
});

server.on('error', (err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

server.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ Server exited with code ${code}`);
    process.exit(code);
  }
});

console.log('✅ Development server starting...');
console.log('🌐 Visit http://localhost:5000 once the server is ready\n');