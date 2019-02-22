// clone a PlotterToSvg to a plain object with just enough information to render
'use strict'

var KEYS = [
  'id',
  'attributes',
  'defs',
  'layer',
  'viewBox',
  'width',
  'height',
  'units',
]

module.exports = function cloneConverter(converter) {
  return KEYS.reduce(function(result, key) {
    var value = converter[key]

    if (value != null) {
      result[key] = converter[key]
    }

    return result
  }, {})
}
