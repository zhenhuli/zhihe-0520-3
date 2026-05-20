const http = require('http');
const fs = require('fs');
const path = require('path');
const net = require('net');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function findFreePort(startPort = 8000, maxPort = 9000) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', () => {
      if (startPort < maxPort) {
        resolve(findFreePort(startPort + 1, maxPort));
      } else {
        reject(new Error('No free port available'));
      }
    });
    server.listen(startPort, () => {
      server.close(() => {
        resolve(startPort);
      });
    });
  });
}

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`<h1>Server Error: ${err.code}</h1>`, 'utf-8');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

async function startServer() {
  try {
    const port = await findFreePort(8000, 9000);
    server.listen(port, 'localhost', () => {
      console.log('\n========================================');
      console.log('  液体混合模拟程序启动成功!');
      console.log('========================================');
      console.log(`  本地访问: http://localhost:${port}`);
      console.log('========================================\n');
    });
  } catch (err) {
    console.error('启动服务器失败:', err.message);
    process.exit(1);
  }
}

startServer();
