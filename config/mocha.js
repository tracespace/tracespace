// mocha configuration
'use strict'

const path = require('path')

module.exports = {
  require: [path.join(__dirname, '../scripts/init-test-env')],
  'watch-extensions': ['js', 'ts', 'tsx', 'json'],
  spec: ['apps/**/__tests__/*.@(js|ts|tsx)', 'packages/**/*test.js'],
}
