import {defineConfig} from 'vitest/config'
import preact from '@preact/preset-vite'

import {baseConfig} from './config/vite.config.base'

export default defineConfig({
  ...baseConfig,
  define: {
    __PKG_NAME__: JSON.stringify('@tracespace/test'),
    __PKG_VERSION__: JSON.stringify('0.0.0-test'),
    __PKG_DESCRIPTION__: JSON.stringify('Test description'),
  },
  plugins: [preact()],
  assetsInclude: ['**/*.gbr', '**/*.drl'],
  test: {
    threads: false,
    setupFiles: ['./config/vitest.setup.ts'],
    coverage: {
      all: true,
      extension: ['ts', 'tsx'],
      include: ['**/src/**'],
      exclude: ['**/__tests__/**', '**/*.d.ts'],
      reporter: ['html', 'text', 'json'],
    },
  },
})
