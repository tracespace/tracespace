import {expect} from 'chai'
import * as Parser from '@tracespace/parser'

import {Position, Box} from '../../types'
import * as Nodes from '../nodes'
import {plotShape, getShapeBox} from '../plot-shape'

interface PlotShapeSpec {
  tool: Parser.ToolDefinition
  position: Position
  expectedShape: Nodes.Shape
  expectedBox: Box
}

const t = (
  shape: Parser.Circle | Parser.Rectangle | Parser.Obround | Parser.Polygon,
  hole: Parser.HoleShape = null
): Parser.ToolDefinition => ({
  type: Parser.TOOL_DEFINITION,
  code: '10',
  shape,
  hole,
})

describe('shape plotting', () => {
  const SPECS: {[name: string]: PlotShapeSpec} = {
    'circle tool': {
      tool: t({type: Parser.CIRCLE, diameter: 2}),
      position: [3, 4],
      expectedShape: {type: Nodes.CIRCLE, cx: 3, cy: 4, r: 1},
      expectedBox: [2, 3, 4, 5],
    },
    'rectangle tool': {
      tool: t({type: Parser.RECTANGLE, xSize: 6, ySize: 7}),
      position: [2, -1],
      expectedShape: {
        type: Nodes.RECTANGLE,
        x: -1,
        y: -4.5,
        xSize: 6,
        ySize: 7,
        r: null,
      },
      expectedBox: [-1, -4.5, 5, 2.5],
    },
    'obround tool (portrait)': {
      tool: t({type: Parser.OBROUND, xSize: 6, ySize: 8}),
      position: [1, 2],
      expectedShape: {
        type: Nodes.RECTANGLE,
        x: -2,
        y: -2,
        xSize: 6,
        ySize: 8,
        r: 3,
      },
      expectedBox: [-2, -2, 4, 6],
    },
    'obround tool (landscape)': {
      tool: t({type: Parser.OBROUND, xSize: 8, ySize: 6}),
      position: [1, 2],
      expectedShape: {
        type: Nodes.RECTANGLE,
        x: -3,
        y: -1,
        xSize: 8,
        ySize: 6,
        r: 3,
      },
      expectedBox: [-3, -1, 5, 5],
    },
    polygon: {
      tool: t({
        type: Parser.POLYGON,
        diameter: 16,
        vertices: 4,
        rotation: null,
      }),
      position: [2, 2],
      expectedShape: {
        type: Nodes.POLYGON,
        points: [[10, 2], [2, 10], [-6, 2], [2, -6]],
      },
      expectedBox: [-6, -6, 10, 10],
    },
  }

  Object.keys(SPECS).forEach(name => {
    const {tool, position, expectedShape, expectedBox} = SPECS[name]
    it(name, () => {
      const shape = plotShape(tool.shape as any, tool.hole, position)
      const box = getShapeBox(shape)

      expect(shape).to.eql(expectedShape)
      expect(box).to.eql(expectedBox)
    })
  })
})
