// view box helper functions
'use strict'

var newBox = function() {
  return []
}

var add = function(source, dest) {
  if (!source.length) {
    return dest
  }

  var xMin = Math.min(source[0], dest[0])
  var yMin = Math.min(source[1], dest[1])
  var xMax = Math.max((source[0] + source[2]), (dest[0] + dest[2]))
  var yMax = Math.max((source[1] + source[3]), (dest[1] + dest[3]))

  return [xMin, yMin, (xMax - xMin), (yMax - yMin)]
}

var addScaled = function(source, dest, scale) {
  var scaledDest = dest.map(function(component) {
    return component * scale
  })

  return add(source, scaledDest)
}

var rect = function(element, source, className, fill) {
  source = (source.length !== 0) ? source : [0, 0, 0, 0]

  var attr = {
    x: source[0],
    y: source[1],
    width: source[2],
    height: source[3]
  }

  if (className) {
    attr.class = className
  }

  if (fill) {
    attr.fill = fill
  }

  return element('rect', attr)
}

module.exports = {
  new: newBox,
  add: add,
  addScaled: addScaled,
  rect: rect
}
