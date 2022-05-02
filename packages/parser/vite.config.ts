import {defineConfig} from 'vite'

import {baseConfig} from '../../config/vite.config.base'

export default defineConfig({
  ...baseConfig,
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'TracespaceParser',
      fileName: 'tracespace-parser',
    },
  },
})
