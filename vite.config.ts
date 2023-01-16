import preact from '@preact/preset-vite'
import type {UserConfig as VitestUserConfig} from 'vitest/config'

import {defineBaseConfig} from './config/vite.config.base'

const packageMeta = {
  name: '@tracespace/test',
  version: '0.0.0-test',
  description: 'Test description',
}

const testConfig: VitestUserConfig = {
  plugins: [preact()],
  assetsInclude: ['**/*.gbr', '**/*.drl'],
  test: {
    deps: {
      inline: ['testdouble-vitest'],
    },
    setupFiles: ['./config/vitest.setup.ts'],
    coverage: {
      all: true,
      extension: ['ts', 'tsx'],
      include: ['**/src/**'],
      exclude: ['**/__tests__/**', '**/*.d.ts'],
      reporter: ['html', 'text', 'json'],
    },
  },
}

export default defineBaseConfig(packageMeta, testConfig)
