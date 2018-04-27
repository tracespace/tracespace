// simple visual test server for pcb-stackup
'use strict'

const runWaterfall = require('run-waterfall')
const debug = require('debug')('tracespace/pcb-stackup/integration')

const {getBoards, server} = require('@tracespace/fixtures')
const {name} = require('../package.json')
const getResults = require('./get-results')

const PORT = 8000

const app = server(name, function getPcbStackupResults (done) {
  debug('Getting results')
  runWaterfall([getBoards, getResults], done)
})

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`)
})
