// runs gerber-to-svg on the gerber spec suite
'use strict'

const path = require('path')
const runParallel = require('run-parallel')
const runWaterfall = require('run-waterfall')

const debug = require('debug')('tracespace/gerber-to-svg/integration')
const wtg = require('whats-that-gerber')
const gerberToSvg = require('..')

module.exports = function getSuiteResults(suite, done) {
  debug(`Rendering suite ${suite.name}`)

  const specs = suite.specs || suite.layers
  const specTasks = specs.map(spec => next => renderSpec(spec, next))

  runWaterfall(
    [
      next => runParallel(specTasks, next),
      (specs, next) => next(null, Object.assign(suite, {specs})),
    ],
    done
  )
}

function renderSpec(spec, done) {
  debug(`Rendering ${spec.category} - ${spec.name}`)

  const renderOptions = Object.assign(
    {
      id: path.basename(spec.filepath),
      plotAsOutline: spec.type === wtg.TYPE_OUTLINE,
    },
    spec.options
  )

  runWaterfall(
    [
      next => gerberToSvg(spec.source, renderOptions, next),
      (render, next) => next(null, Object.assign({render}, spec)),
    ],
    done
  )
}
