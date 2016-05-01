'use strict'

var expect = require('chai').expect

var whatsThatGerber = require('../')
var filenamesByCad = require('./filenames-by-cad')

describe('whats-that-gerber', function() {
  it('should default to a gerber drawing', function() {
    var result = whatsThatGerber('foobar')
    expect(result).to.eql({id: 'drw', name: 'gerber drawing'})
  })

  filenamesByCad.forEach(function(cadSet) {
    var cad = cadSet.cad
    var files = cadSet.files

    it('should identify ' + cad + ' files', function() {
      files.forEach(function(file) {
        var result = whatsThatGerber(file.name)
        expect(result.id).to.equal(file.type)
      })
    })
  })
})
