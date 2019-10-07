// webpack config helpers
'use strict'

const path = require('path')
const HtmlPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')
const merge = require('webpack-merge')

const DEV_MODE = process.env.NODE_ENV !== 'production'
const ANALYZER = Boolean(process.env.ANALYZER)
const OUT_DIRNAME = 'dist'

const baseConfig = dirname => ({
  target: 'web',
  mode: DEV_MODE ? 'development' : 'production',
  devtool: DEV_MODE ? 'eval-source-map' : 'source-map',
  output: {
    path: path.join(dirname, OUT_DIRNAME),
    filename: DEV_MODE ? '[name].js' : '[name].[contenthash].js',
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: DEV_MODE ? '[name].css' : '[name].[contenthash].css',
      chunkFilename: DEV_MODE ? '[id].css' : '[id].[contenthash].css',
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: ANALYZER ? 'server' : 'disabled',
      openAnalyzer: ANALYZER,
    }),
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
        sourceMap: true,
      }),
      new OptimizeCssAssetsPlugin(),
    ],
  },
  devServer: {
    contentBase: path.join(dirname, OUT_DIRNAME),
    historyApiFallback: true,
    disableHostCheck: true,
  },
})

const browserScriptConfig = dirname =>
  merge(baseConfig(dirname), {
    output: {
      filename: '[name].min.js',
      libraryTarget: 'var',
    },
    plugins: [
      new HtmlPlugin({
        title: `${path.basename(dirname)} bundle`,
      }),
    ],
  })

module.exports = {
  DEV_MODE,
  ANALYZER,
  OUT_DIRNAME,
  baseConfig,
  browserScriptConfig,
}
