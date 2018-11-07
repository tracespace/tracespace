// test suite for simpler API
// TODO(mc, 2018-08-01): refactor to test via mocking rather than SVG results
'use strict'

var expect = require('chai').expect
var identity = require('lodash/identity')
var wtg = require('whats-that-gerber')
var pcbStackup = require('.')

var emptyGerber = 'G04 empty gerber*\nM02*\n'

describe('easy stackup function', function() {
  it('should accept and call node style callback', function(done) {
    pcbStackup([], function(error, stackup) {
      expect(error).to.equal(null)
      expect(stackup).to.satisfy(identity)
      done()
    })
  })

  it('should accept options as the second argument', function(done) {
    pcbStackup([], {maskWithOutline: false}, function(error, stackup) {
      expect(error).to.equal(null)
      expect(stackup).to.satisfy(identity)
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
      expect(error).to.equal(null)
      expect(stackup).to.satisfy(identity)
      done()
    })
  })

  it('should accept a layer with a gerber string and type', function(done) {
    var layers = [
      {gerber: emptyGerber, side: wtg.SIDE_TOP, type: wtg.TYPE_COPPER},
    ]

    pcbStackup(layers, function(error, stackup) {
      expect(error).to.equal(null)
      expect(stackup).to.satisfy(identity)
      done()
    })
  })

  it('should error if no filename or type is given', function(done) {
    var layers = [{gerber: emptyGerber}]

    pcbStackup(layers, function(error, stackup) {
      expect(error.message).to.match(/layer 0 .+ missing/)
      done()
    })
  })

  it('should error when invalid layer type is given', function(done) {
    var layers = [{gerber: emptyGerber, type: 'wrong'}]

    pcbStackup(layers, function(error, stackup) {
      expect(error.message).to.match(/layer 0 .+ invalid/)
      done()
    })
  })

  it('should not overwrite layer id', function(done) {
    var layers = [
      {
        gerber: emptyGerber,
        side: wtg.SIDE_TOP,
        type: wtg.TYPE_COPPER,
        options: {id: 'test-id'},
      },
    ]

    pcbStackup(layers, function(error, stackup) {
      expect(error).to.equal(null)
      expect(stackup).to.satisfy(identity)
      expect(stackup.layers).to.have.lengthOf(1)
      expect(stackup.layers[0].options.id).to.equal('test-id')
      done()
    })
  })

  // TODO(mc, 2018-08-02): fix this test so it actually tests something
  it.skip('should not overwrite stackup id', function(done) {
    var layers = [{gerber: emptyGerber, type: 'tcu'}]

    pcbStackup(layers, {id: 'test-id'}, function(error, stackup) {
      expect(error).to.equal(null)
      expect(stackup).to.satisfy(identity)
      // TODO: test for actual id
      done()
    })
  })

  it('should callback with top, bottom and layer array', function(done) {
    var layers = [{gerber: emptyGerber, filename: 'foo'}]

    pcbStackup(layers, function(error, stackup) {
      expect(error).to.equal(null)
      expect(stackup).to.satisfy(identity)
      expect(stackup).to.be.an('object')
      expect(stackup).to.have.all.keys('top', 'bottom', 'layers')
      expect(stackup.layers).to.be.an.instanceOf(Array)
      expect(stackup.layers[0]).to.have.all.keys(
        'side',
        'type',
        'filename',
        'converter',
        'options'
      )
      done()
    })
  })

  it('respects plotAsOutline option', function(done) {
    var layers = [
      {
        gerber: emptyGerber,
        side: wtg.SIDE_TOP,
        type: wtg.TYPE_COPPER,
        options: {plotAsOutline: true},
      },
    ]

    pcbStackup(layers, function(error, stackup) {
      expect(error).to.equal(null)
      expect(stackup).to.satisfy(identity)
      expect(stackup.layers[0].options.plotAsOutline).to.equal(true)
      done()
    })
  })

  it('handles multiple layers', function(done) {
    var layers = [
      {gerber: emptyGerber, side: wtg.SIDE_BOTTOM, type: wtg.TYPE_COPPER},
      {gerber: emptyGerber, side: wtg.SIDE_TOP, type: wtg.TYPE_COPPER},
    ]

    pcbStackup(layers, function(error, stackup) {
      expect(error).to.equal(null)
      expect(stackup).to.satisfy(identity)
      expect(stackup.layers).to.have.lengthOf(layers.length)
      done()
    })
  })

  it('can be passed back its own output', function(done) {
    var layers = [
      {gerber: emptyGerber, side: wtg.SIDE_BOTTOM, type: wtg.TYPE_COPPER},
      {gerber: emptyGerber, side: wtg.SIDE_TOP, type: wtg.TYPE_COPPER},
    ]

    pcbStackup(layers, function(error, stackup1) {
      expect(error).to.equal(null)

      pcbStackup(stackup1.layers, function(error, stackup2) {
        expect(error).to.equal(null)
        expect(stackup2).to.satisfy(identity)
        done()
      })
    })
  })

  it('sets the createElement option', function(done) {
    var layers = [
      {gerber: emptyGerber, side: wtg.SIDE_BOTTOM, type: wtg.TYPE_COPPER},
      {gerber: emptyGerber, side: wtg.SIDE_TOP, type: wtg.TYPE_COPPER},
    ]
    var options = {
      createElement: function() {
        return 1
      },
    }

    pcbStackup(layers, options, function(error, stackup) {
      expect(error).to.equal(null)
      expect(stackup.layers[0].converter['_element']()).to.equal(1)
      expect(stackup.layers[1].converter['_element']()).to.equal(1)
      done()
    })
  })

  it('overrides the createElement option', function(done) {
    var layers = [
      {gerber: emptyGerber, side: wtg.SIDE_BOTTOM, type: wtg.TYPE_COPPER},
      {
        gerber: emptyGerber,
        side: wtg.SIDE_TOP,
        type: wtg.TYPE_COPPER,
        options: {
          createElement: function() {
            return 2
          },
        },
      },
    ]
    var options = {
      createElement: function() {
        return 1
      },
    }

    pcbStackup(layers, options, function(error, stackup) {
      expect(error).to.equal(null)
      expect(stackup.layers[0].converter['_element']()).to.equal(1)
      expect(stackup.layers[1].converter['_element']()).to.equal(1)
      done()
    })
  })

  it('sets threshold for filling outline gaps', function(done) {
    var layers = [
      {gerber: emptyGerber, side: wtg.SIDE_ALL, type: wtg.TYPE_OUTLINE},
    ]

    var options = {outlineGapFill: 2}

    pcbStackup(layers, options, function(error, stackup) {
      var options = {outlineGapFill: 3}

      expect(error).to.equal(null)
      expect(stackup.layers[0].options.plotAsOutline).to.equal(2)
      pcbStackup(stackup.layers, options, function(error, stackup) {
        expect(error).to.equal(null)
        expect(stackup.layers[0].options.plotAsOutline).to.equal(3)
        done()
      })
    })
  })

  // TODO(mc, 2018-04-17): should tested with mocks instead
  // it('lets you replace gerber in layer cache', function (done) {
  //   var exampleGerber1 = arduino.layers.find(g => g.type === 'bcu').contents
  //   var exampleGerber2 = arduino.layers.find(g => g.type === 'tcu').contents
  //
  //   var layers = [
  //     {gerber: exampleGerber1, type: 'bcu', options: {id: 'a'}},
  //     {gerber: exampleGerber2, type: 'tcu', options: {id: 'b'}}
  //   ]
  //
  //   pcbStackup(layers, {id: 'c'}, function (error, stackup1) {
  //     expect(error).to.equal(null)
  //     expect(stackup1).to.satisfy(identity)
  //     expect(stackup1.layers[0].type).to.equal('bcu')
  //     expect(stackup1.layers[1].type).to.equal('tcu')
  //     stackup1.layers[0].type = 'tcu'
  //     stackup1.layers[0].options = {id: 'b'}
  //     stackup1.layers[0].gerber = exampleGerber2
  //
  //     pcbStackup(stackup1.layers, {id: 'c'}, function (error, stackup2) {
  //       expect(error).to.equal(null)
  //
  //       var comparableLayers = stackup2.layers.map(function (layer) {
  //         layer.converter = cloneConverter(layer.converter)
  //
  //         return layer
  //       })
  //
  //       expect(comparableLayers[0]).to.deep.equal(comparableLayers[1])
  //       done()
  //     })
  //   })
  // })
})
