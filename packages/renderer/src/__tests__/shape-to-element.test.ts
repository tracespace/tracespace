import {describe, it, expect} from 'vitest'

import * as Plotter from '@tracespace/plotter'
import {shapeToElement as mapShapeToElement} from '../render'

describe('mapping a shape to an element', () => {
  it('should map a circle', () => {
    const shape: Plotter.Shape = {type: Plotter.CIRCLE, cx: 1, cy: 2, r: 3}
    const result = mapShapeToElement(shape)

    expect(result).to.deep.include({
      tagName: 'circle',
      properties: {cx: 1, cy: -2, r: 3},
      children: [],
    })
  })

  it('should map a rectangle', () => {
    const shape: Plotter.Shape = {
      type: Plotter.RECTANGLE,
      x: 1,
      y: 2,
      xSize: 3,
      ySize: 4,
    }
    const result = mapShapeToElement(shape)

    expect(result).to.deep.include({
      tagName: 'rect',
      properties: {x: 1, y: -6, width: 3, height: 4},
      children: [],
    })
  })

  it('should map a rectangle with radius', () => {
    const shape: Plotter.Shape = {
      type: Plotter.RECTANGLE,
      x: 1,
      y: 2,
      xSize: 3,
      ySize: 4,
      r: 0.25,
    }
    const result = mapShapeToElement(shape)

    expect(result).to.deep.include({
      tagName: 'rect',
      properties: {x: 1, y: -6, width: 3, height: 4, rx: 0.25, ry: 0.25},
      children: [],
    })
  })

  it('should map a polygon', () => {
    const shape: Plotter.Shape = {
      type: Plotter.POLYGON,
      points: [
        [1, 1],
        [2, 1],
        [2, 2],
        [1, 2],
      ],
    }
    const result = mapShapeToElement(shape)

    expect(result).to.deep.include({
      tagName: 'polygon',
      properties: {points: '1,-1 2,-1 2,-2 1,-2'},
      children: [],
    })
  })

  describe('outline shapes', () => {
    it('should map contiguous line segments', () => {
      const shape: Plotter.Shape = {
        type: Plotter.OUTLINE,
        segments: [
          {type: Plotter.LINE, start: [0, 0], end: [1, 1]},
          {type: Plotter.LINE, start: [1, 1], end: [2, 2]},
        ],
      }
      const result = mapShapeToElement(shape)

      expect(result).to.deep.include({
        tagName: 'path',
        properties: {d: 'M0 0L1 -1L2 -2'},
        children: [],
      })
    })

    it('should map non-contiguous line segments', () => {
      const shape: Plotter.Shape = {
        type: Plotter.OUTLINE,
        segments: [
          {type: Plotter.LINE, start: [1, 2], end: [3, 4]},
          {type: Plotter.LINE, start: [5, 6], end: [7, 8]},
        ],
      }
      const result = mapShapeToElement(shape)

      expect(result).to.deep.include({
        tagName: 'path',
        properties: {d: 'M1 -2L3 -4M5 -6L7 -8'},
        children: [],
      })
    })

    it('should map contiguous arc segments', () => {
      const shape: Plotter.Shape = {
        type: Plotter.OUTLINE,
        segments: [
          {
            type: Plotter.ARC,
            start: [0, 0, 3.141_592_653_6],
            end: [0.25, 0.25, 1.570_796_326_8],
            center: [0.25, 0],
            radius: 0.25,
          },
          {
            type: Plotter.ARC,
            start: [0.25, 0.25, -1.570_796_326_8],
            end: [0.5, 0.5, 0],
            center: [0.25, 0.5],
            radius: 0.25,
          },
          {
            type: Plotter.ARC,
            start: [0.5, 0.5, 3.141_592_653_6],
            end: [0.75, 0.25, -1.570_796_326_8],
            center: [0.75, 0.5],
            radius: 0.25,
          },
          {
            type: Plotter.ARC,
            start: [0.75, 0.25, 1.570_796_326_8],
            end: [1, 0, 6.283_185_307_2],
            center: [0.75, 0],
            radius: 0.25,
          },
        ],
      }
      const result = mapShapeToElement(shape)

      // Circular arc: `A ${r} ${r} 0 ${large_arc} ${sweep} ${x} ${y}`
      expect(result).to.deep.include({
        tagName: 'path',
        properties: {
          d: [
            'M0 0',
            'A0.25 0.25 0 0 1 0.25 -0.25',
            'A0.25 0.25 0 0 0 0.5 -0.5',
            'A0.25 0.25 0 1 1 0.75 -0.25',
            'A0.25 0.25 0 1 0 1 0',
          ].join(''),
        },
        children: [],
      })
    })
  })
})
