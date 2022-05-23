import {defineConfig} from 'vite'

import {baseConfig, libraryFilename} from '../../config/vite.config.base'

export default defineConfig({
  ...baseConfig,
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'WhatsThatGerber',
      fileName: libraryFilename('whats-that-gerber'),
    },
  },
})
