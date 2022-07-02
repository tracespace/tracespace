import * as Parser from '@tracespace/parser'

import * as Tree from '../tree'
import {Point} from '../location-store'
import {SimpleTool} from '../tool-store'

import {
  HALF_PI,
  PI,
  THREE_HALF_PI,
  TWO_PI,
  roundToPrecision,
  degreesToRadians,
} from './math'

import {getPathBox} from './plot-path'
import * as BBox from './bounding-box'
import * as Geo from './geometry'

export function plotShape(tool: SimpleTool, point: Point): Tree.SimpleShape {
  const shape = createShape(tool.shape, point)
  const holeShape = tool.hole ? createShape(tool.hole, point) : undefined

  return holeShape === undefined
    ? shape
    : {
        type: Tree.OUTLINE,
        segments: [...shapeToSegments(shape), ...shapeToSegments(holeShape)],
      }
}

function createShape(
  shape: SimpleTool['shape'],
  point: Point
): Tree.SimpleShape {
  const {x, y} = point

  switch (shape.type) {
    case Parser.CIRCLE: {
      const {diameter} = shape
      return Geo.circle({cx: x, cy: y, r: diameter / 2})
    }

    case Parser.RECTANGLE:
    case Parser.OBROUND: {
      const {xSize, ySize} = shape
      const xHalf = xSize / 2
      const yHalf = ySize / 2
      const rectangleConfig: Omit<Tree.RectangleShape, 'type'> = {
        x: x - xHalf,
        y: y - yHalf,
        xSize,
        ySize,
      }

      if (shape.type === Parser.OBROUND) {
        rectangleConfig.r = Math.min(xHalf, yHalf)
      }

      return Geo.rectangle(rectangleConfig)
    }

    case Parser.POLYGON: {
      const {diameter, rotation, vertices} = shape
      const r = diameter / 2
      const offset = degreesToRadians(rotation ?? 0)
      const step = TWO_PI / vertices
      const points = Array.from({length: vertices}).map<Tree.Position>(
        (_, i) => {
          const theta = step * i + offset
          const pointX = roundToPrecision(x + r * Math.cos(theta))
          const pointY = roundToPrecision(y + r * Math.sin(theta))
          return [pointX, pointY]
        }
      )

      return Geo.polygon({points})
    }
  }
}

export function getShapeBox(shape: Tree.Shape): Tree.Box {
  switch (shape.type) {
    case Tree.CIRCLE: {
      return BBox.fromCircle(shape.cx, shape.cy, shape.r)
    }

    case Tree.RECTANGLE: {
      return BBox.fromRectangle(shape.x, shape.y, shape.xSize, shape.ySize)
    }

    case Tree.POLYGON: {
      let box = BBox.empty()
      for (const point of shape.points) {
        box = BBox.addPosition(box, point)
      }

      return box
    }

    case Tree.OUTLINE:
    case Tree.CLEAR_OUTLINE: {
      return getPathBox(shape)
    }

    case Tree.LAYERED_SHAPE: {
      let box = BBox.empty()
      for (const s of shape.shapes) {
        box = BBox.add(box, getShapeBox(s))
      }

      return box
    }

    default:
  }

  return BBox.empty()
}

function shapeToSegments(shape: Tree.SimpleShape): Tree.PathSegment[] {
  if (shape.type === Tree.CIRCLE) {
    const {cx, cy, r} = shape
    return [
      Geo.arc({
        start: [roundToPrecision(cx + r), cy, 0],
        end: [roundToPrecision(cx + r), cy, 0],
        center: [cx, cy],
        radius: r,
        sweep: TWO_PI,
      }),
    ]
  }

  if (shape.type === Tree.RECTANGLE) {
    const {x, y, xSize, ySize, r} = shape

    if (r === xSize / 2) {
      return [
        Geo.line({start: [x + xSize, y + r], end: [x + xSize, y + ySize - r]}),
        Geo.arc({
          start: [x + xSize, y + ySize - r, 0],
          end: [x, y + ySize - r, PI],
          center: [x + r, y + ySize - r],
          radius: r,
          sweep: PI,
        }),
        Geo.line({start: [x, y + ySize - r], end: [x, y + r]}),
        Geo.arc({
          start: [x, y + r, PI],
          end: [x + xSize, y + r, TWO_PI],
          center: [x + r, y + r],
          radius: r,
          sweep: PI,
        }),
      ]
    }

    if (r === ySize / 2) {
      return [
        Geo.line({start: [x + r, y], end: [x + xSize - r, y]}),
        Geo.arc({
          start: [x + xSize - r, y, -HALF_PI],
          end: [x + xSize - r, y + ySize, HALF_PI],
          center: [x + xSize - r, y + r],
          radius: r,
          sweep: PI,
        }),
        Geo.line({start: [x + xSize - r, y + ySize], end: [x + r, y + ySize]}),
        Geo.arc({
          start: [x + r, y + ySize, HALF_PI],
          end: [x + r, y, THREE_HALF_PI],
          center: [x + r, y + r],
          radius: r,
          sweep: PI,
        }),
      ]
    }

    return [
      Geo.line({start: [x, y], end: [x + xSize, y]}),
      Geo.line({start: [x + xSize, y], end: [x + xSize, y + ySize]}),
      Geo.line({start: [x + xSize, y + ySize], end: [x, y + ySize]}),
      Geo.line({start: [x, y + ySize], end: [x, y]}),
    ]
  }

  if (shape.type === Tree.POLYGON) {
    return shape.points.map((start, i) => {
      const endIndex = i < shape.points.length - 1 ? i + 1 : 0
      return Geo.line({start, end: shape.points[endIndex]})
    })
  }

  return shape.segments
}
