import * as Tree from './tree'
import {TWO_PI, limitAngle, rotateQuadrant} from './coordinate-math'
import type {SizeEnvelope as Box, Position, ArcPosition} from './tree'

export type {SizeEnvelope as Box} from './tree'

export function isEmpty(box: Box): box is [] {
  return box.length === 0
}

export function empty(): Box {
  return []
}

export function add(a: Box, b: Box): Box {
  if (isEmpty(a)) return b
  if (isEmpty(b)) return a

  return [
    Math.min(a[0], b[0]),
    Math.min(a[1], b[1]),
    Math.max(a[2], b[2]),
    Math.max(a[3], b[3]),
  ]
}

export function sum(boxes: Box[]): Box {
  return boxes.reduce(add, empty())
}

export function fromGraphics(graphics: Tree.ImageGraphic[]): Box {
  return sum(graphics.map(fromGraphic))
}

export function fromGraphic(graphic: Tree.ImageGraphic): Box {
  return graphic.type === Tree.IMAGE_SHAPE
    ? fromShape(graphic.shape)
    : fromPath(
        graphic.segments,
        graphic.type === Tree.IMAGE_PATH ? graphic.width : undefined
      )
}

export function fromShape(shape: Tree.Shape): Box {
  switch (shape.type) {
    case Tree.CIRCLE: {
      const {cx, cy, r} = shape
      return fromPosition([cx, cy], r)
    }

    case Tree.RECTANGLE: {
      const {x, y, xSize, ySize} = shape
      return [x, y, x + xSize, y + ySize]
    }

    case Tree.POLYGON: {
      return sum(shape.points.map(p => fromPosition(p)))
    }

    case Tree.OUTLINE: {
      return fromPath(shape.segments)
    }

    case Tree.LAYERED_SHAPE: {
      return sum(shape.shapes.filter(({erase}) => !erase).map(fromShape))
    }
  }
}

export function fromPath(segments: Tree.PathSegment[], width = 0): Box {
  const rTool = width / 2
  const keyPoints: Array<Tree.Position | Tree.ArcPosition> = []

  for (const segment of segments) {
    keyPoints.push(segment.start, segment.end)

    if (segment.type === Tree.ARC) {
      const {start, end, center, radius} = segment
      const sweep = Math.abs(end[2] - start[2])

      // Normalize direction to counter-clockwise
      let [thetaStart, thetaEnd] =
        end[2] > start[2] ? [start[2], end[2]] : [end[2], start[2]]

      thetaStart = limitAngle(thetaStart)
      thetaEnd = limitAngle(thetaEnd)

      const axisPoints: Tree.Position[] = [
        [center[0] + radius, center[1]],
        [center[0], center[1] + radius],
        [center[0] - radius, center[1]],
        [center[0], center[1] - radius],
      ]

      for (const p of axisPoints) {
        if (thetaStart > thetaEnd || sweep === TWO_PI) {
          keyPoints.push(p)
        }

        // Rotate to check for next axis key point
        thetaStart = rotateQuadrant(thetaStart)
        thetaEnd = rotateQuadrant(thetaEnd)
      }
    }
  }

  return sum(keyPoints.map(p => fromPosition(p, rTool)))
}

function fromPosition(position: Position | ArcPosition, radius = 0): Box {
  return [
    position[0] - radius,
    position[1] - radius,
    position[0] + radius,
    position[1] + radius,
  ]
}
