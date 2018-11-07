// test suite for coordinate parser function
'use strict'

var expect = require('chai').expect
var parseCoord = require('../lib/parse-coord')

// svg coordinate FACTOR
var FORMAT = {places: [2, 3], zeros: null}

describe('coordinate parser', function() {
  it('should throw if passed an incorrect format', function() {
    expect(function() {
      parseCoord.parse('X1Y1', {})
    }).to.throw(/format undefined/)
  })

  it('should parse properly with leading zero suppression', function() {
    FORMAT.zero = 'L'
    expect(parseCoord.parse('X10', FORMAT)).to.eql({x: 0.01})
    expect(parseCoord.parse('Y15', FORMAT)).to.eql({y: 0.015})
    expect(parseCoord.parse('I20', FORMAT)).to.eql({i: 0.02})
    expect(parseCoord.parse('J-40', FORMAT)).to.eql({j: -0.04})
    expect(parseCoord.parse('X1000Y-2000I3J432', FORMAT)).to.eql({
      x: 1,
      y: -2,
      i: 0.003,
      j: 0.432,
    })
  })

  it('should parse properly with trailing zero suppression', function() {
    FORMAT.zero = 'T'
    expect(parseCoord.parse('X10', FORMAT)).to.eql({x: 10})
    expect(parseCoord.parse('Y15', FORMAT)).to.eql({y: 15})
    expect(parseCoord.parse('I02', FORMAT)).to.eql({i: 2})
    expect(parseCoord.parse('J-04', FORMAT)).to.eql({j: -4})
    expect(parseCoord.parse('X0001Y-0002I3J432', FORMAT)).to.eql({
      x: 0.01,
      y: -0.02,
      i: 30,
      j: 43.2,
    })
  })

  it('should parse properly with explicit decimals mixed in', function() {
    FORMAT.zero = 'L'
    expect(parseCoord.parse('X1.1', FORMAT)).to.eql({x: 1.1})
    expect(parseCoord.parse('Y1.5', FORMAT)).to.eql({y: 1.5})
    expect(parseCoord.parse('I20', FORMAT)).to.eql({i: 0.02})
    expect(parseCoord.parse('J-40', FORMAT)).to.eql({j: -0.04})
    expect(parseCoord.parse('X1.1Y-2.02I3.3J43.2', FORMAT)).to.eql({
      x: 1.1,
      y: -2.02,
      i: 3.3,
      j: 43.2,
    })
  })

  it('should return an empty object if no string is passed in', function() {
    expect(parseCoord.parse()).to.eql({})
  })
})

describe('zero detection', function() {
  it('should detect leading zero supression', function() {
    expect(parseCoord.detectZero('X10Y10')).to.eql('L')
  })

  it('should detect trailing zero supression', function() {
    expect(parseCoord.detectZero('X01Y001')).to.eql('T')
  })

  it('should return null when not detectable', function() {
    expect(parseCoord.detectZero('X1Y1')).to.eql(null)
  })

  it('should return null when a decimal', function() {
    expect(parseCoord.detectZero('X0.1Y1.0')).to.eql(null)
  })
})
