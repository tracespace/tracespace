'use strict'

var assert = require('assert')

var cadFilenames = require('@tracespace/fixtures/gerber-filenames.json')
var wtg = require('.')

var EXPECTED_LAYERS = [
  {type: 'copper', side: 'top'},
  {type: 'soldermask', side: 'top'},
  {type: 'silkscreen', side: 'top'},
  {type: 'solderpaste', side: 'top'},
  {type: 'copper', side: 'bottom'},
  {type: 'soldermask', side: 'bottom'},
  {type: 'silkscreen', side: 'bottom'},
  {type: 'solderpaste', side: 'bottom'},
  {type: 'copper', side: 'inner'},
  {type: 'outline', side: 'all'},
  {type: 'drill', side: 'all'},
  {type: 'drawing', side: null}
]

describe('whats-that-gerber', function () {
  it('should default to null', function () {
    var result = wtg('foobar')

    assert.deepEqual(result, {foobar: {side: null, type: null}})
  })

  it('should have a list of all layer types', function () {
    assert.deepEqual(wtg.getAllLayers(), EXPECTED_LAYERS)
  })

  it('should know which types are valid', function () {
    var allLayers = wtg.getAllLayers()

    allLayers.forEach(function (layer) {
      var result = wtg.validate(layer)
      assert.deepEqual(result, {
        valid: true,
        side: layer.side,
        type: layer.type
      })
    })
  })

  it('should know which types are invalid', function () {
    var invalidSide = wtg.validate({side: 'bop', type: 'copper'})
    var invalidType = wtg.validate({side: 'top', type: 'topper'})
    var invalidAll = wtg.validate({side: 'fizz', type: 'buzz'})

    assert.deepEqual(invalidSide, {valid: false, side: null, type: 'copper'})
    assert.deepEqual(invalidType, {valid: false, side: 'top', type: null})
    assert.deepEqual(invalidAll, {valid: false, side: null, type: null})
  })

  cadFilenames.forEach(function (cadSet) {
    var cad = cadSet.cad
    var files = cadSet.files

    it('should identify ' + cad + ' files', function () {
      var result = wtg(
        files.map(function (file) {
          return file.name
        })
      )

      files.forEach(function (file) {
        var fileResult = result[file.name]

        assert(fileResult, `Expected ${file.name} to be recognized as a layer`)
        assert.equal(
          fileResult.side,
          file.side,
          `Expected ${file.name} side to be "${file.side}", got "${[
            fileResult.side
          ]}"`
        )
        assert.equal(
          fileResult.type,
          file.type,
          `Expected ${file.name} type to be "${file.type}", got "${
            fileResult.type
          }"`
        )
      })
    })
  })
})
