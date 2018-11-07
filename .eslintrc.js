'use strict'

// HACK: overriding parserOptions doesn't seem to do anything because
// eslint-config-standard specifies it; delete it as a workaround
const standard = require('eslint-config-standard')
delete standard.parserOptions

module.exports = {
  parserOptions: {ecmaVersion: 5},
  env: {es6: false},
  extends: [
    'standard',
    'prettier',
    'prettier/standard',
    'plugin:prettier/recommended',
  ],
  overrides: [
    {
      files: [
        '.*.js',
        'packages/cli/**/*.js',
        'packages/fixtures/**/*.js',
        '**/integration/**/*.js',
        '**/example/**/*.js',
        '**/scripts/**/*.js',
      ],
      parserOptions: {ecmaVersion: 6},
      env: {es6: true},
    },
    {
      files: ['**/*test.js'],
      env: {mocha: true},
    },
  ],
}
