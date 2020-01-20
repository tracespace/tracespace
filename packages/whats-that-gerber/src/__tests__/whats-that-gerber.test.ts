import assert from 'assert'

import cadFilenames from '@tracespace/fixtures/gerber-filenames.json'
import {identifyLayers, getAllLayers, validate} from '..'

interface FilenameSpec {
  name: string
  side: string | null
  type: string | null
}

const EXPECTED_LAYERS = [
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
  {type: 'drawing', side: null},
]

describe('whats-that-gerber', () => {
  it('should default to null', () => {
    const result = identifyLayers('foobar')

    assert.deepStrictEqual(result, {foobar: {side: null, type: null}})
  })

  it('should have a list of all layer types', () => {
    assert.deepStrictEqual(getAllLayers(), EXPECTED_LAYERS)
  })

  it('should know which types are valid', () => {
    const allLayers = getAllLayers()

    allLayers.forEach(layer => {
      const result = validate(layer)

      assert.deepStrictEqual(result, {
        valid: true,
        side: layer.side,
        type: layer.type,
      })
    })
  })

  it('should know which types are invalid', () => {
    const invalidSide = validate({side: 'bop', type: 'copper'})
    const invalidType = validate({side: 'top', type: 'topper'})
    const invalidAll = validate({side: 'fizz', type: 'buzz'})

    assert.deepStrictEqual(invalidSide, {
      valid: false,
      side: null,
      type: 'copper',
    })
    assert.deepStrictEqual(invalidType, {valid: false, side: 'top', type: null})
    assert.deepStrictEqual(invalidAll, {valid: false, side: null, type: null})
  })

  cadFilenames.forEach(cadSet => {
    const {cad} = cadSet
    const files: FilenameSpec[] = cadSet.files

    it(`should identify ${cad} files`, () => {
      const result = identifyLayers(files.map(file => file.name))

      files.forEach(file => {
        const {name, side, type} = file
        const {side: sideResult, type: typeResult} = result[name]

        assert(
          sideResult === side,
          `${name} should be side "${side}", got "${sideResult}"`
        )
        assert(
          typeResult === type,
          `${name} should be type "${type} ", got "${typeResult}"`
        )
      })
    })
  })
})
