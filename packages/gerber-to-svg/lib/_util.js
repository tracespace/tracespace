// helper utilities
'use strict'

// shift the decimal place to SVG coordinates (units * 1000)
// also round to 7 decimal places
var shift = function(number) {
  return Math.round(10000000000 * number) / 10000000
}

var boundingRect = function(box, fill, element) {
  return element('rect', {
    x: shift(box[0]),
    y: shift(box[1]),
    width: shift(box[2] - box[0]),
    height: shift(box[3] - box[1]),
    fill: fill,
  })
}

var maskLayer = function(maskId, layer, element) {
  var maskUrl = 'url(#' + maskId + ')'

  return element('g', {mask: maskUrl}, layer)
}

var createMask = function(maskId, box, children, element) {
  children = [boundingRect(box, '#fff', element)].concat(children)
  var attributes = {id: maskId, fill: '#000', stroke: '#000'}

  return element('mask', attributes, [element('g', {}, children)])
}

module.exports = {
  shift: shift,
  maskLayer: maskLayer,
  createMask: createMask,
}
