'use strict'

const path = require('path')

const configFile = path.join(__dirname, '../config/babel.js')
const extensions = ['.js', '.ts', '.tsx']
const sourceMaps = 'inline'
const plugins = [
  '@babel/plugin-transform-modules-commonjs',
  [
    'babel-plugin-module-resolver',
    {
      alias: {
        '^@tracespace/parser$': '@tracespace/parser/src/index.ts',
        '^@tracespace/xml-id$': '@tracespace/xml-id/src/index.ts',
        '^whats-that-gerber$': 'whats-that-gerber/src/index.ts',
        '^@tracespace/stats$': '@tracespace/stats/src/index.ts',
      },
    },
  ],
]

if (process.env.NYC_CONFIG) {
  plugins.unshift('babel-plugin-istanbul')
}

require('@babel/register')({configFile, extensions, sourceMaps, plugins})
