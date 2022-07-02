// Tests for plotting simple shapes using the GraphicPlotter interface
import {describe, it, beforeEach, expect} from 'vitest'

import * as Parser from '@tracespace/parser'

import * as Tree from '../../tree'
import {Tool} from '../../tool-store'
import {Location} from '../../location-store'
import {GraphicPlotter, createGraphicPlotter} from '../plot-graphic'

describe('plot shape graphics', () => {
  let subject: GraphicPlotter
  let node: Parser.Graphic

  beforeEach(() => {
    subject = createGraphicPlotter()
    node = {type: Parser.GRAPHIC, graphic: Parser.SHAPE, coordinates: {}}
  })

  it('should plot a circle', () => {
    const tool: Tool = {shape: {type: Parser.CIRCLE, diameter: 2}}
    const location = {endPoint: {x: 3, y: 4}} as Location

    const result = subject.plot(node, tool, location)

    expect(result).to.eql({
      type: Tree.IMAGE_SHAPE,
      shape: {type: Tree.CIRCLE, cx: 3, cy: 4, r: 1},
    })
  })

  it('should plot a rectangle', () => {
    const tool: Tool = {
      shape: {type: Parser.RECTANGLE, xSize: 6, ySize: 7},
    }
    const location = {endPoint: {x: 2, y: -1}} as Location

    const result = subject.plot(node, tool, location)

    expect(result).to.eql({
      type: Tree.IMAGE_SHAPE,
      shape: {type: Tree.RECTANGLE, x: -1, y: -4.5, xSize: 6, ySize: 7},
    })
  })

  it('should plot an obround tool in portrait', () => {
    const tool: Tool = {shape: {type: Parser.OBROUND, xSize: 6, ySize: 8}}
    const location = {endPoint: {x: 1, y: 2}} as Location

    const result = subject.plot(node, tool, location)

    expect(result).to.eql({
      type: Tree.IMAGE_SHAPE,
      shape: {type: Tree.RECTANGLE, x: -2, y: -2, xSize: 6, ySize: 8, r: 3},
    })
  })

  it('should plot an obround tool in landscape', () => {
    const tool: Tool = {shape: {type: Parser.OBROUND, xSize: 8, ySize: 6}}
    const location = {endPoint: {x: 1, y: 2}} as Location

    const result = subject.plot(node, tool, location)

    expect(result).to.eql({
      type: Tree.IMAGE_SHAPE,
      shape: {type: Tree.RECTANGLE, x: -3, y: -1, xSize: 8, ySize: 6, r: 3},
    })
  })

  it('should plot a polygon', () => {
    const tool: Tool = {
      shape: {type: Parser.POLYGON, diameter: 16, vertices: 4, rotation: null},
    }
    const location = {endPoint: {x: 2, y: 2}} as Location

    const result = subject.plot(node, tool, location)

    expect(result).to.eql({
      type: Tree.IMAGE_SHAPE,
      shape: {
        type: Tree.POLYGON,
        points: [
          [10, 2],
          [2, 10],
          [-6, 2],
          [2, -6],
        ],
      },
    })
  })
})
