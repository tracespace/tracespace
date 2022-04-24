import {defineConfig} from 'vite'

import {version, description, dependencies} from './package.json'

export default defineConfig({
  resolve: {
    conditions: ['source'],
  },
  define: {
    __PKG_VERSION__: JSON.stringify(version),
    __PKG_DESCRIPTION__: JSON.stringify(description),
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'tracespace-cli',
    },
    rollupOptions: {
      external: name => name.startsWith('node:') || name in dependencies,
    },
  },
})
