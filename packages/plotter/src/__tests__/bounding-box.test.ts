// Tests for the bounding box module
import {describe, it, expect} from 'vitest'

import * as Tree from '../tree'
import * as subject from '../bounding-box'
import {HALF_PI, PI} from '../coordinate-math'

import type {Box} from '../bounding-box'

describe('bounding box calculations', () => {
  it('should return an empty bounding box', () => {
    const result = subject.empty()
    expect(result).to.eql([0, 0, 0, 0])
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

  it('should convert into a view box - [xMin, yMin, xSize, ySize]', () => {
    const result = subject.toViewBox([1, 2, 10, 20])

    expect(result).to.eql([1, 2, 9, 18])
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
          [9, 8],
          [7, 6],
          [5, 4],
        ],
      },
    })

    expect(result).to.eql([5, 4, 9, 8])
  })

  it('should create an empty box for an empty polygon', () => {
    const result = subject.fromGraphic({
      type: Tree.IMAGE_SHAPE,
      shape: {
        type: Tree.POLYGON,
        points: [],
      },
    })

    expect(result).to.eql([0, 0, 0, 0])
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

  it('should create from an outline graphic with arcs', () => {
    const halfSqrtTwo = 2 ** 0.5 / 2

    const result = subject.fromGraphic({
      type: Tree.IMAGE_SHAPE,
      shape: {
        type: Tree.OUTLINE,
        segments: [
          {
            type: Tree.ARC,
            start: [halfSqrtTwo, halfSqrtTwo, PI / 4],
            end: [-halfSqrtTwo, halfSqrtTwo, (3 * PI) / 4],
            center: [0, 0],
            radius: 1,
            sweep: HALF_PI,
            direction: Tree.CCW,
          },
          {
            type: Tree.ARC,
            start: [-halfSqrtTwo, halfSqrtTwo, (3 * PI) / 4],
            end: [-halfSqrtTwo, -halfSqrtTwo, (5 * PI) / 4],
            center: [0, 0],
            radius: 1,
            sweep: HALF_PI,
            direction: Tree.CCW,
          },
          {
            type: Tree.ARC,
            start: [-halfSqrtTwo, -halfSqrtTwo, (5 * PI) / 4],
            end: [halfSqrtTwo, -halfSqrtTwo, (7 * PI) / 4],
            center: [0, 0],
            radius: 1,
            sweep: HALF_PI,
            direction: Tree.CCW,
          },
          {
            type: Tree.ARC,
            start: [halfSqrtTwo, halfSqrtTwo, (7 * PI) / 4],
            end: [-halfSqrtTwo, halfSqrtTwo, (9 * PI) / 4],
            center: [0, 0],
            radius: 1,
            sweep: HALF_PI,
            direction: Tree.CCW,
          },
        ],
      },
    })

    expect(result).to.eql([-1, -1, 1, 1])
  })

  it('should create an empty box for an empty outline', () => {
    const result = subject.fromGraphic({
      type: Tree.IMAGE_SHAPE,
      shape: {
        type: Tree.OUTLINE,
        segments: [],
      },
    })

    expect(result).to.eql([0, 0, 0, 0])
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
          {type: Tree.RECTANGLE, x: 1, y: 2, xSize: 3, ySize: 4},
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

    expect(result).to.eql([0, 0, 0, 0])
  })
})
