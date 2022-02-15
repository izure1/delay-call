const path = require('path')
const base = require('./webpack.base.config')

module.exports = {
  ...base,
  experiments: {
    outputModule: true
  },
  entry: {
    'module/index': path.join(__dirname, '../', 'src', 'index.ts')
  },
  output: {
    path: path.join(__dirname, '../', 'build'),
    filename: '[name].js',
    library: {
      type: 'module'
    }
  }
}