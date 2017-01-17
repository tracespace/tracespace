// test suite for the layer mapping function
'use strict'

var expect = require('chai').expect

var sortLayers = require('../lib/sort-layers')

describe('sort layers function', function () {
  it('should reduce layers into an object with keys top and bottom', function () {
    var result = sortLayers([])

    expect(result.top).to.eql([])
    expect(result.bottom).to.eql([])
    expect(result.drills).to.eql([])
    expect(result.outline).to.be.null
  })

  it('should add top layers to the top array', function () {
    var layers = [
      {type: 'tcu', converter: {}},
      {type: 'tsm', converter: {}},
      {type: 'tss', converter: {}},
      {type: 'tsp', converter: {}}
    ]

    var result = sortLayers(layers)

    expect(result.bottom).to.be.empty
    expect(result.drill).to.be.empty
    expect(result.outline).to.be.null
    expect(result.top).to.eql([
      {type: 'cu', converter: layers[0].converter},
      {type: 'sm', converter: layers[1].converter},
      {type: 'ss', converter: layers[2].converter},
      {type: 'sp', converter: layers[3].converter}
    ])
  })

  it('should add bottom layers to the bottom array', function () {
    var layers = [
      {type: 'bcu', converter: {}},
      {type: 'bsm', converter: {}},
      {type: 'bss', converter: {}},
      {type: 'bsp', converter: {}}
    ]

    var result = sortLayers(layers)

    expect(result.top).to.be.empty
    expect(result.drills).to.be.empty
    expect(result.outline).to.be.null
    expect(result.bottom).to.eql([
      {type: 'cu', converter: layers[0].converter},
      {type: 'sm', converter: layers[1].converter},
      {type: 'ss', converter: layers[2].converter},
      {type: 'sp', converter: layers[3].converter}
    ])
  })

  it('should add mechanical layers to the mech array', function () {
    var layers = [
      {type: 'out', converter: {}},
      {type: 'drl', converter: {defs: 'drl1'}},
      {type: 'drl', converter: {defs: 'drl2'}}
    ]

    var result = sortLayers(layers)

    expect(result.top).to.be.empty
    expect(result.bottom).to.be.empty
    expect(result.outline).to.eql({type: 'out', converter: layers[0].converter})
    expect(result.drills).to.eql([
      {type: 'drl', converter: layers[1].converter},
      {type: 'drl', converter: layers[2].converter}
    ])
  })

  it('should ignore everything else', function () {
    var layers = [
      {type: 'drw', converter: {}},
      {type: 'drw', converter: {}},
      {type: 'drw', converter: {}}
    ]

    var result = sortLayers(layers)

    expect(result.top).to.be.empty
    expect(result.bottom).to.be.empty
    expect(result.drills).to.be.empty
    expect(result.outline).to.be.null
  })

  it('should include the externalId field of layers', function () {
    var layers = [
      {type: 'tcu', externalId: 'foo', converter: {foo: 'foo'}},
      {type: 'bsm', externalId: 'bar', converter: {bar: 'bar'}},
      {type: 'drl', externalId: 'baz', converter: {baz: 'baz'}},
      {type: 'out', externalId: 'quux', converter: {quux: 'quux'}}
    ]

    var result = sortLayers(layers)

    expect(result.top).to.eql([
      {type: 'cu', externalId: 'foo', converter: layers[0].converter}
    ])
    expect(result.bottom).to.eql([
      {type: 'sm', externalId: 'bar', converter: layers[1].converter}
    ])
    expect(result.drills).to.eql([
      {type: 'drl', externalId: 'baz', converter: layers[2].converter}
    ])
    expect(result.outline).to.eql({
      type: 'out',
      externalId: 'quux',
      converter: layers[3].converter
    })
  })
})
