'use strict'

const path = require('path')
const Enzyme = require('enzyme')
const EnzymeAdapter = require('enzyme-adapter-react-16')

require('@babel/register')({
  configFile: path.join(__dirname, '../config/babel.js'),
  plugins: [
    '@babel/plugin-transform-modules-commonjs',
    [
      'babel-plugin-module-resolver',
      {
        alias: {
          '^@tracespace/xml-id$': '@tracespace/xml-id/src/index.ts',
          '^whats-that-gerber$': 'whats-that-gerber/src/index.ts',
        },
      },
    ],
  ],
  extensions: ['.js', '.ts', '.tsx'],
  sourceMaps: 'inline',
})

Enzyme.configure({adapter: new EnzymeAdapter()})

const chai = require('chai')
const sinonChai = require('sinon-chai')
const chaiAsPromised = require('chai-as-promised')

chai.use(sinonChai)
chai.use(chaiAsPromised)
