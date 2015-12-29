// test suite for identifying layer types
'use strict'

var forIn = require('lodash.forin')
var expect = require('chai').expect

var testLayers = require('./layer-filenames')
var layerTypes = require('../lib/layer-types')
var layers = layerTypes.layers
var identify = layerTypes.identify

describe('layer types', function() {
  describe('layers object', function() {
    it('should have an object of all available layer types', function() {
      expect(layers).to.have.keys([
        'tcu',
        'tsm',
        'tss',
        'tsp',
        'bcu',
        'bsm',
        'bss',
        'bsp',
        'icu',
        'out',
        'drw',
        'drl'
      ])
    })

    it('should have titles for each layer type', function() {
      expect(layers.tcu.title).to.eql('top copper')
      expect(layers.tsm.title).to.eql('top soldermask')
      expect(layers.tss.title).to.eql('top silkscreen')
      expect(layers.tsp.title).to.eql('top solderpaste')
      expect(layers.bcu.title).to.eql('bottom copper')
      expect(layers.bsm.title).to.eql('bottom soldermask')
      expect(layers.bss.title).to.eql('bottom silkscreen')
      expect(layers.bsp.title).to.eql('bottom solderpaste')
      expect(layers.icu.title).to.eql('inner copper')
      expect(layers.out.title).to.eql('board outline')
      expect(layers.drw.title).to.eql('gerber drawing')
      expect(layers.drl.title).to.eql('drill hits')
    })
  })

  // try to identify layers type by filename
  describe('layer identification', function() {
    it('should default to drw', function() {
      var result = identify('foobar')
      expect(result).to.eql('drw')
    })

    Object.keys(testLayers).forEach(function(cad) {
      it('should identify ' + cad + ' file names', function() {
        var stackups = testLayers[cad]
        stackups.forEach(function(stackup) {
          forIn(stackup, function(filename, layerType) {
            var result = identify(filename)
            expect(result).to.equal(layerType)
          })
        })
      })
    })
  })
})
