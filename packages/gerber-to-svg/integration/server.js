// simple visual test server for gerber-to-svg
'use strict'

const {getGerberSpecs, server} = require('@tracespace/fixtures')
const {name} = require('../package.json')
const getSuiteResults = require('./get-results')

const PORT = 8002

server(name, getGerberSpecs, getSuiteResults).listen(PORT, () =>
  console.log(`Listening at http://localhost:${PORT}`)
)
