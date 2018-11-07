// function to determine filetype from a chunk
'use strict'

var determine = function(chunk, start, LIMIT) {
  var limit = Math.min(LIMIT - start, chunk.length)
  var current = []
  var filetype = null
  var index = -1

  while (!filetype && ++index < limit) {
    var c = chunk[index]
    if (c === '\n') {
      if (current.length + index) {
        filetype = 'drill'
        current = []
      }
    } else {
      current.push(c)
      if (c === '*' && current[0] !== ';') {
        filetype = 'gerber'
        current = []
      }
    }
  }

  return filetype
}

module.exports = determine
