import type {SimpleShape} from '@tracespace/parser'
import {CIRCLE, RECTANGLE, OBROUND, POLYGON} from '@tracespace/parser'

import {
  HALF_PI,
  PI,
  THREE_HALF_PI,
  TWO_PI,
  degreesToRadians,
} from '../coordinate-math'

import * as Tree from '../tree'
import type {Point} from '../location-store'

export function createShape(
  shape: SimpleShape,
  point: Point
): Tree.SimpleShape {
  const {x, y} = point

  switch (shape.type) {
    case CIRCLE: {
      const {diameter} = shape
      return {type: Tree.CIRCLE, cx: x, cy: y, r: diameter / 2}
    }

    case RECTANGLE:
    case OBROUND: {
      const {xSize, ySize} = shape
      const xHalf = xSize / 2
      const yHalf = ySize / 2
      const rectangle: Tree.RectangleShape = {
        type: Tree.RECTANGLE,
        x: x - xHalf,
        y: y - yHalf,
        xSize,
        ySize,
      }

      if (shape.type === OBROUND) {
        rectangle.r = Math.min(xHalf, yHalf)
      }

      return rectangle
    }

    case POLYGON: {
      const {diameter, rotation, vertices} = shape
      const r = diameter / 2
      const offset = degreesToRadians(rotation ?? 0)
      const step = TWO_PI / vertices
      const points = Array.from({length: vertices}).map<Tree.Position>(
        (_, i) => {
          const theta = step * i + offset
          const pointX = x + r * Math.cos(theta)
          const pointY = y + r * Math.sin(theta)
          return [pointX, pointY]
        }
      )

      return {type: Tree.POLYGON, points}
    }
  }
}

export function shapeToSegments(shape: Tree.SimpleShape): Tree.PathSegment[] {
  if (shape.type === Tree.CIRCLE) {
    const {cx, cy, r} = shape
    return [
      {
        type: Tree.ARC,
        start: [cx + r, cy, 0],
        end: [cx + r, cy, TWO_PI],
        center: [cx, cy],
        radius: r,
      },
    ]
  }

  if (shape.type === Tree.RECTANGLE) {
    const {x, y, xSize, ySize, r} = shape

    if (r === xSize / 2) {
      return [
        {
          type: Tree.LINE,
          start: [x + xSize, y + r],
          end: [x + xSize, y + ySize - r],
        },
        {
          type: Tree.ARC,
          start: [x + xSize, y + ySize - r, 0],
          end: [x, y + ySize - r, PI],
          center: [x + r, y + ySize - r],
          radius: r,
        },
        {type: Tree.LINE, start: [x, y + ySize - r], end: [x, y + r]},
        {
          type: Tree.ARC,
          start: [x, y + r, PI],
          end: [x + xSize, y + r, TWO_PI],
          center: [x + r, y + r],
          radius: r,
        },
      ]
    }

    if (r === ySize / 2) {
      return [
        {type: Tree.LINE, start: [x + r, y], end: [x + xSize - r, y]},
        {
          type: Tree.ARC,
          start: [x + xSize - r, y, -HALF_PI],
          end: [x + xSize - r, y + ySize, HALF_PI],
          center: [x + xSize - r, y + r],
          radius: r,
        },
        {
          type: Tree.LINE,
          start: [x + xSize - r, y + ySize],
          end: [x + r, y + ySize],
        },
        {
          type: Tree.ARC,
          start: [x + r, y + ySize, HALF_PI],
          end: [x + r, y, THREE_HALF_PI],
          center: [x + r, y + r],
          radius: r,
        },
      ]
    }

    return [
      {type: Tree.LINE, start: [x, y], end: [x + xSize, y]},
      {type: Tree.LINE, start: [x + xSize, y], end: [x + xSize, y + ySize]},
      {type: Tree.LINE, start: [x + xSize, y + ySize], end: [x, y + ySize]},
      {type: Tree.LINE, start: [x, y + ySize], end: [x, y]},
    ]
  }

  if (shape.type === Tree.POLYGON) {
    return shape.points.map((start, i) => {
      const endIndex = i < shape.points.length - 1 ? i + 1 : 0
      return {type: Tree.LINE, start, end: shape.points[endIndex]}
    })
  }

  return shape.segments
}
