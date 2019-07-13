// runs @tracespace/render-svg on the gerber spec suite
'use strict'

const runParallel = require('run-parallel')
const runWaterfall = require('run-waterfall')
const hastToHtml = require('hast-util-to-html')

const debug = require('debug')('tracespace/render-svg/integration')
const {createParser} = require('@tracespace/parser')
const {createBoard} = require('@tracespace/builder')
const {createRender} = require('..')

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
  let render = ''

  try {
    const parser = createParser()
    parser.feed(spec.source)

    const layers = [{filename: spec.filename, tree: parser.results()}]
    const board = createRender(createBoard(layers))
    const layer = board.layers[0]

    render = hastToHtml(layer.svgRender, {closeEmptyElements: true})
  } catch (e) {
    render = `${spec.filename} error: ${e.message}`
  }

  done(null, Object.assign({render}, spec))
}
