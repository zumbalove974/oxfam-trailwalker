const { defineConfig } = require('@vue/cli-service')
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new NodePolyfillPlugin()
    ],
    resolve: {
      fallback: {
        "fs": false,
        "dgram": false
      },
    }
  },
  pages: {
    home: {
      entry: 'src/pages/Home/home.js',
      template: 'public/index.html',
      title: 'Home Page',
      chunks: ['chunk-vendors', 'chunk-common', 'home']
    },
    application: {
      entry: 'src/pages/Application/application.js',
      template: 'public/index.html',
      title: 'Application Page',
      chunks: ['chunk-vendors', 'chunk-common', 'application']
    },
    about: {
      entry: 'src/pages/About/about.js',
      template: 'public/index.html',
      title: 'About Page',
      chunks: ['chunk-vendors', 'chunk-common', 'about']
    }
  }
})
