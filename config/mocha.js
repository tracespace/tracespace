// mocha configuration
'use strict'

const path = require('path')

module.exports = {
  package: path.join(__dirname, '../package.json'),
  require: [path.join(__dirname, '../scripts/init-test-env')],
  extension: ['js', 'ts', 'tsx', 'json'],
  spec: ['@(apps|packages)/**/__tests__/*.ts?(x)', 'packages/**/*test.js'],
}
