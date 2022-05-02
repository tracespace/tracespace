import {describe, beforeEach, it, expect} from 'vitest'

import * as Parser from '@tracespace/parser'
import {getPlotOptions} from '../options'

describe('ensure plot options', () => {
  let gerberTree: Parser.GerberTree

  beforeEach(() => {
    gerberTree = {type: Parser.ROOT, filetype: Parser.GERBER, children: []}
  })

  it('should get units from the parsed tree', () => {
    gerberTree.children = [{type: Parser.UNITS, units: Parser.IN}]

    const result = getPlotOptions(gerberTree)
    expect(result.units).to.eql('in')
  })

  it('should use format and zero-suppression from tree', () => {
    gerberTree.children = [
      {
        type: Parser.COORDINATE_FORMAT,
        format: [1, 2],
        zeroSuppression: Parser.TRAILING,
        mode: null,
      },
    ]

    const result = getPlotOptions(gerberTree)
    expect(result.coordinateFormat).to.eql([1, 2])
    expect(result.zeroSuppression).to.eql('trailing')
  })

  describe('infer zero-suppression', () => {
    const COORDINATE_ZERO_SUPPRESSION_SPECS = [
      ['12340', 'leading'],
      ['12.34', 'leading'],
      ['01234', 'trailing'],
    ] as const

    COORDINATE_ZERO_SUPPRESSION_SPECS.forEach(([coordinate, suppression]) => {
      it(`should use "${coordinate}" to infer ${suppression} suppression`, () => {
        const coordinates = {x: coordinate}
        gerberTree.children = [
          {type: Parser.GRAPHIC, graphic: Parser.MOVE, coordinates},
        ]

        const result = getPlotOptions(gerberTree)
        expect(result.zeroSuppression).to.eql(suppression)
      })
    })

    const COMMENT_ZERO_SUPPRESSION_SPECS = [
      ['suppress trailing zeros', 'trailing'],
      ['suppress leading zeros', 'leading'],
      ['keep zeros', 'leading'],
    ] as const

    COMMENT_ZERO_SUPPRESSION_SPECS.forEach(([comment, suppression]) => {
      it(`should use "${comment}" to infer ${suppression} suppression`, () => {
        gerberTree.children = [{type: Parser.COMMENT, comment}]

        const result = getPlotOptions(gerberTree)
        expect(result.zeroSuppression).to.eql(suppression)
      })
    })

    const COMMENT_FORMAT_SPECS = [
      ['FILE_FORMAT=2:4', [2, 4]],
      ['FORMAT={2:4/ absolute / inch / keep zeros}', [2, 4]],
    ] as const

    COMMENT_FORMAT_SPECS.forEach(([comment, format]) => {
      it(`should use comment "${comment}" to infer format ${format[0]}, ${format[1]}`, () => {
        gerberTree.children = [{type: Parser.COMMENT, comment}]

        const result = getPlotOptions(gerberTree)
        expect(result.coordinateFormat).to.eql(format)
      })
    })
  })
})
