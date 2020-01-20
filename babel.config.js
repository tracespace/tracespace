'use strict'

module.exports = {
  presets: [
    ['@babel/preset-env', {modules: false}],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  plugins: [
    ['@babel/plugin-proposal-class-properties', {loose: true}],
    ['@babel/proposal-object-rest-spread', {loose: true}],
    '@babel/plugin-syntax-dynamic-import',
  ],
  overrides: [
    {
      test: 'apps/view/**/*',
      presets: [['@babel/preset-env', {useBuiltIns: 'usage', corejs: 3}]],
      plugins: ['react-hot-loader/babel'],
    },
  ],
}
