// factory for gerber-parser class
'use strict'

var isFinite = require('lodash.isfinite')

var Parser = require('./lib/parser')

var verifyPlaces = function(p) {
  if (
    Array.isArray(p) &&
    p.length === 2 &&
    (isFinite(p[0]) && isFinite(p[1]))
  ) {
    return p
  }

  throw new Error('places must be an array of two whole numbers')
}

var verifyZero = function(z) {
  if (z === 'T' || z === 'L') {
    return z
  }

  throw new Error("zero suppression must be 'L' or 'T'")
}

var verifyFiletype = function(f) {
  if (f === 'gerber' || f === 'drill') {
    return f
  }

  throw new Error('filetype must be "drill" or "gerber"')
}

module.exports = function(options) {
  options = options || {}

  var places = options.places ? verifyPlaces(options.places) : null
  var zero = options.zero ? verifyZero(options.zero) : null
  var filetype = options.filetype ? verifyFiletype(options.filetype) : null

  return new Parser(places, zero, filetype)
}
