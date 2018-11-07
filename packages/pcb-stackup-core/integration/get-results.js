// runs pcb-stackup-core on the board fixtures
'use strict'

const runParallel = require('run-parallel')
const runWaterfall = require('run-waterfall')

const gerberToSvg = require('gerber-to-svg')
const whatsThatGerber = require('whats-that-gerber')

const debug = require('debug')('tracespace/pcb-stackup-core/integration')
const pcbStackupCore = require('..')

module.exports = function getStackupResults(board, done) {
  debug(`Render started for ${board.name}`)

  const {layers} = board
  const options = Object.assign(
    {
      id: `__${board.name}`,
      maskWithOutline: true,
    },
    board.options
  )

  const layerTypes = whatsThatGerber(layers.map(l => l.name))

  runWaterfall(
    [
      next =>
        runParallel(
          layers.map(layer => next => renderLayer(layer, layerTypes, next)),
          next
        ),
      (layers, next) => {
        try {
          const stackup = pcbStackupCore(layers, options)
          debug(`Render finished for ${board.name}`)

          next(null, makeBoardResult(board, stackup))
        } catch (error) {
          next(error)
        }
      },
    ],
    done
  )
}

function makeBoardResult(board, stackup) {
  return Object.assign(
    {
      specs: [
        {name: 'top', render: stackup.top.svg},
        {name: 'bottom', render: stackup.bottom.svg},
      ],
    },
    board
  )
}

function renderLayer(layer, layerTypes, done) {
  const {filename, name, type: realType, side: realSide} = layer
  const {type, side} = layerTypes[name]
  const options = Object.assign(
    {
      id: `__${filename}`,
      plotAsOutline: type === whatsThatGerber.TYPE_OUTLINE,
    },
    layer.options
  )

  if (type !== realType) {
    return done(
      new Error(`${name} is type ${realType}, but ${type} was inferred`)
    )
  }

  if (side !== realSide) {
    return done(
      new Error(`${name} is side ${realSide}, but ${side} was inferred`)
    )
  }

  const converter = gerberToSvg(layer.source, options, error => {
    if (error) return done(error)

    done(null, {converter, type, side})
  })
}
