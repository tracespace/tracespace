// pcb-stackup main
'use strict'

var extend = require('xtend')
var xid = require('@tracespace/xml-id')
var gerberToSvg = require('gerber-to-svg')
var createStackup = require('pcb-stackup-core')
var wtg = require('whats-that-gerber')

var getFilename = function(layer) {
  return layer.filename
}

var getValidationMessage = function(layer) {
  var result = wtg.validate(layer)

  if (layer.filename || result.valid) return ''
  if (!layer.type) return 'is missing filename or side/type'
  return 'has invalid side/type (' + layer.side + '/' + layer.type + ')'
}

var pcbStackup = function(layers, options, done) {
  if (typeof options === 'function') {
    done = options
    options = {}
  } else if (options == null) {
    options = {}
  }

  var validationMessage = layers
    .map(getValidationMessage)
    .map(function(msg, i) {
      return msg && 'layer ' + i + ' ' + msg
    })
    .filter(Boolean)
    .join(', ')

  if (validationMessage) return done(new Error(validationMessage))

  options.id = options.id || xid.random()

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

      stackup.layers = stackupLayers

      return done(null, stackup)
    }
  }

  if (layerCount === 0) {
    return finishLayer()
  }

  var gerberIds = wtg(layers.map(getFilename))

  layers.forEach(function(layer) {
    var gerberId = gerberIds[layer.filename]
    var layerSide = layer.side || gerberId.side
    var layerType = layer.type || gerberId.type
    var layerOptions = extend(layer.options)

    layerOptions.id = layerOptions.id || xid.random()

    layerOptions.plotAsOutline =
      layerOptions.plotAsOutline || layerType === wtg.TYPE_OUTLINE

    if (options.outlineGapFill != null && layerOptions.plotAsOutline) {
      layerOptions.plotAsOutline = options.outlineGapFill
    }

    var usePreConverted = layer.gerber == null
    var converter

    if (usePreConverted) {
      converter = layer.converter
    } else {
      converter = gerberToSvg(layer.gerber, layerOptions, finishLayer)
    }

    stackupLayers.push({
      side: layerSide,
      type: layerType,
      filename: layer.filename,
      converter: converter,
      options: layerOptions,
    })

    if (usePreConverted) {
      finishLayer()
    }
  })
}

module.exports = pcbStackup
