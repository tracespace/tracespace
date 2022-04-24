import {defineConfig} from 'vite'
import builtinModules from 'builtin-modules'

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
      formats: ['cjs'],
      fileName: _ => 'tracespace-cli.cjs',
    },
    rollupOptions: {
      external: [...Object.keys(dependencies), ...builtinModules],
    },
  },
})
