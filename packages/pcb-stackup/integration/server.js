// simple visual test server for pcb-stackup
'use strict'

const express = require('express')
const runWaterfall = require('run-waterfall')
const debug = require('debug')('tracespace/pcb-stackup/integration')

const {getBoards, runTemplate} = require('@tracespace/fixtures')
const getResults = require('./get-results')
const pkg = require('../package.json')

const PORT = 8000

const app = express()

app.get('/', (request, response) => {
  handleTestRun((error, result) => {
    if (error) {
      console.error(error)
      return response.status(500).send({error: error.message})
    }

    console.log('Boards rendered successfully')
    response.send(result)
  })
})

app.listen(PORT, () => {
  console.log(`pcb-stackup server listening at http://localhost:${PORT}`)
})

function handleTestRun (done) {
  debug('Handling test run')

  runWaterfall([getBoards, getResults, makeResponse], done)
}

function makeResponse (boards, done) {
  runTemplate({boards, pkg}, done)
}
