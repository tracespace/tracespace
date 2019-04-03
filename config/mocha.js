// mocha configuration
'use strict'

const path = require('path')

module.exports = {
  require: [path.join(__dirname, '../scripts/init-test-env')],
  'watch-extensions': ['js', 'ts', 'tsx', 'json'],
  spec: ['@(apps|packages)/**/__tests__/*.ts?(x)', 'packages/**/*test.js'],
}
