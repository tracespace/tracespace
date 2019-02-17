'use strict'

const path = require('path')
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')
const FileManagerPlugin = require('filemanager-webpack-plugin')
const HtmlPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

const pkg = require('./package.json')

const DEV_MODE = process.env.NODE_ENV !== 'production'
const ANALYZER = Boolean(process.env.ANALYZER)

const OUT_PATH = path.join(__dirname, 'dist')

const EXAMPLE_FILES = path.join(
  path.dirname(require.resolve('@tracespace/fixtures')),
  'boards/arduino-uno/**'
)

const EXAMPLE_OUT = path.join(OUT_PATH, 'arduino-uno.zip')

module.exports = {
  target: 'web',
  mode: DEV_MODE ? 'development' : 'production',
  entry: {
    bundle: path.join(__dirname, 'src/index.tsx'),
  },
  output: {
    filename: DEV_MODE ? '[name].js' : '[name].[contenthash].js',
    path: OUT_PATH,
    globalObject: 'this',
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.d.ts', '.json', '.css'],
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
  },
  module: {
    rules: [
      {
        test: /\.d\.ts$/,
        loader: 'null-loader',
      },
      {
        test: /worker\.ts$/i,
        loader: 'worker-loader',
      },
      {
        test: /\.tsx?$/,
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
          configFile: path.join(__dirname, '../../babel.config.js'),
        },
      },
      {
        test: /\.js$/,
        loader: 'source-map-loader',
        enforce: 'pre',
      },
      {
        test: /\.css$/,
        use: [
          DEV_MODE ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      },
      {
        test: /\.(png|ico)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[contenthash].[ext]',
        },
      },
    ],
  },
  plugins: [
    new FileManagerPlugin({
      onStart: {
        delete: [OUT_PATH],
      },
      onEnd: [
        {mkdir: [OUT_PATH]},
        {archive: [{source: EXAMPLE_FILES, destination: EXAMPLE_OUT}]},
      ],
    }),
    new HtmlPlugin({
      template: path.join(__dirname, 'src/template'),
      title: pkg.productName,
      author: pkg.author.name,
      description: pkg.description,
    }),
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
    minimizer: [new TerserPlugin(), new OptimizeCssAssetsPlugin()],
  },
  devServer: {
    historyApiFallback: true,
    disableHostCheck: true,
    contentBase: OUT_PATH,
  },
  devtool: DEV_MODE ? 'eval-source-map' : 'source-map',
}
