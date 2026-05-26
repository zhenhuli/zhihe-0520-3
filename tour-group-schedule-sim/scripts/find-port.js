const net = require('net');
const { execSync } = require('child_process');

const START_PORT = 3000;
const END_PORT = 3100;

const isPortAvailable = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
};

const findAvailablePort = async () => {
  for (let port = START_PORT; port <= END_PORT; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  return null;
};

findAvailablePort().then((port) => {
  if (port) {
    console.log(`找到可用端口: ${port}`);
    process.env.PORT = port;
    try {
      execSync('npx react-scripts start', {
        stdio: 'inherit',
        env: { ...process.env, PORT: port }
      });
    } catch (error) {
      process.exit(1);
    }
  } else {
    console.error(`在 ${START_PORT}-${END_PORT} 范围内未找到可用端口`);
    process.exit(1);
  }
});
