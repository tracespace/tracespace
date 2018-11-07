'use strict'

const fs = require('fs')
const path = require('path')
const express = require('express')
const runParallel = require('run-parallel')
const runWaterfall = require('run-waterfall')
const template = require('lodash/template')
const debug = require('debug')('tracespace/fixtures/server')

const TEMPLATE = path.join(__dirname, './template.html')

module.exports = function makeServer(name, getSuites, getSuiteResult) {
  const app = express()

  app.get('/', (request, response) => {
    handleTestRun((error, result) => {
      debug('Test run complete')

      if (error) {
        console.error(error)
        return response.status(500).send({error: error.message})
      }

      response.send(result)
    })
  })

  return app

  function handleTestRun(done) {
    runWaterfall([getSuites, getResults, makeResponse], done)
  }

  function getResults(suites, done) {
    debug(`Rendering specs from ${suites.length} suites`)

    const tasks = suites.map(suite => next => getSuiteResult(suite, next))

    runParallel(tasks, done)
  }

  function makeResponse(results, done) {
    debug(`Running template with ${results.length} suites`)

    runTemplate({name, results}, done)
  }
}

function runTemplate(props, done) {
  runWaterfall(
    [
      next => fs.readFile(TEMPLATE, 'utf8', next),
      (contents, next) => {
        try {
          next(null, template(contents)(props))
        } catch (error) {
          next(error)
        }
      },
    ],
    done
  )
}
