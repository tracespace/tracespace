import {describe, it, expect} from 'vitest'
import * as Parser from '@tracespace/parser'

import {Position} from '../../types'
import * as Tree from '../../tree'
import {addSegmentToPath} from '../plot-path'

interface PlotSegmentSpec {
  tool: Parser.ToolDefinition
  path: Tree.ImagePath | null
  interpolateMode: Parser.InterpolateModeType
  regionMode: false
  start: Position
  end: Position
  expectedPath: Tree.ImagePath | Tree.ImageRegion
}

const t = (
  shape: Parser.ToolShape,
  hole: Parser.HoleShape | null = null
): Parser.ToolDefinition => ({
  type: Parser.TOOL_DEFINITION,
  code: '10',
  shape,
  hole,
})

describe('shape plotting', () => {
  const SPECS: Record<string, PlotSegmentSpec> = {
    'circle tool line segment': {
      tool: t({type: Parser.CIRCLE, diameter: 2}),
      path: null,
      interpolateMode: Tree.LINE,
      regionMode: false,
      start: [3, 4],
      end: [5, 6],
      expectedPath: {
        type: Tree.IMAGE_PATH,
        width: 2,
        segments: [{type: Tree.LINE, start: [3, 4], end: [5, 6]}],
      },
    },
  }

  for (const [name, spec] of Object.entries(SPECS)) {
    const {tool, path, interpolateMode, regionMode, start, end, expectedPath} =
      spec

    it(name, () => {
      const nextPath = addSegmentToPath({
        path,
        start,
        end,
        offsets: {i: null, j: null, a: null},
        tool,
        interpolateMode,
        regionMode,
        quadrantMode: null,
      })

      expect(nextPath).to.eql(expectedPath)
    })
  }
})
