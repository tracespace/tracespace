'use strict'

module.exports = {
  root: true,
  extends: ['standard', 'plugin:prettier/recommended', 'prettier/standard'],
  overrides: [
    {
      files: [
        'packages/gerber-parser/**/*.js',
        'packages/gerber-plotter/**/*.js',
        'packages/gerber-to-svg/**/*.js',
        'packages/pcb-stackup/**/*.js',
        'packages/pcb-stackup-core/**/*.js',
        'packages/whats-that-gerber/**/*.js',
        'packages/xml-id/**/*.js',
      ],
      env: {es6: false},
      parserOptions: {ecmaVersion: 5, sourceType: 'script'},
    },
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
      env: {es6: true},
      parserOptions: {ecmaVersion: 6},
    },
    {
      files: ['**/*test.js', '**/__tests__/**', 'scripts/init-test-env.js'],
      env: {mocha: true},
    },
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      env: {es6: true, browser: true},
      parserOptions: {project: './tsconfig.json'},
      plugins: ['react-hooks'],
      extends: [
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier/react',
        'prettier/@typescript-eslint',
      ],
      rules: {
        'no-dupe-class-members': 'off',
        'no-redeclare': 'off',
        'no-useless-constructor': 'off',
        'import/export': 'off',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        '@typescript-eslint/camelcase': 'off',
        '@typescript-eslint/explicit-member-accessibility': 'off',
        '@typescript-eslint/explicit-function-return-type': [
          'warn',
          {allowExpressions: true},
        ],
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
      },
    },
  ],
  settings: {
    react: {
      version: '16.8',
    },
  },
}
