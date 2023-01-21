import {describe, it, expect} from 'vitest'

import cadFilenames from '@tracespace/fixtures/gerber-filenames.json'
import {identifyLayers, getAllLayers, validate} from '..'

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
  {type: 'drawing', side: undefined},
]

describe('@tracespace/identify-layers', () => {
  it('should default to undefined', () => {
    const result = identifyLayers('foobar')

    expect(result).to.eql({foobar: {side: undefined, type: undefined}})
  })

  it('should have a list of all layer types', () => {
    expect(getAllLayers()).to.eql(EXPECTED_LAYERS)
  })

  it('should know which types are valid', () => {
    const allLayers = getAllLayers()

    for (const layer of allLayers) {
      const result = validate(layer)

      expect(result).to.eql({
        valid: true,
        side: layer.side,
        type: layer.type,
      })
    }
  })

  it('should know which types are invalid', () => {
    const invalidSide = validate({side: 'bop', type: 'copper'})
    const invalidType = validate({side: 'top', type: 'topper'})
    const invalidAll = validate({side: 'fizz', type: 'buzz'})

    expect(invalidSide).to.eql({
      valid: false,
      side: undefined,
      type: 'copper',
    })
    expect(invalidType).to.eql({valid: false, side: 'top', type: undefined})
    expect(invalidAll).to.eql({valid: false, side: undefined, type: undefined})
  })

  for (const cadSet of cadFilenames) {
    const {cad, files} = cadSet

    it(`should identify ${cad} files`, () => {
      const result = identifyLayers(files.map(file => file.name))

      for (const file of files) {
        const {name, side: expectedSide, type: expectedType} = file
        const {side: sideResult, type: typeResult} = result[name]

        expect(sideResult).to.equal(
          expectedSide ?? undefined,
          `${name} should be ${expectedSide!}, got ${sideResult!}`
        )
        expect(typeResult).to.equal(
          expectedType ?? undefined,
          `${name} should be ${expectedType!}, got ${typeResult!}`
        )
      }
    })
  }
})
