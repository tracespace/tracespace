// test suite for simpler API
'use strict'

var expect = require('chai').expect

var easyStackup = require('../lib/easy-stackup')

var emptyGerber = 'G04 empty gerber*\nM02*\n'

describe('easy-stackup function', function() {
  it('should accept and call node style callback', function(done) {
    easyStackup([], function(error, stackup) {
      expect(error).to.not.be.ok
      expect(stackup).to.be.ok
      done()
    })
  })
  it('should accept options as the second argument', function(done) {
    easyStackup([], {}, function(error, stackup) {
      expect(error).to.not.be.ok
      expect(stackup).to.be.ok
      done()
    })
  })
  it('should fail without a callback', function() {
    expect(easyStackup.bind(easyStackup, [])).to.throw(TypeError)
    expect(easyStackup.bind(easyStackup, [], {})).to.throw(TypeError)
  })
  it('should accept a layer with a gerber string and filename', function(done) {
    var layers = [{gerber:emptyGerber, filename:''}]
    easyStackup(layers, function(error, stackup) {
      expect(error).to.not.be.ok
      expect(stackup).to.be.ok
      done()
    })
  })
  it('should accept a layer with a gerber string and layerType', function(done) {
    var layers = [{gerber:emptyGerber, layerType:'tcu'}]
    easyStackup(layers, function(error, stackup) {
      expect(error).to.not.be.ok
      expect(stackup).to.be.ok
      done()
    })
  })
  it('should error if no filename or layerType is given', function(done) {
    var layers = [{gerber:emptyGerber}]
    easyStackup(layers, function(error, stackup) {
      expect(error).to.be.ok
      expect(error).to.be.an.instanceOf(Error)
      expect(stackup).to.not.be.ok
      done()
    })
  })
  it('should not overwrite layer id', function(done) {
    var layers = [{gerber:emptyGerber, layerType:'tcu', options:{id:'test-id'}}]
    easyStackup(layers, function(error, stackup) {
      expect(error).to.not.be.ok
      expect(stackup.layers[0].options.id).to.equal('test-id')
      done()
    })
  })
  it('should not overwrite stackup id', function(done) {
    var layers = [{gerber:emptyGerber, layerType:'tcu'}]
    easyStackup(layers, {id: 'test-id'}, function(error, stackup) {
      expect(error).to.not.be.ok
      expect(stackup).to.be.ok
      //TODO: test for actual id
      done()
    })
  })
  it('should callback with top, bottom and layer array', function(done) {
    var layers = [{gerber:emptyGerber, filename: '', layerType:''}]
    easyStackup(layers, function(error, stackup) {
      expect(error).to.not.be.ok
      expect(stackup).to.be.ok
      expect(stackup).to.be.an('object')
      expect(stackup).to.have.all.keys('top', 'bottom', 'layers')
      expect(stackup.layers).to.be.an.instanceOf(Array)
      expect(stackup.layers[0]).to.have.all.keys('layerType', 'gerber', 'options')
      done()
    })
  })
  it('respects plotAsOutline option', function(done) {
    var layers = [{gerber:emptyGerber, layerType:'tcu', options:{plotAsOutline:true}}]
    easyStackup(layers, function(error, stackup) {
      expect(error).to.not.be.ok
      expect(stackup.layers[0].options.plotAsOutline).to.be.true
      done()
    })
  })
  it('handles multiple layers', function(done) {
    var layers = [{gerber:emptyGerber, layerType:'fcu'}, {gerber:emptyGerber, layerType:'tcu'}]
    easyStackup(layers, function(error, stackup) {
      expect(error).to.not.be.ok
      expect(stackup).to.be.ok
      expect(stackup.layers.length).to.equal(layers.length)
      done()
    })
  })
})
