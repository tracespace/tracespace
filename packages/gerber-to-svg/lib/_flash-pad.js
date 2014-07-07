// creates the SVG for a pad flash
'use strict'

var util = require('./_util')
var shift = util.shift
var xmlNode = util.xmlNode

var flashPad = function(prefix, tool, x, y) {
  var toolId = '#' + prefix + '_pad-' + tool

  return xmlNode('use', true, {'xlink:href': toolId, x: shift(x), y: shift(y)})
}

module.exports = flashPad
