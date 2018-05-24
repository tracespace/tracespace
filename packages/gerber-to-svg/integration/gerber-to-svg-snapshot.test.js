// gerber-to-svg render snapshot tests
'use strict'

const format = require('xml-formatter')
const snapshot = require('snap-shot-it')

const {getGerberSpecs} = require('@tracespace/fixtures')
const getResults = require('./get-results')

const SUITES = getGerberSpecs.sync()

describe(`gerber-to-svg :: integration`, function () {
  let renderedSuites

  before(function (done) {
    getResults(SUITES, (error, results) => {
      if (error) return done(error)
      renderedSuites = results
      done()
    })
  })

  SUITES.forEach((suite, suiteIndex) => {
    suite.specs.forEach((spec, specIndex) => {
      it(`renders ${suite.name} :: ${spec.name}`, function () {
        const result = renderedSuites[suiteIndex].specs[specIndex]
        snapshot(format(result.render).split('\n'))
      })
    })
  })
})
