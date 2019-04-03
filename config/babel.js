'use strict'

module.exports = {
  presets: [
    ['@babel/preset-env', {modules: false}],
    '@babel/preset-typescript',
  ],
  plugins: ['@babel/plugin-proposal-class-properties'],
  overrides: [
    {
      test: '../apps/view/**/*',
      presets: [
        '@babel/preset-react',
        ['@babel/preset-env', {useBuiltIns: 'usage', corejs: 3}],
      ],
      plugins: ['react-hot-loader/babel'],
    },
  ],
}
