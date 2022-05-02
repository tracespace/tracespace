import {defineConfig} from 'vitest/config'
import {baseConfig} from './config/vite.config.base'

export default defineConfig({
  ...baseConfig,
  test: {
    coverage: {
      all: true,
      extension: ['ts', 'tsx'],
      include: ['**/src/**'],
      exclude: ['**/__tests__/**', '**/*.d.ts'],
      reporter: ['html', 'text', 'json'],
    },
  },
})
