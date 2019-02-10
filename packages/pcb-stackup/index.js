/* global Promise */
// pcb-stackup main
'use strict'

var extend = require('xtend')
var runParallel = require('run-parallel')
var runWaterfall = require('run-waterfall')
var gerberToSvg = require('gerber-to-svg')
var createStackup = require('pcb-stackup-core')
var wtg = require('whats-that-gerber')

module.exports = function pcbStackup(layers, options, done) {
  var result

  if (typeof options === 'function') {
    done = options
    options = null
  }

  validateLayersInput(layers)

  // promise mode
  if (done == null) {
    if (typeof Promise !== 'function') {
      throw new Error('No callback specified and global Promise not found')
    }

    result = new Promise(function(resolve, reject) {
      done = function callbackToPromise(error, stackup) {
        if (error) return reject(error)
        resolve(stackup)
      }
    })
  }

  var layerTypes = wtg(
    layers
      .map(function(layer) {
        return layer.filename
      })
      .filter(Boolean)
  )

  runWaterfall(
    [
      // render all layers with gerber-to-svg in parallel
      function renderAllLayers(next) {
        var layerTasks = layers.map(makeRenderLayerTask)
        runParallel(layerTasks, next)
      },
      // using the result of renderAllLayers, build the stackup
      function renderStackup(stackupLayers, next) {
        var stackup = createStackup(stackupLayers, options)
        stackup.layers = stackupLayers
        next(null, stackup)
      },
    ],
    function finish(error, stackup) {
      // ensure only error is passed if it exists
      if (error) return done(error)
      done(null, stackup)
    }
  )

  // if in Promise mode, return the Promise
  return result

  // map an pcb-stackup input layer into a function that will call a callback
  // once a pcb-stackup-core input layer is ready
  function makeRenderLayerTask(layer) {
    return function renderLayer(next) {
      var stackupLayer = makeBaseStackupLayer(layer)

      if (stackupLayer.converter) return next(null, stackupLayer)

      var converter = gerberToSvg(
        stackupLayer.gerber,
        stackupLayer.options,
        function handleLayerDone(error) {
          if (error) return next(error)
          stackupLayer.converter = converter
          next(null, stackupLayer)
        }
      )
    }
  }

  // extend pcb-stackup input layer with necessary details for pcb-stackup-core
  function makeBaseStackupLayer(layer) {
    var layerSide = layer.side
    var layerType = layer.type

    if (
      layer.filename &&
      typeof layerSide === 'undefined' &&
      typeof layerType === 'undefined'
    ) {
      var gerberId = layerTypes[layer.filename]
      layerSide = gerberId.side
      layerType = gerberId.type
    }

    var layerOptions = extend(layer.options)

    if (layerOptions.plotAsOutline == null && layerType === wtg.TYPE_OUTLINE) {
      layerOptions.plotAsOutline = true
    }

    if (options) {
      if (options.outlineGapFill != null && layerOptions.plotAsOutline) {
        layerOptions.plotAsOutline = options.outlineGapFill
      }

      if (options.createElement) {
        layerOptions.createElement = options.createElement
      }
    }

    return extend(layer, {
      side: layerSide,
      type: layerType,
      options: layerOptions,
    })
  }
}

function validateLayersInput(layers) {
  if (!Array.isArray(layers)) {
    throw new Error('first argument should be an array of layers')
  }

  var layerErrors = layers
    .map(getLayerValidationError)
    .filter(Boolean)
    .join(', ')

  if (layerErrors) throw new Error(layerErrors)
}

function getLayerValidationError(layer, index) {
  var result = wtg.validate(layer)
  var error = null

  if (!layer.converter && !layer.gerber) {
    error = 'is missing gerber source or cached converter'
  } else if (!layer.filename && !layer.type) {
    error = 'is missing filename or side/type'
  } else if (!layer.filename && !result.valid) {
    error = 'has invalid side/type (' + layer.side + '/' + layer.type + ')'
  }

  return error ? 'layer ' + index + ' ' + error : null
}
