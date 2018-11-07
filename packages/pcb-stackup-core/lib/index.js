// main pcb stackup function
'use strict'

var xmlElementString = require('xml-element-string')
var wtg = require('whats-that-gerber')
var xid = require('@tracespace/xml-id')

var sortLayers = require('./sort-layers')
var stackLayers = require('./stack-layers')
var boardStyle = require('./_board-style')

var SIDES = [wtg.SIDE_TOP, wtg.SIDE_BOTTOM]

var svgAttributes = function(id, side, box, units, includeNs, attributes) {
  var width = box[2] / 1000 + units
  var height = box[3] / 1000 + units

  var attr = {
    id: id + '_' + side,
    version: '1.1',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': 0,
    'fill-rule': 'evenodd',
    'clip-rule': 'evenodd',
    viewBox: box.join(' '),
    width: width,
    height: height,
  }

  if (includeNs || includeNs == null) {
    attr.xmlns = 'http://www.w3.org/2000/svg'
  }

  Object.keys(attributes).forEach(function(key) {
    attr[key] = attributes[key]
  })

  return attr
}

var groupAttributes = function(box, side, mechMaskId, outClipId) {
  var attr = {mask: 'url(#' + mechMaskId + ')'}

  if (outClipId) {
    attr['clip-path'] = 'url(#' + outClipId + ')'
  }

  // flip the bottom render in the x
  if (side === wtg.SIDE_BOTTOM) {
    var xTranslate = box[2] + 2 * box[0]

    attr.transform = 'translate(' + xTranslate + ',0) scale(-1,1)'
  }

  return attr
}

var layerAttributes = function(box) {
  var yTranslate = box[3] + 2 * box[1]

  return {transform: 'translate(0,' + yTranslate + ') scale(1,-1)'}
}

var parseOptions = function(options) {
  if (typeof options === 'string') {
    return {id: options}
  }

  if (!options || !options.id) {
    throw new Error('pcb stackup requires unique board ID')
  }

  return options
}

module.exports = function pcbStackupCore(layers, opts) {
  var options = parseOptions(opts)
  var sorted = sortLayers(layers)
  var id = xid.sanitize(options.id)
  var color = options.color
  var attributes = options.attributes || {}
  var maskWithOutline = options.maskWithOutline
  var element = options.createElement || xmlElementString
  var includeNamespace = options.includeNamespace

  return SIDES.reduce(function(result, side) {
    var style = boardStyle(element, id + '_', side, color)

    var stack = stackLayers(
      element,
      id,
      side,
      sorted[side],
      sorted.drills,
      sorted.outline,
      maskWithOutline
    )

    var units = stack.units
    var mechMaskId = stack.mechMaskId
    var outClipId = stack.outClipId
    var box = stack.box.length === 4 ? stack.box : [0, 0, 0, 0]
    var defs = [style].concat(stack.defs)
    var layer = [
      element(
        'g',
        groupAttributes(box, side, mechMaskId, outClipId),
        stack.layer
      ),
    ]

    var defsNode = element('defs', {}, defs)
    var layerNode = element('g', layerAttributes(box), layer)
    var svgAttr = svgAttributes(
      id,
      side,
      box,
      units,
      includeNamespace,
      attributes
    )

    result[side] = {
      svg: element('svg', svgAttr, [defsNode, layerNode]),
      defs: defs,
      layer: layer,
      viewBox: box,
      width: box[2] / 1000,
      height: box[3] / 1000,
      units: units,
    }

    return result
  }, {})
}
