'use strict'

const extend = require('xtend')

const configStandard = require('eslint-config-standard')
const configPrettierTs = require('eslint-config-prettier/@typescript-eslint')
const pluginTs = require('@typescript-eslint/eslint-plugin')

// HACK: overriding parserOptions doesn't seem to do anything because
// eslint-config-standard specifies it; delete it as a workaround
delete configStandard.parserOptions

module.exports = {
  root: true,
  parserOptions: {ecmaVersion: 5},
  env: {es6: false},
  extends: [
    'standard',
    'plugin:react/recommended',
    'plugin:prettier/recommended',
    'prettier/react',
    'prettier/standard',
  ],
  overrides: [
    {
      files: [
        '.*.js',
        '**/*.config.js',
        'config/**/*.js',
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
      files: ['**/*test.js', '**/__tests__/**', 'scripts/init-test-env.js'],
      env: {mocha: true},
    },
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        sourceType: 'module',
        project: './tsconfig.json',
      },
      env: {es6: true, browser: true},
      plugins: ['react-hooks', '@typescript-eslint'],
      rules: extend(
        pluginTs.configs.recommended.rules,
        configPrettierTs.rules,
        {
          'no-dupe-class-members': 'off',
          'no-redeclare': 'off',
          'no-useless-constructor': 'off',
          'import/export': 'off',
          'react-hooks/rules-of-hooks': 'error',
          '@typescript-eslint/camelcase': 'off',
          '@typescript-eslint/explicit-member-accessibility': 'off',
          '@typescript-eslint/array-type': ['error', 'generic'],
          '@typescript-eslint/no-unused-vars': [
            'error',
            {ignoreRestSiblings: true, argsIgnorePattern: '^_'},
          ],
          '@typescript-eslint/no-use-before-define': [
            'error',
            {functions: false, typedefs: false},
          ],
          '@typescript-eslint/prefer-interface': 'off',
        }
      ),
    },
  ],
  settings: {
    react: {
      version: '16.8',
    },
  },
}
