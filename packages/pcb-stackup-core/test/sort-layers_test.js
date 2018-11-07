// test suite for the layer mapping function
'use strict'

var expect = require('chai').expect

var wtg = require('whats-that-gerber')
var sortLayers = require('../lib/sort-layers')

describe('sort layers function', function() {
  it('should reduce layers into object keyed by layer type', function() {
    var result = sortLayers([])

    expect(result.top).to.eql([])
    expect(result.bottom).to.eql([])
    expect(result.drills).to.eql([])
    expect(result.outline).to.equal(null)
  })

  it('should add top layers to the top array', function() {
    var layers = [
      {side: wtg.SIDE_TOP, type: wtg.TYPE_COPPER, converter: {}},
      {side: wtg.SIDE_TOP, type: wtg.TYPE_SOLDERMASK, converter: {}},
      {side: wtg.SIDE_TOP, type: wtg.TYPE_SILKSCREEN, converter: {}},
      {side: wtg.SIDE_TOP, type: wtg.TYPE_SOLDERPASTE, converter: {}},
    ]

    var result = sortLayers(layers)

    expect(result.bottom).to.have.lengthOf(0)
    expect(result.drills).to.have.lengthOf(0)
    expect(result.outline).to.equal(null)
    expect(result.top).to.eql(layers)
  })

  it('should add bottom layers to the bottom array', function() {
    var layers = [
      {side: wtg.SIDE_BOTTOM, type: wtg.TYPE_COPPER, converter: {}},
      {side: wtg.SIDE_BOTTOM, type: wtg.TYPE_SOLDERMASK, converter: {}},
      {side: wtg.SIDE_BOTTOM, type: wtg.TYPE_SILKSCREEN, converter: {}},
      {side: wtg.SIDE_BOTTOM, type: wtg.TYPE_SOLDERPASTE, converter: {}},
    ]

    var result = sortLayers(layers)

    expect(result.top).to.have.lengthOf(0)
    expect(result.drills).to.have.lengthOf(0)
    expect(result.outline).to.equal(null)
    expect(result.bottom).to.eql(layers)
  })

  it('should add mechanical layers to the mech array', function() {
    var layers = [
      {side: wtg.SIDE_ALL, type: wtg.TYPE_OUTLINE, converter: {}},
      {side: wtg.SIDE_ALL, type: wtg.TYPE_DRILL, converter: {defs: 'drl1'}},
      {side: wtg.SIDE_ALL, type: wtg.TYPE_DRILL, converter: {defs: 'drl2'}},
    ]

    var result = sortLayers(layers)

    expect(result.top).to.have.lengthOf(0)
    expect(result.bottom).to.have.lengthOf(0)
    expect(result.outline).to.eql(layers[0])
    expect(result.drills).to.eql([layers[1], layers[2]])
  })

  it('should ignore everything else', function() {
    var layers = [
      {type: wtg.TYPE_DRAWING, converter: {}},
      {converter: {}},
      {type: null, converter: {}},
    ]

    var result = sortLayers(layers)

    expect(result.top).to.have.lengthOf(0)
    expect(result.bottom).to.have.lengthOf(0)
    expect(result.drills).to.have.lengthOf(0)
    expect(result.outline).to.equal(null)
  })

  it('should include the externalId field of layers', function() {
    var layers = [
      {
        side: wtg.SIDE_TOP,
        type: wtg.TYPE_COPPER,
        externalId: 'foo',
        converter: {foo: 'foo'},
      },
      {
        side: wtg.SIDE_BOTTOM,
        type: wtg.TYPE_SOLDERMASK,
        externalId: 'bar',
        converter: {bar: 'bar'},
      },
      {
        side: wtg.SIDE_ALL,
        type: wtg.TYPE_DRILL,
        externalId: 'baz',
        converter: {baz: 'baz'},
      },
      {
        side: wtg.SIDE_ALL,
        type: wtg.TYPE_OUTLINE,
        externalId: 'quux',
        converter: {quux: 'quux'},
      },
    ]

    var result = sortLayers(layers)

    expect(result.top).to.eql([layers[0]])
    expect(result.bottom).to.eql([layers[1]])
    expect(result.drills).to.eql([layers[2]])
    expect(result.outline).to.eql(layers[3])
  })
})
