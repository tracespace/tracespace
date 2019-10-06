import path from 'path'
import builtins from 'builtin-modules'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import babel from 'rollup-plugin-babel'
import {terser} from 'rollup-plugin-terser'
import {camelCase, upperFirst} from 'lodash'

const ENTRIES = [
  {path: 'packages/cli', esm: false, cjs: true, umd: false},
  {path: 'packages/parser', esm: true, cjs: true, umd: true},
  {path: 'packages/plotter', esm: true, cjs: true, umd: true},
  {path: 'packages/renderer', esm: true, cjs: true, umd: true},
  {path: 'packages/whats-that-gerber', esm: true, cjs: true, umd: true},
  {path: 'packages/xml-id', esm: true, cjs: true, umd: true},
]

const resolveFromRoot = (...paths) => path.join(__dirname, '..', ...paths)

const makeResolvePlugin = (preferBuiltins = true) =>
  resolve({
    extensions: ['.mjs', '.js', '.json', '.node', '.ts'],
    preferBuiltins,
  })

const makeCommonJsPlugin = () => commonjs()

const makeBabelPlugin = () =>
  babel({
    root: resolveFromRoot(),
    configFile: resolveFromRoot('config/babel.js'),
    exclude: '**/node_modules/**',
    extensions: ['.ts'],
  })

const makeReplacePlugin = pkg =>
  replace({
    PKG_NAME: JSON.stringify(pkg.name),
    PKG_DESCRIPTION: JSON.stringify(pkg.description),
    PKG_VERSION: JSON.stringify(pkg.version),
  })

const makeConfig = ({path, esm, cjs}, pkg) => ({
  input: resolveFromRoot(path, pkg.source),
  output: [
    esm && {
      file: resolveFromRoot(path, pkg.module),
      format: 'esm',
      sourcemap: true,
    },
    cjs && {
      file: resolveFromRoot(path, pkg.main),
      format: 'cjs',
      sourcemap: true,
    },
  ].filter(_ => _),
  plugins: [
    makeReplacePlugin(pkg),
    makeResolvePlugin(),
    makeCommonJsPlugin(),
    makeBabelPlugin(),
  ],
  external: [...Object.keys(pkg.dependencies || {}), ...builtins],
})

const makeBundleConfig = ({path}, pkg) => ({
  input: resolveFromRoot(path, pkg.source),
  output: [
    {
      file: resolveFromRoot(path, 'umd', `${path.basename(pkg.name)}.js`),
      format: 'umd',
      name: upperFirst(camelCase(pkg.name)),
      sourcemap: true,
    },
    {
      file: resolveFromRoot(path, 'umd', `${path.basename(pkg.name)}.min.js`),
      format: 'umd',
      name: upperFirst(camelCase(pkg.name)),
      plugins: [terser()],
      sourcemap: true,
    },
  ],
  plugins: [
    makeReplacePlugin(pkg),
    makeResolvePlugin(false),
    makeCommonJsPlugin(),
    makeBabelPlugin(),
  ],
})

export default function config(cliArgs) {
  return ENTRIES.filter(entry => !cliArgs.configBundle || entry.umd).map(
    entry => {
      const pkg = require(resolveFromRoot(entry.path, 'package.json'))
      const configBuilder = cliArgs.configBundle ? makeBundleConfig : makeConfig

      return configBuilder(entry, pkg)
    }
  )
}
