import {defineConfig} from 'vite'

export const baseConfig = defineConfig({
  resolve: {
    conditions: ['source'],
  },
})

export const getDefineConstants = (pkg: {
  name: string
  version: string
  description: string
}) => ({
  __PKG_NAME__: JSON.stringify(pkg.name),
  __PKG_VERSION__: JSON.stringify(pkg.version),
  __PKG_DESCRIPTION__: JSON.stringify(pkg.description),
})
