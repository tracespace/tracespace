import {describe, it, expect} from 'vitest'
import * as Parser from '@tracespace/parser'

import {Position} from '../../types'
import * as Nodes from '../../tree'
import {addSegmentToPath} from '../plot-path'

interface PlotSegmentSpec {
  tool: Parser.ToolDefinition
  path: Nodes.ImagePath | null
  interpolateMode: Parser.InterpolateModeType
  regionMode: false
  start: Position
  end: Position
  expectedPath: Nodes.ImagePath | Nodes.ImageRegion
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
      interpolateMode: Nodes.LINE,
      regionMode: false,
      start: [3, 4],
      end: [5, 6],
      expectedPath: {
        type: Nodes.IMAGE_PATH,
        width: 2,
        segments: [{type: Nodes.LINE, start: [3, 4], end: [5, 6]}],
      },
    },
  }

  for (const [name, spec] of Object.entries(SPECS)) {
    const {tool, path, interpolateMode, regionMode, start, end, expectedPath} =
      spec

    it(name, () => {
      const nextPath = addSegmentToPath(
        path,
        start,
        end,
        {i: null, j: null, a: null},
        tool,
        interpolateMode,
        regionMode,
        null
      )

      expect(nextPath).to.eql(expectedPath)
    })
  }
})
