// convert a decimal number or gerber/drill coordinate into an svg coordinate
// coordinate is 1000x the gerber unit
'use strict'

var numIsFinite = require('lodash.isfinite')
var padLeft = require('lodash.padstart')
var padRight = require('lodash.padend')

// function takes in the number string to be converted and the format object
var normalizeCoord = function(number, format) {
  // make sure we're dealing with a string
  if (number == null) {
    return NaN
  }

  var numberString = '' + number

  // pull out the sign and get the before and after segments ready
  var sign = '+'
  if (numberString[0] === '-' || numberString[0] === '+') {
    sign = numberString[0]
    numberString = numberString.slice(1)
  }

  // check if the number has a decimal point or has been explicitely flagged
  // if it does, just split by the decimal point to get leading and trailing
  var hasDecimal = numberString.indexOf('.') !== -1
  if (hasDecimal || format == null || format.zero == null) {
    return Number(sign + numberString)
  } else {
    // otherwise we need to use the number format to split up the string
    // make sure format is valid
    if (format.places == null || format.places.length !== 2) {
      return NaN
    }

    var leading = format.places[0]
    var trailing = format.places[1]
    if (!numIsFinite(leading) || !numIsFinite(trailing)) {
      return NaN
    }

    // pad according to trailing or leading zero suppression
    if (format.zero === 'T') {
      numberString = padRight(numberString, leading + trailing, '0')
    } else if (format.zero === 'L') {
      numberString = padLeft(numberString, leading + trailing, '0')
    } else {
      return NaN
    }
  }

  // finally, parse the numberString
  var before = numberString.slice(0, leading)
  var after = numberString.slice(leading, leading + trailing)
  return Number(sign + before + '.' + after)
}

module.exports = normalizeCoord
