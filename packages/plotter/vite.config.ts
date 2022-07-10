import {defineConfig} from 'vite'

import {baseConfig, libraryFilename} from '../../config/vite.config.base'
import pkg from './package.json'

export default defineConfig({
  ...baseConfig,
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'TracespacePlotter',
      fileName: libraryFilename('tracespace-plotter'),
    },
    rollupOptions: {
      external: Object.keys(pkg.dependencies),
      output: {
        globals: {
          '@tracespace/parser': 'TracespaceParser',
        },
      },
    },
  },
})
