// gerber-to-svg render snapshot tests
'use strict'

const prettier = require('prettier')
const snapshot = require('snap-shot-it')

const {getGerberSpecs, getBoards} = require('@tracespace/fixtures')
const getResults = require('./get-results')

const SUITES = [
  ...getGerberSpecs.sync(),
  ...getBoards.sync().filter(b => !b.skipSnapshot),
]

describe(`gerber-to-svg :: integration`, function() {
  this.timeout(15000)

  SUITES.forEach(suite =>
    describe(suite.name, function() {
      const specs = suite.specs || suite.layers
      let suiteResults

      before(function(done) {
        if (process.env.INTEGRATION !== '1') return this.skip()

        getResults(suite, (error, results) => {
          if (error) return done(error)
          suiteResults = results
          done()
        })
      })

      specs.forEach((spec, i) =>
        it(`renders ${spec.name}`, function() {
          const result = suiteResults.specs[i]
          snapshot(prettier.format(result.render, {parser: 'html'}).split('\n'))
        })
      )
    })
  )
})
