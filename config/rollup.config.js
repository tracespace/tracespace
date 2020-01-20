import path from 'path'
import resolve from '@rollup/plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import {terser} from 'rollup-plugin-terser'
import {camelCase, upperFirst} from 'lodash'

const PACKAGES = ['packages/whats-that-gerber']

const PLUGINS = [
  resolve({extensions: ['.mjs', '.js', '.json', '.node', '.ts']}),
  babel({
    rootMode: 'upward',
    exclude: '**/node_modules/**',
    extensions: ['.ts'],
  }),
]

const resolveAbs = (...paths) => path.join(__dirname, '..', ...paths)

const makeConfig = (dir, pkg) => ({
  input: resolveAbs(dir, pkg.source),
  output: [
    {
      file: resolveAbs(dir, pkg.module),
      format: 'esm',
      sourcemap: true,
    },
    {
      file: resolveAbs(dir, pkg.main),
      format: 'cjs',
      sourcemap: true,
    },
  ],
  plugins: PLUGINS,
  external: pkg.dependencies ? Object.keys(pkg.dependencies) : [],
})

const makeBundleConfig = (dir, pkg) => ({
  input: resolveAbs(dir, pkg.source),
  output: [
    {
      file: resolveAbs(dir, 'umd', `${pkg.name}.js`),
      format: 'umd',
      name: upperFirst(camelCase(pkg.name)),
      sourcemap: true,
    },
    {
      file: resolveAbs(dir, 'umd', `${pkg.name}.min.js`),
      format: 'umd',
      name: upperFirst(camelCase(pkg.name)),
      plugins: [terser()],
      sourcemap: true,
    },
  ],
  plugins: PLUGINS,
})

export default function config(cliArgs) {
  return PACKAGES.map(dir => {
    const pkg = require(resolveAbs(dir, 'package.json'))
    const configBuilder = cliArgs.configBundle ? makeBundleConfig : makeConfig

    return configBuilder(dir, pkg)
  })
}
