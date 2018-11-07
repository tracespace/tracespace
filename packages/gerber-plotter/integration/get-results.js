// runs gerber-parser on the gerber spec and board suites
'use strict'

const concat = require('concat-stream')
const pump = require('pump')
const runParallel = require('run-parallel')
const runWaterfall = require('run-waterfall')
const toReadable = require('to-readable-stream')

const debug = require('debug')('tracespace/gerber-plotter/integration')
const gerberParser = require('gerber-parser')
const gerberPlotter = require('gerber-plotter')
const wtg = require('whats-that-gerber')

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
      plotAsOutline: spec.type === wtg.TYPE_OUTLINE,
    },
    spec.options
  )

  let render
  const source = toReadable(spec.source)
  const parser = gerberParser(renderOptions)
  const plotter = gerberPlotter(renderOptions)
  const dest = concat(result => (render = result))

  runWaterfall(
    [
      next => pump(source, parser, plotter, dest, next),
      next => next(null, Object.assign({render}, spec)),
    ],
    done
  )
}
