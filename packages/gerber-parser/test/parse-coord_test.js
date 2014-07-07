// test suite for coordinate parser function
'use strict'

var expect = require('chai').expect
var parseCoord = require('../lib/parse-coord')

// svg coordinate FACTOR
var FORMAT = {places: [2, 3], zeros: null}

describe('coordinate parser', function() {
  it('should throw if passed an incorrect format', function() {
    expect(function() {parseCoord('X1Y1', {})}).to.throw(/format undefined/)
  })

  it('should parse properly with leading zero suppression', function() {
    FORMAT.zero = 'L'
    expect(parseCoord('X10', FORMAT)).to.eql({x: .01})
    expect(parseCoord('Y15', FORMAT)).to.eql({y: .015})
    expect(parseCoord('I20', FORMAT)).to.eql({i: .02})
    expect(parseCoord('J-40', FORMAT)).to.eql({j: -.04})
    expect(parseCoord('X1000Y-2000I3J432', FORMAT)).to.eql({x: 1, y: -2, i: .003, j: .432})
  })

  it('should parse properly with trailing zero suppression', function() {
    FORMAT.zero = 'T'
    expect(parseCoord('X10', FORMAT)).to.eql({x: 10})
    expect(parseCoord('Y15', FORMAT)).to.eql({y: 15})
    expect(parseCoord('I02', FORMAT)).to.eql({i: 2})
    expect(parseCoord('J-04', FORMAT)).to.eql({j: -4})
    expect(parseCoord('X0001Y-0002I3J432', FORMAT)).to.eql({x: .01, y: -.02, i: 30, j: 43.2})
  })

  it('should parse properly with explicit decimals mixed in', function() {
    FORMAT.zero = 'L'
    expect(parseCoord('X1.1', FORMAT)).to.eql({x: 1.1})
    expect(parseCoord('Y1.5', FORMAT)).to.eql({y: 1.5})
    expect(parseCoord('I20', FORMAT)).to.eql({i: .02})
    expect(parseCoord('J-40', FORMAT)).to.eql({j: -.04})
    expect(parseCoord('X1.1Y-2.02I3.3J43.2', FORMAT)).to.eql({x: 1.1, y: -2.02, i: 3.3, j: 43.2})
  })

  it('should return an empty object if no string is passed in', function() {
    expect(parseCoord()).to.eql({})
  })
})
