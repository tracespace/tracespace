// geometry object creators
import {Position, ArcPosition} from '../types'
import {HALF_PI, PI, THREE_HALF_PI, TWO_PI} from '../utils'
import * as Nodes from './nodes'

export const circle = (
  cx: number,
  cy: number,
  r: number
): Nodes.CircleShape => ({type: Nodes.CIRCLE, cx, cy, r})

export const rectangle = (
  x: number,
  y: number,
  xSize: number,
  ySize: number,
  r: number | null
): Nodes.RectangleShape => ({type: Nodes.RECTANGLE, x, y, xSize, ySize, r})

export const polygon = (points: Position[]): Nodes.PolygonShape => ({
  type: Nodes.POLYGON,
  points,
})

export const outline = (segments: Nodes.PathSegment[]): Nodes.OutlineShape => ({
  type: Nodes.OUTLINE,
  segments,
})

export const clearOutline = (
  segments: Nodes.PathSegment[]
): Nodes.ClearOutlineShape => ({
  type: Nodes.CLEAR_OUTLINE,
  segments,
})

export const layeredShape = (shapes: Nodes.Shape[]): Nodes.LayeredShape => ({
  type: Nodes.LAYERED_SHAPE,
  shapes,
})

export const line = (
  start: Position,
  end: Position
): Nodes.PathLineSegment => ({
  type: Nodes.LINE,
  start,
  end,
})

export const arc = (
  start: ArcPosition,
  end: ArcPosition,
  center: Position,
  radius: number,
  sweep: number,
  direction: Nodes.ArcDirection = Nodes.CCW
): Nodes.PathArcSegment => ({
  type: Nodes.ARC,
  start,
  end,
  center,
  radius,
  sweep,
  direction,
})

export const shapeToSegments = (
  shape: Nodes.SimpleShape
): Nodes.PathSegment[] => {
  if (shape.type === Nodes.CIRCLE) {
    const {cx, cy, r} = shape
    return [arc([cx + r, cy, 0], [cx + r, cy, 0], [cx, cy], r, TWO_PI)]
  }

  if (shape.type === Nodes.RECTANGLE) {
    const {x, y, xSize, ySize, r} = shape

    return r === null
      ? [
          line([x, y], [x + xSize, y]),
          line([x + xSize, y], [x + xSize, y + ySize]),
          line([x + xSize, y + ySize], [x, y + ySize]),
          line([x, y + ySize], [x, y]),
        ]
      : [
          line([x + r, y], [x + xSize - r, y]),
          arc(
            [x + xSize - r, y, THREE_HALF_PI],
            [x + xSize, y + r, 0],
            [x + xSize - r, y + r],
            r,
            HALF_PI
          ),
          line([x + xSize, y + r], [x + xSize, y + ySize - r]),
          arc(
            [x + xSize, y + ySize - r, 0],
            [x + xSize - r, y + ySize, HALF_PI],
            [x + xSize - r, y + ySize - r],
            r,
            HALF_PI
          ),
          line([x + xSize - r, y + ySize], [x + r, y + ySize]),
          arc(
            [x + r, y + ySize, HALF_PI],
            [x, y + ySize - r, PI],
            [x + r, y + ySize - r],
            r,
            HALF_PI
          ),
          line([x, y + ySize - r], [x, y + r]),
          arc(
            [x, y + r, PI],
            [x + r, y, THREE_HALF_PI],
            [x + r, y + r],
            r,
            HALF_PI
          ),
        ]
  }

  if (shape.type === Nodes.POLYGON) {
    return shape.points.reduce<Nodes.PathLineSegment[]>((segs, end, i) => {
      const start = shape.points[i - 1]
      return start ? [...segs, line(start, end)] : segs
    }, [])
  }

  return shape.segments
}
