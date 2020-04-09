import path from 'path'
import builtins from 'builtin-modules'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import babel from 'rollup-plugin-babel'
import {terser} from 'rollup-plugin-terser'
import {camelCase, upperFirst} from 'lodash'

const ENTRIES = [
  {dir: 'packages/cli', esm: false, cjs: true, umd: false},
  {dir: 'packages/parser', esm: true, cjs: true, umd: true},
  {dir: 'packages/plotter', esm: true, cjs: true, umd: true},
  {dir: 'packages/renderer', esm: true, cjs: true, umd: true},
  {dir: 'packages/whats-that-gerber', esm: true, cjs: true, umd: true},
  {dir: 'packages/xml-id', esm: true, cjs: true, umd: true},
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

const makeConfig = ({dir, esm, cjs}, pkg) => ({
  input: resolveFromRoot(dir, pkg.source),
  output: [
    esm && {
      file: resolveFromRoot(dir, pkg.module),
      format: 'esm',
      sourcemap: true,
    },
    cjs && {
      file: resolveFromRoot(dir, pkg.main),
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

const makeBundleConfig = ({dir}, pkg) => ({
  input: resolveFromRoot(dir, pkg.source),
  output: [
    {
      file: resolveFromRoot(dir, 'umd', `${path.basename(pkg.name)}.js`),
      format: 'umd',
      name: upperFirst(camelCase(pkg.name)),
      sourcemap: true,
    },
    {
      file: resolveFromRoot(dir, 'umd', `${path.basename(pkg.name)}.min.js`),
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
      const pkg = require(resolveFromRoot(entry.dir, 'package.json'))
      const configBuilder = cliArgs.configBundle ? makeBundleConfig : makeConfig

      return configBuilder(entry, pkg)
    }
  )
}
