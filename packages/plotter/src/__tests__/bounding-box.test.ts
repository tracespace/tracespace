// Tests for the bounding box module
import {describe, it, expect} from 'vitest'

import * as Tree from '../tree'
import * as subject from '../bounding-box'
import {PI} from '../coordinate-math'

import type {Box} from '../bounding-box'

describe('bounding box calculations', () => {
  it('should return an empty bounding box', () => {
    const result = subject.empty()
    expect(result).to.eql([])
  })

  it('should add boxes', () => {
    const box1: Box = [1, 2, 3, 4]
    const box2: Box = [5, 6, 7, 8]

    expect(subject.add(box1, box2)).to.eql([1, 2, 7, 8])
    expect(subject.add(box2, box1)).to.eql([1, 2, 7, 8])
  })

  it('should add empty boxes', () => {
    const empty = subject.empty()
    const notEmpty: Box = [1, 2, 3, 4]

    expect(subject.add(empty, notEmpty)).to.eql(notEmpty)
    expect(subject.add(notEmpty, empty)).to.eql(notEmpty)
  })

  it('should identify empty boxes', () => {
    const empty = subject.empty()
    const notEmpty: Box = [1, 2, 3, 4]

    expect(subject.isEmpty(empty)).to.equal(true)
    expect(subject.isEmpty(notEmpty)).to.equal(false)
  })

  it('should convert into a view box - [xMin, yMin, xSize, ySize]', () => {
    expect(subject.toViewBox(subject.empty())).to.eql([0, 0, 0, 0])
    expect(subject.toViewBox([1, 2, 10, 20])).to.eql([1, 2, 9, 18])
  })

  it('should create from a circle graphic', () => {
    const result = subject.fromGraphic({
      type: Tree.IMAGE_SHAPE,
      shape: {type: Tree.CIRCLE, cx: 1, cy: 2, r: 3},
    })

    expect(result).to.eql([-2, -1, 4, 5])
  })

  it('should create from a rectangle graphic', () => {
    const result = subject.fromGraphic({
      type: Tree.IMAGE_SHAPE,
      shape: {type: Tree.RECTANGLE, x: 1, y: 2, xSize: 3, ySize: 4},
    })

    expect(result).to.eql([1, 2, 4, 6])
  })

  it('should create from a polygon graphic', () => {
    const result = subject.fromGraphic({
      type: Tree.IMAGE_SHAPE,
      shape: {
        type: Tree.POLYGON,
        points: [
          [0, 0],
          [0, 0.5],
          [0.5, 0.5],
          [0, 0],
        ],
      },
    })

    expect(result).to.eql([0, 0, 0.5, 0.5])
  })

  it('should create an empty box for an empty polygon', () => {
    const result = subject.fromGraphic({
      type: Tree.IMAGE_SHAPE,
      shape: {
        type: Tree.POLYGON,
        points: [],
      },
    })

    expect(result).to.eql([])
  })

  it('should create from an outline graphic', () => {
    const result = subject.fromGraphic({
      type: Tree.IMAGE_SHAPE,
      shape: {
        type: Tree.OUTLINE,
        segments: [
          {type: Tree.LINE, start: [9, 8], end: [7, 6]},
          {type: Tree.LINE, start: [1, 2], end: [3, 4]},
        ],
      },
    })

    expect(result).to.eql([1, 2, 9, 8])
  })

  it('should create an empty box for an empty outline', () => {
    const result = subject.fromGraphic({
      type: Tree.IMAGE_SHAPE,
      shape: {
        type: Tree.OUTLINE,
        segments: [],
      },
    })

    expect(result).to.eql([])
  })

  it('should create from a layered shape graphic', () => {
    const result = subject.fromGraphic({
      type: Tree.IMAGE_SHAPE,
      shape: {
        type: Tree.LAYERED_SHAPE,
        shapes: [
          {type: Tree.RECTANGLE, x: 1, y: 2, xSize: 3, ySize: 4},
          {type: Tree.CIRCLE, cx: 1, cy: 2, r: 3},
        ],
      },
    })

    expect(result).to.eql([-2, -1, 4, 6])
  })

  it('should ignore erase items in a layered shape graphic', () => {
    const result = subject.fromGraphic({
      type: Tree.IMAGE_SHAPE,
      shape: {
        type: Tree.LAYERED_SHAPE,
        shapes: [
          {type: Tree.RECTANGLE, x: 1, y: 2, xSize: 3, ySize: 4, erase: false},
          {type: Tree.CIRCLE, cx: 1, cy: 2, r: 3, erase: true},
        ],
      },
    })

    expect(result).to.eql([1, 2, 4, 6])
  })

  it('should return an empty box for empty layered shape', () => {
    const result = subject.fromGraphic({
      type: Tree.IMAGE_SHAPE,
      shape: {
        type: Tree.LAYERED_SHAPE,
        shapes: [],
      },
    })

    expect(result).to.eql([])
  })

  it('should return an empty box for empty path shape', () => {
    const result = subject.fromGraphic({
      type: Tree.IMAGE_PATH,
      width: 1,
      segments: [],
    })

    expect(result).to.eql([])
  })

  describe('paths and outlines', () => {
    const halfSqrtTwo = 2 ** 0.5 / 2

    it('should handle an arc through the positive Y-axis', () => {
      const start: Tree.ArcPosition = [halfSqrtTwo, halfSqrtTwo, PI / 4]
      const end: Tree.ArcPosition = [-halfSqrtTwo, halfSqrtTwo, (3 * PI) / 4]
      const center: Tree.Position = [0, 0]
      const radius = 1
      const expected = [
        -halfSqrtTwo - 0.5,
        halfSqrtTwo - 0.5,
        halfSqrtTwo + 0.5,
        1.5,
      ]

      const ccwResult = subject.fromGraphic({
        type: Tree.IMAGE_PATH,
        width: 1,
        segments: [{type: Tree.ARC, start, end, center, radius}],
      })

      const cwResult = subject.fromGraphic({
        type: Tree.IMAGE_PATH,
        width: 1,
        segments: [{type: Tree.ARC, start: end, end: start, center, radius}],
      })

      expect(ccwResult).to.eql(expected)
      expect(cwResult).to.eql(expected)
    })

    it('should handle a CCW arc through the negative X-axis', () => {
      const start: Tree.ArcPosition = [-halfSqrtTwo, halfSqrtTwo, (3 * PI) / 4]
      const end: Tree.ArcPosition = [-halfSqrtTwo, -halfSqrtTwo, (5 * PI) / 4]
      const center: Tree.Position = [0, 0]
      const radius = 1
      const expected = [
        -1.5,
        -halfSqrtTwo - 0.5,
        -halfSqrtTwo + 0.5,
        halfSqrtTwo + 0.5,
      ]

      const ccwResult = subject.fromGraphic({
        type: Tree.IMAGE_PATH,
        width: 1,
        segments: [{type: Tree.ARC, start, end, center, radius}],
      })

      const cwResult = subject.fromGraphic({
        type: Tree.IMAGE_PATH,
        width: 1,
        segments: [{type: Tree.ARC, start: end, end: start, center, radius}],
      })

      expect(ccwResult).to.eql(expected)
      expect(cwResult).to.eql(expected)
    })

    it('should handle an arc through the negative Y-axis', () => {
      const start: Tree.ArcPosition = [-halfSqrtTwo, -halfSqrtTwo, (5 * PI) / 4]
      const end: Tree.ArcPosition = [halfSqrtTwo, -halfSqrtTwo, (7 * PI) / 4]
      const center: Tree.Position = [0, 0]
      const radius = 1
      const expected = [
        -halfSqrtTwo - 0.5,
        -1.5,
        halfSqrtTwo + 0.5,
        -halfSqrtTwo + 0.5,
      ]

      const ccwResult = subject.fromGraphic({
        type: Tree.IMAGE_PATH,
        width: 1,
        segments: [{type: Tree.ARC, start, end, center, radius}],
      })

      const cwResult = subject.fromGraphic({
        type: Tree.IMAGE_PATH,
        width: 1,
        segments: [{type: Tree.ARC, start: end, end: start, center, radius}],
      })

      expect(ccwResult).to.eql(expected)
      expect(cwResult).to.eql(expected)
    })

    it('should handle an arc through the positive X-axis', () => {
      const start: Tree.ArcPosition = [halfSqrtTwo, -halfSqrtTwo, -PI / 4]
      const end: Tree.ArcPosition = [halfSqrtTwo, halfSqrtTwo, PI / 4]
      const center: Tree.Position = [0, 0]
      const radius = 1
      const expected = [
        halfSqrtTwo - 0.5,
        -halfSqrtTwo - 0.5,
        1.5,
        halfSqrtTwo + 0.5,
      ]

      const ccwResult = subject.fromGraphic({
        type: Tree.IMAGE_PATH,
        width: 1,
        segments: [{type: Tree.ARC, start, end, center, radius}],
      })

      const cwResult = subject.fromGraphic({
        type: Tree.IMAGE_PATH,
        width: 1,
        segments: [{type: Tree.ARC, start: end, end: start, center, radius}],
      })

      expect(ccwResult).to.eql(expected)
      expect(cwResult).to.eql(expected)
    })

    it('should create from an outline graphic with arcs', () => {
      const result = subject.fromGraphic({
        type: Tree.IMAGE_SHAPE,
        shape: {
          type: Tree.OUTLINE,
          segments: [
            {
              type: Tree.ARC,
              start: [1 + halfSqrtTwo, 2 + halfSqrtTwo, PI / 4],
              end: [1 - halfSqrtTwo, 2 + halfSqrtTwo, (3 * PI) / 4],
              center: [1, 2],
              radius: 1,
            },
            {
              type: Tree.ARC,
              start: [1 - halfSqrtTwo, 2 + halfSqrtTwo, (3 * PI) / 4],
              end: [1 - halfSqrtTwo, 2 - halfSqrtTwo, (5 * PI) / 4],
              center: [1, 2],
              radius: 1,
            },
            {
              type: Tree.ARC,
              start: [1 - halfSqrtTwo, 2 - halfSqrtTwo, (5 * PI) / 4],
              end: [1 + halfSqrtTwo, 2 - halfSqrtTwo, (7 * PI) / 4],
              center: [1, 2],
              radius: 1,
            },
            {
              type: Tree.ARC,
              start: [1 + halfSqrtTwo, 2 + halfSqrtTwo, (7 * PI) / 4],
              end: [1 - halfSqrtTwo, 2 + halfSqrtTwo, (9 * PI) / 4],
              center: [1, 2],
              radius: 1,
            },
          ],
        },
      })

      expect(result).to.eql([0, 1, 2, 3])
    })

    it('should get the size of a region', () => {
      const result = subject.fromGraphic({
        type: Tree.IMAGE_REGION,
        segments: [{type: Tree.LINE, start: [3, 2], end: [1, 0]}],
      })

      expect(result).to.eql([1, 0, 3, 2])
    })

    it('should get the size of paths with stroke width', () => {
      const result = subject.fromGraphic({
        type: Tree.IMAGE_PATH,
        width: 1,
        segments: [{type: Tree.LINE, start: [3, 2], end: [1, 0]}],
      })

      expect(result).to.eql([0.5, -0.5, 3.5, 2.5])
    })
  })
})
