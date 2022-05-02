import {defineConfig} from 'vitest/config'

export default defineConfig({
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
