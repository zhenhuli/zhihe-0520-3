const Webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const portfinder = require('portfinder')
const config = require('./webpack.dev.conf')

const devServerOptions = {
  ...config.devServer,
  open: true
}

portfinder.basePort = 8080
portfinder.getPortPromise()
  .then(port => {
    config.devServer.port = port
    const compiler = Webpack(config)
    const server = new WebpackDevServer(devServerOptions, compiler)
    
    const runServer = async () => {
      console.log('正在启动开发服务器...')
      await server.start()
      console.log(`\n=====================================`)
      console.log(`  景区客流疏导模拟调度系统已启动!`)
      console.log(`  本地访问: http://localhost:${port}`)
      console.log(`=====================================\n`)
    }
    
    runServer()
  })
  .catch(err => {
    console.error('无法找到可用端口:', err)
    process.exit(1)
  })
