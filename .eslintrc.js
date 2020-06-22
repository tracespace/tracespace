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
      parserOptions: {ecmaVersion: 5, sourceType: 'script'},
      env: {es6: false},
    },
    {
      files: ['**/*.config.js', '**/integration/**/*.js', '**/example/**/*.js'],
      parserOptions: {ecmaVersion: 6},
      env: {es6: true},
    },
    {
      files: ['apps/**'],
      env: {browser: true},
      plugins: ['react-hooks'],
      extends: ['plugin:react/recommended', 'prettier/react'],
      rules: {
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
      },
    },
    {
      files: ['**/*test.js', '**/__tests__/**', 'scripts/init-test-env.js'],
      env: {mocha: true},
      rules: {
        'import/first': 'off',
      },
    },
    {
      files: ['**/*.ts', '**/*.tsx'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'prettier/@typescript-eslint',
      ],
      rules: {
        'no-dupe-class-members': 'off',
        'no-redeclare': 'off',
        'no-useless-constructor': 'off',
        'import/export': 'off',
        '@typescript-eslint/ban-ts-comment': [
          'error',
          {'ts-expect-error': false},
        ],
        '@typescript-eslint/camelcase': 'off',
        '@typescript-eslint/explicit-member-accessibility': 'off',
        '@typescript-eslint/explicit-function-return-type': [
          'warn',
          {allowExpressions: true},
        ],
        '@typescript-eslint/no-empty-function': 'warn',
        '@typescript-eslint/no-inferrable-types': 'warn',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {ignoreRestSiblings: true, argsIgnorePattern: '^_'},
        ],
        '@typescript-eslint/no-use-before-define': [
          'error',
          {functions: false, typedefs: false},
        ],
        '@typescript-eslint/prefer-interface': 'off',
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
  settings: {
    react: {
      version: '16.10',
    },
  },
}
