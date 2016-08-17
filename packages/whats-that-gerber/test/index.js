'use strict'

var expect = require('chai').expect

var whatsThatGerber = require('../')
var filenamesByCad = require('./filenames-by-cad')

var typeNames = {
  drw: 'gerber drawing',
  tcu: 'top copper',
  tsm: 'top soldermask',
  tss: 'top silkscreen',
  tsp: 'top solderpaste',
  bcu: 'bottom copper',
  bsm: 'bottom soldermask',
  bss: 'bottom silkscreen',
  bsp: 'bottom solderpaste',
  icu: 'inner copper',
  out: 'board outline',
  drl: 'drill hits'
}

describe('whats-that-gerber', function() {
  it('should default to a gerber drawing', function() {
    var result = whatsThatGerber('foobar')

    expect(result).to.equal('drw')
  })

  it('should have a list of all layer types', function() {
    var allTypes = whatsThatGerber.getAllTypes()

    expect(allTypes).to.have.lengthOf(12)
    expect(allTypes).to.contain(
      'drw',
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
      'drl')
  })

  it('should know which types are valid', function() {
    var allTypes = whatsThatGerber.getAllTypes()

    allTypes.forEach(function(type) {
      expect(whatsThatGerber.isValidType(type)).to.be.true
    })
  })

  it('should know which types are invalid', function() {
    var invalidTypes = ['foo', 'bar', 'baz', 'quux']

    invalidTypes.forEach(function(type) {
      expect(whatsThatGerber.isValidType(type)).to.be.false
    })
  })

  it('should have full names for all layer types', function() {
    whatsThatGerber.getAllTypes().forEach(function(type) {
      expect(whatsThatGerber.getFullName(type)).to.equal(typeNames[type])
    })
  })

  it('should return an empty string for names of unknown types / locales', function() {
    expect(whatsThatGerber.getFullName('foo')).to.equal('')
    expect(whatsThatGerber.getFullName('tcu', 'bar')).to.equal('')
  })

  filenamesByCad.forEach(function(cadSet) {
    var cad = cadSet.cad
    var files = cadSet.files

    it('should identify ' + cad + ' files', function() {
      files.forEach(function(file) {
        var result = whatsThatGerber(file.name)

        expect(result).to.equal(file.type)
      })
    })
  })
})
