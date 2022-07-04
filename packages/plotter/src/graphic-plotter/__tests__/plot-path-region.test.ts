import {describe, it, expect} from 'vitest'

import * as Parser from '@tracespace/parser'

import * as Tree from '../../tree'
import {Tool} from '../../tool-store'
import {Location} from '../../location-store'
import {GraphicPlotter, createGraphicPlotter} from '..'

type SubjectCall = Parameters<GraphicPlotter['plot']>
type SubjectReturn = ReturnType<GraphicPlotter['plot']>

const subject = (...calls: Array<Partial<SubjectCall>>): SubjectReturn => {
  const plotter = createGraphicPlotter()
  return calls.flatMap(call => plotter.plot(...(call as SubjectCall)))
}

describe('plot stroke paths', () => {
  const location1 = {
    startPoint: {x: 0, y: 0},
    endPoint: {x: 1, y: 0},
  } as Location

  const location2 = {
    startPoint: {x: 1, y: 0},
    endPoint: {x: 1, y: 1},
  } as Location

  const location3 = {
    startPoint: {x: 1, y: 1},
    endPoint: {x: 0, y: 0},
  } as Location

  it('should plot a region', () => {
    const results = subject(
      [{type: Parser.REGION_MODE, region: true}],
      [
        {type: Parser.GRAPHIC, graphic: Parser.SEGMENT, coordinates: {}},
        undefined,
        location1,
      ],
      [
        {type: Parser.GRAPHIC, graphic: Parser.SEGMENT, coordinates: {}},
        undefined,
        location2,
      ],
      [
        {type: Parser.GRAPHIC, graphic: Parser.SEGMENT, coordinates: {}},
        undefined,
        location3,
      ],
      [{type: Parser.DONE}]
    )

    expect(results).to.eql([
      {
        type: Tree.IMAGE_REGION,
        segments: [
          {type: Tree.LINE, start: [0, 0], end: [1, 0]},
          {type: Tree.LINE, start: [1, 0], end: [1, 1]},
          {type: Tree.LINE, start: [1, 1], end: [0, 0]},
        ],
      },
    ])
  })

  it('should plot a region in between plotting paths', () => {
    const tool: Tool = {shape: {type: Parser.CIRCLE, diameter: 2}}

    const location0 = {
      startPoint: {x: -10, y: -10},
      endPoint: {x: -5, y: -5},
    } as Location

    const location4 = {
      startPoint: {x: 5, y: 5},
      endPoint: {x: 10, y: 10},
    } as Location

    const results = subject(
      [
        {type: Parser.GRAPHIC, graphic: Parser.SEGMENT, coordinates: {}},
        tool,
        location0,
      ],
      [{type: Parser.REGION_MODE, region: true}],
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
      [
        {type: Parser.GRAPHIC, graphic: Parser.SEGMENT, coordinates: {}},
        tool,
        location3,
      ],
      [{type: Parser.REGION_MODE, region: false}],
      [
        {type: Parser.GRAPHIC, graphic: Parser.SEGMENT, coordinates: {}},
        tool,
        location4,
      ],
      [{type: Parser.DONE}]
    )

    expect(results).to.eql([
      {
        type: Tree.IMAGE_PATH,
        width: 2,
        segments: [{type: Tree.LINE, start: [-10, -10], end: [-5, -5]}],
      },
      {
        type: Tree.IMAGE_REGION,
        segments: [
          {type: Tree.LINE, start: [0, 0], end: [1, 0]},
          {type: Tree.LINE, start: [1, 0], end: [1, 1]},
          {type: Tree.LINE, start: [1, 1], end: [0, 0]},
        ],
      },
      {
        type: Tree.IMAGE_PATH,
        width: 2,
        segments: [{type: Tree.LINE, start: [5, 5], end: [10, 10]}],
      },
    ])
  })

  it('should plot multiple regions upon move node', () => {
    const results = subject(
      [{type: Parser.REGION_MODE, region: true}],
      [
        {type: Parser.GRAPHIC, graphic: Parser.SEGMENT, coordinates: {}},
        undefined,
        location1,
      ],
      [
        {type: Parser.GRAPHIC, graphic: Parser.SEGMENT, coordinates: {}},
        undefined,
        location2,
      ],
      [
        {type: Parser.GRAPHIC, graphic: Parser.SEGMENT, coordinates: {}},
        undefined,
        location3,
      ],
      [{type: Parser.GRAPHIC, graphic: Parser.MOVE, coordinates: {}}],
      [
        {type: Parser.GRAPHIC, graphic: Parser.SEGMENT, coordinates: {}},
        undefined,
        location1,
      ],
      [
        {type: Parser.GRAPHIC, graphic: Parser.SEGMENT, coordinates: {}},
        undefined,
        location2,
      ],
      [
        {type: Parser.GRAPHIC, graphic: Parser.SEGMENT, coordinates: {}},
        undefined,
        location3,
      ],
      [{type: Parser.DONE}]
    )

    expect(results).to.eql([
      {
        type: Tree.IMAGE_REGION,
        segments: [
          {type: Tree.LINE, start: [0, 0], end: [1, 0]},
          {type: Tree.LINE, start: [1, 0], end: [1, 1]},
          {type: Tree.LINE, start: [1, 1], end: [0, 0]},
        ],
      },
      {
        type: Tree.IMAGE_REGION,
        segments: [
          {type: Tree.LINE, start: [0, 0], end: [1, 0]},
          {type: Tree.LINE, start: [1, 0], end: [1, 1]},
          {type: Tree.LINE, start: [1, 1], end: [0, 0]},
        ],
      },
    ])
  })
})
