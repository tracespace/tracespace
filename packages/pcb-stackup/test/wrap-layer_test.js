// test suite for the wrap layer function
'use strict'

var expect = require('chai').expect

var wrapLayer = require('../lib/wrap-layer')

describe('wrap layer function', function() {
  it('should return the layer value wrapped in a group with an id', function() {
    var layer = {layer: 'SOME_STUFF'}
    var result = wrapLayer('id', layer)

    expect(result).to.eql('<g id="id">SOME_STUFF</g>')
  })

  it('should be able to scale the layer', function() {
    var layer = {layer: 'SOME_STUFF'}
    var result = wrapLayer('foobar', layer, 25.4)

    expect(result).to.eql('<g id="foobar" transform="scale(25.4,25.4)">SOME_STUFF</g>')
  })

  it('should not add a transformation if the scale is 1', function() {
    var layer = {layer: 'SOME_STUFF'}
    var result = wrapLayer('id', layer, 1)

    expect(result).to.eql('<g id="id">SOME_STUFF</g>')
  })
})
