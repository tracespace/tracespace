import {UserConfig, defineConfig} from 'vite'

export const baseConfig: UserConfig = defineConfig({
  resolve: {
    conditions: ['source'],
  },
}) as UserConfig

export const getDefineConstants = (pkg: {
  name: string
  version: string
  description: string
}) => ({
  __PKG_NAME__: JSON.stringify(pkg.name),
  __PKG_VERSION__: JSON.stringify(pkg.version),
  __PKG_DESCRIPTION__: JSON.stringify(pkg.description),
})

export const libraryFilename = (basename: string) => (format: string) => {
  const extension = format === 'es' ? 'js' : 'cjs'
  return `${basename}.${format}.${extension}`
}
