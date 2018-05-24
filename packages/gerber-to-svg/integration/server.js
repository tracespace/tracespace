// simple visual test server for gerber-to-svg
'use strict'

const runWaterfall = require('run-waterfall')
const debug = require('debug')('tracespace/gerber-to-svg/integration')

const {getGerberSpecs, server} = require('@tracespace/fixtures')
const {name} = require('../package.json')
const getResults = require('./get-results')

const PORT = 8002

const app = server(name, function getGerberToSvgResults (done) {
  debug('Getting results')
  runWaterfall([getGerberSpecs, getResults], done)
})

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`)
})
