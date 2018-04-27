// runs pcb-stackup on the board fixtures
'use strict'

const runParallel = require('run-parallel')
const runWaterfall = require('run-waterfall')
const debug = require('debug')('tracespace/pcb-stackup/integration')

const pcbStackup = require('..')

module.exports = function getResults (boards, done) {
  debug(`Rendering stackups for ${boards.length} boards`)

  const tasks = boards.map(board => next => renderStackup(board, next))

  runParallel(tasks, done)
}

function renderStackup (board, done) {
  const options = Object.assign({id: `__${board.name}`}, board.options)
  const layers = board.layers.map(layer => {
    const {filename} = layer

    return {
      filename: filename,
      gerber: layer.contents,
      options: Object.assign({id: `__${filename}`}, layer.options)
    }
  })

  runWaterfall(
    [
      next => pcbStackup(layers, options, next),
      (stackup, next) => next(null, Object.assign({stackup}, board))
    ],
    done
  )
}
