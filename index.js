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

/**
 * The pcb-stackup converter function.
 * @param {array<Layer>} layers Array of layer objects
 * @param {object} [options={id: shortId.generate()}] Optional options, see
 * [pcb-stackup-core-docs]{@link
 * https://github.com/tracespace/pcb-stackup-core/blob/master/README.md#options}.
 * @param {Done} done Callback function.
 * @return {any} Anything, probably null
*/
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

/**
 * @typedef Layer
 * @type {object}
 * @property {string | NodeJS.ReadableStream} gerber The gerber data as a
 * string or [ReadableStream]{@link
 * https://nodejs.org/api/stream.html#stream_readable_streams}
 * @property {string} [filename] The filename so we can try and identify the
 * type of the layer. You either have to provide this or the layerType.
 * @property {string} [layerType] The layer type, a [valid layer type]{@link https://github.com/tracespace/whats-that-gerber#layer-types-and-names} as given
 * by whats-that-gerber.
 * @property {object} [options={id: shortId.generate()}] [gerber-to-svg options]{@link https://github.com/mcous/gerber-to-svg/blob/master/API.md#options}
*/

/**
 * @typedef Done
 * @type {function}
 * @param {Error} error Error if something goes wrong.
 * @param {Stackup} stackup The stackup data.
*/

/**
 * @typedef Stackup
 * @type {object}
 * @property {object} top The top view SVG object, see [pcb-stackup-core docs]{@link
 * https://github.com/tracespace/pcb-stackup-core/blob/master/README.md#usage} for full details.
 * @property {string} top.svg The top SVG string.
 * @property {object} bottom The bottom view SVG object, see [pcb-stackup-core docs]{@link
 * https://github.com/tracespace/pcb-stackup-core/blob/master/README.md#usage} for full details.
 * @property {string} bottom.svg The bottom SVG string.
 * @property {Array<Layer>} layers A cache of the processed layers that can be
 * passed back to pcbStackup.
*/
