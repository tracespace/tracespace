// pcb-stackup main
'use strict'

var gerberToSvg = require('gerber-to-svg')
var shortId = require('shortid')
var whatsThatGerber = require('whats-that-gerber')
var createStackup = require('pcb-stackup-core')

var getInvalidLayers = function(layers) {
  var isValid = function(layer) {
    return layer.filename || layer.layerType
  }

  return layers.reduce(function(result, layer, i) {
    if (!isValid(layer)) {
      result.push(i)
    }

    return result
  }, [])
}

var pcbStackup = function(layers, options, done) {
  if (typeof options === 'function') {
    done = options
    options = {}
  }

  var invalidLayers = getInvalidLayers(layers)

  if (invalidLayers.length) {
    var msg = 'No filename or layerType given for layer(s): ' + invalidLayers.join(', ')

    return done(new Error(msg))
  }

  options.id = options.id || shortId.generate()

  var layerCount = layers.length
  var stackupLayers = []

  var finishLayer = function() {
    if (--layerCount < 1) {
      var stackup = createStackup(stackupLayers, options)

      stackup.layers = stackupLayers.map(function(layer) {
        return {
          layerType: layer.type,
          gerber: layer.converter,
          options: layer.options
        }
      })

      return done(null, stackup)
    }
  }

  if (layerCount === 0) {
    return finishLayer()
  }

  layers.forEach(function(layer) {
    var layerType = layer.layerType || whatsThatGerber(layer.filename)
    var layerOptions = layer.options || {}

    layerOptions.id = layerOptions.id || shortId.generate()
    layerOptions.plotAsOutline = layerOptions.plotAsOutline || (layerType === 'out')

    var converter = gerberToSvg(layer.gerber, layerOptions, finishLayer)

    stackupLayers.push({
      type: layerType,
      converter: converter,
      options: layerOptions
    })
  })
}

module.exports = pcbStackup
