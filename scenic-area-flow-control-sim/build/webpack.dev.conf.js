const path = require('path')
const webpack = require('webpack')
const { merge } = require('webpack-merge')
const baseConfig = require('./webpack.base.conf')

module.exports = merge(baseConfig, {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
  devServer: {
    historyApiFallback: {
      rewrites: [
        { from: /.*/, to: path.posix.join('/', 'index.html') }
      ]
    },
    hot: true,
    compress: true,
    client: {
      overlay: { warnings: false, errors: true },
      progress: true
    },
    static: {
      directory: path.join(__dirname, '../public')
    }
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
})
