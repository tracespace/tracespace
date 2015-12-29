// view box helper functions
'use strict'

var newBox = function() {
  return [0, 0, 0, 0]
}

var add = function(source, dest) {
  var xMin = Math.min(source[0], dest[0])
  var yMin = Math.min(source[1], dest[1])
  var xMax = Math.max((source[0] + source[2]), (dest[0] + dest[2]))
  var yMax = Math.max((source[1] + source[3]), (dest[1] + dest[3]))

  return [xMin, yMin, (xMax - xMin), (yMax - yMin)]
}

module.exports = {
  new: newBox,
  add: add
}
