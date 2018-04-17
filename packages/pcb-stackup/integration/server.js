// simple visual test server for pcb-stackup-core
'use strict'

const fs = require('fs')
const path = require('path')
const express = require('express')
const runWaterfall = require('run-waterfall')
const template = require('lodash/template')
const debug = require('debug')('tracespace/pcb-stackup/integration')

const {getBoards} = require('@tracespace/fixtures')
const getResults = require('./get-results')
const pkg = require('../package.json')

const PORT = 8000
const TEMPLATE = path.join(__dirname, 'index.template.html')

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

  runWaterfall([getBoards, getResults, runTemplate], done)
}

function runTemplate (boards, done) {
  runWaterfall(
    [
      next => fs.readFile(TEMPLATE, 'utf8', next),
      (contents, next) => {
        try {
          next(null, template(contents)({boards, pkg}))
        } catch (error) {
          next(error)
        }
      }
    ],
    done
  )
}
