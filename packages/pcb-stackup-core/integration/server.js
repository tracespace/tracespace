// simple visual test server for pcb-stackup-core
'use strict'

const runWaterfall = require('run-waterfall')
const debug = require('debug')('tracespace/pcb-stackup-core/integration')

const {getBoards, server} = require('@tracespace/fixtures')
const {name} = require('../package.json')
const getResults = require('./get-results')

const PORT = 8001

const app = server(name, function getPcbStackupCoreResults (done) {
  debug('Getting results')
  runWaterfall([getBoards, getResults], done)
})

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`)
})
