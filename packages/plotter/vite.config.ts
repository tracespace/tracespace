import {defineConfig} from 'vite'

import {baseConfig, libraryFilename} from '../../config/vite.config.base'

export default defineConfig({
  ...baseConfig,
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'TracespacePlotter',
      fileName: libraryFilename('tracespace-plotter'),
    },
    rollupOptions: {
      external: ['@tracespace/parser'],
      output: {
        globals: {
          '@tracespace/parser': 'TracespaceParser',
        },
      },
    },
  },
})
