import {describe, it, expect} from 'vitest'

import * as Parser from '@tracespace/parser'

import * as Tree from '../../tree'
import type {Tool} from '../../tool-store'
import {SIMPLE_TOOL} from '../../tool-store'
import type {Location} from '../../location-store'
import type {GraphicPlotter} from '..'
import {createGraphicPlotter} from '..'

type SubjectArguments = Parameters<GraphicPlotter['plot']>
type SubjectReturn = ReturnType<GraphicPlotter['plot']>

const subject = (...calls: Array<Partial<SubjectArguments>>): SubjectReturn => {
  const plotter = createGraphicPlotter(Parser.GERBER)
  return calls.flatMap(call => plotter.plot(...(call as SubjectArguments)))
}

describe('plot stroke paths', () => {
  const tool: Tool = {
    type: SIMPLE_TOOL,
    shape: {type: Parser.CIRCLE, diameter: 2},
    hole: undefined,
    dcode: '1',
  }

  it('should not plot anything if no path', () => {
    const location = {
      startPoint: {x: 3, y: 4},
      endPoint: {x: 5, y: 6},
    } as Location

    const results = subject([{type: Parser.DONE}, tool, location])
    expect(results).to.eql([])
  })

  it('should plot a line segment', () => {
    const location = {
      startPoint: {x: 3, y: 4},
      endPoint: {x: 5, y: 6},
    } as Location

    const results = subject(
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
        segments: [{type: Tree.LINE, start: [3, 4], end: [5, 6]}],
      },
    ])
  })

  it('should plot several line segments', () => {
    const location1 = {
      startPoint: {x: 3, y: 4},
      endPoint: {x: 5, y: 6},
    } as Location
    const location2 = {
      startPoint: {x: 7, y: 8},
      endPoint: {x: 9, y: 10},
    } as Location

    const results = subject(
      [
        {type: Parser.GRAPHIC, graphic: Parser.SEGMENT, coordinates: {}},
        tool,
        location1,
      ],
      [
        {type: Parser.GRAPHIC, graphic: Parser.SEGMENT, coordinates: {}},
        tool,
        location2,
      ],
      [{type: Parser.DONE}, tool, location2]
    )

    expect(results).to.eql([
      {
        type: Tree.IMAGE_PATH,
        polarity: Parser.DARK,
        width: 2,
        dcode: '1',
        segments: [{type: Tree.LINE, start: [3, 4], end: [5, 6]}],
      },
      {
        type: Tree.IMAGE_PATH,
        polarity: Parser.DARK,
        width: 2,
        dcode: '1',
        segments: [{type: Tree.LINE, start: [7, 8], end: [9, 10]}],
      },
    ])
  })

  it('should plot several line segments with several tools', () => {
    const tool1: Tool = {
      type: SIMPLE_TOOL,
      shape: {type: Parser.CIRCLE, diameter: 1},
      hole: undefined,
      dcode: '1',
    }
    const location1 = {
      startPoint: {x: 3, y: 4},
      endPoint: {x: 5, y: 6},
    } as Location

    const tool2: Tool = {
      type: SIMPLE_TOOL,
      shape: {type: Parser.CIRCLE, diameter: 2},
      hole: undefined,
      dcode: '2',
    }
    const location2 = {
      startPoint: {x: 7, y: 8},
      endPoint: {x: 9, y: 10},
    } as Location

    const results = subject(
      [
        {type: Parser.GRAPHIC, graphic: Parser.SEGMENT, coordinates: {}},
        tool1,
        location1,
      ],
      [{type: Parser.TOOL_CHANGE, code: '123'}, tool2, location1],
      [
        {type: Parser.GRAPHIC, graphic: Parser.SEGMENT, coordinates: {}},
        tool2,
        location2,
      ],
      [{type: Parser.TOOL_CHANGE, code: '456'}, tool1, location2]
    )

    expect(results).to.eql([
      {
        type: Tree.IMAGE_PATH,
        polarity: Parser.DARK,
        width: 1,
        dcode: '1',
        segments: [{type: Tree.LINE, start: [3, 4], end: [5, 6]}],
      },
      {
        type: Tree.IMAGE_PATH,
        polarity: Parser.DARK,
        width: 2,
        dcode: '2',
        segments: [{type: Tree.LINE, start: [7, 8], end: [9, 10]}],
      },
    ])
  })

  it('should plot line segments and shapes', () => {
    const location1 = {endPoint: {x: 3, y: 4}} as Location
    const location2 = {
      startPoint: {x: 5, y: 6},
      endPoint: {x: 7, y: 8},
    } as Location
    const location3 = {endPoint: {x: 9, y: 10}} as Location

    const results = subject(
      [
        {type: Parser.GRAPHIC, graphic: Parser.SHAPE, coordinates: {}},
        tool,
        location1,
      ],
      [
        {type: Parser.GRAPHIC, graphic: Parser.SEGMENT, coordinates: {}},
        tool,
        location2,
      ],
      [
        {type: Parser.GRAPHIC, graphic: Parser.SHAPE, coordinates: {}},
        tool,
        location3,
      ]
    )

    expect(results).to.eql([
      {
        type: Tree.IMAGE_SHAPE,
        polarity: Parser.DARK,
        dcode: '1',
        shape: {type: Tree.CIRCLE, cx: 3, cy: 4, r: 1},
      },
      {
        type: Tree.IMAGE_PATH,
        polarity: Parser.DARK,
        width: 2,
        dcode: '1',
        segments: [{type: Tree.LINE, start: [5, 6], end: [7, 8]}],
      },
      {
        type: Tree.IMAGE_SHAPE,
        polarity: Parser.DARK,
        dcode: '1',
        shape: {type: Tree.CIRCLE, cx: 9, cy: 10, r: 1},
      },
    ])
  })

  it('should continue to plot paths without explicit graphics mode set', () => {
    const location1 = {endPoint: {x: 3, y: 4}} as Location
    const location2 = {
      startPoint: {x: 5, y: 6},
      endPoint: {x: 7, y: 8},
    } as Location

    const results = subject(
      [
        {type: Parser.GRAPHIC, graphic: Parser.SHAPE, coordinates: {}},
        tool,
        location1,
      ],
      [
        {type: Parser.GRAPHIC, graphic: undefined, coordinates: {}},
        tool,
        location1,
      ],
      [
        {type: Parser.GRAPHIC, graphic: Parser.SEGMENT, coordinates: {}},
        tool,
        location2,
      ],
      [
        {type: Parser.GRAPHIC, graphic: undefined, coordinates: {}},
        tool,
        location2,
      ],
      [{type: Parser.DONE}]
    )

    expect(results).to.eql([
      {
        type: Tree.IMAGE_SHAPE,
        polarity: Parser.DARK,
        dcode: '1',
        shape: {type: Tree.CIRCLE, cx: 3, cy: 4, r: 1},
      },
      {
        type: Tree.IMAGE_SHAPE,
        polarity: Parser.DARK,
        dcode: '1',
        shape: {type: Tree.CIRCLE, cx: 3, cy: 4, r: 1},
      },
      {
        type: Tree.IMAGE_PATH,
        polarity: Parser.DARK,
        width: 2,
        dcode: '1',
        segments: [{type: Tree.LINE, start: [5, 6], end: [7, 8]}],
      },
      {
        type: Tree.IMAGE_PATH,
        polarity: Parser.DARK,
        width: 2,
        dcode: '1',
        segments: [{type: Tree.LINE, start: [5, 6], end: [7, 8]}],
      },
    ])
  })
})
