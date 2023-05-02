// Tests for plotting simple shapes using the GraphicPlotter interface
import {describe, it, beforeEach, expect} from 'vitest'

import * as Parser from '@tracespace/parser'

import * as Tree from '../../tree'
import type {Tool} from '../../tool-store'
import {SIMPLE_TOOL} from '../../tool-store'
import type {Location} from '../../location-store'
import {HALF_PI, PI, THREE_HALF_PI, TWO_PI} from '../../coordinate-math'
import type {GraphicPlotter} from '..'
import {createGraphicPlotter} from '..'

describe('plot shape graphics', () => {
  let subject: GraphicPlotter
  let node: Parser.Graphic

  beforeEach(() => {
    subject = createGraphicPlotter(Parser.GERBER)
    node = {type: Parser.GRAPHIC, graphic: Parser.SHAPE, coordinates: {}}
  })

  it('should plot a circle', () => {
    const tool: Tool = {
      type: SIMPLE_TOOL,
      dcode: '1',
      shape: {type: Parser.CIRCLE, diameter: 2},
      hole: undefined,
    }
    const location = {endPoint: {x: 3, y: 4}} as Location

    const results = subject.plot(node, tool, location)

    expect(results).to.eql([
      {
        type: Tree.IMAGE_SHAPE,
        polarity: Parser.DARK,
        dcode: '1',
        shape: {type: Tree.CIRCLE, cx: 3, cy: 4, r: 1},
      },
    ])
  })

  it('should plot a rectangle', () => {
    const tool: Tool = {
      type: SIMPLE_TOOL,
      dcode: '1',
      shape: {type: Parser.RECTANGLE, xSize: 6, ySize: 7},
      hole: undefined,
    }
    const location = {endPoint: {x: 2, y: -1}} as Location

    const results = subject.plot(node, tool, location)

    expect(results).to.eql([
      {
        type: Tree.IMAGE_SHAPE,
        polarity: Parser.DARK,
        dcode: '1',
        shape: {type: Tree.RECTANGLE, x: -1, y: -4.5, xSize: 6, ySize: 7},
      },
    ])
  })

  it('should plot an obround tool in portrait', () => {
    const tool: Tool = {
      type: SIMPLE_TOOL,
      dcode: '1',
      shape: {type: Parser.OBROUND, xSize: 6, ySize: 8},
      hole: undefined,
    }
    const location = {endPoint: {x: 1, y: 2}} as Location

    const results = subject.plot(node, tool, location)

    expect(results).to.eql([
      {
        type: Tree.IMAGE_SHAPE,
        polarity: Parser.DARK,
        dcode: '1',
        shape: {type: Tree.RECTANGLE, x: -2, y: -2, xSize: 6, ySize: 8, r: 3},
      },
    ])
  })

  it('should plot an obround tool in landscape', () => {
    const tool: Tool = {
      type: SIMPLE_TOOL,
      dcode: '1',
      shape: {type: Parser.OBROUND, xSize: 8, ySize: 6},
      hole: undefined,
    }
    const location = {endPoint: {x: 1, y: 2}} as Location

    const results = subject.plot(node, tool, location)

    expect(results).to.eql([
      {
        type: Tree.IMAGE_SHAPE,
        polarity: Parser.DARK,
        dcode: '1',
        shape: {type: Tree.RECTANGLE, x: -3, y: -1, xSize: 8, ySize: 6, r: 3},
      },
    ])
  })

  it('should plot a polygon', () => {
    const tool: Tool = {
      type: SIMPLE_TOOL,
      dcode: '1',
      shape: {
        type: Parser.POLYGON,
        diameter: 16,
        vertices: 4,
        rotation: undefined,
      },
      hole: undefined,
    }
    const location = {endPoint: {x: 2, y: 2}} as Location

    const results = subject.plot(node, tool, location)

    expect(results).toEqual([
      {
        type: Tree.IMAGE_SHAPE,
        polarity: Parser.DARK,
        dcode: '1',
        shape: {
          type: Tree.POLYGON,
          points: [
            [expect.approx(10), expect.approx(2)],
            [expect.approx(2), expect.approx(10)],
            [expect.approx(-6), expect.approx(2)],
            [expect.approx(2), expect.approx(-6)],
          ],
        },
      },
    ])
  })

  describe('with circle holes', () => {
    it('should plot a circle', () => {
      const tool: Tool = {
        type: SIMPLE_TOOL,
        dcode: '1',
        shape: {type: Parser.CIRCLE, diameter: 2},
        hole: {type: Parser.CIRCLE, diameter: 1},
      }
      const location = {endPoint: {x: 3, y: 4}} as Location

      const results = subject.plot(node, tool, location)

      expect(results).to.eql([
        {
          type: Tree.IMAGE_SHAPE,
          polarity: Parser.DARK,
          dcode: '1',
          shape: {
            type: Tree.OUTLINE,
            segments: [
              {
                type: Tree.ARC,
                center: [3, 4],
                start: [4, 4, 0],
                end: [4, 4, TWO_PI],
                radius: 1,
              },
              {
                type: Tree.ARC,
                center: [3, 4],
                start: [3.5, 4, 0],
                end: [3.5, 4, TWO_PI],
                radius: 0.5,
              },
            ],
          },
        },
      ])
    })

    it('should plot a rectangle', () => {
      const tool: Tool = {
        type: SIMPLE_TOOL,
        dcode: '1',
        shape: {type: Parser.RECTANGLE, xSize: 6, ySize: 7},
        hole: {type: Parser.CIRCLE, diameter: 1},
      }
      const location = {endPoint: {x: 2, y: -1}} as Location

      const results = subject.plot(node, tool, location)

      expect(results).to.eql([
        {
          type: Tree.IMAGE_SHAPE,
          polarity: Parser.DARK,
          dcode: '1',
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
                end: [2.5, -1, TWO_PI],
                radius: 0.5,
              },
            ],
          },
        },
      ])
    })

    it('should plot an obround tool in portrait', () => {
      const tool: Tool = {
        type: SIMPLE_TOOL,
        dcode: '1',
        shape: {type: Parser.OBROUND, xSize: 6, ySize: 8},
        hole: {type: Parser.CIRCLE, diameter: 1},
      }
      const location = {endPoint: {x: 1, y: 2}} as Location

      const results = subject.plot(node, tool, location)

      expect(results).to.eql([
        {
          type: Tree.IMAGE_SHAPE,
          polarity: Parser.DARK,
          dcode: '1',
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
              },
              {type: Tree.LINE, start: [-2, 3], end: [-2, 1]},
              {
                type: Tree.ARC,
                center: [1, 1],
                start: [-2, 1, PI],
                end: [4, 1, TWO_PI],
                radius: 3,
              },
              {
                type: Tree.ARC,
                start: [1.5, 2, 0],
                end: [1.5, 2, TWO_PI],
                center: [1, 2],
                radius: 0.5,
              },
            ],
          },
        },
      ])
    })

    it('should plot an obround tool in landscape', () => {
      const tool: Tool = {
        type: SIMPLE_TOOL,
        dcode: '1',
        shape: {type: Parser.OBROUND, xSize: 8, ySize: 6},
        hole: {type: Parser.CIRCLE, diameter: 1},
      }
      const location = {endPoint: {x: 1, y: 2}} as Location

      const results = subject.plot(node, tool, location)

      expect(results).to.eql([
        {
          type: Tree.IMAGE_SHAPE,
          polarity: Parser.DARK,
          dcode: '1',
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
              },
              {type: Tree.LINE, start: [2, 5], end: [0, 5]},
              {
                type: Tree.ARC,
                center: [0, 2],
                start: [0, 5, HALF_PI],
                end: [0, -1, THREE_HALF_PI],
                radius: 3,
              },
              {
                type: Tree.ARC,
                start: [1.5, 2, 0],
                end: [1.5, 2, TWO_PI],
                center: [1, 2],
                radius: 0.5,
              },
            ],
          },
        },
      ])
    })

    it('should plot a polygon', () => {
      const tool: Tool = {
        type: SIMPLE_TOOL,
        dcode: '1',
        shape: {
          type: Parser.POLYGON,
          diameter: 16,
          vertices: 4,
          rotation: undefined,
        },
        hole: {type: Parser.CIRCLE, diameter: 1},
      }
      const location = {endPoint: {x: 2, y: 2}} as Location

      const results = subject.plot(node, tool, location)

      expect(results).toEqual([
        {
          type: Tree.IMAGE_SHAPE,
          polarity: Parser.DARK,
          dcode: '1',
          shape: {
            type: Tree.OUTLINE,
            segments: [
              {
                type: Tree.LINE,
                start: [expect.approx(10), expect.approx(2)],
                end: [expect.approx(2), expect.approx(10)],
              },
              {
                type: Tree.LINE,
                start: [expect.approx(2), expect.approx(10)],
                end: [expect.approx(-6), expect.approx(2)],
              },
              {
                type: Tree.LINE,
                start: [expect.approx(-6), expect.approx(2)],
                end: [expect.approx(2), expect.approx(-6)],
              },
              {
                type: Tree.LINE,
                start: [expect.approx(2), expect.approx(-6)],
                end: [expect.approx(10), expect.approx(2)],
              },
              {
                type: Tree.ARC,
                start: [2.5, 2, 0],
                end: [2.5, 2, TWO_PI],
                center: [2, 2],
                radius: 0.5,
              },
            ],
          },
        },
      ])
    })
  })

  describe('with rectangle holes', () => {
    it('should plot a circle', () => {
      const tool: Tool = {
        type: SIMPLE_TOOL,
        dcode: '1',
        shape: {type: Parser.CIRCLE, diameter: 2},
        hole: {type: Parser.RECTANGLE, xSize: 1, ySize: 1},
      }
      const location = {endPoint: {x: 3, y: 4}} as Location

      const results = subject.plot(node, tool, location) as Tree.ImageShape[]
      const resultShape = results[0].shape as Tree.OutlineShape

      expect(resultShape.segments.slice(-4)).to.eql([
        {
          type: Tree.LINE,
          start: [2.5, 3.5],
          end: [3.5, 3.5],
        },
        {
          type: Tree.LINE,
          start: [3.5, 3.5],
          end: [3.5, 4.5],
        },
        {
          type: Tree.LINE,
          start: [3.5, 4.5],
          end: [2.5, 4.5],
        },
        {
          type: Tree.LINE,
          start: [2.5, 4.5],
          end: [2.5, 3.5],
        },
      ])
    })

    it('should plot a rectangle', () => {
      const tool: Tool = {
        type: SIMPLE_TOOL,
        dcode: '1',
        shape: {type: Parser.RECTANGLE, xSize: 6, ySize: 7},
        hole: {type: Parser.RECTANGLE, xSize: 1, ySize: 1},
      }
      const location = {endPoint: {x: 2, y: -1}} as Location

      const results = subject.plot(node, tool, location) as Tree.ImageShape[]
      const resultShape = results[0].shape as Tree.OutlineShape

      expect(resultShape.segments.slice(-4)).to.eql([
        {
          type: Tree.LINE,
          start: [1.5, -1.5],
          end: [2.5, -1.5],
        },
        {
          type: Tree.LINE,
          start: [2.5, -1.5],
          end: [2.5, -0.5],
        },
        {
          type: Tree.LINE,
          start: [2.5, -0.5],
          end: [1.5, -0.5],
        },
        {
          type: Tree.LINE,
          start: [1.5, -0.5],
          end: [1.5, -1.5],
        },
      ])
    })

    it('should plot an obround tool in portrait', () => {
      const tool: Tool = {
        type: SIMPLE_TOOL,
        dcode: '1',
        shape: {type: Parser.OBROUND, xSize: 6, ySize: 8},
        hole: {type: Parser.RECTANGLE, xSize: 1, ySize: 1},
      }
      const location = {endPoint: {x: 1, y: 2}} as Location

      const results = subject.plot(node, tool, location) as Tree.ImageShape[]
      const resultShape = results[0].shape as Tree.OutlineShape

      expect(resultShape.segments.slice(-4)).to.eql([
        {
          type: Tree.LINE,
          start: [0.5, 1.5],
          end: [1.5, 1.5],
        },
        {
          type: Tree.LINE,
          start: [1.5, 1.5],
          end: [1.5, 2.5],
        },
        {
          type: Tree.LINE,
          start: [1.5, 2.5],
          end: [0.5, 2.5],
        },
        {
          type: Tree.LINE,
          start: [0.5, 2.5],
          end: [0.5, 1.5],
        },
      ])
    })

    it('should plot an obround tool in landscape', () => {
      const tool: Tool = {
        type: SIMPLE_TOOL,
        dcode: '1',
        shape: {type: Parser.OBROUND, xSize: 8, ySize: 6},
        hole: {type: Parser.RECTANGLE, xSize: 1, ySize: 1},
      }
      const location = {endPoint: {x: 1, y: 2}} as Location

      const results = subject.plot(node, tool, location) as Tree.ImageShape[]
      const resultShape = results[0].shape as Tree.OutlineShape

      expect(resultShape.segments.slice(-4)).to.eql([
        {
          type: Tree.LINE,
          start: [0.5, 1.5],
          end: [1.5, 1.5],
        },
        {
          type: Tree.LINE,
          start: [1.5, 1.5],
          end: [1.5, 2.5],
        },
        {
          type: Tree.LINE,
          start: [1.5, 2.5],
          end: [0.5, 2.5],
        },
        {
          type: Tree.LINE,
          start: [0.5, 2.5],
          end: [0.5, 1.5],
        },
      ])
    })

    it('should plot a polygon', () => {
      const tool: Tool = {
        type: SIMPLE_TOOL,
        dcode: '1',
        shape: {
          type: Parser.POLYGON,
          diameter: 16,
          vertices: 4,
          rotation: undefined,
        },
        hole: {type: Parser.RECTANGLE, xSize: 1, ySize: 1},
      }
      const location = {endPoint: {x: 2, y: 2}} as Location

      const results = subject.plot(node, tool, location) as Tree.ImageShape[]
      const resultShape = results[0].shape as Tree.OutlineShape

      expect(resultShape.segments.slice(-4)).to.eql([
        {
          type: Tree.LINE,
          start: [1.5, 1.5],
          end: [2.5, 1.5],
        },
        {
          type: Tree.LINE,
          start: [2.5, 1.5],
          end: [2.5, 2.5],
        },
        {
          type: Tree.LINE,
          start: [2.5, 2.5],
          end: [1.5, 2.5],
        },
        {
          type: Tree.LINE,
          start: [1.5, 2.5],
          end: [1.5, 1.5],
        },
      ])
    })
  })
})
