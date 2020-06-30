'use strict'

const path = require('path')

module.exports = {
  all: true,
  include: ['apps/**', 'packages/**'],
  exclude: [
    '**/example/**',
    '**/scripts/**',
    '**/dist/**',
    '**/cjs/**',
    '**/esm/**',
    '**/umd/**',
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
  // copied from @istanbuljs/nyc-config-babel
  sourceMap: false,
  instrument: false,
  require: [path.join(__dirname, '../scripts/register-babel')],
}
