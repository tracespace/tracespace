import camelCase from 'lodash/camelCase'
import kebabCase from 'lodash/kebabCase'
import merge from 'lodash/merge'
import upperFirst from 'lodash/upperFirst'

import type {LibraryFormats, UserConfig} from 'vite'

interface PackageMeta {
  name: string
  version: string
  description: string
  bin?: Record<string, string>
}

interface LibraryPackageMeta extends PackageMeta {
  exports: PackageJsonExports
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

interface PackageJsonExports {
  source: string
}

const pascalCase = (value: string): string => upperFirst(camelCase(value))

export function defineBaseConfig(
  packageMeta: PackageMeta,
  config?: UserConfig
): UserConfig {
  const {name, version, description, bin = {}} = packageMeta
  const baseConfig = {
    define: {
      __PKG_NAME__: JSON.stringify(name),
      __PKG_VERSION__: JSON.stringify(version),
      __PKG_DESCRIPTION__: JSON.stringify(description),
      __PKG_BIN_NAME__: JSON.stringify(Object.keys(bin)[0]),
    },
    resolve: {
      conditions: ['source'],
    },
    build: {
      sourcemap: true,
    },
  }

  return merge(baseConfig, config)
}

export function defineLibraryConfig(
  packageMeta: LibraryPackageMeta,
  formats?: LibraryFormats[]
): UserConfig {
  const {name, exports, dependencies = {}} = packageMeta
  const libraryConfig = {
    build: {
      lib: {
        entry: exports.source,
        name: pascalCase(name),
        fileName: kebabCase(name),
        formats,
      },
      rollupOptions: {
        external: (n: string) => n.startsWith('node:') || n in dependencies,
        output: {
          globals: Object.fromEntries(
            Object.keys(dependencies)
              .filter(name => name.startsWith('@tracespace/'))
              .map(name => [name, pascalCase(name)])
          ),
        },
      },
    },
  }

  return defineBaseConfig(packageMeta, libraryConfig)
}
