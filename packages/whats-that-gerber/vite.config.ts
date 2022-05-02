import {defineConfig} from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'WhatsThatGerber',
      fileName: (format: string) => `whats-that-gerber.${format}.js`,
    },
  },
})
