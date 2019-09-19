import * as Parser from '@tracespace/parser'

import {Position, Box} from '../types'
import {roundToPrecision, degreesToRadians, PI} from '../utils'
import {getPathBox} from './plot-path'
import * as BBox from './bounding-box'
import * as Geo from './geometry'

import {
  CIRCLE,
  RECTANGLE,
  POLYGON,
  OUTLINE,
  CLEAR_OUTLINE,
  LAYERED_SHAPE,
  Shape,
  SimpleShape,
  HoleShape,
} from './nodes'

type SimpleParserShape =
  | Parser.Circle
  | Parser.Rectangle
  | Parser.Obround
  | Parser.Polygon

export function plotShape(
  toolShape: SimpleParserShape,
  holeShape: Parser.HoleShape,
  position: Position
): SimpleShape {
  const [x, y] = position
  const hole = plotHole(holeShape, position)
  const holeSegments = hole !== null ? Geo.shapeToSegments(hole) : null

  switch (toolShape.type) {
    case Parser.CIRCLE: {
      const circle = Geo.circle(x, y, toolShape.diameter / 2)

      return holeSegments === null
        ? circle
        : Geo.outline([...Geo.shapeToSegments(circle), ...holeSegments])
    }

    case Parser.RECTANGLE:
    case Parser.OBROUND: {
      const {xSize, ySize} = toolShape
      const xHalf = xSize / 2
      const yHalf = ySize / 2
      const r =
        toolShape.type === Parser.OBROUND ? Math.min(xHalf, yHalf) : null
      const rectangle = Geo.rectangle(x - xHalf, y - yHalf, xSize, ySize, r)

      return holeSegments === null
        ? rectangle
        : Geo.outline([...Geo.shapeToSegments(rectangle), ...holeSegments])
    }

    case Parser.POLYGON: {
      const r = toolShape.diameter / 2
      const offset = degreesToRadians(toolShape.rotation || 0)
      const step = (2 * PI) / toolShape.vertices
      const points = []
      let i

      for (i = 0; i < toolShape.vertices; i++) {
        const theta = step * i + offset
        const pointX = roundToPrecision(x + r * Math.cos(theta))
        const pointY = roundToPrecision(y + r * Math.sin(theta))
        points.push([pointX, pointY] as Position)
      }

      const polygon = Geo.polygon(points)

      return holeSegments === null
        ? polygon
        : Geo.outline([...Geo.shapeToSegments(polygon), ...holeSegments])
    }
  }
}

function plotHole(holeShape: Parser.HoleShape, position: Position): HoleShape {
  if (holeShape === null) return null
  const hole = plotShape(holeShape, null, position)
  return hole.type === CIRCLE || hole.type === RECTANGLE ? hole : null
}

export function getShapeBox(shape: Shape): Box {
  switch (shape.type) {
    case CIRCLE: {
      return BBox.fromCircle(shape.cx, shape.cy, shape.r)
    }

    case RECTANGLE: {
      return BBox.fromRectangle(shape.x, shape.y, shape.xSize, shape.ySize)
    }

    case POLYGON: {
      return shape.points.reduce(BBox.addPosition, BBox.empty())
    }

    case OUTLINE:
    case CLEAR_OUTLINE: {
      return getPathBox(shape)
    }

    case LAYERED_SHAPE: {
      return shape.shapes.map(getShapeBox).reduce(BBox.add, BBox.empty())
    }
  }

  return BBox.empty()
}
