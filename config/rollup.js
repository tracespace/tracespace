import path from 'path'
import builtins from 'builtin-modules'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from 'rollup-plugin-babel'
import {terser} from 'rollup-plugin-terser'
import {camelCase, upperFirst} from 'lodash'

const ENTRIES = [
  {path: 'packages/cli', esm: false, cjs: true, umd: false},
  {path: 'packages/whats-that-gerber', esm: true, cjs: true, umd: true},
  {path: 'packages/xml-id', esm: true, cjs: true, umd: true},
]

const resolveAbs = (...paths) => path.join(__dirname, '..', ...paths)

const makeConfig = (entry, pkg) => ({
  input: resolveAbs(entry.path, pkg.source),
  output: [
    entry.esm && {
      file: resolveAbs(entry.path, pkg.module),
      format: 'esm',
      sourcemap: true,
    },
    entry.cjs && {
      file: resolveAbs(entry.path, pkg.main),
      format: 'cjs',
      sourcemap: true,
    },
  ].filter(_ => _),
  plugins: [
    resolve({
      extensions: ['.mjs', '.js', '.json', '.node', '.ts'],
    }),
    commonjs(),
    babel({
      root: path.join(__dirname, '..'),
      configFile: path.join(__dirname, './babel.js'),
      exclude: '**/node_modules/**',
      extensions: ['.ts'],
    }),
  ],
  external: [...Object.keys(pkg.dependencies || {}), ...builtins],
})

const makeBundleConfig = (entry, pkg) => ({
  input: resolveAbs(entry.path, pkg.source),
  output: [
    {
      file: resolveAbs(entry.path, 'umd', `${path.basename(pkg.name)}.js`),
      format: 'umd',
      name: upperFirst(camelCase(pkg.name)),
      sourcemap: true,
    },
    {
      file: resolveAbs(entry.path, 'umd', `${path.basename(pkg.name)}.min.js`),
      format: 'umd',
      name: upperFirst(camelCase(pkg.name)),
      plugins: [terser()],
      sourcemap: true,
    },
  ],
  plugins: [
    resolve({
      extensions: ['.mjs', '.js', '.json', '.node', '.ts'],
      preferBuiltins: false,
    }),
    commonjs(),
    babel({
      root: path.join(__dirname, '..'),
      configFile: path.join(__dirname, './babel.js'),
      exclude: '**/node_modules/**',
      extensions: ['.ts'],
    }),
  ],
})

export default function config(cliArgs) {
  return ENTRIES.filter(entry => !cliArgs.configBundle || entry.umd).map(
    entry => {
      const pkg = require(resolveAbs(entry.path, 'package.json'))
      const configBuilder = cliArgs.configBundle ? makeBundleConfig : makeConfig

      return configBuilder(entry, pkg)
    }
  )
}
