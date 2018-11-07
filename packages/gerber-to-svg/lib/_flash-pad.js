// creates the SVG for a pad flash
'use strict'

var util = require('./_util')
var shift = util.shift

module.exports = function flashPad(prefix, tool, x, y, element) {
  var toolId = '#' + prefix + '_pad-' + tool

  return element('use', {'xlink:href': toolId, x: shift(x), y: shift(y)})
}
