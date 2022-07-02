// Tests for plotting simple shapes using the GraphicPlotter interface
import {describe, it, beforeEach, expect} from 'vitest'

import * as Parser from '@tracespace/parser'

import * as Tree from '../../tree'
import {Tool} from '../../tool-store'
import {Location} from '../../location-store'
import {HALF_PI, PI, THREE_HALF_PI, TWO_PI} from '../math'
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

  describe('with circle holes', () => {
    it('should plot a circle', () => {
      const tool: Tool = {
        shape: {type: Parser.CIRCLE, diameter: 2},
        hole: {type: Parser.CIRCLE, diameter: 1},
      }
      const location = {endPoint: {x: 3, y: 4}} as Location

      const result = subject.plot(node, tool, location)

      expect(result).to.eql({
        type: Tree.IMAGE_SHAPE,
        shape: {
          type: Tree.OUTLINE,
          segments: [
            {
              type: Tree.ARC,
              center: [3, 4],
              start: [4, 4, 0],
              end: [4, 4, 0],
              radius: 1,
              sweep: TWO_PI,
              direction: Tree.CCW,
            },
            {
              type: Tree.ARC,
              center: [3, 4],
              start: [3.5, 4, 0],
              end: [3.5, 4, 0],
              radius: 0.5,
              sweep: TWO_PI,
              direction: Tree.CCW,
            },
          ],
        },
      })
    })

    it('should plot a rectangle', () => {
      const tool: Tool = {
        shape: {type: Parser.RECTANGLE, xSize: 6, ySize: 7},
        hole: {type: Parser.CIRCLE, diameter: 1},
      }
      const location = {endPoint: {x: 2, y: -1}} as Location

      const result = subject.plot(node, tool, location)

      expect(result).to.eql({
        type: Tree.IMAGE_SHAPE,
        shape: {
          type: Tree.OUTLINE,
          segments: [
            {type: Tree.LINE, start: [-1, -4.5], end: [5, -4.5]},
            {type: Tree.LINE, start: [5, -4.5], end: [5, 2.5]},
            {type: Tree.LINE, start: [5, 2.5], end: [-1, 2.5]},
            {type: Tree.LINE, start: [-1, 2.5], end: [-1, -4.5]},
            {
              type: Tree.ARC,
              center: [2, -1],
              start: [2.5, -1, 0],
              end: [2.5, -1, 0],
              radius: 0.5,
              sweep: TWO_PI,
              direction: Tree.CCW,
            },
          ],
        },
      })
    })

    it('should plot an obround tool in portrait', () => {
      const tool: Tool = {
        shape: {type: Parser.OBROUND, xSize: 6, ySize: 8},
        hole: {type: Parser.CIRCLE, diameter: 1},
      }
      const location = {endPoint: {x: 1, y: 2}} as Location

      const result = subject.plot(node, tool, location)

      expect(result).to.eql({
        type: Tree.IMAGE_SHAPE,
        shape: {
          type: Tree.OUTLINE,
          segments: [
            {type: Tree.LINE, start: [4, 1], end: [4, 3]},
            {
              type: Tree.ARC,
              center: [1, 3],
              start: [4, 3, 0],
              end: [-2, 3, PI],
              radius: 3,
              sweep: PI,
              direction: Tree.CCW,
            },
            {type: Tree.LINE, start: [-2, 3], end: [-2, 1]},
            {
              type: Tree.ARC,
              center: [1, 1],
              start: [-2, 1, PI],
              end: [4, 1, TWO_PI],
              radius: 3,
              sweep: PI,
              direction: Tree.CCW,
            },
            {
              type: Tree.ARC,
              start: [1.5, 2, 0],
              end: [1.5, 2, 0],
              center: [1, 2],
              radius: 0.5,
              sweep: TWO_PI,
              direction: Tree.CCW,
            },
          ],
        },
      })
    })

    it('should plot an obround tool in landscape', () => {
      const tool: Tool = {
        shape: {type: Parser.OBROUND, xSize: 8, ySize: 6},
        hole: {type: Parser.CIRCLE, diameter: 1},
      }
      const location = {endPoint: {x: 1, y: 2}} as Location

      const result = subject.plot(node, tool, location)

      expect(result).to.eql({
        type: Tree.IMAGE_SHAPE,
        shape: {
          type: Tree.OUTLINE,
          segments: [
            {type: Tree.LINE, start: [0, -1], end: [2, -1]},
            {
              type: Tree.ARC,
              center: [2, 2],
              start: [2, -1, -HALF_PI],
              end: [2, 5, HALF_PI],
              radius: 3,
              sweep: PI,
              direction: Tree.CCW,
            },
            {type: Tree.LINE, start: [2, 5], end: [0, 5]},
            {
              type: Tree.ARC,
              center: [0, 2],
              start: [0, 5, HALF_PI],
              end: [0, -1, THREE_HALF_PI],
              radius: 3,
              sweep: PI,
              direction: Tree.CCW,
            },
            {
              type: Tree.ARC,
              start: [1.5, 2, 0],
              end: [1.5, 2, 0],
              center: [1, 2],
              radius: 0.5,
              sweep: TWO_PI,
              direction: Tree.CCW,
            },
          ],
        },
      })
    })

    it('should plot a polygon', () => {
      const tool: Tool = {
        shape: {
          type: Parser.POLYGON,
          diameter: 16,
          vertices: 4,
          rotation: null,
        },
        hole: {type: Parser.CIRCLE, diameter: 1},
      }
      const location = {endPoint: {x: 2, y: 2}} as Location

      const result = subject.plot(node, tool, location)

      expect(result).to.eql({
        type: Tree.IMAGE_SHAPE,
        shape: {
          type: Tree.OUTLINE,
          segments: [
            {type: Tree.LINE, start: [10, 2], end: [2, 10]},
            {type: Tree.LINE, start: [2, 10], end: [-6, 2]},
            {type: Tree.LINE, start: [-6, 2], end: [2, -6]},
            {type: Tree.LINE, start: [2, -6], end: [10, 2]},
            {
              type: Tree.ARC,
              start: [2.5, 2, 0],
              end: [2.5, 2, 0],
              center: [2, 2],
              radius: 0.5,
              sweep: TWO_PI,
              direction: Tree.CCW,
            },
          ],
        },
      })
    })
  })

  describe('with rectangle holes', () => {
    it('should plot a circle', () => {
      const tool: Tool = {
        shape: {type: Parser.CIRCLE, diameter: 2},
        hole: {type: Parser.RECTANGLE, xSize: 1, ySize: 1},
      }
      const location = {endPoint: {x: 3, y: 4}} as Location

      const result = subject.plot(node, tool, location)

      expect((result.shape as Tree.OutlineShape).segments.slice(-4)).to.eql([
        {type: Tree.LINE, start: [2.5, 3.5], end: [3.5, 3.5]},
        {type: Tree.LINE, start: [3.5, 3.5], end: [3.5, 4.5]},
        {type: Tree.LINE, start: [3.5, 4.5], end: [2.5, 4.5]},
        {type: Tree.LINE, start: [2.5, 4.5], end: [2.5, 3.5]},
      ])
    })

    it('should plot a rectangle', () => {
      const tool: Tool = {
        shape: {type: Parser.RECTANGLE, xSize: 6, ySize: 7},
        hole: {type: Parser.RECTANGLE, xSize: 1, ySize: 1},
      }
      const location = {endPoint: {x: 2, y: -1}} as Location

      const result = subject.plot(node, tool, location)

      expect((result.shape as Tree.OutlineShape).segments.slice(-4)).to.eql([
        {type: Tree.LINE, start: [1.5, -1.5], end: [2.5, -1.5]},
        {type: Tree.LINE, start: [2.5, -1.5], end: [2.5, -0.5]},
        {type: Tree.LINE, start: [2.5, -0.5], end: [1.5, -0.5]},
        {type: Tree.LINE, start: [1.5, -0.5], end: [1.5, -1.5]},
      ])
    })

    it('should plot an obround tool in portrait', () => {
      const tool: Tool = {
        shape: {type: Parser.OBROUND, xSize: 6, ySize: 8},
        hole: {type: Parser.RECTANGLE, xSize: 1, ySize: 1},
      }
      const location = {endPoint: {x: 1, y: 2}} as Location

      const result = subject.plot(node, tool, location)

      expect((result.shape as Tree.OutlineShape).segments.slice(-4)).to.eql([
        {type: Tree.LINE, start: [0.5, 1.5], end: [1.5, 1.5]},
        {type: Tree.LINE, start: [1.5, 1.5], end: [1.5, 2.5]},
        {type: Tree.LINE, start: [1.5, 2.5], end: [0.5, 2.5]},
        {type: Tree.LINE, start: [0.5, 2.5], end: [0.5, 1.5]},
      ])
    })

    it('should plot an obround tool in landscape', () => {
      const tool: Tool = {
        shape: {type: Parser.OBROUND, xSize: 8, ySize: 6},
        hole: {type: Parser.RECTANGLE, xSize: 1, ySize: 1},
      }
      const location = {endPoint: {x: 1, y: 2}} as Location

      const result = subject.plot(node, tool, location)

      expect((result.shape as Tree.OutlineShape).segments.slice(-4)).to.eql([
        {type: Tree.LINE, start: [0.5, 1.5], end: [1.5, 1.5]},
        {type: Tree.LINE, start: [1.5, 1.5], end: [1.5, 2.5]},
        {type: Tree.LINE, start: [1.5, 2.5], end: [0.5, 2.5]},
        {type: Tree.LINE, start: [0.5, 2.5], end: [0.5, 1.5]},
      ])
    })

    it('should plot a polygon', () => {
      const tool: Tool = {
        shape: {
          type: Parser.POLYGON,
          diameter: 16,
          vertices: 4,
          rotation: null,
        },
        hole: {type: Parser.RECTANGLE, xSize: 1, ySize: 1},
      }
      const location = {endPoint: {x: 2, y: 2}} as Location

      const result = subject.plot(node, tool, location)

      expect((result.shape as Tree.OutlineShape).segments.slice(-4)).to.eql([
        {type: Tree.LINE, start: [1.5, 1.5], end: [2.5, 1.5]},
        {type: Tree.LINE, start: [2.5, 1.5], end: [2.5, 2.5]},
        {type: Tree.LINE, start: [2.5, 2.5], end: [1.5, 2.5]},
        {type: Tree.LINE, start: [1.5, 2.5], end: [1.5, 1.5]},
      ])
    })
  })
})
