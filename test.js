// test suite for simpler API
'use strict'
var fs = require('fs')
var path = require('path')
var cloneConverter = require('gerber-to-svg').clone

var expect = require('chai').expect

var pcbStackup = require('./index')

var emptyGerber = 'G04 empty gerber*\nM02*\n'

describe('easy stackup function', function() {
  it('should accept and call node style callback', function(done) {
    pcbStackup([], function(error, stackup) {
      expect(error).to.not.exist
      expect(stackup).to.exist
      done()
    })
  })

  it('should accept options as the second argument', function(done) {
    pcbStackup([], {maskWithOutline: false}, function(error, stackup) {
      expect(error).to.not.exist
      expect(stackup).to.exist
      done()
    })
  })

  it('should fail without a callback', function() {
    expect(pcbStackup.bind(pcbStackup, [])).to.throw(TypeError)
    expect(pcbStackup.bind(pcbStackup, [], {})).to.throw(TypeError)
  })

  it('should accept a layer with a gerber string and filename', function(done) {
    var layers = [{gerber: emptyGerber, filename: 'foo'}]

    pcbStackup(layers, function(error, stackup) {
      expect(error).to.not.exist
      expect(stackup).to.exist
      done()
    })
  })

  it('should accept a layer with a gerber string and layerType', function(done) {
    var layers = [{gerber: emptyGerber, layerType: 'tcu'}]

    pcbStackup(layers, function(error, stackup) {
      expect(error).to.not.exist
      expect(stackup).to.exist
      done()
    })
  })

  it('should error if no filename or layerType is given', function(done) {
    var layers = [{gerber: emptyGerber}]

    pcbStackup(layers, function(error, stackup) {
      expect(error).to.be.ok
      expect(error).to.be.an.instanceOf(Error)
      expect(stackup).to.not.exist
      done()
    })
  })

  it('should error when invalid layer type is given', function(done) {
    var layers = [{gerber: emptyGerber, layerType: 'wrong'}]

    pcbStackup(layers, function(error, stackup) {
      expect(error).to.be.ok
      expect(error).to.be.an.instanceOf(Error)
      expect(stackup).to.not.exist
      done()
    })
  })

  it('should not overwrite layer id', function(done) {
    var layers = [{gerber: emptyGerber, layerType: 'tcu', options: {id: 'test-id'}}]

    pcbStackup(layers, function(error, stackup) {
      expect(error).to.not.exist
      expect(stackup).to.exist
      expect(stackup.layers).to.be.ok
      expect(stackup.layers.length).to.equal(1)
      expect(stackup.layers[0].options.id).to.equal('test-id')
      done()
    })
  })

  it('should not overwrite stackup id', function(done) {
    var layers = [{gerber: emptyGerber, layerType: 'tcu'}]

    pcbStackup(layers, {id: 'test-id'}, function(error, stackup) {
      expect(error).to.not.exist
      expect(stackup).to.exist
      // TODO: test for actual id
      done()
    })
  })

  it('should callback with top, bottom and layer array', function(done) {
    var layers = [{gerber: emptyGerber, filename: 'foo'}]

    pcbStackup(layers, function(error, stackup) {
      expect(error).to.not.exist
      expect(stackup).to.exist
      expect(stackup).to.be.an('object')
      expect(stackup).to.have.all.keys('top', 'bottom', 'layers')
      expect(stackup.layers).to.be.an.instanceOf(Array)
      expect(stackup.layers[0]).to.have.all.keys('layerType', 'converter', 'options')
      done()
    })
  })

  it('respects plotAsOutline option', function(done) {
    var layers = [
      {gerber: emptyGerber, layerType: 'tcu', options: {plotAsOutline: true}}
    ]

    pcbStackup(layers, function(error, stackup) {
      expect(error).to.not.exist
      expect(stackup).to.exist
      expect(stackup.layers[0].options.plotAsOutline).to.be.true
      done()
    })
  })

  it('handles multiple layers', function(done) {
    var layers = [
      {gerber: emptyGerber, layerType: 'bcu'},
      {gerber: emptyGerber, layerType: 'tcu'}
    ]

    pcbStackup(layers, function(error, stackup) {
      expect(error).to.not.exist
      expect(stackup).to.exist
      expect(stackup.layers).to.have.lengthOf(layers.length)
      done()
    })
  })

  it('can be passed back its own output', function(done) {
    var layers = [
      {gerber: emptyGerber, layerType: 'bcu'},
      {gerber: emptyGerber, layerType: 'tcu'}
    ]

    pcbStackup(layers, function(error, stackup1) {
      expect(error).to.not.exist

      pcbStackup(stackup1.layers, function(error, stackup2) {
        expect(error).to.not.exist
        expect(stackup2).to.exist
        done()
      })
    })
  })

  it('sets the createElement option', function(done) {
    var layers = [
      {gerber: emptyGerber, layerType: 'bcu'},
      {gerber: emptyGerber, layerType: 'tcu'}
    ]
    var options = {createElement: function() {return 1}}

    pcbStackup(layers, options, function(error, stackup) {
      expect(error).to.not.exist
      expect(stackup.layers[0].converter['_element']()).to.equal(1)
      expect(stackup.layers[1].converter['_element']()).to.equal(1)
      done()
    })
  })

  it('overrides the createElement option', function(done) {
    var layers = [
      {gerber: emptyGerber, layerType: 'bcu'},
      {gerber: emptyGerber, layerType: 'tcu', options: {createElement: function() {return 2}}}
    ]
    var options = {createElement: function() {return 1}}

    pcbStackup(layers, options, function(error, stackup) {
      expect(error).to.not.exist
      expect(stackup.layers[0].converter['_element']()).to.equal(1)
      expect(stackup.layers[1].converter['_element']()).to.equal(1)
      done()
    })
  })

  it('sets threshold for filling outline gaps', function(done) {
    var layers = [
      {gerber: emptyGerber, layerType: 'out'}
    ]

    var options = {outlineGapFill: 2}

    pcbStackup(layers, options, function(error, stackup) {
      var options = {outlineGapFill: 3}

      expect(error).to.not.exist
      expect(stackup.layers[0].options.plotAsOutline).to.equal(2)
      pcbStackup(stackup.layers, options, function(error, stackup) {
        expect(error).to.not.exist
        expect(stackup.layers[0].options.plotAsOutline).to.equal(3)
        done()
      })
    })
  })


  // TODO: these determinism tests should really be property based using a quickcheck
  // style framework instead of single unit tests
  // NOTE: (mc) Perhaps instead of these tests, we should check that we're passing
  // the correct things to gerber-to-svg, whats-that-gerber, and pcb-stackup-core?

  var exampleGerber1 = fs.readFileSync(path.join(__dirname, 'integration/boards/arduino-uno/arduino-uno.plc'))
  var exampleGerber2 = fs.readFileSync(path.join(__dirname, 'integration/boards/arduino-uno/arduino-uno.gko'))

  it('has deterministic top and bottom svgs if ids are given', function(done) {
    var layers = [
      {gerber: exampleGerber1, layerType: 'bcu', options: {id: 'a'}},
      {gerber: exampleGerber2, layerType: 'tcu', options: {id: 'b'}}
    ]

    pcbStackup(layers, {id: 'c'}, function(error, stackup1) {
      expect(error).to.not.exist
      expect(stackup1).to.exist

      pcbStackup(layers, {id: 'c'}, function(error, stackup2) {
        expect(error).to.not.exist
        expect(stackup2.top).to.deep.equal(stackup1.top)
        expect(stackup2.bottom).to.deep.equal(stackup1.bottom)
        done()
      })
    })
  })

  it('has deterministic top and bottom svgs if ids are given and passed back its own output', function(done) {
    var layers = [
      {gerber: exampleGerber1, layerType: 'bcu', options: {id: 'a'}},
      {gerber: exampleGerber2, layerType: 'tcu', options: {id: 'b'}}
    ]

    pcbStackup(layers, {id: 'c'}, function(error, stackup1) {
      expect(error).to.not.exist
      expect(stackup1).to.exist

      pcbStackup(stackup1.layers, {id: 'c'}, function(error, stackup2) {
        expect(error).to.not.exist
        expect(stackup2.top).to.deep.equal(stackup1.top)
        expect(stackup2.bottom).to.deep.equal(stackup1.bottom)
        done()
      })
    })
  })

  it('lets you replace gerber in layer cache', function(done) {
    var layers = [
      {gerber: exampleGerber1, layerType: 'bcu', options: {id: 'a'}},
      {gerber: exampleGerber2, layerType: 'tcu', options: {id: 'b'}}
    ]

    pcbStackup(layers, {id: 'c'}, function(error, stackup1) {
      expect(error).to.not.exist
      expect(stackup1).to.exist
      expect(stackup1.layers[0].layerType).to.equal('bcu')
      expect(stackup1.layers[1].layerType).to.equal('tcu')
      stackup1.layers[0].layerType = 'tcu'
      stackup1.layers[0].options =  {id: 'b'}
      stackup1.layers[0].gerber = exampleGerber2

      pcbStackup(stackup1.layers, {id: 'c'}, function(error, stackup2) {
        expect(error).to.not.exist

        var comparableLayers = stackup2.layers.map(function(layer) {
          layer.converter = cloneConverter(layer.converter)

          return layer
        })

        expect(comparableLayers[0]).to.deep.equal(comparableLayers[1])
        done()
      })
    })
  })
})
