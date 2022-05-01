import {defineConfig} from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'TracespacePlotter',
      fileName: 'tracespace-plotter',
    },
    rollupOptions: {
      external: ['@tracespace/parser', 'whats-that-gerber'],
      output: {
        globals: {
          '@tracespace/parser': 'TracespaceParser',
          'whats-that-gerber': 'WhatsThatGerber',
        },
      },
    },
  },
})
