// test suite for the layer mapping function
'use strict'

var expect = require('chai').expect

var sortLayers = require('../lib/sort-layers')

describe('reduce layers function', function() {
  it('should reduce layers into an object with keys top and bottom', function() {
    var result = sortLayers([])
    expect(result.top).to.exist
    expect(result.bottom).to.exist
    expect(result.mech).to.exist
  })

  it('should add top layers to the top object', function() {
    var layers = [
      {type: 'tcu', layer: {}},
      {type: 'tsm', layer: {}},
      {type: 'tss', layer: {}},
      {type: 'tsp', layer: {}}
    ]

    var result = sortLayers(layers)
    expect(result.mech).to.be.empty
    expect(result.bottom).to.be.empty

    expect(result.top.cu).to.equal(layers[0].layer)
    expect(result.top.sm).to.equal(layers[1].layer)
    expect(result.top.ss).to.equal(layers[2].layer)
    expect(result.top.sp).to.equal(layers[3].layer)
  })

  it('should add bottom layers to the bottom object', function() {
    var layers = [
      {type: 'bcu', layer: {}},
      {type: 'bsm', layer: {}},
      {type: 'bss', layer: {}},
      {type: 'bsp', layer: {}}
    ]

    var result = sortLayers(layers)
    expect(result.mech).to.be.empty
    expect(result.top).to.be.empty

    expect(result.bottom.cu).to.equal(layers[0].layer)
    expect(result.bottom.sm).to.equal(layers[1].layer)
    expect(result.bottom.ss).to.equal(layers[2].layer)
    expect(result.bottom.sp).to.equal(layers[3].layer)
  })

  it('should add mechanical layers to the mech object', function() {
    var layers = [
      {type: 'out', layer: {}},
      {type: 'drl', layer: {}},
      {type: 'drl', layer: {}}
    ]

    var result = sortLayers(layers)
    expect(result.top).to.be.empty
    expect(result.bottom).to.be.empty

    expect(result.mech.out).to.equal(layers[0].layer)
    expect(result.mech.drl[0]).to.equal(layers[1].layer)
    expect(result.mech.drl[1]).to.equal(layers[2].layer)
  })

  it('should ignore everything else', function() {
    var layers = [
      {type: 'drw', layer: {}},
      {type: 'drw', layer: {}},
      {type: 'drw', layer: {}}
    ]

    var result = sortLayers(layers)
    expect(result.mech).to.be.empty
    expect(result.top).to.be.empty
    expect(result.bottom).to.be.empty
  })
})
