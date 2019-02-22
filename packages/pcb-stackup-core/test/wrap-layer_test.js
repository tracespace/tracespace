// test suite for the wrap layer function
'use strict'

var expect = require('chai').expect
var sinon = require('sinon')
var xmlElementString = require('xml-element-string')

var wrapLayer = require('../lib/wrap-layer')

describe('wrap layer function', function() {
  it('should return the layer value wrapped in a group with an id', function() {
    var layer = {layer: ['SOME_STUFF']}
    var element = sinon.spy(xmlElementString)
    var result = wrapLayer(element, 'id', layer)
    var expected = {id: 'id'}

    expect(element).to.be.calledWith('g', expected, ['SOME_STUFF'])
    expect(result).to.equal(element.returnValues[0])
  })

  it('should be able to scale the layer', function() {
    var layer = {layer: ['SOME_STUFF']}
    var element = sinon.spy(xmlElementString)
    var result = wrapLayer(element, 'foobar', layer, 25.4)
    var expected = {id: 'foobar', transform: 'scale(25.4,25.4)'}

    expect(element).to.be.calledWith('g', expected, ['SOME_STUFF'])
    expect(result).to.equal(element.returnValues[0])
  })

  it('should not add a transformation if the scale is 1', function() {
    var layer = {layer: ['SOME_STUFF']}
    var element = sinon.spy(xmlElementString)
    var result = wrapLayer(element, 'id', layer, 1)
    var expected = {id: 'id'}

    expect(element).to.be.calledWith('g', expected, ['SOME_STUFF'])
    expect(result).to.equal(element.returnValues[0])
  })

  it('should be able to use a tag other than <g>', function() {
    var layer = {layer: ['SOME_STUFF']}
    var element = sinon.spy(xmlElementString)
    var result = wrapLayer(element, 'id', layer, 1, 'clipPath')
    var expected = {id: 'id'}

    expect(element).to.be.calledWith('clipPath', expected, ['SOME_STUFF'])
    expect(result).to.equal(element.returnValues[0])
  })
})
