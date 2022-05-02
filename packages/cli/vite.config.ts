import {defineConfig} from 'vite'

import {baseConfig, getDefineConstants} from '../../config/vite.config.base'
import packageMeta from './package.json'

export default defineConfig({
  ...baseConfig,
  define: getDefineConstants(packageMeta),
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'tracespace-cli',
    },
    rollupOptions: {
      external: n => n.startsWith('node:') || n in packageMeta.dependencies,
    },
  },
})
