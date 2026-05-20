import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT_START = 8000;
const PORT_MAX = 65535;

function findAvailablePort(startPort) {
  return new Promise((resolve, reject) => {
    let port = startPort;
    const checkPort = () => {
      if (port > PORT_MAX) {
        reject(new Error('No available ports found'));
        return;
      }
      const server = http.createServer();
      server.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          port++;
          checkPort();
        } else {
          reject(err);
        }
      });
      server.once('listening', () => {
        server.close();
        resolve(port);
      });
      server.listen(port, '127.0.0.1');
    };
    checkPort();
  });
}

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.ico': 'image/x-icon'
};

async function startServer() {
  try {
    const port = await findAvailablePort(PORT_START);
    console.log(`\n🎵  Rhythm Beat Maker 启动中...`);
    console.log(`📍  可用端口: ${port}`);

    const server = http.createServer((req, res) => {
      let filePath = '.' + req.url;
      if (filePath === './') {
        filePath = './index.html';
      }

      const extname = String(path.extname(filePath)).toLowerCase();
      const contentType = mimeTypes[extname] || 'application/octet-stream';

      fs.readFile(filePath, (error, content) => {
        if (error) {
          if (error.code === 'ENOENT') {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 - File Not Found</h1>', 'utf-8');
          } else {
            res.writeHead(500);
            res.end('Server Error: ' + error.code, 'utf-8');
          }
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content, 'utf-8');
        }
      });
    });

    server.listen(port, '127.0.0.1', () => {
      console.log(`✅  服务器已启动: http://127.0.0.1:${port}`);
      console.log(`🚀  浏览器自动打开中...\n`);
      
      const url = `http://127.0.0.1:${port}`;
      
      switch (process.platform) {
        case 'darwin':
          exec(`open ${url}`);
          break;
        case 'win32':
          exec(`start ${url}`);
          break;
        default:
          exec(`xdg-open ${url}`);
      }
    });

  } catch (err) {
    console.error('❌ 启动失败:', err.message);
    process.exit(1);
  }
}

startServer();
