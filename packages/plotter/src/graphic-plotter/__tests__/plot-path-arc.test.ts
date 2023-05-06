import {describe, it, expect} from 'vitest'

import * as Parser from '@tracespace/parser'

import * as Tree from '../../tree'
import type {Tool} from '../../tool-store'
import {SIMPLE_TOOL} from '../../tool-store'
import type {Location} from '../../location-store'
import {HALF_PI, PI, TWO_PI} from '../../coordinate-math'

import type {GraphicPlotter} from '..'
import {createGraphicPlotter} from '..'

type SubjectCall = Parameters<GraphicPlotter['plot']>
type SubjectReturn = ReturnType<GraphicPlotter['plot']>

const subject = (...calls: Array<Partial<SubjectCall>>): SubjectReturn => {
  const plotter = createGraphicPlotter(Parser.GERBER)
  return calls.flatMap(call => plotter.plot(...(call as SubjectCall)))
}

describe('plot stroke arc paths', () => {
  const tool: Tool = {
    type: SIMPLE_TOOL,
    shape: {type: Parser.CIRCLE, diameter: 2},
    hole: undefined,
    dcode: '1',
  }

  it('should plot a zero-length CCW arc as a full circle', () => {
    const location: Location = {
      startPoint: {x: 1, y: 0},
      endPoint: {x: 1, y: 0},
      arcOffsets: {i: -1, j: 0, a: 0},
    }

    const results = subject(
      [{type: Parser.INTERPOLATE_MODE, mode: Parser.CCW_ARC}],
      [
        {type: Parser.GRAPHIC, graphic: Parser.SEGMENT, coordinates: {}},
        tool,
        location,
      ],
      [{type: Parser.DONE}]
    )

    expect(results).to.eql([
      {
        type: Tree.IMAGE_PATH,
        polarity: Parser.DARK,
        width: 2,
        dcode: '1',
        segments: [
          {
            type: Tree.ARC,
            start: [1, 0, 0],
            end: [1, 0, TWO_PI],
            center: [0, 0],
            radius: 1,
          },
        ],
      },
    ])
  })

  it('should plot a zero-length CW arc as a full circle', () => {
    const location: Location = {
      startPoint: {x: 1, y: 0},
      endPoint: {x: 1, y: 0},
      arcOffsets: {i: -1, j: 0, a: 0},
    }

    const results = subject(
      [{type: Parser.INTERPOLATE_MODE, mode: Parser.CW_ARC}],
      [
        {type: Parser.GRAPHIC, graphic: Parser.SEGMENT, coordinates: {}},
        tool,
        location,
      ],
      [{type: Parser.DONE}]
    )

    expect(results).to.eql([
      {
        type: Tree.IMAGE_PATH,
        polarity: Parser.DARK,
        width: 2,
        dcode: '1',
        segments: [
          {
            type: Tree.ARC,
            start: [1, 0, TWO_PI],
            end: [1, 0, 0],
            center: [0, 0],
            radius: 1,
          },
        ],
      },
    ])
  })

  it('should plot a CCW arc with length', () => {
    const location: Location = {
      startPoint: {x: 0, y: 1},
      endPoint: {x: -1, y: 0},
      arcOffsets: {i: 0, j: -1, a: 0},
    }

    const results = subject(
      [{type: Parser.INTERPOLATE_MODE, mode: Parser.CCW_ARC}],
      [
        {type: Parser.GRAPHIC, graphic: Parser.SEGMENT, coordinates: {}},
        tool,
        location,
      ],
      [{type: Parser.DONE}]
    )

    expect(results).to.eql([
      {
        type: Tree.IMAGE_PATH,
        polarity: Parser.DARK,
        width: 2,
        dcode: '1',
        segments: [
          {
            type: Tree.ARC,
            start: [0, 1, HALF_PI],
            end: [-1, 0, PI],
            center: [0, 0],
            radius: 1,
          },
        ],
      },
    ])
  })

  describe('single quadrant mode', () => {
    const halfSqrtTwo = 2 ** 0.5 / 2

    it('should plot a zero-length arc as a zero-length line', () => {
      const location: Location = {
        startPoint: {x: 1, y: 0},
        endPoint: {x: 1, y: 0},
        arcOffsets: {i: -1, j: 0, a: 0},
      }

      const results = subject(
        [{type: Parser.QUADRANT_MODE, quadrant: Parser.SINGLE}],
        [{type: Parser.INTERPOLATE_MODE, mode: Parser.CCW_ARC}],
        [
          {type: Parser.GRAPHIC, graphic: Parser.SEGMENT, coordinates: {}},
          tool,
          location,
        ],
        [{type: Parser.DONE}]
      )

      expect(results).to.eql([
        {
          type: Tree.IMAGE_PATH,
          polarity: Parser.DARK,
          width: 2,
          dcode: '1',
          segments: [{type: Tree.LINE, start: [1, 0], end: [1, 0]}],
        },
      ])
    })

    it('should select the proper center for an offset in `i`', () => {
      const location: Location = {
        startPoint: {x: 1, y: 0},
        endPoint: {x: halfSqrtTwo, y: halfSqrtTwo},
        arcOffsets: {i: 1, j: 0, a: 0},
      }

      const results = subject(
        [{type: Parser.QUADRANT_MODE, quadrant: Parser.SINGLE}],
        [{type: Parser.INTERPOLATE_MODE, mode: Parser.CCW_ARC}],
        [
          {type: Parser.GRAPHIC, graphic: Parser.SEGMENT, coordinates: {}},
          tool,
          location,
        ],
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

    it('should select the proper center for an offset in `j`', () => {
      const location: Location = {
        startPoint: {x: 0, y: 1},
        endPoint: {x: halfSqrtTwo, y: halfSqrtTwo},
        arcOffsets: {i: 0, j: 1, a: 0},
      }

      const results = subject(
        [{type: Parser.QUADRANT_MODE, quadrant: Parser.SINGLE}],
        [{type: Parser.INTERPOLATE_MODE, mode: Parser.CW_ARC}],
        [
          {type: Parser.GRAPHIC, graphic: Parser.SEGMENT, coordinates: {}},
          tool,
          location,
        ],
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
              start: [0, 1, expect.approx(HALF_PI)],
              end: [halfSqrtTwo, halfSqrtTwo, PI / 4],
              center: [expect.approx(0), expect.approx(0)],
              radius: 1,
            },
          ],
        },
      ])
    })
  })
})
