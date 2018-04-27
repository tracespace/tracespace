// runs gerber-to-svg on the gerber spec suite
'use strict'

const path = require('path')
const runParallel = require('run-parallel')
const runWaterfall = require('run-waterfall')

const gerberToSvg = require('gerber-to-svg')
const whatsThatGerber = require('whats-that-gerber')

const debug = require('debug')('tracespace:psc:test')
const pcbStackupCore = require('..')

module.exports = function getResults (boards, done) {
  debug(`Rendering stackups for ${boards.length} boards`)

  runParallel(boards.map(board => next => renderStackup(board, next)), done)
}

function renderStackup (board, done) {
  const options = {
    id: board.name,
    maskWithOutline: true
  }

  runWaterfall(
    [
      next =>
        runParallel(
          board.layers.map(layer => next => renderLayer(layer, next)),
          next
        ),
      (layers, next) => {
        try {
          const stackup = pcbStackupCore(layers, options)
          next(null, Object.assign({stackup}, board))
        } catch (error) {
          next(error)
        }
      }
    ],
    done
  )
}

function renderLayer (layer, done) {
  const {filepath, name, type: realType} = layer
  const type = whatsThatGerber(name)
  const options = {
    id: path.basename(filepath),
    plotAsOutline: type === 'out'
  }

  if (type !== realType) {
    return done(
      new Error(`${name} is type ${realType}, but ${type} was inferred`)
    )
  }

  const converter = gerberToSvg(layer.contents, options, error => {
    if (error) return done(error)

    done(null, {converter, type})
  })
}
