// simpler API main function
'use strict'
var gerberToSvg = require('gerber-to-svg')
var shortId = require('shortid')
var whatsThatGerber = require('whats-that-gerber')

var pcbStackup = require('./index')

module.exports = function(layers, options, done) {
  if (typeof options === 'function') {
    done = options
    options = {}
  }

  for (var i in layers) {
    if (!(layers[i].filename || layers[i].layerType)) {
      return done(new Error('No filename or layerType given for layer ' + i))
    }
  }

  options.id = options.id || shortId.generate()

  var layerCount = layers.length
  var stackupLayers = []

  var finishLayer = function() {
    if (--layerCount < 1) {
      var stackup = pcbStackup(stackupLayers, options)

      stackup.layers = stackupLayers.map(function(layer) {
        return {
          layerType: layer.type.id,
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
      type: {id: layerType},
      converter: converter,
      options: layerOptions
    })
  })
}
