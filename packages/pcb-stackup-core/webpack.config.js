'use strict'

const path = require('path')
const merge = require('webpack-merge')

const {browserScriptConfig} = require('@tracespace/config/webpack')

module.exports = merge(browserScriptConfig(__dirname), {
  entry: {
    'pcb-stackup-core': path.join(__dirname, 'index.js'),
  },
  output: {
    library: 'pcbStackupCore',
  },
})
