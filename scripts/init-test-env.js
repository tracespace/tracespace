'use strict'

const Enzyme = require('enzyme')
const EnzymeAdapter = require('enzyme-adapter-react-16')

Enzyme.configure({adapter: new EnzymeAdapter()})

const chai = require('chai')
const sinonChai = require('sinon-chai')
const chaiAsPromised = require('chai-as-promised')

chai.use(sinonChai)
chai.use(chaiAsPromised)
