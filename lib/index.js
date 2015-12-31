// main pcb stackup function
'use strict'

var isString = require('lodash.isstring')
var reduce = require('lodash.reduce')

var identifyLayer = require('./layer-types').identify
var sortLayers = require('./sort-layers')
var stackLayers = require('./stack-layers')
var boardStyle = require('./_board-style')

var SIDES = ['top', 'bottom']

var svgNode = function(id, side, box, units) {
  var width = (box[2] / 1000) + units
  var height = (box[3] / 1000) + units
  return '<svg ' + [
    'id="' + id + '_' + side + '"',
    'xmlns="http://www.w3.org/2000/svg"',
    'version="1.1"',
    'xmlns:xlink="http://www.w3.org/1999/xlink"',
    'stroke-linecap="round"',
    'stroke-linejoin="round"',
    'stroke-width="0"',
    'fill-rule="evenodd"',
    'viewBox="' + box.join(' ') + '"',
    'width="' + width + '"',
    'height="' + height + '"'
  ].join(' ') + '>'
}

var defsNode = function(style, defs) {
  return '<defs>' + style + defs + '</defs>'
}

var groupNode = function(box, side, group) {
  var xTranslate = (side === 'top') ? 0 : (box[2] + 2 * box[0])
  var yTranslate = (box[3] + 2 * box[1])
  var xScale = (side === 'top') ? 1 : -1
  var yScale = -1
  var translate = 'translate(' + xTranslate + ',' + yTranslate + ')'
  var scale = 'scale(' + xScale + ',' + yScale + ')'
  var transform = 'transform="' + translate + ' ' + scale + '"'

  return '<g ' + transform + '>' + group + '</g>'
}

var parseOptions = function(options) {
  if (isString(options)) {
    return {id: options}
  }

  if (!options || !options.id) {
    throw new Error('pcb stackup requires unique board ID')
  }

  return options
}

module.exports = function pcbStackup(layers, opts) {
  var options = parseOptions(opts)
  var layersWithType = layers.map(function(layer) {
    return {converter: layer.converter, type: identifyLayer(layer.filename)}
  })
  var sorted = sortLayers(layersWithType)
  var id = options.id

  return reduce(SIDES, function(result, side) {
    var style = boardStyle(options.id + '_', side, options.color, options.maskWithOutline)
    var stack = stackLayers(id, side, sorted[side], sorted.mech, options.maskWithOutline)

    var box = (stack.box.length === 4) ? stack.box : [0, 0, 0, 0]
    var svg = svgNode(id, side, box, stack.units)
    var defs = defsNode(style, stack.defs)
    var group = groupNode(box, side, stack.group)

    result[side] = svg + defs + group + '</svg>'
    return result
  }, {})
}
