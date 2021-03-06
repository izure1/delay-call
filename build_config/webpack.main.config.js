const path = require('path')
const base = require('./webpack.base.config')

module.exports = {
  ...base,
  entry: {
    'main/index': path.join(__dirname, '../', 'src', 'main', 'index.ts')
  },
  output: {
    path: path.join(__dirname, '../', 'build'),
    filename: '[name].js',
    library: {
      type: 'umd',
      name: 'DelayCallJS'
    },
    globalObject: 'this'
  }
}