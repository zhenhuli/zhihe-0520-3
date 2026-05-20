const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const net = require('net');

const config = {
    src: './',
    html: './*.html',
    css: './src/css/*.css',
    js: './src/js/*.js',
    port: 3000
};

function checkPort(port) {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.once('error', () => resolve(false));
        server.once('listening', () => {
            server.close();
            resolve(true);
        });
        server.listen(port, '127.0.0.1');
    });
}

async function findAvailablePort(startPort) {
    let port = startPort;
    while (port < startPort + 100) {
        if (await checkPort(port)) {
            return port;
        }
        port++;
    }
    return startPort;
}

gulp.task('serve', async function() {
    const availablePort = await findAvailablePort(config.port);
    
    console.log(`\n========================================`);
    console.log(`🚀 桥梁承重模拟演示启动成功!`);
    console.log(`📍 本地访问: http://localhost:${availablePort}`);
    console.log(`🌐 网络访问: http://0.0.0.0:${availablePort}`);
    console.log(`========================================\n`);

    browserSync.init({
        server: {
            baseDir: config.src
        },
        port: availablePort,
        open: true,
        notify: false,
        ui: false,
        logLevel: 'silent'
    });

    gulp.watch(config.html).on('change', browserSync.reload);
    gulp.watch(config.css).on('change', browserSync.reload);
    gulp.watch(config.js).on('change', browserSync.reload);
});

gulp.task('default', gulp.series('serve'));
