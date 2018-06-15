// runs gerber-to-svg on the gerber spec suite
'use strict'

const path = require('path')
const runParallel = require('run-parallel')
const runWaterfall = require('run-waterfall')

const debug = require('debug')('tracespace/gerber-to-svg/integration')
const gerberToSvg = require('..')

module.exports = function getResults (suites, done) {
  debug(`Rendering specs from ${suites.length} suites`)

  const tasks = suites.map(suite => next => renderSuite(suite, next))

  runParallel(tasks, done)
}

function renderSuite (suite, done) {
  debug(`Render started for ${suite.name}`)

  const specTasks = suite.specs.map(spec => next => renderSpec(spec, next))

  runWaterfall(
    [
      next => runParallel(specTasks, next),
      (specs, next) => next(null, Object.assign(suite, {specs}))
    ],
    done
  )
}

function renderSpec (spec, done) {
  debug(`Rendering ${spec.category} - ${spec.name}`)

  const renderOptions = {
    id: path.basename(spec.filepath),
    optimizePaths: true
  }

  runWaterfall(
    [
      next => gerberToSvg(spec.source, renderOptions, next),
      (render, next) => next(null, Object.assign({render}, spec))
    ],
    done
  )
}
