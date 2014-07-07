// cordinate parser function
// takes in a string with X_____Y_____I_____J_____ and a format object
// returns an object of {x: number, y: number, etc} for coordinates it finds
'use strict'

var transform = require('lodash.transform')

// convert to normalized number
var normalize = require('./normalize-coord')

var MATCH = {
  x: /X([+-]?[\d\.]+)/,
  y: /Y([+-]?[\d\.]+)/,
  i: /I([+-]?[\d\.]+)/,
  j: /J([+-]?[\d\.]+)/,
  a: /A([\d\.]+)/
}

var parse = function(coord, format) {
  if (coord == null) {
    return {}
  }

  if ((format.zero == null) || (format.places == null)) {
    throw new Error('cannot parse coordinate with format undefined')
  }

  // pull out the x, y, i, and j
  var parsed = transform(MATCH, function(result, matcher, c) {
    var coordMatch = coord.match(matcher)
    if (coordMatch) {
      result[c] = normalize(coordMatch[1], format)
    }
  })

  return parsed
}

module.exports = parse
