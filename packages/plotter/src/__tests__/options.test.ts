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
        mode: undefined,
      },
    ]

    const result = getPlotOptions(gerberTree)
    expect(result.coordinateFormat).to.eql([1, 2])
    expect(result.zeroSuppression).to.eql('trailing')
  })

  describe('infer zero-suppression', () => {
    it('should use "12340" coordinate to infer leading suppression', () => {
      const coordinates = {x: '12340'}
      gerberTree.children = [
        {type: Parser.GRAPHIC, graphic: Parser.MOVE, coordinates},
      ]

      const result = getPlotOptions(gerberTree)
      expect(result.zeroSuppression).to.equal('leading')
    })

    it('should use "12.34" coordinate to infer leading suppression', () => {
      const coordinates = {x: '12.34'}
      gerberTree.children = [
        {type: Parser.GRAPHIC, graphic: Parser.MOVE, coordinates},
      ]

      const result = getPlotOptions(gerberTree)
      expect(result.zeroSuppression).to.equal('leading')
    })

    it('should use "01234" coordinate to infer leading suppression', () => {
      const coordinates = {x: '01234'}
      gerberTree.children = [
        {type: Parser.GRAPHIC, graphic: Parser.MOVE, coordinates},
      ]

      const result = getPlotOptions(gerberTree)
      expect(result.zeroSuppression).to.equal('trailing')
    })

    it('should use "suppress trailing zeros" comment to infer trailing suppression', () => {
      gerberTree.children = [
        {type: Parser.COMMENT, comment: 'suppress trailing zeros'},
      ]

      const result = getPlotOptions(gerberTree)
      expect(result.zeroSuppression).to.equal('trailing')
    })

    it('should use "suppress leading zeros" comment to infer leading suppression', () => {
      gerberTree.children = [
        {type: Parser.COMMENT, comment: 'suppress leading zeros'},
      ]

      const result = getPlotOptions(gerberTree)
      expect(result.zeroSuppression).to.equal('leading')
    })

    it('should use "keep zeros" comment to infer leading suppression', () => {
      gerberTree.children = [{type: Parser.COMMENT, comment: 'keep zeros'}]

      const result = getPlotOptions(gerberTree)
      expect(result.zeroSuppression).to.equal('leading')
    })

    it('should use comment "FILE_FORMAT=2:4" to infer format [2, 4]', () => {
      gerberTree.children = [{type: Parser.COMMENT, comment: 'FILE_FORMAT=2:4'}]

      const result = getPlotOptions(gerberTree)
      expect(result.coordinateFormat).to.eql([2, 4])
    })

    it('should use comment "FORMAT={2:4/ absolute / inch / keep zeros}" to infer format [2, 4]', () => {
      gerberTree.children = [
        {
          type: Parser.COMMENT,
          comment: 'FORMAT={2:4/ absolute / inch / keep zeros}',
        },
      ]

      const result = getPlotOptions(gerberTree)
      expect(result.coordinateFormat).to.equal([2, 4])
    })
  })
})
