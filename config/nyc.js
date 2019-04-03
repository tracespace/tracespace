'use strict'

module.exports = {
  all: true,
  include: ['apps/**', 'packages/**'],
  exclude: [
    '**/node_modules/**',
    '**/example/**',
    '**/scripts/**',
    '**/dist/**',
    '**/integration/**',
    '**/test.js',
    '**/test/**',
    '**/__tests__/**',
    '**/*.config.js',
    '**/*.d.ts',
    'config/**',
    'packages/fixtures/**',
  ],
  extension: ['.js', '.ts', '.tsx'],
}
