// mocha configuration
'use strict'

module.exports = {
  require: ['scripts/init-test-env'],
  'watch-extensions': ['js', 'ts', 'tsx'],
  spec: ['apps/**/__tests__/*.@(js|ts|tsx)', 'packages/**/*test.js'],
}
