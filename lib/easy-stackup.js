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
      callback(null, stackup)
    }
    layerCount -= 1
  }

  if (layerCount === 0) {
    finishLayer()
  }
  else {
    layers.forEach(function(layer) {
      var layerType
      var options = layer.options || {}
      if ('layerType' in layer) {
        layerType = layer.layerType
      }
      else if ('filename' in layer) {
        layerType = whatsThatGerber(layer.filename)
      }
      if (!('id' in options)) {
        options.id = shortId.generate()
      }
      if (!('plotAsOutline' in options) ) {
        options.plotAsOutline = layerType === 'out'
      }
      var converter = gerberToSvg(layer.gerber, options, finishLayer)
      stackupLayers.push({id:layerType}, converter)
    })
  }
}
