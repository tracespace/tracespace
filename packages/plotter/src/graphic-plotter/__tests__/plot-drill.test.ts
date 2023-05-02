// Tests for plotting drill file objects using the GraphicPlotter interface
import {describe, it, beforeEach, expect} from 'vitest'

import * as Parser from '@tracespace/parser'

import * as Tree from '../../tree'
import type {Tool} from '../../tool-store'
import {SIMPLE_TOOL} from '../../tool-store'
import type {Location} from '../../location-store'
import {PI} from '../../coordinate-math'
import type {GraphicPlotter} from '..'
import {createGraphicPlotter} from '..'

type SubjectCall = Parameters<GraphicPlotter['plot']>
type SubjectReturn = ReturnType<GraphicPlotter['plot']>

const subject = (...calls: Array<Partial<SubjectCall>>): SubjectReturn => {
  const plotter = createGraphicPlotter(Parser.DRILL)
  return calls.flatMap(call => plotter.plot(...(call as SubjectCall)))
}

describe('plot drill file graphics', () => {
  let node: Parser.ChildNode

  beforeEach(() => {
    node = {type: Parser.GRAPHIC, graphic: undefined, coordinates: {}}
  })

  it('should plot a drill hit', () => {
    const tool: Tool = {
      type: SIMPLE_TOOL,
      shape: {type: Parser.CIRCLE, diameter: 2},
      hole: undefined,
      dcode: '1',
    }
    const location = {endPoint: {x: 3, y: 4}} as Location

    const results = subject([node, tool, location])

    expect(results).to.eql([
      {
        type: Tree.IMAGE_SHAPE,
        polarity: Parser.DARK,
        dcode: '1',
        shape: {type: Tree.CIRCLE, cx: 3, cy: 4, r: 1},
      },
    ])
  })

  it('should plot a drill slot', () => {
    node = {type: Parser.GRAPHIC, graphic: Parser.SLOT, coordinates: {}}

    const tool: Tool = {
      type: SIMPLE_TOOL,
      shape: {type: Parser.CIRCLE, diameter: 2},
      hole: undefined,
      dcode: '1',
    }
    const location = {
      startPoint: {x: 1, y: 2},
      endPoint: {x: 3, y: 4},
    } as Location

    const results = subject([node, tool, location])

    expect(results).to.eql([
      {
        type: Tree.IMAGE_PATH,
        dcode: '1',
        polarity: Parser.DARK,
        width: 2,
        segments: [{type: Tree.LINE, start: [1, 2], end: [3, 4]}],
      },
    ])
  })

  it('should plot linear drill routes', () => {
    const tool: Tool = {
      type: SIMPLE_TOOL,
      shape: {type: Parser.CIRCLE, diameter: 2},
      hole: undefined,
      dcode: '1',
    }
    const location1 = {
      startPoint: {x: 1, y: 2},
      endPoint: {x: 3, y: 4},
    } as Location
    const location2 = {
      startPoint: {x: 5, y: 6},
      endPoint: {x: 7, y: 8},
    } as Location

    const results = subject(
      [{type: Parser.INTERPOLATE_MODE, mode: Parser.LINE}],
      [node, tool, location1],
      [{type: Parser.INTERPOLATE_MODE, mode: Parser.MOVE}],
      [{type: Parser.INTERPOLATE_MODE, mode: Parser.LINE}],
      [node, tool, location2],
      [{type: Parser.DONE}]
    )

    expect(results).to.eql([
      {
        type: Tree.IMAGE_PATH,
        polarity: Parser.DARK,
        width: 2,
        segments: [{type: Tree.LINE, start: [1, 2], end: [3, 4]}],
        dcode: '1',
      },
      {
        type: Tree.IMAGE_PATH,
        polarity: Parser.DARK,
        width: 2,
        segments: [{type: Tree.LINE, start: [5, 6], end: [7, 8]}],
        dcode: '1',
      },
    ])
  })

  it('should plot a CCW arc drill route', () => {
    const halfSqrtTwo = 2 ** 0.5 / 2
    const tool: Tool = {
      type: SIMPLE_TOOL,
      shape: {type: Parser.CIRCLE, diameter: 2},
      hole: undefined,
      dcode: '1',
    }
    const location: Location = {
      startPoint: {x: 1, y: 0},
      endPoint: {x: halfSqrtTwo, y: halfSqrtTwo},
      arcOffsets: {i: 0, j: 0, a: 1},
    }

    const results = subject(
      [{type: Parser.INTERPOLATE_MODE, mode: Parser.CCW_ARC}],
      [node, tool, location],
      [{type: Parser.DONE}]
    )

    expect(results).toEqual([
      {
        type: Tree.IMAGE_PATH,
        polarity: Parser.DARK,
        width: 2,
        dcode: '1',
        segments: [
          {
            type: Tree.ARC,
            start: [1, 0, expect.approx(0)],
            end: [halfSqrtTwo, halfSqrtTwo, PI / 4],
            center: [expect.approx(0), expect.approx(0)],
            radius: 1,
          },
        ],
      },
    ])
  })

  it('should plot a CW arc drill route', () => {
    const halfSqrtTwo = 2 ** 0.5 / 2
    const tool: Tool = {
      type: SIMPLE_TOOL,
      shape: {type: Parser.CIRCLE, diameter: 2},
      hole: undefined,
      dcode: '1',
    }
    const location: Location = {
      startPoint: {x: halfSqrtTwo, y: halfSqrtTwo},
      endPoint: {x: 1, y: 0},
      arcOffsets: {i: 0, j: 0, a: 1},
    }

    const results = subject(
      [{type: Parser.INTERPOLATE_MODE, mode: Parser.CW_ARC}],
      [node, tool, location],
      [{type: Parser.DONE}]
    )

    expect(results).toEqual([
      {
        type: Tree.IMAGE_PATH,
        polarity: Parser.DARK,
        width: 2,
        dcode: '1',
        segments: [
          {
            type: Tree.ARC,
            start: [halfSqrtTwo, halfSqrtTwo, PI / 4],
            end: [1, 0, expect.approx(0)],
            center: [expect.approx(0), expect.approx(0)],
            radius: 1,
          },
        ],
      },
    ])
  })

  it('should transition from route mode back to drill mode', () => {
    const tool: Tool = {
      type: SIMPLE_TOOL,
      shape: {type: Parser.CIRCLE, diameter: 2},
      hole: undefined,
      dcode: '1',
    }
    const location1 = {
      startPoint: {x: 1, y: 2},
      endPoint: {x: 3, y: 4},
    } as Location
    const location2 = {
      startPoint: {x: 5, y: 6},
      endPoint: {x: 7, y: 8},
    } as Location

    const results = subject(
      [{type: Parser.INTERPOLATE_MODE, mode: Parser.LINE}],
      [node, tool, location1],
      [{type: Parser.INTERPOLATE_MODE, mode: Parser.DRILL}],
      [node, tool, location2]
    )

    expect(results).to.eql([
      {
        type: Tree.IMAGE_PATH,
        polarity: Parser.DARK,
        width: 2,
        dcode: '1',
        segments: [{type: Tree.LINE, start: [1, 2], end: [3, 4]}],
      },
      {
        type: Tree.IMAGE_SHAPE,
        polarity: Parser.DARK,
        dcode: '1',
        shape: {type: Tree.CIRCLE, cx: 7, cy: 8, r: 1},
      },
    ])
  })
})
