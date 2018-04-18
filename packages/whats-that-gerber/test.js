'use strict'

var assert = require('assert')

var cadFilenames = require('@tracespace/fixtures/gerber-filenames.json')
var whatsThatGerber = require('.')

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

describe('whats-that-gerber', function () {
  it('should default to a gerber drawing', function () {
    var result = whatsThatGerber('foobar')

    assert.equal(result, 'drw')
  })

  it('should have a list of all layer types', function () {
    var EXPECTED_TYPES = Object.keys(typeNames)
    var allTypes = whatsThatGerber.getAllTypes()

    assert.equal(allTypes.length, 12)
    allTypes.forEach(function (type) {
      assert(
        EXPECTED_TYPES.indexOf(type) !== -1,
        'Expected ' + type + ' to be in ' + EXPECTED_TYPES.toString()
      )
    })
  })

  it('should know which types are valid', function () {
    var allTypes = whatsThatGerber.getAllTypes()

    allTypes.forEach(function (type) {
      assert(
        whatsThatGerber.isValidType(type),
        'Expected ' + type + ' to be a valid type'
      )
    })
  })

  it('should know which types are invalid', function () {
    var invalidTypes = ['foo', 'bar', 'baz', 'quux']

    invalidTypes.forEach(function (type) {
      assert.equal(
        whatsThatGerber.isValidType(type),
        false,
        'Expected ' + type + ' to not be a valid type'
      )
    })
  })

  it('should have full names for all layer types', function () {
    whatsThatGerber.getAllTypes().forEach(function (type) {
      var name = whatsThatGerber.getFullName(type)
      var expected = typeNames[type]

      assert.equal(
        name,
        expected,
        '[' + type + ' -> ' + name + '], expected [' + expected + ']'
      )
    })
  })

  it('should return empty full name for unknown types / locales', function () {
    assert.equal(whatsThatGerber.getFullName('foo'), '')
    assert.equal(whatsThatGerber.getFullName('tcu', 'bar'), '')
  })

  cadFilenames.forEach(function (cadSet) {
    var cad = cadSet.cad
    var files = cadSet.files

    it('should identify ' + cad + ' files', function () {
      files.forEach(function (file) {
        var result = whatsThatGerber(file.name)

        assert.equal(
          result,
          file.type,
          '[' + file.name + ' -> ' + result + '], expected [' + file.type + ']'
        )
      })
    })
  })
})
