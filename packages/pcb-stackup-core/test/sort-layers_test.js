// test suite for the layer mapping function
'use strict'

var expect = require('chai').expect
var extend = require('xtend')

var wtg = require('whats-that-gerber')
var sortLayers = require('../lib/sort-layers')

function mockLayer(side, type, converter) {
  return {
    side: side,
    type: type,
    converter: extend(converter, {layer: ['foo']}),
  }
}

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
      mockLayer(wtg.SIDE_TOP, wtg.TYPE_COPPER, {}),
      mockLayer(wtg.SIDE_TOP, wtg.TYPE_SOLDERMASK, {}),
      mockLayer(wtg.SIDE_TOP, wtg.TYPE_SILKSCREEN, {}),
      mockLayer(wtg.SIDE_TOP, wtg.TYPE_SOLDERPASTE, {}),
    ]

    var result = sortLayers(layers)

    expect(result.bottom).to.have.lengthOf(0)
    expect(result.drills).to.have.lengthOf(0)
    expect(result.outline).to.equal(null)
    expect(result.top).to.eql(layers)
  })

  it('should add bottom layers to the bottom array', function() {
    var layers = [
      mockLayer(wtg.SIDE_BOTTOM, wtg.TYPE_COPPER, {}),
      mockLayer(wtg.SIDE_BOTTOM, wtg.TYPE_SOLDERMASK, {}),
      mockLayer(wtg.SIDE_BOTTOM, wtg.TYPE_SILKSCREEN, {}),
      mockLayer(wtg.SIDE_BOTTOM, wtg.TYPE_SOLDERPASTE, {}),
    ]

    var result = sortLayers(layers)

    expect(result.top).to.have.lengthOf(0)
    expect(result.drills).to.have.lengthOf(0)
    expect(result.outline).to.equal(null)
    expect(result.bottom).to.eql(layers)
  })

  it('should add mechanical layers to the mech array', function() {
    var layers = [
      mockLayer(wtg.SIDE_ALL, wtg.TYPE_OUTLINE, {}),
      mockLayer(wtg.SIDE_ALL, wtg.TYPE_DRILL, {defs: 'drl1'}),
      mockLayer(wtg.SIDE_ALL, wtg.TYPE_DRILL, {defs: 'drl2'}),
    ]

    var result = sortLayers(layers)

    expect(result.top).to.have.lengthOf(0)
    expect(result.bottom).to.have.lengthOf(0)
    expect(result.outline).to.eql(layers[0])
    expect(result.drills).to.eql([layers[1], layers[2]])
  })

  it('should ignore invalid or incomplete layers', function() {
    var layers = [
      {type: wtg.TYPE_DRAWING, converter: {layer: ['foo']}},
      {side: wtg.SIDE_TOP, type: wtg.TYPE_COPPER},
      {side: wtg.SIDE_TOP, type: wtg.TYPE_DRAWING, converter: {layer: []}},
      {side: wtg.SIDE_TOP, type: wtg.TYPE_COPPER},
      {type: null, converter: {}},
      null,
    ]

    var result = sortLayers(layers)

    expect(result.top).to.have.lengthOf(0)
    expect(result.bottom).to.have.lengthOf(0)
    expect(result.drills).to.have.lengthOf(0)
    expect(result.outline).to.equal(null)
  })

  it('should include the externalId field of layers', function() {
    var layers = [
      extend(mockLayer(wtg.SIDE_TOP, wtg.TYPE_COPPER, {}), {externalId: 'foo'}),
      extend(mockLayer(wtg.SIDE_BOTTOM, wtg.TYPE_SOLDERMASK, {}), {
        externalId: 'bar',
      }),
      extend(mockLayer(wtg.SIDE_ALL, wtg.TYPE_DRILL, {}), {externalId: 'baz'}),
      extend(mockLayer(wtg.SIDE_ALL, wtg.TYPE_OUTLINE, {}), {
        externalId: 'quux',
      }),
    ]

    var result = sortLayers(layers)

    expect(result.top).to.eql([layers[0]])
    expect(result.bottom).to.eql([layers[1]])
    expect(result.drills).to.eql([layers[2]])
    expect(result.outline).to.eql(layers[3])
  })
})
