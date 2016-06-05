//simpler API main function
'use strict'
var gerberToSvg = require('gerber-to-svg')
var shortId = require('shortid')
var whatsThatGerber = require('whats-that-gerber')

var pcbStackup = require('./index')

module.exports = function(layers, optionsOrCallback, callback) {
  var options = {}

  if (typeof optionsOrCallback === 'object') {
    options = optionsOrCallback
  }
  else if (typeof optionsOrCallback === 'function') {
    callback = optionsOrCallback
  }

  if (!('id' in options)) {
    options.id = shortId.generate()
  }

  var layerCount = layers.length
  var stackupLayers = []

  var finishLayer = function() {
    if (layerCount <= 1) {
      var stackup = pcbStackup(stackupLayers, options)
      stackup.layers = stackupLayers.map(function(layer) {
        return {
          layerType: layer.type.id,
          gerber: layer.converter,
          options: layer.options
        }
      })
      callback(null, stackup)
    }
    layerCount -= 1
  }

  if (layerCount === 0) {
    finishLayer()
  }
  else {
    for (var i in layers) {
      var layer = layers[i]
      var layerType
      var layerOptions = layer.options || {}
      if ('layerType' in layer) {
        layerType = layer.layerType
      }
      else if ('filename' in layer) {
        layerType = whatsThatGerber(layer.filename)
      }
      else {
        callback(new Error('No filename or layerType given for layer ' + i))
      }
      if (!('id' in layerOptions)) {
        layerOptions.id = shortId.generate()
      }
      if (!('plotAsOutline' in layerOptions) ) {
        layerOptions.plotAsOutline = layerType === 'out'
      }
      var converter = gerberToSvg(layer.gerber, layerOptions, finishLayer)
      stackupLayers.push({
        type: {id:layerType},
        converter: converter,
        options: layerOptions
      })
    }
  }
}
