// pcb-stackup main
'use strict'

var gerberToSvg = require('gerber-to-svg')
var shortId = require('shortid')
var whatsThatGerber = require('whats-that-gerber')
var createStackup = require('pcb-stackup-core')

var getInvalidLayers = function(layers) {
  var hasNameOrType = function(layer) {
    return layer.filename || layer.layerType
  }
  var hasValidType = function(layer) {
    if (layer.layerType == null) {
      return true
    }

    return whatsThatGerber.isValidType(layer.layerType)
  }

  return layers.reduce(function(result, layer, i) {
    if (!hasNameOrType(layer)) {
      result.argErrors.push(i)
    }

    if (!hasValidType(layer)) {
      result.layerTypeErrors.push(i + ': "' + layer.layerType + '"')
    }

    return result
  }, {argErrors: [], layerTypeErrors: []} )
}


var pcbStackup = function(layers, options, done) {
  if (typeof options === 'function') {
    done = options
    options = {}
  }

  var invalidLayers = getInvalidLayers(layers)
  var msg

  if (invalidLayers.argErrors.length) {
    msg = 'No filename or layerType given for layer(s): ' + invalidLayers.argErrors.join(', ')

    return done(new Error(msg))
  }

  if (invalidLayers.layerTypeErrors.length) {
    msg = 'Invalid layer type given for layer(s): ' + invalidLayers.layerTypeErrors.join(', ')

    return done(new Error(msg))
  }

  options.id = options.id || shortId.generate()

  if (options.maskWithOutline == null) {
    options.maskWithOutline = true
  }

  if (options.createElement != null) {
    layers.forEach(function(layer) {
      layer.options = layer.options || {}
      layer.options.createElement = options.createElement
    })
  }

  var layerCount = layers.length
  var stackupLayers = []

  var finishLayer = function() {
    if (--layerCount < 1) {
      var stackup = createStackup(stackupLayers, options)

      stackup.layers = stackupLayers.map(function(layer) {
        return {
          layerType: layer.type,
          converter: layer.converter,
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
    layerOptions.plotAsOutline = layerOptions.plotAsOutline || (layerType === 'out' )

    if (options.outlineGapFill != null && layerOptions.plotAsOutline) {
      layerOptions.plotAsOutline = options.outlineGapFill
    }

    var usePreConverted = layer.gerber == null
    var converter

    if (usePreConverted) {
      converter = layer.converter
    }
    else {
      converter = gerberToSvg(layer.gerber, layerOptions, finishLayer)
    }

    stackupLayers.push({
      type: layerType,
      converter: converter,
      options: layerOptions
    })

    if (usePreConverted) {
      finishLayer()
    }

  })
}

module.exports = pcbStackup
