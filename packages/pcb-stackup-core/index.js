// main pcb stackup function
'use strict'

var extend = require('xtend')
var wtg = require('whats-that-gerber')
var vb = require('viewbox')

var boardColor = require('./lib/board-color')
var parseOptions = require('./lib/parse-options')
var sortLayers = require('./lib/sort-layers')
var stackLayers = require('./lib/stack-layers')

var SIDES = [wtg.SIDE_TOP, wtg.SIDE_BOTTOM]

var BASE_ATTRIBUTES = {
  version: '1.1',
  xmlns: 'http://www.w3.org/2000/svg',
  'xmlns:xlink': 'http://www.w3.org/1999/xlink',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
  'stroke-width': 0,
  'fill-rule': 'evenodd',
  'clip-rule': 'evenodd',
}

module.exports = function pcbStackupCore(layers, inputOpts) {
  var options = parseOptions(inputOpts)
  var sorted = sortLayers(layers)

  var id = options.id
  var color = options.color
  var attributes = options.attributes
  var useOutline = options.useOutline
  var element = options.createElement

  var stacks = SIDES.map(function(side) {
    return stackLayers(
      element,
      id,
      side,
      sorted[side],
      sorted.drills,
      sorted.outline,
      useOutline
    )
  })

  var box = stacks.reduce(function(result, stack) {
    return vb.add(result, stack.box)
  }, vb.create())

  if (box.length !== 4) box = [0, 0, 0, 0]

  return stacks.reduce(function(result, stack, index) {
    var side = SIDES[index]
    var style = boardColor.getStyleElement(element, id + '_', side, color)
    var units = stack.units
    var mechMaskId = stack.mechMaskId
    var outClipId = stack.outClipId
    var defs = [style].concat(stack.defs)
    var layer = [
      element(
        'g',
        getGroupAttributes(box, side, mechMaskId, outClipId),
        stack.layer
      ),
    ]

    var defsNode = element('defs', {}, defs)
    var layerNode = element('g', getLayerAttributes(box), layer)
    var sideAttributes = extend(
      BASE_ATTRIBUTES,
      {
        id: id + '_' + side,
        viewBox: vb.asString(box),
        width: box[2] / 1000 + units,
        height: box[3] / 1000 + units,
      },
      attributes
    )

    result[side] = {
      svg: element('svg', sideAttributes, [defsNode, layerNode]),
      attributes: sideAttributes,
      defs: defs,
      layer: layer,
      viewBox: box,
      width: box[2] / 1000,
      height: box[3] / 1000,
      units: units,
    }

    return result
  }, options)
}

function getGroupAttributes(box, side, mechMaskId, outClipId) {
  var attr = {mask: 'url(#' + mechMaskId + ')'}

  if (outClipId) {
    attr['clip-path'] = 'url(#' + outClipId + ')'
  }

  // flip the bottom render in the x
  if (side === wtg.SIDE_BOTTOM) {
    var xTranslation = 2 * box[0] + box[2]
    attr.transform = 'translate(' + xTranslation + ',0) scale(-1,1)'
  }

  return attr
}

function getLayerAttributes(box) {
  var yTranslation = 2 * box[1] + box[3]
  return {transform: 'translate(0,' + yTranslation + ') scale(1,-1)'}
}
