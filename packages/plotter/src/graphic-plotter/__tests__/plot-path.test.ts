import {describe, it, beforeEach, expect} from 'vitest'

import * as Parser from '@tracespace/parser'

import * as Tree from '../../tree'
import {Tool} from '../../tool-store'
import {Location} from '../../location-store'
import {GraphicPlotter, createGraphicPlotter} from '..'

describe('plot stroke paths', () => {
  let subject: GraphicPlotter
  let tool: Tool

  beforeEach(() => {
    tool = {shape: {type: Parser.CIRCLE, diameter: 2}}
    subject = createGraphicPlotter()
  })

  it('should not plot anything if no path', () => {
    const location = {
      startPoint: {x: 3, y: 4},
      endPoint: {x: 5, y: 6},
    } as Location

    const result = subject.plot({type: Parser.DONE}, tool, location)
    expect(result).to.equal(undefined)
  })

  it('should plot a line segment', () => {
    const location = {
      startPoint: {x: 3, y: 4},
      endPoint: {x: 5, y: 6},
    } as Location

    subject.plot(
      {type: Parser.GRAPHIC, graphic: Parser.SEGMENT, coordinates: {}},
      tool,
      location
    )
    const result = subject.plot({type: Parser.DONE}, tool, location)

    expect(result).to.eql({
      type: Tree.IMAGE_PATH,
      width: 2,
      segments: [{type: Tree.LINE, start: [3, 4], end: [5, 6]}],
    })
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

    subject.plot(
      {type: Parser.GRAPHIC, graphic: Parser.SEGMENT, coordinates: {}},
      tool,
      location1
    )
    subject.plot(
      {type: Parser.GRAPHIC, graphic: Parser.SEGMENT, coordinates: {}},
      tool,
      location2
    )
    const result = subject.plot({type: Parser.DONE}, tool, location2)

    expect(result).to.eql({
      type: Tree.IMAGE_PATH,
      width: 2,
      segments: [
        {type: Tree.LINE, start: [3, 4], end: [5, 6]},
        {type: Tree.LINE, start: [7, 8], end: [9, 10]},
      ],
    })
  })

  it('should plot several line segments with several tools', () => {
    const tool1: Tool = {shape: {type: Parser.CIRCLE, diameter: 1}}
    const location1 = {
      startPoint: {x: 3, y: 4},
      endPoint: {x: 5, y: 6},
    } as Location

    const tool2: Tool = {shape: {type: Parser.CIRCLE, diameter: 2}}
    const location2 = {
      startPoint: {x: 7, y: 8},
      endPoint: {x: 9, y: 10},
    } as Location

    subject.plot(
      {type: Parser.GRAPHIC, graphic: Parser.SEGMENT, coordinates: {}},
      tool1,
      location1
    )
    const result1 = subject.plot(
      {type: Parser.TOOL_CHANGE, code: '123'},
      tool2,
      location1
    )
    subject.plot(
      {type: Parser.GRAPHIC, graphic: Parser.SEGMENT, coordinates: {}},
      tool2,
      location2
    )
    const result2 = subject.plot(
      {type: Parser.TOOL_CHANGE, code: '456'},
      tool1,
      location2
    )

    expect(result1).to.eql({
      type: Tree.IMAGE_PATH,
      width: 1,
      segments: [{type: Tree.LINE, start: [3, 4], end: [5, 6]}],
    })
    expect(result2).to.eql({
      type: Tree.IMAGE_PATH,
      width: 2,
      segments: [{type: Tree.LINE, start: [7, 8], end: [9, 10]}],
    })
  })
})
