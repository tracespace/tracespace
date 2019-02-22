// test suite for pcb-stackup
'use strict'

var proxyquire = require('proxyquire')
var expect = require('chai').expect
var sinon = require('sinon')
var extend = require('xtend')

var fakeStackup = {foo: 'bar'}
var fakeConverter = {baz: 'quux'}
var fakeGerber = 'gerber'
var fakeCE1 = function() {}
var fakeCE2 = function() {}

describe('pcb stackup', function() {
  var pcbStackup
  var stackupCore
  var gts
  var wtg

  beforeEach(function() {
    stackupCore = sinon.stub()
    gts = sinon.stub()
    wtg = sinon.stub()
    pcbStackup = proxyquire('.', {
      'pcb-stackup-core': stackupCore,
      'gerber-to-svg': gts,
      'whats-that-gerber': wtg,
    })

    gts.returns(fakeConverter)
    stackupCore.returns(fakeStackup)
  })

  afterEach(function() {
    sinon.restore()
  })

  it('should accept and call node style callback', function(done) {
    var expectedStackup = extend(fakeStackup, {layers: []})

    pcbStackup([], function(error, stackup) {
      try {
        expect(stackupCore).to.be.calledWithExactly([], null)
        expect(error).to.equal(null)
        expect(stackup).to.eql(expectedStackup)
        done()
      } catch (e) {
        done(e)
      }
    })
  })

  it('callback should error if gerber-to-svg errors', function(done) {
    var layers = [{gerber: fakeGerber, side: 'top', type: 'copper'}]

    gts.yields(new Error('oh no'))

    pcbStackup(layers, function(error, stackup) {
      try {
        expect(typeof stackup).to.equal('undefined')
        expect(error).to.match(/oh no/)
        done()
      } catch (e) {
        done(e)
      }
    })
  })

  it('should accept options as the second argument', function(done) {
    var options = {useOutline: false}
    var expectedStackup = extend(fakeStackup, {layers: []})

    pcbStackup([], options, function(error, stackup) {
      try {
        expect(stackupCore).to.be.calledWithExactly([], options)
        expect(error).to.equal(null)
        expect(stackup).to.eql(expectedStackup)
        done()
      } catch (e) {
        done(e)
      }
    })
  })

  it('return a promise if no callback passed', function() {
    var options = {useOutline: false}
    var expectedStackup = extend(fakeStackup, {layers: []})

    return pcbStackup([], options).then(function(stackup) {
      expect(stackupCore).to.be.calledWithExactly([], options)
      expect(stackup).to.eql(expectedStackup)
    })
  })

  it('promise should reject if gerber-to-svg errors', function() {
    var layers = [{gerber: fakeGerber, side: 'top', type: 'copper'}]

    gts.yields(new Error('oh no'))

    return expect(pcbStackup(layers)).to.be.rejectedWith(/oh no/)
  })

  describe('valid layer inputs', function() {
    var SPECS = [
      {
        name: 'should use a layer with type, side, and converter',
        layers: [{converter: fakeConverter, side: 'top', type: 'copper'}],
        expectedLayerAdditions: [{options: {}}],
        expectedGtsGerbers: [null],
      },
      {
        name: 'should use a layer with a gerber string and filename',
        layers: [{gerber: fakeGerber, filename: 'filename.gbr'}],
        expectedLayerAdditions: [
          {
            side: 'top',
            type: 'copper',
            converter: fakeConverter,
            options: {},
          },
        ],
        expectedWtgLayers: ['filename.gbr'],
        expectedGtsGerbers: [fakeGerber],
        wtgMap: {'filename.gbr': {side: 'top', type: 'copper'}},
      },
      {
        name: 'should prefer converter to gerber',
        layers: [
          {
            converter: fakeConverter,
            gerber: fakeGerber,
            side: 'top',
            type: 'copper',
          },
        ],
        expectedLayerAdditions: [{options: {}}],
        expectedGtsGerbers: [null],
      },
      {
        name: 'should use a layer with a gerber string and type/side',
        layers: [{gerber: fakeGerber, side: 'top', type: 'copper'}],
        expectedLayerAdditions: [{converter: fakeConverter, options: {}}],
        expectedGtsGerbers: [fakeGerber],
      },
      {
        name: 'should prefer side/type to filename',
        layers: [
          {
            gerber: fakeGerber,
            filename: 'filename1.gbr',
            side: 'all',
            type: 'drill',
          },
          {
            gerber: fakeGerber,
            filename: 'filename2.gbr',
            side: null,
            type: null,
          },
        ],
        expectedLayerAdditions: [
          {converter: fakeConverter, options: {}},
          {converter: fakeConverter, options: {}},
        ],
        expectedWtgLayers: ['filename1.gbr', 'filename2.gbr'],
        expectedGtsGerbers: [fakeGerber, fakeGerber],
        wtgMap: {
          'filename1.gbr': {side: 'top', type: 'copper'},
          'filename2.gbr': {side: 'bottom', type: 'copper'},
        },
      },
      {
        name: 'should use a layer with options specified',
        layers: [
          {
            gerber: fakeGerber,
            side: 'top',
            type: 'copper',
            options: {plotAsOutline: true},
          },
        ],
        expectedLayerAdditions: [{converter: fakeConverter}],
        expectedGtsGerbers: [fakeGerber],
      },
      {
        name: 'should handle multiple layers',
        layers: [
          {converter: fakeConverter, side: 'top', type: 'copper'},
          {converter: fakeConverter, filename: 'filename1.gbr'},
          {gerber: fakeGerber, side: 'bottom', type: 'copper'},
          {gerber: fakeGerber, filename: 'filename2.gbr'},
          {
            gerber: fakeGerber,
            filename: 'filename3.gbr',
            options: {plotAsOutline: true},
          },
        ],
        expectedLayerAdditions: [
          {options: {}},
          {side: 'top', type: 'silkscreen', options: {}},
          {converter: fakeConverter, options: {}},
          {
            converter: fakeConverter,
            side: 'bottom',
            type: 'silkscreen',
            options: {},
          },
          {converter: fakeConverter, side: 'all', type: 'drill'},
        ],
        expectedWtgLayers: ['filename1.gbr', 'filename2.gbr', 'filename3.gbr'],
        expectedGtsGerbers: [null, null, fakeGerber, fakeGerber, fakeGerber],
        wtgMap: {
          'filename1.gbr': {side: 'top', type: 'silkscreen'},
          'filename2.gbr': {side: 'bottom', type: 'silkscreen'},
          'filename3.gbr': {side: 'all', type: 'drill'},
        },
      },
      {
        name: 'should set plotAsOutline true for outline layers',
        layers: [
          {gerber: fakeGerber, filename: 'filename.gbr'},
          {gerber: fakeGerber, side: 'all', type: 'outline'},
        ],
        expectedLayerAdditions: [
          {
            side: 'all',
            type: 'outline',
            converter: fakeConverter,
            options: {plotAsOutline: true},
          },
          {
            converter: fakeConverter,
            options: {plotAsOutline: true},
          },
        ],
        expectedWtgLayers: ['filename.gbr'],
        expectedGtsGerbers: [fakeGerber, fakeGerber],
        wtgMap: {'filename.gbr': {side: 'all', type: 'outline'}},
      },
      {
        name: 'should not override plotAsOutline if set to false',
        layers: [
          {
            gerber: fakeGerber,
            side: 'all',
            type: 'outline',
            options: {plotAsOutline: false},
          },
        ],
        expectedLayerAdditions: [{converter: fakeConverter}],
        expectedGtsGerbers: [fakeGerber],
      },
      {
        name: 'should set and override createElement if specified',
        layers: [
          {
            gerber: fakeGerber,
            side: 'top',
            type: 'copper',
          },
          {
            gerber: fakeGerber,
            side: 'bottom',
            type: 'copper',
            options: {createElement: fakeCE2},
          },
        ],
        options: {createElement: fakeCE1},
        expectedLayerAdditions: [
          {converter: fakeConverter, options: {createElement: fakeCE1}},
          {converter: fakeConverter, options: {createElement: fakeCE1}},
        ],
        expectedGtsGerbers: [fakeGerber, fakeGerber],
      },
      {
        name: 'sets plotAsOutline to outlineGapFill if needed',
        layers: [
          {
            gerber: fakeGerber,
            side: 'all',
            type: 'outline',
          },
          {
            gerber: fakeGerber,
            side: 'bottom',
            type: 'copper',
            options: {plotAsOutline: true},
          },
          {
            gerber: fakeGerber,
            side: 'all',
            type: 'outline',
            options: {plotAsOutline: false},
          },
        ],
        options: {outlineGapFill: 4},
        expectedLayerAdditions: [
          {converter: fakeConverter, options: {plotAsOutline: 4}},
          {converter: fakeConverter, options: {plotAsOutline: 4}},
          {converter: fakeConverter},
        ],
        expectedGtsGerbers: [fakeGerber, fakeGerber, fakeGerber],
      },
    ]

    SPECS.forEach(function(spec) {
      it(spec.name, function() {
        expect(spec.layers).to.have.lengthOf(spec.expectedLayerAdditions.length)
        expect(spec.layers).to.have.lengthOf(spec.expectedGtsGerbers.length)

        var expectedLayers = spec.layers.map(function(layer, index) {
          return extend(layer, spec.expectedLayerAdditions[index])
        })
        var expectedStackup = extend(fakeStackup, {layers: expectedLayers})

        wtg.returns(spec.wtgMap || {})

        var result = pcbStackup(spec.layers, spec.options)

        gts.getCalls().forEach(function() {
          gts.yield(null, 'fake-svg')
        })

        return result.then(function(stackup) {
          expect(wtg).to.be.calledWithExactly(spec.expectedWtgLayers || [])
          expect(stackupCore).to.be.calledWithExactly(
            expectedLayers,
            spec.options
          )

          expect(stackup).to.eql(expectedStackup)
          expect(gts).to.have.callCount(
            spec.expectedGtsGerbers.filter(Boolean).length
          )

          expectedLayers.forEach(function(layer, index) {
            var gerber = spec.expectedGtsGerbers[index]
            if (gerber !== null) {
              expect(gts).to.be.calledWithExactly(
                gerber,
                layer.options,
                sinon.match.func
              )
            }
          })
        })
      })
    })
  })

  describe('invalid layer input', function() {
    var SPECS = [
      {
        name: 'should throw if no layers given',
        layers: undefined,
        expected: /first argument should be an array of layers/,
      },
      {
        name: 'should throw if no gerber or converter given',
        layers: [{filename: 'filename.gbr'}],
        expected: /layer 0 .+ missing gerber/,
      },
      {
        name: 'should throw if no filename or type is given',
        layers: [{gerber: 'gerber'}],
        expected: /layer 0 .+ missing filename/,
      },
      {
        name: 'should throw when invalid layer type is given',
        layers: [{gerber: 'gerber', type: 'wrong', side: 'top'}],
        expected: /layer 0 .+ invalid side\/type/,
      },
    ]

    SPECS.forEach(function(spec) {
      it(spec.name, function() {
        var task = function() {
          pcbStackup(spec.layers)
        }

        expect(task).to.throw(spec.expected)
      })
    })
  })
})
