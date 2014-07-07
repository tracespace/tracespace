// helper utilities
'use strict'

var reduce = require('lodash.reduce')

// shift the decimal place to SVG coordinates (units * 1000)
// also round to 7 decimal places
var shift = function(number) {
  return Math.round(10000000000 * number) / 10000000
}

// create an attribute assignment for SVG
var attr = function(attr, val) {
  return (attr + '="' + val + '"')
}

// create an open or closed xml node with attributes
var xmlNode = function(name, close, attributes) {
  var start = '<' + name
  var end = (close) ? '/>' : '>'
  var middle = reduce(attributes, function(result, value, key) {
    return result + ((value != null) ? (' ' + attr(key, value)) : '')
  }, '')

  return start + middle + end
}

var boundingRect = function(box, fill) {
  return xmlNode('rect', true, {
    x: shift(box[0]),
    y: shift(box[1]),
    width: shift(box[2] - box[0]),
    height: shift(box[3] - box[1]),
    fill: fill
  })
}

var maskLayer = function(maskId, layer) {
  var maskUrl = 'url(#' + maskId + ')'

  return xmlNode('g', false, {mask: maskUrl}) + layer + '</g>'
}

var startMask = function(maskId, box) {
  var mask = xmlNode('mask', false, {id: maskId, fill: '#000', stroke: '#000'})
  mask += boundingRect(box, '#fff')

  return mask
}

module.exports = {
  shift: shift,
  xmlNode: xmlNode,
  maskLayer: maskLayer,
  startMask: startMask
}
